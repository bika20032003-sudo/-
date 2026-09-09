// بيانات المشروع التشغيلية - جهاز تنفيذ مشروعات المواصلات
// مشروع صيانة طريق أوباري - غات (226.28 كم) والكسارات والوقود والمعدات

export const initialDailySummary = {
  workingEquipment: { total: 42, sectorA: 24, sectorB: 18, max: 48 },
  stoppedEquipment: { total: 4, sectorA: 2, sectorB: 2 },
  operatingHours: { total: 312, sectorA: 178, sectorB: 134, change: '+6.5%' },
  solarConsumption: { total: 4250, sectorA: 2450, sectorB: 1800, change: '+3.2%' },
  totalProduction: { total: 1470, sectorA: 850, sectorB: 620, change: '+8.4%' },
  sharshoor: { total: 882, sectorA: 510, sectorB: 372 }
};

export const solarTrend7Days = [
  { day: 'السبت', sectorA: 2200, sectorB: 1700, total: 3900 },
  { day: 'الأحد', sectorA: 2350, sectorB: 1750, total: 4100 },
  { day: 'الإثنين', sectorA: 2400, sectorB: 1820, total: 4220 },
  { day: 'الثلاثاء', sectorA: 2500, sectorB: 1850, total: 4350 },
  { day: 'الأربعاء', sectorA: 2420, sectorB: 1790, total: 4210 },
  { day: 'الخميس', sectorA: 2480, sectorB: 1810, total: 4290 },
  { day: 'اليوم (الجمعة)', sectorA: 2450, sectorB: 1800, total: 4250 }
];

export const solarByEquipmentType = [
  { name: 'الكسارات والمولدات', value: 1650, color: '#dc2626' },
  { name: 'الحفارات واللوادر', value: 1420, color: '#f59e0b' },
  { name: 'شاحنات النقل والقلابات', value: 850, color: '#3b82f6' },
  { name: 'فاردات الأسفلت والجريدرات', value: 330, color: '#10b981' }
];

export const initialRecentReports = [
  {
    id: 1,
    reportNumber: 'REP-2026-0818-01',
    date: '2026-08-18',
    sector: 'القطعة A',
    reportType: 'تقرير إنتاج كسارة',
    crusherName: 'الكسارة الرئيسية - أوباري',
    materialName: 'ركام طبقة أساس (0-37.5 مم)',
    productionAmount: 850,
    salesAmount: 510,
    uploadedBy: 'م. عبدالرحمن',
    status: 'approved',
    notes: 'استقرار الإنتاج وجودة عالية في التكسير'
  },
  {
    id: 2,
    reportNumber: 'REP-2026-0818-02',
    date: '2026-08-18',
    sector: 'القطعة B',
    reportType: 'تقرير تزويد وقود',
    crusherName: 'الكسارة الشمالية',
    materialName: 'سولار تشغيل كسارة ومعدات',
    productionAmount: 1800,
    salesAmount: 0,
    uploadedBy: 'م. عبدالسلام',
    status: 'approved',
    notes: 'تفريغ صهريج ديزل سعة 20,000 لتر'
  },
  {
    id: 3,
    reportNumber: 'REP-2026-0818-03',
    date: '2026-08-18',
    sector: 'القطعة A',
    reportType: 'تقرير توريد شرشور',
    crusherName: 'الكسارة 1',
    materialName: 'شرشور ناعم (0-5 مم)',
    productionAmount: 510,
    salesAmount: 480,
    uploadedBy: 'سالم التاورغي',
    status: 'approved',
    notes: 'توريد لموقع خلطة الأسفلت بالمحطة 45+200'
  }
];

export const initialAlerts = [
  {
    id: 1,
    type: 'warning',
    title: 'تنبيه استهلاك السولار - القطعة A',
    message: 'ارتفاع معدل استهلاك الديزل في الحفار CAT 336D بنسبة 12% عن المعدل الطبيعي.',
    targetSector: 'القطعة A',
    suggestedAction: 'فحص فلاتر الوقود وبخاخات المحرك.',
    isRead: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    type: 'danger',
    title: 'صيانة دورية عاجلة - جريدر CAT 140K',
    message: 'توقف الجريدر كود (EQ-103) بالمحطة 62+500 لتبديل سكينة التسوية والسيور.',
    targetSector: 'القطعة B',
    suggestedAction: 'توجيه فريق الصيانة الميكانيكية بالموقع.',
    isRead: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    type: 'info',
    title: 'وصول صهريج وقود جديد',
    message: 'تم استلام وتفريغ صهريج ديزل سعة 30,000 لتر في الخزان الرئيسي بالقطاع الشمالي.',
    targetSector: 'القطعة A',
    suggestedAction: 'تحديث الرصيد المخزني بالمنظومة.',
    isRead: true,
    createdAt: new Date().toISOString()
  }
];

