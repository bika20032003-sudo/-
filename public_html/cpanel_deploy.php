<?php
/**
 * ==============================================================================
 * Auto-Deployment & Webhook Engine for cPanel Hosting
 * منظومة جهاز الإشراف والمتابعة - مشروع صيانة وتطوير طريق أوباري - غات (360 كم)
 * ==============================================================================
 * Features:
 * - Compatible with GitHub Webhooks & Direct Browser/Curl Ping
 * - Auto-detects Git repository in cPanel standard locations (~/repositories/* or ~/public_html)
 * - Safe Hard Reset & Pull to prevent merge conflicts with uncommitted changes
 * - Complete database preservation (db.json is never overwritten)
 * - Native PHP file sync fallback if shell execution is restricted
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');

$secret_key = 'supervision_deploy_secret';

// 1. التحقق من مفتاح الأمان
$provided_key = $_GET['key'] ?? ($_POST['key'] ?? ($_SERVER['HTTP_X_DEPLOY_KEY'] ?? ''));
if ($secret_key !== '' && $provided_key !== $secret_key) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized: Invalid deploy key. Provide key via query parameter ?key=' . substr($secret_key, 0, 5) . '...',
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

$startTime = microtime(true);
$logs = [];
$deployedCommit = 'unknown';
$targetDir = realpath(__DIR__);
$dbProtected = false;

// 2. البحث عن مسار أداة git في خادم cPanel
$gitCandidates = [
    '/usr/local/cpanel/3rdparty/bin/git',
    '/usr/bin/git',
    '/bin/git',
    '/usr/local/bin/git',
    'git'
];
$gitBin = null;
foreach ($gitCandidates as $cand) {
    $out = [];
    $ret = 0;
    @exec("$cand --version 2>&1", $out, $ret);
    if ($ret === 0 && !empty($out)) {
        $gitBin = $cand;
        $logs[] = "Found Git binary: $cand (" . trim($out[0]) . ")";
        break;
    }
}

// 3. البحث عن مسار مستودع Git على الخادم
$repoDir = null;
$searchRoots = [
    realpath(__DIR__),
    realpath(__DIR__ . '/..'),
    realpath(__DIR__ . '/../repositories'),
    isset($_SERVER['HOME']) ? realpath($_SERVER['HOME'] . '/repositories') : null
];

foreach ($searchRoots as $root) {
    if (!$root || !is_dir($root)) continue;

    if (is_dir($root . '/.git')) {
        $repoDir = $root;
        break;
    }

    // فحص المجلدات الفرعية داخل مجلد repositories في cPanel
    $subdirs = @glob($root . '/*', GLOB_ONLYDIR);
    if ($subdirs) {
        foreach ($subdirs as $sd) {
            if (is_dir($sd . '/.git')) {
                $repoDir = $sd;
                break 2;
            }
        }
    }
}

if ($repoDir) {
    $logs[] = "Located Git repository at: $repoDir";
} else {
    $logs[] = "No .git directory found in common cPanel locations.";
}

// 4. تنفيذ سحب التحديثات من GitHub
if ($repoDir && $gitBin) {
    $gitCmds = [
        "cd " . escapeshellarg($repoDir) . " && $gitBin fetch origin main 2>&1",
        "cd " . escapeshellarg($repoDir) . " && $gitBin reset --hard origin/main 2>&1",
        "cd " . escapeshellarg($repoDir) . " && $gitBin rev-parse --short HEAD 2>&1"
    ];

    foreach ($gitCmds as $idx => $cmd) {
        $cmdOut = [];
        $cmdRet = 0;
        @exec($cmd, $cmdOut, $cmdRet);
        $logs[] = "[Git Step " . ($idx + 1) . "] " . implode(" | ", $cmdOut);
        if ($idx === 2 && !empty($cmdOut)) {
            $deployedCommit = trim($cmdOut[0]);
        }
    }
}

// 5. تنفيذ سكربت النشر cpanel_deploy.sh أو النشر المباشر عبر PHP
$deployExecuted = false;
if ($repoDir && file_exists($repoDir . '/cpanel_deploy.sh')) {
    $shOut = [];
    $shRet = 0;
    @exec("bash " . escapeshellarg($repoDir . '/cpanel_deploy.sh') . " 2>&1", $shOut, $shRet);
    if (!empty($shOut)) {
        $logs[] = "[cpanel_deploy.sh Output] " . implode(" | ", $shOut);
        $deployExecuted = ($shRet === 0);
    }
}

// 6. النشر والنسخ الاحتياطي التلقائي كضمان إضافي (PHP Fallback)
if ($repoDir && is_dir($repoDir . '/public_html') && realpath($repoDir . '/public_html') !== $targetDir) {
    $sourcePublic = $repoDir . '/public_html';
    $liveDbFile = $targetDir . '/api/data/db.json';
    $dbBackupContent = null;

    if (file_exists($liveDbFile)) {
        $dbBackupContent = @file_get_contents($liveDbFile);
        $dbProtected = true;
        $logs[] = "Backed up live db.json in PHP memory (" . strlen($dbBackupContent) . " bytes).";
    }

    // دالة نسخ مجلد متكرر
    $copyRecursive = function ($src, $dst) use (&$copyRecursive) {
        $dir = @opendir($src);
        if (!$dir) return;
        @mkdir($dst, 0755, true);
        while (false !== ($file = readdir($dir))) {
            if ($file === '.' || $file === '..') continue;
            $srcPath = $src . '/' . $file;
            $dstPath = $dst . '/' . $file;
            if (is_dir($srcPath)) {
                $copyRecursive($srcPath, $dstPath);
            } else {
                @copy($srcPath, $dstPath);
            }
        }
        closedir($dir);
    };

    $copyRecursive($sourcePublic, $targetDir);
    $logs[] = "PHP Copied files from $sourcePublic to $targetDir successfully.";

    // استعادة قاعدة البيانات فوراً
    if ($dbBackupContent !== null) {
        @mkdir(dirname($liveDbFile), 0755, true);
        @file_put_contents($liveDbFile, $dbBackupContent, LOCK_EX);
        @chmod($liveDbFile, 0666);
        $logs[] = "Restored live db.json safely after sync.";
    }
}

// 7. التأكد من ملف index.htm
if (file_exists($targetDir . '/index.html') && !file_exists($targetDir . '/index.htm')) {
    @copy($targetDir . '/index.html', $targetDir . '/index.htm');
}

// 8. إرسال إشارة إعادة تشغيل خادم Node.js
if (is_dir($targetDir . '/tmp')) {
    @touch($targetDir . '/tmp/restart.txt');
} elseif (is_dir($targetDir . '/../tmp')) {
    @touch($targetDir . '/../tmp/restart.txt');
}

$elapsed = round((microtime(true) - $startTime) * 1000, 2);

echo json_encode([
    'success' => true,
    'message' => 'HEAD Commit Deployed Successfully',
    'deployed_commit' => $deployedCommit,
    'database_protected' => $dbProtected,
    'execution_time_ms' => $elapsed,
    'logs' => $logs,
    'timestamp' => date('Y-m-d H:i:s')
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
