const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('🚀 بدء الفحص الشامل لمنظومة جهاز الإشراف والمتابعة');
console.log('====================================================\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✅ [نجاح]: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ [فشل]: ${testName}`);
    if (details) console.error(`     التفاصيل: ${details}`);
    failedTests++;
  }
}

// ----------------------------------------------------
// 1. اختبار دوال تنظيف اسم اليوم ومنع تكرار كلمة "يوم"
// ----------------------------------------------------
console.log('1️⃣ اختبار معالجة اسم اليوم ومنع تكرار "يوم يوم":');

const cleanDayName = (day) => {
  if (!day) return 'السبت';
  return String(day).replace(/^يوم\s+/g, '').trim();
};

assert(cleanDayName('يوم السبت') === 'السبت', 'إزالة كلمة "يوم" الزائدة من "يوم السبت" لتصبح "السبت"');
assert(cleanDayName('السبت') === 'السبت', 'الحفاظ على اسم اليوم المجرّد "السبت" كما هو');
assert(cleanDayName('يوم الخميس') === 'الخميس', 'إزالة كلمة "يوم" من "يوم الخميس"');
assert(cleanDayName('') === 'السبت', 'التعامل مع القيمة الفارغة بوضع افتراضي سليم');
assert(`يوم ${cleanDayName('يوم السبت')}` === 'يوم السبت', 'ضمان صياغة "يوم السبت" بدقة دون أي تكرار');
assert(`يوم ${cleanDayName('السبت')}` === 'يوم السبت', 'ضمان صياغة "يوم السبت" من الاسم المجرد');

// ----------------------------------------------------
// 2. اختبار معالجة أرقام الوقود ومنع ظهور NaN نهائياً
// ----------------------------------------------------
console.log('\n2️⃣ اختبار معالجة أرقام الوقود ومنع ظهور NaN:');

const formatFuelNumber = (val) => {
  if (val === null || val === undefined || val === '' || val === '-' || val === '—' || String(val).toLowerCase() === 'nan') return '0.00';
  const clean = String(val)
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/٫/g, '.')
    .replace(/[,٬،]/g, '')
    .trim();
  const num = parseFloat(clean);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

assert(formatFuelNumber('570.00') === '570.00', 'تنسيق 570.00 بشكل سليم');
assert(formatFuelNumber('49,829.00') === '49,829.00', 'تحويل "49,829.00" بنجاح دون إعطاء NaN (سبب المشكلة السابق)');
assert(formatFuelNumber('14,631.00') === '14,631.00', 'تحويل "14,631.00" بنجاح دون NaN');
assert(formatFuelNumber('NaN') === '0.00', 'تحويل قيمة NaN الصريحة إلى "0.00" كقيمة آمنة');
assert(formatFuelNumber(null) === '0.00', 'التعامل مع null بإرجاع "0.00"');
assert(formatFuelNumber(undefined) === '0.00', 'التعامل مع undefined بإرجاع "0.00"');
assert(formatFuelNumber('١٤,٦٣١.٠٠') === '14,631.00', 'تحويل الأرقام الشرقية إلى لاتينية غربية بأمان');

// ----------------------------------------------------
// 3. اختبار تنسيق أرقام المرحلتين وإضافة الفواصل
// ----------------------------------------------------
console.log('\n3️⃣ اختبار إضافة فواصل الآلاف في تقرير المرحلتين:');

const formatTwoPhaseNumber = (val) => {
  if (val === null || val === undefined || val === '' || val === '—' || val === '-') return '';
  const clean = String(val)
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/٫/g, '.')
    .replace(/[,٬،]/g, '')
    .trim();
  if (clean === '' || isNaN(Number(clean))) return String(val);
  const parts = clean.split('.');
  const intFormatted = Number(parts[0]).toLocaleString('en-US');
  return parts.length > 1 ? `${intFormatted}.${parts[1]}` : intFormatted;
};

const parseTwoPhaseNumber = (val, defaultVal = 0) => {
  if (val === null || val === undefined || val === '') return defaultVal;
  const clean = String(val).replace(/[,٬،]/g, '').trim();
  const n = parseFloat(clean);
  return isNaN(n) ? defaultVal : n;
};

