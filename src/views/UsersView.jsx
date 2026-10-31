import React, { useState, useEffect } from 'react';
import { 
  Search, X, ShieldCheck, UserPlus, Edit2, Trash2, Key, UserCheck, 
  Eye, EyeOff, Save, AlertCircle, CheckCircle2, Phone, Shield, 
  Award, Building2, Users, MapPin, Check, Lock, ChevronLeft
} from 'lucide-react';
import { getSystemUsers, updateUserPassword, saveCustomUser, deleteCustomUser } from '../components/LoginPage';

export const UsersView = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  // Track visible passwords per user
  const [visiblePasswords, setVisiblePasswords] = useState({});
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Feedback messages
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });
  
  // Form states (No email field!)
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    role: 'مهندس مشرف (المرحلة الأولى)',
    sector: 'المرحلة الأولى',
    password: '',
    phone: ''
  });

  const loadUsers = () => {
    setIsLoading(true);
    try {
      const systemUsers = getSystemUsers();
      setUsers(systemUsers);
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Auto-dismiss feedback
  useEffect(() => {
    if (feedbackMsg.text) {
      const timer = setTimeout(() => setFeedbackMsg({ type: '', text: '' }), 4500);
      return () => clearTimeout(timer);
    }
  }, [feedbackMsg]);

  const togglePasswordVisibility = (userId) => {
    setVisiblePasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  // Official Supervision Agency Roles & Authorities
    const roleOptions = [
    { 
      role: 'حساب التطوير', 
      sector: 'all',
      description: 'التطوير البرمجي الشامل، صيانة قواعد البيانات والتحكم بالنظام'
    },
    { 
      role: 'مدير المشروع', 
      sector: 'all',
      description: 'القيادة الاستراتيجية العامة، الاعتماد المالي النهائي، صلاحيات النظام الشاملة'
    },
    { 
      role: 'رئيس جهاز الإشراف', 
      sector: 'all',
      description: 'التدقيق الميداني، مراجعة وتقييم المستخلصات، اعتماد تقارير الإنجاز'
    },
    { 
      role: 'مسؤول الجودة', 
      sector: 'all',
      description: 'فحوصات FDR والكثافة الحقلية، ضبط جودة الكسارات والمختبر والمطابقة الفنية'
    },
    { 
      role: 'مهندس مشرف (المرحلة الأولى)', 
      sector: 'المرحلة الأولى',
      description: 'الإشراف الميداني اليومي، تقارير قطاع 115.36 كم، مراقبة الوقود والآليات'
    },
    { 
      role: 'مهندس مشرف (المرحلة الثانية)', 
      sector: 'المرحلة الثانية',
      description: 'الإشراف الميداني اليومي، تقارير قطاع 110.92 كم، تشغيل الكسارة والمعدات'
    },
  ];

  // Handle role change and auto-set sector
  const handleRoleChange = (newRole) => {
    const roleOpt = roleOptions.find(r => r.role === newRole);
    setFormData(prev => ({
      ...prev,
      role: newRole,
      sector: roleOpt?.sector || 'all'
    }));
  };

  // Handle Add User
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.username) return;
    if (!formData.password) {
      setFeedbackMsg({ type: 'error', text: 'يرجى إدخال كلمة مرور للمستخدم الجديد' });
      return;
    }

    const newUser = {
      id: Date.now(),
      username: formData.username.trim(),
      name: formData.name.trim(),
      role: formData.role,
      sector: formData.sector || 'all',
      phone: formData.phone.trim() || '',
      password: formData.password.trim(),
      createdAt: new Date().toISOString()
    };

    saveCustomUser(newUser);
    setIsAddModalOpen(false);
    setFormData({ name: '', username: '', role: 'مهندس مشرف (المرحلة الأولى)', sector: 'المرحلة الأولى', password: '', phone: '' });
    setFeedbackMsg({ type: 'success', text: `تم إضافة المهندس "${newUser.name}" بنجاح وتفعيل حسابه الميداني` });
    loadUsers();
  };

  // Handle Edit User
  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (formData.password && formData.password.trim()) {
      updateUserPassword(selectedUser.username, formData.password.trim());
    }

    const isDefaultUser = [1, 2, 3, 4, 5, 6].includes(selectedUser.id) || ['admin', 'project_manager'].includes(selectedUser.username);
    if (!isDefaultUser) {
      saveCustomUser({
        ...selectedUser,
        name: formData.name.trim(),
        username: formData.username.trim(),
        role: formData.role,
        sector: formData.sector,
        phone: formData.phone.trim(),
        password: formData.password ? formData.password.trim() : selectedUser.password
      });
    } else {
      saveCustomUser({
        ...selectedUser,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        sector: formData.sector
      });
    }

    setIsEditModalOpen(false);
    setSelectedUser(null);
    setFeedbackMsg({
      type: 'success',
      text: `تم تحديث بيانات المهندس "${formData.name}" بنجاح${formData.password ? ' (تم تغيير كلمة المرور)' : ''}`
    });
    loadUsers();
  };

  // Handle Delete User
  const handleDeleteUser = (id, name) => {
    if ([1, 2, 3, 4, 5, 6].includes(id)) {
      setFeedbackMsg({ type: 'error', text: 'لا يمكن حذف الأعضاء الأساسيين لجهاز الإشراف المعتمد' });
      return;
    }
    if (!window.confirm(`هل أنت متأكد من حذف حساب (${name}) نهائياً من المنظومة؟`)) return;

    deleteCustomUser(id);
    setFeedbackMsg({ type: 'success', text: `تم حذف المستخدم "${name}" بنجاح` });
    loadUsers();
  };

  // Open Edit Modal
  const openEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      role: user.role,
      sector: user.sector || 'all',
      phone: user.phone || '',
      password: '' // Empty = keep current password
    });
    setIsEditModalOpen(true);
  };

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm);
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Get vibrant role badge styling
  const getRoleStyle = (role = '') => {
    if (role.includes('التطوير') || role.includes('حساب التطوير')) {
      return { 
        bg: '#ecfdf5', 
        color: '#065f46', 
        border: '#a7f3d0', 
        tag: 'التطوير البرمجي والتحكم الشامل',
        accent: '#059669'
      };
    }
    if (role.includes('مدير المشروع')) {
      return { 
        bg: '#eff6ff', 
        color: '#1d4ed8', 
        border: '#93c5fd', 
        tag: 'القيادة الاستراتيجية والاعتماد',
        accent: '#2563eb'
      };
    }
    if (role.includes('رئيس جهاز الإشراف')) {
      return { 
        bg: '#f5f3ff', 
        color: '#6d28d9', 
        border: '#c4b5fd', 
        tag: 'التدقيق الفني والمقارنة',
        accent: '#7c3aed'
      };
    }
    if (role.includes('الجودة')) {
      return { 
        bg: '#ecfdf5', 
        color: '#047857', 
        border: '#6ee7b7', 
        tag: 'المطابقة والفحوصات المخبرية',
        accent: '#059669'
      };
    }
    if (role.includes('الأولى') || role.includes('A')) {
      return { 
        bg: '#fff7ed', 
        color: '#c2410c', 
        border: '#fdba74', 
        tag: 'إشراف المرحلة الأولى (115 كم)',
        accent: '#ea580c'
      };
    }
    if (role.includes('الثانية') || role.includes('B')) {
      return { 
        bg: '#f0fdfa', 
        color: '#0f766e', 
        border: '#5eead4', 
        tag: 'إشراف المرحلة الثانية (110 كم)',
        accent: '#0d9488'
      };
    }
    return { 
      bg: '#f8fafc', 
      color: '#334155', 
      border: '#cbd5e1', 
      tag: 'مهندس ميداني معتمد',
      accent: '#64748b'
    };
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', direction: 'rtl', padding: '0.5rem 0' }}>
      
      {/* 1. Header Banner & Stats */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e3a8a 100%)',
        borderRadius: '16px',
        padding: '1.5rem 1.75rem',
        color: '#ffffff',
        marginBottom: '1.5rem',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #2563eb 0%, #0284c7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
            color: '#ffffff',
            flexShrink: 0
          }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#ffffff' }}>
                مركز المستخدمين والصلاحيات الرسمية للجهاز
              </h1>
              <span style={{
                background: 'rgba(56, 189, 248, 0.2)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                fontSize: '0.78rem',
                fontWeight: 800,
                padding: '0.2rem 0.65rem',
                borderRadius: '20px'
              }}>
                {users.length} مستخدمين نشطين
              </span>
            </div>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#cbd5e1' }}>
              إدارة حسابات جهاز الإشراف والمتابعة الميداني لمشروع طريق أوباري - غات (360 كم)، توزيع الصلاحيات وكلمات المرور
            </p>
          </div>
        </div>

        <button 
          onClick={() => {
            setFormData({ name: '', username: '', role: 'مهندس مشرف (المرحلة الأولى)', sector: 'المرحلة الأولى', password: '', phone: '' });
            setIsAddModalOpen(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '0.7rem 1.35rem',
            borderRadius: '10px',
            fontWeight: 800,
            fontSize: '0.88rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
            transition: 'all 0.2s ease'
          }}
        >
          <UserPlus size={18} />
          <span>إضافة مستخدم جديد</span>
        </button>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg.text && (
        <div style={{
          background: feedbackMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${feedbackMsg.type === 'success' ? '#86efac' : '#fecaca'}`,
          borderRadius: '12px',
          padding: '0.85rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: feedbackMsg.type === 'success' ? '#166534' : '#991b1b',
          fontWeight: 800,
          fontSize: '0.88rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
          {feedbackMsg.type === 'success' ? <CheckCircle2 size={20} color="#16a34a" /> : <AlertCircle size={20} color="#dc2626" />}
          <span>{feedbackMsg.text}</span>
          <button 
            onClick={() => setFeedbackMsg({ type: '', text: '' })} 
            style={{ marginRight: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* 2. Official Supervision Hierarchy Cards (الهيكل الإداري الرسمي المعتمد) */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 900, color: '#0f172a' }}>
                الهيكل الإداري الرسمي لجهاز الإشراف على المشروع
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                المهام والصلاحيات ولوحات التحكم موزعة رسمياً حسب التكليف الميداني المعتمد
              </span>
            </div>
          </div>
          <span style={{ fontSize: '0.76rem', color: '#166534', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.2rem 0.65rem', borderRadius: '12px', fontWeight: 800 }}>
            ✓ معتمد بقرار رسمي
          </span>
        </div>

        {/* 5 Distinct Executive Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(235px, 1fr))',
          gap: '1rem'
        }}>
                    {/* Card 0: حساب التطوير */}
          <div style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)',
            border: '1.5px solid #a7f3d0',
            borderRadius: '12px',
            padding: '1rem',
            position: 'relative',
            boxShadow: '0 2px 6px rgba(5, 150, 105, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.6rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', flexShrink: 0 }}>
                ت
              </div>
              <div>
                <strong style={{ fontSize: '0.92rem', color: '#065f46', display: 'block' }}>
                  م. حساب التطوير
                </strong>
                <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 800 }}>حساب التطوير والبرمجة</span>
              </div>
            </div>
            <p style={{ margin: '0 0 0.65rem', fontSize: '0.76rem', color: '#475569', lineHeight: 1.4 }}>
              التطوير البرمجي الشامل، صيانة قواعد البيانات والنسخ الاحتياطي، وإدارة أذونات النظام.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', fontSize: '0.74rem' }}>
              <span style={{ color: '#64748b' }}>إدارة النظام الشاملة</span>
              <span style={{ color: '#059669', fontWeight: 800, direction: 'ltr' }}>091-2345678</span>
            </div>
          </div>

          {/* Card 1: مدير المشروع */}
          <div style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            border: '1.5px solid #bfdbfe',
            borderRadius: '12px',
            padding: '1rem',
            position: 'relative',
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.6rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', flexShrink: 0 }}>
                أ
              </div>
              <div>
                <strong style={{ fontSize: '0.92rem', color: '#1e3a8a', display: 'block' }}>
                  م. عبدالرحمن الأنصاري
                </strong>
                <span style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 800 }}>مدير عام المشروع</span>
              </div>
            </div>
            <p style={{ margin: '0 0 0.65rem', fontSize: '0.76rem', color: '#475569', lineHeight: 1.4 }}>
              القيادة الاستراتيجية العامة، الاعتماد المالي النهائي، صلاحيات النظام الشاملة.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', fontSize: '0.74rem' }}>
              <span style={{ color: '#64748b' }}>كامل المسار (360 كم)</span>
              <span style={{ color: '#2563eb', fontWeight: 800, direction: 'ltr' }}>091-2345678</span>
            </div>
          </div>

          {/* Card 2: رئيس جهاز الإشراف */}
          <div style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            border: '1.5px solid #ddd6fe',
            borderRadius: '12px',
            padding: '1rem',
            position: 'relative',
            boxShadow: '0 2px 6px rgba(124, 58, 237, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.6rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', flexShrink: 0 }}>
                إ
              </div>
              <div>
                <strong style={{ fontSize: '0.92rem', color: '#5b21b6', display: 'block' }}>
                  م. عبدالسلام ابريكاو
                </strong>
                <span style={{ fontSize: '0.74rem', color: '#7c3aed', fontWeight: 800 }}>رئيس جهاز الإشراف</span>
              </div>
            </div>
            <p style={{ margin: '0 0 0.65rem', fontSize: '0.76rem', color: '#475569', lineHeight: 1.4 }}>
              التدقيق الميداني، مراجعة وتقييم المستخلصات والموقف التنفيذي، اعتماد التقارير.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', fontSize: '0.74rem' }}>
              <span style={{ color: '#64748b' }}>كامل مسار الطريق</span>
              <span style={{ color: '#7c3aed', fontWeight: 800, direction: 'ltr' }}>091-3456789</span>
            </div>
          </div>

          {/* Card 3: مسؤول الجودة */}
          <div style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            border: '1.5px solid #a7f3d0',
            borderRadius: '12px',
            padding: '1rem',
            position: 'relative',
            boxShadow: '0 2px 6px rgba(5, 150, 105, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.6rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', flexShrink: 0 }}>
                ح
              </div>
              <div>
                <strong style={{ fontSize: '0.92rem', color: '#065f46', display: 'block' }}>
                  م. صالح حماد
                </strong>
                <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 800 }}>مسؤول الجودة والمختبر</span>
              </div>
            </div>
            <p style={{ margin: '0 0 0.65rem', fontSize: '0.76rem', color: '#475569', lineHeight: 1.4 }}>
              فحوصات FDR والكثافة الحقلية، ومطابقة الركام بمختبر الكسارات وضبط الجودة.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', fontSize: '0.74rem' }}>
              <span style={{ color: '#64748b' }}>مواقع الفحص والمختبر</span>
              <span style={{ color: '#059669', fontWeight: 800, direction: 'ltr' }}>091-4567890</span>
            </div>
          </div>

          {/* Card 4: مشرف المرحلة الأولى */}
          <div style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            border: '1.5px solid #fed7aa',
            borderRadius: '12px',
            padding: '1rem',
            position: 'relative',
            boxShadow: '0 2px 6px rgba(234, 88, 12, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.6rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ea580c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', flexShrink: 0 }}>
                ع
              </div>
              <div>
                <strong style={{ fontSize: '0.92rem', color: '#9a3412', display: 'block' }}>
                  م. صلاح العربي
                </strong>
                <span style={{ fontSize: '0.74rem', color: '#ea580c', fontWeight: 800 }}>مشرف المرحلة الأولى</span>
              </div>
            </div>
            <p style={{ margin: '0 0 0.65rem', fontSize: '0.76rem', color: '#475569', lineHeight: 1.4 }}>
              الإشراف الميداني اليومي، تقارير قطاع 115.36 كم، ومتابعة الوقود والآليات.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', fontSize: '0.74rem' }}>
              <span style={{ color: '#64748b' }}>المرحلة الأولى (115 كم)</span>
              <span style={{ color: '#ea580c', fontWeight: 800, direction: 'ltr' }}>091-5678901</span>
            </div>
          </div>

          {/* Card 5: مشرف المرحلة الثانية */}
          <div style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            border: '1.5px solid #99f6e4',
            borderRadius: '12px',
            padding: '1rem',
            position: 'relative',
            boxShadow: '0 2px 6px rgba(13, 148, 136, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.6rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#0d9488', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', flexShrink: 0 }}>
                ط
              </div>
              <div>
                <strong style={{ fontSize: '0.92rem', color: '#115e59', display: 'block' }}>
                  م. عيسى الطاهر
                </strong>
                <span style={{ fontSize: '0.74rem', color: '#0d9488', fontWeight: 800 }}>مشرف المرحلة الثانية</span>
              </div>
            </div>
            <p style={{ margin: '0 0 0.65rem', fontSize: '0.76rem', color: '#475569', lineHeight: 1.4 }}>
              الإشراف الميداني اليومي، تقارير قطاع 110.92 كم، وتشغيل الكسارة والآليات.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', fontSize: '0.74rem' }}>
              <span style={{ color: '#64748b' }}>المرحلة الثانية (110 كم)</span>
              <span style={{ color: '#0d9488', fontWeight: 800, direction: 'ltr' }}>091-6789012</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '0.9rem 1.25rem',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="بحث بالاسم، اسم الدخول، الدور أو رقم الهاتف..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 2.5rem 0.6rem 1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                outline: 'none',
                background: '#f8fafc'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>تصفية حسب المنصب:</span>
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.84rem',
              fontWeight: 700,
              color: '#1e293b',
              background: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <option value="all">كافة المناصب والأدوار ({users.length})</option>
            {roleOptions.map(opt => (
              <option key={opt.role} value={opt.role}>{opt.role}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Spacious, Fixed-Header Users & Permissions Table (Eliminating any text overlap) */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{
            width: '100%',
            minWidth: '1080px',
            borderCollapse: 'collapse',
            textAlign: 'right',
            fontSize: '0.86rem'
          }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.82rem', fontWeight: 900 }}>
                <th style={{ padding: '0.85rem 1.25rem', width: '250px' }}>العضو / المهندس</th>
                <th style={{ padding: '0.85rem 1rem', width: '180px' }}>المسمى والصفة</th>
                <th style={{ padding: '0.85rem 1rem', width: '130px' }}>اسم الدخول</th>
                <th style={{ padding: '0.85rem 1rem', width: '150px' }}>كلمة المرور</th>
                <th style={{ padding: '0.85rem 1rem', width: '150px' }}>نطاق الإشراف</th>
                <th style={{ padding: '0.85rem 1rem', width: '150px' }}>رقم التواصل</th>
                <th style={{ padding: '0.85rem 1.25rem', width: '140px', textAlign: 'center' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                    <Users size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                    <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>لم يتم العثور على أي مستخدمين مطابقين للبحث</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleStyle = getRoleStyle(user.role || '');
                  const isPasswordVisible = visiblePasswords[user.id];
                  const isPermanent = [1, 2, 3, 4, 5, 6].includes(user.id) || ['admin', 'project_manager'].includes(user.username);
                  const userAvatar = user.avatar || localStorage.getItem(`user_avatar_${user.username}`) || '';

                  return (
                    <tr 
                      key={user.id} 
                      style={{ 
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* 1. المهندس والاسم */}
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            background: roleStyle.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: roleStyle.color,
                            fontWeight: 900,
                            fontSize: '1rem',
                            overflow: 'hidden',
                            border: `2px solid ${roleStyle.border}`,
                            flexShrink: 0
                          }}>
                            {userAvatar ? (
                              <img src={userAvatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span>{(user.name || 'م')[0]}</span>
                            )}
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.94rem', color: '#0f172a', display: 'block' }}>
                              {user.name}
                            </strong>
                            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                              {user.title || (isPermanent ? 'جهاز الإشراف المعتمد' : 'مهندس إشراف ميداني')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. المسمى والصفة */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.3rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          background: roleStyle.bg,
                          color: roleStyle.color,
                          border: `1px solid ${roleStyle.border}`
                        }}>
                          {user.role}
                        </span>
                      </td>

                      {/* 3. اسم الدخول */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <code style={{
                          background: '#f1f5f9',
                          color: '#0f172a',
                          padding: '0.3rem 0.65rem',
                          borderRadius: '6px',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          border: '1px solid #e2e8f0',
                          display: 'inline-block'
                        }} dir="ltr">
                          {user.username}
                        </code>
                      </td>

                      {/* 4. كلمة المرور مع زر التبديل */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.25rem 0.65rem', borderRadius: '6px' }}>
                          <code style={{
                            fontSize: '0.85rem',
                            color: isPasswordVisible ? '#0f172a' : '#64748b',
                            fontFamily: 'monospace',
                            letterSpacing: isPasswordVisible ? '0' : '2px',
                            minWidth: '65px'
                          }} dir="ltr">
                            {isPasswordVisible ? user.password : '••••••••'}
                          </code>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(user.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#64748b',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title={isPasswordVisible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                          >
                            {isPasswordVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </td>

                      {/* 5. نطاق الإشراف */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: '#334155'
                        }}>
                          <MapPin size={14} color="#64748b" />
                          <span>{user.sector === 'all' ? 'كامل مسار الطريق (360 كم)' : user.sector}</span>
                        </span>
                      </td>

                      {/* 6. رقم الهاتف والتواصل */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          color: '#0f172a',
                          direction: 'ltr'
                        }}>
                          <Phone size={13} color="#16a34a" />
                          <span>{user.phone || '091-XXXXXXX'}</span>
                        </span>
                      </td>

                      {/* 7. الإجراءات */}
                      <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => openEdit(user)}
                            style={{
                              background: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #bfdbfe',
                              padding: '0.35rem 0.75rem',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              transition: 'all 0.15s ease'
                            }}
                            title="تعديل بيانات المستخدم وكلمة المرور"
                          >
                            <Edit2 size={13} />
                            <span>تعديل</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            disabled={isPermanent}
                            style={{
                              background: isPermanent ? '#f8fafc' : '#fef2f2',
                              color: isPermanent ? '#cbd5e1' : '#dc2626',
                              border: `1px solid ${isPermanent ? '#e2e8f0' : '#fecaca'}`,
                              padding: '0.35rem 0.75rem',
                              borderRadius: '8px',
                              cursor: isPermanent ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              opacity: isPermanent ? 0.6 : 1
                            }}
                            title={isPermanent ? 'عضو رسمي أساسي لا يمكن حذفه' : 'حذف المستخدم'}
                          >
                            <Trash2 size={13} />
                            <span>حذف</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Add User Modal (Clean, No Email field!) */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '540px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            direction: 'rtl'
          }}>
            <div style={{
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 900, color: '#0f172a' }}>
                    إضافة عضو جديد لجهاز الإشراف
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                    منح صلاحيات الوصول الميداني لنظام متابعة طريق أوباري - غات
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddUser} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                    الاسم الكامل للمهندس / العضو <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="مثال: م. علي الطاهر الفرجاني" 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    required
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                    المسمى الوظيفي والدور <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select 
                    value={formData.role} 
                    onChange={(e) => handleRoleChange(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 700, outline: 'none', background: '#fff' }}
                  >
                    {roleOptions.map(opt => (
                      <option key={opt.role} value={opt.role}>{opt.role}</option>
                    ))}
                  </select>
                  <span style={{ display: 'block', fontSize: '0.74rem', color: '#64748b', marginTop: '0.3rem' }}>
                    {roleOptions.find(r => r.role === formData.role)?.description}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                      اسم الدخول (Username) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="مثال: eng_ali" 
                      dir="ltr" 
                      value={formData.username} 
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
                      required
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', fontFamily: 'monospace' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                      رقم الهاتف الميداني
                    </label>
                    <input 
                      type="text" 
                      placeholder="091-XXXXXXX" 
                      dir="ltr" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                    كلمة المرور الابتدائية <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="أدخل كلمة مرور قوية" 
                    dir="ltr" 
                    value={formData.password} 
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                    required
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', fontFamily: 'monospace' }}
                  />
                </div>

              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button 
                  type="submit" 
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  <Save size={16} />
                  <span>حفظ وتفعيل المستخدم</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f1f5f9',
                    color: '#475569',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Edit User Modal (Clean, No Email field!) */}
      {isEditModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '540px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            direction: 'rtl'
          }}>
            <div style={{
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 900, color: '#0f172a' }}>
                    تعديل بيانات المستخدم: {selectedUser?.name}
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                    تحديث بيانات الصلاحيات والاتصال وكلمة المرور
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditUser} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                    الاسم الكامل <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    required
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                    المسمى الوظيفي / الدور
                  </label>
                  <select 
                    value={formData.role} 
                    onChange={(e) => handleRoleChange(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 700, outline: 'none', background: '#fff' }}
                  >
                    {roleOptions.map(opt => (
                      <option key={opt.role} value={opt.role}>{opt.role}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                      اسم الدخول (Login)
                    </label>
                    <input 
                      type="text" 
                      value={formData.username} 
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
                      dir="ltr" 
                      required
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', fontFamily: 'monospace' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                      رقم الهاتف الميداني
                    </label>
                    <input 
                      type="text" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                      dir="ltr"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                    تحديث كلمة المرور (اتركها فارغة للإبقاء على الحالية)
                  </label>
                  <input 
                    type="text" 
                    placeholder="أدخل كلمة مرور جديدة للتحديث..." 
                    dir="ltr" 
                    value={formData.password} 
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', fontFamily: 'monospace' }}
                  />
                </div>

              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button 
                  type="submit" 
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background: '#0284c7',
                    color: '#fff',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  <Save size={16} />
                  <span>حفظ التعديلات</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f1f5f9',
                    color: '#475569',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UsersView;
