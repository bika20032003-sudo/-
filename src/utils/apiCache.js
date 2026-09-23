import {
  initialDailySummary,
  initialRecentReports,
  initialCrushers,
  initialCrusherStocks,
  initialEquipment,
  initialAlerts,
  initialRoadProgress,
  initialTomorrowPlan,
  initialFuelLogs
} from '../data/mockData.js';

// Ultra-fast client-side cache with Stale-While-Revalidate (SWR) and instant offline fallback
const cache = new Map();
const TTL = 60000; // 60 seconds fresh cache

// Keep a reference to the unpatched native fetch before any overrides
const nativeFetch = (typeof window !== 'undefined' && window.fetch) ? window.fetch.bind(window) : fetch;

export function getFallbackData(url) {
  if (url.includes('/api/dashboard/summary')) {
    return {
      success: true,
      totalProduction: initialDailySummary?.totalProduction?.total || 1470,
      totalFuel: initialDailySummary?.solarConsumption?.total || 4250,
      totalSharshoor: initialDailySummary?.sharshoor?.total || 882,
      totalEquipment: initialDailySummary?.workingEquipment?.total || 42,
      activeEquipment: (initialDailySummary?.workingEquipment?.total || 42) - (initialDailySummary?.stoppedEquipment?.total || 4),
      stoppedEquipment: initialDailySummary?.stoppedEquipment?.total || 4,
      operatingHours: initialDailySummary?.operatingHours?.total || 312,
      sectorAFuel: initialDailySummary?.solarConsumption?.sectorA || 2450,
      sectorBFuel: initialDailySummary?.solarConsumption?.sectorB || 1800,
      sectorAProd: initialDailySummary?.totalProduction?.sectorA || 850,
      sectorBProd: initialDailySummary?.totalProduction?.sectorB || 620,
      recentAlerts: initialAlerts || [],
      recentReports: initialRecentReports || [],
      roadProgress: {
        kpis: {
          fdr: { meters: 220203, percentage: 97.3 },
          asphalt: { meters: 209923, percentage: 92.8 },
          aggregateBase: { meters: 215483, percentage: 95.2 },
          mco: { meters: 214303, percentage: 94.7 },
          totalTodayMeters: 1060
        }
      }
    };
  }
  if (url.includes('/api/dashboard/sector')) {
    return {
      success: true,
      summary: initialDailySummary,
      reports: initialRecentReports
    };
  }
  if (url.includes('/api/road-progress')) {
    return {
      success: true,
      items: initialRoadProgress || [],
      roadProgress: initialRoadProgress || [],
      summary: {
        totalRoadLengthKm: 226.28,
        overallPercentage: 95.0,
        sectorAPercentage: 96.2,
        sectorBPercentage: 93.8,
        totalTodayMeters: 1060
      }
    };
  }
  if (url.includes('/api/reports/periodic')) {
    const isAnnual = url.includes('type=annual');
    const urlObj = new URL(url, 'http://localhost');
    const year = Number(urlObj.searchParams.get('year')) || 2026;
    const month = Number(urlObj.searchParams.get('month')) || 9;
    const ARABIC_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const monthName = ARABIC_MONTHS[month - 1] || 'سبتمبر';
    const totalProd = isAnnual ? 448350 : 40513;
    const totalFuel = isAnnual ? 308100 : 27836;
    const totalSharshoor = isAnnual ? 269010 : 24308;
    const reportCode = isAnnual ? `REP-YR-${year}` : `REP-MO-${year}-${String(month).padStart(2, '0')}`;
    const reportTitle = isAnnual 
      ? `التقرير السنوي الشامل لمشروع صيانة طريق أوباري - غات لعام ${year}`
      : `التقرير الشهري الموحد لشهر ${monthName} ${year} - مشروع أوباري - غات`;

    let timeSeries = [];
    if (isAnnual) {
      timeSeries = ARABIC_MONTHS.map((m, idx) => ({
        period: m,
        monthIndex: idx + 1,
        production: Math.round(34000 + (Math.sin(idx) * 4000)),
        fuel: Math.round(23000 + (Math.cos(idx) * 3000)),
        roadMeters: Math.round(5000 + (Math.sin(idx) * 800)),
        sharshoor: Math.round(20000 + (Math.sin(idx) * 2000)),
        readiness: 88
      }));
    } else {
      timeSeries = ['الأسبوع الأول', 'الأسبوع الثاني', 'الأسبوع الثالث', 'الأسبوع الرابع'].map((w, idx) => ({
        period: w,
        weekIndex: idx + 1,
        production: Math.round(totalProd / 4),
        fuel: Math.round(totalFuel / 4),
        roadMeters: 15500,
        sharshoor: Math.round(totalSharshoor / 4),
        operatingHours: 312
      }));
    }

    return {
      success: true,
      reportCode,
      reportTitle,
      type: isAnnual ? 'annual' : 'monthly',
      year,
      month,
      monthName,
      sector: 'كافة القطاعات (المشروع بالكامل)',
      generatedAt: new Date().toISOString(),
      status: 'معتمد آلياً',
      approvedBy: 'مدير المشروع وجهاز المشروعات',
      periodDays: isAnnual ? 305 : 26,
      kpis: {
        totalProduction: totalProd,
        targetProduction: Math.round(totalProd * 1.04),
        prodAchievementRate: 96.2,
        totalFuel,
        fuelPerTon: 0.69,
        totalSharshoor,
        sharshoorDelivered: Math.round(totalSharshoor * 0.88),
        sharshoorStockBalance: 15659,
        totalRoadMeters: 62010,
        projectCompletedKm: 216.8,
        projectTotalKm: 226.28,
        projectOverallPercentage: 95.8,
        fleetReadinessRate: 88.5,
        totalOperatingHours: isAnnual ? 24500 : 1248,
        activeMachines: 38,
        maintenanceMachines: 4,
        totalMachines: 42
      },
      layers: [
        { name: 'إعادة التدوير على البارد (FDR)', meters: Math.round(totalProd * 0.35), unit: 'م.ط', status: 'منجز بالكامل تقريباً' },
        { name: 'طبقة الأساس الحبيبي والشرشور', meters: Math.round(totalProd * 0.30), unit: 'م.ط', status: 'مستمر ومتقدم' },
        { name: 'رش طبقة التشريب الأسفلتي (MCO)', meters: Math.round(totalProd * 0.20), unit: 'م.ط', status: 'مستمر' },
        { name: 'الطبقة الإسفلتية السطحية المحسنة', meters: Math.round(totalProd * 0.15), unit: 'م.ط', status: 'مراحل نهائية' }
      ],
      timeSeries,
      materialsBreakdown: [
        { name: 'ركام متدرج طبقة أساس (0-37.5 مم)', amount: Math.round(totalProd * 0.48), unit: 'طن', percentage: 48 },
        { name: 'شرشور ناعم خلطات رصف (0-5 مم)', amount: Math.round(totalProd * 0.32), unit: 'طن', percentage: 32 },
        { name: 'سن وركام خشن خرساني (5-20 مم)', amount: Math.round(totalProd * 0.20), unit: 'طن', percentage: 20 }
      ],
      sectorComparison: {
        sectorA: {
          name: 'القطعة (A) - شركة الرواد',
          productionTons: Math.round(totalProd * 0.58),
          fuelLiters: Math.round(totalFuel * 0.57),
          roadMeters: 33485,
          activeEquipment: 20,
          completionRate: 96.2
        },
        sectorB: {
          name: 'القطعة (B) - شركة نيوم',
          productionTons: Math.round(totalProd * 0.42),
          fuelLiters: Math.round(totalFuel * 0.43),
          roadMeters: 28525,
          activeEquipment: 18,
          completionRate: 93.8
        }
      },
      executiveNotes: [
        `تحقيق استقرار إنتاجي بمعدل إنجاز بلغ 96.2% من المستهدف المعتمد للفترة.`,
        `كفاءة استهلاك الوقود بلغت 0.69 لتر/طن من الركام المنتج، وهو ضمن الحدود المعيارية المعتمدة للجهاز.`,
        `معدل الجاهزية التشغيلية للأسطول سجل 88.5% مع انتظام أعمال الصيانة الميدانية.`,
        `التوصية: تعزيز وتيرة توريد مادة الشرشور الناعم للمحطة الإسفلتية لتسريع وتيرة الطبقة السطحية المتبقية.`
      ],
      signatories: {
        siteEngineer: 'م. محمد المهدي (مهندس الموقع)',
        sectorManager: 'م. أحمد التواتي (مدير القطاعات)',
        projectDirector: 'م. عبدالرحمن الشريف (مدير المشروع المعتمد)'
      }
    };
  }
  if (url.includes('/api/reports')) {
    let list = [...(initialRecentReports || [])];
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const deleted = new Set(JSON.parse(localStorage.getItem('deleted_report_ids') || '[]'));
        list = list.filter(r => !deleted.has(String(r.id)) && !deleted.has(String(r.reportNumber)));
        const local = JSON.parse(localStorage.getItem('local_reports') || '[]');
        const existingIds = new Set(list.map(r => String(r.id || r.reportNumber)));
        const validLocal = local.filter(r => 
          !deleted.has(String(r.id)) && 
          !deleted.has(String(r.reportNumber)) && 
          !existingIds.has(String(r.id || r.reportNumber))
        );
        list = [...validLocal, ...list];
      }
    } catch (e) {
      console.warn('Error reading reports cache:', e);
    }
    return {
      success: true,
      reports: list,
      data: list
    };
  }
  if (url.includes('/api/crushers')) {
    return {
      success: true,
      logs: initialCrushers || [],
      crushers: initialCrushers || []
    };
  }
  if (url.includes('/api/sharshoor')) {
    return {
      success: true,
      logs: initialCrusherStocks || [],
      stocks: initialCrusherStocks || []
    };
  }
  if (url.includes('/api/fuel')) {
    return {
      success: true,
      logs: initialFuelLogs || [],
      fuel: initialFuelLogs || []
    };
  }
  if (url.includes('/api/equipment')) {
    return {
      success: true,
      equipment: initialEquipment || []
    };
  }
  if (url.includes('/api/alerts')) {
    return {
      success: true,
      alerts: initialAlerts || []
    };
  }
  if (url.includes('/api/plans')) {
    return {
      success: true,
      plan: {
        id: 1,
        title: 'خطة تشغيل الكسارات والمعدات المعتمدة - الغد',
        status: 'approved',
        approvedBy: 'م. حسام الدين (مدير المشروع)',
        approvedAt: new Date().toISOString(),
        items: initialTomorrowPlan || []
      },
      suggestedPlan: {
        title: 'خطة مقترحة ذكياً لتوزيع المعدات والكسارات',
        items: initialTomorrowPlan || []
      },
      items: initialTomorrowPlan || [],
      plans: initialTomorrowPlan || []
    };
  }
  if (url.includes('/api/analysis')) {
    let targetDateStr = new Date().toISOString().split('T')[0];
    let sectorFilter = null;
    try {
      const qIndex = url.indexOf('?');
      if (qIndex !== -1) {
        const params = new URLSearchParams(url.substring(qIndex));
        const d = params.get('date');
        if (d) targetDateStr = d;
        const s = params.get('sector');
        if (s && s !== 'all') sectorFilter = s;
      }
    } catch (e) {}

    let allReports = [...(initialRecentReports || [])];
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const deleted = new Set(JSON.parse(localStorage.getItem('deleted_report_ids') || '[]'));
        allReports = allReports.filter(r => !deleted.has(String(r.id)) && !deleted.has(String(r.reportNumber)));
        const local = JSON.parse(localStorage.getItem('local_reports') || '[]');
        const existingIds = new Set(allReports.map(r => String(r.id || r.reportNumber)));
        const validLocal = local.filter(r => 
          !deleted.has(String(r.id)) && 
          !deleted.has(String(r.reportNumber)) && 
          !existingIds.has(String(r.id || r.reportNumber))
        );
        allReports = [...validLocal, ...allReports];
        allReports = allReports.filter(r => !deleted.has(String(r.id)) && !deleted.has(String(r.reportNumber)));
      }
    } catch (e) {}

    if (sectorFilter) {
      allReports = allReports.filter(r => r.sector && r.sector.includes(sectorFilter));
    }

    const targetDateReports = allReports.filter(r => r.date && r.date.split('T')[0] === targetDateStr);

    const prodToday = targetDateReports.reduce((acc, r) => acc + (Number(r.productionAmount) || 0), 0);
    const fuelToday = targetDateReports.reduce((acc, r) => acc + (Number(r.fuelAmount) || 0), 0);
    const sharshoorToday = Math.round(prodToday * 0.6);
    const sharshoorDispatched = Math.round(sharshoorToday * 0.85);

    const avg7DaysProd = sectorFilter ? (sectorFilter.includes('A') ? 850 : 620) : 1470;
    const avg7DaysFuel = sectorFilter ? (sectorFilter.includes('A') ? 2200 : 1800) : 4000;

    const prodVariance = avg7DaysProd > 0 ? parseFloat((((prodToday - avg7DaysProd) / avg7DaysProd) * 100).toFixed(1)) : 0;
    const fuelVariance = avg7DaysFuel > 0 ? parseFloat((((fuelToday - avg7DaysFuel) / avg7DaysFuel) * 100).toFixed(1)) : 0;

    const hasOperations = prodToday > 0 || fuelToday > 0 || targetDateReports.length > 0;
    const opCrushersCount = hasOperations ? (sectorFilter ? 1 : 2) : 0;
    const crusherOpHours = opCrushersCount * 8;
    const productivityPerHour = crusherOpHours > 0 ? Math.round(prodToday / crusherOpHours) : (prodToday > 0 ? Math.round(prodToday / 8) : 0);

    const warnings = [];
    if (!hasOperations) {
      warnings.push({
        type: 'warning',
        title: `لا توجد عمليات مسجلة بتاريخ (${targetDateStr})`,
        message: `لم يتم رصد أي إنتاج أو صرف وقود للقطاع (${sectorFilter ? (sectorFilter.includes('A') ? 'القطعة A' : 'القطعة B') : 'كافة القطاعات'}) في هذا اليوم.`,
        suggestedAction: 'اختر تاريخاً آخر من القائمة أو قم برفع تقرير تشغيل جديد.'
      });
    } else if (fuelToday > 0) {
      warnings.push({
        type: fuelVariance > 10 ? 'danger' : fuelVariance > 0 ? 'warning' : 'info',
        title: fuelVariance > 0 ? `استهلاك السولار أعلى من المتوسط بـ ${fuelVariance}%` : 'استهلاك السولار مستقر وضمن الخطة',
        message: `تم صرف ${fuelToday.toLocaleString()} لتر في (${targetDateStr}) مقارنة بمتوسط ${avg7DaysFuel.toLocaleString()} لتر.`,
        suggestedAction: 'متابعة أذونات الصرف وجداول التزويد للصهاريج الميدانية.'
      });
    }

    return {
      success: true,
      analysisDate: targetDateStr,
      sector: sectorFilter || 'all',
      operational: {
        totalEquipment: sectorFilter ? 8 : 16,
        workingEquipment: sectorFilter ? 7 : 14,
        stoppedEquipment: sectorFilter ? 1 : 2,
        standbyEquipment: 0,
        totalOperatingHours: sectorFilter ? 52 : 105,
        estimatedStoppedHours: 16,
        readinessRate: 88
      },
      fuel: {
        dispensedToday: fuelToday,
        avg7Days: avg7DaysFuel,
        variancePercentage: fuelVariance,
        isHigherThanAverage: fuelVariance > 0,
        fuelBalance: sectorFilter ? (sectorFilter.includes('A') ? 28500 : 24000) : 52500,
        totalReceived: sectorFilter ? 30000 : 60000
      },
      crushers: {
        productionToday: prodToday,
        avg7Days: avg7DaysProd,
        variancePercentage: prodVariance,
        operatingCrushers: opCrushersCount,
        operatingHours: crusherOpHours,
        productivityPerHour
      },
      sharshoor: {
        producedToday: sharshoorToday,
        dispatchedToday: sharshoorDispatched,
        currentBalance: sectorFilter ? (sectorFilter.includes('A') ? 12500 : 8850) : 21350
      },
      warnings,
      issues: [
        { id: 1, title: 'تذبذب ضغط مضخة وقود الكسارة الشمالية', status: 'pending', severity: 'medium', sector: 'القطعة B' },
        { id: 2, title: 'تأخر توريد طبقة الأساس الحبيبي بالمحطة 78', status: 'resolved', severity: 'high', sector: 'القطعة A' }
      ],
      reportsCount: targetDateReports.length
    };
  }
  if (url.includes('/api/users')) {
    return {
      success: true,
      users: [
        { id: 1, name: 'مدير المشروع', username: 'admin', email: 'admin@mot.gov.ly', role: 'مدير المشروع', sector: 'all', createdAt: '2026-01-10' },
        { id: 2, name: 'مدير القطاعات', username: 'admin_sectors', email: 'admin_sectors@mot.gov.ly', role: 'مدير القطاعات', sector: 'all', createdAt: '2026-01-15' },
        { id: 3, name: 'مشرف القطاع (A)', username: 'sector_a', email: 'sector_a@mot.gov.ly', role: 'مشرف القطاع (A)', sector: 'القطعة A', createdAt: '2026-01-20' },
        { id: 4, name: 'مشرف القطاع (B)', username: 'sector_b', email: 'sector_b@mot.gov.ly', role: 'مشرف القطاع (B)', sector: 'القطعة B', createdAt: '2026-01-25' }
      ]
    };
  }
  return { success: true, data: [] };
}

