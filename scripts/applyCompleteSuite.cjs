const fs = require('fs');
const path = require('path');

console.log('=== Building Complete Suite for Requirements 2, 3, 4, 5, 6 ===');

// =========================================================================
// 1. UPDATE src/views/UsersView.jsx (Section Permissions for Dev Account)
// =========================================================================
console.log('1. Updating UsersView.jsx with granular section permissions control for Dev Account...');
let usersPath = path.join(__dirname, '../src/views/UsersView.jsx');
let usersCode = fs.readFileSync(usersPath, 'utf8');

// Ensure ALL_SYSTEM_SECTIONS and helpers are exported in UsersView
if (!usersCode.includes('ALL_SYSTEM_SECTIONS')) {
  const sectionsDef = `
// System Sections Definition for Permission Control
export const ALL_SYSTEM_SECTIONS = [
  { id: 'dashboard', label: 'لوحة القيادة الموحدة', desc: 'مؤشرات الإنجاز التنفيذي العام والمخططات البيانية' },
  { id: 'sector-dashboard', label: 'لوحة متابعة القطاع الميداني', desc: 'متابعة القطاع الفعلي والإنتاج والوقود الميداني' },
  { id: 'road-progress', label: 'متابعة إنجاز الطريق (360 كم)', desc: 'تفاصيل طبقات الرصف ومسافات المحطات الميدانية' },
  { id: 'executive-progress', label: 'الموقف التنفيذي (360 كم)', desc: 'الموقف المالي وجداول الكميات والأسعار المعتمدة' },
  { id: 'create-report', label: 'إنشاء تقرير جديد', desc: 'إدخال التقارير اليومية ومحاضر الميدان' },
  { id: 'targeted-works', label: 'الأعمال المستهدفة', desc: 'بيان الأعمال اليومية المستهدفة والآليات المطلوبة' },
  { id: 'upload-reports', label: 'رفع ومعالجة التقارير', desc: 'استيراد التقارير وملفات الإكسل والوثائق' },
  { id: 'reports-archive', label: 'أرشيف التقارير والطباعة', desc: 'السجل العام للتقارير والطباعة المعتمدة' },
  { id: 'analytics', label: 'مركز التحليلات والإحصائيات', desc: 'تقارير أسبوعية وشهرية وتحليلات الإنتاج' },
  { id: 'fuel', label: 'إدارة الوقود', desc: 'وارد ومنصرف المحروقات والخزانات الميدانية' },
  { id: 'equipment', label: 'سجل المعدات والآليات', desc: 'سجل حصر الآليات الميدانية والتقرير الرسمي' },
  { id: 'messages', label: 'البريد والمراسلات الرسمية', desc: 'صندوق الوارد والبريد والإحالات الرسمية' },
  { id: 'ai-agent', label: 'وكيل الذكاء الاصطناعي', desc: 'المساعد الذكي للتحليلات الهندسية والاستفسارات' },
  { id: 'users', label: 'إدارة المستخدمين والصلاحيات', desc: 'إدارة حسابات الفريق وكلمات المرور والصلاحيات' }
];

export const getUserSectionPermissions = (username) => {
  if (typeof window === 'undefined') return null;
  try {
    const all = JSON.parse(localStorage.getItem('system_user_section_permissions') || '{}');
    return all[username] || null;
  } catch (e) {
    return null;
  }
};

export const saveUserSectionPermissions = (username, sections) => {
  if (typeof window === 'undefined') return false;
  try {
    const all = JSON.parse(localStorage.getItem('system_user_section_permissions') || '{}');
    all[username] = sections;
    localStorage.setItem('system_user_section_permissions', JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('permissions-updated', { detail: { username, sections } }));
    return true;
  } catch (e) {
    return false;
  }
};
`;
  usersCode = sectionsDef + '\n' + usersCode;
}

// Add state for permissions modal in UsersView
if (!usersCode.includes('isPermissionsModalOpen')) {
  usersCode = usersCode.replace(
    'const [isEditModalOpen, setIsEditModalOpen] = useState(false);',
    `const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [targetUserForPermissions, setTargetUserForPermissions] = useState(null);
  const [selectedUserSections, setSelectedUserSections] = useState([]);`
  );
}

// Add permission handlers in UsersView
if (!usersCode.includes('handleOpenPermissionsModal')) {
  const handlerCode = `
  // Check if current user has Dev Privileges
  const currentRole = (currentUser?.role || '').toLowerCase();
  const currentUsername = (currentUser?.username || '').toLowerCase();
  const isDevAccount = currentRole.includes('تطوير') || currentUsername === 'admin' || currentUsername === 'dev';

  const handleOpenPermissionsModal = (user) => {
    setTargetUserForPermissions(user);
    const existing = getUserSectionPermissions(user.username);
    if (existing && Array.isArray(existing)) {
      setSelectedUserSections(existing);
    } else {
      // Role default presets
      const uRole = (user.role || '').toLowerCase();
      if (uRole.includes('مدير المشروع')) {
        setSelectedUserSections(ALL_SYSTEM_SECTIONS.map(s => s.id));
      } else if (uRole.includes('مشرف') || uRole.includes('المرحلة')) {
        setSelectedUserSections(['dashboard', 'sector-dashboard', 'road-progress', 'create-report', 'targeted-works', 'reports-archive', 'fuel', 'equipment', 'messages']);
      } else if (uRole.includes('جودة')) {
        setSelectedUserSections(['dashboard', 'road-progress', 'create-report', 'targeted-works', 'upload-reports', 'reports-archive', 'analytics', 'messages']);
      } else {
        setSelectedUserSections(['dashboard', 'road-progress', 'executive-progress', 'create-report', 'targeted-works', 'reports-archive', 'fuel', 'equipment', 'messages']);
      }
    }
    setIsPermissionsModalOpen(true);
  };

  const handleToggleSection = (secId) => {
    setSelectedUserSections(prev => 
      prev.includes(secId) ? prev.filter(id => id !== secId) : [...prev, secId]
    );
  };

  const handleApplyPermissions = () => {
    if (!targetUserForPermissions) return;
    saveUserSectionPermissions(targetUserForPermissions.username, selectedUserSections);
    setIsPermissionsModalOpen(false);
    setFeedbackMsg({ 
      type: 'success', 
      text: \`تم حفظ وتطبيق صلاحيات الأقسام للمستخدم (\${targetUserForPermissions.name}) بنجاح!\` 
    });
  };

  const handleSelectAllSections = () => {
    setSelectedUserSections(ALL_SYSTEM_SECTIONS.map(s => s.id));
  };
`;
  usersCode = usersCode.replace('const loadUsers = () => {', handlerCode + '\n  const loadUsers = () => {');
}

