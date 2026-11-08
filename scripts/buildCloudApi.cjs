const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const apiDir = path.join(rootDir, 'public_html', 'api');
const dataDir = path.join(apiDir, 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 1. Initial db.json based on server/data/db.json
let baseDb = {};
const serverDbPath = path.join(rootDir, 'server', 'data', 'db.json');
if (fs.existsSync(serverDbPath)) {
  try {
    baseDb = JSON.parse(fs.readFileSync(serverDbPath, 'utf8'));
  } catch (e) {
    console.error('Error reading server db.json:', e);
  }
}

// Ensure messages are populated if empty
if (!Array.isArray(baseDb.messages) || baseDb.messages.length === 0) {
  baseDb.messages = [
    {
      id: 'msg-seed-1',
      fromUsername: 'project_manager',
      fromName: 'م. عبدالرحمن الأنصاري',
      fromRole: 'مدير المشروع',
      toUsername: 'all',
      toName: 'كافة أعضاء جهاز الإشراف (تعميم)',
      toRole: 'جهاز الإشراف والمتابعة',
      type: 'توجيه فني وملاحظات ميدانية',
      subject: 'تعميم إداري وفني بشأن التوثيق اليومي للأعمال المنجزة وتتبع الوقود',
      content: 'السادة مهندسي ومسؤولي جهاز الإشراف الميداني، يُرجى التأكيد على دقة تسجيل قياسات المحطات الميدانية بالكيلومترات، وتدقيق استهلاك الوقود للآليات العاملة بالقطاعين أولاً بأول لضمان المطابقة الفنية والمحاسبية.',
      reportNumber: null,
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'msg-seed-2',
      fromUsername: 'salah_alarabi',
      fromName: 'م. صلاح العربي',
      fromRole: 'مهندس مشرف (المرحلة الأولى)',
      toUsername: 'project_manager',
      toName: 'م. عبدالرحمن الأنصاري',
      toRole: 'مدير المشروع',
      type: 'إحالة تقرير يومي',
      subject: 'إحالة التقرير اليومي لمحطة القطاع الأول (كم 241 إلى كم 242)',
      content: 'تم بحمد الله إنجاز أعمال طبقة الأساس الحبيبي بمعدل طول 300 م.ط ورش مادة التشريب MCO بنجاح وفق الاشتراطات الهندسية. مرفق التقرير الميداني للاعتماد.',
      reportNumber: 'TARGET-SEC-A-5310',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 'msg-seed-3',
      fromUsername: 'saleh_quality',
      fromName: 'م. صالح حماد',
      fromRole: 'مسؤول الجودة',
      toUsername: 'project_manager',
      toName: 'م. عبدالرحمن الأنصاري',
      toRole: 'مدير المشروع',
      type: 'طلب فحص أو اختبار جودة',
      subject: 'الموقف الفني لنتائج فحوصات الكثافة الحقلية وعينات FDR',
      content: 'أفيدكم بأن كافة نتائج اختبارات الكثافة الحقلية لمقاطع FDR بمحطات المرحلة الأولى أظهرت نسبة دمك أعلى من 98% ومطابقة كاملة للمواصفات الفنية المعتمدة للمشروع.',
      reportNumber: null,
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
    },
    {
      id: 'msg-seed-4',
      fromUsername: 'issa_altahir',
      fromName: 'م. عيسى الطاهر',
      fromRole: 'مهندس مشرف (المرحلة الثانية)',
      toUsername: 'project_manager',
      toName: 'م. عبدالرحمن الأنصاري',
      toRole: 'مدير المشروع',
      type: 'إحالة تقرير يومي',
      subject: 'متابعة أعمال طبقة إعادة التدوير FDR بالمرحلة الثانية',
      content: 'تتواصل أعمال فرم وتأهيل طبقة إعادة التدوير (FDR) بالقطاع الثاني بمعدل يومي متقدم مع انتظام عمل الآليات ومداحل الدك الميدانية وفق المخطط الزمني المعتمد للمشروع.',
      reportNumber: null,
      isRead: true,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    }
  ];
}

baseDb.lastUpdated = new Date().toISOString();

const targetDbJson = path.join(dataDir, 'db.json');
fs.writeFileSync(targetDbJson, JSON.stringify(baseDb, null, 2), 'utf8');
console.log('[Cloud API] Seeded db.json at:', targetDbJson);

// 2. data/.htaccess (Deny all direct HTTP requests to json files)
const dataHtaccess = `# Protect database files from direct browser access
Order Allow,Deny
Deny from all
`;
fs.writeFileSync(path.join(dataDir, '.htaccess'), dataHtaccess, 'utf8');

// 3. api/.htaccess (Route all sub-requests to index.php)
const apiHtaccess = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ index.php [QSA,L]
</IfModule>
`;
fs.writeFileSync(path.join(apiDir, '.htaccess'), apiHtaccess, 'utf8');

console.log('[Cloud API] Created .htaccess files.');
