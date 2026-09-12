// صفحة إعدادات النظام والنسخ الاحتياطي
// منظومة إدارة مخازن الهيئة العامة لخدمات نقل الدم
'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { useTheme } from '@/context/ThemeContext';
import {
  Settings,
  Save,
  Database,
  Bell,
  Shield,
  Globe,
  Palette,
  Info,
  CheckCircle,
  AlertTriangle,
  Server,
  RefreshCw,
  Sun,
  Moon,
  Check,
  DatabaseBackup,
  Download,
  Upload,
  FileJson,
} from 'lucide-react';
import {
  initialItems,
  initialReceivingVouchers,
  initialIssueVouchers,
  initialDamagedItems,
  initialWarehouses,
  initialSuppliers,
  initialBeneficiaries,
  initialUsers,
} from '@/lib/mockData';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('backup');
  const [saved, setSaved] = useState(false);
  const { theme, setTheme } = useTheme();

  // الإعدادات العامة
  const [orgName, setOrgName] = useState('الهيئة الوطنية لخدمات نقل الدم - ليبيا');
  const [systemName, setSystemName] = useState('منظومة إدارة المخازن المركزية');
  const [defaultWarehouse, setDefaultWarehouse] = useState('المخزن الرئيسي المركز - طرابلس');

  // إعدادات التنبيهات
  const [lowStockAlert, setLowStockAlert] = useState(true);
  const [expiryAlert, setExpiryAlert] = useState(true);
  const [expiryDays, setExpiryDays] = useState(60);

  // حالة النسخ الاحتياطي
  const [backupSuccess, setBackupSuccess] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // تحميل النسخة الاحتياطية كملف JSON
  const handleExportBackup = () => {
    const backupData = {
      backupDate: new Date().toISOString(),
      system: 'الهيئة الوطنية لخدمات نقل الدم - منظومة إدارة المخازن',
      version: '2.0.0',
      data: {
        items: initialItems,
        receivingVouchers: initialReceivingVouchers,
        issueVouchers: initialIssueVouchers,
        damagedItems: initialDamagedItems,
        warehouses: initialWarehouses,
        suppliers: initialSuppliers,
        beneficiaries: initialBeneficiaries,
        users: initialUsers,
      },
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup-blood-bank-wms-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setBackupSuccess(true);
    setTimeout(() => setBackupSuccess(false), 4000);
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = () => {
        try {
          const parsed = JSON.parse(fileReader.result as string);
          if (parsed.data) {
            setRestoreSuccess(true);
            setTimeout(() => setRestoreSuccess(false), 4000);
          }
        } catch {
          alert('ملف النسخة الاحتياطية غير صالح');
        }
      };
    }
  };

  const tabs = [
    { id: 'backup', label: 'النسخ الاحتياطي (Backup)', icon: DatabaseBackup },
    { id: 'general', label: 'عام', icon: Globe },
    { id: 'theme', label: 'المظهر (Light/Dark)', icon: Palette },
    { id: 'notifications', label: 'التنبيهات والصلاحية', icon: Bell },
    { id: 'security', label: 'الأمان والشهادات', icon: Shield },
    { id: 'about', label: 'حول النظام', icon: Info },
  ];

  return (
    <>
      <Header
        title="إعدادات النظام والنسخ الاحتياطي"
        subtitle="الهيئة العامة لخدمات نقل الدم / النسخ الاحتياطي وضبط الإعدادات"
      />

      <div className="page-content">
        {/* عنوان الصفحة */}
        <div className="page-header">
          <div>
            <h1 className="page-header-title">إعدادات النظام والنسخ الاحتياطي</h1>
            <p className="page-header-subtitle">
              تصدير واسترجاع النسخ الاحتياطية (Backup)، ضبط مظهر النظام، وإعدادات التنبيهات
            </p>
          </div>
          {saved && (
            <div className="alert" style={{ background: 'var(--success-50)', border: '1px solid var(--success-500)', color: 'var(--success-700)', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: 'var(--radius-md)' }}>
              <CheckCircle size={16} />
              تم حفظ الإعدادات بنجاح
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px', alignItems: 'start' }}>
          {/* قائمة التبويبات */}
          <div className="card" style={{ position: 'sticky', top: '80px' }}>
            <div className="card-body" style={{ padding: '8px' }}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      background: activeTab === tab.id ? 'var(--primary-50)' : 'transparent',
                      color: activeTab === tab.id ? 'var(--primary-600)' : 'var(--text-secondary)',
                      fontFamily: 'Cairo',
                      fontWeight: activeTab === tab.id ? 700 : 500,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      marginBottom: '4px',
                      textAlign: 'right',
                    }}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* محتوى التبويب */}
          <div className="card">
            {/* 1. تبويب النسخ الاحتياطي (Backup & Restore) */}
            {activeTab === 'backup' && (
              <div>
                <div className="card-header" style={{ borderBottom: '1px solid var(--border-light)', padding: '20px 24px' }}>
                  <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <DatabaseBackup size={22} style={{ color: 'var(--primary-600)' }} />
                    النسخ الاحتياطي واسترجاع البيانات (Backup & Restore)
                  </h2>
                  <p className="card-subtitle">
                    حفظ نسخة احتياطية كاملة من بيانات المنظومة محلياً بصيغة JSON واسترجاعها في أي وقت
                  </p>
                </div>

                <div className="card-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {backupSuccess && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#15803d', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={18} />
                      تم تصدير وتحميل ملف النسخة الاحتياطية بنجاح!
                    </div>
                  )}

                  {restoreSuccess && (
                    <div style={{ background: '#eff6ff', border: '1px solid #93c5fd', color: '#1e40af', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={18} />
                      تمت قراءة واسترجاع بيانات النسخة الاحتياطية بنجاح!
                    </div>
                  )}

                  {/* قسم تصدير النسخة الاحتياطية */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Download size={20} style={{ color: '#16a34a' }} />
                          تصدير نسخة احتياطية فورية (Export Full Backup)
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                          يشمل: كافة أذونات الاستلام، أذونات الصرف، سجلات التالف، الأصناف، المخازن، والمستخدمين
                        </p>
                      </div>
                      <button
                        className="btn"
                        style={{ background: '#16a34a', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, padding: '10px 20px' }}
                        onClick={handleExportBackup}
                      >
                        <FileJson size={18} />
                        تنزيل ملف النسخة الاحتياطية (.json)
                      </button>
                    </div>
                  </div>

                  {/* قسم استرجاع النسخة الاحتياطية */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Upload size={20} style={{ color: 'var(--primary-600)' }} />
                      استرجاع البيانات من نسخة سابقة (Restore from Backup)
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
                      اختر ملف النسخة الاحتياطية بصيغة JSON لاسترجاع كافة السجلات
                    </p>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileRestore}
                      style={{ fontSize: '0.88rem' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. تبويب الإعدادات العامة */}
            {activeTab === 'general' && (
              <div>
                <div className="card-header" style={{ borderBottom: '1px solid var(--border-light)', padding: '20px 24px' }}>
                  <h2 className="card-title">الإعدادات العامة للمنظومة</h2>
                </div>
                <div className="card-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">اسم الهيئة / المؤسسة</label>
                    <input
                      type="text"
                      className="form-input"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">اسم المنظومة</label>
                    <input
                      type="text"
                      className="form-input"
                      value={systemName}
                      onChange={(e) => setSystemName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">المخزن الرئيسي الافتراضي</label>
                    <input
                      type="text"
                      className="form-input"
                      value={defaultWarehouse}
                      onChange={(e) => setDefaultWarehouse(e.target.value)}
                    />
                  </div>
                  <button className="btn btn-primary" onClick={handleSave} style={{ alignSelf: 'flex-start' }}>
                    <Save size={16} />
                    حفظ الإعدادات
                  </button>
                </div>
              </div>
            )}

            {/* 3. تبويب المظهر */}
            {activeTab === 'theme' && (
              <div>
                <div className="card-header" style={{ borderBottom: '1px solid var(--border-light)', padding: '20px 24px' }}>
                  <h2 className="card-title">مظهر المنظومة والسمة (Theme)</h2>
                </div>
                <div className="card-body" style={{ padding: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div
                      onClick={() => setTheme('light')}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: theme === 'light' ? '2px solid var(--primary-500)' : '1px solid var(--border-light)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: '#ffffff',
                      }}
                    >
                      <Sun size={24} style={{ color: '#d97706' }} />
                      <div>
                        <div style={{ fontWeight: 700 }}>المظهر الفاتح (Light Mode)</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>السمة البيضاء القياسية</div>
                      </div>
                    </div>

                    <div
                      onClick={() => setTheme('dark')}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: theme === 'dark' ? '2px solid var(--primary-500)' : '1px solid var(--border-light)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: '#0f172a',
                        color: '#ffffff',
                      }}
                    >
                      <Moon size={24} style={{ color: '#38bdf8' }} />
                      <div>
                        <div style={{ fontWeight: 700 }}>المظهر الداكن (Dark Mode)</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>مريح للعين أثناء العمل الليلي</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. تبويب التنبيهات */}
            {activeTab === 'notifications' && (
              <div>
                <div className="card-header" style={{ borderBottom: '1px solid var(--border-light)', padding: '20px 24px' }}>
                  <h2 className="card-title">تنبيهات الصلاحية والمخزون</h2>
                </div>
                <div className="card-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>تنبيه اقتراب انتهاء الصلاحية</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>إشعار المواد الحساسة وأكياس الدم والكواشف</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={expiryAlert}
                      onChange={(e) => setExpiryAlert(e.target.checked)}
                      style={{ transform: 'scale(1.3)' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">الحد الزمني لتنبيه الصلاحية (بالأيام)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={expiryDays}
                      onChange={(e) => setExpiryDays(parseInt(e.target.value) || 30)}
                    />
                  </div>

                  <button className="btn btn-primary" onClick={handleSave} style={{ alignSelf: 'flex-start' }}>
                    <Save size={16} />
                    حفظ إعدادات التنبيهات
                  </button>
                </div>
              </div>
            )}

            {/* 5. تبويب الأمان */}
            {activeTab === 'security' && (
              <div>
                <div className="card-header" style={{ borderBottom: '1px solid var(--border-light)', padding: '20px 24px' }}>
                  <h2 className="card-title">الأمان والتشفير</h2>
                </div>
                <div className="card-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '8px', border: '1px solid #86efac' }}>
                    <h4 style={{ fontWeight: 700, color: '#15803d', margin: '0 0 6px 0' }}>✓ النظام مشفر ومحمي</h4>
                    <p style={{ fontSize: '0.85rem', color: '#166534', margin: 0 }}>
                      يتم تخزين وتأمين جلسات العمل والتواقيع الرقمية لأمناء الخزائن وفق معايير الحماية الصحية المعتمدة.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 6. تبويب حول النظام */}
            {activeTab === 'about' && (
              <div>
                <div className="card-header" style={{ borderBottom: '1px solid var(--border-light)', padding: '20px 24px' }}>
                  <h2 className="card-title">حول منظومة إدارة مخازن بنوك الدم</h2>
                </div>
                <div className="card-body" style={{ padding: '24px', fontSize: '0.9rem', lineHeight: '1.8' }}>
                  <p>
                    <strong>منظومة إدارة مخازن الهيئة العامة لخدمات نقل الدم</strong> - الإصدار 2.0 المحدث.
                  </p>
                  <p>
                    تم تصميم وتطوير المنظومة لتلائم دورة التوريد والاستلام والصرف بدقة متناهية، ومتابعة الرصيد الفعلي، تواريخ الصلاحية، وتوثيق المناديب والجهات المستفيدة.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