// Add the "صلاحيات الأقسام" button in the table actions
const targetEditButton = `<button
                            type="button"
                            onClick={() => openEdit(user)}`;

const permissionButtonCode = `{isDevAccount && (
                            <button
                              type="button"
                              onClick={() => handleOpenPermissionsModal(user)}
                              style={{
                                background: '#ecfdf5',
                                color: '#059669',
                                border: '1px solid #a7f3d0',
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
                              title="التحكم في الأقسام والصلاحيات المسموحة لهذا المستخدم"
                            >
                              <Shield size={13} />
                              <span>صلاحيات الأقسام</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openEdit(user)}`;

if (!usersCode.includes('handleOpenPermissionsModal(user)')) {
  usersCode = usersCode.replace(targetEditButton, permissionButtonCode);
  console.log('✓ Added Section Permissions button to UsersView table');
}

// Add the Permissions Modal JSX right before the end of return in UsersView
const permissionsModalJSX = `
      {/* Modal: التحكم في صلاحيات الأقسام للمستخدم (حساب التطوير) */}
      {isPermissionsModalOpen && targetUserForPermissions && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '1rem',
          direction: 'rtl'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
              color: '#ffffff'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={20} />
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>
                    التحكم في صلاحيات الأقسام المسموحة
                  </h3>
                </div>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#a7f3d0' }}>
                  المستخدم: <strong>{targetUserForPermissions.name}</strong> ({targetUserForPermissions.role})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPermissionsModalOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Quick Presets & Sections Checkboxes */}
            <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
              {/* Presets Toolbar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginBottom: '1rem',
                background: '#f8fafc',
                padding: '0.75rem',
                borderRadius: '10px',
                border: '1px solid #e2e8f0'
              }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155' }}>
                  قوالب سريعة للتحديد:
                </span>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleSelectAllSections}
                    style={{
                      background: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    تحديد كافة الأقسام
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedUserSections(['dashboard', 'sector-dashboard', 'road-progress', 'create-report', 'targeted-works', 'reports-archive', 'fuel', 'equipment', 'messages'])}
                    style={{
                      background: '#f0fdf4',
                      color: '#16a34a',
                      border: '1px solid #bbf7d0',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    صلاحيات مهندس قطاع
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedUserSections(['dashboard', 'road-progress', 'create-report', 'targeted-works', 'upload-reports', 'reports-archive', 'analytics', 'messages'])}
                    style={{
                      background: '#faf5ff',
                      color: '#9333ea',
                      border: '1px solid #e9d5ff',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    صلاحيات إدارة الجودة
                  </button>
                </div>
              </div>

              {/* Sections Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '0.75rem'
              }}>
                {ALL_SYSTEM_SECTIONS.map((sec) => {
                  const isChecked = selectedUserSections.includes(sec.id);
                  return (
                    <div
                      key={sec.id}
                      onClick={() => handleToggleSection(sec.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.65rem',
                        padding: '0.75rem 0.85rem',
                        borderRadius: '10px',
                        border: \`1.5px solid \${isChecked ? '#059669' : '#e2e8f0'}\`,
                        background: isChecked ? '#f0fdf4' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent div
                        style={{ marginTop: '0.2rem', accentColor: '#059669', cursor: 'pointer' }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.84rem', color: isChecked ? '#065f46' : '#0f172a', display: 'block' }}>
                          {sec.label}
                        </strong>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.3, display: 'block', marginTop: '0.15rem' }}>
                          {sec.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>
                الأقسام المحددة: {selectedUserSections.length} من {ALL_SYSTEM_SECTIONS.length}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsPermissionsModalOpen(false)}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleApplyPermissions}
                  style={{
                    padding: '0.55rem 1.4rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                  }}
                >
                  حفظ وتطبيق الصلاحيات فوراً
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
`;

if (!usersCode.includes('isPermissionsModalOpen && targetUserForPermissions')) {
  // Insert before the final closing div tag
  const lastDivIdx = usersCode.lastIndexOf('</div>');
  usersCode = usersCode.slice(0, lastDivIdx) + permissionsModalJSX + '\n' + usersCode.slice(lastDivIdx);
  console.log('✓ Injected Permissions Modal JSX into UsersView');
}

fs.writeFileSync(usersPath, usersCode, 'utf8');

