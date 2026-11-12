import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Printer, X, CheckCircle2, Clock, AlertTriangle, ShieldCheck, FileText, Calendar, Building2, User, Layers, Fuel, Factory, Truck, Download, FileSpreadsheet, Layout, ZoomIn, ZoomOut, Maximize2, Send } from 'lucide-react';
import * as XLSX from 'xlsx';

// Clean day name preventing duplicate "يوم يوم"
export const cleanDayName = (day) => {
  if (!day) return 'السبت';
  return String(day).replace(/^(يوم\s*)+/gi, '').trim() || 'السبت';
};

// Safe number cleaning and formatting for crisp official print fidelity
const safeCleanPrintNumber = (val, defaultVal = 0) => {
  if (val === null || val === undefined || val === '') return defaultVal;
  const clean = String(val)
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/٫/g, '.')
    .replace(/[,٬،]/g, '')
    .trim();
  const num = parseFloat(clean);
  return isNaN(num) ? defaultVal : num;
};

const formatPrintNumber = (val) => {
  if (val === null || val === undefined || val === '' || val === '-' || val === '—' || String(val).toLowerCase() === 'nan') return '-';
  const clean = String(val)
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/٫/g, '.')
    .replace(/[,٬،]/g, '')
    .trim();
  if (clean === '' || isNaN(Number(clean)) || clean.toLowerCase() === 'nan') return '-';
  const parts = clean.split('.');
  const intFormatted = Number(parts[0]).toLocaleString('en-US');
  return parts.length > 1 ? `${intFormatted}.${parts[1]}` : intFormatted;
};

// Safe fuel number formatter with 2 decimal places, preventing any "NaN"
export const formatFuelNumber = (val) => {
  if (val === null || val === undefined || val === '' || val === '-' || val === '—' || String(val).toLowerCase() === 'nan') return '0.00';
  const clean = String(val)
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/٫/g, '.')
    .replace(/[,٬،]/g, '')
    .trim();
  const num = parseFloat(clean);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Vector SVG Bar Chart for Two-Phase Print Layout (Full Height & Clear Visual Fidelity)
