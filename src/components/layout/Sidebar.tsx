// مكون القائمة الجانبية - منظومة إدارة مخازن الهيئة العامة لخدمات نقل الدم
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ArrowDownCircle,
  ArrowUpCircle,
  FileBarChart,
  Truck,
  Users,
  Settings,
  LogOut,
  ShieldCheck,
  Building2,
  DatabaseBackup,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const isCurrent = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard' || pathname === '/';
    return pathname === path || pathname?.startsWith(path + '/');
  };

  return (
    <aside className="sidebar">
      {/* رأس القائمة - الشعار والعنوان */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img
            src="./logo.png"
            alt="شعار الهيئة الوطنية لخدمات نقل الدم"
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px', background: '#ffffff', borderRadius: '8px' }}
          />
        </div>
        <h1 className="sidebar-title">
          الهيئة الوطنية لخدمات نقل الدم
        </h1>
        <p className="sidebar-subtitle">منظومة إدارة المخازن المركزية</p>
      </div>

      {/* قائمة التنقل */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">الرئيسية والمخزون</div>
        
        <Link href="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>
          <div className={`nav-item ${isCurrent('/dashboard') ? 'active' : ''}`}>
            <LayoutDashboard className="nav-item-icon" size={20} />
            <span>لوحة التحكم</span>
          </div>
        </Link>

        <Link href="/inventory" style={{ color: 'inherit', textDecoration: 'none' }}>
          <div className={`nav-item ${isCurrent('/inventory') ? 'active' : ''}`}>
            <Package className="nav-item-icon" size={20} />
            <span>الأصناف والرصيد الفعلي</span>
          </div>
        </Link>

        <div className="nav-section-title" style={{ marginTop: '12px' }}>أذونات التوريد والصرف</div>

        <Link href="/transactions?type=inbound" style={{ color: 'inherit', textDecoration: 'none' }}>
          <div className={`nav-item ${isCurrent('/transactions') ? 'active' : ''}`} style={{ borderRight: '3px solid #16a34a' }}>
            <ArrowDownCircle className="nav-item-icon" size={20} style={{ color: '#16a34a' }} />
            <span>إذن الاستلام (الوارد)</span>
          </div>
        </Link>

        <Link href="/transactions?type=outbound" style={{ color: 'inherit', textDecoration: 'none' }}>
          <div className={`nav-item ${isCurrent('/transactions') ? 'active' : ''}`} style={{ borderRight: '3px solid #dc2626' }}>
            <ArrowUpCircle className="nav-item-icon" size={20} style={{ color: '#dc2626' }} />
            <span>إذن الصرف (المنصرف)</span>
          </div>
        </Link>

        <div className="nav-section-title" style={{ marginTop: '12px' }}>المواقع والشركاء</div>

        <Link href="/warehouses" style={{ color: 'inherit', textDecoration: 'none' }}>
          <div className={`nav-item ${isCurrent('/warehouses') ? 'active' : ''}`}>
            <Warehouse className="nav-item-icon" size={20} />
            <span>المخازن وأماكن التخزين</span>
          </div>
        </Link>

        <Link href="/suppliers" style={{ color: 'inherit', textDecoration: 'none' }}>
          <div className={`nav-item ${isCurrent('/suppliers') ? 'active' : ''}`}>
            <Truck className="nav-item-icon" size={20} />
            <span>الموردون والشركات</span>
          </div>
        </Link>

        <Link href="/reports" style={{ color: 'inherit', textDecoration: 'none' }}>
          <div className={`nav-item ${isCurrent('/reports') ? 'active' : ''}`}>
            <FileBarChart className="nav-item-icon" size={20} />
            <span>تقارير الصلاحية والمخزون</span>
          </div>
        </Link>

        <div className="nav-section-title" style={{ marginTop: '12px' }}>الإدارة والنظام</div>

        <Link href="/users" style={{ color: 'inherit', textDecoration: 'none' }}>
          <div className={`nav-item ${isCurrent('/users') ? 'active' : ''}`}>
            <Users className="nav-item-icon" size={20} />
            <span>المستخدمين والصلاحيات</span>
          </div>
        </Link>

        <Link href="/settings" style={{ color: 'inherit', textDecoration: 'none' }}>
          <div className={`nav-item ${isCurrent('/settings') ? 'active' : ''}`}>
            <Settings className="nav-item-icon" size={20} />
            <span>الإعدادات والنسخ الاحتياطي</span>
          </div>
        </Link>

        {/* زر تسجيل الخروج */}
        <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
          <div
            className="nav-item logout-nav-item"
            onClick={() => {
              try {
                localStorage.removeItem('user');
                localStorage.removeItem('isLoggedIn');
              } catch {}
              window.location.href = './login';
            }}
            style={{ cursor: 'pointer' }}
          >
            <LogOut className="nav-item-icon" size={20} />
            <span>تسجيل الخروج</span>
          </div>
        </div>

        {/* شارة الحماية والاعتماد */}
        <div style={{
          textAlign: 'center',
          padding: '16px 10px',
          color: 'var(--text-tertiary)',
          fontSize: '0.72rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}>
          <ShieldCheck size={15} style={{ color: '#16a34a' }} />
          <span>الهيئة العامة لخدمات نقل الدم</span>
        </div>
      </nav>
    </aside>
  );
}