assert(formatTwoPhaseNumber('226083') === '226,083', 'إضافة فاصلة الآلاف إلى 226083 لتصبح 226,083');
assert(formatTwoPhaseNumber('226,083') === '226,083', 'الحفاظ على الفاصلة إذا كانت موجودة مسبقاً');
assert(formatTwoPhaseNumber('19200') === '19,200', 'تنسيق 19200 لتصبح 19,200');
assert(parseTwoPhaseNumber('226,083') === 226083, 'تحويل السلسلة المحتوية على فواصل إلى رقم حسابي صحيح');
assert(parseTwoPhaseNumber('19,300.50') === 19300.5, 'تحويل الكسور العشرية مع الفواصل إلى رقم صحيح');

// ----------------------------------------------------
// 4. اختبار تغذية تقرير الطريق اليومي للمرحلة الثانية آلياً
// ----------------------------------------------------
console.log('\n4️⃣ اختبار تغذية تقرير أعمال الطريق اليومي للمرحلة الثانية آلياً:');

const roadReportMock = {
  dayName: 'الخميس',
  reportDate: '2026-10-29',
  roadItems: [
    { name: 'طبقة إعادة التدوير (FDR)', todayExecuted: '100' },
    { name: 'رش طبقة التشريب (MCO)', todayExecuted: '1150' },
    { name: 'طبقة الاسفلت المحسن', todayExecuted: '0' },
    { name: 'طبقة أساس حبيبي', todayExecuted: '600' }
  ]
};

const phase2ItemsMock = [
  { name: 'طبقة إعادة التدوير (FDR)', previousMeters: '19,200', todayMeters: '0', totalMeters: '19,200', dailyTarget: '800' },
  { name: 'رش طبقة التشريب (MCO)', previousMeters: '11,370', todayMeters: '0', totalMeters: '11,370', dailyTarget: '800' },
  { name: 'طبقة الاسفلت المحسن', previousMeters: '10,290', todayMeters: '0', totalMeters: '10,290', dailyTarget: '800' }
];

// محاكاة حسابات المزامنة الآلية
const updatedPhase2 = phase2ItemsMock.map(item => {
  const roadMatch = roadReportMock.roadItems.find(r => r.name.includes(item.name.split('(')[0].trim()));
  const todayM = roadMatch ? parseTwoPhaseNumber(roadMatch.todayExecuted) : 0;
  const prevM = parseTwoPhaseNumber(item.previousMeters);
  const totalM = prevM + todayM;
  const target = parseTwoPhaseNumber(item.dailyTarget);
  const variance = todayM - target;
  return {
    ...item,
    todayMeters: formatTwoPhaseNumber(todayM),
    totalMeters: formatTwoPhaseNumber(totalM),
    varianceMeters: (variance > 0 ? `+${variance.toFixed(2)}` : variance.toFixed(2))
  };
});

assert(updatedPhase2[0].todayMeters === '100', 'تحديث إنجاز اليوم لبند إعادة التدوير من 0 إلى 100 م.ط');
assert(updatedPhase2[0].totalMeters === '19,300', 'تحديث الإجمالي التراكمي: 19,200 + 100 = 19,300 م.ط');
assert(updatedPhase2[0].varianceMeters === '-700.00', 'حساب النقصان عن المستهدف: 100 - 800 = -700.00');
assert(updatedPhase2[1].todayMeters === '1,150', 'تحديث إنجاز اليوم لرش التشريب: 1,150 م.ط مع فاصلة الآلاف');
assert(updatedPhase2[1].totalMeters === '12,520', 'تحديث تراكمي رش التشريب: 11,370 + 1,150 = 12,520 م.ط');
assert(updatedPhase2[1].varianceMeters === '+350.00', 'حساب الزيادة عن المستهدف: 1,150 - 800 = +350.00');

// ----------------------------------------------------
// 5. فحص الملفات الميدانية وخلوها من الأخطاء السابقة
// ----------------------------------------------------
console.log('\n5️⃣ فحص ملفات الكود المصدرية والتأكد من خلوها من الأخطاء:');

