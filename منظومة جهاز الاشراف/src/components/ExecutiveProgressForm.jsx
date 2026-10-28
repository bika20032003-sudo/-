import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  FileSpreadsheet, Printer, Save, RefreshCw, Plus, Trash2, 
  CheckCircle2, AlertCircle, Edit3, Eye, FileText, Send, 
  HelpCircle, UserCheck, Shield, Award, DollarSign, Calendar,
  TrendingUp, BarChart3, ChevronLeft, ArrowDownRight, Layers
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { fastFetch, clearApiCache } from '../utils/apiCache.js';
import { OfficialPrintModal } from './OfficialPrintModal';

// Default initial data matching the approved executive progress document (24/10/2026)
export const initialExecutiveData = {
  projectName: 'مشروع صيانة طريق اوباري غات بطول 360 كيلومتر',
  reportTitle: 'الموقف التنفيذي.',
  contractValue: 897665675.030,
  currency: 'دينار',
  reportDate: '2026-10-24',
  reportNumber: '093436_24.10.2026',
  basicItems: [
    {
      id: 1,
      section: 'أولاً: الدراسة والتصميم',
      itemNumber: '1',
      description: 'دراسة وتصميم كامل القطاع ويشمل العمل حساب حجم المرور وأخذ عينات من الطريق الحالي وتحديد حجم الضرر بالإضافة الى تصميم طبقة الاساس المعدل بطريقة ( FDR ) وتصميم طبقات الرصف التي تليها',
      unit: 'مقطوعية',
      contractQuantity: 1,
      executedQuantity: 0.875,
      remainingQuantity: 0.13,
      executedValue: 15401126.78,
      percentage: 87.50,
      notes: ''
    },
    {
      id: 2,
      section: 'ثانياً: أعمال الرصف',
      itemNumber: '2',
      description: 'كشط جزء من طبقات الاسفلت والاساس الحبيبي القائم وإعادة تدوير المواد الناتجة من عملية الكشط باستخدام تقنية إعادة تدوير كامل الرصف Full Depth Reclamation FDR ( بعد تعديل خواصها بالإضافات اللازمة ) وفرشها في طبقة جديدة اسفل كأساس لجسم الطريق وتشمل كافة الاختبارات اللازمة لتحديد نسب خلط المواد الإضافية وأسمنت والبودرة واستخدام المعدات الخاصة بالعمل والايادي العاملة واختبارات ضبط الجودة حسب المواصفات الفنية وتعليمات المهندس المشرف.',
      unit: 'م2',
      contractQuantity: 3060000.00,
      executedQuantity: 1211352.63,
      remainingQuantity: 848647.37,
      executedValue: 164113958.13,
      percentage: 72.27,
      notes: ''
    },
    {
      id: 3,
      section: 'ثانياً: أعمال الرصف',
      itemNumber: '3',
      description: 'توريد ورش طبقة تشريب نوع ( MC0 ) بمعدل 1.5 كجم / م2 على السطح النهائي للأساس الحبيبي بعرض واجهة تشمل ثمن المواد وتكاليف النقل ونظافة السطح قبل رشه والآلات والمعدات والأيدي العاملة وكل ما يلزم لنهو العمل والمعتمدة بالمتر المسطح طبقاً للمواصفات الفنية وتعليمات المهندس المشرف',
      unit: 'م2',
      contractQuantity: 3060000.00,
      executedQuantity: 2160442.47,
      remainingQuantity: 899557.53,
      executedValue: 29662875.11,
      percentage: 70.60,
      notes: ''
    },
    {
      id: 4,
      section: 'ثانياً: أعمال الرصف',
      itemNumber: '4',
      description: 'توريد وفرش طبقة اسفلتية سطحية محسنة باستخدام البوليمر بسمك 6 سم وبعرض 9.00 م والدك والتسوية طبقاً للمواصفات الفنية وتعليمات المهندس المشرف',
      unit: 'م2',
      contractQuantity: 3060000.00,
      executedQuantity: 2120114.47,
      remainingQuantity: 939885.53,
      executedValue: 308158638.21,
      percentage: 69.28,
      notes: ''
    },
    {
      id: 5,
      section: 'ثالثاً: الأعمال الإرشادية',
      itemNumber: '5',
      description: 'تركيب علامات الإرشاد ويشمل هذا البند توريد وتركيب ودعامات لافتات الإرشاد ووضعها في اماكنها وذلك تشمل توريد الاعمدة واللوحات اللازمة وكذلك ثمن المواد والنقل والتوزيع والطلاء العاكس والكتابة وتثبيت العلامات في المواقع المعتمدة بقواعد خرسانية طبقاً للمواصفات الفنية وتعليمات المهندس المشرف',
      unit: 'عدد',
      contractQuantity: 72.00,
      executedQuantity: 0.00,
      remainingQuantity: 72.00,
      executedValue: 0.00,
      percentage: 0.00,
      notes: ''
    },
    {
      id: 6,
      section: 'ثالثاً: الأعمال الإرشادية',
      itemNumber: '6',
      description: 'تركيب علامات أرضية لتحديد السرعة ( عواكس أرضية ) وتشمل وضع وحواف الطريق حسب المواصفات الفنية المعمول بها',
      unit: 'عدد',
      contractQuantity: 1080.00,
      executedQuantity: 0.00,
      remainingQuantity: 1080.00,
      executedValue: 0.00,
      percentage: 0.00,
      notes: ''
    },
    {
      id: 7,
      section: 'ثالثاً: الأعمال الإرشادية',
      itemNumber: '7',
      description: 'تركيب السياج المعدني الواقي ويشمل هذا البند إزالة الاسوار المرنة التالفة والاعمدة المتضررة وإبعادها عن حرم الطريق مع توريد وتركيب أسوار مرنة جديدة في الأماكن وتنظيفها حسب المواصفات.',
      unit: 'م.ط',
      contractQuantity: 2160.00,
      executedQuantity: 500.00,
      remainingQuantity: 1660.00,
      executedValue: 602615.00,
      percentage: 23.15,
      notes: ''
    },
    {
      id: 8,
      section: 'رابعاً: أعمال الطلاء',
      itemNumber: '8',
      description: 'جلاء سطح الطريق ويشمل هذا البند تنظيف سطح الطريق من الأتربة والمواد العالقة وتوريد طلاء',
      unit: 'م.ط',
      contractQuantity: 720000.00,
      executedQuantity: 402403.00,
      remainingQuantity: 317597.00,
      executedValue: 9281437.21,
      percentage: 55.89,
      notes: ''
    },
    {
      id: 9,
      section: 'رابعاً: أعمال الطلاء',
      itemNumber: '9',
      description: 'خطوط صفراء على جانبي الطريق بعرض 15 سم',
      unit: 'م.ط',
      contractQuantity: 240000.00,
      executedQuantity: 180646.00,
      remainingQuantity: 59354.00,
      executedValue: 4167503.22,
      percentage: 75.27,
      notes: ''
    },
    {
      id: 10,
      section: 'رابعاً: أعمال الطلاء',
      itemNumber: '10',
      description: 'خطوط بيضاء متقطعة بمحور الطريق بعرض 15 سم',
      unit: 'م.ط',
      contractQuantity: 120000.00,
      executedQuantity: 19967.00,
      remainingQuantity: 100033.00,
      executedValue: 460638.69,
      percentage: 16.64,
      notes: ''
    }
  ],
  additionalItems: [
    {
      id: 1,
      itemNumber: '1',
      description: 'طبقة أساس حبيبي',
      unit: 'م3',
      contractQuantity: '',
      executedQuantity: 207597.43,
      remainingQuantity: '',
      executedValue: 80149285.76,
      percentage: '',
      notes: ''
    },
    {
      id: 2,
      itemNumber: '2',
      description: 'الطريق الخدمي',
      unit: 'كيلومتر',
      contractQuantity: '',
      executedQuantity: 225.623,
      remainingQuantity: '',
      executedValue: 13424568.50,
      percentage: '',
      notes: ''
    }
  ],
  signatories: {
    preparedBy: 'جهاز الإشراف الميداني',
    projectManager: 'م. عبدالرحمن الأنصاري (مدير المشروع)',
    headOfSupervision: 'م. عبدالسلام ابريكاو (رئيس جهاز الإشراف)'
  }
};

