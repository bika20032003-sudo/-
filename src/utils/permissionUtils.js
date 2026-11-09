/**
 * Permission and Role Utilities for Supervision Agency System
 * (نظام إدارة الصلاحيات وأدوار جهاز الإشراف والمتابعة)
 * مشروع صيانة وتطوير طريق أوباري - غات (360 كم)
 */

export const isProjectManagerUser = (currentUser) => {
  if (!currentUser) return false;
  const username = (currentUser.username || '').toLowerCase();
  const role = (currentUser.role || '').toLowerCase();
  const name = (currentUser.name || '').toLowerCase();
  return (
    username === 'project_manager' ||
    username === 'alansari' ||
    username === 'manager' ||
    role.includes('مدير المشروع') ||
    name.includes('الأنصاري')
  );
};

export const isSalehUser = (currentUser) => {
  if (!currentUser) return false;
  const username = (currentUser.username || '').toLowerCase();
  const name = (currentUser.name || '').toLowerCase();
  const role = (currentUser.role || '').toLowerCase();
  return (
    username === 'saleh_quality' ||
    username === 'saleh' ||
    username === 'salih_hammad' ||
    username === 'hammad' ||
    name.includes('صالح') ||
    role.includes('الجودة')
  );
};

export const isDevUser = (currentUser) => {
  if (!currentUser) return false;
  const username = (currentUser.username || '').toLowerCase();
  const role = (currentUser.role || '').toLowerCase();
  return username === 'admin' || username === 'dev' || role.includes('تطوير');
};

/**
 * صلاحية الاطلاع على تقرير إنجاز المرحلتين:
 * لمدير المشروع (م. عبدالرحمن الأنصاري) والمهندس صالح فقط (مع حساب التطوير).
 */
export const canAccessTwoPhaseReport = (currentUser) => {
  if (!currentUser) return false;
  return isProjectManagerUser(currentUser) || isSalehUser(currentUser) || isDevUser(currentUser);
};

/**
 * صلاحية الاطلاع على الأرشيف العام لكافة تقارير المشروع:
 * يظهر حصرياً لمدير المشروع (م. عبدالرحمن الأنصاري) والمهندس صالح فقط (مع حساب التطوير).
 */
export const canAccessGeneralArchive = (currentUser) => {
  if (!currentUser) return false;
  return isProjectManagerUser(currentUser) || isSalehUser(currentUser) || isDevUser(currentUser);
};

/**
 * صلاحية الاطلاع على قسم التقارير الأسبوعية والشهرية التجميعية (قسم عام):
 * قسم عام لمشروع الـ 360 كم متاح افتراضياً لكافة أعضاء جهاز الإشراف،
 * ويتم تخصيص وتعديل صلاحية ظهوره من قسم الصلاحيات (UsersView).
 */
export const canAccessPeriodicReports = (currentUser) => {
  if (!currentUser) return false;
  const username = (currentUser.username || '').toLowerCase().trim();
  const userName = (currentUser.name || '').trim();

  // 1. حساب التطوير ومدير المشروع لديهم صلاحية كاملة دائماً
  if (isDevUser(currentUser) || isProjectManagerUser(currentUser)) {
    return true;
  }

  // 2. فحص الصلاحيات المخصصة المحفوظة من قسم الصلاحيات أولاً (إذا تم تقييده صراحة)
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const all = JSON.parse(localStorage.getItem('system_user_section_permissions') || '{}');
      const userPerms = all[username] || all[currentUser.username] || (userName ? all[userName] : null);
      if (Array.isArray(userPerms)) {
        return userPerms.includes('periodic-reports');
      }
    } catch (_) {}
  }

  // 3. قسم عام: متاح افتراضياً لكافة مهندسي وأعضاء جهاز الإشراف الميداني
  return true;
};

/**
 * ترقية الصلاحيات القديمة لضمان عدم حجب قسم التقارير الدورية أو الأرشيف الخاص أو الأرشيف العام عن أي مستخدم
 */