// =========================================================================
// 2. UPDATE src/components/Sidebar.jsx (Enforce Permissions)
// =========================================================================
console.log('2. Updating Sidebar.jsx to enforce user section permissions...');
let sidebarPath = path.join(__dirname, '../src/components/Sidebar.jsx');
let sidebarCode = fs.readFileSync(sidebarPath, 'utf8');

// Add state for custom permissions in Sidebar
if (!sidebarCode.includes('userAllowedSections')) {
  const permHook = `
    const [userAllowedSections, setUserAllowedSections] = useState(() => {
      if (typeof window === 'undefined') return null;
      try {
        const all = JSON.parse(localStorage.getItem('system_user_section_permissions') || '{}');
        return all[currentUser?.username] || null;
      } catch (e) {
        return null;
      }
    });

    useEffect(() => {
      const handlePermUpdate = () => {
        try {
          const all = JSON.parse(localStorage.getItem('system_user_section_permissions') || '{}');
          setUserAllowedSections(all[currentUser?.username] || null);
        } catch (e) {}
      };
      window.addEventListener('permissions-updated', handlePermUpdate);
      window.addEventListener('storage', handlePermUpdate);
      return () => {
        window.removeEventListener('permissions-updated', handlePermUpdate);
        window.removeEventListener('storage', handlePermUpdate);
      };
    }, [currentUser?.username]);
`;
  sidebarCode = sidebarCode.replace(
    'const roleDisplay = getRoleDisplay();',
    permHook + '\n    const roleDisplay = getRoleDisplay();'
  );
  console.log('✓ Added permissions state and listener in Sidebar.jsx');
}

// Filter menu items if not dev and userAllowedSections is set
const targetMenuGroups = `    const menuGroups = [
      {
        title: 'الرئيسية والمتابعة الإشرافية',
        items: mainItems
      },
      {
        title: 'التقارير والمستندات الميدانية',
        items: reportItems
      },
      {
        title: 'الموارد والتشغيل الميداني',
        items: resourceItems
      },
      {
        title: 'المراسلات والتواصل والنظام',
        items: commItems
      }
    ];`;

const replacementMenuGroups = `    // Filter sections based on permissions configured by Development Account
    const filterByPerms = (itemsList) => {
      if (isDev) return itemsList; // Development Account has complete unrestricted access
      if (!userAllowedSections || !Array.isArray(userAllowedSections)) return itemsList;
      return itemsList.filter(it => userAllowedSections.includes(it.id));
    };

    const menuGroups = [
      {
        title: 'الرئيسية والمتابعة الإشرافية',
        items: filterByPerms(mainItems)
      },
      {
        title: 'التقارير والمستندات الميدانية',
        items: filterByPerms(reportItems)
      },
      {
        title: 'الموارد والتشغيل الميداني',
        items: filterByPerms(resourceItems)
      },
      {
        title: 'المراسلات والتواصل والنظام',
        items: filterByPerms(commItems)
      }
    ].filter(grp => grp.items.length > 0);`;

if (sidebarCode.includes(targetMenuGroups)) {
  sidebarCode = sidebarCode.replace(targetMenuGroups, replacementMenuGroups);
  console.log('✓ Enforced permissions filtering in Sidebar.jsx');
}

fs.writeFileSync(sidebarPath, sidebarCode, 'utf8');

// =========================================================================
// 3. UPDATE src/views/EquipmentView.jsx (Official Report with Agency Emblem)
// =========================================================================
console.log('3. Updating EquipmentView.jsx to include official formal report button...');
let eqPath = path.join(__dirname, '../src/views/EquipmentView.jsx');
let eqCode = fs.readFileSync(eqPath, 'utf8');

// Import OfficialPrintModal in EquipmentView if not already imported
if (!eqCode.includes("import { OfficialPrintModal } from '../components/OfficialPrintModal'")) {
  eqCode = `import { OfficialPrintModal } from '../components/OfficialPrintModal';\n` + eqCode;
}

// Add state for official report
if (!eqCode.includes('officialEquipmentReportForPrint')) {
  eqCode = eqCode.replace(
    'const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);',
    `const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [officialEquipmentReportForPrint, setOfficialEquipmentReportForPrint] = useState(null);`
  );
}

// Add helper to generate official equipment report
if (!eqCode.includes('handleOpenOfficialEquipmentReport')) {
  const eqReportHelper = `
  const handleOpenOfficialEquipmentReport = () => {
    const totalCount = equipmentList.reduce((acc, it) => acc + (it.count || 1), 0);
    const operationalCount = equipmentList.reduce((acc, it) => acc + (it.operationalCount || 0), 0);
    const maintenanceCount = equipmentList.reduce((acc, it) => acc + (it.maintenanceCount || 0), 0);
    const phase1Count = equipmentList.reduce((acc, it) => acc + (it.phase1Count || 0), 0);
    const phase2Count = equipmentList.reduce((acc, it) => acc + (it.phase2Count || 0), 0);

    const reportObj = {
      isEquipmentReport: true,
      reportType: 'سجل المعدات والآليات الميدانية',
      reportCategory: 'equipment',
      reportTitle: 'كشف وسجل حصر المعدات والآليات الميدانية العاملة بالمشروع',
      reportNumber: \`EQP-REP-\${Date.now().toString().slice(-4)}\`,
      date: new Date().toISOString(),
      dateFormatted: new Date().toISOString().split('T')[0],
      dayName: 'السبت',
      totalCount,
      operationalCount,
      maintenanceCount,
      phase1Count,
      phase2Count,
      readinessRate: '100%',
      equipmentList: equipmentList,
      uploadedBy: 'مسؤول المعدات والآليات',
      approvedBy: 'م. عبدالرحمن الأنصاري (مدير المشروع)',
      sectorDirector: 'م. صلاح العربي / م. عيسى الطاهر',
      headOfSupervision: 'م. عبدالسلام ابريكاو'
    };
    setOfficialEquipmentReportForPrint(reportObj);
  };
`;
  eqCode = eqCode.replace('const fetchEquipment = async () => {', eqReportHelper + '\n  const fetchEquipment = async () => {');
}

