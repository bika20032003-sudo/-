// صفحة لوحة التحكم الرئيسية
// منظومة إدارة مخازن الهيئة العامة لخدمات نقل الدم
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import {
  Package,
  Warehouse,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowDownCircle,
  ArrowUpCircle,
  Activity,
  ShieldAlert,
  Calendar,
  CheckCircle,
  FileCheck,
  Building2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  initialItems,
  initialReceivingVouchers,
  initialIssueVouchers,
  initialDamagedItems,
} from '@/lib/mockData';

export default function DashboardPage() {
  const totalStock = initialItems.reduce((acc, i) => acc + i.ActualStock, 0);
  const totalDamaged = initialItems.reduce((acc, i) => acc + (i.DamagedStock || 0), 0);

  // بيانات الرسم البياني لحركة التوريد والصرف
  const chartData = [
    { month: 'يناير', وارد: 2400, صرف: 1800 },
    { month: 'فبراير', وارد: 1800, صرف: 2200 },
    { month: 'مارس', وارد: 3200, صرف: 2800 },
    { month: 'أبريل', وارد: 2800, صرف: 1900 },
    { month: 'مايو', وارد: 2000, صرف: 2400 },
    { month: 'يونيو', وارد: 3500, صرف: 2100 },
    { month: 'يوليو', وارد: 3000, صرف: 400 },
    { month: 'أغسطس', وارد: 2000, صرف: 450 },
  ];

  return (
    <>
      <Header
        title="لوحة التحكم الرئيسية"
        subtitle="الهيئة العامة لخدمات نقل الدم / المتابعة والرقابة المخزنية"
      />

      <div className="page-content">
        {/* بطاقات الإحصائيات الأربع الرئيسية */}
        <div className="stats-grid">
          {/* إجمالي الأصناف */}
          <Link href="/inventory" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="stat-card primary">
              <div className="stat-icon primary">
                <Package size={26} />
              </div>
              <div className="stat-content">
                <div className="stat-label">إجمالي الأصناف الطبية</div>
                <div className="stat-value">{initialItems.length}</div>
                <div className="stat-change up">
                  <TrendingUp size={14} />
                  <span>أدوية، أكياس دم، كواشف، ومستلزمات</span>
                </div>
              </div>
            </div>
          </Link>

          {/* إجمالي الرصيد الفعلي المتوفر */}
          <Link href="/inventory" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="stat-card success">
              <div className="stat-icon success">
                <CheckCircle size={26} />
              </div>
              <div className="stat-content">
                <div className="stat-label">إجمالي الرصيد الفعلي المتوفر</div>
                <div className="stat-value">{totalStock.toLocaleString()}</div>
                <div className="stat-change up">
                  <TrendingUp size={14} />
                  <span>وحدة مخزنة في الثلاجات والمخازن</span>
                </div>
              </div>
            </div>
          </Link>

          {/* أذونات الاستلام والصرف */}
          <Link href="/transactions" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="stat-card warning">
              <div className="stat-icon warning">
                <ArrowDownCircle size={26} />
              </div>
              <div className="stat-content">
                <div className="stat-label">أذونات الاستلام والصرف</div>
                <div className="stat-value">
                  {initialReceivingVouchers.length + initialIssueVouchers.length}
                </div>
                <div className="stat-change" style={{ color: 'var(--primary-600)' }}>
                  <span>{initialReceivingVouchers.length} إذن وارد | {initialIssueVouchers.length} إذن صرف</span>
                </div>
              </div>
            </div>
          </Link>

          {/* المواد التالفة */}
          <Link href="/inventory" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="stat-card danger">
              <div className="stat-icon danger">
                <AlertTriangle size={26} />
              </div>
              <div className="stat-content">
                <div className="stat-label">المواد والأصناف التالفة</div>
                <div className="stat-value">{totalDamaged}</div>
                <div className="stat-change down">
                  <TrendingDown size={14} />
                  <span>{initialDamagedItems.length} محاضر إتلاف مسجلة</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* الرسم البياني وقائمة التنبيهات السريعة */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '24px' }}>
          {/* الرسم البياني */}
          <div className="card">
            <div className="card-header" style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-light)' }}>
              <h3 className="card-title" style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                حركة التوريد (الوارد) والصرف (المنصرف) الشهرية
              </h3>
              <p className="card-subtitle">مقارنة أعداد الوحدات المستلمة والمصروفة لمصارف الدم</p>
            </div>
            <div className="card-body" style={{ padding: '20px', height: '320px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                  <XAxis dataKey="month" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="وارد" fill="#16a34a" radius={[4, 4, 0, 0]} name="الوارد (إذن استلام)" />
                  <Bar dataKey="صرف" fill="#dc2626" radius={[4, 4, 0, 0]} name="المنصرف (إذن صرف)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* تنبيهات الصلاحية الحرجة */}
          <div className="card">
            <div className="card-header" style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-light)' }}>
              <h3 className="card-title" style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} style={{ color: '#dc2626' }} />
                تنبيهات الصلاحية العاجلة
              </h3>
              <p className="card-subtitle">كواشف ومحاليل قريبة من انتهاء الصلاحية</p>
            </div>
            <div className="card-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#b91c1c' }}>كاشف Anti-A Monoclonal 10ml</div>
                <div style={{ fontSize: '0.78rem', color: '#7f1d1d', marginTop: '2px' }}>
                  متبقي 6 أيام (2026/08/30) - الرصيد: 185 زجاجة
                </div>
              </div>

              <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#b45309' }}>كاشف Anti-B Monoclonal 10ml</div>
                <div style={{ fontSize: '0.78rem', color: '#92400e', marginTop: '2px' }}>
                  متبقي 32 يوم (2026/09/25) - الرصيد: 130 زجاجة
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>أكياس دم مفردة 450ml</div>
                <div style={{ fontSize: '0.78rem', color: '#16a34a', marginTop: '2px' }}>
                  صالحة حتى 2028/06/30 - الرصيد: 2,300 كيس
                </div>
              </div>

              <Link href="/reports" style={{ textDecoration: 'none' }}>
                <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '8px' }}>
                  عرض التقرير الكامل للصلاحية
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* أحدث العمليات وأذونات الحركة */}
        <div className="card" style={{ marginTop: '24px' }}>
          <div className="card-header" style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className="card-title" style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                أحدث أذونات الاستلام وأذونات الصرف
              </h3>
              <p className="card-subtitle">متابعة فورية للحركات المنفذة واعتماد أمناء الخزائن</p>
            </div>
            <Link href="/transactions">
              <button className="btn btn-secondary btn-sm">عرض كافة الأذونات</button>
            </Link>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>نوع الإذن</th>
                <th>رقم الإذن</th>
                <th>التاريخ</th>
                <th>الطرف (المورد / الجهة المستفيدة)</th>
                <th>اسم المندوب / المستلم</th>
                <th>الكمية</th>
                <th>أمين الخزينة</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {initialReceivingVouchers.slice(0, 2).map((r) => (
                <tr key={`rec-${r.Id}`}>
                  <td><span className="badge badge-success">وارد (استلام)</span></td>
                  <td style={{ fontWeight: 700, color: '#16a34a' }}>{r.VoucherNumber}</td>
                  <td>{r.Date}</td>
                  <td style={{ fontWeight: 600 }}>{r.SupplierName}</td>
                  <td>{r.DelegateName}</td>
                  <td style={{ fontWeight: 800 }}>+{r.TotalQuantity.toLocaleString()}</td>
                  <td>{r.StorekeeperName}</td>
                  <td><span className="badge badge-success">{r.Status}</span></td>
                </tr>
              ))}
              {initialIssueVouchers.slice(0, 2).map((i) => (
                <tr key={`iss-${i.Id}`}>
                  <td><span className="badge badge-danger">منصرف (صرف)</span></td>
                  <td style={{ fontWeight: 700, color: '#dc2626' }}>{i.VoucherNumber}</td>
                  <td>{i.Date}</td>
                  <td style={{ fontWeight: 600 }}>{i.BeneficiaryName}</td>
                  <td>{i.ReceiverName}</td>
                  <td style={{ fontWeight: 800, color: '#dc2626' }}>-{i.TotalQuantity.toLocaleString()}</td>
                  <td>{i.StorekeeperName}</td>
                  <td><span className="badge badge-success">{i.Status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