const TwoPhasePrintChart = ({ title, items }) => {
  const validItems = (items || []).filter(Boolean);
  const maxVal = Math.max(...validItems.map(i => safeCleanPrintNumber(i.totalMeters) || safeCleanPrintNumber(i.todayMeters) || 0), 100);
  return (
    <div style={{
      border: '1.5px solid #000000',
      background: '#ffffff',
      padding: '4px 6px',
      height: '100%',
      minHeight: '165px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxSizing: 'border-box'
    }}>
      <div style={{
        fontSize: '0.78rem',
        fontWeight: 900,
        textAlign: 'center',
        background: '#f8fafc',
        borderBottom: '1.5px solid #000000',
        padding: '3px 4px',
        marginBottom: '4px',
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
        minHeight: '115px',
        padding: '0 4px 4px 4px',
        borderBottom: '1.5px solid #000000'
      }}>
        {validItems.map((it, idx) => {
          if (!it) return null;
          const val = safeCleanPrintNumber(it.totalMeters) || safeCleanPrintNumber(it.todayMeters) || 0;
          const heightPercent = maxVal > 0 ? Math.min(100, Math.max(val > 0 ? 10 : 3, (val / maxVal) * 92)) : 3;
          return (
            <div key={idx} style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              justifyContent: 'flex-end'
            }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 900, marginBottom: '2px', color: '#000000', whiteSpace: 'nowrap' }}>
                {val > 0 ? (val >= 1000 ? `${(val/1000).toFixed(1)}k` : val) : ''}
              </span>
              <div style={{
                width: '78%',
                height: `${heightPercent}%`,
                background: it.color || '#2563eb',
                border: '1.5px solid #000000',
                borderRadius: '3px 3px 0 0',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)'
              }} />
              <span style={{
                fontSize: '0.62rem',
                fontWeight: 900,
                color: '#0f172a',
                marginTop: '4px',
                textAlign: 'center',
                lineHeight: 1.15,
                wordBreak: 'break-word',
                maxWidth: '56px'
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

/**
 * Universal Author & Creator Info Resolver
 * Automatically resolves the author's official Libyan agency title & name from the active account owner.
 */
export const getReportAuthorInfo = (report = {}, activeUser = null) => {
  let user = activeUser;
  if (!user && typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('portal_logged_user');
      if (saved) user = JSON.parse(saved);
    } catch (e) {}
  }

  // 1. If an active logged-in user exists, their actual account owner name ALWAYS takes top priority!
  if (user && user.name) {
    return {
      name: user.name,
      role: user.title || user.role || 'عضو جهاز الإشراف'
    };
  }

  // 2. Known official system mapping by username
  const rawUsername = String(
    report?.authorUsername ||
    report?.createdByUsername ||
    user?.username ||
    ''
  ).trim().toLowerCase();

  const OFFICIAL_MAP = {
    'admin': { name: 'م. حساب التطوير', role: 'حساب التطوير والإشراف البرمجي الكامل' },
    'dev': { name: 'م. حساب التطوير', role: 'حساب التطوير والإشراف البرمجي الكامل' },
    'developer': { name: 'م. حساب التطوير', role: 'حساب التطوير والإشراف البرمجي الكامل' },
    'development': { name: 'م. حساب التطوير', role: 'حساب التطوير والإشراف البرمجي الكامل' },
    'حساب التطوير': { name: 'م. حساب التطوير', role: 'حساب التطوير والإشراف البرمجي الكامل' },
    'project_manager': { name: 'م. عبدالرحمن الأنصاري', role: 'مدير المشروع' },
    'alansari': { name: 'م. عبدالرحمن الأنصاري', role: 'مدير المشروع' },
    'manager': { name: 'م. عبدالرحمن الأنصاري', role: 'مدير المشروع' },
    'abrikaw': { name: 'م. عبدالسلام ابريكاو', role: 'رئيس جهاز الإشراف والمتابعة' },
    'admin_sectors': { name: 'م. عبدالسلام ابريكاو', role: 'رئيس جهاز الإشراف والمتابعة' },
    'sectors': { name: 'م. عبدالسلام ابريكاو', role: 'رئيس جهاز الإشراف والمتابعة' },
    'saleh_quality': { name: 'م. صالح حماد', role: 'مسؤول ضبط ومراقبة الجودة الفنية' },
    'quality': { name: 'م. صالح حماد', role: 'مسؤول ضبط ومراقبة الجودة الفنية' },
    'hammad': { name: 'م. صالح حماد', role: 'مسؤول ضبط ومراقبة الجودة الفنية' },
    'salah_alarabi': { name: 'م. صلاح العربي', role: 'مهندس مشرف (المرحلة الأولى)' },
    'sector_a': { name: 'م. صلاح العربي', role: 'مهندس مشرف (المرحلة الأولى)' },
    'issa_altahir': { name: 'م. عيسى الطاهر', role: 'مهندس مشرف (المرحلة الثانية)' },
    'sector_b': { name: 'م. عيسى الطاهر', role: 'مهندس مشرف (المرحلة الثانية)' },
    'fuel_officer': { name: 'مسؤول الوقود والمحروقات', role: 'المواقع 107 و 240' },
  };

  if (rawUsername && OFFICIAL_MAP[rawUsername]) {
    return OFFICIAL_MAP[rawUsername];
  }

  // 3. Fallback to custom users in localStorage
  if (typeof window !== 'undefined' && rawUsername) {
    try {
      const rawCustom = localStorage.getItem('system_custom_users');
      if (rawCustom) {
        const customUsers = JSON.parse(rawCustom);
        if (Array.isArray(customUsers)) {
          const match = customUsers.find(u => u && String(u.username).trim().toLowerCase() === rawUsername);
          if (match && match.name) {
            return {
              name: match.name,
              role: match.title || match.role || 'عضو جهاز الإشراف'
            };
          }
        }
      }
    } catch (e) {}
  }

  // 4. Fallback to report fields if recorded previously
  const repName = report?.createdByName || report?.uploadedBy || report?.author || report?.engineer;
  if (repName && typeof repName === 'string' && repName.trim()) {
    const match = repName.match(/^([^(]+)(?:\(([^)]+)\))?/);
    if (match) {
      return {
        name: match[1].trim(),
        role: match[2]?.trim() || report?.authorRole || 'عضو جهاز الإشراف'
      };
    }
    return {
      name: repName.trim(),
      role: report?.authorRole || 'عضو جهاز الإشراف'
    };
  }

  return {
    name: 'م. حساب التطوير',
    role: 'حساب التطوير'
  };
};

export const OfficialPrintModal = ({ report, onClose, onForwardReport, currentUser }) => {
  if (!report) return null;

  const isSectorA = (report.sector || '').includes('الأولى') || (report.sector || '').includes('A') || (report.sector || '').includes('أ') || (report.crusherName || '').includes('A') || (report.crusherName || '').includes('الأولى');
  const sectorTitle = isSectorA ? 'المرحلة الأولى' : 'المرحلة الثانية';
  const companyTitle = report.companyName && !report.companyName.includes('شركة') ? report.companyName : sectorTitle;
  const totalLengthKm = isSectorA ? '115.36 كم' : '110.92 كم';

  const authorInfo = getReportAuthorInfo(report, currentUser);

  // Controlled Signatures (مدير القطاع وممثل الجهة المالكة)
  const [customSectorDirector, setCustomSectorDirector] = useState(report.sectorDirector || '');
  const [customOwnerRep, setCustomOwnerRep] = useState(report.ownerRepresentative || '');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.add('has-print-modal');
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('has-print-modal');
      }
    };
  }, []);

  useEffect(() => {
    if (report) {
      setCustomSectorDirector(report.sectorDirector || '');
      setCustomOwnerRep(report.ownerRepresentative || '');
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
      .replace(/[,٬،]/g, '');
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

        const grandSum = basicSum;
        const grandRem = Math.max(0, contractVal - grandSum);
        const grandPct = contractVal > 0 ? ((grandSum / contractVal) * 100).toFixed(2) : 0;

        dataRows.push([]);
        dataRows.push(['الإجمالي العام للموقف التنفيذي التعاقدي (البنود الأساسية):']);
        dataRows.push([`قيمة العقد: ${Number(contractVal).toLocaleString('en-US', { minimumFractionDigits: 3 })} د.ل`, `إجمالي المنفذ الفعلي: ${Number(grandSum).toLocaleString('en-US', { minimumFractionDigits: 2 })} د.ل`, `المتبقي المالي: ${Number(grandRem).toLocaleString('en-US', { minimumFractionDigits: 2 })} د.ل`, `نسبة الإنجاز: ${grandPct}%`]);

        dataRows.push([]);
        dataRows.push([`منشئ التقرير المعتمد: ${authorInfo.name} (${authorInfo.role})`]);
      } else if (report.isTargetedWorksReport || report.reportType === 'تقرير الأعمال المستهدفة' || (Array.isArray(report.targetedSections) && report.targetedSections.length > 0)) {
        dataRows = [
          [report.title ? report.title.replace(/يوم\s+يوم/g, 'يوم') : `بيان أعمال يوم ${cleanDayName(report.dayName)} ${report.dateFormatted || reportDateStr}`],
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

        // تم إلغاء الإجمالي العام للأطوال: كل قسم يحسب على حدة
        dataRows.push(['إجمالي المعدات والأطقم المستهدفة:', Number(report.totalTargetEquipment || 0)]);
        dataRows.push([]);
        dataRows.push(['مدير القطاع:', customSectorDirector || '', '', 'ممثل الجهة المالكة:', customOwnerRep || '']);
      } else if (report.isFuelReport || report.reportType === 'تقرير كميات الوقود اليومية' || (Array.isArray(report.fuelItems) && report.fuelItems.length > 0)) {
        dataRows = [
          ['تقرير كميات الوقود اليومية'],
          [`يوم ${cleanDayName(report.dayName)}`, report.dateFormatted || reportDateStr],
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
        dataRows.push([]);
        dataRows.push([`منشئ التقرير المعتمد: ${authorInfo.name} (${authorInfo.role})`]);
      } else if (Boolean(report.isPeriodicReport || report.reportType === 'تقرير دوري لأعمال الطريق' || report.reportCategory === 'periodic' || report.periodicType)) {
        dataRows = [
          ['مشروع صيانة طريق أوباري غات - ' + (report.reportTitle || report.title || 'التقرير الدوري لأعمال الطريق')],
          [`الفترة: من ${report.startDate || ''} إلى ${report.endDate || ''}`, `رقم التقرير: ${reportNumber}`],
          [],
          ['م', 'البند / الطبقة', 'منجز الفترة (م.ط)', 'المساحة (م²)', 'الحجم (م³)', 'الفئة التعاقدية (د.ل)', 'القيمة المنفذة (د.ل)', 'التراكمي الكلي (م.ط)']
        ];
        (report.layers || []).forEach((l, idx) => {
          dataRows.push([
            idx + 1,
            l.name,
            l.periodMeters || 0,
            l.periodArea || 0,
            l.periodVolume || '—',
            l.volumeRate ? `${l.volumeRate} /م³` : l.kmRate ? `${l.kmRate} /كم` : `${l.areaRate} /م²`,
            l.periodValue || 0,
            l.totalCumulativeMeters || 0
          ]);
        });
        dataRows.push([]);
        dataRows.push(['الإجمالي المعتمد:', '', '—', '—', '—', '', report.totalValue || 0, '']);
        dataRows.push([]);
        dataRows.push([`منشئ التقرير المعتمد: ${authorInfo.name} (${authorInfo.role})`]);
      } else if (Boolean(report.isTwoPhaseProgressReport || report.reportType === 'تقرير إنجاز المرحلتين' || report.reportCategory === 'two_phase' || (Array.isArray(report.phase1Items) && report.phase1Items.length > 0))) {
        dataRows = [
          ['مشروع صيانة طريق أوباري غات - تقرير الأعمال المنجزة للمرحلتين'],
          [`التاريخ: ${report.dateFormatted || reportDateStr}`, `اليوم: يوم ${cleanDayName(report.dayName)}`, `رقم التقرير: ${reportNumber}`],
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
        dataRows.push([`منشئ التقرير المعتمد: ${authorInfo.name} (${authorInfo.role})`]);
      } else if (Array.isArray(report.items) && report.items.length > 0) {
        dataRows = [
          [report.title ? report.title.replace(/يوم\s+يوم/g, 'يوم') : `تقرير أعمال يوم ${cleanDayName(report.dayName)} ${reportDateStr}`],
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
        // تم إلغاء الإجمالي العام المركب للأعمال: كل بند يحسب على حدة
        dataRows.push([]);
        dataRows.push([`مدير القطاع: ${customSectorDirector || '................'}`, '', '', `ممثل الجهة المالكة: ${customOwnerRep || '................'}`]);
      } else {
        dataRows = [
          ['مكتب جهاز الإشراف والمتابعة - مشروع صيانة وتطوير طريق أوباري - غات (360 كم)'],
          ['التقرير الفني والتشغيلي اليومي المعتمد'],
          ['رقم التقرير', reportNumber, 'التاريخ', reportDateStr],
          ['المرحلة التنفيذية', sectorTitle, 'الشركة المنفذة', companyTitle],
          ['المعد / المشرف', authorInfo.name + (authorInfo.role ? ` (${authorInfo.role})` : ''), 'حالة الاعتماد', report.status === 'approved' ? 'معتمد رسمياً' : 'قيد المراجعة'],
          [],
          ['م', 'البند التشغيلي / الفني', 'الموقع / الآلية المحددة', 'الكمية المنجزة اليوم', 'الوحدة', 'الملاحظات'],
          [1, 'أعمال طبقة الأساس الحبيبي', `مسار ${sectorTitle}`, Number(report.roadMeters || report.todayMeters || 0), 'م.ط', 'تنفيذ طبقة الأساس الحبيبي'],
          [2, 'أعمال الرصف المنفذة اليوم', `مسار ${sectorTitle}`, Number(report.roadMeters || report.salesAmount || 0), 'م.ط', 'تنفيذ طبقات الطريق'],
          [3, 'الوقود المستهلك (ديزل)', 'خزان المرحلة والآليات', Number(report.fuelAmount || 0), 'لتر', 'تزويد أسطول المعدات والآليات بالوقود'],
          [4, 'الآليات العاملة بالمرحلة', 'المعدات الميدانية', Number(report.workingEquipmentCount || (isSectorA ? 12 : 14)), 'آلية عاملة', 'جاهزية تشغيلية مستقرة'],
          [5, 'الآليات المتوقفة / الصيانة', 'ورشة الصيانة', Number(report.stoppedEquipmentCount || 2), 'آلية متوقفة', 'صيانة دورية'],
          [],
          ['بيان الأعمال والملاحظات الفنية:', report.notes || 'تمت الأعمال وفقاً للمواصفات القياسية المعتمدة من جهاز الإشراف'],
          [],
          ['منشئ التقرير المعتمد:', `${authorInfo.name} (${authorInfo.role})`]
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
  const isPeriodicDoc = !isExecutiveDoc && Boolean(
    report.isPeriodicReport || 
    report.reportType === 'تقرير دوري لأعمال الطريق' || 
    report.reportCategory === 'periodic' || 
    report.periodicType
  );
  const isRoadDoc = Boolean(
    !isExecutiveDoc &&
    !isTargetedWorksDoc && 
    !isFuelDoc && 
    !isTwoPhaseDoc && 
    !isPeriodicDoc &&
    (
      (Array.isArray(report.items) && report.items.length > 0) ||
      report.reportType === 'تقرير أعمال يومي' ||
      report.reportType === 'تقرير أعمال الطريق اليومي' ||
      (report.title && report.title.includes('بيان أعمال'))
    )
  );
  const isEquipmentDoc = !isExecutiveDoc && Boolean(
    report.isEquipmentReport ||
    report.reportType === 'سجل المعدات والآليات الميدانية' ||
    report.reportType === 'تقرير وسجل المعدات والآليات الميدانية' ||
    report.reportCategory === 'equipment' ||
    (Array.isArray(report.equipmentList) && report.equipmentList.length > 0)
  );
  const isStandardNewForm = isTargetedWorksDoc || isFuelDoc || isTwoPhaseDoc || isRoadDoc || isExecutiveDoc || isEquipmentDoc || isPeriodicDoc;
  
  // Default orientation: Portrait for executive progress, landscape for wide multi-column reports
  const [printOrientation, setPrintOrientation] = useState(() => (isExecutiveDoc ? 'portrait' : 'landscape'));

  // Dynamically update document.head @page rule so Chromium/Edge instantly detects orientation and compact margins
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
        margin: ${printOrientation === 'portrait' ? '4mm 5mm' : '3mm 4mm'};
      }
    `;
  }, [printOrientation]);

  // Default optimal zoom level to guarantee fitting 100% on a single page (صفحة واحدة)
  const [zoomLevel, setZoomLevel] = useState(() => {
    if (isTwoPhaseDoc) return 76;
    if (isExecutiveDoc) return 80;
    if (isTargetedWorksDoc) return 85;
    if (isRoadDoc) return 90;
    return 100;
  });

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
      {/* Dynamic Print Rules for Single Page Fit and Exact Form Colors */}
      <style>{`
        @page {
          size: ${printOrientation === 'portrait' ? 'A4 portrait' : 'A4 landscape'};
          margin: ${printOrientation === 'portrait' ? '4mm 5mm' : '3mm 4mm'};
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
          .signatures-block,
          .report-creator-official-strip {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          body > *:not(.official-print-modal-overlay),
          .official-print-modal-overlay ~ *,
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
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
          }
          #root { display: none !important; min-height: 0 !important; height: 0 !important; max-height: 0 !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; }
          .official-print-modal-overlay {
            position: static !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
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
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
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
            zoom: ${zoomLevel / 100} !important;
            transform: none !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
            page-break-before: avoid !important;
            break-before: avoid !important;
          }
          .official-print-document > *:last-child,
          .official-print-document div:last-child {
            margin-bottom: 0 !important;
            padding-bottom: 0 !important;
          }
          .official-print-document table {
            width: 100% !important;
            max-width: 100% !important;
            table-layout: auto !important;
            page-break-inside: auto !important;
            break-inside: auto !important;
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
              onClick={() => {
                if (isTwoPhaseDoc) {
                  setPrintOrientation('portrait');
                  setZoomLevel(75);
                } else if (isExecutiveDoc) {
                  setPrintOrientation('portrait');
                  setZoomLevel(80);
                } else if (isTargetedWorksDoc) {
                  setPrintOrientation('portrait');
                  setZoomLevel(85);
                } else if (isRoadDoc) {
                  setPrintOrientation('landscape');
                  setZoomLevel(90);
                } else if (isFuelDoc) {
                  setPrintOrientation('landscape');
                  setZoomLevel(90);
                } else {
                  setZoomLevel(95);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '0.45rem 0.8rem',
                borderRadius: '6px',
                border: 'none',
                background: '#16a34a',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)'
              }}
              title="ملاءمة ذكية لطباعة التقرير بالكامل في صفحة واحدة A4 دون أي انقسام"
            >
              <Maximize2 size={14} />
              <span>📄 صفحة واحدة (1 Page)</span>
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

          {onForwardReport && (
            <button
              onClick={() => onForwardReport(report)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
              }}
              title="إحالة التقرير رسمياً إلى البريد والمراسلات"
            >
              <Send size={16} />
              <span>إحالة التقرير</span>
            </button>
          )}

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
      {(isRoadDoc || isTargetedWorksDoc) ? (
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
                onClick={() => handleSectorDirectorChange('')} 
                style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '5px', border: '1px solid #cbd5e1', background: !customSectorDirector ? '#fee2e2' : '#f8fafc', color: !customSectorDirector ? '#991b1b' : '#64748b', fontWeight: 800, cursor: 'pointer' }}
              >
                فارغ (يدوي)
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
                onClick={() => handleOwnerRepChange('')} 
                style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '5px', border: '1px solid #cbd5e1', background: !customOwnerRep ? '#fee2e2' : '#f8fafc', color: !customOwnerRep ? '#991b1b' : '#64748b', fontWeight: 800, cursor: 'pointer' }}
              >
                فارغ (يدوي)
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
      ) : (
        <div className="no-print" style={{
          background: '#f8fafc',
          borderBottom: '2px solid #e2e8f0',
          padding: '0.65rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.86rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontWeight: 800, color: '#334155' }}>👤 اسم منشئ التقرير (آلياً):</span>
            <span style={{ fontWeight: 900, color: '#1e3a8a', background: '#dbeafe', padding: '3px 10px', borderRadius: '6px' }}>
              {authorInfo.name} {authorInfo.role ? `(${authorInfo.role})` : ''}
            </span>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>
            ℹ️ التوقيعات معتمدة حصرياً في تقارير أعمال الطريق والتقرير المستهدف
          </span>
        </div>
      )}

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
            <div style={{ marginBottom: '0.4rem', direction: 'rtl', fontFamily: 'inherit' }}>
              
              {/* Official Libyan Agency Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '2px solid #000000',
                paddingBottom: '2px',
                marginBottom: '4px'
              }}>
                <div style={{ textAlign: 'right', minWidth: '180px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.78rem', fontWeight: 900, color: '#000000' }}>دولة ليبيا</h4>
                  <h3 style={{ margin: '1px 0', fontSize: '0.84rem', fontWeight: 900, color: '#000000' }}>وزارة المواصلات</h3>
                  <h2 style={{ margin: '1px 0', fontSize: '0.90rem', fontWeight: 900, color: '#1e3a8a' }}>جهاز تنفيذ مشروعات المواصلات</h2>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155' }}>مكتب جهاز الإشراف والمتابعة</div>
                </div>

                <div style={{ textAlign: 'center', flex: 1, padding: '0 0.5rem' }}>
                  <h1 style={{ margin: 0, fontSize: '1.14rem', fontWeight: 900, color: '#000000', letterSpacing: '-0.2px' }}>
                    {report.projectName || 'مشروع صيانة طريق اوباري غات بطول 360 كيلومتر'}
                  </h1>
                  <h2 style={{ margin: '2px 0 0', fontSize: '1.02rem', fontWeight: 900, color: '#0f172a' }}>
                    {report.reportTitle || 'الموقف التنفيذي.'}
                  </h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px', justifyContent: 'flex-end' }}>
                  <div style={{ textAlign: 'left', fontSize: '0.72rem', fontWeight: 800, lineHeight: 1.25 }}>
                    <div><span style={{ color: '#64748b' }}>المرجع:</span> <strong dir="ltr" style={{ color: '#000' }}>{report.reportNumber || '093436_24.10.2026'}</strong></div>
                    <div><span style={{ color: '#64748b' }}>التاريخ:</span> <strong dir="ltr" style={{ color: '#000' }}>{report.reportDate || '24/10/2026'}</strong></div>
                    <div><span style={{ color: '#64748b' }}>الحالة:</span> <strong style={{ color: '#16a34a' }}>معتمد رسمياً</strong></div>
                  </div>
                  <img 
                    src={`${import.meta.env.BASE_URL}logo-agency.jpg`} 
                    alt="شعار الجهاز" 
                    style={{
                      width: '46px',
                      height: '46px',
                      objectFit: 'contain',
                      borderRadius: '50%',
                      border: '1.5px solid #000000',
                      padding: '1px'
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
                padding: '3px 10px',
                fontWeight: 900,
                fontSize: '0.82rem',
                marginBottom: '4px'
              }}>
                <div>
                  <span>قيمة العقد: </span>
                  <strong style={{ color: '#1e3a8a', fontSize: '0.94rem' }} dir="ltr">
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
                fontSize: '0.70rem',
                lineHeight: 1.15,
                border: '1.5px solid #000000',
                marginBottom: '4px'
              }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #000000' }}>
                    <th style={{ border: '1px solid #000000', padding: '3px 2px', width: '30px', fontWeight: 900 }}>البند</th>
                    <th style={{ border: '1px solid #000000', padding: '3px 5px', textAlign: 'right', fontWeight: 900 }}>الوصف</th>
                    <th style={{ border: '1px solid #000000', padding: '3px 2px', width: '45px', fontWeight: 900 }}>الوحدة</th>
                    <th style={{ border: '1px solid #000000', padding: '3px 2px', width: '85px', fontWeight: 900 }}>كمية العقد</th>
                    <th style={{ border: '1px solid #000000', padding: '3px 2px', width: '85px', fontWeight: 900 }}>المنفذ</th>
                    <th style={{ border: '1px solid #000000', padding: '3px 2px', width: '85px', fontWeight: 900 }}>المتبقي</th>
                    <th style={{ border: '1px solid #000000', padding: '3px 2px', width: '80px', fontWeight: 900 }}>الفئة (د.ل)</th>
                    <th style={{ border: '1px solid #000000', padding: '3px 2px', width: '105px', fontWeight: 900 }}>قيمة المنفذ</th>
                    <th style={{ border: '1px solid #000000', padding: '3px 2px', width: '60px', fontWeight: 900 }}>النسبة %</th>
                  </tr>
                </thead>
                <tbody>
                  {/* شريط الأقسام الأصفر: بنود أساسية */}
                  <tr style={{ background: '#fef08a', color: '#000000', fontWeight: 900 }}>
                    <td colSpan={9} style={{ border: '1px solid #000000', padding: '2px 6px', textAlign: 'right', fontSize: '0.74rem' }}>
                      بنود أساسية
                    </td>
                  </tr>

                  {(report.basicItems || []).map((item, idx) => {
                    const prev = idx > 0 ? report.basicItems[idx - 1] : null;
                    const showSec = !prev || prev.section !== item.section;
                    return (
                      <React.Fragment key={item.id || idx}>
                        {showSec && item.section && (
                          <tr style={{ background: '#fef08a', color: '#000000', fontWeight: 900 }}>
                            <td colSpan={9} style={{ border: '1px solid #000000', padding: '2px 6px', textAlign: 'right', fontSize: '0.72rem' }}>
                              {item.section}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td style={{ border: '1px solid #000000', padding: '2px 2px', fontWeight: 800 }}>{item.itemNumber || idx + 1}</td>
                          <td style={{ border: '1px solid #000000', padding: '2px 5px', textAlign: 'right', fontWeight: 600, lineHeight: 1.15, fontSize: '0.68rem' }}>
                            {item.description}
                          </td>
                          <td style={{ border: '1px solid #000000', padding: '2px 2px', fontWeight: 700 }}>{item.unit}</td>
                          <td style={{ border: '1px solid #000000', padding: '2px', fontWeight: 700 }} dir="ltr">
                            {item.contractQuantity !== '' && item.contractQuantity !== null && item.contractQuantity !== undefined ? fmtNum(item.contractQuantity) : '—'}
                          </td>
                          <td style={{ border: '1px solid #000000', padding: '2px', fontWeight: 800, color: '#166534' }} dir="ltr">
                            {item.executedQuantity !== '' && item.executedQuantity !== null && item.executedQuantity !== undefined && Number(item.executedQuantity) > 0 ? fmtNum(item.executedQuantity) : '—'}
                          </td>
                          <td style={{ border: '1px solid #000000', padding: '2px', fontWeight: 700, color: '#9a3412' }} dir="ltr">
                            {item.remainingQuantity !== '' && item.remainingQuantity !== null && item.remainingQuantity !== undefined && Number(item.remainingQuantity) > 0 ? fmtNum(item.remainingQuantity) : '—'}
                          </td>
                          <td style={{ border: '1px solid #000000', padding: '2px', fontWeight: 800 }} dir="ltr">
                            {item.unitRate !== '' && item.unitRate !== null && item.unitRate !== undefined ? fmtNum(item.unitRate) : '—'}
                          </td>
                          <td style={{ border: '1px solid #000000', padding: '2px', fontWeight: 900 }} dir="ltr">
                            {item.executedValue !== '' && item.executedValue !== null && item.executedValue !== undefined && Number(item.executedValue) > 0 ? fmtNum(item.executedValue) : '—'}
                          </td>
                          <td style={{ border: '1px solid #000000', padding: '2px', fontWeight: 900, color: '#1e40af' }} dir="ltr">
                            {item.percentage !== '' && item.percentage !== null && item.percentage !== undefined && Number(item.percentage) > 0 ? `${fmtNum(item.percentage, 2, 2)}%` : '—'}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}

                  {/* سطر إجمالي البنود الأساسية */}
                  <tr style={{ background: '#f8fafc', fontWeight: 900, borderTop: '2px solid #000000', borderBottom: '2px solid #000000' }}>
                    <td colSpan={7} style={{ border: '1px solid #000000', padding: '3px 8px', textAlign: 'left', fontSize: '0.78rem' }}>
                      إجمالي البنود الأساسية
                    </td>
                    <td style={{ border: '1px solid #000000', padding: '3px', fontSize: '0.80rem', fontWeight: 900 }} dir="ltr">
                      {fmtNum(report.calculations?.basicExecutedSum || (report.basicItems || []).reduce((acc, it) => acc + (Number(it.executedValue) || 0), 0))} د.ل
                    </td>
                    <td style={{ border: '1px solid #000000', padding: '3px', fontSize: '0.80rem', color: '#166534', fontWeight: 900 }} dir="ltr">
                      %{fmtNum(report.calculations?.basicPercentage || (((report.basicItems || []).reduce((acc, it) => acc + (Number(it.executedValue) || 0), 0) / (report.contractValue || report.calculations?.contractVal || 897665675.03)) * 100), 2, 2)}
                    </td>
                  </tr>

                  </tbody>
              </table>

              {/* Additional Items Section (بنود إضافية خارج العقد) */}
              {Array.isArray(report.additionalItems) && report.additionalItems.length > 0 && (
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'center',
                  fontSize: '0.70rem',
                  lineHeight: 1.15,
                  border: '1.5px solid #000000',
                  marginBottom: '4px'
                }}>
                  <thead>
                    <tr style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 900 }}>
                      <th colSpan={6} style={{ border: '1px solid #000000', padding: '2px 6px', textAlign: 'right', fontSize: '0.74rem' }}>
                        بنود إضافية (أعمال خارج نطاق العقد الأصلي - لا تُضاف لإجمالي العقد ولا لنسبة الإنجاز التعاقدية)
                      </th>
                    </tr>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #000000' }}>
                      <th style={{ border: '1px solid #000000', padding: '3px 2px', width: '30px', fontWeight: 900 }}>البند</th>
                      <th style={{ border: '1px solid #000000', padding: '3px 5px', textAlign: 'right', fontWeight: 900 }}>الوصف</th>
                      <th style={{ border: '1px solid #000000', padding: '3px 2px', width: '45px', fontWeight: 900 }}>الوحدة</th>
                      <th style={{ border: '1px solid #000000', padding: '3px 2px', width: '85px', fontWeight: 900 }}>المنفذ</th>
                      <th style={{ border: '1px solid #000000', padding: '3px 2px', width: '80px', fontWeight: 900 }}>الفئة (د.ل)</th>
                      <th style={{ border: '1px solid #000000', padding: '3px 2px', width: '105px', fontWeight: 900 }}>قيمة المنفذ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.additionalItems.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td style={{ border: '1px solid #000000', padding: '2px 2px', fontWeight: 800 }}>{item.itemNumber || idx + 1}</td>
                        <td style={{ border: '1px solid #000000', padding: '2px 5px', textAlign: 'right', fontWeight: 600 }}>{item.description}</td>
                        <td style={{ border: '1px solid #000000', padding: '2px 2px', fontWeight: 700 }}>{item.unit}</td>
                        <td style={{ border: '1px solid #000000', padding: '2px', fontWeight: 800 }} dir="ltr">{fmtNum(item.executedQuantity)}</td>
                        <td style={{ border: '1px solid #000000', padding: '2px', fontWeight: 800 }} dir="ltr">{fmtNum(item.unitRate)}</td>
                        <td style={{ border: '1px solid #000000', padding: '2px', fontWeight: 900 }} dir="ltr">{fmtNum(item.executedValue)}</td>
                      </tr>
                    ))}
                    <tr style={{ background: '#f8fafc', fontWeight: 900, borderTop: '2px solid #000000' }}>
                      <td colSpan={5} style={{ border: '1px solid #000000', padding: '3px 8px', textAlign: 'left', fontSize: '0.78rem' }}>
                        إجمالي البنود الإضافية (خارج العقد):
                      </td>
                      <td style={{ border: '1px solid #000000', padding: '3px', fontSize: '0.80rem', fontWeight: 900, color: '#0369a1' }} dir="ltr">
                        {fmtNum(report.calculations?.additionalExecutedSum || (report.additionalItems || []).reduce((acc, it) => acc + (Number(it.executedValue) || 0), 0))} د.ل
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
              {/* Grand Summary 4-Box Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                border: '1.5px solid #000000',
                background: '#f8fafc',
                marginBottom: '4px',
                textAlign: 'center'
              }}>
                <div style={{ padding: '3px', borderLeft: '1px solid #000000' }}>
                  <div style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 800 }}>قيمة العقد المعتمدة</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 900, color: '#000000' }} dir="ltr">
                    {fmtNum(report.contractValue || report.calculations?.contractVal || 897665675.03, 3, 3)} د.ل
                  </div>
                </div>
                <div style={{ padding: '3px', borderLeft: '1px solid #000000' }}>
                  <div style={{ fontSize: '0.68rem', color: '#166534', fontWeight: 800 }}>إجمالي المنفذ الفعلي</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 900, color: '#166534' }} dir="ltr">
                    {fmtNum(report.calculations?.basicExecutedSum || (report.basicItems || []).reduce((acc, it) => acc + (Number(it.executedValue) || 0), 0))} د.ل
                  </div>
                </div>
                <div style={{ padding: '3px', borderLeft: '1px solid #000000' }}>
                  <div style={{ fontSize: '0.68rem', color: '#c2410c', fontWeight: 800 }}>المتبقي المالي من العقد</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 900, color: '#ea580c' }} dir="ltr">
                    {fmtNum(report.calculations?.grandRemainingVal || Math.max(0, (report.contractValue || report.calculations?.contractVal || 897665675.03) - (report.basicItems || []).reduce((acc, it) => acc + (Number(it.executedValue) || 0), 0)))} د.ل
                  </div>
                </div>
                <div style={{ padding: '3px' }}>
                  <div style={{ fontSize: '0.68rem', color: '#1e40af', fontWeight: 800 }}>نسبة الإنجاز المالي الإجمالية</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#1d4ed8' }} dir="ltr">
                    %{fmtNum(report.calculations?.basicPercentage || (((report.basicItems || []).reduce((acc, it) => acc + (Number(it.executedValue) || 0), 0) / (report.contractValue || report.calculations?.contractVal || 897665675.03)) * 100), 2, 2)}
                  </div>
                </div>
              </div>

              {/* Official Creator Strip (اسم منشئ التقرير يحدد تلقائياً من اسم المستخدم) */}
              <div className="report-creator-official-strip" style={{
                border: '1.5px solid #000000',
                padding: '4px 10px',
                background: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.80rem', fontWeight: 900, color: '#000000' }}>اسم منشئ التقرير:</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#1e3a8a', borderBottom: '1.5px dotted #1e3a8a', paddingBottom: '1px' }}>
                    {authorInfo.name}
                  </span>
                  {authorInfo.role && (
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569' }}>
                      ({authorInfo.role})
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                  اعتماد وتوثيق آلي بنظام جهاز الإشراف
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
                <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900 }}>
                  {report.title ? report.title.replace(/يوم\s+يوم/g, 'يوم') : `بيان أعمال يوم ${cleanDayName(report.dayName)} ${report.dateFormatted || reportDateStr}`}
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

              {/* Operational Summary Bar */}
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem 1.25rem',
                background: '#f8fafc',
                border: '2px solid #000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontWeight: 900,
                fontSize: '0.95rem',
                color: '#000000'
              }}>
                <span>ملخص جاهزية ومعدات الأقسام التشغيلية المستهدفة:</span>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <span>إجمالي المعدات والأطقم بالميدان: {Number(report.totalTargetEquipment || 0).toLocaleString('en-US')} آلية/طاقم</span>
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
                <span style={{ direction: 'rtl' }}>يوم {cleanDayName(report.dayName)}</span>
              </div>

              {/* Official Fuel Table */}
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'center',
                fontSize: '0.95rem',
                border: '2px solid #000000'
              }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#000000', fontWeight: 900 }}>
                    <th style={{ border: '2px solid #000000', padding: '0.6rem 0.4rem', width: '50px' }}>ت</th>
                    <th style={{ border: '2px solid #000000', padding: '0.6rem 0.8rem', width: '23%' }}>الموقع</th>
                    <th style={{ border: '2px solid #000000', padding: '0.6rem 0.8rem', width: '25%' }}>الكمية المصروفة (لتر)</th>
                    <th style={{ border: '2px solid #000000', padding: '0.6rem 0.8rem', width: '23%' }}>الوارد (لتر)</th>
                    <th style={{ border: '2px solid #000000', padding: '0.6rem 0.8rem', width: '25%' }}>الكمية المتبقية (لتر)</th>
                  </tr>
                </thead>
                <tbody>
                  {(report.fuelItems || []).map((row, idx) => (
                    <tr key={idx} style={{ background: '#ffffff' }}>
                      <td style={{ border: '2px solid #000000', padding: '0.55rem', fontWeight: 900 }}>
                        {idx + 1}
                      </td>
                      <td style={{ border: '2px solid #000000', padding: '0.55rem 0.8rem', fontWeight: 800 }}>
                        {row.location || '-'}
                      </td>
                      <td style={{ border: '2px solid #000000', padding: '0.55rem', fontWeight: 800 }} dir="ltr">
                        {formatFuelNumber(row.dispatchedLiters)}
                      </td>
                      <td style={{ border: '2px solid #000000', padding: '0.55rem', fontWeight: 800 }} dir="ltr">
                        {formatFuelNumber(row.receivedLiters)}
                      </td>
                      <td style={{ border: '2px solid #000000', padding: '0.55rem', fontWeight: 800 }} dir="ltr">
                        {formatFuelNumber(row.remainingLiters)}
                      </td>
                    </tr>
                  ))}

                  {/* Bright Yellow Footer Row matching photo exactly */}
                  <tr style={{ background: '#ffff00', color: '#000000', fontWeight: 900 }}>
                    <td colSpan={2} style={{ border: '2px solid #000000', padding: '0.65rem', fontSize: '1.05rem', textAlign: 'center' }}>
                      الإجمالي (لتر)
                    </td>
                    <td style={{ border: '2px solid #000000', padding: '0.65rem', fontSize: '1.05rem', fontWeight: 900 }} dir="ltr">
                      {formatFuelNumber(report.totalDispatchedLiters || report.fuelAmount || (report.fuelItems || []).reduce((acc, c) => acc + (safeCleanPrintNumber(c.dispatchedLiters) || 0), 0))}
                    </td>
                    <td style={{ border: '2px solid #000000', padding: '0.65rem', fontSize: '1.05rem', fontWeight: 900 }} dir="ltr">
                      {formatFuelNumber(report.totalReceivedLiters || (report.fuelItems || []).reduce((acc, c) => acc + (safeCleanPrintNumber(c.receivedLiters) || 0), 0))}
                    </td>
                    <td style={{ border: '2px solid #000000', padding: '0.65rem', fontSize: '1.05rem', fontWeight: 900 }} dir="ltr">
                      {formatFuelNumber(report.totalRemainingLiters || (report.fuelItems || []).reduce((acc, c) => acc + (safeCleanPrintNumber(c.remainingLiters) || 0), 0))}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Official Creator Strip (اسم منشئ التقرير يحدد تلقائياً من اسم المستخدم) */}
              <div className="report-creator-official-strip" style={{
                marginTop: '1.25rem',
                marginBottom: '0.25rem',
                padding: '10px 16px',
                border: '1.5px solid #000000',
                background: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pageBreakInside: 'avoid',
                breakInside: 'avoid'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#000000' }}>اسم منشئ التقرير:</span>
                  <span style={{ fontSize: '1rem', fontWeight: 900, color: '#1e3a8a', borderBottom: '1.5px dotted #1e3a8a', paddingBottom: '2px' }}>
                    {authorInfo.name}
                  </span>
                  {authorInfo.role && (
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>
                      ({authorInfo.role})
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>
                  اعتماد وتوثيق آلي بنظام جهاز الإشراف
                </div>
              </div>
            </div>
          
          ) : isEquipmentDoc ? (
            /* 2.5 Official Equipment Report (سجل المعدات والآليات الميدانية مع الشعار) */
            <div style={{ marginBottom: '0.5rem', direction: 'rtl', width: '100%' }}>
              {/* Official Libyan Agency Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '2.5px solid #000000',
                paddingBottom: '0.5rem',
                marginBottom: '0.75rem'
              }}>
                <div style={{ textAlign: 'right' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#000000' }}>دولة ليبيا</h4>
                  <h3 style={{ margin: '0.1rem 0', fontSize: '1.05rem', fontWeight: 900, color: '#000000' }}>وزارة المواصلات</h3>
                  <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#1e3a8a' }}>جهاز تنفيذ مشروعات المواصلات</h2>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>مكتب جهاز الإشراف والمتابعة</p>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <img
                    src={`${import.meta.env.BASE_URL}logo-agency.jpg`}
                    alt="شعار جهاز تنفيذ مشروعات المواصلات"
                    style={{
                      width: '74px',
                      height: '74px',
                      objectFit: 'contain',
                      borderRadius: '50%',
                      border: '1.5px solid #000000',
                      padding: '2px',
                      display: 'inline-block'
                    }}
                  />
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e3a8a', marginTop: '0.2rem' }}>
                    جهاز الإشراف المعتمد
                  </div>
                </div>

                <div style={{ textAlign: 'left', direction: 'ltr', fontSize: '0.88rem', fontWeight: 800, color: '#000000' }}>
                  <div><strong>Report No:</strong> {report.reportNumber || 'EQP-REP-2026'}</div>
                  <div><strong>Date:</strong> {report.dateFormatted || (report.date ? report.date.split('T')[0] : '2026-10-29')}</div>
                  <div><strong>Project:</strong> Obari - Ghat (360 km)</div>
                </div>
              </div>

              {/* Cyan Header Title Banner */}
              <div style={{
                background: '#38bdf8',
                color: '#000000',
                textAlign: 'center',
                padding: '0.65rem 1.25rem',
                borderRadius: '4px',
                border: '2px solid #000000',
                marginBottom: '0.75rem'
              }}>
                <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>
                  كشف وسجل حصر المعدات والآليات الميدانية العاملة بالمشروع
                </h1>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', fontWeight: 800 }}>
                  مشروع صيانة وتطوير طريق أوباري - غات بطول 360 كم (المرحلة الأولى: 226.08 كم • المرحلة الثانية: 133.92 كم)
                </p>
              </div>

              {/* Statistics Strip */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '0.5rem',
                marginBottom: '0.75rem',
                textAlign: 'center'
              }}>
                <div style={{ border: '1.5px solid #000000', background: '#f8fafc', padding: '0.4rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800 }}>إجمالي الأسطول</div>
                  <strong style={{ fontSize: '1.15rem', color: '#1e3a8a' }}>{report.totalCount || (report.equipmentList || []).reduce((a, b) => a + (b.count || 1), 0)} آلية</strong>
                </div>
                <div style={{ border: '1.5px solid #000000', background: '#f0fdf4', padding: '0.4rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800 }}>العاملة والجاهزة</div>
                  <strong style={{ fontSize: '1.15rem', color: '#16a34a' }}>{report.operationalCount || (report.equipmentList || []).reduce((a, b) => a + (b.operationalCount || 1), 0)} آلية</strong>
                </div>
                <div style={{ border: '1.5px solid #000000', background: '#fef2f2', padding: '0.4rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800 }}>في الصيانة</div>
                  <strong style={{ fontSize: '1.15rem', color: '#dc2626' }}>{report.maintenanceCount || 0}</strong>
                </div>
                <div style={{ border: '1.5px solid #000000', background: '#eff6ff', padding: '0.4rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800 }}>المرحلة الأولى</div>
                  <strong style={{ fontSize: '1.15rem', color: '#2563eb' }}>{report.phase1Count || (report.equipmentList || []).reduce((a, b) => a + (b.phase1Count || 0), 0)} آلية</strong>
                </div>
                <div style={{ border: '1.5px solid #000000', background: '#fffbeb', padding: '0.4rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800 }}>المرحلة الثانية</div>
                  <strong style={{ fontSize: '1.15rem', color: '#d97706' }}>{report.phase2Count || (report.equipmentList || []).reduce((a, b) => a + (b.phase2Count || 0), 0)} آلية</strong>
                </div>
              </div>

              {/* Equipment Table */}
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'center',
                fontSize: '0.88rem',
                border: '2px solid #000000',
                marginBottom: '0.85rem'
              }}>
                <thead>
                  <tr style={{ background: '#ffc000', color: '#000000', fontWeight: 900 }}>
                    <th style={{ border: '1.5px solid #000000', padding: '0.45rem', width: '38px' }}>م</th>
                    <th style={{ border: '1.5px solid #000000', padding: '0.45rem 0.75rem', width: '28%', textAlign: 'right' }}>بيان واسم الآلية / المعدة</th>
                    <th style={{ border: '1.5px solid #000000', padding: '0.45rem', width: '18%' }}>التصنيف الفني</th>
                    <th style={{ border: '1.5px solid #000000', padding: '0.45rem', width: '9%' }}>الإجمالي</th>
                    <th style={{ border: '1.5px solid #000000', padding: '0.45rem', width: '9%' }}>العاملة</th>
                    <th style={{ border: '1.5px solid #000000', padding: '0.45rem', width: '8%' }}>صيانة</th>
                    <th style={{ border: '1.5px solid #000000', padding: '0.45rem', width: '9%' }}>م. الأولى</th>
                    <th style={{ border: '1.5px solid #000000', padding: '0.45rem', width: '9%' }}>م. الثانية</th>
                    <th style={{ border: '1.5px solid #000000', padding: '0.45rem 0.75rem' }}>الحالة التشغيلية وملاحظات العمل</th>
                  </tr>
                </thead>
                <tbody>
                  {(report.equipmentList || []).map((eq, idx) => (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ border: '1.5px solid #000000', padding: '0.35rem', fontWeight: 900, background: '#fffbeb' }}>
                        {idx + 1}
                      </td>
                      <td style={{ border: '1.5px solid #000000', padding: '0.35rem 0.65rem', textAlign: 'right', fontWeight: 800 }}>
                        {eq.name}
                      </td>
                      <td style={{ border: '1.5px solid #000000', padding: '0.35rem', fontWeight: 700 }}>
                        {eq.type || 'معدات الطريق'}
                      </td>
                      <td style={{ border: '1.5px solid #000000', padding: '0.35rem', fontWeight: 900, color: '#1e3a8a' }}>
                        {eq.count || 1}
                      </td>
                      <td style={{ border: '1.5px solid #000000', padding: '0.35rem', fontWeight: 900, color: '#16a34a' }}>
                        {eq.operationalCount || 1}
                      </td>
                      <td style={{ border: '1.5px solid #000000', padding: '0.35rem', fontWeight: 900, color: eq.maintenanceCount > 0 ? '#dc2626' : '#64748b' }}>
                        {eq.maintenanceCount || 0}
                      </td>
                      <td style={{ border: '1.5px solid #000000', padding: '0.35rem', fontWeight: 800 }}>
                        {eq.phase1Count || 0}
                      </td>
                      <td style={{ border: '1.5px solid #000000', padding: '0.35rem', fontWeight: 800 }}>
                        {eq.phase2Count || 0}
                      </td>
                      <td style={{ border: '1.5px solid #000000', padding: '0.35rem 0.65rem', textAlign: 'right', fontSize: '0.82rem', fontWeight: 600 }}>
                        {eq.notes || 'جاهزية تشغيلية مستقرة بموقع العمل'}
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr style={{ background: '#fef3c7', fontWeight: 900, borderTop: '2.5px solid #000000' }}>
                    <td colSpan={3} style={{ border: '1.5px solid #000000', padding: '0.5rem', textAlign: 'center', fontSize: '0.95rem' }}>
                      الإجمالي العام لأسطول المعدات والآليات
                    </td>
                    <td style={{ border: '1.5px solid #000000', padding: '0.5rem', fontSize: '1rem', color: '#1e3a8a' }}>
                      {(report.equipmentList || []).reduce((a, b) => a + (b.count || 1), 0)}
                    </td>
                    <td style={{ border: '1.5px solid #000000', padding: '0.5rem', fontSize: '1rem', color: '#16a34a' }}>
                      {(report.equipmentList || []).reduce((a, b) => a + (b.operationalCount || 1), 0)}
                    </td>
                    <td style={{ border: '1.5px solid #000000', padding: '0.5rem', fontSize: '1rem', color: '#dc2626' }}>
                      {(report.equipmentList || []).reduce((a, b) => a + (b.maintenanceCount || 0), 0)}
                    </td>
                    <td style={{ border: '1.5px solid #000000', padding: '0.5rem', fontSize: '1rem' }}>
                      {(report.equipmentList || []).reduce((a, b) => a + (b.phase1Count || 0), 0)}
                    </td>
                    <td style={{ border: '1.5px solid #000000', padding: '0.5rem', fontSize: '1rem' }}>
                      {(report.equipmentList || []).reduce((a, b) => a + (b.phase2Count || 0), 0)}
                    </td>
                    <td style={{ border: '1.5px solid #000000', padding: '0.5rem', textAlign: 'center', color: '#16a34a' }}>
                      نسبة الجاهزية التشغيلية: 100%
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Official Creator Strip (اسم منشئ التقرير يحدد تلقائياً من اسم المستخدم) */}
              <div className="report-creator-official-strip" style={{
                marginTop: '0.85rem',
                marginBottom: '0.35rem',
                padding: '10px 16px',
                border: '1.5px solid #000000',
                background: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pageBreakInside: 'avoid',
                breakInside: 'avoid'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#000000' }}>اسم منشئ التقرير:</span>
                  <span style={{ fontSize: '1rem', fontWeight: 900, color: '#1e3a8a', borderBottom: '1.5px dotted #1e3a8a', paddingBottom: '2px' }}>
                    {authorInfo.name}
                  </span>
                  {authorInfo.role && (
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>
                      ({authorInfo.role})
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>
                  اعتماد وتوثيق آلي بنظام جهاز الإشراف
                </div>
              </div>
            </div>

          ) : isTwoPhaseDoc ? (
            <div style={{ marginBottom: '0.4rem', direction: 'rtl', width: '100%', background: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}>
              {/* Document Title Header matching the Photo */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '2px solid #000000',
                paddingBottom: '2px',
                marginBottom: '4px'
              }}>
                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#000000' }}>
                    مشروع صيانة طريق أوباري غات
                  </h2>
                  <h3 style={{ margin: '1px 0 0', fontSize: '0.96rem', fontWeight: 800, color: '#1e3a8a' }}>
                    الأعمال المنجزة
                  </h3>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  border: '1.5px solid #000000',
                  padding: '3px 12px',
                  background: '#f8fafc',
                  fontWeight: 900,
                  fontSize: '0.82rem'
                }}>
                  <div>
                    <span style={{ color: '#64748b', marginLeft: '4px' }}>التاريخ:</span>
                    <span style={{ direction: 'ltr' }}>{report.dateFormatted || (report.date ? report.date.split('T')[0] : reportDateStr)}</span>
                  </div>
                  <div style={{ borderRight: '1.5px solid #000000', paddingRight: '0.8rem' }}>
                    <span style={{ color: '#64748b', marginLeft: '4px' }}>اليوم:</span>
                    <span>{cleanDayName(report.dayName)}</span>
                  </div>
                </div>
              </div>

              {/* ROW 1: Phase 1 Table (Right) & Chart (Left) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '0.45rem', marginBottom: '4px', alignItems: 'stretch' }}>
                <div style={{ border: '1.5px solid #000000', background: '#ffffff', backgroundColor: '#ffffff' }}>
                  <div style={{ background: '#1e40af', color: '#fff', textAlign: 'center', fontWeight: 900, padding: '2px', fontSize: '0.80rem' }}>
                    المرحلة الأولى
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.68rem', lineHeight: 1.15, background: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #000' }}>
                        <th style={{ border: '1px solid #000', padding: '2px 1px', width: '22px' }}>م</th>
                        <th style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'right' }}>الوصف</th>
                        <th style={{ border: '1px solid #000', padding: '2px', width: '80px' }}>إنجاز اليوم (م.ط)</th>
                        <th style={{ border: '1px solid #000', padding: '2px', width: '80px' }}>الإجمالي (م.ط)</th>
                        <th style={{ border: '1px solid #000', padding: '2px', width: '75px' }}>المستهدف اليومي</th>
                        <th style={{ border: '1px solid #000', padding: '2px', width: '75px' }}>الزيادة / النقصان</th>
                        <th style={{ border: '1px solid #000', padding: '2px' }}>ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ background: '#e2e8f0', fontWeight: 900 }}>
                        <td colSpan={7} style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'right', fontSize: '0.70rem' }}>بنود أساسية</td>
                      </tr>
                      {(report.phase1Items || []).filter(i => i && (i.category === 'basic' || !i.category)).map((it, idx) => (
                        <tr key={idx} style={{ background: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}>
                          <td style={{ border: '1px solid #000', padding: '2px 1px', color: '#000000' }}>{idx + 1}</td>
                          <td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'right', fontWeight: 700 }}>{it.name}</td>
                          <td style={{ border: '1px solid #000', padding: '2px', fontWeight: 800 }}>{formatPrintNumber(it.todayMeters)}</td>
                          <td style={{ border: '1px solid #000', padding: '2px', fontWeight: 800 }}>{formatPrintNumber(it.totalMeters)}</td>
                          <td style={{ border: '1px solid #000', padding: '2px' }}>{formatPrintNumber(it.dailyTarget)}</td>
                          <td style={{ border: '1px solid #000', padding: '2px', fontWeight: 800 }}>{formatPrintNumber(it.varianceMeters)}</td>
                          <td style={{ border: '1px solid #000', padding: '2px', fontSize: '0.66rem' }}>{it.notes || '-'}</td>
                        </tr>
                      ))}
                      <tr style={{ background: '#e2e8f0', fontWeight: 900 }}>
                        <td colSpan={7} style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'right', fontSize: '0.70rem' }}>بنود إضافية</td>
                      </tr>
                      {(report.phase1Items || []).filter(i => i && i.category === 'additional').map((it, idx) => (
                        <tr key={idx} style={{ background: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}>
                          <td style={{ border: '1px solid #000', padding: '2px 1px', color: '#000000' }}>{idx + 4}</td>
                          <td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'right', fontWeight: 700 }}>{it.name}</td>
                          <td style={{ border: '1px solid #000', padding: '2px', fontWeight: 800 }}>{formatPrintNumber(it.todayMeters)}</td>
                          <td style={{ border: '1px solid #000', padding: '2px', fontWeight: 800 }}>{formatPrintNumber(it.totalMeters)}</td>
                          <td style={{ border: '1px solid #000', padding: '2px' }}>{formatPrintNumber(it.dailyTarget)}</td>
                          <td style={{ border: '1px solid #000', padding: '2px', fontWeight: 800 }}>{formatPrintNumber(it.varianceMeters)}</td>
                          <td style={{ border: '1px solid #000', padding: '2px', fontSize: '0.66rem' }}>{it.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Chart 1 */}
                <TwoPhasePrintChart title="الأعمال المنجزة المرحلة الأولى" items={report.phase1Items || []} />
              </div>

              {/* ROW 2: Phase 2 Table (Right) & Chart (Left) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '0.45rem', marginBottom: '4px', alignItems: 'stretch' }}>
                <div style={{ border: '1.5px solid #000000', background: '#ffffff', backgroundColor: '#ffffff' }}>
                  <div style={{ background: '#0284c7', color: '#fff', textAlign: 'center', fontWeight: 900, padding: '2px', fontSize: '0.80rem' }}>
                    المرحلة الثانية
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.68rem', lineHeight: 1.15, background: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #000' }}>
                        <th style={{ border: '1px solid #000', padding: '2px 1px', width: '22px' }}>م</th>
                        <th style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'right' }}>الوصف</th>
                        <th style={{ border: '1px solid #000', padding: '2px', width: '80px' }}>إنجاز اليوم (م.ط)</th>
                        <th style={{ border: '1px solid #000', padding: '2px', width: '80px' }}>الإجمالي (م.ط)</th>
                        <th style={{ border: '1px solid #000', padding: '2px', width: '75px' }}>المستهدف اليومي</th>
                        <th style={{ border: '1px solid #000', padding: '2px', width: '75px' }}>الزيادة / النقصان</th>
                        <th style={{ border: '1px solid #000', padding: '2px' }}>ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ background: '#e2e8f0', fontWeight: 900 }}>
                        <td colSpan={7} style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'right', fontSize: '0.70rem' }}>بنود أساسية</td>
                      </tr>
                      {(report.phase2Items || []).filter(i => i && (i.category === 'basic' || !i.category)).map((it, idx) => (
                        <tr key={idx} style={{ background: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}>
                          <td style={{ border: '1px solid #000', padding: '2px 1px', color: '#000000' }}>{idx + 1}</td>
                          <td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'right', fontWeight: 700 }}>{it.name}</td>
                          <td style={{ border: '1px solid #000', padding: '2px', fontWeight: 800 }}>{formatPrintNumber(it.todayMeters)}</td>
                          <td style={{ border: '1px solid #000', padding: '2px', fontWeight: 800 }}>{formatPrintNumber(it.totalMeters)}</td>
                          <td style={{ border: '1px solid #000', padding: '2px' }}>{formatPrintNumber(it.dailyTarget)}</td>
                          <td style={{ border: '1px solid #000', padding: '2px', fontWeight: 800 }}>{formatPrintNumber(it.varianceMeters)}</td>
                          <td style={{ border: '1px solid #000', padding: '2px', fontSize: '0.66rem' }}>{it.notes || '-'}</td>
                        </tr>
                      ))}
                      <tr style={{ background: '#e2e8f0', fontWeight: 900 }}>
                        <td colSpan={7} style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'right', fontSize: '0.70rem' }}>بنود إضافية</td>
                      </tr>
                      {(report.phase2Items || []).filter(i => i && i.category === 'additional').map((it, idx) => (
                        <tr key={idx} style={{ background: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}>
                          <td style={{ border: '1px solid #000', padding: '2px 1px', color: '#000000' }}>{idx + 4}</td>
                          <td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'right', fontWeight: 700 }}>{it.name}</td>
                          <td style={{ border: '1px solid #000', padding: '2px', fontWeight: 800 }}>{formatPrintNumber(it.todayMeters)}</td>
                          <td style={{ border: '1px solid #000', padding: '2px', fontWeight: 800 }}>{formatPrintNumber(it.totalMeters)}</td>
                          <td style={{ border: '1px solid #000', padding: '2px' }}>{formatPrintNumber(it.dailyTarget)}</td>
                          <td style={{ border: '1px solid #000', padding: '2px', fontWeight: 800 }}>{formatPrintNumber(it.varianceMeters)}</td>
                          <td style={{ border: '1px solid #000', padding: '2px', fontSize: '0.66rem' }}>{it.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Chart 2 */}
                <TwoPhasePrintChart title="الأعمال المنجزة المرحلة الثانية" items={report.phase2Items || []} />
              </div>

              {/* ROW 3: Combined Two-Phase Table (Right) & Chart (Left) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '0.45rem', marginBottom: '4px', alignItems: 'stretch' }}>
                <div style={{ border: '1.5px solid #000000', background: '#ffffff', backgroundColor: '#ffffff' }}>
                  <div style={{ background: '#0f172a', color: '#fff', textAlign: 'center', fontWeight: 900, padding: '2px', fontSize: '0.80rem' }}>
                    إجمالي المنجز للمرحلتين (تجميع آلي فوري)
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.68rem', lineHeight: 1.15, background: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #000' }}>
                        <th style={{ border: '1px solid #000', padding: '2px 1px', width: '22px' }}>م</th>
                        <th style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'right' }}>الوصف</th>
                        <th style={{ border: '1px solid #000', padding: '2px', width: '85px', background: '#eff6ff' }}>إنجاز اليوم (م.ط)</th>
                        <th style={{ border: '1px solid #000', padding: '2px', width: '85px', background: '#f0fdf4' }}>الإجمالي (م.ط)</th>
                        <th style={{ border: '1px solid #000', padding: '2px', width: '85px' }}>الجاهز للعمل في البند</th>
                        <th style={{ border: '1px solid #000', padding: '2px' }}>ملاحظات وتفاصيل التجميع</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ background: '#e2e8f0', fontWeight: 900 }}>
                        <td colSpan={6} style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'right', fontSize: '0.70rem' }}>بنود أساسية</td>
                      </tr>
                      {(report.combinedItems || []).filter(i => i && (i.category === 'basic' || !i.category)).map((it, idx) => (
                        <tr key={idx} style={{ background: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}>
                          <td style={{ border: '1px solid #000', padding: '2px 1px', color: '#000000' }}>{idx + 1}</td>
                          <td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'right', fontWeight: 700 }}>{it.name}</td>
                          <td style={{ border: '1px solid #000', padding: '2px', fontWeight: 900, color: '#1d4ed8' }}>{formatPrintNumber(it.todayMeters)}</td>
                          <td style={{ border: '1px solid #000', padding: '2px', fontWeight: 900, color: '#15803d' }}>{formatPrintNumber(it.totalMeters)}</td>
                          <td style={{ border: '1px solid #000', padding: '2px', fontWeight: 800 }}>
                            {formatPrintNumber(it.readyToWorkMeters || it.readyToWork)}
                          </td>
                          <td style={{ border: '1px solid #000', padding: '2px', fontSize: '0.66rem' }}>{it.notes || '-'}</td>
                        </tr>
                      ))}
                      <tr style={{ background: '#e2e8f0', fontWeight: 900 }}>
                        <td colSpan={6} style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'right', fontSize: '0.70rem' }}>بنود إضافية</td>
                      </tr>
                      {(report.combinedItems || []).filter(i => i && i.category === 'additional').map((it, idx) => (
                        <tr key={idx} style={{ background: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}>
                          <td style={{ border: '1px solid #000', padding: '2px 1px', color: '#000000' }}>{idx + 4}</td>
                          <td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'right', fontWeight: 700 }}>{it.name}</td>
                          <td style={{ border: '1px solid #000', padding: '2px', fontWeight: 900, color: '#1d4ed8' }}>{formatPrintNumber(it.todayMeters)}</td>
                          <td style={{ border: '1px solid #000', padding: '2px', fontWeight: 900, color: '#15803d' }}>{formatPrintNumber(it.totalMeters)}</td>
                          <td style={{ border: '1px solid #000', padding: '2px', fontWeight: 800 }}>
                            {formatPrintNumber(it.readyToWorkMeters || it.readyToWork)}
                          </td>
                          <td style={{ border: '1px solid #000', padding: '2px', fontSize: '0.66rem' }}>{it.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Chart 3 */}
                <TwoPhasePrintChart title="إجمالي الأعمال المنجزة" items={report.combinedItems || []} />
              </div>

              {/* ROW 4: Remaining Balances Dual Tables */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '3px', border: '1.5px solid #000000', padding: '3px', background: '#ffffff', backgroundColor: '#ffffff' }}>
                {/* Sub-table A */}
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.68rem', lineHeight: 1.15, background: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #000' }}>
                      <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'right' }}>المتبقي من البند</th>
                      <th style={{ border: '1px solid #000', padding: '2px', width: '65px' }}>المرحلة الأولى</th>
                      <th style={{ border: '1px solid #000', padding: '2px', width: '65px' }}>المرحلة الثانية</th>
                      <th style={{ border: '1px solid #000', padding: '2px', width: '65px', background: '#e2e8f0' }}>الإجمالي</th>
                      <th style={{ border: '1px solid #000', padding: '2px' }}>ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(report.remainingItems || []).filter(r => r && r.group === 'A').map((r, idx) => (
                      <tr key={idx} style={{ background: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}>
                        <td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'right', fontWeight: 800, color: '#000000' }}>{r.name}</td>
                        <td style={{ border: '1px solid #000', padding: '2px' }}>{formatPrintNumber(r.phase1)}</td>
                        <td style={{ border: '1px solid #000', padding: '2px' }}>{formatPrintNumber(r.phase2)}</td>
                        <td style={{ border: '1px solid #000', padding: '2px', fontWeight: 900 }}>{formatPrintNumber(r.total)}</td>
                        <td style={{ border: '1px solid #000', padding: '2px', fontSize: '0.66rem' }}>{r.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Sub-table B */}
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.68rem', lineHeight: 1.15, background: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #000' }}>
                      <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'right' }}>المتبقي من البند</th>
                      <th style={{ border: '1px solid #000', padding: '2px', width: '65px' }}>المرحلة الأولى</th>
                      <th style={{ border: '1px solid #000', padding: '2px', width: '65px' }}>المرحلة الثانية</th>
                      <th style={{ border: '1px solid #000', padding: '2px', width: '65px', background: '#e2e8f0' }}>الإجمالي</th>
                      <th style={{ border: '1px solid #000', padding: '2px' }}>ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(report.remainingItems || []).filter(r => r && r.group === 'B').map((r, idx) => (
                      <tr key={idx} style={{ background: '#ffffff', backgroundColor: '#ffffff', color: '#000000' }}>
                        <td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'right', fontWeight: 800, color: '#000000' }}>{r.name}</td>
                        <td style={{ border: '1px solid #000', padding: '2px' }}>{formatPrintNumber(r.phase1)}</td>
                        <td style={{ border: '1px solid #000', padding: '2px' }}>{formatPrintNumber(r.phase2)}</td>
                        <td style={{ border: '1px solid #000', padding: '2px', fontWeight: 900 }}>{formatPrintNumber(r.total)}</td>
                        <td style={{ border: '1px solid #000', padding: '2px', fontSize: '0.66rem' }}>{r.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Official Creator Strip (اسم منشئ التقرير يحدد تلقائياً من اسم المستخدم) */}
              <div className="report-creator-official-strip" style={{
                marginTop: '3px',
                marginBottom: '2px',
                padding: '4px 10px',
                border: '1.5px solid #000000',
                background: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.80rem', fontWeight: 900, color: '#000000' }}>اسم منشئ التقرير:</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#1e3a8a', borderBottom: '1.5px dotted #1e3a8a', paddingBottom: '1px' }}>
                    {authorInfo.name}
                  </span>
                  {authorInfo.role && (
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569' }}>
                      ({authorInfo.role})
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                  اعتماد وتوثيق آلي بنظام جهاز الإشراف
                </div>
              </div>
            </div>
          ) : isPeriodicDoc ? (
            <div style={{ marginBottom: '1.5rem', direction: 'rtl', width: '100%', background: '#ffffff', color: '#000000' }}>
              {/* Header */}
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
                    دولة ليبيا - وزارة المواصلات - جهاز تنفيذ مشروعات المواصلات
                  </h2>
                  <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.05rem', fontWeight: 800, color: '#1e3a8a' }}>
                    مشروع صيانة وتطوير طريق أوباري - غات (360 كم)
                  </h3>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#16a34a', marginTop: '0.2rem' }}>
                    {report.reportTitle || report.title || (report.periodicType === 'weekly' ? 'التقرير الأسبوعي التجميعي لأعمال الطريق' : 'التقرير الشهري التجميعي لأعمال الطريق')}
                  </div>
                </div>

                <div style={{
                  border: '1.5px solid #000000',
                  padding: '6px 16px',
                  background: '#f8fafc',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  textAlign: 'center'
                }}>
                  <div>
                    <span style={{ color: '#64748b', marginLeft: '6px' }}>رقم التقرير:</span>
                    <span style={{ direction: 'ltr', fontWeight: 900 }}>{report.reportNumber}</span>
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <span style={{ color: '#64748b', marginLeft: '6px' }}>الفترة:</span>
                    <span>من {report.startDate || '—'} إلى {report.endDate || report.dateFormatted || '—'}</span>
                  </div>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.85rem' }}>
                <div style={{ border: '1.5px solid #000000', padding: '8px', textAlign: 'center', background: '#f0fdf4' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#166534' }}>حالة بنود المسار</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#16a34a' }}>{report.layersCount || 4} طبقات منفذة</div>
                </div>
                <div style={{ border: '1.5px solid #000000', padding: '8px', textAlign: 'center', background: '#eff6ff' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af' }}>القيمة التعاقدية المنفذة</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1d4ed8' }}>{(report.totalValue || 0).toLocaleString()} د.ل</div>
                </div>
                <div style={{ border: '1.5px solid #000000', padding: '8px', textAlign: 'center', background: '#f8fafc' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#075985' }}>حالة القياس والاعتماد</div>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0284c7' }}>قياس مستقل لكل بند</div>
                </div>
                <div style={{ border: '1.5px solid #000000', padding: '8px', textAlign: 'center', background: '#fefce8' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#854d0e' }}>أيام العمل الفعلية</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ca8a04' }}>{report.daysWorked || 1} أيام (معدل {report.avgDailyMeters || 0} م/يوم)</div>
                </div>
              </div>

              {/* Table of Layers */}
              <div style={{ border: '1.5px solid #000000', marginBottom: '0.85rem' }}>
                <div style={{ background: '#1e3a8a', color: '#ffffff', textAlign: 'center', fontWeight: 900, padding: '4px', fontSize: '0.85rem' }}>
                  كشف تجميع كميات الطبقات والأعمال المنجزة بالفترة
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #000000' }}>
                      <th style={{ border: '1px solid #000', padding: '4px 2px', width: '25px' }}>م</th>
                      <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}>البند / الطبقة</th>
                      <th style={{ border: '1px solid #000', padding: '4px' }}>المنجز بالفترة (م.ط)</th>
                      <th style={{ border: '1px solid #000', padding: '4px' }}>المساحة (م²)</th>
                      <th style={{ border: '1px solid #000', padding: '4px' }}>الحجم (م³)</th>
                      <th style={{ border: '1px solid #000', padding: '4px' }}>الفئة التعاقدية</th>
                      <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'left' }}>القيمة المنفذة (د.ل)</th>
                      <th style={{ border: '1px solid #000', padding: '4px' }}>التراكمي الكلي (م.ط)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(report.layers || []).map((l, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #cbd5e1', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ border: '1px solid #cbd5e1', padding: '4px 2px', fontWeight: 800 }}>{idx + 1}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'right', fontWeight: 800 }}>{l.name}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '4px', fontWeight: 900, color: '#16a34a' }}>+{(l.periodMeters || 0).toLocaleString()}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '4px' }}>{(l.periodArea || 0).toLocaleString()}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '4px' }}>{l.periodVolume ? (l.periodVolume).toLocaleString() : '—'}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '4px', fontSize: '0.74rem' }}>{l.volumeRate ? `${l.volumeRate} /م³` : l.kmRate ? `${l.kmRate} /كم` : `${l.areaRate} /م²`}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'left', fontWeight: 800, color: '#1d4ed8' }}>{(l.periodValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '4px', fontWeight: 800 }}>{(l.totalCumulativeMeters || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f1f5f9', fontWeight: 900, borderTop: '2px solid #000000' }}>
                      <td colSpan={2} style={{ border: '1px solid #000', padding: '5px', textAlign: 'right' }}>الإجمالي المعتمد للفترة:</td>
                      <td style={{ border: '1px solid #000', padding: '5px', color: '#64748b' }}>—</td>
                      <td style={{ border: '1px solid #000', padding: '5px', color: '#64748b' }}>—</td>
                      <td style={{ border: '1px solid #000', padding: '5px', color: '#64748b' }}>—</td>
                      <td style={{ border: '1px solid #000', padding: '5px' }}>—</td>
                      <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'left', color: '#1d4ed8' }}>{(report.totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.ل</td>
                      <td style={{ border: '1px solid #000', padding: '5px' }}>—</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Official Creator Strip (اسم منشئ التقرير يحدد تلقائياً من اسم المستخدم) */}
              <div className="report-creator-official-strip" style={{
                marginTop: '1.25rem',
                border: '1.5px solid #000000',
                padding: '10px 16px',
                background: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pageBreakInside: 'avoid',
                breakInside: 'avoid'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#000000' }}>اسم منشئ التقرير:</span>
                  <span style={{ fontSize: '1rem', fontWeight: 900, color: '#1e3a8a', borderBottom: '1.5px dotted #1e3a8a', paddingBottom: '2px' }}>
                    {authorInfo.name}
                  </span>
                  {authorInfo.role && (
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>
                      ({authorInfo.role})
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>
                  اعتماد وتوثيق آلي بنظام جهاز الإشراف
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
                <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>
                  {report.title ? report.title.replace(/يوم\s+يوم/g, 'يوم') : (report.dayName ? `تقرير أعمال يوم ${cleanDayName(report.dayName)} ${report.dateFormatted || reportDateStr}` : `تقرير أعمال الطريق اليومي`)}
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

                  {/* تم إلغاء الإجمالي العام المركب: كل بند يحسب وتُجمع كمياته على حِدَة */}
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
                    <td className="bold">أعمال طبقة الأساس الحبيبي</td>
                    <td>مسار {sectorTitle}</td>
                    <td className="center bold highlight-blue">{Number(report.roadMeters || report.todayMeters || report.productionAmount || 0).toLocaleString()}</td>
                    <td className="center">متر طولي (م.ط)</td>
                    <td>تنفيذ طبقة الأساس الحبيبي المعتمد</td>
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
                    <td>تزويد أسطول الشاحنات والمعدات والآليات</td>
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

              {/* 6. Official Creator Strip (اسم منشئ التقرير يحدد تلقائياً من اسم المستخدم) */}
              <div className="report-creator-official-strip" style={{
                marginTop: '1.5rem',
                padding: '10px 16px',
                border: '1.5px solid #000000',
                background: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pageBreakInside: 'avoid',
                breakInside: 'avoid'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#000000' }}>اسم منشئ التقرير:</span>
                  <span style={{ fontSize: '1rem', fontWeight: 900, color: '#1e3a8a', borderBottom: '1.5px dotted #1e3a8a', paddingBottom: '2px' }}>
                    {authorInfo.name}
                  </span>
                  {authorInfo.role && (
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>
                      ({authorInfo.role})
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>
                  اعتماد وتوثيق آلي بنظام جهاز الإشراف
                </div>
              </div>
            </>
          )}

          {/* 7. Footer Meta (Only for legacy operational reports) */}
          {!isStandardNewForm && (
            <div className="official-report-footer">
              <span>منظومة متابعة أعمال الطريق والوقود والآليات - جهاز تنفيذ مشروعات المواصلات</span>
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