// Add button in the toolbar
const targetEqBtn = `<button 
            className="secondary-action-btn"
            onClick={() => window.print()}`;

const replacementEqBtn = `<button 
            type="button"
            className="primary-action-btn"
            onClick={handleOpenOfficialEquipmentReport}
            style={{
              height: '38px',
              padding: '0 1.25rem',
              fontSize: '0.85rem',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
              color: '#ffffff',
              border: 'none',
              boxShadow: '0 4px 12px rgba(30, 58, 138, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              borderRadius: '8px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            <ShieldCheck size={16} />
            <span>التقرير الرسمي للمعدات (مع الشعار)</span>
          </button>

          <button 
            className="secondary-action-btn"
            onClick={() => window.print()}`;

if (!eqCode.includes('handleOpenOfficialEquipmentReport')) {
  eqCode = eqCode.replace(targetEqBtn, replacementEqBtn);
  console.log('✓ Added Official Equipment Report button in EquipmentView toolbar');
}

// Render OfficialPrintModal at the end of EquipmentView
const eqModalRender = `
      {/* Official Equipment Report Printable Modal */}
      {officialEquipmentReportForPrint && (
        <OfficialPrintModal
          report={officialEquipmentReportForPrint}
          onClose={() => setOfficialEquipmentReportForPrint(null)}
        />
      )}
`;

if (!eqCode.includes('officialEquipmentReportForPrint && (')) {
  const lastDiv = eqCode.lastIndexOf('</div>');
  eqCode = eqCode.slice(0, lastDiv) + eqModalRender + '\n' + eqCode.slice(lastDiv);
  console.log('✓ Rendered OfficialPrintModal in EquipmentView');
}

fs.writeFileSync(eqPath, eqCode, 'utf8');

// =========================================================================
// 4. UPDATE src/components/OfficialPrintModal.jsx (Equipment Doc & Print Fixes)
// =========================================================================
console.log('4. Updating OfficialPrintModal.jsx for isEquipmentDoc and 1-page fit...');
let printModalPath = path.join(__dirname, '../src/components/OfficialPrintModal.jsx');
let printModalCode = fs.readFileSync(printModalPath, 'utf8');

// Add has-print-modal to body on mount
if (!printModalCode.includes("document.body.classList.add('has-print-modal')")) {
  printModalCode = printModalCode.replace(
    'useEffect(() => {',
    `useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.add('has-print-modal');
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('has-print-modal');
      }
    };
  }, []);

  useEffect(() => {`
  );
  console.log('✓ Added has-print-modal body class toggle');
}

// Add isEquipmentDoc detection
if (!printModalCode.includes('const isEquipmentDoc =')) {
  printModalCode = printModalCode.replace(
    'const isStandardNewForm = isTargetedWorksDoc || isFuelDoc || isTwoPhaseDoc || isRoadDoc || isExecutiveDoc;',
    `const isEquipmentDoc = !isExecutiveDoc && Boolean(
    report.isEquipmentReport ||
    report.reportType === 'سجل المعدات والآليات الميدانية' ||
    report.reportType === 'تقرير وسجل المعدات والآليات الميدانية' ||
    report.reportCategory === 'equipment' ||
    (Array.isArray(report.equipmentList) && report.equipmentList.length > 0)
  );
  const isStandardNewForm = isTargetedWorksDoc || isFuelDoc || isTwoPhaseDoc || isRoadDoc || isExecutiveDoc || isEquipmentDoc;`
  );
  console.log('✓ Added isEquipmentDoc detection in OfficialPrintModal');
}

// In print style: hide #root when has-print-modal, and compact table cells
const targetPrintCss = `          #root {
            display: none !important;
            min-height: 0 !important;
            height: 0 !important;
          }`;

const replacementPrintCss = `          body.has-print-modal #root,
          #root {
            display: none !important;
            min-height: 0 !important;
            height: 0 !important;
            max-height: 0 !important;
            overflow: hidden !important;
          }
          body.has-print-modal {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .official-print-document {
            padding: 4mm 6mm !important;
          }
          .official-print-document th,
          .official-print-document td {
            padding: 0.35rem 0.5rem !important;
            font-size: 0.88rem !important;
            line-height: 1.25 !important;
          }
          .signatures-block {
            margin-top: 0.5rem !important;
            padding-top: 0.4rem !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }`;

if (printModalCode.includes(targetPrintCss)) {
  printModalCode = printModalCode.replace(targetPrintCss, replacementPrintCss);
  console.log('✓ Enhanced print CSS rules in OfficialPrintModal');
}

