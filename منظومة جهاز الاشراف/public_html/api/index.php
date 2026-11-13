<?php
/**
 * ==============================================================================
 * Cloud Synchronization & Resilience REST API
 * منظومة جهاز الإشراف والمتابعة - مشروع صيانة وتطوير طريق أوباري - غات (360 كم)
 * ==============================================================================
 * High-performance, atomic JSON backend providing real-time data persistence,
 * cross-device synchronization, and zero-configuration cPanel hosting support.
 * 
 * Project Structure:
 * - Phase 1: المرحلة الأولى (000+00 إلى 083+226 - 226.08 كم)
 * - Phase 2: المرحلة الثانية (083+226 إلى 000+360 - 133.92 كم)
 * - Operations: Road Progress (أعمال الطريق), Equipment (الآليات والمعدات), Fuel (الوقود والديزل)
 */

// 1. Cross-Origin Resource Sharing (CORS) & Content Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Deploy-Key');
header('Content-Type: application/json; charset=utf-8');

// Instant exit for pre-flight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2. Paths & Storage Configuration
define('API_ROOT', __DIR__);
define('DATA_DIR', API_ROOT . '/data');
define('DB_FILE', DATA_DIR . '/db.json');

// Ensure data folder exists
if (!is_dir(DATA_DIR)) {
    @mkdir(DATA_DIR, 0755, true);
}

// -------------------------------------------------------------
// [DATABASE ENGINE - DUAL-MODE MYSQL & CENTRAL SERVER STORE]
// -------------------------------------------------------------
if (file_exists(API_ROOT . '/db_config.php')) {
    require_once API_ROOT . '/db_config.php';
}
if (!defined('MYSQL_ENABLED')) {
    define('MYSQL_ENABLED', false);
}

function get_mysql_pdo() {
    static $pdo = null;
    static $attempted = false;
    if ($attempted) return $pdo;
    $attempted = true;

    $enabled = defined('MYSQL_ENABLED') && MYSQL_ENABLED === true;
    $host = defined('MYSQL_HOST') ? MYSQL_HOST : (getenv('DB_HOST') ?: 'localhost');
    $dbName = defined('MYSQL_DB') ? MYSQL_DB : getenv('DB_NAME');
    $user = defined('MYSQL_USER') ? MYSQL_USER : getenv('DB_USER');
    $pass = defined('MYSQL_PASS') ? MYSQL_PASS : getenv('DB_PASS');
    $port = defined('MYSQL_PORT') ? MYSQL_PORT : (getenv('DB_PORT') ?: 3306);

    if (!$enabled || empty($dbName)) {
        return null;
    }

    try {
        $dsn = "mysql:host={$host};port={$port};dbname={$dbName};charset=utf8mb4";
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 3
        ]);

        $pdo->exec("CREATE TABLE IF NOT EXISTS `system_data_store` (
            `key_name` VARCHAR(64) NOT NULL PRIMARY KEY,
            `data_value` LONGTEXT NOT NULL,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        return $pdo;
    } catch (Exception $e) {
        error_log("[MySQL Connection Notice] " . $e->getMessage());
        $pdo = null;
        return null;
    }
}

function get_db() {
    // 1. Check MySQL if enabled
    $pdo = get_mysql_pdo();
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("SELECT data_value FROM system_data_store WHERE key_name = 'main_db' LIMIT 1");
            $stmt->execute();
            $row = $stmt->fetch();
            if ($row && !empty($row['data_value'])) {
                $decoded = json_decode($row['data_value'], true);
                if (is_array($decoded)) return $decoded;
            }
        } catch (Exception $e) {
            error_log("[MySQL Read Notice] " . $e->getMessage());
        }
    }

    // 2. Central Server DB Fallback (Thread-Safe File with shared locks)
    if (!file_exists(DB_FILE)) {
        return [
            'users' => [],
            'reports' => [],
            'messages' => [],
            'equipment' => [],
            'fuel' => [],
            'alerts' => [],
            'plans' => [],
            'issues' => [],
            'savedPeriodicReports' => [],
            'latestTwoPhaseReport' => null,
            'executiveProgress' => null,
            'roadDailyReport' => null,
            'fuelDailyReport' => null,
            'roadProgress' => [],
            'lastUpdated' => gmdate('Y-m-d\TH:i:s\Z')
        ];
    }

    $fp = @fopen(DB_FILE, 'r');
    if (!$fp) return [];
    @flock($fp, LOCK_SH);
    $content = @stream_get_contents($fp);
    @flock($fp, LOCK_UN);
    @fclose($fp);

    $data = json_decode($content, true);
    return is_array($data) ? $data : [];
}

function save_db(&$data) {
    if (!is_dir(DATA_DIR)) {
        @mkdir(DATA_DIR, 0755, true);
    }
    $data['lastUpdated'] = gmdate('Y-m-d\TH:i:s\Z');
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

    // 1. Sync to MySQL if enabled
    $pdo = get_mysql_pdo();
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("INSERT INTO system_data_store (key_name, data_value, updated_at) 
                VALUES ('main_db', :val, NOW()) 
                ON DUPLICATE KEY UPDATE data_value = :val2, updated_at = NOW()");
            $stmt->execute([':val' => $json, ':val2' => $json]);
        } catch (Exception $e) {
            error_log("[MySQL Save Notice] " . $e->getMessage());
        }
    }

    // 2. Always persist to Central Server DB file with exclusive lock
    $fp = @fopen(DB_FILE, 'c+');
    if ($fp) {
        if (@flock($fp, LOCK_EX)) {
            @ftruncate($fp, 0);
            @rewind($fp);
            @fwrite($fp, $json);
            @fflush($fp);
            @flock($fp, LOCK_UN);
        }
        @fclose($fp);
        return true;
    }
    return @file_put_contents(DB_FILE, $json, LOCK_EX) !== false;
}

function get_json_input() {
    $raw = file_get_contents('php://input');
    if (empty($raw)) return [];
    $parsed = json_decode($raw, true);
    return is_array($parsed) ? $parsed : [];
}


// ==============================================================================
// 3.1 Domain Helper Functions & Deduplication
// ==============================================================================

function canonicalize_php_username($u) {
    $u = strtolower(trim((string)($u ?? '')));
    if ($u === '') return '';
    $map = [
        'dev' => 'admin',
        'developer' => 'admin',
        'development' => 'admin',
        'alansari' => 'project_manager',
        'manager' => 'project_manager',
        'admin_sectors' => 'abrikaw',
        'sectors' => 'abrikaw',
        'quality' => 'saleh_quality',
        'saleh' => 'saleh_quality',
        'hammad' => 'saleh_quality',
        'sector_a' => 'salah_alarabi',
        'alarabi' => 'salah_alarabi',
        'sector_b' => 'issa_altahir',
        'altahir' => 'issa_altahir',
        'fuel' => 'fuel_officer',
        'fuel_officer' => 'fuel_officer',
        'honi' => 'honi'
    ];
    return $map[$u] ?? $u;
}

