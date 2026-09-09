import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  Database, 
  Mail, 
  ShieldAlert, 
  CheckCircle2, 
  UploadCloud,
  FileCheck
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [systemName, setSystemName] = useState('منظومة متابعة الكسارات والمعدات والوقود');
  const [agencyName, setAgencyName] = useState('جهاز تنفيذ مشروعات المواصلات');
  const [dailyTarget, setDailyTarget] = useState(2500);
  const [fuelLimit, setFuelLimit] = useState(5000);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [submitted, setSubmitted] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="view-content">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>إعدادات المنظومة والصلاحيات العامة</h2>
        <p style={{ fontSize: '0.86rem', color: '#64748b' }}>
          تخصيص البيانات العامة للموقع، الحصص اليومية المستهدفة، وإعدادات خادم قاعدة البيانات والنسخ الاحتياطي
        </p>
      </div>

      {submitted && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '0.85rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700 }}>
          <CheckCircle2 size={20} />
          <span>تم حفظ الإعدادات العامة للمنظومة بنجاح!</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Left Side: Backup & System Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Backup Box */}
          <div className="dashboard-white-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0ea5e9' }}>
              <Database size={18} />
              <span>النسخ الاحتياطي وقاعدة البيانات</span>
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
              مزامنة البيانات الحالية وتخزين نسخة احتياطية محلية أو سحابية آمنة.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button type="button" className="secondary-action-btn" style={{ justifyContent: 'center' }}>
                <span>تصدير نسخة احتياطية كامة (SQL)</span>
              </button>
              <button type="button" className="secondary-action-btn" style={{ justifyContent: 'center', borderColor: '#f43f5e', color: '#f43f5e' }}>
                <span>تهيئة قاعدة البيانات (فورمات)</span>
              </button>
            </div>
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#64748b' }}>
              <span>آخر نسخة احتياطية تم إنشاؤها: </span>
              <strong>اليوم، 12:00 م</strong>
            </div>
          </div>

          {/* Email Settings */}
          <div className="dashboard-white-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6' }}>
              <Mail size={18} />
              <span>تنبيهات البريد الإلكتروني</span>
            </h3>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>البريد الإلكتروني للمدير المستلم</label>
              <input type="email" className="form-input" defaultValue="manager@agency.gov.ly" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input type="checkbox" id="chk-alert" defaultChecked />
              <label htmlFor="chk-alert" style={{ fontSize: '0.8rem', color: '#475569', cursor: 'pointer' }}>تلقي إشعارات فورية عند توقف المعدات</label>
            </div>
          </div>
        </div>

        {/* Right Side: Primary Settings Form */}
        <div className="dashboard-white-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb' }}>
            <Settings size={18} />
            <span>بيانات ومعايير التشغيل الأساسية</span>
          </h3>

          <form onSubmit={handleSave} className="modal-form">
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">اسم المنظومة</label>
                <input type="text" className="form-input" value={systemName} onChange={(e) => setSystemName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">الجهة التابع لها المشروع</label>
                <input type="text" className="form-input" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} required />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">مستهدف الإنتاج اليومي الكلي للكسارات (طن)</label>
                <input type="number" className="form-input" value={dailyTarget} onChange={(e) => setDailyTarget(Number(e.target.value))} required />
              </div>
              <div className="form-group">
                <label className="form-label">حد التنبيه المنخفض لرصيد السولار (لتر)</label>
                <input type="number" className="form-input" value={fuelLimit} onChange={(e) => setFuelLimit(Number(e.target.value))} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">تكرار النسخ الاحتياطي التلقائي للبيانات</label>
              <select className="form-input" value={backupFrequency} onChange={(e) => setBackupFrequency(e.target.value)}>
                <option value="hourly">كل ساعة</option>
                <option value="daily">يومياً (تلقائي)</option>
                <option value="weekly">أسبوعياً</option>
              </select>
            </div>

            {/* Logo Settings */}
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">شعار المنظومة وجهاز المواصلات</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.75rem', background: '#f8fafc' }}>
                <img src="/logo-agency.jpg" alt="شعار الجهاز" style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid #e2e8f0' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800 }}>logo-agency.jpg</h4>
                  <p style={{ fontSize: '0.72rem', color: '#64748b' }}>شعار مخصص معتمد لتقارير PDF والطباعة</p>
                </div>
                <button type="button" className="secondary-action-btn" style={{ padding: '0.4rem 0.75rem' }}>تغيير الشعار</button>
              </div>
            </div>

            <button type="submit" className="primary-action-btn" style={{ width: '100%', height: '44px', justifyContent: 'center', marginTop: '1.5rem' }}>
              <Save size={18} />
              <span>حفظ التعديلات العامة</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