export const migrateLegacyPermissions = () => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const raw = localStorage.getItem('system_user_section_permissions');
    if (!raw) return;
    const all = JSON.parse(raw);
    let changed = false;
    for (const key of Object.keys(all)) {
      if (Array.isArray(all[key])) {
        // Remove sector-dashboard completely
        if (all[key].includes('sector-dashboard')) {
          all[key] = all[key].filter(s => s !== 'sector-dashboard');
          changed = true;
        }
        // Ensure all core sections are unconditionally present for EVERY engineer
        const core = ['dashboard', 'road-progress', 'executive-progress', 'ai-agent', 'periodic-reports', 'reports-archive'];
        for (const c of core) {
          if (!all[key].includes(c)) {
            all[key].push(c);
            changed = true;
          }
        }
        const lowKey = String(key).toLowerCase();
        if (lowKey.includes('saleh') || lowKey.includes('quality') || lowKey.includes('manager') || lowKey.includes('ansari') || lowKey.includes('admin') || lowKey.includes('dev')) {
          if (!all[key].includes('general-archive')) {
            all[key].push('general-archive');
            changed = true;
          }
        }
      }
    }
    if (changed) {
      localStorage.setItem('system_user_section_permissions', JSON.stringify(all));
      window.dispatchEvent(new CustomEvent('permissions-updated'));
    }
  } catch (e) {
    console.warn('Error migrating legacy permissions:', e);
  }
};

// تشغيل الترقية تلقائياً عند تحميل الملف
if (typeof window !== 'undefined') {
  try {
    migrateLegacyPermissions();
  } catch (_) {}
}

/**
 * التحقق مما إذا كان التقرير يخص المهندس الحالي (للأرشيف الشخصي المستقل):
 * يفحص اسم المستخدم، اسم المهندس، المشرف الميداني، والجهة المسؤولة عن التقرير.
 */
export const isReportOwnedByEngineer = (report, currentUser) => {
  if (!report || !currentUser) return false;

  const username = (currentUser.username || '').toLowerCase().trim();
  const userName = (currentUser.name || '').trim();
  const userRole = (currentUser.role || '').toLowerCase();

  // 1. التطابق المباشر باسم المستخدم (Username)
  if (report.createdByUsername && String(report.createdByUsername).toLowerCase().trim() === username) {
    return true;
  }
  if (report.authorUsername && String(report.authorUsername).toLowerCase().trim() === username) {
    return true;
  }
  if (report.username && String(report.username).toLowerCase().trim() === username) {
    return true;
  }

  // 2. فحص الحقول الاسمية بالتقرير
  const repUploadedBy = String(report.uploadedBy || '').trim();
  const repEngineer = String(report.engineer || '').trim();
  const repSupervisor = String(report.supervisor || '').trim();
  const repDirector = String(report.sectorDirector || '').trim();
  const repResp = String(report.responsiblePerson || '').trim();
  const repSupName = String(report.supervisorName || '').trim();
  const repApprovedBy = String(report.approvedBy || '').trim();

  if (userName) {
    if (repUploadedBy && (repUploadedBy.includes(userName) || userName.includes(repUploadedBy))) return true;
    if (repEngineer && (repEngineer.includes(userName) || userName.includes(repEngineer))) return true;
    if (repSupervisor && (repSupervisor.includes(userName) || userName.includes(repSupervisor))) return true;
    if (repDirector && (repDirector.includes(userName) || userName.includes(repDirector))) return true;
    if (repResp && (repResp.includes(userName) || userName.includes(repResp))) return true;
    if (repSupName && (repSupName.includes(userName) || userName.includes(repSupName))) return true;
  }

  // 3. مطابقة الكلمات المفتاحية لأطراف الإشراف ومراحل المشروع
  const combinedReportAuthors = `${repUploadedBy} ${repEngineer} ${repSupervisor} ${repDirector} ${repResp} ${repSupName}`.toLowerCase();
  const repSector = String(report.sector || '').toLowerCase();
  const repPhase = String(report.phase || '').toLowerCase();

  // م. صلاح العربي (مشرف المرحلة الأولى - 226 كم)
  if (username === 'salah_alarabi' || userName.includes('صلاح')) {
    if (combinedReportAuthors.includes('صلاح') || combinedReportAuthors.includes('العربي')) return true;
    if (!report.isFuelReport && !report.isTwoPhaseProgressReport && (repSector.includes('الأولى') || repSector.includes('الاولى') || repPhase.includes('الأولى') || repPhase.includes('الاولى'))) {
      return true;
    }
  }

  // م. عيسى الطاهر (مشرف المرحلة الثانية - 134 كم)
  if (username === 'issa_altahir' || userName.includes('عيسى')) {
    if (combinedReportAuthors.includes('عيسى') || combinedReportAuthors.includes('الطاهر')) return true;
    if (!report.isFuelReport && !report.isTwoPhaseProgressReport && (repSector.includes('الثانية') || repSector.includes('التانية') || repPhase.includes('الثانية') || repPhase.includes('التانية'))) {
      return true;
    }
  }

  // م. عبدالسلام ابريكاو / م. الصالحين بريكاو (رئيس جهاز الإشراف)
  if (username === 'abrikaw' || userName.includes('بريكاو') || userName.includes('الصالحين') || userName.includes('عبدالسلام') || userRole.includes('رئيس جهاز الإشراف')) {
    if (combinedReportAuthors.includes('بريكاو') || combinedReportAuthors.includes('الصالحين') || combinedReportAuthors.includes('عبدالسلام') || repApprovedBy.includes('ابريكاو')) return true;
    if (String(report.reportType || '').includes('إشراف') || String(report.reportType || '').includes('متابعة')) return true;
  }

  // م. صالح حماد (مسؤول الجودة)
  if (username === 'saleh_quality' || username === 'saleh' || userName.includes('صالح') || userName.includes('حماد') || userRole.includes('جودة')) {
    if (combinedReportAuthors.includes('صالح') || combinedReportAuthors.includes('حماد') || combinedReportAuthors.includes('الجودة')) return true;
    if (String(report.reportType || '').includes('جودة') || String(report.materialName || '').includes('جودة') || report.isQualityReport) return true;
  }

  // م. عبدالرحمن الأنصاري (مدير المشروع) - في أرشيفه الخاص يرى تقارير الإدارة والمرحلتين والتقارير المعتمدة منه
  if (username === 'project_manager' || userName.includes('الأنصاري') || userName.includes('عبدالرحمن') || isProjectManagerUser(currentUser)) {
    if (combinedReportAuthors.includes('الأنصاري') || combinedReportAuthors.includes('عبدالرحمن') || repApprovedBy.includes('الأنصاري') || report.createdByUsername === 'project_manager' || report.isTwoPhaseProgressReport) return true;
  }

  // مسؤول الوقود والمحروقات
  if (currentUser.role?.includes('وقود') || username.includes('fuel')) {
    if (report.isFuelReport || report.reportType?.includes('وقود') || combinedReportAuthors.includes('وقود')) return true;
  }

  // م. مروان الهوني
  if (userName.includes('الهوني') || username.includes('honi')) {
    if (combinedReportAuthors.includes('الهوني')) return true;
  }

  return false;
};

