import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Printer, X, CheckCircle2, Clock, AlertTriangle, ShieldCheck, FileText, Calendar, Building2, User, Layers, Fuel, Factory, Truck, Download, FileSpreadsheet, Layout, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import * as XLSX from 'xlsx';

// Vector SVG Bar Chart for Two-Phase Print Layout (100% Crisp print fidelity)
const TwoPhasePrintChart = ({ title, items }) => {
  const validItems = (items || []).filter(Boolean);
  const maxVal = Math.max(...validItems.map(i => parseFloat(i.totalMeters) || parseFloat(i.todayMeters) || 0), 100);
  return (
    <div style={{
      border: '1.5px solid #000000',
      background: '#ffffff',
      padding: '4px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxSizing: 'border-box'
    }}>
      <div style={{
        fontSize: '0.78rem',
        fontWeight: 900,
        textAlign: 'center',
        borderBottom: '1px solid #cbd5e1',
        paddingBottom: '3px',
        marginBottom: '2px',
        color: '#0f172a'
      }}>
        {title}
      </div>
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        gap: '4px',
        minHeight: '120px',
        padding: '0 4px 6px 4px',
        borderBottom: '1.5px solid #000000'
      }}>
        {validItems.map((it, idx) => {
          if (!it) return null;
          const val = parseFloat(it.totalMeters) || parseFloat(it.todayMeters) || 0;
          const heightPercent = maxVal > 0 ? Math.min(100, Math.max(val > 0 ? 8 : 2, (val / maxVal) * 95)) : 2;
          return (
            <div key={idx} style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              justifyContent: 'flex-end'
            }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 800, marginBottom: '2px', color: '#000000' }}>
                {val > 0 ? (val >= 1000 ? `${(val/1000).toFixed(1)}k` : val) : ''}
              </span>
              <div style={{
                width: '75%',
                height: `${heightPercent}%`,
                background: it.color || '#2563eb',
                border: '1px solid #000000',
                borderRadius: '2px 2px 0 0'
              }} />
              <span style={{
                fontSize: '0.55rem',
                fontWeight: 800,
                color: '#000000',
                marginTop: '3px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '48px'
              }}>
                {it.shortName || it.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const OfficialPrintModal = ({ report, onClose }) => {
  if (!report) return null;

  const isSectorA = (report.sector || '').includes('الأولى') || (report.sector || '').includes('A') || (report.sector || '').includes('أ') || (report.crusherName || '').includes('A') || (report.crusherName || '').includes('الأولى');
  const sectorTitle = isSectorA ? 'المرحلة الأولى' : 'المرحلة الثانية';
  const companyTitle = report.companyName && !report.companyName.includes('شركة') ? report.companyName : sectorTitle;
  const totalLengthKm = isSectorA ? '115.36 كم' : '110.92 كم';

  // Controlled Signatures (مدير القطاع وممثل الجهة المالكة)
  const [customSectorDirector, setCustomSectorDirector] = useState(
    report.sectorDirector || report.uploadedBy || (typeof window !== 'undefined' && localStorage.getItem('system_default_sector_director')) || 'م. صلاح العربي'
  );
  const [customOwnerRep, setCustomOwnerRep] = useState(
    report.ownerRepresentative || report.approvedBy || (typeof window !== 'undefined' && localStorage.getItem('system_default_owner_representative')) || 'م. عبدالرحمن الأنصاري'
  );

  useEffect(() => {
    if (report) {
      setCustomSectorDirector(report.sectorDirector || report.uploadedBy || (typeof window !== 'undefined' && localStorage.getItem('system_default_sector_director')) || 'م. صلاح العربي');
      setCustomOwnerRep(report.ownerRepresentative || report.approvedBy || (typeof window !== 'undefined' && localStorage.getItem('system_default_owner_representative')) || 'م. عبدالرحمن الأنصاري');
    }
  }, [report]);

  const handleSectorDirectorChange = (val) => {
    setCustomSectorDirector(val);
    if (typeof window !== 'undefined') localStorage.setItem('system_default_sector_director', val);
  };

  const handleOwnerRepChange = (val) => {
    setCustomOwnerRep(val);
    if (typeof window !== 'undefined') localStorage.setItem('system_default_owner_representative', val);
  };

  // Force clean Latin numerals (0-9)
  const fmtNum = (val, minF = 2, maxF = 2) => {
    if (val === null || val === undefined || val === '') return '—';
    const cleanStr = String(val)
      .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
      .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
      .replace(/٫/g, '.')
      .replace(/[٬،]/g, '');
    const n = Number(cleanStr);
    if (isNaN(n)) return val;
    return n.toLocaleString('en-US', { minimumFractionDigits: minF, maximumFractionDigits: maxF });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    try {
      let dataRows = [];

      if (report.isExecutiveProgressReport || report.reportType === 'الموقف التنفيذي' || report.reportCategory === 'executive' || (Array.isArray(report.basicItems) && report.basicItems.length > 0)) {
        const contractVal = report.contractValue || report.calculations?.contractVal || 897665675.03;
        dataRows = [
          [report.projectName || 'مشروع صيانة طريق اوباري غات بطول 360 كيلومتر'],
          [report.reportTitle || 'الموقف التنفيذي.'],
          [`قيمة العقد: ${Number(contractVal).toLocaleString('en-US', { minimumFractionDigits: 3 })} دينار`, '', '', '', '', `التاريخ / ${report.reportDate || '24/10/2026'}`],
          [],
          ['البند', 'الوصف', 'الوحدة', 'كمية العقد', 'المنفذ', 'المتبقي', 'قيمة المنفذ (د.ل)', 'النسبة %']
        ];

        (report.basicItems || []).forEach((item, idx) => {
          const prev = idx > 0 ? report.basicItems[idx - 1] : null;
          if (!prev || prev.section !== item.section) {
            dataRows.push(['', item.section || '', '', '', '', '', '', '']);
          }
          dataRows.push([
            item.itemNumber || idx + 1,
            item.description,
            item.unit,
            item.contractQuantity !== '' && item.contractQuantity !== null ? Number(item.contractQuantity) : '',
            item.executedQuantity !== '' && item.executedQuantity !== null ? Number(item.executedQuantity) : '',
            item.remainingQuantity !== '' && item.remainingQuantity !== null ? Number(item.remainingQuantity) : '',
            item.executedValue !== '' && item.executedValue !== null ? Number(item.executedValue) : '',
            item.percentage !== '' && item.percentage !== null ? `${Number(item.percentage)}%` : ''
          ]);
        });

        const basicSum = (report.basicItems || []).reduce((acc, it) => acc + (Number(it.executedValue) || 0), 0);
        const basicPct = contractVal > 0 ? ((basicSum / contractVal) * 100).toFixed(2) : 0;
        dataRows.push([]);
        dataRows.push(['', 'إجمالي البنود الأساسية', '', '', '', '', basicSum, `${basicPct}%`]);

        dataRows.push([]);
        dataRows.push(['', 'بنود إضافية', '', '', '', '', '', '']);
        (report.additionalItems || []).forEach((item, idx) => {
          dataRows.push([
            item.itemNumber || idx + 1,
            item.description,
            item.unit,
            '',
            item.executedQuantity !== '' && item.executedQuantity !== null ? Number(item.executedQuantity) : '',
            '',
            item.executedValue !== '' && item.executedValue !== null ? Number(item.executedValue) : '',
            ''
          ]);
        });

        const addSum = (report.additionalItems || []).reduce((acc, it) => acc + (Number(it.executedValue) || 0), 0);
        dataRows.push(['', 'إجمالي البنود الإضافية', '', '', '', '', addSum, '']);

        const grandSum = basicSum + addSum;
        const grandRem = Math.max(0, contractVal - grandSum);
        const grandPct = contractVal > 0 ? ((grandSum / contractVal) * 100).toFixed(2) : 0;

        dataRows.push([]);
        dataRows.push(['الإجمالي العام للموقف التنفيذي:']);
        dataRows.push([`قيمة العقد: ${Number(contractVal).toLocaleString('en-US', { minimumFractionDigits: 3 })} د.ل`, `إجمالي المنفذ الفعلي: ${Number(grandSum).toLocaleString('en-US', { minimumFractionDigits: 2 })} د.ل`, `المتبقي المالي: ${Number(grandRem).toLocaleString('en-US', { minimumFractionDigits: 2 })} د.ل`, `نسبة الإنجاز: ${grandPct}%`]);

        dataRows.push([]);
        dataRows.push(['إعداد ومراجعة: جهاز الإشراف الميداني', '', 'رئيس جهاز الإشراف: م. عبدالسلام ابريكاو', '', 'مدير المشروع: م. عبدالرحمن الأنصاري']);
      } else if (report.isTargetedWorksReport || report.reportType === 'تقرير الأعمال المستهدفة' || (Array.isArray(report.targetedSections) && report.targetedSections.length > 0)) {
        dataRows = [
          [report.title || `بيان أعمال يوم ${report.dayName || ''} ${report.dateFormatted || reportDateStr}`],
          [`القطاع: ${sectorTitle}`, `رقم البيان: ${reportNumber}`],
          []
        ];

        (report.targetedSections || []).forEach(sec => {
          dataRows.push([sec.title, '', '', '', '', sec.startTimeNote]);
          dataRows.push(['م', 'البند', 'من', 'الى', 'طول', 'ملاحظات']);
          (sec.workItems || []).forEach((w, idx) => {
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
          (sec.equipmentItems || []).forEach((eq, idx) => {
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

        dataRows.push(['الإجمالي العام للأطوال المستهدفة (م.ط):', Number(report.totalTargetLength || 0)]);
        dataRows.push(['إجمالي المعدات والأطقم المستهدفة:', Number(report.totalTargetEquipment || 0)]);
        dataRows.push([]);
        dataRows.push(['مدير القطاع:', customSectorDirector || '', '', 'ممثل الجهة المالكة:', customOwnerRep || '']);
      } else if (report.isFuelReport || report.reportType === 'تقرير كميات الوقود اليومية' || (Array.isArray(report.fuelItems) && report.fuelItems.length > 0)) {
        dataRows = [
          ['تقرير كميات الوقود اليومية'],
          [`يوم ${report.dayName || 'السبت'}`, report.dateFormatted || reportDateStr],
          [],
          ['ت', 'الموقع', 'الكمية المصروفة (لتر)', 'الوارد (لتر)', 'الكمية المتبقية (لتر)']
        ];

        (report.fuelItems || []).forEach((row, idx) => {
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
          Number(report.totalDispatchedLiters || report.fuelAmount || 0),
          Number(report.totalReceivedLiters || 0),
          Number(report.totalRemainingLiters || 0)
        ]);
      } else if (Boolean(report.isTwoPhaseProgressReport || report.reportType === 'تقرير إنجاز المرحلتين' || report.reportCategory === 'two_phase' || (Array.isArray(report.phase1Items) && report.phase1Items.length > 0))) {
        dataRows = [
          ['مشروع صيانة طريق أوباري غات - تقرير الأعمال المنجزة للمرحلتين'],
          [`التاريخ: ${report.dateFormatted || reportDateStr}`, `اليوم: ${report.dayName || 'السبت'}`, `رقم التقرير: ${reportNumber}`],
          [],
          ['المرحلة الأولى - بنود أساسية وإضافية:'],
          ['م', 'الوصف', 'إنجاز اليوم (م.ط)', 'الإجمالي (م.ط)', 'المستهدف اليومي', 'الزيادة / النقصان', 'ملاحظات']
        ];
        (report.phase1Items || []).forEach((i, idx) => {
          dataRows.push([idx + 1, i.name, i.todayMeters || 0, i.totalMeters || 0, i.dailyTarget || 0, i.varianceMeters || 0, i.notes || '']);
        });
        dataRows.push([]);
        dataRows.push(['المرحلة الثانية - بنود أساسية وإضافية:']);
        dataRows.push(['م', 'الوصف', 'إنجاز اليوم (م.ط)', 'الإجمالي (م.ط)', 'المستهدف اليومي', 'الزيادة / النقصان', 'ملاحظات']);
        (report.phase2Items || []).forEach((i, idx) => {
          dataRows.push([idx + 1, i.name, i.todayMeters || 0, i.totalMeters || 0, i.dailyTarget || 0, i.varianceMeters || 0, i.notes || '']);
        });
        dataRows.push([]);
        dataRows.push(['إجمالي المنجز للمرحلتين (تجميع آلي):']);
        dataRows.push(['م', 'الوصف', 'إنجاز اليوم (م.ط)', 'الإجمالي (م.ط)', 'الجاهز للعمل في البند', 'ملاحظات']);
        (report.combinedItems || []).forEach((i, idx) => {
          dataRows.push([idx + 1, i.name, i.todayMeters || 0, i.totalMeters || 0, i.readyToWorkMeters || i.readyToWork || 0, i.notes || '']);
        });
        dataRows.push([]);
        dataRows.push(['المتبقي من البنود والأطوال:']);
        dataRows.push(['المتبقي من البند', 'المرحلة الأولى', 'المرحلة الثانية', 'الإجمالي', 'ملاحظات']);
        (report.remainingItems || []).forEach(r => {
          dataRows.push([r.name, r.phase1 || 0, r.phase2 || 0, r.total || 0, r.notes || '']);
        });
        dataRows.push([]);
        dataRows.push(['مدير القطاع:', customSectorDirector || '', '', 'ممثل الجهة المالكة:', customOwnerRep || '']);
      } else if (Array.isArray(report.items) && report.items.length > 0) {
        dataRows = [
          [report.title || `تقرير أعمال يوم ${report.dayName || ''} ${reportDateStr}`],
          [`القطاع: ${sectorTitle}`, `رقم التقرير: ${reportNumber}`],
          [],
          ['م', 'البند', 'من', 'الى', 'طول (م)', 'م٢', 'ملاحظات']
        ];

        report.items.forEach((row, idx) => {
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
        dataRows.push(['الإجمالي العام للأعمال', '', '', '', report.totalLength || report.roadMeters || 0, report.totalArea || 0, '']);
        dataRows.push([]);
        dataRows.push([`مدير القطاع: ${customSectorDirector || '................'}`, '', '', `ممثل الجهة المالكة: ${customOwnerRep || '................'}`]);
      } else {
        dataRows = [
          ['مكتب جهاز الإشراف والمتابعة - مشروع صيانة وتطوير طريق أوباري - غات (360 كم)'],
          ['التقرير الفني والتشغيلي اليومي المعتمد'],
          ['رقم التقرير', reportNumber, 'التاريخ', reportDateStr],
          ['المرحلة التنفيذية', sectorTitle, 'الشركة المنفذة', companyTitle],
          ['المعد / المشرف', report.uploadedBy || (isSectorA ? 'مدير المرحلة الأولى' : 'مدير المرحلة الثانية'), 'حالة الاعتماد', report.status === 'approved' ? 'معتمد رسمياً' : 'قيد المراجعة'],
          [],
          ['م', 'البند التشغيلي / الفني', 'الموقع / الآلية المحددة', 'الكمية المنجزة اليوم', 'الوحدة', 'الملاحظات'],
          [1, 'إنتاج وتشغيل الكسارة', report.crusherName || (isSectorA ? 'كسارة المرحلة الأولى' : 'كسارة المرحلة الثانية'), Number(report.productionAmount || 0), 'طن', 'ركام طبقة أساس / شرشور'],
          [2, 'أعمال الرصف المنفذة اليوم', `مسار ${sectorTitle}`, Number(report.roadMeters || report.salesAmount || 0), 'م.ط', 'تنفيذ طبقات الطريق'],
          [3, 'الوقود المستهلك (ديزل)', 'خزان المرحلة والآليات', Number(report.fuelAmount || 0), 'لتر', 'تزويد المعدات والكسارة'],
          [4, 'الآليات العاملة بالمرحلة', 'المعدات الميدانية', Number(report.workingEquipmentCount || (isSectorA ? 12 : 14)), 'آلية عاملة', 'جاهزية تشغيلية مستقرة'],
          [5, 'الآليات المتوقفة / الصيانة', 'ورشة الصيانة', Number(report.stoppedEquipmentCount || 2), 'آلية متوقفة', 'صيانة دورية'],
          [],
          ['بيان الأعمال والملاحظات الفنية:', report.notes || 'تمت الأعمال وفقاً للمواصفات القياسية المعتمدة من جهاز الإشراف'],
          [],
          ['التوقيعات والاعتمادات الرسمية:'],
          ['مدير المرحلة الميداني:', report.uploadedBy || (isSectorA ? 'مدير المرحلة الأولى' : 'مدير المرحلة الثانية')],
          ['مدير إدارة القطاعات:', report.approvedBy || 'مدير عام القطاعات'],
          ['مدير المشروع (جهاز الإشراف):', 'المهندس عبدالرحمن الأنصاري']
        ];
      }

      const ws = XLSX.utils.aoa_to_sheet(dataRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'تقرير رسمي معتمد');
      XLSX.writeFile(wb, `تقرير_رسمي_${reportNumber.replace(/[^a-zA-Z0-9-]/g, '_')}.xlsx`);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
    }
  };

  const reportNumber = report.reportNumber || `#REP-${report.id || '2026'}`;
  const isExecutiveDoc = Boolean(
    report.isExecutiveProgressReport || 
    report.reportType === 'الموقف التنفيذي' || 
    report.reportCategory === 'executive' || 
    (Array.isArray(report.basicItems) && report.basicItems.length > 0)
  );
  const isFuelDoc = !isExecutiveDoc && Boolean(report.isFuelReport || report.reportType === 'تقرير كميات الوقود اليومية' || (Array.isArray(report.fuelItems) && report.fuelItems.length > 0));
  const isTargetedWorksDoc = !isExecutiveDoc && Boolean(report.isTargetedWorksReport || report.reportType === 'تقرير الأعمال المستهدفة' || (Array.isArray(report.targetedSections) && report.targetedSections.length > 0));
  const isTwoPhaseDoc = !isExecutiveDoc && Boolean(
    report.isTwoPhaseProgressReport || 
    report.reportType === 'تقرير إنجاز المرحلتين' || 
    report.reportCategory === 'two_phase' ||
    (Array.isArray(report.phase1Items) && report.phase1Items.length > 0)
  );
  const isRoadDoc = Boolean(
    !isExecutiveDoc &&
    !isTargetedWorksDoc && 
    !isFuelDoc && 
    !isTwoPhaseDoc && 
    (
      (Array.isArray(report.items) && report.items.length > 0) ||
      report.reportType === 'تقرير أعمال يومي' ||
      report.reportType === 'تقرير أعمال الطريق اليومي' ||
      (report.title && report.title.includes('بيان أعمال'))
    )
  );
  const isStandardNewForm = isTargetedWorksDoc || isFuelDoc || isTwoPhaseDoc || isRoadDoc || isExecutiveDoc;
  
  // Default orientation: Portrait for executive progress report (matching the official 2-page document), landscape for two-phase report
  // Default orientation: Landscape (أفقي) for all engineering reports to fit all tables and columns without clipping
  const [printOrientation, setPrintOrientation] = useState('landscape');

  // Dynamically update document.head @page rule so Chromium/Edge instantly detects orientation
  useEffect(() => {
    if (typeof document === 'undefined') return;
    let styleEl = document.getElementById('print-orientation-head-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'print-orientation-head-style';
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `
      @page {
        size: ${printOrientation === 'portrait' ? 'A4 portrait' : 'A4 landscape'};
        margin: ${printOrientation === 'portrait' ? '6mm 8mm' : '4mm 5mm'};
      }
    `;
  }, [printOrientation]);
  const [zoomLevel, setZoomLevel] = useState(isTwoPhaseDoc ? 85 : 100);

  const reportDateStr = report.date ? new Date(report.date).toLocaleDateString('ar-LY', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : new Date().toLocaleDateString('ar-LY');

  const printTimeStr = new Date().toLocaleDateString('ar-LY', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const modalContent = (
    <div 
      className="official-print-modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.82)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden'
      }}
    >
      {/* Dynamic Print Rules for Page Size and Exact Form Colors */}
      <style>{`
        @page {
          size: ${printOrientation === 'portrait' ? 'A4 portrait' : 'A4 landscape'};
          margin: ${printOrientation === 'portrait' ? '6mm 8mm' : '4mm 5mm'};
        }

        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            box-sizing: border-box !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .signatures-block {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          body > *:not(.official-print-modal-overlay),
          .no-print,
          .print-controls-bar {
            display: none !important;
          }
          body, html {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          .official-print-modal-overlay {
            position: static !important;
            width: 100% !important;
            height: auto !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            display: block !important;
          }
          .print-sheet-wrapper {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            overflow: visible !important;
            display: block !important;
          }
          .official-print-document,
          .official-print-document.landscape-mode {
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            min-height: 0 !important;
            height: auto !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: none !important;
            display: block !important;
            box-sizing: border-box !important;
            zoom: 1 !important;
            transform: none !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          .official-print-document table {
            width: 100% !important;
            max-width: 100% !important;
            table-layout: auto !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            box-sizing: border-box !important;
          }
          .official-print-document th,
          .official-print-document td {
            word-break: break-word !important;
            overflow-wrap: break-word !important;
          }
        }
      `}</style>

      {/* Top Action Bar (Hidden on Print) */}
      <div className="print-controls-bar no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FileText size={22} color="#2563eb" />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
              معاينة التقرير الميداني الرسمي لجهاز الإشراف
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              {reportNumber} - {isExecutiveDoc ? 'الموقف التنفيذي (360 كم)' : `${sectorTitle} (${companyTitle})`}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Orientation Toggle (Portrait vs Landscape) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#e2e8f0',
            borderRadius: '8px',
            padding: '3px',
            gap: '3px'
          }}>
            <button
              type="button"
              onClick={() => setPrintOrientation('portrait')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '0.45rem 0.8rem',
                borderRadius: '6px',
                border: 'none',
                background: printOrientation === 'portrait' ? '#2563eb' : 'transparent',
                color: printOrientation === 'portrait' ? '#ffffff' : '#334155',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="عرض وطباعة رأسية (مطابقة لملف وثيقة الموقف التنفيذي الأصلية)"
            >
              <span>📄 رأسي (Portrait)</span>
            </button>
            <button
              type="button"
              onClick={() => setPrintOrientation('landscape')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '0.45rem 0.8rem',
                borderRadius: '6px',
                border: 'none',
                background: printOrientation === 'landscape' ? '#2563eb' : 'transparent',
                color: printOrientation === 'landscape' ? '#ffffff' : '#334155',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="عرض وطباعة أفقية عريضة"
            >
              <span>🖥️ أفقي (Landscape)</span>
            </button>
          </div>

          
          {/* Zoom Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#e2e8f0',
            borderRadius: '8px',
            padding: '3px',
            gap: '3px'
          }}>
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.max(50, prev - 10))}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.45rem 0.6rem',
                borderRadius: '6px',
                border: 'none',
                background: '#ffffff',
                color: '#1e293b',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
              title="تصغير العرض"
            >
              <ZoomOut size={16} />
            </button>
            <span style={{ padding: '0 6px', fontSize: '0.82rem', fontWeight: 800, color: '#334155', minWidth: '42px', textAlign: 'center' }}>
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.min(150, prev + 10))}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.45rem 0.6rem',
                borderRadius: '6px',
                border: 'none',
                background: '#ffffff',
                color: '#1e293b',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
              title="تكبير العرض"
            >
              <ZoomIn size={16} />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(isTwoPhaseDoc ? 85 : 100)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '0.45rem 0.7rem',
                borderRadius: '6px',
                border: 'none',
                background: '#ffffff',
                color: '#1e293b',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
              title="ملاءمة الشاشة"
            >
              <Maximize2 size={14} />
              <span>ملاءمة</span>
            </button>
          </div>

          <button
            onClick={handleExportExcel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: '#16a34a',
              color: '#ffffff',
              border: 'none',
              padding: '0.6rem 1.15rem',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.86rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
            }}
            title="تصدير بيانات التقرير إلى ملف إكسل"
          >
            <FileSpreadsheet size={17} />
            <span>تصدير إكسل (Excel)</span>
          </button>

          <button
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '0.6rem 1.3rem',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}
          >
            <Printer size={17} />
            <span>طباعة التقرير الرسمي (Print / PDF)</span>
          </button>

          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.86rem',
              cursor: 'pointer'
            }}
          >
            <X size={17} />
            <span>إغلاق</span>
          </button>
        </div>
      </div>

      {/* Signature Controls Bar (No Print) */}
      <div className="no-print" style={{
        background: '#ffffff',
        borderBottom: '2px solid #e2e8f0',
        padding: '0.65rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            👷 <span>مدير القطاع:</span>
          </span>
          <input 
            type="text" 
            value={customSectorDirector} 
            onChange={(e) => handleSectorDirectorChange(e.target.value)}
            placeholder="اسم مدير القطاع"
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.88rem',
              fontWeight: 800,
              width: '190px',
              color: '#0f172a'
            }}
          />
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              type="button" 
              onClick={() => handleSectorDirectorChange('م. صلاح العربي')} 
              style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '5px', border: '1px solid #cbd5e1', background: customSectorDirector === 'م. صلاح العربي' ? '#dbeafe' : '#f8fafc', color: '#1e40af', fontWeight: 800, cursor: 'pointer' }}
            >
              م. صلاح العربي (المرحلة 1)
            </button>
            <button 
              type="button" 
              onClick={() => handleSectorDirectorChange('م. عيسى الطاهر')} 
              style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '5px', border: '1px solid #cbd5e1', background: customSectorDirector === 'م. عيسى الطاهر' ? '#dbeafe' : '#f8fafc', color: '#0e7490', fontWeight: 800, cursor: 'pointer' }}
            >
              م. عيسى الطاهر (المرحلة 2)
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            🏛️ <span>ممثل الجهة المالكة:</span>
          </span>
          <input 
            type="text" 
            value={customOwnerRep} 
            onChange={(e) => handleOwnerRepChange(e.target.value)}
            placeholder="اسم ممثل الجهة المالكة"
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.88rem',
              fontWeight: 800,
              width: '190px',
              color: '#0f172a'
            }}
          />
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              type="button" 
              onClick={() => handleOwnerRepChange('م. عبدالرحمن الأنصاري')} 
              style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '5px', border: '1px solid #cbd5e1', background: customOwnerRep === 'م. عبدالرحمن الأنصاري' ? '#dcfce7' : '#f8fafc', color: '#166534', fontWeight: 800, cursor: 'pointer' }}
            >
              م. عبدالرحمن الأنصاري
            </button>
            <button 
              type="button" 
              onClick={() => handleOwnerRepChange('م. عبدالسلام ابريكاو')} 
              style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '5px', border: '1px solid #cbd5e1', background: customOwnerRep === 'م. عبدالسلام ابريكاو' ? '#ede9fe' : '#f8fafc', color: '#5b21b6', fontWeight: 800, cursor: 'pointer' }}
            >
              م. عبدالسلام ابريكاو
            </button>
          </div>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div 
        className="print-sheet-wrapper"
        style={{
          width: '100%',
          flex: 1,
          overflowX: 'auto',
          overflowY: 'auto',
          padding: '1.5rem 1rem 3rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          boxSizing: 'border-box'
        }}
      >
        <div 
          className={`official-print-document ${printOrientation === 'landscape' ? 'landscape-mode' : ''}`}
          id="printable-report-content"
          style={{
            width: printOrientation === 'landscape' ? '297mm' : '210mm',
            maxWidth: '100%',
            backgroundColor: '#ffffff',
            background: '#ffffff',
            color: '#000000',
            boxSizing: 'border-box',
            zoom: zoomLevel !== 100 ? `${zoomLevel}%` : undefined
          }}
        >

          {/* 1. Official Header with Agency Logo and Libyan Emblems (Shown only for generic legacy reports) */}
          {!isStandardNewForm && (
            <div className="official-report-header">
              <div className="header-agency-info">
                <h4>دولة ليبيا</h4>
                <h3>وزارة المواصلات</h3>
                <h2>جهاز تنفيذ مشروعات المواصلات</h2>
                <p style={{ fontWeight: 800, color: '#1e3a8a', fontSize: '0.92rem' }}>مكتب جهاز الإشراف والمتابعة</p>
                <p>مشروع صيانة وتطوير طريق أوباري - غات (360 كم)</p>
              </div>

              <div className="header-agency-emblem">
                <img 
                  src={`${import.meta.env.BASE_URL}logo-agency.jpg`} 
                  alt="شعار جهاز تنفيذ مشروعات المواصلات" 
                  style={{
                    width: '78px',
                    height: '78px',
                    maxWidth: '78px',
                    maxHeight: '78px',
                    objectFit: 'contain',
                    borderRadius: '50%',
                    border: '1.5px solid #cbd5e1',
                    padding: '2px',
                    display: 'inline-block'
                  }}
                />
                <div className="emblem-sub">منظومة المتابعة اليومية المعتمدة</div>
              </div>

              <div className="header-report-meta">
                <div className="meta-box-row">
                  <span className="lbl">رقم التقرير:</span>
                  <span className="val bold" style={{ direction: 'ltr' }}>{reportNumber}</span>
                </div>
                <div className="meta-box-row">
                  <span className="lbl">التاريخ:</span>
                  <span className="val">{reportDateStr}</span>
                </div>
                <div className="meta-box-row">
                  <span className="lbl">القطاع الميداني:</span>
                  <span className="val bold" style={{ color: '#1e3a8a' }}>{sectorTitle}</span>
                </div>
                <div className="meta-box-row">
                  <span className="lbl">الشركة المنفذة:</span>
                  <span className="val">{companyTitle}</span>
                </div>
              </div>
            </div>
          )}

          {/* 0. Executive Progress Report Official Print Layout (Exact from User Document 24/10/2026) */}
          {isExecutiveDoc ? (
            <div style={{ marginBottom: '1.25rem', direction: 'rtl', fontFamily: 'inherit' }}>
              
              {/* Official Libyan Agency Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '2.5px solid #000000',
                paddingBottom: '0.45rem',
                marginBottom: '0.65rem'
              }}>
                <div style={{ textAlign: 'right', minWidth: '220px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 900, color: '#000000' }}>دولة ليبيا</h4>
                  <h3 style={{ margin: '1px 0', fontSize: '0.94rem', fontWeight: 900, color: '#000000' }}>وزارة المواصلات</h3>
                  <h2 style={{ margin: '1px 0', fontSize: '1rem', fontWeight: 900, color: '#1e3a8a' }}>جهاز تنفيذ مشروعات المواصلات</h2>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155' }}>مكتب جهاز الإشراف والمتابعة</div>
                </div>

                <div style={{ textAlign: 'center', flex: 1, padding: '0 0.75rem' }}>
                  <h1 style={{ margin: 0, fontSize: '1.28rem', fontWeight: 900, color: '#000000', letterSpacing: '-0.3px' }}>
                    {report.projectName || 'مشروع صيانة طريق اوباري غات بطول 360 كيلومتر'}
                  </h1>
                  <h2 style={{ margin: '3px 0 0', fontSize: '1.14rem', fontWeight: 900, color: '#0f172a' }}>
                    {report.reportTitle || 'الموقف التنفيذي.'}
                  </h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '220px', justifyContent: 'flex-end' }}>
                  <div style={{ textAlign: 'left', fontSize: '0.78rem', fontWeight: 800 }}>
                    <div><span style={{ color: '#64748b' }}>المرجع:</span> <strong dir="ltr" style={{ color: '#000' }}>{report.reportNumber || '093436_24.10.2026'}</strong></div>
                    <div><span style={{ color: '#64748b' }}>التاريخ:</span> <strong dir="ltr" style={{ color: '#000' }}>{report.reportDate || '24/10/2026'}</strong></div>
                    <div><span style={{ color: '#64748b' }}>الحالة:</span> <strong style={{ color: '#16a34a' }}>معتمد رسمياً</strong></div>
                  </div>
                  <img 
                    src={`${import.meta.env.BASE_URL}logo-agency.jpg`} 
                    alt="شعار الجهاز" 
                    style={{
                      width: '62px',
                      height: '62px',
                      objectFit: 'contain',
                      borderRadius: '50%',
                      border: '1.5px solid #000000',
                      padding: '2px'
                    }}
                  />
                </div>
              </div>

              {/* Top Meta Bar matching PDF exact format */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1.5px solid #000000',
                background: '#f8fafc',
                padding: '5px 12px',
                fontWeight: 900,
                fontSize: '0.88rem',
                marginBottom: '6px'
              }}>
                <div>
                  <span>قيمة العقد: </span>
                  <strong style={{ color: '#1e3a8a', fontSize: '1.02rem' }} dir="ltr">
                    {fmtNum(report.contractValue || report.calculations?.contractVal || 897665675.03, 3, 3)}
                  </strong>
                  <span> دينار</span>
                </div>
                <div>
                  <span>التاريخ / </span>
                  <strong dir="ltr">{report.reportDate || '24/10/2026'}</strong>
                </div>
              </div>

              {/* Table: البنود الأساسية والبنود الإضافية موحدة في جدول رسمي واحد ذو 8 أعمدة مطابق للوثيقة الرسمية 100% */}
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'center',
                fontSize: '0.76rem',
                border: '1.5px solid #000000',
                marginBottom: '10px'
              }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #000000' }}>
                    <th style={{ border: '1px solid #000000', padding: '5px 2px', width: '34px', fontWeight: 900 }}>البند</th>
                    <th style={{ border: '1px solid #000000', padding: '5px 6px', textAlign: 'right', fontWeight: 900 }}>الوصف</th>
                    <th style={{ border: '1px solid #000000', padding: '5px 2px', width: '55px', fontWeight: 900 }}>الوحدة</th>
                    <th style={{ border: '1px solid #000000', padding: '5px 3px', width: '92px', fontWeight: 900 }}>كمية العقد</th>
                    <th style={{ border: '1px solid #000000', padding: '5px 3px', width: '92px', fontWeight: 900 }}>المنفذ</th>
                    <th style={{ border: '1px solid #000000', padding: '5px 3px', width: '92px', fontWeight: 900 }}>المتبقي</th>
                    <th style={{ border: '1px solid #000000', padding: '5px 3px', width: '120px', fontWeight: 900 }}>قيمة المنفذ</th>
                    <th style={{ border: '1px solid #000000', padding: '5px 3px', width: '65px', fontWeight: 900 }}>النسبة %</th>
                  </tr>
                </thead>
                <tbody>
                  {/* شريط الأقسام الأصفر: بنود أساسية */}
                  <tr style={{ background: '#fef08a', color: '#000000', fontWeight: 900, pageBreakInside: 'avoid' }}>
                    <td colSpan={8} style={{ border: '1px solid #000000', padding: '4px 8px', textAlign: 'right', fontSize: '0.82rem' }}>
                      بنود أساسية
                    </td>
                  </tr>

                  {(report.basicItems || []).map((item, idx) => {
                    const prev = idx > 0 ? report.basicItems[idx - 1] : null;
                    const showSec = !prev || prev.section !== item.section;
                    return (
                      <React.Fragment key={item.id || idx}>
                        {showSec && item.section && (
                          <tr style={{ background: '#fef08a', color: '#000000', fontWeight: 900, pageBreakInside: 'avoid' }}>
                            <td colSpan={8} style={{ border: '1px solid #000000', padding: '3px 8px', textAlign: 'right', fontSize: '0.8rem' }}>
                              {item.section}
                            </td>
                          </tr>
                        )}
                        <tr style={{ pageBreakInside: 'avoid' }}>
                          <td style={{ border: '1px solid #000000', padding: '3px 2px', fontWeight: 800 }}>{item.itemNumber || idx + 1}</td>
                          <td style={{ border: '1px solid #000000', padding: '3px 6px', textAlign: 'right', fontWeight: 600, lineHeight: 1.32, fontSize: '0.74rem' }}>
                            {item.description}
                          </td>
                          <td style={{ border: '1px solid #000000', padding: '3px 2px', fontWeight: 700 }}>{item.unit}</td>
                          <td style={{ border: '1px solid #000000', padding: '3px', fontWeight: 700 }} dir="ltr">
                            {item.contractQuantity !== '' && item.contractQuantity !== null && item.contractQuantity !== undefined ? fmtNum(item.contractQuantity) : '—'}
                          </td>
                          <td style={{ border: '1px solid #000000', padding: '3px', fontWeight: 800, color: '#166534' }} dir="ltr">
                            {item.executedQuantity !== '' && item.executedQuantity !== null && item.executedQuantity !== undefined && Number(item.executedQuantity) > 0 ? fmtNum(item.executedQuantity) : '—'}
                          </td>
                          <td style={{ border: '1px solid #000000', padding: '3px', fontWeight: 700, color: '#9a3412' }} dir="ltr">
                            {item.remainingQuantity !== '' && item.remainingQuantity !== null && item.remainingQuantity !== undefined && Number(item.remainingQuantity) > 0 ? fmtNum(item.remainingQuantity) : '—'}
                          </td>
                          <td style={{ border: '1px solid #000000', padding: '3px', fontWeight: 900 }} dir="ltr">
                            {item.executedValue !== '' && item.executedValue !== null && item.executedValue !== undefined && Number(item.executedValue) > 0 ? fmtNum(item.executedValue) : '—'}
                          </td>
                          <td style={{ border: '1px solid #000000', padding: '3px', fontWeight: 900, color: '#1e40af' }} dir="ltr">
                            {item.percentage !== '' && item.percentage !== null && item.percentage !== undefined && Number(item.percentage) > 0 ? `${fmtNum(item.percentage, 2, 2)}%` : '—'}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}

                  {/* سطر إجمالي البنود الأساسية */}
                  <tr style={{ background: '#f8fafc', fontWeight: 900, borderTop: '2px solid #000000', borderBottom: '2px solid #000000', pageBreakInside: 'avoid' }}>
                    <td colSpan={6} style={{ border: '1px solid #000000', padding: '5px 10px', textAlign: 'left', fontSize: '0.85rem' }}>
                      إجمالي البنود الأساسية
                    </td>
                    <td style={{ border: '1px solid #000000', padding: '5px', fontSize: '0.88rem', fontWeight: 900 }} dir="ltr">
                      {fmtNum(report.calculations?.basicExecutedSum || (report.basicItems || []).reduce((acc, it) => acc + (Number(it.executedValue) || 0), 0))} د.ل
                    </td>
                    <td style={{ border: '1px solid #000000', padding: '5px', fontSize: '0.88rem', color: '#166534', fontWeight: 900 }} dir="ltr">
                      %{fmtNum(report.calculations?.basicPercentage || (((report.basicItems || []).reduce((acc, it) => acc + (Number(it.executedValue) || 0), 0) / (report.contractValue || report.calculations?.contractVal || 897665675.03)) * 100), 2, 2)}
                    </td>
                  </tr>

                  {/* شريط الأقسام الأصفر: بنود إضافية */}
                  <tr style={{ background: '#fef08a', color: '#000000', fontWeight: 900, pageBreakInside: 'avoid' }}>
                    <td colSpan={8} style={{ border: '1px solid #000000', padding: '4px 8px', textAlign: 'right', fontSize: '0.82rem' }}>
                      بنود إضافية
                    </td>
                  </tr>

                  {/* أسطر البنود الإضافية موحدة في نفس الأعمدة الـ 8 */}
                  {(report.additionalItems || []).map((item, idx) => (
                    <tr key={item.id || idx} style={{ pageBreakInside: 'avoid' }}>
                      <td style={{ border: '1px solid #000000', padding: '3px 2px', fontWeight: 800 }}>{item.itemNumber || idx + 1}</td>
                      <td style={{ border: '1px solid #000000', padding: '3px 6px', textAlign: 'right', fontWeight: 700, fontSize: '0.76rem' }}>{item.description}</td>
                      <td style={{ border: '1px solid #000000', padding: '3px 2px', fontWeight: 700 }}>{item.unit}</td>
                      <td style={{ border: '1px solid #000000', padding: '3px', color: '#64748b' }}>—</td>
                      <td style={{ border: '1px solid #000000', padding: '3px', fontWeight: 800, color: '#166534' }} dir="ltr">
                        {fmtNum(item.executedQuantity)}
                      </td>
                      <td style={{ border: '1px solid #000000', padding: '3px', color: '#64748b' }}>—</td>
                      <td style={{ border: '1px solid #000000', padding: '3px', fontWeight: 900 }} dir="ltr">
                        {fmtNum(item.executedValue)}
                      </td>
                      <td style={{ border: '1px solid #000000', padding: '3px', color: '#64748b' }}>—</td>
                    </tr>
                  ))}

                  {/* سطر إجمالي البنود الإضافية */}
                  <tr style={{ background: '#f8fafc', fontWeight: 900, borderTop: '2px solid #000000', borderBottom: '2px solid #000000', pageBreakInside: 'avoid' }}>
                    <td colSpan={6} style={{ border: '1px solid #000000', padding: '5px 10px', textAlign: 'left', fontSize: '0.85rem' }}>
                      إجمالي البنود الإضافية
                    </td>
                    <td style={{ border: '1px solid #000000', padding: '5px', fontSize: '0.88rem', fontWeight: 900 }} dir="ltr">
                      {fmtNum(report.calculations?.additionalExecutedSum || (report.additionalItems || []).reduce((acc, it) => acc + (Number(it.executedValue) || 0), 0))} د.ل
                    </td>
                    <td style={{ border: '1px solid #000000', padding: '5px' }}>—</td>
                  </tr>
                </tbody>
              </table>

              {/* Grand Summary 4-Box Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                border: '1.5px solid #000000',
                background: '#f8fafc',
                marginBottom: '10px',
                textAlign: 'center'
              }}>
                <div style={{ padding: '6px', borderLeft: '1px solid #000000' }}>
                  <div style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 800 }}>قيمة العقد المعتمدة</div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#000000' }} dir="ltr">
                    {fmtNum(report.contractValue || report.calculations?.contractVal || 897665675.03, 3, 3)} د.ل
                  </div>
                </div>
                <div style={{ padding: '6px', borderLeft: '1px solid #000000' }}>
                  <div style={{ fontSize: '0.74rem', color: '#166534', fontWeight: 800 }}>إجمالي المنفذ الفعلي</div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#166534' }} dir="ltr">
                    {fmtNum(report.calculations?.grandExecutedSum || ((report.basicItems || []).reduce((acc, it) => acc + (Number(it.executedValue) || 0), 0) + (report.additionalItems || []).reduce((acc, it) => acc + (Number(it.executedValue) || 0), 0)))} د.ل
                  </div>
                </div>
                <div style={{ padding: '6px', borderLeft: '1px solid #000000' }}>
                  <div style={{ fontSize: '0.74rem', color: '#c2410c', fontWeight: 800 }}>المتبقي المالي من العقد</div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#ea580c' }} dir="ltr">
                    {fmtNum(report.calculations?.grandRemainingVal || Math.max(0, (report.contractValue || 897665675.03) - ((report.basicItems || []).reduce((acc, it) => acc + (Number(it.executedValue) || 0), 0) + (report.additionalItems || []).reduce((acc, it) => acc + (Number(it.executedValue) || 0), 0))))} د.ل
                  </div>
                </div>
                <div style={{ padding: '6px' }}>
                  <div style={{ fontSize: '0.74rem', color: '#1e40af', fontWeight: 800 }}>نسبة الإنجاز المالي الإجمالية</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1d4ed8' }} dir="ltr">
                    %{report.calculations?.overallFinancialPercentage || fmtNum((((report.basicItems || []).reduce((acc, it) => acc + (Number(it.executedValue) || 0), 0) + (report.additionalItems || []).reduce((acc, it) => acc + (Number(it.executedValue) || 0), 0)) / (report.contractValue || 897665675.03)) * 100, 2, 2)}
                  </div>
                </div>
              </div>

              {/* Official Tripartite Signatures Block */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                border: '1.5px solid #000000',
                padding: '8px 12px',
                background: '#ffffff',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 800 }}>إعداد ومراجعة</div>
                  <strong style={{ fontSize: '0.88rem', color: '#000000', display: 'block', marginTop: '2px' }}>
                    جهاز الإشراف والمتابعة الميداني
                  </strong>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '1px' }}>مشروع طريق أوباري - غات (360 كم)</div>
                  <div style={{ marginTop: '8px', borderBottom: '1.5px dotted #000000', width: '70%', margin: '8px auto 0' }} />
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 800 }}>رئيس جهاز الإشراف</div>
                  <strong style={{ fontSize: '0.88rem', color: '#000000', display: 'block', marginTop: '2px' }}>
                    م. عبدالسلام ابريكاو
                  </strong>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '1px' }}>رئيس جهاز الإشراف المعتمد</div>
                  <div style={{ marginTop: '8px', borderBottom: '1.5px dotted #000000', width: '70%', margin: '8px auto 0' }} />
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 800 }}>مدير المشروع المعتمد</div>
                  <strong style={{ fontSize: '0.88rem', color: '#1e3a8a', display: 'block', marginTop: '2px' }}>
                    م. عبدالرحمن الأنصاري
                  </strong>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '1px' }}>جهاز تنفيذ مشروعات المواصلات</div>
                  <div style={{ marginTop: '8px', borderBottom: '1.5px dotted #000000', width: '70%', margin: '8px auto 0' }} />
                </div>
              </div>

            </div>
          ) : isTargetedWorksDoc ? (
            <div style={{ marginBottom: '2rem' }}>
              {/* Blue Ribbon Title (Exact from Photo) */}
              <div style={{
                background: '#0284c7',
                color: '#ffffff',
                textAlign: 'center',
                padding: '0.85rem 1.5rem',
                borderRadius: '2px',
                border: '2px solid #000000',
                marginBottom: '1rem'
              }}>
                <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900 }}>
                  {report.title || `بيان أعمال يوم ${report.dayName || ''} ${report.dateFormatted || reportDateStr}`}
                </h1>
              </div>

              {/* Sections with Yellow Headers matching the photo */}
              {(report.targetedSections || []).map((sec, sIdx) => {
                const secLength = (sec.workItems || []).reduce((acc, r) => acc + (parseFloat(r.length) || 0), 0);
                const secEquip = (sec.equipmentItems || []).reduce((acc, r) => acc + (parseFloat(r.count) || 0), 0);

                return (
                  <div key={sIdx} style={{ marginBottom: '1.5rem' }}>
                    {/* Work Items Table */}
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      textAlign: 'center',
                      fontSize: '0.95rem',
                      border: '2px solid #000000',
                      marginBottom: '0.65rem'
                    }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', color: '#000000', fontWeight: 900 }}>
                          <th style={{ border: '2px solid #000000', padding: '0.55rem', width: '45px' }}>م</th>
                          <th style={{ border: '2px solid #000000', padding: '0.55rem', width: '32%' }}>البند</th>
                          <th style={{ border: '2px solid #000000', padding: '0.55rem', width: '13%' }}>من</th>
                          <th style={{ border: '2px solid #000000', padding: '0.55rem', width: '13%' }}>الى</th>
                          <th style={{ border: '2px solid #000000', padding: '0.55rem', width: '14%' }}>طول</th>
                          <th style={{ border: '2px solid #000000', padding: '0.55rem', width: '23%' }}>ملاحظات</th>
                        </tr>
                        <tr style={{ background: '#ffc000', color: '#000000', fontWeight: 900 }}>
                          <td style={{ border: '2px solid #000000', padding: '0.5rem' }}></td>
                          <td style={{ border: '2px solid #000000', padding: '0.5rem 0.75rem', textAlign: 'right', fontSize: '1rem' }}>
                            {sec.title}
                          </td>
                          <td colSpan={3} style={{ border: '2px solid #000000', padding: '0.5rem', fontSize: '0.86rem' }}>
                            {secLength > 0 ? `إجمالي الطول: ${secLength.toLocaleString('en-US')} م.ط` : ''}
                          </td>
                          <td style={{ border: '2px solid #000000', padding: '0.5rem 0.75rem', textAlign: 'right', fontSize: '0.9rem' }}>
                            {sec.startTimeNote}
                          </td>
                        </tr>
                      </thead>
                      <tbody>
                        {(sec.workItems || []).map((w, wIdx) => (
                          <tr key={wIdx} style={{ background: '#ffffff' }}>
                            <td style={{ border: '2px solid #000000', padding: '0.5rem', fontWeight: 900 }}>{wIdx + 1}</td>
                            <td style={{ border: '2px solid #000000', padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>{w.item || '-'}</td>
                            <td style={{ border: '2px solid #000000', padding: '0.5rem', fontWeight: 800 }}>{w.stationFrom || '-'}</td>
                            <td style={{ border: '2px solid #000000', padding: '0.5rem', fontWeight: 800 }}>{w.stationTo || '-'}</td>
                            <td style={{ border: '2px solid #000000', padding: '0.5rem', fontWeight: 800 }}>
                              {w.length ? Number(w.length).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                            </td>
                            <td style={{ border: '2px solid #000000', padding: '0.5rem', fontWeight: 600 }}>{w.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Equipment Table */}
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      textAlign: 'center',
                      fontSize: '0.95rem',
                      border: '2px solid #000000'
                    }}>
                      <thead>
                        <tr style={{ background: '#ffc000', color: '#000000', fontWeight: 900 }}>
                          <th style={{ border: '2px solid #000000', padding: '0.5rem', width: '45px' }}>م</th>
                          <th style={{ border: '2px solid #000000', padding: '0.5rem 0.75rem', width: '45%' }}>{sec.equipmentTitle}</th>
                          <th style={{ border: '2px solid #000000', padding: '0.5rem', width: '15%' }}>العدد {secEquip > 0 ? `(${secEquip})` : ''}</th>
                          <th style={{ border: '2px solid #000000', padding: '0.5rem', width: '35%' }}>ملاحظات وتفاصيل التشغيل</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(sec.equipmentItems || []).map((eq, eIdx) => (
                          <tr key={eIdx} style={{ background: '#ffffff' }}>
                            <td style={{ border: '2px solid #000000', padding: '0.5rem', fontWeight: 900, background: '#fffbeb' }}>{eIdx + 1}</td>
                            <td style={{ border: '2px solid #000000', padding: '0.5rem', fontWeight: 800 }}>{eq.name || '-'}</td>
                            <td style={{ border: '2px solid #000000', padding: '0.5rem', fontWeight: 900 }}>{eq.count ? Number(eq.count).toLocaleString('en-US') : '-'}</td>
                            <td style={{ border: '2px solid #000000', padding: '0.5rem', fontWeight: 600 }}>{eq.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}

              {/* Grand Total Bar */}
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem 1.25rem',
                background: '#fef9c3',
                border: '2px solid #000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontWeight: 900,
                fontSize: '1rem',
                color: '#000000'
              }}>
                <span>الإجمالي العام للأعمال المستهدفة:</span>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <span>إجمالي الأطوال: {Number(report.totalTargetLength || report.roadMeters || 0).toLocaleString('en-US')} م.ط</span>
                  <span>إجمالي المعدات والأطقم: {Number(report.totalTargetEquipment || 0).toLocaleString('en-US')} آلية/طاقم</span>
                </div>
              </div>

              {/* Exact Dual Signatures from Photo */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                paddingLeft: '3rem',
                paddingRight: '3rem',
                marginTop: '2.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{ textAlign: 'center', minWidth: '220px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#000000' }}>
                    مدير القطاع
                  </h3>
                  <div style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 800 }}>
                    مهندس : <span style={{ borderBottom: '2px dotted #000000', paddingBottom: '2px' }}>{customSectorDirector || '................................'}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'center', minWidth: '220px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#000000' }}>
                    ممثل الجهة المالكة
                  </h3>
                  <div style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 800 }}>
                    مهندس : <span style={{ borderBottom: '2px dotted #000000', paddingBottom: '2px' }}>{customOwnerRep || '................................'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (report.isFuelReport || report.reportType === 'تقرير كميات الوقود اليومية' || (Array.isArray(report.fuelItems) && report.fuelItems.length > 0)) ? (
            <div style={{ marginBottom: '0.5rem' }}>
              {/* Centered Document Title */}
              <h1 style={{
                textAlign: 'center',
                fontSize: '1.6rem',
                fontWeight: 900,
                color: '#000000',
                margin: '0.6rem 0 0.4rem'
              }}>
                تقرير كميات الوقود اليومية
              </h1>

              {/* Subhead: [التاريخ]      يوم [اليوم] */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                maxWidth: '420px',
                margin: '0 auto 0.85rem',
                fontSize: '1.1rem',
                fontWeight: 900,
                color: '#000000',
                direction: 'ltr'
              }}>
                <span>{report.dateFormatted || (report.date ? new Date(report.date).toLocaleDateString('ar-LY') : '')}</span>
                <span style={{ direction: 'rtl' }}>يوم {report.dayName || 'السبت'}</span>
              </div>

              {/* Official Fuel Table */}
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'center',
                fontSize: '1rem',
                border: '2px solid #000000'
              }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#000000', fontWeight: 900 }}>
                    <th style={{ border: '2px solid #000000', padding: '0.75rem 0.5rem', width: '50px' }}>ت</th>
                    <th style={{ border: '2px solid #000000', padding: '0.75rem 1rem', width: '23%' }}>الموقع</th>
                    <th style={{ border: '2px solid #000000', padding: '0.75rem 1rem', width: '25%' }}>الكمية المصروفة (لتر)</th>
                    <th style={{ border: '2px solid #000000', padding: '0.75rem 1rem', width: '23%' }}>الوارد (لتر)</th>
                    <th style={{ border: '2px solid #000000', padding: '0.75rem 1rem', width: '25%' }}>الكمية المتبقية (لتر)</th>
                  </tr>
                </thead>
                <tbody>
                  {(report.fuelItems || []).map((row, idx) => (
                    <tr key={idx} style={{ background: '#ffffff' }}>
                      <td style={{ border: '2px solid #000000', padding: '0.65rem', fontWeight: 900 }}>
                        {idx + 1}
                      </td>
                      <td style={{ border: '2px solid #000000', padding: '0.65rem 1rem', fontWeight: 800 }}>
                        {row.location || '-'}
                      </td>
                      <td style={{ border: '2px solid #000000', padding: '0.65rem', fontWeight: 800 }}>
                        {row.dispatchedLiters ? Number(row.dispatchedLiters).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                      </td>
                      <td style={{ border: '2px solid #000000', padding: '0.65rem', fontWeight: 800 }}>
                        {row.receivedLiters ? Number(row.receivedLiters).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                      </td>
                      <td style={{ border: '2px solid #000000', padding: '0.65rem', fontWeight: 800 }}>
                        {row.remainingLiters ? Number(row.remainingLiters).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                      </td>
                    </tr>
                  ))}

                  {/* Bright Yellow Footer Row matching photo exactly */}
                  <tr style={{ background: '#ffff00', color: '#000000', fontWeight: 900 }}>
                    <td colSpan={2} style={{ border: '2px solid #000000', padding: '0.75rem', fontSize: '1.1rem', textAlign: 'center' }}>
                      الإجمالي (لتر)
                    </td>
                    <td style={{ border: '2px solid #000000', padding: '0.75rem', fontSize: '1.1rem' }}>
                      {Number(report.totalDispatchedLiters || report.fuelAmount || (report.fuelItems || []).reduce((acc, c) => acc + (c.dispatchedLiters || 0), 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ border: '2px solid #000000', padding: '0.75rem', fontSize: '1.1rem' }}>
                      {Number(report.totalReceivedLiters || (report.fuelItems || []).reduce((acc, c) => acc + (c.receivedLiters || 0), 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ border: '2px solid #000000', padding: '0.75rem', fontSize: '1.1rem' }}>
                      {Number(report.totalRemainingLiters || (report.fuelItems || []).reduce((acc, c) => acc + (c.remainingLiters || 0), 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Dual Signatures for Fuel Report */}
              <div className="signatures-block" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                paddingLeft: '3rem',
                paddingRight: '3rem',
                marginTop: '1.25rem',
                marginBottom: '0.25rem',
                pageBreakInside: 'avoid',
                breakInside: 'avoid'
              }}>
                <div style={{ textAlign: 'center', minWidth: '220px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#000000' }}>
                    مسؤول الوقود والمحروقات
                  </h3>
                  <div style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 800 }}>
                    <span style={{ borderBottom: '2px dotted #000000', paddingBottom: '2px' }}>{report.uploadedBy || 'مسؤول الوقود بالموقع'}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'center', minWidth: '220px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#000000' }}>
                    المهندس المشرف / رئيس جهاز الإشراف
                  </h3>
                  <div style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 800 }}>
                    <span style={{ borderBottom: '2px dotted #000000', paddingBottom: '2px' }}>{report.approvedBy || 'م. عبدالسلام ابريكاو'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : isTwoPhaseDoc ? (
            <div style={{ marginBottom: '1.5rem', direction: 'rtl', width: '100%', background: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}>
              {/* Document Title Header matching the Photo */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '2.5px solid #000000',
                paddingBottom: '0.6rem',
                marginBottom: '1rem'
              }}>
                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#000000' }}>
                    مشروع صيانة طريق أوباري غات
                  </h2>
                  <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#1e3a8a' }}>
                    الأعمال المنجزة
                  </h3>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  border: '1.5px solid #000000',
                  padding: '6px 16px',
                  background: '#f8fafc',
                  fontWeight: 900,
                  fontSize: '0.95rem'
                }}>
                  <div>
                    <span style={{ color: '#64748b', marginLeft: '6px' }}>التاريخ:</span>
                    <span style={{ direction: 'ltr' }}>{report.dateFormatted || (report.date ? report.date.split('T')[0] : reportDateStr)}</span>
                  </div>
                  <div style={{ borderRight: '1.5px solid #000000', paddingRight: '1rem' }}>
                    <span style={{ color: '#64748b', marginLeft: '6px' }}>اليوم:</span>
                    <span>{report.dayName || 'السبت'}</span>
                  </div>
                </div>
              </div>

              {/* ROW 1: Phase 1 Table (Right) & Chart (Left) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div style={{ border: '1.5px solid #000000', background: '#ffffff', backgroundColor: '#ffffff' }}>
                  <div style={{ background: '#1e40af', color: '#fff', textAlign: 'center', fontWeight: 900, padding: '4px', fontSize: '0.9rem' }}>
                    المرحلة الأولى
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.78rem', background: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #000' }}>
                        <th style={{ border: '1px solid #000', padding: '4px 2px', width: '25px' }}>م</th>
                        <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}>الوصف</th>
                        <th style={{ border: '1px solid #000', padding: '4px', width: '85px' }}>إنجاز اليوم (م.ط)</th>
                        <th style={{ border: '1px solid #000', padding: '4px', width: '85px' }}>الإجمالي (م.ط)</th>
                        <th style={{ border: '1px solid #000', padding: '4px', width: '80px' }}>المستهدف اليومي</th>
                        <th style={{ border: '1px solid #000', padding: '4px', width: '80px' }}>الزيادة / النقصان</th>
                        <th style={{ border: '1px solid #000', padding: '4px' }}>ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ background: '#e2e8f0', fontWeight: 900 }}>
                        <td colSpan={7} style={{ border: '1px solid #000', padding: '3px 8px', textAlign: 'right', fontSize: '0.75rem' }}>بنود أساسية</td>
                      </tr>
                      {(report.phase1Items || []).filter(i => i && (i.category === 'basic' || !i.category)).map((it, idx) => (
                        <tr key={idx} style={{ background: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}>
                          <td style={{ border: '1px solid #000', padding: '3px', color: '#000000' }}>{idx + 1}</td>
                          <td style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'right', fontWeight: 700 }}>{it.name}</td>
                          <td style={{ border: '1px solid #000', padding: '3px', fontWeight: 800 }}>{it.todayMeters ? Number(it.todayMeters).toLocaleString('en-US') : '-'}</td>
                          <td style={{ border: '1px solid #000', padding: '3px', fontWeight: 800 }}>{it.totalMeters ? Number(it.totalMeters).toLocaleString('en-US') : '-'}</td>
                          <td style={{ border: '1px solid #000', padding: '3px' }}>{it.dailyTarget ? Number(it.dailyTarget).toLocaleString('en-US') : '-'}</td>
                          <td style={{ border: '1px solid #000', padding: '3px', fontWeight: 800 }}>{it.varianceMeters || '-'}</td>
                          <td style={{ border: '1px solid #000', padding: '3px', fontSize: '0.72rem' }}>{it.notes || '-'}</td>
                        </tr>
                      ))}
                      <tr style={{ background: '#e2e8f0', fontWeight: 900 }}>
                        <td colSpan={7} style={{ border: '1px solid #000', padding: '3px 8px', textAlign: 'right', fontSize: '0.75rem' }}>بنود إضافية</td>
                      </tr>
                      {(report.phase1Items || []).filter(i => i && i.category === 'additional').map((it, idx) => (
                        <tr key={idx} style={{ background: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}>
                          <td style={{ border: '1px solid #000', padding: '3px', color: '#000000' }}>{idx + 4}</td>
                          <td style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'right', fontWeight: 700 }}>{it.name}</td>
                          <td style={{ border: '1px solid #000', padding: '3px', fontWeight: 800 }}>{it.todayMeters ? Number(it.todayMeters).toLocaleString('en-US') : '-'}</td>
                          <td style={{ border: '1px solid #000', padding: '3px', fontWeight: 800 }}>{it.totalMeters ? Number(it.totalMeters).toLocaleString('en-US') : '-'}</td>
                          <td style={{ border: '1px solid #000', padding: '3px' }}>{it.dailyTarget ? Number(it.dailyTarget).toLocaleString('en-US') : '-'}</td>
                          <td style={{ border: '1px solid #000', padding: '3px', fontWeight: 800 }}>{it.varianceMeters || '-'}</td>
                          <td style={{ border: '1px solid #000', padding: '3px', fontSize: '0.72rem' }}>{it.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Chart 1 */}
                <TwoPhasePrintChart title="الأعمال المنجزة المرحلة الأولى" items={report.phase1Items || []} />
              </div>

              {/* ROW 2: Phase 2 Table (Right) & Chart (Left) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div style={{ border: '1.5px solid #000000', background: '#ffffff', backgroundColor: '#ffffff' }}>
                  <div style={{ background: '#0284c7', color: '#fff', textAlign: 'center', fontWeight: 900, padding: '4px', fontSize: '0.9rem' }}>
                    المرحلة الثانية
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.78rem', background: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #000' }}>
                        <th style={{ border: '1px solid #000', padding: '4px 2px', width: '25px' }}>م</th>
                        <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}>الوصف</th>
                        <th style={{ border: '1px solid #000', padding: '4px', width: '85px' }}>إنجاز اليوم (م.ط)</th>
                        <th style={{ border: '1px solid #000', padding: '4px', width: '85px' }}>الإجمالي (م.ط)</th>
                        <th style={{ border: '1px solid #000', padding: '4px', width: '80px' }}>المستهدف اليومي</th>
                        <th style={{ border: '1px solid #000', padding: '4px', width: '80px' }}>الزيادة / النقصان</th>
                        <th style={{ border: '1px solid #000', padding: '4px' }}>ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ background: '#e2e8f0', fontWeight: 900 }}>
                        <td colSpan={7} style={{ border: '1px solid #000', padding: '3px 8px', textAlign: 'right', fontSize: '0.75rem' }}>بنود أساسية</td>
                      </tr>
                      {(report.phase2Items || []).filter(i => i && (i.category === 'basic' || !i.category)).map((it, idx) => (
                        <tr key={idx} style={{ background: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}>
                          <td style={{ border: '1px solid #000', padding: '3px', color: '#000000' }}>{idx + 1}</td>
                          <td style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'right', fontWeight: 700 }}>{it.name}</td>
                          <td style={{ border: '1px solid #000', padding: '3px', fontWeight: 800 }}>{it.todayMeters ? Number(it.todayMeters).toLocaleString('en-US') : '-'}</td>
                          <td style={{ border: '1px solid #000', padding: '3px', fontWeight: 800 }}>{it.totalMeters ? Number(it.totalMeters).toLocaleString('en-US') : '-'}</td>
                          <td style={{ border: '1px solid #000', padding: '3px' }}>{it.dailyTarget ? Number(it.dailyTarget).toLocaleString('en-US') : '-'}</td>
                          <td style={{ border: '1px solid #000', padding: '3px', fontWeight: 800 }}>{it.varianceMeters || '-'}</td>
                          <td style={{ border: '1px solid #000', padding: '3px', fontSize: '0.72rem' }}>{it.notes || '-'}</td>
                        </tr>
                      ))}
                      <tr style={{ background: '#e2e8f0', fontWeight: 900 }}>
                        <td colSpan={7} style={{ border: '1px solid #000', padding: '3px 8px', textAlign: 'right', fontSize: '0.75rem' }}>بنود إضافية</td>
                      </tr>
                      {(report.phase2Items || []).filter(i => i && i.category === 'additional').map((it, idx) => (
                        <tr key={idx} style={{ background: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}>
                          <td style={{ border: '1px solid #000', padding: '3px', color: '#000000' }}>{idx + 4}</td>
                          <td style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'right', fontWeight: 700 }}>{it.name}</td>
                          <td style={{ border: '1px solid #000', padding: '3px', fontWeight: 800 }}>{it.todayMeters ? Number(it.todayMeters).toLocaleString('en-US') : '-'}</td>
                          <td style={{ border: '1px solid #000', padding: '3px', fontWeight: 800 }}>{it.totalMeters ? Number(it.totalMeters).toLocaleString('en-US') : '-'}</td>
                          <td style={{ border: '1px solid #000', padding: '3px' }}>{it.dailyTarget ? Number(it.dailyTarget).toLocaleString('en-US') : '-'}</td>
                          <td style={{ border: '1px solid #000', padding: '3px', fontWeight: 800 }}>{it.varianceMeters || '-'}</td>
                          <td style={{ border: '1px solid #000', padding: '3px', fontSize: '0.72rem' }}>{it.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Chart 2 */}
                <TwoPhasePrintChart title="الأعمال المنجزة المرحلة الثانية" items={report.phase2Items || []} />
              </div>

              {/* ROW 3: Combined Two-Phase Table (Right) & Chart (Left) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div style={{ border: '1.5px solid #000000', background: '#ffffff', backgroundColor: '#ffffff' }}>
                  <div style={{ background: '#0f172a', color: '#fff', textAlign: 'center', fontWeight: 900, padding: '4px', fontSize: '0.9rem' }}>
                    إجمالي المنجز للمرحلتين (تجميع آلي فوري)
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.78rem', background: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #000' }}>
                        <th style={{ border: '1px solid #000', padding: '4px 2px', width: '25px' }}>م</th>
                        <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}>الوصف</th>
                        <th style={{ border: '1px solid #000', padding: '4px', width: '90px', background: '#eff6ff' }}>إنجاز اليوم (م.ط)</th>
                        <th style={{ border: '1px solid #000', padding: '4px', width: '90px', background: '#f0fdf4' }}>الإجمالي (م.ط)</th>
                        <th style={{ border: '1px solid #000', padding: '4px', width: '90px' }}>الجاهز للعمل في البند</th>
                        <th style={{ border: '1px solid #000', padding: '4px' }}>ملاحظات وتفاصيل التجميع</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ background: '#e2e8f0', fontWeight: 900 }}>
                        <td colSpan={6} style={{ border: '1px solid #000', padding: '3px 8px', textAlign: 'right', fontSize: '0.75rem' }}>بنود أساسية</td>
                      </tr>
                      {(report.combinedItems || []).filter(i => i && (i.category === 'basic' || !i.category)).map((it, idx) => (
                        <tr key={idx} style={{ background: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}>
                          <td style={{ border: '1px solid #000', padding: '3px', color: '#000000' }}>{idx + 1}</td>
                          <td style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'right', fontWeight: 700 }}>{it.name}</td>
                          <td style={{ border: '1px solid #000', padding: '3px', fontWeight: 900, color: '#1d4ed8' }}>{it.todayMeters ? Number(it.todayMeters).toLocaleString('en-US') : '-'}</td>
                          <td style={{ border: '1px solid #000', padding: '3px', fontWeight: 900, color: '#15803d' }}>{it.totalMeters ? Number(it.totalMeters).toLocaleString('en-US') : '-'}</td>
                          <td style={{ border: '1px solid #000', padding: '3px', fontWeight: 800 }}>
                            {it.readyToWorkMeters !== '' && it.readyToWorkMeters !== null && it.readyToWorkMeters !== undefined && Number(it.readyToWorkMeters) > 0 
                              ? Number(it.readyToWorkMeters).toLocaleString('en-US') 
                              : (it.readyToWork ? Number(it.readyToWork).toLocaleString('en-US') : '—')}
                          </td>
                          <td style={{ border: '1px solid #000', padding: '3px', fontSize: '0.72rem' }}>{it.notes || '-'}</td>
                        </tr>
                      ))}
                      <tr style={{ background: '#e2e8f0', fontWeight: 900 }}>
                        <td colSpan={6} style={{ border: '1px solid #000', padding: '3px 8px', textAlign: 'right', fontSize: '0.75rem' }}>بنود إضافية</td>
                      </tr>
                      {(report.combinedItems || []).filter(i => i && i.category === 'additional').map((it, idx) => (
                        <tr key={idx} style={{ background: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}>
                          <td style={{ border: '1px solid #000', padding: '3px', color: '#000000' }}>{idx + 4}</td>
                          <td style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'right', fontWeight: 700 }}>{it.name}</td>
                          <td style={{ border: '1px solid #000', padding: '3px', fontWeight: 900, color: '#1d4ed8' }}>{it.todayMeters ? Number(it.todayMeters).toLocaleString('en-US') : '-'}</td>
                          <td style={{ border: '1px solid #000', padding: '3px', fontWeight: 900, color: '#15803d' }}>{it.totalMeters ? Number(it.totalMeters).toLocaleString('en-US') : '-'}</td>
                          <td style={{ border: '1px solid #000', padding: '3px', fontWeight: 800 }}>
                            {it.readyToWorkMeters !== '' && it.readyToWorkMeters !== null && it.readyToWorkMeters !== undefined && Number(it.readyToWorkMeters) > 0 
                              ? Number(it.readyToWorkMeters).toLocaleString('en-US') 
                              : (it.readyToWork ? Number(it.readyToWork).toLocaleString('en-US') : '—')}
                          </td>
                          <td style={{ border: '1px solid #000', padding: '3px', fontSize: '0.72rem' }}>{it.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Chart 3 */}
                <TwoPhasePrintChart title="إجمالي الأعمال المنجزة" items={report.combinedItems || []} />
              </div>

              {/* ROW 4: Remaining Balances Dual Tables */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem', border: '1.5px solid #000000', padding: '6px', background: '#ffffff', backgroundColor: '#ffffff' }}>
                {/* Sub-table A */}
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.76rem', background: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #000' }}>
                      <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}>المتبقي من البند</th>
                      <th style={{ border: '1px solid #000', padding: '4px', width: '70px' }}>المرحلة الأولى</th>
                      <th style={{ border: '1px solid #000', padding: '4px', width: '70px' }}>المرحلة الثانية</th>
                      <th style={{ border: '1px solid #000', padding: '4px', width: '70px', background: '#e2e8f0' }}>الإجمالي</th>
                      <th style={{ border: '1px solid #000', padding: '4px' }}>ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(report.remainingItems || []).filter(r => r && r.group === 'A').map((r, idx) => (
                      <tr key={idx} style={{ background: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}>
                        <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'right', fontWeight: 800, color: '#000000' }}>{r.name}</td>
                        <td style={{ border: '1px solid #000', padding: '4px' }}>{r.phase1 ? Number(r.phase1).toLocaleString('en-US') : '-'}</td>
                        <td style={{ border: '1px solid #000', padding: '4px' }}>{r.phase2 ? Number(r.phase2).toLocaleString('en-US') : '-'}</td>
                        <td style={{ border: '1px solid #000', padding: '4px', fontWeight: 900 }}>{r.total ? Number(r.total).toLocaleString('en-US') : '-'}</td>
                        <td style={{ border: '1px solid #000', padding: '4px', fontSize: '0.72rem' }}>{r.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Sub-table B */}
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.76rem', background: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #000' }}>
                      <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}>المتبقي من البند</th>
                      <th style={{ border: '1px solid #000', padding: '4px', width: '70px' }}>المرحلة الأولى</th>
                      <th style={{ border: '1px solid #000', padding: '4px', width: '70px' }}>المرحلة الثانية</th>
                      <th style={{ border: '1px solid #000', padding: '4px', width: '70px', background: '#e2e8f0' }}>الإجمالي</th>
                      <th style={{ border: '1px solid #000', padding: '4px' }}>ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(report.remainingItems || []).filter(r => r && r.group === 'B').map((r, idx) => (
                      <tr key={idx} style={{ background: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}>
                        <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'right', fontWeight: 800, color: '#000000' }}>{r.name}</td>
                        <td style={{ border: '1px solid #000', padding: '4px' }}>{r.phase1 ? Number(r.phase1).toLocaleString('en-US') : '-'}</td>
                        <td style={{ border: '1px solid #000', padding: '4px' }}>{r.phase2 ? Number(r.phase2).toLocaleString('en-US') : '-'}</td>
                        <td style={{ border: '1px solid #000', padding: '4px', fontWeight: 900 }}>{r.total ? Number(r.total).toLocaleString('en-US') : '-'}</td>
                        <td style={{ border: '1px solid #000', padding: '4px', fontSize: '0.72rem' }}>{r.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Exact Dual Signatures from Photo */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                paddingLeft: '3rem',
                paddingRight: '3rem',
                marginTop: '1.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{ textAlign: 'center', minWidth: '220px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#000000' }}>
                    مدير القطاع
                  </h3>
                  <div style={{ marginTop: '0.8rem', fontSize: '0.95rem', fontWeight: 800 }}>
                    <span>مهندس: </span>
                    <span style={{ borderBottom: '2px dotted #000000', paddingBottom: '2px' }}>{customSectorDirector || '................................'}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'center', minWidth: '220px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#000000' }}>
                    ممثل الجهة المالكة
                  </h3>
                  <div style={{ marginTop: '0.8rem', fontSize: '0.95rem', fontWeight: 800 }}>
                    <span>مهندس: </span>
                    <span style={{ borderBottom: '2px dotted #000000', paddingBottom: '2px' }}>{customOwnerRep || '................................'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : isRoadDoc ? (
            <div style={{ marginBottom: '0.5rem' }}>
              {/* Official Cyan Banner Header (Matching Photo 1 exactly) */}
              <div style={{
                background: '#38bdf8',
                color: '#000000',
                textAlign: 'center',
                padding: '0.85rem 1.5rem',
                borderRadius: '4px',
                border: '2.5px solid #000000',
                marginBottom: '1rem'
              }}>
                <h1 style={{ margin: 0, fontSize: '1.55rem', fontWeight: 900 }}>
                  {report.title || (report.dayName ? `تقرير أعمال يوم ${report.dayName} ${report.dateFormatted || reportDateStr}` : `تقرير أعمال الطريق اليومي`)}
                </h1>
              </div>

              {/* Official Table with Yellow Headers */}
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'center',
                fontSize: '0.95rem',
                border: '2px solid #000000',
                marginBottom: '1.5rem'
              }}>
                <thead>
                  <tr style={{ background: '#ffc000', color: '#000000', fontWeight: 900 }}>
                    <th style={{ border: '2px solid #000000', padding: '0.65rem 0.5rem', width: '45px' }}>م</th>
                    <th style={{ border: '2px solid #000000', padding: '0.65rem 1rem', width: '30%' }}>البند</th>
                    <th style={{ border: '2px solid #000000', padding: '0.65rem', width: '13%' }}>من</th>
                    <th style={{ border: '2px solid #000000', padding: '0.65rem', width: '13%' }}>الى</th>
                    <th style={{ border: '2px solid #000000', padding: '0.65rem', width: '12%' }}>طول</th>
                    <th style={{ border: '2px solid #000000', padding: '0.65rem', width: '12%' }}>م٢</th>
                    <th style={{ border: '2px solid #000000', padding: '0.65rem', width: '18%' }}>ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(report.items) && report.items.length > 0 
                    ? report.items 
                    : (Array.isArray(report.roadItems) && report.roadItems.length > 0 
                      ? report.roadItems 
                      : [{ item: '', stationFrom: '', stationTo: '', length: '', area: '', notes: '' }]
                    )
                  ).map((row, idx) => {
                    const isNoteYellow = row.noteHighlight || row.notes === 'معمل ومساحه' || row.notes === 'جاري العمل';

                    return (
                      <tr key={idx} style={{ background: '#ffffff' }}>
                        <td style={{ border: '2px solid #000000', padding: '0.55rem', fontWeight: 900, background: '#fffbeb' }}>
                          {row.itemNumber || idx + 1}
                        </td>
                        <td style={{ border: '2px solid #000000', padding: '0.55rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>
                          {row.item || '-'}
                        </td>
                        <td style={{ border: '2px solid #000000', padding: '0.55rem', fontWeight: 800 }}>
                          {row.stationFrom || '-'}
                        </td>
                        <td style={{ border: '2px solid #000000', padding: '0.55rem', fontWeight: 800 }}>
                          {row.stationTo || '-'}
                        </td>
                        <td style={{ border: '2px solid #000000', padding: '0.55rem', fontWeight: 800 }}>
                          {row.length ? Number(row.length).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                        </td>
                        <td style={{ border: '2px solid #000000', padding: '0.55rem', fontWeight: 800 }}>
                          {row.area ? Number(row.area).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                        </td>
                        <td style={{ 
                          border: '2px solid #000000', 
                          padding: '0.55rem 0.75rem', 
                          fontWeight: isNoteYellow ? 900 : 600,
                          background: isNoteYellow ? '#ffc000' : 'transparent',
                          color: '#000000'
                        }}>
                          {row.notes || '-'}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Totals Row */}
                  <tr style={{ background: '#fef3c7', fontWeight: 900, borderTop: '3px solid #000000' }}>
                    <td colSpan={4} style={{ border: '2px solid #000000', padding: '0.65rem', textAlign: 'center', fontSize: '1rem' }}>
                      الإجمالي العام للأعمال المنفذة
                    </td>
                    <td style={{ border: '2px solid #000000', padding: '0.65rem', fontSize: '1rem' }}>
                      {Number(report.totalLength || report.roadMeters || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ border: '2px solid #000000', padding: '0.65rem', fontSize: '1rem' }}>
                      {Number(report.totalArea || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ border: '2px solid #000000', padding: '0.65rem', fontSize: '0.85rem' }}>
                      {(report.items || []).length} بنود منجزة
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Exact Dual Signatures from Photo */}
              <div className="signatures-block" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                paddingLeft: '3rem',
                paddingRight: '3rem',
                marginTop: '1.25rem',
                marginBottom: '0.5rem',
                pageBreakInside: 'avoid',
                breakInside: 'avoid'
              }}>
                <div style={{ textAlign: 'center', minWidth: '220px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#000000' }}>
                    مدير القطاع
                  </h3>
                  <div style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 800 }}>
                    مهندس: <span style={{ borderBottom: '2px dotted #000000', paddingBottom: '2px' }}>{customSectorDirector || '................................'}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'center', minWidth: '220px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#000000' }}>
                    ممثل الجهة المالكة
                  </h3>
                  <div style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 800 }}>
                    مهندس: <span style={{ borderBottom: '2px dotted #000000', paddingBottom: '2px' }}>{customOwnerRep || '................................'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Title Banner */}
              <div className="official-title-ribbon">
                <span>التقرير الفني اليومي الميداني لمتابعة الأعمال والتشغيل</span>
              </div>

              {/* 2. Overview Meta Grid */}
              <div className="official-section-block">
                <table className="official-info-table">
                  <tbody>
                    <tr>
                      <td className="cell-label">بيان ونوع التقرير:</td>
                      <td className="cell-value bold">{report.materialName || report.reportType || 'تقرير يومي شامل'}</td>
                      <td className="cell-label">الوردية / التوقيت:</td>
                      <td className="cell-value">{report.shiftType || 'وردية صباحية (07:00 ص - 04:00 م)'}</td>
                    </tr>
                    <tr>
                      <td className="cell-label">المشرف الميداني المعد:</td>
                      <td className="cell-value">{report.uploadedBy || (isSectorA ? 'مشرف المرحلة الأولى' : 'مشرف المرحلة الثانية')}</td>
                      <td className="cell-label">طول مسار المرحلة:</td>
                      <td className="cell-value">{totalLengthKm}</td>
                    </tr>
                    <tr>
                      <td className="cell-label">حالة الاعتماد الرسمية:</td>
                      <td className="cell-value" colSpan={3}>
                        <span className={`status-tag ${report.status || 'pending_review'}`}>
                          {report.status === 'approved' 
                            ? `معتمد رسمياً بواسطة (${report.approvedBy || 'مدير القطاعات'})`
                            : report.status === 'rejected'
                            ? `مطلوب مراجعة وتعديل: ${report.reviewNotes || 'بيانات غير مطابقة'}`
                            : 'قيد مراجعة واعتماد مدير إدارة القطاعات'
                          }
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 3. Detailed Operational Tables */}
              <div className="official-section-title">
                <span>أولاً: إحصائيات وكميات التشغيل الميداني لليوم</span>
              </div>
            </>
          )}

          {!isStandardNewForm && (
            <>
              <table className="official-data-grid">
                <thead>
                  <tr>
                    <th>م</th>
                    <th>البند التشغيلي / الفني</th>
                    <th>الموقع / الآلية المحددة</th>
                    <th>الكمية المنجزة اليوم</th>
                    <th>الوحدة</th>
                    <th>المعدل / الملاحظة</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="center">1</td>
                    <td className="bold">إنتاج وتشغيل الكسارة</td>
                    <td>{report.crusherName || (isSectorA ? 'كسارة المرحلة الأولى' : 'كسارة المرحلة الثانية')}</td>
                    <td className="center bold highlight-blue">{Number(report.productionAmount || 0).toLocaleString()}</td>
                    <td className="center">طن</td>
                    <td>ركام طبقة أساس / شرشور معتمد</td>
                  </tr>
                  <tr>
                    <td className="center">2</td>
                    <td className="bold">أعمال الرصف المنفذة اليوم</td>
                    <td>مسار {sectorTitle}</td>
                    <td className="center bold highlight-green">
                      {Number(report.roadMeters || report.salesAmount || 0).toLocaleString()}
                    </td>
                    <td className="center">متر طولي (م.ط)</td>
                    <td>تنفيذ طبقات الطريق والأساس الحبيبي</td>
                  </tr>
                  <tr>
                    <td className="center">3</td>
                    <td className="bold">الوقود المستهلك (ديزل)</td>
                    <td>خزان المرحلة والآليات الميدانية</td>
                    <td className="center bold highlight-amber">{Number(report.fuelAmount || 0).toLocaleString()}</td>
                    <td className="center">لتر</td>
                    <td>تزويد الكسارة وأسطول الشاحنات والمعدات</td>
                  </tr>
                  <tr>
                    <td className="center">4</td>
                    <td className="bold">الآليات العاملة بالمرحلة</td>
                    <td>معدات التسوية، الرص، والنقل</td>
                    <td className="center bold">{report.workingEquipmentCount || (isSectorA ? '12' : '14')}</td>
                    <td className="center">آلية عاملة</td>
                    <td>جاهزية تشغيلية مستقرة</td>
                  </tr>
                  <tr>
                    <td className="center">5</td>
                    <td className="bold">الآليات المتوقفة / الصيانة</td>
                    <td>ورشة الصيانة الميدانية</td>
                    <td className="center bold" style={{ color: '#dc2626' }}>{report.stoppedEquipmentCount || (isSectorA ? '2' : '2')}</td>
                    <td className="center">آلية متوقفة</td>
                    <td>أعمال صيانة دورية وفحص زيت</td>
                  </tr>
                </tbody>
              </table>

              {/* 4. Notes & Operational Statement */}
              <div className="official-section-title" style={{ marginTop: '1.25rem' }}>
                <span>ثانياً: بيان الأعمال الميدانية والملاحظات الفنية</span>
              </div>

              <div className="official-notes-box">
                <p>
                  {report.notes || 'تمت كافة الأعمال الميدانية وفقاً للجدول الزمني المعتمد لليوم، مع الالتزام بالمواصفات الفنية القياسية المعتمدة من جهاز تنفيذ مشروعات المواصلات.'}
                </p>
                {report.reviewNotes && (
                  <div style={{ marginTop: '0.65rem', padding: '0.5rem', background: '#fee2e2', borderRadius: '6px', color: '#991b1b', fontSize: '0.82rem' }}>
                    <strong>ملاحظة مراجعة مدير القطاعات:</strong> {report.reviewNotes}
                  </div>
                )}
              </div>

              {/* 5. Attached Photo if available */}
              {report.imageUrl && (
                <div className="official-photo-section">
                  <div className="photo-title">وثيقة / صورة توثيقية من الميدان مرفقة بالتقرير:</div>
                  <div className="photo-frame">
                    <img src={report.imageUrl} alt="صورة ميدانية" />
                  </div>
                </div>
              )}

              {/* 6. Signatures and Official Seals */}
              <div className="official-signatures-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '2px dashed #cbd5e1' }}>
                <div className="sig-column">
                  <h4>مدير المرحلة الميداني</h4>
                  <p className="sig-role">إعداد وتوثيق الميدان</p>
                  <div className="sig-name">{report.uploadedBy || (isSectorA ? 'مدير المرحلة الأولى' : 'مدير المرحلة الثانية')}</div>
                  <div className="sig-signature-line">
                    <span className="digital-stamp-badge">✓ توثيق رقمي معتمد</span>
                  </div>
                </div>

                <div className="sig-column">
                  <h4>مدير إدارة القطاعات</h4>
                  <p className="sig-role">مراجعة وتدقيق الكميات</p>
                  <div className="sig-name">{report.approvedBy || 'مدير عام القطاعات'}</div>
                  <div className="sig-signature-line">
                    {report.status === 'approved' ? (
                      <span className="digital-stamp-badge approved">✓ مراجعة وتدقيق مكتمل</span>
                    ) : (
                      <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>بانتظار المراجعة</span>
                    )}
                  </div>
                </div>

                <div className="sig-column">
                  <h4>مدير المشروع (جهاز الإشراف)</h4>
                  <p className="sig-role">الاعتماد النهائي للمشروع</p>
                  <div className="sig-name" style={{ color: '#1e3a8a', fontWeight: 900 }}>المهندس عبدالرحمن الأنصاري</div>
                  <div className="sig-signature-line">
                    <span className="digital-stamp-badge approved" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                      ✓ اعتماد مدير المشروع
                    </span>
                  </div>
                </div>

                <div className="sig-column">
                  <h4>جهاز الإشراف والمتابعة</h4>
                  <p className="sig-role">طريق أوباري - غات (360 كم)</p>
                  <div className="official-seal-box">
                    <div className="seal-inner">
                      <span>جهاز الإشراف</span>
                      <span className="bold">مشروع أوباري - غات</span>
                      <span>معتمد رسمياً</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 7. Footer Meta (Only for legacy operational reports) */}
          {!isStandardNewForm && (
            <div className="official-report-footer">
              <span>منظومة متابعة الكسارات والوقود والمعدات - جهاز تنفيذ مشروعات المواصلات</span>
              <span>طُبع بتاريخ ووقت: {printTimeStr}</span>
              <span>صفحة 1 من 1</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? ReactDOM.createPortal(modalContent, document.body)
    : modalContent;
};

export default OfficialPrintModal;
