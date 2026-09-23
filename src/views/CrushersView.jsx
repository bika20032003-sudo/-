import React, { useState, useEffect } from 'react';
import { Factory, Plus, FileSpreadsheet, TrendingUp, Layers, X, RefreshCw, Pencil, Trash2, Eye } from 'lucide-react';
import * as XLSX from 'xlsx';
export const CrushersView = () => {
    const [crushers, setCrushers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewDetailsLog, setViewDetailsLog] = useState(null);
    const [logToDelete, setLogToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [editingLog, setEditingLog] = useState(null);
    const [formData, setFormData] = useState({
        name: 'الكسارة رقم 1 (الشمالية)',
        sector: 'القطعة A',
        dailyTons: 0,
        sharshoorTons: 0,
        notes: '',
        imageUrl: ''
    });
    const fetchLogs = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:5000/api/crushers');
            const data = await response.json();
            if (data.success && data.logs) {
                setLogs(data.logs);
            }
        }
        catch (error) {
            console.error('Failed to fetch crusher logs', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchLogs();
    }, []);
    // Calculate live totals from backend logs
    const logsProductionSum = logs.reduce((acc, l) => acc + (l.dailyProductionTons || 0), 0);
    const logsSharshoorSum = logs.reduce((acc, l) => acc + (l.sharshoorTons || 0), 0);
    const totalProduction = logsProductionSum;
    const totalSharshoor = logsSharshoorSum;
    const handleAddBatch = async (e) => {
        e.preventDefault();
        try {
            const url = editingLog
                ? `http://localhost:5000/api/crushers/${editingLog.id}`
                : 'http://localhost:5000/api/crushers';
            const method = editingLog ? 'PUT' : 'POST';
            const payload = {
                name: formData.name,
                sector: formData.sector,
                dailyProductionTons: Number(formData.dailyTons) || 0,
                sharshoorTons: Number(formData.sharshoorTons) || 0,
                notes: formData.notes || '',
                imageUrl: formData.imageUrl
            };
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (data.success) {
                if (editingLog) {
                    setLogs(prev => prev.map(l => l.id === editingLog.id ? { ...l, ...payload } : l));
                }
                setIsModalOpen(false);
                setEditingLog(null);
                setFormData({ name: 'الكسارة رقم 1 (الشمالية)', sector: 'القطعة A', dailyTons: 0, sharshoorTons: 0, notes: '', imageUrl: '' });
                fetchLogs();
            }
        }
        catch (error) {
            alert('فشل الاتصال بالخادم. يرجى التأكد من تشغيله.');
        }
    };
    const handleEdit = (log) => {
        setEditingLog(log);
        setFormData({
            name: log.name || '',
            sector: log.sector || 'القطعة A',
            dailyTons: log.dailyProductionTons || 0,
            sharshoorTons: log.sharshoorTons || 0,
            notes: log.notes || '',
            imageUrl: log.imageUrl || ''
        });
        setIsModalOpen(true);
    };
    const confirmDeleteCrusher = async () => {
        if (!logToDelete) return;
        const targetId = logToDelete.id;
        try {
            setLogs(prev => prev.filter(l => l.id !== targetId));
            const res = await fetch(`http://localhost:5000/api/crushers/${targetId}`, { method: 'DELETE' });
            await res.json();
            setLogToDelete(null);
            fetchLogs();
        }
        catch (error) {
            setLogToDelete(null);
            fetchLogs();
        }
    };
    const openAddModal = () => {
        setEditingLog(null);
        setFormData({ name: 'الكسارة رقم 1 (الشمالية)', sector: 'القطعة A', dailyTons: 0, sharshoorTons: 0, notes: '', imageUrl: '' });
        setIsModalOpen(true);
    };
    const exportExcel = () => {
        const data = logs.length > 0 ? logs.map(l => ({
            'كود التقرير': `#CRU-${l.id}`,
            'التاريخ': l.date?.split('T')[0],
            'اسم الكسارة': l.name,
            'القطعة الميدانية': l.sector,
            'إنتاج اليوم (طن)': l.dailyProductionTons,
            'إنتاج الشرشور (طن)': l.sharshoorTons,
            'ملاحظات': l.notes || '-'
        })) : crushers.map(c => ({
            'اسم الكسارة': c.name,
            'القطعة الميدانية': c.sector,
            'إنتاج اليوم (طن)': c.dailyProductionTons,
            'إنتاج الشرشور (طن)': c.sharshoorTons,
            'إجمالي المخزون التراكمي (طن)': c.totalStockTons
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'إنتاج الكسارات');
        XLSX.writeFile(wb, 'تقرير_إنتاج_الكسارات_اليومي.xlsx');
    };
    return (<div className="view-content">
      {/* Top 3 KPI Cards for Crushers (Dynamic Auto-Calculations) */}
      <div className="top-5-metrics-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="kpi-metric-card">
          <div className="kpi-card-header">
            <span className="kpi-title">إجمالي الإنتاج الفعلي المحسوب</span>
            <div className="kpi-icon-circle emerald">
              <TrendingUp size={20}/>
            </div>
          </div>
          <div className="kpi-value-center">
            <span className="kpi-big-num">{totalProduction.toLocaleString()}</span>
            <span className="kpi-unit-label">طن</span>
          </div>
          <div className="kpi-bottom-sub">
            <span className="kpi-green-badge">محسوب آلياً من التقارير</span>
          </div>
        </div>

        <div className="kpi-metric-card">
          <div className="kpi-card-header">
            <span className="kpi-title">إجمالي حصة الشرشور والركام</span>
            <div className="kpi-icon-circle blue">
              <Layers size={20}/>
            </div>
          </div>
          <div className="kpi-value-center">
            <span className="kpi-big-num">{totalSharshoor.toLocaleString()}</span>
            <span className="kpi-unit-label">طن</span>
          </div>
          <div className="kpi-bottom-sub">
            <span className="kpi-gray-text">تم ترحيلها للمخازن تلقائياً</span>
          </div>
        </div>

        <div className="kpi-metric-card">
          <div className="kpi-card-header">
            <span className="kpi-title">تقارير الكسارات الموثقة</span>
            <div className="kpi-icon-circle green">
              <Factory size={20}/>
            </div>
          </div>
          <div className="kpi-value-center">
            <span className="kpi-big-num">{logs.length}</span>
            <span className="kpi-unit-label">تقارير موثقة</span>
          </div>
          <div className="kpi-bottom-sub">
            <span className="kpi-green-badge">متصلة بقاعدة البيانات</span>
          </div>
        </div>
      </div>

      {/* Table Controls */}
      <div className="table-controls-bar">
        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>سجل تقارير وصور الإنتاج الميداني للكسارات</div>
        <div className="filters-group">
          <button className="secondary-action-btn" onClick={fetchLogs} title="تحديث البيانات">
            <RefreshCw size={16}/>
            <span>تحديث</span>
          </button>
          <button className="secondary-action-btn" onClick={exportExcel}>
            <FileSpreadsheet size={17}/>
            <span>تصدير إكسل</span>
          </button>
        </div>
      </div>

      {/* Live Table with Photo Preview */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>كود التقرير</th>
              <th>التاريخ</th>
              <th>الكسارة</th>
              <th>القطعة</th>
              <th>إنتاج اليوم (طن)</th>
              <th>حصة الشرشور (طن)</th>
              <th>الصورة والتوثيق الميداني</th>
              <th>الملاحظات</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? logs.map(l => (<tr key={l.id}>
                <td><span className="code-badge">#CRU-0{l.id}</span></td>
                <td>{l.date ? l.date.split('T')[0] : 'اليوم'}</td>
                <td><strong>{l.name}</strong></td>
                <td><span className="sector-tag">{l.sector}</span></td>
                <td><strong style={{ color: '#16a34a' }}>+{l.dailyProductionTons} طن</strong></td>
                <td><span className="stock-pill">+{l.sharshoorTons} طن</span></td>
                <td>
                  {l.imageUrl ? (<div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', background: '#eff6ff', padding: '0.25rem 0.6rem', borderRadius: '8px', border: '1px solid #bfdbfe' }} onClick={() => setSelectedImage(l.imageUrl)} title="انقر لتكبير الصورة">
                      <img src={l.imageUrl} alt="صورة الكسارة" style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '6px' }}/>
                      <span style={{ fontSize: '0.78rem', color: '#1d4ed8', fontWeight: 600 }}>عرض الصورة</span>
                    </div>) : (<span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>لا توجد صورة</span>)}
                </td>
                <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{l.notes || 'تقرير معتمد'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button onClick={() => setViewDetailsLog(l)} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#334155', fontWeight: 700 }} title="عرض التفاصيل">
                      <Eye size={13}/>
                      <span>عرض</span>
                    </button>
                    <button onClick={() => handleEdit(l)} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#2563eb', fontWeight: 700 }} title="تعديل">
                      <Pencil size={13}/>
                      <span>تعديل</span>
                    </button>
                    <button onClick={() => setLogToDelete(l)} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#dc2626', fontWeight: 700 }} title="حذف">
                      <Trash2 size={13}/>
                      <span>حذف</span>
                    </button>
                  </div>
                </td>
              </tr>)) : (crushers.map(c => (<tr key={c.id}>
                  <td><span className="code-badge">#CRU-SYS</span></td>
                  <td>اليوم</td>
                  <td><strong>{c.name}</strong></td>
                  <td><span className="sector-tag">{c.sector}</span></td>
                  <td><strong style={{ color: '#16a34a' }}>+{c.dailyProductionTons} طن</strong></td>
                  <td><span className="stock-pill">+{c.sharshoorTons} طن</span></td>
                  <td><span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>لا توجد صورة</span></td>
                  <td><span className="status-pill approved">تعمل بكفاءة</span></td>
                  <td>-</td>
                </tr>)))}
          </tbody>
        </table>
      </div>

      {/* Image Lightbox Modal */}
      {selectedImage && (<div className="modal-backdrop" onClick={() => setSelectedImage(null)}>
          <div className="modal-card" style={{ maxWidth: '650px', padding: '1.25rem' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>الصورة الميدانية للتقرير المرفوع</h3>
              <button onClick={() => setSelectedImage(null)} className="close-btn"><X size={20}/></button>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <img src={selectedImage} alt="المستند الكامل" style={{ maxWidth: '100%', maxHeight: '480px', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}/>
            </div>
            <div className="modal-actions">
              <button className="primary-action-btn" onClick={() => setSelectedImage(null)}>إغلاق</button>
            </div>
          </div>
        </div>)}

      {/* View Crusher Details Modal */}
      {viewDetailsLog && (
        <div className="modal-backdrop" onClick={() => setViewDetailsLog(null)}>
          <div className="modal-card" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Factory size={20} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                  تفاصيل سجل الكسارة (#{viewDetailsLog.id})
                </h3>
              </div>
              <button onClick={() => setViewDetailsLog(null)} className="close-btn">
                <X size={20}/>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem 0', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>اسم الكسارة:</span>
                <span style={{ fontWeight: 800 }}>{viewDetailsLog.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>القطاع الميداني:</span>
                <span style={{ fontWeight: 800 }}>{viewDetailsLog.sector}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>إنتاج اليوم (طن):</span>
                <span style={{ fontWeight: 800, color: '#16a34a' }}>+{(viewDetailsLog.dailyProductionTons || 0).toLocaleString()} طن</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>حصة الشرشور (طن):</span>
                <span style={{ fontWeight: 800, color: '#2563eb' }}>+{(viewDetailsLog.sharshoorTons || 0).toLocaleString()} طن</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>تاريخ السجل:</span>
                <span style={{ fontWeight: 700 }}>{viewDetailsLog.date ? viewDetailsLog.date.split('T')[0] : 'اليوم'}</span>
              </div>
              {viewDetailsLog.notes && (
                <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '0.25rem' }}>
                  <div style={{ fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>الملاحظات والبيان:</div>
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
              تأكيد حذف سجل الكسارة
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '1.25rem' }}>
              هل أنت متأكد من حذف سجل ({logToDelete.name})؟ سيتم تحديث إجمالي الإنتاج فوراً.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={confirmDeleteCrusher}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9px',
                  padding: '0.65rem 1.25rem',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={16} />
                <span>نعم، حذف السجل</span>
              </button>
              <button
                type="button"
                onClick={() => setLogToDelete(null)}
                style={{
                  flex: 1,
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '9px',
                  padding: '0.65rem 1.25rem',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                إلغاء التراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Crusher Batch Modal */}
      {isModalOpen && (<div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editingLog ? 'تعديل سجل إنتاج الكسارة' : 'تسجيل إنتاج كسارة وتوثيقه'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingLog(null); }} className="close-btn"><X size={20}/></button>
            </div>

            <form onSubmit={handleAddBatch} className="modal-form">
              <div className="form-group">
                <label className="form-label">اختر الكسارة <span className="required-asterisk">*</span></label>
                <select className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}>
                  <option value="الكسارة رقم 1 (الشمالية)">الكسارة رقم 1 (الشمالية) - القطعة A</option>
                  <option value="الكسارة رقم 2 (قطاع الوسط)">الكسارة رقم 2 (قطاع الوسط) - القطعة B</option>
                  <option value="الكسارة رقم 3 (المقلع الاحتياطي)">الكسارة رقم 3 (المقلع الاحتياطي)</option>
                </select>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">الإنتاج اليومي الكلي (طن) <span className="required-asterisk">*</span></label>
                  <input type="number" className="form-input" value={formData.dailyTons} onChange={(e) => setFormData({ ...formData, dailyTons: Number(e.target.value) })} required/>
                </div>
                <div className="form-group">
                  <label className="form-label">كمية الشرشور المنتج (طن) <span className="required-asterisk">*</span></label>
                  <input type="number" className="form-input" value={formData.sharshoorTons} onChange={(e) => setFormData({ ...formData, sharshoorTons: Number(e.target.value) })} required/>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">ملاحظات وبيان التشغيل</label>
                <input type="text" className="form-input" value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="ملاحظات الإنتاج أو حالة المواد..."/>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-action-btn" onClick={() => { setIsModalOpen(false); setEditingLog(null); }} style={{ height: '48px' }}>
                  إلغاء
                </button>
                <button type="submit" className="primary-action-btn" style={{ flex: 1, height: '48px', justifyContent: 'center' }}>
                  {editingLog ? 'حفظ التعديلات' : 'حفظ واعتماد الإنتاج'}
                </button>
              </div>
            </form>
          </div>
        </div>)}
    </div>);
};
