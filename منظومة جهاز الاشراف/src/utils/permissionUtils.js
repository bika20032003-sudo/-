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
 * التحقق مما إذا كان التقرير يخص المهندس الحالي (للأرشيف الشخصي المستقل):
 * يفحص اسم المستخدم، اسم المهندس، المشرف الميداني، والجهة المسؤولة عن التقرير.
 */
export const isReportOwnedByEngineer = (report, currentUser) => {
  if (!report || !currentUser) return false;

  const username = (currentUser.username || '').toLowerCase().trim();
  const userName = (currentUser.name || '').trim();

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

  // 3. مطابقة الكلمات المفتاحية لأطراف الإشراف
  const combinedReportAuthors = `${repUploadedBy} ${repEngineer} ${repSupervisor} ${repDirector} ${repResp} ${repSupName}`.toLowerCase();

  // م. صلاح العربي (مشرف المرحلة الأولى)
  if (username === 'salah_alarabi' || userName.includes('صلاح')) {
    if (combinedReportAuthors.includes('صلاح') || combinedReportAuthors.includes('العربي')) return true;
    if ((report.sector === 'المرحلة الأولى' || report.phase === 'المرحلة الأولى') && !combinedReportAuthors.includes('عيسى') && !combinedReportAuthors.includes('الأنصاري')) {
      return true;
    }
  }

  // م. عيسى الطاهر (مشرف المرحلة الثانية)
  if (username === 'issa_altahir' || userName.includes('عيسى')) {
    if (combinedReportAuthors.includes('عيسى') || combinedReportAuthors.includes('الطاهر')) return true;
    if ((report.sector === 'المرحلة الثانية' || report.phase === 'المرحلة الثانية') && !combinedReportAuthors.includes('صلاح') && !combinedReportAuthors.includes('الأنصاري')) {
      return true;
    }
  }

  // م. عبدالسلام ابريكاو / م. الصالحين بريكاو
  if (username === 'abrikaw' || userName.includes('بريكاو') || userName.includes('الصالحين') || userName.includes('عبدالسلام')) {
    if (combinedReportAuthors.includes('بريكاو') || combinedReportAuthors.includes('الصالحين') || combinedReportAuthors.includes('عبدالسلام')) return true;
  }

  // م. صالح حماد (مسؤول الجودة)
  if (username === 'saleh_quality' || username === 'saleh' || userName.includes('صالح') || userName.includes('حماد')) {
    if (combinedReportAuthors.includes('صالح') || combinedReportAuthors.includes('حماد') || combinedReportAuthors.includes('الجودة')) return true;
  }

  // م. عبدالرحمن الأنصاري (مدير المشروع)
  if (username === 'project_manager' || userName.includes('الأنصاري') || userName.includes('عبدالرحمن')) {
    if (combinedReportAuthors.includes('الأنصاري') || combinedReportAuthors.includes('عبدالرحمن') || repApprovedBy.includes('الأنصاري')) return true;
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
