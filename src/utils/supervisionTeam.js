/**
 * Supervision Team & Correspondence Resolver
 * (نظام إدارة مراسلي جهاز الإشراف والمتابعة وتوحيد أسماء المستخدمين والأسماء المستعارة)
 */

import { getSystemUsers } from '../components/LoginPage.jsx';

// Official Base Supervision Hierarchy
export const BASE_SUPERVISORS = [
  {
    username: 'project_manager',
    name: 'م. عبدالرحمن الأنصاري',
    role: 'مدير المشروع',
    title: 'مدير المشروع (جهاز الإشراف)',
    badge: 'إشراف عام',
    sector: 'all',
    avatar: ''
  },
  {
    username: 'abrikaw',
    name: 'م. عبدالسلام ابريكاو',
    role: 'رئيس جهاز الإشراف',
    title: 'رئيس جهاز الإشراف والمتابعة',
    badge: 'رئاسة الجهاز',
    sector: 'all',
    avatar: ''
  },
  {
    username: 'saleh_quality',
    name: 'م. صالح حماد',
    role: 'مسؤول الجودة',
    title: 'مسؤول ضبط ومراقبة الجودة الفنية',
    badge: 'ضبط الجودة',
    sector: 'all',
    avatar: ''
  },
  {
    username: 'salah_alarabi',
    name: 'م. صلاح العربي',
    role: 'مهندس مشرف (المرحلة الأولى)',
    title: 'مهندس مشرف - المرحلة الأولى (95 كم)',
    badge: 'المرحلة الأولى',
    sector: 'المرحلة الأولى',
    avatar: ''
  },
  {
    username: 'issa_altahir',
    name: 'م. عيسى الطاهر',
    role: 'مهندس مشرف (المرحلة الثانية)',
    title: 'مهندس مشرف - المرحلة الثانية (134 كم)',
    badge: 'المرحلة الثانية',
    sector: 'المرحلة الثانية',
    avatar: ''
  },
  {
    username: 'admin',
    name: 'م. حساب التطوير',
    role: 'حساب التطوير',
    title: 'حساب التطوير والإشراف البرمجي الكامل',
    badge: 'إشراف برمجي',
    sector: 'all',
    avatar: ''
  }
];

// Unified Aliases Map
export const CANONICAL_ALIASES = {
  // Admin / Dev
  'admin': 'admin',
  'dev': 'admin',
  'developer': 'admin',
  'development': 'admin',
  'تطوير': 'admin',
  'حساب التطوير': 'admin',
  'م. حساب التطوير': 'admin',

  // Project Manager (Abdulrahman Alansari)
  'project_manager': 'project_manager',
  'alansari': 'project_manager',
  'manager': 'project_manager',
  'مدير المشروع': 'project_manager',
  'م. عبدالرحمن الأنصاري': 'project_manager',
  'عبدالرحمن': 'project_manager',
  'ansari': 'project_manager',

  // Abrikaw (Supervision Agency Head)
  'abrikaw': 'abrikaw',
  'admin_sectors': 'abrikaw',
  'sectors': 'abrikaw',
  'ابريكاو': 'abrikaw',
  'م. عبدالسلام ابريكاو': 'abrikaw',
  'عبدالسلام': 'abrikaw',
  'الصالحين': 'abrikaw',
  'بريكاو': 'abrikaw',
  'رئيس جهاز الإشراف': 'abrikaw',

  // Saleh Hammad (Quality Control)
  'saleh_quality': 'saleh_quality',
  'quality': 'saleh_quality',
  'saleh': 'saleh_quality',
  'hammad': 'saleh_quality',
  'صالح': 'saleh_quality',
  'حماد': 'saleh_quality',
  'م. صالح حماد': 'saleh_quality',
  'مسؤول الجودة': 'saleh_quality',

  // Salah Alarabi (Phase 1)
  'salah_alarabi': 'salah_alarabi',
  'sector_a': 'salah_alarabi',
  'alarabi': 'salah_alarabi',
  'صلاح': 'salah_alarabi',
  'العربي': 'salah_alarabi',
  'م. صلاح العربي': 'salah_alarabi',

  // Issa Altahir (Phase 2)
  'issa_altahir': 'issa_altahir',
  'sector_b': 'issa_altahir',
  'altahir': 'issa_altahir',
  'عيسى': 'issa_altahir',
  'الطاهر': 'issa_altahir',
  'م. عيسى الطاهر': 'issa_altahir',

  // Broadcast
  'all': 'all',
  'الكل': 'all',
  'كافة أعضاء جهاز الإشراف': 'all',
  'تعميم': 'all'
};