function normalize_report_date_str($val) {
    if (empty($val) || !is_string($val)) return '';
    $val = trim($val);
    if (preg_match('/^(\d{4})[-.\/](\d{1,2})[-.\/](\d{1,2})/', $val, $m)) {
        return sprintf('%04d-%02d-%02d', $m[1], $m[2], $m[3]);
    }
    if (preg_match('/^(\d{1,2})[-.\/](\d{1,2})[-.\/](\d{4})/', $val, $m)) {
        return sprintf('%04d-%02d-%02d', $m[3], $m[2], $m[1]);
    }
    return substr($val, 0, 10);
}

function get_report_canonical_key($r) {
    if (!$r || !is_array($r)) return '';
    $rawDate = $r['reportDate'] ?? $r['date'] ?? $r['dateFormatted'] ?? $r['createdAt'] ?? '';
    $date = normalize_report_date_str($rawDate);
    $type = $r['reportType'] ?? $r['type'] ?? $r['title'] ?? '';
    
    if (!empty($r['isTwoPhaseProgressReport']) || mb_stripos($type, 'المرحلتين') !== false) {
        return 'tp_' . $date;
    }
    if (!empty($r['isFuelReport']) || mb_stripos($type, 'وقود') !== false) {
        return 'fuel_' . $date;
    }
    if (!empty($r['isTargetedWorksReport']) || mb_stripos($type, 'مستهدف') !== false) {
        $sec = (isset($r['sector']) && mb_stripos($r['sector'], 'الثانية') !== false) ? 'p2' : 'p1';
        return 'tw_' . $sec . '_' . $date;
    }
    if (mb_stripos($type, 'طريق') !== false || mb_stripos($type, 'يومي') !== false) {
        $sec = (isset($r['sector']) && mb_stripos($r['sector'], 'الثانية') !== false) ? 'p2' : 'p1';
        return 'road_' . $sec . '_' . $date;
    }
    if (!empty($r['reportNumber'])) {
        return 'num_' . strtolower(preg_replace('/[\s\-_]/', '', (string)$r['reportNumber']));
    }
    return 'id_' . strtolower(trim((string)($r['id'] ?? '')));
}

function deduplicate_reports_array($reports) {
    if (!is_array($reports)) return [];
    $map = [];
    foreach ($reports as $r) {
        if (!is_array($r)) continue;
        $key = get_report_canonical_key($r);
        $numKey = !empty($r['reportNumber']) ? ('num_' . strtolower(preg_replace('/[\s\-_]/', '', (string)$r['reportNumber']))) : null;
        $idKey = !empty($r['id']) ? ('id_' . strtolower(trim((string)$r['id']))) : null;

        $targetKey = null;
        if (isset($map[$key])) $targetKey = $key;
        elseif ($numKey && isset($map[$numKey])) $targetKey = $numKey;
        elseif ($idKey && isset($map[$idKey])) $targetKey = $idKey;

        if ($targetKey) {
            $existing = $map[$targetKey];
            $tNew = strtotime($r['updatedAt'] ?? $r['createdAt'] ?? $r['date'] ?? '') ?: 0;
            $tOld = strtotime($existing['updatedAt'] ?? $existing['createdAt'] ?? $existing['date'] ?? '') ?: 0;
            $itemsNew = count($r['items'] ?? $r['combinedItems'] ?? $r['fuelItems'] ?? []);
            $itemsOld = count($existing['items'] ?? $existing['combinedItems'] ?? $existing['fuelItems'] ?? []);
            
            if ($itemsNew >= $itemsOld || $tNew >= $tOld) {
                $merged = array_merge($existing, $r);
                $map[$targetKey] = $merged;
                if ($key) $map[$key] = $merged;
                if ($numKey) $map[$numKey] = $merged;
                if ($idKey) $map[$idKey] = $merged;
            }
        } else {
            if ($key) $map[$key] = $r;
            if ($numKey) $map[$numKey] = $r;
            if ($idKey) $map[$idKey] = $r;
        }
    }
    $unique = array_values(array_unique($map, SORT_REGULAR));
    usort($unique, function($a, $b) {
        $ta = strtotime($a['date'] ?? $a['createdAt'] ?? '') ?: 0;
        $tb = strtotime($b['date'] ?? $b['createdAt'] ?? '') ?: 0;
        return $tb <=> $ta;
    });
    return $unique;
}

function categorize_road_item_to_phase2_id_php($rawName) {
    if (empty($rawName)) return null;
    $s = mb_strtolower(trim((string)$rawName), 'UTF-8');
    
    if (mb_stripos($s, 'بدون أسمنت') !== false || mb_stripos($s, 'بدون اسمنت') !== false || mb_stripos($s, 'فرمة أولى') !== false || mb_stripos($s, 'فرمة اولي') !== false) {
        return 4;
    }
    if (mb_stripos($s, 'mco') !== false || mb_stripos($s, 'تشريب') !== false || mb_stripos($s, 'رش') !== false) {
        return 2;
    }
    if (mb_stripos($s, 'fdr') !== false || mb_stripos($s, 'إعادة التدوير') !== false || mb_stripos($s, 'اعادة التدوير') !== false || mb_stripos($s, 'فرمة ثانية') !== false || mb_stripos($s, 'فرمة تانية') !== false || mb_stripos($s, 'أسمنت') !== false || mb_stripos($s, 'اسمنت') !== false) {
        return 1;
    }
    if (mb_stripos($s, 'اسفلت') !== false || mb_stripos($s, 'أسفلت') !== false) {
        return 3;
    }
    if (mb_stripos($s, 'أساس') !== false || mb_stripos($s, 'اساس') !== false || mb_stripos($s, 'حبيبي') !== false) {
        return 5;
    }
    if (mb_stripos($s, 'خدمي') !== false) {
        return 6;
    }
    return null;
}

