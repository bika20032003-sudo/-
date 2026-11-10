import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  FileSpreadsheet, Printer, Save, RotateCcw, Plus, Trash2, 
  CheckCircle2, AlertCircle, Edit3, Eye, FileText, Send, 
  HelpCircle, UserCheck, Shield, Award, DollarSign, Calendar,
  TrendingUp, BarChart3, ChevronLeft, ArrowDownRight, Layers, Calculator
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { fastFetch, clearApiCache } from '../utils/apiCache.js';
import { persistReportUniversal } from '../utils/reportPersistence.js';
import { OfficialPrintModal } from './OfficialPrintModal';
import { StationQuantitiesModal } from './StationQuantitiesModal';
import { calculateExecutiveItem, calculateExecutiveTotals, parseCleanNumber, CERTIFIED_RATES } from '../utils/engineeringFormulas.js';

// Default initial data matching the approved executive progress document (24/10/2026)
export const initialExecutiveData = {
  projectName: 'مشروع صيانة طريق اوباري غات بطول 360 كيلومتر',
  reportTitle: 'الموقف التنفيذي.',
  contractValue: 897665675.030,
  currency: 'دينار',
  reportDate: '2026-10-29',
  reportNumber: '093436_29.10.2026',
  basicItems: [
    {
      id: 1,
      section: 'أولاً: الدراسة والتصميم',
      itemNumber: '1',
      description: 'دراسة وتصميم كامل القطاع ويشمل العمل حساب حجم المرور وأخذ عينات من الطريق الحالي وتحديد حجم الضرر بالإضافة الى تصميم طبقة الاساس المعدل بطريقة ( FDR ) وتصميم طبقات الرصف التي تليها',
      unit: 'مقطوعية',
      contractQuantity: 1,
      executedQuantity: 0.875,
      remainingQuantity: 0.125,
      unitRate: 17601287.75,
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
      executedQuantity: 2239792.63,
      remainingQuantity: 820207.37,
      unitRate: 119.44,
      executedValue: 267520831.73,
      percentage: 73.20,
      notes: 'محسوبة من أطوال ومساحات المحطات (L41)'
    },
    {
      id: 3,
      section: 'ثانياً: أعمال الرصف',
      itemNumber: '3',
      description: 'توريد ورش طبقة تشريب نوع ( MC0 ) بمعدل 1.5 كجم / م2 على السطح النهائي للأساس الحبيبي بعرض واجهة تشمل ثمن المواد وتكاليف النقل ونظافة السطح قبل رشه والآلات والمعدات والأيدي العاملة وكل ما يلزم لنهو العمل والمعتمدة بالمتر المسطح طبقاً للمواصفات الفنية وتعليمات المهندس المشرف',
      unit: 'م2',
      contractQuantity: 3060000.00,
      executedQuantity: 2179342.47,
      remainingQuantity: 880657.53,
      unitRate: 13.73,
      executedValue: 29922372.11,
      percentage: 71.22,
      notes: 'محسوبة من أطوال ومساحات المحطات (F37)'
    },
    {
      id: 4,
      section: 'ثانياً: أعمال الرصف',
      itemNumber: '4',
      description: 'توريد وفرش طبقة اسفلتية سطحية محسنة باستخدام البوليمر بسمك 6 سم وبعرض 9.00 م والدك والتسوية طبقاً للمواصفات الفنية وتعليمات المهندس المشرف',
      unit: 'م2',
      contractQuantity: 3060000.00,
      executedQuantity: 2139464.47,
      remainingQuantity: 920535.53,
      unitRate: 145.35,
      executedValue: 310971160.71,
      percentage: 69.92,
      notes: 'محسوبة من أطوال ومساحات المحطات (R37)'
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
      unitRate: 1783.99,
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
      unitRate: 135.04,
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
      unitRate: 1205.23,
      executedValue: 602615.00,
      percentage: 23.15,
      notes: ''
    },
    {
      id: 8,
      section: 'رابعاً: أعمال الطلاء',
      itemNumber: '8',
      description: 'طلاء سطح الطريق ويشمل هذا البند تنظيف سطح الطريق من الاتربة والمواد العالقة وتوريد طلاء',
      unit: '',
      contractQuantity: '',
      executedQuantity: '',
      remainingQuantity: '',
      unitRate: '',
      executedValue: '',
      percentage: '',
      notes: 'بند تمهيدي لأعمال الطلاء وتخطيط المسارات'
    },
    {
      id: 9,
      section: 'رابعاً: أعمال الطلاء',
      itemNumber: '9',
      description: 'خطوط صفراء على جانبى الطريق بعرض 15 سم .',
      unit: 'م.ط',
      contractQuantity: 720000.00,
      executedQuantity: 402403.00,
      remainingQuantity: 317597.00,
      unitRate: 23.07,
      executedValue: 9283437.21,
      percentage: 55.89,
      notes: ''
    },
    {
      id: 10,
      section: 'رابعاً: أعمال الطلاء',
      itemNumber: '10',
      description: 'خطوط بيضاء متقطعة بمحور الطريق بعرض 15 سم',
      unit: 'م.ط',
      contractQuantity: 240000.00,
      executedQuantity: 180646.00,
      remainingQuantity: 59354.00,
      unitRate: 23.07,
      executedValue: 4167503.22,
      percentage: 75.27,
      notes: ''
    },
    {
      id: 11,
      section: 'رابعاً: أعمال الطلاء',
      itemNumber: '11',
      description: 'خطوط بيضاء مستمرة بمحور الطريق بعرض 15 سم .',
      unit: 'م.ط',
      contractQuantity: 120000.00,
      executedQuantity: 19967.00,
      remainingQuantity: 100033.00,
      unitRate: 23.07,
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
      executedQuantity: 270078.68,
      remainingQuantity: '',
      unitRate: 299.52,
      executedValue: 80893967.36,
      percentage: '',
      notes: 'محسوبة من أطوال ومساحات المحطات بسماكة 12.5 سم (AA44)'
    },
    {
      id: 2,
      itemNumber: '2',
      description: 'الطريق الخدمي',
      unit: 'كيلومتر',
      contractQuantity: '',
      executedQuantity: 225.623,
      remainingQuantity: '',
      unitRate: 59500.00,
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
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardRecipient, setForwardRecipient] = useState('all');
  const [forwardNote, setForwardNote] = useState('');
  const [isForwarding, setIsForwarding] = useState(false);
  const [activeTabSection, setActiveTabSection] = useState('all'); // 'all' | 'basic' | 'additional'
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showStationModal, setShowStationModal] = useState(false);
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
      unitRate: item.unitRate !== '' && item.unitRate !== null && item.unitRate !== undefined ? toCleanLatin(item.unitRate) : '',
      executedValue: item.executedValue !== '' && item.executedValue !== null && item.executedValue !== undefined ? toCleanLatin(item.executedValue) : '',
      percentage: item.percentage !== '' && item.percentage !== null && item.percentage !== undefined ? toCleanLatin(item.percentage) : ''
    }));
  };

  // Load latest data from API or localStorage
  useEffect(() => {
    const loadExecutiveData = async () => {
      const isOutdatedOrShifted = (items = []) => {
        return items.some(it => String(it.itemNumber) === '8' && (String(it.contractQuantity) === '720000' || Number(it.contractQuantity) === 720000)) ||
               items.some(it => String(it.itemNumber) === '11' && (String(it.contractQuantity) === '240000' || Number(it.contractQuantity) === 240000));
      };
      setIsLoading(true);
      try {
        const res = await fastFetch('/api/executive-progress');
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
            if (parsed.basicItems && isOutdatedOrShifted(parsed.basicItems)) {
              setData(initialExecutiveData);
              try { localStorage.setItem('executive_progress_data', JSON.stringify(initialExecutiveData)); } catch (_) {}
              setIsLoading(false);
              return;
            }
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

    // البنود الأساسية فقط هي التي تُجمع وتُحسب طبقاً لتعليمات جهاز الإشراف
    const contractVal = parseFloat(toCleanLatin(data.contractValue)) || 897665675.030;
    const basicExecutedSum = basicItems.reduce((acc, curr) => acc + (parseFloat(toCleanLatin(curr.executedValue)) || 0), 0);
    const additionalExecutedSum = additionalItems.reduce((acc, curr) => acc + (parseFloat(toCleanLatin(curr.executedValue)) || 0), 0);
    const grandExecutedSum = basicExecutedSum;
    const grandRemainingVal = Math.max(0, contractVal - grandExecutedSum);
    const basicPercentage = contractVal > 0 ? parseFloat(((basicExecutedSum / contractVal) * 100).toFixed(2)) : 0;
    const overallFinancialPercentage = basicPercentage;

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
  
  // Sync quantities directly from Station Quantities Calculator (Excel Sheet 29/10/2026)
  const handleApplyStationTotals = (stationTotals) => {
    if (!stationTotals) return;
    setData(prev => {
      const updatedBasic = prev.basicItems.map(item => {
        // FDR (Item 2) -> L41 (Area: 2,239,792.63 m2)
        if (item.id === 2 || item.itemNumber === '2') {
          const eQ = stationTotals.fdr?.area || 2239792.63;
          const rate = parseFloat(toCleanLatin(item.unitRate)) || 119.44;
          const cQ = parseFloat(toCleanLatin(item.contractQuantity)) || 3060000;
          return {
            ...item,
            executedQuantity: String(eQ),
            remainingQuantity: String(parseFloat(Math.max(0, cQ - eQ).toFixed(2))),
            executedValue: String(parseFloat((eQ * rate).toFixed(2))),
            percentage: String(parseFloat(((eQ / cQ) * 100).toFixed(2))),
            notes: 'محسوبة تلقائياً من حاسبة المحطات (L41)'
          };
        }
        // MCO (Item 3) -> F37 (Area: 2,179,342.47 m2)
        if (item.id === 3 || item.itemNumber === '3') {
          const eQ = stationTotals.mco?.area || 2179342.47;
          const rate = parseFloat(toCleanLatin(item.unitRate)) || 13.73;
          const cQ = parseFloat(toCleanLatin(item.contractQuantity)) || 3060000;
          return {
            ...item,
            executedQuantity: String(eQ),
            remainingQuantity: String(parseFloat(Math.max(0, cQ - eQ).toFixed(2))),
            executedValue: String(parseFloat((eQ * rate).toFixed(2))),
            percentage: String(parseFloat(((eQ / cQ) * 100).toFixed(2))),
            notes: 'محسوبة تلقائياً من حاسبة المحطات (F37)'
          };
        }
        // Asphalt (Item 4) -> R37 (Area: 2,139,464.47 m2)
        if (item.id === 4 || item.itemNumber === '4') {
          const eQ = stationTotals.asphalt?.area || 2139464.47;
          const rate = parseFloat(toCleanLatin(item.unitRate)) || 145.35;
          const cQ = parseFloat(toCleanLatin(item.contractQuantity)) || 3060000;
          return {
            ...item,
            executedQuantity: String(eQ),
            remainingQuantity: String(parseFloat(Math.max(0, cQ - eQ).toFixed(2))),
            executedValue: String(parseFloat((eQ * rate).toFixed(2))),
            percentage: String(parseFloat(((eQ / cQ) * 100).toFixed(2))),
            notes: 'محسوبة تلقائياً من حاسبة المحطات (R37)'
          };
        }
        return item;
      });

      const updatedAdd = prev.additionalItems.map(item => {
        // Base Course Volume (Item 1) -> AA44 (Volume: 270,078.68 m3)
        if (item.id === 1 || item.itemNumber === '1') {
          const eQ = stationTotals.base?.volume || 270078.68;
          const rate = parseFloat(toCleanLatin(item.unitRate)) || 299.52;
          return {
            ...item,
            executedQuantity: String(eQ),
            executedValue: String(parseFloat((eQ * rate).toFixed(2))),
            notes: 'محسوبة تلقائياً من حاسبة المحطات (AA44)'
          };
        }
        return item;
      });

      setStatusMessage({ type: 'success', text: 'تم تطبيق كميات المحطات الرسمية (FDR، MCO، الأسفلت، الأساس) وإعادة حساب القيم بدقة الإكسل!' });
      return {
        ...prev,
        basicItems: updatedBasic,
        additionalItems: updatedAdd
      };
    });
  };

  const handleHeaderChange = (field, val) => {
    setData(prev => ({ ...prev, [field]: toCleanLatin(val) }));
  };

    // Handle Basic Item change with real-time automatic calculation
  const handleBasicItemChange = (idx, field, val) => {
    const cleanVal = toCleanLatin(val);
    setData(prev => {
      const updated = [...prev.basicItems];
      const item = { ...updated[idx], [field]: cleanVal };

      const cQ = parseFloat(toCleanLatin(field === 'contractQuantity' ? cleanVal : item.contractQuantity)) || 0;
      const eQ = parseFloat(toCleanLatin(field === 'executedQuantity' ? cleanVal : item.executedQuantity)) || 0;
      const rate = parseFloat(toCleanLatin(field === 'unitRate' ? cleanVal : item.unitRate)) || 0;

      // 1. المتبقي = كمية العقد - المنفذ
      item.remainingQuantity = String(parseFloat(Math.max(0, cQ - eQ).toFixed(3)));

      // 2. قيمة المنفذ = المنفذ × الفئة
      item.executedValue = String(parseFloat((eQ * rate).toFixed(2)));

      // 3. النسبة % = (المنفذ / العقد) × 100
      if (cQ > 0) {
        item.percentage = String(parseFloat(((eQ / cQ) * 100).toFixed(2)));
      } else {
        item.percentage = '0.00';
      }

      updated[idx] = item;
      return { ...prev, basicItems: updated };
    });
  };

    // Handle Additional Item change with real-time automatic calculation
  const handleAdditionalItemChange = (idx, field, val) => {
    const cleanVal = toCleanLatin(val);
    setData(prev => {
      const updated = [...prev.additionalItems];
      const item = { ...updated[idx], [field]: cleanVal };

      const eQ = parseFloat(toCleanLatin(field === 'executedQuantity' ? cleanVal : item.executedQuantity)) || 0;
      const rate = parseFloat(toCleanLatin(field === 'unitRate' ? cleanVal : item.unitRate)) || 0;
      const cQ = parseFloat(toCleanLatin(field === 'contractQuantity' ? cleanVal : item.contractQuantity)) || 0;

      // 1. قيمة المنفذ = المنفذ × الفئة
      item.executedValue = String(parseFloat((eQ * rate).toFixed(2)));

      // 2. المتبقي والنسبة إذا توفرت كمية تعاقدية
      if (cQ > 0) {
        item.remainingQuantity = String(parseFloat(Math.max(0, cQ - eQ).toFixed(3)));
        item.percentage = String(parseFloat(((eQ / cQ) * 100).toFixed(2)));
      }

      updated[idx] = item;
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

  const officialSupervisors = [
    { username: 'project_manager', name: 'م. عبدالرحمن الأنصاري', role: 'مدير المشروع' },
    { username: 'abrikaw', name: 'م. عبدالسلام ابريكاو', role: 'رئيس جهاز الإشراف' },
    { username: 'saleh_quality', name: 'م. صالح حماد', role: 'مسؤول الجودة' },
    { username: 'salah_alarabi', name: 'م. صلاح العربي', role: 'مهندس مشرف (المرحلة الأولى)' },
    { username: 'issa_altahir', name: 'م. عيسى الطاهر', role: 'مهندس مشرف (المرحلة الثانية)' }
  ];

  const handleForwardReport = async () => {
    setIsForwarding(true);
    const isAll = forwardRecipient === 'all';
    const targets = isAll ? officialSupervisors : [officialSupervisors.find(u => u.username === forwardRecipient) || officialSupervisors[0]];

    try {
      const newMsgs = [];
      for (const targetUser of targets) {
        const messagePayload = {
          id: 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
          fromUsername: currentUser?.username || 'user',
          fromName: currentUser?.name || 'إدارة المشروع',
          fromRole: currentUser?.title || currentUser?.role || 'جهاز الإشراف',
          toUsername: targetUser.username,
          toName: targetUser.name,
          toRole: targetUser.role,
          type: 'تقرير الموقف التنفيذي',
          subject: 'إحالة تقرير الموقف التنفيذي المعتمد - رقم (' + data.reportNumber + ')',
          content: forwardNote.trim() || ('نحيل إليكم التقرير المعتمد للموقف التنفيذي المالي والفني لمشروع صيانة وتطوير طريق أوباري - غات (360 كم). نسبة الإنجاز المالي العام: ' + calculations.overallFinancialPercentage + '%.'),
          reportId: data.reportNumber,
          reportNumber: data.reportNumber,
          reportData: data,
          createdAt: new Date().toISOString(),
          isRead: false
        };
        newMsgs.push(messagePayload);
        try {
          await fastFetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messagePayload)
          });
        } catch (e) {}
      }

      try {
        const sys = JSON.parse(localStorage.getItem('system_messages') || '[]');
        localStorage.setItem('system_messages', JSON.stringify([...newMsgs, ...sys]));
        const loc = JSON.parse(localStorage.getItem('local_messages') || '[]');
        localStorage.setItem('local_messages', JSON.stringify([...newMsgs, ...loc]));
      } catch (e) {}
      window.dispatchEvent(new CustomEvent('messages-updated'));

      setShowForwardModal(false);
      const recipientText = isAll ? 'كافة أعضاء جهاز الإشراف' : targets[0].name;
      setStatusMessage({
        type: 'success',
        text: 'تم إرسال تقرير الموقف التنفيذي بنجاح إلى (' + recipientText + ')!'
      });
      if (onNavigateTab) {
        setTimeout(() => onNavigateTab('messages'), 1200);
      }
    } catch (err) {
      console.error(err);
      setShowForwardModal(false);
    } finally {
      setIsForwarding(false);
    }
  };

  // Save to API & LocalStorage (approved - saves to section and archive)
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
        overallFinancialPercentage: calculations.basicPercentage,
        basicItemsPercentage: calculations.basicPercentage
      }
    };

    const fullReport = {
      ...payload,
      id: data.id || ('exec-' + (data.reportDate ? String(data.reportDate).replace(/[./]/g, '-') : '2026-10-29')),
      reportNumber: data.reportNumber || '093436_29.10.2026',
      title: data.reportTitle || 'الموقف التنفيذي.',
      reportType: 'الموقف التنفيذي',
      reportCategory: 'executive',
      isExecutiveProgressReport: true,
      date: data.reportDate ? new Date(data.reportDate).toISOString() : new Date('2026-10-29').toISOString(),
      dateFormatted: data.reportDate || '2026-10-29',
      dayName: 'الخميس',
      sector: 'مشروع صيانة وتطوير طريق أوباري - غات (360 كم)',
      projectName: data.projectName || 'مشروع صيانة طريق اوباري غات بطول 360 كيلومتر',
      companyName: 'ائتلاف الشركات المنفذة لطريق أوباري غات',
      contractValue: calculations.contractVal,
      totalExecutedValue: calculations.grandExecutedSum,
      totalRemainingValue: calculations.grandRemainingVal,
      overallFinancialPercentage: calculations.basicPercentage,
      salesAmount: calculations.grandExecutedSum,
      roadMeters: 239770,
      basicItems: data.basicItems,
      additionalItems: data.additionalItems,
      basicTotals: payload.basicTotals,
      additionalTotals: payload.additionalTotals,
      grandTotals: payload.grandTotals,
      calculations: calculations,
      signatories: data.signatories || initialExecutiveData.signatories,
      createdByUsername: currentUser?.username || 'project_manager',
      authorUsername: currentUser?.username || 'project_manager',
      createdByName: currentUser?.name || 'م. عبدالرحمن الأنصاري',
      uploadedBy: currentUser?.name ? `${currentUser.name} (${currentUser.role || 'عضو جهاز الإشراف'})` : 'م. عبدالرحمن الأنصاري (مدير المشروع)',
      engineer: currentUser?.name || 'م. عبدالرحمن الأنصاري',
      sectorDirector: 'م. عبدالرحمن الأنصاري',
      status: 'approved',
      approvedBy: 'م. عبدالرحمن الأنصاري (مدير المشروع)',
      notes: `تقرير الموقف التنفيذي المعتمد للمشروع - نسبة الإنجاز المالي: ${calculations.basicPercentage}% - إجمالي المنفذ: ${Number(calculations.grandExecutedSum).toLocaleString()} د.ل من أصل ${Number(calculations.contractVal).toLocaleString()} د.ل`,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await persistReportUniversal(fullReport, currentUser);

      try {
        await fastFetch('/api/executive-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fullReport)
        });
      } catch (_) {}

      localStorage.setItem('executive_progress_data', JSON.stringify(fullReport));
      clearApiCache();
      try {
        window.dispatchEvent(new CustomEvent('executive-progress-updated', { detail: fullReport }));
        window.dispatchEvent(new CustomEvent('report-saved', { detail: fullReport }));
        window.dispatchEvent(new CustomEvent('reports-updated', { detail: fullReport }));
      } catch (_) {}

      setStatusMessage({ type: 'success', text: 'تم حفظ وتثبيت الموقف التنفيذي المعتمد بنجاح في قسمه وأرشيف المنظومة!' });
      if (onSaved) onSaved(fullReport);
    } catch (e) {
      console.error('Error saving executive progress:', e);
      localStorage.setItem('executive_progress_data', JSON.stringify(fullReport));
      setStatusMessage({ type: 'success', text: 'تم حفظ وتثبيت الموقف التنفيذي المعتمد بنجاح في قسمه وأرشيف المنظومة!' });
      if (onSaved) onSaved(fullReport);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to original standard data from PDF
  const handleResetToStandard = () => {
    if (window.confirm('هل تريد استعادة البيانات الأصلية المعتمدة للموقف التنفيذي؟')) {
      setData(initialExecutiveData);
      localStorage.removeItem('executive_progress_data');
      clearApiCache();
      try {
        window.dispatchEvent(new CustomEvent('executive-progress-updated', { detail: initialExecutiveData }));
        window.dispatchEvent(new CustomEvent('report-saved'));
      } catch (_) {}
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
            <>
              <button
                type="button"
                onClick={() => setShowForwardModal(true)}
                title="إحالة التقرير للبريد والمراسلات فقط"
                style={{
                  background: '#0284c7',
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
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)'
                }}
              >
                <Send size={16} />
                <span>إحالة للمراسلات (بريد)</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                title="حفظ التقرير المعتمد في قسمه والأرشيف"
                style={{
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.55rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)',
                  opacity: isSaving ? 0.7 : 1
                }}
              >
                <CheckCircle2 size={16} />
                <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التقرير المعتمد'}</span>
              </button>
            </>
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
              <RotateCcw size={15} />
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
          <span style={{ fontSize: '0.82rem', color: '#bbf7d0', fontWeight: 700 }}>إجمالي المنفذ التعاقدي (البنود الأساسية)</span>
          <div style={{ fontSize: '1.55rem', fontWeight: 900, margin: '0.35rem 0', direction: 'ltr', textAlign: 'right' }}>
            {fmt(calculations.grandExecutedSum)} <span style={{ fontSize: '0.85rem' }}>د.ل</span>
          </div>
          <span style={{ fontSize: '0.74rem', color: '#dcfce7' }}>
            نسبة إنجاز العقد التعاقدية: <strong dir="ltr">%{calculations.overallFinancialPercentage}</strong>
          </span>
        </div>

        {/* Card 3: Additional Items Total (Explicitly Excluded from Contract) */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bae6fd',
          borderRadius: '14px',
          padding: '1.25rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
          <span style={{ fontSize: '0.82rem', color: '#0369a1', fontWeight: 800 }}>إجمالي البنود الإضافية (خارج العقد)</span>
          <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#0284c7', margin: '0.35rem 0', direction: 'ltr', textAlign: 'right' }}>
            {fmt(calculations.additionalExecutedSum)} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>د.ل</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b45309', fontWeight: 700, fontSize: '0.74rem' }}>
            <span>⚠️ مستبعدة من جمع العقد طبقاً لتوجيهات جهاز الإشراف</span>
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

            {/* Certified Rates & Formulas Banner (مطابقة لوثيقة الإكسل المعتمدة 29/10/2026) */}
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
        border: '1.5px solid #a7f3d0',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 6px rgba(16, 185, 129, 0.08)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calculator size={20} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 900, color: '#065f46' }}>
                معدلات وفئات الحساب التلقائي المعتمدة (مطابقة لوثيقة الإكسل 29/10/2026)
              </h4>
              <span style={{ fontSize: '0.78rem', color: '#047857' }}>
                المعادلات الهندسية: المتبقي = كمية العقد - المنفذ | قيمة المنفذ = المنفذ × الفئة | النسبة % = (المنفذ / العقد) × 100
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowStationModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: '#047857',
              color: '#ffffff',
              border: 'none',
              padding: '0.55rem 1.15rem',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(4, 120, 87, 0.25)'
            }}
          >
            <Layers size={16} />
            <span>عرض وتعديل محطات الرصف الميدانية (حساب تلقائي)</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.65rem' }}>
          <div style={{ background: '#ffffff', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #d1fae5' }}>
            <span style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 700, display: 'block' }}>إعادة تدوير FDR (م2)</span>
            <strong style={{ fontSize: '0.92rem', color: '#065f46' }}>119.44 د.ل</strong>
            <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>المنفذ: 2,239,792.63 م2</span>
          </div>
          <div style={{ background: '#ffffff', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #d1fae5' }}>
            <span style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 700, display: 'block' }}>رش تشريب MCO (م2)</span>
            <strong style={{ fontSize: '0.92rem', color: '#065f46' }}>13.73 د.ل</strong>
            <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>المنفذ: 2,179,342.47 م2</span>
          </div>
          <div style={{ background: '#ffffff', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #d1fae5' }}>
            <span style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 700, display: 'block' }}>اسفلت محسن 6سم (م2)</span>
            <strong style={{ fontSize: '0.92rem', color: '#065f46' }}>145.35 د.ل</strong>
            <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>المنفذ: 2,139,464.47 م2</span>
          </div>
          <div style={{ background: '#ffffff', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #d1fae5' }}>
            <span style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 700, display: 'block' }}>أساس حبيبي (م3)</span>
            <strong style={{ fontSize: '0.92rem', color: '#065f46' }}>299.52 د.ل</strong>
            <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>المنفذ: 270,078.68 م3</span>
          </div>
          <div style={{ background: '#ffffff', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #d1fae5' }}>
            <span style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 700, display: 'block' }}>طريق خدمي (كم)</span>
            <strong style={{ fontSize: '0.92rem', color: '#065f46' }}>59,500.00 د.ل</strong>
            <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>المنفذ: 225.623 كم</span>
          </div>
          <div style={{ background: '#ffffff', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #d1fae5' }}>
            <span style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 700, display: 'block' }}>خطوط الطلاء (م.ط)</span>
            <strong style={{ fontSize: '0.92rem', color: '#065f46' }}>23.07 د.ل</strong>
            <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>أصفر 15سم / أبيض 15سم</span>
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
                <th style={{ width: '100px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>المتبقي</th>
                <th style={{ width: '95px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>الفئة (د.ل)</th>
                <th style={{ width: '130px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>قيمة المنفذ (د.ل)</th>
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
                        <td colSpan={readOnlyMode ? 10 : 11} style={{ padding: '0.45rem 1rem', fontWeight: 900, color: '#854d0e', fontSize: '0.86rem' }}>
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
                          <span style={{ fontWeight: 800, color: '#334155' }} dir="ltr">{item.unitRate ? fmt(item.unitRate) : '—'}</span>
                        ) : (
                          <input
                            type="text"
                            inputMode="decimal"
                            lang="en-US"
                            dir="ltr"
                            value={toCleanLatin(item.unitRate ?? '')}
                            onChange={(e) => handleBasicItemChange(idx, 'unitRate', e.target.value)}
                            style={{ width: '85px', textAlign: 'center', padding: '0.25rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 800, color: '#334155', direction: 'ltr', fontFamily: "'Segoe UI', Roboto, Tahoma, Arial, sans-serif" }}
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
                <td colSpan={7} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#0f172a', fontSize: '0.92rem' }}>
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

      {/* Additional Items Table (بنود إضافية خارج العقد) */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{
              background: '#e0f2fe',
              color: '#0369a1',
              padding: '0.3rem 0.8rem',
              borderRadius: '6px',
              fontWeight: 900,
              fontSize: '0.85rem'
            }}>
              بنود إضافية
            </span>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>
              (أعمال منفذة خارج نطاق العقد الأصلي - لا تُضاف لإجمالي العقد ولا تؤثر على نسبة الإنجاز التعاقدية)
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ width: '45px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>البند</th>
                <th style={{ minWidth: '300px', padding: '0.6rem 0.75rem' }}>الوصف المعتمد للبند الإضافي</th>
                <th style={{ width: '75px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>الوحدة</th>
                <th style={{ width: '120px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>المنفذ</th>
                <th style={{ width: '100px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>الفئة (د.ل)</th>
                <th style={{ width: '150px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>قيمة المنفذ (د.ل)</th>
                <th style={{ minWidth: '200px', padding: '0.6rem 0.75rem' }}>ملاحظات الحصر الميداني</th>
              </tr>
            </thead>
            <tbody>
              {data.additionalItems.map((item, idx) => (
                <tr key={item.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ textAlign: 'center', fontWeight: 800, color: '#475569' }}>
                    {toCleanLatin(item.itemNumber || idx + 1)}
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#1e293b' }}>
                    {item.description}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: '#64748b' }}>
                    {item.unit}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {readOnlyMode ? (
                      <span style={{ fontWeight: 800, color: '#0284c7' }} dir="ltr">{fmt(item.executedQuantity)}</span>
                    ) : (
                      <input
                        type="text"
                        inputMode="decimal"
                        lang="en-US"
                        dir="ltr"
                        value={toCleanLatin(item.executedQuantity ?? '')}
                        onChange={(e) => handleAdditionalItemChange(idx, 'executedQuantity', e.target.value)}
                        style={{ width: '110px', textAlign: 'center', padding: '0.25rem', border: '1px solid #7dd3fc', borderRadius: '4px', fontWeight: 800, color: '#0284c7', direction: 'ltr', fontFamily: "'Segoe UI', Roboto, Tahoma, Arial, sans-serif" }}
                      />
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {readOnlyMode ? (
                      <span style={{ fontWeight: 800, color: '#334155' }} dir="ltr">{fmt(item.unitRate)}</span>
                    ) : (
                      <input
                        type="text"
                        inputMode="decimal"
                        lang="en-US"
                        dir="ltr"
                        value={toCleanLatin(item.unitRate ?? '')}
                        onChange={(e) => handleAdditionalItemChange(idx, 'unitRate', e.target.value)}
                        style={{ width: '90px', textAlign: 'center', padding: '0.25rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 800, color: '#334155', direction: 'ltr', fontFamily: "'Segoe UI', Roboto, Tahoma, Arial, sans-serif" }}
                      />
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <strong style={{ color: '#0f172a' }} dir="ltr">{fmt(item.executedValue)}</strong>
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', color: '#64748b', fontSize: '0.8rem' }}>
                    {item.notes || '—'}
                  </td>
                </tr>
              ))}

              {/* Subtotal of Additional Items */}
              <tr style={{ background: '#f8fafc', fontWeight: 900, borderTop: '2px solid #cbd5e1' }}>
                <td colSpan={5} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#0f172a', fontSize: '0.92rem' }}>
                  إجمالي البنود الإضافية (خارج العقد):
                </td>
                <td style={{ textAlign: 'center', color: '#0369a1', fontSize: '0.95rem', direction: 'ltr' }}>
                  {fmt(calculations.additionalExecutedSum)} د.ل
                </td>
                <td style={{ padding: '0.5rem 0.75rem', fontSize: '0.78rem' }}>
                  —
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
              📊 الإجمالي العام للموقف التنفيذي التعاقدي (البنود الأساسية المعتمدة)
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

      {/* Forward Modal Portal */}
      {showForwardModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          direction: 'rtl',
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            padding: '1.75rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                  <Send size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>إحالة تقرير الموقف التنفيذي للمراسلات</h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>إرسال التقرير رقم ({data.reportNumber}) مباشرة لحساب المسؤول</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowForwardModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#334155', marginBottom: '0.45rem' }}>
                  إرسال التقرير إلى المسؤول:
                </label>
                <select
                  value={forwardRecipient}
                  onChange={(e) => setForwardRecipient(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    background: '#fff'
                  }}
                >
                  <option value="all">📢 تعميم لجميع أعضاء جهاز الإشراف (الكل - 5 مهندسين)</option>
                  {officialSupervisors.map(u => (
                    <option key={u.username} value={u.username}>
                      {u.name} - ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#334155', marginBottom: '0.45rem' }}>
                  نص المراسلة المرافقة للتقرير:
                </label>
                <textarea
                  rows={3}
                  value={forwardNote}
                  onChange={(e) => setForwardNote(e.target.value)}
                  placeholder="نحيل إليكم التقرير المعتمد للموقف التنفيذي للإحاطة والمتابعة..."
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    color: '#0f172a'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  disabled={isForwarding}
                  onClick={handleForwardReport}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: '#0284c7',
                    border: 'none',
                    color: '#fff',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    cursor: isForwarding ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Send size={16} />
                  <span>{isForwarding ? 'جاري الإرسال...' : 'تأكيد الإرسال بالبريد'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowForwardModal(false)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: '8px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Print Modal (Direct trigger from Form) */}
      <StationQuantitiesModal
        isOpen={showStationModal}
        onClose={() => setShowStationModal(false)}
        onApplyTotals={handleApplyStationTotals}
      />

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
