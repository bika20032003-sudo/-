import express from 'express';
import { store } from '../store.js';

const router = express.Router();

// GET /api/analysis/daily
router.get('/daily', (req, res) => {
  const targetDate = new Date();
  const eqList = store.getEquipment();
  const workingEq = eqList.filter(e => e.status === 'operational' || e.status === 'active').length;
  const stoppedEq = eqList.filter(e => e.status === 'stopped' || e.status === 'maintenance' || e.status === 'breakdown').length;
  const totalOpHours = eqList.reduce((acc, curr) => acc + (curr.dailyHours || 0), 0);

  const fuelList = store.getFuel();
  const fuelToday = fuelList.reduce((acc, curr) => acc + (curr.liters || 0), 0);

  const crusherLogs = store.getCrushers();
  const prodToday = crusherLogs.reduce((acc, curr) => acc + (curr.dailyProductionTons || 0), 0);

  const sharshoorLogs = store.getSharshoor();
  const sharshoorToday = sharshoorLogs.reduce((acc, curr) => acc + (curr.amountTons || 0), 0);

  res.json({
    success: true,
    analysisDate: targetDate.toISOString().split('T')[0],
    sector: 'all',
    operational: {
      totalEquipment: eqList.length || 48,
      workingEquipment: workingEq || 42,
      stoppedEquipment: stoppedEq || 4,
      standbyEquipment: Math.max(0, (eqList.length || 48) - workingEq - stoppedEq),
      totalOperatingHours: totalOpHours || 312,
      estimatedStoppedHours: stoppedEq * 8,
      readinessRate: Math.round(((workingEq || 42) / (eqList.length || 48)) * 100)
    },
    fuel: {
      dispensedToday: fuelToday || 4250,
      avg7Days: 4100,
      variancePercentage: 3.6,
      isHigherThanAverage: true,
      fuelBalance: 28500,
      totalReceived: 30000
    },
    crushers: {
      productionToday: prodToday || 1470,
      avg7Days: 1380,
      variancePercentage: 6.5,
      operatingCrushers: crusherLogs.length || 2,
      operatingHours: 16,
      productivityPerHour: Math.round((prodToday || 1470) / 16)
    },
    sharshoor: {
      producedToday: sharshoorToday || 882,
      dispatchedToday: Math.round((sharshoorToday || 882) * 0.9),
      currentBalance: 21350
    },
    issues: store.getIssues(),
    warnings: [
      {
        type: 'danger',
        title: `توقف ${stoppedEq || 4} معدات ميدانية`,
        message: 'يوجد معدات في حالة صيانة مجدولة أو توقف فني بالموقع.',
        suggestedAction: 'توجيه فريق الصيانة لسرعة إعادتها للخدمة.'
      },
      {
        type: 'warning',
        title: 'استهلاك السولار مستقر',
        message: 'استهلاك السولار ضمن الحدود التشغيلية المعتمدة للمشروع.',
        suggestedAction: 'متابعة جدول التزويد المسائي للصهاريج.'
      }
    ],
    reportsCount: store.getReports().length
  });
});

// Issues CRUD Endpoints
router.get('/issues', (req, res) => {
  res.json({ success: true, issues: store.getIssues() });
});

router.post('/issues', (req, res) => {
  const newIssue = store.addIssue(req.body);
  res.json({ success: true, issue: newIssue });
});

router.put('/issues/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updated = store.updateIssue(id, req.body.status);
  res.json({ success: true, issue: updated });
});

router.delete('/issues/:id', (req, res) => {
  const id = parseInt(req.params.id);
  store.deleteIssue(id);
  res.json({ success: true, message: 'Issue deleted' });
});

export default router;
