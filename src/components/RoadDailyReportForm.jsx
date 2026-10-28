import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileSpreadsheet, Printer, Save, RefreshCw, Plus, Trash2, 
  CheckCircle2, AlertCircle, Edit3, Eye, FileText, Send, 
  MapPin, Calendar, Clock, Milestone, Award, UserCheck, ShieldCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { fastFetch, clearApiCache } from '../utils/apiCache.js';
import { OfficialPrintModal } from './OfficialPrintModal';

// Clean text and force standard regular Latin digits (0-9)
const toCleanLatin = (val) => {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/٫/g, '.')
    .replace(/[٬،]/g, '');
};

// Default initial data matching the approved road daily works document (Saturday 24/10/2026)
export const initialRoadDailyData = {
  projectName: 'مشروع صيانة وتطوير طريق أوباري - غات',
  sector: 'طريق أوباري - غات',
  reportTitle: 'تقرير أعمال يوم السبت 24 - 10 - 2026',
  reportDate: '2026-10-24',
  dayName: 'السبت',
  reportNumber: 'ROAD-REP-24.10.2026',
  sectorDirector: 'مروان الهوني',
  ownerRepresentative: '................................',
  items: [
    {
      id: 1,
      itemNumber: '1',
      item: 'أعمال فرم FDR بدون أسمنت',
      stationFrom: '242+200',
      stationTo: '242+500',
      length: '300.00',
      area: '3,300.00',
      notes: '—',
      noteHighlight: false
    },
    {
      id: 2,
      itemNumber: '2',
      item: 'أعمال فرم FDR بالأسمنت',
      stationFrom: '241+200',
      stationTo: '241+540',
      length: '340.00',
      area: '3,196.00',
      notes: 'بطول 1220 متر',
      noteHighlight: false
    },
    {
      id: 3,
      itemNumber: '2',
      item: 'أعمال فرم FDR بالأسمنت',
      stationFrom: '241+620',
      stationTo: '242+500',
      length: '880.00',
      area: '8,272.00',
      notes: 'بطول 1220 متر',
      noteHighlight: false
    },
    {
      id: 4,
      itemNumber: '3',
      item: 'اعمال معالجه FDR بالمياه',
      stationFrom: '241+200',
      stationTo: '242+500',
      length: '1,220.00',
      area: '11,468.00',
      notes: '—',
      noteHighlight: false
    },
    {
      id: 5,
      itemNumber: '4',
      item: 'تسليم طبقة الأساس',
      stationFrom: '236+400',
      stationTo: '236+700',
      length: '300.00',
      area: '2,820.00',
      notes: 'معمل ومساحه',
      noteHighlight: true
    },
    {
      id: 6,
      itemNumber: '5',
      item: 'تشغيل طبقة الأساس',
      stationFrom: '236+700',
      stationTo: '237+900',
      length: '1,200.00',
      area: '10,944.00',
      notes: '—',
      noteHighlight: false
    },
    {
      id: 7,
      itemNumber: '6',
      item: 'أعمال طبقة اسفلت 6 سم',
      stationFrom: '233+280',
      stationTo: '234+420',
      length: '1,140.00',
      area: '10,260.00',
      notes: '—',
      noteHighlight: false
    },
    {
      id: 8,
      itemNumber: '7',
      item: 'أعمال رش مادة بـ MCO على طبقة الأساس',
      stationFrom: '236+240',
      stationTo: '236+700',
      length: '460.00',
      area: '4,195.20',
      notes: '—',
      noteHighlight: false
    },
    {
      id: 9,
      itemNumber: '8',
      item: 'أعمال الطريق الخدمي',
      stationFrom: '231+350',
      stationTo: '250+000',
      length: '18,650.00',
      area: '',
      notes: 'جاري العمل',
      noteHighlight: true
    }
  ]
};

