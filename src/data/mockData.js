// بيانات المشروع التشغيلية - جهاز تنفيذ مشروعات المواصلات
// مشروع صيانة طريق أوباري - غات (226.28 كم) والكسارات والوقود والمعدات

export const initialDailySummary = {
  workingEquipment: { total: 0, sectorA: 0, sectorB: 0, max: 0 },
  stoppedEquipment: { total: 0, sectorA: 0, sectorB: 0 },
  operatingHours: { total: 0, sectorA: 0, sectorB: 0, change: '0%' },
  solarConsumption: { total: 0, sectorA: 0, sectorB: 0, change: '0%' },
  totalProduction: { total: 0, sectorA: 0, sectorB: 0, change: '0%' },
  sharshoor: { total: 0, sectorA: 0, sectorB: 0 }
};

export const solarTrend7Days = [];
export const solarByEquipmentType = [];

export const initialRecentReports = [];
export const initialAlerts = [
  {
    id: 'ALT-101',
    title: 'انخفاض مخزون الديزل في خزان 107 (المرحلة الأولى)',
    message: 'الرصيد المتبقي في خزان 107 يبلغ 15,200 لتر. معدل الاستهلاك الميداني اليومي للآليات يستوجب طلب وتوريد شحنة سولار جديدة خلال 48 ساعة.',
    type: 'warning',
    category: 'fuel',
    priority: 'high',
    sector: 'المرحلة الأولى',
    actionLink: 'fuel',
    isRead: false,
    author: 'م. صلاح العربي (مشرف المرحلة الأولى)',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    timestamp: 'منذ ساعتين'
  },
  {
    id: 'ALT-102',
    title: 'صيانة وقائية دورية لماكينة التدوير على البارد FDR-02',
    message: 'سجلت ماكينة التدوير FDR-02 عدد 248 ساعة تشغيل مستمرة. يلزم فحص سنون الفرم وفلاتر الهيدروليك وتزييت السيور قبل بدء الوردية الصباحية.',
    type: 'danger',
    category: 'equipment',
    priority: 'urgent',
    sector: 'المرحلة الأولى',
    actionLink: 'equipment',
    isRead: false,
    author: 'مسؤول الصيانة والآليات الميدانية',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    timestamp: 'منذ 5 ساعات'
  },
  {
    id: 'ALT-103',
    title: 'اعتماد نتائج الكثافة الحقلية لمسار الأساس الحبيبي (كم 45+200)',
    message: 'أظهرت الفحوصات المعملية لقطاع المحطة 42+000 إلى 45+200 تحقيق نسبة دك 98.6%، وتم اعتماد الانتقال لمرحلة رش التشريب الأسفلتي MCO.',
    type: 'info',
    category: 'quality',
    priority: 'normal',
    sector: 'المرحلة الأولى',
    actionLink: 'road-progress',
    isRead: true,
    author: 'م. صالح حماد (مسؤول الجودة والمختبر)',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    timestamp: 'أمس 02:30 م'
  },
  {
    id: 'ALT-104',
    title: 'تجهيز صهاريج المياه والجريدر لمسار المرحلة الثانية (134 كم)',
    message: 'تم تخصيص عدد 2 صهريج مياه وجريدر GRD-02 لترطيب ودك طبقة الأساس الحبيبي بالقطاع الجنوبي تمهيداً لأعمال التسوية والميول الهندسية.',
    type: 'warning',
    category: 'progress',
    priority: 'high',
    sector: 'المرحلة الثانية',
    actionLink: 'road-progress',
    isRead: false,
    author: 'م. عيسى الطاهر (مشرف المرحلة الثانية)',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    timestamp: 'اليوم 09:10 ص'
  },
  {
    id: 'ALT-105',
    title: 'اعتماد الموقف التنفيذي الموحد لمشروع طريق أوباري - غات (360 كم)',
    message: 'تم اعتماد وتثبيت بيانات الموقف التنفيذي الشامل وإنجاز المرحلة الأولى بنسبة 100% ومتابعة إنجاز المرحلة الثانية وفق المخطط الزمني.',
    type: 'info',
    category: 'progress',
    priority: 'normal',
    sector: 'all',
    actionLink: 'executive-progress',
    isRead: true,
    author: 'م. عبدالرحمن الأنصاري (مدير المشروع)',
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    timestamp: 'أمس 04:00 م'
  }
];
export const initialTomorrowPlan = [];
export const initialEquipment = [
  // 1. ماكينه FDR (3 ماكينات)
  { id: 1, code: 'FDR-01', name: 'ماكينة إعادة التدوير FDR-01', type: 'ماكينة FDR', category: 'معدات ثقيلة', status: 'operational', driver: 'فرج المهدي', location: 'مسار FDR - المرحلة الأولى', dailyHours: 8, fuelConsumptionRate: 38, notes: 'ماكينة رئيسية لفرم وتدوير طبقة الأساس' },
  { id: 2, code: 'FDR-02', name: 'ماكينة إعادة التدوير FDR-02', type: 'ماكينة FDR', category: 'معدات ثقيلة', status: 'operational', driver: 'رمضان الورفلي', location: 'مسار FDR - المرحلة الأولى', dailyHours: 8, fuelConsumptionRate: 38, notes: 'ماكينة فرم وتأهيل الأسفلت' },
  { id: 3, code: 'FDR-03', name: 'ماكينة إعادة التدوير FDR-03', type: 'ماكينة FDR', category: 'معدات ثقيلة', status: 'operational', driver: 'علي التواتي', location: 'مسار FDR - المرحلة الثانية', dailyHours: 8, fuelConsumptionRate: 38, notes: 'جاهزة للتشغيل الميداني' },
  // 2. جريدر (2 جريدر)
  { id: 4, code: 'GRD-01', name: 'جريدر تسوية تمهيدي 01 (كاتربيلر)', type: 'جريدر', category: 'معدات ثقيلة', status: 'operational', driver: 'ناصر القذافي', location: 'مسار المرحلة الأولى', dailyHours: 8, fuelConsumptionRate: 22, notes: 'تسوية طبقة الفرمة والأساس' },
  { id: 5, code: 'GRD-02', name: 'جريدر تسوية وضبط مناسيب 02', type: 'جريدر', category: 'معدات ثقيلة', status: 'operational', driver: 'محمود الزوي', location: 'مسار المرحلة الثانية', dailyHours: 8, fuelConsumptionRate: 22, notes: 'ضبط الميول والمناسيب الهندسية' },
  // 3. هراس حافر غنم (3 هراسات)
  { id: 6, code: 'SHP-01', name: 'هراس حافر غنم 01 (دك عميق)', type: 'هراس حافر غنم', category: 'معدات دك', status: 'operational', driver: 'سالم المقرحي', location: 'قطاع الفرمة FDR - المرحلة الأولى', dailyHours: 8, fuelConsumptionRate: 18, notes: 'دك أولي لطبقة الفرمة بدون أسمنت' },
  { id: 7, code: 'SHP-02', name: 'هراس حافر غنم 02 (دك عميق)', type: 'هراس حافر غنم', category: 'معدات دك', status: 'operational', driver: 'خالد الفيتوري', location: 'قطاع الفرمة FDR - المرحلة الأولى', dailyHours: 8, fuelConsumptionRate: 18, notes: 'دمك الطبقة المعاد تدويرها' },
  { id: 8, code: 'SHP-03', name: 'هراس حافر غنم 03 (دك عميق)', type: 'هراس حافر غنم', category: 'معدات دك', status: 'operational', driver: 'يوسف الكيلاني', location: 'قطاع الفرمة FDR - المرحلة الثانية', dailyHours: 8, fuelConsumptionRate: 18, notes: 'دمك مسار التدوير' },
  // 4. هراس تربه (3 هراسات)
  { id: 9, code: 'CMP-01', name: 'هراس تربة ناعم 01 (Smooth Drum)', type: 'هراس تربه', category: 'معدات دك', status: 'operational', driver: 'طارق الشريف', location: 'مسار المرحلة الأولى', dailyHours: 8, fuelConsumptionRate: 16, notes: 'دمك نهائي وتثبيت السطح' },
  { id: 10, code: 'CMP-02', name: 'هراس تربة ناعم 02 (Smooth Drum)', type: 'هراس تربه', category: 'معدات دك', status: 'operational', driver: 'مصطفى الهمالي', location: 'مسار المرحلة الأولى', dailyHours: 8, fuelConsumptionRate: 16, notes: 'دمك طبقة الأساس الحبيبي' },
  { id: 11, code: 'CMP-03', name: 'هراس تربة ناعم 03 (Smooth Drum)', type: 'هراس تربه', category: 'معدات دك', status: 'operational', driver: 'هشام البدري', location: 'مسار المرحلة الثانية', dailyHours: 8, fuelConsumptionRate: 16, notes: 'دمك وتجهيز الطبقة للرش' },
  // 5. تانك مياه (7 صهاريج)
  { id: 12, code: 'WT-01', name: 'تانك مياه ميداني 01 (صهريج تغذية)', type: 'تانك مياه', category: 'شاحنات صهريج', status: 'operational', driver: 'إبراهيم بن علي', location: 'محطة تغذية ماكينة FDR', dailyHours: 8, fuelConsumptionRate: 14, notes: 'تغذية مستمرة لماكينة FDR رقم 1' },
  { id: 13, code: 'WT-02', name: 'تانك مياه ميداني 02 (صهريج تغذية)', type: 'تانك مياه', category: 'شاحنات صهريج', status: 'operational', driver: 'عبدالحميد السنوسي', location: 'محطة تغذية ماكينة FDR', dailyHours: 8, fuelConsumptionRate: 14, notes: 'تغذية مستمرة لماكينة FDR رقم 2' },
  { id: 14, code: 'WT-03', name: 'تانك مياه ميداني 03 (رش وترطيب)', type: 'تانك مياه', category: 'شاحنات صهريج', status: 'operational', driver: 'صلاح الترهوني', location: 'مسار المرحلة الأولى', dailyHours: 8, fuelConsumptionRate: 14, notes: 'رش رطوبة دمك الأساس' },
  { id: 15, code: 'WT-04', name: 'تانك مياه ميداني 04 (رش وترطيب)', type: 'تانك مياه', category: 'شاحنات صهريج', status: 'operational', driver: 'عادل المنفي', location: 'مسار المرحلة الثانية', dailyHours: 8, fuelConsumptionRate: 14, notes: 'رش ترطيب الفرمة' },
  { id: 16, code: 'WT-05', name: 'تانك مياه ميداني 05 (صهريج تزويد)', type: 'تانك مياه', category: 'شاحنات صهريج', status: 'operational', driver: 'بشير الصادق', location: 'مسار المرحلة الثانية', dailyHours: 8, fuelConsumptionRate: 14, notes: 'تزويد ماكينات FDR' },
  { id: 17, code: 'WT-06', name: 'تانك مياه ميداني 06 (خدمي)', type: 'تانك مياه', category: 'شاحنات صهريج', status: 'operational', driver: 'سعد الحاسي', location: 'قطاع الكسارات والخلط', dailyHours: 8, fuelConsumptionRate: 14, notes: 'تزويد ورش المياه بالموقع' },
  { id: 18, code: 'WT-07', name: 'تانك مياه ميداني 07 (احتياطي ميداني)', type: 'تانك مياه', category: 'شاحنات صهريج', status: 'operational', driver: 'ميلاد المجبري', location: 'المستودع الرئيسي', dailyHours: 8, fuelConsumptionRate: 14, notes: 'جاهزية دعم فوري للمسار' },
  // 6. لودر (1 لودر)
  { id: 19, code: 'LDR-01', name: 'لودر كوماتسو WA380 (تشوين ومناولة)', type: 'لودر', category: 'معدات ثقيلة', status: 'operational', driver: 'عمر الدرسي', location: 'موقع الفرمة والتشوين', dailyHours: 8, fuelConsumptionRate: 24, notes: 'مناولة الركام ومواد الفرمة' },
  // 7. قلابات (1 قلاب)
  { id: 20, code: 'TRK-01', name: 'شاحنة نقل قلاب مرسيدس أكتروس', type: 'قلابات', category: 'شاحنات نقل', status: 'operational', driver: 'محمد الفرجاني', location: 'مسار الطريق والتشوين', dailyHours: 8, fuelConsumptionRate: 18, notes: 'نقل وتوزيع مواد الردم والأساس' },
  // 8. ماسينزا (1 ماسينزا)
  { id: 21, code: 'MSZ-01', name: 'شاحنة رش الأسفلت ماسينزا (MCO Spreader)', type: 'ماسينزا', category: 'معدات رش أسفلت', status: 'operational', driver: 'سراج المريمي', location: 'قطاع رش التشريب MCO', dailyHours: 8, fuelConsumptionRate: 16, notes: 'رش طبقة التشريب والأسفلت السائل' },
  // 9. جرار زراعي (1 جرار)
  { id: 22, code: 'TRC-01', name: 'جرار زراعي خدمي وسحب ميداني', type: 'جرار زراعي', category: 'آليات مساعدة', status: 'operational', driver: 'عبدالسلام المبروك', location: 'مسار الطريق العام', dailyHours: 8, fuelConsumptionRate: 10, notes: 'أعمال مساعدة وسحب المعدات بالمسار' },
  // 10. عدد 3 طاقم مساحة (6 أفراد / 3 وحدات مساحية)
  { id: 23, code: 'SRV-01', name: 'طاقم مساحة رقم 1 (جهاز Total Station + GPS)', type: 'طاقم مساحة', category: 'أجهزة مساحة وهندسة', status: 'operational', driver: 'م. أحمد الساعدي (رئيس الطاقم) + فني', location: 'مسار المرحلة الأولى', dailyHours: 8, fuelConsumptionRate: 0, notes: 'طاقم مساحة متكامل (شخصين) لضبط المناسيب' },
  { id: 24, code: 'SRV-02', name: 'طاقم مساحة رقم 2 (جهاز Total Station + GPS)', type: 'طاقم مساحة', category: 'أجهزة مساحة وهندسة', status: 'operational', driver: 'م. خليل الورفلي (رئيس الطاقم) + فني', location: 'مسار المرحلة الثانية', dailyHours: 8, fuelConsumptionRate: 0, notes: 'طاقم مساحة متكامل (شخصين) لضبط المسار' },
  { id: 25, code: 'SRV-03', name: 'طاقم مساحة رقم 3 (جهاز ميزان قامة + GPS)', type: 'طاقم مساحة', category: 'أجهزة مساحة وهندسة', status: 'operational', driver: 'م. معتز الفاخري (رئيس الطاقم) + فني', location: 'نقاط الربط والمناسيب الهندسية', dailyHours: 8, fuelConsumptionRate: 0, notes: 'طاقم مساحة متكامل (شخصين) للتأكيد والتدقيق' }
];

