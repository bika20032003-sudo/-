// صفحة حركة المخزون - أذونات الاستلام وأذونات الصرف المفصولة
// منظومة إدارة مخازن الهيئة العامة لخدمات نقل الدم
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Plus,
  Search,
  Printer,
  X,
  Save,
  Download,
  Building2,
  Trash2,
  Layers,
  Truck,
  Check,
  FileSpreadsheet,
  FileText,
  Edit3,
  CheckCircle2,
  RotateCcw,
  Clock,
  AlertCircle,
  ShieldCheck,
  User,
  Phone,
  FileCheck,
} from 'lucide-react';
import {
  initialReceivingVouchers,
  initialIssueVouchers,
  initialSuppliers,
  initialBeneficiaries,
  initialItems,
  initialWarehouses,
} from '@/lib/mockData';
import {
  ReceivingVoucher,
  IssueVoucher,
  TransactionItemDetail,
  StorageLocationType,
} from '@/types';
import {
  exportVoucherToExcel,
  exportReceivingVouchersListToExcel,
  exportIssueVouchersListToExcel,
} from '@/lib/utils';

function TransactionsContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams?.get('type') === 'outbound' ? 'outbound' : 'inbound';

  const [activeTab, setActiveTab] = useState<'inbound' | 'outbound'>(initialType);
  const [receivingVouchers, setReceivingVouchers] = useState<ReceivingVoucher[]>(initialReceivingVouchers);
  const [issueVouchers, setIssueVouchers] = useState<IssueVoucher[]>(initialIssueVouchers);
  const [searchTerm, setSearchTerm] = useState('');
  const [recStatusFilter, setRecStatusFilter] = useState<'all' | 'معتمد' | 'قيد المراجعة'>('all');

  // رسائل التنبيه التفاعلية (Toast)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' | 'info' } | null>(null);
  const showToast = (text: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // قراءة المعامل عند التغيير
  useEffect(() => {
    const typeParam = searchParams?.get('type');
    if (typeParam === 'outbound') setActiveTab('outbound');
    else if (typeParam === 'inbound') setActiveTab('inbound');
  }, [searchParams]);

  // نوافذ العرض والإضافة والتعديل
  const [showAddReceivingModal, setShowAddReceivingModal] = useState(false);
  const [showEditReceivingModal, setShowEditReceivingModal] = useState(false);
  const [editingRec, setEditingRec] = useState<ReceivingVoucher | null>(null);
  const [editRecItems, setEditRecItems] = useState<TransactionItemDetail[]>([]);

  const [showAddIssueModal, setShowAddIssueModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewVoucher, setPreviewVoucher] = useState<{
    type: 'inbound' | 'outbound';
    data: ReceivingVoucher | IssueVoucher;
  } | null>(null);

  // دالة طباعة الإذن الرسمي
  const handlePrintVoucher = () => {
    if (!previewVoucher) return;
    const oldTitle = document.title;
    const prefix = previewVoucher.type === 'inbound' ? 'إذن_استلام' : 'إذن_صرف';
    document.title = `${prefix}_${previewVoucher.data.VoucherNumber}`;
    window.print();
    setTimeout(() => {
      document.title = oldTitle;
    }, 1000);
  };

  // دالة تصدير الإذن بصيغة PDF
  const handleExportPDF = () => {
    if (!previewVoucher) return;
    const oldTitle = document.title;
    const prefix = previewVoucher.type === 'inbound' ? 'إذن_استلام' : 'إذن_صرف';
    document.title = `${prefix}_${previewVoucher.data.VoucherNumber}`;
    window.print();
    setTimeout(() => {
      document.title = oldTitle;
    }, 1000);
  };

  // دالة تصدير بيانات الإذن إلى ملف إكسل Excel
  const handleExportExcel = () => {
    if (!previewVoucher) return;
    exportVoucherToExcel(previewVoucher.data, previewVoucher.type);
  };

  // تصدير قائمة أذونات الاستلام بالكامل إلى إكسل
  const handleExportAllReceivingExcel = () => {
    exportReceivingVouchersListToExcel(filteredReceiving);
  };

  // تصدير قائمة أذونات الصرف بالكامل إلى إكسل
  const handleExportAllIssueExcel = () => {
    exportIssueVouchersListToExcel(filteredIssue);
  };

  // اعتماد إذن الاستلام بنقرة واحدة
  const handleApproveReceivingVoucher = (voucherId: number) => {
    setReceivingVouchers((prev) =>
      prev.map((v) => (v.Id === voucherId ? { ...v, Status: 'معتمد' } : v))
    );
    showToast('تم اعتماد إذن الاستلام بنجاح، وتأكيد دخول الأصناف إلى المخزن الفعلي ✓', 'success');
  };

  // إرجاع إذن الاستلام إلى حالة قيد المراجعة للتدقيق
  const handleReturnReceivingToReview = (voucherId: number) => {
    setReceivingVouchers((prev) =>
      prev.map((v) => (v.Id === voucherId ? { ...v, Status: 'قيد المراجعة' } : v))
    );
    showToast('تم تحويل إذن الاستلام إلى حالة "قيد المراجعة" للتدقيق الفني والمكتبي ⚠️', 'warning');
  };

  // فتح نافذة تعديل إذن الاستلام
  const handleOpenEditReceiving = (voucher: ReceivingVoucher) => {
    setEditingRec({ ...voucher });
    setEditRecItems(JSON.parse(JSON.stringify(voucher.Items)));
    setShowEditReceivingModal(true);
  };

  // دوال بنود إذن الاستلام أثناء التعديل
  const addEditRecItemRow = () => {
    setEditRecItems([
      ...editRecItems,
      {
        ItemCode: initialItems[0]?.Code || 'ITM-001',
        ItemName: initialItems[0]?.Name || 'أكياس دم مفردة 450ml مع محلول CPDA-1',
        Quantity: 100,
        Unit: initialItems[0]?.Unit || 'كيس',
        BatchNumber: 'BTH-2026-REV',
        ExpiryDate: '2028-12-31',
        StorageType: initialItems[0]?.StorageType || 'ثلاجة',
        StorageLocation: initialItems[0]?.StorageLocation || 'مخزن رئيسي',
      },
    ]);
  };

  const updateEditRecItem = (index: number, field: keyof TransactionItemDetail, val: any) => {
    const updated = [...editRecItems];
    if (field === 'ItemName') {
      const itm = initialItems.find((i) => i.Name === val);
      if (itm) {
        updated[index] = {
          ...updated[index],
          ItemName: itm.Name,
          ItemCode: itm.Code,
          Unit: itm.Unit,
          StorageType: itm.StorageType,
          StorageLocation: itm.StorageLocation,
        };
      }
    } else {
      (updated[index] as any)[field] = val;
    }
    setEditRecItems(updated);
  };

  const removeEditRecItem = (index: number) => {
    if (editRecItems.length > 1) {
      setEditRecItems(editRecItems.filter((_, i) => i !== index));
    }
  };

  // حفظ التعديلات على إذن الاستلام مع تحديد الحالة المستهدفة
  const handleSaveEditReceiving = (targetStatus: 'معتمد' | 'قيد المراجعة') => {
    if (!editingRec) return;
    if (!editingRec.SupplierName || !editingRec.DelegateName) {
      alert('يرجى كتابة اسم المورد واسم المندوب');
      return;
    }

    const totalQty = editRecItems.reduce((acc, curr) => acc + (Number(curr.Quantity) || 0), 0);
    const updatedVoucher: ReceivingVoucher = {
      ...editingRec,
      Items: editRecItems,
      TotalQuantity: totalQty,
      Status: targetStatus,
    };

    setReceivingVouchers((prev) =>
      prev.map((v) => (v.Id === updatedVoucher.Id ? updatedVoucher : v))
    );
    setShowEditReceivingModal(false);
    setEditingRec(null);

    if (targetStatus === 'معتمد') {
      showToast(`تم حفظ وتحديث إذن الاستلام (${updatedVoucher.VoucherNumber}) واعتماده رسمياً ✓`, 'success');
    } else {
      showToast(`تم حفظ تعديلات إذن الاستلام (${updatedVoucher.VoucherNumber}) وتعيين حالته "قيد المراجعة" ⚠️`, 'warning');
    }
  };



  // حالة نموذج إنشاء إذن استلام جديد
  const [newRec, setNewRec] = useState({
    VoucherNumber: `REC-2026-000${receivingVouchers.length + 1}`,
    PoNumber: `PO-2026-9${Math.floor(100 + Math.random() * 900)}`,
    Date: new Date().toISOString().split('T')[0],
    Warehouse: 'المخزن الرئيسي المركز - طرابلس',
    SupplierName: initialSuppliers[0].Name,
    DelegateName: '',
    DelegatePhone: '',
    DelegateIdNumber: '',
    StorekeeperName: 'أحمد محمد - أمين الخزينة',
    Notes: 'تم الاستلام والفحص وحفظ المواد في أماكن التخزين المخصصة',
  });

  const [recItems, setRecItems] = useState<TransactionItemDetail[]>([
    {
      ItemCode: initialItems[0].Code,
      ItemName: initialItems[0].Name,
      Quantity: 500,
      Unit: initialItems[0].Unit,
      BatchNumber: 'BTH-2026-N01',
      ExpiryDate: '2028-12-31',
      StorageType: initialItems[0].StorageType,
      StorageLocation: initialItems[0].StorageLocation,
    },
  ]);

  // حالة نموذج إنشاء إذن صرف جديد
  const [newIss, setNewIss] = useState({
    VoucherNumber: `ISS-2026-000${issueVouchers.length + 1}`,
    Date: new Date().toISOString().split('T')[0],
    Warehouse: 'المخزن الرئيسي المركز - طرابلس',
    BeneficiaryName: initialBeneficiaries[0].Name,
    ReceiverName: initialBeneficiaries[0].DelegateName || '',
    ReceiverPhone: initialBeneficiaries[0].DelegatePhone || '',
    ReceiverIdNumber: initialBeneficiaries[0].DelegateIdNumber || '',
    StorekeeperName: 'أحمد محمد - أمين الخزينة',
    Purpose: 'تزويد دوري وتأمين مخزون استراتيجي لمصرف الدم',
    Notes: 'تم تسليم الشحنة بحالة ممتازة ومطابقة للإجراءات المعتمدة',
  });

  const [issItems, setIssItems] = useState<TransactionItemDetail[]>([
    {
      ItemCode: initialItems[0].Code,
      ItemName: initialItems[0].Name,
      Quantity: 150,
      Unit: initialItems[0].Unit,
      BatchNumber: 'BTH-TRM-2026-A1',
      ExpiryDate: '2028-06-30',
      StorageType: initialItems[0].StorageType,
      StorageLocation: 'ثلاجة حفظ أكياس الدم #1',
    },
  ]);

  // تحديث بيانات المندوب تلقائياً عند اختيار مصرف دم
  const handleBeneficiaryChange = (beneficiaryName: string) => {
    const ben = initialBeneficiaries.find((b) => b.Name === beneficiaryName);
    setNewIss((prev) => ({
      ...prev,
      BeneficiaryName: beneficiaryName,
      ReceiverName: ben?.DelegateName || prev.ReceiverName,
      ReceiverPhone: ben?.DelegatePhone || prev.ReceiverPhone,
      ReceiverIdNumber: ben?.DelegateIdNumber || prev.ReceiverIdNumber,
    }));
  };

  // دوال بنود إذن الاستلام
  const addRecItemRow = () => {
    setRecItems([
      ...recItems,
      {
        ItemCode: initialItems[1]?.Code || 'ITM-002',
        ItemName: initialItems[1]?.Name || 'أكياس دم مزدوجة 450ml',
        Quantity: 200,
        Unit: 'كيس',
        BatchNumber: 'BTH-2026-N02',
        ExpiryDate: '2028-12-31',
        StorageType: 'ثلاجة',
        StorageLocation: 'ثلاجة حفظ أكياس الدم #2',
      },
    ]);
  };

  const updateRecItem = (index: number, field: keyof TransactionItemDetail, val: any) => {
    const updated = [...recItems];
    if (field === 'ItemName') {
      const itm = initialItems.find((i) => i.Name === val);
      if (itm) {
        updated[index] = {
          ...updated[index],
          ItemName: itm.Name,
          ItemCode: itm.Code,
          Unit: itm.Unit,
          StorageType: itm.StorageType,
          StorageLocation: itm.StorageLocation,
        };
      }
    } else {
      (updated[index] as any)[field] = val;
    }
    setRecItems(updated);
  };

  const removeRecItem = (index: number) => {
    if (recItems.length > 1) {
      setRecItems(recItems.filter((_, i) => i !== index));
    }
  };

  // دوال بنود إذن الصرف
  const addIssItemRow = () => {
    setIssItems([
      ...issItems,
      {
        ItemCode: initialItems[3]?.Code || 'ITM-004',
        ItemName: initialItems[3]?.Name || 'كاشف فصيلة الدم Anti-A',
        Quantity: 50,
        Unit: 'زجاجة',
        BatchNumber: 'BTH-BIO-26-88',
        ExpiryDate: '2027-08-20',
        StorageType: 'ثلاجة',
        StorageLocation: 'ثلاجة الكواشف والمحاليل #1',
      },
    ]);
  };

  const updateIssItem = (index: number, field: keyof TransactionItemDetail, val: any) => {
    const updated = [...issItems];
    if (field === 'ItemName') {
      const itm = initialItems.find((i) => i.Name === val);
      if (itm) {
        updated[index] = {
          ...updated[index],
          ItemName: itm.Name,
          ItemCode: itm.Code,
          Unit: itm.Unit,
          StorageType: itm.StorageType,
        };
      }
    } else {
      (updated[index] as any)[field] = val;
    }
    setIssItems(updated);
  };

  const removeIssItem = (index: number) => {
    if (issItems.length > 1) {
      setIssItems(issItems.filter((_, i) => i !== index));
    }
  };

  // حفظ إذن الاستلام
  const handleSaveReceiving = (targetStatus: 'معتمد' | 'قيد المراجعة' = 'معتمد') => {
    if (!newRec.SupplierName || !newRec.DelegateName) {
      alert('يرجى كتابة اسم المورد واسم المندوب');
      return;
    }

    const totalQty = recItems.reduce((acc, curr) => acc + (Number(curr.Quantity) || 0), 0);
    const created: ReceivingVoucher = {
      Id: receivingVouchers.length + 1,
      VoucherNumber: newRec.VoucherNumber,
      PoNumber: newRec.PoNumber,
      Date: newRec.Date,
      Warehouse: newRec.Warehouse,
      SupplierName: newRec.SupplierName,
      DelegateName: newRec.DelegateName,
      DelegatePhone: newRec.DelegatePhone,
      DelegateIdNumber: newRec.DelegateIdNumber,
      StorekeeperName: newRec.StorekeeperName,
      StorekeeperSignature: true,
      Items: recItems,
      TotalQuantity: totalQty,
      Notes: newRec.Notes,
      Status: targetStatus,
      CreatedAt: new Date().toLocaleString('ar-LY'),
    };

    setReceivingVouchers([created, ...receivingVouchers]);
    setShowAddReceivingModal(false);
    setPreviewVoucher({ type: 'inbound', data: created });
    setShowPreviewModal(true);

    if (targetStatus === 'معتمد') {
      showToast(`تم إنشاء إذن الاستلام (${created.VoucherNumber}) واعتماده رسمياً ✓`, 'success');
    } else {
      showToast(`تم إنشاء إذن الاستلام (${created.VoucherNumber}) بحالة "قيد المراجعة" ⚠️`, 'warning');
    }
  };

  // حفظ إذن الصرف
  const handleSaveIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIss.BeneficiaryName || !newIss.ReceiverName) {
      alert('يرجى تحديد الجهة المستفيدة واسم المستلم');
      return;
    }

    const totalQty = issItems.reduce((acc, curr) => acc + (Number(curr.Quantity) || 0), 0);
    const created: IssueVoucher = {
      Id: issueVouchers.length + 1,
      VoucherNumber: newIss.VoucherNumber,
      Date: newIss.Date,
      Warehouse: newIss.Warehouse,
      BeneficiaryName: newIss.BeneficiaryName,
      ReceiverName: newIss.ReceiverName,
      ReceiverPhone: newIss.ReceiverPhone,
      ReceiverIdNumber: newIss.ReceiverIdNumber,
      StorekeeperName: newIss.StorekeeperName,
      StorekeeperSignature: true,
      Items: issItems,
      TotalQuantity: totalQty,
      Purpose: newIss.Purpose,
      Notes: newIss.Notes,
      Status: 'معتمد',
      CreatedAt: new Date().toLocaleString('ar-LY'),
    };

    setIssueVouchers([created, ...issueVouchers]);
    setShowAddIssueModal(false);
    setPreviewVoucher({ type: 'outbound', data: created });
    setShowPreviewModal(true);
    showToast(`تم إنشاء إذن الصرف (${created.VoucherNumber}) واعتماده رسمياً وتوثيق التسليم ✓`, 'success');
  };

  // فلترة أذونات الاستلام
  const filteredReceiving = receivingVouchers.filter((v) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      v.VoucherNumber.toLowerCase().includes(term) ||
      (v.PoNumber && v.PoNumber.toLowerCase().includes(term)) ||
      v.SupplierName.toLowerCase().includes(term) ||
      v.DelegateName.toLowerCase().includes(term) ||
      v.Warehouse.toLowerCase().includes(term);
    const matchesStatus = recStatusFilter === 'all' || v.Status === recStatusFilter;
    return matchesSearch && matchesStatus;
  });


  // فلترة أذونات الصرف
  const filteredIssue = issueVouchers.filter((v) => {
    const term = searchTerm.toLowerCase();
    return (
      v.VoucherNumber.toLowerCase().includes(term) ||
      v.BeneficiaryName.toLowerCase().includes(term) ||
      v.ReceiverName.toLowerCase().includes(term) ||
      v.Warehouse.toLowerCase().includes(term)
    );
  });

  return (
    <>
      <Header
        title="أذونات التوريد، الاستلام والصرف"
        subtitle="الهيئة العامة لخدمات نقل الدم / حركة المخازن"
      />

      <div className="page-content">
        {/* رأس الصفحة مع التبويبات الكبيرة المفصولة */}
        <div className="page-header" style={{ marginBottom: '16px' }}>
          <div>
            <h1 className="page-header-title">إدارة أذونات الاستلام والصرف</h1>
            <p className="page-header-subtitle">
              فصل كامل ودقيق بين أذونات الاستلام (الوارد من الموردين) وأذونات الصرف (المنصرف لمصارف الدم) مع توثيق بيانات المناديب والاعتماد الرسمي
            </p>
          </div>
          <div className="page-header-actions" style={{ gap: '10px' }}>
            <button
              className="btn"
              style={{
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
              }}
              onClick={() => {
                setNewRec((prev) => ({
                  ...prev,
                  VoucherNumber: `REC-2026-000${receivingVouchers.length + 1}`,
                }));
                setShowAddReceivingModal(true);
              }}
            >
              <Plus size={18} />
              إنشاء إذن استلام جديد (وارد)
            </button>

            <button
              className="btn"
              style={{
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
              }}
              onClick={() => {
                setNewIss((prev) => ({
                  ...prev,
                  VoucherNumber: `ISS-2026-000${issueVouchers.length + 1}`,
                }));
                setShowAddIssueModal(true);
              }}
            >
              <Plus size={18} />
              إنشاء إذن صرف جديد (منصرف)
            </button>
          </div>
        </div>

        {/* أزرار التبديل الكبرى بين الاستلام والصرف */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {/* تبويب إذن الاستلام */}
          <div
            onClick={() => setActiveTab('inbound')}
            style={{
              padding: '18px 22px',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: activeTab === 'inbound' ? '#f0fdf4' : 'var(--bg-card)',
              border: activeTab === 'inbound' ? '2px solid #16a34a' : '1px solid var(--border-light)',
              boxShadow: activeTab === 'inbound' ? '0 4px 12px rgba(22, 163, 74, 0.15)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: activeTab === 'inbound' ? '#16a34a' : '#dcfce7',
                  color: activeTab === 'inbound' ? '#ffffff' : '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ArrowDownCircle size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: activeTab === 'inbound' ? '#15803d' : 'var(--text-primary)' }}>
                  1. أذونات الاستلام (الوارد)
                </h3>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  توريدات الشركات والأصناف المستلمة وتوثيق المناديب
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#16a34a' }}>
                {receivingVouchers.length}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>إذن استلام</span>
            </div>
          </div>

          {/* تبويب إذن الصرف */}
          <div
            onClick={() => setActiveTab('outbound')}
            style={{
              padding: '18px 22px',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: activeTab === 'outbound' ? '#fef2f2' : 'var(--bg-card)',
              border: activeTab === 'outbound' ? '2px solid #dc2626' : '1px solid var(--border-light)',
              boxShadow: activeTab === 'outbound' ? '0 4px 12px rgba(220, 38, 38, 0.15)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: activeTab === 'outbound' ? '#dc2626' : '#fee2e2',
                  color: activeTab === 'outbound' ? '#ffffff' : '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ArrowUpCircle size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: activeTab === 'outbound' ? '#b91c1c' : 'var(--text-primary)' }}>
                  2. أذونات الصرف (المنصرف)
                </h3>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  صرف أكياس الدم والكواشف لمصارف الدم والمستشفيات
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#dc2626' }}>
                {issueVouchers.length}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>إذن صرف</span>
            </div>
          </div>
        </div>

        {/* حاوية الجدول وشريط البحث */}
        <div className="table-container">
          <div className="table-toolbar">
            <div className="table-toolbar-right" style={{ gap: '12px', flex: 1 }}>
              <div className="table-search" style={{ width: '100%', maxWidth: '420px' }}>
                <Search className="table-search-icon" size={16} />
                <input
                  type="text"
                  placeholder={
                    activeTab === 'inbound'
                      ? 'بحث برقم إذن الاستلام، أمر الشراء، المورد، أو اسم المندوب...'
                      : 'بحث برقم إذن الصرف، الجهة المستفيدة، أو اسم المستلم...'
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {activeTab === 'inbound' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>تصفية الحالة:</span>
                  <select
                    style={{
                      padding: '5px 10px',
                      fontSize: '0.83rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-medium)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    value={recStatusFilter}
                    onChange={(e) => setRecStatusFilter(e.target.value as any)}
                  >
                    <option value="all">جميع الحالات</option>
                    <option value="معتمد">معتمد فقط ✓</option>
                    <option value="قيد المراجعة">قيد المراجعة فقط ⚠️</option>
                  </select>
                </div>
              )}
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {activeTab === 'inbound'
                  ? `إجمالي الاستلام: ${filteredReceiving.length}`
                  : `إجمالي الصرف: ${filteredIssue.length}`}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={activeTab === 'inbound' ? handleExportAllReceivingExcel : handleExportAllIssueExcel}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                title={activeTab === 'inbound' ? 'تصدير كافة أذونات الاستلام إلى ملف Excel' : 'تصدير كافة أذونات الصرف إلى ملف Excel'}
              >
                <Download size={14} />
                <span>تصدير السجل إلى Excel</span>
              </button>
            </div>
          </div>

          {/* جدول أذونات الاستلام (الوارد) */}
          {activeTab === 'inbound' && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>رقم إذن الاستلام</th>
                  <th>أمر التكليف / الشراء</th>
                  <th>تاريخ الاستلام</th>
                  <th>المورد (الشركة)</th>
                  <th>مندوب المورد</th>
                  <th>المخزن المستلم</th>
                  <th>عدد الأصناف</th>
                  <th>الكمية الإجمالية</th>
                  <th>أمين المخزن المستلم</th>
                  <th>الحالة</th>
                  <th>الإجراءات والاعتماد</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceiving.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                      لا توجد أذونات استلام مطابقة للبحث أو التصفية
                    </td>
                  </tr>
                ) : (
                  filteredReceiving.map((voucher) => (
                    <tr key={voucher.Id} style={{ background: voucher.Status === 'قيد المراجعة' ? '#fffbeb' : 'inherit' }}>
                      <td style={{ fontWeight: 700, color: '#16a34a', direction: 'ltr', textAlign: 'right' }}>
                        {voucher.VoucherNumber}
                      </td>
                      <td>
                        <span className="badge badge-secondary" style={{ direction: 'ltr' }}>
                          {voucher.PoNumber || '-'}
                        </span>
                      </td>
                      <td>{voucher.Date}</td>
                      <td style={{ fontWeight: 600 }}>{voucher.SupplierName}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{voucher.DelegateName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          📞 {voucher.DelegatePhone}
                        </div>
                      </td>
                      <td>{voucher.Warehouse}</td>
                      <td>
                        <span className="badge badge-info">{voucher.Items.length} صنف</span>
                      </td>
                      <td style={{ fontWeight: 700 }}>{voucher.TotalQuantity.toLocaleString()} وحدة</td>
                      <td style={{ fontSize: '0.85rem' }}>{voucher.StorekeeperName}</td>
                      <td>
                        {voucher.Status === 'معتمد' ? (
                          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Check size={12} />
                            معتمد
                          </span>
                        ) : (
                          <span
                            className="badge"
                            style={{
                              background: '#fef3c7',
                              color: '#b45309',
                              border: '1px solid #fcd34d',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: 700,
                            }}
                          >
                            <Clock size={12} />
                            قيد المراجعة
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          {voucher.Status === 'قيد المراجعة' ? (
                            <button
                              className="btn btn-sm"
                              title="اعتماد إذن الاستلام نهائياً وإدخال الأصناف للمخزن"
                              onClick={() => handleApproveReceivingVoucher(voucher.Id)}
                              style={{
                                background: '#16a34a',
                                color: '#ffffff',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                                fontWeight: 600,
                              }}
                            >
                              <CheckCircle2 size={13} />
                              اعتماد
                            </button>
                          ) : (
                            <button
                              className="btn btn-secondary btn-sm"
                              title="إعادة الإذن إلى حالة قيد المراجعة للتعديل أو التدقيق"
                              onClick={() => handleReturnReceivingToReview(voucher.Id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                              }}
                            >
                              <RotateCcw size={13} />
                              مراجعة
                            </button>
                          )}
                          <button
                            className="btn btn-secondary btn-sm"
                            title="تعديل بيانات وبنود إذن الاستلام"
                            onClick={() => handleOpenEditReceiving(voucher)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 8px',
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                            }}
                          >
                            <Edit3 size={13} />
                            تعديل
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="معاينة وطباعة وتصدير الإذن الرسمي"
                            onClick={() => {
                              setPreviewVoucher({ type: 'inbound', data: voucher });
                              setShowPreviewModal(true);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 8px',
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                            }}
                          >
                            <Printer size={13} />
                            طباعة
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* جدول أذونات الصرف (المنصرف) */}
          {activeTab === 'outbound' && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>رقم إذن الصرف</th>
                  <th>تاريخ الصرف</th>
                  <th>الجهة المستفيدة (مصرف الدم / المستشفى)</th>
                  <th>المستلم (مندوب الجهة)</th>
                  <th>رقم هاتف المستلم</th>
                  <th>المخزن الصادر منه</th>
                  <th>عدد الأصناف</th>
                  <th>الكمية المصروفة</th>
                  <th>أمين الخزينة القائم بالصرف</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssue.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                      لا توجد أذونات صرف مطابقة للبحث
                    </td>
                  </tr>
                ) : (
                  filteredIssue.map((voucher) => (
                    <tr key={voucher.Id}>
                      <td style={{ fontWeight: 700, color: '#dc2626', direction: 'ltr', textAlign: 'right' }}>
                        {voucher.VoucherNumber}
                      </td>
                      <td>{voucher.Date}</td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Building2 size={16} style={{ color: '#dc2626' }} />
                          <span>{voucher.BeneficiaryName}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{voucher.ReceiverName}</td>
                      <td style={{ direction: 'ltr', textAlign: 'right' }}>{voucher.ReceiverPhone}</td>
                      <td>{voucher.Warehouse}</td>
                      <td>
                        <span className="badge badge-warning">{voucher.Items.length} صنف</span>
                      </td>
                      <td style={{ fontWeight: 700, color: '#dc2626' }}>
                        {voucher.TotalQuantity.toLocaleString()} وحدة
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{voucher.StorekeeperName}</td>
                      <td>
                        <span className="badge badge-success">
                          <Check size={12} style={{ marginLeft: '4px' }} />
                          {voucher.Status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          title="معاينة وطباعة الإذن الرسمي"
                          onClick={() => {
                            setPreviewVoucher({ type: 'outbound', data: voucher });
                            setShowPreviewModal(true);
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Printer size={15} />
                          طباعة الإذن
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* مودال إضافة إذن استلام جديد */}
      {showAddReceivingModal && (
        <div className="modal-overlay" onClick={() => setShowAddReceivingModal(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '900px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header" style={{ borderBottom: '2px solid #16a34a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowDownCircle size={24} />
                </div>
                <div>
                  <h3 className="modal-title" style={{ color: '#15803d' }}>إنشاء إذن استلام مواد طبية (وارد)</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                    توثيق استلام الأصناف من المورد مع بيانات المندوب واعتماد أمين الخزينة
                  </p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowAddReceivingModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveReceiving('معتمد'); }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">رقم إذن الاستلام</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newRec.VoucherNumber}
                      onChange={(e) => setNewRec({ ...newRec, VoucherNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">رقم أمر التكليف / الشراء</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newRec.PoNumber}
                      onChange={(e) => setNewRec({ ...newRec, PoNumber: e.target.value })}
                      placeholder="PO-2026-..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">تاريخ الاستلام</label>
                    <input
                      type="date"
                      className="form-input"
                      value={newRec.Date}
                      onChange={(e) => setNewRec({ ...newRec, Date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">المخزن المستلم</label>
                    <select
                      className="form-select"
                      value={newRec.Warehouse}
                      onChange={(e) => setNewRec({ ...newRec, Warehouse: e.target.value })}
                    >
                      {initialWarehouses.map((wh) => (
                        <option key={wh.Id} value={wh.Name}>
                          {wh.Name} {wh.Type === 'رئيسي' ? '(الرئيسي)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-600)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Truck size={18} />
                    بيانات الشركة الموردة ومندوب التسليم
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                    <div className="form-group">
                      <label className="form-label">اسم الشركة الموردة</label>
                      <select
                        className="form-select"
                        value={newRec.SupplierName}
                        onChange={(e) => setNewRec({ ...newRec, SupplierName: e.target.value })}
                        required
                      >
                        {initialSuppliers.map((s) => (
                          <option key={s.Id} value={s.Name}>
                            {s.Name} ({s.Category})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">اسم مندوب الشركة</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="الاسم الثلاثي لمندوب التوصيل"
                        value={newRec.DelegateName}
                        onChange={(e) => setNewRec({ ...newRec, DelegateName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">رقم هاتف المندوب</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="091XXXXXXX"
                        value={newRec.DelegatePhone}
                        onChange={(e) => setNewRec({ ...newRec, DelegatePhone: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">الرقم الوطني / رقم الهوية</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="رقم بطاقة الهوية أو الجواز"
                        value={newRec.DelegateIdNumber}
                        onChange={(e) => setNewRec({ ...newRec, DelegateIdNumber: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Layers size={18} />
                      قائمة الأصناف المستلمة بدقة
                    </h4>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={addRecItemRow}
                      style={{ color: '#16a34a', borderColor: '#16a34a' }}
                    >
                      <Plus size={15} />
                      إضافة صنف آخر
                    </button>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'right' }}>
                          <th style={{ padding: '8px' }}>الصنف</th>
                          <th style={{ padding: '8px', width: '100px' }}>الكمية</th>
                          <th style={{ padding: '8px', width: '90px' }}>الوحدة</th>
                          <th style={{ padding: '8px', width: '130px' }}>رقم التشغيلة</th>
                          <th style={{ padding: '8px', width: '130px' }}>تاريخ الصلاحية</th>
                          <th style={{ padding: '8px', width: '110px' }}>التخزين</th>
                          <th style={{ padding: '8px', width: '40px' }}>حذف</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recItems.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '6px' }}>
                              <select
                                className="form-select"
                                style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                                value={item.ItemName}
                                onChange={(e) => updateRecItem(idx, 'ItemName', e.target.value)}
                              >
                                {initialItems.map((itm) => (
                                  <option key={itm.Id} value={itm.Name}>
                                    {itm.Code} - {itm.Name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td style={{ padding: '6px' }}>
                              <input
                                type="number"
                                className="form-input"
                                style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                                value={item.Quantity}
                                onChange={(e) => updateRecItem(idx, 'Quantity', e.target.value)}
                                min="1"
                                required
                              />
                            </td>
                            <td style={{ padding: '6px' }}>
                              <input
                                type="text"
                                className="form-input"
                                style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                                value={item.Unit}
                                onChange={(e) => updateRecItem(idx, 'Unit', e.target.value)}
                              />
                            </td>
                            <td style={{ padding: '6px' }}>
                              <input
                                type="text"
                                className="form-input"
                                style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                                value={item.BatchNumber}
                                onChange={(e) => updateRecItem(idx, 'BatchNumber', e.target.value)}
                                placeholder="BTH-..."
                                required
                              />
                            </td>
                            <td style={{ padding: '6px' }}>
                              <input
                                type="date"
                                className="form-input"
                                style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                                value={item.ExpiryDate}
                                onChange={(e) => updateRecItem(idx, 'ExpiryDate', e.target.value)}
                                required
                              />
                            </td>
                            <td style={{ padding: '6px' }}>
                              <select
                                className="form-select"
                                style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                                value={item.StorageType}
                                onChange={(e) => updateRecItem(idx, 'StorageType', e.target.value as StorageLocationType)}
                              >
                                <option value="ثلاجة">ثلاجة ❄️</option>
                                <option value="مخزن">مخزن 📦</option>
                                <option value="خزانة">خزانة 🗄️</option>
                              </select>
                            </td>
                            <td style={{ padding: '6px', textAlign: 'center' }}>
                              {recItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeRecItem(idx)}
                                  style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer' }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">أمين الخزينة / المخزن المستلم</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newRec.StorekeeperName}
                      onChange={(e) => setNewRec({ ...newRec, StorekeeperName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ملاحظات الاستلام والفحص</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newRec.Notes}
                      onChange={(e) => setNewRec({ ...newRec, Notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddReceivingModal(false)}>
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveReceiving('قيد المراجعة')}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b45309', borderColor: '#fcd34d', background: '#fef3c7', fontWeight: 600, cursor: 'pointer' }}
                >
                  <Clock size={16} />
                  حفظ كمسودة (قيد المراجعة والتدقيق)
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveReceiving('معتمد')}
                  className="btn"
                  style={{ background: '#16a34a', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  <CheckCircle2 size={16} />
                  اعتماد وحفظ إذن الاستلام
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال تعديل ومراجعة إذن الاستلام */}
      {showEditReceivingModal && editingRec && (
        <div className="modal-overlay" onClick={() => setShowEditReceivingModal(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '920px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header" style={{ borderBottom: '2px solid #f59e0b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit3 size={22} />
                </div>
                <div>
                  <h3 className="modal-title" style={{ color: '#b45309' }}>
                    تعديل ومراجعة إذن الاستلام ({editingRec.VoucherNumber})
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                    مراجعة بيانات الشحنة والمورد والكميات قبل الاعتماد النهائي
                  </p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowEditReceivingModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">رقم إذن الاستلام</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingRec.VoucherNumber}
                    onChange={(e) => setEditingRec({ ...editingRec, VoucherNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">أمر التكليف / الشراء</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingRec.PoNumber || ''}
                    onChange={(e) => setEditingRec({ ...editingRec, PoNumber: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">تاريخ الاستلام</label>
                  <input
                    type="date"
                    className="form-input"
                    value={editingRec.Date}
                    onChange={(e) => setEditingRec({ ...editingRec, Date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">المخزن المستلم</label>
                  <select
                    className="form-select"
                    value={editingRec.Warehouse}
                    onChange={(e) => setEditingRec({ ...editingRec, Warehouse: e.target.value })}
                  >
                    {initialWarehouses.map((w) => (
                      <option key={w.Id} value={w.Name}>
                        {w.Name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '12px', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={18} />
                  بيانات الشركة الموردة ومندوب التسليم
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">اسم المورد / الشركة</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingRec.SupplierName}
                      onChange={(e) => setEditingRec({ ...editingRec, SupplierName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">اسم مندوب المورد المسلّم</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingRec.DelegateName}
                      onChange={(e) => setEditingRec({ ...editingRec, DelegateName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">رقم هاتف المندوب</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingRec.DelegatePhone}
                      onChange={(e) => setEditingRec({ ...editingRec, DelegatePhone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">الرقم الوطني / رقم الهوية</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingRec.DelegateIdNumber || ''}
                      onChange={(e) => setEditingRec({ ...editingRec, DelegateIdNumber: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={18} />
                    قائمة الأصناف المستلمة (تعديل الكميات والتشغيلات)
                  </h4>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={addEditRecItemRow}
                    style={{ color: '#16a34a', borderColor: '#16a34a', cursor: 'pointer' }}
                  >
                    <Plus size={15} />
                    إضافة صنف
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'right' }}>
                        <th style={{ padding: '8px' }}>الصنف</th>
                        <th style={{ padding: '8px', width: '100px' }}>الكمية</th>
                        <th style={{ padding: '8px', width: '90px' }}>الوحدة</th>
                        <th style={{ padding: '8px', width: '130px' }}>رقم التشغيلة</th>
                        <th style={{ padding: '8px', width: '130px' }}>تاريخ الصلاحية</th>
                        <th style={{ padding: '8px', width: '110px' }}>نوع التخزين</th>
                        <th style={{ padding: '8px', width: '40px' }}>حذف</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editRecItems.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '6px' }}>
                            <select
                              className="form-select"
                              style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                              value={item.ItemName}
                              onChange={(e) => updateEditRecItem(idx, 'ItemName', e.target.value)}
                            >
                              {initialItems.map((itm) => (
                                <option key={itm.Id} value={itm.Name}>
                                  {itm.Code} - {itm.Name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: '6px' }}>
                            <input
                              type="number"
                              className="form-input"
                              style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                              value={item.Quantity}
                              onChange={(e) => updateEditRecItem(idx, 'Quantity', Number(e.target.value))}
                              min="1"
                              required
                            />
                          </td>
                          <td style={{ padding: '6px' }}>
                            <input
                              type="text"
                              className="form-input"
                              style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                              value={item.Unit}
                              onChange={(e) => updateEditRecItem(idx, 'Unit', e.target.value)}
                            />
                          </td>
                          <td style={{ padding: '6px' }}>
                            <input
                              type="text"
                              className="form-input"
                              style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                              value={item.BatchNumber}
                              onChange={(e) => updateEditRecItem(idx, 'BatchNumber', e.target.value)}
                              required
                            />
                          </td>
                          <td style={{ padding: '6px' }}>
                            <input
                              type="date"
                              className="form-input"
                              style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                              value={item.ExpiryDate}
                              onChange={(e) => updateEditRecItem(idx, 'ExpiryDate', e.target.value)}
                              required
                            />
                          </td>
                          <td style={{ padding: '6px' }}>
                            <select
                              className="form-select"
                              style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                              value={item.StorageType || 'ثلاجة'}
                              onChange={(e) => updateEditRecItem(idx, 'StorageType', e.target.value)}
                            >
                              <option value="ثلاجة">ثلاجة ❄️</option>
                              <option value="مخزن">مخزن 📦</option>
                              <option value="خزانة">خزانة 🗄️</option>
                            </select>
                          </td>
                          <td style={{ padding: '6px', textAlign: 'center' }}>
                            {editRecItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeEditRecItem(idx)}
                                style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer' }}
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">أمين المخزن المستلم</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingRec.StorekeeperName}
                    onChange={(e) => setEditingRec({ ...editingRec, StorekeeperName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">ملاحظات الاستلام والفحص</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingRec.Notes || ''}
                    onChange={(e) => setEditingRec({ ...editingRec, Notes: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap', padding: '16px 20px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowEditReceivingModal(false)}>
                إلغاء
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleSaveEditReceiving('قيد المراجعة')}
                style={{ background: '#fef3c7', color: '#b45309', borderColor: '#fcd34d', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, cursor: 'pointer' }}
              >
                <Clock size={16} />
                حفظ كمسودة (قيد المراجعة والتدقيق)
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => handleSaveEditReceiving('معتمد')}
                style={{ background: '#16a34a', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, cursor: 'pointer' }}
              >
                <CheckCircle2 size={16} />
                حفظ واعتماد الإذن نهائياً
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال إضافة إذن صرف جديد */}
      {showAddIssueModal && (
        <div className="modal-overlay" onClick={() => setShowAddIssueModal(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '900px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header" style={{ borderBottom: '2px solid #dc2626' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowUpCircle size={24} />
                </div>
                <div>
                  <h3 className="modal-title" style={{ color: '#b91c1c' }}>إنشاء إذن صرف مواد طبية (منصرف)</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                    صرف أكياس دم ومحاليل لمصارف الدم والمستشفيات مع توثيق المستلم والتوقيع
                  </p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowAddIssueModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveIssue}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">رقم إذن الصرف</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newIss.VoucherNumber}
                      onChange={(e) => setNewIss({ ...newIss, VoucherNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">تاريخ الصرف</label>
                    <input
                      type="date"
                      className="form-input"
                      value={newIss.Date}
                      onChange={(e) => setNewIss({ ...newIss, Date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">المخزن الصادر منه</label>
                    <select
                      className="form-select"
                      value={newIss.Warehouse}
                      onChange={(e) => setNewIss({ ...newIss, Warehouse: e.target.value })}
                    >
                      {initialWarehouses.map((wh) => (
                        <option key={wh.Id} value={wh.Name}>
                          {wh.Name} {wh.Type === 'رئيسي' ? '(الرئيسي)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">الغرض من الصرف</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newIss.Purpose}
                      onChange={(e) => setNewIss({ ...newIss, Purpose: e.target.value })}
                      placeholder="تزويد دوري / طارئ..."
                    />
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#dc2626', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building2 size={18} />
                    الجهة المستفيدة (قائمة مصارف الدم) والمستلم
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">الجهة المستفيدة (مصرف الدم / المستشفى)</label>
                      <select
                        className="form-select"
                        value={newIss.BeneficiaryName}
                        onChange={(e) => handleBeneficiaryChange(e.target.value)}
                        required
                      >
                        {initialBeneficiaries.map((b) => (
                          <option key={b.Id} value={b.Name}>
                            {b.Name} - {b.City} ({b.Type})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">اسم المستلم (مندوب الجهة)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="الاسم الثلاثي لمندوب الاستلام"
                        value={newIss.ReceiverName}
                        onChange={(e) => setNewIss({ ...newIss, ReceiverName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">رقم هاتف المستلم</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="09XXXXXXXX"
                        value={newIss.ReceiverPhone}
                        onChange={(e) => setNewIss({ ...newIss, ReceiverPhone: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">رقم الهوية / الرقم الوطني للمستلم</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="رقم بطاقة الهوية"
                        value={newIss.ReceiverIdNumber}
                        onChange={(e) => setNewIss({ ...newIss, ReceiverIdNumber: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Layers size={18} />
                      قائمة المواد والأصناف المصروفة
                    </h4>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={addIssItemRow}
                      style={{ color: '#dc2626', borderColor: '#dc2626' }}
                    >
                      <Plus size={15} />
                      إضافة صنف آخر
                    </button>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'right' }}>
                          <th style={{ padding: '8px' }}>الصنف</th>
                          <th style={{ padding: '8px', width: '100px' }}>الكمية المصروفة</th>
                          <th style={{ padding: '8px', width: '90px' }}>الوحدة</th>
                          <th style={{ padding: '8px', width: '130px' }}>رقم التشغيلة</th>
                          <th style={{ padding: '8px', width: '130px' }}>تاريخ الصلاحية</th>
                          <th style={{ padding: '8px', width: '40px' }}>حذف</th>
                        </tr>
                      </thead>
                      <tbody>
                        {issItems.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '6px' }}>
                              <select
                                className="form-select"
                                style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                                value={item.ItemName}
                                onChange={(e) => updateIssItem(idx, 'ItemName', e.target.value)}
                              >
                                {initialItems.map((itm) => (
                                  <option key={itm.Id} value={itm.Name}>
                                    {itm.Code} - {itm.Name} (الرصيد الفعلي: {itm.ActualStock})
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td style={{ padding: '6px' }}>
                              <input
                                type="number"
                                className="form-input"
                                style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                                value={item.Quantity}
                                onChange={(e) => updateIssItem(idx, 'Quantity', e.target.value)}
                                min="1"
                                required
                              />
                            </td>
                            <td style={{ padding: '6px' }}>
                              <input
                                type="text"
                                className="form-input"
                                style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                                value={item.Unit}
                                onChange={(e) => updateIssItem(idx, 'Unit', e.target.value)}
                              />
                            </td>
                            <td style={{ padding: '6px' }}>
                              <input
                                type="text"
                                className="form-input"
                                style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                                value={item.BatchNumber}
                                onChange={(e) => updateIssItem(idx, 'BatchNumber', e.target.value)}
                                placeholder="BTH-..."
                                required
                              />
                            </td>
                            <td style={{ padding: '6px' }}>
                              <input
                                type="date"
                                className="form-input"
                                style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                                value={item.ExpiryDate}
                                onChange={(e) => updateIssItem(idx, 'ExpiryDate', e.target.value)}
                                required
                              />
                            </td>
                            <td style={{ padding: '6px', textAlign: 'center' }}>
                              {issItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeIssItem(idx)}
                                  style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer' }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">أمين الخزينة / المخزن القائم بالصرف</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newIss.StorekeeperName}
                      onChange={(e) => setNewIss({ ...newIss, StorekeeperName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ملاحظات الصرف والتسليم</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newIss.Notes}
                      onChange={(e) => setNewIss({ ...newIss, Notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddIssueModal(false)}>
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{ background: '#dc2626', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Save size={16} />
                  اعتماد وحفظ إذن الصرف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نموذج معاينة وطباعة وتصدير الإذن الرسمي */}
      {showPreviewModal && previewVoucher && (
        <div className="modal-overlay" onClick={() => setShowPreviewModal(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '880px', width: '95%', maxHeight: '92vh', overflowY: 'auto', padding: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary"
                  onClick={handlePrintVoucher}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                  title="طباعة الإذن الورقي الرسمي بحجم A4"
                >
                  <Printer size={16} />
                  طباعة المستند الرسمي
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleExportPDF}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                  title="تصدير وحفظ المستند بصيغة PDF"
                >
                  <FileText size={16} />
                  تصدير PDF
                </button>
                <button
                  className="btn"
                  onClick={handleExportExcel}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#15803d',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  title="تصدير تفاصيل وبنود الإذن إلى جدول Excel"
                >
                  <FileSpreadsheet size={16} />
                  تصدير بيانات الإذن (Excel)
                </button>
              </div>
              <button className="modal-close" onClick={() => setShowPreviewModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div
              id="printable-voucher"
              style={{
                border: '2px solid #0f172a',
                padding: '28px',
                borderRadius: '8px',
                background: '#ffffff',
                color: '#0f172a',
                fontFamily: 'Cairo, sans-serif',
              }}
            >
              {/* شريط حالة الوثيقة الرسمي في المعاينة والطباعة */}
              {previewVoucher.type === 'inbound' ? (
                previewVoucher.data.Status === 'معتمد' ? (
                  <div
                    style={{
                      background: '#f0fdf4',
                      border: '1.5px solid #16a34a',
                      color: '#15803d',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      marginBottom: '14px',
                      textAlign: 'center',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <CheckCircle2 size={18} />
                    <span>وثيقة رسمية معتمدة: تم اعتماد إذن الاستلام وتأكيد إدخال الأصناف للرصيد الفعلي للمخزن</span>
                  </div>
                ) : (
                  <div
                    style={{
                      background: '#fffbeb',
                      border: '1.5px solid #f59e0b',
                      color: '#b45309',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      marginBottom: '14px',
                      textAlign: 'center',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <AlertCircle size={18} />
                    <span>تنبيه: مسودة إذن استلام (قيد المراجعة والتدقيق الفني) - الأصناف تحت الفحص المؤقت وغير معتمدة نهائياً بعد</span>
                  </div>
                )
              ) : (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1.5px solid #dc2626',
                    color: '#991b1b',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    marginBottom: '14px',
                    textAlign: 'center',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <CheckCircle2 size={18} />
                  <span>وثيقة رسمية معتمدة: إذن صرف مواد ومستلزمات طبية وتوثيق تسليمها للجهة المستفيدة</span>
                </div>
              )}

              {/* الترويسة الحكومية المعتمدة */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '16px' }}>
                <div style={{ textAlign: 'right', fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.6 }}>
                  <div>دولة ليبيــــا</div>
                  <div>وزارة الصحــــة</div>
                  <div style={{ fontWeight: 800, color: '#b91c1c' }}>الهيئة الوطنية لخدمات نقل الدم</div>
                  <div>إدارة الشؤون المخزنية والتموين الطبي</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <img
                    src="./logo.png"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = './logo.png';
                    }}
                    alt="شعار الهيئة"
                    style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                  />
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '4px', color: '#475569' }}>
                    بطاقة الاعتماد المخزني
                  </div>
                </div>

                <div style={{ textAlign: 'left', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: previewVoucher.type === 'inbound' ? '#15803d' : '#b91c1c' }}>
                    {previewVoucher.type === 'inbound' ? 'إذن استلام مخزني (وارد)' : 'إذن صرف مخزني (منصرف)'}
                  </div>
                  <div>رقم الإذن: <strong style={{ fontFamily: 'monospace', fontSize: '1.05rem', color: '#0f172a' }}>{previewVoucher.data.VoucherNumber}</strong></div>
                  <div>تاريخ العملية: <strong>{previewVoucher.data.Date}</strong></div>
                  <div>المخزن: <strong>{previewVoucher.data.Warehouse}</strong></div>
                </div>
              </div>

              {/* بطاقات البيانات الرسمية للمسلّم والمستلم */}
              {previewVoucher.type === 'outbound' ? (
                /* بيانات إذن الصرف: الطرف المسلّم والطرف المستلم بشكل مفصل */
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                  {/* الطرف الأول: المسلّم */}
                  <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '8px', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1.5px solid #cbd5e1', paddingBottom: '8px', marginBottom: '10px' }}>
                      <Building2 size={18} style={{ color: '#0f172a' }} />
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>الطرف الأول: المُسلِّم (إدارة المخازن المركزية)</strong>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.86rem' }}>
                      <div>المخزن الصادر منه: <strong>{(previewVoucher.data as IssueVoucher).Warehouse}</strong></div>
                      <div>اسم أمين المخزن المسلِّم: <strong>{(previewVoucher.data as IssueVoucher).StorekeeperName}</strong></div>
                      <div>الصفة الوظيفية: <strong>أمين مخازن وتموين طبي معتمد</strong></div>
                      <div>تاريخ وساعة الصرف: <strong>{(previewVoucher.data as IssueVoucher).Date}</strong></div>
                      <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed #cbd5e1', fontSize: '0.78rem', color: '#475569', fontStyle: 'italic' }}>
                        إقرار المُسلِّم: تم صرف وفحص وتجهيز كافة الأصناف الموضحة بالجدول أدناه كاملة ومطابقة للمواصفات وفي درجات الحرارة المقررة.
                      </div>
                    </div>
                  </div>

                  {/* الطرف الثاني: المستلم */}
                  <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '8px', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1.5px solid #fca5a5', paddingBottom: '8px', marginBottom: '10px' }}>
                      <User size={18} style={{ color: '#b91c1c' }} />
                      <strong style={{ fontSize: '0.95rem', color: '#b91c1c' }}>الطرف الثاني: المُستلِم (الجهة المستفيدة والمندوب)</strong>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.86rem' }}>
                      <div>الجهة المستفيدة: <strong style={{ color: '#b91c1c' }}>{(previewVoucher.data as IssueVoucher).BeneficiaryName}</strong></div>
                      <div>اسم المندوب المُستلِم: <strong>{(previewVoucher.data as IssueVoucher).ReceiverName}</strong></div>
                      <div>الرقم الوطني / الهوية: <strong>{(previewVoucher.data as IssueVoucher).ReceiverIdNumber || '-'}</strong></div>
                      <div>رقم هاتف التواصل: <strong style={{ direction: 'ltr', display: 'inline-block' }}>{(previewVoucher.data as IssueVoucher).ReceiverPhone}</strong></div>
                      <div>الغرض من الصرف: <strong>{(previewVoucher.data as IssueVoucher).Purpose || 'تزويد دوري لاحتياجات مصرف الدم'}</strong></div>
                      <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed #fca5a5', fontSize: '0.78rem', color: '#7f1d1d', fontStyle: 'italic' }}>
                        إقرار المُستلِم: عاينت واستلمت كافة الأصناف والكميات المبينة أدناه كاملة وسليمة ومطابقة للمواصفات وتحت مسؤوليتي المباشرة لنقلها وتخزينها طبياً.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* بيانات إذن الاستلام: المورد ومندوب التسليم والمخزن المستلم */
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '14px 18px', marginBottom: '16px', fontSize: '0.9rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <div>المورد / الشركة: <strong>{(previewVoucher.data as ReceivingVoucher).SupplierName}</strong></div>
                    <div>اسم مندوب المورد: <strong>{(previewVoucher.data as ReceivingVoucher).DelegateName}</strong></div>
                    <div>هاتف المندوب: <strong style={{ direction: 'ltr', display: 'inline-block' }}>{(previewVoucher.data as ReceivingVoucher).DelegatePhone}</strong></div>
                    <div>رقم أمر الشراء / التكليف: <strong>{(previewVoucher.data as ReceivingVoucher).PoNumber || '-'}</strong></div>
                    <div>الرقم الوطني / الهوية: <strong>{(previewVoucher.data as ReceivingVoucher).DelegateIdNumber || '-'}</strong></div>
                    <div>أمين المخزن المستلم: <strong>{(previewVoucher.data as ReceivingVoucher).StorekeeperName}</strong></div>
                  </div>
                </div>
              )}

              {/* جدول تفاصيل الأصناف الكاملة */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                    <th style={{ border: '1px solid #cbd5e1', padding: '8px', width: '35px' }}>#</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '8px', width: '90px' }}>كود الصنف</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '8px' }}>اسم الصنف الطبي والمواصفات الكاملة</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '8px', width: '95px' }}>
                      {previewVoucher.type === 'inbound' ? 'الكمية المستلمة' : 'الكمية المصروفة'}
                    </th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '8px', width: '70px' }}>الوحدة</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '8px', width: '130px' }}>رقم التشغيلة (Batch No)</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '8px', width: '105px' }}>تاريخ الصلاحية</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '8px', width: '110px' }}>حرارة وحفظ النقل</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '8px', width: '95px' }}>حالة التسليم</th>
                  </tr>
                </thead>
                <tbody>
                  {previewVoucher.data.Items.map((item, idx) => (
                    <tr key={idx} style={{ textAlign: 'center', border: '1px solid #cbd5e1' }}>
                      <td style={{ border: '1px solid #cbd5e1', padding: '8px' }}>{idx + 1}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '8px', fontWeight: 600 }}>{item.ItemCode}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'right', fontWeight: 600 }}>{item.ItemName}</td>
                      <td
                        style={{
                          border: '1px solid #cbd5e1',
                          padding: '8px',
                          fontWeight: 700,
                          color: previewVoucher.type === 'inbound' ? '#15803d' : '#dc2626',
                          fontSize: '0.95rem',
                        }}
                      >
                        {item.Quantity}
                      </td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '8px' }}>{item.Unit}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '8px', direction: 'ltr', fontFamily: 'monospace' }}>{item.BatchNumber}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '8px' }}>{item.ExpiryDate}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '8px' }}>{item.StorageType || 'ثلاجة 2-6°C'}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '8px', color: '#16a34a', fontWeight: 700 }}>سليم ومطابق</td>
                    </tr>
                  ))}
                  <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                    <td colSpan={3} style={{ border: '1px solid #cbd5e1', padding: '10px 8px', textAlign: 'left' }}>
                      {previewVoucher.type === 'inbound' ? 'الإجمـــــالي الكلي للكميات المستلمة:' : 'الإجمـــــالي الكلي للكميات المصروفة:'}
                    </td>
                    <td
                      style={{
                        border: '1px solid #cbd5e1',
                        padding: '10px 8px',
                        textAlign: 'center',
                        color: previewVoucher.type === 'inbound' ? '#15803d' : '#b91c1c',
                        fontSize: '1.05rem',
                      }}
                    >
                      {previewVoucher.data.TotalQuantity.toLocaleString()}
                    </td>
                    <td colSpan={5} style={{ border: '1px solid #cbd5e1', padding: '10px 8px' }}></td>
                  </tr>
                </tbody>
              </table>

              <div style={{ marginBottom: '24px', fontSize: '0.85rem' }}>
                <strong>الملاحظات والتعليمات الرسمية:</strong> {previewVoucher.data.Notes || 'لا توجد ملاحظات إضافية'}
              </div>

              {/* التوقيعات المعتمدة الثلاثية */}
              <div className="voucher-signatures" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', textAlign: 'center', borderTop: '2px dashed #94a3b8', paddingTop: '16px' }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '40px' }}>
                    {previewVoucher.type === 'inbound' ? 'توقيع مندوب الشركة المسلّم' : 'توقيع وإقرار مندوب الجهة المستلمة'}
                  </div>
                  <div style={{ borderBottom: '1px dotted #000', width: '80%', margin: '0 auto 6px' }}></div>
                  <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>
                    {previewVoucher.type === 'inbound'
                      ? (previewVoucher.data as ReceivingVoucher).DelegateName
                      : (previewVoucher.data as IssueVoucher).ReceiverName}
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 700, marginBottom: '40px' }}>
                    {previewVoucher.type === 'inbound' ? 'توقيع أمين المخزن المستلم' : 'توقيع وإقرار أمين المخزن المسلّم'}
                  </div>
                  <div style={{ borderBottom: '1px dotted #000', width: '80%', margin: '0 auto 6px' }}></div>
                  <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>{previewVoucher.data.StorekeeperName}</div>
                </div>

                <div>
                  <div style={{ fontWeight: 700, marginBottom: '40px' }}>اعتماد وختم مدير إدارة المخازن والتوزيع</div>
                  <div style={{ borderBottom: '1px dotted #000', width: '80%', margin: '0 auto 6px' }}></div>
                  <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>ختم واعتماد الإدارة العامة</div>
                </div>
              </div>

              {/* تذييل المستند الرسمي */}
              <div
                style={{
                  marginTop: '24px',
                  paddingTop: '12px',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.75rem',
                  color: '#64748b',
                }}
              >
                <div>منظومة إدارة المخازن المركزية - الهيئة الوطنية لخدمات نقل الدم (مستند إلكتروني رسمي معتمد)</div>
                <div>تاريخ الاستخراج: {new Date().toLocaleDateString('ar-LY')}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* إشعار Toast للعمليات */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            zIndex: 9999,
            background: toastMessage.type === 'success' ? '#15803d' : toastMessage.type === 'warning' ? '#b45309' : '#0f172a',
            color: '#ffffff',
            padding: '14px 22px',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 700,
            fontSize: '0.92rem',
          }}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '30px', textAlign: 'center' }}>جاري تحميل أذونات الاستلام والصرف...</div>}>
      <TransactionsContent />
    </Suspense>
  );
}
