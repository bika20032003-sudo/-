// صفحة إدارة الموردين
// منظومة إدارة مخازن الهيئة العامة لخدمات نقل الدم
'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import {
  Truck,
  Plus,
  Search,
  Edit,
  Eye,
  X,
  Save,
  Phone,
  Mail,
  MapPin,
  Building2,
  CheckCircle,
  XCircle,
  Download,
} from 'lucide-react';

interface Supplier {
  Id: number;
  Name: string;
  Code: string;
  ContactPerson: string;
  Phone: string;
  Email: string;
  Address: string;
  Category: string;
  TotalOrders: number;
  LastOrderDate: string;
  IsActive: boolean;
}

// بيانات الموردين التجريبية
const suppliersData: Supplier[] = [
  { Id: 1, Name: 'شركة ليبيا الطبية للتوريدات', Code: 'SUP-001', ContactPerson: 'محمد الشريف', Phone: '0912345678', Email: 'info@libya-medical.ly', Address: 'طرابلس - شارع عمر المختار', Category: 'مستلزمات طبية', TotalOrders: 15, LastOrderDate: '2026-07-15', IsActive: true },
  { Id: 2, Name: 'مؤسسة الأمل للأجهزة الطبية', Code: 'SUP-002', ContactPerson: 'فاطمة البرغثي', Phone: '0921234567', Email: 'amal@medical.ly', Address: 'بنغازي - شارع الجمهورية', Category: 'أجهزة طبية', TotalOrders: 8, LastOrderDate: '2026-06-20', IsActive: true },
  { Id: 3, Name: 'شركة الصحة والدواء', Code: 'SUP-003', ContactPerson: 'علي الزروق', Phone: '0934567890', Email: 'health@pharma.ly', Address: 'مصراتة - المنطقة الصناعية', Category: 'أدوية ومحاليل', TotalOrders: 22, LastOrderDate: '2026-07-25', IsActive: true },
  { Id: 4, Name: 'مصنع الكيماويات الطبية', Code: 'SUP-004', ContactPerson: '-', Phone: '-', Email: '-', Address: 'طرابلس - منطقة تاجوراء', Category: 'كواشف مخبرية', TotalOrders: 0, LastOrderDate: '-', IsActive: false },
];

const categories = ['الكل', 'مستلزمات طبية', 'أجهزة طبية', 'أدوية ومحاليل', 'كواشف مخبرية'];

