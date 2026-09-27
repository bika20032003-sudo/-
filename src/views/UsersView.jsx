import React, { useState, useEffect } from 'react';
import { Search, X, ShieldCheck, UserPlus, Edit2, Trash2, Key, UserCheck, Eye, EyeOff, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getSystemUsers, updateUserPassword, saveCustomUser, deleteCustomUser } from '../components/LoginPage';

export const UsersView = ({ currentUser }) => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    // Track visible passwords per user
    const [visiblePasswords, setVisiblePasswords] = useState({});
    // Modals state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    // Success/Error feedback
    const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });
    // Form states
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'مدير المشروع',
        sector: 'all',
        password: ''
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
            const timer = setTimeout(() => setFeedbackMsg({ type: '', text: '' }), 4000);
            return () => clearTimeout(timer);
        }
    }, [feedbackMsg]);

    const togglePasswordVisibility = (userId) => {
        setVisiblePasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
    };

    // Get role options with sector mapping
    const roleOptions = [
        { role: 'مدير المشروع', sector: 'all' },
        { role: 'مدير القطاعات', sector: 'all' },
        { role: 'مشرف القطاع (A)', sector: 'القطعة A' },
        { role: 'مشرف القطاع (B)', sector: 'القطعة B' },
        { role: 'مهندس الموقع الميداني', sector: 'all' },
        { role: 'مسؤول الكسارات', sector: 'all' },
        { role: 'مسؤول الوقود والصهاريج', sector: 'all' },
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
        if (!formData.name || !formData.email) return;
        if (!formData.password) {
            setFeedbackMsg({ type: 'error', text: 'يرجى إدخال كلمة مرور للمستخدم الجديد' });
            return;
        }

        const newUser = {
            id: Date.now(),
            username: formData.email,
            email: formData.email,
            name: formData.name,
            role: formData.role,
            sector: formData.sector || 'all',
            password: formData.password,
            createdAt: new Date().toISOString()
        };

        saveCustomUser(newUser);
        setIsAddModalOpen(false);
        setFormData({ name: '', email: '', role: 'مدير المشروع', sector: 'all', password: '' });
        setFeedbackMsg({ type: 'success', text: `تم إضافة المستخدم "${newUser.name}" بنجاح مع كلمة مرور فعّالة` });
        loadUsers();
    };

    // Handle Edit User (including password change)
    const handleEditUser = async (e) => {
        e.preventDefault();
        if (!selectedUser) return;

        // Update password if changed
        if (formData.password && formData.password.trim()) {
            updateUserPassword(selectedUser.username, formData.password.trim());
        }

        // If it's a custom user, update other fields too
        const isDefaultUser = [1, 2, 3, 4].includes(selectedUser.id);
        if (!isDefaultUser) {
            saveCustomUser({
                ...selectedUser,
                name: formData.name,
                email: formData.email,
                username: formData.email,
                role: formData.role,
                sector: formData.sector,
                password: formData.password || selectedUser.password
            });
        } else {
            // For default users, we can only change their password
            if (formData.password && formData.password.trim()) {
                updateUserPassword(selectedUser.username, formData.password.trim());
            }
        }

        setIsEditModalOpen(false);
        setSelectedUser(null);
        setFeedbackMsg({
            type: 'success',
            text: `تم تحديث بيانات "${formData.name}" بنجاح${formData.password ? ' (تم تغيير كلمة المرور)' : ''}`
        });
        loadUsers();
    };

    // Handle Delete User
    const handleDeleteUser = (id, name) => {
        // Prevent deleting the 4 default users
        if ([1, 2, 3, 4].includes(id)) {
            setFeedbackMsg({ type: 'error', text: 'لا يمكن حذف المستخدمين الأساسيين للنظام' });
            return;
        }
        if (!window.confirm(`هل أنت متأكد من حذف المستخدم (${name})؟`)) return;

        deleteCustomUser(id);
        setFeedbackMsg({ type: 'success', text: `تم حذف المستخدم "${name}" بنجاح` });
        loadUsers();
    };

    // Open Edit Modal
    const openEdit = (user) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email || user.username,
            role: user.role,
            sector: user.sector || 'all',
            password: '' // Empty = keep current password
        });
        setIsEditModalOpen(true);
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get role badge styling
    const getRoleBadge = (role) => {
        if (role.includes('مدير المشروع')) return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
        if (role.includes('مدير القطاعات')) return { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
        if (role.includes('مشرف القطاع') && role.includes('A')) return { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' };
        if (role.includes('مشرف القطاع') && role.includes('B')) return { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' };
        return { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
    };

    return (<div className="view-content" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            مركز إدارة المستخدمين والصلاحيات
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.2rem' }}>
            إدارة الحسابات وكلمات المرور والصلاحيات - كل تغيير يُحفظ فوراً ويعمل مباشرة
          </p>
        </div>

        <button className="primary-action-btn" onClick={() => {
            setFormData({ name: '', email: '', role: 'مدير القطاعات', sector: 'all', password: '' });
            setIsAddModalOpen(true);
        }} style={{ height: '40px' }}>
          <UserPlus size={16}/>
          <span>إضافة مستخدم جديد</span>
        </button>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg.text && (
        <div style={{
          background: feedbackMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${feedbackMsg.type === 'success' ? '#86efac' : '#fecaca'}`,
          borderRadius: '12px',
          padding: '0.85rem 1.2rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: feedbackMsg.type === 'success' ? '#166534' : '#991b1b',
          fontWeight: 700,
          fontSize: '0.88rem'
        }}>
          {feedbackMsg.type === 'success' ? <CheckCircle2 size={20}/> : <AlertCircle size={20}/>}
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg({ type: '', text: '' })} style={{ marginRight: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <X size={18}/>
          </button>
        </div>
      )}

      {/* Info Banner */}
      <div style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '1px solid #bfdbfe',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Key size={18}/>
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e3a8a' }}>
              نظام الصلاحيات والتحكم في الوصول
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#1d4ed8', marginTop: '0.15rem' }}>
              كل مستخدم لديه كلمة مرور خاصة - عند تغييرها من هنا تعمل فوراً في تسجيل الدخول
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0.5rem',
          marginTop: '0.75rem',
          fontSize: '0.78rem'
        }}>
          <div style={{ background: '#fff', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <strong style={{ color: '#1e3a8a' }}>🔵 مدير المشروع:</strong> <span style={{ color: '#475569' }}>صلاحيات كاملة + إدارة المستخدمين</span>
          </div>
          <div style={{ background: '#fff', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            <strong style={{ color: '#15803d' }}>🟢 مدير القطاعات:</strong> <span style={{ color: '#475569' }}>اعتماد التقارير + كافة الأقسام</span>
          </div>
          <div style={{ background: '#fff', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #fed7aa' }}>
            <strong style={{ color: '#c2410c' }}>🟠 مشرف القطاع A:</strong> <span style={{ color: '#475569' }}>لوحة القطاع A فقط + رفع تقارير</span>
          </div>
          <div style={{ background: '#fff', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #ddd6fe' }}>
            <strong style={{ color: '#6d28d9' }}>🟣 مشرف القطاع B:</strong> <span style={{ color: '#475569' }}>لوحة القطاع B فقط + رفع تقارير</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="table-controls-bar" style={{ marginBottom: '1.25rem' }}>
        <div className="search-input-box" style={{ width: '100%', maxWidth: '380px' }}>
          <Search size={18} color="#94a3b8"/>
          <input type="text" placeholder="بحث بالاسم، الصفة أو المستخدم..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>المعرف</th>
              <th>الاسم والصفة</th>
              <th>المسمى الوظيفي</th>
              <th>اسم المستخدم (Login)</th>
              <th>كلمة المرور</th>
              <th>القطاع</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => {
                const roleBadge = getRoleBadge(user.role);
                const isPasswordVisible = visiblePasswords[user.id];
                return (<tr key={user.id}>
                    <td><span className="code-badge">#{user.id}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '50%',
                          background: roleBadge.bg, display: 'flex', alignItems: 'center',
                          justifyContent: 'center', color: roleBadge.color, fontWeight: 800
                        }}>
                          <UserCheck size={18}/>
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{user.name}</strong>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        background: roleBadge.bg,
                        color: roleBadge.color,
                        border: `1px solid ${roleBadge.border}`
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <code style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                        {user.username}
                      </code>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <code style={{
                          background: '#f8fafc', padding: '0.2rem 0.5rem', borderRadius: '4px',
                          fontSize: '0.85rem', color: isPasswordVisible ? '#0f172a' : '#94a3b8',
                          fontFamily: isPasswordVisible ? 'monospace' : 'inherit',
                          letterSpacing: isPasswordVisible ? '0' : '2px',
                          minWidth: '80px'
                        }}>
                          {isPasswordVisible ? user.password : '••••••••'}
                        </code>
                        <button
                          onClick={() => togglePasswordVisibility(user.id)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#94a3b8', padding: '0.15rem', display: 'flex'
                          }}
                          title={isPasswordVisible ? 'إخفاء' : 'إظهار كلمة المرور'}
                        >
                          {isPasswordVisible ? <EyeOff size={14}/> : <Eye size={14}/>}
                        </button>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700 }}>
                        {user.sector === 'all' ? 'كافة القطاعات' : user.sector}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => openEdit(user)} style={{
                          background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
                          padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '0.25rem',
                          fontSize: '0.78rem', fontWeight: 700
                        }} title="تعديل المستخدم">
                          <Edit2 size={13}/>
                          <span>تعديل</span>
                        </button>
                        <button onClick={() => handleDeleteUser(user.id, user.name)} style={{
                          background: [1,2,3,4].includes(user.id) ? '#f1f5f9' : '#fee2e2',
                          color: [1,2,3,4].includes(user.id) ? '#94a3b8' : '#dc2626',
                          border: `1px solid ${[1,2,3,4].includes(user.id) ? '#e2e8f0' : '#fecaca'}`,
                          padding: '0.35rem 0.65rem', borderRadius: '6px',
                          cursor: [1,2,3,4].includes(user.id) ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: '0.25rem',
                          fontSize: '0.78rem', fontWeight: 700
                        }} title={[1,2,3,4].includes(user.id) ? 'لا يمكن حذف المستخدمين الأساسيين' : 'حذف المستخدم'}>
                          <Trash2 size={13}/>
                          <span>حذف</span>
                        </button>
                      </div>
                    </td>
                  </tr>);
            })}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (<div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>إضافة مستخدم جديد</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="close-btn"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddUser} className="modal-form">
              <div className="form-group">
                <label className="form-label">الاسم الكامل <span className="required-asterisk">*</span></label>
                <input type="text" className="form-input" placeholder="مثال: م. علي الفرجاني" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required/>
              </div>

              <div className="form-group">
                <label className="form-label">المسمى الوظيفي / الدور <span className="required-asterisk">*</span></label>
                <select className="form-input" value={formData.role} onChange={(e) => handleRoleChange(e.target.value)}>
                  {roleOptions.map(opt => (
                    <option key={opt.role} value={opt.role}>{opt.role}</option>
                  ))}
                </select>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">اسم المستخدم (Login) <span className="required-asterisk">*</span></label>
                  <input type="text" className="form-input" placeholder="مثال: eng_ali" dir="ltr" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required/>
                </div>
                <div className="form-group">
                  <label className="form-label">كلمة المرور <span className="required-asterisk">*</span></label>
                  <input type="text" className="form-input" placeholder="أدخل كلمة مرور قوية" dir="ltr" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required/>
                </div>
              </div>

              <div style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                marginTop: '0.5rem',
                fontSize: '0.78rem',
                color: '#92400e',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <ShieldCheck size={16}/>
                <span>القطاع: <strong>{formData.sector === 'all' ? 'كافة القطاعات (صلاحيات عامة)' : formData.sector}</strong> - يُحدد تلقائياً حسب الدور</span>
              </div>

              <div className="modal-actions" style={{ marginTop: '1.25rem' }}>
                <button type="submit" className="primary-action-btn" style={{ width: '100%', height: '46px', justifyContent: 'center' }}>
                  <Save size={16}/>
                  <span>حفظ وتسجيل المستخدم الجديد</span>
                </button>
              </div>
            </form>
          </div>
        </div>)}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (<div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>تعديل بيانات: {selectedUser.name}</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="close-btn"><X size={20}/></button>
            </div>
            <form onSubmit={handleEditUser} className="modal-form">
              <div className="form-group">
                <label className="form-label">الاسم الكامل <span className="required-asterisk">*</span></label>
                <input
                  type="text" className="form-input" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={[1,2,3,4].includes(selectedUser.id)}
                />
                {[1,2,3,4].includes(selectedUser.id) && (
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem', display: 'block' }}>
                    لا يمكن تغيير اسم المستخدمين الأساسيين
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">المسمى الوظيفي / الدور</label>
                <select
                  className="form-input" value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  disabled={[1,2,3,4].includes(selectedUser.id)}
                >
                  {roleOptions.map(opt => (
                    <option key={opt.role} value={opt.role}>{opt.role}</option>
                  ))}
                </select>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">اسم المستخدم (Login)</label>
                  <input
                    type="text" className="form-input" value={formData.email} dir="ltr"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={[1,2,3,4].includes(selectedUser.id)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    كلمة المرور الجديدة
                    <span style={{ fontSize: '0.7rem', color: '#ea580c', fontWeight: 700, marginRight: '0.3rem' }}>
                      (اتركها فارغة لعدم التغيير)
                    </span>
                  </label>
                  <input
                    type="text" className="form-input" dir="ltr"
                    placeholder="أدخل كلمة مرور جديدة..."
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={{
                      borderColor: formData.password ? '#2563eb' : '#cbd5e1',
                      background: formData.password ? '#eff6ff' : '#fff'
                    }}
                  />
                </div>
              </div>

              {formData.password && (
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  marginTop: '0.5rem',
                  fontSize: '0.82rem',
                  color: '#166534',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Key size={16}/>
                  <span>سيتم تغيير كلمة المرور إلى: <code style={{ background: '#dcfce7', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>{formData.password}</code> وستعمل فوراً في تسجيل الدخول</span>
                </div>
              )}

              <div className="modal-actions" style={{ marginTop: '1.25rem' }}>
                <button type="submit" className="primary-action-btn" style={{ width: '100%', height: '46px', justifyContent: 'center' }}>
                  <Save size={16}/>
                  <span>حفظ التعديلات{formData.password ? ' وتحديث كلمة المرور' : ''}</span>
                </button>
              </div>
            </form>
          </div>
        </div>)}
    </div>);
};