export const RoadDailyReportForm = ({
  currentUser,
  onSaved,
  onPrintReport,
  onNavigateTab,
  readOnlyMode = false
}) => {
  const [reportData, setReportData] = useState(initialRoadDailyData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Quick preset work items
  const standardWorkItems = [
    'أعمال فرم FDR بدون أسمنت',
    'أعمال فرم FDR بالأسمنت',
    'اعمال معالجه FDR بالمياه',
    'تسليم طبقة الأساس',
    'تشغيل طبقة الأساس',
    'أعمال طبقة اسفلت 6 سم',
    'أعمال رش مادة بـ MCO على طبقة الأساس',
    'أعمال الطريق الخدمي',
    'أعمال طبقة أساس حبيبي',
    'رش طبقة لصق RC',
    'أعمال تسوية ودمك التربة'
  ];

  // Helper to parse numbers safely
  const parseNum = (val) => {
    if (!val) return 0;
    const clean = toCleanLatin(String(val)).replace(/,/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  const fmtNum = (num, decimals = 2) => {
    if (num === null || num === undefined || num === '') return '—';
    const val = Number(toCleanLatin(num));
    if (isNaN(val)) return num;
    return val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  // Load from backend on mount
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setIsLoading(true);
        const res = await fastFetch('http://localhost:5000/api/road-daily-report');
        if (res && res.success && res.data && isMounted) {
          setReportData(res.data);
        } else {
          const local = localStorage.getItem('road_daily_report_data');
          if (local && isMounted) {
            setReportData(JSON.parse(local));
          }
        }
      } catch (e) {
        console.warn('Could not load road daily report from server, using default:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Recalculate totals dynamically
  const calculatedTotals = useMemo(() => {
    let totalLen = 0;
    let totalAr = 0;
    (reportData.items || []).forEach(row => {
      totalLen += parseNum(row.length);
      totalAr += parseNum(row.area);
    });
    return {
      totalLength: totalLen,
      totalArea: totalAr,
      itemsCount: (reportData.items || []).length
    };
  }, [reportData.items]);

  // Handle row changes
  const handleRowChange = (id, field, value) => {
    setReportData(prev => ({
      ...prev,
      items: prev.items.map(row => {
        if (row.id === id) {
          const updated = { ...row, [field]: value };
          if (field === 'notes') {
            const valStr = String(value).trim();
            updated.noteHighlight = valStr === 'معمل ومساحه' || valStr === 'جاري العمل';
          }
          return updated;
        }
        return row;
      })
    }));
  };

  // Add new row
  const handleAddRow = () => {
    const nextId = Date.now() + Math.random();
    const nextNum = String(reportData.items.length + 1);
    setReportData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: nextId,
          itemNumber: nextNum,
          item: '',
          stationFrom: '',
          stationTo: '',
          length: '',
          area: '',
          notes: '—',
          noteHighlight: false
        }
      ]
    }));
  };

  // Remove row
  const handleRemoveRow = (id) => {
    if (reportData.items.length <= 1) {
      alert('لا يمكن حذف البند الأخير بالتقرير');
      return;
    }
    setReportData(prev => ({
      ...prev,
      items: prev.items.filter(r => r.id !== id)
    }));
  };

  // Reset to default approved data (24/10/2026)
  const handleResetToApproved = () => {
    if (window.confirm('هل أنت متأكد من استعادة البيانات المعتمدة ليوم السبت 24-10-2026 من المستند الأصلي؟ ستفقد أي تعديلات غير محفوظة.')) {
      setReportData(initialRoadDailyData);
      localStorage.setItem('road_daily_report_data', JSON.stringify(initialRoadDailyData));
      setStatusMessage({ type: 'success', text: 'تمت استعادة البيانات المعتمدة بنجاح من المستند الأصلي (24/10/2026).' });
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    try {
      const dataRows = [
        [reportData.reportTitle || `تقرير أعمال يوم ${reportData.dayName} ${reportData.reportDate}`],
        [`المشروع: ${reportData.projectName}`, `القطاع: ${reportData.sector}`, `رقم التقرير: ${reportData.reportNumber}`],
        [],
        ['م', 'البند', 'من', 'الى', 'طول (م.ط)', 'م٢', 'ملاحظات']
      ];

      reportData.items.forEach((row, idx) => {
        dataRows.push([
          row.itemNumber || idx + 1,
          row.item || '—',
          row.stationFrom || '—',
          row.stationTo || '—',
          row.length ? parseNum(row.length) : '—',
          row.area ? parseNum(row.area) : '—',
          row.notes || '—'
        ]);
      });

      dataRows.push([]);
      dataRows.push([
        'الإجمالي العام للأعمال المنفذة',
        '',
        '',
        '',
        calculatedTotals.totalLength,
        calculatedTotals.totalArea,
        `${reportData.items.length} بنود منجزة`
      ]);
      dataRows.push([]);
      dataRows.push([
        `مدير القطاع / مهندس: ${reportData.sectorDirector}`,
        '',
        '',
        `ممثل الجهة المالكة / مهندس: ${reportData.ownerRepresentative}`
      ]);

      const ws = XLSX.utils.aoa_to_sheet(dataRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'تقرير أعمال الطريق');
      XLSX.writeFile(wb, `تقرير_أعمال_الطريق_${reportData.reportDate || '2026-10-24'}.xlsx`);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
    }
  };

  // Prepare full printable report object
  const getFullPrintableReport = () => ({
    id: 'road-daily-' + (reportData.reportDate || '2026-10-24'),
    title: reportData.reportTitle || `تقرير أعمال يوم ${reportData.dayName} ${reportData.reportDate}`,
    reportType: 'تقرير أعمال الطريق اليومي',
    reportCategory: 'road',
    reportNumber: reportData.reportNumber || 'ROAD-REP-24.10.2026',
    date: reportData.reportDate ? new Date(reportData.reportDate).toISOString() : new Date().toISOString(),
    dayName: reportData.dayName || 'السبت',
    dateFormatted: reportData.reportDate,
    sector: reportData.sector || 'طريق أوباري - غات',
    companyName: 'طريق أوباري - غات',
    sectorDirector: reportData.sectorDirector || 'مروان الهوني',
    ownerRepresentative: reportData.ownerRepresentative || '................................',
    totalLength: calculatedTotals.totalLength,
    totalArea: calculatedTotals.totalArea,
    items: reportData.items.map((it, idx) => ({
      index: idx + 1,
      itemNumber: it.itemNumber || String(idx + 1),
      item: it.item,
      stationFrom: it.stationFrom,
      stationTo: it.stationTo,
      length: parseNum(it.length),
      area: it.area ? parseNum(it.area) : '',
      notes: it.notes,
      noteHighlight: it.noteHighlight
    })),
    status: 'approved',
    uploadedBy: reportData.sectorDirector || 'مروان الهوني',
    approvedBy: reportData.ownerRepresentative || 'ممثل الجهة المالكة'
  });

  const handleTriggerPrint = () => {
    const rep = getFullPrintableReport();
    if (onPrintReport) {
      onPrintReport(rep);
    } else {
      setShowPrintModal(true);
    }
  };

  // Save report
  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const payload = {
        ...reportData,
        totalLength: calculatedTotals.totalLength,
        totalArea: calculatedTotals.totalArea,
        updatedAt: new Date().toISOString()
      };

      // 1. Prepare full printable report object
      const printableObj = {
        ...getFullPrintableReport(),
        id: Date.now(),
        roadMeters: calculatedTotals.totalLength,
        salesAmount: calculatedTotals.totalLength,
        totalLength: calculatedTotals.totalLength,
        totalArea: calculatedTotals.totalArea,
        notes: `تقرير أعمال الطريق اليومي المعتمد ليوم ${reportData.dayName} ${reportData.reportDate} - إجمالي الأطوال: ${fmtNum(calculatedTotals.totalLength)} م.ط - إجمالي المساحة: ${fmtNum(calculatedTotals.totalArea)} م²`,
        createdAt: new Date().toISOString()
      };

      // 2. Save directly into localStorage under local_reports
      try {
        const local = JSON.parse(localStorage.getItem('local_reports') || '[]');
        const filtered = local.filter(r => r.reportNumber !== printableObj.reportNumber);
        filtered.unshift(printableObj);
        localStorage.setItem('local_reports', JSON.stringify(filtered));
      } catch (storageErr) {
        console.error('Error saving to local_reports:', storageErr);
      }

      // 3. Save into dedicated road_daily_report_data
      localStorage.setItem('road_daily_report_data', JSON.stringify(payload));

      // 4. Fire-and-forget sync to backend without blocking
      try {
        fetch('http://localhost:5000/api/road-daily-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});

        fetch('http://localhost:5000/api/reports/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(printableObj)
        }).catch(() => {});
      } catch (e) {}

      // 5. Invalidate caches and dispatch reactive events
      clearApiCache();
      try {
        window.dispatchEvent(new CustomEvent('report-saved', { detail: printableObj }));
        window.dispatchEvent(new CustomEvent('road-progress-updated', { detail: printableObj }));
      } catch (e) {}

      setStatusMessage({
        type: 'success',
        text: `تم حفظ واعتماد تقرير أعمال الطريق اليومي برقم (${printableObj.reportNumber}) بنجاح، وتحديث الأرشيف وقاعدة البيانات.`
      });

      if (onSaved) onSaved(printableObj);
    } catch (e) {
      setStatusMessage({
        type: 'error',
        text: 'حدث خطأ أثناء حفظ التقرير: ' + (e.message || 'خطأ اتصال')
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', direction: 'rtl', fontFamily: 'inherit' }}>
      
      {/* Status Alert Banner with Direct Action Buttons */}
      {statusMessage && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          background: statusMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: statusMessage.type === 'success' ? '1px solid #bbf7d0' : '1px solid #fecaca',
          color: statusMessage.type === 'success' ? '#166534' : '#991b1b',
          fontSize: '0.92rem',
          fontWeight: 800,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {statusMessage.type === 'success' ? <CheckCircle2 size={22} color="#22c55e" /> : <AlertCircle size={22} color="#ef4444" />}
            <span>{statusMessage.text}</span>
          </div>

          {statusMessage.type === 'success' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('road-progress')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.95rem',
                    borderRadius: '8px',
                    background: '#16a34a',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
                  }}
                >
                  <Milestone size={15} />
                  <span>الانتقال فوراً لقسم مسار الطريق 🛣️</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleTriggerPrint}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.95rem',
                  borderRadius: '8px',
                  background: '#2563eb',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
                }}
              >
                <Printer size={15} />
                <span>طباعة النموذج المعتمد 🖨️</span>
              </button>

              <button
                type="button"
                onClick={handleExportExcel}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.95rem',
                  borderRadius: '8px',
                  background: '#047857',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                <FileSpreadsheet size={15} />
                <span>تصدير إكسل 📊</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Control Actions Bar */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Left: Metadata info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: '#e0f2fe',
            color: '#0369a1',
            padding: '0.45rem 0.85rem',
            borderRadius: '8px',
            fontWeight: 800,
            fontSize: '0.88rem'
          }}>
            <Milestone size={16} />
            <span>{reportData.projectName}</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: '#ffffff',
            border: '1.5px solid #0284c7',
            padding: '0.35rem 0.85rem',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.12)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0284c7', fontWeight: 800, fontSize: '0.85rem' }}>
              <Calendar size={17} />
              <span>يوم {reportData.dayName}:</span>
            </div>
            <input 
              type="date"
              value={reportData.reportDate}
              onChange={(e) => {
                const newDate = e.target.value;
                const dateObj = new Date(newDate);
                const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
                const dayStr = days[dateObj.getDay()] || 'السبت';
                setReportData(prev => ({
                  ...prev,
                  reportDate: newDate,
                  dayName: dayStr,
                  reportTitle: `تقرير أعمال يوم ${dayStr} ${newDate.split('-').reverse().join(' - ')}`
                }));
              }}
              style={{
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '0.3rem 0.6rem',
                fontSize: '0.85rem',
                fontWeight: 800,
                color: '#0f172a',
                background: '#f8fafc',
                cursor: 'pointer',
                outline: 'none'
              }}
            />
            {/* Quick date presets */}
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <button
                type="button"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
                  const dayStr = days[new Date(today).getDay()] || 'اليوم';
                  setReportData(prev => ({
                    ...prev,
                    reportDate: today,
                    dayName: dayStr,
                    reportTitle: `تقرير أعمال يوم ${dayStr} ${today.split('-').reverse().join(' - ')}`
                  }));
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
                اليوم
              </button>
              <button
                type="button"
                onClick={() => {
                  setReportData(prev => ({
                    ...prev,
                    reportDate: '2026-10-24',
                    dayName: 'السبت',
                    reportTitle: 'تقرير أعمال يوم السبت 24 - 10 - 2026'
                  }));
                }}
                style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '5px',
                  background: reportData.reportDate === '2026-10-24' ? '#0284c7' : '#e0f2fe',
                  border: '1px solid #bae6fd',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: reportData.reportDate === '2026-10-24' ? '#fff' : '#0369a1',
                  cursor: 'pointer'
                }}
              >
                السبت 24-10 (معتمد) 📌
              </button>
            </div>
          </div>

          <div style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 700 }}>
            <span>المرجع: </span>
            <strong dir="ltr" style={{ color: '#0f172a' }}>{reportData.reportNumber}</strong>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleAddRow}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.55rem 0.95rem',
              borderRadius: '8px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontWeight: 800,
              fontSize: '0.84rem',
              cursor: 'pointer'
            }}
          >
            <Plus size={15} />
            <span>إضافة بند عمل</span>
          </button>

          <button
            type="button"
            onClick={handleResetToApproved}
            title="استعادة البيانات الأصلية المعتمدة ليوم 24/10/2026"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.55rem 0.95rem',
              borderRadius: '8px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              fontWeight: 800,
              fontSize: '0.84rem',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} />
            <span>استعادة البيانات المعتمدة (24/10/2026)</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.55rem 0.95rem',
              borderRadius: '8px',
              background: '#10b981',
              border: 'none',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
            }}
          >
            <FileSpreadsheet size={15} />
            <span>تصدير Excel</span>
          </button>

          <button
            type="button"
            onClick={handleTriggerPrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.55rem 0.95rem',
              borderRadius: '8px',
              background: '#0284c7',
              border: 'none',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)'
            }}
          >
            <Printer size={15} />
            <span>طباعة التقرير الرسمي</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.25rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
              border: 'none',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '0.88rem',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              opacity: isSaving ? 0.7 : 1
            }}
          >
            <Save size={16} />
            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التقرير والاعتماد'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        {/* Card 1: Total Length */}
        <div style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '1.1rem 1.25rem',
          boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)'
        }}>
          <div style={{ fontSize: '0.84rem', opacity: 0.9, fontWeight: 700 }}>إجمالي الأطوال المنجزة اليوم</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, marginTop: '0.35rem', letterSpacing: '-0.5px' }} dir="ltr">
            {fmtNum(calculatedTotals.totalLength)} <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>م.ط</span>
          </div>
          <div style={{ fontSize: '0.76rem', opacity: 0.85, marginTop: '0.2rem' }}>طريق أوباري - غات (مسار 360 كم)</div>
        </div>

        {/* Card 2: Total Area */}
        <div style={{
          background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '1.1rem 1.25rem',
          boxShadow: '0 4px 14px rgba(202, 138, 4, 0.25)'
        }}>
          <div style={{ fontSize: '0.84rem', opacity: 0.95, fontWeight: 700 }}>إجمالي المساحة المنفذة اليوم</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, marginTop: '0.35rem', letterSpacing: '-0.5px' }} dir="ltr">
            {fmtNum(calculatedTotals.totalArea)} <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>م²</span>
          </div>
          <div style={{ fontSize: '0.76rem', opacity: 0.85, marginTop: '0.2rem' }}>مسطحات الفرم، الأساس، والأسفلت</div>
        </div>

        {/* Card 3: Items Count */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '1.1rem 1.25rem',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.2)'
        }}>
          <div style={{ fontSize: '0.84rem', opacity: 0.9, fontWeight: 700 }}>عدد البنود التشغيلية الميدانية</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, marginTop: '0.35rem' }} dir="ltr">
            {calculatedTotals.itemsCount} <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>بنود</span>
          </div>
          <div style={{ fontSize: '0.76rem', opacity: 0.85, marginTop: '0.2rem' }}>تتضمن FDR، الأساس، والأسفلت والخدمي</div>
        </div>

        {/* Card 4: Signatures Summary */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #cbd5e1',
          borderRadius: '12px',
          padding: '1.1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <ShieldCheck size={18} color="#16a34a" />
            <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#16a34a' }}>الاعتماد الميداني المباشر</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 700 }}>
            <span>مدير القطاع: </span>
            <strong style={{ color: '#0f172a' }}>{reportData.sectorDirector}</strong>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.2rem' }}>
            <span>ممثل المالك: </span>
            <span>{reportData.ownerRepresentative}</span>
          </div>
        </div>
      </div>

      {/* Main Official Document Container (Exact Layout from Image 1) */}
      <div style={{
        background: '#ffffff',
        border: '2px solid #000000',
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
        marginBottom: '2rem'
      }}>

        {/* Cyan Banner Title Header (Exact match to Photo 1) */}
        <div style={{
          background: '#38bdf8',
          border: '2.5px solid #000000',
          borderRadius: '4px',
          padding: '0.85rem 1.25rem',
          textAlign: 'center',
          marginBottom: '1.25rem'
        }}>
          <input 
            type="text"
            value={reportData.reportTitle}
            onChange={(e) => setReportData(prev => ({ ...prev, reportTitle: e.target.value }))}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              textAlign: 'center',
              fontSize: '1.45rem',
              fontWeight: 900,
              color: '#000000',
              fontFamily: 'inherit',
              outline: 'none',
              cursor: 'text'
            }}
            title="انقر لتعديل عنوان التقرير"
          />
        </div>

        {/* Table Matching Image 1 Exactly with Editable Cells */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'center',
            fontSize: '0.92rem',
            border: '2px solid #000000'
          }}>
            <thead>
              <tr style={{ background: '#facc15', color: '#000000', fontWeight: 900 }}>
                <th style={{ border: '2px solid #000000', padding: '0.65rem 0.4rem', width: '45px' }}>م</th>
                <th style={{ border: '2px solid #000000', padding: '0.65rem 0.75rem', width: '27%', textAlign: 'right' }}>البند</th>
                <th style={{ border: '2px solid #000000', padding: '0.65rem 0.5rem', width: '13%' }}>من</th>
                <th style={{ border: '2px solid #000000', padding: '0.65rem 0.5rem', width: '13%' }}>الى</th>
                <th style={{ border: '2px solid #000000', padding: '0.65rem 0.5rem', width: '13%' }}>طول</th>
                <th style={{ border: '2px solid #000000', padding: '0.65rem 0.5rem', width: '13%' }}>م٢</th>
                <th style={{ border: '2px solid #000000', padding: '0.65rem 0.75rem', width: '15%' }}>ملاحظات</th>
                <th style={{ border: '2px solid #000000', padding: '0.65rem 0.25rem', width: '40px' }} className="no-print">حذف</th>
              </tr>
            </thead>
            <tbody>
              {reportData.items.map((row, idx) => {
                const isNoteYellow = row.noteHighlight || row.notes === 'معمل ومساحه' || row.notes === 'جاري العمل';

                return (
                  <tr key={row.id} style={{ background: '#ffffff' }}>
                    
                    {/* Seq */}
                    <td style={{
                      border: '2px solid #000000',
                      padding: '0.5rem 0.25rem',
                      fontWeight: 900,
                      background: '#fffbeb'
                    }}>
                      <input 
                        type="text"
                        value={row.itemNumber || idx + 1}
                        onChange={(e) => handleRowChange(row.id, 'itemNumber', e.target.value)}
                        style={{
                          width: '100%',
                          border: 'none',
                          textAlign: 'center',
                          fontWeight: 900,
                          fontSize: '0.92rem',
                          background: 'transparent',
                          outline: 'none'
                        }}
                      />
                    </td>

                    {/* Item Description */}
                    <td style={{ border: '2px solid #000000', padding: '0.4rem 0.65rem', textAlign: 'right' }}>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type="text"
                          value={row.item}
                          onChange={(e) => handleRowChange(row.id, 'item', e.target.value)}
                          placeholder="اسم البند..."
                          list={`road-items-preset-${row.id}`}
                          style={{
                            width: '100%',
                            border: '1px solid transparent',
                            borderRadius: '4px',
                            padding: '0.35rem 0.45rem',
                            fontWeight: 800,
                            fontSize: '0.92rem',
                            color: '#0f172a',
                            background: 'transparent',
                            transition: 'border 0.2s',
                            boxSizing: 'border-box'
                          }}
                          onFocus={(e) => e.target.style.border = '1px solid #0284c7'}
                          onBlur={(e) => e.target.style.border = '1px solid transparent'}
                        />
                        <datalist id={`road-items-preset-${row.id}`}>
                          {standardWorkItems.map((preset, pIdx) => (
                            <option key={pIdx} value={preset} />
                          ))}
                        </datalist>
                      </div>
                    </td>

                    {/* Station From */}
                    <td style={{ border: '2px solid #000000', padding: '0.4rem 0.5rem' }}>
                      <input 
                        type="text"
                        value={row.stationFrom}
                        onChange={(e) => handleRowChange(row.id, 'stationFrom', e.target.value)}
                        placeholder="242+200"
                        style={{
                          width: '100%',
                          border: '1px solid transparent',
                          borderRadius: '4px',
                          padding: '0.35rem 0.25rem',
                          textAlign: 'center',
                          fontWeight: 800,
                          fontSize: '0.92rem',
                          background: 'transparent',
                          direction: 'ltr',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.border = '1px solid #0284c7'}
                        onBlur={(e) => e.target.style.border = '1px solid transparent'}
                      />
                    </td>

                    {/* Station To */}
                    <td style={{ border: '2px solid #000000', padding: '0.4rem 0.5rem' }}>
                      <input 
                        type="text"
                        value={row.stationTo}
                        onChange={(e) => handleRowChange(row.id, 'stationTo', e.target.value)}
                        placeholder="242+500"
                        style={{
                          width: '100%',
                          border: '1px solid transparent',
                          borderRadius: '4px',
                          padding: '0.35rem 0.25rem',
                          textAlign: 'center',
                          fontWeight: 800,
                          fontSize: '0.92rem',
                          background: 'transparent',
                          direction: 'ltr',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.border = '1px solid #0284c7'}
                        onBlur={(e) => e.target.style.border = '1px solid transparent'}
                      />
                    </td>

                    {/* Length (m) */}
                    <td style={{ border: '2px solid #000000', padding: '0.4rem 0.5rem' }}>
                      <input 
                        type="text"
                        value={row.length}
                        onChange={(e) => handleRowChange(row.id, 'length', e.target.value)}
                        placeholder="300.00"
                        style={{
                          width: '100%',
                          border: '1px solid transparent',
                          borderRadius: '4px',
                          padding: '0.35rem 0.25rem',
                          textAlign: 'center',
                          fontWeight: 900,
                          fontSize: '0.95rem',
                          color: '#0f172a',
                          background: 'transparent',
                          direction: 'ltr',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.border = '1px solid #0284c7'}
                        onBlur={(e) => e.target.style.border = '1px solid transparent'}
                      />
                    </td>

                    {/* Area (m2) */}
                    <td style={{ border: '2px solid #000000', padding: '0.4rem 0.5rem' }}>
                      <input 
                        type="text"
                        value={row.area}
                        onChange={(e) => handleRowChange(row.id, 'area', e.target.value)}
                        placeholder="3,300.00"
                        style={{
                          width: '100%',
                          border: '1px solid transparent',
                          borderRadius: '4px',
                          padding: '0.35rem 0.25rem',
                          textAlign: 'center',
                          fontWeight: 900,
                          fontSize: '0.95rem',
                          color: '#0f172a',
                          background: 'transparent',
                          direction: 'ltr',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.border = '1px solid #0284c7'}
                        onBlur={(e) => e.target.style.border = '1px solid transparent'}
                      />
                    </td>

                    {/* Notes (with yellow background highlight matching image 1) */}
                    <td style={{
                      border: '2px solid #000000',
                      padding: '0.4rem 0.5rem',
                      background: isNoteYellow ? '#facc15' : '#ffffff',
                      fontWeight: isNoteYellow ? 900 : 700
                    }}>
                      <input 
                        type="text"
                        value={row.notes}
                        onChange={(e) => handleRowChange(row.id, 'notes', e.target.value)}
                        placeholder="ملاحظات..."
                        style={{
                          width: '100%',
                          border: '1px solid transparent',
                          borderRadius: '4px',
                          padding: '0.35rem 0.25rem',
                          textAlign: 'center',
                          fontWeight: isNoteYellow ? 900 : 700,
                          fontSize: '0.88rem',
                          color: '#000000',
                          background: 'transparent',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.border = '1px solid #0284c7'}
                        onBlur={(e) => e.target.style.border = '1px solid transparent'}
                      />
                    </td>

                    {/* Action */}
                    <td style={{ border: '2px solid #000000', padding: '0.35rem' }} className="no-print">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.id)}
                        title="حذف هذا البند"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>

                  </tr>
                );
              })}

              {/* Totals Row (Matching Image 1 Style) */}
              <tr style={{ background: '#fef08a', color: '#000000', fontWeight: 900, borderTop: '3px solid #000000' }}>
                <td colSpan={4} style={{ border: '2px solid #000000', padding: '0.75rem', fontSize: '1rem', textAlign: 'center' }}>
                  الإجمالي العام للأعمال المنفذة
                </td>
                <td style={{ border: '2px solid #000000', padding: '0.75rem', fontSize: '1.05rem', fontWeight: 900 }} dir="ltr">
                  {fmtNum(calculatedTotals.totalLength)}
                </td>
                <td style={{ border: '2px solid #000000', padding: '0.75rem', fontSize: '1.05rem', fontWeight: 900 }} dir="ltr">
                  {fmtNum(calculatedTotals.totalArea)}
                </td>
                <td style={{ border: '2px solid #000000', padding: '0.75rem', fontSize: '0.88rem' }}>
                  {calculatedTotals.itemsCount} بنود منجزة
                </td>
                <td style={{ border: '2px solid #000000', padding: '0.75rem' }} className="no-print"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Dual Signatures Block (Matching Image 1 Exactly) */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: '2rem 3rem 0.5rem',
          marginTop: '1.5rem'
        }}>
          {/* Right: Sector Director (مدير القطاع مهندس: مروان الهوني) */}
          <div style={{ textAlign: 'center', minWidth: '240px' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#000000' }}>
              مدير القطاع
            </h3>
            <div style={{ marginTop: '0.85rem', fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
              <span>مهندس:</span>
              <input 
                type="text"
                value={reportData.sectorDirector}
                onChange={(e) => setReportData(prev => ({ ...prev, sectorDirector: e.target.value }))}
                style={{
                  border: 'none',
                  borderBottom: '2px dotted #000000',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  textAlign: 'center',
                  background: 'transparent',
                  padding: '2px 8px',
                  width: '160px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Left: Owner Representative (ممثل الجهة المالكة مهندس: .........) */}
          <div style={{ textAlign: 'center', minWidth: '240px' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#000000' }}>
              ممثل الجهة المالكة
            </h3>
            <div style={{ marginTop: '0.85rem', fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
              <span>مهندس:</span>
              <input 
                type="text"
                value={reportData.ownerRepresentative}
                onChange={(e) => setReportData(prev => ({ ...prev, ownerRepresentative: e.target.value }))}
                style={{
                  border: 'none',
                  borderBottom: '2px dotted #000000',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  textAlign: 'center',
                  background: 'transparent',
                  padding: '2px 8px',
                  width: '160px',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Official Print Modal Portal */}
      {showPrintModal && (
        <OfficialPrintModal 
          isOpen={true}
          onClose={() => setShowPrintModal(false)}
          report={getFullPrintableReport()}
        />
      )}

    </div>
  );
};

export default RoadDailyReportForm;
