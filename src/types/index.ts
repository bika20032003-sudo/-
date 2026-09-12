// أنواع البيانات الرئيسية لمنظومة إدارة مخازن الهيئة العامة لخدمات نقل الدم

// =============================================
// نوع المستخدم
// =============================================
export type UserRole = 'admin' | 'treasury_manager' | 'storekeeper' | 'viewer';
export type UserStatus = 'active' | 'frozen' | 'suspended';

export interface User {
  Id: number;
  FullName: string;
  Username: string;
  Role: UserRole;
  RoleLabel?: string;
  Email?: string;
  Phone?: string;
  Status: UserStatus;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
  LastLogin?: string;
  Warehouse?: string;
}

// =============================================
// نوع المخزن
// =============================================
export interface Warehouse {
  Id: number;
  Name: string;
  Code: string;
  Location?: string;
  Type: 'رئيسي' | 'إقليمي / فرعي' | 'مخزن فرعي';
  ManagerName?: string;
  Description?: string;
  IsActive: boolean;
  CreatedAt: string;
  TotalStock?: number;
}

// =============================================
// نوع التصنيف ومكان التخزين
// =============================================
export type ItemCategoryType = 'أدوية' | 'أكياس الدم' | 'الكواشف والمحاليل' | 'المستلزمات الطبية' | 'مستلزمات السلامة' | 'المواد المخبرية';
export type StorageLocationType = 'ثلاجة' | 'مخزن' | 'خزانة';

export interface Category {
  Id: number;
  Name: string;
  Description?: string;
  IsActive: boolean;
  CreatedAt: string;
}

// =============================================
// نوع الصنف الطبي والمخزني
// =============================================
export interface Item {
  Id: number;
  Name: string;
  Code: string;
  Barcode?: string;
  Category: ItemCategoryType;
  Unit: string;
  StorageType: StorageLocationType;
  StorageLocation?: string;
  SupplierId?: number;
  SupplierName?: string;
  ActualStock: number; // الرصيد الفعلي
  DamagedStock?: number; // الرصيد التالف
  UnitPrice?: number; // الجانب المالي (مخفي افتراضياً)
  Status: 'متوفر' | 'غير متوفر' | 'تالف';
  Description?: string;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

// =============================================
// نوع سجل المادة التالفة
// =============================================
export interface DamagedItemRecord {
  Id: number;
  ItemCode: string;
  ItemName: string;
  Quantity: number;
  Unit: string;
  BatchNumber: string;
  ExpiryDate: string;
  Reason: string; // سبب التلف (انتهاء صلاحية، كسر، سوء تخزين، عيب تصنيع)
  ReportNumber: string; // رقم محضر التلف
  Date: string;
  RecordedBy: string; // تم التوثيق بواسطة (أمين الخزينة / مسؤول المخزن)
  Warehouse: string;
  DisposalStatus: 'بانتظار الإتلاف' | 'تم الإتلاف' | 'معاينة';
}

// =============================================
// نوع المورد والجهات المستفيدة
// =============================================
export interface Supplier {
  Id: number;
  Name: string;
  Code: string;
  ContactPerson?: string;
  Phone?: string;
  Email?: string;
  Address?: string;
  Category?: string;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface BeneficiaryEntity {
  Id: number;
  Name: string; // اسم مصرف الدم أو المستشفى
  Code: string;
  City: string;
  DelegateName?: string; // اسم المندوب الافتراضي
  DelegatePhone?: string;
  DelegateIdNumber?: string;
  Address?: string;
  Type: 'مصرف دم مركزي' | 'بنك دم فرعي' | 'مستشفى عام' | 'مركز تخصصي';
}

// =============================================
// بنود إذن الاستلام والصرف
// =============================================
export interface TransactionItemDetail {
  ItemCode: string;
  ItemName: string;
  Quantity: number;
  Unit: string;
  BatchNumber: string;
  ExpiryDate: string;
  StorageType?: StorageLocationType;
  StorageLocation?: string;
  UnitPrice?: number;
  Notes?: string;
}

// =============================================
// نوع إذن الاستلام (الوارد)
// =============================================
export interface ReceivingVoucher {
  Id: number;
  VoucherNumber: string; // رقم إذن الاستلام
  PoNumber?: string; // رقم أمر الشراء / التكليف
  Date: string;
  Warehouse: string;
  SupplierName: string; // اسم المورد
  SupplierCode?: string;
  DelegateName: string; // اسم مندوب المورد
  DelegatePhone: string;
  DelegateIdNumber?: string; // الرقم الوطني أو رقم الهوية
  StorekeeperName: string; // أمين الخزينة / المخزن المستلم
  StorekeeperSignature?: boolean;
  Items: TransactionItemDetail[];
  TotalQuantity: number;
  Notes?: string;
  Status: 'معتمد' | 'قيد المراجعة' | 'معلق' | 'ملغي';
  CreatedAt: string;
}

// =============================================
// نوع إذن الصرف (المنصرف)
// =============================================
export interface IssueVoucher {
  Id: number;
  VoucherNumber: string; // رقم إذن الصرف
  Date: string;
  Warehouse: string;
  BeneficiaryName: string; // اسم الجهة المستفيدة (مصرف دم / مستشفى)
  BeneficiaryType?: string;
  ReceiverName: string; // اسم المستلم (مندوب الجهة)
  ReceiverPhone: string;
  ReceiverIdNumber: string; // رقم هوية المستلم
  StorekeeperName: string; // أمين الخزينة / المخزن القائم بالصرف
  StorekeeperSignature?: boolean;
  Items: TransactionItemDetail[];
  TotalQuantity: number;
  Purpose?: string; // الغرض من الصرف
  Notes?: string;
  Status: 'معتمد' | 'معلق' | 'ملغي';
  CreatedAt: string;
}

// =============================================
// نوع تقارير الصلاحية
// =============================================
export interface ExpiryReportItem {
  ItemCode: string;
  ItemName: string;
  BatchNumber: string;
  ExpiryDate: string;
  ActualStock: number;
  Unit: string;
  StorageLocation: string;
  StorageType: StorageLocationType;
  DaysUntilExpiry: number;
  Status: 'ساري' | 'قريب الانتهاء' | 'حرج (أقل من شهر)' | 'منتهي الصلاحية';
}

// =============================================
// نوع النسخة الاحتياطية
// =============================================
export interface SystemBackupData {
  backupDate: string;
  version: string;
  systemName: string;
  data: {
    items: Item[];
    receivingVouchers: ReceivingVoucher[];
    issueVouchers: IssueVoucher[];
    damagedItems: DamagedItemRecord[];
    warehouses: Warehouse[];
    suppliers: Supplier[];
    beneficiaries: BeneficiaryEntity[];
    users: User[];
  };
}