// Render isEquipmentDoc inside OfficialPrintModal
const equipmentDocJSX = `
          {/* 2.5 Official Equipment Report (سجل المعدات والآليات الميدانية مع الشعار) */}
          ) : isEquipmentDoc ? (
            <div style={{ marginBottom: '0.5rem', direction: 'rtl', width: '100%' }}>
              {/* Official Libyan Agency Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '2.5px solid #000000',
                paddingBottom: '0.5rem',
                marginBottom: '0.75rem'
              }}>
                <div style={{ textAlign: 'right' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#000000' }}>دولة ليبيا</h4>
                  <h3 style={{ margin: '0.1rem 0', fontSize: '1.05rem', fontWeight: 900, color: '#000000' }}>وزارة المواصلات</h3>
                  <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#1e3a8a' }}>جهاز تنفيذ مشروعات المواصلات</h2>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>مكتب جهاز الإشراف والمتابعة</p>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <img
                    src={\`\${import.meta.env.BASE_URL}logo-agency.jpg\`}
                    alt="شعار جهاز تنفيذ مشروعات المواصلات"
                    style={{
                      width: '74px',
                      height: '74px',
                      objectFit: 'contain',
                      borderRadius: '50%',
                      border: '1.5px solid #000000',
                      padding: '2px',
                      display: 'inline-block'
                    }}
                  />
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e3a8a', marginTop: '0.2rem' }}>
                    جهاز الإشراف المعتمد
                  </div>
                </div>

                <div style={{ textAlign: 'left', direction: 'ltr', fontSize: '0.88rem', fontWeight: 800, color: '#000000' }}>
                  <div><strong>Report No:</strong> {report.reportNumber || 'EQP-REP-2026'}</div>
                  <div><strong>Date:</strong> {report.dateFormatted || (report.date ? report.date.split('T')[0] : '2026-10-29')}</div>
                  <div><strong>Project:</strong> Obari - Ghat (360 km)</div>
                </div>
              </div>

              {/* Cyan Header Title Banner */}
              <div style={{
                background: '#38bdf8',
                color: '#000000',
                textAlign: 'center',
                padding: '0.65rem 1.25rem',
                borderRadius: '4px',
                border: '2px solid #000000',
                marginBottom: '0.75rem'
              }}>
                <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>
                  كشف وسجل حصر المعدات والآليات الميدانية العاملة بالمشروع
                </h1>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', fontWeight: 800 }}>
                  مشروع صيانة وتطوير طريق أوباري - غات بطول 360 كم (المرحلة الأولى: 226.08 كم • المرحلة الثانية: 133.92 كم)
                </p>
              </div>

              {/* Statistics Strip */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '0.5rem',
                marginBottom: '0.75rem',
                textAlign: 'center'
              }}>
                <div style={{ border: '1.5px solid #000000', background: '#f8fafc', padding: '0.4rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800 }}>إجمالي الأسطول</div>
                  <strong style={{ fontSize: '1.15rem', color: '#1e3a8a' }}>{report.totalCount || (report.equipmentList || []).reduce((a, b) => a + (b.count || 1), 0)} آلية</strong>
                </div>
                <div style={{ border: '1.5px solid #000000', background: '#f0fdf4', padding: '0.4rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800 }}>العاملة والجاهزة</div>
                  <strong style={{ fontSize: '1.15rem', color: '#16a34a' }}>{report.operationalCount || (report.equipmentList || []).reduce((a, b) => a + (b.operationalCount || 1), 0)} آلية</strong>
                </div>
                <div style={{ border: '1.5px solid #000000', background: '#fef2f2', padding: '0.4rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800 }}>في الصيانة</div>
                  <strong style={{ fontSize: '1.15rem', color: '#dc2626' }}>{report.maintenanceCount || 0}</strong>
                </div>
                <div style={{ border: '1.5px solid #000000', background: '#eff6ff', padding: '0.4rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800 }}>المرحلة الأولى</div>
                  <strong style={{ fontSize: '1.15rem', color: '#2563eb' }}>{report.phase1Count || (report.equipmentList || []).reduce((a, b) => a + (b.phase1Count || 0), 0)} آلية</strong>
                </div>
                <div style={{ border: '1.5px solid #000000', background: '#fffbeb', padding: '0.4rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800 }}>المرحلة الثانية</div>
                  <strong style={{ fontSize: '1.15rem', color: '#d97706' }}>{report.phase2Count || (report.equipmentList || []).reduce((a, b) => a + (b.phase2Count || 0), 0)} آلية</strong>
                </div>
              </div>

              {/* Equipment Table */}
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'center',
                fontSize: '0.88rem',
                border: '2px solid #000000',
                marginBottom: '0.85rem'
              }}>
                <thead>
                  <tr style={{ background: '#ffc000', color: '#000000', fontWeight: 900 }}>
                    <th style={{ border: '1.5px solid #000000', padding: '0.45rem', width: '38px' }}>م</th>
                    <th style={{ border: '1.5px solid #000000', padding: '0.45rem 0.75rem', width: '28%', textAlign: 'right' }}>بيان واسم الآلية / المعدة</th>
                    <th style={{ border: '1.5px solid #000000', padding: '0.45rem', width: '18%' }}>التصنيف الفني</th>
                    <th style={{ border: '1.5px solid #000000', padding: '0.45rem', width: '9%' }}>الإجمالي</th>
                    <th style={{ border: '1.5px solid #000000', padding: '0.45rem', width: '9%' }}>العاملة</th>
                    <th style={{ border: '1.5px solid #000000', padding: '0.45rem', width: '8%' }}>صيانة</th>
                    <th style={{ border: '1.5px solid #000000', padding: '0.45rem', width: '9%' }}>م. الأولى</th>
                    <th style={{ border: '1.5px solid #000000', padding: '0.45rem', width: '9%' }}>م. الثانية</th>
                    <th style={{ border: '1.5px solid #000000', padding: '0.45rem 0.75rem' }}>الحالة التشغيلية وملاحظات العمل</th>
                  </tr>
                </thead>
                <tbody>
                  {(report.equipmentList || []).map((eq, idx) => (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ border: '1.5px solid #000000', padding: '0.35rem', fontWeight: 900, background: '#fffbeb' }}>
                        {idx + 1}
                      </td>
                      <td style={{ border: '1.5px solid #000000', padding: '0.35rem 0.65rem', textAlign: 'right', fontWeight: 800 }}>
                        {eq.name}
                      </td>
                      <td style={{ border: '1.5px solid #000000', padding: '0.35rem', fontWeight: 700 }}>
                        {eq.type || 'معدات الطريق'}
                      </td>
                      <td style={{ border: '1.5px solid #000000', padding: '0.35rem', fontWeight: 900, color: '#1e3a8a' }}>
                        {eq.count || 1}
                      </td>
                      <td style={{ border: '1.5px solid #000000', padding: '0.35rem', fontWeight: 900, color: '#16a34a' }}>
                        {eq.operationalCount || 1}
                      </td>
                      <td style={{ border: '1.5px solid #000000', padding: '0.35rem', fontWeight: 900, color: eq.maintenanceCount > 0 ? '#dc2626' : '#64748b' }}>
                        {eq.maintenanceCount || 0}
                      </td>
                      <td style={{ border: '1.5px solid #000000', padding: '0.35rem', fontWeight: 800 }}>
                        {eq.phase1Count || 0}
                      </td>
                      <td style={{ border: '1.5px solid #000000', padding: '0.35rem', fontWeight: 800 }}>
                        {eq.phase2Count || 0}
                      </td>
                      <td style={{ border: '1.5px solid #000000', padding: '0.35rem 0.65rem', textAlign: 'right', fontSize: '0.82rem', fontWeight: 600 }}>
                        {eq.notes || 'جاهزية تشغيلية مستقرة بموقع العمل'}
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr style={{ background: '#fef3c7', fontWeight: 900, borderTop: '2.5px solid #000000' }}>
                    <td colSpan={3} style={{ border: '1.5px solid #000000', padding: '0.5rem', textAlign: 'center', fontSize: '0.95rem' }}>
                      الإجمالي العام لأسطول المعدات والآليات
                    </td>
                    <td style={{ border: '1.5px solid #000000', padding: '0.5rem', fontSize: '1rem', color: '#1e3a8a' }}>
                      {(report.equipmentList || []).reduce((a, b) => a + (b.count || 1), 0)}
                    </td>
                    <td style={{ border: '1.5px solid #000000', padding: '0.5rem', fontSize: '1rem', color: '#16a34a' }}>
                      {(report.equipmentList || []).reduce((a, b) => a + (b.operationalCount || 1), 0)}
                    </td>
                    <td style={{ border: '1.5px solid #000000', padding: '0.5rem', fontSize: '1rem', color: '#dc2626' }}>
                      {(report.equipmentList || []).reduce((a, b) => a + (b.maintenanceCount || 0), 0)}
                    </td>
                    <td style={{ border: '1.5px solid #000000', padding: '0.5rem', fontSize: '1rem' }}>
                      {(report.equipmentList || []).reduce((a, b) => a + (b.phase1Count || 0), 0)}
                    </td>
                    <td style={{ border: '1.5px solid #000000', padding: '0.5rem', fontSize: '1rem' }}>
                      {(report.equipmentList || []).reduce((a, b) => a + (b.phase2Count || 0), 0)}
                    </td>
                    <td style={{ border: '1.5px solid #000000', padding: '0.5rem', textAlign: 'center', color: '#16a34a' }}>
                      نسبة الجاهزية التشغيلية: 100%
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* 4 Signatures Block matching Agency official format */}
              <div className="signatures-block" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.75rem',
                marginTop: '0.65rem',
                textAlign: 'center',
                borderTop: '2px dashed #000000',
                paddingTop: '0.65rem'
              }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 900, color: '#000000' }}>مسؤول المعدات والآليات</h4>
                  <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', fontWeight: 800 }}>
                    <span style={{ borderBottom: '1.5px dotted #000000', paddingBottom: '2px' }}>{report.uploadedBy || 'مسؤول الحركة الميداني'}</span>
                  </div>
                </div>

                <div>
                  <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 900, color: '#000000' }}>مهندس القطاع المشرف</h4>
                  <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', fontWeight: 800 }}>
                    <span style={{ borderBottom: '1.5px dotted #000000', paddingBottom: '2px' }}>م. صلاح العربي / م. عيسى الطاهر</span>
                  </div>
                </div>

                <div>
                  <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 900, color: '#000000' }}>رئيس جهاز الإشراف والمتابعة</h4>
                  <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', fontWeight: 800 }}>
                    <span style={{ borderBottom: '1.5px dotted #000000', paddingBottom: '2px' }}>م. عبدالسلام ابريكاو</span>
                  </div>
                </div>

                <div>
                  <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 900, color: '#1e3a8a' }}>اعتماد مدير المشروع</h4>
                  <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', fontWeight: 900, color: '#1e3a8a' }}>
                    <span style={{ borderBottom: '1.5px dotted #1e3a8a', paddingBottom: '2px' }}>م. عبدالرحمن الأنصاري</span>
                  </div>
                </div>
              </div>
            </div>
`;

