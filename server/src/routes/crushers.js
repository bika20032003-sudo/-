import { Router } from 'express';
import { store } from '../store.js';

const router = Router();

// Get all crusher logs (including crusher reports)
router.get('/', (req, res) => {
  try {
    const { sector } = req.query;
    const logs = store.getCrushers(sector);
    const reports = store.getReports(sector);
    const crusherReports = reports.filter(r => Number(r.productionAmount) > 0 || r.reportType?.includes('كسار'))
      .map(r => ({
        id: r.id,
        name: r.crusherName || 'كسارة الموقع',
        sector: r.sector || 'القطعة A',
        dailyProductionTons: Number(r.productionAmount) || 0,
        sharshoorTons: Number(r.salesAmount) || Math.round((Number(r.productionAmount) || 0) * 0.6),
        notes: r.notes || r.materialName || 'تقرير إنتاج ميداني معتمد',
        imageUrl: r.imageUrl,
        date: r.date,
        fromReport: true
      }));

    const existingIds = new Set(logs.map(l => l.id));
    const combined = [...logs];
    for (const cr of crusherReports) {
      if (!existingIds.has(cr.id)) combined.push(cr);
    }
    res.json({ success: true, logs: combined });
  } catch (error) {
    res.json({ success: true, logs: [] });
  }
});

// Create new crusher log
router.post('/', (req, res) => {
  try {
    const newLog = store.addCrusher(req.body);
    res.json({ success: true, log: newLog });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ أثناء الحفظ' });
  }
});

// Update crusher log
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    let updated = store.updateCrusher(id, req.body);
    // Also update matching report in store if ID originated from a report
    const reportUpdated = store.updateReport(id, {
      crusherName: req.body.name,
      sector: req.body.sector,
      productionAmount: req.body.dailyProductionTons !== undefined ? Number(req.body.dailyProductionTons) : undefined,
      salesAmount: req.body.sharshoorTons !== undefined ? Number(req.body.sharshoorTons) : undefined,
      imageUrl: req.body.imageUrl
    });
    if (!updated && reportUpdated) {
      updated = {
        id: reportUpdated.id,
        name: reportUpdated.crusherName,
        sector: reportUpdated.sector,
        dailyProductionTons: reportUpdated.productionAmount,
        sharshoorTons: reportUpdated.salesAmount,
        notes: reportUpdated.notes,
        imageUrl: reportUpdated.imageUrl
      };
    }
    res.json({ success: true, log: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ أثناء التعديل' });
  }
});

// Delete crusher log
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    store.deleteCrusher(id);
    store.deleteReport(id);
    if (store.data?.reports) {
      const rep = store.data.reports.find(r => r.id === Number(id) || String(r.id) === String(id));
      if (rep) {
        rep.productionAmount = 0;
        store.saveToDiskSync();
      }
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

export default router;