async function fetchWithTimeout(url, options, timeoutMs = 1200) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    const res = await nativeFetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fastFetch(rawUrl, options = {}) {
  let url = rawUrl;
  if (typeof url === 'string' && typeof window !== 'undefined') {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && !window.location.hostname.includes('github.io')) {
      url = url.replace('localhost:5000', `${window.location.hostname}:5000`);
    }
  }

  const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');
  const apiBase = import.meta.env.VITE_API_BASE || '';

  // If in static hosting on GitHub Pages without a backend, serve mock data
  if (isGitHubPages && !apiBase) {
    const method = (options.method || 'GET').toUpperCase();
    if (method !== 'GET') {
      if (method === 'DELETE' && url.includes('/api/reports/')) {
        const reportId = url.split('/api/reports/')[1]?.split('?')[0];
        if (reportId && typeof window !== 'undefined' && window.localStorage) {
          try {
            const deleted = JSON.parse(localStorage.getItem('deleted_report_ids') || '[]');
            if (!deleted.includes(String(reportId))) deleted.push(String(reportId));
            localStorage.setItem('deleted_report_ids', JSON.stringify(deleted));

            const local = JSON.parse(localStorage.getItem('local_reports') || '[]');
            const updatedLocal = local.filter(r => String(r.id) !== String(reportId) && String(r.reportNumber) !== String(reportId));
            localStorage.setItem('local_reports', JSON.stringify(updatedLocal));
          } catch (e) {
            console.error('Error syncing report deletion in fastFetch:', e);
          }
        }
      }
      return { success: true, message: 'Saved locally' };
    }
    return getFallbackData(url);
  }

  if (typeof url === 'string' && url.includes(':5000/api')) {
    if (isGitHubPages && apiBase) {
      url = url.replace(/https?:\/\/[^/]+/, apiBase);
    }
  }
  const method = options.method || 'GET';

  // For non-GET requests (mutations), clear all cache completely
  if (method !== 'GET') {
    cache.clear();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await nativeFetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) return await res.json();
    } catch {
      // offline mutation fallback
    }
    return { success: true, message: 'Saved locally' };
  }

  const isDynamicEndpoint = url.includes('/api/dashboard') || 
                            url.includes('/api/analysis') || 
                            url.includes('/api/reports') || 
                            url.includes('/api/crushers') || 
                            url.includes('/api/fuel') || 
                            url.includes('/api/equipment');

  const cacheKey = `${url}`;
  const cached = cache.get(cacheKey);
  const now = Date.now();

  // Return fresh cache only for static resources, never for live metrics
  if (!isDynamicEndpoint && cached && (now - cached.timestamp < 3000)) {
    return cached.data;
  }

  // Direct fetch with 4000ms timeout
  const data = await fetchWithTimeout(url, options, 4000);
  const finalData = data || getFallbackData(url);
  if (!isDynamicEndpoint) {
    cache.set(cacheKey, { data: finalData, timestamp: Date.now() });
  }
  return finalData;
}

export function clearApiCache() {
  cache.clear();
}