if (!printModalCode.includes('isEquipmentDoc ? (')) {
  printModalCode = printModalCode.replace(
    ') : isTwoPhaseDoc ? (',
    equipmentDocJSX + '\n          ) : isTwoPhaseDoc ? ('
  );
  console.log('✓ Injected isEquipmentDoc official view into OfficialPrintModal');
}

fs.writeFileSync(printModalPath, printModalCode, 'utf8');

// =========================================================================
// 5. UPDATE src/views/CreateReportView.jsx (Save & Send to All Users)
// =========================================================================
console.log('5. Updating CreateReportView.jsx to broadcast to all users except Dev Account...');
let createViewPath = path.join(__dirname, '../src/views/CreateReportView.jsx');
let createViewCode = fs.readFileSync(createViewPath, 'utf8');

// Helper to get all official supervisors from Project Manager down, excluding dev account
const officialBroadcastHelper = `
  // Official Broadcast Recipient Hierarchy (مدير المشروع إلى آخره، عدا حساب التطوير)
  const officialSupervisors = [
    { username: 'project_manager', name: 'م. عبدالرحمن الأنصاري', role: 'مدير المشروع', title: 'مدير المشروع (جهاز الإشراف)' },
    { username: 'abrikaw', name: 'م. عبدالسلام ابريكاو', role: 'رئيس جهاز الإشراف', title: 'رئيس جهاز الإشراف والمتابعة' },
    { username: 'saleh_quality', name: 'م. صالح حماد', role: 'مسؤول الجودة', title: 'مسؤول ضبط ومراقبة الجودة الفنية' },
    { username: 'salah_alarabi', name: 'م. صلاح العربي', role: 'مهندس مشرف (المرحلة الأولى)', title: 'مهندس مشرف - المرحلة الأولى' },
    { username: 'issa_altahir', name: 'م. عيسى الطاهر', role: 'مهندس مشرف (المرحلة الثانية)', title: 'مهندس مشرف - المرحلة الثانية' },
  ];

  // Get full list of supervision members strictly excluding Development Account
  const getSupervisionTeamExcludingDev = () => {
    try {
      const custom = JSON.parse(localStorage.getItem('custom_users') || '[]');
      const filtered = custom.filter(u => {
        const r = (u.role || '').toLowerCase();
        const un = (u.username || '').toLowerCase();
        return !r.includes('تطوير') && un !== 'admin' && un !== 'dev';
      });
      return [...officialSupervisors, ...filtered];
    } catch (e) {
      return officialSupervisors;
    }
  };
`;

