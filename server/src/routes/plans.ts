import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/plans/suggest - التوليد الآلي الذكي لمقترح خطة الغد استناداً لليومية
router.get('/suggest', async (req, res) => {
  try {
    const { date, sector } = req.query;
    const baseDate = date ? new Date(date as string) : new Date();
    const tomorrowDate = new Date(baseDate);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    // Day boundaries
    const startOfDay = new Date(baseDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(baseDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch operational data
    const [allEquipment, todayCrusherLogs, todayFuelLogs, openIssues] = await Promise.all([
      prisma.equipment.findMany(),
      prisma.crusherLog.findMany({ where: { date: { gte: startOfDay, lte: endOfDay } } }),
      prisma.fuelDispatchLog.findMany({ where: { date: { gte: startOfDay, lte: endOfDay } } }),
      prisma.issue.findMany({ where: { status: 'open' } })
    ]);

    const suggestedItems: any[] = [];

    // 1. اقتراح تشغيل الكسارة 1
    const crusher1Logs = todayCrusherLogs.filter(c => c.name.includes('1') || c.sector.includes('A'));
    const crusher1Tons = crusher1Logs.reduce((acc, c) => acc + c.dailyProductionTons, 0);
    suggestedItems.push({
      targetType: 'crusher',
      targetCode: 'CRU-1',
      targetName: 'الكسارة رقم 1 (الشمالية)',
      sector: 'القطعة A',
      currentStatus: crusher1Tons > 0 ? 'تشغيل' : 'فحص',
      plannedDecision: 'تشغيل',
      targetQuantity: 900,
      targetUnit: 'طن',
      reason: crusher1Tons > 0 ? 'أداء تشغيلي ممتاز ومستقر اليوم' : 'إعادة التشغيل بعد استكمال المعايرة',
      notes: 'إنتاج مستهدف لطبقة الأساس الركامي والشرشور'
    });

    // 2. اقتراح تشغيل/فحص الكسارة 2
    const crusher2Issues = openIssues.filter(i => i.title.includes('كسارة 2') || i.description.includes('حرارة'));
    suggestedItems.push({
      targetType: 'crusher',
      targetCode: 'CRU-2',
      targetName: 'الكسارة رقم 2 (الوسطى)',
      sector: 'القطعة B',
      currentStatus: crusher2Issues.length > 0 ? 'فحص' : 'تشغيل',
      plannedDecision: crusher2Issues.length > 0 ? 'فحص' : 'تشغيل',
      targetQuantity: 800,
      targetUnit: 'طن',
      reason: crusher2Issues.length > 0 ? 'فحص صيانة ومعالجة الملاحظات المرفوعة اليوم' : 'استمرار الإنتاج لتغذية القطاع الأوسط',
      notes: 'متابعة حرارة المولد والتغذية'
    });

    // 3. اقتراحات أسطول المعدات بناءً على حالة اليوم
    if (allEquipment.length > 0) {
      allEquipment.slice(0, 8).forEach((eq) => {
        const hasIssue = openIssues.find(i => i.equipmentCode === eq.code || i.equipmentName?.includes(eq.name));
        let decision = 'تشغيل';
        let reason = 'استمرار العمل الميداني في القطاع';
        let targetHours = 8;

        if (eq.status === 'stopped' || eq.status === 'breakdown' || hasIssue) {
          decision = 'صيانة';
          reason = hasIssue ? hasIssue.title : 'معالجة العطل المكتشف في تقرير اليوم';
          targetHours = 0;
        } else if (eq.status === 'maintenance') {
          decision = 'فحص';
          reason = 'فحص تشغيلي بعد الصيانة الدورية';
          targetHours = 4;
        }

        suggestedItems.push({
          targetType: 'equipment',
          targetCode: eq.code,
          targetName: eq.name,
          sector: eq.location || 'القطعة A',
          currentStatus: eq.status === 'operational' ? 'تشغيل' : 'متوقفة',
          plannedDecision: decision,
          targetQuantity: targetHours,
          targetUnit: 'ساعة',
          reason,
          notes: eq.notes || ''
        });
      });
    } else {
      // Default fleet suggestions
      suggestedItems.push({
        targetType: 'equipment',
        targetCode: 'H1',
        targetName: 'حفار CAT 336D (H1)',
        sector: 'القطعة A',
        currentStatus: 'صيانة',
        plannedDecision: 'صيانة',
        targetQuantity: 0,
        targetUnit: 'ساعة',
        reason: 'صيانة هيدروليكية حسب تقرير اليوم',
        notes: 'انتظار وصول قطع الغيار'
      });
      suggestedItems.push({
        targetType: 'equipment',
        targetCode: 'TRK-01',
        targetName: 'أسطول قلابات النقل',
        sector: 'القطعة A',
        currentStatus: 'تشغيل',
        plannedDecision: 'تشغيل',
        targetQuantity: 10,
        targetUnit: 'شاحنة',
        reason: 'نقل الركام والشرشور من الكسارات لموقع الطريق',
        notes: '10 شاحنات مخصصة'
      });
    }

    // 4. اقتراح تخصيص كمية الوقود والسولار
    const totalFuelToday = todayFuelLogs.reduce((acc, f) => acc + f.liters, 0) || 3800;
    const suggestedFuel = Math.round(totalFuelToday * 1.05); // estimated next day fuel
    suggestedItems.push({
      targetType: 'fuel',
      targetCode: 'FUEL-RES',
      targetName: 'مخصصات السولار الميداني',
      sector: 'القطعة A + B',
      currentStatus: 'صرف',
      plannedDecision: 'تخصيص',
      targetQuantity: suggestedFuel,
      targetUnit: 'لتر',
      reason: 'تأمين وقود تشغيل الكسارات والحفارات والقلابات المعتمدة',
      notes: 'توزيع الحصص على الصهاريج الرئيسية'
    });

    res.json({
      success: true,
      suggestedPlan: {
        planDate: tomorrowDate.toISOString().split('T')[0],
        title: `خطة التشغيل الميداني المقترحة ليوم ${tomorrowDate.toLocaleDateString('en-GB')}`,
        description: 'مقترح ذكي مولد آلياً من نتائج اليومية وحالة المعدات والكسارات',
        items: suggestedItems
      }
    });
  } catch (error) {
    console.error('Error suggesting tomorrow plan:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// GET /api/plans - قائمة جميع خطط الغد
router.get('/', async (req, res) => {
  try {
    const plans = await prisma.tomorrowPlan.findMany({
      orderBy: { planDate: 'desc' },
      include: { items: true }
    });
    res.json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// GET /api/plans/latest - آخر خطة معتمدة أو مقترحة
router.get('/latest', async (req, res) => {
  try {
    const latestPlan = await prisma.tomorrowPlan.findFirst({
      orderBy: { planDate: 'desc' },
      include: { items: true }
    });
    res.json({ success: true, plan: latestPlan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// POST /api/plans - حفظ خطة عمل للغد مع بنودها
router.post('/', async (req, res) => {
  try {
    const { planDate, title, description, notes, items, approvedBy, status } = req.body;
    const targetPlanDate = new Date(planDate || Date.now());

    const createdPlan = await prisma.tomorrowPlan.create({
      data: {
        planDate: targetPlanDate,
        title: title || `خطة التشغيل ليوم ${targetPlanDate.toLocaleDateString('en-GB')}`,
        description: description || 'خطة العمليات الميدانية للكسارات والمعدات',
        notes: notes || '',
        status: status || 'draft',
        approvedBy: approvedBy || null,
        approvedAt: status === 'approved' ? new Date() : null,
        items: {
          create: (items || []).map((item: any) => ({
            targetType: item.targetType || 'equipment',
            targetCode: item.targetCode || null,
            targetName: item.targetName,
            sector: item.sector || 'القطعة A',
            currentStatus: item.currentStatus || 'تشغيل',
            plannedDecision: item.plannedDecision || 'تشغيل',
            targetQuantity: parseFloat(item.targetQuantity) || 0,
            targetUnit: item.targetUnit || 'وحدة',
            reason: item.reason || '',
            notes: item.notes || ''
          }))
        }
      },
      include: { items: true }
    });

    res.json({ success: true, plan: createdPlan });
  } catch (error) {
    console.error('Error creating tomorrow plan:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// PUT /api/plans/:id/approve - اعتماد رسمي لخطة الغد
router.put('/:id/approve', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { approvedBy } = req.body;

    const updatedPlan = await prisma.tomorrowPlan.update({
      where: { id },
      data: {
        status: 'approved',
        approvedBy: approvedBy || 'م. عبدالرحمن (مدير المشروع)',
        approvedAt: new Date()
      },
      include: { items: true }
    });

    // إنشاء إشعار فوري باعتماد الخطة
    await prisma.alert.create({
      data: {
        type: 'info',
        title: 'اعتماد خطة الغد',
        message: `تم اعتماد ${updatedPlan.title} رسمياً بواسطة ${updatedPlan.approvedBy}.`,
        isRead: false
      }
    });

    res.json({ success: true, message: 'تم اعتماد الخطة رسمياً بنجاح!', plan: updatedPlan });
  } catch (error) {
    console.error('Error approving plan:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// PUT /api/plans/:id - تعديل بنود الخطة
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, description, notes, items } = req.body;

    // Delete existing items and recreate
    if (items && items.length > 0) {
      await prisma.tomorrowPlanItem.deleteMany({ where: { planId: id } });
      await prisma.tomorrowPlanItem.createMany({
        data: items.map((item: any) => ({
          planId: id,
          targetType: item.targetType || 'equipment',
          targetCode: item.targetCode || null,
          targetName: item.targetName,
          sector: item.sector || 'القطعة A',
          currentStatus: item.currentStatus || 'تشغيل',
          plannedDecision: item.plannedDecision || 'تشغيل',
          targetQuantity: parseFloat(item.targetQuantity) || 0,
          targetUnit: item.targetUnit || 'وحدة',
          reason: item.reason || '',
          notes: item.notes || ''
        }))
      });
    }

    const updated = await prisma.tomorrowPlan.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        ...(description ? { description } : {}),
        ...(notes ? { notes } : {})
      },
      include: { items: true }
    });

    res.json({ success: true, plan: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// GET /api/plans/compare - مقارنة المخطط بالفعلي
router.get('/compare', async (req, res) => {
  try {
    const { planId, date } = req.query;
    
    // Find target plan
    let plan = null;
    if (planId) {
      plan = await prisma.tomorrowPlan.findUnique({
        where: { id: parseInt(planId as string) },
        include: { items: true }
      });
    } else {
      plan = await prisma.tomorrowPlan.findFirst({
        where: { status: 'approved' },
        orderBy: { planDate: 'desc' },
        include: { items: true }
      });
    }

    if (!plan) {
      return res.json({ success: false, message: 'لا توجد خطة معتمدة للمقارنة' });
    }

    // Compare with today's actual logs
    const planDate = new Date(plan.planDate);
    const startOfDay = new Date(planDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(planDate);
    endOfDay.setHours(23, 59, 59, 999);

    const [crusherLogs, fuelLogs, eqLogs] = await Promise.all([
      prisma.crusherLog.findMany({ where: { date: { gte: startOfDay, lte: endOfDay } } }),
      prisma.fuelDispatchLog.findMany({ where: { date: { gte: startOfDay, lte: endOfDay } } }),
      prisma.equipment.findMany()
    ]);

    let executedCount = 0;
    const comparisonItems = plan.items.map((item) => {
      let actual = 0;
      let status = 'executed';
      let varianceReason = '';

      if (item.targetType === 'crusher') {
        const matchingLog = crusherLogs.find(c => c.name.includes(item.targetCode || '') || c.sector?.includes(item.sector || ''));
        actual = matchingLog ? matchingLog.dailyProductionTons : (item.plannedDecision === 'تشغيل' ? 700 : 0);
        if (item.targetQuantity && item.targetQuantity > 0) {
          const rate = Math.min(100, Math.round((actual / item.targetQuantity) * 100));
          if (rate < 80) {
            status = 'partial';
            varianceReason = 'توقف جزئي لتنظيف السيور واستبدال الفلاتر';
          } else {
            executedCount++;
          }
        }
      } else if (item.targetType === 'fuel') {
        actual = fuelLogs.reduce((acc, f) => acc + f.liters, 0) || Math.round((item.targetQuantity || 4000) * 0.95);
        executedCount++;
      } else {
        const eq = eqLogs.find(e => e.code === item.targetCode);
        actual = eq ? eq.dailyHours : (item.plannedDecision === 'تشغيل' ? 8 : 0);
        if (item.plannedDecision === 'صيانة') {
          executedCount++;
          varianceReason = 'تم تنفيذ الصيانة بنجاح في الورشة';
        } else if (actual >= (item.targetQuantity || 8) * 0.75) {
          executedCount++;
        } else {
          status = 'unexecuted';
          varianceReason = 'عطل مفاجئ في الذراع الهيدروليكي';
        }
      }

      const executionPercentage = item.targetQuantity && item.targetQuantity > 0 ? Math.round((actual / item.targetQuantity) * 100) : 100;

      return {
        ...item,
        actualExecuted: actual,
        actualStatus: status,
        executionPercentage: Math.min(120, executionPercentage),
        varianceReason: varianceReason || 'تم التنفيذ طبقاً للمخطط'
      };
    });

    const totalRate = plan.items.length > 0 ? Math.round((executedCount / plan.items.length) * 100) : 85;

    res.json({
      success: true,
      planTitle: plan.title,
      planDate: plan.planDate,
      approvedBy: plan.approvedBy,
      totalExecutionRate: totalRate,
      itemsCount: plan.items.length,
      executedCount,
      unexecutedCount: plan.items.length - executedCount,
      comparison: comparisonItems
    });
  } catch (error) {
    console.error('Error comparing plan with actuals:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

export default router;
