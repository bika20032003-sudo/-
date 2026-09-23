import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  FileSpreadsheet, 
  Eye, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  Edit2, 
  Trash2, 
  Camera, 
  Calendar,
  Layers,
  MapPin
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { fastFetch, clearApiCache } from '../utils/apiCache';

export const DailyReportsView: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [viewModalReport, setViewModalReport] = useState<any | null>(null);
  const [editModalReport, setEditModalReport] = useState<any | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    materialName: '',
    crusherName: '',
    productionAmount: '',
    date: '',
    notes: ''
  });

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const data: any = await fastFetch('http://localhost:5000/api/reports');
      let list = data && data.reports ? data.reports : (Array.isArray(data) ? data : []);

      try {
        const deletedSet = new Set(JSON.parse(localStorage.getItem('deleted_report_ids') || '[]'));
        const local = JSON.parse(localStorage.getItem('local_reports') || '[]');
        const existingIds = new Set(list.map((r: any) => String(r.id || r.reportNumber)));
        const newOnes = local.filter((r: any) => 
          !deletedSet.has(String(r.id)) && 
          !deletedSet.has(String(r.reportNumber)) && 
          !existingIds.has(String(r.id || r.reportNumber))
        );
        list = [...newOnes, ...list];
        list = list.filter((r: any) => !deletedSet.has(String(r.id)) && !deletedSet.has(String(r.reportNumber)));
      } catch (storageErr) {
        console.warn('Storage error in DailyReportsView.tsx:', storageErr);
      }

      setReports(list);
    } catch (error) {
      console.error('Failed to fetch daily reports', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    const handleSync = () => {
      fetchReports();
    };
    window.addEventListener('report-created', handleSync);
    window.addEventListener('report-updated', handleSync);
    window.addEventListener('report-deleted', handleSync);

    return () => {
      window.removeEventListener('report-created', handleSync);
      window.removeEventListener('report-updated', handleSync);
      window.removeEventListener('report-deleted', handleSync);
    };
  }, []);

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalReport) return;

    try {
      const targetId = editModalReport.id;
      const targetNum = editModalReport.reportNumber;
      try {
        await fetch(`http://localhost:5000/api/reports/${targetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editFormData)
        });
      } catch (err) {
        console.warn('API update offline, persisting locally');
      }

      setReports(reports.map((r: any) => (String(r.id) === String(targetId) || String(r.reportNumber) === String(targetNum)) ? { ...r, ...editFormData } : r));

      try {
        const local = JSON.parse(localStorage.getItem('local_reports') || '[]');
        const updatedLocal = local.map((r: any) => (String(r.id) === String(targetId) || String(r.reportNumber) === String(targetNum)) ? { ...r, ...editFormData } : r);
        localStorage.setItem('local_reports', JSON.stringify(updatedLocal));
      } catch (storageErr) {}

      window.dispatchEvent(new CustomEvent('report-updated', { detail: { id: targetId, ...editFormData } }));
      setEditModalReport(null);
    } catch (error) {
      alert('تعذر تحديث بيانات التقرير.');
    }
  };

  // Handle Delete
  const handleDeleteReport = async (id: any, reportNumber: any, title?: string) => {
    const targetId = String(id || '');
    const targetNum = String(reportNumber || '');
    const displayName = targetNum ? `${targetNum} (${title || ''})` : (title || targetId);

    if (!window.confirm(`هل أنت متأكد من حذف التقرير (${displayName}) نهائياً؟`)) return;

    try {
      // 1. Remove from state immediately
      setReports((prev: any[]) => prev.filter(r => {
        const rId = String(r.id || '');
        const rNum = String(r.reportNumber || '');
        if (targetId && rId === targetId) return false;
        if (targetNum && rNum === targetNum) return false;
        if (targetNum && rId === targetNum) return false;
        if (targetId && rNum === targetId) return false;
        return true;
      }));

      // 2. Persist in localStorage
      try {
        const deleted = JSON.parse(localStorage.getItem('deleted_report_ids') || '[]');
        if (targetId && !deleted.includes(targetId)) deleted.push(targetId);
        if (targetNum && !deleted.includes(targetNum)) deleted.push(targetNum);
        localStorage.setItem('deleted_report_ids', JSON.stringify(deleted));

        const local = JSON.parse(localStorage.getItem('local_reports') || '[]');
        const updatedLocal = local.filter((r: any) => {
          const rId = String(r.id || '');
          const rNum = String(r.reportNumber || '');
          return rId !== targetId && rNum !== targetNum && (targetNum ? rId !== targetNum : true) && (targetId ? rNum !== targetId : true);
        });
        localStorage.setItem('local_reports', JSON.stringify(updatedLocal));
      } catch (storageErr) {}

      // 3. Clear Cache
      clearApiCache();

      // 4. Send API DELETE
      const delParam = targetId || targetNum;
      if (delParam) {
        try {
          await fetch(`http://localhost:5000/api/reports/${delParam}`, { method: 'DELETE' });
        } catch (err) {}
      }

      // 5. Global sync event
      window.dispatchEvent(new CustomEvent('report-deleted', { detail: { id: targetId, reportNumber: targetNum } }));
    } catch (error) {
      alert('حدث خطأ أثناء حذف التقرير.');
    }
  };

  // Open Edit Modal
  const openEdit = (rep: any) => {
    setEditModalReport(rep);
    setEditFormData({
      materialName: rep.materialName || '',
      crusherName: rep.crusherName || '',
      productionAmount: rep.productionAmount ? String(rep.productionAmount) : '',
      date: rep.date ? rep.date.split('T')[0] : '',
      notes: rep.notes || ''
    });
  };

  const filtered = reports.filter(r => {
    const name = r.crusherName || '';
    const mat = r.materialName || '';
    const notes = r.notes || '';
    const date = r.date || '';
    const matchesSearch = name.includes(searchTerm) || mat.includes(searchTerm) || notes.includes(searchTerm) || date.includes(searchTerm);
    const matchesSector = sectorFilter === 'all' || name.includes(sectorFilter);
    return matchesSearch && matchesSector;
  });

  const exportExcel = () => {
    const data = reports.map(r => ({
      'رقم التقرير': `#REP-0${r.id}`,
      'التاريخ': r.date?.split('T')[0],
      'القطعة / الكسارة': r.crusherName,
      'نوع التقرير / المادة': r.materialName,
      'الكمية المسجلة': r.productionAmount,
      'الملاحظات': r.notes || 'لا توجد'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'أرشيف التقارير');
    XLSX.writeFile(wb, 'أرشيف_التقارير_اليومية_المعتمدة.xlsx');
  };

  return (
    <div className="view-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            أرشيف وسجل التقارير والصور الميدانية
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.2rem' }}>
            استعراض، تدقيق، تعديل، وحذف التقارير والصور الموثقة المرفوعة في قاعدة البيانات
          </p>
        </div>
        <button className="secondary-action-btn" onClick={fetchReports} disabled={isLoading} title="تحديث السجل" style={{ height: '38px' }}>
          <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          <span>تحديث السجل</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="table-controls-bar" style={{ marginBottom: '1.25rem' }}>
        <div className="search-input-box" style={{ width: '100%', maxWidth: '380px' }}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="بحث بنوع التقرير، الموقع، أو التاريخ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <select className="filter-select" value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)}>
            <option value="all">كافة المواقع والقطع</option>
            <option value="A">القطعة A (الشمال)</option>
            <option value="B">القطعة B (الوسط)</option>
          </select>

          <button className="secondary-action-btn" onClick={exportExcel}>
            <FileSpreadsheet size={16} />
            <span>تصدير إكسل</span>
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="table-container">
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>جاري جلب التقارير من قاعدة البيانات...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
            <FileText size={40} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
            <p style={{ fontSize: '0.9rem' }}>لا توجد تقارير مسجلة حالياً. يمكنك رفع تقرير جديد مع صورته من قسم <strong>رفع التقارير</strong>.</p>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>كود التقرير</th>
                <th>التاريخ</th>
                <th>الموقع / القطعة</th>
                <th>نوع وبيان التقرير</th>
                <th>الكمية</th>
                <th>الوثيقة / الصورة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td><span className="code-badge">#REP-0{r.id}</span></td>
                  <td>{r.date ? new Date(r.date).toLocaleDateString('en-GB') : ''}</td>
                  <td><span className="sector-tag">{r.crusherName}</span></td>
                  <td><strong>{r.materialName}</strong></td>
                  <td><span className="stock-pill">{r.productionAmount}</span></td>
                  <td>
                    {r.imageUrl ? (
                      <div 
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', background: '#eff6ff', padding: '0.2rem 0.55rem', borderRadius: '6px', border: '1px solid #bfdbfe' }}
                        onClick={() => setSelectedImage(r.imageUrl)}
                        title="انقر لتكبير الصورة"
                      >
                        <img src={r.imageUrl} alt="وثيقة" style={{ width: '26px', height: '26px', objectFit: 'cover', borderRadius: '4px' }} />
                        <span style={{ fontSize: '0.76rem', color: '#1d4ed8', fontWeight: 700 }}>عرض الصورة</span>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>تقرير نصي</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {/* View Button */}
                      <button 
                        onClick={() => setViewModalReport(r)}
                        style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '0.35rem 0.6rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', fontWeight: 700 }}
                        title="عرض كامل تفاصيل التقرير"
                      >
                        <Eye size={13} />
                        <span>عرض</span>
                      </button>

                      {/* Edit Button */}
                      <button 
                        onClick={() => openEdit(r)}
                        style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '0.35rem 0.6rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', fontWeight: 700 }}
                        title="تعديل بيانات التقرير"
                      >
                        <Edit2 size={13} />
                        <span>تعديل</span>
                      </button>

                      {/* Delete Button */}
                      <button 
                        onClick={() => handleDeleteReport(r.id, r.reportNumber, r.materialName || r.reportType)}
                        style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.35rem 0.6rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', fontWeight: 700 }}
                        title="حذف التقرير"
                      >
                        <Trash2 size={13} />
                        <span>حذف</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100vw', 
            height: '100vh', 
            background: 'rgba(0, 0, 0, 0.85)', 
            zIndex: 99999, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '2rem' 
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <button 
              onClick={() => setSelectedImage(null)}
              style={{ position: 'absolute', top: '-40px', right: '0', background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}
            >
              <X size={32} />
            </button>
            <img 
              src={selectedImage} 
              alt="المستند الكامل" 
              style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', objectFit: 'contain' }} 
            />
          </div>
        </div>
      )}

      {/* Distinctive Report Detail Modal */}
      {viewModalReport && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '580px', borderRadius: '16px' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    تفاصيل التقرير: #REP-0{viewModalReport.id}
                  </h3>
                </div>
              </div>
              <button onClick={() => setViewModalReport(null)} className="close-btn"><X size={20} /></button>
            </div>

            <div style={{ padding: '1.25rem 0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>نوع التقرير</span>
                  <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>{viewModalReport.materialName}</p>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>الكمية المسجلة</span>
                  <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#2563eb', marginTop: '0.2rem' }}>{viewModalReport.productionAmount || 0}</p>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>الموقع / القطعة</span>
                  <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>{viewModalReport.crusherName}</p>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>تاريخ التقرير</span>
                  <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>{viewModalReport.date ? new Date(viewModalReport.date).toLocaleDateString('en-GB') : ''}</p>
                </div>
              </div>

              {viewModalReport.notes && (
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>البيان والملاحظات</span>
                  <p style={{ fontSize: '0.88rem', color: '#334155', marginTop: '0.2rem' }}>{viewModalReport.notes}</p>
                </div>
              )}

              {viewModalReport.imageUrl && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: '#64748b' }}>الوثيقة والصورة المرفقة (انقر للتكبير):</p>
                  <img 
                    src={viewModalReport.imageUrl} 
                    alt="صورة التقرير" 
                    onClick={() => setSelectedImage(viewModalReport.imageUrl)}
                    style={{ maxWidth: '100%', maxHeight: '220px', objectFit: 'contain', borderRadius: '10px', border: '2px solid #e2e8f0', cursor: 'pointer' }} 
                  />
                </div>
              )}
            </div>

            <div className="modal-actions" style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                className="secondary-action-btn"
                onClick={() => {
                  const rep = viewModalReport;
                  setViewModalReport(null);
                  openEdit(rep);
                }}
              >
                <Edit2 size={15} />
                <span>تعديل هذا التقرير</span>
              </button>
              <button className="primary-action-btn" onClick={() => setViewModalReport(null)}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Report Modal */}
      {editModalReport && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '520px', borderRadius: '16px' }}>
            <div className="modal-header">
              <h3>تعديل التقرير: #REP-0{editModalReport.id}</h3>
              <button onClick={() => setEditModalReport(null)} className="close-btn"><X size={20} /></button>
            </div>

            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">بيان أو موضوع التقرير <span className="required-asterisk">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.materialName}
                  onChange={(e) => setEditFormData({ ...editFormData, materialName: e.target.value })}
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">الكمية المسجلة <span className="required-asterisk">*</span></label>
                  <input
                    type="number"
                    className="form-input"
                    value={editFormData.productionAmount}
                    onChange={(e) => setEditFormData({ ...editFormData, productionAmount: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">الموقع / القطعة</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.crusherName}
                    onChange={(e) => setEditFormData({ ...editFormData, crusherName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">تاريخ التقرير</label>
                <input
                  type="date"
                  className="form-input"
                  value={editFormData.date}
                  onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">الملاحظات والبيان الميداني</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                />
              </div>

              <div className="modal-actions" style={{ marginTop: '1.25rem' }}>
                <button type="submit" className="primary-action-btn" style={{ width: '100%', height: '46px', justifyContent: 'center' }}>
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
