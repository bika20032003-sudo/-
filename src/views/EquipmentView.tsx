import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  Wrench, 
  AlertOctagon, 
  Clock, 
  MapPin, 
  User,
  X,
  FileSpreadsheet,
  Camera,
  Eye,
  RefreshCw,
  Pencil,
  Trash2
} from 'lucide-react';
import { Equipment } from '../types';
import { initialEquipmentList } from '../data/mockData';
import * as XLSX from 'xlsx';

export const EquipmentView: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  // New equipment form state
  const [formData, setFormData] = useState<Partial<Equipment> & { imageUrl?: string | null }>({
    code: '',
    name: '',
    type: 'معدة عامة',
    category: 'heavy',
    status: 'operational',
    driver: '',
    location: 'الموقع العام',
    dailyHours: 8,
    fuelConsumptionRate: 25,
    imageUrl: null,
    notes: ''
  });

  const fetchEquipment = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/equipment');
      const data = await response.json();
      if (data.success && data.equipment) {
        setEquipmentList(data.equipment);
      } else {
        setEquipmentList([]);
      }
    } catch (error) {
      console.error('Failed to fetch equipment', error);
      setEquipmentList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const total = equipmentList.length;
  const operational = equipmentList.filter(e => e.status === 'operational').length;
  const maintenance = equipmentList.filter(e => e.status === 'maintenance').length;
  const stopped = equipmentList.filter(e => e.status === 'stopped' || e.status === 'breakdown').length;
  const readiness = total > 0 ? ((operational / total) * 100).toFixed(1) : '0.0';

  const filteredEquipment = equipmentList.filter(eq => {
    const matchesSearch = 
      eq.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (eq.driver && eq.driver.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (eq.location && eq.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || eq.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    try {
      const url = editingItem 
        ? `http://localhost:5000/api/equipment/${editingItem.id}` 
        : 'http://localhost:5000/api/equipment';
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ code: '', name: '', type: 'معدة عامة', category: 'heavy', status: 'operational', driver: '', location: 'الموقع العام', dailyHours: 8, fuelConsumptionRate: 25, imageUrl: null, notes: '' });
        fetchEquipment();
      }
    } catch (error) {
      alert('فشل الاتصال بالخادم.');
    }
  };

  const handleEdit = (eq: any) => {
    setEditingItem(eq);
    setFormData({
      code: eq.code || '',
      name: eq.name || '',
      type: eq.type || 'معدة عامة',
      category: eq.category || 'heavy',
      status: eq.status || 'operational',
      driver: eq.driver || '',
      location: eq.location || '',
      dailyHours: eq.dailyHours || 8,
      fuelConsumptionRate: eq.fuelConsumptionRate || 25,
      imageUrl: eq.imageUrl || null,
      notes: eq.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه المعدة؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/equipment/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchEquipment();
    } catch (error) {
      alert('فشل حذف السجل');
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ code: '', name: '', type: 'معدة عامة', category: 'heavy', status: 'operational', driver: '', location: 'الموقع العام', dailyHours: 8, fuelConsumptionRate: 25, imageUrl: null, notes: '' });
    setIsModalOpen(true);
  };

  const exportToExcel = () => {
    const data = equipmentList.map(eq => ({
      'كود المعدة': eq.code,
      'اسم المعدة والطراز': eq.name,
      'النوع': eq.type,
      'الحالة': eq.status === 'operational' ? 'عاملة' : 'صيانة/متوقفة',
      'السائق المشغل': eq.driver,
      'الموقع الميداني': eq.location,
      'ساعات العمل اليومية': eq.dailyHours,
      'ملاحظات': eq.notes || '-'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'سجل المعدات');
    XLSX.writeFile(wb, 'سجل_المعدات_والآليات_اليومي.xlsx');
  };

  return (
    <div className="view-content">
      {/* Top 4 KPI Metrics (Auto-Calculated) */}
      <div className="top-5-metrics-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi-metric-card">
          <div className="kpi-card-header">
            <span className="kpi-title">إجمالي أسطول الآليات</span>
            <div className="kpi-icon-circle blue"><Truck size={20} /></div>
          </div>
          <div className="kpi-value-center">
            <span className="kpi-big-num">{total}</span>
            <span className="kpi-unit-label">معدة</span>
          </div>
          <div className="kpi-bottom-sub"><span className="kpi-gray-text">الأسطول الميداني المعتمد</span></div>
        </div>

        <div className="kpi-metric-card">
          <div className="kpi-card-header">
            <span className="kpi-title">المعدات العاملة بالميدان</span>
            <div className="kpi-icon-circle green"><CheckCircle2 size={20} color="#16a34a" /></div>
          </div>
          <div className="kpi-value-center">
            <span className="kpi-big-num">{operational}</span>
            <span className="kpi-unit-label">معدة</span>
          </div>
          <div className="kpi-bottom-sub"><span className="kpi-green-badge">جاهزية {readiness}%</span></div>
        </div>

        <div className="kpi-metric-card">
          <div className="kpi-card-header">
            <span className="kpi-title">تحت الصيانة الميدانية</span>
            <div className="kpi-icon-circle orange"><Wrench size={20} /></div>
          </div>
          <div className="kpi-value-center">
            <span className="kpi-big-num">{maintenance}</span>
            <span className="kpi-unit-label">معدة</span>
          </div>
          <div className="kpi-bottom-sub"><span className="kpi-gray-text">فرق الصيانة تعمل عليها</span></div>
        </div>

        <div className="kpi-metric-card">
          <div className="kpi-card-header">
            <span className="kpi-title">المعدات المتوقفة</span>
            <div className="kpi-icon-circle red"><AlertOctagon size={20} /></div>
          </div>
          <div className="kpi-value-center">
            <span className="kpi-big-num">{stopped}</span>
            <span className="kpi-unit-label">معدة</span>
          </div>
          <div className="kpi-bottom-sub"><span className="kpi-danger-text">بحاجة متابعة وتوريد قطع</span></div>
        </div>
      </div>

      {/* Table Controls */}
      <div className="table-controls-bar">
        <div className="search-input-box">
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="بحث بالكود، اسم المعدة، السائق، أو الموقع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">كافة الحالات التشغيلية</option>
            <option value="operational">عاملة بالميدان</option>
            <option value="maintenance">تحت الصيانة</option>
            <option value="stopped">متوقفة</option>
          </select>

          <button className="secondary-action-btn" onClick={fetchEquipment} title="تحديث">
            <RefreshCw size={16} />
            <span>تحديث</span>
          </button>
          <button className="secondary-action-btn" onClick={exportToExcel}>
            <FileSpreadsheet size={17} />
            <span>تصدير إكسل</span>
          </button>
          <button className="primary-action-btn" onClick={openAddModal}>
            <Plus size={18} />
            <span>إضافة معدة جديدة</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>كود المعدة</th>
              <th>المعدة والطراز</th>
              <th>الحالة التشغيلية</th>
              <th>السائق / المشغل</th>
              <th>الموقع الميداني</th>
              <th>ساعات التشغيل</th>
              <th>صورة المعدة / الفحص</th>
              <th>ملاحظات</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredEquipment.map((eq) => (
              <tr key={eq.id}>
                <td><span className="code-badge">{eq.code}</span></td>
                <td>
                  <div className="equip-name-wrap">
                    <strong>{eq.name}</strong>
                    <span className="equip-type-sub">{eq.type}</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${eq.status}`}>
                    {eq.status === 'operational' && 'عاملة بالميدان'}
                    {eq.status === 'maintenance' && 'تحت الصيانة'}
                    {eq.status === 'stopped' && 'متوقفة'}
                  </span>
                </td>
                <td>
                  <div className="flex-cell">
                    <User size={14} color="#64748b" />
                    <span>{eq.driver || 'سائق معتمد'}</span>
                  </div>
                </td>
                <td>
                  <div className="flex-cell">
                    <MapPin size={14} color="#0284c7" />
                    <span>{eq.location || 'القطعة A'}</span>
                  </div>
                </td>
                <td><strong>{eq.dailyHours || 8} س</strong></td>
                <td>
                  {eq.imageUrl ? (
                    <div 
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', background: '#f5f3ff', padding: '0.25rem 0.6rem', borderRadius: '8px', border: '1px solid #ddd6fe' }}
                      onClick={() => setSelectedImage(eq.imageUrl)}
                      title="انقر لتكبير صورة المعدة"
                    >
                      <img src={eq.imageUrl} alt="صورة المعدة" style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '6px' }} />
                      <span style={{ fontSize: '0.78rem', color: '#6d28d9', fontWeight: 600 }}>عرض الصورة</span>
                    </div>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>لا توجد صورة</span>
                  )}
                </td>
                <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{eq.notes || 'جاهزة'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button 
                      onClick={() => handleEdit(eq)}
                      style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#2563eb', fontWeight: 700 }}
                      title="تعديل"
                    >
                      <Pencil size={13} />
                      <span>تعديل</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(eq.id)}
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
              <h3>صورة المعدة / بطاقة الفحص الميداني</h3>
              <button onClick={() => setSelectedImage(null)} className="close-btn"><X size={20} /></button>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <img src={selectedImage} alt="صورة المعدة الكاملة" style={{ maxWidth: '100%', maxHeight: '480px', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }} />
            </div>
            <div className="modal-actions">
              <button className="primary-action-btn" onClick={() => setSelectedImage(null)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editingItem ? 'تعديل بيانات المعدة' : 'تسجيل بيانات معدة جديدة'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingItem(null); }} className="close-btn"><X size={20} /></button>
            </div>

            <form onSubmit={handleAddEquipment} className="modal-form">
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">كود المعدة <span className="required-asterisk">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="مثال: EX-09"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">اسم وطراز المعدة <span className="required-asterisk">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="مثال: حفار Komatsu PC390"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">الحالة التشغيلية</label>
                  <select
                    className="form-input"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="operational">عاملة بالميدان</option>
                    <option value="maintenance">تحت الصيانة</option>
                    <option value="stopped">متوقفة</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">الموقع الميداني</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-action-btn" onClick={() => { setIsModalOpen(false); setEditingItem(null); }} style={{ height: '48px' }}>
                  إلغاء
                </button>
                <button type="submit" className="primary-action-btn" style={{ flex: 1, height: '48px', justifyContent: 'center' }}>
                  {editingItem ? 'حفظ التعديلات' : 'حفظ وتسجيل المعدة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
