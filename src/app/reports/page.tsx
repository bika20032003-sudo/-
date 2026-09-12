// صفحة تقارير الصلاحية والمخزون الطبي الشاملة
// منظومة إدارة مخازن الهيئة العامة لخدمات نقل الدم
'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import {
  FileText,
  Download,
  Printer,
  Search,
  Calendar,
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  PackageCheck,
  History,
  CheckCircle,
  XCircle,
  Clock,
  ThermometerSnowflake,
  ShieldAlert,
  Layers,
  Filter,
} from 'lucide-react';
import {
  initialItems,
  initialReceivingVouchers,
  initialIssueVouchers,
  initialDamagedItems,
} from '@/lib/mockData';

type ReportTab =
  | 'expiry_report'
  | 'current_stock'
  | 'movement_report'
  | 'damaged_report';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('expiry_report');
  const [searchTerm, setSearchTerm] = useState('');
  const [expiryStatusFilter, setExpiryStatusFilter] = useState('الكل');

  // بيانات تقرير الصلاحية المعدة بدقة
  const expiryData = [
    {
      Code: 'ITM-004',
      Name: 'كاشف فصيلة الدم Anti-A Monoclonal 10ml',
      BatchNo: 'BTH-BIO-26-88',
      Stock: 185,
      Unit: 'زجاجة',
      StorageType: 'ثلاجة',
      ExpiryDate: '2026-08-30',
      DaysRemaining: 6,
      Status: 'حرج (أقل من شهر)',
      StatusColor: 'badge-danger',
    },
    {
      Code: 'ITM-005',
      Name: 'كاشف فصيلة الدم Anti-B Monoclonal 10ml',
      BatchNo: 'BTH-BIO-26-89',
      Stock: 130,
      Unit: 'زجاجة',
      StorageType: 'ثلاجة',
      ExpiryDate: '2026-09-25',
      DaysRemaining: 32,
      Status: 'قريب الانتهاء',
      StatusColor: 'badge-warning',
    },
    {
      Code: 'ITM-010',
      Name: 'محلول ملحي معقم Saline 0.9% 500ml',
      BatchNo: 'BTH-BAX-12',
      Stock: 0,
      Unit: 'زجاجة',
      StorageType: 'مخزن',
      ExpiryDate: '2026-06-01',
      DaysRemaining: -84,
      Status: 'منتهي الصلاحية',
      StatusColor: 'badge-danger',
    },
    {
      Code: 'ITM-001',
      Name: 'أكياس دم مفردة 450ml مع محلول CPDA-1',
      BatchNo: 'BTH-TRM-2026-A1',
      Stock: 2300,
      Unit: 'كيس',
      StorageType: 'ثلاجة',
      ExpiryDate: '2028-06-30',
      DaysRemaining: 675,
      Status: 'ساري وصالح',
      StatusColor: 'badge-success',
    },
    {
      Code: 'ITM-002',
      Name: 'أكياس دم مزدوجة 450ml مع محلول حفظ SAGM',
      BatchNo: 'BTH-TRM-2026-A2',
      Stock: 1100,
      Unit: 'كيس',
      StorageType: 'ثلاجة',
      ExpiryDate: '2028-06-30',
      DaysRemaining: 675,
      Status: 'ساري وصالح',
      StatusColor: 'badge-success',
    },
    {
      Code: 'ITM-006',
      Name: 'كاشف العامل الريزيسي Anti-D (Rh) 10ml',
      BatchNo: 'BTH-MRK-26-10',
      Stock: 90,
      Unit: 'زجاجة',
      StorageType: 'ثلاجة',
      ExpiryDate: '2027-08-15',
      DaysRemaining: 356,
      Status: 'ساري وصالح',
      StatusColor: 'badge-success',
    },
    {
      Code: 'ITM-007',
      Name: 'إبر سحب دم معقمة 16G مزودة بصمام أمان',
      BatchNo: 'BTH-BD-26-44',
      Stock: 4800,
      Unit: 'صندوق',
      StorageType: 'مخزن',
      ExpiryDate: '2029-01-01',
      DaysRemaining: 860,
      Status: 'ساري وصالح',
      StatusColor: 'badge-success',
    },
  ];

  const filteredExpiry = expiryData.filter((item) => {
    const matchesSearch =
      item.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.BatchNo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = expiryStatusFilter === 'الكل' || item.Status === expiryStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Header
        title="تقارير الصلاحية والمخزون الطبي"
        subtitle="الهيئة العامة لخدمات نقل الدم / تقارير المتابعة والرقابة الدوائية"
      />

      <div className="page-content">
        {/* رأس الصفحة */}
        <div className="page-header">
          <div>
            <h1 className="page-header-title">سجلات وتقارير الصلاحية والمخزون</h1>
            <p className="page-header-subtitle">
              تقرير الصلاحية الشامل، تقرير الرصيد الفعلي، حركة الوارد والمنصرف، وحصر التوالف
            </p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
              <Printer size={16} />
              طباعة التقرير
            </button>
            <button className="btn btn-primary" onClick={() => alert('تم تصدير التقرير الحالي بصيغة Excel/PDF بنجاح')}>
              <Download size={18} />
              تصدير التقرير
            </button>
          </div>
        </div>

        {/* أزرار التبويبات للتقارير */}
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '4px' }}>
          <button
            className={`btn ${activeTab === 'expiry_report' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('expiry_report')}
            style={{ fontWeight: 700 }}
          >
            <Calendar size={16} />
            1. تقرير الصلاحية وتواريخ الانتهاء ⭐
          </button>

          <button
            className={`btn ${activeTab === 'current_stock' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('current_stock')}
            style={{ fontWeight: 700 }}
          >
            <PackageCheck size={16} />
            2. تقرير الرصيد الفعلي للمخازن
          </button>

          <button
            className={`btn ${activeTab === 'movement_report' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('movement_report')}
            style={{ fontWeight: 700 }}
          >
            <ArrowDownCircle size={16} />
            3. تقرير حركة الوارد والمنصرف
          </button>

          <button
            className={`btn ${activeTab === 'damaged_report' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('damaged_report')}
            style={{ fontWeight: 700 }}
          >
            <AlertTriangle size={16} />
            4. تقرير المواد التالفة
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 1. تقرير الصلاحية وتواريخ الانتهاء */}
        {/* ========================================================================= */}
        {activeTab === 'expiry_report' && (
          <div className="table-container">
            <div className="table-toolbar">
              <div className="table-toolbar-right" style={{ gap: '10px' }}>
                <div className="table-search" style={{ minWidth: '300px' }}>
                  <Search className="table-search-icon" size={16} />
                  <input
                    type="text"
                    placeholder="بحث باسم الصنف، الكود، أو رقم التشغيلة..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  className="form-select"
                  style={{ width: '200px', padding: '9px 12px' }}
                  value={expiryStatusFilter}
                  onChange={(e) => setExpiryStatusFilter(e.target.value)}
                >
                  <option value="الكل">جميع حالات الصلاحية</option>
                  <option value="حرج (أقل من شهر)">حرج (أقل من شهر) 🔴</option>
                  <option value="قريب الانتهاء">قريب الانتهاء 🟡</option>
                  <option value="منتهي الصلاحية">منتهي الصلاحية ⛔</option>
                  <option value="ساري وصالح">ساري وصالح 🟢</option>
                </select>
              </div>

              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {filteredExpiry.length} صنف خاضع للرقابة
              </span>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>كود الصنف</th>
                  <th>اسم الصنف والمواصفات</th>
                  <th>رقم التشغيلة (Batch)</th>
                  <th>مكان التخزين</th>
                  <th>الرصيد الفعلي</th>
                  <th>تاريخ انتهاء الصلاحية</th>
                  <th>المدة المتبقية</th>
                  <th>حالة الصلاحية</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpiry.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: 'var(--primary-600)' }}>{item.Code}</td>
                    <td style={{ fontWeight: 700 }}>{item.Name}</td>
                    <td style={{ direction: 'ltr', textAlign: 'right' }}>{item.BatchNo}</td>
                    <td>
                      <span className="badge badge-secondary">{item.StorageType === 'ثلاجة' ? '❄️ ثلاجة' : '📦 مخزن'}</span>
                    </td>
                    <td style={{ fontWeight: 800 }}>{item.Stock.toLocaleString()} {item.Unit}</td>
                    <td style={{ fontWeight: 700, color: item.DaysRemaining < 30 ? '#dc2626' : 'var(--text-primary)' }}>
                      {item.ExpiryDate}
                    </td>
                    <td>
                      {item.DaysRemaining < 0 ? (
                        <span style={{ color: '#dc2626', fontWeight: 700 }}>منتهي منذ {Math.abs(item.DaysRemaining)} يوم</span>
                      ) : (
                        <span style={{ color: item.DaysRemaining < 30 ? '#dc2626' : item.DaysRemaining < 90 ? '#d97706' : '#16a34a', fontWeight: 700 }}>
                          متبقي {item.DaysRemaining} يوم
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${item.StatusColor}`}>{item.Status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. تقرير الرصيد الفعلي للمخازن */}
        {/* ========================================================================= */}
        {activeTab === 'current_stock' && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>كود الصنف</th>
                  <th>اسم الصنف الطبي</th>
                  <th>التصنيف</th>
                  <th>مكان التخزين</th>
                  <th>المورد</th>
                  <th style={{ background: '#f0fdf4', color: '#16a34a' }}>الرصيد الفعلي المتوفر</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {initialItems.map((item) => (
                  <tr key={item.Id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary-600)' }}>{item.Code}</td>
                    <td style={{ fontWeight: 700 }}>{item.Name}</td>
                    <td><span className="badge badge-secondary">{item.Category}</span></td>
                    <td>{item.StorageType === 'ثلاجة' ? '❄️ ثلاجة' : '📦 مخزن'}</td>
                    <td>{item.SupplierName}</td>
                    <td style={{ background: '#f0fdf4', fontWeight: 800, color: item.ActualStock > 0 ? '#16a34a' : '#dc2626' }}>
                      {item.ActualStock.toLocaleString()} {item.Unit}
                    </td>
                    <td>
                      <span className={`badge ${item.Status === 'متوفر' ? 'badge-success' : 'badge-danger'}`}>
                        {item.Status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. تقرير حركة الوارد والمنصرف */}
        {/* ========================================================================= */}
        {activeTab === 'movement_report' && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>نوع الإذن</th>
                  <th>رقم الإذن</th>
                  <th>التاريخ</th>
                  <th>الطرف (المورد / الجهة المستفيدة)</th>
                  <th>المندوب / المستلم</th>
                  <th>الكمية الإجمالية</th>
                  <th>المخزن</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {initialReceivingVouchers.map((r) => (
                  <tr key={`rec-${r.Id}`}>
                    <td><span className="badge badge-success">وارد (استلام)</span></td>
                    <td style={{ fontWeight: 700 }}>{r.VoucherNumber}</td>
                    <td>{r.Date}</td>
                    <td>{r.SupplierName}</td>
                    <td>{r.DelegateName}</td>
                    <td style={{ fontWeight: 700, color: '#16a34a' }}>+{r.TotalQuantity.toLocaleString()}</td>
                    <td>{r.Warehouse}</td>
                    <td><span className="badge badge-success">{r.Status}</span></td>
                  </tr>
                ))}
                {initialIssueVouchers.map((i) => (
                  <tr key={`iss-${i.Id}`}>
                    <td><span className="badge badge-danger">منصرف (صرف)</span></td>
                    <td style={{ fontWeight: 700 }}>{i.VoucherNumber}</td>
                    <td>{i.Date}</td>
                    <td>{i.BeneficiaryName}</td>
                    <td>{i.ReceiverName}</td>
                    <td style={{ fontWeight: 700, color: '#dc2626' }}>-{i.TotalQuantity.toLocaleString()}</td>
                    <td>{i.Warehouse}</td>
                    <td><span className="badge badge-success">{i.Status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. تقرير المواد التالفة */}
        {/* ========================================================================= */}
        {activeTab === 'damaged_report' && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>رقم محضر التلف</th>
                  <th>كود الصنف</th>
                  <th>اسم الصنف</th>
                  <th>الكمية التالفة</th>
                  <th>رقم التشغيلة</th>
                  <th>سبب التلف</th>
                  <th>المخزن</th>
                  <th>حالة الإتلاف</th>
                </tr>
              </thead>
              <tbody>
                {initialDamagedItems.map((d) => (
                  <tr key={d.Id}>
                    <td style={{ fontWeight: 700, color: '#dc2626' }}>{d.ReportNumber}</td>
                    <td>{d.ItemCode}</td>
                    <td style={{ fontWeight: 700 }}>{d.ItemName}</td>
                    <td style={{ fontWeight: 800, color: '#dc2626' }}>{d.Quantity} {d.Unit}</td>
                    <td>{d.BatchNumber}</td>
                    <td>{d.Reason}</td>
                    <td>{d.Warehouse}</td>
                    <td><span className="badge badge-warning">{d.DisposalStatus}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
