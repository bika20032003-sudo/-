// بيانات المشروع التشغيلية - جهاز تنفيذ مشروعات المواصلات
// مشروع صيانة وتطوير طريق أوباري - غات (360 كم) والوقود والمعدات

export const initialDailySummary = {
  workingEquipment: { total: 0, phase1: 0, phase2: 0, max: 0 },
  stoppedEquipment: { total: 0, phase1: 0, phase2: 0 },
  operatingHours: { total: 0, phase1: 0, phase2: 0, change: '0%' },
  fuelConsumption: { total: 0, phase1: 0, phase2: 0, change: '0%' },
  totalProduction: { total: 0, phase1: 0, phase2: 0, change: '0%' }
};

export const solarTrend7Days = [];
export const solarByEquipmentType = [];

export const OFFICIAL_BASELINE_FUEL_REPORT = {
  reportTitle: 'تقرير كميات الوقود اليومية',
  reportDate: '2026-10-24',
  formattedSlashDate: '24/10/2026',
  dateFormatted: '24/10/2026',
  date: '2026-10-24T00:00:00.000Z',
  dayName: 'يوم السبت',
  reportNumber: '',
  sector: 'مشروع أوباري - غات',
  fuelOfficer: 'مسؤول الوقود والمحروقات بالموقع',
  headOfSupervision: 'م. عبدالسلام ابريكاو (رئيس جهاز الإشراف)',
  totalDispatchedLiters: 0.00,
  totalReceivedLiters: 0.00,
  totalRemainingLiters: 0.00,
  fuelAmount: 0.00,
  status: 'approved',
  approvedBy: 'م. عبدالسلام ابريكاو (رئيس جهاز الإشراف)',
  notes: 'تقرير كميات الوقود اليومية المعتمد - إجمالي المنصرف: 22,738.00 لتر - الوارد: 14,631.00 لتر - المتبقي: 210,697.00 لتر',
  isFuelReport: true,
  fuelItems: [
    {
      id: 1,
      index: 1,
      seq: '1',
      location: '107',
      dispatchedLiters: '0.00',
      receivedLiters: '0.00',
      remainingLiters: '0.00',
      notes: ''
    },
    {
      id: 2,
      index: 2,
      seq: '2',
      location: '240',
      dispatchedLiters: '0.00',
      receivedLiters: '0.00',
      remainingLiters: '0.00',
      notes: ''
    },
    {
      id: 3,
      index: 3,
      seq: '3',
      location: 'الكسارات',
      dispatchedLiters: '0.00',
      receivedLiters: '0.00',
      remainingLiters: '0.00',
      notes: ''
    }
  ]
};


export const initialRecentReports = [];
export const initialAlerts = [];
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
  { id: 17, code: 'WT-06', name: 'تانك مياه ميداني 06 (خدمي)', type: 'تانك مياه', category: 'شاحنات صهريج', status: 'operational', driver: 'سعد الحاسي', location: 'محطة الخلط والموقع', dailyHours: 8, fuelConsumptionRate: 14, notes: 'تزويد ورش المياه بالموقع' },
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