function sync_road_report_to_two_phase_php(&$db, $roadReport) {
    if (!is_array($roadReport)) return null;
    
    $extracted = [];
    $rawItems = $roadReport['items'] ?? [];
    if (is_array($rawItems)) {
        foreach ($rawItems as $it) {
            if (!is_array($it)) continue;
            $name = $it['description'] ?? $it['name'] ?? $it['item'] ?? '';
            $id = categorize_road_item_to_phase2_id_php($name);
            if (!$id) continue;
            
            $m = floatval($it['lengthMeters'] ?? $it['length'] ?? $it['todayMeters'] ?? 0);
            if (!isset($extracted[$id])) {
                $extracted[$id] = 0;
            }
            $extracted[$id] += $m;
        }
    }
    
    if (isset($roadReport['fdrWithoutCementMeters']) && floatval($roadReport['fdrWithoutCementMeters']) > 0) {
        $extracted[4] = floatval($roadReport['fdrWithoutCementMeters']);
    }
    if (isset($roadReport['mcoMeters']) && floatval($roadReport['mcoMeters']) > 0) {
        $extracted[2] = floatval($roadReport['mcoMeters']);
    }
    if (isset($roadReport['fdrMeters']) && floatval($roadReport['fdrMeters']) > 0) {
        $extracted[1] = floatval($roadReport['fdrMeters']);
    }
    if (isset($roadReport['asphaltMeters']) && floatval($roadReport['asphaltMeters']) > 0) {
        $extracted[3] = floatval($roadReport['asphaltMeters']);
    }
    if (isset($roadReport['baseMeters']) && floatval($roadReport['baseMeters']) > 0) {
        $extracted[5] = floatval($roadReport['baseMeters']);
    }
    if (isset($roadReport['serviceRoadMeters']) && floatval($roadReport['serviceRoadMeters']) > 0) {
        $extracted[6] = floatval($roadReport['serviceRoadMeters']);
    }

    if (empty($extracted)) return null;

    $twoPhase = $db['latestTwoPhaseReport'] ?? null;
    if (!is_array($twoPhase) || empty($twoPhase['phase2Items'])) {
        foreach ($db['reports'] ?? [] as $r) {
            if (is_array($r) && (!empty($r['isTwoPhaseProgressReport']) || ($r['reportType'] ?? '') === 'تقرير إنجاز المرحلتين') && !empty($r['phase2Items'])) {
                $twoPhase = $r;
                break;
            }
        }
    }

    if (!is_array($twoPhase) || empty($twoPhase['phase2Items'])) {
        return null;
    }

    foreach ($twoPhase['phase2Items'] as &$p2) {
        $id = intval($p2['id'] ?? 0);
        if (isset($extracted[$id])) {
            $today = $extracted[$id];
            $prev = isset($p2['previousMeters']) && is_numeric($p2['previousMeters']) 
                ? floatval($p2['previousMeters']) 
                : max(0, floatval($p2['totalMeters'] ?? 0) - floatval($p2['todayMeters'] ?? 0));
            $newTotal = $prev + $today;
            $target = floatval($p2['dailyTarget'] ?? 800);

            $p2['previousMeters'] = (string)$prev;
            $p2['todayMeters'] = (string)$today;
            $p2['totalMeters'] = (string)$newTotal;
            $p2['varianceMeters'] = number_format($today - $target, 2, '.', '');
            $p2['notes'] = 'تم تحديثه وتغذيته تلقائياً من تقرير أعمال الطريق اليومي';
        }
    }
    unset($p2);

    if (!empty($twoPhase['phase1Items']) && is_array($twoPhase['phase1Items'])) {
        if (!isset($twoPhase['combinedItems']) || !is_array($twoPhase['combinedItems'])) {
            $twoPhase['combinedItems'] = [];
        }
        foreach ($twoPhase['phase1Items'] as $idx => $p1) {
            $p2 = $twoPhase['phase2Items'][$idx] ?? [];
            $todayP1 = floatval($p1['todayMeters'] ?? 0);
            $todayP2 = floatval($p2['todayMeters'] ?? 0);
            $totalP1 = floatval($p1['totalMeters'] ?? 0);
            $totalP2 = floatval($p2['totalMeters'] ?? 0);
            $combToday = $todayP1 + $todayP2;
            $combTotal = $totalP1 + $totalP2;

            $custom = $twoPhase['combinedItems'][$idx] ?? [];
            $twoPhase['combinedItems'][$idx] = array_merge($custom, [
                'id' => $p1['id'] ?? ($idx + 1),
                'category' => $p1['category'] ?? ($idx < 3 ? 'basic' : 'additional'),
                'name' => $p1['name'] ?? '',
                'shortName' => $p1['shortName'] ?? '',
                'todayMeters' => $combToday > 0 ? (string)$combToday : '',
                'totalMeters' => $combTotal > 0 ? (string)$combTotal : '',
                'readyToWorkMeters' => $custom['readyToWorkMeters'] ?? '',
                'notes' => $custom['notes'] ?? ''
            ]);
        }
    }

    $targetDate = $roadReport['reportDate'] ?? $roadReport['dateFormatted'] ?? ($twoPhase['reportDate'] ?? '');
    $twoPhase['reportDate'] = $targetDate;
    $twoPhase['dateFormatted'] = $targetDate;
    $twoPhase['dayName'] = $roadReport['dayName'] ?? ($twoPhase['dayName'] ?? '');
    $twoPhase['updatedAt'] = gmdate('Y-m-d\TH:i:s\Z');
    $twoPhase['notes'] = 'تقرير إنجاز المرحلتين — تم تحديث وتغذية المرحلة الثانية تلقائياً من تقرير أعمال الطريق اليومي (' . ($roadReport['reportNumber'] ?? $targetDate) . ')';

    $db['latestTwoPhaseReport'] = $twoPhase;
    $db['reports'] = deduplicate_reports_array(array_merge([$twoPhase], $db['reports'] ?? []));
    return $twoPhase;
}

// 4. Request Route & Method Extraction
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$uri = $_SERVER['REQUEST_URI'] ?? '/api';
$uri = strtok($uri, '?'); // Remove query string

// Extract sub-path after /api/
$path = preg_replace('#^.*?/api/?#i', '/', $uri);
if (empty($path) || $path === '') $path = '/';
$path = '/' . ltrim($path, '/');
$segments = explode('/', trim($path, '/'));
$resource = $segments[0] ?? '';
$subId = $segments[1] ?? '';
$subAction = $segments[2] ?? '';

// 5. API Endpoints Router

// -------------------------------------------------------------
// [STATUS & LIGHTWEIGHT SYNC TIMESTAMP]
// -------------------------------------------------------------
if ($path === '/' || $path === '/status' || $path === '/health') {
    $db = get_db();
    echo json_encode([
        'success' => true,
        'app' => 'منظومة جهاز الإشراف والمتابعة - مشروع طريق أوباري غات (360 كم)',
        'server' => 'Apache/cPanel Cloud Sync Engine',
        'status' => 'operational',
        'reportsCount' => count($db['reports'] ?? []),
        'messagesCount' => count($db['messages'] ?? []),
        'lastUpdated' => $db['lastUpdated'] ?? gmdate('Y-m-d\TH:i:s\Z'),
        'serverTime' => date('Y-m-d H:i:s')
    ]);
    exit;
}

