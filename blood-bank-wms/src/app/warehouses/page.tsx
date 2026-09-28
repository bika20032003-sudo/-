// صفحة إدارة المخازن وأماكن التخزين
// منظومة إدارة مخازن الهيئة العامة لخدمات نقل الدم
'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import {
  Warehouse as WarehouseIcon,
  Plus,
  MapPin,
  CheckCircle,
  ThermometerSnowflake,
  Box,
  Layers,
  X,
  Save,
  Building2,
  Package,
} from 'lucide-react';
import { initialWarehouses } from '@/lib/mockData';
import { Warehouse } from '@/types';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialWarehouses);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

  // نموذج إضافة مخزن مبسط
  const [newWh, setNewWh] = useState({
    Name: '',
    Code: `WH-00${warehouses.length + 1}`,
    Location: 'طرابلس',
    Type: 'إقليمي / فرعي' as Warehouse['Type'],
    ManagerName: 'أمين المخزن المختص',
    Description: '',
  });

  const handleCreateWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWh.Name) return;

    const wh: Warehouse = {
      Id: warehouses.length + 1,
      Name: newWh.Name,
      Code: newWh.Code,
      Location: newWh.Location || 'ليبيا',
      Type: newWh.Type,
      ManagerName: newWh.ManagerName,
      Description: newWh.Description || 'مخزن تابع للهيئة العامة لخدمات نقل الدم',
      IsActive: true,
      CreatedAt: new Date().toISOString().split('T')[0],
      TotalStock: 0,
    };

    setWarehouses([...warehouses, wh]);
    setShowAddModal(false);
    setNewWh({
      Name: '',
      Code: `WH-00${warehouses.length + 2}`,
      Location: 'طرابلس',
      Type: 'إقليمي / فرعي',
      ManagerName: 'أمين المخزن المختص',
      Description: '',
    });
  };

  return (
    <>
      <Header
        title="إدارة المخازن ومواقع التخزين"
        subtitle="الهيئة العامة لخدمات نقل الدم / المخازن الرئيسية والإقليمية"
      />

      <div className="page-content">
        {/* رأس الصفحة */}
        <div className="page-header">
          <div>
            <h1 className="page-header-title">المخازن والمراكز الإقليمية</h1>
            <p className="page-header-subtitle">
              حصر ومتابعة المخزن الرئيسي العام والمخازن الإقليمية التابعة للهيئة مع تصنيف سعات التخزين
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            إضافة مخزن جديد
          </button>
        </div>

        {/* شبكة بطاقات المخازن */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {warehouses.map((wh) => (
            <div
              key={wh.Id}
              className="card"
              style={{
                border: wh.Type === 'رئيسي' ? '2px solid var(--primary-500)' : '1px solid var(--border-light)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {wh.Type === 'رئيسي' && (
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'var(--primary-600)',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '20px',
                  }}
                >
                  ★ المخزن الرئيسي الافتراضي
                </div>
              )}

              <div className="card-body" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: wh.Type === 'رئيسي' ? 'var(--primary-50)' : '#f8fafc',
                      color: wh.Type === 'رئيسي' ? 'var(--primary-600)' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <WarehouseIcon size={26} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                      {wh.Name}
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      الكود: {wh.Code} | النوع: {wh.Type}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={16} style={{ color: 'var(--primary-500)' }} />
                    <span>{wh.Location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Package size={16} style={{ color: '#16a34a' }} />
                    <span>الرصيد المخزني الفعلي: <strong>{wh.TotalStock?.toLocaleString() || 0} وحدة</strong></span>
                  </div>
                </div>

                {wh.Description && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', margin: '0 0 16px 0', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                    {wh.Description}
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                  <span className="badge badge-success">
                    <CheckCircle size={12} style={{ marginLeft: '4px' }} />
                    مخزن نشط
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => alert(`المخزن ${wh.Name} جاهز للعمليات وتوريد الأصناف`)}
                  >
                    عرض التفاصيل
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* مودال إضافة مخزن جديد مبسط */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" style={{ maxWidth: '540px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">إضافة مخزن جديد</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  تسجيل موقع تخزيني أو مركز إقليمي جديد
                </p>
              </div>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateWarehouse}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">اسم المخزن</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="مثال: مخزن المركز الإقليمي - الزاوية"
                    value={newWh.Name}
                    onChange={(e) => setNewWh({ ...newWh, Name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">كود المخزن</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newWh.Code}
                      onChange={(e) => setNewWh({ ...newWh, Code: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">نوع المخزن</label>
                    <select
                      className="form-select"
                      value={newWh.Type}
                      onChange={(e) => setNewWh({ ...newWh, Type: e.target.value as Warehouse['Type'] })}
                    >
                      <option value="إقليمي / فرعي">إقليمي / فرعي</option>
                      <option value="رئيسي">رئيسي</option>
                      <option value="مخزن فرعي">مخزن فرعي</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">الموقع والمدينة</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="مثال: طرابلس - طريق الشط"
                    value={newWh.Location}
                    onChange={(e) => setNewWh({ ...newWh, Location: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">الوصف والملاحظات</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    placeholder="وصف المخزن وسعته الاستيعابية..."
                    value={newWh.Description}
                    onChange={(e) => setNewWh({ ...newWh, Description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  حفظ المخزن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