// Default initial data matching the approved executive progress document (24/10/2026)
export const initialExecutiveData = {
  projectName: 'مشروع صيانة طريق اوباري غات بطول 360 كيلومتر',
  reportTitle: 'الموقف التنفيذي.',
  contractValue: 897665675.030,
  currency: 'دينار',
  reportDate: '2026-10-29',
  reportNumber: '093436_29.10.2026',
  basicTotals: { executedValue: 638329685.45, percentage: 71.11 },
  additionalTotals: { executedValue: 94318535.86 },
  grandTotals: {
    contractValue: 897665675.030,
    totalExecutedValue: 638329685.45,
    totalRemainingValue: 259335989.58,
    overallFinancialPercentage: 71.11,
    basicItemsPercentage: 71.11
  },
  basicItems: [
    {
      id: 1,
      section: 'أولاً: الدراسة والتصميم',
      itemNumber: '1',
      description: 'دراسة وتصميم كامل القطاع ويشمل العمل حساب حجم المرور وأخذ عينات من الطريق الحالي وتحديد حجم الضرر بالإضافة الى تصميم طبقة الاساس المعدل بطريقة ( FDR ) وتصميم طبقات الرصف التي تليها',
      unit: 'مقطوعية',
      contractQuantity: 1,
      executedQuantity: 0.875,
      remainingQuantity: 0.125,
      unitRate: 17601287.75,
      executedValue: 15401126.78,
      percentage: 87.50,
      notes: ''
    },
    {
      id: 2,
      section: 'ثانياً: أعمال الرصف',
      itemNumber: '2',
      description: 'كشط جزء من طبقات الاسفلت والاساس الحبيبي القائم وإعادة تدوير المواد الناتجة من عملية الكشط باستخدام تقنية إعادة تدوير كامل الرصف Full Depth Reclamation FDR ( بعد تعديل خواصها بالإضافات اللازمة ) وفرشها في طبقة جديدة اسفل كأساس لجسم الطريق وتشمل كافة الاختبارات اللازمة لتحديد نسب خلط المواد الإضافية وأسمنت والبودرة واستخدام المعدات الخاصة بالعمل والايادي العاملة واختبارات ضبط الجودة حسب المواصفات الفنية وتعليمات المهندس المشرف.',
      unit: 'م2',
      contractQuantity: 3060000.00,
      executedQuantity: 2239792.63,
      remainingQuantity: 820207.37,
      unitRate: 119.44,
      executedValue: 267520831.73,
      percentage: 73.20,
      notes: 'محسوبة من أطوال ومساحات المحطات (L41)'
    },
    {
      id: 3,
      section: 'ثانياً: أعمال الرصف',
      itemNumber: '3',
      description: 'توريد ورش طبقة تشريب نوع ( MC0 ) بمعدل 1.5 كجم / م2 على السطح النهائي للأساس الحبيبي بعرض واجهة تشمل ثمن المواد وتكاليف النقل ونظافة السطح قبل رشه والآلات والمعدات والأيدي العاملة وكل ما يلزم لنهو العمل والمعتمدة بالمتر المسطح طبقاً للمواصفات الفنية وتعليمات المهندس المشرف',
      unit: 'م2',
      contractQuantity: 3060000.00,
      executedQuantity: 2179342.47,
      remainingQuantity: 880657.53,
      unitRate: 13.73,
      executedValue: 29922372.11,
      percentage: 71.22,
      notes: 'محسوبة من أطوال ومساحات المحطات (F37)'
    },
    {
      id: 4,
      section: 'ثانياً: أعمال الرصف',
      itemNumber: '4',
      description: 'توريد وفرش طبقة اسفلتية سطحية محسنة باستخدام البوليمر بسمك 6 سم وبعرض 9.00 م والدك والتسوية طبقاً للمواصفات الفنية وتعليمات المهندس المشرف',
      unit: 'م2',
      contractQuantity: 3060000.00,
      executedQuantity: 2139464.47,
      remainingQuantity: 920535.53,
      unitRate: 145.35,
      executedValue: 310971160.71,
      percentage: 69.92,
      notes: 'محسوبة من أطوال ومساحات المحطات (R37)'
    },
    {
      id: 5,
      section: 'ثالثاً: الأعمال الإرشادية',
      itemNumber: '5',
      description: 'تركيب علامات الإرشاد ويشمل هذا البند توريد وتركيب ودعامات لافتات الإرشاد ووضعها في اماكنها وذلك تشمل توريد الاعمدة واللوحات اللازمة وكذلك ثمن المواد والنقل والتوزيع والطلاء العاكس والكتابة وتثبيت العلامات في المواقع المعتمدة بقواعد خرسانية طبقاً للمواصفات الفنية وتعليمات المهندس المشرف',
      unit: 'عدد',
      contractQuantity: 72.00,
      executedQuantity: 0.00,
      remainingQuantity: 72.00,
      unitRate: 1783.99,
      executedValue: 0.00,
      percentage: 0.00,
      notes: ''
    },
    {
      id: 6,
      section: 'ثالثاً: الأعمال الإرشادية',
      itemNumber: '6',
      description: 'تركيب علامات أرضية لتحديد السرعة ( عواكس أرضية ) وتشمل وضع وحواف الطريق حسب المواصفات الفنية المعمول بها',
      unit: 'عدد',
      contractQuantity: 1080.00,
      executedQuantity: 0.00,
      remainingQuantity: 1080.00,
      unitRate: 135.04,
      executedValue: 0.00,
      percentage: 0.00,
      notes: ''
    },
    {
      id: 7,
      section: 'ثالثاً: الأعمال الإرشادية',
      itemNumber: '7',
      description: 'تركيب السياج المعدني الواقي ويشمل هذا البند إزالة الاسوار المرنة التالفة والاعمدة المتضررة وإبعادها عن حرم الطريق مع توريد وتركيب أسوار مرنة جديدة في الأماكن وتنظيفها حسب المواصفات.',
      unit: 'م.ط',
      contractQuantity: 2160.00,
      executedQuantity: 500.00,
      remainingQuantity: 1660.00,
      unitRate: 1205.23,
      executedValue: 602615.00,
      percentage: 23.15,
      notes: ''
    },
    {
      id: 8,
      section: 'رابعاً: أعمال الطلاء',
      itemNumber: '8',
      description: 'طلاء سطح الطريق ويشمل هذا البند تنظيف سطح الطريق من الاتربة والمواد العالقة وتوريد طلاء',
      unit: '',
      contractQuantity: '',
      executedQuantity: '',
      remainingQuantity: '',
      unitRate: '',
      executedValue: '',
      percentage: '',
      notes: 'بند تمهيدي لأعمال الطلاء وتخطيط المسارات'
    },
    {
      id: 9,
      section: 'رابعاً: أعمال الطلاء',
      itemNumber: '9',
      description: 'خطوط صفراء على جانبى الطريق بعرض 15 سم .',
      unit: 'م.ط',
      contractQuantity: 720000.00,
      executedQuantity: 402403.00,
      remainingQuantity: 317597.00,
      unitRate: 23.07,
      executedValue: 9283437.21,
      percentage: 55.89,
      notes: ''
    },
    {
      id: 10,
      section: 'رابعاً: أعمال الطلاء',
      itemNumber: '10',
      description: 'خطوط بيضاء متقطعة بمحور الطريق بعرض 15 سم',
      unit: 'م.ط',
      contractQuantity: 240000.00,
      executedQuantity: 180646.00,
      remainingQuantity: 59354.00,
      unitRate: 23.07,
      executedValue: 4167503.22,
      percentage: 75.27,
      notes: ''
    },
    {
      id: 11,
      section: 'رابعاً: أعمال الطلاء',
      itemNumber: '11',
      description: 'خطوط بيضاء مستمرة بمحور الطريق بعرض 15 سم .',
      unit: 'م.ط',
      contractQuantity: 120000.00,
      executedQuantity: 19967.00,
      remainingQuantity: 100033.00,
      unitRate: 23.07,
      executedValue: 460638.69,
      percentage: 16.64,
      notes: ''
    }
  ],
  additionalItems: [
    {
      id: 1,
      itemNumber: '1',
      description: 'طبقة أساس حبيبي',
      unit: 'م3',
      contractQuantity: '',
      executedQuantity: 270078.68,
      remainingQuantity: '',
      unitRate: 299.52,
      executedValue: 80893967.36,
      percentage: '',
      notes: 'محسوبة من أطوال ومساحات المحطات بسماكة 12.5 سم (AA44)'
    },
    {
      id: 2,
      itemNumber: '2',
      description: 'الطريق الخدمي',
      unit: 'كيلومتر',
      contractQuantity: '',
      executedQuantity: 225.623,
      remainingQuantity: '',
      unitRate: 59500.00,
      executedValue: 13424568.50,
      percentage: '',
      notes: ''
    }
  ],
  signatories: {
    preparedBy: 'جهاز الإشراف الميداني',
    projectManager: 'م. عبدالرحمن الأنصاري (مدير المشروع)',
    headOfSupervision: 'م. عبدالسلام ابريكاو (رئيس جهاز الإشراف)'
  }
};
