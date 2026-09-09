export const defaultUsers = [
  { id: 1, name: 'مدير المشروع', username: 'admin', email: 'admin', role: 'مدير المشروع', sector: 'all', createdAt: new Date(), updatedAt: new Date() },
  { id: 2, name: 'مدير القطاعات', username: 'admin_sectors', email: 'admin_sectors', role: 'مدير القطاعات', sector: 'all', createdAt: new Date(), updatedAt: new Date() },
  { id: 3, name: 'مشرف القطاع (A)', username: 'sector_a', email: 'sector_a', role: 'مشرف القطاع (A)', sector: 'القطعة A', createdAt: new Date(), updatedAt: new Date() },
  { id: 4, name: 'مشرف القطاع (B)', username: 'sector_b', email: 'sector_b', role: 'مشرف القطاع (B)', sector: 'القطعة B', createdAt: new Date(), updatedAt: new Date() }
];

export const defaultRoadProgress = [
  { id: 1, sector: 'القطاع (A)', itemName: 'طبقة إعادة التدوير (FDR)', category: 'بنود أساسية', todayMeters: 600, previousMeters: 111643, totalMeters: 112243, dailyTarget: 500, varianceMeters: 100, readyLength: 3120, notes: 'منفذة فرمة ثانية مع الإسمنت' },
  { id: 2, sector: 'القطاع (A)', itemName: 'رش طبقة التشريب (MCO)', category: 'بنود أساسية', todayMeters: 0, previousMeters: 109373, totalMeters: 109373, dailyTarget: 500, varianceMeters: -500, readyLength: 5990, notes: 'جاهز للرش بعد استكمال الأساس' },
  { id: 3, sector: 'القطاع (A)', itemName: 'طبقة الاسفلت المحسن', category: 'بنود أساسية', todayMeters: 590, previousMeters: 106773, totalMeters: 107363, dailyTarget: 500, varianceMeters: 90, readyLength: 8000, notes: 'توريد وفرش الأسفلت المعتمد' },
  { id: 4, sector: 'القطاع (A)', itemName: 'فرمة اولي بدون اسمنت(FDR)', category: 'بنود إضافية', todayMeters: 0, previousMeters: 115363, totalMeters: 115363, dailyTarget: 500, varianceMeters: -500, readyLength: 0, notes: 'مفروم بالكامل' },
  { id: 5, sector: 'القطاع (A)', itemName: 'طبقة أساس حبيبي', category: 'بنود إضافية', todayMeters: 0, previousMeters: 109373, totalMeters: 109373, dailyTarget: 500, varianceMeters: -500, readyLength: 5990, notes: 'مغذي من كسارات القطاع الشمالي' },
  { id: 6, sector: 'القطاع (A)', itemName: 'الطريق الخدمي', category: 'بنود إضافية', todayMeters: 0, previousMeters: 115363, totalMeters: 115363, dailyTarget: 500, varianceMeters: 0, readyLength: 0, notes: 'مفتوح بالكامل بطول 115.3 كم' },
  { id: 7, sector: 'القطاع (B)', itemName: 'طبقة إعادة التدوير (FDR)', category: 'بنود أساسية', todayMeters: 460, previousMeters: 107500, totalMeters: 107960, dailyTarget: 500, varianceMeters: -40, readyLength: 2900, notes: 'شركة نيوم - استمرار أعمال التدوير' },
  { id: 8, sector: 'القطاع (B)', itemName: 'رش طبقة التشريب (MCO)', category: 'بنود أساسية', todayMeters: 0, previousMeters: 104930, totalMeters: 104930, dailyTarget: 500, varianceMeters: -500, readyLength: 5930, notes: 'متابعة نظافة السطح قبل الرش' },
  { id: 9, sector: 'القطاع (B)', itemName: 'طبقة الاسفلت المحسن', category: 'بنود أساسية', todayMeters: 0, previousMeters: 102560, totalMeters: 102560, dailyTarget: 500, varianceMeters: -500, readyLength: 8340, notes: 'تجهيز خلاطة الأسفلت' },
  { id: 10, sector: 'القطاع (B)', itemName: 'فرمة اولي بدون اسمنت(FDR)', category: 'بنود إضافية', todayMeters: 0, previousMeters: 110780, totalMeters: 110780, dailyTarget: 500, varianceMeters: -500, readyLength: 120, notes: 'المتبقي 120 متر فقط' },
  { id: 11, sector: 'القطاع (B)', itemName: 'طبقة أساس حبيبي', category: 'بنود إضافية', todayMeters: 600, previousMeters: 105510, totalMeters: 106110, dailyTarget: 500, varianceMeters: 100, readyLength: 4750, notes: 'توريد شرشور الكسارات وفرش الأساس' },
  { id: 12, sector: 'القطاع (B)', itemName: 'الطريق الخدمي', category: 'بنود إضافية', todayMeters: 0, previousMeters: 110900, totalMeters: 110900, dailyTarget: 500, varianceMeters: 0, readyLength: 0, notes: 'مفتوح بطول 110.9 كم' }
];

