// Mock REST API Service for Ubari - Ghat 360km Road Project
import { 
  fetchCloudProjects, 
  saveCloudProjects, 
  fetchCloudPhotos, 
  saveCloudPhotos, 
  fetchCloudStoreItem,
  saveCloudStoreItem,
  isSupabaseConfigured 
} from './supabase.js';



const initialSectors = [
  {
    id: 'SEC-01',
    name: 'القطاع الأول: أوبارﻱ - الفيوات',
    lengthKm: 85,
    progress: 84,
    residentEngineer: 'م. عبد السلام الفزاني',
    status: 'متقدم جداً',
    statusColor: 'emerald',
    asphaltThicknessCm: 12,
    solarPolesInstalled: 640,
    activeWorkers: 115,
    notes: 'تم الانتهاء من الطبقة الرابطة وجاري استكمال الرصف النهائي للطبقة السطحية.',
    image: './road-asphalt-paver.jpg'
  },
  {
    id: 'SEC-02',
    name: 'القطاع الثاني: الفيوات - العوينات',
    lengthKm: 95,
    progress: 72,
    residentEngineer: 'م. طارق المحجوب',
    status: 'وفق الجدول الزمني',
    statusColor: 'amber',
    asphaltThicknessCm: 10,
    solarPolesInstalled: 480,
    activeWorkers: 130,
    notes: 'أعمال دمك الأسفلت وتوسعة الأكتاف وقنوات تصريف مياه الأمطار في أودية العوينات.',
    image: './road-rollers-compaction.jpg'
  },
  {
    id: 'SEC-03',
    name: 'القطاع الثالث: العوينات - البركت',
    lengthKm: 100,
    progress: 61,
    residentEngineer: 'م. سالم التواتي',
    status: 'جار الرصف والتأسيس',
    statusColor: 'blue',
    asphaltThicknessCm: 8,
    solarPolesInstalled: 320,
    activeWorkers: 98,
    notes: 'تسوية الأساس الحجري بالكاشطات الموتورية وإزالة الرمال الزاحفة وإعادة التأسيس.',
    image: './road-grader-earthwork.jpg'
  },
  {
    id: 'SEC-04',
    name: 'القطاع الرابع: البركت - غات (المدخل التاريخي)',
    lengthKm: 80,
    progress: 55,
    residentEngineer: 'م. علي الغاتي',
    status: 'تحت التنفيذ المكثف',
    statusColor: 'purple',
    asphaltThicknessCm: 7,
    solarPolesInstalled: 290,
    activeWorkers: 85,
    notes: 'تركيب أعمدة الإنارة بالطاقة الشمسية واستكمال رصف المسارات المزدوجة بمدخل غات.',
    image: './road-solar-lighting.jpg'
  }
];

const initialSummary = {
  projectTitle: 'مشروع صيانة طريق أوبارﻱ - غات',
  agency: 'جهاز تنفيذ مشروعات المواصلات',
  initiative: 'خطة عودة الحياة',
  totalLengthKm: 360,
  overallProgress: 68.5,
  plannedProgress: 70.0,
  totalBudgetLyd: 145000000,
  spentBudgetLyd: 99325000,
  totalWorkforce: 428,
  asphaltPavedKm: 246.6,
  solarPolesTotal: 1730,
  lastUpdated: new Date().toISOString()
};

