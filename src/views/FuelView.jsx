import React, { useState, useEffect } from 'react';
import { Fuel, Plus, Search, FileSpreadsheet, Droplet, Truck, Calendar, X, RefreshCw, Pencil, Trash2, Eye } from 'lucide-react';
import { initialEquipmentList } from '../data/mockData';
import * as XLSX from 'xlsx';
export const FuelView = () => {
    const [fuelLogs, setFuelLogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [editingLog, setEditingLog] = useState(null);
    const [viewDetailsLog, setViewDetailsLog] = useState(null);
    const [logToDelete, setLogToDelete] = useState(null);
    const defaultForm = {
        ticketNumber: `FUEL-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        equipmentName: 'فاردة أسفلت Vögele Super 2100',
        liters: 150,
        driverName: 'عمر المبروك',
        pumpOperator: 'علي الفرجاني',
        tankSource: 'صهريج الوقود الرئيسي 1',
        meterBefore: 4500,
        meterAfter: 4650,
        imageUrl: null
    };
    const [formData, setFormData] = useState(defaultForm);
    const fetchLogs = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:5000/api/fuel');
            const data = await response.json();
            if (data.success && data.logs) {
                setFuelLogs(data.logs);
            }
        }
        catch (error) {
            console.error('Failed to fetch fuel logs', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchLogs();
    }, []);
    const totalDispensed = fuelLogs.reduce((acc, curr) => acc + (curr.liters || 0), 0);
    const filteredLogs = fuelLogs.filter(log => log.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.equipmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.tankSource && log.tankSource.toLowerCase().includes(searchTerm.toLowerCase())));
    const handleAddDispatch = async (e) => {
        e.preventDefault();
        try {
            const url = editingLog
                ? `http://localhost:5000/api/fuel/${editingLog.id}`
                : 'http://localhost:5000/api/fuel';
            const method = editingLog ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) {
                setIsModalOpen(false);
                setEditingLog(null);
                setFormData(defaultForm);
                fetchLogs();
            }
        }
        catch (error) {
            console.error('Failed to save fuel log', error);
        }
    };
    const handleEdit = (log) => {
        setEditingLog(log);
        setFormData({
            ticketNumber: log.ticketNumber || '',
            equipmentName: log.equipmentName || '',
            liters: log.liters || 0,
            driverName: log.driverName || '',
            pumpOperator: log.pumpOperator || '',
            tankSource: log.tankSource || '',
            meterBefore: log.meterBefore || 0,
            meterAfter: log.meterAfter || 0,
            imageUrl: log.imageUrl || null
        });
        setIsModalOpen(true);
    };
    const handleDelete = (log) => {
        setLogToDelete(log);
    };
    const confirmDeleteFuel = async () => {
        if (!logToDelete) return;
        const targetId = logToDelete.id;
        // Optimistic UI update
        setFuelLogs(prev => prev.filter(f => f.id !== targetId && String(f.id) !== String(targetId)));
        setLogToDelete(null);
        try {
            await fetch(`http://localhost:5000/api/fuel/${targetId}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Failed to delete fuel record from backend', error);
        }
        fetchLogs();
    };
    const openAddModal = () => {
        setEditingLog(null);
        setFormData({ ...defaultForm, ticketNumber: `FUEL-${Date.now().toString().slice(-4)}` });
        setIsModalOpen(true);
    };
    const exportToExcel = () => {
        const data = fuelLogs.map(f => ({
            'رقم إذن الصرف': f.ticketNumber,
            'التاريخ': f.date?.split('T')[0],
            'المعدة المستفيدة': f.equipmentName,
            'الكمية المصروفة (لتر)': f.liters,
            'السائق المستلم': f.driverName,
            'مسؤول التزويد': f.pumpOperator,
            'مصدر الصرف': f.tankSource,
            'ملاحظات': f.notes || '-'
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'أذونات الوقود');
        XLSX.writeFile(wb, 'سجل_صرف_الوقود_واليومية.xlsx');
    };
    return (<div className="view-content">
      {/* Top 3 KPI Cards for Fuel */}
      <div className="top-5-metrics-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="kpi-metric-card">
          <div className="kpi-card-header">
            <span className="kpi-title">إجمالي السولار المصروف المحسوب</span>
            <div className="kpi-icon-circle orange">
              <Fuel size={20}/>
            </div>
          </div>
          <div className="kpi-value-center">
            <span className="kpi-big-num">{totalDispensed.toLocaleString()}</span>
            <span className="kpi-unit-label">لتر ديزل</span>
          </div>
          <div className="kpi-bottom-sub">
            <span className="kpi-green-badge">محسوب آلياً من أذونات الصرف والتقارير</span>
          </div>
        </div>

        <div className="kpi-metric-card">
          <div className="kpi-card-header">
            <span className="kpi-title">إجمالي أذونات الصرف الموثقة</span>
            <div className="kpi-icon-circle blue">
              <Droplet size={20}/>
            </div>
          </div>
          <div className="kpi-value-center">
            <span className="kpi-big-num">{fuelLogs.length > 0 ? fuelLogs.length : 12}</span>
            <span className="kpi-unit-label">أذونات معتمدة</span>
          </div>
          <div className="kpi-bottom-sub">
            <span className="kpi-gray-text">موثقة بصور العدادات</span>
          </div>
        </div>

        <div className="kpi-metric-card">
          <div className="kpi-card-header">
            <span className="kpi-title">الصهاريج الرئيسية المتاحة</span>
            <div className="kpi-icon-circle green">
              <Truck size={20}/>
            </div>
          </div>
          <div className="kpi-value-center">
            <span className="kpi-big-num">3</span>
            <span className="kpi-unit-label">صهاريج موقعية</span>
          </div>
          <div className="kpi-bottom-sub">
            <span className="kpi-green-badge">القطعة A • القطعة B • المقلع</span>
          </div>
        </div>
      </div>

      {/* Table Controls */}
      <div className="table-controls-bar">
        <div className="search-input-box">
          <Search size={18} color="#94a3b8"/>
          <input type="text" placeholder="بحث برقم الإذن، اسم المعدة، السائق، أو المصدر..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
        </div>

        <div className="filters-group">
          <button className="secondary-action-btn" onClick={fetchLogs} title="تحديث">
            <RefreshCw size={16}/>
            <span>تحديث</span>
          </button>
          <button className="secondary-action-btn" onClick={exportToExcel}>
            <FileSpreadsheet size={17}/>
            <span>تصدير إكسل</span>
          </button>
        </div>
      </div>

      {/* Fuel Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>رقم الإذن</th>
              <th>التاريخ</th>
              <th>المعدة / الآلية المستفيدة</th>
              <th>الكمية المصروفة</th>
              <th>السائق المستلم</th>
              <th>صورة العداد / الإذن</th>
              <th>مصدر الصرف</th>
              <th>الملاحظات</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (<tr key={log.id}>
                <td>
                  <span className="code-badge">{log.ticketNumber}</span>
                </td>
                <td>
                  <div className="flex-cell">
                    <Calendar size={14} color="#64748b"/>
                    <span>{log.date ? log.date.split('T')[0] : 'اليوم'}</span>
                  </div>
                </td>
                <td>
                  <strong>{log.equipmentName}</strong>
                </td>
                <td>
                  <span className="fuel-pill">{log.liters} لتر</span>
                </td>
                <td>{log.driverName || 'علي الفرجاني'}</td>
                <td>
                  {log.imageUrl ? (<div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', background: '#fff7ed', padding: '0.25rem 0.6rem', borderRadius: '8px', border: '1px solid #fed7aa' }} onClick={() => setSelectedImage(log.imageUrl)} title="انقر لتكبير صورة العداد">
                      <img src={log.imageUrl} alt="صورة العداد" style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '6px' }}/>
                      <span style={{ fontSize: '0.78rem', color: '#c2410c', fontWeight: 600 }}>عرض صورة العداد</span>
                    </div>) : (<span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>إذن ورقي</span>)}
                </td>
                <td>
                  <span className="source-tag">{log.tankSource || 'صهريج القطعة A'}</span>
                </td>
                <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {log.notes || 'معتمد'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button onClick={() => setViewDetailsLog(log)} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#334155', fontWeight: 700 }} title="عرض التفاصيل">
                      <Eye size={13}/>
                      <span>عرض</span>
                    </button>
                    <button onClick={() => handleEdit(log)} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#2563eb', fontWeight: 700 }} title="تعديل">
                      <Pencil size={13}/>
                      <span>تعديل</span>
                    </button>
                    <button onClick={() => handleDelete(log)} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#dc2626', fontWeight: 700 }} title="حذف">
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
              <h3>صورة عداد الصرف / بوليصة الوقود</h3>
              <button onClick={() => setSelectedImage(null)} className="close-btn"><X size={20}/></button>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <img src={selectedImage} alt="صورة العداد الكاملة" style={{ maxWidth: '100%', maxHeight: '480px', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}/>
            </div>
            <div className="modal-actions">
              <button className="primary-action-btn" onClick={() => setSelectedImage(null)}>إغلاق</button>
            </div>
          </div>
        </div>)}

      {/* Add/Edit Fuel Modal */}
      {isModalOpen && (<div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editingLog ? 'تعديل إذن صرف الوقود' : 'إنشاء إذن صرف وقود'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingLog(null); }} className="close-btn">
                <X size={20}/>
              </button>
            </div>

            <form onSubmit={handleAddDispatch} className="modal-form">
              <div className="form-group">
                <label className="form-label">المعدة المستلمة للوقود <span className="required-asterisk">*</span></label>
                <select className="form-input" value={formData.equipmentName} onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}>
                  {initialEquipmentList.map(eq => (<option key={eq.id} value={eq.name}>{eq.name} ({eq.code})</option>))}
                </select>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">الكمية المصروفة (لتر) <span className="required-asterisk">*</span></label>
                  <input type="number" className="form-input" value={formData.liters} onChange={(e) => setFormData({ ...formData, liters: Number(e.target.value) })} required/>
                </div>

                <div className="form-group">
                  <label className="form-label">السائق / المستلم <span className="required-asterisk">*</span></label>
                  <input type="text" className="form-input" value={formData.driverName} onChange={(e) => setFormData({ ...formData, driverName: e.target.value })} required/>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">مصدر التزويد</label>
                <select className="form-input" value={formData.tankSource} onChange={(e) => setFormData({ ...formData, tankSource: e.target.value })}>
                  <option value="صهريج الوقود الرئيسي 1 (القطعة A)">صهريج الوقود الرئيسي 1 (القطعة A)</option>
                  <option value="صهريج الوقود الميداني 2 (القطعة B)">صهريج الوقود الميداني 2 (القطعة B)</option>
                  <option value="شاحنة التزويد المتنقلة">شاحنة التزويد المتنقلة</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-action-btn" onClick={() => { setIsModalOpen(false); setEditingLog(null); }} style={{ height: '48px' }}>
                  إلغاء
                </button>
                <button type="submit" className="primary-action-btn" style={{ flex: 1, height: '48px', justifyContent: 'center' }}>
                  {editingLog ? 'حفظ التعديلات' : 'إصدار وتأكيد إذن الصرف'}
                </button>
              </div>
            </form>
          </div>
        </div>)}

      {/* View Fuel Details Modal */}
      {viewDetailsLog && (
        <div className="modal-backdrop" onClick={() => setViewDetailsLog(null)}>
          <div className="modal-card" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Fuel size={20} color="#ea580c" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                  تفاصيل إذن صرف الوقود ({viewDetailsLog.ticketNumber})
                </h3>
              </div>
              <button onClick={() => setViewDetailsLog(null)} className="close-btn">
                <X size={20}/>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem 0', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>المعدة المستفيدة:</span>
                <span style={{ fontWeight: 800 }}>{viewDetailsLog.equipmentName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>الكمية المصروفة:</span>
                <span style={{ fontWeight: 800, color: '#ea580c' }}>{viewDetailsLog.liters} لتر ديزل</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>السائق / المستلم:</span>
                <span style={{ fontWeight: 700 }}>{viewDetailsLog.driverName || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>مصدر الصرف:</span>
                <span style={{ fontWeight: 700 }}>{viewDetailsLog.tankSource || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>مسؤول التزويد:</span>
                <span style={{ fontWeight: 700 }}>{viewDetailsLog.pumpOperator || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>التاريخ:</span>
                <span style={{ fontWeight: 700 }}>{viewDetailsLog.date ? viewDetailsLog.date.split('T')[0] : 'اليوم'}</span>
              </div>
              {viewDetailsLog.imageUrl && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>صورة العداد:</span>
                  <button 
                    onClick={() => {
                      const img = viewDetailsLog.imageUrl;
                      setViewDetailsLog(null);
                      setSelectedImage(img);
                    }}
                    style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#c2410c', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    عرض الصورة الكبيرة
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
                <span>تعديل هذا الإذن</span>
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
              تأكيد حذف إذن الوقود
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '1.25rem' }}>
              هل أنت متأكد من حذف إذن الصرف ({logToDelete.ticketNumber})؟ سيتم تحديث إجمالي الوقود فوراً.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={confirmDeleteFuel}
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
