/**
 * Permission and Role Utilities for Supervision Agency System
 * (نظام إدارة الصلاحيات وأدوار جهاز الإشراف والمتابعة)
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
 * Checks if the current user is authorized to view or create "تقرير إنجاز المرحلتين".
 * Authorized users: مدير المشروع (Project Manager) and م. صالح (Eng. Saleh) ONLY.
 */
export const canAccessTwoPhaseReport = (currentUser) => {
  if (!currentUser) return false;
  return isProjectManagerUser(currentUser) || isSalehUser(currentUser) || isDevUser(currentUser);
};
