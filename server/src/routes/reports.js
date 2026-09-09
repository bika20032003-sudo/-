import express from 'express';
import { store } from '../store.js';

const router = express.Router();

// GET /api/reports (with optional ?sector=A or ?sector=B)
router.get('/', (req, res) => {
  try {
    const { sector } = req.query;
    const reports = store.getReports(sector || null);
    res.json({ success: true, reports });
  } catch (error) {
    res.json({ success: true, reports: [] });
  }
});

// POST /api/reports/upload or /api/reports/create
const handleCreateReport = (req, res) => {
  try {
    const newReport = store.addReport(req.body);
    res.json({ 
      success: true, 
      report: newReport, 
      message: newReport.status === 'pending_review' 
        ? 'تم رفع التقرير بنجاح وتوجيهه لمدير القطاعات للمراجعة والاعتماد'
        : 'تم حفظ التقرير واعتماده وتوجيه البيانات بنجاح' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

router.post('/upload', handleCreateReport);
router.post('/create', handleCreateReport);

// PUT /api/reports/:id/approve (Sector Manager approves report)
router.put('/:id/approve', (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;
    const approved = store.approveReport(id, approvedBy || 'مدير القطاعات');
    if (approved) {
      res.json({ success: true, report: approved, message: 'تم اعتماد التقرير وتثبيت بياناته رسمياً' });
    } else {
      res.status(404).json({ success: false, message: 'التقرير غير موجود' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/reports/:id/reject (Sector Manager requests revision)
router.put('/:id/reject', (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const rejected = store.rejectReport(id, reason || 'مطلوب مراجعة الكميات');
    if (rejected) {
      res.json({ success: true, report: rejected, message: 'تم إرجاع التقرير للقطاع للتعديل والمراجعة' });
    } else {
      res.status(404).json({ success: false, message: 'التقرير غير موجود' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/reports/:id
router.delete('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    store.data.reports = (store.data.reports || []).filter(r => r.id !== id);
    store.scheduleSave();
    res.json({ success: true, message: 'تم حذف التقرير' });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

export default router;