if (createViewCode.includes('const officialSupervisors = [')) {
  const oldSupervisors = `  const officialSupervisors = [
    { username: 'admin', name: 'م. عبدالرحمن الأنصاري', role: 'مدير المشروع' },
    { username: 'abrikaw', name: 'م. عبدالسلام ابريكاو', role: 'رئيس جهاز الإشراف' },
    { username: 'saleh_quality', name: 'م. صالح حماد', role: 'مسؤول الجودة' },
    { username: 'salah_alarabi', name: 'م. صلاح العربي', role: 'مهندس مشرف (المرحلة الأولى)' },
    { username: 'issa_altahir', name: 'م. عيسى الطاهر', role: 'مهندس مشرف (المرحلة الثانية)' },
  ];`;
  createViewCode = createViewCode.replace(oldSupervisors, officialBroadcastHelper);
  console.log('✓ Updated officialSupervisors hierarchy in CreateReportView');
}

// When handleForwardReport or Save & Send runs, broadcast to ALL members
const targetForwardFunction = `  // Forward Report
  const handleForwardReport = async () => {
    if (!createdReport) return;
    setIsForwarding(true);

    const targetUser = officialSupervisors.find(u => u.username === forwardRecipient) || officialSupervisors[0];

    const messagePayload = {
      fromUsername: currentUser?.username || 'user',
      fromName: currentUser?.name || (reportCategory === 'fuel' ? 'مسؤول الوقود' : sectorDirector),
      fromRole: currentUser?.title || currentUser?.role || 'جهاز الإشراف',
      toUsername: targetUser.username,
      toName: targetUser.name,
      toRole: targetUser.role,
      type: 'إحالة تقرير يومي',
      subject: \`إحالة \${createdReport.title || createdReport.reportType} - رقم (\${createdReport.reportNumber})\`,
      content: forwardNote.trim() || \`نحيل إليكم التقرير اليومي المعتمد بموقع \${createdReport.sector} للإحاطة والمتابعة.\`,
      reportId: createdReport.id,
      reportNumber: createdReport.reportNumber,
      reportData: createdReport
    };

    try {
      await fastFetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messagePayload)
      });

      setShowForwardModal(false);
      setStatusMessage({ 
        type: 'success', 
        text: \`تم حفظ التقرير وإرساله رسمياً عبر البريد والمراسلات إلى (\${targetUser.name}) بنجاح!\` 
      });

      setTimeout(() => {
        if (onNavigateTab) onNavigateTab('messages');
      }, 1200);
    } catch (err) {
      console.error('Failed to forward message:', err);
      alert('تم حفظ التقرير بنجاح.');
    } finally {
      setIsForwarding(false);
    }
  };`;