export const ExecutiveProgressForm = ({ 
  currentUser, 
  onSaved, 
  onPrint, 
  onPrintReport,
  onNavigateTab,
  onDataChange,
  readOnlyMode = false 
}) => {
  const [data, setData] = useState(initialExecutiveData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [activeTabSection, setActiveTabSection] = useState('all'); // 'all' | 'basic' | 'additional'
  const [showPrintModal, setShowPrintModal] = useState(false);
  const printRef = useRef(null);

  // Clean text and force standard regular Latin digits (0-9)
  const toCleanLatin = (val) => {
    if (val === null || val === undefined) return '';
    return String(val)
      .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
      .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
      .replace(/٫/g, '.')
      .replace(/[٬،]/g, '');
  };

  const cleanAllItemNumbers = (items = []) => {
    return items.map(item => ({
      ...item,
      itemNumber: toCleanLatin(item.itemNumber),
      contractQuantity: item.contractQuantity !== '' && item.contractQuantity !== null && item.contractQuantity !== undefined ? toCleanLatin(item.contractQuantity) : '',
      executedQuantity: item.executedQuantity !== '' && item.executedQuantity !== null && item.executedQuantity !== undefined ? toCleanLatin(item.executedQuantity) : '',
      remainingQuantity: item.remainingQuantity !== '' && item.remainingQuantity !== null && item.remainingQuantity !== undefined ? toCleanLatin(item.remainingQuantity) : '',
      executedValue: item.executedValue !== '' && item.executedValue !== null && item.executedValue !== undefined ? toCleanLatin(item.executedValue) : '',
      percentage: item.percentage !== '' && item.percentage !== null && item.percentage !== undefined ? toCleanLatin(item.percentage) : ''
    }));
  };

  // Load latest data from API or localStorage
  useEffect(() => {
    const loadExecutiveData = async () => {
      setIsLoading(true);
      try {
        const res = await fastFetch('http://localhost:5000/api/executive-progress');
        if (res && res.data && res.data.basicItems) {
          const cleanData = {
            ...res.data,
            contractValue: toCleanLatin(res.data.contractValue),
            reportDate: toCleanLatin(res.data.reportDate),
            reportNumber: toCleanLatin(res.data.reportNumber),
            basicItems: cleanAllItemNumbers(res.data.basicItems),
            additionalItems: cleanAllItemNumbers(res.data.additionalItems)
          };
          setData(cleanData);
          try {
            localStorage.setItem('executive_progress_data', JSON.stringify(cleanData));
          } catch (_) {}
        } else {
          const local = localStorage.getItem('executive_progress_data');
          if (local) {
            const parsed = JSON.parse(local);
            const cleanData = {
              ...parsed,
              contractValue: toCleanLatin(parsed.contractValue),
              reportDate: toCleanLatin(parsed.reportDate),
              reportNumber: toCleanLatin(parsed.reportNumber),
              basicItems: cleanAllItemNumbers(parsed.basicItems),
              additionalItems: cleanAllItemNumbers(parsed.additionalItems)
            };
            setData(cleanData);
            try {
              localStorage.setItem('executive_progress_data', JSON.stringify(cleanData));
            } catch (_) {}
          }
        }
      } catch (e) {
        console.warn('Using initial executive progress data fallback:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadExecutiveData();
  }, []);

  // Format regular numbers (0-9) with commas and decimals
  const fmt = (num, minFraction = 2, maxFraction = 2) => {
    if (num === null || num === undefined || num === '') return '—';
    const val = parseFloat(toCleanLatin(num));
    if (isNaN(val)) return num;
    return val.toLocaleString('en-US', { minimumFractionDigits: minFraction, maximumFractionDigits: maxFraction });
  };

  // Calculations
  const calculations = useMemo(() => {
    const basicItems = data.basicItems || [];
    const additionalItems = data.additionalItems || [];

    const basicExecutedSum = basicItems.reduce((acc, curr) => acc + (parseFloat(toCleanLatin(curr.executedValue)) || 0), 0);
    const additionalExecutedSum = additionalItems.reduce((acc, curr) => acc + (parseFloat(toCleanLatin(curr.executedValue)) || 0), 0);
    const grandExecutedSum = basicExecutedSum + additionalExecutedSum;

    const contractVal = parseFloat(toCleanLatin(data.contractValue)) || 897665675.030;
    const grandRemainingVal = Math.max(0, contractVal - grandExecutedSum);

    const basicPercentage = contractVal > 0 ? parseFloat(((basicExecutedSum / contractVal) * 100).toFixed(2)) : 0;
    const overallFinancialPercentage = contractVal > 0 ? parseFloat(((grandExecutedSum / contractVal) * 100).toFixed(2)) : 0;

    return {
      contractVal,
      basicExecutedSum,
      additionalExecutedSum,
      grandExecutedSum,
      grandRemainingVal,
      basicPercentage,
      overallFinancialPercentage
    };
  }, [data]);

  // Handle Header field change
  const handleHeaderChange = (field, val) => {
    setData(prev => ({ ...prev, [field]: toCleanLatin(val) }));
  };

  // Handle Basic Item change
  const handleBasicItemChange = (idx, field, val) => {
    const cleanVal = toCleanLatin(val);
    setData(prev => {
      const updated = [...prev.basicItems];
      const item = { ...updated[idx], [field]: cleanVal };

      // Auto compute remaining & percentage when contractQuantity or executedQuantity changes
      if (field === 'contractQuantity' || field === 'executedQuantity') {
        const cQ = field === 'contractQuantity' ? parseFloat(cleanVal) : parseFloat(toCleanLatin(item.contractQuantity));
        const eQ = field === 'executedQuantity' ? parseFloat(cleanVal) : parseFloat(toCleanLatin(item.executedQuantity));
        if (!isNaN(cQ) && !isNaN(eQ)) {
          item.remainingQuantity = String(parseFloat(Math.max(0, cQ - eQ).toFixed(2)));
          if (cQ > 0) {
            item.percentage = String(parseFloat(((eQ / cQ) * 100).toFixed(2)));
          }
        }
      }

      updated[idx] = item;
      return { ...prev, basicItems: updated };
    });
  };

  // Handle Additional Item change
  const handleAdditionalItemChange = (idx, field, val) => {
    const cleanVal = toCleanLatin(val);
    setData(prev => {
      const updated = [...prev.additionalItems];
      updated[idx] = { ...updated[idx], [field]: cleanVal };
      return { ...prev, additionalItems: updated };
    });
  };

  // Add new item
  const handleAddBasicItem = () => {
    const newItem = {
      id: Date.now(),
      section: 'ثانياً: أعمال الرصف',
      itemNumber: String(data.basicItems.length + 1),
      description: 'بند عمل جديد',
      unit: 'م2',
      contractQuantity: 0,
      executedQuantity: 0,
      remainingQuantity: 0,
      executedValue: 0,
      percentage: 0,
      notes: ''
    };
    setData(prev => ({
      ...prev,
      basicItems: [...prev.basicItems, newItem]
    }));
  };

  // Delete item
  const handleDeleteBasicItem = (id) => {
    setData(prev => ({
      ...prev,
      basicItems: prev.basicItems.filter(item => item.id !== id)
    }));
  };

  // Save to API & LocalStorage
  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    const payload = {
      ...data,
      basicTotals: {
        executedValue: calculations.basicExecutedSum,
        percentage: calculations.basicPercentage
      },
      additionalTotals: {
        executedValue: calculations.additionalExecutedSum
      },
      grandTotals: {
        contractValue: calculations.contractVal,
        totalExecutedValue: calculations.grandExecutedSum,
        totalRemainingValue: calculations.grandRemainingVal,
        overallFinancialPercentage: calculations.overallFinancialPercentage,
        basicItemsPercentage: calculations.basicPercentage
      }
    };

    try {
      const res = await fastFetch('http://localhost:5000/api/executive-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      localStorage.setItem('executive_progress_data', JSON.stringify(payload));
      clearApiCache();
      setStatusMessage({ type: 'success', text: 'تم حفظ وتثبيت بيانات الموقف التنفيذي بنجاح في قاعدة البيانات!' });
      if (onSaved) onSaved(payload);
    } catch (e) {
      console.error(e);
      localStorage.setItem('executive_progress_data', JSON.stringify(payload));
      setStatusMessage({ type: 'success', text: 'تم حفظ البيانات محلياً بنجاح!' });
      if (onSaved) onSaved(payload);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to original standard data from PDF
  const handleResetToStandard = () => {
    if (window.confirm('هل تريد استعادة البيانات الأصلية المعتمدة للموقف التنفيذي؟')) {
      setData(initialExecutiveData);
      setStatusMessage({ type: 'info', text: 'تمت استعادة البيانات القياسية المعتمدة للمشروع.' });
    }
  };

  // Export to Excel matching the exact columns
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // 1. Basic Items
    const basicRows = data.basicItems.map(item => ({
      'البند': item.itemNumber,
      'القسم': item.section,
      'الوصف': item.description,
      'الوحدة': item.unit,
      'كمية العقد': item.contractQuantity,
      'المنفذ': item.executedQuantity,
      'المتبقي': item.remainingQuantity,
      'قيمة المنفذ (د.ل)': item.executedValue,
      'النسبة %': item.percentage ? `${item.percentage}%` : '—',
      'ملاحظات': item.notes || ''
    }));

    // Subtotal row
    basicRows.push({
      'البند': '—',
      'القسم': 'إجمالي البنود الأساسية',
      'الوصف': 'إجمالي قيمة ونسبة البنود الأساسية',
      'الوحدة': '—',
      'كمية العقد': '—',
      'المنفذ': '—',
      'المتبقي': '—',
      'قيمة المنفذ (د.ل)': calculations.basicExecutedSum,
      'النسبة %': `${calculations.basicPercentage}%`,
      'ملاحظات': ''
    });

    const wsBasic = XLSX.utils.json_to_sheet(basicRows);
    XLSX.utils.book_append_sheet(wb, wsBasic, 'البنود الأساسية');

    // 2. Additional Items
    const addRows = data.additionalItems.map(item => ({
      'البند': item.itemNumber,
      'الوصف': item.description,
      'الوحدة': item.unit,
      'المنفذ': item.executedQuantity,
      'قيمة المنفذ (د.ل)': item.executedValue,
      'ملاحظات': item.notes || ''
    }));

    addRows.push({
      'البند': '—',
      'الوصف': 'إجمالي البنود الإضافية',
      'الوحدة': '—',
      'المنفذ': '—',
      'قيمة المنفذ (د.ل)': calculations.additionalExecutedSum,
      'ملاحظات': ''
    });

    const wsAdd = XLSX.utils.json_to_sheet(addRows);
    XLSX.utils.book_append_sheet(wb, wsAdd, 'البنود الإضافية');

    XLSX.writeFile(wb, `الموقف_التنفيذي_طريق_اوباري_غات_360كم_${data.reportDate}.xlsx`);
  };

  // Prepare full data payload for official print layout
  const getReportDataForPrint = () => ({
    isExecutiveProgressReport: true,
    reportType: 'الموقف التنفيذي',
    reportCategory: 'executive',
    projectName: data.projectName,
    reportTitle: data.reportTitle,
    contractValue: calculations.contractVal,
    currency: data.currency || 'دينار',
    reportDate: data.reportDate,
    reportNumber: data.reportNumber,
    basicItems: data.basicItems,
    additionalItems: data.additionalItems,
    calculations: calculations,
    signatories: data.signatories || initialExecutiveData.signatories
  });

  // Official Print
  const handlePrint = () => {
    const reportData = getReportDataForPrint();
    if (onPrintReport) {
      onPrintReport(reportData);
    } else if (onPrint) {
      onPrint(reportData);
    } else {
      setShowPrintModal(true);
    }
  };

  return (
    <div className="executive-progress-container" style={{ direction: 'rtl', fontFamily: 'inherit' }}>
      {/* Top Action Bar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
          }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                {data.projectName}
              </h2>
              <span style={{
                background: '#f0fdf4',
                color: '#166534',
                fontSize: '0.78rem',
                padding: '0.2rem 0.65rem',
                borderRadius: '6px',
                fontWeight: 800,
                border: '1px solid #bbf7d0'
              }}>
                الموقف التنفيذي المالي والفني
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.2rem' }}>
              وثيقة الموقف التنفيذي المعتمدة لمشروع طريق أوباري - غات (360 كم) بقيمة عقد 897,665,675.030 دينار
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {!readOnlyMode && (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              style={{
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.86rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)'
              }}
            >
              <Save size={16} />
              <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات في المنظومة'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportExcel}
            style={{
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer'
            }}
          >
            <FileSpreadsheet size={16} />
            <span>تصدير Excel</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            style={{
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer'
            }}
          >
            <Printer size={16} />
            <span>طباعة الموقف التنفيذي (PDF)</span>
          </button>

          {!readOnlyMode && (
            <button
              type="button"
              onClick={handleResetToStandard}
              title="استعادة البيانات القياسية المعتمدة"
              style={{
                background: '#f8fafc',
                color: '#64748b',
                border: '1px solid #cbd5e1',
                padding: '0.55rem 0.85rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.86rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={15} />
              <span>إعادة ضبط</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Notification Message */}
      {statusMessage && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: '10px',
          marginBottom: '1.25rem',
          background: statusMessage.type === 'success' ? '#f0fdf4' : '#eff6ff',
          border: `1px solid ${statusMessage.type === 'success' ? '#86efac' : '#93c5fd'}`,
          color: statusMessage.type === 'success' ? '#166534' : '#1e40af',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 700,
          fontSize: '0.88rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>✕</button>
        </div>
      )}

      {/* 4 Financial & Executive Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {/* Card 1: Contract Value */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
          borderRadius: '14px',
          padding: '1.25rem',
          color: '#ffffff',
          boxShadow: '0 4px 14px rgba(30, 58, 138, 0.2)'
        }}>
          <span style={{ fontSize: '0.82rem', color: '#93c5fd', fontWeight: 700 }}>قيمة العقد المعتمدة</span>
          <div style={{ fontSize: '1.55rem', fontWeight: 900, margin: '0.35rem 0', direction: 'ltr', textAlign: 'right' }}>
            {fmt(calculations.contractVal)} <span style={{ fontSize: '0.85rem' }}>د.ل</span>
          </div>
          <span style={{ fontSize: '0.74rem', color: '#bfdbfe' }}>
            مشروع صيانة طريق أوباري - غات (360 كم)
          </span>
        </div>

        {/* Card 2: Executed Value */}
        <div style={{
          background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
          borderRadius: '14px',
          padding: '1.25rem',
          color: '#ffffff',
          boxShadow: '0 4px 14px rgba(22, 163, 74, 0.2)'
        }}>
          <span style={{ fontSize: '0.82rem', color: '#bbf7d0', fontWeight: 700 }}>إجمالي المنفذ (أساسي + إضافي)</span>
          <div style={{ fontSize: '1.55rem', fontWeight: 900, margin: '0.35rem 0', direction: 'ltr', textAlign: 'right' }}>
            {fmt(calculations.grandExecutedSum)} <span style={{ fontSize: '0.85rem' }}>د.ل</span>
          </div>
          <span style={{ fontSize: '0.74rem', color: '#dcfce7' }}>
            نسبة الإنجاز المالي العام: <strong dir="ltr">%{calculations.overallFinancialPercentage}</strong>
          </span>
        </div>

        {/* Card 3: Basic Items Value & Rate */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #e2e8f0',
          borderRadius: '14px',
          padding: '1.25rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 800 }}>منجز البنود الأساسية التعاقدية</span>
          <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#0f172a', margin: '0.35rem 0', direction: 'ltr', textAlign: 'right' }}>
            {fmt(calculations.basicExecutedSum)} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>د.ل</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', fontWeight: 800, fontSize: '0.82rem' }}>
            <TrendingUp size={15} />
            <span>نسبة إنجاز الأساسية: <strong dir="ltr">%{calculations.basicPercentage}</strong></span>
          </div>
        </div>

        {/* Card 4: Remaining Value */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #fed7aa',
          borderRadius: '14px',
          padding: '1.25rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
          <span style={{ fontSize: '0.82rem', color: '#c2410c', fontWeight: 800 }}>المتبقي المالي من العقد</span>
          <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#ea580c', margin: '0.35rem 0', direction: 'ltr', textAlign: 'right' }}>
            {fmt(calculations.grandRemainingVal)} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>د.ل</span>
          </div>
          <span style={{ fontSize: '0.74rem', color: '#9a3412' }}>
            قيمة الأعمال المتبقية لاستكمال المشروع
          </span>
        </div>
      </div>

      {/* Header Info Panel (Editable inputs) */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.65rem' }}>
          <FileText size={18} color="#2563eb" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            بيانات ترويسة وتفاصيل الموقف التنفيذي
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
              اسم المشروع
            </label>
            <input
              type="text"
              value={data.projectName}
              disabled={readOnlyMode}
              onChange={(e) => handleHeaderChange('projectName', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontWeight: 800,
                color: '#0f172a',
                fontSize: '0.88rem'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
              عنوان التقرير
            </label>
            <input
              type="text"
              value={data.reportTitle}
              disabled={readOnlyMode}
              onChange={(e) => handleHeaderChange('reportTitle', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontWeight: 800,
                color: '#0f172a',
                fontSize: '0.88rem'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
              قيمة العقد (دينار)
            </label>
            <input
              type="text"
              inputMode="decimal"
              lang="en-US"
              dir="ltr"
              value={toCleanLatin(data.contractValue)}
              disabled={readOnlyMode}
              onChange={(e) => handleHeaderChange('contractValue', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontWeight: 900,
                color: '#1e40af',
                fontSize: '0.9rem',
                direction: 'ltr',
                textAlign: 'right',
                fontFamily: "'Segoe UI', Roboto, Tahoma, Arial, sans-serif"
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
              تاريخ الموقف
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                lang="en-US"
                dir="ltr"
                value={toCleanLatin(data.reportDate)}
                disabled={readOnlyMode}
                onChange={(e) => handleHeaderChange('reportDate', e.target.value)}
                placeholder="2026-10-24"
                style={{
                  width: '100%',
                  padding: '0.5rem 2rem 0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  direction: 'ltr',
                  textAlign: 'center',
                  fontFamily: "'Segoe UI', Roboto, Tahoma, Arial, sans-serif"
                }}
              />
              <input
                type="date"
                tabIndex={-1}
                aria-hidden="true"
                value={toCleanLatin(data.reportDate)}
                disabled={readOnlyMode}
                onChange={(e) => handleHeaderChange('reportDate', e.target.value)}
                style={{
                  position: 'absolute',
                  left: '6px',
                  width: '28px',
                  height: '28px',
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
              <Calendar size={16} color="#64748b" style={{ position: 'absolute', left: '10px', pointerEvents: 'none' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
              رقم الموقف / المرجع
            </label>
            <input
              type="text"
              lang="en-US"
              dir="ltr"
              value={toCleanLatin(data.reportNumber)}
              disabled={readOnlyMode}
              onChange={(e) => handleHeaderChange('reportNumber', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontWeight: 700,
                fontSize: '0.88rem',
                direction: 'ltr',
                textAlign: 'right',
                fontFamily: "'Segoe UI', Roboto, Tahoma, Arial, sans-serif"
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Table: Basic Items (بنود أساسية) */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{
              background: '#fef3c7',
              color: '#b45309',
              padding: '0.3rem 0.8rem',
              borderRadius: '6px',
              fontWeight: 900,
              fontSize: '0.85rem'
            }}>
              بنود أساسية
            </span>
            <span style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 700 }}>
              (تشمل الدراسة والتصميم، أعمال الرصف، الأعمال الإرشادية، وأعمال الطلاء)
            </span>
          </div>

          {!readOnlyMode && (
            <button
              type="button"
              onClick={handleAddBasicItem}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer'
              }}
            >
              <Plus size={15} />
              <span>إضافة بند أساسي جديد</span>
            </button>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ width: '45px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>البند</th>
                <th style={{ minWidth: '320px', padding: '0.6rem 0.75rem' }}>الوصف المعتمد للبند</th>
                <th style={{ width: '75px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>الوحدة</th>
                <th style={{ width: '110px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>كمية العقد</th>
                <th style={{ width: '110px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>المنفذ</th>
                <th style={{ width: '110px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>المتبقي</th>
                <th style={{ width: '140px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>قيمة المنفذ (د.ل)</th>
                <th style={{ width: '85px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>النسبة %</th>
                {!readOnlyMode && <th style={{ width: '50px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>حذف</th>}
              </tr>
            </thead>
            <tbody>
              {data.basicItems.map((item, idx) => {
                // Section Header banner if this is the first item of a section or section changes
                const prevItem = idx > 0 ? data.basicItems[idx - 1] : null;
                const showSectionHeader = !prevItem || prevItem.section !== item.section;

                return (
                  <React.Fragment key={item.id || idx}>
                    {showSectionHeader && item.section && (
                      <tr style={{ background: '#fef9c3', borderTop: '2px solid #facc15', borderBottom: '1px solid #fde047' }}>
                        <td colSpan={readOnlyMode ? 8 : 9} style={{ padding: '0.45rem 1rem', fontWeight: 900, color: '#854d0e', fontSize: '0.86rem' }}>
                          📂 {item.section}
                        </td>
                      </tr>
                    )}
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: '#475569' }}>
                        {readOnlyMode ? toCleanLatin(item.itemNumber) : (
                          <input
                            type="text"
                            lang="en-US"
                            dir="ltr"
                            value={toCleanLatin(item.itemNumber)}
                            onChange={(e) => handleBasicItemChange(idx, 'itemNumber', e.target.value)}
                            style={{ width: '38px', textAlign: 'center', padding: '0.2rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 800, direction: 'ltr', fontFamily: "'Segoe UI', Roboto, Tahoma, Arial, sans-serif" }}
                          />
                        )}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', lineHeight: '1.45' }}>
                        {readOnlyMode ? (
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>{item.description}</span>
                        ) : (
                          <textarea
                            rows={2}
                            value={item.description}
                            onChange={(e) => handleBasicItemChange(idx, 'description', e.target.value)}
                            style={{ width: '100%', padding: '0.35rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem', fontFamily: 'inherit' }}
                          />
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {readOnlyMode ? (
                          <span style={{ fontWeight: 700, color: '#64748b' }}>{item.unit}</span>
                        ) : (
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleBasicItemChange(idx, 'unit', e.target.value)}
                            style={{ width: '60px', textAlign: 'center', padding: '0.2rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 700 }}
                          />
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {readOnlyMode ? (
                          <span style={{ fontWeight: 700 }} dir="ltr">{fmt(item.contractQuantity)}</span>
                        ) : (
                          <input
                            type="text"
                            inputMode="decimal"
                            lang="en-US"
                            dir="ltr"
                            value={toCleanLatin(item.contractQuantity ?? '')}
                            onChange={(e) => handleBasicItemChange(idx, 'contractQuantity', e.target.value)}
                            style={{ width: '95px', textAlign: 'center', padding: '0.25rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 700, direction: 'ltr', fontFamily: "'Segoe UI', Roboto, Tahoma, Arial, sans-serif" }}
                          />
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {readOnlyMode ? (
                          <span style={{ fontWeight: 800, color: '#16a34a' }} dir="ltr">{fmt(item.executedQuantity)}</span>
                        ) : (
                          <input
                            type="text"
                            inputMode="decimal"
                            lang="en-US"
                            dir="ltr"
                            value={toCleanLatin(item.executedQuantity ?? '')}
                            onChange={(e) => handleBasicItemChange(idx, 'executedQuantity', e.target.value)}
                            style={{ width: '95px', textAlign: 'center', padding: '0.25rem', border: '1px solid #86efac', borderRadius: '4px', fontWeight: 800, color: '#15803d', direction: 'ltr', fontFamily: "'Segoe UI', Roboto, Tahoma, Arial, sans-serif" }}
                          />
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {readOnlyMode ? (
                          <span style={{ fontWeight: 700, color: '#ea580c' }} dir="ltr">{fmt(item.remainingQuantity)}</span>
                        ) : (
                          <input
                            type="text"
                            inputMode="decimal"
                            lang="en-US"
                            dir="ltr"
                            value={toCleanLatin(item.remainingQuantity ?? '')}
                            onChange={(e) => handleBasicItemChange(idx, 'remainingQuantity', e.target.value)}
                            style={{ width: '95px', textAlign: 'center', padding: '0.25rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 700, color: '#c2410c', direction: 'ltr', fontFamily: "'Segoe UI', Roboto, Tahoma, Arial, sans-serif" }}
                          />
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {readOnlyMode ? (
                          <strong style={{ color: '#0f172a' }} dir="ltr">{fmt(item.executedValue)}</strong>
                        ) : (
                          <input
                            type="text"
                            inputMode="decimal"
                            lang="en-US"
                            dir="ltr"
                            value={toCleanLatin(item.executedValue ?? '')}
                            onChange={(e) => handleBasicItemChange(idx, 'executedValue', e.target.value)}
                            style={{ width: '125px', textAlign: 'center', padding: '0.25rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 900, direction: 'ltr', fontFamily: "'Segoe UI', Roboto, Tahoma, Arial, sans-serif" }}
                          />
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {readOnlyMode ? (
                          <span dir="ltr" style={{
                            fontWeight: 900,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            background: (item.percentage || 0) > 0 ? '#eff6ff' : '#f8fafc',
                            color: (item.percentage || 0) > 0 ? '#1d4ed8' : '#94a3b8'
                          }}>
                            {item.percentage ? `${toCleanLatin(item.percentage)}%` : '—'}
                          </span>
                        ) : (
                          <input
                            type="text"
                            inputMode="decimal"
                            lang="en-US"
                            dir="ltr"
                            value={toCleanLatin(item.percentage ?? '')}
                            onChange={(e) => handleBasicItemChange(idx, 'percentage', e.target.value)}
                            style={{ width: '68px', textAlign: 'center', padding: '0.25rem', border: '1px solid #93c5fd', borderRadius: '4px', fontWeight: 900, color: '#1e40af', direction: 'ltr', fontFamily: "'Segoe UI', Roboto, Tahoma, Arial, sans-serif" }}
                          />
                        )}
                      </td>
                      {!readOnlyMode && (
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteBasicItem(item.id)}
                            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '0.2rem' }}
                            title="حذف البند"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  </React.Fragment>
                );
              })}

              {/* Subtotal of Basic Items (إجمالي البنود الأساسية) */}
              <tr style={{ background: '#f8fafc', fontWeight: 900, borderTop: '2px solid #0f172a' }}>
                <td colSpan={6} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#0f172a', fontSize: '0.92rem' }}>
                  إجمالي البنود الأساسية:
                </td>
                <td style={{ textAlign: 'center', color: '#1e3a8a', fontSize: '0.95rem', direction: 'ltr' }}>
                  {fmt(calculations.basicExecutedSum)} د.ل
                </td>
                <td style={{ textAlign: 'center', color: '#16a34a', fontSize: '0.95rem', direction: 'ltr' }}>
                  %{calculations.basicPercentage}
                </td>
                {!readOnlyMode && <td />}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Secondary Table: Additional Items (بنود إضافية) */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
          <span style={{
            background: '#e0e7ff',
            color: '#3730a3',
            padding: '0.3rem 0.8rem',
            borderRadius: '6px',
            fontWeight: 900,
            fontSize: '0.85rem'
          }}>
            بنود إضافية
          </span>
          <span style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 700 }}>
            (تشمل طبقة الأساس الحبيبي الإضافية والطريق الخدمي)
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ width: '45px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>البند</th>
                <th style={{ minWidth: '300px', padding: '0.6rem 0.75rem' }}>الوصف المعتمد للبند</th>
                <th style={{ width: '85px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>الوحدة</th>
                <th style={{ width: '130px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>المنفذ</th>
                <th style={{ width: '160px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>قيمة المنفذ (د.ل)</th>
              </tr>
            </thead>
            <tbody>
              {data.additionalItems.map((item, idx) => (
                <tr key={item.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ textAlign: 'center', fontWeight: 800 }}>{item.itemNumber}</td>
                  <td style={{ padding: '0.55rem 0.75rem', fontWeight: 700, color: '#1e293b' }}>
                    {readOnlyMode ? item.description : (
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleAdditionalItemChange(idx, 'description', e.target.value)}
                        style={{ width: '100%', padding: '0.3rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 700 }}
                      />
                    )}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: '#64748b' }}>{item.unit}</td>
                  <td style={{ textAlign: 'center' }}>
                    {readOnlyMode ? (
                      <span style={{ fontWeight: 800, color: '#16a34a' }} dir="ltr">{fmt(item.executedQuantity)}</span>
                    ) : (
                      <input
                        type="text"
                        inputMode="decimal"
                        lang="en-US"
                        dir="ltr"
                        value={toCleanLatin(item.executedQuantity ?? '')}
                        onChange={(e) => handleAdditionalItemChange(idx, 'executedQuantity', e.target.value)}
                        style={{ width: '110px', textAlign: 'center', padding: '0.25rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 800, direction: 'ltr', fontFamily: "'Segoe UI', Roboto, Tahoma, Arial, sans-serif" }}
                      />
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {readOnlyMode ? (
                      <strong style={{ color: '#0f172a' }} dir="ltr">{fmt(item.executedValue)}</strong>
                    ) : (
                      <input
                        type="text"
                        inputMode="decimal"
                        lang="en-US"
                        dir="ltr"
                        value={toCleanLatin(item.executedValue ?? '')}
                        onChange={(e) => handleAdditionalItemChange(idx, 'executedValue', e.target.value)}
                        style={{ width: '140px', textAlign: 'center', padding: '0.25rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 900, direction: 'ltr', fontFamily: "'Segoe UI', Roboto, Tahoma, Arial, sans-serif" }}
                      />
                    )}
                  </td>
                </tr>
              ))}

              {/* Subtotal of Additional Items */}
              <tr style={{ background: '#f8fafc', fontWeight: 900, borderTop: '2px solid #0f172a' }}>
                <td colSpan={4} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#0f172a', fontSize: '0.92rem' }}>
                  إجمالي البنود الإضافية:
                </td>
                <td style={{ textAlign: 'center', color: '#1e3a8a', fontSize: '0.95rem', direction: 'ltr' }}>
                  {fmt(calculations.additionalExecutedSum)} د.ل
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Grand Total Summary Box (إجمالي الموقف التنفيذي العام) */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '14px',
        padding: '1.5rem',
        color: '#ffffff',
        marginBottom: '1.5rem',
        boxShadow: '0 6px 20px rgba(15, 23, 42, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.15)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: '#f8fafc' }}>
              📊 الإجمالي العام للموقف التنفيذي (البنود الأساسية + الإضافية)
            </h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
              مطابقة شاملة للقيمة الإجمالية المنفذة، المتبقي المالي، ونسب الإنجاز العامة للعقد
            </p>
          </div>

          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700 }}>نسبة الإنجاز المالي الإجمالي</span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#38bdf8', direction: 'ltr' }}>
              %{calculations.overallFinancialPercentage}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>قيمة العقد المعتمدة</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '0.2rem', direction: 'ltr', textAlign: 'right' }}>
              {fmt(calculations.contractVal)} د.ل
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>إجمالي المنفذ الفعلي</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#4ade80', marginTop: '0.2rem', direction: 'ltr', textAlign: 'right' }}>
              {fmt(calculations.grandExecutedSum)} د.ل
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>المتبقي المالي من العقد</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fb923c', marginTop: '0.2rem', direction: 'ltr', textAlign: 'right' }}>
              {fmt(calculations.grandRemainingVal)} د.ل
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>نسبة إنجاز البنود الأساسية</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#60a5fa', marginTop: '0.2rem', direction: 'ltr', textAlign: 'right' }}>
              %{calculations.basicPercentage}
            </div>
          </div>
        </div>
      </div>

      {/* Official Signatories Box */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ borderTop: '2px solid #cbd5e1', paddingTop: '0.75rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>إعداد ومراجعة</div>
          <strong style={{ fontSize: '0.92rem', color: '#0f172a', display: 'block', marginTop: '0.2rem' }}>
            جهاز الإشراف الميداني
          </strong>
          <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>مشروع طريق أوباري - غات</span>
        </div>

        <div style={{ borderTop: '2px solid #cbd5e1', paddingTop: '0.75rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>رئيس جهاز الإشراف</div>
          <strong style={{ fontSize: '0.92rem', color: '#0f172a', display: 'block', marginTop: '0.2rem' }}>
            م. عبدالسلام ابريكاو
          </strong>
          <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>رئيس جهاز الإشراف المعتمد</span>
        </div>

        <div style={{ borderTop: '2px solid #cbd5e1', paddingTop: '0.75rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>مدير المشروع المعتمد</div>
          <strong style={{ fontSize: '0.92rem', color: '#1e40af', display: 'block', marginTop: '0.2rem' }}>
            م. عبدالرحمن الأنصاري
          </strong>
          <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>جهاز تنفيذ مشروعات المواصلات</span>
        </div>
      </div>

      {/* Official Print Modal (Direct trigger from Form) */}
      {showPrintModal && (
        <OfficialPrintModal
          report={getReportDataForPrint()}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
};

export default ExecutiveProgressForm;
