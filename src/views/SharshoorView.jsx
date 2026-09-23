import React, { useState, useEffect } from 'react';
import { Mountain, Plus, FileSpreadsheet, TrendingUp, Layers, X, RefreshCw, Pencil, Trash2, Eye } from 'lucide-react';
import * as XLSX from 'xlsx';
export const SharshoorView = () => {
    const [sharshoorLogs, setSharshoorLogs] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [editingLog, setEditingLog] = useState(null);
    const [viewDetailsLog, setViewDetailsLog] = useState(null);
    const [logToDelete, setLogToDelete] = useState(null);
    const [form, setForm] = useState({
        sector: 'القطعة A',
        crusher: 'الكسارة 1',
        amountTons: 300,
        truckCode: 'TRK-01',
        destination: 'موقع الخلط الأسفلتي',
        imageUrl: null
    });
    const fetchLogs = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:5000/api/sharshoor');
            const data = await response.json();
            if (data.success && data.logs) {
                setSharshoorLogs(data.logs);
            }
        }
        catch (error) {
            console.error('Failed to fetch sharshoor logs', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchLogs();
    }, []);
    const totalSharshoor = sharshoorLogs.reduce((acc, curr) => acc + (curr.amountTons || 0), 0);
    const sectorATotal = sharshoorLogs.filter(s => s.sector?.includes('A')).reduce((acc, curr) => acc + (curr.amountTons || 0), 0);
    const sectorBTotal = sharshoorLogs.filter(s => s.sector?.includes('B')).reduce((acc, curr) => acc + (curr.amountTons || 0), 0);
    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const url = editingLog
                ? `http://localhost:5000/api/sharshoor/${editingLog.id}`
                : 'http://localhost:5000/api/sharshoor';
            const method = editingLog ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await response.json();
            if (data.success) {
                setIsModalOpen(false);
                setEditingLog(null);
                setForm({ sector: 'القطعة A', crusher: 'الكسارة 1', amountTons: 300, truckCode: 'TRK-01', destination: 'موقع الخلط الأسفلتي', imageUrl: null });
                fetchLogs();
            }
        }
        catch (error) {
            console.error('Failed to save sharshoor record', error);
        }
    };
    const handleEdit = (log) => {
        setEditingLog(log);
        setForm({
            sector: log.sector || 'القطعة A',
            crusher: log.crusher || 'الكسارة 1',
            amountTons: log.amountTons || 0,
            truckCode: log.truckCode || '',
            destination: log.destination || '',
            imageUrl: log.imageUrl || null
        });
        setIsModalOpen(true);
    };
    const handleDelete = (log) => {
        setLogToDelete(log);
    };
    const confirmDeleteSharshoor = async () => {
        if (!logToDelete) return;
        const targetId = logToDelete.id;
        // Optimistic UI update
        setSharshoorLogs(prev => prev.filter(s => s.id !== targetId && String(s.id) !== String(targetId)));
        setLogToDelete(null);
        try {
            await fetch(`http://localhost:5000/api/sharshoor/${targetId}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Failed to delete sharshoor record from backend', error);
        }
        fetchLogs();
    };
    const openAddModal = () => {
        setEditingLog(null);
        setForm({ sector: 'القطعة A', crusher: 'الكسارة 1', amountTons: 300, truckCode: 'TRK-01', destination: 'موقع الخلط الأسفلتي', imageUrl: null });
        setIsModalOpen(true);
    };
    const exportExcel = () => {
        const data = sharshoorLogs.map(s => ({
            'رقم الإذن': `#SHR-${s.id}`,
            'التاريخ': s.date?.split('T')[0],
            'القطعة': s.sector,
            'الكسارة المصدر': s.crusher,
            'الكمية الموردة (طن)': s.amountTons,
            'شاحنة النقل': s.truckCode,
            'وجهة التوريد': s.destination,
            'ملاحظات': s.notes || '-'
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'سجل توريد الشرشور');
        XLSX.writeFile(wb, 'سجل_توريد_الشرشور_اليومي.xlsx');
    };
    return (<div className="view-content">
      {/* Top KPI Cards (Auto-Calculated) */}
      <div className="top-5-metrics-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="kpi-metric-card">
          <div className="kpi-card-header">
            <span className="kpi-title">إجمالي الشرشور المورد المحسوب</span>
            <div className="kpi-icon-circle blue"><Mountain size={20}/></div>
          </div>
          <div className="kpi-value-center">
            <span className="kpi-big-num">{totalSharshoor.toLocaleString()}</span>
            <span className="kpi-unit-label">طن</span>
          </div>
          <div className="kpi-bottom-sub">
            <span className="kpi-green-badge">محسوب آلياً من السجلات</span>
          </div>
        </div>

        <div className="kpi-metric-card">
          <div className="kpi-card-header">
            <span className="kpi-title">توريدات القطعة A</span>
            <div className="kpi-icon-circle green"><TrendingUp size={20}/></div>
          </div>
          <div className="kpi-value-center">
            <span className="kpi-big-num">{sectorATotal.toLocaleString()}</span>
            <span className="kpi-unit-label">طن</span>
          </div>
          <div className="kpi-bottom-sub">
            <span className="kpi-gray-text">موقع المقلع الشمالي</span>
          </div>
        </div>

        <div className="kpi-metric-card">
          <div className="kpi-card-header">
            <span className="kpi-title">توريدات القطعة B</span>
            <div className="kpi-icon-circle emerald"><Layers size={20}/></div>
          </div>
          <div className="kpi-value-center">
            <span className="kpi-big-num">{sectorBTotal.toLocaleString()}</span>
            <span className="kpi-unit-label">طن</span>
          </div>
          <div className="kpi-bottom-sub">
            <span className="kpi-gray-text">موقع المقلع الأوسط</span>
          </div>
        </div>
      </div>

      {/* Table Controls */}
      <div className="table-controls-bar">
        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>سجل شحنات وبوالص توريد الشرشور الموثقة بالصور</div>
        <div className="filters-group">
          <button className="secondary-action-btn" onClick={fetchLogs} title="تحديث">
            <RefreshCw size={16}/>
            <span>تحديث</span>
          </button>
          <button className="secondary-action-btn" onClick={exportExcel}>
            <FileSpreadsheet size={17}/>
            <span>تصدير إكسل</span>
          </button>
          <button className="primary-action-btn" onClick={openAddModal}>
            <Plus size={18}/>
            <span>تسجيل شحنة شرشور</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>رقم الإذن</th>
              <th>التاريخ</th>
              <th>القطعة</th>
              <th>الكسارة</th>
              <th>الكمية (طن)</th>
              <th>شاحنة النقل</th>
              <th>صورة بوليصة الميزان</th>
              <th>وجهة التسليم</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {sharshoorLogs.map(s => (<tr key={s.id}>
                <td><span className="code-badge">#SHR-0{s.id}</span></td>
                <td>{s.date ? s.date.split('T')[0] : 'اليوم'}</td>
                <td><span className="sector-tag">{s.sector}</span></td>
                <td>{s.crusher}</td>
                <td><span className="stock-pill">+{s.amountTons} طن</span></td>
                <td>{s.truckCode}</td>
                <td>
                  {s.imageUrl ? (<div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', background: '#ecfdf5', padding: '0.25rem 0.6rem', borderRadius: '8px', border: '1px solid #a7f3d0' }} onClick={() => setSelectedImage(s.imageUrl)} title="انقر لتكبير صورة البوليصة">
                      <img src={s.imageUrl} alt="صورة البوليصة" style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '6px' }}/>
                      <span style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 600 }}>عرض البوليصة</span>
                    </div>) : (<span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>إذن مباشر</span>)}
                </td>
                <td><strong>{s.destination}</strong></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button onClick={() => setViewDetailsLog(s)} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#334155', fontWeight: 700 }} title="عرض التفاصيل">
                      <Eye size={13}/>
                      <span>عرض</span>
                    </button>
                    <button onClick={() => handleEdit(s)} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#2563eb', fontWeight: 700 }} title="تعديل">
                      <Pencil size={13}/>
                      <span>تعديل</span>
                    </button>
                    <button onClick={() => handleDelete(s)} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#dc2626', fontWeight: 700 }} title="حذف">
                      <Trash2 size={13}/>
                      <span>حذف</span>
                    </button>
                  </div>
                </td>
              </tr>))}
          </tbody>
        </table>
      </div>

      {/* Image Lightbox Modal */}
      {selectedImage && (<div className="modal-backdrop" onClick={() => setSelectedImage(null)}>
          <div className="modal-card" style={{ maxWidth: '650px', padding: '1.25rem' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>صورة بوليصة الميزان والتوريد</h3>
              <button onClick={() => setSelectedImage(null)} className="close-btn"><X size={20}/></button>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <img src={selectedImage} alt="صورة البوليصة الكاملة" style={{ maxWidth: '100%', maxHeight: '480px', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}/>
            </div>
            <div className="modal-actions">
              <button className="primary-action-btn" onClick={() => setSelectedImage(null)}>إغلاق</button>
            </div>
          </div>
        </div>)}

      {/* Add/Edit Modal */}
      {isModalOpen && (<div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editingLog ? 'تعديل سجل توريد الشرشور' : 'تسجيل شحنة توريد شرشور جديدة'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingLog(null); }} className="close-btn"><X size={20}/></button>
            </div>

            <form onSubmit={handleAdd} className="modal-form">
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">القطعة <span className="required-asterisk">*</span></label>
                  <select className="form-input" value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })}>
                    <option value="القطعة A">القطعة A</option>
                    <option value="القطعة B">القطعة B</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">الكسارة المصدر <span className="required-asterisk">*</span></label>
                  <select className="form-input" value={form.crusher} onChange={(e) => setForm({ ...form, crusher: e.target.value })}>
                    <option value="الكسارة 1">الكسارة 1</option>
                    <option value="الكسارة 2">الكسارة 2</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">الكمية (طن) <span className="required-asterisk">*</span></label>
                  <input type="number" className="form-input" value={form.amountTons} onChange={(e) => setForm({ ...form, amountTons: Number(e.target.value) })} required/>
                </div>
                <div className="form-group">
                  <label className="form-label">كود الشاحنة</label>
                  <input type="text" className="form-input" value={form.truckCode} onChange={(e) => setForm({ ...form, truckCode: e.target.value })} required/>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">وجهة التوريد</label>
                <input type="text" className="form-input" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required/>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-action-btn" onClick={() => { setIsModalOpen(false); setEditingLog(null); }} style={{ height: '48px' }}>
                  إلغاء
                </button>
                <button type="submit" className="primary-action-btn" style={{ flex: 1, height: '48px', justifyContent: 'center' }}>
                  {editingLog ? 'حفظ التعديلات' : 'حفظ وتأكيد الشحنة'}
                </button>
              </div>
            </form>
          </div>
        </div>)}

      {/* View Sharshoor Details Modal */}
      {viewDetailsLog && (
        <div className="modal-backdrop" onClick={() => setViewDetailsLog(null)}>
          <div className="modal-card" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mountain size={20} color="#059669" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                  تفاصيل سجل توريد الشرشور (#SHR-0{viewDetailsLog.id})
                </h3>
              </div>
              <button onClick={() => setViewDetailsLog(null)} className="close-btn">
                <X size={20}/>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem 0', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>القطاع الميداني:</span>
                <span style={{ fontWeight: 800 }}>{viewDetailsLog.sector}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>الكسارة المصدر:</span>
                <span style={{ fontWeight: 800 }}>{viewDetailsLog.crusher}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>الكمية الموردة:</span>
                <span style={{ fontWeight: 800, color: '#059669' }}>+{viewDetailsLog.amountTons} طن</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>كود الشاحنة:</span>
                <span style={{ fontWeight: 700 }}>{viewDetailsLog.truckCode || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>وجهة التوريد:</span>
                <span style={{ fontWeight: 700 }}>{viewDetailsLog.destination || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>التاريخ:</span>
                <span style={{ fontWeight: 700 }}>{viewDetailsLog.date ? viewDetailsLog.date.split('T')[0] : 'اليوم'}</span>
              </div>
              {viewDetailsLog.imageUrl && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>بوليصة الميزان:</span>
                  <button 
                    onClick={() => {
                      const img = viewDetailsLog.imageUrl;
                      setViewDetailsLog(null);
                      setSelectedImage(img);
                    }}
                    style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    عرض البوليصة
                  </button>
                </div>
              )}
              {viewDetailsLog.notes && (
                <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '0.25rem' }}>
                  <div style={{ fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>ملاحظات:</div>
                  <div style={{ color: '#334155' }}>{viewDetailsLog.notes}</div>
                </div>
              )}
            </div>

            <div className="modal-actions" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="secondary-action-btn" 
                onClick={() => {
                  const log = viewDetailsLog;
                  setViewDetailsLog(null);
                  handleEdit(log);
                }}
                style={{ height: '42px', padding: '0 1.25rem' }}
              >
                <Pencil size={14} />
                <span>تعديل هذا السجل</span>
              </button>
              <button 
                type="button" 
                className="primary-action-btn" 
                onClick={() => setViewDetailsLog(null)}
                style={{ height: '42px', padding: '0 1.5rem' }}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {logToDelete && (
        <div className="modal-backdrop" style={{ zIndex: 99999 }}>
          <div className="modal-card" style={{ maxWidth: '440px', textAlign: 'center', padding: '1.75rem' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              border: '2px solid #fecaca'
            }}>
              <Trash2 size={24} />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
              تأكيد حذف شحنة الشرشور
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '1.25rem' }}>
              هل أنت متأكد من حذف هذا السجل (شاحنة {logToDelete.truckCode} - كمية {logToDelete.amountTons} طن)؟ سيتم خصم الكمية وتحديث الإحصائيات فوراً.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={confirmDeleteSharshoor}
                style={{
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.65rem 1.25rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                تأكيد الحذف
              </button>
              <button
                type="button"
                onClick={() => setLogToDelete(null)}
                className="secondary-action-btn"
                style={{ height: '42px', padding: '0 1.25rem' }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>);
};