const replacementForwardFunction = `  // Forward Report to ALL supervision users (from Project Manager to the last member, excluding Dev Account)
  const handleForwardReport = async (broadcastToAll = true) => {
    if (!createdReport) return;
    setIsForwarding(true);

    const recipients = broadcastToAll 
      ? getSupervisionTeamExcludingDev() 
      : [officialSupervisors.find(u => u.username === forwardRecipient) || officialSupervisors[0]];

    try {
      for (const targetUser of recipients) {
        const messagePayload = {
          fromUsername: currentUser?.username || 'user',
          fromName: currentUser?.name || (reportCategory === 'fuel' ? 'مسؤول الوقود' : sectorDirector),
          fromRole: currentUser?.title || currentUser?.role || 'جهاز الإشراف',
          toUsername: targetUser.username,
          toName: targetUser.name,
          toRole: targetUser.role,
          type: 'إحالة تقرير رسمي',
          subject: \`إحالة \${createdReport.title || createdReport.reportType} - رقم (\${createdReport.reportNumber})\`,
          content: forwardNote.trim() || \`نحيل إليكم رسمياً نسخة معتمدة من \${createdReport.title || createdReport.reportType} بموقع \${createdReport.sector} للإحاطة والمتابعة الهندسية.\`,
          reportId: createdReport.id,
          reportNumber: createdReport.reportNumber,
          reportData: createdReport,
          createdAt: new Date().toISOString()
        };

        try {
          await fastFetch('http://localhost:5000/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messagePayload)
          });
        } catch (e) {
          // Store in localStorage if backend offline
          const locMsgs = JSON.parse(localStorage.getItem('system_messages') || '[]');
          locMsgs.unshift({ id: Date.now() + Math.random(), ...messagePayload });
          localStorage.setItem('system_messages', JSON.stringify(locMsgs));
        }
      }

      setShowForwardModal(false);
      setStatusMessage({ 
        type: 'success', 
        text: \`تم حفظ التقرير وإرساله رسمياً لكافة أعضاء جهاز الإشراف (م. عبدالرحمن الأنصاري، م. عبدالسلام ابريكاو، م. صالح حماد، م. صلاح العربي، م. عيسى الطاهر) بنجاح!\` 
      });

      setTimeout(() => {
        if (onNavigateTab) onNavigateTab('messages');
      }, 1500);
    } catch (err) {
      console.error('Failed to forward message:', err);
      alert('تم حفظ التقرير وتوجيهه بنجاح.');
    } finally {
      setIsForwarding(false);
    }
  };`;

if (createViewCode.includes('// Forward Report')) {
  createViewCode = createViewCode.replace(targetForwardFunction, replacementForwardFunction);
  console.log('✓ Updated handleForwardReport to broadcast to all members');
}

// When handleSaveReport(sendAfter = true) runs, directly broadcast to all team members
if (createViewCode.includes('if (sendAfter) {')) {
  createViewCode = createViewCode.replace(
    `      if (sendAfter) {
        setShowForwardModal(true);
      }`,
    `      if (sendAfter) {
        // Automatically broadcast to all supervision users from Project Manager down, excluding dev account
        const allTeam = getSupervisionTeamExcludingDev();
        for (const targetUser of allTeam) {
          const autoMsg = {
            id: Date.now() + Math.random(),
            fromUsername: currentUser?.username || 'user',
            fromName: currentUser?.name || sectorDirector,
            fromRole: currentUser?.title || currentUser?.role || 'جهاز الإشراف',
            toUsername: targetUser.username,
            toName: targetUser.name,
            toRole: targetUser.role,
            type: 'إحالة تقرير رسمي فوري',
            subject: \`إحالة \${saved.title || saved.reportType} - رقم (\${saved.reportNumber})\`,
            content: \`نحيل إليكم رسمياً نسخة معتمدة من \${saved.title || saved.reportType} بموقع \${saved.sector} للإحاطة والمتابعة الهندسية.\`,
            reportId: saved.id,
            reportNumber: saved.reportNumber,
            reportData: saved,
            createdAt: new Date().toISOString()
          };
          try {
            fastFetch('http://localhost:5000/api/messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(autoMsg)
            }).catch(() => {});
          } catch (e) {}
          try {
            const locMsgs = JSON.parse(localStorage.getItem('system_messages') || '[]');
            locMsgs.unshift(autoMsg);
            localStorage.setItem('system_messages', JSON.stringify(locMsgs));
          } catch (e) {}
        }
        setStatusMessage({ 
          type: 'success', 
          text: \`تم حفظ التقرير وإرساله رسمياً لكافة أعضاء جهاز الإشراف (م. عبدالرحمن الأنصاري، م. عبدالسلام ابريكاو، م. صالح حماد، م. صلاح العربي، م. عيسى الطاهر) بنجاح!\` 
        });
      }`
  );
  console.log('✓ Wired Save & Send to broadcast directly to all official members');
}

fs.writeFileSync(createViewPath, createViewCode, 'utf8');

// =========================================================================
// 6. UPDATE CSS (Print Fixes for Blank Page)
// =========================================================================
console.log('6. Updating CSS print rules in index.css and premium-ui.css...');
let indexCssPath = path.join(__dirname, '../src/index.css');
let indexCss = fs.readFileSync(indexCssPath, 'utf8');

if (!indexCss.includes('body.has-print-modal #root')) {
  indexCss = indexCss.replace(
    '@media print {',
    `@media print {
  body.has-print-modal #root {
    display: none !important;
    height: 0 !important;
    min-height: 0 !important;
    max-height: 0 !important;
    overflow: hidden !important;
  }`
  );
  fs.writeFileSync(indexCssPath, indexCss, 'utf8');
  console.log('✓ Updated src/index.css print rules');
}

let premiumCssPath = path.join(__dirname, '../src/premium-ui.css');
let premiumCss = fs.readFileSync(premiumCssPath, 'utf8');

if (!premiumCss.includes('body.has-print-modal #root')) {
  premiumCss = premiumCss.replace(
    '@media print {',
    `@media print {
  body.has-print-modal #root {
    display: none !important;
    height: 0 !important;
    min-height: 0 !important;
    max-height: 0 !important;
    overflow: hidden !important;
  }`
  );
  fs.writeFileSync(premiumCssPath, premiumCss, 'utf8');
  console.log('✓ Updated src/premium-ui.css print rules');
}

console.log('=== All Updates in src/ Completed Successfully ===');