export const initialEquipmentList = initialEquipment;
export const initialCrushers = [];
export const initialCrusherStocks = [];
export const initialFuelLogs = [];

export const initialRoadProgress = [
  // Phase 1 (المرحلة الأولى - محطة 000+00 إلى 083+226 بطول 226.08 كم - منجزة 100%)
  {
    id: 1,
    sector: 'المرحلة الأولى',
    itemName: 'طبقة إعادة التدوير (FDR)',
    category: 'بنود أساسية',
    todayMeters: 0,
    previousMeters: 226083,
    totalMeters: 226083,
    dailyTarget: 800,
    varianceMeters: 0,
    readyLength: 0,
    notes: 'مكتملة بالكامل بالمرحلة الأولى'
  },
  {
    id: 2,
    sector: 'المرحلة الأولى',
    itemName: 'رش طبقة التشريب (MCO)',
    category: 'بنود أساسية',
    todayMeters: 0,
    previousMeters: 226083,
    totalMeters: 226083,
    dailyTarget: 800,
    varianceMeters: 0,
    readyLength: 0,
    notes: 'مكتملة بالكامل بالمرحلة الأولى'
  },
  {
    id: 3,
    sector: 'المرحلة الأولى',
    itemName: 'طبقة الاسفلت المحسن',
    category: 'بنود أساسية',
    todayMeters: 0,
    previousMeters: 226083,
    totalMeters: 226083,
    dailyTarget: 800,
    varianceMeters: 0,
    readyLength: 0,
    notes: 'مكتملة بالكامل بالمرحلة الأولى'
  },
  {
    id: 4,
    sector: 'المرحلة الأولى',
    itemName: 'فرمة اولي بدون اسمنت(FDR)',
    category: 'بنود إضافية',
    todayMeters: 0,
    previousMeters: 226083,
    totalMeters: 226083,
    dailyTarget: 800,
    varianceMeters: 0,
    readyLength: 0,
    notes: 'مكتملة بالكامل بالمرحلة الأولى'
  },
  {
    id: 5,
    sector: 'المرحلة الأولى',
    itemName: 'طبقة أساس حبيبي',
    category: 'بنود إضافية',
    todayMeters: 0,
    previousMeters: 226083,
    totalMeters: 226083,
    dailyTarget: 800,
    varianceMeters: 0,
    readyLength: 0,
    notes: 'مكتملة بالكامل بالمرحلة الأولى'
  },
  {
    id: 6,
    sector: 'المرحلة الأولى',
    itemName: 'الطريق الخدمي',
    category: 'بنود إضافية',
    todayMeters: 0,
    previousMeters: 226218,
    totalMeters: 226218,
    dailyTarget: 800,
    varianceMeters: 0,
    readyLength: 0,
    notes: 'مكتملة بالكامل بالمرحلة الأولى'
  },
  // Phase 2 (المرحلة الثانية - محطة 083+226 إلى 000+360 بطول 133.92 كم - قيد التنفيذ)
  {
    id: 7,
    sector: 'المرحلة الثانية',
    itemName: 'طبقة إعادة التدوير (FDR)',
    category: 'بنود أساسية',
    todayMeters: 1220,
    previousMeters: 15020,
    totalMeters: 16240,
    dailyTarget: 800,
    varianceMeters: 420,
    readyLength: 30,
    notes: 'منجز معتمد بالتقرير اليومي'
  },
  {
    id: 8,
    sector: 'المرحلة الثانية',
    itemName: 'رش طبقة التشريب (MCO)',
    category: 'بنود أساسية',
    todayMeters: 460,
    previousMeters: 9950,
    totalMeters: 10410,
    dailyTarget: 800,
    varianceMeters: -340,
    readyLength: 0,
    notes: 'منجز معتمد بالتقرير اليومي'
  },
  {
    id: 9,
    sector: 'المرحلة الثانية',
    itemName: 'طبقة الاسفلت المحسن',
    category: 'بنود أساسية',
    todayMeters: 1140,
    previousMeters: 7020,
    totalMeters: 8160,
    dailyTarget: 800,
    varianceMeters: 340,
    readyLength: 2268,
    notes: 'منجز معتمد بالتقرير اليومي'
  },
  {
    id: 10,
    sector: 'المرحلة الثانية',
    itemName: 'فرمة اولي بدون اسمنت(FDR)',
    category: 'بنود إضافية',
    todayMeters: 500,
    previousMeters: 15710,
    totalMeters: 16210,
    dailyTarget: 800,
    varianceMeters: -300,
    readyLength: 0,
    notes: 'منجز معتمد بالتقرير اليومي'
  },
  {
    id: 11,
    sector: 'المرحلة الثانية',
    itemName: 'طبقة أساس حبيبي',
    category: 'بنود إضافية',
    todayMeters: 500,
    previousMeters: 9910,
    totalMeters: 10410,
    dailyTarget: 800,
    varianceMeters: -300,
    readyLength: 5717,
    notes: 'منجز معتمد بالتقرير اليومي'
  },
  {
    id: 12,
    sector: 'المرحلة الثانية',
    itemName: 'الطريق الخدمي',
    category: 'بنود إضافية',
    todayMeters: 0,
    previousMeters: 15230,
    totalMeters: 15230,
    dailyTarget: 800,
    varianceMeters: 0,
    readyLength: 0,
    notes: 'منجز معتمد بالتقرير اليومي'
  }
];

export { initialRoadDailyData } from '../components/RoadDailyReportForm';
export { initialFuelDailyData } from '../components/FuelDailyReportForm';
export { initialExecutiveData } from '../components/ExecutiveProgressForm';