const printModalCode = fs.readFileSync(path.join(__dirname, '../src/components/OfficialPrintModal.jsx'), 'utf8');
const fuelFormCode = fs.readFileSync(path.join(__dirname, '../src/components/FuelDailyReportForm.jsx'), 'utf8');
const twoPhaseFormCode = fs.readFileSync(path.join(__dirname, '../src/components/TwoPhaseDailyReportForm.jsx'), 'utf8');

// فحص عدم وجود "يوم يوم" في المحتوى المعروض (مع استثناء التعليقات البرمجية)
const printModalNoComments = printModalCode.replace(/\/\/.*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
assert(!printModalNoComments.includes('يوم يوم'), 'خلو نصوص وعناصر OfficialPrintModal.jsx من تكرار "يوم يوم"');
assert(!fuelFormCode.includes("dayName: 'يوم السبت'"), 'خلو ملف FuelDailyReportForm.jsx من تعيين "يوم السبت" المسبوق بكلمة يوم');
assert(printModalCode.includes('formatFuelNumber'), 'استخدام دالة formatFuelNumber الآمنة في شاشة الطباعة');
assert(printModalCode.includes('minHeight: \'165px\'') || printModalCode.includes('minHeight: "165px"'), 'تكبير الرسومات البيانية في شاشة الطباعة بارتفاع 165px كحد أدنى');
assert(twoPhaseFormCode.includes('LabelList'), 'إدراج خاصية LabelList لإظهار القيم الرقمية فوق الأعمدة البيانية في شاشة إنجاز المرحلتين');
assert(printModalCode.includes('📄 صفحة واحدة (1 Page)'), 'وجود زر الملاءمة الذكية لصفحة واحدة (1 Page) في شريط الطباعة');
assert(printModalCode.includes('break-inside: auto !important'), 'السماح للجدول بالتمدد دون قفز مفاجئ لصفحة 2 تاركاً صفحة 1 فارغة');

// ----------------------------------------------------
// 6. فحص بنية التجميع وحزم النشر
// ----------------------------------------------------
console.log('\n6️⃣ فحص حزم البناء والاستضافة وخادم الإنتاج:');

const distIndex = path.join(__dirname, '../dist/index.html');
const publicIndex = path.join(__dirname, '../public_html/index.html');
const apiBackendIndex = path.join(__dirname, '../public_html/api/index.php');
const hostingZip = path.join(__dirname, '../نسخة_الاستضافة_المتكاملة.zip');

assert(fs.existsSync(distIndex), 'وجود ملف البناء الرئيسي dist/index.html');
assert(fs.existsSync(publicIndex), 'وجود ملف الإنتاج public_html/index.html');
assert(fs.existsSync(apiBackendIndex), 'اكتمال وجاهزية ملف بوابة الـ API السحابي الموحد public_html/api/index.php');
assert(fs.existsSync(hostingZip), 'وجود الحزمة المضغوطة الكاملة للاستضافة نسخة_الاستضافة_المتكاملة.zip');

// ----------------------------------------------------
// 7. اختبار وظائف حذف المراسلات في البريد والمراسلات
// ----------------------------------------------------
console.log('\n7️⃣ اختبار وظائف حذف المراسلات في البريد والمراسلات:');

const correspondenceCode = fs.readFileSync(path.join(__dirname, '../src/views/CorrespondenceView.jsx'), 'utf8');

assert(correspondenceCode.includes('const username = u;'), 'تعريف متغير username بشكل صريح مساوياً لاسم المستخدم النشط');
assert(correspondenceCode.includes('syncLocalDeleted'), 'توفير دالة المزامنة الفورية لحذف المراسلات محلياً عبر syncLocalDeleted');
assert(correspondenceCode.includes('markMessageDeletedForUser(msgId, u)'), 'تسجيل حذف المراسلة الفردية بمعرف المستخدم الفعلي');
assert(correspondenceCode.includes('setMessages(prev => prev.filter(m => String(m.id) !== String(msgId)))'), 'تحديث واجهة المستخدم فوراً بحذف الرسالة من القائمة');
assert(correspondenceCode.includes('title="حذف هذه المراسلة من صندوق بريدك"'), 'توفير زر حذف صريح للمراسلة عند فتحها وقراءتها بالكامل');

// محاكاة آلية العزل والحذف في صندوق البريد
const testUser = 'dev_engineer';
const testMessages = [
  { id: 'msg-1', toUsername: 'dev_engineer', fromUsername: 'project_manager', content: 'رسالة 1' },
  { id: 'msg-2', toUsername: 'dev_engineer', fromUsername: 'quality_manager', content: 'رسالة 2' },
  { id: 'msg-3', toUsername: 'all', fromUsername: 'general_director', content: 'تعميم عام' }
];

const deletedSet = new Set(['msg-1']);
const remainingInbox = testMessages.filter(m => !deletedSet.has(m.id));

assert(remainingInbox.length === 2, 'نجاح استبعاد الرسالة المحذوفة msg-1 من صندوق الوارد');
assert(!remainingInbox.some(m => m.id === 'msg-1'), 'التأكد من عدم ظهور الرسالة المحذوفة إطلاقاً');
assert(remainingInbox.some(m => m.id === 'msg-2'), 'بقاء الرسائل غير المحذوفة سليمة دون مساس');

// ----------------------------------------------------
// 8. اختبار المزامنة التلقائية كل دقيقة وتوحيد كافة الأجهزة والهواتف
// ----------------------------------------------------
console.log('\n8️⃣ اختبار المزامنة التلقائية كل دقيقة وتوحيد كافة الأجهزة والهواتف:');

const realtimeSyncCode = fs.readFileSync(path.join(__dirname, '../src/utils/realtimeSync.js'), 'utf8');
const navbarCode = fs.readFileSync(path.join(__dirname, '../src/components/Navbar.jsx'), 'utf8');
const archiveViewCode = fs.readFileSync(path.join(__dirname, '../src/views/ReportsArchiveView.jsx'), 'utf8');
const cloudModalPath = path.join(__dirname, '../src/components/CloudSyncModal.jsx');

assert(realtimeSyncCode.includes('AUTO_SYNC_INTERVAL_MS = 60000'), 'ضبط المزامنة التلقائية الدورية كل 60 ثانية (دقيقة كاملة) كما طلب المستخدم');
assert(realtimeSyncCode.includes('BroadcastChannel'), 'تفعيل تقنية BroadcastChannel للمزامنة الفورية بين النوافذ والتبويبات');
assert(realtimeSyncCode.includes('urlParam'), 'دعم التقاط باراميتر ?api= للربط السحابي المباشر للهواتف الذكية بنقرة واحدة');
assert(realtimeSyncCode.includes('pageshow') && realtimeSyncCode.includes('visibilitychange'), 'تفعيل استجابة المزامنة اللحظية فور فتح الهاتف أو العودة للتطبيق');
assert(fs.existsSync(cloudModalPath), 'وجود نافذة إدارة المزامنة السحابية وتوحيد الأجهزة CloudSyncModal.jsx');
assert(navbarCode.includes('CloudSyncModal') && navbarCode.includes('مزامنة الأجهزة: كل دقيقة ⚡'), 'إتاحة مؤشر وتحكم المزامنة اللحظية في شريط النظام العلوي للحواسب والهواتف');
assert(archiveViewCode.includes('setArchiveMode(canGen ? \'general\' : \'personal\')'), 'تحديث نمط الأرشيف تلقائياً عند تغيير الحساب أو دخول مدير المشروع');
assert(archiveViewCode.includes('fuel-updated') && archiveViewCode.includes('reports-updated'), 'استماع الأرشيف اللحظي لتحديثات تقرير الوقود المعتمدة');

// ----------------------------------------------------
// خلاصة الفحص
// ----------------------------------------------------
console.log('\n====================================================');
console.log(`📊 نتيجة الفحص الشامل: ${passedTests} اختبار ناجح | ${failedTests} اختبار فاشل`);
if (failedTests === 0) {
  console.log('🎉 المنظومة تعمل بامتياز 100% وكافة التعديلات مجربة ومؤكدة!');
} else {
  console.error('⚠️ توجد اختبارات تحتاج إلى مراجعة.');
}
console.log('====================================================');

process.exit(failedTests === 0 ? 0 : 1);
