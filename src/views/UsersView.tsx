import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  X, 
  ShieldCheck, 
  UserPlus,
  Mail,
  Lock,
  Edit2,
  Trash2,
  Key,
  CheckCircle2,
  UserCheck
} from 'lucide-react';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  password?: string;
  createdAt?: string;
}

export const UsersView: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'مدير المشروع',
    password: 'admin1234'
  });

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/users');
      const data = await response.json();
      if (data.success && data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle Add User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setUsers([...users, data.user]);
        setIsAddModalOpen(false);
        setFormData({ name: '', email: '', role: 'مهندس الموقع الميداني', password: 'admin1234' });
      } else {
        alert('حدث خطأ أثناء إضافة المستخدم');
      }
    } catch (error) {
      alert('تعذر الاتصال بالخادم.');
    }
  };

  // Handle Edit User
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const response = await fetch(`http://localhost:5000/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...formData } : u));
        setIsEditModalOpen(false);
        setSelectedUser(null);
      } else {
        alert('حدث خطأ أثناء تعديل بيانات المستخدم');
      }
    } catch (error) {
      alert('تعذر الاتصال بالخادم.');
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (id: number, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف المستخدم (${name})؟`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        alert('حدث خطأ أثناء الحذف.');
      }
    } catch (error) {
      alert('تعذر الاتصال بالخادم.');
    }
  };

  // Open Edit Modal
  const openEdit = (user: UserData) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: 'admin1234'
    });
    setIsEditModalOpen(true);
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="view-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            مركز إدارة المستخدمين والحسابات
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.2rem' }}>
            إدارة حسابات مديري المشروع والقطاعات مع صلاحيات كاملة للإضافة والتعديل والحذف
          </p>
        </div>

        <button 
          className="primary-action-btn"
          onClick={() => {
            setFormData({ name: '', email: '', role: 'مدير القطاعات', password: 'admin1234' });
            setIsAddModalOpen(true);
          }}
          style={{ height: '40px' }}
        >
          <UserPlus size={16} />
          <span>إضافة مستخدم جديد</span>
        </button>
      </div>

      {/* Quick Credentials Info Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', 
        border: '1px solid #bfdbfe', 
        borderRadius: '12px', 
        padding: '1rem 1.25rem', 
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Key size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e3a8a' }}>
              بيانات الدخول الموحدة
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#1d4ed8', marginTop: '0.15rem' }}>
              اسم المستخدم: <strong>admin</strong> • كلمة السر: <strong>admin1234</strong> (تعمل لمدير المشروع ومدير القطاعات)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1e40af', fontSize: '0.82rem', fontWeight: 700 }}>
          <ShieldCheck size={16} />
          <span>صلاحيات كاملة</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="table-controls-bar" style={{ marginBottom: '1.25rem' }}>
        <div className="search-input-box" style={{ width: '100%', maxWidth: '380px' }}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="بحث بالاسم، الصفة أو المستخدم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
              <th>كلمة السر</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td><span className="code-badge">#{user.id}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontWeight: 800 }}>
                      <UserCheck size={18} />
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
                    background: user.role.includes('مدير المشروع') ? '#eff6ff' : '#f0fdf4',
                    color: user.role.includes('مدير المشروع') ? '#1d4ed8' : '#15803d',
                    border: `1px solid ${user.role.includes('مدير المشروع') ? '#bfdbfe' : '#bbf7d0'}`
                  }}>
                    {user.role}
                  </span>
                </td>
                <td><code style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>{user.email}</code></td>
                <td><code style={{ background: '#f8fafc', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', color: '#64748b' }}>admin1234</code></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => openEdit(user)}
                      style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', fontWeight: 700 }}
                      title="تعديل المستخدم"
                    >
                      <Edit2 size={13} />
                      <span>تعديل</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', fontWeight: 700 }}
                      title="حذف المستخدم"
                    >
                      <Trash2 size={13} />
                      <span>حذف</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>إضافة مستخدم جديد</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="close-btn"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddUser} className="modal-form">
              <div className="form-group">
                <label className="form-label">الاسم الكامل <span className="required-asterisk">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="مثال: م. علي الفرجاني"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">المسمى الوظيفي / الدور <span className="required-asterisk">*</span></label>
                <select 
                  className="form-input" 
                  value={formData.role} 
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="مدير المشروع">مدير المشروع</option>
                  <option value="مدير القطاعات">مدير القطاعات</option>
                  <option value="مهندس الموقع الميداني">مهندس الموقع الميداني</option>
                  <option value="مسؤول الكسارات">مسؤول الكسارات</option>
                  <option value="مسؤول الوقود والصهاريج">مسؤول الوقود والصهاريج</option>
                </select>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">اسم المستخدم (Login) <span className="required-asterisk">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="admin"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">كلمة المرور <span className="required-asterisk">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: '1.25rem' }}>
                <button type="submit" className="primary-action-btn" style={{ width: '100%', height: '46px', justifyContent: 'center' }}>
                  حفظ وتسجيل المستخدم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>تعديل بيانات المستخدم: {selectedUser.name}</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="close-btn"><X size={20} /></button>
            </div>
            <form onSubmit={handleEditUser} className="modal-form">
              <div className="form-group">
                <label className="form-label">الاسم الكامل <span className="required-asterisk">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">المسمى الوظيفي / الدور <span className="required-asterisk">*</span></label>
                <select 
                  className="form-input" 
                  value={formData.role} 
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="مدير المشروع">مدير المشروع</option>
                  <option value="مدير القطاعات">مدير القطاعات</option>
                  <option value="مهندس الموقع الميداني">مهندس الموقع الميداني</option>
                  <option value="مسؤول الكسارات">مسؤول الكسارات</option>
                  <option value="مسؤول الوقود والصهاريج">مسؤول الوقود والصهاريج</option>
                </select>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">اسم المستخدم (Login) <span className="required-asterisk">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">كلمة المرور الجديدة</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: '1.25rem' }}>
                <button type="submit" className="primary-action-btn" style={{ width: '100%', height: '46px', justifyContent: 'center' }}>
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
