import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool, { testDbConnection } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ── بيانات احتياطية ذكية عند عدم توفر خادم MySQL ───────────────
const fallbackSummary = {
  projectTitle: 'مشروع صيانة طريق أوباري - غات',
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

const fallbackSectors = [
  {
    id: 'SEC-01',
    name: 'القطاع الأول: أوباري - الفيوات',
    lengthKm: 85,
    progress: 84,
    residentEngineer: 'م. عبد السلام الفزاني',
    status: 'متقدم جداً',
    statusColor: 'emerald',
    asphaltThicknessCm: 12,
    solarPolesInstalled: 640,
    activeWorkers: 115,
    notes: 'تم الانتهاء من الطبقة الرابطة وجاري استكمال الرصف النهائي للطبقة السطحية.',
    image: '/road-asphalt-paver.jpg'
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
    image: '/road-rollers-compaction.jpg'
  },
  {
    id: 'SEC-03',
    name: 'القطاع الثالث: العوينات - تهالة',
    lengthKm: 100,
    progress: 61,
    residentEngineer: 'م. سالم التواتي',
    status: 'جار الرصف والتأسيس',
    statusColor: 'blue',
    asphaltThicknessCm: 8,
    solarPolesInstalled: 320,
    activeWorkers: 98,
    notes: 'تسوية الأساس الحجري بالكاشطات الموتورية وإزالة الرمال الزاحفة وإعادة التأسيس.',
    image: '/road-grader-earthwork.jpg'
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
    notes: 'تركيب الشواخص الإرشادية واللوحات المرورية واستكمال رصف المسارات المزدوجة بمدخل غات.',
    image: '/road-solar-lighting.jpg'
  }
];

const fallbackContractors = [];

const fallbackProgressHistory = [
  { month: 'يناير', planned: 15, actual: 12, plannedProgress: 15, actualProgress: 12, budget: 18 },
  { month: 'فبراير', planned: 25, actual: 23, plannedProgress: 25, actualProgress: 23, budget: 32 },
  { month: 'مارس', planned: 36, actual: 35, plannedProgress: 36, actualProgress: 35, budget: 48 },
  { month: 'أبريل', planned: 48, actual: 46, plannedProgress: 48, actualProgress: 46, budget: 62 },
  { month: 'مايو', planned: 58, actual: 56, plannedProgress: 58, actualProgress: 56, budget: 74 },
  { month: 'يونيو', planned: 64, actual: 63, plannedProgress: 64, actualProgress: 63, budget: 85 },
  { month: 'يوليو', planned: 70, actual: 68.5, plannedProgress: 70, actualProgress: 68.5, budget: 99.3 }
];

const fallbackPhotos = [
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
    sector: 'القطاع الثالث (العوينات - تهالة)',
    desc: 'تسوية وضبط سمك طبقة الأساس الحجرية المكسورة وتوزيع الشاحنات وصهاريج رش المياه قبل الرصف.',
    src: '/road-grader-earthwork.jpg',
    category: 'كشط وتأسيس',
    date: '2026-08-11',
    author: 'م. سالم التواتي'
  },
  {
    id: 'PH-04',
    title: 'تركيب الشواخص المرورية وتخطيط المسار وعواكس السرعة',
    titleEn: 'Traffic Signage, Route Markings & Speed Calming Markers',
    sector: 'القطاع الرابع (البركت - غات)',
    desc: 'تثبيت اللوحات والشواخص الإرشادية وعواكس السرعة وتخطيط مسارات الطريق بالدهان الحراري العاكس.',
    src: '/road-solar-lighting.jpg',
    category: 'السلامة المرورية والإرشاد',
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
    category: 'مشاهد جوية وتوثيق',
    date: '2026-08-04',
    author: 'وحدة التوثيق الجوي'
  }
];

// ── 1. ملخص المؤشرات العامة ───────────────────────────────────
app.get('/api/summary', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM project_summary LIMIT 1');
    if (rows && rows.length > 0) {
      const s = rows[0];
      return res.json({
        projectTitle: s.project_title,
        agency: s.agency_name,
        initiative: s.initiative,
        totalLengthKm: Number(s.total_length_km),
        overallProgress: Number(s.overall_progress),
        plannedProgress: Number(s.planned_progress),
        totalBudgetLyd: Number(s.total_budget_lyd),
        spentBudgetLyd: Number(s.spent_budget_lyd),
        totalWorkforce: s.total_workforce,
        asphaltPavedKm: Number(s.asphalt_paved_km),
        solarPolesTotal: s.solar_poles_total,
        lastUpdated: s.updated_at
      });
    }
  } catch (error) {
    // MySQL not reachable - serve fallback
  }
  return res.json(fallbackSummary);
});

// ── 2. قطاعات الطريق الـ 4 ────────────────────────────────────
app.get('/api/sectors', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM sectors ORDER BY id ASC');
    if (rows && rows.length > 0) {
      const formatted = rows.map(sec => ({
        id: sec.sector_code,
        name: sec.name,
        lengthKm: Number(sec.length_km),
        progress: Number(sec.progress_rate),
        residentEngineer: sec.resident_engineer,
        status: sec.status,
        statusColor: sec.status_color,
        asphaltThicknessCm: Number(sec.asphalt_thickness_cm),
        solarPolesInstalled: sec.solar_poles_installed,
        activeWorkers: sec.active_workers,
        image: sec.image_url,
        notes: sec.technical_notes
      }));
      return res.json(formatted);
    }
  } catch (error) {
    // MySQL not reachable - serve fallback
  }
  return res.json(fallbackSectors);
});

// ── 3. الشركات والآليات الميدانية ──────────────────────────────
app.get('/api/contractors', async (req, res) => {
  return res.json([]);
});

// ── 4. السجل التاريخي للإنجاز الشهري ──────────────────────────
app.get('/api/progress-history', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM monthly_progress_history ORDER BY order_index ASC');
    if (rows && rows.length > 0) {
      const formatted = rows.map(r => ({
        month: r.month_name,
        planned: Number(r.planned_progress),
        actual: Number(r.actual_progress),
        budget: Number(r.budget_spent_millions)
      }));
      return res.json(formatted);
    }
  } catch (error) {
    // MySQL not reachable - serve fallback
  }
  return res.json(fallbackProgressHistory);
});

// ── 5. الصور الميدانية الحية ──────────────────────────────────
app.get('/api/photos', (req, res) => {
  return res.json(fallbackPhotos);
});

// ── 6. فحص صحة الخادم وقاعدة البيانات ─────────────────────────
app.get('/api/health', async (req, res) => {
  const dbStatus = await testDbConnection();
  return res.json({
    status: 'ok',
    mode: dbStatus ? 'mysql_live' : 'in_memory_ready',
    database: dbStatus ? 'connected' : 'ready_fallback',
    timestamp: new Date().toISOString()
  });
});

// ── تشغيل الخادم ──────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`خادم البوابة الإلكترونية يعمل على المنفذ: http://localhost:${PORT}`);
  await testDbConnection();
});
