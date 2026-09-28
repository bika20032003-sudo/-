// صفحة إدارة الأصناف والمخزون الطبي - الرصيد الفعلي وإدارة المواد التالفة
// منظومة إدارة مخازن الهيئة العامة لخدمات نقل الدم
'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import {
  Plus,
  Search,
  Eye,
  Package,
  Download,
  X,
  Save,
  AlertCircle,
  ThermometerSnowflake,
  Box,
  Building2,
  CheckCircle,
  AlertTriangle,
  Layers,
  EyeOff,
  Trash2,
  FileCheck2,
  Archive,
  BarChart3,
  Calendar,
} from 'lucide-react';
import {
  initialItems,
  initialSuppliers,
  initialDamagedItems,
} from '@/lib/mockData';
import {
  Item,
  ItemCategoryType,
  StorageLocationType,
  DamagedItemRecord,
} from '@/types';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'damaged'>('inventory');
  const [items, setItems] = useState<Item[]>(initialItems);
  const [damagedItems, setDamagedItems] = useState<DamagedItemRecord[]>(initialDamagedItems);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [selectedStorage, setSelectedStorage] = useState('الكل');
  const [selectedStatus, setSelectedStatus] = useState('الكل');
  
  // الجانب المالي مخفي افتراضياً
  const [showFinancials, setShowFinancials] = useState(false);

  // النوافذ المنبثقة
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddDamagedModal, setShowAddDamagedModal] = useState(false);
  const [showItemCardModal, setShowItemCardModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // =============================================
  // نموذج إضافة صنف جديد (مبسط بدون الحد الأدنى الإجباري)
  // =============================================
  const [newItem, setNewItem] = useState({
    Code: `ITM-00${items.length + 1}`,
    Barcode: `6221001000${items.length + 1}5`,
    Name: '',
    Category: 'أدوية' as ItemCategoryType,
    Unit: 'علبة',
    StorageType: 'ثلاجة' as StorageLocationType,
    StorageLocation: '',
    SupplierName: initialSuppliers[0].Name,
    ActualStock: '500',
    UnitPrice: '15.00',
    Status: 'متوفر' as Item['Status'],
    Description: '',
  });

  // =============================================
  // نموذج تسجيل مادة تالفة
  // =============================================
  const [newDamaged, setNewDamaged] = useState({
    ItemCode: initialItems[0].Code,
    ItemName: initialItems[0].Name,
    Quantity: '10',
    Unit: initialItems[0].Unit,
    BatchNumber: 'BTH-2026-X',
    ExpiryDate: '2026-08-30',
    Reason: 'انتهاء فترة الصلاحية المقررة',
    ReportNumber: `DMG-2026-00${damagedItems.length + 1}`,
    Warehouse: 'المخزن الرئيسي المركز - طرابلس',
    RecordedBy: 'أحمد محمد - أمين الخزينة',
    DisposalStatus: 'بانتظار الإتلاف' as DamagedItemRecord['DisposalStatus'],
  });

  // حفظ صنف جديد
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.Name) return;

    const actualStock = parseInt(newItem.ActualStock) || 0;
    const status: Item['Status'] = actualStock > 0 ? 'متوفر' : 'غير متوفر';

    const sup = initialSuppliers.find((s) => s.Name === newItem.SupplierName);

    const created: Item = {
      Id: items.length + 1,
      Code: newItem.Code,
      Barcode: newItem.Barcode,
      Name: newItem.Name,
      Category: newItem.Category,
      Unit: newItem.Unit,
      StorageType: newItem.StorageType,
      StorageLocation: newItem.StorageLocation || (newItem.StorageType === 'ثلاجة' ? 'ثلاجة الحفظ الرئيسية' : 'مخزن المستلزمات الطبية'),
      SupplierId: sup?.Id,
      SupplierName: newItem.SupplierName,
      ActualStock: actualStock,
      DamagedStock: 0,
      UnitPrice: parseFloat(newItem.UnitPrice) || 0,
      Status: status,
      Description: newItem.Description,
      IsActive: true,
      CreatedAt: new Date().toISOString().split('T')[0],
      UpdatedAt: new Date().toISOString().split('T')[0],
    };

    setItems([created, ...items]);
    setShowAddModal(false);
    setNewItem({
      Code: `ITM-00${items.length + 2}`,
      Barcode: `6221001000${items.length + 2}5`,
      Name: '',
      Category: 'أدوية',
      Unit: 'علبة',
      StorageType: 'ثلاجة',
      StorageLocation: '',
      SupplierName: initialSuppliers[0].Name,
      ActualStock: '100',
      UnitPrice: '10.00',
      Status: 'متوفر',
      Description: '',
    });
  };

  // حفظ تسجيل مادة تالفة
  const handleSaveDamaged = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(newDamaged.Quantity) || 1;

    const createdDamage: DamagedItemRecord = {
      Id: damagedItems.length + 1,
      ItemCode: newDamaged.ItemCode,
      ItemName: newDamaged.ItemName,
      Quantity: qty,
      Unit: newDamaged.Unit,
      BatchNumber: newDamaged.BatchNumber,
      ExpiryDate: newDamaged.ExpiryDate,
      Reason: newDamaged.Reason,
      ReportNumber: newDamaged.ReportNumber,
      Date: new Date().toISOString().split('T')[0],
      RecordedBy: newDamaged.RecordedBy,
      Warehouse: newDamaged.Warehouse,
      DisposalStatus: newDamaged.DisposalStatus,
    };

    // تحديث رصيد التالف في قائمة الأصناف
    setItems(
      items.map((itm) => {
        if (itm.Code === newDamaged.ItemCode) {
          const newActual = Math.max(0, itm.ActualStock - qty);
          return {
            ...itm,
            ActualStock: newActual,
            DamagedStock: (itm.DamagedStock || 0) + qty,
            Status: newActual > 0 ? 'متوفر' : 'غير متوفر',
          };
        }
        return itm;
      })
    );

    setDamagedItems([createdDamage, ...damagedItems]);
    setShowAddDamagedModal(false);
  };

  // فلترة الأصناف
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.SupplierName && item.SupplierName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.Barcode && item.Barcode.includes(searchTerm));

    const matchesCategory = selectedCategory === 'الكل' || item.Category === selectedCategory;
    const matchesStorage = selectedStorage === 'الكل' || item.StorageType === selectedStorage;
    const matchesStatus = selectedStatus === 'الكل' || item.Status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStorage && matchesStatus;
  });

  // فلترة المواد التالفة
  const filteredDamaged = damagedItems.filter((d) => {
    const term = searchTerm.toLowerCase();
    return (
      d.ItemName.toLowerCase().includes(term) ||
      d.ItemCode.toLowerCase().includes(term) ||
      d.ReportNumber.toLowerCase().includes(term) ||
      d.Reason.toLowerCase().includes(term)
    );
  });

  const categoriesList = ['الكل', 'أدوية', 'أكياس الدم', 'الكواشف والمحاليل', 'المستلزمات الطبية', 'مستلزمات السلامة', 'المواد المخبرية'];

  return (
    <>
      <Header
        title="إدارة الأصناف والمخزون الطبي"
        subtitle="الهيئة العامة لخدمات نقل الدم / الرصيد الفعلي والمواد التالفة"
      />

      <div className="page-content">
        {/* رأس الصفحة وأزرار الإجراءات */}
        <div className="page-header" style={{ marginBottom: '16px' }}>
          <div>
            <h1 className="page-header-title">الأصناف والرصيد الفعلي للمخازن</h1>
            <p className="page-header-subtitle">
              حصر دقيق للأصناف الطبية، الرصيد الفعلي المتوفر، أماكن التخزين (ثلاجة/مخزن)، وإدارة المواد التالفة
            </p>
          </div>
          <div className="page-header-actions" style={{ gap: '10px' }}>
            {/* زر إخفاء / إظهار الجانب المالي */}
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowFinancials(!showFinancials)}
              title="إخفاء أو إظهار الأسعار والتكاليف المالية"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {showFinancials ? <EyeOff size={16} /> : <Eye size={16} />}
              {showFinancials ? 'إخفاء الجانب المالي' : 'إظهار الجانب المالي'}
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowAddDamagedModal(true)}
              style={{ color: '#b91c1c', borderColor: '#fca5a5', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <AlertCircle size={16} />
              تسجيل صنف تالف
            </button>

            <button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={18} />
              إضافة صنف جديد
            </button>
          </div>
        </div>

        {/* بطاقات الإحصاء السريع */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={26} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>إجمالي عدد الأصناف المسجلة</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {items.length} صنف
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={26} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>إجمالي الرصيد الفعلي المتوفر</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a' }}>
                {items.reduce((acc, i) => acc + i.ActualStock, 0).toLocaleString()} وحدة
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={26} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>إجمالي الكميات التالفة</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626' }}>
                {items.reduce((acc, i) => acc + (i.DamagedStock || 0), 0)} وحدة
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f8fafc', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ThermometerSnowflake size={26} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>أصناف التبريد (ثلاجة)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0284c7' }}>
                {items.filter((i) => i.StorageType === 'ثلاجة').length} صنف
              </div>
            </div>
          </div>
        </div>

        {/* تبويبات الانتقال بين جدول الأصناف والرصيد الفعلي، وسجل التالف */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <button
            className={`btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('inventory')}
            style={{ fontWeight: 700 }}
          >
            <Layers size={16} />
            جدول الأصناف والرصيد الفعلي
          </button>
          <button
            className={`btn ${activeTab === 'damaged' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('damaged')}
            style={{
              fontWeight: 700,
              background: activeTab === 'damaged' ? '#dc2626' : undefined,
              borderColor: activeTab === 'damaged' ? '#dc2626' : undefined,
              color: activeTab === 'damaged' ? '#ffffff' : undefined,
            }}
          >
            <AlertCircle size={16} />
            سجل المواد والأصناف التالفة ({damagedItems.length})
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 1. جدول الأصناف والرصيد الفعلي */}
        {/* ========================================================================= */}
        {activeTab === 'inventory' && (
          <div className="table-container">
            {/* شريط الفلاتر والبحث */}
            <div className="table-toolbar">
              <div className="table-toolbar-right" style={{ gap: '10px', flexWrap: 'wrap' }}>
                <div className="table-search" style={{ minWidth: '280px' }}>
                  <Search className="table-search-icon" size={16} />
                  <input
                    type="text"
                    placeholder="بحث باسم الصنف، الكود، الباركود، أو المورد..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  className="form-select"
                  style={{ width: '170px', padding: '9px 12px' }}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categoriesList.map((c) => (
                    <option key={c} value={c}>
                      {c === 'الكل' ? 'جميع التصنيفات' : c}
                    </option>
                  ))}
                </select>

                <select
                  className="form-select"
                  style={{ width: '150px', padding: '9px 12px' }}
                  value={selectedStorage}
                  onChange={(e) => setSelectedStorage(e.target.value)}
                >
                  <option value="الكل">جميع أماكن التخزين</option>
                  <option value="ثلاجة">ثلاجة ❄️</option>
                  <option value="مخزن">مخزن 📦</option>
                  <option value="خزانة">خزانة 🗄️</option>
                </select>

                <select
                  className="form-select"
                  style={{ width: '130px', padding: '9px 12px' }}
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="الكل">كل الحالات</option>
                  <option value="متوفر">متوفر</option>
                  <option value="غير متوفر">غير متوفر</option>
                </select>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                عرض {filteredItems.length} من أصل {items.length} صنف
              </div>
            </div>

            {/* الجدول الرئيسي */}
            <table className="data-table">
              <thead>
                <tr>
                  <th>كود الصنف</th>
                  <th>اسم الصنف الطبي</th>
                  <th>التصنيف</th>
                  <th>الوحدة</th>
                  <th>مكان التخزين</th>
                  <th>المورد المعتمد</th>
                  <th style={{ background: '#f0fdf4', color: '#16a34a', fontWeight: 800 }}>الرصيد الفعلي</th>
                  <th>التالف</th>
                  {showFinancials && <th>سعر الوحدة</th>}
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={showFinancials ? 11 : 10} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                      لا توجد أصناف مطابقة للبحث
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.Id}>
                      <td style={{ fontWeight: 700, color: 'var(--primary-600)', direction: 'ltr', textAlign: 'right' }}>
                        {item.Code}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.Name}</div>
                        {item.Barcode && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', direction: 'ltr', textAlign: 'right' }}>
                            {item.Barcode}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-secondary">{item.Category}</span>
                      </td>
                      <td>{item.Unit}</td>
                      <td>
                        <span
                          className={`badge ${
                            item.StorageType === 'ثلاجة'
                              ? 'badge-info'
                              : item.StorageType === 'خزانة'
                              ? 'badge-warning'
                              : 'badge-secondary'
                          }`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          {item.StorageType === 'ثلاجة' ? '❄️ ثلاجة' : item.StorageType === 'خزانة' ? '🗄️ خزانة' : '📦 مخزن'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{item.SupplierName || '-'}</td>
                      <td style={{ background: '#f0fdf4', fontWeight: 800, fontSize: '1rem', color: item.ActualStock > 0 ? '#16a34a' : '#dc2626' }}>
                        {item.ActualStock.toLocaleString()} {item.Unit}
                      </td>
                      <td style={{ color: (item.DamagedStock || 0) > 0 ? '#dc2626' : 'var(--text-tertiary)', fontWeight: (item.DamagedStock || 0) > 0 ? 700 : 400 }}>
                        {(item.DamagedStock || 0) > 0 ? `${item.DamagedStock} ${item.Unit}` : '-'}
                      </td>
                      {showFinancials && (
                        <td style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
                          {item.UnitPrice ? `${item.UnitPrice.toFixed(2)} د.ل` : '-'}
                        </td>
                      )}
                      <td>
                        <span className={`badge ${item.Status === 'متوفر' ? 'badge-success' : 'badge-danger'}`}>
                          {item.Status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          title="عرض بطاقة الصنف"
                          onClick={() => {
                            setSelectedItem(item);
                            setShowItemCardModal(true);
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={15} />
                          بطاقة الصنف
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. سجل وإدارة المواد والأصناف التالفة */}
        {/* ========================================================================= */}
        {activeTab === 'damaged' && (
          <div className="table-container">
            <div className="table-toolbar">
              <div className="table-toolbar-right" style={{ gap: '10px' }}>
                <div className="table-search" style={{ minWidth: '320px' }}>
                  <Search className="table-search-icon" size={16} />
                  <input
                    type="text"
                    placeholder="بحث برقم محضر التلف، كود الصنف، أو سبب التلف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <button
                className="btn"
                style={{ background: '#dc2626', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setShowAddDamagedModal(true)}
              >
                <Plus size={16} />
                تسجيل محضر تلف جديد
              </button>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>رقم محضر التلف</th>
                  <th>كود الصنف</th>
                  <th>اسم الصنف الطبي</th>
                  <th>الكمية التالفة</th>
                  <th>رقم التشغيلة (Batch)</th>
                  <th>تاريخ الصلاحية</th>
                  <th>سبب التلف</th>
                  <th>المخزن</th>
                  <th>الموثق (أمين الخزينة)</th>
                  <th>حالة الإتلاف</th>
                </tr>
              </thead>
              <tbody>
                {filteredDamaged.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                      لا توجد سجلات تالف مطابقة للبحث
                    </td>
                  </tr>
                ) : (
                  filteredDamaged.map((d) => (
                    <tr key={d.Id}>
                      <td style={{ fontWeight: 700, color: '#dc2626', direction: 'ltr', textAlign: 'right' }}>
                        {d.ReportNumber}
                      </td>
                      <td style={{ fontWeight: 600 }}>{d.ItemCode}</td>
                      <td style={{ fontWeight: 700 }}>{d.ItemName}</td>
                      <td style={{ fontWeight: 800, color: '#dc2626' }}>
                        {d.Quantity} {d.Unit}
                      </td>
                      <td style={{ direction: 'ltr', textAlign: 'right' }}>{d.BatchNumber}</td>
                      <td>{d.ExpiryDate}</td>
                      <td>{d.Reason}</td>
                      <td>{d.Warehouse}</td>
                      <td style={{ fontSize: '0.85rem' }}>{d.RecordedBy}</td>
                      <td>
                        <span className="badge badge-warning">{d.DisposalStatus}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 📦 مودال إضافة صنف جديد (مبسط) */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" style={{ maxWidth: '750px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">إضافة صنف طبي ومخزني جديد</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  تسجيل صنف جديد وتحديد نوع التخزين (ثلاجة/مخزن) والشركة الموردة
                </p>
              </div>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveItem}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">كود الصنف</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newItem.Code}
                      onChange={(e) => setNewItem({ ...newItem, Code: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">الباركود الدولي (Barcode)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newItem.Barcode}
                      onChange={(e) => setNewItem({ ...newItem, Barcode: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">اسم الصنف والمواصفات الطبية</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="مثال: أكياس دم مفردة 450ml مع CPDA-1..."
                    value={newItem.Name}
                    onChange={(e) => setNewItem({ ...newItem, Name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">تصنيف الصنف</label>
                    <select
                      className="form-select"
                      value={newItem.Category}
                      onChange={(e) => setNewItem({ ...newItem, Category: e.target.value as ItemCategoryType })}
                    >
                      <option value="أدوية">أدوية</option>
                      <option value="أكياس الدم">أكياس الدم</option>
                      <option value="الكواشف والمحاليل">الكواشف والمحاليل</option>
                      <option value="المستلزمات الطبية">المستلزمات الطبية</option>
                      <option value="مستلزمات السلامة">مستلزمات السلامة</option>
                      <option value="المواد المخبرية">المواد المخبرية</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">الوحدة</label>
                    <select
                      className="form-select"
                      value={newItem.Unit}
                      onChange={(e) => setNewItem({ ...newItem, Unit: e.target.value })}
                    >
                      <option value="علبة">علبة</option>
                      <option value="كيس">كيس</option>
                      <option value="زجاجة">زجاجة</option>
                      <option value="صندوق">صندوق</option>
                      <option value="أمبول">أمبول</option>
                      <option value="لفة">لفة</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">مكان ونوع التخزين</label>
                    <select
                      className="form-select"
                      value={newItem.StorageType}
                      onChange={(e) => setNewItem({ ...newItem, StorageType: e.target.value as StorageLocationType })}
                    >
                      <option value="ثلاجة">ثلاجة ❄️ (تبريد 2-8°C)</option>
                      <option value="مخزن">مخزن 📦 (جاف)</option>
                      <option value="خزانة">خزانة 🗄️ (حفظ آمن)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">الشركة الموردة المعتمدة</label>
                    <select
                      className="form-select"
                      value={newItem.SupplierName}
                      onChange={(e) => setNewItem({ ...newItem, SupplierName: e.target.value })}
                    >
                      {initialSuppliers.map((s) => (
                        <option key={s.Id} value={s.Name}>
                          {s.Name} ({s.Code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">الرصيد الافتتاحي الفعلي</label>
                    <input
                      type="number"
                      className="form-input"
                      value={newItem.ActualStock}
                      onChange={(e) => setNewItem({ ...newItem, ActualStock: e.target.value })}
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">الوصف والملاحظات</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    placeholder="ملاحظات الحفظ والاستخدام..."
                    value={newItem.Description}
                    onChange={(e) => setNewItem({ ...newItem, Description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  حفظ الصنف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ⚠️ مودال تسجيل محضر صنف تالف */}
      {/* ========================================================================= */}
      {showAddDamagedModal && (
        <div className="modal-overlay" onClick={() => setShowAddDamagedModal(false)}>
          <div className="modal-content" style={{ maxWidth: '650px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: '2px solid #dc2626' }}>
              <div>
                <h3 className="modal-title" style={{ color: '#b91c1c' }}>تسجيل محضر مادة / صنف تالف</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  حصر المواد التالفة وإخراجها من الرصيد الفعلي للسلامة والجرد
                </p>
              </div>
              <button className="modal-close" onClick={() => setShowAddDamagedModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveDamaged}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">رقم محضر التلف</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newDamaged.ReportNumber}
                      onChange={(e) => setNewDamaged({ ...newDamaged, ReportNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">المخزن</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newDamaged.Warehouse}
                      onChange={(e) => setNewDamaged({ ...newDamaged, Warehouse: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">الصنف التالف</label>
                  <select
                    className="form-select"
                    value={newDamaged.ItemName}
                    onChange={(e) => {
                      const found = initialItems.find((i) => i.Name === e.target.value);
                      if (found) {
                        setNewDamaged({
                          ...newDamaged,
                          ItemName: found.Name,
                          ItemCode: found.Code,
                          Unit: found.Unit,
                        });
                      }
                    }}
                  >
                    {items.map((itm) => (
                      <option key={itm.Id} value={itm.Name}>
                        {itm.Code} - {itm.Name} (الرصيد الفعلي الحالي: {itm.ActualStock})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">الكمية التالفة</label>
                    <input
                      type="number"
                      className="form-input"
                      value={newDamaged.Quantity}
                      onChange={(e) => setNewDamaged({ ...newDamaged, Quantity: e.target.value })}
                      min="1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">رقم التشغيلة (Batch)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newDamaged.BatchNumber}
                      onChange={(e) => setNewDamaged({ ...newDamaged, BatchNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">تاريخ الصلاحية</label>
                    <input
                      type="date"
                      className="form-input"
                      value={newDamaged.ExpiryDate}
                      onChange={(e) => setNewDamaged({ ...newDamaged, ExpiryDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">سبب التلف</label>
                  <select
                    className="form-select"
                    value={newDamaged.Reason}
                    onChange={(e) => setNewDamaged({ ...newDamaged, Reason: e.target.value })}
                  >
                    <option value="انتهاء فترة الصلاحية المقررة">انتهاء فترة الصلاحية المقررة</option>
                    <option value="تلف أو كسر أثناء النقل والتداول">تلف أو كسر أثناء النقل والتداول</option>
                    <option value="عيب مصنعي في أكياس الدم أو الصمامات">عيب مصنعي في أكياس الدم أو الصمامات</option>
                    <option value="خلل في درجة حرارة التبريد">خلل في درجة حرارة التبريد</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">أمين الخزينة / الموثق</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newDamaged.RecordedBy}
                    onChange={(e) => setNewDamaged({ ...newDamaged, RecordedBy: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddDamagedModal(false)}>
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{ background: '#dc2626', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Save size={16} />
                  توثيق محضر التلف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📇 مودال عرض بطاقة الصنف التفصيلية */}
      {/* ========================================================================= */}
      {showItemCardModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowItemCardModal(false)}>
          <div className="modal-content" style={{ maxWidth: '680px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="modal-title">بطاقة الصنف الطبي: {selectedItem.Name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                    كود الصنف: {selectedItem.Code}
                  </p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowItemCardModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div><strong>كود الصنف:</strong> {selectedItem.Code}</div>
                <div><strong>الباركود:</strong> {selectedItem.Barcode || '-'}</div>
                <div><strong>التصنيف:</strong> {selectedItem.Category}</div>
                <div><strong>الوحدة الأساسية:</strong> {selectedItem.Unit}</div>
                <div><strong>مكان ونوع التخزين:</strong> {selectedItem.StorageType === 'ثلاجة' ? '❄️ ثلاجة' : selectedItem.StorageType === 'خزانة' ? '🗄️ خزانة' : '📦 مخزن'} ({selectedItem.StorageLocation})</div>
                <div><strong>المورد المعتمد:</strong> {selectedItem.SupplierName || '-'}</div>
                <div style={{ color: '#16a34a', fontWeight: 800 }}><strong>الرصيد الفعلي المتوفر:</strong> {selectedItem.ActualStock} {selectedItem.Unit}</div>
                <div style={{ color: '#dc2626', fontWeight: 700 }}><strong>الكمية التالفة:</strong> {selectedItem.DamagedStock || 0} {selectedItem.Unit}</div>
              </div>

              {selectedItem.Description && (
                <div>
                  <strong>الوصف والاستخدام:</strong>
                  <p style={{ marginTop: '4px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {selectedItem.Description}
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowItemCardModal(false)}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
