// صفحة الملف الشخصي للمستخدم
// منظومة إدارة مخازن الهيئة العامة لخدمات نقل الدم
'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import {
  User,
  Mail,
  Shield,
  Key,
  Save,
  CheckCircle,
  Clock,
  Building,
  Phone,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
} from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState({
    fullName: 'مدير النظام',
    username: 'admin',
    role: 'مدير النظام',
    email: 'admin@nbsa.gov.ly',
    phone: '+218 91 234 5678',
    department: 'إدارة المخازن الرئيسية',
    location: 'المخزن الرئيسي - طرابلس',
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [savedSuccess, setSavedSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser((prev) => ({
          ...prev,
          fullName: parsed.FullName || prev.fullName,
          username: parsed.Username || prev.username,
          role: parsed.Role === 'admin' ? 'مدير النظام' : 'أمين مخزن',
        }));
      }
    } catch {}
  }, []);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess('تم تحديث بيانات الملف الشخصي بنجاح!');
    setTimeout(() => setSavedSuccess(''), 3500);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (!currentPassword) {
      setPasswordError('يرجى إدخال كلمة المرور الحالية');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('كلمة المرور الجديدة وتأكيدها غير متطابقين');
      return;
    }

    setSavedSuccess('تم تغيير كلمة المرور بنجاح!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSavedSuccess(''), 3500);
  };

  return (
    <>
      <Header title="الملف الشخصي" subtitle="إدارة بيانات الحساب وإعدادات الأمان" />

      <div className="page-content">
        {savedSuccess && (
          <div className="alert alert-success" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle size={20} />
            <span>{savedSuccess}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
          {/* بطاقة معلومات الحساب الجانبية */}
          <div className="card" style={{ height: 'fit-content' }}>
            <div className="card-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))',
                  color: '#ffffff',
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 8px 20px rgba(220,38,38,0.25)',
                }}
              >
                {user.fullName.charAt(0)}
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{user.fullName}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--primary-600)', fontWeight: 600, marginTop: '4px' }}>
                {user.role}
              </p>

              <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-light)', paddingTop: '20px', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <UserCheck size={18} style={{ color: 'var(--primary-600)' }} />
                  <span>اسم المستخدم: <strong>{user.username}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <Building size={18} style={{ color: 'var(--primary-600)' }} />
                  <span>{user.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <Shield size={18} style={{ color: 'var(--primary-600)' }} />
                  <span>صلاحية: كاملة (مسؤول)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <Clock size={18} style={{ color: 'var(--primary-600)' }} />
                  <span>آخر تسجيل دخول: اليوم 10:14 ص</span>
                </div>
              </div>
            </div>
          </div>

          {/* تفاصيل البيانات وتغيير كلمة المرور */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* تعديل البيانات الشخصية */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <User size={20} style={{ color: 'var(--primary-600)' }} />
                  <span>البيانات الشخصية</span>
                </h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleUpdateProfile}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="form-group">
                      <label className="form-label">الاسم الكامل</label>
                      <input
                        type="text"
                        className="form-input"
                        value={user.fullName}
                        onChange={(e) => setUser({ ...user, fullName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">اسم المستخدم</label>
                      <input type="text" className="form-input" value={user.username} disabled style={{ background: 'var(--bg-tertiary)' }} />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <Mail size={14} style={{ display: 'inline', marginLeft: '6px' }} />
                        البريد الإلكتروني
                      </label>
                      <input
                        type="email"
                        className="form-input"
                        value={user.email}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <Phone size={14} style={{ display: 'inline', marginLeft: '6px' }} />
                        رقم الهاتف
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={user.phone}
                        onChange={(e) => setUser({ ...user, phone: e.target.value })}
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">الإدارة / القسم</label>
                      <input
                        type="text"
                        className="form-input"
                        value={user.department}
                        onChange={(e) => setUser({ ...user, department: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', textAlign: 'left' }}>
                    <button type="submit" className="btn btn-primary">
                      <Save size={18} />
                      حفظ التغييرات
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* تغيير كلمة المرور */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Key size={20} style={{ color: 'var(--primary-600)' }} />
                  <span>تغيير كلمة المرور</span>
                </h3>
              </div>
              <div className="card-body">
                {passwordError && (
                  <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
                    <span>{passwordError}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', maxWidth: '500px' }}>
                    <div className="form-group">
                      <label className="form-label">كلمة المرور الحالية</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-input"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="أدخل كلمة المرور الحالية"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-tertiary)',
                          }}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">كلمة المرور الجديدة</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-input"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="أدخل كلمة المرور الجديدة"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">تأكيد كلمة المرور الجديدة</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="أعد إدخال كلمة المرور الجديدة"
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', textAlign: 'left' }}>
                    <button type="submit" className="btn btn-secondary">
                      <Lock size={18} />
                      تحديث كلمة المرور
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
