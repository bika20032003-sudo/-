import React, { useState, useRef } from 'react';
import { 
  FilePlus, Send, Printer, CheckCircle2, AlertCircle, RefreshCw, 
  MapPin, Calendar, Clock, Layers, Fuel, Truck, Milestone, 
  FileText, Camera, Upload, Plus, Trash2, FileSpreadsheet, Eye, UserCheck, Target, Award, RotateCcw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { fastFetch } from '../utils/apiCache.js';
import { toCleanLatinDigits } from '../utils/forceLatinDigits.js';
import { TwoPhaseDailyReportForm } from '../components/TwoPhaseDailyReportForm';
import { canAccessTwoPhaseReport } from '../utils/permissionUtils';
import { ExecutiveProgressForm } from '../components/ExecutiveProgressForm';
import { RoadDailyReportForm } from '../components/RoadDailyReportForm';
import { FuelDailyReportForm } from '../components/FuelDailyReportForm';
import { 
  initialTargetedWorksSections, 
  emptyTargetedWorksSections, 
  defaultApprovedTargetedWorksReport 
} from '../components/CreateTargetedWorksReportModal';

export const CreateReportView = ({ currentUser, onNavigateTab, onPrintReport }) => {
  const username = currentUser?.username || '';
  const userSector = currentUser?.sector || '';
  const isSectorB = userSector.includes('B') || userSector.includes('الثانية') || username === 'issa_altahir';
  const isSectorA = (userSector.includes('A') || userSector.includes('الأولى') || username === 'salah_alarabi') && !isSectorB;

  const defaultSector = isSectorA ? 'المرحلة الأولى' : (isSectorB ? 'المرحلة الثانية' : 'المرحلة الأولى');

  // Days of week helper
  const getDayName = (dateStr) => {
    if (!dateStr) return 'السبت';
    const date = new Date(dateStr);
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()] || 'السبت';
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Active Report Category: 'road' | 'fuel'
  const [reportCategory, setReportCategory] = useState('road');

  useEffect(() => {
    if (reportCategory === 'two_phase' && !canAccessTwoPhaseReport(currentUser)) {
      setReportCategory('road');
    }
  }, [currentUser, reportCategory]);

  // Common Form States
  const [reportDate, setReportDate] = useState(todayStr);
  const [dayName, setDayName] = useState(getDayName(todayStr));
  const [sector, setSector] = useState(defaultSector);
  const [reportNumber, setReportNumber] = useState(`REP-${isSectorB ? 'PHASE-2' : 'PHASE-1'}-${Date.now().toString().slice(-4)}`);

  // Signatures for Road Report
  const defaultDirector = (typeof window !== 'undefined' && localStorage.getItem('system_default_sector_director')) || (isSectorB ? 'م. عيسى الطاهر' : 'م. صلاح العربي');
  const defaultOwner = (typeof window !== 'undefined' && localStorage.getItem('system_default_owner_representative')) || 'م. عبدالرحمن الأنصاري';
  const [sectorDirector, setSectorDirector] = useState(defaultDirector);
  const [ownerRepresentative, setOwnerRepresentative] = useState(defaultOwner);

  // 1. Road Work Items Table State
  const [roadItems, setRoadItems] = useState([
    { id: 1, item: '', stationFrom: '', stationTo: '', length: '', area: '', notes: '' }
  ]);

  const standardWorkItems = [
    'أعمال فرم FDR بدون أسمنت',
    'أعمال فرم FDR بالأسمنت',
    'أعمال معالجه FDR بالمياه',
    'تسليم طبقة الأساس',
    'تشغيل طبقة الأساس',
    'أعمال طبقة اسفلت 6 سم',
    'أعمال رش مادة بـ MCO على طبقة الأساس',
    'أعمال الطريق الخدمي',
    'أعمال طبقة أساس حبيبي',
    'رش طبقة لصق RC',
    'أعمال تسوية ودمك التربة',
    'أعمال منشآت هيدروليكية وبرابخ'
  ];

  // 2. Fuel Items Table State (Exact from user's fuel image)
  const [fuelItems, setFuelItems] = useState([
    { id: 1, location: '', dispatchedLiters: '', receivedLiters: '', remainingLiters: '' },
    { id: 2, location: '', dispatchedLiters: '', receivedLiters: '', remainingLiters: '' },
    { id: 3, location: '', dispatchedLiters: '', receivedLiters: '', remainingLiters: '' }
  ]);

  const locationPresets = ['107', '240', 'الكسارات', 'خزان المرحلة الأولى', 'خزان المرحلة الثانية', 'محطة الخلط', 'المستودع المركزي'];

  // 3. Targeted Works Sections State initialized with approved document data (Sunday 25/10/2026)
  const [targetedSections, setTargetedSections] = useState(() => 
    initialTargetedWorksSections.map(s => ({
      ...s,
      workItems: s.workItems.map(w => ({ ...w })),
      equipmentItems: s.equipmentItems.map(e => ({ ...e }))
    }))
  );

  const targetWorkPresets = [
    'أعمال فرم بدون أسمنت', 'أعمال فرم بالأسمنت', 'أعمال معالجه FDR بالمياه',
    'تسليم طبقة الأساس', 'تشغيل طبقة الأساس', 'أعمال رش بـ MCO على الأساس',
    'أعمال الطريق الخدمي', 'طبقة الاسفلت المحسن 6 سم', 'أعمال طبقة اسفلت رابطة'
  ];

  const targetEquipPresets = [
    'ماكينه FDR', 'جريدر', 'هراس حافر غنم', 'هراس تربه', 'تانك مياه', 'لودر',
    'قلابات', 'ماسيترا', 'جرار زراعي', 'عدد 3 طاقم مساحة', 'طاقم عمال للتفتيح والتشريك',
    'خلاط اسفلت', 'فنشر اسفلت', 'رولة اسفلت حديد', 'رولة اسفلت كاوتش', 'رولة اسفلت صغيرة',
    'بوب كات', 'كمبروسر', 'شاحنات', 'مهندس تنفيذ', 'مشرف تنفيذ', 'طاقم عمال كراك وشواك'
  ];

  // Optional auxiliary metrics
  const [fuelLiters, setFuelLiters] = useState('');
  const [workingEquipment, setWorkingEquipment] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  // Status & modal states
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

  const handleSectorChange = (newSector) => {
    setSector(newSector);
    const code = newSector.includes('B') || newSector.includes('الثانية') ? 'PHASE-2' : 'PHASE-1';
    const prefix = reportCategory === 'fuel' ? 'FUEL' : 'REP';
    setReportNumber(`${prefix}-${code}-${Date.now().toString().slice(-4)}`);
    if (newSector.includes('B') || newSector.includes('الثانية')) {
      setSectorDirector('م. عيسى الطاهر');
    } else {
      setSectorDirector('م. صلاح العربي');
    }
  };

  // Road Items Manipulation
  const handleAddRoadItem = () => {
    setRoadItems(prev => [
      ...prev,
      { id: Date.now() + Math.random(), item: '', stationFrom: '', stationTo: '', length: '', area: '', notes: '' }
    ]);
  };

  const handleRemoveRoadItem = (id) => {
    if (roadItems.length <= 1) {
      setRoadItems([{ id: Date.now(), item: '', stationFrom: '', stationTo: '', length: '', area: '', notes: '' }]);
      return;
    }
    setRoadItems(prev => prev.filter(r => r.id !== id));
  };

  const handleRoadRowChange = (id, field, value) => {
    setRoadItems(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  // Fuel Items Manipulation
  const handleAddFuelItem = () => {
    setFuelItems(prev => [
      ...prev,
      { id: Date.now() + Math.random(), location: '', dispatchedLiters: '', receivedLiters: '', remainingLiters: '' }
    ]);
  };

  const handleRemoveFuelItem = (id) => {
    if (fuelItems.length <= 1) {
      setFuelItems([{ id: Date.now(), location: '', dispatchedLiters: '', receivedLiters: '', remainingLiters: '' }]);
      return;
    }
    setFuelItems(prev => prev.filter(r => r.id !== id));
  };

  const handleFuelRowChange = (id, field, value) => {
    setFuelItems(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  // Targeted Works Section Handlers
  const handleTargetSectionTitleChange = (sIdx, field, val) => {
    setTargetedSections(prev => prev.map((s, i) => i === sIdx ? { ...s, [field]: val } : s));
  };
  const handleTargetWorkItemChange = (sIdx, id, field, val) => {
    setTargetedSections(prev => prev.map((s, i) => i === sIdx ? { ...s, workItems: s.workItems.map(w => w.id === id ? { ...w, [field]: val } : w) } : s));
  };
  const handleAddTargetWorkItem = (sIdx) => {
    setTargetedSections(prev => prev.map((s, i) => i === sIdx ? { ...s, workItems: [...s.workItems, { id: Date.now() + Math.random(), item: '', stationFrom: '', stationTo: '', length: '', notes: '' }] } : s));
  };
  const handleRemoveTargetWorkItem = (sIdx, id) => {
    setTargetedSections(prev => prev.map((s, i) => i === sIdx ? { ...s, workItems: s.workItems.filter(w => w.id !== id).length > 0 ? s.workItems.filter(w => w.id !== id) : [{ id: Date.now(), item: '', stationFrom: '', stationTo: '', length: '', notes: '' }] } : s));
  };
  const handleTargetEquipItemChange = (sIdx, id, field, val) => {
    const cleanVal = field === 'count' ? toCleanLatinDigits(val) : val;
    setTargetedSections(prev => prev.map((s, i) => i === sIdx ? { ...s, equipmentItems: s.equipmentItems.map(e => e.id === id ? { ...e, [field]: cleanVal } : e) } : s));
  };
  const handleAddTargetEquipItem = (sIdx) => {
    setTargetedSections(prev => prev.map((s, i) => i === sIdx ? { ...s, equipmentItems: [...s.equipmentItems, { id: Date.now() + Math.random(), name: '', count: '', notes: '' }] } : s));
  };
  const handleRemoveTargetEquipItem = (sIdx, id) => {
    setTargetedSections(prev => prev.map((s, i) => i === sIdx ? { ...s, equipmentItems: s.equipmentItems.filter(e => e.id !== id).length > 0 ? s.equipmentItems.filter(e => e.id !== id) : [{ id: Date.now(), name: '', count: '', notes: '' }] } : s));
  };

  const handleRestoreApprovedTargeted = () => {
    setReportDate('2026-10-25');
    setDayName('الأحد');
    setSector('طريق أوباري - غات');
    setReportNumber('TARGET-25.10.2026');
    setSectorDirector('مروان الهوني');
    setTargetedSections(initialTargetedWorksSections.map(s => ({
      ...s,
      workItems: s.workItems.map(w => ({ ...w })),
      equipmentItems: s.equipmentItems.map(e => ({ ...e }))
    })));
    setStatusMessage({
      type: 'success',
      text: 'تمت استعادة كافة البيانات المعتمدة لتقرير الأعمال المستهدفة ليوم الأحد 25-10-2026 بنجاح!'
    });
  };

  const handleClearTargetedFields = () => {
    if (window.confirm('هل تريد تفريغ حقول الأعمال المستهدفة لإدخال بيان جديد فارغ؟')) {
      setTargetedSections(emptyTargetedWorksSections.map(s => ({
        ...s,
        workItems: s.workItems.map(w => ({ ...w })),
        equipmentItems: s.equipmentItems.map(e => ({ ...e }))
      })));
      setStatusMessage({ type: 'info', text: 'تم تفريغ الحقول بنجاح لإدخال بيانات جديدة.' });
    }
  };

  // Calculated Totals
  const totalTargetLength = targetedSections.reduce((sum, sec) => sum + sec.workItems.reduce((acc, w) => acc + (parseFloat(w.length) || 0), 0), 0);
  const totalTargetEquipment = targetedSections.reduce((sum, sec) => sum + sec.equipmentItems.reduce((acc, e) => acc + (parseFloat(e.count) || 0), 0), 0);

  // Calculated Road totals
  const totalRoadLength = roadItems.reduce((sum, row) => sum + (parseFloat(row.length) || 0), 0);
  const totalRoadArea = roadItems.reduce((sum, row) => sum + (parseFloat(row.area) || 0), 0);

  // Calculated Fuel totals
  const totalFuelDispatched = fuelItems.reduce((sum, row) => sum + (parseFloat(row.dispatchedLiters) || 0), 0);
  const totalFuelReceived = fuelItems.reduce((sum, row) => sum + (parseFloat(row.receivedLiters) || 0), 0);
  const totalFuelRemaining = fuelItems.reduce((sum, row) => sum + (parseFloat(row.remainingLiters) || 0), 0);

  // Date formats
  const dateParts = reportDate.split('-');
  const displayDateStr = dateParts.length === 3 ? `${dateParts[2]} - ${dateParts[1]} - ${dateParts[0]}` : reportDate;
  const formattedSlashDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : reportDate;

  // File handling
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAttachedFile(ev.target?.result);
    };
    reader.readAsDataURL(file);
  };

  // Reset form
  const resetForm = () => {
    const code = sector.includes('B') ? 'SEC-B' : 'SEC-A';
    const prefix = reportCategory === 'fuel' ? 'FUEL' : 'REP';
    setReportNumber(`${prefix}-${code}-${Date.now().toString().slice(-4)}`);
    setRoadItems([{ id: Date.now(), item: '', stationFrom: '', stationTo: '', length: '', area: '', notes: '' }]);
    setFuelItems([
      { id: 1, location: '', dispatchedLiters: '', receivedLiters: '', remainingLiters: '' },
      { id: 2, location: '', dispatchedLiters: '', receivedLiters: '', remainingLiters: '' },
      { id: 3, location: '', dispatchedLiters: '', receivedLiters: '', remainingLiters: '' }
    ]);
    setFuelLiters('');
    setWorkingEquipment('');
    setAttachedFile(null);
    setFileName('');
    setCreatedReport(null);
    setStatusMessage(null);
  };

  // Excel Export
  const handleExportExcel = () => {
    try {
      let dataRows = [];
      let sheetName = 'تقرير رسمي';
      let fileNameExcel = `تقرير_${reportDate}.xlsx`;

      if (reportCategory === 'targeted') {
        sheetName = 'بيان الأعمال المستهدفة';
        fileNameExcel = `بيان_الأعمال_المستهدفة_${dayName}_${reportDate}.xlsx`;
        dataRows = [
          [`بيان أعمال يوم ${dayName} ${displayDateStr}`],
          [`القطاع: ${sector}`, `رقم البيان: ${reportNumber}`],
          []
        ];

        targetedSections.forEach(sec => {
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
          dataRows.push([sec.equipmentTitle, 'العدد', '', '', '', 'ملاحظات وتفاصيل التشغيل']);
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
        dataRows.push([`مدير القطاع: ${sectorDirector}`, '', '', `ممثل الجهة المالكة: ${ownerRepresentative}`]);
      } else if (reportCategory === 'fuel') {
        sheetName = 'تقرير الوقود اليومي';
        fileNameExcel = `تقرير_كميات_الوقود_${formattedSlashDate.replace(/\//g, '-')}.xlsx`;
        dataRows = [
          ['تقرير كميات الوقود اليومية'],
          [`يوم ${dayName}`, formattedSlashDate],
          [],
          ['ت', 'الموقع', 'الكمية المصروفة (لتر)', 'الوارد (لتر)', 'الكمية المتبقية (لتر)']
        ];

        fuelItems.forEach((row, idx) => {
          dataRows.push([
            idx + 1,
            row.location || '-',
            row.dispatchedLiters ? parseFloat(row.dispatchedLiters) : 0,
            row.receivedLiters ? parseFloat(row.receivedLiters) : 0,
            row.remainingLiters ? parseFloat(row.remainingLiters) : 0
          ]);
        });

        dataRows.push([]);
        dataRows.push([
          'الإجمالي (لتر)',
          '',
          totalFuelDispatched,
          totalFuelReceived,
          totalFuelRemaining
        ]);
      } else {
        sheetName = 'تقرير الأعمال اليومي';
        fileNameExcel = `تقرير_أعمال_${dayName}_${reportDate}.xlsx`;
        dataRows = [
          [`تقرير أعمال يوم ${dayName} ${reportDate}`],
          [`القطاع: ${sector}`, `رقم التقرير: ${reportNumber}`],
          [],
          ['م', 'البند', 'من', 'الى', 'طول (م)', 'م٢', 'ملاحظات']
        ];

        roadItems.forEach((row, idx) => {
          dataRows.push([
            idx + 1,
            row.item || '-',
            row.stationFrom || '-',
            row.stationTo || '-',
            row.length ? parseFloat(row.length) : '-',
            row.area ? parseFloat(row.area) : '-',
            row.notes || '-'
          ]);
        });

        dataRows.push([]);
        dataRows.push(['الإجمالي', '', '', '', totalRoadLength, totalRoadArea, '']);
        dataRows.push([]);
        dataRows.push([`مدير القطاع: ${sectorDirector}`, '', '', `ممثل الجهة المالكة: ${ownerRepresentative}`]);
      }

      const ws = XLSX.utils.aoa_to_sheet(dataRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, fileNameExcel);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
    }
  };

  // Save Report
  const handleSaveReport = async (sendAfter = false) => {
    setIsSubmitting(true);
    setStatusMessage(null);

    const isSecB = sector.includes('B');
    let payload = null;

    if (reportCategory === 'targeted') {
      const reportTitle = `بيان أعمال يوم ${dayName} ${displayDateStr}`;
      payload = {
        reportNumber: reportNumber.trim() || `TARGET-${isSecB ? 'SEC-B' : 'SEC-A'}-${Date.now().toString().slice(-4)}`,
        date: new Date(reportDate).toISOString(),
        dateFormatted: displayDateStr,
        dayName: dayName,
        title: reportTitle,
        sector: sector,
        sectorCode: isSecB ? 'B' : 'A',
        companyName: isSecB ? 'المرحلة الثانية' : 'المرحلة الأولى',
        reportType: 'تقرير الأعمال المستهدفة',
        isTargetedWorksReport: true,
        targetedSections: targetedSections,
        totalTargetLength: totalTargetLength,
        totalTargetEquipment: totalTargetEquipment,
        roadMeters: totalTargetLength,
        uploadedBy: currentUser?.name || sectorDirector,
        status: 'approved',
        approvedBy: ownerRepresentative,
        sectorDirector: sectorDirector,
        ownerRepresentative: ownerRepresentative,
        notes: `بيان استهداف الأعمال اليومية والمعدات المطلوبة بموقع ${sector}`
      };
    } else if (reportCategory === 'fuel') {
      const validFuel = fuelItems.filter(r => r.location.trim() || r.dispatchedLiters || r.receivedLiters || r.remainingLiters);
      payload = {
        reportNumber: reportNumber.trim() || `FUEL-${Date.now().toString().slice(-4)}`,
        date: new Date(reportDate).toISOString(),
        dateFormatted: formattedSlashDate,
        dayName: dayName,
        title: 'تقرير كميات الوقود اليومية',
        reportType: 'تقرير كميات الوقود اليومية',
        isFuelReport: true,
        sector: sector,
        fuelAmount: totalFuelDispatched,
        totalDispatchedLiters: totalFuelDispatched,
        totalReceivedLiters: totalFuelReceived,
        totalRemainingLiters: totalFuelRemaining,
        uploadedBy: currentUser?.name || 'مسؤول الوقود',
        status: 'approved',
        approvedBy: 'م. عبدالرحمن الأنصاري (مدير المشروع)',
        fuelItems: validFuel.map((r, idx) => ({
          index: idx + 1,
          location: r.location.trim(),
          dispatchedLiters: parseFloat(r.dispatchedLiters) || 0,
          receivedLiters: parseFloat(r.receivedLiters) || 0,
          remainingLiters: parseFloat(r.remainingLiters) || 0
        })),
        notes: `تقرير كميات الوقود اليومية ليوم ${dayName} ${formattedSlashDate} - إجمالي المنصرف: ${totalFuelDispatched.toLocaleString()} لتر - الوارد: ${totalFuelReceived.toLocaleString()} لتر - المتبقي: ${totalFuelRemaining.toLocaleString()} لتر`
      };
    } else {
      const validRoad = roadItems.filter(r => r.item.trim() || r.stationFrom.trim() || r.stationTo.trim() || r.length || r.area);
      const reportTitle = `بيان أعمال يوم ${dayName} ${displayDateStr}`;
      payload = {
        reportNumber: reportNumber.trim() || `REP-${isSecB ? 'SEC-B' : 'SEC-A'}-${Date.now().toString().slice(-4)}`,
        date: new Date(reportDate).toISOString(),
        dayName: dayName,
        title: reportTitle,
        sector: sector,
        sectorCode: isSecB ? 'B' : 'A',
        companyName: isSecB ? 'المرحلة الثانية' : 'المرحلة الأولى',
        reportType: 'تقرير أعمال الطريق اليومي',
        shiftType: 'وردية صباحية',
        materialName: reportTitle,
        productionAmount: 0,
        salesAmount: totalRoadLength,
        roadMeters: totalRoadLength,
        fuelAmount: Number(fuelLiters) || 0,
        workingEquipmentCount: Number(workingEquipment) || 0,
        stoppedEquipmentCount: 0,
        uploadedBy: currentUser?.name || sectorDirector,
        status: 'approved',
        approvedBy: ownerRepresentative,
        sectorDirector: sectorDirector,
        ownerRepresentative: ownerRepresentative,
        totalLength: totalRoadLength,
        totalArea: totalRoadArea,
        items: validRoad.map((r, idx) => ({
          index: idx + 1,
          item: r.item.trim(),
          stationFrom: r.stationFrom.trim(),
          stationTo: r.stationTo.trim(),
          length: parseFloat(r.length) || 0,
          area: parseFloat(r.area) || 0,
          notes: r.notes.trim()
        })),
        notes: `تقرير أعمال يومي معتمد - إجمالي الأطوال: ${totalRoadLength} م.ط - إجمالي المساحة: ${totalRoadArea} م²`,
        imageUrl: attachedFile,
        fileName: fileName
      };
    }

    try {
      let saved = null;
      try {
        const res = await fastFetch('http://localhost:5000/api/reports/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res && res.success && res.report) {
          saved = res.report;
        }
      } catch (err) {
        console.warn('Backend unavailable, saving locally:', err);
      }

      if (!saved) {
        saved = {
          id: Date.now(),
          ...payload,
          createdAt: new Date().toISOString()
        };
      }

      try {
        const local = JSON.parse(localStorage.getItem('local_reports') || '[]');
        local.unshift(saved);
        localStorage.setItem('local_reports', JSON.stringify(local));
      } catch (e) {
        console.error(e);
      }

      // Clear client API cache completely so Dashboard and sections immediately get fresh data
      try {
        clearApiCache();
      } catch (cacheErr) {}

      // Instantly notify Dashboard and other views
      try {
        window.dispatchEvent(new CustomEvent('report-saved', { detail: saved }));
        window.dispatchEvent(new CustomEvent('road-progress-updated', { detail: saved }));
        window.dispatchEvent(new CustomEvent('fuel-updated', { detail: saved }));
      } catch (evtErr) {}

      setCreatedReport(saved);
      setStatusMessage({ type: 'success', text: `تم حفظ ${saved.title || saved.reportType} برقم (${saved.reportNumber}) بنجاح وتوجيهه للقسم المختص!` });

      if (sendAfter) {
        setShowForwardModal(true);
      }
    } catch (error) {
      console.error('Error saving report:', error);
      setStatusMessage({ type: 'danger', text: 'حدث خطأ أثناء حفظ التقرير.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Forward Report
  const handleForwardReport = async () => {
    if (!createdReport) return;
    setIsForwarding(true);

    const targetUser = officialSupervisors.find(u => u.username === forwardRecipient) || officialSupervisors[0];

    const messagePayload = {
      fromUsername: currentUser?.username || 'user',
      fromName: currentUser?.name || (reportCategory === 'fuel' ? 'مسؤول الوقود' : sectorDirector),
      fromRole: currentUser?.title || currentUser?.role || 'جهاز الإشراف',
      toUsername: targetUser.username,
      toName: targetUser.name,
      toRole: targetUser.role,
      type: 'إحالة تقرير يومي',
      subject: `إحالة ${createdReport.title || createdReport.reportType} - رقم (${createdReport.reportNumber})`,
      content: forwardNote.trim() || `نحيل إليكم التقرير اليومي المعتمد بموقع ${createdReport.sector} للإحاطة والمتابعة.`,
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
        text: `تم حفظ التقرير وإرساله رسمياً عبر البريد والمراسلات إلى (${targetUser.name}) بنجاح!` 
      });

      setTimeout(() => {
        if (onNavigateTab) onNavigateTab('messages');
      }, 1200);
    } catch (err) {
      console.error('Failed to forward message:', err);
      alert('تم حفظ التقرير بنجاح.');
    } finally {
      setIsForwarding(false);
    }
  };

  return (
    <div style={{ padding: '1.25rem', maxWidth: '1350px', margin: '0 auto', direction: 'rtl' }}>
      
      {/* Top Header Card */}
      <div style={{
        background: reportCategory === 'executive'
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%)'
          : reportCategory === 'fuel' 
          ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' 
          : reportCategory === 'two_phase'
          ? 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)'
          : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        borderRadius: '16px',
        padding: '1.25rem 1.75rem',
        color: '#fff',
        boxShadow: reportCategory === 'executive'
          ? '0 8px 24px rgba(15, 23, 42, 0.35)'
          : reportCategory === 'fuel' 
          ? '0 8px 24px rgba(217, 119, 6, 0.25)' 
          : reportCategory === 'two_phase'
          ? '0 8px 24px rgba(30, 58, 138, 0.25)'
          : '0 8px 24px rgba(2, 132, 199, 0.25)',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            color: reportCategory === 'executive' ? '#0284c7' : (reportCategory === 'fuel' ? '#d97706' : (reportCategory === 'two_phase' ? '#1e40af' : '#0284c7'))
          }}>
            {reportCategory === 'executive' ? <Award size={28} /> : (reportCategory === 'fuel' ? <Fuel size={28} /> : (reportCategory === 'two_phase' ? <Layers size={28} /> : <FilePlus size={28} />))}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#ffffff' }}>
              {reportCategory === 'executive'
                ? 'استمارة تقرير الموقف التنفيذي (360 كم)'
                : reportCategory === 'fuel' 
                ? 'إنشاء تقرير كميات الوقود اليومية' 
                : reportCategory === 'targeted'
                ? 'إنشاء تقرير الأعمال المستهدفة اليومية'
                : reportCategory === 'two_phase'
                ? 'تقرير الأعمال المنجزة للمرحلتين (اليومي)'
                : 'إنشاء تقرير أعمال الطريق اليومي'}
            </h1>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#f8fafc' }}>
              {reportCategory === 'executive'
                ? 'توثيق وتعديل بيانات الموقف التنفيذي الفني والمالي لمشروع صيانة طريق أوباري - غات (360 كم)'
                : reportCategory === 'fuel'
                ? 'توثيق الكميات المصروفة، الوارد والمخزون المتبقي بالخزانات والصهاريج اليومية'
                : reportCategory === 'targeted'
                ? 'توثيق بنود وأطوال الأعمال والمعدات المستهدفة للأقسام التشغيلية'
                : reportCategory === 'two_phase'
                ? 'متابعة الأعمال المنجزة للمرحلتين الأولى والثانية مع حسابات التجميع والفروقات والمتبقي'
                : 'توثيق محطات الرصف، أطوال التنفيذ، المساحات بالمتر المربع والتوقيعات الرسمية'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {reportCategory !== 'executive' && reportCategory !== 'two_phase' && (
            <button
              type="button"
              onClick={handleExportExcel}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                background: '#16a34a',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(22, 163, 74, 0.3)'
              }}
            >
              <FileSpreadsheet size={16} />
              <span>تصدير إكسل</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('reports-archive')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <FileText size={16} />
            <span>أرشيف التقارير</span>
          </button>
        </div>
      </div>

      {/* Report Template Selector Segmented Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.25rem',
        background: '#ffffff',
        padding: '0.5rem',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        width: 'fit-content',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={() => {
            setReportCategory('road');
            const code = sector.includes('B') ? 'SEC-B' : 'SEC-A';
            setReportNumber(`REP-${code}-${Date.now().toString().slice(-4)}`);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            background: reportCategory === 'road' ? '#0284c7' : 'transparent',
            color: reportCategory === 'road' ? '#ffffff' : '#64748b',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Milestone size={17} />
          <span>تقرير أعمال الطريق اليومي</span>
        </button>

        {canAccessTwoPhaseReport(currentUser) && (
          <button
            type="button"
            onClick={() => {
              setReportCategory('two_phase');
              setReportNumber(`PHASE-REP-${Date.now().toString().slice(-4)}`);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: reportCategory === 'two_phase' ? 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' : 'transparent',
              color: reportCategory === 'two_phase' ? '#ffffff' : '#64748b',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: reportCategory === 'two_phase' ? '0 2px 8px rgba(30, 58, 138, 0.25)' : 'none'
            }}
          >
            <Layers size={17} />
            <span>تقرير الأعمال المنجزة للمرحلتين</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setReportCategory('targeted');
            const code = sector.includes('B') ? 'SEC-B' : 'SEC-A';
            setReportNumber(`TARGET-${code}-${Date.now().toString().slice(-4)}`);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            background: reportCategory === 'targeted' ? '#0284c7' : 'transparent',
            color: reportCategory === 'targeted' ? '#ffffff' : '#64748b',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Target size={17} />
          <span>تقرير الأعمال المستهدفة اليومية</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setReportCategory('fuel');
            const code = sector.includes('B') ? 'SEC-B' : 'SEC-A';
            setReportNumber(`FUEL-${code}-${Date.now().toString().slice(-4)}`);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            background: reportCategory === 'fuel' ? '#d97706' : 'transparent',
            color: reportCategory === 'fuel' ? '#ffffff' : '#64748b',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Fuel size={17} />
          <span>تقرير كميات الوقود اليومية</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setReportCategory('executive');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            background: reportCategory === 'executive' ? 'linear-gradient(135deg, #0f172a 0%, #0369a1 100%)' : 'transparent',
            color: reportCategory === 'executive' ? '#ffffff' : '#64748b',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: reportCategory === 'executive' ? '0 2px 8px rgba(3, 105, 161, 0.35)' : 'none'
          }}
        >
          <Award size={17} />
          <span>الموقف التنفيذي (360 كم)</span>
        </button>
      </div>

      {reportCategory === 'executive' ? (
        <ExecutiveProgressForm
          currentUser={currentUser}
          onNavigateTab={onNavigateTab}
          onPrintReport={onPrintReport}
        />
      ) : reportCategory === 'two_phase' ? (
        <TwoPhaseDailyReportForm 
          currentUser={currentUser} 
          onReportSaved={(saved) => {
            setCreatedReport(saved);
            setStatusMessage({ type: 'success', text: `تم حفظ تقرير إنجاز المرحلتين برقم (${saved.reportNumber}) بنجاح!` });
          }} 
          onPrintReport={onPrintReport} 
          onNavigateTab={onNavigateTab} 
        />
      ) : reportCategory === 'road' ? (
        <RoadDailyReportForm
          currentUser={currentUser}
          onSaved={(saved) => {
            setCreatedReport(saved);
            setStatusMessage({ type: 'success', text: `تم حفظ واعتماد تقرير أعمال الطريق اليومي بنجاح!` });
          }}
          onPrintReport={onPrintReport}
          onNavigateTab={onNavigateTab}
        />
      ) : reportCategory === 'fuel' ? (
        <FuelDailyReportForm
          currentUser={currentUser}
          onSaved={(saved) => {
            setCreatedReport(saved);
            setStatusMessage({ type: 'success', text: `تم حفظ واعتماد تقرير كميات الوقود اليومية بنجاح!` });
          }}
          onPrintReport={onPrintReport}
          onNavigateTab={onNavigateTab}
        />
      ) : (
        <>
          {/* Status Alert if any */}
          {statusMessage && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: statusMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: statusMessage.type === 'success' ? '1px solid #bbf7d0' : '1px solid #fecaca',
          color: statusMessage.type === 'success' ? '#166534' : '#991b1b',
          fontSize: '0.92rem',
          fontWeight: 700
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {statusMessage.type === 'success' ? <CheckCircle2 size={20} color="#22c55e" /> : <AlertCircle size={20} color="#ef4444" />}
            <span>{statusMessage.text}</span>
          </div>

          {createdReport && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => {
                    const dest = reportCategory === 'fuel' ? 'fuel' : (reportCategory === 'targeted' ? 'targeted-works' : (reportCategory === 'executive' ? 'executive-progress' : 'road-progress'));
                    onNavigateTab(dest);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.9rem',
                    borderRadius: '8px',
                    background: '#16a34a',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)'
                  }}
                >
                  <span>
                    الانتقال فوراً لقسم {reportCategory === 'fuel' ? 'الوقود' : (reportCategory === 'targeted' ? 'الأعمال المستهدفة' : (reportCategory === 'executive' ? 'الموقف التنفيذي' : 'إنجاز الطريق'))} 🚀
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onPrintReport && onPrintReport(createdReport)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  background: '#fff',
                  border: '1px solid #cbd5e1',
                  color: '#1e293b',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Printer size={15} />
                <span>طباعة التقرير</span>
              </button>

              <button
                type="button"
                onClick={() => setShowForwardModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '8px',
                  background: reportCategory === 'fuel' ? '#d97706' : '#0284c7',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Send size={15} />
                <span>إرسال بالبريد إلى مسؤول</span>
              </button>

              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: '1px solid #cbd5e1',
                  color: '#64748b',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                تقرير جديد
              </button>
            </div>
          )}
        </div>
      )}

      {/* Control Bar: Date, Day, Sector, Report Number */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        padding: '1.25rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        marginBottom: '1.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1.25rem'
      }}>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={16} color="#0284c7" />
              <span>تاريخ التقرير</span>
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>
              {dayName}
            </span>
          </label>
          <input
            type="date"
            value={reportDate}
            onChange={(e) => handleDateChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.92rem',
              fontWeight: 800,
              color: '#0f172a',
              background: '#f8fafc',
              cursor: 'pointer',
              outline: 'none'
            }}
          />
          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.4rem' }}>
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
            <button
              type="button"
              onClick={() => handleDateChange('2026-10-24')}
              style={{
                padding: '0.2rem 0.5rem',
                borderRadius: '5px',
                background: reportDate === '2026-10-24' ? '#0284c7' : '#e0f2fe',
                border: '1px solid #bae6fd',
                fontSize: '0.74rem',
                fontWeight: 800,
                color: reportDate === '2026-10-24' ? '#fff' : '#0369a1',
                cursor: 'pointer'
              }}
            >
              24-10 📌
            </button>
            <button
              type="button"
              onClick={() => handleDateChange('2026-10-25')}
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
              25-10 📌
            </button>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem' }}>
            اليوم
          </label>
          <select
            value={dayName}
            onChange={(e) => setDayName(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.92rem',
              fontWeight: 800,
              color: reportCategory === 'fuel' ? '#d97706' : '#0284c7',
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
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem' }}>
            المرحلة / المسار
          </label>
          <select
            value={sector}
            onChange={(e) => handleSectorChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.92rem',
              fontWeight: 800,
              color: '#0f172a',
              background: '#fff'
            }}
          >
            <option value="المرحلة الأولى">المرحلة الأولى (محطة 000+00 إلى 363+115)</option>
            <option value="المرحلة الثانية">المرحلة الثانية (محطة 363+115 إلى 280+226)</option>
            <option value="طريق أوباري - غات">طريق أوباري - غات (المسار العام)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem' }}>
            رقم التقرير
          </label>
          <input
            type="text"
            value={reportNumber}
            onChange={(e) => setReportNumber(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.92rem',
              fontWeight: 800,
              color: '#0f172a',
              background: '#f8fafc'
            }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155' }}>
              👷 مدير القطاع:
            </label>
            <div style={{ display: 'flex', gap: '3px' }}>
              <button 
                type="button" 
                onClick={() => { setSectorDirector('م. صلاح العربي'); if (typeof window !== 'undefined') localStorage.setItem('system_default_sector_director', 'م. صلاح العربي'); }}
                style={{ fontSize: '0.68rem', padding: '1px 5px', borderRadius: '4px', border: '1px solid #cbd5e1', background: sectorDirector === 'م. صلاح العربي' ? '#dbeafe' : '#fff', color: '#1e40af', cursor: 'pointer', fontWeight: 700 }}
              >
                المرحلة 1
              </button>
              <button 
                type="button" 
                onClick={() => { setSectorDirector('م. عيسى الطاهر'); if (typeof window !== 'undefined') localStorage.setItem('system_default_sector_director', 'م. عيسى الطاهر'); }}
                style={{ fontSize: '0.68rem', padding: '1px 5px', borderRadius: '4px', border: '1px solid #cbd5e1', background: sectorDirector === 'م. عيسى الطاهر' ? '#dbeafe' : '#fff', color: '#0e7490', cursor: 'pointer', fontWeight: 700 }}
              >
                المرحلة 2
              </button>
            </div>
          </div>
          <input
            type="text"
            value={sectorDirector}
            onChange={(e) => {
              setSectorDirector(e.target.value);
              if (typeof window !== 'undefined') localStorage.setItem('system_default_sector_director', e.target.value);
            }}
            placeholder="اسم مدير القطاع"
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.92rem',
              fontWeight: 800,
              color: '#0f172a'
            }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155' }}>
              🏛️ ممثل الجهة المالكة:
            </label>
            <div style={{ display: 'flex', gap: '3px' }}>
              <button 
                type="button" 
                onClick={() => { setOwnerRepresentative('م. عبدالرحمن الأنصاري'); if (typeof window !== 'undefined') localStorage.setItem('system_default_owner_representative', 'م. عبدالرحمن الأنصاري'); }}
                style={{ fontSize: '0.68rem', padding: '1px 5px', borderRadius: '4px', border: '1px solid #cbd5e1', background: ownerRepresentative === 'م. عبدالرحمن الأنصاري' ? '#dcfce7' : '#fff', color: '#166534', cursor: 'pointer', fontWeight: 700 }}
              >
                الأنصاري
              </button>
              <button 
                type="button" 
                onClick={() => { setOwnerRepresentative('م. عبدالسلام ابريكاو'); if (typeof window !== 'undefined') localStorage.setItem('system_default_owner_representative', 'م. عبدالسلام ابريكاو'); }}
                style={{ fontSize: '0.68rem', padding: '1px 5px', borderRadius: '4px', border: '1px solid #cbd5e1', background: ownerRepresentative === 'م. عبدالسلام ابريكاو' ? '#ede9fe' : '#fff', color: '#5b21b6', cursor: 'pointer', fontWeight: 700 }}
              >
                ابريكاو
              </button>
            </div>
          </div>
          <input
            type="text"
            value={ownerRepresentative}
            onChange={(e) => {
              setOwnerRepresentative(e.target.value);
              if (typeof window !== 'undefined') localStorage.setItem('system_default_owner_representative', e.target.value);
            }}
            placeholder="اسم ممثل الجهة المالكة"
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.92rem',
              fontWeight: 800,
              color: '#0f172a'
            }}
          />
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: DAILY TARGETED WORKS REPORT FORM (EXACT FROM ATTACHED IMAGES)
         ========================================================================= */}
      {reportCategory === 'targeted' ? (
        <div style={{
          background: '#ffffff',
          borderRadius: '8px',
          border: '2px solid #000000',
          padding: '1.5rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          marginBottom: '1.5rem'
        }}>
          {/* Quick Toolbar for Approved Data & Reset */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.65rem',
            background: '#f8fafc',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1.5px solid #cbd5e1',
            marginBottom: '1rem'
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
                onClick={handleRestoreApprovedTargeted}
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
                onClick={handleClearTargetedFields}
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

          {/* Top Blue Ribbon (Exact from User Photo 1 & 2) */}
          <div style={{
            background: '#0284c7',
            color: '#ffffff',
            textAlign: 'center',
            padding: '0.85rem 1.5rem',
            borderRadius: '2px',
            border: '2px solid #000000',
            marginBottom: '1rem'
          }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>
              بيان أعمال يوم {dayName} {displayDateStr}
            </h2>
          </div>

          {/* Sections Renderer */}
          {targetedSections.map((section, sIdx) => {
            const secLengthSum = section.workItems.reduce((acc, r) => acc + (parseFloat(r.length) || 0), 0);
            const secEquipSum = section.equipmentItems.reduce((acc, r) => acc + (parseFloat(r.count) || 0), 0);

            return (
              <div key={section.id} style={{ marginBottom: '1.75rem', borderBottom: sIdx < targetedSections.length - 1 ? '2px dashed #94a3b8' : 'none', paddingBottom: sIdx < targetedSections.length - 1 ? '1.5rem' : '0' }}>
                {/* Table 1: Work Items */}
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'center',
                  fontSize: '0.92rem',
                  border: '2px solid #000000',
                  marginBottom: '0.65rem'
                }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', color: '#000000', fontWeight: 900 }}>
                      <th style={{ border: '2px solid #000000', padding: '0.5rem', width: '45px' }}>م</th>
                      <th style={{ border: '2px solid #000000', padding: '0.5rem', width: '32%' }}>البند</th>
                      <th style={{ border: '2px solid #000000', padding: '0.5rem', width: '13%' }}>من</th>
                      <th style={{ border: '2px solid #000000', padding: '0.5rem', width: '13%' }}>الى</th>
                      <th style={{ border: '2px solid #000000', padding: '0.5rem', width: '14%' }}>طول</th>
                      <th style={{ border: '2px solid #000000', padding: '0.5rem', width: '23%' }}>ملاحظات</th>
                      <th style={{ border: '2px solid #000000', padding: '0.5rem', width: '45px' }} className="no-print">حذف</th>
                    </tr>
                    <tr style={{ background: '#ffc000', color: '#000000', fontWeight: 900 }}>
                      <td style={{ border: '2px solid #000000', padding: '0.5rem' }}></td>
                      <td style={{ border: '2px solid #000000', padding: '0.4rem 0.6rem', textAlign: 'right' }}>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => handleTargetSectionTitleChange(sIdx, 'title', e.target.value)}
                          style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '1rem', fontWeight: 900, color: '#000000' }}
                        />
                      </td>
                      <td colSpan={3} style={{ border: '2px solid #000000', padding: '0.4rem', fontSize: '0.85rem' }}>
                        {secLengthSum > 0 ? `إجمالي الطول: ${secLengthSum.toLocaleString()} م.ط` : ''}
                      </td>
                      <td colSpan={2} style={{ border: '2px solid #000000', padding: '0.35rem 0.6rem', textAlign: 'right' }}>
                        <input
                          type="text"
                          value={section.startTimeNote}
                          onChange={(e) => handleTargetSectionTitleChange(sIdx, 'startTimeNote', e.target.value)}
                          style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '0.88rem', fontWeight: 800, color: '#000000' }}
                        />
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    {section.workItems.map((row, wIdx) => (
                      <tr key={row.id}>
                        <td style={{ border: '2px solid #000000', padding: '0.45rem', fontWeight: 900 }}>{wIdx + 1}</td>
                        <td style={{ border: '2px solid #000000', padding: '0.25rem 0.4rem' }}>
                          <input
                            type="text"
                            list={`create-target-work-${sIdx}`}
                            placeholder="اسم بند العمل..."
                            value={row.item}
                            onChange={(e) => handleTargetWorkItemChange(sIdx, row.id, 'item', e.target.value)}
                            style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 800 }}
                          />
                          <datalist id={`create-target-work-${sIdx}`}>
                            {targetWorkPresets.map((p, i) => <option key={i} value={p} />)}
                          </datalist>
                        </td>
                        <td style={{ border: '2px solid #000000', padding: '0.25rem 0.4rem' }}>
                          <input
                            type="text"
                            placeholder="000+00"
                            value={row.stationFrom}
                            onChange={(e) => handleTargetWorkItemChange(sIdx, row.id, 'stationFrom', e.target.value)}
                            style={{ width: '100%', padding: '0.45rem', textAlign: 'center', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 800 }}
                          />
                        </td>
                        <td style={{ border: '2px solid #000000', padding: '0.25rem 0.4rem' }}>
                          <input
                            type="text"
                            placeholder="000+00"
                            value={row.stationTo}
                            onChange={(e) => handleTargetWorkItemChange(sIdx, row.id, 'stationTo', e.target.value)}
                            style={{ width: '100%', padding: '0.45rem', textAlign: 'center', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 800 }}
                          />
                        </td>
                        <td style={{ border: '2px solid #000000', padding: '0.25rem 0.4rem' }}>
                          <input
                            type="text" inputMode="decimal" dir="ltr" lang="en"
                            step="any"
                            placeholder="0.00"
                            value={toCleanLatinDigits(row.length)}
                            onChange={(e) => handleTargetWorkItemChange(sIdx, row.id, 'length', e.target.value)}
                            style={{ width: '100%', padding: '0.45rem', textAlign: 'center', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 800 }}
                          />
                        </td>
                        <td style={{ border: '2px solid #000000', padding: '0.25rem 0.4rem' }}>
                          <input
                            type="text"
                            placeholder="ملاحظات..."
                            value={row.notes}
                            onChange={(e) => handleTargetWorkItemChange(sIdx, row.id, 'notes', e.target.value)}
                            style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ border: '2px solid #000000', padding: '0.25rem' }} className="no-print">
                          <button
                            type="button"
                            onClick={() => handleRemoveTargetWorkItem(sIdx, row.id)}
                            style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', color: '#dc2626', padding: '0.35rem', cursor: 'pointer' }}
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
                    onClick={() => handleAddTargetWorkItem(sIdx)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', borderRadius: '6px', background: '#e0f2fe', border: '1px solid #bae6fd', color: '#0284c7', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    <Plus size={14} />
                    <span>+ إضافة بند عمل ({section.title})</span>
                  </button>
                </div>

                {/* Table 2: Equipment & Personnel */}
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
                          onChange={(e) => handleTargetSectionTitleChange(sIdx, 'equipmentTitle', e.target.value)}
                          style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '0.95rem', fontWeight: 900, color: '#000000', textAlign: 'center' }}
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
                        <td style={{ border: '2px solid #000000', padding: '0.45rem', fontWeight: 900, background: '#fffbeb' }}>{eIdx + 1}</td>
                        <td style={{ border: '2px solid #000000', padding: '0.25rem 0.5rem' }}>
                          <input
                            type="text"
                            list={`create-target-equip-${sIdx}`}
                            placeholder="اسم المعدة أو الطاقم..."
                            value={eq.name}
                            onChange={(e) => handleTargetEquipItemChange(sIdx, eq.id, 'name', e.target.value)}
                            style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 800, textAlign: 'center' }}
                          />
                          <datalist id={`create-target-equip-${sIdx}`}>
                            {targetEquipPresets.map((ep, i) => <option key={i} value={ep} />)}
                          </datalist>
                        </td>
                        <td style={{ border: '2px solid #000000', padding: '0.25rem 0.5rem' }}>
                          <input
                            type="text" inputMode="decimal" dir="ltr" lang="en"
                            step="any"
                            placeholder="0"
                            value={toCleanLatinDigits(eq.count)}
                            onChange={(e) => handleTargetEquipItemChange(sIdx, eq.id, 'count', e.target.value)}
                            style={{ width: '100%', padding: '0.45rem', textAlign: 'center', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.92rem', fontWeight: 900 }}
                          />
                        </td>
                        <td style={{ border: '2px solid #000000', padding: '0.25rem 0.5rem' }}>
                          <input
                            type="text"
                            placeholder="ملاحظات..."
                            value={eq.notes}
                            onChange={(e) => handleTargetEquipItemChange(sIdx, eq.id, 'notes', e.target.value)}
                            style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ border: '2px solid #000000', padding: '0.25rem' }} className="no-print">
                          <button
                            type="button"
                            onClick={() => handleRemoveTargetEquipItem(sIdx, eq.id)}
                            style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', color: '#dc2626', padding: '0.35rem', cursor: 'pointer' }}
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
                    onClick={() => handleAddTargetEquipItem(sIdx)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', borderRadius: '6px', background: '#fef3c7', border: '1px solid #fde68a', color: '#b45309', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    <Plus size={14} />
                    <span>+ إضافة آلية / طاقم ({section.title})</span>
                  </button>
                </div>
              </div>
            );
          })}

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
              <span>إجمالي الأطوال: <strong style={{ color: '#0284c7' }}>{totalTargetLength.toLocaleString()}</strong> م.ط</span>
              <span>إجمالي المعدات والأطقم: <strong style={{ color: '#b45309' }}>{totalTargetEquipment.toLocaleString()}</strong> آلية/طاقم</span>
            </div>
          </div>

          {/* Dual Signatures */}
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
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#000000' }}>مدير القطاع</h3>
              <div style={{ marginTop: '0.85rem', fontSize: '1rem', fontWeight: 800 }}>
                مهندس : <span style={{ borderBottom: '2px dotted #000000', paddingBottom: '2px' }}>{sectorDirector}</span>
              </div>
            </div>
            <div style={{ textAlign: 'center', minWidth: '220px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#000000' }}>ممثل الجهة المالكة</h3>
              <div style={{ marginTop: '0.85rem', fontSize: '1rem', fontWeight: 800 }}>
                مهندس : <span style={{ borderBottom: '2px dotted #000000', paddingBottom: '2px' }}>{ownerRepresentative}</span>
              </div>
            </div>
          </div>
        </div>
      ) : reportCategory === 'fuel' ? (
        <div style={{
          background: '#ffffff',
          borderRadius: '8px',
          border: '2px solid #000000',
          padding: '1.75rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          marginBottom: '1.5rem'
        }}>
          {/* Document Title Centered */}
          <h2 style={{
            textAlign: 'center',
            fontSize: '1.75rem',
            fontWeight: 900,
            color: '#000000',
            margin: '0 0 1rem'
          }}>
            تقرير كميات الوقود اليومية
          </h2>

          {/* Subhead: [التاريخ]    يوم [اليوم] */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '420px',
            margin: '0 auto 1rem',
            fontSize: '1.1rem',
            fontWeight: 900,
            color: '#000000',
            direction: 'ltr'
          }}>
            <span>{formattedSlashDate}</span>
            <span style={{ direction: 'rtl' }}>يوم {dayName}</span>
          </div>

          {/* Fuel Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'center',
              fontSize: '0.95rem',
              border: '2px solid #000000'
            }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#000000', fontWeight: 900 }}>
                  <th style={{ border: '2px solid #000000', padding: '0.75rem 0.5rem', width: '50px' }}>ت</th>
                  <th style={{ border: '2px solid #000000', padding: '0.75rem 1rem', width: '23%' }}>الموقع</th>
                  <th style={{ border: '2px solid #000000', padding: '0.75rem 1rem', width: '24%' }}>الكمية المصروفة (لتر)</th>
                  <th style={{ border: '2px solid #000000', padding: '0.75rem 1rem', width: '23%' }}>الوارد (لتر)</th>
                  <th style={{ border: '2px solid #000000', padding: '0.75rem 1rem', width: '25%' }}>الكمية المتبقية (لتر)</th>
                  <th style={{ border: '2px solid #000000', padding: '0.75rem 0.4rem', width: '45px' }} className="no-print">حذف</th>
                </tr>
              </thead>
              <tbody>
                {fuelItems.map((row, index) => (
                  <tr key={row.id}>
                    <td style={{ border: '2px solid #000000', padding: '0.55rem', fontWeight: 900 }}>
                      {index + 1}
                    </td>

                    <td style={{ border: '2px solid #000000', padding: '0.35rem' }}>
                      <input
                        type="text"
                        list={`fuel-loc-${row.id}`}
                        placeholder="الموقع (مثل: 107 / 240 / الكسارات)..."
                        value={row.location}
                        onChange={(e) => handleFuelRowChange(row.id, 'location', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          textAlign: 'center',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.95rem',
                          fontWeight: 800,
                          color: '#000000'
                        }}
                      />
                      <datalist id={`fuel-loc-${row.id}`}>
                        {locationPresets.map((loc, i) => (
                          <option key={i} value={loc} />
                        ))}
                      </datalist>
                    </td>

                    <td style={{ border: '2px solid #000000', padding: '0.35rem' }}>
                      <input
                        type="text" inputMode="decimal" dir="ltr" lang="en"
                        step="any"
                        placeholder="0.00"
                        value={row.dispatchedLiters}
                        onChange={(e) => handleFuelRowChange(row.id, 'dispatchedLiters', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          textAlign: 'center',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.95rem',
                          fontWeight: 800,
                          color: '#000000'
                        }}
                      />
                    </td>

                    <td style={{ border: '2px solid #000000', padding: '0.35rem' }}>
                      <input
                        type="text" inputMode="decimal" dir="ltr" lang="en"
                        step="any"
                        placeholder="0.00"
                        value={row.receivedLiters}
                        onChange={(e) => handleFuelRowChange(row.id, 'receivedLiters', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          textAlign: 'center',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.95rem',
                          fontWeight: 800,
                          color: '#000000'
                        }}
                      />
                    </td>

                    <td style={{ border: '2px solid #000000', padding: '0.35rem' }}>
                      <input
                        type="text" inputMode="decimal" dir="ltr" lang="en"
                        step="any"
                        placeholder="0.00"
                        value={row.remainingLiters}
                        onChange={(e) => handleFuelRowChange(row.id, 'remainingLiters', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          textAlign: 'center',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.95rem',
                          fontWeight: 800,
                          color: '#000000'
                        }}
                      />
                    </td>

                    <td style={{ border: '2px solid #000000', padding: '0.35rem' }} className="no-print">
                      <button
                        type="button"
                        onClick={() => handleRemoveFuelItem(row.id)}
                        style={{
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          borderRadius: '4px',
                          color: '#dc2626',
                          padding: '0.35rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="حذف هذا السطر"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* THE YELLOW TOTALS ROW (MATCHING USER'S PHOTO EXACTLY) */}
                <tr style={{ background: '#ffff00', color: '#000000', fontWeight: 900 }}>
                  <td colSpan={2} style={{ border: '2px solid #000000', padding: '0.75rem', fontSize: '1.05rem', textAlign: 'center' }}>
                    الإجمالي (لتر)
                  </td>
                  <td style={{ border: '2px solid #000000', padding: '0.75rem', fontSize: '1.05rem' }}>
                    {totalFuelDispatched ? totalFuelDispatched.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                  </td>
                  <td style={{ border: '2px solid #000000', padding: '0.75rem', fontSize: '1.05rem' }}>
                    {totalFuelReceived ? totalFuelReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                  </td>
                  <td style={{ border: '2px solid #000000', padding: '0.75rem', fontSize: '1.05rem' }}>
                    {totalFuelRemaining ? totalFuelRemaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                  </td>
                  <td style={{ border: '2px solid #000000', padding: '0.75rem' }} className="no-print"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Add Row Button */}
          <div style={{ marginTop: '0.85rem', display: 'flex', justifyContent: 'flex-start' }} className="no-print">
            <button
              type="button"
              onClick={handleAddFuelItem}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                background: '#d97706',
                border: 'none',
                color: '#fff',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              <Plus size={16} />
              <span>+ إضافة موقع / خزان جديد إلى الجدول</span>
            </button>
          </div>
        </div>
      ) : (
        /* =========================================================================
            VIEW 2: DAILY ROAD PROGRESS REPORT (PREVIOUS FORM)
           ========================================================================= */
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '3px solid #000000',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          padding: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          {/* Blue Header Banner */}
          <div style={{
            background: 'linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%)',
            color: '#ffffff',
            textAlign: 'center',
            padding: '0.9rem 1.5rem',
            borderRadius: '4px',
            border: '2px solid #000000',
            marginBottom: '0.85rem'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '1.6rem',
              fontWeight: 900,
              letterSpacing: '0.5px'
            }}>
              تقرير أعمال يوم {dayName} {displayDateStr}
            </h2>
          </div>

          {/* Road Works Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'center',
              fontSize: '0.95rem',
              border: '2px solid #000000'
            }}>
              <thead>
                <tr style={{ background: '#ffc000', color: '#000000', fontWeight: 900 }}>
                  <th style={{ border: '2px solid #000000', padding: '0.75rem 0.5rem', width: '50px' }}>م</th>
                  <th style={{ border: '2px solid #000000', padding: '0.75rem 1rem', width: '28%' }}>البند</th>
                  <th style={{ border: '2px solid #000000', padding: '0.75rem 0.65rem', width: '13%' }}>من</th>
                  <th style={{ border: '2px solid #000000', padding: '0.75rem 0.65rem', width: '13%' }}>الى</th>
                  <th style={{ border: '2px solid #000000', padding: '0.75rem 0.65rem', width: '11%' }}>طول</th>
                  <th style={{ border: '2px solid #000000', padding: '0.75rem 0.65rem', width: '12%' }}>م٢</th>
                  <th style={{ border: '2px solid #000000', padding: '0.75rem 0.85rem', width: '17%' }}>ملاحظات</th>
                  <th style={{ border: '2px solid #000000', padding: '0.75rem 0.4rem', width: '45px' }} className="no-print">حذف</th>
                </tr>
              </thead>
              <tbody>
                {roadItems.map((row, index) => (
                  <tr key={row.id} style={{ background: index % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                    <td style={{ border: '2px solid #000000', padding: '0.5rem', fontWeight: 900, background: '#fffbeb' }}>
                      {index + 1}
                    </td>

                    <td style={{ border: '2px solid #000000', padding: '0.4rem', textAlign: 'right' }}>
                      <input
                        type="text"
                        list={`items-list-${row.id}`}
                        placeholder="أدخل أو اختر اسم البند..."
                        value={row.item}
                        onChange={(e) => handleRoadRowChange(row.id, 'item', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.65rem',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          color: '#000000'
                        }}
                      />
                      <datalist id={`items-list-${row.id}`}>
                        {standardWorkItems.map((opt, i) => (
                          <option key={i} value={opt} />
                        ))}
                      </datalist>
                    </td>

                    <td style={{ border: '2px solid #000000', padding: '0.4rem' }}>
                      <input
                        type="text"
                        placeholder="241+200"
                        value={row.stationFrom}
                        onChange={(e) => handleRoadRowChange(row.id, 'stationFrom', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          textAlign: 'center',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.92rem',
                          fontWeight: 800
                        }}
                      />
                    </td>

                    <td style={{ border: '2px solid #000000', padding: '0.4rem' }}>
                      <input
                        type="text"
                        placeholder="242+500"
                        value={row.stationTo}
                        onChange={(e) => handleRoadRowChange(row.id, 'stationTo', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          textAlign: 'center',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.92rem',
                          fontWeight: 800
                        }}
                      />
                    </td>

                    <td style={{ border: '2px solid #000000', padding: '0.4rem' }}>
                      <input
                        type="text" inputMode="decimal" dir="ltr" lang="en"
                        step="any"
                        placeholder="0.00"
                        value={toCleanLatinDigits(row.length)}
                        onChange={(e) => handleRoadRowChange(row.id, 'length', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          textAlign: 'center',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.92rem',
                          fontWeight: 900
                        }}
                      />
                    </td>

                    <td style={{ border: '2px solid #000000', padding: '0.4rem' }}>
                      <input
                        type="text" inputMode="decimal" dir="ltr" lang="en"
                        step="any"
                        placeholder="0.00"
                        value={row.area}
                        onChange={(e) => handleRoadRowChange(row.id, 'area', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          textAlign: 'center',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.92rem',
                          fontWeight: 900
                        }}
                      />
                    </td>

                    <td style={{ border: '2px solid #000000', padding: '0.4rem' }}>
                      <input
                        type="text"
                        placeholder="ملاحظات..."
                        value={row.notes}
                        onChange={(e) => handleRoadRowChange(row.id, 'notes', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.65rem',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.88rem'
                        }}
                      />
                    </td>

                    <td style={{ border: '2px solid #000000', padding: '0.4rem' }} className="no-print">
                      <button
                        type="button"
                        onClick={() => handleRemoveRoadItem(row.id)}
                        style={{
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          color: '#dc2626',
                          padding: '0.4rem',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Total Row */}
                <tr style={{ background: '#fef3c7', fontWeight: 900, borderTop: '3px solid #000000' }}>
                  <td colSpan={4} style={{ border: '2px solid #000000', padding: '0.75rem 1rem', textAlign: 'center', fontSize: '1.05rem' }}>
                    الإجمالي العام للأعمال المنفذة
                  </td>
                  <td style={{ border: '2px solid #000000', padding: '0.75rem', fontSize: '1.05rem' }}>
                    {totalRoadLength ? totalRoadLength.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                  </td>
                  <td style={{ border: '2px solid #000000', padding: '0.75rem', fontSize: '1.05rem' }}>
                    {totalRoadArea ? totalRoadArea.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                  </td>
                  <td colSpan={2} style={{ border: '2px solid #000000', padding: '0.75rem', fontSize: '0.85rem', color: '#64748b' }}>
                    {roadItems.filter(i => i.item).length} بنود مسجلة
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Add Row Button */}
          <div style={{ marginTop: '0.85rem', display: 'flex', justifyContent: 'flex-start' }} className="no-print">
            <button
              type="button"
              onClick={handleAddRoadItem}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                background: '#0284c7',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              <Plus size={18} />
              <span>+ إضافة بند عمل جديد إلى الجدول</span>
            </button>
          </div>

          {/* Signatures Footer */}
          <div style={{
            marginTop: '2.5rem',
            paddingTop: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            paddingLeft: '2rem',
            paddingRight: '2rem'
          }}>
            <div style={{ textAlign: 'center', minWidth: '220px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900 }}>مدير القطاع</h3>
              <div style={{ marginTop: '1rem', fontSize: '0.95rem', fontWeight: 800 }}>
                مهندس: <span style={{ borderBottom: '2px dotted #000', paddingBottom: '2px' }}>{sectorDirector}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', minWidth: '220px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900 }}>ممثل الجهة المالكة</h3>
              <div style={{ marginTop: '1rem', fontSize: '0.95rem', fontWeight: 800 }}>
                مهندس: <span style={{ borderBottom: '2px dotted #000', paddingBottom: '2px' }}>{ownerRepresentative}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => handleSaveReport(false)}
          style={{
            flex: 1,
            padding: '0.85rem 1.5rem',
            borderRadius: '10px',
            background: '#1e293b',
            border: 'none',
            color: '#fff',
            fontSize: '0.95rem',
            fontWeight: 800,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(30, 41, 59, 0.2)'
          }}
        >
          <CheckCircle2 size={18} />
          <span>{isSubmitting ? 'جاري الحفظ...' : 'حفظ التقرير في الأرشيف'}</span>
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => handleSaveReport(true)}
          style={{
            flex: 1.3,
            padding: '0.85rem 1.5rem',
            borderRadius: '10px',
            background: reportCategory === 'fuel' 
              ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' 
              : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            border: 'none',
            color: '#fff',
            fontSize: '0.95rem',
            fontWeight: 800,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)'
          }}
        >
          <Send size={18} />
          <span>{isSubmitting ? 'جاري المعالجة...' : 'حفظ وإرسال بالبريد إلى المسؤول'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            let tempRep = null;
            if (reportCategory === 'targeted') {
              tempRep = {
                title: `بيان أعمال يوم ${dayName} ${displayDateStr}`,
                reportType: 'تقرير الأعمال المستهدفة',
                isTargetedWorksReport: true,
                dayName,
                dateFormatted: displayDateStr,
                date: reportDate,
                sector,
                reportNumber,
                sectorDirector,
                ownerRepresentative,
                totalTargetLength,
                totalTargetEquipment,
                roadMeters: totalTargetLength,
                targetedSections: targetedSections
              };
            } else if (reportCategory === 'fuel') {
              tempRep = {
                title: 'تقرير كميات الوقود اليومية',
                reportType: 'تقرير كميات الوقود اليومية',
                isFuelReport: true,
                dayName,
                dateFormatted: formattedSlashDate,
                date: reportDate,
                sector,
                reportNumber,
                totalDispatchedLiters: totalFuelDispatched,
                totalReceivedLiters: totalFuelReceived,
                totalRemainingLiters: totalFuelRemaining,
                fuelItems: fuelItems.filter(r => r.location || r.dispatchedLiters || r.receivedLiters || r.remainingLiters)
              };
            } else {
              tempRep = {
                title: `بيان أعمال يوم ${dayName} ${displayDateStr}`,
                reportType: 'تقرير أعمال الطريق اليومي',
                dayName,
                dateFormatted: displayDateStr,
                date: reportDate,
                sector,
                reportNumber,
                sectorDirector,
                ownerRepresentative,
                totalLength: totalRoadLength,
                totalArea: totalRoadArea,
                items: roadItems.filter(r => r.item || r.stationFrom || r.stationTo || r.length || r.area)
              };
            }
            if (onPrintReport) onPrintReport(tempRep);
          }}
          style={{
            padding: '0.85rem 1.5rem',
            borderRadius: '10px',
            background: '#ffffff',
            border: reportCategory === 'fuel' ? '2px solid #d97706' : '2px solid #0284c7',
            color: reportCategory === 'fuel' ? '#d97706' : '#0284c7',
            fontSize: '0.95rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Printer size={18} />
          <span>طباعة النموذج المعتمد</span>
        </button>

        <button
          type="button"
          onClick={resetForm}
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            color: '#64748b',
            fontSize: '0.92rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          تفريغ النموذج
        </button>
      </div>
        </>
      )}

      {/* Forward Modal */}
      {showForwardModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          direction: 'rtl',
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff',
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
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>إحالة التقرير اليومي عبر البريد والمراسلات</h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>إرسال التقرير رقم ({createdReport?.reportNumber}) مباشرة لحساب المسؤول</p>
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
                  {officialSupervisors.map(u => (
                    <option key={u.username} value={u.username}>
                      {u.name} - ({u.role})
                    </option>
                  ))}
                  <option value="all">-- تعميم لجميع أعضاء جهاز الإشراف --</option>
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
                  placeholder="نحيل إليكم التقرير اليومي المعتمد للإحاطة والمتابعة..."
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
                    background: reportCategory === 'fuel' ? '#d97706' : '#0284c7',
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
    </div>
  );
};

export default CreateReportView;
