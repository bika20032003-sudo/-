// Mock REST API Service for Ubari - Ghat 360km Road Project

const initialSectors = [
  {
    id: 'SEC-01',
    name: 'القطاع الأول: أوباري - الفيوات',
    lengthKm: 85,
    progress: 84,
    contractor: 'شركة السهل الصحراوي للمقاولات العامة',
    contractorLogo: '🏗️',
    residentEngineer: 'م. عبد السلام الفزاني',
    status: 'متقدم جداً',
    statusColor: 'emerald',
    asphaltThicknessCm: 12,
    solarPolesInstalled: 640,
    machineryCount: 38,
    activeWorkers: 115,
    notes: 'تم الانتهاء من الطبقة الرابطة وجاري استكمال الرصف النهائي للطبقة السطحية.',
    image: '/road-asphalt-paver.jpg'
  },
  {
    id: 'SEC-02',
    name: 'القطاع الثاني: الفيوات - العوينات',
    lengthKm: 95,
    progress: 72,
    contractor: 'شركة الهضبة لإعادة الإعمار والطرق',
    contractorLogo: '🛣️',
    residentEngineer: 'م. طارق المحجوب',
    status: 'وفق الجدول الزمني',
    statusColor: 'amber',
    asphaltThicknessCm: 10,
    solarPolesInstalled: 480,
    machineryCount: 42,
    activeWorkers: 130,
    notes: 'أعمال دمك الأسفلت وتوسعة الأكتاف وقنوات تصريف مياه الأمطار في أودية العوينات.',
    image: '/road-rollers-compaction.jpg'
  },
  {
    id: 'SEC-03',
    name: 'القطاع الثالث: العوينات - البركت',
    lengthKm: 100,
    progress: 61,
    contractor: 'شركة الأفق الوطني للإنشاءات الهندسية',
    contractorLogo: '🚧',
    residentEngineer: 'م. سالم التواتي',
    status: 'جار الرصف والتأسيس',
    statusColor: 'blue',
    asphaltThicknessCm: 8,
    solarPolesInstalled: 320,
    machineryCount: 36,
    activeWorkers: 98,
    notes: 'تسوية الأساس الحجري بالكاشطات الموتورية وإزالة الرمال الزاحفة وإعادة التأسيس.',
    image: '/road-grader-earthwork.jpg'
  },
  {
    id: 'SEC-04',
    name: 'القطاع الرابع: البركت - غات (المدخل التاريخي)',
    lengthKm: 80,
    progress: 55,
    contractor: 'شركة الجنوب للمشاريع الكبرى والجسور',
    contractorLogo: '🏛️',
    residentEngineer: 'م. علي الغاتي',
    status: 'تحت التنفيذ المكثف',
    statusColor: 'purple',
    asphaltThicknessCm: 7,
    solarPolesInstalled: 290,
    machineryCount: 26,
    activeWorkers: 85,
    notes: 'تركيب أعمدة الإنارة بالطاقة الشمسية واستكمال رصف المسارات المزدوجة بمدخل غات.',
    image: '/road-solar-lighting.jpg'
  }
];

const initialSummary = {
  projectTitle: 'مشروع صيانة طريق أوباري - غات',
  agency: 'جهاز تنفيذ مشروعات المواصلات',
  initiative: 'خطة عودة الحياة 🇱🇾',
  totalLengthKm: 360,
  overallProgress: 68.5,
  plannedProgress: 70.0,
  totalBudgetLyd: 145000000,
  spentBudgetLyd: 99325000,
  activeContractorsCount: 4,
  totalFleetMachinery: 142,
  totalWorkforce: 428,
  asphaltPavedKm: 246.6,
  solarPolesTotal: 1730,
  lastUpdated: new Date().toISOString()
};