export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('الكل');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const filtered = suppliersData.filter((s) => {
    const matchSearch = s.Name.includes(searchTerm) || s.Code.includes(searchTerm) || s.ContactPerson.includes(searchTerm);
    const matchCat = categoryFilter === 'الكل' || s.Category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <>
      <Header title="إدارة الموردين" subtitle="الرئيسية / الموردين" />

      <div className="page-content">
        {/* عنوان الصفحة */}
        <div className="page-header">
          <div>
            <h1 className="page-header-title">الموردون</h1>
            <p className="page-header-subtitle">إدارة موردي المستلزمات الطبية والمخزنية</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary btn-sm">
              <Download size={16} />
              تصدير
            </button>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={18} />
              إضافة مورد
            </button>
          </div>
        </div>

        {/* بطاقات الموردين */}
        <div className="table-container">
          {/* شريط الأدوات */}
          <div className="table-toolbar">
            <div className="table-toolbar-right" style={{ gap: '10px' }}>
              <div className="table-search">
                <Search className="table-search-icon" size={16} />
                <input
                  type="text"
                  placeholder="بحث بالاسم أو الرمز أو جهة الاتصال..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="form-select"
                style={{ width: '180px', padding: '9px 14px' }}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {filtered.length} مورد
            </span>
          </div>

          {/* الجدول */}
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>الرمز</th>
                <th>اسم المورد</th>
                <th>التصنيف</th>
                <th>جهة الاتصال</th>
                <th>الهاتف</th>
                <th>عدد الطلبات</th>
                <th>آخر طلب</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((supplier, index) => (
                <tr key={supplier.Id}>
                  <td style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>{index + 1}</td>
                  <td><span className="badge badge-default">{supplier.Code}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--primary-50)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Building2 size={18} style={{ color: 'var(--primary-600)' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{supplier.Name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{supplier.Email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-primary">{supplier.Category}</span></td>
                  <td style={{ fontSize: '0.87rem' }}>{supplier.ContactPerson}</td>
                  <td style={{ fontSize: '0.87rem', direction: 'ltr', textAlign: 'right' }}>{supplier.Phone}</td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{supplier.TotalOrders}</td>
                  <td style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>{supplier.LastOrderDate}</td>
                  <td>
                    {supplier.IsActive ? (
                      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={12} />
                        نشط
                      </span>
                    ) : (
                      <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <XCircle size={12} />
                        غير نشط
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-icon btn-ghost sm" title="عرض" onClick={() => setSelectedSupplier(supplier)}>
                        <Eye size={16} />
                      </button>
                      <button className="btn btn-icon btn-ghost sm" title="تعديل">
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button className="pagination-btn" disabled>❮</button>
            <button className="pagination-btn active">1</button>
            <span className="pagination-info">صفحة 1 من 1</span>
            <button className="pagination-btn" disabled>❯</button>
          </div>
        </div>

        {/* نافذة إضافة مورد */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">
                  <Truck size={20} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '8px' }} />
                  إضافة مورد جديد
                </h3>
                <button className="modal-close" onClick={() => setShowAddModal(false)}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">اسم المورد <span className="required">*</span></label>
                    <input type="text" className="form-input" placeholder="اسم الشركة أو المؤسسة" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">رمز المورد <span className="required">*</span></label>
                    <input type="text" className="form-input" placeholder="مثال: SUP-005" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">التصنيف <span className="required">*</span></label>
                    <select className="form-select">
                      <option value="">اختر التصنيف</option>
                      {categories.filter(c => c !== 'الكل').map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">جهة الاتصال</label>
                    <input type="text" className="form-input" placeholder="اسم المسؤول" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      <Phone size={13} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '4px' }} />
                      رقم الهاتف
                    </label>
                    <input type="tel" className="form-input" placeholder="09XXXXXXXX" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <Mail size={13} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '4px' }} />
                      البريد الإلكتروني
                    </label>
                    <input type="email" className="form-input" placeholder="info@supplier.com" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <MapPin size={13} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '4px' }} />
                    العنوان
                  </label>
                  <textarea className="form-textarea" placeholder="عنوان المورد" />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary">
                  <Save size={16} />
                  حفظ المورد
                </button>
                <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>إلغاء</button>
              </div>
            </div>
          </div>
        )}

        {/* نافذة تفاصيل المورد */}
        {selectedSupplier && (
          <div className="modal-overlay" onClick={() => setSelectedSupplier(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">تفاصيل المورد</h3>
                <button className="modal-close" onClick={() => setSelectedSupplier(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                {/* رأس البطاقة */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={28} style={{ color: 'var(--primary-600)' }} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{selectedSupplier.Name}</h3>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <span className="badge badge-default">{selectedSupplier.Code}</span>
                      <span className="badge badge-primary">{selectedSupplier.Category}</span>
                      {selectedSupplier.IsActive
                        ? <span className="badge badge-success">نشط</span>
                        : <span className="badge badge-danger">غير نشط</span>
                      }
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>جهة الاتصال</span>
                    <p style={{ fontWeight: 600 }}>{selectedSupplier.ContactPerson}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>رقم الهاتف</span>
                    <p style={{ fontWeight: 600, direction: 'ltr', textAlign: 'right' }}>{selectedSupplier.Phone}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>البريد الإلكتروني</span>
                    <p style={{ fontWeight: 600 }}>{selectedSupplier.Email}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>إجمالي الطلبات</span>
                    <p style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary-600)' }}>{selectedSupplier.TotalOrders}</p>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>العنوان</span>
                    <p style={{ fontWeight: 600 }}>{selectedSupplier.Address}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary btn-sm"><Edit size={14} /> تعديل</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedSupplier(null)}>إغلاق</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
