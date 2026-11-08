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

// Remove crushers and sharshoor completely per project requirements
delete baseDb.crushers;
delete baseDb.sharshoor;

// Clean reports of crusher references and ensure Phase 1 / Phase 2 tagging
if (Array.isArray(baseDb.reports)) {
  baseDb.reports = baseDb.reports.map(r => {
    const isPhase2 = String(r.sector || '').includes('الثانية') || String(r.sector || '').includes('B');
    const cleanedFuelItems = Array.isArray(r.fuelItems) ? r.fuelItems.map(f => ({
      ...f,
      location: String(f.location || '').replace(/الكسارات/g, 'محطة الموقع والمعدات')
    })) : [];
    return {
      ...r,
      sector: isPhase2 ? 'المرحلة الثانية' : 'المرحلة الأولى',
      reportNumber: r.reportNumber ? r.reportNumber.replace(/SEC-A/g, 'P1').replace(/SEC-B/g, 'P2') : undefined,
      crusherName: undefined,
      productionAmount: undefined,
      fuelItems: cleanedFuelItems.length > 0 ? cleanedFuelItems : r.fuelItems
    };
  });
}

// Clean fuelDailyReport
if (baseDb.fuelDailyReport && Array.isArray(baseDb.fuelDailyReport.fuelItems)) {
  baseDb.fuelDailyReport.fuelItems = baseDb.fuelDailyReport.fuelItems.map(f => ({
    ...f,
    location: String(f.location || '').replace(/الكسارات/g, 'محطة الموقع والمعدات')
  }));
}

// Clean equipment
if (Array.isArray(baseDb.equipment)) {
  baseDb.equipment = baseDb.equipment.map(e => ({
    ...e,
    location: (e.location || '').replace(/قطاع الكسارات والخلط|الكسارات/g, 'محطة الخلط والموقع').replace(/القطعة A/g, 'المرحلة الأولى').replace(/القطعة B/g, 'المرحلة الثانية'),
    notes: (e.notes || '').replace(/الكسارات|كسارة/g, 'الموقع').replace(/سولار/g, 'وقود')
  }));
}

// Clean alerts
if (Array.isArray(baseDb.alerts)) {
  baseDb.alerts = baseDb.alerts.filter(a => !String(a.title || '').includes('كسار') && !String(a.message || '').includes('كسار'))
    .map(a => ({
      ...a,
      title: (a.title || '').replace(/سولار/g, 'وقود').replace(/القطعة A/g, 'المرحلة الأولى').replace(/القطعة B/g, 'المرحلة الثانية'),
      message: (a.message || '').replace(/سولار/g, 'وقود ديزل').replace(/القطعة A/g, 'المرحلة الأولى').replace(/القطعة B/g, 'المرحلة الثانية')
    }));
}

// Clean plans
if (Array.isArray(baseDb.plans)) {
  baseDb.plans = baseDb.plans.map(p => ({
    ...p,
    title: (p.title || '').replace(/الكسارات والمعدات/g, 'المعدات والآليات').replace(/الكسارات/g, 'المعدات'),
    items: Array.isArray(p.items) ? p.items.map(it => ({
      ...it,
      location: (it.location || '').replace(/الكسارات/g, 'الموقع العام')
    })) : []
  }));
}

// Clean issues
if (Array.isArray(baseDb.issues)) {
  baseDb.issues = baseDb.issues.map(iss => ({
    ...iss,
    title: (iss.title || '').replace(/الكسارة الشمالية/g, 'ماكينة FDR').replace(/الكسارة/g, 'المعدات'),
    sector: (iss.sector || '').replace(/القطعة A/g, 'المرحلة الأولى').replace(/القطعة B/g, 'المرحلة الثانية')
  }));
}

// Ensure official messages are populated
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
    content: 'السادة مهندسي ومسؤولي جهاز الإشراف الميداني، يُرجى التأكيد على دقة تسجيل قياسات المحطات الميدانية بالكيلومترات، وتدقيق استهلاك الوقود للآليات العاملة بالمرحلتين الأولى والثانية أولاً بأول لضمان المطابقة الفنية والمحاسبية.',
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
    subject: 'إحالة التقرير اليومي لمحطة المرحلة الأولى (كم 241 إلى كم 242)',
    content: 'تم بحمد الله إنجاز أعمال طبقة الأساس الحبيبي بمعدل طول 300 م.ط ورش مادة التشريب MCO بنجاح وفق الاشتراطات الهندسية. مرفق التقرير الميداني للاعتماد.',
    reportNumber: 'TARGET-P1-5310',
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
    content: 'تتواصل أعمال فرم وتأهيل طبقة إعادة التدوير (FDR) بالمرحلة الثانية بمعدل يومي متقدم مع انتظام عمل الآليات ومداحل الدك الميدانية وفق المخطط الزمني المعتمد للمشروع.',
    reportNumber: null,
    isRead: true,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

baseDb.lastUpdated = new Date().toISOString();

const targetDbJson = path.join(dataDir, 'db.json');
fs.writeFileSync(targetDbJson, JSON.stringify(baseDb, null, 2), 'utf8');
console.log('[Cloud API] Seeded clean db.json at:', targetDbJson);

// 2. data/.htaccess
const dataHtaccess = `# Protect database files from direct browser access
Order Allow,Deny
Deny from all
`;
fs.writeFileSync(path.join(dataDir, '.htaccess'), dataHtaccess, 'utf8');

// 3. api/.htaccess
const apiHtaccess = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ index.php [QSA,L]
</IfModule>
`;
fs.writeFileSync(path.join(apiDir, '.htaccess'), apiHtaccess, 'utf8');

console.log('[Cloud API] Created clean .htaccess files.');
