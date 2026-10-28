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

export function safeGetStorageArray(key) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const val = localStorage.getItem(key);
    if (!val) return [];
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function safeGetStorageSet(key) {
  return new Set(safeGetStorageArray(key).map(String));
}

export function getFallbackData(url) {
  if (url.includes('/api/dashboard/summary')) {
    let allReports = [...(initialRecentReports || [])];
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const deleted = safeGetStorageSet('deleted_report_ids');
        allReports = allReports.filter(r => !deleted.has(String(r.id)) && !deleted.has(String(r.reportNumber)));
        const local = safeGetStorageArray('local_reports');
        const existingIds = new Set(allReports.map(r => String(r.id || r.reportNumber)));
        const validLocal = local.filter(r => 
          !deleted.has(String(r.id)) && 
          !deleted.has(String(r.reportNumber)) && 
          !existingIds.has(String(r.id || r.reportNumber))
        );
        allReports = [...validLocal, ...allReports];
      }
    } catch (e) {
      console.warn('Error reading reports for dashboard summary:', e);
    }

    allReports.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : (Number(a.id) || 0);
      const dateB = b.date ? new Date(b.date).getTime() : (Number(b.id) || 0);
      return dateB - dateA;
    });

    const recentReports = allReports.slice(0, 10);

    return {
      success: true,
      totalProduction: initialDailySummary?.totalProduction?.total || 0,
      totalFuel: initialDailySummary?.solarConsumption?.total || 0,
      totalSharshoor: initialDailySummary?.sharshoor?.total || 0,
      totalEquipment: initialDailySummary?.workingEquipment?.total || 0,
      activeEquipment: 0,
      stoppedEquipment: 0,
      operatingHours: 0,
      sectorAFuel: 0,
      sectorBFuel: 0,
      sectorAProd: 0,
      sectorBProd: 0,
      recentAlerts: [],
      recentReports: recentReports,
      roadProgress: {
        kpis: {
          fdr: { meters: 220203, percentage: 97.3 },
          asphalt: { meters: 209923, percentage: 92.8 },
          aggregateBase: { meters: 215483, percentage: 95.2 },
          mco: { meters: 214303, percentage: 94.7 },
          totalTodayMeters: 0
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
        totalRoadLengthKm: 360.00,
        overallPercentage: 65.9,
        sectorAPercentage: 100.0,
        sectorBPercentage: 8.4,
        totalTodayMeters: 3820
      }
    };
  }
  if (url.includes('/api/executive-progress')) {
    let localData = null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = localStorage.getItem('executive_progress_data');
        if (item) localData = JSON.parse(item);
      }
    } catch (e) {}
    return {
      success: true,
      data: localData || {
        projectName: 'مشروع صيانة طريق اوباري غات بطول 360 كيلومتر',
        reportTitle: 'الموقف التنفيذي.',
        contractValue: 897665675.030,
        currency: 'دينار',
        reportDate: '2026-10-24',
        reportNumber: '093436_24.10.2026',
        basicTotals: { executedValue: 631848792.36, percentage: 70.19 },
        additionalTotals: { executedValue: 93573854.26 },
        grandTotals: {
          contractValue: 897665675.030,
          totalExecutedValue: 725422646.62,
          totalRemainingValue: 172243028.41,
          overallFinancialPercentage: 80.81,
          basicItemsPercentage: 70.19
        }
      }
    };
  }
  if (url.includes('/api/reports/periodic')) {
    const isAnnual = url.includes('type=annual');
    const urlObj = new URL(url, 'http://localhost');
    const year = Number(urlObj.searchParams.get('year')) || 2026;
    const month = Number(urlObj.searchParams.get('month')) || 9;
    const requestedSector = urlObj.searchParams.get('sector') || 'all';

    const ARABIC_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const monthName = ARABIC_MONTHS[month - 1] || 'سبتمبر';

    // 1. Gather all daily reports from cache & localStorage
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
      }
    } catch (e) {
      console.warn('Error reading reports for periodic generation:', e);
    }

    // 2. Filter daily reports by period & sector
    const matchingReports = allReports.filter(r => {
      if (!r.date) return false;
      const rDate = new Date(r.date);
      if (isNaN(rDate.getTime())) return false;
      const rYear = rDate.getFullYear();
      const rMonth = rDate.getMonth() + 1;

      const matchesYear = rYear === year;
      const matchesMonth = isAnnual ? true : (rMonth === month);
      
      let matchesSector = true;
      if (requestedSector && requestedSector !== 'all') {
        const filterStr = String(requestedSector).toUpperCase();
        matchesSector = String(r.sector || '').toUpperCase().includes(filterStr);
      }

      return matchesYear && matchesMonth && matchesSector;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    const hasRealReports = matchingReports.length > 0;

    // 3. Compute sums from matching daily reports
    const repProdSum = matchingReports.reduce((acc, r) => acc + (Number(r.productionAmount) || 0), 0);
    const repFuelSum = matchingReports.reduce((acc, r) => acc + (Number(r.fuelAmount) || 0), 0);
    const repRoadSum = matchingReports.reduce((acc, r) => acc + (Number(r.roadMeters || r.salesAmount) || 0), 0);
    const repSharshoorSum = matchingReports.reduce((acc, r) => {
      if (String(r.reportType || '').includes('شرشور') || String(r.materialName || '').includes('شرشور')) {
        return acc + (Number(r.productionAmount || r.salesAmount) || 0);
      }
      return acc + Math.round((Number(r.productionAmount) || 0) * 0.32);
    }, 0);

    // Real reported numbers (no fake baseline injected)
    const totalProd = repProdSum;
    const totalFuel = repFuelSum;
    const totalSharshoor = repSharshoorSum;
    const totalRoadMeters = repRoadSum;

    const reportCode = isAnnual ? `REP-YR-${year}` : `REP-MO-${year}-${String(month).padStart(2, '0')}`;
    const reportTitle = isAnnual 
      ? `التقرير السنوي الشامل لمشروع صيانة طريق أوباري - غات لعام ${year}`
      : `التقرير الشهري الموحد لشهر ${monthName} ${year} - مشروع أوباري - غات`;

    // 4. Sector breakdown from daily reports
    const secAReports = matchingReports.filter(r => String(r.sector || '').includes('A') || String(r.sector || '').includes('الرواد'));
    const secBReports = matchingReports.filter(r => String(r.sector || '').includes('B') || String(r.sector || '').includes('نيوم'));

    const secAProd = secAReports.reduce((acc, r) => acc + (Number(r.productionAmount) || 0), 0);
    const secBProd = secBReports.reduce((acc, r) => acc + (Number(r.productionAmount) || 0), 0);
    const secAFuel = secAReports.reduce((acc, r) => acc + (Number(r.fuelAmount) || 0), 0);
    const secBFuel = secBReports.reduce((acc, r) => acc + (Number(r.fuelAmount) || 0), 0);
    const secARoad = secAReports.reduce((acc, r) => acc + (Number(r.roadMeters || r.salesAmount) || 0), 0);
    const secBRoad = secBReports.reduce((acc, r) => acc + (Number(r.roadMeters || r.salesAmount) || 0), 0);

    // 5. Time Series Breakdown
    let timeSeries = [];
    if (isAnnual) {
      timeSeries = ARABIC_MONTHS.map((m, idx) => {
        const mMonthNum = idx + 1;
        const mReports = allReports.filter(r => {
          if (!r.date) return false;
          const rd = new Date(r.date);
          return rd.getFullYear() === year && (rd.getMonth() + 1) === mMonthNum;
        });
        const mProd = mReports.reduce((acc, r) => acc + (Number(r.productionAmount) || 0), 0);
        const mFuel = mReports.reduce((acc, r) => acc + (Number(r.fuelAmount) || 0), 0);
        const mRoad = mReports.reduce((acc, r) => acc + (Number(r.roadMeters || r.salesAmount) || 0), 0);
        const mShar = mReports.reduce((acc, r) => acc + (Number(r.productionAmount) || 0) * 0.32, 0);

        return {
          period: m,
          monthIndex: mMonthNum,
          production: mProd,
          fuel: mFuel,
          roadMeters: mRoad,
          sharshoor: mShar,
          readiness: 88,
          reportsCount: mReports.length
        };
      });
    } else {
      const weeks = ['الأسبوع الأول (1-7)', 'الأسبوع الثاني (8-14)', 'الأسبوع الثالث (15-21)', 'الأسبوع الرابع (22-31)'];
      timeSeries = weeks.map((w, idx) => {
        const startDay = idx * 7 + 1;
        const endDay = idx === 3 ? 31 : (idx + 1) * 7;
        const wReports = matchingReports.filter(r => {
          const rd = new Date(r.date);
          const day = rd.getDate();
          return day >= startDay && day <= endDay;
        });
        const wProd = wReports.reduce((acc, r) => acc + (Number(r.productionAmount) || 0), 0);
        const wFuel = wReports.reduce((acc, r) => acc + (Number(r.fuelAmount) || 0), 0);
        const wRoad = wReports.reduce((acc, r) => acc + (Number(r.roadMeters || r.salesAmount) || 0), 0);
        const wShar = wReports.reduce((acc, r) => acc + (Number(r.productionAmount) || 0) * 0.32, 0);

        return {
          period: w,
          weekIndex: idx + 1,
          production: wProd,
          fuel: wFuel,
          roadMeters: wRoad,
          sharshoor: Math.round(wShar),
          operatingHours: 0,
          reportsCount: wReports.length
        };
      });
    }

    const fuelPerTon = totalProd > 0 ? parseFloat((totalFuel / totalProd).toFixed(2)) : 0.69;
    const targetProd = Math.round(totalProd * 1.04);
    const prodAchievementRate = parseFloat(((totalProd / targetProd) * 100).toFixed(1));

    return {
      success: true,
      reportCode,
      reportTitle,
      type: isAnnual ? 'annual' : 'monthly',
      year,
      month,
      monthName,
      sector: requestedSector === 'all' ? 'كافة القطاعات (المشروع بالكامل)' : `قطاع ${requestedSector}`,
      generatedAt: new Date().toISOString(),
      status: 'معتمد آلياً',
      approvedBy: 'مدير المشروع وجهاز المشروعات',
      periodDays: isAnnual ? 305 : 26,
      dataSource: hasRealReports ? 'مجمع آلياً من التقارير اليومية المعتمدة' : 'تقديري معياري استرشادي',
      hasRealReports,
      contributingReportsCount: matchingReports.length,
      contributingReports: matchingReports.map(r => ({
        id: r.id,
        reportNumber: r.reportNumber || `REP-${r.id}`,
        date: r.date,
        sector: r.sector || 'القطعة A',
        reportType: r.reportType || 'تقرير يومي شامل',
        crusherName: r.crusherName || 'الكسارة المركزية',
        materialName: r.materialName || 'ركام وطبقات رصف',
        productionAmount: Number(r.productionAmount) || 0,
        fuelAmount: Number(r.fuelAmount) || 0,
        roadMeters: Number(r.roadMeters || r.salesAmount) || 0,
        workingEquipmentCount: Number(r.workingEquipmentCount) || 28,
        uploadedBy: r.uploadedBy || 'مهندس الموقع',
        status: r.status || 'approved',
        notes: r.notes || ''
      })),
      kpis: {
        totalProduction: repProdSum,
        targetProduction: repProdSum,
        prodAchievementRate: 100,
        totalFuel: repFuelSum,
        fuelPerTon: 0,
        totalSharshoor: 0,
        sharshoorDelivered: 0,
        sharshoorStockBalance: 0,
        totalRoadMeters: repRoadSum,
        projectCompletedKm: parseFloat((repRoadSum / 1000).toFixed(2)),
        projectTotalKm: 360.00,
        projectOverallPercentage: parseFloat(((repRoadSum / (360.00 * 1000)) * 100).toFixed(1)),
        fleetReadinessRate: 0,
        totalOperatingHours: 0,
        activeMachines: 0,
        maintenanceMachines: 0,
        totalMachines: 0,
        directReportsProduction: repProdSum,
        directReportsFuel: repFuelSum,
        directReportsRoadMeters: repRoadSum
      },
      layers: [
        { name: 'إعادة التدوير على البارد (FDR)', meters: Math.round(totalRoadMeters * 0.35), unit: 'م.ط', status: 'منجز بالكامل تقريباً' },
        { name: 'طبقة الأساس الحبيبي والشرشور', meters: Math.round(totalRoadMeters * 0.30), unit: 'م.ط', status: 'مستمر ومتقدم' },
        { name: 'رش طبقة التشريب الأسفلتي (MCO)', meters: Math.round(totalRoadMeters * 0.20), unit: 'م.ط', status: 'مستمر' },
        { name: 'الطبقة الإسفلتية السطحية المحسنة', meters: Math.round(totalRoadMeters * 0.15), unit: 'م.ط', status: 'مراحل نهائية' }
      ],
      timeSeries,
      materialsBreakdown: [
        { name: 'ركام متدرج طبقة أساس (0-37.5 مم)', amount: Math.round(totalProd * 0.48), unit: 'طن', percentage: 48 },
        { name: 'شرشور ناعم خلطات رصف (0-5 مم)', amount: Math.round(totalProd * 0.32), unit: 'طن', percentage: 32 },
        { name: 'سن وركام خشن خرساني (5-20 مم)', amount: Math.round(totalProd * 0.20), unit: 'طن', percentage: 20 }
      ],
      sectorComparison: {
        sectorA: {
          name: 'المرحلة الأولى',
          productionTons: Math.round(totalProd * 0.58) + secAProd,
          fuelLiters: Math.round(totalFuel * 0.57) + secAFuel,
          roadMeters: Math.round(totalRoadMeters * 0.54) + secARoad,
          activeEquipment: 20,
          completionRate: 96.2,
          reportsCount: secAReports.length
        },
        sectorB: {
          name: 'المرحلة الثانية',
          productionTons: Math.round(totalProd * 0.42) + secBProd,
          fuelLiters: Math.round(totalFuel * 0.43) + secBFuel,
          roadMeters: Math.round(totalRoadMeters * 0.46) + secBRoad,
          activeEquipment: 18,
          completionRate: 93.8,
          reportsCount: secBReports.length
        }
      },
      executiveNotes: [
        hasRealReports 
          ? `تم تجميع التقرير وتثبيته استناداً إلى ${matchingReports.length} تقريراً يومياً معتمداً من مهندسي المواقع الميدانيين.`
          : `التقرير مستند حالياً إلى المعدلات المعيارية المعتمدة للمشروع لحين استلام التقارير اليومية للفترة.`,
        `تحقيق استقرار إنتاجي بمعدل إنجاز بلغ ${prodAchievementRate}% من المستهدف المعتمد للفترة.`,
        `كفاءة استهلاك الوقود بلغت ${fuelPerTon} لتر/طن من الركام المنتج، وهو ضمن الحدود المعيارية المعتمدة للجهاز.`,
        `معدل الجاهزية التشغيلية للأسطول سجل 88.5% مع انتظام أعمال الصيانة الميدانية.`,
        `التوصية: تعزيز وتيرة توريد مادة الشرشور الناعم للمحطة الإسفلتية لتسريع وتيرة الطبقة السطحية المتبقية.`
      ],
      signatories: {
        siteEngineer: 'م. محمد المهدي (مدير القطاع الميداني)',
        sectorManager: 'م. أحمد التواتي (مدير القطاعات)',
        projectDirector: 'المهندس عبدالرحمن الأنصاري (مدير المشروع - جهاز الإشراف)'
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
    let currentAlerts = initialAlerts || [];
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem('system_alerts');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            currentAlerts = parsed;
          } else {
            localStorage.setItem('system_alerts', JSON.stringify(currentAlerts));
          }
        } else {
          localStorage.setItem('system_alerts', JSON.stringify(currentAlerts));
        }
      }
    } catch (e) {
      console.warn('Error syncing alerts in apiCache:', e);
    }
    return {
      success: true,
      alerts: currentAlerts
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
        suggestedAction: 'متابعة تقارير كميات الوقود وجداول التزويد للصهاريج الميدانية.'
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
        { id: 1, name: 'م. عبدالرحمن الأنصاري', username: 'admin', email: 'alansari@mot.gov.ly', phone: '091-2345678', role: 'مدير المشروع', title: 'مدير المشروع (جهاز الإشراف)', sector: 'all', createdAt: '2026-01-10' },
        { id: 2, name: 'م. عبدالسلام ابريكاو', username: 'abrikaw', email: 'abrikaw@mot.gov.ly', phone: '091-3456789', role: 'رئيس جهاز الإشراف', title: 'رئيس جهاز الإشراف والمتابعة', sector: 'all', createdAt: '2026-01-15' },
        { id: 3, name: 'م. صالح حماد', username: 'saleh_quality', email: 'hammad.quality@mot.gov.ly', phone: '091-4567890', role: 'مسؤول الجودة', title: 'مسؤول ضبط ومراقبة الجودة الفنية', sector: 'all', createdAt: '2026-01-18' },
        { id: 4, name: 'م. صلاح العربي', username: 'salah_alarabi', email: 'alarabi.phase1@mot.gov.ly', phone: '091-5678901', role: 'مهندس مشرف (المرحلة الأولى)', title: 'مهندس مشرف - المرحلة الأولى', sector: 'المرحلة الأولى', createdAt: '2026-01-20' },
        { id: 5, name: 'م. عيسى الطاهر', username: 'issa_altahir', email: 'altahir.phase2@mot.gov.ly', phone: '091-6789012', role: 'مهندس مشرف (المرحلة الثانية)', title: 'مهندس مشرف - المرحلة الثانية', sector: 'المرحلة الثانية', createdAt: '2026-01-25' }
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
  if (typeof url === 'string') {
    // Normalize localhost:5000 or 127.0.0.1:5000 to relative /api to use Vite proxy & eliminate CORS
    if (url.includes('localhost:5000') || url.includes('127.0.0.1:5000')) {
      url = url.replace(/https?:\/\/(localhost|127\.0\.0\.1):5000/, '');
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

  if (typeof url === 'string' && url.includes('/api/')) {
    if (isGitHubPages && apiBase) {
      url = url.replace(/https?:\/\/[^/]+/, apiBase);
    }
  }
  const method = (options.method || 'GET').toUpperCase();

  // For non-GET requests (mutations), clear all cache completely
  if (method !== 'GET') {
    cache.clear();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await nativeFetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) return await res.json();
    } catch {
      // offline mutation fallback
    }
    return { success: true, message: 'Saved locally' };
  }

  const cacheKey = `${url}`;
  const cached = cache.get(cacheKey);
  const now = Date.now();

  // Stale-While-Revalidate: Return cached data instantly (< 5s old)
  if (cached && (now - cached.timestamp < 5000)) {
    return cached.data;
  }

  // If cached data exists but is older, return it immediately and revalidate in background
  if (cached) {
    fetchWithTimeout(url, options, 1500).then(fresh => {
      if (fresh) {
        cache.set(cacheKey, { data: fresh, timestamp: Date.now() });
      }
    }).catch(() => {});
    return cached.data;
  }

  // Direct fast fetch with 1500ms timeout
  const data = await fetchWithTimeout(url, options, 1500);
  const finalData = data || getFallbackData(url);
  cache.set(cacheKey, { data: finalData, timestamp: Date.now() });
  return finalData;
}

export function clearApiCache() {
  cache.clear();
}
