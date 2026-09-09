import express from 'express';
import { store } from '../store.js';

const router = express.Router();

// GET /api/plans/suggest
router.get('/suggest', (req, res) => {
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);

  res.json({
    success: true,
    suggestedPlan: {
      planDate: tomorrowDate.toISOString().split('T')[0],
      title: `خطة التشغيل الميداني المقترحة ليوم ${tomorrowDate.toLocaleDateString('ar-LY')}`,
      description: 'مقترح ذكي مولد آلياً من نتائج اليومية وحالة المعدات والكسارات',
      items: [
        { id: 1, targetType: 'crusher', targetCode: 'CRU-1', targetName: 'الكسارة رقم 1 (الشمالية)', sector: 'القطعة A', currentStatus: 'تشغيل', plannedDecision: 'تشغيل', targetQuantity: 900, targetUnit: 'طن', reason: 'أداء تشغيلي مستقر وتأمين رصيد الشرشور', notes: 'إنتاج مستهدف لطبقة الأساس الركامي' },
        { id: 2, targetType: 'crusher', targetCode: 'CRU-2', targetName: 'الكسارة رقم 2 (الوسطى)', sector: 'القطعة B', currentStatus: 'تشغيل', plannedDecision: 'تشغيل', targetQuantity: 800, targetUnit: 'طن', reason: 'استمرار الإنتاج لتغذية القطاع الأوسط', notes: 'متابعة حرارة المولد' },
        { id: 3, targetType: 'equipment', targetCode: 'EQ-101', targetName: 'لودر CAT 966H', sector: 'القطعة A', currentStatus: 'تشغيل', plannedDecision: 'تشغيل', targetQuantity: 8, targetUnit: 'ساعة', reason: 'تغذية الكسارة وتحميل الشاحنات', notes: 'السائق: سالم علي' },
        { id: 4, targetType: 'fuel', targetCode: 'FUEL-RES', targetName: 'مخصصات السولار الميداني', sector: 'القطعة A + B', currentStatus: 'صرف', plannedDecision: 'تخصيص', targetQuantity: 4250, targetUnit: 'لتر', reason: 'تأمين وقود تشغيل الكسارات والحفارات', notes: 'توزيع الحصص على الصهاريج الرئيسية' }
      ]
    }
  });
});

// GET /api/plans
router.get('/', (req, res) => {
  try {
    const plans = store.getPlans();
    res.json({ success: true, plans });
  } catch (error) {
    res.json({ success: true, plans: [] });
  }
});

// GET /api/plans/latest
router.get('/latest', (req, res) => {
  try {
    const plan = store.getLatestPlan();
    res.json({ success: true, plan });
  } catch (error) {
    res.json({ success: true, plan: null });
  }
});

// POST /api/plans
router.post('/', (req, res) => {
  try {
    const { title, planDate, items, notes } = req.body;
    const newPlan = store.addPlan({ title, planDate, items, notes });
    res.json({ success: true, plan: newPlan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ أثناء إنشاء الخطة' });
  }
});

// POST /api/plans/:id/approve
router.post('/:id/approve', (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;
    const approved = store.approvePlan(id, approvedBy);
    res.json({ success: true, plan: approved, message: 'تم اعتماد خطة التشغيل بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ أثناء اعتماد الخطة' });
  }
});

// GET /api/plans/compare
router.get('/compare', (req, res) => {
  const latestPlan = store.getLatestPlan();
  const eqList = store.getEquipment();
  const crusherLogs = store.getCrushers();
  const fuelList = store.getFuel();

  const totalProd = crusherLogs.reduce((acc, curr) => acc + (curr.dailyProductionTons || 0), 0);
  const totalFuel = fuelList.reduce((acc, curr) => acc + (curr.liters || 0), 0);

  const comparison = (latestPlan?.items || []).map(item => {
    let actual = 0;
    if (item.targetType === 'crusher') actual = totalProd / 2;
    else if (item.targetType === 'fuel') actual = totalFuel;
    else if (item.targetType === 'equipment') actual = 7.5;

    const planned = Number(item.targetQuantity) || 1;
    const variance = actual - planned;
    const percentage = Math.min(150, Math.round((actual / planned) * 100));

    return {
      ...item,
      actualQuantity: actual,
      variance,
      percentage,
      statusBadge: percentage >= 90 ? 'achieved' : percentage >= 70 ? 'acceptable' : 'lagging'
    };
  });

  res.json({
    success: true,
    planDate: latestPlan?.planDate || new Date().toISOString(),
    items: comparison
  });
});

export default router;