const initialContractors = [];

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
    sector: 'القطاع الأول (أوبارﻱ - الفيوات)',
    desc: 'عمليات مد ورصف الطبقة السطحية الرابطة ومتابعة درجة حرارة الخلطة الإسفلتية المعتمدة (160°C) في الموقع لضمان أعلى جودة.',
    src: './road-asphalt-paver.jpg',
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
    src: './road-rollers-compaction.jpg',
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
    src: './road-grader-earthwork.jpg',
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
    src: './road-solar-lighting.jpg',
    category: 'الطاقة الشمسية والإنارة',
    date: '2026-08-09',
    author: 'م. علي الغاتي'
  },
  {
    id: 'PH-05',
    title: 'فحص عينات الكور الإسفلتي واختبارات الدمك ومطابقة الجودة',
    titleEn: 'Marshall Asphalt Core QA Inspection & Density Testing',
    sector: 'مختبر الجودة الميداني - أوبارﻱ',
    desc: 'سحب وفحص عينات الكور الإسفلتي باستخدام أجهزة القياس الرقمية والمختبر الميداني المتنقل للتأكد من مطابقة المواصفات.',
    src: './road-qa-testing-core.jpg',
    category: 'ضبط الجودة المعملي',
    date: '2026-08-07',
    author: 'المختبر المركزي'
  },
  {
    id: 'PH-06',
    title: 'مشهد جوي بانورامي لمسار الطريق الصحراوي المعبد وأسطول الآليات',
    titleEn: 'Aerial Drone View of Desert Highway Paving Train Corridor',
    sector: 'مسار طريق أوبارﻱ – غات الدولي (360 كم)',
    desc: 'توثيق جوي شامل لحركة قطار الرصف والآليات والشاحنات على امتداد الطريق المخترق للكثبان الرملية الذهبية بالجنوب الليبي.',
    src: './road-aerial-highway.jpg',
    category: 'توثيق جوي بانورامي',
    date: '2026-08-05',
    author: 'ديوان جهاز المواصلات'
  }
];