export const initialTomorrowPlan = [
  {
    id: 1,
    targetType: 'crusher',
    targetCode: 'CRU-1',
    targetName: 'الكسارة رقم 1 (الشمالية)',
    sector: 'القطعة A',
    currentStatus: 'تشغيل',
    plannedDecision: 'تشغيل مستمر',
    targetQuantity: 900,
    targetUnit: 'طن',
    reason: 'تغذية قطاع الأسفلت وتأمين رصيد الشرشور',
    notes: 'وردية عمل صباحية ومسائية'
  },
  {
    id: 2,
    targetType: 'crusher',
    targetCode: 'CRU-2',
    targetName: 'الكسارة رقم 2 (الوسطى)',
    sector: 'القطعة B',
    currentStatus: 'تشغيل',
    plannedDecision: 'تشغيل',
    targetQuantity: 750,
    targetUnit: 'طن',
    reason: 'استكمال طبقة الأساس الحبيبي',
    notes: 'متابعة حرارة المولد'
  },
  {
    id: 3,
    targetType: 'equipment',
    targetCode: 'EQ-101',
    targetName: 'لودر CAT 966H',
    sector: 'القطعة A',
    currentStatus: 'تشغيل',
    plannedDecision: 'تشغيل',
    targetQuantity: 8,
    targetUnit: 'ساعة',
    reason: 'تحميل الشاحنات وتغذية الكسارة',
    notes: 'السائق: سالم علي'
  },
  {
    id: 4,
    targetType: 'fuel',
    targetCode: 'FUEL-01',
    targetName: 'مخصصات الديزل اليومية',
    sector: 'القطعة A + B',
    currentStatus: 'صرف',
    plannedDecision: 'تخصيص',
    targetQuantity: 4500,
    targetUnit: 'لتر',
    reason: 'تأمين كامل احتياج الآليات والكسارات للغد',
    notes: 'توزيع الحصص على الصهاريج الميدانية'
  }
];

export const initialEquipment = [
  {
    id: 1,
    code: 'EQ-101',
    name: 'لودر CAT 966H',
    type: 'لودر',
    category: 'معدات ثقيلة',
    status: 'operational',
    driver: 'سالم علي',
    location: 'القطعة A - موقع الكسارة',
    dailyHours: 7.5,
    fuelConsumptionRate: 22.0,
    notes: 'حالة ممتازة'
  },
  {
    id: 2,
    code: 'EQ-102',
    name: 'حفار Komatsu PC300',
    type: 'حفار',
    category: 'معدات حفر',
    status: 'operational',
    driver: 'محمد صالح',
    location: 'القطعة A - المقلع',
    dailyHours: 8.0,
    fuelConsumptionRate: 26.0,
    notes: 'عمل متواصل بالمقلع'
  },
  {
    id: 3,
    code: 'EQ-103',
    name: 'جريدر CAT 140K',
    type: 'جريدر',
    category: 'معدات تسوية',
    status: 'maintenance',
    driver: 'خالد أحمد',
    location: 'القطعة B - الورشة',
    dailyHours: 0.0,
    fuelConsumptionRate: 18.0,
    notes: 'صيانة هيدروليكية وتبديل شفرة'
  },
  {
    id: 4,
    code: 'EQ-104',
    name: 'شاحنة مرسيدس Actros (قلاب)',
    type: 'شاحنة نقل',
    category: 'نقل ثقيل',
    status: 'operational',
    driver: 'يوسف عمر',
    location: 'القطعة A - خط النقل',
    dailyHours: 6.5,
    fuelConsumptionRate: 16.0,
    notes: 'نقل الشرشور والركام'
  },
  {
    id: 5,
    code: 'EQ-105',
    name: 'فاردة أسفلت Vögele Super 1800',
    type: 'فاردة أسفلت',
    category: 'معدات رصف',
    status: 'operational',
    driver: 'عمران المهدي',
    location: 'القطعة A - المحطة 52',
    dailyHours: 6.0,
    fuelConsumptionRate: 20.0,
    notes: 'رصف طبقة الأسفلت المحسن'
  },
  {
    id: 6,
    code: 'EQ-106',
    name: 'هراس حديدي Dynapac CC524',
    type: 'هراس',
    category: 'معدات دك',
    status: 'operational',
    driver: 'مصطفى الفيتوري',
    location: 'القطعة A - المحطة 52',
    dailyHours: 7.0,
    fuelConsumptionRate: 14.0,
    notes: 'دك طبقة الأسفلت'
  }
];

export const initialEquipmentList = initialEquipment;

export const initialCrushers = [
  {
    id: 1,
    name: 'الكسارة الرئيسية - أوباري',
    sector: 'القطعة A',
    dailyProductionTons: 850,
    sharshoorTons: 510,
    status: 'operational',
    location: 'أوباري - المقلع الشمالي',
    capacity: 1200,
    efficiency: '92%',
    notes: 'إنتاج ممتاز ومطابق للمواصفات'
  },
  {
    id: 2,
    name: 'الكسارة الشمالية',
    sector: 'القطعة B',
    dailyProductionTons: 620,
    sharshoorTons: 372,
    status: 'operational',
    location: 'غات - المقلع الأوسط',
    capacity: 1000,
    efficiency: '85%',
    notes: 'عمل مستقر'
  }
];

