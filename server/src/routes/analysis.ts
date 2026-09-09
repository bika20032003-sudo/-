import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/analysis/daily - التحليل التلقائي لليومية ومقارنة الأداء
router.get('/daily', async (req, res) => {
  try {
    const { date, sector } = req.query;
    const targetDate = date ? new Date(date as string) : new Date();
    
    // Day start and end for exact date querying
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 7 Days Range for Historical Comparison
    const sevenDaysAgo = new Date(startOfDay);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch related records in parallel
    const [
      allEquipment,
      todayEquipmentStatus,
      todayFuelLogs,
      historicalFuelLogs,
      todayCrusherLogs,
      historicalCrusherLogs,
      todaySharshoorLogs,
      todayReports,
      allIssues
    ] = await Promise.all([
      prisma.equipment.findMany(),
      prisma.equipmentStatus.findMany({ where: { date: { gte: startOfDay, lte: endOfDay } } }),
      prisma.fuelDispatchLog.findMany({ where: { date: { gte: startOfDay, lte: endOfDay } } }),
      prisma.fuelDispatchLog.findMany({ where: { date: { gte: sevenDaysAgo, lte: endOfDay } } }),
      prisma.crusherLog.findMany({ where: { date: { gte: startOfDay, lte: endOfDay } } }),
      prisma.crusherLog.findMany({ where: { date: { gte: sevenDaysAgo, lte: endOfDay } } }),
      prisma.sharshoorLog.findMany({ where: { date: { gte: startOfDay, lte: endOfDay } } }),
      prisma.dailyReport.findMany({ where: { date: { gte: startOfDay, lte: endOfDay } } }),
      prisma.issue.findMany({ orderBy: { date: 'desc' } })
    ]);

    // Filter by sector if specified
    const filterSector = (item: any) => {
      if (!sector || sector === 'all') return true;
      const s = String(sector);
      return item.sector?.includes(s) || item.location?.includes(s) || item.crusherName?.includes(s) || item.tankSource?.includes(s);
    };

    const eqFiltered = allEquipment.filter(filterSector);
    const fuelFiltered = todayFuelLogs.filter(filterSector);
    const crusherFiltered = todayCrusherLogs.filter(filterSector);
    const sharshoorFiltered = todaySharshoorLogs.filter(filterSector);

    // 1. الوضع التشغيلي للمعدات
    const totalEquipment = eqFiltered.length;
    const workingEquipment = eqFiltered.filter(e => e.status === 'operational' || e.status === 'active').length;
    const stoppedEquipment = eqFiltered.filter(e => e.status === 'stopped' || e.status === 'breakdown' || e.status === 'maintenance').length;
    const standbyEquipment = totalEquipment - workingEquipment - stoppedEquipment;
    const totalOperatingHours = eqFiltered.reduce((acc, curr) => acc + (curr.dailyHours || 0), 0);
    const estimatedStoppedHours = stoppedEquipment * 8;

    // 2. الوقود والسولار
    const totalFuelToday = fuelFiltered.reduce((acc, curr) => acc + (curr.liters || 0), 0);
    // Historical 7-day average fuel
    const histFuelTotal = historicalFuelLogs.filter(filterSector).reduce((acc, curr) => acc + (curr.liters || 0), 0);
    const avg7DaysFuel = Math.round(histFuelTotal / 7) || 3200;
    const fuelVariancePercentage = avg7DaysFuel > 0 ? Math.round(((totalFuelToday - avg7DaysFuel) / avg7DaysFuel) * 100) : 0;
    
    // Inventory balance estimation
    const totalFuelReceived = 10000; // default tank capacity / supply
    const fuelBalance = Math.max(0, 15000 - totalFuelToday);

    // 3. الكسارات والإنتاج
    const totalCrusherProd = crusherFiltered.reduce((acc, curr) => acc + (curr.dailyProductionTons || 0), 0);
    const totalCrushersOperating = crusherFiltered.length || (workingEquipment > 0 ? 2 : 0);
    const crusherHours = totalCrushersOperating * 9;
    const productivityPerHour = crusherHours > 0 ? Math.round(totalCrusherProd / crusherHours) : 0;

    const histCrusherTotal = historicalCrusherLogs.filter(filterSector).reduce((acc, curr) => acc + (curr.dailyProductionTons || 0), 0);
    const avg7DaysCrusher = Math.round(histCrusherTotal / 7) || 1200;
    const crusherVariancePercentage = avg7DaysCrusher > 0 ? Math.round(((totalCrusherProd - avg7DaysCrusher) / avg7DaysCrusher) * 100) : 0;

    // 4. الشرشور والركام
    const totalSharshoorProd = Math.round(totalCrusherProd * 0.6);
    const totalSharshoorDispatched = sharshoorFiltered.reduce((acc, curr) => acc + (curr.amountTons || 0), 0);
    const sharshoorBalance = Math.max(0, totalSharshoorProd - totalSharshoorDispatched);

    // 5. المشاكل والأعطال المستخرجة
    const issuesList = allIssues.filter(filterSector);

    // Smart Warnings / Anomaly Detection
    const smartWarnings: any[] = [];
    if (stoppedEquipment > 0) {
      smartWarnings.push({
        type: 'danger',
        title: `توقف ${stoppedEquipment} معدات ميدانية`,
        message: `يوجد ${stoppedEquipment} معدات متوقفة عن العمل اليوم بسبب أعطال أو صيانة مجدولة.`,
        suggestedAction: 'توجيه فريق الصيانة فوراً لإعادة المعدات للخدمة.'
      });
    }
    if (fuelVariancePercentage > 15) {
      smartWarnings.push({
        type: 'warning',
        title: 'استهلاك السولار أعلى من المتوسط',
        message: `استهلاك السولار اليوم (${totalFuelToday.toLocaleString()} لتر) أعلى من متوسط آخر 7 أيام (${avg7DaysFuel.toLocaleString()} لتر) بنسبة +${fuelVariancePercentage}%.`,
        suggestedAction: 'تدقيق أذونات الصرف وفحص استهلاك المحركات المرتفعة.'
      });
    }
    if (crusherVariancePercentage < -15 && totalCrusherProd > 0) {
      smartWarnings.push({
        type: 'warning',
        title: 'إنتاجية الكسارات منخفضة عن المعدل',
        message: `الإنتاج اليوم (${totalCrusherProd.toLocaleString()} طن) أقل من متوسط 7 أيام (${avg7DaysCrusher.toLocaleString()} طن) بنسبة ${crusherVariancePercentage}%.`,
        suggestedAction: 'فحص سيور التغذية والمولدات في موقع الكسارة.'
      });
    }
    if (fuelBalance < 4000 && fuelBalance > 0) {
      smartWarnings.push({
        type: 'danger',
        title: 'انخفاض مخزون السولار',
        message: `رصيد السولار المتبقي (${fuelBalance.toLocaleString()} لتر) أقل من حد الأمان التشغيلي.`,
        suggestedAction: 'طلب توريد صهريج ديزل عاجل من شركة البريقة.'
      });
    }

    res.json({
      success: true,
      analysisDate: targetDate.toISOString().split('T')[0],
      sector: sector || 'all',
      operational: {
        totalEquipment,
        workingEquipment,
        stoppedEquipment,
        standbyEquipment,
        totalOperatingHours,
        estimatedStoppedHours,
        readinessRate: totalEquipment > 0 ? Math.round((workingEquipment / totalEquipment) * 100) : 0
      },
      fuel: {
        dispensedToday: totalFuelToday,
        avg7Days: avg7DaysFuel,
        variancePercentage: fuelVariancePercentage,
        isHigherThanAverage: fuelVariancePercentage > 0,
        fuelBalance,
        totalReceived: totalFuelReceived
      },
      crushers: {
        productionToday: totalCrusherProd,
        avg7Days: avg7DaysCrusher,
        variancePercentage: crusherVariancePercentage,
        operatingCrushers: totalCrushersOperating,
        operatingHours: crusherHours,
        productivityPerHour
      },
      sharshoor: {
        producedToday: totalSharshoorProd,
        dispatchedToday: totalSharshoorDispatched,
        currentBalance: sharshoorBalance
      },
      issues: issuesList,
      warnings: smartWarnings,
      reportsCount: todayReports.length
    });
  } catch (error) {
    console.error('Error computing daily analysis:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Issues CRUD Endpoints
router.get('/issues', async (req, res) => {
  try {
    const issues = await prisma.issue.findMany({
      orderBy: { date: 'desc' }
    });
    res.json({ success: true, issues });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

router.post('/issues', async (req, res) => {
  try {
    const { sector, equipmentCode, equipmentName, category, title, description, severity, suggestedAction } = req.body;
    const newIssue = await prisma.issue.create({
      data: {
        sector: sector || 'القطعة A',
        equipmentCode,
        equipmentName,
        category: category || 'عطل',
        title,
        description,
        severity: severity || 'warning',
        suggestedAction: suggestedAction || null
      }
    });
    res.json({ success: true, issue: newIssue });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

router.put('/issues/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, suggestedAction, category, description } = req.body;
    const updated = await prisma.issue.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(suggestedAction ? { suggestedAction } : {}),
        ...(category ? { category } : {}),
        ...(description ? { description } : {})
      }
    });
    res.json({ success: true, issue: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

router.delete('/issues/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.issue.delete({ where: { id } });
    res.json({ success: true, message: 'Issue deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

export default router;