export const nationalProjects = [
  {
    id: 'PRJ-UBG-360',
    title: 'مشروع صيانة ورصف طريق أوبارﻱ – غات (المسار الرئيسي)',
    titleEn: 'Ubari – Ghat Main Highway Paving & Upgrade',
    region: 'فزان (أوبارﻱ - غات 360 كم)',
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
    image: './road-aerial-highway.jpg',
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
    title: 'مشروع إنارة مسار أوبارﻱ – غات بالطاقة الشمسية الذكية',
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
    image: './road-solar-lighting.jpg',
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
    title: 'مشروع عبّارات تصريف السيول وحماية مسار أوبارﻱ – غات',
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
    image: './road-rollers-compaction.jpg',
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
    title: 'مشروع تثبيت الكثبان الرملية وتوسعة أكتاف مسار أوبارﻱ',
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
    image: './road-grader-earthwork.jpg',
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
    image: './road-asphalt-paver.jpg',
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
    title: 'مشروع نقاط الاستراحة والطوارئ والإسعاف بمسار أوبارﻱ – غات',
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
    image: './road-qa-testing-core.jpg',
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
    sector: 'القطاع الأول (أوبارﻱ - الفيوات)',
    time: 'منذ ساعتين',
    author: 'م. عبد السلام الفزاني',
    status: 'جاري التنفيذ',
    type: 'info'
  },
  {
    id: 'DISP-03',
    title: 'اجتياز اختبارات الكثافة لمارشال بنسبة نجاح 99.2%',
    sector: 'المختبر المركزي - أوبارﻱ',
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

export const initialTickerNews = [
  { id: 'NEWS-01', text: 'مشروع صيانة ورصف طريق أوبارﻱ – غات الاستراتيجي بطول 360 كم', tag: 'مشروع وطني', active: true, date: '2026-08-20' },
  { id: 'NEWS-02', text: 'نسبة الإنجاز الفعلي الإجمالية تتجاوز 68.5% على امتداد مسار الطريق', tag: 'متابعة دورية', active: true, date: '2026-08-19' },
  { id: 'NEWS-03', text: 'تواصل أعمال طبقات الرصف والأسفلت بأعلى معايير الجودة المعتمدة', tag: 'سير الأعمال', active: true, date: '2026-08-18' },
  { id: 'NEWS-04', text: 'توريد وتركيب أعمدة الإنارة الذكية بالطاقة الشمسية على امتداد المسار', tag: 'السلامة والإنارة', active: true, date: '2026-08-17' },
  { id: 'NEWS-05', text: 'فحص جودة خلطات الأسفلت والدمك عبر المعامل الجيوتقنية المعتمدة', tag: 'ضبط الجودة', active: true, date: '2026-08-16' },
  { id: 'NEWS-06', text: 'إشراف هندسي ميداني متواصل ومتابعة مستمرة لمعايير السلامة المرورية', tag: 'الإشراف الهندسي', active: true, date: '2026-08-15' }
];

export const getSavedTickerNews = () => {
  try {
    const saved = localStorage.getItem('portal_ticker_news');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return initialTickerNews;
};

export const initialNewsPosts = [
  {
    id: 'POST-01',
    title: 'تواصل أعمال فرش ورصف الطبقة الأسفلتية الساخنة بمتابعة معملية دقيقة',
    titleEn: 'Hot Asphalt Paving Operations Under Strict Laboratory & Field Supervision',
    desc: 'تواصل الكوادر الفنية الميدانية لجهاز تنفيذ مشروعات المواصلات أعمال رصف الطبقة السطحية الرابطة ومتابعة درجة حرارة الخلطة الإسفلتية المعتمدة (160°C) في الموقع لضمان أعلى معايير الجودة والمتانة ومقاومة الحمولات الثقيلة على طول الشريان الصحراوي.',
    descEn: 'Field engineering teams continue hot mix asphalt laying operations with strict temperature control (160°C) ensuring highway longevity and durability.',
    category: 'رصف الأسفلت',
    categoryEn: 'Asphalt Paving',
    image: './road-asphalt-paver.jpg',
    timeAgo: 'منذ ساعتين',
    timeAgoEn: '2 hours ago',
    location: 'مسار طريق أوبارﻱ – غات',
    locationEn: 'Ubari – Ghat Highway Corridor',
    author: 'المكتب الإعلامي - جهاز مشروعات المواصلات',
    authorEn: 'Media Office – Transportation Projects Authority',
    viewsCount: '1,420'
  },
  {
    id: 'POST-02',
    title: 'تشغيل أسطول المداحل الاهتزازية وضبط المناسيب عبر الأجهزة المساحية الرقمية',
    titleEn: 'Heavy Rollers Compaction & Total Station Survey Slope Verification',
    desc: 'تنفيذ أعمال الدمك النهائي لطبقات الرصف باستخدام أسطول المداحل الأسطوانية والمطاطية الحديثة، مع استمرار أعمال الرفع الطبوغرافي لضبط المناسيب الهندسية وميول تصريف مياه الأمطار بدقة عالية.',
    descEn: 'Deploying heavy vibratory & pneumatic rollers for final compaction and surveying slope verification.',
    category: 'الدمك والمساحة',
    categoryEn: 'Compaction & Survey',
    image: './road-rollers-compaction.jpg',
    timeAgo: 'منذ 5 ساعات',
    timeAgoEn: '5 hours ago',
    location: 'القطاع الميداني الثاني',
    locationEn: 'Second Field Sector',
    author: 'إدارة المشروعات بالمنطقة الجنوبية',
    authorEn: 'Southern Region Projects Administration',
    viewsCount: '1,180'
  },
  {
    id: 'POST-03',
    title: 'تسوية الأساس الحجري بالكاشطات الموتورية وتجهيز مسارات حماية الطريق',
    titleEn: 'Motor Grader Sub-base Grading & Sand Drift Protection Berms',
    desc: 'أعمال تسوية وضبط سمك طبقة الأساس الحجرية المكسورة بالكاشطات الموتورية الثقيلة وتوزيع صهاريج رش المياه، بالتزامن مع إزالة الرمال الزاحفة وتثبيت الحواجز الترابية الجانبية.',
    descEn: 'Motor graders leveling sub-base crushed aggregate while clearing desert sanddrifts and setting up road stabilization.',
    category: 'كشط وتأسيس',
    categoryEn: 'Earthwork & Grading',
    image: './road-grader-earthwork.jpg',
    timeAgo: 'أمس',
    timeAgoEn: 'Yesterday',
    location: 'حوض وادي الحياة',
    locationEn: 'Wadi Al-Haya Basin',
    author: 'فريق الإشراف الموقعي',
    authorEn: 'Site Supervision Team',
    viewsCount: '960'
  },
  {
    id: 'POST-04',
    title: 'تركيب وتشغيل منظومة الإنارة الذكية بالطاقة الشمسية على المنعطفات الحيوية',
    titleEn: 'Installation of Smart Solar Lighting Along Critical Highway Curves',
    desc: 'استكمال تثبيت أعمدة الإنارة المزدوجة المقاومة للرياح الصحراوية والمزودة بألواح شمسية ذكية وبطاريات ليثيوم متطورة، لضمان أعلى مستويات الأمان المروري والرؤية الليلية لسائقي الشاحنات والمسافرين.',
    descEn: 'Installing wind-resistant dual-arm solar LED lighting poles with smart sensors for nighttime driving safety.',
    category: 'الطاقة الشمسية والإنارة',
    categoryEn: 'Solar Lighting',
    image: './road-solar-lighting.jpg',
    timeAgo: 'منذ يومين',
    timeAgoEn: '2 days ago',
    location: 'المدخل الجنوبي للمسار',
    locationEn: 'Southern Corridor Entrance',
    author: 'وحدة الطاقة المتجددة والسلامة',
    authorEn: 'Renewable Energy & Safety Unit',
    viewsCount: '1,850'
  },
  {
    id: 'POST-05',
    title: 'فحص عينات الكور الإسفلتي واختبارات الكثافة بالمختبر الميداني المتنقل',
    titleEn: 'Field Asphalt Core Sampling & Mobile Laboratory Density Verification',
    desc: 'سحب واختبار عينات الكور الإسفلتي دورياً بأجهزة القياس المعملية المتقدمة للتأكد من مطابقة نسب الدمك، والسمك الفعلي، ومقاومة الضغط لأعلى معايير الجودة العالمية المعتمدة.',
    descEn: 'Core sampling and geotechnical testing in the mobile field laboratory confirming compaction density compliance.',
    category: 'ضبط الجودة المعملي',
    categoryEn: 'Quality Control',
    image: './road-qa-testing-core.jpg',
    timeAgo: 'منذ 3 أيام',
    timeAgoEn: '3 days ago',
    location: 'المختبر الميداني المركزي',
    locationEn: 'Central Field Laboratory',
    author: 'قسم ضبط الجودة والمختبرات',
    authorEn: 'Quality Control & Labs Dept.',
    viewsCount: '1,340'
  },
  {
    id: 'POST-06',
    title: 'مشهد جوي بانورامي 4K يوثق تقدم رصف الشريان البري الاستراتيجي بالجنوب',
    titleEn: 'Panoramic 4K Aerial Drone View of Progress Across Desert Dunes',
    desc: 'توثيق جوي شامل يرصد قطار الرصف وحركة الشاحنات والآليات على امتداد الطريق المخترق للكثبان الرملية الذهبية، مجسداً شريان التنمية الرابط بين مدن وواحات فزان بالمثلث الحدودي في غات.',
    descEn: 'Aerial drone footage capturing the newly paved highway corridor advancing through desert dunes.',
    category: 'توثيق جوي 4K',
    categoryEn: '4K Aerial Drone',
    image: './road-aerial-highway.jpg',
    timeAgo: 'منذ 4 أيام',
    timeAgoEn: '4 days ago',
    location: 'مسار الـ 360 كم',
    locationEn: '360km Highway Route',
    author: 'وحدة التوثيق والإنتاج الإعلامي',
    authorEn: 'Media Production & Drone Unit',
    viewsCount: '2,100'
  }
];

export const getSavedNewsPosts = () => {
  try {
    const saved = localStorage.getItem('portal-news-posts');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(p => ({
          ...p,
          image: (p.image && p.image.startsWith('/') && !p.image.startsWith('//')) ? '.' + p.image : p.image
        }));
      }
    }
  } catch (e) {}
  return initialNewsPosts;
};

export const saveNewsPosts = (posts) => {
  try {
    localStorage.setItem('portal-news-posts', JSON.stringify(posts));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {}
};

export const getSavedExecutiveProjects = () => {
  try {
    const saved = localStorage.getItem('portal-national-projects');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return nationalProjects;
};

export const syncExecutiveProjectsFromCloud = async () => {
  if (!isSupabaseConfigured()) return null;
  try {
    const cloudProjects = await fetchCloudProjects();
    if (cloudProjects && Array.isArray(cloudProjects) && cloudProjects.length > 0) {
      localStorage.setItem('portal-national-projects', JSON.stringify(cloudProjects));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('cloud_projects_updated', { detail: cloudProjects }));
      return cloudProjects;
    }
  } catch (e) {
    console.warn('[Supabase Sync] خطأ في مزامنة المشروعات:', e);
  }
  return null;
};

export const syncFieldPhotosFromCloud = async () => {
  if (!isSupabaseConfigured()) return null;
  try {
    const cloudPhotos = await fetchCloudPhotos();
    if (cloudPhotos && Array.isArray(cloudPhotos) && cloudPhotos.length > 0) {
      localStorage.setItem('portal-field-photos-v2', JSON.stringify(cloudPhotos));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('cloud_photos_updated', { detail: cloudPhotos }));
      return cloudPhotos;
    }
  } catch (e) {
    console.warn('[Supabase Sync] خطأ في مزامنة الصور:', e);
  }
  return null;
};

// Automatic initial cloud sync on page load and window events
if (typeof window !== 'undefined') {
  const triggerInitialSync = () => {
    if (isSupabaseConfigured()) {
      syncExecutiveProjectsFromCloud();
      syncFieldPhotosFromCloud();
    }
  };
  setTimeout(triggerInitialSync, 300);
  window.addEventListener('focus', triggerInitialSync);
  window.addEventListener('online', triggerInitialSync);
  window.addEventListener('supabase_config_changed', triggerInitialSync);
}

export const saveExecutiveProjects = (projects) => {
  try {
    localStorage.setItem('portal-national-projects', JSON.stringify(projects));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {}

  if (isSupabaseConfigured()) {
    saveCloudProjects(projects).catch(err => {
      console.warn('[Supabase] فشل حفظ المشروعات سحابياً:', err);
    });
  }
};


// ── Hero 3D Showcase Card State Management ──
export const initialHeroCard = {
  tag: 'الموقف التنفيذي الميداني المعتمد',
  tagEn: 'Field Operations Status',
  title: 'أعمال رصف وتأهيل مسار 360 كم',
  titleEn: '360km Highway Paving Operations',
  image: './road-asphalt-paver.jpg',
  progress: 68.5,
  distance: '360 كيلومتراً',
  distanceEn: '360 km',
  supervisor: 'مشروعات المواصلات',
  supervisorEn: 'Transport Projects',
  startDate: 'يناير 2025',
  startDateEn: 'Jan 2025',
  completionDate: 'ديسمبر 2026',
  completionDateEn: 'Dec 2026'
};

export const getSavedHeroCard = () => {
  try {
    const saved = localStorage.getItem('portal-hero-showcase-card');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        const img = parsed.image;
        const normalizedImg = (img && img.startsWith('/') && !img.startsWith('//')) ? '.' + img : img;
        return { ...initialHeroCard, ...parsed, image: normalizedImg || initialHeroCard.image };
      }
    }
  } catch (e) {}
  return initialHeroCard;
};

export const saveHeroCard = (heroCard) => {
  try {
    localStorage.setItem('portal-hero-showcase-card', JSON.stringify(heroCard));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {}
};


