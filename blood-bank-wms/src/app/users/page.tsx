// صفحة إدارة المستخدمين والصلاحيات - تجميد وإيقاف وإعادة تعيين كلمة المرور
// منظومة إدارة مخازن الهيئة العامة لخدمات نقل الدم
'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import {
  Users,
  Plus,
  Search,
  KeyRound,
  Snowflake,
  Ban,
  CheckCircle2,
  X,
  Save,
  User as UserIcon,
  ShieldCheck,
  Building2,
  Copy,
  Check,
  RefreshCw,
  Phone,
  Mail,
  Lock,
} from 'lucide-react';
import { initialUsers, initialWarehouses } from '@/lib/mockData';
import { User, UserRole, UserStatus } from '@/types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('الكل');
  const [statusFilter, setStatusFilter] = useState('الكل');

  // النوافذ المنبثقة
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUserForPass, setSelectedUserForPass] = useState<User | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);

  // نموذج إضافة مستخدم
  const [newUser, setNewUser] = useState({
    FullName: '',
    Username: '',
    Role: 'storekeeper' as UserRole,
    Email: '',
    Phone: '',
    Warehouse: 'المخزن الرئيسي المركز - طرابلس',
    InitialPassword: 'User@2026',
  });

  // توليد كلمة مرور عشوائية
  const generateNewPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleOpenPasswordReset = (user: User) => {
    setSelectedUserForPass(user);
    setGeneratedPassword(generateNewPassword());
    setCopied(false);
    setShowPasswordModal(true);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // تغيير حالة المستخدم (تجميد - إيقاف - تفعيل)
  const handleUpdateStatus = (userId: number, newStatus: UserStatus) => {
    setUsers(
      users.map((u) => {
        if (u.Id === userId) {
          return {
            ...u,
            Status: newStatus,
            IsActive: newStatus === 'active',
            UpdatedAt: new Date().toISOString().split('T')[0],
          };
        }
        return u;
      })
    );
  };

  // إنشاء مستخدم جديد
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.FullName || !newUser.Username) return;

    let roleLabel = 'أمين خزينة / مخزن (استلام وصرف)';
    if (newUser.Role === 'admin') roleLabel = 'مدير النظام';
    if (newUser.Role === 'treasury_manager') roleLabel = 'مدير الخزينة والمخازن';
    if (newUser.Role === 'viewer') roleLabel = 'مراقب عام (عرض وتقارير)';

    const created: User = {
      Id: users.length + 1,
      FullName: newUser.FullName,
      Username: newUser.Username,
      Role: newUser.Role,
      RoleLabel: roleLabel,
      Email: newUser.Email || `${newUser.Username}@blood-bank.gov.ly`,
      Phone: newUser.Phone || '09XXXXXXXX',
      Status: 'active',
      IsActive: true,
      CreatedAt: new Date().toISOString().split('T')[0],
      UpdatedAt: new Date().toISOString().split('T')[0],
      LastLogin: 'لم يسجل دخول بعد',
      Warehouse: newUser.Warehouse,
    };

    setUsers([...users, created]);
    setShowAddModal(false);
    setNewUser({
      FullName: '',
      Username: '',
      Role: 'storekeeper',
      Email: '',
      Phone: '',
      Warehouse: 'المخزن الرئيسي المركز - طرابلس',
      InitialPassword: 'User@2026',
    });
  };

  // فلترة المستخدمين
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.FullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.Username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.Phone && u.Phone.includes(searchTerm)) ||
      (u.Warehouse && u.Warehouse.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'الكل' || u.Role === roleFilter;
    const matchesStatus = statusFilter === 'الكل' || u.Status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <>
      <Header
        title="إدارة المستخدمين والصلاحيات"
        subtitle="الهيئة العامة لخدمات نقل الدم / تجميد الحسابات وإعادة تعيين كلمات المرور"
      />

      <div className="page-content">
        {/* رأس الصفحة */}
        <div className="page-header">
          <div>
            <h1 className="page-header-title">المستخدمون وحسابات النظام</h1>
            <p className="page-header-subtitle">
              إدارة صلاحيات مدير النظام، مدير الخزينة، أمناء الخزائن مع إمكانية التجميد والإيقاف الفوري وإعادة تعيين كلمة المرور
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            إضافة مستخدم جديد
          </button>
        </div>

        {/* بطاقات الإحصاء السريع لحالات المستخدمين */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>حسابات نشطة</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a' }}>
                {users.filter((u) => u.Status === 'active').length} مستخدم
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#eff6ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Snowflake size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>حسابات مجمدة (تجميد)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0284c7' }}>
                {users.filter((u) => u.Status === 'frozen').length} مستخدم
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ban size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>حسابات موقوفة (إيقاف)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626' }}>
                {users.filter((u) => u.Status === 'suspended').length} مستخدم
              </div>
            </div>
          </div>
        </div>

        {/* شريط البحث والفلترة */}
        <div className="table-container">
          <div className="table-toolbar">
            <div className="table-toolbar-right" style={{ gap: '10px', flexWrap: 'wrap' }}>
              <div className="table-search" style={{ minWidth: '280px' }}>
                <Search className="table-search-icon" size={16} />
                <input
                  type="text"
                  placeholder="بحث باسم المستخدم، اسم الدخول، أو الهاتف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="form-select"
                style={{ width: '190px', padding: '9px 12px' }}
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="الكل">جميع الأدوار</option>
                <option value="admin">مدير النظام</option>
                <option value="treasury_manager">مدير الخزينة والمخازن</option>
                <option value="storekeeper">أمين خزينة / مخزن</option>
                <option value="viewer">مراقب عام</option>
              </select>

              <select
                className="form-select"
                style={{ width: '160px', padding: '9px 12px' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="الكل">جميع الحالات</option>
                <option value="active">نشط 🟢</option>
                <option value="frozen">مجمد ❄️</option>
                <option value="suspended">موقوف ⛔</option>
              </select>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              إجمالي المستخدمين: {filteredUsers.length}
            </div>
          </div>

          {/* جدول المستخدمين */}
          <table className="data-table">
            <thead>
              <tr>
                <th>اسم المستخدم</th>
                <th>اسم الدخول (Username)</th>
                <th>الدور والصلاحية</th>
                <th>المخزن التابع له</th>
                <th>الهاتف والبريد</th>
                <th>الحالة الحالية</th>
                <th>آخر تسجيل دخول</th>
                <th>الإجراءات والتحكم</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.Id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: 'var(--primary-50)',
                          color: 'var(--primary-600)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                        }}
                      >
                        {user.FullName.charAt(0)}
                      </div>
                      <span style={{ fontWeight: 700 }}>{user.FullName}</span>
                    </div>
                  </td>
                  <td style={{ direction: 'ltr', textAlign: 'right', fontWeight: 600, color: 'var(--primary-700)' }}>
                    @{user.Username}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        user.Role === 'admin'
                          ? 'badge-danger'
                          : user.Role === 'treasury_manager'
                          ? 'badge-primary'
                          : user.Role === 'storekeeper'
                          ? 'badge-success'
                          : 'badge-secondary'
                      }`}
                    >
                      {user.RoleLabel || user.Role}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{user.Warehouse || 'المخزن الرئيسي'}</td>
                  <td>
                    <div style={{ fontSize: '0.82rem' }}>📞 {user.Phone || '-'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.Email}</div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        user.Status === 'active'
                          ? 'badge-success'
                          : user.Status === 'frozen'
                          ? 'badge-info'
                          : 'badge-danger'
                      }`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      {user.Status === 'active' && '🟢 نشط'}
                      {user.Status === 'frozen' && '❄️ مجمد'}
                      {user.Status === 'suspended' && '⛔ موقوف'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.LastLogin || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {/* زر إعادة تعيين كلمة المرور */}
                      <button
                        className="btn btn-secondary btn-sm"
                        title="إعادة تعيين كلمة المرور"
                        onClick={() => handleOpenPasswordReset(user)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <KeyRound size={14} />
                        الباسورد
                      </button>

                      {/* أزرار تجميد / إيقاف / تنشيط */}
                      {user.Status === 'active' ? (
                        <>
                          <button
                            className="btn btn-sm"
                            title="تجميد الحساب مؤقتاً"
                            onClick={() => handleUpdateStatus(user.Id, 'frozen')}
                            style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '4px 8px' }}
                          >
                            <Snowflake size={14} />
                            تجميد
                          </button>
                          <button
                            className="btn btn-sm"
                            title="إيقاف الحساب نهائياً"
                            onClick={() => handleUpdateStatus(user.Id, 'suspended')}
                            style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '4px 8px' }}
                          >
                            <Ban size={14} />
                            إيقاف
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-sm"
                          title="إعادة تفعيل الحساب"
                          onClick={() => handleUpdateStatus(user.Id, 'active')}
                          style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '4px 8px' }}
                        >
                          <CheckCircle2 size={14} />
                          تفعيل
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🔑 مودال إعادة تعيين وتوليد كلمة المرور (أداة الباسورد) */}
      {/* ========================================================================= */}
      {showPasswordModal && selectedUserForPass && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" style={{ maxWidth: '500px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={22} style={{ color: 'var(--primary-600)' }} />
                <div>
                  <h3 className="modal-title">إعادة تعيين كلمة المرور</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                    للمستخدم: {selectedUserForPass.FullName} (@{selectedUserForPass.Username})
                  </p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowPasswordModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                تم توليد كلمة مرور مؤقتة آمنة للمستخدم. يمكنك نسخها وتسليمها له فوراً:
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#f8fafc',
                  border: '2px dashed var(--primary-400)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                }}
              >
                <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '2px', color: 'var(--primary-700)', direction: 'ltr' }}>
                  {generatedPassword}
                </span>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    title="توليد كلمة مرور أخرى"
                    onClick={() => setGeneratedPassword(generateNewPassword())}
                  >
                    <RefreshCw size={15} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleCopyPassword}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                    {copied ? 'تم النسخ' : 'نسخ'}
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#16a34a', background: '#f0fdf4', padding: '8px 12px', borderRadius: '6px' }}>
                ✓ سيُطلب من المستخدم تغيير كلمة المرور عند أول تسجيل دخول قادم.
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={() => {
                  alert(`تم تحديث كلمة مرور المستخدم ${selectedUserForPass.FullName} بنجاح!`);
                  setShowPasswordModal(false);
                }}
              >
                حفظ واعتماد التعيين
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 👤 مودال إضافة مستخدم جديد */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" style={{ maxWidth: '600px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">إضافة مستخدم جديد للنظام</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  تحديد الدور (مدير النظام، مدير الخزينة، أمين المخزن) والمخزن التابع له
                </p>
              </div>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">الاسم الكامل للمستخدم</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="الاسم الثلاثي واللقب"
                    value={newUser.FullName}
                    onChange={(e) => setNewUser({ ...newUser, FullName: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">اسم الدخول (Username)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="اسم المستخدم بالإنجليزية"
                      value={newUser.Username}
                      onChange={(e) => setNewUser({ ...newUser, Username: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">الدور والصلاحيات</label>
                    <select
                      className="form-select"
                      value={newUser.Role}
                      onChange={(e) => setNewUser({ ...newUser, Role: e.target.value as UserRole })}
                    >
                      <option value="storekeeper">أمين خزينة / مخزن (استلام وصرف)</option>
                      <option value="treasury_manager">مدير الخزينة والمخازن</option>
                      <option value="admin">مدير النظام (Admin)</option>
                      <option value="viewer">مراقب عام (عرض فقط)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">رقم الهاتف</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="09XXXXXXXX"
                      value={newUser.Phone}
                      onChange={(e) => setNewUser({ ...newUser, Phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">المخزن التابع له</label>
                    <select
                      className="form-select"
                      value={newUser.Warehouse}
                      onChange={(e) => setNewUser({ ...newUser, Warehouse: e.target.value })}
                    >
                      {initialWarehouses.map((wh) => (
                        <option key={wh.Id} value={wh.Name}>
                          {wh.Name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">البريد الإلكتروني</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="user@blood-bank.gov.ly"
                    value={newUser.Email}
                    onChange={(e) => setNewUser({ ...newUser, Email: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  إنشاء الحساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