export const defaultEquipment = [
  { id: 1, code: 'EQ-101', name: 'لودر CAT 966H', type: 'لودر', category: 'معدات ثقيلة', status: 'operational', driver: 'سالم علي', location: 'القطعة A - موقع الكسارة', dailyHours: 7.5, fuelConsumptionRate: 22.0, notes: 'حالة ممتازة' },
  { id: 2, code: 'EQ-102', name: 'حفار Komatsu PC300', type: 'حفار', category: 'معدات حفر', status: 'operational', driver: 'محمد صالح', location: 'القطعة A - المقلع', dailyHours: 8.0, fuelConsumptionRate: 26.0, notes: 'عمل متواصل بالمقلع' },
  { id: 3, code: 'EQ-103', name: 'جريدر CAT 140K', type: 'جريدر', category: 'معدات تسوية', status: 'maintenance', driver: 'خالد أحمد', location: 'القطعة B - الورشة', dailyHours: 0.0, fuelConsumptionRate: 18.0, notes: 'صيانة هيدروليكية وتبديل شفرة' },
  { id: 4, code: 'EQ-104', name: 'شاحنة مرسيدس Actros (قلاب)', type: 'شاحنة نقل', category: 'نقل ثقيل', status: 'operational', driver: 'يوسف عمر', location: 'القطعة A - خط النقل', dailyHours: 6.5, fuelConsumptionRate: 16.0, notes: 'نقل الشرشور والركام' },
  { id: 5, code: 'EQ-105', name: 'فاردة أسفلت Vögele Super 1800', type: 'فاردة أسفلت', category: 'معدات رصف', status: 'operational', driver: 'عمران المهدي', location: 'القطعة A - المحطة 52', dailyHours: 6.0, fuelConsumptionRate: 20.0, notes: 'رصف طبقة الأسفلت المحسن' },
  { id: 6, code: 'EQ-106', name: 'هراس حديدي Dynapac CC524', type: 'هراس', category: 'معدات دك', status: 'operational', driver: 'مصطفى الفيتوري', location: 'القطعة A - المحطة 52', dailyHours: 7.0, fuelConsumptionRate: 14.0, notes: 'دك طبقة الأسفلت' }
];

export const defaultCrushers = [
  { id: 1, name: 'الكسارة الرئيسية - أوباري', sector: 'القطعة A', dailyProductionTons: 850, sharshoorTons: 510, notes: 'إنتاج مطابق للمواصفات', createdAt: new Date() },
  { id: 2, name: 'الكسارة الشمالية', sector: 'القطعة B', dailyProductionTons: 620, sharshoorTons: 372, notes: 'عمل مستقر', createdAt: new Date() }
];

export const defaultFuelDispatches = [
  { id: 1, ticketNumber: 'FUEL-9481', date: new Date(), equipmentName: 'لودر CAT 966H (EQ-101)', liters: 180, driverName: 'سالم علي', pumpOperator: 'فرج مصباح', tankSource: 'صهريج القطعة A', meterBefore: 14250, meterAfter: 14430, notes: 'تزويد صباحي كامل' },
  { id: 2, ticketNumber: 'FUEL-9482', date: new Date(), equipmentName: 'حفار Komatsu PC300 (EQ-102)', liters: 220, driverName: 'محمد صالح', pumpOperator: 'فرج مصباح', tankSource: 'صهريج القطعة A', meterBefore: 18900, meterAfter: 19120, notes: 'تزويد المقلع' },
  { id: 3, ticketNumber: 'FUEL-9483', date: new Date(), equipmentName: 'مولد الكسارة الرئيسية 500kVA', liters: 450, driverName: 'رمضان السنوسي', pumpOperator: 'عادل جمعة', tankSource: 'صهريج الكسارة', meterBefore: 28400, meterAfter: 28850, notes: 'تشغيل وردية اليوم' },
  { id: 4, ticketNumber: 'FUEL-9484', date: new Date(), equipmentName: 'فاردة أسفلت Vögele (EQ-105)', liters: 160, driverName: 'عمران المهدي', pumpOperator: 'فرج مصباح', tankSource: 'صهريج القطعة A', meterBefore: 8920, meterAfter: 9080, notes: 'تزويد موقع الرصف' }
];

export const defaultSharshoor = [
  { id: 1, sector: 'القطعة A', crusher: 'الكسارة الرئيسية - أوباري', amountTons: 510, truckCode: 'TRK-01', destination: 'موقع الخلطة الإسفلتية - المحطة 52', notes: 'توريد شرشور ناعم', createdAt: new Date() },
  { id: 2, sector: 'القطعة B', crusher: 'الكسارة الشمالية', amountTons: 372, truckCode: 'TRK-02', destination: 'موقع طبقة الأساس الحبيبي - المحطة 110', notes: 'توريد ركام متدرج', createdAt: new Date() }
];

export const defaultAlerts = [
  { id: 1, type: 'warning', title: 'تنبيه استهلاك السولار - القطعة A', message: 'ارتفاع معدل استهلاك الديزل في الحفار CAT 336D بنسبة 12% عن المعدل الطبيعي.', isRead: false, createdAt: new Date() },
  { id: 2, type: 'danger', title: 'صيانة دورية عاجلة - جريدر CAT 140K', message: 'توقف الجريدر كود (EQ-103) بالمحطة 62+500 لتبديل سكينة التسوية والسيور.', isRead: false, createdAt: new Date() },
  { id: 3, type: 'info', title: 'وصول صهريج وقود جديد', message: 'تم استلام وتفريغ صهريج ديزل سعة 30,000 لتر في الخزان الرئيسي بالقطاع الشمالي.', isRead: true, createdAt: new Date() }
];