if ($path === '/sync/timestamp') {
    $db = get_db();
    echo json_encode([
        'success' => true,
        'lastUpdated' => $db['lastUpdated'] ?? gmdate('Y-m-d\TH:i:s\Z'),
        'reportsCount' => count($db['reports'] ?? []),
        'messagesCount' => count($db['messages'] ?? [])
    ]);
    exit;
}

if ($resource === 'db-status') {
    $pdo = get_mysql_pdo();
    $db = get_db();
    echo json_encode([
        'success' => true,
        'engine' => $pdo ? 'MySQL Database (متصلة ونشطة بنجاح)' : 'Central Server Database (قاعدة بيانات الخادم المركزية الموحدة)',
        'is_mysql' => ($pdo !== null),
        'server_time' => gmdate('Y-m-d H:i:s \G\M\T'),
        'reports_count' => count($db['reports'] ?? []),
        'messages_count' => count($db['messages'] ?? []),
        'users_count' => count($db['users'] ?? []),
        'last_updated' => $db['lastUpdated'] ?? null
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// -------------------------------------------------------------
// [DASHBOARD SUMMARY]
// -------------------------------------------------------------
if ($resource === 'dashboard') {
    $db = get_db();
    $reports = $db['reports'] ?? [];
    $equipment = $db['equipment'] ?? [];
    $fuelList = $db['fuel'] ?? [];
    $twoPhase = $db['latestTwoPhaseReport'] ?? null;

    if ($subId === 'summary' || $subId === '') {
        // Equipment counts
        $eqStopped = 0;
        $eqActive = 0;
        foreach ($equipment as $eq) {
            $st = strtolower($eq['status'] ?? '');
            if (in_array($st, ['stopped', 'maintenance', 'breakdown', 'عطلان'])) {
                $eqStopped += (int)($eq['count'] ?? 1);
            } else {
                $eqActive += (int)($eq['count'] ?? 1);
            }
        }
        $eqTotal = count($equipment) > 0 ? ($eqActive + $eqStopped) : 25;
        if ($eqActive === 0 && count($equipment) === 0) $eqActive = 25;

        // Fuel totals from reports and fuel logs
        $totalFuelDispatched = 0;
        $totalFuelRec = 0;
        $totalFuelRem = 0;
        foreach ($reports as $r) {
            if (!empty($r['isFuelReport']) || ($r['reportType'] ?? '') === 'تقرير كميات الوقود اليومية' || !empty($r['fuelItems'])) {
                $disp = (float)str_replace(',', '', $r['totalDispatchedLiters'] ?? $r['fuelAmount'] ?? 0);
                $rec = (float)str_replace(',', '', $r['totalReceivedLiters'] ?? 0);
                $rem = (float)str_replace(',', '', $r['totalRemainingLiters'] ?? 0);
                $totalFuelDispatched += $disp;
                $totalFuelRec += $rec;
                if ($totalFuelRem === 0 && $rem > 0) $totalFuelRem = $rem;
            }
        }
        foreach ($fuelList as $f) {
            $totalFuelDispatched += (float)($f['liters'] ?? 0);
        }

        // Sort recent reports descending
        usort($reports, function($a, $b) {
            $ta = strtotime($a['date'] ?? $a['createdAt'] ?? '') ?: ($a['id'] ?? 0);
            $tb = strtotime($b['date'] ?? $b['createdAt'] ?? '') ?: ($b['id'] ?? 0);
            return $tb <=> $ta;
        });

        // Calculate Two-Phase Road Progress
        $roadMetersToday = 0;
        $roadMetersTotal = 237390;
        if ($twoPhase && !empty($twoPhase['twoPhaseTotals'])) {
            $roadMetersToday = (float)($twoPhase['twoPhaseTotals']['todayMeters'] ?? 0);
            $roadMetersTotal = (float)($twoPhase['twoPhaseTotals']['totalCumulativeMeters'] ?? 237390);
        }

        $phase1Fuel = round($totalFuelDispatched * 0.6);
        $phase2Fuel = round($totalFuelDispatched * 0.4);

        echo json_encode([
            'success' => true,
            'totalFuel' => $totalFuelDispatched,
            'totalSolar' => $totalFuelDispatched, // backward compatibility alias
            'totalFuelReceived' => $totalFuelRec,
            'totalFuelRemaining' => $totalFuelRem,
            'totalEquipment' => $eqTotal,
            'activeEquipment' => $eqActive,
            'stoppedEquipment' => $eqStopped,
            'operatingHours' => 192,
            'phase1Fuel' => $phase1Fuel,
            'phase2Fuel' => $phase2Fuel,
            'sectorAFuel' => $phase1Fuel, // backward compatibility alias
            'sectorBFuel' => $phase2Fuel, // backward compatibility alias
            'recentAlerts' => array_slice($db['alerts'] ?? [], 0, 5),
            'recentReports' => array_slice($reports, 0, 10),
            'roadProgress' => [
                'totalLength' => 360,
                'completedLength' => round($roadMetersTotal / 1000, 2),
                'percentage' => round(($roadMetersTotal / 360000) * 100, 2),
                'todayMeters' => $roadMetersToday,
                'phase1CompletedKm' => 226.08,
                'phase1Percentage' => 100.0,
                'phase2Percentage' => round((($roadMetersTotal - 226083) / 133917) * 100, 1)
            ]
        ]);
        exit;
    }
}


// -------------------------------------------------------------
// [REPORTS: GET, CREATE, UPDATE, DELETE, APPROVE, PERIODIC, CLEAR-ALL]
// -------------------------------------------------------------
if ($resource === 'reports') {
    $db = get_db();
    if (!isset($db['reports'])) $db['reports'] = [];
    if (!isset($db['deletedReportIds'])) $db['deletedReportIds'] = [];

    // 1. Periodic reports
    if ($subId === 'periodic') {
        if ($subAction === 'save' && $method === 'POST') {
            $body = get_json_input();
            $db['savedPeriodicReports'][] = $body;
            save_db($db);
            echo json_encode(['success' => true, 'report' => $body, 'message' => 'تم حفظ التقرير الدوري بنجاح']);
            exit;
        }
        if ($subAction === 'saved') {
            echo json_encode(['success' => true, 'reports' => $db['savedPeriodicReports'] ?? []]);
            exit;
        }
        echo json_encode(['success' => true, 'data' => []]);
        exit;
    }

    // 2. Clear all reports (DELETE /api/reports/clear-all or /api/reports/all)
    if ($method === 'DELETE' && ($subId === 'clear-all' || $subId === 'all')) {
        foreach ($db['reports'] as $r) {
            if (!empty($r['id'])) $db['deletedReportIds'][] = (string)$r['id'];
            if (!empty($r['reportNumber'])) $db['deletedReportIds'][] = (string)$r['reportNumber'];
        }
        $db['deletedReportIds'] = array_values(array_unique(array_filter($db['deletedReportIds'])));
        $db['reports'] = [];
        unset($db['fuelDailyReport']);
        unset($db['roadDailyReport']);
        unset($db['executiveProgress']);
        unset($db['latestTwoPhaseReport']);
        save_db($db);
        echo json_encode([
            'success' => true,
            'message' => 'تم مسح وإفراغ كافة التقارير بنجاح',
            'deletedReportIds' => $db['deletedReportIds']
        ]);
        exit;
    }

    // 3. List all reports (GET /api/reports)
    if ($method === 'GET' && empty($subId)) {
        $sector = $_GET['sector'] ?? '';

        $list = deduplicate_reports_array($db['reports'] ?? []);
        if (!empty($sector)) {
            $list = array_values(array_filter($list, function($r) use ($sector) {
                return isset($r['sector']) && mb_stripos($r['sector'], $sector) !== false;
            }));
        }
        echo json_encode([
            'success' => true,
            'reports' => $list,
            'deletedReportIds' => $db['deletedReportIds'] ?? []
        ]);
        exit;
    }

    // 4. Create Report (POST /api/reports, /api/reports/create, /api/reports/upload)
    if ($method === 'POST' && (empty($subId) || $subId === 'create' || $subId === 'upload')) {
        $body = get_json_input();
        if (empty($body['id'])) {
            $body['id'] = round(microtime(true) * 1000);
        }
        if (empty($body['reportNumber'])) {
            $phaseTag = (isset($body['sector']) && mb_stripos($body['sector'], 'الثانية') !== false) ? 'P2' : 'P1';
            $body['reportNumber'] = 'REP-' . $phaseTag . '-' . substr(time(), -4);
        }
        if (empty($body['createdAt'])) {
            $body['createdAt'] = gmdate('Y-m-d\TH:i:s\Z');
        }

        $newKey = get_report_canonical_key($body);
        $newNum = strtolower(preg_replace('/[\s\-_]/', '', (string)$body['reportNumber']));
        $newNumRaw = strtolower(trim((string)$body['reportNumber']));
        $newId = strtolower(trim((string)$body['id']));
        $newIdNorm = strtolower(preg_replace('/[\s\-_]/', '', (string)$body['id']));

        // If it was previously in deletedReportIds, remove it
        if (!empty($db['deletedReportIds'])) {
            $db['deletedReportIds'] = array_values(array_filter($db['deletedReportIds'], function($did) use ($newId, $newIdNorm, $newNum, $newNumRaw) {
                $didRaw = strtolower(trim((string)$did));
                $didNorm = strtolower(preg_replace('/[\s\-_]/', '', (string)$did));
                if ($didRaw === $newId || $didNorm === $newId || $didRaw === $newIdNorm || $didNorm === $newIdNorm) return false;
                if ($didRaw === $newNumRaw || $didNorm === $newNum || $didRaw === $newNum) return false;
                return true;
            }));
        }

        // Deduplicate: replace if exists with same key, id, or reportNumber
        $filtered = array_filter($db['reports'] ?? [], function($r) use ($newKey, $newNum, $newId) {
            $rKey = get_report_canonical_key($r);
            $rNum = !empty($r['reportNumber']) ? strtolower(preg_replace('/[\s\-_]/', '', (string)$r['reportNumber'])) : '';
            $rId = strtolower(trim((string)($r['id'] ?? '')));

            if ($rKey && $rKey === $newKey) return false;
            if ($rNum && $rNum === $newNum) return false;
            if ($rId && $rId === $newId) return false;
            return true;
        });

        array_unshift($filtered, $body);
        $db['reports'] = deduplicate_reports_array($filtered);

        if (!empty($body['isTwoPhaseProgressReport']) || ($body['reportType'] ?? '') === 'تقرير إنجاز المرحلتين') {
            $db['latestTwoPhaseReport'] = $body;
        }
        if (!empty($body['isFuelReport']) || ($body['reportType'] ?? '') === 'تقرير كميات الوقود اليومية') {
            $db['fuelDailyReport'] = $body;
        }
        if (!empty($body['isRoadProgressReport']) || ($body['reportType'] ?? '') === 'تقرير أعمال الطريق اليومي') {
            $db['roadDailyReport'] = $body;
            sync_road_report_to_two_phase_php($db, $body);
        }

        save_db($db);
        echo json_encode(['success' => true, 'report' => $body, 'message' => 'تم حفظ التقرير سحابياً بنجاح ومزامنته بدون أي تكرار']);
        exit;
    }

    // 5. Approve Report (PUT /api/reports/:id/approve)
    if ($method === 'PUT' && !empty($subId) && $subAction === 'approve') {
        $body = get_json_input();
        $approvedBy = $body['approvedBy'] ?? 'مدير المشروع';
        $found = null;
        foreach ($db['reports'] as &$r) {
            if ((string)($r['id'] ?? '') === (string)$subId || (string)($r['reportNumber'] ?? '') === (string)$subId) {
                $r['status'] = 'approved';
                $r['approvedBy'] = $approvedBy;
                $found = $r;
                break;
            }
        }
        if ($found) {
            save_db($db);
            echo json_encode(['success' => true, 'report' => $found, 'message' => 'تم اعتماد التقرير وتثبيت بياناته']);
        } else {
            echo json_encode(['success' => false, 'message' => 'التقرير غير موجود']);
        }
        exit;
    }

    // 6. Update Report (PUT /api/reports/:id)
    if ($method === 'PUT' && !empty($subId)) {
        $body = get_json_input();
        $found = null;
        foreach ($db['reports'] as &$r) {
            if ((string)($r['id'] ?? '') === (string)$subId || (string)($r['reportNumber'] ?? '') === (string)$subId) {
                $r = array_merge($r, $body);
                $found = $r;
                break;
            }
        }
        if ($found) {
            save_db($db);
            echo json_encode(['success' => true, 'report' => $found, 'message' => 'تم تحديث التقرير بنجاح']);
        } else {
            echo json_encode(['success' => false, 'message' => 'التقرير غير موجود']);
        }
        exit;
    }

    // 7. Delete Report (DELETE /api/reports/:id)
    if ($method === 'DELETE' && !empty($subId)) {
        if (!isset($db['deletedReportIds'])) $db['deletedReportIds'] = [];
        $db['deletedReportIds'][] = (string)$subId;
        foreach ($db['reports'] ?? [] as $r) {
            if ((string)($r['id'] ?? '') === (string)$subId || (string)($r['reportNumber'] ?? '') === (string)$subId) {
                if (!empty($r['id'])) $db['deletedReportIds'][] = (string)$r['id'];
                if (!empty($r['reportNumber'])) $db['deletedReportIds'][] = (string)$r['reportNumber'];
            }
        }
        $db['deletedReportIds'] = array_values(array_unique(array_filter($db['deletedReportIds'])));

        $db['reports'] = array_values(array_filter($db['reports'] ?? [], function($r) use ($subId) {
            return (string)($r['id'] ?? '') !== (string)$subId && (string)($r['reportNumber'] ?? '') !== (string)$subId;
        }));
        if (isset($db['fuelDailyReport']) && ((string)($db['fuelDailyReport']['id'] ?? '') === (string)$subId || (string)($db['fuelDailyReport']['reportNumber'] ?? '') === (string)$subId)) {
            unset($db['fuelDailyReport']);
        }
        if (isset($db['roadDailyReport']) && ((string)($db['roadDailyReport']['id'] ?? '') === (string)$subId || (string)($db['roadDailyReport']['reportNumber'] ?? '') === (string)$subId)) {
            unset($db['roadDailyReport']);
        }
        if (isset($db['executiveProgress']) && ((string)($db['executiveProgress']['id'] ?? '') === (string)$subId || (string)($db['executiveProgress']['reportNumber'] ?? '') === (string)$subId)) {
            unset($db['executiveProgress']);
        }
        if (isset($db['latestTwoPhaseReport']) && ((string)($db['latestTwoPhaseReport']['id'] ?? '') === (string)$subId || (string)($db['latestTwoPhaseReport']['reportNumber'] ?? '') === (string)$subId)) {
            unset($db['latestTwoPhaseReport']);
        }
        save_db($db);
        echo json_encode([
            'success' => true,
            'message' => 'تم حذف التقرير من قاعدة البيانات بنجاح',
            'deletedReportIds' => $db['deletedReportIds']
        ]);
        exit;
    }
}


// -------------------------------------------------------------
// [TWO-PHASE PROGRESS REPORT]
// -------------------------------------------------------------
if ($resource === 'two-phase-report') {
    $db = get_db();
    if ($method === 'GET') {
        echo json_encode(['success' => true, 'data' => $db['latestTwoPhaseReport'] ?? null]);
        exit;
    }
    if ($method === 'POST') {
        $body = get_json_input();
        $db['latestTwoPhaseReport'] = $body;
        
        // Ensure it is simultaneously recorded in reports archive with strict deduplication
        $db['reports'] = deduplicate_reports_array(array_merge([$body], $db['reports'] ?? []));

        save_db($db);
        echo json_encode(['success' => true, 'data' => $body, 'message' => 'تم تحديث تقرير إنجاز المرحلتين سحابياً ومزامنته بالأرشيف']);
        exit;
    }
}

// -------------------------------------------------------------
// [ROAD DAILY REPORT]
// -------------------------------------------------------------
if ($resource === 'road-daily-report') {
    $db = get_db();
    if ($method === 'GET') {
        echo json_encode(['success' => true, 'data' => $db['roadDailyReport'] ?? null]);
        exit;
    }
    if ($method === 'POST') {
        $body = get_json_input();
        $db['roadDailyReport'] = $body;
        if (!isset($db['reports'])) $db['reports'] = [];
        $db['reports'] = deduplicate_reports_array(array_merge([$body], $db['reports']));
        // Automatically feed Phase 2 in Two-Phase report!
        sync_road_report_to_two_phase_php($db, $body);
        save_db($db);
        echo json_encode(['success' => true, 'data' => $body, 'message' => 'تم تحديث تقرير أعمال الطريق وتغذية المرحلة الثانية تلقائياً ومزامنته بالأرشيف']);
        exit;
    }
}

// -------------------------------------------------------------
// [FUEL DAILY REPORT & FUEL LOGS]
// -------------------------------------------------------------
if ($resource === 'fuel-daily-report') {
    $db = get_db();
    if ($method === 'GET') {
        $rep = $db['fuelDailyReport'] ?? null;
        if (!$rep && !empty($db['reports'])) {
            foreach ($db['reports'] as $r) {
                if (!empty($r['isFuelReport']) || ($r['reportType'] ?? '') === 'تقرير كميات الوقود اليومية' || ($r['reportCategory'] ?? '') === 'fuel') {
                    $rep = $r;
                    break;
                }
            }
        }
        echo json_encode(['success' => true, 'data' => $rep]);
        exit;
    }
    if ($method === 'POST') {
        $body = get_json_input();
        $db['fuelDailyReport'] = $body;

        // Un-blacklist this report from deletedReportIds
        if (!empty($db['deletedReportIds'])) {
            $fId = strtolower(trim((string)($body['id'] ?? '')));
            $fIdNorm = strtolower(preg_replace('/[\s\-_]/', '', (string)($body['id'] ?? '')));
            $fNumRaw = strtolower(trim((string)($body['reportNumber'] ?? '')));
            $fNum = strtolower(preg_replace('/[\s\-_]/', '', (string)($body['reportNumber'] ?? '')));
            $db['deletedReportIds'] = array_values(array_filter($db['deletedReportIds'], function($did) use ($fId, $fIdNorm, $fNum, $fNumRaw) {
                $didRaw = strtolower(trim((string)$did));
                $didNorm = strtolower(preg_replace('/[\s\-_]/', '', (string)$did));
                if ($didRaw === $fId || $didNorm === $fId || $didRaw === $fIdNorm || $didNorm === $fIdNorm) return false;
                if ($didRaw === $fNumRaw || $didNorm === $fNum || $didRaw === $fNum) return false;
                return true;
            }));
        }

        // Ensure it is simultaneously recorded in reports archive with strict deduplication
        $db['reports'] = deduplicate_reports_array(array_merge([$body], $db['reports'] ?? []));

        save_db($db);
        echo json_encode(['success' => true, 'data' => $body, 'message' => 'تم تحديث تقرير كميات الوقود اليومية ومزامنته بالأرشيف']);
        exit;
    }
}

if ($resource === 'fuel') {
    $db = get_db();
    if ($method === 'GET') {
        echo json_encode(['success' => true, 'data' => $db['fuel'] ?? []]);
        exit;
    }
    if ($method === 'POST') {
        $body = get_json_input();
        if (!isset($db['fuel'])) $db['fuel'] = [];
        array_unshift($db['fuel'], $body);
        save_db($db);
        echo json_encode(['success' => true, 'message' => 'تم تسجيل حركة الوقود بنجاح']);
        exit;
    }
}

// -------------------------------------------------------------
// [EXECUTIVE PROGRESS]
// -------------------------------------------------------------
if ($resource === 'executive-progress') {
    $db = get_db();
    if ($method === 'GET') {
        $rep = $db['executiveProgress'] ?? null;
        if (!$rep && !empty($db['reports'])) {
            foreach ($db['reports'] as $r) {
                if (!empty($r['isExecutiveProgressReport']) || ($r['reportType'] ?? '') === 'الموقف التنفيذي' || ($r['reportCategory'] ?? '') === 'executive') {
                    $rep = $r;
                    break;
                }
            }
        }
        echo json_encode(['success' => true, 'data' => $rep]);
        exit;
    }
    if ($method === 'POST') {
        $body = get_json_input();
        $db['executiveProgress'] = $body;

        // Un-blacklist from deletedReportIds
        if (!empty($db['deletedReportIds'])) {
            $eId = strtolower(trim((string)($body['id'] ?? '')));
            $eNum = strtolower(preg_replace('/[\s\-_]/', '', (string)($body['reportNumber'] ?? '')));
            $db['deletedReportIds'] = array_values(array_filter($db['deletedReportIds'], function($did) use ($eId, $eNum) {
                $raw = strtolower(trim((string)$did));
                $norm = strtolower(preg_replace('/[\s\-_]/', '', (string)$did));
                return $raw !== $eId && $norm !== $eId && $raw !== $eNum && $norm !== $eNum;
            }));
        }

        if (!isset($db['reports'])) $db['reports'] = [];
        $db['reports'] = deduplicate_reports_array(array_merge([$body], $db['reports']));
        save_db($db);
        echo json_encode(['success' => true, 'data' => $body, 'message' => 'تم تحديث الموقف التنفيذي بنجاح ومزامنته بالأرشيف']);
        exit;
    }
}

// -------------------------------------------------------------
// [ROAD PROGRESS & DAILY UPDATE]
// -------------------------------------------------------------
if ($resource === 'road-progress') {
    $db = get_db();
    if (!isset($db['roadProgress'])) $db['roadProgress'] = [];

    if ($subId === 'update-daily' && $method === 'POST') {
        $body = get_json_input();
        $targetId = $body['id'] ?? null;
        $todayMeters = (float)($body['todayMeters'] ?? 0);
        $notes = $body['notes'] ?? '';

        foreach ($db['roadProgress'] as &$item) {
            if ((string)$item['id'] === (string)$targetId) {
                $item['todayMeters'] = $todayMeters;
                $item['totalMeters'] = (float)($item['previousMeters'] ?? 0) + $todayMeters;
                if (!empty($notes)) $item['notes'] = $notes;
                break;
            }
        }
        save_db($db);
        echo json_encode(['success' => true, 'message' => 'تم تحديث بند الطريق']);
        exit;
    }

    if ($method === 'GET') {
        echo json_encode(['success' => true, 'data' => $db['roadProgress']]);
        exit;
    }
}

// -------------------------------------------------------------
// [MESSAGES & NOTIFICATIONS]
// -------------------------------------------------------------


if ($resource === 'messages') {
    $db = get_db();
    if (!isset($db['messages'])) $db['messages'] = [];

    // Clear messages for a specific user or globally
    if ($method === 'DELETE' && ($subId === 'clear-all' || $subId === 'all' || empty($subId))) {
        $rawUsername = strtolower(trim((string)($_GET['username'] ?? '')));
        $cUsername = canonicalize_php_username($rawUsername);
        $box = $_GET['box'] ?? 'all';

        if (!empty($rawUsername)) {
            // Per-user clear: only mark as deleted for this specific user
            foreach ($db['messages'] as &$m) {
                $to = canonicalize_php_username($m['toUsername'] ?? '');
                $from = canonicalize_php_username($m['fromUsername'] ?? '');
                $rawTo = strtolower(trim((string)($m['toUsername'] ?? '')));
                $isTarget = false;
                if ($box === 'inbox' && ($to === $cUsername || $rawTo === 'all' || $to === 'all') && $from !== $cUsername) {
                    $isTarget = true;
                } else if ($box === 'sent' && $from === $cUsername) {
                    $isTarget = true;
                } else if ($box === 'all' && ($to === $cUsername || $rawTo === 'all' || $to === 'all' || $from === $cUsername)) {
                    $isTarget = true;
                }
                if ($isTarget) {
                    if (!isset($m['deletedBy']) || !is_array($m['deletedBy'])) $m['deletedBy'] = [];
                    if (!in_array($cUsername, array_map('canonicalize_php_username', $m['deletedBy']))) {
                        $m['deletedBy'][] = $cUsername;
                    }
                }
            }
            save_db($db);
            echo json_encode(['success' => true, 'message' => 'تم تفريغ البريد للمستخدم بنجاح']);
            exit;
        }

        // Global purge only if no username provided (e.g. dev clean)
        $db['messages'] = [];
        save_db($db);
        echo json_encode(['success' => true, 'message' => 'تم مسح كافة المراسلات']);
        exit;
    }

    // Delete single message (Independent per-user soft delete)
    if ($method === 'DELETE' && !empty($subId)) {
        $rawUsername = strtolower(trim((string)($_GET['username'] ?? '')));
        $cUsername = canonicalize_php_username($rawUsername);
        if (!empty($rawUsername)) {
            foreach ($db['messages'] as &$m) {
                if ((string)($m['id'] ?? '') === (string)$subId) {
                    if (!isset($m['deletedBy']) || !is_array($m['deletedBy'])) $m['deletedBy'] = [];
                    if (!in_array($cUsername, array_map('canonicalize_php_username', $m['deletedBy']))) {
                        $m['deletedBy'][] = $cUsername;
                    }
                    break;
                }
            }
            save_db($db);
            echo json_encode(['success' => true, 'message' => 'تم حذف الرسالة من صندوقك بنجاح']);
            exit;
        }

        $db['messages'] = array_values(array_filter($db['messages'], function($m) use ($subId) {
            return (string)($m['id'] ?? '') !== (string)$subId;
        }));
        save_db($db);
        echo json_encode(['success' => true, 'message' => 'تم حذف الرسالة']);
        exit;
    }

    // Mark as read
    if ($method === 'PUT' && !empty($subId) && $subAction === 'read') {
        $rawUsername = strtolower(trim((string)($_GET['username'] ?? '')));
        $cUsername = canonicalize_php_username($rawUsername);
        foreach ($db['messages'] as &$m) {
            if ((string)($m['id'] ?? '') === (string)$subId) {
                $m['isRead'] = true;
                if (!empty($rawUsername)) {
                    if (!isset($m['readBy']) || !is_array($m['readBy'])) $m['readBy'] = [];
                    if (!in_array($cUsername, array_map('canonicalize_php_username', $m['readBy']))) {
                        $m['readBy'][] = $cUsername;
                    }
                }
                break;
            }
        }
        save_db($db);
        echo json_encode(['success' => true, 'message' => 'تم تحديث حالة القراءة']);
        exit;
    }

    // Create message (POST /api/messages)
    if ($method === 'POST') {
        $body = get_json_input();
        $newMsg = array_merge([
            'id' => 'msg-' . round(microtime(true) * 1000) . '-' . substr(md5(uniqid()), 0, 5),
            'createdAt' => gmdate('Y-m-d\TH:i:s\Z'),
            'isRead' => false,
            'readBy' => [],
            'deletedBy' => []
        ], $body);

        array_unshift($db['messages'], $newMsg);
        save_db($db);
        echo json_encode(['success' => true, 'message' => $newMsg]);
        exit;
    }

    // List messages (GET /api/messages) - Strictly isolated per user
    if ($method === 'GET') {
        $rawUsername = strtolower(trim((string)($_GET['username'] ?? '')));
        $cUsername = canonicalize_php_username($rawUsername);
        $list = $db['messages'];
        if (!empty($rawUsername)) {
            $filtered = [];
            foreach ($list as $m) {
                $deletedBy = array_map('canonicalize_php_username', $m['deletedBy'] ?? []);
                if (in_array($cUsername, $deletedBy) || in_array($rawUsername, array_map('strtolower', $m['deletedBy'] ?? []))) {
                    continue; // Hidden from this user because they deleted it
                }
                $to = canonicalize_php_username($m['toUsername'] ?? '');
                $from = canonicalize_php_username($m['fromUsername'] ?? '');
                $rawTo = strtolower(trim((string)($m['toUsername'] ?? '')));

                // Must be either addressed to user, broadcast to all, or sent by user
                if ($to === $cUsername || $rawTo === 'all' || $to === 'all' || $from === $cUsername) {
                    $mCopy = $m;
                    // Compute user-specific read status for broadcasts
                    if ($rawTo === 'all' || $to === 'all') {
                        $readBy = array_map('canonicalize_php_username', $m['readBy'] ?? []);
                        $mCopy['isRead'] = in_array($cUsername, $readBy) || in_array($rawUsername, array_map('strtolower', $m['readBy'] ?? []));
                    }
                    $filtered[] = $mCopy;
                }
            }
            $list = $filtered;
        }
        echo json_encode(['success' => true, 'messages' => $list]);
        exit;
    }
}

// -------------------------------------------------------------
// [EQUIPMENT, ALERTS, USERS]
// -------------------------------------------------------------
if ($resource === 'equipment') {
    $db = get_db();
    if ($method === 'GET') {
        echo json_encode(['success' => true, 'equipment' => $db['equipment'] ?? []]);
        exit;
    }
    if ($method === 'POST') {
        $body = get_json_input();
        if (is_array($body) && isset($body[0])) {
            $db['equipment'] = $body;
        } else {
            $db['equipment'][] = $body;
        }
        save_db($db);
        echo json_encode(['success' => true, 'message' => 'تم حفظ بيانات الآليات']);
        exit;
    }
    if ($method === 'DELETE' && !empty($subId)) {
        if (!isset($db['equipment'])) $db['equipment'] = [];
        $db['equipment'] = array_values(array_filter($db['equipment'], function($i) use ($subId) {
            return (string)($i['id'] ?? '') !== (string)$subId;
        }));
        save_db($db);
        echo json_encode(['success' => true, 'message' => 'تم حذف المعدة من السجل']);
        exit;
    }
}

if ($resource === 'alerts') {
    $db = get_db();
    if ($method === 'GET') {
        echo json_encode(['success' => true, 'alerts' => $db['alerts'] ?? []]);
        exit;
    }
    if ($method === 'POST') {
        $body = get_json_input();
        if (!isset($db['alerts'])) $db['alerts'] = [];
        array_unshift($db['alerts'], $body);
        save_db($db);
        echo json_encode(['success' => true, 'message' => 'تم تسجيل التنبيه']);
        exit;
    }
}

if ($resource === 'users') {
    $db = get_db();
    if ($method === 'GET') {
        echo json_encode(['success' => true, 'users' => $db['users'] ?? []]);
        exit;
    }
    if ($method === 'POST') {
        $body = get_json_input();
        $db['users'][] = $body;
        save_db($db);
        echo json_encode(['success' => true, 'user' => $body]);
        exit;
    }
}

// -------------------------------------------------------------
// [SYSTEM PURGE & CLEAN SLATE]
// -------------------------------------------------------------
if ($resource === 'system' && ($subId === 'clean-slate' || $subId === 'purge-all' || $subId === 'reset')) {
    $db = get_db();
    $db['reports'] = [];
    $db['messages'] = [];
    $db['alerts'] = [];
    $db['plans'] = [];
    $db['issues'] = [];
    $db['fuel'] = [];
    $db['savedPeriodicReports'] = [];
    $db['deletedReportIds'] = [];
    $db['fuelDailyReport'] = null;
    $db['roadDailyReport'] = null;
    $db['latestTwoPhaseReport'] = null;
    save_db($db);
    echo json_encode([
        'success' => true,
        'message' => 'تم تنظيف وتصفير قاعدة البيانات المركزية بالكامل بنجاح'
    ]);
    exit;
}

// -------------------------------------------------------------
// [BACKUP EXPORT & RESTORE]
// -------------------------------------------------------------
if ($resource === 'backup') {
    $db = get_db();
    if ($subId === 'export') {
        echo json_encode([
            'success' => true,
            'app' => 'منظومة جهاز الإشراف والمتابعة - مشروع صيانة طريق أوباري غات (360 كم)',
            'timestamp' => gmdate('Y-m-d\TH:i:s\Z'),
            'data' => $db
        ]);
        exit;
    }
    if ($subId === 'restore' && $method === 'POST') {
        $body = get_json_input();
        if (is_array($body) && !empty($body)) {
            $db = array_merge($db, $body);
            save_db($db);
            echo json_encode(['success' => true, 'message' => 'تم استعادة قاعدة البيانات السحابية بنجاح']);
        } else {
            echo json_encode(['success' => false, 'message' => 'بيانات النسخة الاحتياطية غير صالحة']);
        }
        exit;
    }
}

// Fallback for unhandled resources
$db = get_db();
if (isset($db[$resource])) {
    echo json_encode(['success' => true, 'data' => $db[$resource]]);
    exit;
}

echo json_encode(['success' => true, 'message' => 'OK', 'resource' => $resource]);