export const initialCrusherStocks = [
  {
    id: 'CS-01',
    name: 'الكسارة الرئيسية - أوباري (القطعة A)',
    sector: 'القطعة A',
    aggregateProductionToday: 850,
    sharshoorProductionToday: 510,
    sharshoorStockAvailable: 12450,
    status: 'operational',
    operatingHours: 8.5
  },
  {
    id: 'CS-02',
    name: 'الكسارة الشمالية (القطعة B)',
    sector: 'القطعة B',
    aggregateProductionToday: 620,
    sharshoorProductionToday: 372,
    sharshoorStockAvailable: 8900,
    status: 'operational',
    operatingHours: 7.0
  }
];

export const initialFuelLogs = [
  {
    id: 1,
    ticketNumber: 'FUEL-9481',
    date: '2026-08-18',
    equipmentName: 'لودر CAT 966H (EQ-101)',
    liters: 180,
    driverName: 'سالم علي',
    pumpOperator: 'فرج مصباح',
    tankSource: 'صهريج القطعة A',
    meterBefore: 14250,
    meterAfter: 14430,
    notes: 'تزويد صباحي كامل'
  },
  {
    id: 2,
    ticketNumber: 'FUEL-9482',
    date: '2026-08-18',
    equipmentName: 'حفار Komatsu PC300 (EQ-102)',
    liters: 220,
    driverName: 'محمد صالح',
    pumpOperator: 'فرج مصباح',
    tankSource: 'صهريج القطعة A',
    meterBefore: 18900,
    meterAfter: 19120,
    notes: 'تزويد المقلع'
  },
  {
    id: 3,
    ticketNumber: 'FUEL-9483',
    date: '2026-08-18',
    equipmentName: 'مولد الكسارة الرئيسية 500kVA',
    liters: 450,
    driverName: 'رمضان السنوسي',
    pumpOperator: 'عادل جمعة',
    tankSource: 'صهريج الكسارة',
    meterBefore: 28400,
    meterAfter: 28850,
    notes: 'تشغيل وردية اليوم'
  },
  {
    id: 4,
    ticketNumber: 'FUEL-9484',
    date: '2026-08-18',
    equipmentName: 'فاردة أسفلت Vögele (EQ-105)',
    liters: 160,
    driverName: 'عمران المهدي',
    pumpOperator: 'فرج مصباح',
    tankSource: 'صهريج القطعة A',
    meterBefore: 8920,
    meterAfter: 9080,
    notes: 'تزويد موقع الرصف'
  }
];

export const initialRoadProgress = [
  {
    id: 1,
    sector: 'القطاع (A)',
    itemName: 'طبقة إعادة التدوير (FDR)',
    category: 'بنود أساسية',
    todayMeters: 600,
    previousMeters: 111643,
    totalMeters: 112243,
    dailyTarget: 500,
    varianceMeters: 100,
    readyLength: 3120,
    notes: 'منفذة فرمة ثانية مع الإسمنت'
  },
  {
    id: 2,
    sector: 'القطاع (A)',
    itemName: 'رش طبقة التشريب (MCO)',
    category: 'بنود أساسية',
    todayMeters: 0,
    previousMeters: 109373,
    totalMeters: 109373,
    dailyTarget: 500,
    varianceMeters: -500,
    readyLength: 5990,
    notes: 'جاهز للرش بعد استكمال الأساس'
  },
  {
    id: 3,
    sector: 'القطاع (A)',
    itemName: 'طبقة الاسفلت المحسن',
    category: 'بنود أساسية',
    todayMeters: 590,
    previousMeters: 106773,
    totalMeters: 107363,
    dailyTarget: 500,
    varianceMeters: 90,
    readyLength: 8000,
    notes: 'توريد وفرش الأسفلت المعتمد'
  },
  {
    id: 4,
    sector: 'القطاع (B)',
    itemName: 'طبقة إعادة التدوير (FDR)',
    category: 'بنود أساسية',
    todayMeters: 460,
    previousMeters: 107500,
    totalMeters: 107960,
    dailyTarget: 500,
    varianceMeters: -40,
    readyLength: 2900,
    notes: 'شركة نيوم - استمرار أعمال التدوير'
  },
  {
    id: 5,
    sector: 'القطاع (B)',
    itemName: 'طبقة أساس حبيبي',
    category: 'بنود إضافية',
    todayMeters: 600,
    previousMeters: 105510,
    totalMeters: 106110,
    dailyTarget: 500,
    varianceMeters: 100,
    readyLength: 4750,
    notes: 'توريد شرشور الكسارات وفرش الأساس'
  }
];
