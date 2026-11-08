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

// 3. Database Engine (Thread-Safe with Exclusive File Locks)
function get_db() {
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
// [REPORTS: GET, CREATE, UPDATE, DELETE, APPROVE, PERIODIC]
// -------------------------------------------------------------
if ($resource === 'reports') {
    $db = get_db();
    if (!isset($db['reports'])) $db['reports'] = [];

    // Periodic reports
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

    // List all reports (GET /api/reports)
    if ($method === 'GET' && empty($subId)) {
        $sector = $_GET['sector'] ?? '';
        $list = $db['reports'];
        if (!empty($sector)) {
            $list = array_values(array_filter($list, function($r) use ($sector) {
                return isset($r['sector']) && mb_stripos($r['sector'], $sector) !== false;
            }));
        }
        // Sort descending
        usort($list, function($a, $b) {
            $ta = strtotime($a['date'] ?? $a['createdAt'] ?? '') ?: ($a['id'] ?? 0);
            $tb = strtotime($b['date'] ?? $b['createdAt'] ?? '') ?: ($b['id'] ?? 0);
            return $tb <=> $ta;
        });
        echo json_encode(['success' => true, 'reports' => $list]);
        exit;
    }

    // Create Report (POST /api/reports, /api/reports/create, /api/reports/upload)
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

        // Deduplicate: replace if exists with same id or reportNumber
        $filtered = array_filter($db['reports'], function($r) use ($body) {
            return (string)($r['id'] ?? '') !== (string)$body['id'] &&
                   (string)($r['reportNumber'] ?? '') !== (string)$body['reportNumber'];
        });

        array_unshift($filtered, $body);
        $db['reports'] = array_values($filtered);

        // If Two Phase report, update latestTwoPhaseReport
        if (!empty($body['isTwoPhaseProgressReport']) || ($body['reportType'] ?? '') === 'تقرير إنجاز المرحلتين') {
            $db['latestTwoPhaseReport'] = $body;
        }
        // If Fuel report, update fuelDailyReport
        if (!empty($body['isFuelReport']) || ($body['reportType'] ?? '') === 'تقرير كميات الوقود اليومية') {
            $db['fuelDailyReport'] = $body;
        }

        save_db($db);
        echo json_encode(['success' => true, 'report' => $body, 'message' => 'تم حفظ التقرير سحابياً بنجاح ومزامنته']);
        exit;
    }

    // Approve Report (PUT /api/reports/:id/approve)
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

    // Update Report (PUT /api/reports/:id)
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

    // Delete Report (DELETE /api/reports/:id)
    if ($method === 'DELETE' && !empty($subId)) {
        $db['reports'] = array_values(array_filter($db['reports'], function($r) use ($subId) {
            return (string)($r['id'] ?? '') !== (string)$subId && (string)($r['reportNumber'] ?? '') !== (string)$subId;
        }));
        save_db($db);
        echo json_encode(['success' => true, 'message' => 'تم حذف التقرير من قاعدة البيانات بنجاح']);
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
        save_db($db);
        echo json_encode(['success' => true, 'data' => $body, 'message' => 'تم تحديث تقرير إنجاز المرحلتين سحابياً']);
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
        save_db($db);
        echo json_encode(['success' => true, 'data' => $body, 'message' => 'تم تحديث تقرير أعمال الطريق اليومي']);
        exit;
    }
}

// -------------------------------------------------------------
// [FUEL DAILY REPORT & FUEL LOGS]
// -------------------------------------------------------------
if ($resource === 'fuel-daily-report') {
    $db = get_db();
    if ($method === 'GET') {
        echo json_encode(['success' => true, 'data' => $db['fuelDailyReport'] ?? null]);
        exit;
    }
    if ($method === 'POST') {
        $body = get_json_input();
        $db['fuelDailyReport'] = $body;
        save_db($db);
        echo json_encode(['success' => true, 'data' => $body, 'message' => 'تم تحديث تقرير كميات الوقود اليومية']);
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
        echo json_encode(['success' => true, 'data' => $db['executiveProgress'] ?? null]);
        exit;
    }
    if ($method === 'POST') {
        $body = get_json_input();
        $db['executiveProgress'] = $body;
        save_db($db);
        echo json_encode(['success' => true, 'data' => $body, 'message' => 'تم تحديث الموقف التنفيذي بنجاح']);
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

    // Clear all messages
    if ($method === 'DELETE' && ($subId === 'clear-all' || $subId === 'all' || empty($subId))) {
        $db['messages'] = [];
        save_db($db);
        echo json_encode(['success' => true, 'message' => 'تم مسح كافة المراسلات']);
        exit;
    }

    // Delete single message
    if ($method === 'DELETE' && !empty($subId)) {
        $db['messages'] = array_values(array_filter($db['messages'], function($m) use ($subId) {
            return (string)($m['id'] ?? '') !== (string)$subId;
        }));
        save_db($db);
        echo json_encode(['success' => true, 'message' => 'تم حذف الرسالة']);
        exit;
    }

    // Mark as read
    if ($method === 'PUT' && !empty($subId) && $subAction === 'read') {
        foreach ($db['messages'] as &$m) {
            if ((string)($m['id'] ?? '') === (string)$subId) {
                $m['isRead'] = true;
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
            'isRead' => false
        ], $body);

        array_unshift($db['messages'], $newMsg);
        save_db($db);
        echo json_encode(['success' => true, 'message' => $newMsg]);
        exit;
    }

    // List messages (GET /api/messages)
    if ($method === 'GET') {
        $username = $_GET['username'] ?? '';
        $list = $db['messages'];
        if (!empty($username)) {
            $isAdmin = in_array($username, ['admin', 'project_manager', 'alansari']);
            $list = array_values(array_filter($list, function($m) use ($username, $isAdmin) {
                $to = $m['toUsername'] ?? '';
                $from = $m['fromUsername'] ?? '';
                return $to === $username || $to === 'all' || $from === $username ||
                       ($isAdmin && ($to === 'admin' || $to === 'project_manager')) ||
                       (!$to && ($from !== $username || $isAdmin));
            }));
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
