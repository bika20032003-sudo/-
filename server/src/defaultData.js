export const defaultUsers = [
  { id: 1, name: 'م. حساب التطوير', username: 'admin', email: 'dev@mot.gov.ly', phone: '091-2345678', role: 'حساب التطوير', title: 'حساب التطوير والإشراف البرمجي الكامل', sector: 'all', createdAt: new Date(), updatedAt: new Date() },
  { id: 2, name: 'م. عبدالسلام ابريكاو', username: 'abrikaw', email: 'abrikaw@mot.gov.ly', phone: '091-3456789', role: 'رئيس جهاز الإشراف', title: 'رئيس جهاز الإشراف والمتابعة', sector: 'all', createdAt: new Date(), updatedAt: new Date() },
  { id: 3, name: 'م. صالح حماد', username: 'saleh_quality', email: 'hammad.quality@mot.gov.ly', phone: '091-4567890', role: 'مسؤول الجودة', title: 'مسؤول ضبط ومراقبة الجودة الفنية', sector: 'all', createdAt: new Date(), updatedAt: new Date() },
  { id: 4, name: 'م. صلاح العربي', username: 'salah_alarabi', email: 'alarabi.phase1@mot.gov.ly', phone: '091-5678901', role: 'مهندس مشرف (المرحلة الأولى)', title: 'مهندس مشرف - المرحلة الأولى', sector: 'المرحلة الأولى', createdAt: new Date(), updatedAt: new Date() },
  { id: 5, name: 'م. عيسى الطاهر', username: 'issa_altahir', email: 'altahir.phase2@mot.gov.ly', phone: '091-6789012', role: 'مهندس مشرف (المرحلة الثانية)', title: 'مهندس مشرف - المرحلة الثانية', sector: 'المرحلة الثانية', createdAt: new Date(), updatedAt: new Date() },
  { id: 6, name: 'م. عبدالرحمن الأنصاري', username: 'project_manager', email: 'alansari@mot.gov.ly', phone: '091-2345678', role: 'مدير المشروع', title: 'مدير المشروع (جهاز الإشراف)', sector: 'all', createdAt: new Date(), updatedAt: new Date() }
];

export const defaultRoadProgress = [
  // Phase 1 (المرحلة الأولى - محطة 000+00 إلى 083+226 بطول 226.08 كم - منجزة 100%)
  { id: 1, sector: 'المرحلة الأولى', itemName: 'طبقة إعادة التدوير (FDR)', category: 'بنود أساسية', todayMeters: 0, previousMeters: 226083, totalMeters: 226083, dailyTarget: 800, varianceMeters: 0, readyLength: 0, notes: 'مكتملة بالكامل بالمرحلة الأولى' },
  { id: 2, sector: 'المرحلة الأولى', itemName: 'رش طبقة التشريب (MCO)', category: 'بنود أساسية', todayMeters: 0, previousMeters: 226083, totalMeters: 226083, dailyTarget: 800, varianceMeters: 0, readyLength: 0, notes: 'مكتملة بالكامل بالمرحلة الأولى' },
  { id: 3, sector: 'المرحلة الأولى', itemName: 'طبقة الاسفلت المحسن', category: 'بنود أساسية', todayMeters: 0, previousMeters: 226083, totalMeters: 226083, dailyTarget: 800, varianceMeters: 0, readyLength: 0, notes: 'مكتملة بالكامل بالمرحلة الأولى' },
  { id: 4, sector: 'المرحلة الأولى', itemName: 'فرمة اولي بدون اسمنت(FDR)', category: 'بنود إضافية', todayMeters: 0, previousMeters: 226083, totalMeters: 226083, dailyTarget: 800, varianceMeters: 0, readyLength: 0, notes: 'مكتملة بالكامل بالمرحلة الأولى' },
  { id: 5, sector: 'المرحلة الأولى', itemName: 'طبقة أساس حبيبي', category: 'بنود إضافية', todayMeters: 0, previousMeters: 226083, totalMeters: 226083, dailyTarget: 800, varianceMeters: 0, readyLength: 0, notes: 'مكتملة بالكامل بالمرحلة الأولى' },
  { id: 6, sector: 'المرحلة الأولى', itemName: 'الطريق الخدمي', category: 'بنود إضافية', todayMeters: 0, previousMeters: 226218, totalMeters: 226218, dailyTarget: 800, varianceMeters: 0, readyLength: 0, notes: 'مكتملة بالكامل بالمرحلة الأولى' },
  // Phase 2 (المرحلة الثانية - محطة 083+226 إلى 000+360 بطول 133.92 كم - قيد التنفيذ)
  { id: 7, sector: 'المرحلة الثانية', itemName: 'طبقة إعادة التدوير (FDR)', category: 'بنود أساسية', todayMeters: 1220, previousMeters: 15020, totalMeters: 16240, dailyTarget: 800, varianceMeters: 420, readyLength: 30, notes: 'منجز معتمد بالتقرير اليومي' },
  { id: 8, sector: 'المرحلة الثانية', itemName: 'رش طبقة التشريب (MCO)', category: 'بنود أساسية', todayMeters: 460, previousMeters: 9950, totalMeters: 10410, dailyTarget: 800, varianceMeters: -340, readyLength: 0, notes: 'منجز معتمد بالتقرير اليومي' },
  { id: 9, sector: 'المرحلة الثانية', itemName: 'طبقة الاسفلت المحسن', category: 'بنود أساسية', todayMeters: 1140, previousMeters: 7020, totalMeters: 8160, dailyTarget: 800, varianceMeters: 340, readyLength: 2268, notes: 'منجز معتمد بالتقرير اليومي' },
  { id: 10, sector: 'المرحلة الثانية', itemName: 'فرمة اولي بدون اسمنت(FDR)', category: 'بنود إضافية', todayMeters: 500, previousMeters: 15710, totalMeters: 16210, dailyTarget: 800, varianceMeters: -300, readyLength: 0, notes: 'منجز معتمد بالتقرير اليومي' },
  { id: 11, sector: 'المرحلة الثانية', itemName: 'طبقة أساس حبيبي', category: 'بنود إضافية', todayMeters: 500, previousMeters: 9910, totalMeters: 10410, dailyTarget: 800, varianceMeters: -300, readyLength: 5717, notes: 'منجز معتمد بالتقرير اليومي' },
  { id: 12, sector: 'المرحلة الثانية', itemName: 'الطريق الخدمي', category: 'بنود إضافية', todayMeters: 0, previousMeters: 15230, totalMeters: 15230, dailyTarget: 800, varianceMeters: 0, readyLength: 0, notes: 'منجز معتمد بالتقرير اليومي' }
];

