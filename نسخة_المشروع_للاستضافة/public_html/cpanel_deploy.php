<?php
/**
 * Auto-Deployment Webhook Script for cPanel Git Version Control
 * سكربت التحديث التلقائي الفوري عند إرسال أي Commit على GitHub
 */
header('Content-Type: application/json; charset=utf-8');

// مفتاح حماية سري لمنع الاستدعاء غير المصرح به
$secret_key = 'supervision_deploy_secret'; 

$provided_key = $_GET['key'] ?? ($_SERVER['HTTP_X_DEPLOY_KEY'] ?? '');
if ($secret_key !== '' && $provided_key !== $secret_key) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized: Invalid deploy key']);
    exit;
}

$output = [];
$return_var = 0;

// سحب التحديثات من مستودع Git الرئيسي
exec('git pull origin main 2>&1', $output, $return_var);

// تشغيل أمر النشر الخاص بـ cPanel
if (file_exists('.cpanel.yml') || file_exists('../.cpanel.yml')) {
    exec('/usr/local/cpanel/bin/git-check 2>&1', $output);
}

// إعادة تشغيل تطبيق Node.js إن وجد
if (file_exists('tmp/restart.txt')) {
    touch('tmp/restart.txt');
} elseif (file_exists('../tmp/restart.txt')) {
    touch('../tmp/restart.txt');
}

echo json_encode([
    'success' => $return_var === 0,
    'message' => 'HEAD Commit Deployed Successfully',
    'output' => $output,
    'timestamp' => date('Y-m-d H:i:s')
]);