/**
 * Returns canonical username for any alias or username variant
 */
export function canonicalizeUsername(username) {
  if (!username) return '';
  const trimmed = String(username).toLowerCase().trim();
  return CANONICAL_ALIASES[trimmed] || trimmed;
}

/**
 * Checks if two usernames/aliases refer to the same person
 */
export function isSameSupervisor(u1, u2) {
  if (!u1 || !u2) return false;
  return canonicalizeUsername(u1) === canonicalizeUsername(u2);
}

/**
 * Checks if a message is addressed to the given user or broadcast
 */
export function isMessageForUser(message, targetUsername) {
  if (!message || !targetUsername) return false;
  const to = canonicalizeUsername(message.toUsername);
  const target = canonicalizeUsername(targetUsername);
  return to === 'all' || to === target;
}

/**
 * Checks if a message was sent by the given user
 */
export function isMessageFromUser(message, targetUsername) {
  if (!message || !targetUsername) return false;
  const from = canonicalizeUsername(message.fromUsername);
  const target = canonicalizeUsername(targetUsername);
  return from === target;
}

/**
 * Get all supervision team members (base official team + any custom users added via UsersView)
 */
export function getAllSupervisors() {
  const map = new Map();

  // 1. Add base supervisors
  BASE_SUPERVISORS.forEach(sup => {
    map.set(sup.username, { ...sup });
  });

  // 2. Merge with dynamic system users from LoginPage / localStorage
  try {
    const sysUsers = typeof getSystemUsers === 'function' ? getSystemUsers() : [];
    if (Array.isArray(sysUsers)) {
      sysUsers.forEach(u => {
        if (!u || !u.username) return;
        const cUser = canonicalizeUsername(u.username);
        if (map.has(cUser)) {
          // Enhance existing entry with name/role/avatar if present
          const existing = map.get(cUser);
          map.set(cUser, {
            ...existing,
            name: u.name || existing.name,
            role: u.role || existing.role,
            avatar: u.avatar || existing.avatar
          });
        } else {
          // Dynamic custom user
          map.set(cUser, {
            username: u.username,
            name: u.name || u.username,
            role: u.role || u.title || 'عضو جهاز الإشراف',
            title: u.title || u.role || 'عضو جهاز الإشراف',
            badge: u.sector === 'المرحلة الأولى' ? 'المرحلة الأولى' : u.sector === 'المرحلة الثانية' ? 'المرحلة الثانية' : 'إشراف',
            sector: u.sector || 'all',
            avatar: u.avatar || ''
          });
        }
      });
    }
  } catch (err) {
    console.warn('Could not load dynamic users for supervision team:', err);
  }

  return Array.from(map.values());
}

/**
 * Get recipients list for compose dropdown, excluding the current sender
 */
export function getSelectableRecipients(currentUsername) {
  const currentCanon = canonicalizeUsername(currentUsername);
  const all = getAllSupervisors();
  return all.filter(u => canonicalizeUsername(u.username) !== currentCanon);
}

/**
 * Get supervisor display object by username or alias
 */
export function getSupervisorInfo(username) {
  const canon = canonicalizeUsername(username);
  const all = getAllSupervisors();
  return all.find(u => canonicalizeUsername(u.username) === canon) || {
    username: canon,
    name: username,
    role: 'جهاز الإشراف'
  };
}

