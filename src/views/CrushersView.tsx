import React, { useState, useEffect } from 'react';
import { 
  Factory, 
  Plus, 
  Search, 
  FileSpreadsheet, 
  TrendingUp, 
  Layers,
  X,
  CheckCircle2,
  Camera,
  Image as ImageIcon,
  Eye,
  RefreshCw,
  Pencil,
  Trash2
} from 'lucide-react';
import { initialCrushers } from '../data/mockData';
import { CrusherStock } from '../types';
import * as XLSX from 'xlsx';

export const CrushersView: React.FC = () => {
  const [crushers, setCrushers] = useState<CrusherStock[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingLog, setEditingLog] = useState<any>(null);
  
  const [formData, setFormData] = useState({ 
    name: 'الكسارة رقم 1 (الشمالية)', 
    sector: 'القطعة A', 
    dailyTons: 0, 
    sharshoorTons: 0,
    imageUrl: '' as string | null
  });

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/crushers');
      const data = await response.json();
      if (data.success && data.logs) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to fetch crusher logs', error);
    } finally {
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

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingLog 
        ? `http://localhost:5000/api/crushers/${editingLog.id}` 
        : 'http://localhost:5000/api/crushers';
      const method = editingLog ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          sector: formData.sector,
          dailyProductionTons: formData.dailyTons,
          sharshoorTons: formData.sharshoorTons,
          imageUrl: formData.imageUrl
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setIsModalOpen(false);
        setEditingLog(null);
        setFormData({ name: 'الكسارة رقم 1 (الشمالية)', sector: 'القطعة A', dailyTons: 0, sharshoorTons: 0, imageUrl: '' });
        fetchLogs();
      }
    } catch (error) {
      alert('فشل الاتصال بالخادم. يرجى التأكد من تشغيله.');
    }
  };

  const handleEdit = (log: any) => {
    setEditingLog(log);
    setFormData({
      name: log.name || '',
      sector: log.sector || 'القطعة A',
      dailyTons: log.dailyProductionTons || 0,
      sharshoorTons: log.sharshoorTons || 0,
      imageUrl: log.imageUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/crushers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchLogs();
    } catch (error) {
      alert('فشل حذف السجل');
    }
  };

  const openAddModal = () => {
    setEditingLog(null);
    setFormData({ name: 'الكسارة رقم 1 (الشمالية)', sector: 'القطعة A', dailyTons: 0, sharshoorTons: 0, imageUrl: '' });
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

  return (
    <div className="view-content">
      {/* Top 3 KPI Cards for Crushers (Dynamic Auto-Calculations) */}
      <div className="top-5-metrics-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="kpi-metric-card">
          <div className="kpi-card-header">
            <span className="kpi-title">إجمالي الإنتاج الفعلي المحسوب</span>
            <div className="kpi-icon-circle emerald">
              <TrendingUp size={20} />
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
              <Layers size={20} />
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
              <Factory size={20} />
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
            <RefreshCw size={16} />
            <span>تحديث</span>
          </button>
          <button className="secondary-action-btn" onClick={exportExcel}>
            <FileSpreadsheet size={17} />
            <span>تصدير إكسل</span>
          </button>
          <button className="primary-action-btn" onClick={openAddModal}>
            <Plus size={18} />
            <span>تسجيل إنتاج جديد</span>
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
            {logs.length > 0 ? logs.map(l => (
              <tr key={l.id}>
                <td><span className="code-badge">#CRU-0{l.id}</span></td>
                <td>{l.date ? l.date.split('T')[0] : 'اليوم'}</td>
                <td><strong>{l.name}</strong></td>
                <td><span className="sector-tag">{l.sector}</span></td>
                <td><strong style={{ color: '#16a34a' }}>+{l.dailyProductionTons} طن</strong></td>
                <td><span className="stock-pill">+{l.sharshoorTons} طن</span></td>
                <td>
                  {l.imageUrl ? (
                    <div 
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', background: '#eff6ff', padding: '0.25rem 0.6rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}
                      onClick={() => setSelectedImage(l.imageUrl)}
                      title="انقر لتكبير الصورة"
                    >
                      <img src={l.imageUrl} alt="صورة الكسارة" style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '6px' }} />
                      <span style={{ fontSize: '0.78rem', color: '#1d4ed8', fontWeight: 600 }}>عرض الصورة</span>
                    </div>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>لا توجد صورة</span>
                  )}
                </td>
                <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{l.notes || 'تقرير معتمد'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button 
                      onClick={() => handleEdit(l)}
                      style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#2563eb', fontWeight: 700 }}
                      title="تعديل"
                    >
                      <Pencil size={13} />
                      <span>تعديل</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(l.id)}
                      style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#dc2626', fontWeight: 700 }}
                      title="حذف"
                    >
                      <Trash2 size={13} />
                      <span>حذف</span>
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              crushers.map(c => (
                <tr key={c.id}>
                  <td><span className="code-badge">#CRU-SYS</span></td>
                  <td>اليوم</td>
                  <td><strong>{c.name}</strong></td>
                  <td><span className="sector-tag">{c.sector}</span></td>
                  <td><strong style={{ color: '#16a34a' }}>+{c.dailyProductionTons} طن</strong></td>
                  <td><span className="stock-pill">+{c.sharshoorTons} طن</span></td>
                  <td><span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>لا توجد صورة</span></td>
                  <td><span className="status-pill approved">تعمل بكفاءة</span></td>
                  <td>-</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div className="modal-backdrop" onClick={() => setSelectedImage(null)}>
          <div className="modal-card" style={{ maxWidth: '650px', padding: '1.25rem' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>الصورة الميدانية للتقرير المرفوع</h3>
              <button onClick={() => setSelectedImage(null)} className="close-btn"><X size={20} /></button>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <img src={selectedImage} alt="المستند الكامل" style={{ maxWidth: '100%', maxHeight: '480px', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }} />
            </div>
            <div className="modal-actions">
              <button className="primary-action-btn" onClick={() => setSelectedImage(null)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Crusher Batch Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editingLog ? 'تعديل سجل إنتاج الكسارة' : 'تسجيل إنتاج كسارة وتوثيقه'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingLog(null); }} className="close-btn"><X size={20} /></button>
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
                  <input type="number" className="form-input" value={formData.dailyTons} onChange={(e) => setFormData({ ...formData, dailyTons: Number(e.target.value) })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">كمية الشرشور المنتج (طن) <span className="required-asterisk">*</span></label>
                  <input type="number" className="form-input" value={formData.sharshoorTons} onChange={(e) => setFormData({ ...formData, sharshoorTons: Number(e.target.value) })} required />
                </div>
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
        </div>
      )}
    </div>
  );
};