/**
 * معرفات المراسلات المحذوفة لمستخدم معين (حذف مستقل لكل طرف)
 */
export const getUserDeletedMessageIds = (username) => {
  if (typeof window === 'undefined' || !username) return new Set();
  try {
    const key = `user_deleted_messages_${String(username).toLowerCase().trim()}`;
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.map(String) : []);
  } catch {
    return new Set();
  }
};

/**
 * تسجيل حذف مراسلة لمستخدم معين فقط دون التأثير على باقي المستخدمين
 */
export const markMessageDeletedForUser = (msgId, username) => {
  if (typeof window === 'undefined' || !username || !msgId) return;
  try {
    const key = `user_deleted_messages_${String(username).toLowerCase().trim()}`;
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    const set = new Set(Array.isArray(arr) ? arr.map(String) : []);
    set.add(String(msgId));
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn('Error saving user deleted message:', e);
  }
};

/**
 * معرفات المراسلات المقروءة لمستخدم معين (قراءة مستقلة للتعاميم)
 */
export const getUserReadMessageIds = (username) => {
  if (typeof window === 'undefined' || !username) return new Set();
  try {
    const key = `user_read_messages_${String(username).toLowerCase().trim()}`;
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.map(String) : []);
  } catch {
    return new Set();
  }
};

/**
 * تسجيل قراءة مراسلة لمستخدم معين
 */
export const markMessageReadForUser = (msgId, username) => {
  if (typeof window === 'undefined' || !username || !msgId) return;
  try {
    const key = `user_read_messages_${String(username).toLowerCase().trim()}`;
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    const set = new Set(Array.isArray(arr) ? arr.map(String) : []);
    set.add(String(msgId));
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn('Error saving user read message:', e);
  }
};

