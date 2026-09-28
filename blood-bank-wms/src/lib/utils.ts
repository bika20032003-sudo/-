// دوال مساعدة عامة
// منظومة إدارة مخازن الهيئة العامة لخدمات نقل الدم

import { format, formatDistanceToNow, isAfter, isBefore, addDays } from 'date-fns';
import { ar } from 'date-fns/locale';

// =============================================
// تنسيق التاريخ بالعربية
// =============================================
export function formatDate(date: string | Date): string {
  if (!date) return '-';
  return format(new Date(date), 'yyyy/MM/dd', { locale: ar });
}

// تنسيق التاريخ والوقت
export function formatDateTime(date: string | Date): string {
  if (!date) return '-';
  return format(new Date(date), 'yyyy/MM/dd HH:mm', { locale: ar });
}

// الوقت النسبي (منذ ساعتين، منذ يوم...)
export function timeAgo(date: string | Date): string {
  if (!date) return '-';
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ar });
}

// =============================================
// التحقق من الصلاحية
// =============================================
export function isExpired(expiryDate: string | Date): boolean {
  if (!expiryDate) return false;
  return isBefore(new Date(expiryDate), new Date());
}

export function isExpiringSoon(expiryDate: string | Date, daysThreshold: number = 90): boolean {
  if (!expiryDate) return false;
  const expiry = new Date(expiryDate);
  const threshold = addDays(new Date(), daysThreshold);
  return isAfter(expiry, new Date()) && isBefore(expiry, threshold);
}

// =============================================
// تنسيق الأرقام والعملة
// =============================================
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ar-LY').format(num);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-LY', {
    style: 'currency',
    currency: 'LYD',
    minimumFractionDigits: 2,
  }).format(amount);
}

// =============================================
// ترجمة حالة الحركة
// =============================================
export function getTransactionStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'معلق',
    approved: 'معتمد',
    cancelled: 'ملغي',
  };
  return statusMap[status] || status;
}

// ألوان حالة الحركة
export function getTransactionStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    cancelled: 'danger',
  };
  return colorMap[status] || 'default';
}

// =============================================
// ترجمة نوع الحركة
// =============================================
export function getTransactionTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    inbound: 'إدخال',
    outbound: 'صرف',
    transfer: 'تحويل',
  };
  return typeMap[type] || type;
}

// ألوان نوع الحركة
export function getTransactionTypeColor(type: string): string {
  const colorMap: Record<string, string> = {
    inbound: 'success',
    outbound: 'danger',
    transfer: 'info',
  };
  return colorMap[type] || 'default';
}

// =============================================
// ترجمة صلاحيات المستخدم
// =============================================
export function getRoleLabel(role: string): string {
  const roleMap: Record<string, string> = {
    admin: 'مدير النظام',
    storekeeper: 'أمين مخزن',
    viewer: 'مراقب',
  };
  return roleMap[role] || role;
}

