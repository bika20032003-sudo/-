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
 * يفحص أولاً الصلاحيات المخصصة من قسم الصلاحيات، وإذا لم تخصص يعتمد الافتراضي لمدير المشروع وم. صالح وحساب التطوير.
 */
export const canAccessGeneralArchive = (currentUser) => {
  if (!currentUser) return false;
  const username = (currentUser.username || '').toLowerCase().trim();
  const userName = (currentUser.name || '').trim();

  if (isDevUser(currentUser)) return true;

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const all = JSON.parse(localStorage.getItem('system_user_section_permissions') || '{}');
      const userPerms = all[username] || all[currentUser.username] || (userName ? all[userName] : null);
      if (Array.isArray(userPerms)) {
        return userPerms.includes('general-archive');
      }
    } catch (_) {}
  }

  return isProjectManagerUser(currentUser) || isSalehUser(currentUser);
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

  // 1. حساب التطوير لديه صلاحية كاملة دائماً
  if (isDevUser(currentUser)) {
    return true;
  }

  // 2. فحص الصلاحيات المخصصة المحفوظة من قسم الصلاحيات أولاً
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
 * ترقية الصلاحيات القديمة لإزالة الأقسام الملغية دون الكتابة فوق خيارات المشرف
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
        // تنظيف الأقسام الملغية فقط
        if (all[key].includes('sector-dashboard')) {
          all[key] = all[key].filter(s => s !== 'sector-dashboard');
          changed = true;
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

  // 0. حساب التطوير (Dev) يرى كافة التقارير دائماً
  if (isDevUser(currentUser)) return true;

  // 0.1 تقرير الموقف التنفيذي (360 كم) وثيقة سيادية معتمدة تظهر لجميع أعضاء جهاز الإشراف في الأرشيف
  if (report.isExecutiveProgressReport || report.reportCategory === 'executive' || String(report.reportType || '').includes('تنفيذي') || String(report.title || '').includes('تنفيذي')) {
    return true;
  }

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
    if (repSector.includes('الأولى') || repSector.includes('الاولى') || repPhase.includes('الأولى') || repPhase.includes('الاولى') || repSector.includes('أوباري') || repSector.includes('مشترك')) {
      return true;
    }
  }

  // م. عيسى الطاهر (مشرف المرحلة الثانية - 134 كم)
  if (username === 'issa_altahir' || userName.includes('عيسى')) {
    if (combinedReportAuthors.includes('عيسى') || combinedReportAuthors.includes('الطاهر')) return true;
    if (repSector.includes('الثانية') || repSector.includes('التانية') || repPhase.includes('الثانية') || repPhase.includes('التانية') || repSector.includes('مشترك')) {
      return true;
    }
  }

  // م. عبدالسلام ابريكاو / م. الصالحين بريكاو (رئيس جهاز الإشراف)
  if (username === 'abrikaw' || userName.includes('بريكاو') || userName.includes('الصالحين') || userName.includes('عبدالسلام') || userRole.includes('رئيس جهاز الإشراف')) {
    if (combinedReportAuthors.includes('بريكاو') || combinedReportAuthors.includes('الصالحين') || combinedReportAuthors.includes('عبدالسلام') || repApprovedBy.includes('ابريكاو')) return true;
    if (String(report.reportType || '').includes('إشراف') || String(report.reportType || '').includes('متابعة')) return true;
    if (report.isFuelReport || report.reportCategory === 'fuel' || String(report.reportType || '').includes('وقود')) return true;
  }

  // م. صالح حماد (مسؤول الجودة)
  if (username === 'saleh_quality' || username === 'saleh' || userName.includes('صالح') || userName.includes('حماد') || userRole.includes('جودة')) {
    if (combinedReportAuthors.includes('صالح') || combinedReportAuthors.includes('حماد') || combinedReportAuthors.includes('الجودة')) return true;
    if (String(report.reportType || '').includes('جودة') || String(report.materialName || '').includes('جودة') || report.isQualityReport) return true;
  }

  // م. عبدالرحمن الأنصاري (مدير المشروع) - في أرشيفه الخاص يرى تقارير الإدارة والمرحلتين وكافة تقارير الوقود والموقف التنفيذي والتقارير المعتمدة منه
  if (username === 'project_manager' || userName.includes('الأنصاري') || userName.includes('عبدالرحمن') || isProjectManagerUser(currentUser)) {
    if (
      report.isFuelReport ||
      report.reportCategory === 'fuel' ||
      String(report.reportType || '').includes('وقود') ||
      String(report.title || '').includes('وقود') ||
      combinedReportAuthors.includes('الأنصاري') ||
      combinedReportAuthors.includes('عبدالرحمن') ||
      repApprovedBy.includes('الأنصاري') ||
      report.createdByUsername === 'project_manager' ||
      report.isTwoPhaseProgressReport ||
      report.isExecutiveProgressReport
    ) return true;
  }

  // مسؤول الوقود والمحروقات
  if (currentUser.role?.includes('وقود') || username.includes('fuel')) {
    if (
      report.isFuelReport ||
      report.reportCategory === 'fuel' ||
      String(report.reportType || '').includes('وقود') ||
      String(report.title || '').includes('وقود') ||
      combinedReportAuthors.includes('وقود') ||
      combinedReportAuthors.includes('محروقات')
    ) return true;
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

