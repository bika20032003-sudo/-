import React, { useState, useEffect } from 'react';
import { 
  Fuel, 
  Plus, 
  Search, 
  FileSpreadsheet, 
  Droplet, 
  Gauge, 
  Truck, 
  Calendar,
  X,
  CheckCircle2,
  Camera,
  Eye,
  RefreshCw,
  Pencil,
  Trash2
} from 'lucide-react';
import { FuelDispatch } from '../types';
import { initialFuelLogs, initialEquipmentList } from '../data/mockData';
import * as XLSX from 'xlsx';

export const FuelView: React.FC = () => {
  const [fuelLogs, setFuelLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingLog, setEditingLog] = useState<any>(null);

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
    imageUrl: null as string | null
  };

  const [formData, setFormData] = useState<Partial<FuelDispatch> & { imageUrl?: string | null }>(defaultForm);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/fuel');
      const data = await response.json();
      if (data.success && data.logs) {
        setFuelLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to fetch fuel logs', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const totalDispensed = fuelLogs.reduce((acc, curr) => acc + (curr.liters || 0), 0);

  const filteredLogs = fuelLogs.filter(log =>
    log.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.equipmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.tankSource && log.tankSource.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddDispatch = async (e: React.FormEvent) => {
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
    } catch (error) {
      alert('فشل الاتصال بالخادم. يرجى التأكد من تشغيله.');
    }
  };

  const handleEdit = (log: any) => {
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

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإذن؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/fuel/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchLogs();
    } catch (error) {
      alert('فشل حذف السجل');
    }
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

  return (
    <div className="view-content">
      {/* Top 3 KPI Cards for Fuel */}
      <div className="top-5-metrics-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="kpi-metric-card">
          <div className="kpi-card-header">
            <span className="kpi-title">إجمالي السولار المصروف المحسوب</span>
            <div className="kpi-icon-circle orange">
              <Fuel size={20} />
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
              <Droplet size={20} />
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
              <Truck size={20} />
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
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="بحث برقم الإذن، اسم المعدة، السائق، أو المصدر..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <button className="secondary-action-btn" onClick={fetchLogs} title="تحديث">
            <RefreshCw size={16} />
            <span>تحديث</span>
          </button>
          <button className="secondary-action-btn" onClick={exportToExcel}>
            <FileSpreadsheet size={17} />
            <span>تصدير إكسل</span>
          </button>
          <button className="primary-action-btn" onClick={openAddModal}>
            <Plus size={18} />
            <span>تسجيل إذن صرف وقود</span>
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
            {filteredLogs.map(log => (
              <tr key={log.id}>
                <td>
                  <span className="code-badge">{log.ticketNumber}</span>
                </td>
                <td>
                  <div className="flex-cell">
                    <Calendar size={14} color="#64748b" />
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
                  {log.imageUrl ? (
                    <div 
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', background: '#fff7ed', padding: '0.25rem 0.6rem', borderRadius: '8px', border: '1px solid #fed7aa' }}
                      onClick={() => setSelectedImage(log.imageUrl)}
                      title="انقر لتكبير صورة العداد"
                    >
                      <img src={log.imageUrl} alt="صورة العداد" style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '6px' }} />
                      <span style={{ fontSize: '0.78rem', color: '#c2410c', fontWeight: 600 }}>عرض صورة العداد</span>
                    </div>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>إذن ورقي</span>
                  )}
                </td>
                <td>
                  <span className="source-tag">{log.tankSource || 'صهريج القطعة A'}</span>
                </td>
                <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {log.notes || 'معتمد'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button 
                      onClick={() => handleEdit(log)}
                      style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#2563eb', fontWeight: 700 }}
                      title="تعديل"
                    >
                      <Pencil size={13} />
                      <span>تعديل</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(log.id)}
                      style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#dc2626', fontWeight: 700 }}
                      title="حذف"
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
      </div>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div className="modal-backdrop" onClick={() => setSelectedImage(null)}>
          <div className="modal-card" style={{ maxWidth: '650px', padding: '1.25rem' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>صورة عداد الصرف / بوليصة الوقود</h3>
              <button onClick={() => setSelectedImage(null)} className="close-btn"><X size={20} /></button>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <img src={selectedImage} alt="صورة العداد الكاملة" style={{ maxWidth: '100%', maxHeight: '480px', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }} />
            </div>
            <div className="modal-actions">
              <button className="primary-action-btn" onClick={() => setSelectedImage(null)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Fuel Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editingLog ? 'تعديل إذن صرف الوقود' : 'إنشاء إذن صرف وقود'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingLog(null); }} className="close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddDispatch} className="modal-form">
              <div className="form-group">
                <label className="form-label">المعدة المستلمة للوقود <span className="required-asterisk">*</span></label>
                <select
                  className="form-input"
                  value={formData.equipmentName}
                  onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                >
                  {initialEquipmentList.map(eq => (
                    <option key={eq.id} value={eq.name}>{eq.name} ({eq.code})</option>
                  ))}
                </select>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">الكمية المصروفة (لتر) <span className="required-asterisk">*</span></label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.liters}
                    onChange={(e) => setFormData({ ...formData, liters: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">السائق / المستلم <span className="required-asterisk">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">مصدر التزويد</label>
                <select
                  className="form-input"
                  value={formData.tankSource}
                  onChange={(e) => setFormData({ ...formData, tankSource: e.target.value })}
                >
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
        </div>
      )}
    </div>
  );
};