// =============================================
// توليد رقم حركة جديد
// =============================================
export function generateTransactionNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TRX-${year}-${random}`;
}

// =============================================
// التحقق من صحة البيانات
// =============================================
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^09\d{8}$/;
  return phoneRegex.test(phone);
}

// =============================================
// دالة debounce للبحث
// =============================================
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// =============================================
// كلاس مساعد لبناء فئات CSS
// =============================================
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// =============================================
// تصدير البيانات إلى ملف Excel (CSV بترميز UTF-8 BOM)
// =============================================
export function downloadCSV(filename: string, content: string): void {
  // إضافة BOM لضمان قراءة الحروف العربية بشكل سليم في برنامج Excel
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

// تصدير إذن منفرد (استلام أو صرف) بكامل بنوده وتفاصيله
export function exportVoucherToExcel(
  voucher: {
    VoucherNumber: string;
    Date: string;
    Warehouse: string;
    TotalQuantity: number;
    StorekeeperName: string;
    Status: string;
    Notes?: string;
    SupplierName?: string;
    DelegateName?: string;
    DelegatePhone?: string;
    PoNumber?: string;
    DelegateIdNumber?: string;
    BeneficiaryName?: string;
    ReceiverName?: string;
    ReceiverPhone?: string;
    ReceiverIdNumber?: string;
    Purpose?: string;
    Items: Array<{
      ItemCode: string;
      ItemName: string;
      Quantity: number;
      Unit: string;
      BatchNumber: string;
      ExpiryDate: string;
      StorageType?: string;
    }>;
  },
  type: 'inbound' | 'outbound'
): void {
  const isReceipt = type === 'inbound';
  const docTitle = isReceipt
    ? 'إذن استلام مخزني (وارد) - الهيئة الوطنية لخدمات نقل الدم'
    : 'إذن صرف مخزني (منصرف) - الهيئة الوطنية لخدمات نقل الدم';

  const rows: string[] = [];

  // ترويسة الوثيقة
  rows.push(`${escapeCSV(docTitle)}`);
  rows.push(`${escapeCSV('تاريخ الاستخراج:')},${escapeCSV(new Date().toLocaleDateString('ar-LY'))}`);
  rows.push('');

  // تفاصيل الإذن العامة
  rows.push(`${escapeCSV('رقم الإذن')},${escapeCSV(voucher.VoucherNumber)},${escapeCSV('تاريخ الإذن')},${escapeCSV(voucher.Date)}`);
  rows.push(`${escapeCSV('المخزن')},${escapeCSV(voucher.Warehouse)},${escapeCSV('الحالة')},${escapeCSV(voucher.Status)}`);

  if (isReceipt) {
    rows.push(`${escapeCSV('المورد / الشركة')},${escapeCSV(voucher.SupplierName || '-')},${escapeCSV('أمر الشراء / التكليف')},${escapeCSV(voucher.PoNumber || '-')}`);
    rows.push(`${escapeCSV('اسم مندوب المورد')},${escapeCSV(voucher.DelegateName || '-')},${escapeCSV('هاتف المندوب')},${escapeCSV(voucher.DelegatePhone || '-')}`);
    rows.push(`${escapeCSV('الرقم الوطني / الهوية')},${escapeCSV(voucher.DelegateIdNumber || '-')},${escapeCSV('أمين المخزن المستلم')},${escapeCSV(voucher.StorekeeperName || '-')}`);
  } else {
    rows.push(`${escapeCSV('الجهة المستفيدة')},${escapeCSV(voucher.BeneficiaryName || '-')},${escapeCSV('الغرض من الصرف')},${escapeCSV(voucher.Purpose || '-')}`);
    rows.push(`${escapeCSV('اسم المستلم (المندوب)')},${escapeCSV(voucher.ReceiverName || '-')},${escapeCSV('هاتف المستلم')},${escapeCSV(voucher.ReceiverPhone || '-')}`);
    rows.push(`${escapeCSV('رقم هوية المستلم')},${escapeCSV(voucher.ReceiverIdNumber || '-')},${escapeCSV('أمين المخزن القائم بالصرف')},${escapeCSV(voucher.StorekeeperName || '-')}`);
  }

  rows.push(`${escapeCSV('ملاحظات')},${escapeCSV(voucher.Notes || 'لا توجد ملاحظات')}`);
  rows.push('');

  // جدول البنود
  rows.push(`${escapeCSV('جدول المواد الطبية والأصناف المشمولة بالإذن')}`);
  rows.push([
    escapeCSV('#'),
    escapeCSV('كود الصنف'),
    escapeCSV('اسم الصنف الطبي والمواصفات'),
    escapeCSV('الكمية'),
    escapeCSV('الوحدة'),
    escapeCSV('رقم التشغيلة'),
    escapeCSV('تاريخ الصلاحية'),
    escapeCSV('نوع التخزين'),
  ].join(','));

  voucher.Items.forEach((item, idx) => {
    rows.push([
      escapeCSV(idx + 1),
      escapeCSV(item.ItemCode),
      escapeCSV(item.ItemName),
      escapeCSV(item.Quantity),
      escapeCSV(item.Unit),
      escapeCSV(item.BatchNumber),
      escapeCSV(item.ExpiryDate),
      escapeCSV(item.StorageType || 'ثلاجة'),
    ].join(','));
  });

  // الإجمالي
  rows.push([
    escapeCSV(''),
    escapeCSV('الإجمالي الكلي'),
    escapeCSV(''),
    escapeCSV(voucher.TotalQuantity),
    escapeCSV('وحدة'),
    escapeCSV(''),
    escapeCSV(''),
    escapeCSV(''),
  ].join(','));

  const filePrefix = isReceipt ? 'إذن_استلام' : 'إذن_صرف';
  const cleanVoucherNum = voucher.VoucherNumber.replace(/[^a-zA-Z0-9-_]/g, '_');
  downloadCSV(`${filePrefix}_${cleanVoucherNum}.csv`, rows.join('\r\n'));
}

// تصدير جدول أذونات الاستلام بالكامل
export function exportReceivingVouchersListToExcel(
  vouchers: Array<{
    VoucherNumber: string;
    Date: string;
    Warehouse: string;
    SupplierName: string;
    DelegateName: string;
    DelegatePhone: string;
    PoNumber?: string;
    Items: unknown[];
    TotalQuantity: number;
    StorekeeperName: string;
    Status: string;
    Notes?: string;
  }>
): void {
  const rows: string[] = [];
  rows.push(`${escapeCSV('سجل أذونات الاستلام المخزنية (الوارد) - الهيئة الوطنية لخدمات نقل الدم')}`);
  rows.push(`${escapeCSV('تاريخ التصدير:')},${escapeCSV(new Date().toLocaleDateString('ar-LY'))}`);
  rows.push('');

  rows.push([
    escapeCSV('#'),
    escapeCSV('رقم إذن الاستلام'),
    escapeCSV('تاريخ الاستلام'),
    escapeCSV('المخزن'),
    escapeCSV('المورد / الشركة'),
    escapeCSV('اسم مندوب المورد'),
    escapeCSV('هاتف المندوب'),
    escapeCSV('رقم أمر الشراء'),
    escapeCSV('عدد الأصناف'),
    escapeCSV('إجمالي الكمية المستلمة'),
    escapeCSV('أمين المخزن المستلم'),
    escapeCSV('الحالة'),
    escapeCSV('ملاحظات'),
  ].join(','));

  vouchers.forEach((v, idx) => {
    rows.push([
      escapeCSV(idx + 1),
      escapeCSV(v.VoucherNumber),
      escapeCSV(v.Date),
      escapeCSV(v.Warehouse),
      escapeCSV(v.SupplierName),
      escapeCSV(v.DelegateName),
      escapeCSV(v.DelegatePhone),
      escapeCSV(v.PoNumber || '-'),
      escapeCSV(v.Items.length),
      escapeCSV(v.TotalQuantity),
      escapeCSV(v.StorekeeperName),
      escapeCSV(v.Status),
      escapeCSV(v.Notes || '-'),
    ].join(','));
  });

  downloadCSV(`سجل_أذونات_الاستلام_${new Date().toISOString().slice(0, 10)}.csv`, rows.join('\r\n'));
}

// تصدير جدول أذونات الصرف بالكامل
export function exportIssueVouchersListToExcel(
  vouchers: Array<{
    VoucherNumber: string;
    Date: string;
    Warehouse: string;
    BeneficiaryName: string;
    ReceiverName: string;
    ReceiverPhone: string;
    ReceiverIdNumber?: string;
    Purpose?: string;
    Items: unknown[];
    TotalQuantity: number;
    StorekeeperName: string;
    Status: string;
    Notes?: string;
  }>
): void {
  const rows: string[] = [];
  rows.push(`${escapeCSV('سجل أذونات الصرف المخزنية (المنصرف) - الهيئة الوطنية لخدمات نقل الدم')}`);
  rows.push(`${escapeCSV('تاريخ التصدير:')},${escapeCSV(new Date().toLocaleDateString('ar-LY'))}`);
  rows.push('');

  rows.push([
    escapeCSV('#'),
    escapeCSV('رقم إذن الصرف'),
    escapeCSV('تاريخ الصرف'),
    escapeCSV('المخزن المنصرف منه'),
    escapeCSV('الجهة المستفيدة'),
    escapeCSV('اسم المستلم'),
    escapeCSV('هاتف المستلم'),
    escapeCSV('رقم هوية المستلم'),
    escapeCSV('الغرض من الصرف'),
    escapeCSV('عدد الأصناف'),
    escapeCSV('إجمالي الكمية المصروفة'),
    escapeCSV('أمين المخزن القائم بالصرف'),
    escapeCSV('الحالة'),
    escapeCSV('ملاحظات'),
  ].join(','));

  vouchers.forEach((v, idx) => {
    rows.push([
      escapeCSV(idx + 1),
      escapeCSV(v.VoucherNumber),
      escapeCSV(v.Date),
      escapeCSV(v.Warehouse),
      escapeCSV(v.BeneficiaryName),
      escapeCSV(v.ReceiverName),
      escapeCSV(v.ReceiverPhone),
      escapeCSV(v.ReceiverIdNumber || '-'),
      escapeCSV(v.Purpose || '-'),
      escapeCSV(v.Items.length),
      escapeCSV(v.TotalQuantity),
      escapeCSV(v.StorekeeperName),
      escapeCSV(v.Status),
      escapeCSV(v.Notes || '-'),
    ].join(','));
  });

  downloadCSV(`سجل_أذونات_الصرف_${new Date().toISOString().slice(0, 10)}.csv`, rows.join('\r\n'));
}

