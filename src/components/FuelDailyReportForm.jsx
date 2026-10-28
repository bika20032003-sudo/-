import React, { useState, useEffect, useMemo } from 'react';
import { 
  Fuel, Printer, Save, RefreshCw, Plus, Trash2, 
  CheckCircle2, AlertCircle, Edit3, Eye, FileSpreadsheet, 
  Calendar, Droplets, MapPin, ShieldCheck, UserCheck
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

// Default initial data matching the approved daily fuel document (Saturday 24/10/2026)
export const initialFuelDailyData = {
  reportTitle: 'تقرير كميات الوقود اليومية',
  reportDate: '2026-10-24',
  formattedSlashDate: '24/10/2026',
  dayName: 'يوم السبت',
  reportNumber: 'FUEL-094834_24.10.2026',
  sector: 'مشروع أوباري - غات',
  fuelOfficer: 'مسؤول الوقود والمحروقات بالموقع',
  headOfSupervision: 'م. عبدالسلام ابريكاو (رئيس جهاز الإشراف)',
  fuelItems: [
    {
      id: 1,
      seq: '1',
      location: '107',
      dispatchedLiters: '570.00',
      receivedLiters: '0.00',
      remainingLiters: '49,829.00',
      notes: ''
    },
    {
      id: 2,
      seq: '2',
      location: '240',
      dispatchedLiters: '17,530.00',
      receivedLiters: '14,631.00',
      remainingLiters: '141,795.00',
      notes: ''
    },
    {
      id: 3,
      seq: '3',
      location: 'الكسارات',
      dispatchedLiters: '4,638.00',
      receivedLiters: '0.00',
      remainingLiters: '19,073.00',
      notes: ''
    }
  ]
};

export const FuelDailyReportForm = ({
  currentUser,
  onSaved,
  onPrintReport,
  onNavigateTab,
  readOnlyMode = false
}) => {
  const [reportData, setReportData] = useState(initialFuelDailyData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const locationPresets = ['107', '240', 'الكسارات', 'خزان المرحلة الأولى', 'خزان المرحلة الثانية', 'محطة الخلط', 'المستودع المركزي'];

  // Helper to parse numbers safely
  const parseNum = (val) => {
    if (!val) return 0;
    const clean = toCleanLatin(String(val)).replace(/,/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  const fmtNum = (num, decimals = 2) => {
    if (num === null || num === undefined || num === '') return '0.00';
    const val = Number(toCleanLatin(num));
    if (isNaN(val)) return num;
    return val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  // Load from backend or localStorage on mount
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setIsLoading(true);
        const res = await fastFetch('http://localhost:5000/api/fuel-daily-report');
        if (res && res.success && res.data && isMounted) {
          setReportData(res.data);
        } else {
          const local = localStorage.getItem('fuel_daily_report_data');
          if (local && isMounted) {
            setReportData(JSON.parse(local));
          }
        }
      } catch (e) {
        console.warn('Could not load fuel daily report from server, using default:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Recalculate totals dynamically
  const calculatedTotals = useMemo(() => {
    let disp = 0;
    let rec = 0;
    let rem = 0;
    (reportData.fuelItems || []).forEach(row => {
      disp += parseNum(row.dispatchedLiters);
      rec += parseNum(row.receivedLiters);
      rem += parseNum(row.remainingLiters);
    });
    return {
      totalDispatched: disp,
      totalReceived: rec,
      totalRemaining: rem,
      itemsCount: (reportData.fuelItems || []).length
    };
  }, [reportData.fuelItems]);

  // Handle row changes
  const handleRowChange = (id, field, value) => {
    setReportData(prev => ({
      ...prev,
      fuelItems: prev.fuelItems.map(row => {
        if (row.id === id) {
          return { ...row, [field]: value };
        }
        return row;
      })
    }));
  };

  // Add new location / tank row
  const handleAddRow = () => {
    const nextId = Date.now() + Math.random();
    const nextSeq = String(reportData.fuelItems.length + 1);
    setReportData(prev => ({
      ...prev,
      fuelItems: [
        ...prev.fuelItems,
        {
          id: nextId,
          seq: nextSeq,
          location: '',
          dispatchedLiters: '0.00',
          receivedLiters: '0.00',
          remainingLiters: '0.00',
          notes: ''
        }
      ]
    }));
  };

  // Remove row
  const handleRemoveRow = (id) => {
    if (reportData.fuelItems.length <= 1) {
      alert('لا يمكن حذف الموقع الأخير بالتقرير');
      return;
    }
    setReportData(prev => ({
      ...prev,
      fuelItems: prev.fuelItems.filter(r => r.id !== id)
    }));
  };

  // Reset to default approved data (24/10/2026)
  const handleResetToApproved = () => {
    if (window.confirm('هل أنت متأكد من استعادة بيانات الوقود المعتمدة ليوم 24/10/2026 من المستند الأصلي؟ ستفقد أي تعديلات غير محفوظة.')) {
      setReportData(initialFuelDailyData);
      localStorage.setItem('fuel_daily_report_data', JSON.stringify(initialFuelDailyData));
      setStatusMessage({ type: 'success', text: 'تمت استعادة بيانات كميات الوقود المعتمدة (24/10/2026) بنجاح.' });
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    try {
      const dataRows = [
        [reportData.reportTitle || 'تقرير كميات الوقود اليومية'],
        [reportData.dayName || 'يوم السبت', reportData.formattedSlashDate || '24/10/2026'],
        [],
        ['ت', 'الموقع', 'الكمية المصروفة (لتر)', 'الوارد (لتر)', 'الكمية المتبقية (لتر)']
      ];

      reportData.fuelItems.forEach((row, idx) => {
        dataRows.push([
          row.seq || idx + 1,
          row.location || '—',
          row.dispatchedLiters ? parseNum(row.dispatchedLiters) : 0,
          row.receivedLiters ? parseNum(row.receivedLiters) : 0,
          row.remainingLiters ? parseNum(row.remainingLiters) : 0
        ]);
      });

      dataRows.push([]);
      dataRows.push([
        'الإجمالي (لتر)',
        '',
        calculatedTotals.totalDispatched,
        calculatedTotals.totalReceived,
        calculatedTotals.totalRemaining
      ]);
      dataRows.push([]);
      dataRows.push([
        `مسؤول الوقود: ${reportData.fuelOfficer}`,
        '',
        '',
        `رئيس جهاز الإشراف: ${reportData.headOfSupervision}`
      ]);

      const ws = XLSX.utils.aoa_to_sheet(dataRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'تقرير كميات الوقود');
      XLSX.writeFile(wb, `تقرير_كميات_الوقود_${reportData.formattedSlashDate.replace(/\//g, '-')}.xlsx`);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
    }
  };

  // Prepare full printable report object
  const getFullPrintableReport = () => ({
    id: 'fuel-daily-' + (reportData.reportDate || '2026-10-24'),
    title: reportData.reportTitle || 'تقرير كميات الوقود اليومية',
    reportType: 'تقرير كميات الوقود اليومية',
    reportCategory: 'fuel',
    isFuelReport: true,
    reportNumber: reportData.reportNumber || 'FUEL-094834_24.10.2026',
    date: reportData.reportDate ? new Date(reportData.reportDate).toISOString() : new Date().toISOString(),
    dayName: reportData.dayName || 'يوم السبت',
    dateFormatted: reportData.formattedSlashDate || '24/10/2026',
    sector: reportData.sector || 'مشروع أوباري - غات',
    fuelAmount: calculatedTotals.totalDispatched,
    totalDispatchedLiters: calculatedTotals.totalDispatched,
    totalReceivedLiters: calculatedTotals.totalReceived,
    totalRemainingLiters: calculatedTotals.totalRemaining,
    uploadedBy: reportData.fuelOfficer || 'مسؤول الوقود بالموقع',
    approvedBy: reportData.headOfSupervision || 'م. عبدالسلام ابريكاو',
    fuelItems: reportData.fuelItems.map((r, idx) => ({
      index: idx + 1,
      seq: r.seq || String(idx + 1),
      location: r.location,
      dispatchedLiters: parseNum(r.dispatchedLiters),
      receivedLiters: parseNum(r.receivedLiters),
      remainingLiters: parseNum(r.remainingLiters)
    })),
    status: 'approved'
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
        totalDispatchedLiters: calculatedTotals.totalDispatched,
        totalReceivedLiters: calculatedTotals.totalReceived,
        totalRemainingLiters: calculatedTotals.totalRemaining,
        updatedAt: new Date().toISOString()
      };

      // 1. Prepare full printable report object
      const printableObj = {
        ...getFullPrintableReport(),
        id: Date.now(),
        fuelAmount: calculatedTotals.totalDispatched,
        totalDispatchedLiters: calculatedTotals.totalDispatched,
        totalReceivedLiters: calculatedTotals.totalReceived,
        totalRemainingLiters: calculatedTotals.totalRemaining,
        notes: `تقرير كميات الوقود اليومية المعتمد - إجمالي المنصرف: ${fmtNum(calculatedTotals.totalDispatched)} لتر - الوارد: ${fmtNum(calculatedTotals.totalReceived)} لتر - المتبقي: ${fmtNum(calculatedTotals.totalRemaining)} لتر`,
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

      // 3. Save into dedicated fuel_daily_report_data
      localStorage.setItem('fuel_daily_report_data', JSON.stringify(payload));

      // 4. Fire-and-forget sync to backend without blocking
      try {
        fetch('http://localhost:5000/api/fuel-daily-report', {
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
        window.dispatchEvent(new CustomEvent('fuel-updated', { detail: printableObj }));
      } catch (e) {}

      setStatusMessage({
        type: 'success',
        text: `تم حفظ واعتماد تقرير كميات الوقود اليومية برقم (${printableObj.reportNumber}) بنجاح، وتحديث الأرشيف وقاعدة البيانات.`
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
                  onClick={() => onNavigateTab('fuel')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.95rem',
                    borderRadius: '8px',
                    background: '#ea580c',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)'
                  }}
                >
                  <Fuel size={15} />
                  <span>الانتقال فوراً لقسم إدارة الوقود ⛽</span>
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
            background: '#fef3c7',
            color: '#b45309',
            padding: '0.45rem 0.85rem',
            borderRadius: '8px',
            fontWeight: 800,
            fontSize: '0.88rem'
          }}>
            <Fuel size={16} />
            <span>إدارة الوقود والمحروقات</span>
          </div>

          {/* Modern Sleek Calendar Widget */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
            border: '1.5px solid #fde68a',
            padding: '0.45rem 0.85rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Calendar size={18} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#b45309' }}>
                تاريخ البيان والتقويم
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  color: '#92400e',
                  background: '#fef3c7',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '6px'
                }}>
                  {reportData.dayName}
                </span>

                <input 
                  type="date"
                  value={reportData.reportDate}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    const dateObj = new Date(newDate);
                    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
                    const dayStr = days[dateObj.getDay()] || 'السبت';
                    const parts = newDate.split('-');
                    const slashStr = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : newDate;
                    setReportData(prev => ({
                      ...prev,
                      reportDate: newDate,
                      formattedSlashDate: slashStr,
                      dayName: `يوم ${dayStr}`
                    }));
                  }}
                  style={{
                    border: '1px solid #cbd5e1',
                    borderRadius: '7px',
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    background: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                />
              </div>
            </div>

            {/* Quick date presets */}
            <div style={{ display: 'flex', gap: '0.25rem', marginRight: '0.25rem' }}>
              <button
                type="button"
                onClick={() => {
                  const d = new Date().toISOString().split('T')[0];
                  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
                  const dayStr = days[new Date().getDay()] || 'السبت';
                  const parts = d.split('-');
                  setReportData(prev => ({
                    ...prev,
                    reportDate: d,
                    formattedSlashDate: `${parts[2]}/${parts[1]}/${parts[0]}`,
                    dayName: `يوم ${dayStr}`
                  }));
                }}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.25rem 0.5rem',
                  borderRadius: '6px',
                  background: '#fff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  cursor: 'pointer'
                }}
                title="تحديد تاريخ اليوم"
              >
                اليوم
              </button>
              <button
                type="button"
                onClick={() => {
                  setReportData(prev => ({
                    ...prev,
                    reportDate: '2026-10-24',
                    formattedSlashDate: '24/10/2026',
                    dayName: 'يوم السبت'
                  }));
                }}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.25rem 0.5rem',
                  borderRadius: '6px',
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  color: '#92400e',
                  cursor: 'pointer'
                }}
                title="تحديد التاريخ المعتمد 24-10-2026"
              >
                24/10
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
            <span>إضافة موقع / خزان</span>
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
              background: '#d97706',
              border: 'none',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(217, 119, 6, 0.25)'
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
              background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
              border: 'none',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '0.88rem',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)',
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
        {/* Card 1: Dispatched */}
        <div style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '1.1rem 1.25rem',
          boxShadow: '0 4px 14px rgba(220, 38, 38, 0.25)'
        }}>
          <div style={{ fontSize: '0.84rem', opacity: 0.9, fontWeight: 700 }}>إجمالي الكمية المصروفة اليوم</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, marginTop: '0.35rem', letterSpacing: '-0.5px' }} dir="ltr">
            {fmtNum(calculatedTotals.totalDispatched)} <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>لتر</span>
          </div>
          <div style={{ fontSize: '0.76rem', opacity: 0.85, marginTop: '0.2rem' }}>استهلاك المعدات والآليات والكسارات</div>
        </div>

        {/* Card 2: Received */}
        <div style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '1.1rem 1.25rem',
          boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)'
        }}>
          <div style={{ fontSize: '0.84rem', opacity: 0.9, fontWeight: 700 }}>إجمالي الوارد اليومي بالخزانات</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, marginTop: '0.35rem', letterSpacing: '-0.5px' }} dir="ltr">
            {fmtNum(calculatedTotals.totalReceived)} <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>لتر</span>
          </div>
          <div style={{ fontSize: '0.76rem', opacity: 0.85, marginTop: '0.2rem' }}>شحنات الوقود الموردة حديثاً</div>
        </div>

        {/* Card 3: Remaining */}
        <div style={{
          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '1.1rem 1.25rem',
          boxShadow: '0 4px 14px rgba(22, 163, 74, 0.25)'
        }}>
          <div style={{ fontSize: '0.84rem', opacity: 0.9, fontWeight: 700 }}>إجمالي الرصيد المتبقي بالخزانات</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, marginTop: '0.35rem', letterSpacing: '-0.5px' }} dir="ltr">
            {fmtNum(calculatedTotals.totalRemaining)} <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>لتر</span>
          </div>
          <div style={{ fontSize: '0.76rem', opacity: 0.85, marginTop: '0.2rem' }}>المخزون الاستراتيجي بالمواقع 107 و 240 والكسارات</div>
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
            <ShieldCheck size={18} color="#d97706" />
            <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#d97706' }}>مطابقة أرصدة الوقود الميدانية</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 700 }}>
            <span>مسؤول الموقع: </span>
            <strong style={{ color: '#0f172a' }}>{reportData.fuelOfficer}</strong>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.2rem' }}>
            <span>الاعتماد: </span>
            <span>{reportData.headOfSupervision}</span>
          </div>
        </div>
      </div>

      {/* Main Official Document Container (Exact Layout from Image 2) */}
      <div style={{
        background: '#ffffff',
        border: '2px solid #000000',
        borderRadius: '8px',
        padding: '2rem 1.75rem',
        boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
        marginBottom: '2rem'
      }}>

        {/* Document Title Header (Matching Image 2 Exactly) */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <h1 style={{
            fontSize: '1.65rem',
            fontWeight: 900,
            color: '#000000',
            margin: '0 0 0.85rem'
          }}>
            {reportData.reportTitle}
          </h1>

          {/* Sub-header: [التاريخ]            [يوم السبت] */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '520px',
            margin: '0 auto',
            fontSize: '1.1rem',
            fontWeight: 900,
            color: '#000000',
            direction: 'ltr',
            borderBottom: '1px dashed #cbd5e1',
            paddingBottom: '0.5rem'
          }}>
            <span style={{ direction: 'ltr', fontWeight: 900 }}>
              {reportData.formattedSlashDate}
            </span>
            <span style={{ direction: 'rtl', fontWeight: 900 }}>
              {reportData.dayName}
            </span>
          </div>
        </div>

        {/* Table Matching Image 2 Exactly with Editable Cells */}
        <div style={{ overflowX: 'auto', maxWidth: '880px', margin: '0 auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'center',
            fontSize: '0.98rem',
            border: '2px solid #000000'
          }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#000000', fontWeight: 900 }}>
                <th style={{ border: '2px solid #000000', padding: '0.75rem 0.5rem', width: '55px' }}>ت</th>
                <th style={{ border: '2px solid #000000', padding: '0.75rem 1rem', width: '25%' }}>الموقع</th>
                <th style={{ border: '2px solid #000000', padding: '0.75rem 1rem', width: '25%' }}>الكمية المصروفة (لتر)</th>
                <th style={{ border: '2px solid #000000', padding: '0.75rem 1rem', width: '23%' }}>الوارد (لتر)</th>
                <th style={{ border: '2px solid #000000', padding: '0.75rem 1rem', width: '25%' }}>الكمية المتبقية (لتر)</th>
                <th style={{ border: '2px solid #000000', padding: '0.75rem 0.35rem', width: '45px' }} className="no-print">حذف</th>
              </tr>
            </thead>
            <tbody>
              {reportData.fuelItems.map((row, idx) => (
                <tr key={row.id} style={{ background: '#ffffff' }}>
                  
                  {/* Sequence */}
                  <td style={{
                    border: '2px solid #000000',
                    padding: '0.65rem 0.25rem',
                    fontWeight: 900,
                    background: '#fffbeb'
                  }}>
                    <input 
                      type="text"
                      value={row.seq || idx + 1}
                      onChange={(e) => handleRowChange(row.id, 'seq', e.target.value)}
                      style={{
                        width: '100%',
                        border: 'none',
                        textAlign: 'center',
                        fontWeight: 900,
                        fontSize: '0.98rem',
                        background: 'transparent',
                        outline: 'none'
                      }}
                    />
                  </td>

                  {/* Location (107 / 240 / الكسارات) */}
                  <td style={{ border: '2px solid #000000', padding: '0.65rem 1rem', fontWeight: 800 }}>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="text"
                        value={row.location}
                        onChange={(e) => handleRowChange(row.id, 'location', e.target.value)}
                        placeholder="الموقع..."
                        list={`fuel-loc-presets-${row.id}`}
                        style={{
                          width: '100%',
                          border: '1px solid transparent',
                          borderRadius: '4px',
                          padding: '0.35rem 0.5rem',
                          textAlign: 'center',
                          fontWeight: 800,
                          fontSize: '0.98rem',
                          color: '#0f172a',
                          background: 'transparent',
                          transition: 'border 0.2s',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.border = '1px solid #d97706'}
                        onBlur={(e) => e.target.style.border = '1px solid transparent'}
                      />
                      <datalist id={`fuel-loc-presets-${row.id}`}>
                        {locationPresets.map((loc, lIdx) => (
                          <option key={lIdx} value={loc} />
                        ))}
                      </datalist>
                    </div>
                  </td>

                  {/* Dispatched Liters */}
                  <td style={{ border: '2px solid #000000', padding: '0.65rem 1rem', fontWeight: 800 }}>
                    <input 
                      type="text"
                      value={row.dispatchedLiters}
                      onChange={(e) => handleRowChange(row.id, 'dispatchedLiters', e.target.value)}
                      placeholder="0.00"
                      style={{
                        width: '100%',
                        border: '1px solid transparent',
                        borderRadius: '4px',
                        padding: '0.35rem 0.5rem',
                        textAlign: 'center',
                        fontWeight: 900,
                        fontSize: '1rem',
                        color: '#0f172a',
                        background: 'transparent',
                        direction: 'ltr',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.border = '1px solid #d97706'}
                      onBlur={(e) => e.target.style.border = '1px solid transparent'}
                    />
                  </td>

                  {/* Received Liters */}
                  <td style={{ border: '2px solid #000000', padding: '0.65rem 1rem', fontWeight: 800 }}>
                    <input 
                      type="text"
                      value={row.receivedLiters}
                      onChange={(e) => handleRowChange(row.id, 'receivedLiters', e.target.value)}
                      placeholder="0.00"
                      style={{
                        width: '100%',
                        border: '1px solid transparent',
                        borderRadius: '4px',
                        padding: '0.35rem 0.5rem',
                        textAlign: 'center',
                        fontWeight: 900,
                        fontSize: '1rem',
                        color: '#0f172a',
                        background: 'transparent',
                        direction: 'ltr',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.border = '1px solid #d97706'}
                      onBlur={(e) => e.target.style.border = '1px solid transparent'}
                    />
                  </td>

                  {/* Remaining Liters */}
                  <td style={{ border: '2px solid #000000', padding: '0.65rem 1rem', fontWeight: 800 }}>
                    <input 
                      type="text"
                      value={row.remainingLiters}
                      onChange={(e) => handleRowChange(row.id, 'remainingLiters', e.target.value)}
                      placeholder="0.00"
                      style={{
                        width: '100%',
                        border: '1px solid transparent',
                        borderRadius: '4px',
                        padding: '0.35rem 0.5rem',
                        textAlign: 'center',
                        fontWeight: 900,
                        fontSize: '1rem',
                        color: '#0f172a',
                        background: 'transparent',
                        direction: 'ltr',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.border = '1px solid #d97706'}
                      onBlur={(e) => e.target.style.border = '1px solid transparent'}
                    />
                  </td>

                  {/* Action */}
                  <td style={{ border: '2px solid #000000', padding: '0.35rem' }} className="no-print">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(row.id)}
                      title="حذف هذا الموقع"
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
              ))}

              {/* Total Row (Bright Yellow Footer matching Photo 2 Exactly) */}
              <tr style={{ background: '#ffff00', color: '#000000', fontWeight: 900, borderTop: '3px solid #000000' }}>
                <td colSpan={2} style={{ border: '2px solid #000000', padding: '0.85rem', fontSize: '1.15rem', textAlign: 'center' }}>
                  الإجمالي (لتر)
                </td>
                <td style={{ border: '2px solid #000000', padding: '0.85rem', fontSize: '1.15rem', fontWeight: 900 }} dir="ltr">
                  {fmtNum(calculatedTotals.totalDispatched)}
                </td>
                <td style={{ border: '2px solid #000000', padding: '0.85rem', fontSize: '1.15rem', fontWeight: 900 }} dir="ltr">
                  {fmtNum(calculatedTotals.totalReceived)}
                </td>
                <td style={{ border: '2px solid #000000', padding: '0.85rem', fontSize: '1.15rem', fontWeight: 900 }} dir="ltr">
                  {fmtNum(calculatedTotals.totalRemaining)}
                </td>
                <td style={{ border: '2px solid #000000', padding: '0.85rem' }} className="no-print"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Dual Signatures Block */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          maxWidth: '880px',
          margin: '2.5rem auto 0.5rem',
          padding: '0 1.5rem'
        }}>
          {/* Right: Fuel Officer */}
          <div style={{ textAlign: 'center', minWidth: '220px' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#000000' }}>
              مسؤول الوقود والمحروقات
            </h3>
            <div style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 800 }}>
              <input 
                type="text"
                value={reportData.fuelOfficer}
                onChange={(e) => setReportData(prev => ({ ...prev, fuelOfficer: e.target.value }))}
                style={{
                  border: 'none',
                  borderBottom: '2px dotted #000000',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  textAlign: 'center',
                  background: 'transparent',
                  padding: '2px 8px',
                  width: '200px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Left: Supervision Head */}
          <div style={{ textAlign: 'center', minWidth: '220px' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#000000' }}>
              المهندس المشرف / جهاز الإشراف
            </h3>
            <div style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 800 }}>
              <input 
                type="text"
                value={reportData.headOfSupervision}
                onChange={(e) => setReportData(prev => ({ ...prev, headOfSupervision: e.target.value }))}
                style={{
                  border: 'none',
                  borderBottom: '2px dotted #000000',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  textAlign: 'center',
                  background: 'transparent',
                  padding: '2px 8px',
                  width: '200px',
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

export default FuelDailyReportForm;
