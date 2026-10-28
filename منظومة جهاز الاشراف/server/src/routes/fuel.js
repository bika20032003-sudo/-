import { Router } from 'express';
import { store } from '../store.js';

const router = Router();

// Get all fuel dispatches (including fuel reports)
router.get('/', (req, res) => {
  try {
    const { sector } = req.query;
    const logs = store.getFuel(sector);
    const reports = store.getReports(sector);
    const fuelReports = reports.filter(r => Number(r.fuelAmount) > 0 || r.reportType?.includes('وقود'))
      .map(r => ({
        id: r.id,
        ticketNumber: `REP-${r.reportNumber || r.id}`,
        date: r.date,
        equipmentName: `معدات ${r.sector || 'الموقع'} (${r.crusherName || 'القطاع'})`,
        liters: Number(r.fuelAmount) || Number(r.productionAmount) || 0,
        driverName: r.uploadedBy || 'سائق الموقع',
        pumpOperator: 'مسؤول الصهريج الميداني',
        tankSource: `صهريج ${r.sector || 'الموقع العام'}`,
        notes: r.notes || 'تزويد محروقات موثق باليومية',
        imageUrl: r.imageUrl,
        fromReport: true
      }));

    const existingIds = new Set(logs.map(l => l.id));
    const combined = [...logs];
    for (const fr of fuelReports) {
      if (!existingIds.has(fr.id)) combined.push(fr);
    }
    res.json({ success: true, logs: combined });
  } catch (error) {
    res.json({ success: true, logs: [] });
  }
});

// Create new fuel dispatch
router.post('/', (req, res) => {
  try {
    const newLog = store.addFuel(req.body);
    res.json({ success: true, log: newLog });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ أثناء الحفظ' });
  }
});

// Update fuel dispatch
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    let updated = store.updateFuel(id, req.body);
    // Also check if ID matches a report in store
    const reportUpdated = store.updateReport(id, {
      fuelAmount: req.body.liters !== undefined ? Number(req.body.liters) : undefined,
      notes: req.body.notes,
      imageUrl: req.body.imageUrl
    });
    if (!updated && reportUpdated) {
      updated = {
        id: reportUpdated.id,
        ticketNumber: `REP-${reportUpdated.reportNumber || reportUpdated.id}`,
        equipmentName: `معدات ${reportUpdated.sector || 'الموقع'}`,
        liters: Number(reportUpdated.fuelAmount) || 0,
        notes: reportUpdated.notes,
        imageUrl: reportUpdated.imageUrl
      };
    }
    res.json({ success: true, log: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ أثناء التعديل' });
  }
});

// Delete fuel dispatch
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    store.deleteFuel(id);
    store.deleteReport(id);
    if (store.data?.reports) {
      const rep = store.data.reports.find(r => r.id === Number(id) || String(r.id) === String(id));
      if (rep) {
        rep.fuelAmount = 0;
        store.saveToDiskSync();
      }
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

export default router;
