import React, { useState } from 'react';
import { 
  Fuel, X, Plus, Trash2, Printer, Send, CheckCircle2, 
  FileSpreadsheet, AlertCircle, RefreshCw, Layers, Calendar
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { fastFetch } from '../utils/apiCache.js';

export const CreateFuelReportModal = ({ isOpen, onClose, currentUser, onReportCreated, onPrintReport, onNavigateTab }) => {
  if (!isOpen) return null;

  const getDayName = (dateStr) => {
    if (!dateStr) return 'السبت';
    const date = new Date(dateStr);
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()] || 'السبت';
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Form State
  const [reportDate, setReportDate] = useState(todayStr);
  const [dayName, setDayName] = useState(getDayName(todayStr));
  const [sector, setSector] = useState(currentUser?.sector || 'المرحلة الأولى');
  const [reportNumber, setReportNumber] = useState(`FUEL-REP-${Date.now().toString().slice(-4)}`);

  // Table items - loaded with official approved data from document 24/10/2026
  const [fuelItems, setFuelItems] = useState([
    { id: 1, location: '107', dispatchedLiters: '570.00', receivedLiters: '0.00', remainingLiters: '49,829.00' },
    { id: 2, location: '240', dispatchedLiters: '17,530.00', receivedLiters: '14,631.00', remainingLiters: '141,795.00' },
    { id: 3, location: 'الكسارات', dispatchedLiters: '4,638.00', receivedLiters: '0.00', remainingLiters: '19,073.00' }
  ]);

  const locationPresets = ['107', '240', 'الكسارات', 'خزان المرحلة الأولى', 'خزان المرحلة الثانية', 'محطة الخلط', 'المستودع المركزي'];

  // Status & modal states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [createdReport, setCreatedReport] = useState(null);

  // Forwarding modal state
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

  const handleRowChange = (id, field, value) => {
    setFuelItems(prev => prev.map(row => {
      if (row.id === id) {
        return { ...row, [field]: value };
      }
      return row;
    }));
  };

  const handleAddItem = () => {
    setFuelItems(prev => [
      ...prev,
      { id: Date.now() + Math.random(), location: '', dispatchedLiters: '', receivedLiters: '', remainingLiters: '' }
    ]);
  };

  const handleRemoveItem = (id) => {
    if (fuelItems.length <= 1) {
      setFuelItems([{ id: Date.now(), location: '', dispatchedLiters: '', receivedLiters: '', remainingLiters: '' }]);
      return;
    }
    setFuelItems(prev => prev.filter(r => r.id !== id));
  };

  // Calculations
  const totalDispatched = fuelItems.reduce((sum, r) => sum + (parseFloat(r.dispatchedLiters) || 0), 0);
  const totalReceived = fuelItems.reduce((sum, r) => sum + (parseFloat(r.receivedLiters) || 0), 0);
  const totalRemaining = fuelItems.reduce((sum, r) => sum + (parseFloat(r.remainingLiters) || 0), 0);

  // Date formatted: 24/10/2026
  const dateParts = reportDate.split('-');
  const formattedSlashDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : reportDate;

  // Reset form
  const resetForm = () => {
    setReportNumber(`FUEL-REP-${Date.now().toString().slice(-4)}`);
    setFuelItems([
      { id: 1, location: '107', dispatchedLiters: '570.00', receivedLiters: '0.00', remainingLiters: '49,829.00' },
      { id: 2, location: '240', dispatchedLiters: '17,530.00', receivedLiters: '14,631.00', remainingLiters: '141,795.00' },
      { id: 3, location: 'الكسارات', dispatchedLiters: '4,638.00', receivedLiters: '0.00', remainingLiters: '19,073.00' }
    ]);
    setCreatedReport(null);
    setStatusMessage(null);
  };

  // Export to Excel
  const handleExportExcel = () => {
    try {
      const dataRows = [
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
        totalDispatched,
        totalReceived,
        totalRemaining
      ]);

      const ws = XLSX.utils.aoa_to_sheet(dataRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'تقرير الوقود اليومي');
      XLSX.writeFile(wb, `تقرير_كميات_الوقود_${formattedSlashDate.replace(/\//g, '-')}.xlsx`);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
    }
  };

  // Save Report
  const handleSaveReport = async (sendAfter = false) => {
    const validRows = fuelItems.filter(r => r.location.trim() || r.dispatchedLiters || r.receivedLiters || r.remainingLiters);
    if (validRows.length === 0) {
      if (!window.confirm('الجدول لا يحتوي على أي مواقع مدخلة. هل ترغب في حفظ التقرير فارغاً؟')) {
        return;
      }
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const payload = {
      reportNumber: reportNumber.trim() || `FUEL-REP-${Date.now().toString().slice(-4)}`,
      date: new Date(reportDate).toISOString(),
      dateFormatted: formattedSlashDate,
      dayName: dayName,
      title: 'تقرير كميات الوقود اليومية',
      reportType: 'تقرير كميات الوقود اليومية',
      isFuelReport: true,
      sector: sector,
      fuelAmount: totalDispatched,
      totalReceivedLiters: totalReceived,
      totalRemainingLiters: totalRemaining,
      totalDispatchedLiters: totalDispatched,
      uploadedBy: currentUser?.name || 'مسؤول الوقود والمحروقات',
      status: 'approved',
      approvedBy: 'م. عبدالرحمن الأنصاري (مدير المشروع)',
      fuelItems: validRows.map((r, idx) => ({
        index: idx + 1,
        location: r.location.trim(),
        dispatchedLiters: parseFloat(r.dispatchedLiters) || 0,
        receivedLiters: parseFloat(r.receivedLiters) || 0,
        remainingLiters: parseFloat(r.remainingLiters) || 0
      })),
      notes: `تقرير كميات الوقود اليومية ليوم ${dayName} ${formattedSlashDate} - إجمالي المنصرف: ${totalDispatched.toLocaleString()} لتر - الوارد: ${totalReceived.toLocaleString()} لتر - المتبقي: ${totalRemaining.toLocaleString()} لتر`
    };

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

      // Persist in localStorage
      try {
        const local = JSON.parse(localStorage.getItem('local_reports') || '[]');
        local.unshift(saved);
        localStorage.setItem('local_reports', JSON.stringify(local));
      } catch (e) {
        console.error(e);
      }

      setCreatedReport(saved);
      setStatusMessage({ type: 'success', text: `تم حفظ تقرير كميات الوقود اليومية برقم (${saved.reportNumber}) بنجاح!` });

      if (onReportCreated) onReportCreated(saved);

      if (sendAfter) {
        setShowForwardModal(true);
      }
    } catch (error) {
      console.error('Error saving fuel report:', error);
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
      fromUsername: currentUser?.username || 'fuel_officer',
      fromName: currentUser?.name || 'مسؤول الوقود والمحروقات',
      fromRole: currentUser?.title || currentUser?.role || 'إدارة الوقود',
      toUsername: targetUser.username,
      toName: targetUser.name,
      toRole: targetUser.role,
      type: 'إحالة تقرير يومي',
      subject: `إحالة تقرير كميات الوقود اليومية - ${dayName} ${formattedSlashDate}`,
      content: forwardNote.trim() || `نحيل إليكم تقرير كميات الوقود اليومية (المصروف: ${totalDispatched.toLocaleString()} لتر - الوارد: ${totalReceived.toLocaleString()} لتر - المتبقي: ${totalRemaining.toLocaleString()} لتر) للإحاطة والمتابعة.`,
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
        text: `تم إرسال تقرير الوقود رسمياً عبر البريد والمراسلات إلى (${targetUser.name}) بنجاح!` 
      });

      setTimeout(() => {
        if (onNavigateTab) onNavigateTab('messages');
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to forward message:', err);
      alert('تم حفظ التقرير.');
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
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
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
        maxWidth: '920px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        border: '1px solid #cbd5e1',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Fuel size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>
                إنشاء تقرير كميات الوقود اليومية
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                توثيق المنصرف والوارد والمتبقي بحسب المواقع والخزانات الرسمية
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

          {/* Date & Meta Controls */}
          <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            border: '1px solid #e2e8f0',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                تاريخ التقرير
              </label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => handleDateChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              />
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
                  color: '#2563eb',
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
                رقم التقرير
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
              THE OFFICIAL FUEL REPORT DOCUMENT FORM (MATCHING THE ATTACHED PHOTO)
             ========================================================================= */}
          <div style={{
            background: '#ffffff',
            borderRadius: '8px',
            border: '2px solid #000000',
            padding: '1.5rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
          }}>
            {/* Title Centered */}
            <h1 style={{
              textAlign: 'center',
              fontSize: '1.6rem',
              fontWeight: 900,
              color: '#000000',
              margin: '0 0 1rem'
            }}>
              تقرير كميات الوقود اليومية
            </h1>

            {/* Subhead: يوم [اليوم]     [التاريخ] */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              maxWidth: '380px',
              margin: '0 auto 0.75rem',
              fontSize: '1.05rem',
              fontWeight: 900,
              color: '#000000',
              direction: 'ltr'
            }}>
              <span>{formattedSlashDate}</span>
              <span style={{ direction: 'rtl' }}>يوم {dayName}</span>
            </div>

            {/* Official Table */}
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'center',
              fontSize: '0.95rem',
              border: '2px solid #000000'
            }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#000000', fontWeight: 900 }}>
                  <th style={{ border: '2px solid #000000', padding: '0.65rem 0.5rem', width: '45px' }}>ت</th>
                  <th style={{ border: '2px solid #000000', padding: '0.65rem 1rem', width: '22%' }}>الموقع</th>
                  <th style={{ border: '2px solid #000000', padding: '0.65rem 1rem', width: '23%' }}>الكمية المصروفة (لتر)</th>
                  <th style={{ border: '2px solid #000000', padding: '0.65rem 1rem', width: '22%' }}>الوارد (لتر)</th>
                  <th style={{ border: '2px solid #000000', padding: '0.65rem 1rem', width: '23%' }}>الكمية المتبقية (لتر)</th>
                  <th style={{ border: '2px solid #000000', padding: '0.65rem 0.3rem', width: '45px' }} className="no-print">حذف</th>
                </tr>
              </thead>
              <tbody>
                {fuelItems.map((row, index) => (
                  <tr key={row.id}>
                    {/* Index */}
                    <td style={{ border: '2px solid #000000', padding: '0.55rem', fontWeight: 900 }}>
                      {index + 1}
                    </td>

                    {/* Location */}
                    <td style={{ border: '2px solid #000000', padding: '0.35rem' }}>
                      <input
                        type="text"
                        list={`fuel-loc-${row.id}`}
                        placeholder="الموقع (مثل: 107 / 240 / الكسارات)..."
                        value={row.location}
                        onChange={(e) => handleRowChange(row.id, 'location', e.target.value)}
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

                    {/* Dispatched */}
                    <td style={{ border: '2px solid #000000', padding: '0.35rem' }}>
                      <input
                        type="text" inputMode="decimal" dir="ltr" lang="en"
                        step="any"
                        placeholder="0.00"
                        value={toCleanLatinDigits(row.dispatchedLiters)}
                        onChange={(e) => handleRowChange(row.id, 'dispatchedLiters', e.target.value)}
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

                    {/* Received */}
                    <td style={{ border: '2px solid #000000', padding: '0.35rem' }}>
                      <input
                        type="text" inputMode="decimal" dir="ltr" lang="en"
                        step="any"
                        placeholder="0.00"
                        value={toCleanLatinDigits(row.receivedLiters)}
                        onChange={(e) => handleRowChange(row.id, 'receivedLiters', e.target.value)}
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

                    {/* Remaining */}
                    <td style={{ border: '2px solid #000000', padding: '0.35rem' }}>
                      <input
                        type="text" inputMode="decimal" dir="ltr" lang="en"
                        step="any"
                        placeholder="0.00"
                        value={toCleanLatinDigits(row.remainingLiters)}
                        onChange={(e) => handleRowChange(row.id, 'remainingLiters', e.target.value)}
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

                    {/* Delete Action */}
                    <td style={{ border: '2px solid #000000', padding: '0.35rem' }} className="no-print">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(row.id)}
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

                {/* THE YELLOW TOTALS ROW (EXACTLY AS IN PHOTO) */}
                <tr style={{ background: '#ffff00', color: '#000000', fontWeight: 900 }}>
                  <td colSpan={2} style={{ border: '2px solid #000000', padding: '0.65rem', fontSize: '1.05rem', textAlign: 'center' }}>
                    الإجمالي (لتر)
                  </td>
                  <td style={{ border: '2px solid #000000', padding: '0.65rem', fontSize: '1.05rem' }}>
                    {totalDispatched ? totalDispatched.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                  </td>
                  <td style={{ border: '2px solid #000000', padding: '0.65rem', fontSize: '1.05rem' }}>
                    {totalReceived ? totalReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                  </td>
                  <td style={{ border: '2px solid #000000', padding: '0.65rem', fontSize: '1.05rem' }}>
                    {totalRemaining ? totalRemaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                  </td>
                  <td style={{ border: '2px solid #000000', padding: '0.65rem' }} className="no-print"></td>
                </tr>
              </tbody>
            </table>

            {/* Add row button */}
            <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-start' }} className="no-print">
              <button
                type="button"
                onClick={handleAddItem}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  background: '#f59e0b',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} />
                <span>+ إضافة موقع / خزان جديد</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSaveReport(false)}
              style={{
                flex: 1,
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                background: '#1e293b',
                border: 'none',
                color: '#fff',
                fontSize: '0.92rem',
                fontWeight: 800,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <CheckCircle2 size={16} />
              <span>{isSubmitting ? 'جاري الحفظ...' : 'حفظ تقرير الوقود في الأرشيف'}</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSaveReport(true)}
              style={{
                flex: 1.2,
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                background: '#f59e0b',
                border: 'none',
                color: '#fff',
                fontSize: '0.92rem',
                fontWeight: 800,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)'
              }}
            >
              <Send size={16} />
              <span>{isSubmitting ? 'جاري المعالجة...' : 'حفظ وإرسال بالبريد إلى المسؤول'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const tempRep = {
                  title: 'تقرير كميات الوقود اليومية',
                  reportType: 'تقرير كميات الوقود اليومية',
                  isFuelReport: true,
                  dayName,
                  dateFormatted: formattedSlashDate,
                  date: reportDate,
                  sector,
                  reportNumber,
                  totalDispatchedLiters: totalDispatched,
                  totalReceivedLiters: totalReceived,
                  totalRemainingLiters: totalRemaining,
                  fuelItems: fuelItems.filter(r => r.location || r.dispatchedLiters || r.receivedLiters || r.remainingLiters)
                };
                if (onPrintReport) onPrintReport(tempRep);
              }}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                background: '#ffffff',
                border: '1.5px solid #2563eb',
                color: '#2563eb',
                fontSize: '0.92rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Printer size={16} />
              <span>طباعة التقرير (Print / PDF)</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: '#16a34a',
                border: 'none',
                color: '#fff',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <FileSpreadsheet size={16} />
              <span>إكسل</span>
            </button>

            <button
              type="button"
              onClick={resetForm}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#475569',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              تفريغ
            </button>
          </div>
        </div>
      </div>

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
          zIndex: 100000,
          direction: 'rtl',
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            maxWidth: '540px',
            width: '100%',
            padding: '1.75rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                  <Send size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>إحالة تقرير الوقود عبر المراسلات</h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>إرسال التقرير رقم ({createdReport?.reportNumber}) إلى حساب المسؤول</p>
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
                  نص المراسلة المرافقة:
                </label>
                <textarea
                  rows={3}
                  value={forwardNote}
                  onChange={(e) => setForwardNote(e.target.value)}
                  placeholder="نحيل إليكم تقرير كميات الوقود اليومية للإحاطة والمتابعة..."
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
                    background: '#f59e0b',
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

export default CreateFuelReportModal;
