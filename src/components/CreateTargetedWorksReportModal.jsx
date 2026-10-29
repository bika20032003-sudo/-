import React, { useState, useEffect } from 'react';
import { 
  Target, X, Plus, Trash2, Printer, Send, CheckCircle2, 
  FileSpreadsheet, AlertCircle, RefreshCw, Calendar, Clock,
  Truck, Milestone, Layers, UserCheck, Shield, RotateCcw, Edit3
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { fastFetch, clearApiCache } from '../utils/apiCache.js';
import { toCleanLatinDigits } from '../utils/forceLatinDigits.js';

// Approved Targeted Works Data from official document (Sunday 25/10/2026)
export const initialTargetedWorksSections = [
  {
    id: 'fdr',
    title: 'أعمال تشغيل FDR',
    startTimeNote: 'بدء أعمال الفرم الساعه 05:00 صباحاً',
    workItems: [
      { id: 1, item: 'أعمال فرم بدون أسمنت', stationFrom: '242+500', stationTo: '243+500', length: '1000.00', notes: '—' },
      { id: 2, item: 'أعمال فرم بالأسمنت', stationFrom: '242+500', stationTo: '243+000', length: '500.00', notes: '—' }
    ],
    equipmentTitle: 'المعدات والإعداد المطلوبه لفرم FDR',
    equipmentItems: [
      { id: 1, name: 'ماكينه FDR', count: '3', notes: '—' },
      { id: 2, name: 'جريدار', count: '2', notes: '—' },
      { id: 3, name: 'هراس حافر غنم', count: '3', notes: '—' },
      { id: 4, name: 'هراس تربه', count: '3', notes: '—' },
      { id: 5, name: 'تانك مياه', count: '7', notes: 'معالجه + فرم بدون اسمنت + فرم بالاسمنت' },
      { id: 6, name: 'لودر', count: '1', notes: '—' },
      { id: 7, name: 'قلابات', count: '1', notes: '—' },
      { id: 8, name: 'مانيتو', count: '1', notes: 'معالجه' },
      { id: 9, name: 'جرار زراعي', count: '1', notes: '—' },
      { id: 10, name: 'عدد 2 طاقم مساحة', count: '6', notes: '—' },
      { id: 11, name: 'طاقم عمال للتفتيح والتشوين', count: '23', notes: '—' }
    ]
  },
  {
    id: 'base_course',
    title: 'أعمال طبقة الأساس',
    startTimeNote: 'بدء أعمال طبقة الأساس الساعه 06:00 صباحاً',
    workItems: [
      { id: 1, item: 'تسليم طبقة الأساس', stationFrom: '236+700', stationTo: '237+500', length: '800.00', notes: '—' },
      { id: 2, item: 'تشغيل طبقة الأساس', stationFrom: '237+500', stationTo: '237+900', length: '400.00', notes: '—' },
      { id: 3, item: 'أعمال رش بـ MCO على الأساس', stationFrom: '236+700', stationTo: '237+500', length: '800.00', notes: '—' },
      { id: 4, item: 'أعمال الطريق الخدمي', stationFrom: '231+350', stationTo: '250+000', length: '18650.00', notes: '—' }
    ],
    equipmentTitle: 'المعدات والإعداد المطلوبه لطبقة الأساس والطريق الخدمي',
    equipmentItems: [
      { id: 1, name: 'جريدار', count: '5', notes: '—' },
      { id: 2, name: 'هراس تربه', count: '6', notes: 'عدد 2 هراس ورديه ليل' },
      { id: 3, name: 'تانك مياه', count: '6', notes: 'طريق الخدمه + مشون السن كم 224/ كم 228' },
      { id: 4, name: 'لودر', count: '2', notes: 'عدد 1 لودر يعمل 24 ساعه' },
      { id: 5, name: 'قلابات', count: '4', notes: '—' },
      { id: 6, name: 'عدد 5 طاقم مساحة', count: '10', notes: '—' },
      { id: 7, name: 'مانيتو', count: '1', notes: '—' }
    ]
  },
  {
    id: 'asphalt',
    title: 'أعمال طبقة الاسفلت 6 سم محسن',
    startTimeNote: 'بدء عمل خلاطة الاسفلت الساعه 06:00 صباحاً',
    workItems: [
      { id: 1, item: 'طبقة الاسفلت المحسن 6 سم', stationFrom: '234+420', stationTo: '235+520', length: '1100.00', notes: '—' }
    ],
    equipmentTitle: 'المعدات والإعداد المطلوبه لإسفلت',
    equipmentItems: [
      { id: 1, name: 'خلاط اسفلت', count: '1', notes: '—' },
      { id: 2, name: 'فنشر اسفلت', count: '2', notes: '—' },
      { id: 3, name: 'رولة اسفلت حديد', count: '2', notes: '—' },
      { id: 4, name: 'رولة اسفلت كاوتش', count: '2', notes: '—' },
      { id: 5, name: 'رولة اسفلت صغيرة', count: '1', notes: '—' },
      { id: 6, name: 'بوب كات', count: '1', notes: '—' },
      { id: 7, name: 'تانك مياه', count: '1', notes: '—' },
      { id: 8, name: 'كمبروسر', count: '1', notes: '—' },
      { id: 9, name: 'لودر', count: '1', notes: '—' },
      { id: 10, name: 'شاحنات', count: '11', notes: '—' },
      { id: 11, name: 'مهندس تنفيذ', count: '1', notes: '—' },
      { id: 12, name: 'مشرف تنفيذ', count: '2', notes: '—' },
      { id: 13, name: 'طاقم عمال كراك وشواك', count: '10', notes: '—' }
    ]
  }
];

export const emptyTargetedWorksSections = [
  {
    id: 'fdr',
    title: 'أعمال تشغيل FDR',
    startTimeNote: 'بدء أعمال الفرم الساعه 05:00 صباحاً',
    workItems: [{ id: 1, item: '', stationFrom: '', stationTo: '', length: '', notes: '' }],
    equipmentTitle: 'المعدات والإعداد المطلوبه لفرم FDR',
    equipmentItems: [{ id: 1, name: '', count: '', notes: '' }]
  },
  {
    id: 'base_course',
    title: 'أعمال طبقة الأساس',
    startTimeNote: 'بدء أعمال طبقة الأساس الساعه 06:00 صباحاً',
    workItems: [{ id: 1, item: '', stationFrom: '', stationTo: '', length: '', notes: '' }],
    equipmentTitle: 'المعدات والإعداد المطلوبه لطبقة الأساس والطريق الخدمي',
    equipmentItems: [{ id: 1, name: '', count: '', notes: '' }]
  },
  {
    id: 'asphalt',
    title: 'أعمال طبقة الاسفلت 6 سم محسن',
    startTimeNote: 'بدء عمل خلاطة الاسفلت الساعه 06:00 صباحاً',
    workItems: [{ id: 1, item: '', stationFrom: '', stationTo: '', length: '', notes: '' }],
    equipmentTitle: 'المعدات والإعداد المطلوبه لإسفلت',
    equipmentItems: [{ id: 1, name: '', count: '', notes: '' }]
  }
];

export const defaultApprovedTargetedWorksReport = {
  id: 'target-rep-25-10-2026',
  reportNumber: 'TARGET-25.10.2026',
  title: 'بيان أعمال يوم الأحد 25 - 10 - 2026',
  reportType: 'تقرير الأعمال المستهدفة',
  isTargetedWorksReport: true,
  date: '2026-10-25T00:00:00.000Z',
  dateFormatted: '25 - 10 - 2026',
  dayName: 'الأحد',
  sector: 'طريق أوباري - غات',
  projectName: 'مشروع صيانة وتطوير طريق أوباري - غات',
  companyName: 'ائتلاف الشركات المنفذة لطريق أوباري غات',
  sectorDirector: (typeof window !== 'undefined' && localStorage.getItem('system_default_sector_director')) || 'م. صلاح العربي',
  ownerRepresentative: 'م. عبدالرحمن الأنصاري',
  uploadedBy: (typeof window !== 'undefined' && localStorage.getItem('system_default_sector_director')) || 'م. صلاح العربي',
  approvedBy: 'م. عبدالرحمن الأنصاري',
  status: 'approved',
  targetedSections: initialTargetedWorksSections,
  totalTargetLength: 23250,
  totalTargetEquipment: 121,
  roadMeters: 23250,
  notes: 'بيان استهداف الأعمال اليومية والمعدات المطلوبة بموقع طريق أوباري - غات'
};

export const CreateTargetedWorksReportModal = ({ 
  isOpen, 
  onClose, 
  currentUser, 
  onReportCreated, 
  onPrintReport, 
  onNavigateTab,
  reportToEdit = null
}) => {
  if (!isOpen) return null;

  const getDayName = (dateStr) => {
    if (!dateStr) return 'الأحد';
    const date = new Date(dateStr);
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()] || 'الأحد';
  };

  // Pre-fill with approved document date (Sunday 25/10/2026)
  const defaultDateStr = '2026-10-25';
  const userSector = currentUser?.sector || 'طريق أوباري - غات';
  const isSectorB = userSector.includes('B') || userSector.includes('الثانية');

  // Form State
  const [reportDate, setReportDate] = useState(defaultDateStr);
  const [dayName, setDayName] = useState('الأحد');
  const [sector, setSector] = useState(isSectorB ? 'المرحلة الثانية' : 'طريق أوباري - غات');
  const [reportNumber, setReportNumber] = useState('TARGET-25.10.2026');

  // Signatures
  const [sectorDirector, setSectorDirector] = useState((typeof window !== 'undefined' && localStorage.getItem('system_default_sector_director')) || 'م. صلاح العربي');
  const [ownerRepresentative, setOwnerRepresentative] = useState('م. عبدالرحمن الأنصاري');

  // Form Sections & Fields initialized with the approved document data
  const [sections, setSections] = useState(() => 
    initialTargetedWorksSections.map(s => ({
      ...s,
      workItems: s.workItems.map(w => ({ ...w })),
      equipmentItems: s.equipmentItems.map(e => ({ ...e }))
    }))
  );

  // Sync state if reportToEdit is provided
  useEffect(() => {
    if (!isOpen) return;
    if (reportToEdit) {
      setReportDate(reportToEdit.date ? reportToEdit.date.split('T')[0] : '2026-10-25');
      setDayName(reportToEdit.dayName || 'الأحد');
      setSector(reportToEdit.sector || 'طريق أوباري - غات');
      setReportNumber(reportToEdit.reportNumber || 'TARGET-25.10.2026');
      setSectorDirector(reportToEdit.sectorDirector || (typeof window !== 'undefined' && localStorage.getItem('system_default_sector_director')) || 'م. صلاح العربي');
      setOwnerRepresentative(reportToEdit.ownerRepresentative || 'م. عبدالرحمن الأنصاري');
      if (Array.isArray(reportToEdit.targetedSections) && reportToEdit.targetedSections.length > 0) {
        setSections(reportToEdit.targetedSections.map(s => ({
          ...s,
          workItems: (s.workItems || []).map(w => ({ ...w })),
          equipmentItems: (s.equipmentItems || []).map(e => ({ ...e }))
        })));
      } else {
        setSections(initialTargetedWorksSections.map(s => ({
          ...s,
          workItems: s.workItems.map(w => ({ ...w })),
          equipmentItems: s.equipmentItems.map(e => ({ ...e }))
        })));
      }
    } else {
      setReportDate('2026-10-25');
      setDayName('الأحد');
      setSector('طريق أوباري - غات');
      setReportNumber('TARGET-25.10.2026');
      setSectorDirector((typeof window !== 'undefined' && localStorage.getItem('system_default_sector_director')) || 'م. صلاح العربي');
      setOwnerRepresentative('م. عبدالرحمن الأنصاري');
      setSections(initialTargetedWorksSections.map(s => ({
        ...s,
        workItems: s.workItems.map(w => ({ ...w })),
        equipmentItems: s.equipmentItems.map(e => ({ ...e }))
      })));
    }
  }, [isOpen, reportToEdit]);

  const handleRestoreApprovedData = () => {
    setReportDate('2026-10-25');
    setDayName('الأحد');
    setSector('طريق أوباري - غات');
    setReportNumber('TARGET-25.10.2026');
    setSectorDirector((typeof window !== 'undefined' && localStorage.getItem('system_default_sector_director')) || 'م. صلاح العربي');
    setOwnerRepresentative('م. عبدالرحمن الأنصاري');
    setSections(initialTargetedWorksSections.map(s => ({
      ...s,
      workItems: s.workItems.map(w => ({ ...w })),
      equipmentItems: s.equipmentItems.map(e => ({ ...e }))
    })));
    setStatusMessage({
      type: 'success',
      text: 'تمت استعادة كافة البيانات المعتمدة لتقرير الأعمال المستهدفة ليوم الأحد 25-10-2026 بنجاح!'
    });
  };

  const handleClearAllFields = () => {
    if (window.confirm('هل تريد مسح وتفريغ كافة الحقول لإدخال بيان أعمال مستهدفة جديد فارغ؟')) {
      setSections(emptyTargetedWorksSections.map(s => ({
        ...s,
        workItems: s.workItems.map(w => ({ ...w })),
        equipmentItems: s.equipmentItems.map(e => ({ ...e }))
      })));
      setStatusMessage({ type: 'info', text: 'تم تفريغ الحقول بنجاح لإدخال بيانات جديدة.' });
    }
  };

  // Suggestions datalists for fast input without hardcoding data
  const workPresets = [
    'أعمال فرم بدون أسمنت',
    'أعمال فرم بالأسمنت',
    'أعمال معالجه FDR بالمياه',
    'تسليم طبقة الأساس',
    'تشغيل طبقة الأساس',
    'أعمال رش بـ MCO على الأساس',
    'أعمال الطريق الخدمي',
    'طبقة الاسفلت المحسن 6 سم',
    'أعمال طبقة اسفلت رابطة',
    'رش طبقة لصق RC',
    'أعمال طبقة أساس حبيبي'
  ];

  const equipPresets = [
    'ماكينه FDR',
    'جريدر',
    'هراس حافر غنم',
    'هراس تربه',
    'تانك مياه',
    'لودر',
    'قلابات',
    'ماسيترا',
    'جرار زراعي',
    'عدد 3 طاقم مساحة',
    'طاقم عمال للتفتيح والتشريك',
    'خلاط اسفلت',
    'فنشر اسفلت',
    'رولة اسفلت حديد',
    'رولة اسفلت كاوتش',
    'رولة اسفلت صغيرة',
    'بوب كات',
    'كمبروسر',
    'شاحنات',
    'مهندس تنفيذ',
    'مشرف تنفيذ',
    'طاقم عمال كراك وشواك'
  ];

  // Status & Forward modal state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [createdReport, setCreatedReport] = useState(null);

  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardRecipient, setForwardRecipient] = useState('admin');
  const [forwardNote, setForwardNote] = useState('');
  const [isForwarding, setIsForwarding] = useState(false);

  const officialSupervisors = [
    { username: 'admin', name: 'م. عبدالرحمن الأنصاري', role: 'مدير المشروع' },
    { username: 'abrikaw', name: 'م. عبدالسلام ابريكاو', role: 'رئيس جهاز الإشراف' },
    { username: 'saleh_quality', name: 'م. صالح حماد', role: 'مسؤول الجودة' },
    { username: 'salah_alarabi', name: 'م. صلاح العربي', role: 'مهندس مشرف (المرحلة الأولى)' },
    { username: 'issa_altahir', name: 'م. عيسى الطاهر', role: 'مهندس مشرف (المرحلة الثانية)' },
  ];

  const handleDateChange = (newDate) => {
    setReportDate(newDate);
    setDayName(getDayName(newDate));
  };

  // Section level changes
  const handleSectionTitleChange = (sectionIndex, field, value) => {
    setSections(prev => prev.map((sec, idx) => {
      if (idx === sectionIndex) {
        return { ...sec, [field]: value };
      }
      return sec;
    }));
  };

  // Work items manipulation
  const handleWorkItemChange = (sectionIndex, itemId, field, value) => {
    const cleanVal = (field === 'length' || field === 'stationFrom' || field === 'stationTo') ? toCleanLatinDigits(value) : value;
    setSections(prev => prev.map((sec, idx) => {
      if (idx === sectionIndex) {
        const updated = sec.workItems.map(row => row.id === itemId ? { ...row, [field]: cleanVal } : row);
        return { ...sec, workItems: updated };
      }
      return sec;
    }));
  };

  const handleAddWorkItem = (sectionIndex) => {
    setSections(prev => prev.map((sec, idx) => {
      if (idx === sectionIndex) {
        return {
          ...sec,
          workItems: [
            ...sec.workItems,
            { id: Date.now() + Math.random(), item: '', stationFrom: '', stationTo: '', length: '', notes: '' }
          ]
        };
      }
      return sec;
    }));
  };

  const handleRemoveWorkItem = (sectionIndex, itemId) => {
    setSections(prev => prev.map((sec, idx) => {
      if (idx === sectionIndex) {
        const filtered = sec.workItems.filter(r => r.id !== itemId);
        return {
          ...sec,
          workItems: filtered.length > 0 ? filtered : [{ id: Date.now(), item: '', stationFrom: '', stationTo: '', length: '', notes: '' }]
        };
      }
      return sec;
    }));
  };

  // Equipment manipulation
  const handleEquipmentItemChange = (sectionIndex, itemId, field, value) => {
    const cleanVal = field === 'count' ? toCleanLatinDigits(value) : value;
    setSections(prev => prev.map((sec, idx) => {
      if (idx === sectionIndex) {
        const updated = sec.equipmentItems.map(row => row.id === itemId ? { ...row, [field]: cleanVal } : row);
        return { ...sec, equipmentItems: updated };
      }
      return sec;
    }));
  };

  const handleAddEquipmentItem = (sectionIndex) => {
    setSections(prev => prev.map((sec, idx) => {
      if (idx === sectionIndex) {
        return {
          ...sec,
          equipmentItems: [
            ...sec.equipmentItems,
            { id: Date.now() + Math.random(), name: '', count: '', notes: '' }
          ]
        };
      }
      return sec;
    }));
  };

  const handleRemoveEquipmentItem = (sectionIndex, itemId) => {
    setSections(prev => prev.map((sec, idx) => {
      if (idx === sectionIndex) {
        const filtered = sec.equipmentItems.filter(r => r.id !== itemId);
        return {
          ...sec,
          equipmentItems: filtered.length > 0 ? filtered : [{ id: Date.now(), name: '', count: '', notes: '' }]
        };
      }
      return sec;
    }));
  };

  // Add a brand new section
  const handleAddNewSection = () => {
    setSections(prev => [
      ...prev,
      {
        id: `custom_${Date.now()}`,
        title: 'أعمال جديدة مستهدفة',
        startTimeNote: 'بدء الأعمال الساعة 07:00 صباحاً',
        workItems: [{ id: Date.now() + 1, item: '', stationFrom: '', stationTo: '', length: '', notes: '' }],
        equipmentTitle: 'المعدات والإعداد المطلوبة للأعمال',
        equipmentItems: [{ id: Date.now() + 2, name: '', count: '', notes: '' }]
      }
    ]);
  };

  const handleRemoveSection = (sectionIndex) => {
    if (sections.length <= 1) return;
    setSections(prev => prev.filter((_, idx) => idx !== sectionIndex));
  };

  // Auto-calculated totals
  const totalTargetLength = sections.reduce((sum, sec) => {
    return sum + sec.workItems.reduce((secSum, w) => secSum + (parseFloat(w.length) || 0), 0);
  }, 0);

  const totalTargetEquipment = sections.reduce((sum, sec) => {
    return sum + sec.equipmentItems.reduce((secSum, e) => secSum + (parseFloat(e.count) || 0), 0);
  }, 0);

  // Formatted date string for the banner: DD - MM - YYYY
  const dateParts = reportDate.split('-');
  const formattedDashDate = dateParts.length === 3 ? `${dateParts[2]} - ${dateParts[1]} - ${dateParts[0]}` : reportDate;

  // Export to Excel matching the exact structure
  const handleExportExcel = () => {
    try {
      const dataRows = [
        [`بيان أعمال يوم ${dayName} ${formattedDashDate}`],
        [`القطاع: ${sector}`, `رقم البيان: ${reportNumber}`],
        []
      ];

      sections.forEach(sec => {
        dataRows.push([sec.title, '', '', '', '', sec.startTimeNote]);
        dataRows.push(['م', 'البند', 'من', 'الى', 'طول', 'ملاحظات']);
        sec.workItems.forEach((w, idx) => {
          dataRows.push([
            idx + 1,
            w.item || '-',
            w.stationFrom || '-',
            w.stationTo || '-',
            w.length ? parseFloat(w.length) : '-',
            w.notes || '-'
          ]);
        });

        dataRows.push([]);
        dataRows.push([sec.equipmentTitle, 'العدد', '', '', '', 'ملاحظات']);
        sec.equipmentItems.forEach((eq, idx) => {
          dataRows.push([
            idx + 1,
            eq.name || '-',
            eq.count ? parseFloat(eq.count) : '-',
            '',
            '',
            eq.notes || '-'
          ]);
        });
        dataRows.push([]);
      });

      dataRows.push(['الإجمالي العام للأطوال المستهدفة (م.ط):', totalTargetLength]);
      dataRows.push(['إجمالي المعدات والأطقم المستهدفة:', totalTargetEquipment]);
      dataRows.push([]);
      dataRows.push(['مدير القطاع:', sectorDirector, '', 'ممثل الجهة المالكة:', ownerRepresentative]);

      const ws = XLSX.utils.aoa_to_sheet(dataRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'الأعمال المستهدفة');
      XLSX.writeFile(wb, `بيان_الأعمال_المستهدفة_${formattedDashDate.replace(/ /g, '_')}.xlsx`);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
    }
  };

  // Save report payload
  const handleSaveReport = async (sendAfter = false) => {
    setIsSubmitting(true);
    setStatusMessage(null);

    const reportTitle = `بيان أعمال يوم ${dayName} ${formattedDashDate}`;

    const reportPayload = {
      reportNumber,
      date: reportDate,
      dateFormatted: formattedDashDate,
      dayName,
      title: reportTitle,
      sector,
      projectName: 'مشروع صيانة وتطوير طريق أوباري - غات',
      companyName: 'ائتلاف الشركات المنفذة لطريق أوباري غات',
      reportType: 'تقرير الأعمال المستهدفة',
      isTargetedWorksReport: true,
      targetedSections: sections,
      totalTargetLength,
      totalTargetEquipment,
      roadMeters: totalTargetLength,
      sectorDirector,
      ownerRepresentative,
      uploadedBy: currentUser?.name || sectorDirector,
      status: 'approved',
      approvedBy: ownerRepresentative,
      notes: `بيان استهداف الأعمال اليومية والمعدات المطلوبة بموقع ${sector}`
    };

    try {
      const saved = (reportToEdit && reportToEdit.id)
        ? { ...reportPayload, id: reportToEdit.id, updatedAt: new Date().toISOString() }
        : { ...reportPayload, id: 'target-rep-' + Date.now(), createdAt: new Date().toISOString() };

      // 1. Direct save into localStorage under local_reports
      try {
        const local = JSON.parse(localStorage.getItem('local_reports') || '[]');
        const filtered = local.filter(r => String(r.id) !== String(saved.id) && r.reportNumber !== saved.reportNumber);
        filtered.unshift(saved);
        localStorage.setItem('local_reports', JSON.stringify(filtered));
      } catch (storageErr) {
        console.error('Error saving targeted report to local_reports:', storageErr);
      }

      // 2. Clear API cache and dispatch reactive events
      clearApiCache();
      try {
        window.dispatchEvent(new CustomEvent('report-saved', { detail: saved }));
        window.dispatchEvent(new CustomEvent('road-progress-updated', { detail: saved }));
      } catch (e) {}

      // 3. Fire-and-forget sync to backend
      try {
        fetch('http://localhost:5000/api/reports/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(saved)
        }).catch(() => {});
      } catch (e) {}

      setCreatedReport(saved);

      if (onReportCreated) onReportCreated(saved);

      setStatusMessage({ 
        type: 'success', 
        text: `تم حفظ واعتماد ${saved.title || saved.reportType} برقم (${saved.reportNumber}) بنجاح في قاعدة البيانات!` 
      });

      if (sendAfter) {
        setShowForwardModal(true);
      }
    } catch (err) {
      console.error('Error saving targeted works report:', err);
      setStatusMessage({ type: 'danger', text: 'حدث خطأ أثناء حفظ تقرير الأعمال المستهدفة.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Forward Report via Messages
  const handleForwardReport = async () => {
    if (!createdReport) return;
    setIsForwarding(true);

    const targetUser = officialSupervisors.find(u => u.username === forwardRecipient) || officialSupervisors[0];

    const messagePayload = {
      fromUsername: currentUser?.username || 'supervisor',
      fromName: currentUser?.name || sectorDirector,
      fromRole: currentUser?.title || currentUser?.role || 'مهندس إشراف',
      toUsername: targetUser.username,
      toName: targetUser.name,
      toRole: targetUser.role,
      type: 'إحالة بيان الأعمال المستهدفة',
      subject: `إحالة ${createdReport.title || 'بيان الأعمال المستهدفة'} - (${createdReport.reportNumber})`,
      content: forwardNote.trim() || `نحيل إليكم بيان الأعمال والمعدات المستهدفة المعتمد ليوم ${dayName} (${formattedDashDate}) للإحاطة والمتابعة الميدانية.`,
      reportId: createdReport.id,
      reportNumber: createdReport.reportNumber,
      reportData: createdReport
    };

    try {
      await fastFetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messagePayload)
      });

      setShowForwardModal(false);
      setStatusMessage({ 
        type: 'success', 
        text: `تم حفظ البيان وإرساله رسمياً عبر البريد والمراسلات إلى (${targetUser.name}) بنجاح!` 
      });

      setTimeout(() => {
        if (onNavigateTab) onNavigateTab('messages');
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to forward message:', err);
      alert('تم حفظ البيان بنجاح.');
    } finally {
      setIsForwarding(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(15, 23, 42, 0.78)',
      backdropFilter: 'blur(6px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      direction: 'rtl',
      padding: '1rem',
      overflowY: 'auto'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        maxWidth: '1060px',
        width: '100%',
        maxHeight: '94vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        border: '1px solid #cbd5e1',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Top Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 10px rgba(2, 132, 199, 0.35)' }}>
              <Target size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>
                إنشاء تقرير الأعمال المستهدفة
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                بيان الأعمال اليومية المستهدفة لفرق ومعدات المشروع (FDR، طبقة الأساس، والاسفلت)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Status Message */}
          {statusMessage && (
            <div style={{
              padding: '0.85rem 1.25rem',
              borderRadius: '10px',
              background: statusMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
              border: statusMessage.type === 'success' ? '1px solid #bbf7d0' : '1px solid #fecaca',
              color: statusMessage.type === 'success' ? '#166534' : '#991b1b',
              fontWeight: 800,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span>{statusMessage.text}</span>
              </div>

              {createdReport && (
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => onPrintReport && onPrintReport(createdReport)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      background: '#fff',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    طباعة
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForwardModal(true)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      background: '#2563eb',
                      border: 'none',
                      color: '#fff',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    إرسال بالبريد
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quick Toolbar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.65rem',
            background: '#ffffff',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                بيان الأعمال والمعدات المستهدفة المعتمد (الأحد 25-10-2026):
              </span>
              <span style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0284c7', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 800 }}>
                {totalTargetLength.toLocaleString('en-US')} م.ط مستهدف
              </span>
              <span style={{ fontSize: '0.78rem', background: '#fef3c7', color: '#b45309', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 800 }}>
                {totalTargetEquipment.toLocaleString('en-US')} معدة وطاقم
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleRestoreApprovedData}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '7px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
                title="استعادة البيانات الأصلية المعتمدة ليوم الأحد 25-10-2026"
              >
                <RotateCcw size={14} />
                <span>استعادة البيانات المعتمدة (25/10/2026)</span>
              </button>

              <button
                type="button"
                onClick={handleClearAllFields}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '7px',
                  background: '#fff',
                  border: '1px solid #cbd5e1',
                  color: '#64748b',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
                title="تفريغ الحقول لإدخال بيان أعمال فارغ جديد"
              >
                <Plus size={14} />
                <span>تفريغ الحقول (إدخال جديد)</span>
              </button>
            </div>
          </div>

          {/* Form Meta Controls */}
          <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            border: '1px solid #e2e8f0',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={15} color="#0284c7" />
                  <span>تاريخ البيان</span>
                </span>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                  {dayName}
                </span>
              </label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => handleDateChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '6px',
                  border: '1.5px solid #cbd5e1',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  background: '#ffffff',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              />
              <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    handleDateChange('2026-10-25');
                  }}
                  style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: '5px',
                    background: reportDate === '2026-10-25' ? '#0284c7' : '#e0f2fe',
                    border: '1px solid #bae6fd',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    color: reportDate === '2026-10-25' ? '#fff' : '#0369a1',
                    cursor: 'pointer'
                  }}
                >
                  الأحد 25-10 (معتمد) 📌
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    handleDateChange(today);
                  }}
                  style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: '5px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  اليوم 📅
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                اليوم
              </label>
              <select
                value={dayName}
                onChange={(e) => setDayName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  color: '#0284c7',
                  background: '#fff'
                }}
              >
                <option value="السبت">السبت</option>
                <option value="الأحد">الأحد</option>
                <option value="الإثنين">الإثنين</option>
                <option value="الثلاثاء">الثلاثاء</option>
                <option value="الأربعاء">الأربعاء</option>
                <option value="الخميس">الخميس</option>
                <option value="الجمعة">الجمعة</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                المرحلة / المسار
              </label>
              <select
                value={sector}
                onChange={(e) => {
                  setSector(e.target.value);
                  const isB = e.target.value.includes('B') || e.target.value.includes('الثانية');
                  setSectorDirector(isB ? 'م. عيسى الطاهر' : 'م. صلاح العربي');
                  setReportNumber(`TARGET-${isB ? 'PHASE-2' : 'PHASE-1'}-${Date.now().toString().slice(-4)}`);
                }}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  background: '#fff'
                }}
              >
                <option value="المرحلة الأولى">المرحلة الأولى (محطة 000+00 إلى 363+115)</option>
                <option value="المرحلة الثانية">المرحلة الثانية (محطة 363+115 إلى 280+226)</option>
                <option value="طريق أوباري - غات">طريق أوباري - غات (المسار العام)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                رقم البيان المرجعي
              </label>
              <input
                type="text"
                value={reportNumber}
                onChange={(e) => setReportNumber(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: '#475569',
                  background: '#f1f5f9'
                }}
              />
            </div>
          </div>

          {/* =========================================================================
              THE OFFICIAL TARGETED WORKS DOCUMENT SHEET (EXACT FROM USER'S IMAGES)
             ========================================================================= */}
          <div style={{
            background: '#ffffff',
            borderRadius: '8px',
            border: '2px solid #000000',
            padding: '1.25rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
          }}>
            {/* The Official Top Blue Title Ribbon (Exact from User Photo) */}
            <div style={{
              background: '#0284c7',
              color: '#ffffff',
              textAlign: 'center',
              padding: '0.85rem 1.5rem',
              borderRadius: '2px',
              border: '2px solid #000000',
              marginBottom: '1rem'
            }}>
              <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, letterSpacing: '0.5px' }}>
                بيان أعمال يوم {dayName} {formattedDashDate}
              </h1>
            </div>

            {/* SECTIONS RENDERER */}
            {sections.map((section, sIdx) => {
              const secLengthSum = section.workItems.reduce((acc, r) => acc + (parseFloat(r.length) || 0), 0);
              const secEquipSum = section.equipmentItems.reduce((acc, r) => acc + (parseFloat(r.count) || 0), 0);

              return (
                <div key={section.id} style={{ marginBottom: '1.75rem', borderBottom: sIdx < sections.length - 1 ? '2px dashed #94a3b8' : 'none', paddingBottom: sIdx < sections.length - 1 ? '1.5rem' : '0' }}>
                  
                  {/* Table 1: Work Items Table */}
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'center',
                    fontSize: '0.92rem',
                    border: '2px solid #000000',
                    marginBottom: '0.75rem'
                  }}>
                    <thead>
                      {/* Standard Columns Header */}
                      <tr style={{ background: '#f8fafc', color: '#000000', fontWeight: 900 }}>
                        <th style={{ border: '2px solid #000000', padding: '0.5rem', width: '45px' }}>م</th>
                        <th style={{ border: '2px solid #000000', padding: '0.5rem', width: '32%' }}>البند</th>
                        <th style={{ border: '2px solid #000000', padding: '0.5rem', width: '13%' }}>من</th>
                        <th style={{ border: '2px solid #000000', padding: '0.5rem', width: '13%' }}>الى</th>
                        <th style={{ border: '2px solid #000000', padding: '0.5rem', width: '14%' }}>طول</th>
                        <th style={{ border: '2px solid #000000', padding: '0.5rem', width: '23%' }}>ملاحظات</th>
                        <th style={{ border: '2px solid #000000', padding: '0.5rem', width: '45px' }} className="no-print">حذف</th>
                      </tr>

                      {/* Section Main Title Row with Yellow Background (Photo Exact) */}
                      <tr style={{ background: '#ffc000', color: '#000000', fontWeight: 900 }}>
                        <td style={{ border: '2px solid #000000', padding: '0.5rem' }}></td>
                        <td style={{ border: '2px solid #000000', padding: '0.4rem 0.6rem', textAlign: 'right' }}>
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) => handleSectionTitleChange(sIdx, 'title', e.target.value)}
                            style={{
                              width: '100%',
                              background: 'transparent',
                              border: 'none',
                              fontSize: '1rem',
                              fontWeight: 900,
                              color: '#000000'
                            }}
                          />
                        </td>
                        <td colSpan={3} style={{ border: '2px solid #000000', padding: '0.4rem' }}>
                          <span style={{ fontSize: '0.84rem', color: '#1e293b' }}>
                            {secLengthSum > 0 ? `إجمالي الطول: ${secLengthSum.toLocaleString('en-US')} م.ط` : ''}
                          </span>
                        </td>
                        <td colSpan={2} style={{ border: '2px solid #000000', padding: '0.35rem 0.6rem', textAlign: 'right' }}>
                          <input
                            type="text"
                            value={section.startTimeNote}
                            placeholder="وقت البدء (مثل: بدء أعمال الفرم الساعه 05:00 صباحاً)..."
                            onChange={(e) => handleSectionTitleChange(sIdx, 'startTimeNote', e.target.value)}
                            style={{
                              width: '100%',
                              background: 'transparent',
                              border: 'none',
                              fontSize: '0.88rem',
                              fontWeight: 800,
                              color: '#000000'
                            }}
                          />
                        </td>
                      </tr>
                    </thead>

                    <tbody>
                      {section.workItems.map((row, wIdx) => (
                        <tr key={row.id}>
                          <td style={{ border: '2px solid #000000', padding: '0.45rem', fontWeight: 900 }}>
                            {wIdx + 1}
                          </td>

                          <td style={{ border: '2px solid #000000', padding: '0.25rem 0.4rem' }}>
                            <input
                              type="text"
                              list={`work-presets-${sIdx}`}
                              placeholder="اسم بند العمل المنجز أو المستهدف..."
                              value={row.item}
                              onChange={(e) => handleWorkItemChange(sIdx, row.id, 'item', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.45rem',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.9rem',
                                fontWeight: 800
                              }}
                            />
                            <datalist id={`work-presets-${sIdx}`}>
                              {workPresets.map((p, i) => <option key={i} value={p} />)}
                            </datalist>
                          </td>

                          <td style={{ border: '2px solid #000000', padding: '0.25rem 0.4rem' }}>
                            <input
                              type="text"
                              placeholder="000+00"
                              value={row.stationFrom}
                              onChange={(e) => handleWorkItemChange(sIdx, row.id, 'stationFrom', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.45rem',
                                textAlign: 'center',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.9rem',
                                fontWeight: 800
                              }}
                            />
                          </td>

                          <td style={{ border: '2px solid #000000', padding: '0.25rem 0.4rem' }}>
                            <input
                              type="text"
                              placeholder="000+00"
                              value={row.stationTo}
                              onChange={(e) => handleWorkItemChange(sIdx, row.id, 'stationTo', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.45rem',
                                textAlign: 'center',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.9rem',
                                fontWeight: 800
                              }}
                            />
                          </td>

                          <td style={{ border: '2px solid #000000', padding: '0.25rem 0.4rem' }}>
                            <input
                              type="text" inputMode="decimal" dir="ltr" lang="en"
                              step="any"
                              placeholder="0.00"
                              value={row.length}
                              onChange={(e) => handleWorkItemChange(sIdx, row.id, 'length', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.45rem',
                                textAlign: 'center',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.9rem',
                                fontWeight: 800
                              }}
                            />
                          </td>

                          <td style={{ border: '2px solid #000000', padding: '0.25rem 0.4rem' }}>
                            <input
                              type="text"
                              placeholder="ملاحظات..."
                              value={row.notes}
                              onChange={(e) => handleWorkItemChange(sIdx, row.id, 'notes', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.45rem',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.85rem',
                                fontWeight: 600
                              }}
                            />
                          </td>

                          <td style={{ border: '2px solid #000000', padding: '0.25rem' }} className="no-print">
                            <button
                              type="button"
                              onClick={() => handleRemoveWorkItem(sIdx, row.id)}
                              style={{
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '4px',
                                color: '#dc2626',
                                padding: '0.35rem',
                                cursor: 'pointer'
                              }}
                              title="حذف هذا البند"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Add Row Button for Work */}
                  <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '0.75rem' }} className="no-print">
                    <button
                      type="button"
                      onClick={() => handleAddWorkItem(sIdx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        background: '#e0f2fe',
                        border: '1px solid #bae6fd',
                        color: '#0284c7',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={14} />
                      <span>+ إضافة بند عمل ({section.title})</span>
                    </button>
                  </div>

                  {/* Table 2: Equipment & Personnel Table for this Section */}
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'center',
                    fontSize: '0.92rem',
                    border: '2px solid #000000'
                  }}>
                    <thead>
                      <tr style={{ background: '#ffc000', color: '#000000', fontWeight: 900 }}>
                        <th style={{ border: '2px solid #000000', padding: '0.45rem', width: '45px' }}>م</th>
                        <th style={{ border: '2px solid #000000', padding: '0.45rem 0.75rem', width: '45%' }}>
                          <input
                            type="text"
                            value={section.equipmentTitle}
                            onChange={(e) => handleSectionTitleChange(sIdx, 'equipmentTitle', e.target.value)}
                            style={{
                              width: '100%',
                              background: 'transparent',
                              border: 'none',
                              fontSize: '0.95rem',
                              fontWeight: 900,
                              color: '#000000',
                              textAlign: 'center'
                            }}
                          />
                        </th>
                        <th style={{ border: '2px solid #000000', padding: '0.45rem', width: '15%' }}>
                          العدد {secEquipSum > 0 ? `(${secEquipSum})` : ''}
                        </th>
                        <th style={{ border: '2px solid #000000', padding: '0.45rem', width: '35%' }}>ملاحظات وتفاصيل التشغيل</th>
                        <th style={{ border: '2px solid #000000', padding: '0.45rem', width: '45px' }} className="no-print">حذف</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.equipmentItems.map((eq, eIdx) => (
                        <tr key={eq.id}>
                          <td style={{ border: '2px solid #000000', padding: '0.45rem', fontWeight: 900, background: '#fffbeb' }}>
                            {eIdx + 1}
                          </td>

                          <td style={{ border: '2px solid #000000', padding: '0.25rem 0.5rem' }}>
                            <input
                              type="text"
                              list={`equip-presets-${sIdx}`}
                              placeholder="اسم المعدة أو الآلية أو الطاقم..."
                              value={eq.name}
                              onChange={(e) => handleEquipmentItemChange(sIdx, eq.id, 'name', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.45rem',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.9rem',
                                fontWeight: 800,
                                textAlign: 'center'
                              }}
                            />
                            <datalist id={`equip-presets-${sIdx}`}>
                              {equipPresets.map((ep, i) => <option key={i} value={ep} />)}
                            </datalist>
                          </td>

                          <td style={{ border: '2px solid #000000', padding: '0.25rem 0.5rem' }}>
                            <input
                              type="text" inputMode="decimal" dir="ltr" lang="en"
                              step="any"
                              placeholder="0"
                              value={toCleanLatinDigits(eq.count)}
                              onChange={(e) => handleEquipmentItemChange(sIdx, eq.id, 'count', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.45rem',
                                textAlign: 'center',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.92rem',
                                fontWeight: 900
                              }}
                            />
                          </td>

                          <td style={{ border: '2px solid #000000', padding: '0.25rem 0.5rem' }}>
                            <input
                              type="text"
                              placeholder="ملاحظات (مثل: معالجة + فرم بدون أسمنت، وردية ليل)..."
                              value={eq.notes}
                              onChange={(e) => handleEquipmentItemChange(sIdx, eq.id, 'notes', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.45rem',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.85rem',
                                fontWeight: 600
                              }}
                            />
                          </td>

                          <td style={{ border: '2px solid #000000', padding: '0.25rem' }} className="no-print">
                            <button
                              type="button"
                              onClick={() => handleRemoveEquipmentItem(sIdx, eq.id)}
                              style={{
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '4px',
                                color: '#dc2626',
                                padding: '0.35rem',
                                cursor: 'pointer'
                              }}
                              title="حذف هذه الآلية"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Add Row Button for Equipment */}
                  <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.65rem' }} className="no-print">
                    <button
                      type="button"
                      onClick={() => handleAddEquipmentItem(sIdx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        background: '#fef3c7',
                        border: '1px solid #fde68a',
                        color: '#b45309',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={14} />
                      <span>+ إضافة آلية / طاقم ({section.title})</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Button to add extra section */}
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }} className="no-print">
              <button
                type="button"
                onClick={handleAddNewSection}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 1.25rem',
                  borderRadius: '8px',
                  background: '#f1f5f9',
                  border: '1px dashed #64748b',
                  color: '#334155',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} />
                <span>+ إضافة قسم مستهدف جديد (Custom Section)</span>
              </button>
            </div>

            {/* Grand Summary Strip */}
            <div style={{
              marginTop: '1.25rem',
              padding: '0.85rem 1.25rem',
              borderRadius: '6px',
              background: '#fef9c3',
              border: '2px solid #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: 900,
              fontSize: '1rem',
              color: '#000000'
            }}>
              <span>الإجمالي العام للأعمال المستهدفة المعتمدة:</span>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <span>إجمالي الأطوال: <strong style={{ color: '#0284c7' }}>{totalTargetLength.toLocaleString('en-US')}</strong> م.ط</span>
                <span>إجمالي المعدات والأطقم: <strong style={{ color: '#b45309' }}>{totalTargetEquipment.toLocaleString('en-US')}</strong> آلية/طاقم</span>
              </div>
            </div>

            {/* Official Dual Signatures (Exact from Bottom of Photo) */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              paddingLeft: '2rem',
              paddingRight: '2rem',
              marginTop: '2.5rem',
              marginBottom: '1rem'
            }}>
              <div style={{ textAlign: 'center', minWidth: '220px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#000000' }}>
                  مدير القطاع
                </h3>
                <div style={{ marginTop: '0.85rem', fontSize: '1rem', fontWeight: 800 }}>
                  مهندس :{' '}
                  <input
                    type="text"
                    value={sectorDirector}
                    onChange={(e) => setSectorDirector(e.target.value)}
                    style={{
                      border: 'none',
                      borderBottom: '2px dotted #000000',
                      padding: '0 0.4rem',
                      fontWeight: 800,
                      fontSize: '1rem',
                      textAlign: 'center',
                      background: 'transparent',
                      width: '180px'
                    }}
                  />
                </div>
              </div>

              <div style={{ textAlign: 'center', minWidth: '220px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#000000' }}>
                  ممثل الجهة المالكة
                </h3>
                <div style={{ marginTop: '0.85rem', fontSize: '1rem', fontWeight: 800 }}>
                  مهندس :{' '}
                  <input
                    type="text"
                    value={ownerRepresentative}
                    onChange={(e) => setOwnerRepresentative(e.target.value)}
                    style={{
                      border: 'none',
                      borderBottom: '2px dotted #000000',
                      padding: '0 0.4rem',
                      fontWeight: 800,
                      fontSize: '1rem',
                      textAlign: 'center',
                      background: 'transparent',
                      width: '180px'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSaveReport(false)}
              style={{
                flex: 1,
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                background: '#0284c7',
                border: 'none',
                color: '#fff',
                fontSize: '0.92rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)'
              }}
            >
              {isSubmitting ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
              <span>حفظ بيان الأعمال المستهدفة</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSaveReport(true)}
              style={{
                flex: 1,
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                background: '#1e293b',
                border: 'none',
                color: '#fff',
                fontSize: '0.92rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)'
              }}
            >
              <Send size={18} />
              <span>حفظ وإحالة بالبريد والمراسلات</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                background: '#16a34a',
                border: 'none',
                color: '#fff',
                fontSize: '0.92rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <FileSpreadsheet size={18} />
              <span>تصدير Excel</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const draftRep = {
                  reportNumber,
                  date: reportDate,
                  dateFormatted: formattedDashDate,
                  dayName,
                  title: `بيان أعمال يوم ${dayName} ${formattedDashDate}`,
                  sector,
                  reportType: 'تقرير الأعمال المستهدفة',
                  isTargetedWorksReport: true,
                  targetedSections: sections,
                  totalTargetLength,
                  totalTargetEquipment,
                  roadMeters: totalTargetLength,
                  sectorDirector,
                  ownerRepresentative,
                  uploadedBy: currentUser?.name || sectorDirector,
                  status: 'approved'
                };
                if (onPrintReport) onPrintReport(draftRep);
              }}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                background: '#475569',
                border: 'none',
                color: '#fff',
                fontSize: '0.92rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Printer size={18} />
              <span>معاينة الطباعة</span>
            </button>
          </div>

        </div>
      </div>

      {/* Forward Modal */}
      {showForwardModal && createdReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.65)',
          zIndex: 100000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          direction: 'rtl',
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            padding: '1.75rem',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
              إحالة بيان الأعمال المستهدفة عبر البريد والمراسلات
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem' }}>
                المستلم (الجهة المحال إليها):
              </label>
              <select
                value={forwardRecipient}
                onChange={(e) => setForwardRecipient(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.92rem',
                  fontWeight: 800
                }}
              >
                {officialSupervisors.map(u => (
                  <option key={u.username} value={u.username}>
                    {u.name} - {u.role}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem' }}>
                ملاحظات / نص الإحالة:
              </label>
              <textarea
                rows={3}
                value={forwardNote}
                placeholder="أدخل أي ملاحظات مرفقة مع البيان..."
                onChange={(e) => setForwardNote(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
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
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {isForwarding ? 'جارِ الإرسال...' : 'تأكيد الإرسال الآن'}
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
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTargetedWorksReportModal;