export const defaultEquipment = [
  // 1. ماكينه FDR (3 ماكينات)
  {
    id: 1,
    code: 'FDR-01',
    name: 'ماكينة إعادة التدوير FDR-01',
    type: 'ماكينة FDR',
    category: 'معدات ثقيلة',
    status: 'operational',
    driver: 'فرج المهدي',
    location: 'مسار FDR - المرحلة الأولى',
    dailyHours: 8,
    fuelConsumptionRate: 38,
    notes: 'ماكينة رئيسية لفرم وتدوير طبقة الأساس'
  },
  {
    id: 2,
    code: 'FDR-02',
    name: 'ماكينة إعادة التدوير FDR-02',
    type: 'ماكينة FDR',
    category: 'معدات ثقيلة',
    status: 'operational',
    driver: 'رمضان الورفلي',
    location: 'مسار FDR - المرحلة الأولى',
    dailyHours: 8,
    fuelConsumptionRate: 38,
    notes: 'ماكينة فرم وتأهيل الأسفلت'
  },
  {
    id: 3,
    code: 'FDR-03',
    name: 'ماكينة إعادة التدوير FDR-03',
    type: 'ماكينة FDR',
    category: 'معدات ثقيلة',
    status: 'operational',
    driver: 'علي التواتي',
    location: 'مسار FDR - المرحلة الثانية',
    dailyHours: 8,
    fuelConsumptionRate: 38,
    notes: 'جاهزة للتشغيل الميداني'
  },

  // 2. جريدر (2 جريدر)
  {
    id: 4,
    code: 'GRD-01',
    name: 'جريدر تسوية تمهيدي 01 (كاتربيلر)',
    type: 'جريدر',
    category: 'معدات ثقيلة',
    status: 'operational',
    driver: 'ناصر القذافي',
    location: 'مسار المرحلة الأولى',
    dailyHours: 8,
    fuelConsumptionRate: 22,
    notes: 'تسوية طبقة الفرمة والأساس'
  },
  {
    id: 5,
    code: 'GRD-02',
    name: 'جريدر تسوية وضبط مناسيب 02',
    type: 'جريدر',
    category: 'معدات ثقيلة',
    status: 'operational',
    driver: 'محمود الزوي',
    location: 'مسار المرحلة الثانية',
    dailyHours: 8,
    fuelConsumptionRate: 22,
    notes: 'ضبط الميول والمناسيب الهندسية'
  },

  // 3. هراس حافر غنم (3 هراسات)
  {
    id: 6,
    code: 'SHP-01',
    name: 'هراس حافر غنم 01 (دك عميق)',
    type: 'هراس حافر غنم',
    category: 'معدات دك',
    status: 'operational',
    driver: 'سالم المقرحي',
    location: 'قطاع الفرمة FDR - المرحلة الأولى',
    dailyHours: 8,
    fuelConsumptionRate: 18,
    notes: 'دك أولي لطبقة الفرمة بدون أسمنت'
  },
  {
    id: 7,
    code: 'SHP-02',
    name: 'هراس حافر غنم 02 (دك عميق)',
    type: 'هراس حافر غنم',
    category: 'معدات دك',
    status: 'operational',
    driver: 'خالد الفيتوري',
    location: 'قطاع الفرمة FDR - المرحلة الأولى',
    dailyHours: 8,
    fuelConsumptionRate: 18,
    notes: 'دمك الطبقة المعاد تدويرها'
  },
  {
    id: 8,
    code: 'SHP-03',
    name: 'هراس حافر غنم 03 (دك عميق)',
    type: 'هراس حافر غنم',
    category: 'معدات دك',
    status: 'operational',
    driver: 'يوسف الكيلاني',
    location: 'قطاع الفرمة FDR - المرحلة الثانية',
    dailyHours: 8,
    fuelConsumptionRate: 18,
    notes: 'دمك مسار التدوير'
  },

  // 4. هراس تربه (3 هراسات)
  {
    id: 9,
    code: 'CMP-01',
    name: 'هراس تربة ناعم 01 (Smooth Drum)',
    type: 'هراس تربه',
    category: 'معدات دك',
    status: 'operational',
    driver: 'طارق الشريف',
    location: 'مسار المرحلة الأولى',
    dailyHours: 8,
    fuelConsumptionRate: 16,
    notes: 'دمك نهائي وتثبيت السطح'
  },
  {
    id: 10,
    code: 'CMP-02',
    name: 'هراس تربة ناعم 02 (Smooth Drum)',
    type: 'هراس تربه',
    category: 'معدات دك',
    status: 'operational',
    driver: 'مصطفى الهمالي',
    location: 'مسار المرحلة الأولى',
    dailyHours: 8,
    fuelConsumptionRate: 16,
    notes: 'دمك طبقة الأساس الحبيبي'
  },
  {
    id: 11,
    code: 'CMP-03',
    name: 'هراس تربة ناعم 03 (Smooth Drum)',
    type: 'هراس تربه',
    category: 'معدات دك',
    status: 'operational',
    driver: 'هشام البدري',
    location: 'مسار المرحلة الثانية',
    dailyHours: 8,
    fuelConsumptionRate: 16,
    notes: 'دمك وتجهيز الطبقة للرش'
  },

  // 5. تانك مياه (7 صهاريج)
  {
    id: 12,
    code: 'WT-01',
    name: 'تانك مياه ميداني 01 (صهريج تغذية)',
    type: 'تانك مياه',
    category: 'شاحنات صهريج',
    status: 'operational',
    driver: 'إبراهيم بن علي',
    location: 'محطة تغذية ماكينة FDR',
    dailyHours: 8,
    fuelConsumptionRate: 14,
    notes: 'تغذية مستمرة لماكينة FDR رقم 1'
  },
  {
    id: 13,
    code: 'WT-02',
    name: 'تانك مياه ميداني 02 (صهريج تغذية)',
    type: 'تانك مياه',
    category: 'شاحنات صهريج',
    status: 'operational',
    driver: 'عبدالحميد السنوسي',
    location: 'محطة تغذية ماكينة FDR',
    dailyHours: 8,
    fuelConsumptionRate: 14,
    notes: 'تغذية مستمرة لماكينة FDR رقم 2'
  },
  {
    id: 14,
    code: 'WT-03',
    name: 'تانك مياه ميداني 03 (رش وترطيب)',
    type: 'تانك مياه',
    category: 'شاحنات صهريج',
    status: 'operational',
    driver: 'صلاح الترهوني',
    location: 'مسار المرحلة الأولى',
    dailyHours: 8,
    fuelConsumptionRate: 14,
    notes: 'رش رطوبة دمك الأساس'
  },
  {
    id: 15,
    code: 'WT-04',
    name: 'تانك مياه ميداني 04 (رش وترطيب)',
    type: 'تانك مياه',
    category: 'شاحنات صهريج',
    status: 'operational',
    driver: 'عادل المنفي',
    location: 'مسار المرحلة الثانية',
    dailyHours: 8,
    fuelConsumptionRate: 14,
    notes: 'رش ترطيب الفرمة'
  },
  {
    id: 16,
    code: 'WT-05',
    name: 'تانك مياه ميداني 05 (صهريج تزويد)',
    type: 'تانك مياه',
    category: 'شاحنات صهريج',
    status: 'operational',
    driver: 'بشير الصادق',
    location: 'مسار المرحلة الثانية',
    dailyHours: 8,
    fuelConsumptionRate: 14,
    notes: 'تزويد ماكينات FDR'
  },
  {
    id: 17,
    code: 'WT-06',
    name: 'تانك مياه ميداني 06 (خدمي)',
    type: 'تانك مياه',
    category: 'شاحنات صهريج',
    status: 'operational',
    driver: 'سعد الحاسي',
    location: 'قطاع الكسارات والخلط',
    dailyHours: 8,
    fuelConsumptionRate: 14,
    notes: 'تزويد ورش المياه بالموقع'
  },
  {
    id: 18,
    code: 'WT-07',
    name: 'تانك مياه ميداني 07 (احتياطي ميداني)',
    type: 'تانك مياه',
    category: 'شاحنات صهريج',
    status: 'operational',
    driver: 'ميلاد المجبري',
    location: 'المستودع الرئيسي',
    dailyHours: 8,
    fuelConsumptionRate: 14,
    notes: 'جاهزية دعم فوري للمسار'
  },

  // 6. لودر (1 لودر)
  {
    id: 19,
    code: 'LDR-01',
    name: 'لودر كوماتسو WA380 (تشوين ومناولة)',
    type: 'لودر',
    category: 'معدات ثقيلة',
    status: 'operational',
    driver: 'عمر الدرسي',
    location: 'موقع الفرمة والتشوين',
    dailyHours: 8,
    fuelConsumptionRate: 24,
    notes: 'مناولة الركام ومواد الفرمة'
  },

  // 7. قلابات (1 قلاب)
  {
    id: 20,
    code: 'TRK-01',
    name: 'شاحنة نقل قلاب مرسيدس أكتروس',
    type: 'قلابات',
    category: 'شاحنات نقل',
    status: 'operational',
    driver: 'محمد الفرجاني',
    location: 'مسار الطريق والتشوين',
    dailyHours: 8,
    fuelConsumptionRate: 18,
    notes: 'نقل وتوزيع مواد الردم والأساس'
  },

  // 8. ماسينزا (1 ماسينزا)
  {
    id: 21,
    code: 'MSZ-01',
    name: 'شاحنة رش الأسفلت ماسينزا (MCO Spreader)',
    type: 'ماسينزا',
    category: 'معدات رش أسفلت',
    status: 'operational',
    driver: 'سراج المريمي',
    location: 'قطاع رش التشريب MCO',
    dailyHours: 8,
    fuelConsumptionRate: 16,
    notes: 'رش طبقة التشريب والأسفلت السائل'
  },

  // 9. جرار زراعي (1 جرار)
  {
    id: 22,
    code: 'TRC-01',
    name: 'جرار زراعي خدمي وسحب ميداني',
    type: 'جرار زراعي',
    category: 'آليات مساعدة',
    status: 'operational',
    driver: 'عبدالسلام المبروك',
    location: 'مسار الطريق العام',
    dailyHours: 8,
    fuelConsumptionRate: 10,
    notes: 'أعمال مساعدة وسحب المعدات بالمسار'
  },

  // 10. عدد 3 طاقم مساحة (6 أفراد / 3 وحدات مساحية)
  {
    id: 23,
    code: 'SRV-01',
    name: 'طاقم مساحة رقم 1 (جهاز Total Station + GPS)',
    type: 'طاقم مساحة',
    category: 'أجهزة مساحة وهندسة',
    status: 'operational',
    driver: 'م. أحمد الساعدي (رئيس الطاقم) + فني',
    location: 'مسار المرحلة الأولى',
    dailyHours: 8,
    fuelConsumptionRate: 0,
    notes: 'طاقم مساحة متكامل (شخصين) لضبط المناسيب'
  },
  {
    id: 24,
    code: 'SRV-02',
    name: 'طاقم مساحة رقم 2 (جهاز Total Station + GPS)',
    type: 'طاقم مساحة',
    category: 'أجهزة مساحة وهندسة',
    status: 'operational',
    driver: 'م. خليل الورفلي (رئيس الطاقم) + فني',
    location: 'مسار المرحلة الثانية',
    dailyHours: 8,
    fuelConsumptionRate: 0,
    notes: 'طاقم مساحة متكامل (شخصين) لضبط المسار'
  },
  {
    id: 25,
    code: 'SRV-03',
    name: 'طاقم مساحة رقم 3 (جهاز ميزان قامة + GPS)',
    type: 'طاقم مساحة',
    category: 'أجهزة مساحة وهندسة',
    status: 'operational',
    driver: 'م. معتز الفاخري (رئيس الطاقم) + فني',
    location: 'نقاط الربط والمناسيب الهندسية',
    dailyHours: 8,
    fuelConsumptionRate: 0,
    notes: 'طاقم مساحة متكامل (شخصين) للتأكيد والتدقيق'
  }
];
export const defaultCrushers = [];
export const defaultFuelDispatches = [];
export const defaultSharshoor = [];
export const defaultAlerts = [];