const initialContractors = [
  {
    id: 'CONT-101',
    name: 'شركة السهل الصحراوي للمقاولات العامة',
    sector: 'القطاع الأول (أوباري - الفيوات)',
    contractValue: '38,500,000 د.ل',
    completion: 84,
    machinery: [
      { type: 'فرادة أسفلت Vögele Super 1800', count: 4, status: 'عمليات رصف' },
      { type: 'دكّاكات أسفلت Dynapac & CAT', count: 12, status: 'عمليات رصف' },
      { type: 'شاحنات نقل أسفلت حامي', count: 18, status: 'نقل مستمر' }
    ],
    qualityScore: '98.5%'
  },
  {
    id: 'CONT-102',
    name: 'شركة الهضبة لإعادة الإعمار والطرق',
    sector: 'القطاع الثاني (الفيوات - العوينات)',
    contractValue: '42,000,000 د.ل',
    completion: 72,
    machinery: [
      { type: 'جريـدرات كاترپيلار CAT 140K', count: 6, status: 'تسوية وتمهيد' },
      { type: 'فرادات أسفلت ألمانية', count: 3, status: 'رصف' },
      { type: 'شاحنات خلط وإرشادات', count: 20, status: 'عمليات ميدانية' }
    ],
    qualityScore: '96.2%'
  },
  {
    id: 'CONT-103',
    name: 'شركة الأفق الوطني للإنشاءات الهندسية',
    sector: 'القطاع الثالث (العوينات - البركت)',
    contractValue: '39,000,000 د.ل',
    completion: 61,
    machinery: [
      { type: 'كشاطات أسفلت Wirtgen Cold Milling', count: 3, status: 'إزالة أسفلت متهالك' },
      { type: 'محطة خلط أسفلت مركزية', count: 1, status: 'إنتاج 240 طن/ساعة' },
      { type: 'دكّاكات وشاحنات', count: 24, status: 'شغال' }
    ],
    qualityScore: '95.8%'
  },
  {
    id: 'CONT-104',
    name: 'شركة الجنوب للمشاريع الكبرى والجسور',
    sector: 'القطاع الرابع (البركت - غات)',
    contractValue: '25,500,000 د.ل',
    completion: 55,
    machinery: [
      { type: 'حفارات ورافعات جسور', count: 8, status: 'بناء عبّارات السيول' },
      { type: 'فرادة أسفلت ومعدات إنارة', count: 12, status: 'تركيب أعمدة شمسية' }
    ],
    qualityScore: '97.0%'
  }
];

const initialDocuments = [
  {
    id: 'DOC-2026-08',
    title: 'التقرير التنفيذي الشهري الشامل - أغسطس 2026',
    category: 'تقارير الإنجاز',
    date: '2026-08-10',
    size: '4.8 MB',
    author: 'إدارة المشروعات - جهاز تنفيذ مشروعات المواصلات',
    type: 'PDF'
  },
  {
    id: 'DOC-QA-04',
    title: 'محضر اختبارات الجودة وكثافة الأسفلت (اختبار مارشال)',
    category: 'ضبط الجودة المعملي',
    date: '2026-08-08',
    size: '2.3 MB',
    author: 'المختبر المركزي لاختبارات الطرق والجسور',
    type: 'PDF'
  },
  {
    id: 'DOC-ENV-02',
    title: 'خطة حماية الطريق من زحف الرمال والعواصف الترابية',
    category: 'الدراسات البيئية',
    date: '2026-07-28',
    size: '6.1 MB',
    author: 'اللجنة الفنية لحماية البيئة الصحراوية',
    type: 'PDF'
  },
  {
    id: 'DOC-FIN-Q2',
    title: 'جدول المستخلصات المالية المستحقة للشركات المنفذة Q2',
    category: 'المالية والمستخلصات',
    date: '2026-08-01',
    size: '1.9 MB',
    author: 'الإدارة المالية - الجهاز',
    type: 'PDF'
  }
];

const API_BASE_URL = 'http://localhost:5000/api';

export const fetchProjectSummary = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/summary`);
    if (res.ok) return await res.json();
  } catch (e) {
    // MySQL Server offline, use mock engine
  }
  await new Promise(r => setTimeout(r, 150));
  return initialSummary;
};

export const fetchSectors = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/sectors`);
    if (res.ok) return await res.json();
  } catch (e) {
    // MySQL Server offline, use mock engine
  }
  await new Promise(r => setTimeout(r, 150));
  return initialSectors;
};

