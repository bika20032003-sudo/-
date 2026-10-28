import React, { useState, useRef } from 'react';
import { 
  X, Camera, Trash2, CheckCircle2, AlertCircle, 
  Key, Mail, Phone, MapPin, User, ShieldCheck, 
  Building, Calendar, Save, RefreshCw
} from 'lucide-react';
import { updateUserPassword } from './LoginPage';

/**
 * UserProfileModal
 * Displays user profile details, allows updating contact information,
 * changing passwords, and uploading / removing a custom profile avatar.
 */
export const UserProfileModal = ({ isOpen, onClose, currentUser, onUpdateUser }) => {
  if (!isOpen || !currentUser) return null;

  const fileInputRef = useRef(null);

  // Load avatar from localStorage or user prop
  const currentAvatar = localStorage.getItem(`user_avatar_${currentUser.username}`) || currentUser.avatar || '';

  const [avatar, setAvatar] = useState(currentAvatar);
  const [name, setName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.phone || '091-XXXXXXX');
  
  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  
  // Feedback messages
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Handle image upload from file input
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', text: 'يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: 'error', text: 'حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 5 ميجابايت' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result;
      setAvatar(base64Data);
      try {
        localStorage.setItem(`user_avatar_${currentUser.username}`, base64Data);
        // Sync with backend if possible
        fetch(`/api/users/${currentUser.id || currentUser.username}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: base64Data })
        }).catch(() => {});

        if (onUpdateUser) {
          onUpdateUser({ avatar: base64Data });
        }
        setFeedback({ type: 'success', text: 'تم تحديث الصورة الشخصية بنجاح!' });
      } catch (err) {
        console.error('Error saving avatar:', err);
        setFeedback({ type: 'error', text: 'حدث خطأ أثناء حفظ الصورة' });
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove photo
  const handleRemovePhoto = () => {
    setAvatar('');
    localStorage.removeItem(`user_avatar_${currentUser.username}`);
    fetch(`/api/users/${currentUser.id || currentUser.username}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatar: '' })
    }).catch(() => {});

    if (onUpdateUser) {
      onUpdateUser({ avatar: '' });
    }
    setFeedback({ type: 'success', text: 'تم حذف الصورة الشخصية بنجاح.' });
  };

  // Handle saving profile info & password
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback({ type: '', text: '' });

    try {
      // Validate password change if attempted
      if (newPass || confirmPass) {
        if (newPass !== confirmPass) {
          setFeedback({ type: 'error', text: 'كلمة المرور الجديدة غير متطابقة مع تأكيد كلمة المرور' });
          setIsSaving(false);
          return;
        }
        if (newPass.length < 6) {
          setFeedback({ type: 'error', text: 'كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام' });
          setIsSaving(false);
          return;
        }

        const success = updateUserPassword(currentUser.username, newPass);
        if (!success) {
          setFeedback({ type: 'error', text: 'فشل في تحديث كلمة المرور' });
          setIsSaving(false);
          return;
        }
      }

      // Save user info
      const updatedData = {
        name: name.trim() || currentUser.name,
        phone: phone.trim(),
        avatar: avatar
      };

      // Save to localStorage custom users
      try {
        const customUsers = JSON.parse(localStorage.getItem('system_custom_users') || '[]');
        const idx = customUsers.findIndex(u => u.username === currentUser.username);
        if (idx >= 0) {
          customUsers[idx] = { ...customUsers[idx], ...updatedData };
          localStorage.setItem('system_custom_users', JSON.stringify(customUsers));
        }
      } catch {}

      // Update backend
      await fetch(`/api/users/${currentUser.id || currentUser.username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      }).catch(() => {});

      if (onUpdateUser) {
        onUpdateUser(updatedData);
      }

      setFeedback({ type: 'success', text: 'تم حفظ كافة بيانات الملف الشخصي بنجاح!' });
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err) {
      console.error('Error saving profile:', err);
      setFeedback({ type: 'error', text: 'حدث خطأ أثناء حفظ البيانات' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="official-modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="official-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '92%', borderRadius: '16px', overflow: 'hidden' }}
      >
        {/* Header with Agency Branding */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          padding: '1.25rem 1.5rem',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <User size={20} color="#60a5fa" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, color: '#ffffff' }}>
                الملف الشخصي للمستخدم
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#93c5fd', margin: '0.15rem 0 0' }}>
                جهاز الإشراف والمتابعة • مشروع صيانة وتطوير طريق أوباري - غات (360 كم)
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', maxHeight: '80vh', overflowY: 'auto' }}>
          {/* Feedback Alerts */}
          {feedback.text && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              marginBottom: '1.25rem',
              background: feedback.type === 'error' ? '#fef2f2' : '#f0fdf4',
              border: `1px solid ${feedback.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
              color: feedback.type === 'error' ? '#991b1b' : '#166534',
              fontSize: '0.86rem',
              fontWeight: 700
            }}>
              {feedback.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Profile Hero Section (Avatar + Name + Role Badge) */}
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap'
          }}>
            {/* Avatar Circle with Upload Trigger */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: '#2563eb',
                border: '3px solid #ffffff',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {avatar ? (
                  <img 
                    src={avatar} 
                    alt={name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <span style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff' }}>
                    {(name || 'م')[0]}
                  </span>
                )}
              </div>

              {/* Upload Floating Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="رفع صورة جديدة"
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  background: '#2563eb',
                  border: '2px solid #ffffff',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                }}
              >
                <Camera size={14} />
              </button>

              {/* Hidden file input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
            </div>

            {/* Profile Info Details */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  {name || currentUser.name}
                </h4>
                <span style={{
                  background: '#eff6ff',
                  color: '#2563eb',
                  border: '1px solid #bfdbfe',
                  borderRadius: '6px',
                  padding: '0.15rem 0.55rem',
                  fontSize: '0.74rem',
                  fontWeight: 800
                }}>
                  {currentUser.role}
                </span>
              </div>

              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.35rem 0 0.5rem 0' }}>
                {currentUser.title || 'عضو جهاز الإشراف والمتابعة الرسمي'}
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="secondary-action-btn"
                  style={{ height: '30px', fontSize: '0.78rem', padding: '0 0.75rem' }}
                >
                  <Camera size={13} />
                  <span>تغيير الصورة الشخصية</span>
                </button>

                {avatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    style={{
                      height: '30px',
                      fontSize: '0.78rem',
                      padding: '0 0.65rem',
                      background: '#fff1f2',
                      border: '1px solid #fecdd3',
                      color: '#e11d48',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontWeight: 700
                    }}
                  >
                    <Trash2 size={13} />
                    <span>حذف الصورة</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form: Profile Information & Passwords */}
          <form onSubmit={handleSaveProfile}>
            {/* System Details Box */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.25rem'
            }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.75rem' }}>
                المعلومات الإدارية والنطاق الوظيفي:
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem', fontSize: '0.82rem' }}>
                <div style={{ background: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>اسم المستخدم:</span>
                  <strong style={{ color: '#0f172a' }}>{currentUser.username}</strong>
                </div>

                <div style={{ background: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>النطاق والقطاع:</span>
                  <strong style={{ color: '#2563eb' }}>
                    {currentUser.sector === 'all' ? 'كافة القطاعات (المشروع بالكامل)' : currentUser.sector}
                  </strong>
                </div>

                <div style={{ background: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>الصفة الرسمية:</span>
                  <strong style={{ color: '#0f172a' }}>جهاز الإشراف والمتابعة</strong>
                </div>

                <div style={{ background: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem' }}>حالة الحساب:</span>
                  <strong style={{ color: '#16a34a' }}>✓ مفعل ونشط رسمياً</strong>
                </div>
              </div>
            </div>

            {/* Editable Contact Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.82rem' }}>
                  الاسم الكامل (الظاهر في التقارير):
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.82rem' }}>
                  رقم هاتف التواصل الميداني:
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="091-XXXXXXX"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password Change Section */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                <Key size={16} color="#475569" />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>
                  تغيير كلمة المرور (اختياري):
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>كلمة المرور الجديدة</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    value={newPass} 
                    onChange={(e) => setNewPass(e.target.value)} 
                    placeholder="أدخل كلمة مرور جديدة"
                    dir="ltr"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>تأكيد كلمة المرور الجديدة</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    value={confirmPass} 
                    onChange={(e) => setConfirmPass(e.target.value)} 
                    placeholder="أعد إدخال كلمة المرور"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button 
                type="button" 
                onClick={onClose} 
                className="secondary-action-btn"
                style={{ padding: '0.6rem 1.25rem' }}
              >
                إلغاء
              </button>

              <button 
                type="submit" 
                className="primary-action-btn" 
                disabled={isSaving}
                style={{ padding: '0.6rem 1.5rem' }}
              >
                <Save size={16} />
                <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
