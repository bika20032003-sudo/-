import React, { useState, useRef, useMemo } from 'react';
import { 
  X, Send, Camera, FileText, CheckCircle2, Fuel, Milestone, 
  Truck, Calendar, Layers, Target, Plus, Trash2, Printer, 
  ArrowRight, ShieldCheck, Clock
} from 'lucide-react';
import { fastFetch, clearApiCache } from '../utils/apiCache.js';

// Safe number parsing
const cleanNum = (val) => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const s = String(val).replace(/,/g, '').trim();
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
};

// Days of week helper
const getDayName = (dateStr) => {
  if (!dateStr) return 'السبت';
  const date = new Date(dateStr);
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return days[date.getDay()] || 'السبت';
};

export const CreateReportModal = ({ 
  isOpen, 
  onClose, 
  currentUser, 
  onReportCreated, 
  onPrintReport,
  onNavigateTab 
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const [activeType, setActiveType] = useState('road'); // 'road' | 'fuel' | 'targeted' | 'two_phase'
  const [reportDate, setReportDate] = useState(todayStr);
  const [reportNumber, setReportNumber] = useState(`REP-ROAD-${Date.now().toString().slice(-4)}`);
  const [notes, setNotes] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdReportData, setCreatedReportData] = useState(null);

  // Default signatures
  const [sectorDirector, setSectorDirector] = useState(
    currentUser?.name || 'م. صلاح العربي (مشرف المرحلة الأولى)'
  );
  const [ownerRepresentative, setOwnerRepresentative] = useState(
    'م. عبدالرحمن الأنصاري (مدير المشروع)'
  );

  // -------------------------------------------------------------
  // 1. Road Work Items State
  // -------------------------------------------------------------
  const [roadItems, setRoadItems] = useState([
    { id: 1, item: 'طبقة إعادة التدوير (FDR)', stationFrom: '000+00', stationTo: '000+01', length: '1000', area: '7500', notes: 'تنفيذ ودمك' },
    { id: 2, item: 'طبقة الأساس الحبيبي والشرشور', stationFrom: '000+01', stationTo: '000+02', length: '1000', area: '7500', notes: 'تشغيل وتسوية' },
    { id: 3, item: 'رش طبقة التشريب (MCO)', stationFrom: '000+02', stationTo: '000+03', length: '800', area: '6000', notes: 'رش حراري معتمد' },
    { id: 4, item: 'الطبقة الإسفلتية السطحية 6 سم', stationFrom: '000+03', stationTo: '000+04', length: '800', area: '6000', notes: 'فرش ودك نهائي' }
  ]);

  const totalRoadLength = useMemo(() => {
    return roadItems.reduce((acc, row) => acc + cleanNum(row.length), 0);
  }, [roadItems]);

  const totalRoadArea = useMemo(() => {
    return roadItems.reduce((acc, row) => acc + cleanNum(row.area), 0);
  }, [roadItems]);

  // -------------------------------------------------------------
  // 2. Fuel Items State
  // -------------------------------------------------------------
  const [fuelItems, setFuelItems] = useState([
    { id: 1, location: '107', dispatchedLiters: '570.00', receivedLiters: '0.00', remainingLiters: '49,829.00' },
    { id: 2, location: '240', dispatchedLiters: '17,530.00', receivedLiters: '14,631.00', remainingLiters: '141,795.00' },
    { id: 3, location: 'الكسارات', dispatchedLiters: '4,638.00', receivedLiters: '0.00', remainingLiters: '19,073.00' }
  ]);

  const totalSolarDispatched = useMemo(() => {
    return fuelItems.reduce((sum, r) => sum + cleanNum(r.dispatchedLiters), 0);
  }, [fuelItems]);

  const totalFuelReceived = useMemo(() => {
    return fuelItems.reduce((sum, r) => sum + cleanNum(r.receivedLiters), 0);
  }, [fuelItems]);

  const totalFuelRemaining = useMemo(() => {
    return fuelItems.reduce((sum, r) => sum + cleanNum(r.remainingLiters), 0);
  }, [fuelItems]);

  // -------------------------------------------------------------
  // 3. Targeted Works State
  // -------------------------------------------------------------
  const [targetedSections, setTargetedSections] = useState([
    {
      id: 'fdr',
      title: 'أعمال تشغيل FDR',
      startTimeNote: 'بدء أعمال الفرم الساعة 05:00 صباحاً',
      workItems: [
        { id: 1, item: 'أعمال فرم بدون أسمنت', stationFrom: '000+00', stationTo: '000+01', length: '800', notes: 'فرم وتأهيل المسار' }
      ],
      equipmentTitle: 'المعدات والإعداد المطلوبة لفرم FDR',
      equipmentItems: [
        { id: 1, name: 'ماكينة FDR', count: '1', notes: 'جاهزية تامة' },
        { id: 2, name: 'جريدر وهراس', count: '2', notes: 'جاهزية تامة' }
      ]
    },
    {
      id: 'base',
      title: 'أعمال طبقة الأساس الحبيبي والشرشور',
      startTimeNote: 'بدء أعمال طبقة الأساس الساعة 06:00 صباحاً',
      workItems: [
        { id: 1, item: 'تسليم وتشغيل طبقة الأساس', stationFrom: '000+01', stationTo: '000+02', length: '600', notes: 'دمك وتسوية' }
      ],
      equipmentTitle: 'المعدات المطلوبة لطبقة الأساس',
      equipmentItems: [
        { id: 1, name: 'شاحنات نقل وتوريد شرشور', count: '8', notes: 'توريد مستمر' },
        { id: 2, name: 'تانك مياه', count: '2', notes: 'معالجة رطوبة' }
      ]
    },
    {
      id: 'asphalt',
      title: 'أعمال طبقة الاسفلت المحسن',
      startTimeNote: 'بدء عمل خلاطة الاسفلت الساعة 06:00 صباحاً',
      workItems: [
        { id: 1, item: 'أعمال رش MCO والأسفلت 6 سم', stationFrom: '000+02', stationTo: '000+03', length: '500', notes: 'فرش ودك' }
      ],
      equipmentTitle: 'المعدات المطلوبة للأسفلت',
      equipmentItems: [
        { id: 1, name: 'فنشر اسفلت + رولات حديد وكاوتش', count: '4', notes: 'طاقم فرش متكامل' }
      ]
    }
  ]);

  const totalTargetLength = useMemo(() => {
    return targetedSections.reduce((acc, sec) => {
      return acc + (sec.workItems || []).reduce((s, w) => s + cleanNum(w.length), 0);
    }, 0);
  }, [targetedSections]);

  const totalTargetEquipment = useMemo(() => {
    return targetedSections.reduce((acc, sec) => {
      return acc + (sec.equipmentItems || []).reduce((s, e) => s + cleanNum(e.count), 0);
    }, 0);
  }, [targetedSections]);

  // -------------------------------------------------------------
  // 4. Two Phase Road Progress State
  // -------------------------------------------------------------
  const [phase1Today, setPhase1Today] = useState('0');
  const [phase1Total, setPhase1Total] = useState('226083');
  const [phase2FdrToday, setPhase2FdrToday] = useState('1220');
  const [phase2McoToday, setPhase2McoToday] = useState('460');
  const [phase2AsphaltToday, setPhase2AsphaltToday] = useState('1140');
  const [phase2OtherToday, setPhase2OtherToday] = useState('1000');

  const twoPhaseTodayTotal = useMemo(() => {
    return cleanNum(phase1Today) + cleanNum(phase2FdrToday) + cleanNum(phase2McoToday) + cleanNum(phase2AsphaltToday) + cleanNum(phase2OtherToday);
  }, [phase1Today, phase2FdrToday, phase2McoToday, phase2AsphaltToday, phase2OtherToday]);

  const twoPhaseCumulativeTotal = useMemo(() => {
    return 226083 + 11305 + twoPhaseTodayTotal;
  }, [twoPhaseTodayTotal]);

  // Handle Type Change
  const handleTypeSelect = (type) => {
    setActiveType(type);
    const code = Date.now().toString().slice(-4);
    if (type === 'road') setReportNumber(`ROAD-${code}`);
    else if (type === 'fuel') setReportNumber(`FUEL-${code}`);
    else if (type === 'targeted') setReportNumber(`TARGET-${code}`);
    else if (type === 'two_phase') setReportNumber(`PHASE-REP-${code}`);
  };

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

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const day = getDayName(reportDate);
    let payload = null;
    let targetTab = 'road-progress';
    let targetSectionName = 'قسم متابعة إنجاز الطريق';

    if (activeType === 'road') {
      targetTab = 'road-progress';
      targetSectionName = 'قسم متابعة إنجاز الطريق';
      payload = {
        reportNumber: reportNumber.trim() || `ROAD-${Date.now().toString().slice(-4)}`,
        date: new Date(reportDate).toISOString(),
        dateFormatted: reportDate,
        dayName: day,
        title: `تقرير أعمال الطريق اليومي - ${day} ${reportDate}`,
        reportType: 'تقرير أعمال الطريق اليومي',
        sector: 'طريق أوباري - غات',
        totalLength: totalRoadLength,
        totalArea: totalRoadArea,
        roadMeters: totalRoadLength,
        items: roadItems.map((r, idx) => ({
          index: idx + 1,
          item: r.item.trim(),
          stationFrom: r.stationFrom.trim(),
          stationTo: r.stationTo.trim(),
          length: cleanNum(r.length),
          area: cleanNum(r.area),
          notes: r.notes.trim()
        })),
        uploadedBy: currentUser?.name || sectorDirector,
        sectorDirector,
        ownerRepresentative,
        status: 'approved',
        approvedBy: ownerRepresentative,
        notes: notes || `تقرير أعمال الطريق اليومي المعتمد - إجمالي الأطوال: ${totalRoadLength.toLocaleString()} م.ط - المساحة: ${totalRoadArea.toLocaleString()} م²`,
        imageUrl: attachedFile,
        fileName
      };
    } else if (activeType === 'fuel') {
      targetTab = 'fuel';
      targetSectionName = 'قسم إدارة الوقود والمحروقات';
      payload = {
        reportNumber: reportNumber.trim() || `FUEL-${Date.now().toString().slice(-4)}`,
        date: new Date(reportDate).toISOString(),
        dateFormatted: reportDate,
        dayName: day,
        title: 'تقرير كميات الوقود اليومية',
        reportType: 'تقرير كميات الوقود اليومية',
        isFuelReport: true,
        sector: 'مشروع أوباري - غات',
        fuelAmount: totalSolarDispatched,
        totalDispatchedLiters: totalSolarDispatched,
        totalReceivedLiters: totalFuelReceived,
        totalRemainingLiters: totalFuelRemaining,
        fuelItems: fuelItems.map((r, idx) => ({
          index: idx + 1,
          location: r.location.trim(),
          dispatchedLiters: String(cleanNum(r.dispatchedLiters)),
          receivedLiters: String(cleanNum(r.receivedLiters)),
          remainingLiters: String(cleanNum(r.remainingLiters))
        })),
        uploadedBy: currentUser?.name || 'مسؤول الوقود والمحروقات',
        status: 'approved',
        approvedBy: ownerRepresentative,
        notes: notes || `تقرير كميات الوقود اليومية - المنصرف: ${totalSolarDispatched.toLocaleString()} لتر - الوارد: ${totalFuelReceived.toLocaleString()} لتر - المتبقي: ${totalFuelRemaining.toLocaleString()} لتر`,
        imageUrl: attachedFile,
        fileName
      };
    } else if (activeType === 'targeted') {
      targetTab = 'targeted-works';
      targetSectionName = 'قسم الأعمال المستهدفة';
      payload = {
        reportNumber: reportNumber.trim() || `TARGET-${Date.now().toString().slice(-4)}`,
        date: new Date(reportDate).toISOString(),
        dateFormatted: reportDate,
        dayName: day,
        title: `بيان أعمال يوم ${day} ${reportDate}`,
        reportType: 'تقرير الأعمال المستهدفة',
        isTargetedWorksReport: true,
        sector: 'طريق أوباري - غات',
        totalTargetLength: totalTargetLength,
        totalTargetEquipment: totalTargetEquipment,
        roadMeters: totalTargetLength,
        targetedSections,
        uploadedBy: currentUser?.name || sectorDirector,
        sectorDirector,
        ownerRepresentative,
        status: 'approved',
        approvedBy: ownerRepresentative,
        notes: notes || `بيان الأعمال المستهدفة والمعدات المطلوبة بموقع طريق أوباري غات`,
        imageUrl: attachedFile,
        fileName
      };
    } else if (activeType === 'two_phase') {
      targetTab = 'road-progress';
      targetSectionName = 'قسم متابعة إنجاز الطريق (360 كم)';
      payload = {
        reportNumber: reportNumber.trim() || `PHASE-REP-${Date.now().toString().slice(-4)}`,
        date: new Date(reportDate).toISOString(),
        dateFormatted: reportDate,
        dayName: day,
        title: `بيان أعمال إنجاز المرحلتين يوم ${day} ${reportDate}`,
        projectName: 'مشروع صيانة طريق أوباري غات (360 كم)',
        reportType: 'تقرير إنجاز المرحلتين',
        sector: 'المرحلتين الأولى والثانية (360 كم)',
        isTwoPhaseProgressReport: true,
        phase1Items: [
          { id: 1, category: 'basic', name: 'طبقة إعادة التدوير (FDR)', todayMeters: '0', totalMeters: '226083', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#16a34a', shortName: 'إعادة تدوير' },
          { id: 2, category: 'basic', name: 'رش طبقة التشريب (MCO)', todayMeters: '0', totalMeters: '226083', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#0284c7', shortName: 'رش تشريب' },
          { id: 3, category: 'basic', name: 'طبقة الاسفلت المحسن', todayMeters: '0', totalMeters: '226083', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#0f172a', shortName: 'اسفلت محسن' },
          { id: 4, category: 'additional', name: 'فرمة اولي بدون اسمنت(FDR)', todayMeters: '0', totalMeters: '226083', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#22c55e', shortName: 'فرم بدون أسمنت' },
          { id: 5, category: 'additional', name: 'طبقة أساس حبيبي', todayMeters: '0', totalMeters: '226083', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#ea580c', shortName: 'أساس حبيبي' },
          { id: 6, category: 'additional', name: 'الطريق الخدمي', todayMeters: '0', totalMeters: '226218', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#eab308', shortName: 'طريق خدمي' }
        ],
        phase2Items: [
          { id: 1, category: 'basic', name: 'طبقة إعادة التدوير (FDR)', todayMeters: String(cleanNum(phase2FdrToday)), totalMeters: String(15020 + cleanNum(phase2FdrToday)), dailyTarget: '800', varianceMeters: (cleanNum(phase2FdrToday) - 800).toFixed(2), notes: 'منجز معتمد بالتقرير اليومي', color: '#16a34a', shortName: 'إعادة تدوير' },
          { id: 2, category: 'basic', name: 'رش طبقة التشريب (MCO)', todayMeters: String(cleanNum(phase2McoToday)), totalMeters: String(9950 + cleanNum(phase2McoToday)), dailyTarget: '800', varianceMeters: (cleanNum(phase2McoToday) - 800).toFixed(2), notes: 'منجز معتمد بالتقرير اليومي', color: '#0284c7', shortName: 'رش تشريب' },
          { id: 3, category: 'basic', name: 'طبقة الاسفلت المحسن', todayMeters: String(cleanNum(phase2AsphaltToday)), totalMeters: String(7020 + cleanNum(phase2AsphaltToday)), dailyTarget: '800', varianceMeters: (cleanNum(phase2AsphaltToday) - 800).toFixed(2), notes: 'منجز معتمد بالتقرير اليومي', color: '#0f172a', shortName: 'اسفلت محسن' },
          { id: 4, category: 'additional', name: 'فرمة اولي بدون اسمنت(FDR)', todayMeters: '500', totalMeters: '16210', dailyTarget: '800', varianceMeters: '-300.00', notes: 'منجز معتمد بالتقرير اليومي', color: '#22c55e', shortName: 'فرم بدون أسمنت' },
          { id: 5, category: 'additional', name: 'طبقة أساس حبيبي', todayMeters: '500', totalMeters: '10410', dailyTarget: '800', varianceMeters: '-300.00', notes: 'منجز معتمد بالتقرير اليومي', color: '#ea580c', shortName: 'أساس حبيبي' },
          { id: 6, category: 'additional', name: 'الطريق الخدمي', todayMeters: '0', totalMeters: '15230', dailyTarget: '800', varianceMeters: '-800.00', notes: 'منجز معتمد بالتقرير اليومي', color: '#eab308', shortName: 'طريق خدمي' }
        ],
        combinedItems: [
          { id: 1, category: 'basic', name: 'طبقة إعادة التدوير (FDR)', todayMeters: String(cleanNum(phase2FdrToday)), totalMeters: String(241103 + cleanNum(phase2FdrToday)), readyToWorkMeters: '', notes: 'الجاهز للعمل بالبند (طبقة التشريب وقيد موافقة استشاري)', color: '#16a34a', shortName: 'إعادة تدوير' },
          { id: 2, category: 'basic', name: 'رش طبقة التشريب (MCO)', todayMeters: String(cleanNum(phase2McoToday)), totalMeters: String(236033 + cleanNum(phase2McoToday)), readyToWorkMeters: '', notes: 'الجاهز للعمل بالبند (طبقة الأساس وقيد موافقة استشاري)', color: '#0284c7', shortName: 'رش تشريب' },
          { id: 3, category: 'basic', name: 'طبقة الاسفلت المحسن', todayMeters: String(cleanNum(phase2AsphaltToday)), totalMeters: String(233103 + cleanNum(phase2AsphaltToday)), readyToWorkMeters: '2253.00', notes: '', color: '#0f172a', shortName: 'اسفلت محسن' },
          { id: 4, category: 'additional', name: 'فرمة اولي بدون اسمنت(FDR)', todayMeters: '500', totalMeters: '242293', readyToWorkMeters: '', notes: '', color: '#22c55e', shortName: 'فرم بدون أسمنت' },
          { id: 5, category: 'additional', name: 'طبقة أساس حبيبي', todayMeters: '500', totalMeters: '236493', readyToWorkMeters: '5717.00', notes: 'الجاهز للعمل بالبند (فرم أولى وقيد موافقة استشاري)', color: '#ea580c', shortName: 'أساس حبيبي' },
          { id: 6, category: 'additional', name: 'الطريق الخدمي', todayMeters: '0', totalMeters: '241448', readyToWorkMeters: '', notes: '', color: '#eab308', shortName: 'طريق خدمي' }
        ],
        remainingItems: [
          { id: 1, group: 'A', name: 'المتبقي من الفرمة الأولى', phase1: '150.00', phase2: '117677.00', total: '117677.00', notes: 'من احتياج الصيانة' },
          { id: 2, group: 'A', name: 'المتبقي من الفرمة الثانية', phase1: '183.00', phase2: '117777.00', total: '117777.00', notes: 'جزء السنارة المنهارة' },
          { id: 3, group: 'A', name: 'المتبقي من الأساس', phase1: '183.00', phase2: '123507.00', total: '123507.00', notes: '' },
          { id: 4, group: 'B', name: 'المتبقي من طبقة التشريب', phase1: '150.00', phase2: '123507.00', total: '123507.00', notes: '' },
          { id: 5, group: 'B', name: 'المتبقي من الاسفلت', phase1: '150.00', phase2: '125625.00', total: '125775.00', notes: '' },
          { id: 6, group: 'B', name: 'طول الطريق الخدمي العامل', phase1: '', phase2: '', total: '8080.00', notes: 'كيلومتر' }
        ],
        twoPhaseTotals: {
          todayMeters: twoPhaseTodayTotal,
          totalCumulativeMeters: twoPhaseCumulativeTotal
        },
        roadMeters: twoPhaseTodayTotal,
        uploadedBy: currentUser?.name || sectorDirector,
        sectorDirector,
        ownerRepresentative,
        status: 'approved',
        approvedBy: ownerRepresentative,
        notes: notes || `تقرير إنجاز المرحلتين المعتمد - إنجاز اليوم: ${twoPhaseTodayTotal.toLocaleString()} م.ط`,
        imageUrl: attachedFile,
        fileName
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

      // Persist to local storage
      try {
        const local = JSON.parse(localStorage.getItem('local_reports') || '[]');
        local.unshift(saved);
        localStorage.setItem('local_reports', JSON.stringify(local));
      } catch (e) {
        console.error(e);
      }

      // Clear client API cache
      try {
        clearApiCache();
      } catch (cErr) {}

      // Notify other views
      try {
        window.dispatchEvent(new CustomEvent('report-saved', { detail: saved }));
        window.dispatchEvent(new CustomEvent('road-progress-updated', { detail: saved }));
        window.dispatchEvent(new CustomEvent('fuel-updated', { detail: saved }));
      } catch (evErr) {}

      setCreatedReportData({
        report: saved,
        destTab: targetTab,
        destName: targetSectionName
      });

      if (onReportCreated) onReportCreated(saved);
    } catch (err) {
      console.error('Error creating report:', err);
      alert('حدث خطأ أثناء حفظ التقرير.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(15, 23, 42, 0.75)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      backdropFilter: 'blur(5px)',
      direction: 'rtl',
      fontFamily: "'Cairo', sans-serif"
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '850px',
        maxHeight: '94vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          borderRadius: '16px 16px 0 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={22} color="#fff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>
                إنشاء تقرير ميداني معتمد للمنظومة
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                اختر نوع التقرير المعتمد ليتم احتسابه وتوجيهه تلقائياً إلى القسم الخاص به
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#cbd5e1',
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Success View */}
        {createdReportData ? (
          <div style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
            <div style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              background: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
              border: '3px solid #bbf7d0'
            }}>
              <CheckCircle2 size={44} />
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              تم حفظ التقرير وتوجيهه بنجاح!
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#475569', maxWidth: '520px', margin: '0 auto 1.75rem auto', lineHeight: 1.6 }}>
              تم تسجيل <strong>{createdReportData.report?.title || createdReportData.report?.reportType}</strong> برقم{' '}
              <span style={{ color: '#2563eb', fontWeight: 800 }}>({createdReportData.report?.reportNumber})</span> في قاعدة البيانات، وتم احتساب كافة البنود وتحديث بيانات{' '}
              <strong style={{ color: '#0f172a' }}>{createdReportData.destName}</strong> فوراً.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateTab(createdReportData.destTab);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.8rem 1.6rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
                  }}
                >
                  <span>الانتقال فوراً إلى {createdReportData.destName} 🚀</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onPrintReport) onPrintReport(createdReportData.report);
                }}
                style={{
                  background: '#fef3c7',
                  color: '#b45309',
                  border: '1.5px solid #f59e0b',
                  padding: '0.8rem 1.4rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}
              >
                <Printer size={17} />
                <span>طباعة النموذج المعتمد</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '0.8rem 1.4rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                إغلاق
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* 4 Report Category Cards */}
            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.6rem' }}>
                حدد نوع التقرير المراد إنشاؤه:
              </label>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))',
                gap: '0.75rem'
              }}>
                {/* 1. Road */}
                <div 
                  onClick={() => handleTypeSelect('road')}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '10px',
                    border: activeType === 'road' ? '2px solid #16a34a' : '1px solid #e2e8f0',
                    background: activeType === 'road' ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a' }}>
                    <Milestone size={18} />
                    <strong style={{ fontSize: '0.88rem' }}>تقرير أعمال الطريق</strong>
                  </div>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                    المحطات، أطوال الرصف، المساحات بالمتر المربع
                  </p>
                </div>

                {/* 2. Fuel */}
                <div 
                  onClick={() => handleTypeSelect('fuel')}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '10px',
                    border: activeType === 'fuel' ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                    background: activeType === 'fuel' ? '#fffbeb' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d97706' }}>
                    <Fuel size={18} />
                    <strong style={{ fontSize: '0.88rem' }}>تقرير كميات الوقود</strong>
                  </div>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                    الوقود المنصرف، الوارد، رصيد الخزانات
                  </p>
                </div>

                {/* 3. Targeted */}
                <div 
                  onClick={() => handleTypeSelect('targeted')}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '10px',
                    border: activeType === 'targeted' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                    background: activeType === 'targeted' ? '#f0f9ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7' }}>
                    <Target size={18} />
                    <strong style={{ fontSize: '0.88rem' }}>الأعمال المستهدفة</strong>
                  </div>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                    أطوال العمل، المعدات والكوادر المطلوبة
                  </p>
                </div>

                {/* 4. Two Phase */}
                <div 
                  onClick={() => handleTypeSelect('two_phase')}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '10px',
                    border: activeType === 'two_phase' ? '2px solid #1e40af' : '1px solid #e2e8f0',
                    background: activeType === 'two_phase' ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e40af' }}>
                    <Layers size={18} />
                    <strong style={{ fontSize: '0.88rem' }}>تقرير إنجاز المرحلتين</strong>
                  </div>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                    المرحلة 1 و 2، جدول المتبقي، نسب الإنجاز
                  </p>
                </div>
              </div>
            </div>

            {/* Date & Report Number Header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.3rem' }}>
                  تاريخ التقرير
                </label>
                <input
                  type="date"
                  required
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.3rem' }}>
                  اليوم
                </label>
                <input
                  type="text"
                  readOnly
                  value={`يوم ${getDayName(reportDate)}`}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f1f5f9', fontWeight: 800, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.3rem' }}>
                  رقم التقرير الرسمي
                </label>
                <input
                  type="text"
                  value={reportNumber}
                  onChange={(e) => setReportNumber(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800, direction: 'ltr', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* Form Fields: TYPE 1 - Road Progress */}
            {/* ----------------------------------------------------------------- */}
            {activeType === 'road' && (
              <div style={{ border: '1.5px solid #16a34a', borderRadius: '12px', padding: '1rem', background: '#f0fdf4' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#166534', fontSize: '0.92rem' }}>
                    جدول بنود أعمال الطريق المنفذة ومحطات التنفيذ:
                  </strong>
                  <div style={{ fontSize: '0.82rem', color: '#166534', fontWeight: 800 }}>
                    إجمالي الطول: {totalRoadLength.toLocaleString()} م.ط • إجمالي المساحة: {totalRoadArea.toLocaleString()} م²
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
                    <thead>
                      <tr style={{ background: '#dcfce7', color: '#166534' }}>
                        <th style={{ padding: '0.5rem', border: '1px solid #bbf7d0' }}>البند / الطبقة</th>
                        <th style={{ padding: '0.5rem', border: '1px solid #bbf7d0', width: '100px' }}>من محطة</th>
                        <th style={{ padding: '0.5rem', border: '1px solid #bbf7d0', width: '100px' }}>إلى محطة</th>
                        <th style={{ padding: '0.5rem', border: '1px solid #bbf7d0', width: '100px' }}>طول (م.ط)</th>
                        <th style={{ padding: '0.5rem', border: '1px solid #bbf7d0', width: '100px' }}>مساحة (م²)</th>
                        <th style={{ padding: '0.5rem', border: '1px solid #bbf7d0' }}>ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roadItems.map((item, idx) => (
                        <tr key={item.id}>
                          <td style={{ padding: '0.35rem', border: '1px solid #e2e8f0' }}>
                            <input
                              type="text"
                              value={item.item}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRoadItems(prev => prev.map(r => r.id === item.id ? { ...r, item: val } : r));
                              }}
                              style={{ width: '100%', border: 'none', fontWeight: 700, padding: '0.2rem' }}
                            />
                          </td>
                          <td style={{ padding: '0.35rem', border: '1px solid #e2e8f0' }}>
                            <input
                              type="text"
                              value={item.stationFrom}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRoadItems(prev => prev.map(r => r.id === item.id ? { ...r, stationFrom: val } : r));
                              }}
                              style={{ width: '100%', border: 'none', textAlign: 'center', direction: 'ltr' }}
                            />
                          </td>
                          <td style={{ padding: '0.35rem', border: '1px solid #e2e8f0' }}>
                            <input
                              type="text"
                              value={item.stationTo}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRoadItems(prev => prev.map(r => r.id === item.id ? { ...r, stationTo: val } : r));
                              }}
                              style={{ width: '100%', border: 'none', textAlign: 'center', direction: 'ltr' }}
                            />
                          </td>
                          <td style={{ padding: '0.35rem', border: '1px solid #e2e8f0' }}>
                            <input
                              type="text"
                              value={item.length}
                              onChange={(e) => {
                                const val = e.target.value;
                                const l = cleanNum(val);
                                setRoadItems(prev => prev.map(r => r.id === item.id ? { ...r, length: val, area: String(l * 7.5) } : r));
                              }}
                              style={{ width: '100%', border: 'none', textAlign: 'center', fontWeight: 800, color: '#16a34a' }}
                            />
                          </td>
                          <td style={{ padding: '0.35rem', border: '1px solid #e2e8f0' }}>
                            <input
                              type="text"
                              value={item.area}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRoadItems(prev => prev.map(r => r.id === item.id ? { ...r, area: val } : r));
                              }}
                              style={{ width: '100%', border: 'none', textAlign: 'center', fontWeight: 800 }}
                            />
                          </td>
                          <td style={{ padding: '0.35rem', border: '1px solid #e2e8f0' }}>
                            <input
                              type="text"
                              value={item.notes}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRoadItems(prev => prev.map(r => r.id === item.id ? { ...r, notes: val } : r));
                              }}
                              style={{ width: '100%', border: 'none' }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* Form Fields: TYPE 2 - Fuel Report */}
            {/* ----------------------------------------------------------------- */}
            {activeType === 'fuel' && (
              <div style={{ border: '1.5px solid #f59e0b', borderRadius: '12px', padding: '1rem', background: '#fffbeb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#b45309', fontSize: '0.92rem' }}>
                    جدول كميات الوقود والخزانات والصهاريج:
                  </strong>
                  <div style={{ fontSize: '0.82rem', color: '#b45309', fontWeight: 800 }}>
                    المنصرف: {totalSolarDispatched.toLocaleString()} لتر • الوارد: {totalFuelReceived.toLocaleString()} لتر • المتبقي: {totalFuelRemaining.toLocaleString()} لتر
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
                    <thead>
                      <tr style={{ background: '#fef3c7', color: '#b45309' }}>
                        <th style={{ padding: '0.5rem', border: '1px solid #fde68a' }}>الموقع / الخزان</th>
                        <th style={{ padding: '0.5rem', border: '1px solid #fde68a', color: '#ea580c' }}>الوقود المصروف (لتر)</th>
                        <th style={{ padding: '0.5rem', border: '1px solid #fde68a', color: '#2563eb' }}>الوارد (لتر)</th>
                        <th style={{ padding: '0.5rem', border: '1px solid #fde68a', color: '#16a34a' }}>الرصيد المتبقي (لتر)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fuelItems.map((item) => (
                        <tr key={item.id}>
                          <td style={{ padding: '0.35rem', border: '1px solid #e2e8f0', fontWeight: 800 }}>
                            <input
                              type="text"
                              value={item.location}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFuelItems(prev => prev.map(f => f.id === item.id ? { ...f, location: val } : f));
                              }}
                              style={{ width: '100%', border: 'none', fontWeight: 800 }}
                            />
                          </td>
                          <td style={{ padding: '0.35rem', border: '1px solid #e2e8f0' }}>
                            <input
                              type="text"
                              value={item.dispatchedLiters}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFuelItems(prev => prev.map(f => f.id === item.id ? { ...f, dispatchedLiters: val } : f));
                              }}
                              style={{ width: '100%', border: 'none', textAlign: 'center', fontWeight: 800, color: '#ea580c' }}
                            />
                          </td>
                          <td style={{ padding: '0.35rem', border: '1px solid #e2e8f0' }}>
                            <input
                              type="text"
                              value={item.receivedLiters}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFuelItems(prev => prev.map(f => f.id === item.id ? { ...f, receivedLiters: val } : f));
                              }}
                              style={{ width: '100%', border: 'none', textAlign: 'center', fontWeight: 800, color: '#2563eb' }}
                            />
                          </td>
                          <td style={{ padding: '0.35rem', border: '1px solid #e2e8f0' }}>
                            <input
                              type="text"
                              value={item.remainingLiters}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFuelItems(prev => prev.map(f => f.id === item.id ? { ...f, remainingLiters: val } : f));
                              }}
                              style={{ width: '100%', border: 'none', textAlign: 'center', fontWeight: 800, color: '#16a34a' }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* Form Fields: TYPE 3 - Targeted Works */}
            {/* ----------------------------------------------------------------- */}
            {activeType === 'targeted' && (
              <div style={{ border: '1.5px solid #0284c7', borderRadius: '12px', padding: '1rem', background: '#f0f9ff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#0369a1', fontSize: '0.92rem' }}>
                    بيان الأطوال والمعدات المستهدفة للأقسام التشغيلية:
                  </strong>
                  <div style={{ fontSize: '0.82rem', color: '#0369a1', fontWeight: 800 }}>
                    إجمالي الأطوال: {totalTargetLength.toLocaleString()} م.ط • إجمالي المعدات: {totalTargetEquipment} آلية وطاقم
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {targetedSections.map((sec, secIdx) => (
                    <div key={sec.id} style={{ background: '#fff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 800, color: '#0284c7', fontSize: '0.84rem' }}>{sec.title}</span>
                        <span style={{ fontSize: '0.76rem', color: '#64748b' }}>{sec.startTimeNote}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
                        <div>
                          <label style={{ fontSize: '0.76rem', color: '#64748b' }}>الطول المستهدف (م.ط)</label>
                          <input
                            type="text"
                            value={sec.workItems[0]?.length || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTargetedSections(prev => prev.map((s, idx) => idx === secIdx ? {
                                ...s,
                                workItems: [{ ...s.workItems[0], length: val }]
                              } : s));
                            }}
                            style={{ width: '100%', padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 800, color: '#0284c7' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.76rem', color: '#64748b' }}>عدد الآليات والأطقم</label>
                          <input
                            type="text"
                            value={sec.equipmentItems[0]?.count || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTargetedSections(prev => prev.map((s, idx) => idx === secIdx ? {
                                ...s,
                                equipmentItems: [{ ...s.equipmentItems[0], count: val }]
                              } : s));
                            }}
                            style={{ width: '100%', padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 800 }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* Form Fields: TYPE 4 - Two Phase Progress Report */}
            {/* ----------------------------------------------------------------- */}
            {activeType === 'two_phase' && (
              <div style={{ border: '1.5px solid #1e40af', borderRadius: '12px', padding: '1rem', background: '#eff6ff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#1e3a8a', fontSize: '0.92rem' }}>
                    الأعمال المنجزة للمرحلتين (اليومي والتراكمي):
                  </strong>
                  <div style={{ fontSize: '0.82rem', color: '#1e3a8a', fontWeight: 800 }}>
                    إنجاز اليوم: {twoPhaseTodayTotal.toLocaleString()} م.ط • التراكمي الكلي: {twoPhaseCumulativeTotal.toLocaleString()} م.ط
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', background: '#fff', padding: '0.85rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#475569', fontWeight: 700 }}>إنجاز FDR اليوم (م.ط)</label>
                    <input
                      type="text"
                      value={phase2FdrToday}
                      onChange={(e) => setPhase2FdrToday(e.target.value)}
                      style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 800, color: '#16a34a' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#475569', fontWeight: 700 }}>إنجاز MCO التشريب (م.ط)</label>
                    <input
                      type="text"
                      value={phase2McoToday}
                      onChange={(e) => setPhase2McoToday(e.target.value)}
                      style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 800, color: '#0284c7' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#475569', fontWeight: 700 }}>إنجاز الأسفلت اليوم (م.ط)</label>
                    <input
                      type="text"
                      value={phase2AsphaltToday}
                      onChange={(e) => setPhase2AsphaltToday(e.target.value)}
                      style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 800, color: '#0f172a' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#475569', fontWeight: 700 }}>أعمال الأساس والخدمي (م.ط)</label>
                    <input
                      type="text"
                      value={phase2OtherToday}
                      onChange={(e) => setPhase2OtherToday(e.target.value)}
                      style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 800, color: '#ea580c' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Document Image Attachment & Notes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.3rem' }}>
                  إرفاق وثيقة التقرير المصورة (اختياري)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: '#f8fafc',
                      border: '1.5px dashed #cbd5e1',
                      borderRadius: '8px',
                      padding: '0.55rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      color: '#475569'
                    }}
                  >
                    <Camera size={16} color="#0284c7" />
                    <span>{fileName ? `تم اختيار: ${fileName.slice(0, 20)}...` : 'اختر صورة التقرير الميداني'}</span>
                  </button>
                  {fileName && (
                    <button
                      type="button"
                      onClick={() => { setFileName(''); setAttachedFile(null); }}
                      style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '6px', padding: '0.4rem' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.3rem' }}>
                  ملاحظات وتوجيهات الإشراف
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات فنية أو تشغيلية..."
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '1.25rem',
              marginTop: '0.5rem'
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '0.7rem 1.4rem',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                إلغاء
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.7rem 1.8rem',
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  color: '#ffffff',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                <Send size={16} />
                <span>{isSubmitting ? 'جاري الحفظ والتوجيه...' : 'حفظ التقرير وتوجيهه للقسم ⚡'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateReportModal;