export const fetchContractors = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/contractors`);
    if (res.ok) return await res.json();
  } catch (e) {
    // MySQL Server offline, use mock engine
  }
  await new Promise(r => setTimeout(r, 150));
  return initialContractors;
};

const initialFieldPhotos = [
  {
    id: 'PH-01',
    title: 'آليات رصف الأسفلت الساخن Vögele ومتابعة درجات الحرارة',
    titleEn: 'Vögele Hot Asphalt Paver Fleet & Bitumen Temperature Control',
    sector: 'القطاع الأول (أوباري - الفيوات)',
    desc: 'عمليات مد ورصف الطبقة السطحية الرابطة ومتابعة درجة حرارة الخلطة الإسفلتية المعتمدة (160°C) في الموقع لضمان أعلى جودة.',
    src: '/road-asphalt-paver.jpg',
    category: 'رصف الأسفلت',
    date: '2026-08-16',
    author: 'م. عبد السلام الفزاني'
  },
  {
    id: 'PH-02',
    title: 'دمك الأسفلت بالمداحل الأسطوانية والمطاطية مع الرفع المساحي',
    titleEn: 'Heavy Steel & Pneumatic Rollers Compaction with Survey Station',
    sector: 'القطاع الثاني (الفيوات - العوينات)',
    desc: 'تشغيل أسطول المداحل الاهتزازية Dynapac & CAT للدمك النهائي وتحديد المناسيب عبر المحطة المساحية التوتال ستيشن.',
    src: '/road-rollers-compaction.jpg',
    category: 'الدمك وضبط المناسيب',
    date: '2026-08-14',
    author: 'م. طارق المحجوب'
  },
  {
    id: 'PH-03',
    title: 'تسوية الأساس الحجري بالكاشطات الموتورية وصهاريج الرش',
    titleEn: 'Aggregate Sub-base Grading, Compaction & Water Spraying',
    sector: 'القطاع الثالث (العوينات - البركت)',
    desc: 'تسوية وضبط سمك طبقة الأساس الحجرية المكسورة وتوزيع الشاحنات وصهاريج رش المياه قبل الرصف.',
    src: '/road-grader-earthwork.jpg',
    category: 'كشط وتأسيس',
    date: '2026-08-11',
    author: 'م. سالم التواتي'
  },
  {
    id: 'PH-04',
    title: 'تركيب وتشغيل منظومة الإنارة الذكية بالطاقة الشمسية وتخطيط المسار',
    titleEn: 'Smart Dual-Arm Solar Highway Lighting & Road Markings',
    sector: 'القطاع الرابع (البركت - غات)',
    desc: 'تثبيت أعمدة الإنارة المزدوجة بالطاقة الشمسية المقاومة للرياح الصحراوية وتخطيط مسارات الطريق بالدهان الحراري العاكس.',
    src: '/road-solar-lighting.jpg',
    category: 'الطاقة الشمسية والإنارة',
    date: '2026-08-09',
    author: 'م. علي الغاتي'
  },
  {
    id: 'PH-05',
    title: 'فحص عينات الكور الإسفلتي واختبارات الدمك ومطابقة الجودة',
    titleEn: 'Marshall Asphalt Core QA Inspection & Density Testing',
    sector: 'مختبر الجودة الميداني - أوباري',
    desc: 'سحب وفحص عينات الكور الإسفلتي باستخدام أجهزة القياس الرقمية والمختبر الميداني المتنقل للتأكد من مطابقة المواصفات.',
    src: '/road-qa-testing-core.jpg',
    category: 'ضبط الجودة المعملي',
    date: '2026-08-07',
    author: 'المختبر المركزي'
  },
  {
    id: 'PH-06',
    title: 'مشهد جوي بانورامي لمسار الطريق الصحراوي المعبد وأسطول الآليات',
    titleEn: 'Aerial Drone View of Desert Highway Paving Train Corridor',
    sector: 'مسار طريق أوباري – غات الدولي (360 كم)',
    desc: 'توثيق جوي شامل لحركة قطار الرصف والآليات والشاحنات على امتداد الطريق المخترق للكثبان الرملية الذهبية بالجنوب الليبي.',
    src: '/road-aerial-highway.jpg',
    category: 'توثيق جوي بانورامي',
    date: '2026-08-05',
    author: 'ديوان جهاز المواصلات'
  }
];

export const nationalProjects = [
  {
    id: 'PRJ-UBG-360',
    title: 'مشروع صيانة ورصف طريق أوباري – غات (المسار الرئيسي)',
    titleEn: 'Ubari – Ghat Main Highway Paving & Upgrade',
    region: 'فزان (أوباري - غات 360 كم)',
    regionEn: 'Fezzan (Ubari – Ghat 360km)',
    lengthKm: 360,
    progress: 68.5,
    status: 'in_progress',
    statusLabel: 'جاري التنفيذ',
    statusLabelEn: 'In Progress',
    statusColor: 'emerald',
    budget: '145,000,000 د.ل',
    contractor: 'ائتلاف شركات الطرق الوطنية وفزان',
    startDate: 'يناير 2025',
    targetDate: 'ديسمبر 2026',
    image: '/road-aerial-highway.jpg',
    coords: { x: 22, y: 72 },
    realCoords: '26.5925,12.7803',
    desc: 'إعادة إعمار وتوسعة الشريان البري الاستراتيجي بطول 360 كم مقسم إلى 4 قطاعات رئيسية مع تطبيق أحدث معايير الرصف ومقاومة درجات الحرارة.',
    specs: {
      thickness: '10-12 سم',
      paved: '246.6 كم',
      solarPoles: 760,
      fleet: 142,
      qualityScore: '98.4%'
    }
  },
  {
    id: 'PRJ-UBG-SOL-1100',
    title: 'مشروع إنارة مسار أوباري – غات بالطاقة الشمسية الذكية',
    titleEn: 'Ubari – Ghat Highway Smart Solar Lighting System',
    region: 'مسار الطريق (360 كم)',
    regionEn: 'Corridor Route (360km)',
    lengthKm: 360,
    progress: 69.1,
    status: 'in_progress',
    statusLabel: 'متقدم جداً',
    statusLabelEn: 'Advanced Stage',
    statusColor: 'emerald',
    budget: '24,500,000 د.ل',
    contractor: 'الشركة الوطنية لحلول الطاقات المتجددة',
    startDate: 'أبريل 2025',
    targetDate: 'أكتوبر 2026',
    image: '/road-solar-lighting.jpg',
    coords: { x: 24, y: 74 },
    realCoords: '26.1200,12.1100',
    desc: 'توريد وتركيب 1,100 عمود إنارة ذكي مدعوم بألواح شمسية وبطاريات ليثيوم لتأمين الرؤية الليلية عند المنحنيات ومداخل الواحات.',
    specs: {
      thickness: 'أعمدة مجلفنة 9م',
      paved: '760 عمود مركب',
      solarPoles: 1100,
      fleet: 22,
      qualityScore: '99.5%'
    }
  },
  {
    id: 'PRJ-UBG-CUL-028',
    title: 'مشروع عبّارات تصريف السيول وحماية مسار أوباري – غات',
    titleEn: 'Ubari – Ghat Flood Culverts & Drainage Protection',
    region: 'أودية العوينات ومخرات السيول',
    regionEn: 'Al Uwaynat Valleys',
    lengthKm: 95,
    progress: 75.0,
    status: 'in_progress',
    statusLabel: 'جاري التنفيذ',
    statusLabelEn: 'In Progress',
    statusColor: 'amber',
    budget: '32,000,000 د.ل',
    contractor: 'شركة الهضبة للإنشاءات المائية والجسور',
    startDate: 'فبراير 2025',
    targetDate: 'نوفمبر 2026',
    image: '/road-rollers-compaction.jpg',
    coords: { x: 20, y: 76 },
    realCoords: '25.6800,11.5500',
    desc: 'إنشاء 28 عبارة خرسانية صندوقية وأنفاق تصريف هيدروليكية لحماية جسم الطريق من الانجراف والسيول الموسمية في حوض العوينات.',
    specs: {
      thickness: 'خرسانة مسلحة C35',
      paved: '21 عبارة منجزة',
      solarPoles: 140,
      fleet: 35,
      qualityScore: '97.8%'
    }
  },
  {
    id: 'PRJ-UBG-DUN-120',
    title: 'مشروع تثبيت الكثبان الرملية وتوسعة أكتاف مسار أوباري',
    titleEn: 'Ubari Sand Dune Stabilization & Shoulder Widening',
    region: 'قطاع الفيوات – العوينات',
    regionEn: 'Alfyoat – Al Uwaynat',
    lengthKm: 120,
    progress: 58.0,
    status: 'in_progress',
    statusLabel: 'أعمال تسوية وتثبيت',
    statusLabelEn: 'In Progress',
    statusColor: 'amber',
    budget: '18,500,000 د.ل',
    contractor: 'شركة السهل الصحراوي للمقاولات العامة',
    startDate: 'مايو 2025',
    targetDate: 'يناير 2027',
    image: '/road-grader-earthwork.jpg',
    coords: { x: 26, y: 70 },
    realCoords: '26.4500,12.3500',
    desc: 'توسعة أكتاف الطريق بعرض 2.5 متر لكل جانب مع تركيب حواجز مصدات الرمال البيئية وتسوية التموجات الرملية المتاخمة.',
    specs: {
      thickness: 'أكتاف مدموكة 15 سم',
      paved: '69.6 كم',
      solarPoles: 180,
      fleet: 40,
      qualityScore: '96.2%'
    }
  },
  {
    id: 'PRJ-GHT-ENT-045',
    title: 'مشروع تطوير وتحديث مداخل مدينة غات التاريخية والبركت',
    titleEn: 'Ghat Historical Entrances & Al Barkat Corridor Upgrade',
    region: 'مدخل غات والبركت',
    regionEn: 'Ghat & Al Barkat',
    lengthKm: 45,
    progress: 55.0,
    status: 'in_progress',
    statusLabel: 'جاري الرصف',
    statusLabelEn: 'In Progress',
    statusColor: 'blue',
    budget: '28,000,000 د.ل',
    contractor: 'شركة الجنوب للمشاريع الكبرى',
    startDate: 'يونيو 2025',
    targetDate: 'مارس 2027',
    image: '/road-asphalt-paver.jpg',
    coords: { x: 16, y: 82 },
    realCoords: '24.9600,10.1800',
    desc: 'ازدواج وتطوير المدخل الشمالي لمدينة غات وربطه بمحور البركت والمنفذ الجنوبي بتصاميم تراثية تعكس الطابع المعماري للمدينة.',
    specs: {
      thickness: '12 سم طبقتين',
      paved: '24.8 كم',
      solarPoles: 260,
      fleet: 28,
      qualityScore: '98.0%'
    }
  },
  {
    id: 'PRJ-UBG-RST-004',
    title: 'مشروع نقاط الاستراحة والطوارئ والإسعاف بمسار أوباري – غات',
    titleEn: 'Ubari – Ghat Highway Emergency & Rest Service Stations',
    region: 'على طول المسار (4 محطات)',
    regionEn: '4 Rest Stations on Route',
    lengthKm: 360,
    progress: 42.0,
    status: 'in_progress',
    statusLabel: 'أعمال التشييد والإنشاء',
    statusLabelEn: 'Construction Stage',
    statusColor: 'amber',
    budget: '16,000,000 د.ل',
    contractor: 'ائتلاف الشركات الوطنية للخدمات المساندة',
    startDate: 'أغسطس 2025',
    targetDate: 'فبراير 2027',
    image: '/road-qa-testing-core.jpg',
    coords: { x: 23, y: 75 },
    realCoords: '25.9500,11.8500',
    desc: 'إنشاء 4 محطات استراحة متكاملة تتضمن مراكز إسعاف طارئ، ونقاط صيانة سريعة، ومهابط مروحيات طوارئ لخدمة المسافرين والشاحنات.',
    specs: {
      thickness: 'مبانٍ خرسانية ومواقف',
      paved: 'محطتان قيد الإنجاز',
      solarPoles: 80,
      fleet: 18,
      qualityScore: '97.0%'
    }
  }
];

export const initialFieldDispatches = [
  {
    id: 'DISP-01',
    title: 'اكتمال صب العبارة الصندوقية بالمحطة 120+00',
    sector: 'القطاع الثاني (الفيوات - العوينات)',
    time: 'منذ 15 دقيقة',
    author: 'م. طارق المحجوب',
    status: 'معتمد ميدانياً',
    type: 'success'
  },
  {
    id: 'DISP-02',
    title: 'بدء فرد الطبقة الرابطة بالفرادة Vögele Super 1800',
    sector: 'القطاع الأول (أوباري - الفيوات)',
    time: 'منذ ساعتين',
    author: 'م. عبد السلام الفزاني',
    status: 'جاري التنفيذ',
    type: 'info'
  },
  {
    id: 'DISP-03',
    title: 'اجتياز اختبارات الكثافة لمارشال بنسبة نجاح 99.2%',
    sector: 'المختبر المركزي - أوباري',
    time: 'منذ 4 ساعات',
    author: 'المختبر الميداني',
    status: 'مطابق للمواصفات',
    type: 'success'
  },
  {
    id: 'DISP-04',
    title: 'تثبيت 45 عمود إنارة بالطاقة الشمسية بمدخل البركت',
    sector: 'القطاع الرابع (البركت - غات)',
    time: 'منذ 6 ساعات',
    author: 'م. علي الغاتي',
    status: 'تم الإنجاز',
    type: 'info'
  }
];

export const initialFinancialReports = [
  {
    id: 'FIN-2026-Q2',
    title: 'تقرير الموقف المالي والمستخلصات الربع سنوي – Q2 2026',
    category: 'التقارير المالية',
    date: '2026-07-30',
    allocatedLyd: '145,000,000 د.ل',
    disbursedLyd: '99,325,000 د.ل',
    rate: '68.5%',
    author: 'الإدارة المالية – جهاز تنفيذ مشروعات المواصلات',
    size: '3.4 MB',
    type: 'PDF'
  },
  {
    id: 'FIN-AUD-01',
    title: 'محضر التدقيق المالي ومطابقة كميات الأسفلت الموردة',
    category: 'التدقيق المالي',
    date: '2026-06-25',
    allocatedLyd: '38,500,000 د.ل',
    disbursedLyd: '32,340,000 د.ل',
    rate: '84.0%',
    author: 'لجنة المراجعة والتدقيق المالي الفني',
    size: '2.1 MB',
    type: 'PDF'
  }
];

export { initialSectors, initialSummary, initialContractors, initialDocuments, initialFieldPhotos };

export const fetchFieldPhotos = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/photos`);
    if (res.ok) return await res.json();
  } catch (e) {
    // API offline fallback
  }
  const saved = localStorage.getItem('portal-field-photos');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (err) {}
  }
  await new Promise(r => setTimeout(r, 120));
  return initialFieldPhotos;
};

export const fetchMonthlyProgressHistory = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/progress-history`);
    if (res.ok) return await res.json();
  } catch (e) {
    // MySQL Server offline, use mock engine
  }
  return [
    { month: 'يناير', planned: 15, actual: 12, plannedProgress: 15, actualProgress: 12, budget: 18 },
    { month: 'فبراير', planned: 25, actual: 23, plannedProgress: 25, actualProgress: 23, budget: 32 },
    { month: 'مارس', planned: 36, actual: 35, plannedProgress: 36, actualProgress: 35, budget: 48 },
    { month: 'أبريل', planned: 48, actual: 46, plannedProgress: 48, actualProgress: 46, budget: 62 },
    { month: 'مايو', planned: 58, actual: 56, plannedProgress: 58, actualProgress: 56, budget: 74 },
    { month: 'يونيو', planned: 64, actual: 63, plannedProgress: 64, actualProgress: 63, budget: 85 },
    { month: 'يوليو', planned: 70, actual: 68.5, plannedProgress: 70, actualProgress: 68.5, budget: 99.3 }
  ];
};
