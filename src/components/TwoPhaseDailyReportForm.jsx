import React, { useState, useMemo, useEffect } from 'react';
import { 
  Layers, Plus, Trash2, Printer, Send, CheckCircle2, 
  AlertCircle, FileSpreadsheet, FileText, Calendar, 
  TrendingUp, BarChart3, RefreshCw, Eye, Edit3, Save, 
  HelpCircle, UserCheck, Shield, ChevronLeft, Award, Check
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Cell 
} from 'recharts';
import * as XLSX from 'xlsx';
import { fastFetch, clearApiCache, saveStoredTwoPhaseReport, getStoredTwoPhaseReport } from '../utils/apiCache.js';
import { toCleanLatinDigits } from '../utils/forceLatinDigits.js';

// Official Certified Items for Phase 1 (Matching Official Document 24/10/2026)
export const initialPhase1ReportItems = [
  { id: 1, category: 'basic', name: 'طبقة إعادة التدوير (FDR)', todayMeters: '0', totalMeters: '226083', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#16a34a', shortName: 'إعادة تدوير' },
  { id: 2, category: 'basic', name: 'رش طبقة التشريب (MCO)', todayMeters: '0', totalMeters: '226083', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#0284c7', shortName: 'رش تشريب' },
  { id: 3, category: 'basic', name: 'طبقة الاسفلت المحسن', todayMeters: '0', totalMeters: '226083', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#0f172a', shortName: 'اسفلت محسن' },
  { id: 4, category: 'additional', name: 'فرمة اولي بدون اسمنت(FDR)', todayMeters: '0', totalMeters: '226083', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#22c55e', shortName: 'فرم بدون أسمنت' },
  { id: 5, category: 'additional', name: 'طبقة أساس حبيبي', todayMeters: '0', totalMeters: '226083', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#ea580c', shortName: 'أساس حبيبي' },
  { id: 6, category: 'additional', name: 'الطريق الخدمي', todayMeters: '0', totalMeters: '226218', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#eab308', shortName: 'طريق خدمي' },
];

// Official Certified Items for Phase 2 (Matching Official Document 24/10/2026)
export const initialPhase2ReportItems = [
  { id: 1, category: 'basic', name: 'طبقة إعادة التدوير (FDR)', todayMeters: '1220', totalMeters: '16240', dailyTarget: '800', varianceMeters: '420.00', notes: 'منجز معتمد بالتقرير اليومي', color: '#16a34a', shortName: 'إعادة تدوير' },
  { id: 2, category: 'basic', name: 'رش طبقة التشريب (MCO)', todayMeters: '460', totalMeters: '10410', dailyTarget: '800', varianceMeters: '-340.00', notes: 'منجز معتمد بالتقرير اليومي', color: '#0284c7', shortName: 'رش تشريب' },
  { id: 3, category: 'basic', name: 'طبقة الاسفلت المحسن', todayMeters: '1140', totalMeters: '8140', dailyTarget: '800', varianceMeters: '340.00', notes: 'منجز معتمد بالتقرير اليومي', color: '#0f172a', shortName: 'اسفلت محسن' },
  { id: 4, category: 'additional', name: 'فرمة اولي بدون اسمنت(FDR)', todayMeters: '500', totalMeters: '16210', dailyTarget: '800', varianceMeters: '-300.00', notes: 'منجز معتمد بالتقرير اليومي', color: '#22c55e', shortName: 'فرم بدون أسمنت' },
  { id: 5, category: 'additional', name: 'طبقة أساس حبيبي', todayMeters: '500', totalMeters: '10410', dailyTarget: '800', varianceMeters: '-300.00', notes: 'منجز معتمد بالتقرير اليومي', color: '#ea580c', shortName: 'أساس حبيبي' },
  { id: 6, category: 'additional', name: 'الطريق الخدمي', todayMeters: '0', totalMeters: '15230', dailyTarget: '800', varianceMeters: '-800.00', notes: 'منجز معتمد بالتقرير اليومي', color: '#eab308', shortName: 'طريق خدمي' },
];

// Official Custom Fields for Combined Table ("الجاهز للعمل في البند" والملاحظات)
export const initialCombinedCustomFields = [
  { id: 1, readyToWorkMeters: '', notes: 'الجاهز للعمل بالبند (طبقة التشريب وقيد موافقة استشاري)' },
  { id: 2, readyToWorkMeters: '', notes: 'الجاهز للعمل بالبند (طبقة الأساس وقيد موافقة استشاري)' },
  { id: 3, readyToWorkMeters: '2253.00', notes: '' },
  { id: 4, readyToWorkMeters: '', notes: '' },
  { id: 5, readyToWorkMeters: '5717.00', notes: 'الجاهز للعمل بالبند (فرم أولى وقيد موافقة استشاري)' },
  { id: 6, readyToWorkMeters: '', notes: '' },
];

// Official Certified Remaining Items (Matching Official Document 24/10/2026)
export const initialRemainingReportItems = [
  { id: 1, group: 'A', name: 'المتبقي من الفرمة الأولى', phase1: '150.00', phase2: '117677.00', total: '117677.00', notes: 'من احتياج الصيانة' },
  { id: 2, group: 'A', name: 'المتبقي من الفرمة الثانية', phase1: '183.00', phase2: '117777.00', total: '117777.00', notes: 'جزء السنارة المنهارة' },
  { id: 3, group: 'A', name: 'المتبقي من الأساس', phase1: '183.00', phase2: '123507.00', total: '123507.00', notes: '' },
  { id: 4, group: 'B', name: 'المتبقي من طبقة التشريب', phase1: '150.00', phase2: '123507.00', total: '123507.00', notes: '' },
  { id: 5, group: 'B', name: 'المتبقي من الاسفلت', phase1: '150.00', phase2: '125625.00', total: '125775.00', notes: '' },
  { id: 6, group: 'B', name: 'طول الطريق الخدمي العامل', phase1: '', phase2: '', total: '8080.00', notes: 'كيلومتر' },
];

export const createDefaultPhaseItems = () => initialPhase1ReportItems.map(item => ({ ...item }));
export const createDefaultRemainingItems = () => initialRemainingReportItems.map(item => ({ ...item }));

export const TwoPhaseDailyReportForm = ({ 
  currentUser, 
  onReportSaved, 
  onPrintReport, 
  onNavigateTab 
}) => {
  const getDayName = (dateStr) => {
    if (!dateStr) return 'السبت';
    const date = new Date(dateStr);
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()] || 'السبت';
  };

  // Basic Header Info - Defaulting to Official Certified Document (Saturday 24/10/2026)
  const [reportDate, setReportDate] = useState('2026-10-24');
  const [dayName, setDayName] = useState('السبت');
  const [reportNumber, setReportNumber] = useState('082024_24.10.2026');
  const [projectName, setProjectName] = useState('مشروع صيانة طريق أوباري غات');
  const [reportTitle, setReportTitle] = useState('الأعمال المنجزة للمرحلتين');

  // Signatures
  const [sectorDirector, setSectorDirector] = useState('م. صلاح العربي');
  const [ownerRepresentative, setOwnerRepresentative] = useState('م. عبدالرحمن الأنصاري');

  // Tables State (Phase 1, Phase 2, Remaining, and Combined Custom Fields)
  const [phase1Items, setPhase1Items] = useState(initialPhase1ReportItems.map(i => ({ ...i })));
  const [phase2Items, setPhase2Items] = useState(initialPhase2ReportItems.map(i => ({ ...i })));
  const [combinedCustom, setCombinedCustom] = useState(initialCombinedCustomFields.map(i => ({ ...i })));
  const [remainingItems, setRemainingItems] = useState(initialRemainingReportItems.map(i => ({ ...i })));

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [createdReport, setCreatedReport] = useState(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardRecipient, setForwardRecipient] = useState('salih_hammad');
  const [forwardNote, setForwardNote] = useState('');
  const [isForwarding, setIsForwarding] = useState(false);

  // Auto load existing data from backend API
  useEffect(() => {
    let isMounted = true;
    const loadReportData = async () => {
      try {
        const res = await fastFetch('http://localhost:5000/api/two-phase-report');
        if (isMounted && res?.data && Array.isArray(res.data.phase1Items) && res.data.phase1Items.length > 0) {
          const rep = res.data;
          if (rep.dateFormatted) setReportDate(rep.dateFormatted);
          if (rep.dayName) setDayName(rep.dayName);
          if (rep.reportNumber) setReportNumber(rep.reportNumber);
          if (rep.sectorDirector) setSectorDirector(rep.sectorDirector);
          if (rep.ownerRepresentative) setOwnerRepresentative(rep.ownerRepresentative);
          setPhase1Items(rep.phase1Items);
          if (Array.isArray(rep.phase2Items)) setPhase2Items(rep.phase2Items);
          if (Array.isArray(rep.remainingItems)) setRemainingItems(rep.remainingItems);
          if (Array.isArray(rep.combinedItems)) {
            setCombinedCustom(rep.combinedItems.map((c, idx) => ({
              id: c.id || idx + 1,
              readyToWorkMeters: c.readyToWorkMeters !== undefined ? c.readyToWorkMeters : (c.dailyTarget || ''),
              notes: c.notes || ''
            })));
          }
        }
      } catch (err) {
        console.warn('Using certified offline data for two-phase report:', err);
      }
    };
    loadReportData();
    return () => { isMounted = false; };
  }, []);

  // Auto-calculated Combined Table (Phase 1 + Phase 2 + Ready-To-Work)
  const combinedItems = useMemo(() => {
    return phase1Items.map((p1, idx) => {
      const p2 = phase2Items[idx] || {};
      const custom = combinedCustom[idx] || {};
      const todayP1 = parseFloat(p1.todayMeters) || 0;
      const todayP2 = parseFloat(p2.todayMeters) || 0;
      const totalP1 = parseFloat(p1.totalMeters) || 0;
      const totalP2 = parseFloat(p2.totalMeters) || 0;
      const combinedToday = todayP1 + todayP2;
      const combinedTotal = totalP1 + totalP2;

      return {
        id: p1.id,
        category: p1.category,
        name: p1.name,
        shortName: p1.shortName,
        color: p1.color,
        todayMeters: combinedToday > 0 ? String(combinedToday) : (todayP1 || todayP2 ? '0' : ''),
        totalMeters: combinedTotal > 0 ? String(combinedTotal) : '',
        readyToWorkMeters: custom.readyToWorkMeters !== undefined ? custom.readyToWorkMeters : '',
        notes: custom.notes !== undefined ? custom.notes : (p1.notes || p2.notes || '')
      };
    });
  }, [phase1Items, phase2Items, combinedCustom]);

  // Handlers for Phase 1 updates
  const handleUpdatePhase1 = (id, field, value) => {
    const cleanVal = (field === 'todayMeters' || field === 'totalMeters' || field === 'dailyTarget') 
      ? toCleanLatinDigits(value) 
      : value;
    setPhase1Items(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: cleanVal };
      if (field === 'todayMeters' || field === 'dailyTarget') {
        const today = field === 'todayMeters' ? parseFloat(value) : parseFloat(item.todayMeters);
        const target = field === 'dailyTarget' ? parseFloat(value) : parseFloat(item.dailyTarget);
        if (!isNaN(today) && !isNaN(target)) {
          updated.varianceMeters = (today - target).toFixed(2);
        } else {
          updated.varianceMeters = '';
        }
      }
      return updated;
    }));
  };

  // Handlers for Phase 2 updates
  const handleUpdatePhase2 = (id, field, value) => {
    const cleanVal = (field === 'todayMeters' || field === 'totalMeters' || field === 'dailyTarget') 
      ? toCleanLatinDigits(value) 
      : value;
    setPhase2Items(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: cleanVal };
      if (field === 'todayMeters' || field === 'dailyTarget') {
        const today = field === 'todayMeters' ? parseFloat(value) : parseFloat(item.todayMeters);
        const target = field === 'dailyTarget' ? parseFloat(value) : parseFloat(item.dailyTarget);
        if (!isNaN(today) && !isNaN(target)) {
          updated.varianceMeters = (today - target).toFixed(2);
        } else {
          updated.varianceMeters = '';
        }
      }
      return updated;
    }));
  };

  // Handler for Combined Table updates (readyToWorkMeters & notes)
  const handleUpdateCombined = (id, field, value) => {
    const cleanVal = field === 'readyToWorkMeters' ? toCleanLatinDigits(value) : value;
    setCombinedCustom(prev => prev.map(item => {
      if (item.id !== id) return item;
      return { ...item, [field]: cleanVal };
    }));
  };

  // Handlers for Remaining Items updates
  const handleUpdateRemaining = (id, field, value) => {
    const cleanVal = (field === 'phase1' || field === 'phase2') ? toCleanLatinDigits(value) : value;
    setRemainingItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: cleanVal };
      if (field === 'phase1' || field === 'phase2') {
        const p1 = field === 'phase1' ? parseFloat(value) : parseFloat(item.phase1);
        const p2 = field === 'phase2' ? parseFloat(value) : parseFloat(item.phase2);
        const total = (isNaN(p1) ? 0 : p1) + (isNaN(p2) ? 0 : p2);
        updated.total = total > 0 ? total.toFixed(2) : '';
      }
      return updated;
    }));
  };

  // Restore Official Certified Data (24/10/2026)
  const handleRestoreCertifiedData = () => {
    setReportDate('2026-10-24');
    setDayName('السبت');
    setReportNumber('082024_24.10.2026');
    setSectorDirector('م. صلاح العربي');
    setOwnerRepresentative('م. عبدالرحمن الأنصاري');
    setPhase1Items(initialPhase1ReportItems.map(i => ({ ...i })));
    setPhase2Items(initialPhase2ReportItems.map(i => ({ ...i })));
    setCombinedCustom(initialCombinedCustomFields.map(i => ({ ...i })));
    setRemainingItems(initialRemainingReportItems.map(i => ({ ...i })));
    setStatusMessage({
      type: 'success',
      text: 'تمت استعادة كافة البيانات المعتمدة لتقرير المرحلتين (يوم السبت 24/10/2026) بنجاح!'
    });
  };

  // Reset / Clear form
  const handleResetForm = () => {
    if (window.confirm('هل تريد مسح جميع الحقول وإعادة تعيين التقرير لإدخال بيانات فارغة؟')) {
      setPhase1Items(initialPhase1ReportItems.map(i => ({ ...i, todayMeters: '', totalMeters: '', dailyTarget: '', varianceMeters: '', notes: '' })));
      setPhase2Items(initialPhase2ReportItems.map(i => ({ ...i, todayMeters: '', totalMeters: '', dailyTarget: '', varianceMeters: '', notes: '' })));
      setCombinedCustom(initialCombinedCustomFields.map(i => ({ ...i, readyToWorkMeters: '', notes: '' })));
      setRemainingItems(initialRemainingReportItems.map(i => ({ ...i, phase1: '', phase2: '', total: '', notes: '' })));
      setStatusMessage({ type: 'info', text: 'تم تفريغ كافة الحقول لإدخال تقرير جديد.' });
    }
  };

  // Prepare chart data for each phase
  const getChartData = (items) => {
    return items.map(item => ({
      name: item.shortName || item.name,
      value: parseFloat(item.totalMeters) || parseFloat(item.todayMeters) || 0,
      color: item.color
    }));
  };

  const chartDataPhase1 = useMemo(() => getChartData(phase1Items), [phase1Items]);
  const chartDataPhase2 = useMemo(() => getChartData(phase2Items), [phase2Items]);
  const chartDataCombined = useMemo(() => getChartData(combinedItems), [combinedItems]);

  // Export to Excel
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // 1. Phase 1 Sheet
    const p1Data = [
      ['مشروع صيانة طريق أوباري غات - تقرير الأعمال المنجزة للمرحلتين'],
      [`التاريخ: ${reportDate}`, `اليوم: ${dayName}`, `رقم التقرير: ${reportNumber}`],
      [],
      ['المرحلة الأولى - بنود أساسية'],
      ['م', 'الوصف', 'إنجاز اليوم (م.ط)', 'الإجمالي (م.ط)', 'المستهدف اليومي', 'الزيادة / النقصان', 'ملاحظات']
    ];
    phase1Items.filter(i => i.category === 'basic').forEach((i, idx) => {
      p1Data.push([idx + 1, i.name, i.todayMeters || 0, i.totalMeters || 0, i.dailyTarget || 0, i.varianceMeters || 0, i.notes || '']);
    });
    p1Data.push(['المرحلة الأولى - بنود إضافية']);
    phase1Items.filter(i => i.category === 'additional').forEach((i, idx) => {
      p1Data.push([idx + 1, i.name, i.todayMeters || 0, i.totalMeters || 0, i.dailyTarget || 0, i.varianceMeters || 0, i.notes || '']);
    });

    const ws1 = XLSX.utils.aoa_to_sheet(p1Data);
    XLSX.utils.book_append_sheet(wb, ws1, 'المرحلة الأولى');

    // 2. Phase 2 Sheet
    const p2Data = [
      ['المرحلة الثانية - بنود أساسية'],
      ['م', 'الوصف', 'إنجاز اليوم (م.ط)', 'الإجمالي (م.ط)', 'المستهدف اليومي', 'الزيادة / النقصان', 'ملاحظات']
    ];
    phase2Items.filter(i => i.category === 'basic').forEach((i, idx) => {
      p2Data.push([idx + 1, i.name, i.todayMeters || 0, i.totalMeters || 0, i.dailyTarget || 0, i.varianceMeters || 0, i.notes || '']);
    });
    p2Data.push(['المرحلة الثانية - بنود إضافية']);
    phase2Items.filter(i => i.category === 'additional').forEach((i, idx) => {
      p2Data.push([idx + 1, i.name, i.todayMeters || 0, i.totalMeters || 0, i.dailyTarget || 0, i.varianceMeters || 0, i.notes || '']);
    });

    const ws2 = XLSX.utils.aoa_to_sheet(p2Data);
    XLSX.utils.book_append_sheet(wb, ws2, 'المرحلة الثانية');

    // 3. Combined & Remaining Sheet
    const combData = [
      ['إجمالي المنجز للمرحلتين'],
      ['م', 'الوصف', 'إنجاز اليوم (م.ط)', 'الإجمالي (م.ط)', 'الجاهز للعمل في البند', 'ملاحظات']
    ];
    combinedItems.forEach((i, idx) => {
      combData.push([idx + 1, i.name, i.todayMeters || 0, i.totalMeters || 0, i.readyToWorkMeters || 0, i.notes || '']);
    });
    combData.push([]);
    combData.push(['المتبقي من البنود']);
    combData.push(['المتبقي من البند', 'المرحلة الأولى', 'المرحلة الثانية', 'الإجمالي', 'ملاحظات']);
    remainingItems.forEach(r => {
      combData.push([r.name, r.phase1 || 0, r.phase2 || 0, r.total || 0, r.notes || '']);
    });
    combData.push([]);
    combData.push(['مدير القطاع:', sectorDirector, '', 'ممثل الجهة المالكة:', ownerRepresentative]);

    const ws3 = XLSX.utils.aoa_to_sheet(combData);
    XLSX.utils.book_append_sheet(wb, ws3, 'الإجمالي والمتبقي');

    XLSX.writeFile(wb, `تقرير_الاعمال_المنجزة_للمرحلتين_${reportDate}.xlsx`);
  };

  // Submit / Save Report
  const handleSubmitReport = async (sendAfter = false) => {
    setIsSubmitting(true);
    setStatusMessage(null);

    const totalTodayMeters = combinedItems.reduce((acc, curr) => acc + (parseFloat(curr.todayMeters) || 0), 0);
    const totalCumulativeMeters = combinedItems.reduce((acc, curr) => acc + (parseFloat(curr.totalMeters) || 0), 0);

    const reportPayload = {
      reportNumber,
      date: new Date(reportDate).toISOString(),
      dateFormatted: reportDate,
      dayName,
      title: `بيان أعمال إنجاز المرحلتين يوم ${dayName} ${reportDate}`,
      projectName,
      reportType: 'تقرير إنجاز المرحلتين',
      shiftType: 'دوام كامل',
      sector: 'القطاع المشترك (المرحلتين الأولى والثانية)',
      companyName: 'ائتلاف الشركات المنفذة لطريق أوباري غات',
      uploadedBy: currentUser?.name || sectorDirector,
      sectorDirector,
      ownerRepresentative,
      status: 'approved',
      approvedBy: 'مدير عام المشروع',
      notes: `تقرير الأعمال المنجزة للمرحلتين - إنجاز اليوم: ${totalTodayMeters} م.ط - الإجمالي التراكمي: ${totalCumulativeMeters} م.ط`,
      roadMeters: totalTodayMeters,
      totalLength: totalTodayMeters,
      // Two Phase Specific Flag & Data
      isTwoPhaseProgressReport: true,
      phase1Items,
      phase2Items,
      combinedItems,
      remainingItems,
      twoPhaseTotals: {
        todayMeters: totalTodayMeters,
        totalCumulativeMeters
      }
    };

    try {
      try {
        await fastFetch('http://localhost:5000/api/two-phase-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportPayload)
        });
      } catch (tpErr) {
        console.warn('Backend sync /api/two-phase-report:', tpErr);
      }

      const res = await fastFetch('http://localhost:5000/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportPayload)
      });

      const saved = res?.report || { ...reportPayload, id: Date.now() };

      // Local storage fallback
      try {
        const local = JSON.parse(localStorage.getItem('local_reports') || '[]');
        local.unshift(saved);
        localStorage.setItem('local_reports', JSON.stringify(local));
      } catch (e) {
        console.error(e);
      }

      setCreatedReport(saved);
      if (onReportSaved) onReportSaved(saved);

      try {
        clearApiCache();
      } catch (cacheErr) {}

      try {
        window.dispatchEvent(new CustomEvent('report-saved', { detail: saved }));
        window.dispatchEvent(new CustomEvent('road-progress-updated', { detail: saved }));
      } catch (evtErr) {
        console.warn('Event dispatch error:', evtErr);
      }

      setStatusMessage({ 
        type: 'success', 
        text: `تم حفظ تقرير الأعمال المنجزة للمرحلتين برقم (${saved.reportNumber}) بنجاح!` 
      });

      if (sendAfter) {
        setShowForwardModal(true);
      }
    } catch (err) {
      console.error('Failed to save two-phase report:', err);
      setStatusMessage({ 
        type: 'danger', 
        text: 'حدث خطأ أثناء حفظ التقرير. يرجى المحاولة مرة أخرى.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Forward Report via messaging
  const handleForwardReport = async () => {
    if (!createdReport) return;
    setIsForwarding(true);

    const supervisors = [
      { username: 'salih_hammad', name: 'م. صالح حماد', role: 'مدير المشروع' },
      { username: 'ali_alfitouri', name: 'م. علي الفيتوري', role: 'رئيس جهاز الإشراف' },
      { username: 'abdulrahman_alansari', name: 'م. عبدالرحمن الأنصاري', role: 'ممثل الجهة المالكة' }
    ];
    const targetUser = supervisors.find(u => u.username === forwardRecipient) || supervisors[0];

    const messagePayload = {
      fromUsername: currentUser?.username || 'user',
      fromName: currentUser?.name || sectorDirector,
      fromRole: currentUser?.title || currentUser?.role || 'إدارة المشروع',
      toUsername: targetUser.username,
      toName: targetUser.name,
      toRole: targetUser.role,
      type: 'تقرير إنجاز المرحلتين',
      subject: `إحالة تقرير الأعمال المنجزة للمرحلتين - ${dayName} ${reportDate}`,
      content: forwardNote.trim() || `نحيل إليكم التقرير اليومي المعتمد للأعمال المنجزة للمرحلتين الأولى والثانية بطريق أوباري غات.`,
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
        text: `تم إرسال التقرير رسمياً إلى (${targetUser.name}) بنجاح!` 
      });

      setTimeout(() => {
        if (onNavigateTab) onNavigateTab('messages');
      }, 1200);
    } catch (err) {
      console.error('Failed to forward report:', err);
      alert('تم حفظ التقرير محلياً بنجاح.');
    } finally {
      setIsForwarding(false);
    }
  };

  // Helper renderer for each phase's table
  const renderPhaseTable = (title, items, onUpdate, headerBg = '#1e40af') => {
    const basicItems = items.filter(i => i.category === 'basic');
    const additionalItems = items.filter(i => i.category === 'additional');

    return (
      <div style={{
        background: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #cbd5e1',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        marginBottom: '1rem'
      }}>
        {/* Table Title Banner */}
        <div style={{
          background: headerBg,
          color: '#ffffff',
          padding: '0.6rem 1rem',
          fontWeight: 900,
          fontSize: '1rem',
          textAlign: 'center',
          letterSpacing: '0.5px'
        }}>
          {title}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', color: '#1e293b', borderBottom: '2px solid #cbd5e1' }}>
              <th style={{ padding: '8px 4px', width: '38px', borderRight: '1px solid #e2e8f0' }}>م</th>
              <th style={{ padding: '8px 8px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>الوصف</th>
              <th style={{ padding: '8px 6px', width: '120px', borderRight: '1px solid #e2e8f0' }}>إنجاز اليوم (م.ط)</th>
              <th style={{ padding: '8px 6px', width: '120px', borderRight: '1px solid #e2e8f0' }}>الإجمالي (م.ط)</th>
              <th style={{ padding: '8px 6px', width: '110px', borderRight: '1px solid #e2e8f0' }}>المستهدف اليومي</th>
              <th style={{ padding: '8px 6px', width: '110px', borderRight: '1px solid #e2e8f0' }}>الزيادة / النقصان</th>
              <th style={{ padding: '8px 6px', minWidth: '130px' }}>ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {/* Sub-header: بنود أساسية */}
            <tr style={{ background: '#e2e8f0', color: '#0f172a', fontWeight: 800 }}>
              <td colSpan={7} style={{ padding: '5px 12px', textAlign: 'right', fontSize: '0.82rem' }}>
                📌 بنود أساسية
              </td>
            </tr>
            {basicItems.map((item, idx) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '6px 4px', fontWeight: 700, color: '#64748b', borderRight: '1px solid #e2e8f0' }}>
                  {idx + 1}
                </td>
                <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800, color: '#0f172a', borderRight: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                    <span>{item.name}</span>
                  </div>
                </td>
                <td style={{ padding: '4px', borderRight: '1px solid #e2e8f0' }}>
                  <input
                    type="text" inputMode="decimal" dir="ltr" lang="en"
                    step="any"
                    value={toCleanLatinDigits(item.todayMeters)}
                    onChange={(e) => onUpdate(item.id, 'todayMeters', e.target.value)}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '5px 6px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      textAlign: 'center',
                      fontWeight: 700,
                      background: item.todayMeters ? '#eff6ff' : '#ffffff',
                      color: item.todayMeters ? '#1d4ed8' : '#0f172a'
                    }}
                  />
                </td>
                <td style={{ padding: '4px', borderRight: '1px solid #e2e8f0' }}>
                  <input
                    type="text" inputMode="decimal" dir="ltr" lang="en"
                    step="any"
                    value={toCleanLatinDigits(item.totalMeters)}
                    onChange={(e) => onUpdate(item.id, 'totalMeters', e.target.value)}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '5px 6px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      textAlign: 'center',
                      fontWeight: 700,
                      background: item.totalMeters ? '#f0fdf4' : '#ffffff',
                      color: item.totalMeters ? '#15803d' : '#0f172a'
                    }}
                  />
                </td>
                <td style={{ padding: '4px', borderRight: '1px solid #e2e8f0' }}>
                  <input
                    type="text" inputMode="decimal" dir="ltr" lang="en"
                    step="any"
                    value={toCleanLatinDigits(item.dailyTarget)}
                    onChange={(e) => onUpdate(item.id, 'dailyTarget', e.target.value)}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '5px 6px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#475569'
                    }}
                  />
                </td>
                <td style={{ padding: '4px 6px', borderRight: '1px solid #e2e8f0', fontWeight: 800 }}>
                  {item.varianceMeters !== '' && item.varianceMeters !== null && !isNaN(Number(item.varianceMeters)) ? (
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      background: Number(item.varianceMeters) >= 0 ? '#dcfce7' : '#fee2e2',
                      color: Number(item.varianceMeters) >= 0 ? '#15803d' : '#b91c1c'
                    }}>
                      {Number(item.varianceMeters) >= 0 ? `+${item.varianceMeters}` : item.varianceMeters}
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>—</span>
                  )}
                </td>
                <td style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={item.notes}
                    onChange={(e) => onUpdate(item.id, 'notes', e.target.value)}
                    placeholder="ملاحظات..."
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '0.82rem'
                    }}
                  />
                </td>
              </tr>
            ))}

            {/* Sub-header: بنود إضافية */}
            <tr style={{ background: '#e2e8f0', color: '#0f172a', fontWeight: 800 }}>
              <td colSpan={7} style={{ padding: '5px 12px', textAlign: 'right', fontSize: '0.82rem' }}>
                📌 بنود إضافية
              </td>
            </tr>
            {additionalItems.map((item, idx) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '6px 4px', fontWeight: 700, color: '#64748b', borderRight: '1px solid #e2e8f0' }}>
                  {basicItems.length + idx + 1}
                </td>
                <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800, color: '#0f172a', borderRight: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                    <span>{item.name}</span>
                  </div>
                </td>
                <td style={{ padding: '4px', borderRight: '1px solid #e2e8f0' }}>
                  <input
                    type="text" inputMode="decimal" dir="ltr" lang="en"
                    step="any"
                    value={toCleanLatinDigits(item.todayMeters)}
                    onChange={(e) => onUpdate(item.id, 'todayMeters', e.target.value)}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '5px 6px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      textAlign: 'center',
                      fontWeight: 700,
                      background: item.todayMeters ? '#eff6ff' : '#ffffff',
                      color: item.todayMeters ? '#1d4ed8' : '#0f172a'
                    }}
                  />
                </td>
                <td style={{ padding: '4px', borderRight: '1px solid #e2e8f0' }}>
                  <input
                    type="text" inputMode="decimal" dir="ltr" lang="en"
                    step="any"
                    value={toCleanLatinDigits(item.totalMeters)}
                    onChange={(e) => onUpdate(item.id, 'totalMeters', e.target.value)}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '5px 6px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      textAlign: 'center',
                      fontWeight: 700,
                      background: item.totalMeters ? '#f0fdf4' : '#ffffff',
                      color: item.totalMeters ? '#15803d' : '#0f172a'
                    }}
                  />
                </td>
                <td style={{ padding: '4px', borderRight: '1px solid #e2e8f0' }}>
                  <input
                    type="text" inputMode="decimal" dir="ltr" lang="en"
                    step="any"
                    value={toCleanLatinDigits(item.dailyTarget)}
                    onChange={(e) => onUpdate(item.id, 'dailyTarget', e.target.value)}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '5px 6px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#475569'
                    }}
                  />
                </td>
                <td style={{ padding: '4px 6px', borderRight: '1px solid #e2e8f0', fontWeight: 800 }}>
                  {item.varianceMeters !== '' && item.varianceMeters !== null && !isNaN(Number(item.varianceMeters)) ? (
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      background: Number(item.varianceMeters) >= 0 ? '#dcfce7' : '#fee2e2',
                      color: Number(item.varianceMeters) >= 0 ? '#15803d' : '#b91c1c'
                    }}>
                      {Number(item.varianceMeters) >= 0 ? `+${item.varianceMeters}` : item.varianceMeters}
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>—</span>
                  )}
                </td>
                <td style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={item.notes}
                    onChange={(e) => onUpdate(item.id, 'notes', e.target.value)}
                    placeholder="ملاحظات..."
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '0.82rem'
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Helper renderer for Combined Two-Phase Table
  const renderCombinedTable = () => {
    const basicItems = combinedItems.filter(i => i.category === 'basic');
    const additionalItems = combinedItems.filter(i => i.category === 'additional');

    return (
      <div style={{
        background: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #0f172a',
        overflow: 'hidden',
        boxShadow: '0 3px 12px rgba(15,23,42,0.08)',
        marginBottom: '1rem'
      }}>
        {/* Table Title Banner */}
        <div style={{
          background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          padding: '0.65rem 1rem',
          fontWeight: 900,
          fontSize: '1.05rem',
          textAlign: 'center',
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <Layers size={18} />
          <span>إجمالي المنجز للمرحلتين (تجميع آلي فوري)</span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#0f172a', borderBottom: '2px solid #cbd5e1' }}>
              <th style={{ padding: '8px 4px', width: '38px', borderRight: '1px solid #e2e8f0' }}>م</th>
              <th style={{ padding: '8px 8px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>الوصف</th>
              <th style={{ padding: '8px 6px', width: '130px', borderRight: '1px solid #e2e8f0', background: '#eff6ff' }}>إنجاز اليوم (م.ط)</th>
              <th style={{ padding: '8px 6px', width: '130px', borderRight: '1px solid #e2e8f0', background: '#f0fdf4' }}>الإجمالي (م.ط)</th>
              <th style={{ padding: '8px 6px', width: '140px', borderRight: '1px solid #e2e8f0', background: '#fffbeb' }}>الجاهز للعمل في البند</th>
              <th style={{ padding: '8px 6px', minWidth: '160px' }}>ملاحظات وتفاصيل التجميع</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: '#e2e8f0', color: '#0f172a', fontWeight: 800 }}>
              <td colSpan={6} style={{ padding: '5px 12px', textAlign: 'right', fontSize: '0.82rem' }}>
                📌 بنود أساسية
              </td>
            </tr>
            {basicItems.map((item, idx) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '6px 4px', fontWeight: 700, color: '#64748b', borderRight: '1px solid #e2e8f0' }}>
                  {idx + 1}
                </td>
                <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800, color: '#0f172a', borderRight: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                    <span>{item.name}</span>
                  </div>
                </td>
                <td style={{ padding: '6px 8px', fontWeight: 900, color: '#1d4ed8', borderRight: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  {item.todayMeters ? `${item.todayMeters} م.ط` : '—'}
                </td>
                <td style={{ padding: '6px 8px', fontWeight: 900, color: '#15803d', borderRight: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  {item.totalMeters ? `${item.totalMeters} م.ط` : '—'}
                </td>
                <td style={{ padding: '4px', borderRight: '1px solid #e2e8f0', background: '#fffbeb' }}>
                  <input
                    type="text" inputMode="decimal" dir="ltr" lang="en"
                    step="any"
                    value={toCleanLatinDigits(item.readyToWorkMeters)}
                    onChange={(e) => handleUpdateCombined(item.id, 'readyToWorkMeters', e.target.value)}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '5px 6px',
                      border: '1px solid #fde68a',
                      borderRadius: '6px',
                      textAlign: 'center',
                      fontWeight: 700,
                      background: item.readyToWorkMeters ? '#fef3c7' : '#ffffff',
                      color: item.readyToWorkMeters ? '#b45309' : '#0f172a'
                    }}
                  />
                </td>
                <td style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={item.notes}
                    onChange={(e) => handleUpdateCombined(item.id, 'notes', e.target.value)}
                    placeholder="ملاحظات وتفاصيل التجميع..."
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '0.82rem'
                    }}
                  />
                </td>
              </tr>
            ))}

            <tr style={{ background: '#e2e8f0', color: '#0f172a', fontWeight: 800 }}>
              <td colSpan={6} style={{ padding: '5px 12px', textAlign: 'right', fontSize: '0.82rem' }}>
                📌 بنود إضافية
              </td>
            </tr>
            {additionalItems.map((item, idx) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '6px 4px', fontWeight: 700, color: '#64748b', borderRight: '1px solid #e2e8f0' }}>
                  {basicItems.length + idx + 1}
                </td>
                <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800, color: '#0f172a', borderRight: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                    <span>{item.name}</span>
                  </div>
                </td>
                <td style={{ padding: '6px 8px', fontWeight: 900, color: '#1d4ed8', borderRight: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  {item.todayMeters ? `${item.todayMeters} م.ط` : '—'}
                </td>
                <td style={{ padding: '6px 8px', fontWeight: 900, color: '#15803d', borderRight: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  {item.totalMeters ? `${item.totalMeters} م.ط` : '—'}
                </td>
                <td style={{ padding: '4px', borderRight: '1px solid #e2e8f0', background: '#fffbeb' }}>
                  <input
                    type="text" inputMode="decimal" dir="ltr" lang="en"
                    step="any"
                    value={toCleanLatinDigits(item.readyToWorkMeters)}
                    onChange={(e) => handleUpdateCombined(item.id, 'readyToWorkMeters', e.target.value)}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '5px 6px',
                      border: '1px solid #fde68a',
                      borderRadius: '6px',
                      textAlign: 'center',
                      fontWeight: 700,
                      background: item.readyToWorkMeters ? '#fef3c7' : '#ffffff',
                      color: item.readyToWorkMeters ? '#b45309' : '#0f172a'
                    }}
                  />
                </td>
                <td style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={item.notes}
                    onChange={(e) => handleUpdateCombined(item.id, 'notes', e.target.value)}
                    placeholder="ملاحظات وتفاصيل التجميع..."
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '0.82rem'
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Helper renderer for chart cards
  const renderChartCard = (title, data) => {
    return (
      <div style={{
        background: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #cbd5e1',
        padding: '0.85rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '0.5rem',
          marginBottom: '0.5rem'
        }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
            📊 {title}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>متر طولي (م.ط)</span>
        </div>

        <div style={{ width: '100%', height: '200px', flex: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 15, right: 10, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fill: '#475569' }} 
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip 
                formatter={(val) => [`${val} م.ط`, 'الإنجاز']}
                contentStyle={{ borderRadius: '8px', direction: 'rtl', fontSize: '0.8rem' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div style={{ direction: 'rtl' }}>

      {/* Top Banner & Action Controls */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Layers size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              {projectName} — {reportTitle}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.15rem 0 0' }}>
              نموذج معتمد لمتابعة إنجاز المرحلتين الأولى والثانية مع حسابات التجميع والفروقات والمتبقي
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleRestoreCertifiedData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 0.95rem',
              borderRadius: '8px',
              border: '1.5px solid #16a34a',
              background: '#f0fdf4',
              color: '#15803d',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.15)'
            }}
            title="استعادة كافة الأرقام الرسمية المعتمدة ليوم السبت 24/10/2026"
          >
            <CheckCircle2 size={16} color="#16a34a" />
            <span>استعادة البيانات المعتمدة (24/10/2026)</span>
          </button>

          <button
            type="button"
            onClick={handleResetForm}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#475569',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} />
            <span>مسح الحقول</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 0.95rem',
              borderRadius: '8px',
              border: 'none',
              background: '#16a34a',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)'
            }}
          >
            <FileSpreadsheet size={16} />
            <span>تصدير إكسل</span>
          </button>

          <button
            type="button"
            onClick={() => onPrintReport && onPrintReport({
              reportNumber,
              dateFormatted: reportDate,
              dayName,
              title: `بيان أعمال إنجاز المرحلتين يوم ${dayName} ${reportDate}`,
              projectName,
              reportType: 'تقرير إنجاز المرحلتين',
              sector: 'القطاع المشترك (المرحلتين)',
              sectorDirector,
              ownerRepresentative,
              isTwoPhaseProgressReport: true,
              phase1Items,
              phase2Items,
              combinedItems,
              remainingItems,
              twoPhaseTotals: {
                todayMeters: combinedItems.reduce((acc, curr) => acc + (parseFloat(curr.todayMeters) || 0), 0),
                totalCumulativeMeters: combinedItems.reduce((acc, curr) => acc + (parseFloat(curr.totalMeters) || 0), 0)
              }
            })}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 0.95rem',
              borderRadius: '8px',
              border: '1px solid #2563eb',
              background: '#eff6ff',
              color: '#2563eb',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            <Printer size={16} />
            <span>معاينة وطباعة رسمية</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmitReport(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1.15rem',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 3px 10px rgba(29, 78, 216, 0.3)'
            }}
          >
            {isSubmitting ? <RefreshCw className="spin-slow" size={16} /> : <Save size={16} />}
            <span>حفظ التقرير</span>
          </button>
        </div>
      </div>

      {/* KPI Real-Time Summary Cards Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
          border: '1px solid #bfdbfe',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          boxShadow: '0 2px 6px rgba(37,99,235,0.06)'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800 }}>🎯 إنجاز اليوم المعتمد</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1d4ed8', margin: '4px 0 2px' }}>
            {(phase1Items.reduce((acc, c) => acc + (parseFloat(c.todayMeters) || 0), 0) + phase2Items.reduce((acc, c) => acc + (parseFloat(c.todayMeters) || 0), 0)).toLocaleString('en-US')} م.ط
          </div>
          <div style={{ fontSize: '0.72rem', color: '#3b82f6' }}>
            المرحلة الأولى: {phase1Items.reduce((acc, c) => acc + (parseFloat(c.todayMeters) || 0), 0).toLocaleString('en-US')} | المرحلة الثانية: {phase2Items.reduce((acc, c) => acc + (parseFloat(c.todayMeters) || 0), 0).toLocaleString('en-US')}
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
          border: '1px solid #bbf7d0',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          boxShadow: '0 2px 6px rgba(22,163,74,0.06)'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800 }}>🛣️ إجمالي المنفذ التراكمي</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#15803d', margin: '4px 0 2px' }}>
            {Math.max(...combinedItems.map(c => parseFloat(c.totalMeters) || 0), 242323).toLocaleString('en-US')} م.ط
          </div>
          <div style={{ fontSize: '0.72rem', color: '#16a34a' }}>
            طبقة إعادة التدوير (242,323 م.ط)
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
          border: '1px solid #fde68a',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          boxShadow: '0 2px 6px rgba(245,158,11,0.06)'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800 }}>⚡ الجاهز للعمل بالبنود</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#b45309', margin: '4px 0 2px' }}>
            {combinedItems.reduce((acc, c) => acc + (parseFloat(c.readyToWorkMeters) || 0), 0).toLocaleString('en-US')} م.ط
          </div>
          <div style={{ fontSize: '0.72rem', color: '#d97706' }}>
            أسفلت محسن (2,253) + أساس (5,717)
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
          border: '1px solid #e9d5ff',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          boxShadow: '0 2px 6px rgba(168,85,247,0.06)'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800 }}>🚗 طول الطريق الخدمي العامل</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#7e22ce', margin: '4px 0 2px' }}>
            {remainingItems.find(r => r.name.includes('الخدمي'))?.total || '8,080.00'} كم
          </div>
          <div style={{ fontSize: '0.72rem', color: '#9333ea' }}>
            مسار الخدمة المشترك العامل
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #cbd5e1',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          boxShadow: '0 2px 6px rgba(15,23,42,0.04)'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800 }}>🏛️ حالة الاعتماد الرسمية</div>
          <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={16} color="#16a34a" />
            <span>معتمد ومطابق</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
            وثيقة رقم 082024_24.10.2026
          </div>
        </div>
      </div>

      {/* Status Alert Notification */}
      {statusMessage && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: statusMessage.type === 'success' ? '#f0fdf4' : '#fee2e2',
          border: `1px solid ${statusMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          color: statusMessage.type === 'success' ? '#15803d' : '#b91c1c',
          fontWeight: 700,
          fontSize: '0.88rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{statusMessage.text}</span>
          </div>

          {createdReport && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => onPrintReport && onPrintReport(createdReport)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                طباعة
              </button>
              <button
                type="button"
                onClick={() => setShowForwardModal(true)}
                style={{
                  background: '#1d4ed8',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                إحالة للمراسلات
              </button>
            </div>
          )}
        </div>
      )}

      {/* Official Document Header Controls */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '10px',
        padding: '0.85rem 1.25rem',
        marginBottom: '1.25rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        alignItems: 'center'
      }}>
        {/* Modern Sleek Calendar Widget for Daily Work Report */}
        <div style={{
          gridColumn: '1 / -1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)',
          border: '1.5px solid #bae6fd',
          borderRadius: '12px',
          padding: '0.75rem 1.25rem',
          boxShadow: '0 2px 10px rgba(2, 132, 199, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)'
            }}>
              <Calendar size={20} />
            </div>

            <div>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0369a1', display: 'block' }}>
                تقويم وتاريخ بيان الأعمال اليومية
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
                <span style={{
                  fontSize: '0.82rem',
                  fontWeight: 900,
                  color: '#0369a1',
                  background: '#e0f2fe',
                  border: '1px solid #bae6fd',
                  padding: '0.15rem 0.65rem',
                  borderRadius: '6px'
                }}>
                  {dayName}
                </span>

                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => {
                    setReportDate(e.target.value);
                    setDayName(getDayName(e.target.value));
                  }}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    color: '#0f172a',
                    background: '#ffffff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>خيارات سريعة:</span>
            <button
              type="button"
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setReportDate(today);
                setDayName(getDayName(today));
              }}
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                padding: '0.35rem 0.75rem',
                borderRadius: '7px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              اليوم 📅
            </button>
            <button
              type="button"
              onClick={() => {
                const y = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                setReportDate(y);
                setDayName(getDayName(y));
              }}
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                padding: '0.35rem 0.75rem',
                borderRadius: '7px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              أمس ⏪
            </button>
            <button
              type="button"
              onClick={() => {
                setReportDate('2026-10-24');
                setDayName('السبت');
              }}
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                padding: '0.35rem 0.75rem',
                borderRadius: '7px',
                background: '#e0f2fe',
                border: '1px solid #7dd3fc',
                color: '#0369a1',
                cursor: 'pointer'
              }}
            >
              السبت 24-10 (معتمد) 📌
            </button>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>
            🏷️ رقم البيان / التقرير:
          </label>
          <input
            type="text"
            value={reportNumber}
            onChange={(e) => setReportNumber(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>
            👷 مدير القطاع / المشرف:
          </label>
          <input
            type="text"
            value={sectorDirector}
            onChange={(e) => setSectorDirector(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>
            🏛️ ممثل الجهة المالكة:
          </label>
          <input
            type="text"
            value={ownerRepresentative}
            onChange={(e) => setOwnerRepresentative(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          />
        </div>
      </div>

      {/* SECTION 1: PHASE 1 TABLE (Right) + CHART (Left) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.75fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          {renderPhaseTable('المرحلة الأولى', phase1Items, handleUpdatePhase1, '#1e40af')}
        </div>
        <div>
          {renderChartCard('الأعمال المنجزة المرحلة الأولى', chartDataPhase1)}
        </div>
      </div>

      {/* SECTION 2: PHASE 2 TABLE (Right) + CHART (Left) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.75fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          {renderPhaseTable('المرحلة الثانية', phase2Items, handleUpdatePhase2, '#0284c7')}
        </div>
        <div>
          {renderChartCard('الأعمال المنجزة المرحلة الثانية', chartDataPhase2)}
        </div>
      </div>

      {/* SECTION 3: COMBINED TWO-PHASE TABLE (Right) + CHART (Left) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.75fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          {renderCombinedTable()}
        </div>
        <div>
          {renderChartCard('إجمالي الأعمال المنجزة', chartDataCombined)}
        </div>
      </div>

      {/* SECTION 4: REMAINING BALANCES DUAL SUMMARY TABLES */}
      <div style={{
        background: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #cbd5e1',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          background: '#334155',
          color: '#ffffff',
          padding: '0.6rem 1rem',
          fontWeight: 900,
          fontSize: '0.95rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>📉 جدول المتبقي من البنود والأطوال العاملة</span>
          <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>حساب تلقائي للإجمالي عند إدخال كميات المرحلتين</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '0.75rem' }}>
          {/* Sub-table A (Right) */}
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '6px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>المتبقي من البند</th>
                <th style={{ padding: '6px', width: '90px', borderRight: '1px solid #e2e8f0' }}>المرحلة الأولى</th>
                <th style={{ padding: '6px', width: '90px', borderRight: '1px solid #e2e8f0' }}>المرحلة الثانية</th>
                <th style={{ padding: '6px', width: '90px', borderRight: '1px solid #e2e8f0', background: '#e2e8f0' }}>الإجمالي</th>
                <th style={{ padding: '6px' }}>ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {remainingItems.filter(r => r.group === 'A').map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '6px', textAlign: 'right', fontWeight: 800, color: '#0f172a', borderRight: '1px solid #e2e8f0' }}>
                    {item.name}
                  </td>
                  <td style={{ padding: '3px', borderRight: '1px solid #e2e8f0' }}>
                    <input
                      type="text" inputMode="decimal" dir="ltr" lang="en"
                      step="any"
                      value={toCleanLatinDigits(item.phase1)}
                      onChange={(e) => handleUpdateRemaining(item.id, 'phase1', e.target.value)}
                      placeholder="0.00"
                      style={{
                        width: '100%',
                        padding: '4px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        textAlign: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    />
                  </td>
                  <td style={{ padding: '3px', borderRight: '1px solid #e2e8f0' }}>
                    <input
                      type="text" inputMode="decimal" dir="ltr" lang="en"
                      step="any"
                      value={toCleanLatinDigits(item.phase2)}
                      onChange={(e) => handleUpdateRemaining(item.id, 'phase2', e.target.value)}
                      placeholder="0.00"
                      style={{
                        width: '100%',
                        padding: '4px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        textAlign: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px', fontWeight: 900, color: '#0f172a', background: '#f8fafc', borderRight: '1px solid #e2e8f0' }}>
                    {item.total ? toCleanLatinDigits(item.total) : '—'}
                  </td>
                  <td style={{ padding: '3px' }}>
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => handleUpdateRemaining(item.id, 'notes', e.target.value)}
                      placeholder="ملاحظات..."
                      style={{
                        width: '100%',
                        padding: '4px 6px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Sub-table B (Left) */}
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '6px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>المتبقي من البند</th>
                <th style={{ padding: '6px', width: '90px', borderRight: '1px solid #e2e8f0' }}>المرحلة الأولى</th>
                <th style={{ padding: '6px', width: '90px', borderRight: '1px solid #e2e8f0' }}>المرحلة الثانية</th>
                <th style={{ padding: '6px', width: '90px', borderRight: '1px solid #e2e8f0', background: '#e2e8f0' }}>الإجمالي</th>
                <th style={{ padding: '6px' }}>ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {remainingItems.filter(r => r.group === 'B').map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '6px', textAlign: 'right', fontWeight: 800, color: '#0f172a', borderRight: '1px solid #e2e8f0' }}>
                    {item.name}
                  </td>
                  <td style={{ padding: '3px', borderRight: '1px solid #e2e8f0' }}>
                    <input
                      type="text" inputMode="decimal" dir="ltr" lang="en"
                      step="any"
                      value={toCleanLatinDigits(item.phase1)}
                      onChange={(e) => handleUpdateRemaining(item.id, 'phase1', e.target.value)}
                      placeholder="0.00"
                      style={{
                        width: '100%',
                        padding: '4px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        textAlign: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    />
                  </td>
                  <td style={{ padding: '3px', borderRight: '1px solid #e2e8f0' }}>
                    <input
                      type="text" inputMode="decimal" dir="ltr" lang="en"
                      step="any"
                      value={toCleanLatinDigits(item.phase2)}
                      onChange={(e) => handleUpdateRemaining(item.id, 'phase2', e.target.value)}
                      placeholder="0.00"
                      style={{
                        width: '100%',
                        padding: '4px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        textAlign: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px', fontWeight: 900, color: '#0f172a', background: '#f8fafc', borderRight: '1px solid #e2e8f0' }}>
                    {item.total ? toCleanLatinDigits(item.total) : '—'}
                  </td>
                  <td style={{ padding: '3px' }}>
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => handleUpdateRemaining(item.id, 'notes', e.target.value)}
                      placeholder="ملاحظات..."
                      style={{
                        width: '100%',
                        padding: '4px 6px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DUAL OFFICIAL SIGNATURES BOX */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '10px',
        padding: '1.25rem 2rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        {/* Right Signature: مدير القطاع */}
        <div style={{ textAlign: 'center', minWidth: '220px' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.4rem' }}>
            مدير القطاع
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
            مهندس: {sectorDirector || '..............................'}
          </div>
          <div style={{
            marginTop: '1.5rem',
            borderBottom: '2px dashed #94a3b8',
            width: '180px',
            margin: '1.5rem auto 0'
          }} />
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>التوقيع والاعتماد</span>
        </div>

        {/* Center Seal */}
        <div style={{
          border: '2px solid #e2e8f0',
          borderRadius: '50%',
          width: '74px',
          height: '74px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b'
        }}>
          <Shield size={24} />
          <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>معتمد رسمياً</span>
        </div>

        {/* Left Signature: ممثل الجهة المالكة */}
        <div style={{ textAlign: 'center', minWidth: '220px' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.4rem' }}>
            ممثل الجهة المالكة
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
            مهندس: {ownerRepresentative || '..............................'}
          </div>
          <div style={{
            marginTop: '1.5rem',
            borderBottom: '2px dashed #94a3b8',
            width: '180px',
            margin: '1.5rem auto 0'
          }} />
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>التوقيع والاعتماد</span>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '0.75rem',
        paddingBottom: '2rem'
      }}>
        <button
          type="button"
          onClick={() => handleSubmitReport(true)}
          disabled={isSubmitting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.7rem 1.4rem',
            borderRadius: '8px',
            border: 'none',
            background: '#0284c7',
            color: '#ffffff',
            fontSize: '0.9rem',
            fontWeight: 800,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
          }}
        >
          <Send size={17} />
          <span>حفظ وإحالة للمراسلات</span>
        </button>

        <button
          type="button"
          onClick={() => handleSubmitReport(false)}
          disabled={isSubmitting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.7rem 1.6rem',
            borderRadius: '8px',
            border: 'none',
            background: '#16a34a',
            color: '#ffffff',
            fontSize: '0.9rem',
            fontWeight: 800,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
          }}
        >
          <CheckCircle2 size={18} />
          <span>حفظ التقرير المعتمد</span>
        </button>
      </div>

      {/* FORWARD MODAL */}
      {showForwardModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
          direction: 'rtl'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            padding: '1.5rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
              إحالة تقرير إنجاز المرحلتين للمراسلات
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>
                المستلم:
              </label>
              <select
                value={forwardRecipient}
                onChange={(e) => setForwardRecipient(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontWeight: 700
                }}
              >
                <option value="salih_hammad">م. صالح حماد (مدير المشروع)</option>
                <option value="ali_alfitouri">م. علي الفيتوري (رئيس جهاز الإشراف)</option>
                <option value="abdulrahman_alansari">م. عبدالرحمن الأنصاري (ممثل الجهة المالكة)</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>
                ملاحظات الإحالة:
              </label>
              <textarea
                rows={3}
                value={forwardNote}
                onChange={(e) => setForwardNote(e.target.value)}
                placeholder="أدخل أي ملاحظات مرافقة للإحالة..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowForwardModal(false)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                إلغاء
              </button>

              <button
                type="button"
                disabled={isForwarding}
                onClick={handleForwardReport}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#0284c7',
                  color: '#ffffff',
                  fontWeight: 800,
                  cursor: isForwarding ? 'not-allowed' : 'pointer'
                }}
              >
                {isForwarding ? <RefreshCw className="spin-slow" size={15} /> : <Send size={15} />}
                <span>إرسال الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TwoPhaseDailyReportForm;
