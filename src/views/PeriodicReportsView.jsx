import React, { useState, useEffect } from 'react';
import { 
  FileText, Calendar, CalendarRange, Printer, Download, RefreshCw, 
  CheckCircle2, TrendingUp, Factory, Fuel, Mountain, Truck, 
  Milestone, Layers, Award, Sparkles, Building2, Save, FileSpreadsheet,
  ChevronLeft, ArrowUpRight, ShieldCheck, AlertCircle, BarChart3,
  Eye, Plus, Check
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, AreaChart, Area 
} from 'recharts';
import * as XLSX from 'xlsx';
import { fastFetch } from '../utils/apiCache.js';
import { CreateReportModal } from '../components/CreateReportModal';
import { OfficialPrintModal } from '../components/OfficialPrintModal';

export const PeriodicReportsView = ({ currentUser }) => {
  const [reportType, setReportType] = useState('monthly'); // 'monthly' | 'annual'
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(9); // 9 = سبتمبر
  const [selectedSector, setSelectedSector] = useState('all');
  
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDailyReportForPrint, setSelectedDailyReportForPrint] = useState(null);

  const ARABIC_MONTHS = [
    { value: 1, label: 'يناير' },
    { value: 2, label: 'فبراير' },
    { value: 3, label: 'مارس' },
    { value: 4, label: 'أبريل' },
    { value: 5, label: 'مايو' },
    { value: 6, label: 'يونيو' },
    { value: 7, label: 'يوليو' },
    { value: 8, label: 'أغسطس' },
    { value: 9, label: 'سبتمبر' },
    { value: 10, label: 'أكتوبر' },
    { value: 11, label: 'نوفمبر' },
    { value: 12, label: 'ديسمبر' }
  ];

  const fetchPeriodicReport = async () => {
    setIsLoading(true);
    setSaveSuccessMsg('');
    try {
      const url = `http://localhost:5000/api/reports/periodic?type=${reportType}&year=${selectedYear}&month=${selectedMonth}&sector=${selectedSector}`;
      const res = await fastFetch(url);
      if (res && res.success) {
        setReportData(res);
      } else {
        // Fallback safety
        const fallbackUrl = `/api/reports/periodic?type=${reportType}&year=${selectedYear}&month=${selectedMonth}&sector=${selectedSector}`;
        const localRes = await fetch(fallbackUrl).then(r => r.json()).catch(() => null);
        if (localRes) setReportData(localRes);
      }
    } catch (err) {
      console.error('Error fetching periodic report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriodicReport();
  }, [reportType, selectedYear, selectedMonth, selectedSector]);

  // Save report to archive
  const handleSaveToArchive = async () => {
    if (!reportData) return;
    setIsSaving(true);
    try {
      const res = await fetch('http://localhost:5000/api/reports/periodic/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reportData,
          savedBy: currentUser?.name || 'مدير المشروع'
        })
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccessMsg('تم حفظ وتثبيت التقرير في الأرشيف الرسمي للمنظومة بنجاح!');
        setTimeout(() => setSaveSuccessMsg(''), 5000);
      }
    } catch (err) {
      console.warn('API save error, saving to local storage:', err);
      try {
        const savedList = JSON.parse(localStorage.getItem('saved_periodic_reports') || '[]');
        savedList.unshift({
          ...reportData,
          savedAt: new Date().toISOString(),
          savedBy: currentUser?.name || 'مدير المشروع'
        });
        localStorage.setItem('saved_periodic_reports', JSON.stringify(savedList));
        setSaveSuccessMsg('تم حفظ التقرير في الأرشيف المحلي بنجاح!');
        setTimeout(() => setSaveSuccessMsg(''), 5000);
      } catch (e) {}
    } finally {
      setIsSaving(false);
    }
  };

  // Export comprehensive Excel workbook
  const handleExportExcel = () => {
    if (!reportData) return;
    const wb = XLSX.utils.book_new();

    // Sheet 1: Executive KPIs
    const kpiRows = [
      { 'البيان': 'رقم التقرير الرسمي', 'القيمة': reportData.reportCode, 'الوحدة': '' },
      { 'البيان': 'عنوان التقرير', 'القيمة': reportData.reportTitle, 'الوحدة': '' },
      { 'البيان': 'الفترة / النوع', 'القيمة': reportType === 'annual' ? `سنوي (${selectedYear})` : `شهري (${reportData.monthName} ${selectedYear})`, 'الوحدة': '' },
      { 'البيان': 'القطاع المعني', 'القيمة': reportData.sector, 'الوحدة': '' },
      { 'البيان': 'تاريخ التوليد', 'القيمة': new Date(reportData.generatedAt).toLocaleDateString('ar-LY'), 'الوحدة': '' },
      { 'البيان': 'إجمالي الإنتاج الركامي الفعلي', 'القيمة': reportData.kpis.totalProduction, 'الوحدة': 'طن' },
      { 'البيان': 'الإنتاج المستهدف للفترة', 'القيمة': reportData.kpis.targetProduction, 'الوحدة': 'طن' },
      { 'البيان': 'نسبة تحقيق مستهدف الإنتاج', 'القيمة': `${reportData.kpis.prodAchievementRate}%`, 'الوحدة': '' },
      { 'البيان': 'إجمالي استهلاك السولار / الوقود', 'القيمة': reportData.kpis.totalFuel, 'الوحدة': 'لتر' },
      { 'البيان': 'معدل كفاءة الوقود', 'القيمة': reportData.kpis.fuelPerTon, 'الوحدة': 'لتر/طن' },
      { 'البيان': 'إجمالي توريدات الشرشور', 'القيمة': reportData.kpis.sharshoorDelivered, 'الوحدة': 'طن' },
      { 'البيان': 'رصيد مخزون الشرشور المتاح', 'القيمة': reportData.kpis.sharshoorStockBalance, 'الوحدة': 'طن' },
      { 'البيان': 'إجمالي المنجز من الطريق بالفترة', 'القيمة': reportData.kpis.totalRoadMeters, 'الوحدة': 'متر طولي' },
      { 'البيان': 'المسافة الكلية المنجزة من المشروع', 'القيمة': `${reportData.kpis.projectCompletedKm} من ${reportData.kpis.projectTotalKm}`, 'الوحدة': 'كم' },
      { 'البيان': 'نسبة الإنجاز الإجمالية للمشروع', 'القيمة': `${reportData.kpis.projectOverallPercentage}%`, 'الوحدة': '' },
      { 'البيان': 'الجاهزية التشغيلية لأسطول المعدات', 'القيمة': `${reportData.kpis.fleetReadinessRate}%`, 'الوحدة': '' },
      { 'البيان': 'ساعات تشغيل الآليات الكلية', 'القيمة': reportData.kpis.totalOperatingHours, 'الوحدة': 'ساعة' }
    ];
    const wsKPI = XLSX.utils.json_to_sheet(kpiRows);
    XLSX.utils.book_append_sheet(wb, wsKPI, 'المؤشرات التنفيذية');

    // Sheet 2: Time Series (Months / Weeks)
    if (reportData.timeSeries && reportData.timeSeries.length > 0) {
      const timeSeriesRows = reportData.timeSeries.map((t, idx) => ({
        'م': idx + 1,
        'الفترة': t.period,
        'الإنتاج (طن)': t.production,
        'الوقود (لتر)': t.fuel,
        'توريد الشرشور (طن)': t.sharshoor,
        'مسافة الطريق (م.ط)': t.roadMeters,
        'الجاهزية / ساعات التشغيل': t.readiness ? `${t.readiness}%` : `${t.operatingHours} ساعة`
      }));
      const wsTime = XLSX.utils.json_to_sheet(timeSeriesRows);
      XLSX.utils.book_append_sheet(wb, wsTime, reportType === 'annual' ? 'تطور شهور السنة' : 'تطور أسابيع الشهر');
    }

    // Sheet 3: Road Layers
    if (reportData.layers && reportData.layers.length > 0) {
      const layerRows = reportData.layers.map((l, idx) => ({
        'م': idx + 1,
        'طبقة الرصف': l.name,
        'المنجز بالفترة': l.meters,
        'الوحدة': l.unit,
        'الحالة': l.status
      }));
      const wsLayers = XLSX.utils.json_to_sheet(layerRows);
      XLSX.utils.book_append_sheet(wb, wsLayers, 'طبقات الطريق');
    }

    // Sheet 4: Sector Comparison
    if (reportData.sectorComparison) {
      const secRows = [
        {
          'القطاع': reportData.sectorComparison.sectorA.name,
          'الإنتاج (طن)': reportData.sectorComparison.sectorA.productionTons,
          'الوقود (لتر)': reportData.sectorComparison.sectorA.fuelLiters,
          'مسافة الرصف (م.ط)': reportData.sectorComparison.sectorA.roadMeters,
          'المعدات العاملة': reportData.sectorComparison.sectorA.activeEquipment,
          'نسبة الإنجاز الكلية': `${reportData.sectorComparison.sectorA.completionRate}%`
        },
        {
          'القطاع': reportData.sectorComparison.sectorB.name,
          'الإنتاج (طن)': reportData.sectorComparison.sectorB.productionTons,
          'الوقود (لتر)': reportData.sectorComparison.sectorB.fuelLiters,
          'مسافة الرصف (م.ط)': reportData.sectorComparison.sectorB.roadMeters,
          'المعدات العاملة': reportData.sectorComparison.sectorB.activeEquipment,
          'نسبة الإنجاز الكلية': `${reportData.sectorComparison.sectorB.completionRate}%`
        }
      ];
      const wsSec = XLSX.utils.json_to_sheet(secRows);
      XLSX.utils.book_append_sheet(wb, wsSec, 'مقارنة القطاعات');
    }

    // Sheet 5: Contributing Daily Reports (The dynamic source records)
    if (reportData.contributingReports && reportData.contributingReports.length > 0) {
      const dailyRows = reportData.contributingReports.map((r, idx) => ({
        'م': idx + 1,
        'رقم التقرير': r.reportNumber,
        'تاريخ التقرير': r.date ? new Date(r.date).toLocaleDateString('ar-LY') : '',
        'القطاع / الموقع': r.sector,
        'نوع التقرير': r.reportType,
        'إنتاج الركام (طن)': r.productionAmount,
        'استهلاك الوقود (لتر)': r.fuelAmount,
        'منجز الطريق (م.ط)': r.roadMeters,
        'المعدات العاملة': r.workingEquipmentCount || '-',
        'المهندس / المسؤول': r.uploadedBy,
        'الحالة': r.status === 'approved' ? 'معتمد' : 'قيد المراجعة',
        'ملاحظات': r.notes || ''
      }));
      const wsDaily = XLSX.utils.json_to_sheet(dailyRows);
      XLSX.utils.book_append_sheet(wb, wsDaily, 'التقارير اليومية المساهمة');
    }

    const fileName = `${reportData.reportCode}_${reportType === 'annual' ? selectedYear : `${selectedYear}_${selectedMonth}`}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const handleExecuteBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="view-content" style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Top Banner & Control Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1.25rem 1.75rem',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 14px rgba(37, 99, 235, 0.25)'
          }}>
            <CalendarRange size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                مركز التقارير الدورية التلقائية
              </h2>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                background: '#dbeafe',
                color: '#1e40af',
                border: '1px solid #bfdbfe'
              }}>
                نظام الأتمتة المعتمد
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.3rem', margin: 0 }}>
              تجميع وتوليد تلقائي للتقارير الشهرية والسنوية الشاملة لكافة قطاعات ومرافق المشروع
            </p>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button 
            className="primary-action-btn"
            onClick={() => setIsCreateModalOpen(true)}
            style={{ 
              height: '40px', 
              padding: '0 1.25rem', 
              fontSize: '0.85rem', 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
              borderColor: '#059669',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' 
            }}
          >
            <Plus size={16} />
            <span>+ إضافة تقرير يومي للفترة</span>
          </button>

          <button 
            className="secondary-action-btn"
            onClick={fetchPeriodicReport}
            disabled={isLoading}
            style={{ height: '40px', padding: '0 1rem', fontSize: '0.85rem' }}
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            <span>تحديث التوليد الآلي</span>
          </button>

          <button 
            className="secondary-action-btn"
            onClick={handleExportExcel}
            disabled={!reportData}
            style={{ height: '40px', padding: '0 1rem', fontSize: '0.85rem', color: '#16a34a', borderColor: '#bbf7d0' }}
          >
            <FileSpreadsheet size={16} />
            <span>تصدير ملف Excel</span>
          </button>

          <button 
            className="secondary-action-btn"
            onClick={handlePrint}
            disabled={!reportData}
            style={{ height: '40px', padding: '0 1rem', fontSize: '0.85rem' }}
          >
            <Printer size={16} />
            <span>معاينة الطباعة الرسمية</span>
          </button>

          <button 
            className="primary-action-btn"
            onClick={handleSaveToArchive}
            disabled={isSaving || !reportData}
            style={{ height: '40px', padding: '0 1.25rem', fontSize: '0.85rem' }}
          >
            <Save size={16} />
            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ في الأرشيف الرسمي'}</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: '10px',
          padding: '0.85rem 1.25rem',
          color: '#15803d',
          fontWeight: 700,
          fontSize: '0.88rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <CheckCircle2 size={18} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Mode & Period Switcher Bar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '1rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Type Toggle: Monthly vs Annual */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
          <button
            onClick={() => setReportType('monthly')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: reportType === 'monthly' ? '#2563eb' : 'transparent',
              color: reportType === 'monthly' ? '#ffffff' : '#475569',
              fontWeight: 800,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.15s ease',
              boxShadow: reportType === 'monthly' ? '0 2px 8px rgba(37, 99, 235, 0.25)' : 'none'
            }}
          >
            <Calendar size={16} />
            <span>تقرير شهري تلقائي</span>
          </button>

          <button
            onClick={() => setReportType('annual')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: reportType === 'annual' ? '#2563eb' : 'transparent',
              color: reportType === 'annual' ? '#ffffff' : '#475569',
              fontWeight: 800,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.15s ease',
              boxShadow: reportType === 'annual' ? '0 2px 8px rgba(37, 99, 235, 0.25)' : 'none'
            }}
          >
            <CalendarRange size={16} />
            <span>تقرير سنوي شامل</span>
          </button>
        </div>

        {/* Date & Sector Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          {/* Year Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>السنة:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{
                height: '38px',
                padding: '0 0.85rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#0f172a',
                background: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value={2026}>2026 (العام الحالي)</option>
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
            </select>
          </div>

          {/* Month Selector (if monthly) */}
          {reportType === 'monthly' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>الشهر:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                style={{
                  height: '38px',
                  padding: '0 0.85rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  background: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                {ARABIC_MONTHS.map(m => (
                  <option key={m.value} value={m.value}>{m.label} ({m.value})</option>
                ))}
              </select>
            </div>
          )}

          {/* Sector Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>القطاع:</span>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              style={{
                height: '38px',
                padding: '0 0.85rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#0f172a',
                background: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value="all">كافة القطاعات (المشروع بالكامل)</option>
              <option value="A">القطعة (A) - شركة الرواد</option>
              <option value="B">القطعة (B) - شركة نيوم</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Summary Header Badge */}
      {reportData && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRight: '5px solid #2563eb',
          borderRadius: '12px',
          padding: '1.1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{
                background: '#0f172a',
                color: '#ffffff',
                fontSize: '0.74rem',
                fontWeight: 900,
                padding: '0.15rem 0.55rem',
                borderRadius: '6px',
                letterSpacing: '0.5px'
              }}>
                {reportData.reportCode}
              </span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {reportData.reportTitle}
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' }}>
              <span>النطاق: <strong style={{ color: '#0f172a' }}>{reportData.sector}</strong></span>
              <span>أيام التشغيل الفعلية: <strong style={{ color: '#0f172a' }}>{reportData.periodDays} يوم عمل</strong></span>
              <span>الحالة: <strong style={{ color: '#16a34a' }}>{reportData.status}</strong></span>
              <span>تاريخ التوليد: <strong style={{ color: '#0f172a' }}>{new Date(reportData.generatedAt).toLocaleString('ar-LY')}</strong></span>
            </div>
          </div>

          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '10px',
            padding: '0.5rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ShieldCheck size={20} color="#059669" />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.74rem', color: '#065f46', fontWeight: 800 }}>بيانات مدققة آلياً</div>
              <div style={{ fontSize: '0.7rem', color: '#047857' }}>تكامل مباشر مع السجلات واليوميات الميدانية</div>
            </div>
          </div>
        </div>
      )}

      {/* Main KPI Cards Grid */}
      {reportData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          
          {/* Card 1: Production */}
          <div className="dashboard-white-card" style={{ padding: '1.25rem', borderTop: '4px solid #2563eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748b' }}>الإنتاج الركامي الكلي</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Factory size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.25rem' }}>
              {reportData.kpis.totalProduction.toLocaleString()} <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>طن</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>المستهدف: {reportData.kpis.targetProduction.toLocaleString()} طن</span>
              <span style={{ fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                {reportData.kpis.prodAchievementRate}% إنجاز
              </span>
            </div>
          </div>

          {/* Card 2: Fuel */}
          <div className="dashboard-white-card" style={{ padding: '1.25rem', borderTop: '4px solid #ea580c' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748b' }}>استهلاك الوقود والسولار</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Fuel size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.25rem' }}>
              {reportData.kpis.totalFuel.toLocaleString()} <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>لتر</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>كفاءة الإنتاج:</span>
              <span style={{ fontWeight: 800, color: '#ea580c', background: '#ffedd5', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                {reportData.kpis.fuelPerTon} لتر/طن
              </span>
            </div>
          </div>

          {/* Card 3: Sharshoor */}
          <div className="dashboard-white-card" style={{ padding: '1.25rem', borderTop: '4px solid #16a34a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748b' }}>توريدات ورصيد الشرشور</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mountain size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.25rem' }}>
              {reportData.kpis.sharshoorDelivered.toLocaleString()} <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>طن مورد</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>المخزون المتوفر:</span>
              <span style={{ fontWeight: 800, color: '#16a34a' }}>
                {reportData.kpis.sharshoorStockBalance.toLocaleString()} طن
              </span>
            </div>
          </div>

          {/* Card 4: Road Progress */}
          <div className="dashboard-white-card" style={{ padding: '1.25rem', borderTop: '4px solid #7c3aed' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748b' }}>طريق أوباري - غات</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Milestone size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.25rem' }}>
              {reportData.kpis.projectCompletedKm} <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>من {reportData.kpis.projectTotalKm} كم</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>إنجاز الفترة: {reportData.kpis.totalRoadMeters.toLocaleString()} م.ط</span>
              <span style={{ fontWeight: 800, color: '#7c3aed', background: '#ede9fe', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                {reportData.kpis.projectOverallPercentage}% تراكمي
              </span>
            </div>
          </div>

          {/* Card 5: Fleet Readiness */}
          <div className="dashboard-white-card" style={{ padding: '1.25rem', borderTop: '4px solid #0891b2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748b' }}>جاهزية أسطول الآليات</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ecfeff', color: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Truck size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.25rem' }}>
              {reportData.kpis.fleetReadinessRate}%
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>الآليات العاملة: {reportData.kpis.activeMachines} من {reportData.kpis.totalMachines}</span>
              <span style={{ fontWeight: 800, color: '#0891b2' }}>
                {reportData.kpis.totalOperatingHours.toLocaleString()} ساعة
              </span>
            </div>
          </div>

        </div>
      )}

      {/* Interactive Charts Section */}
      {reportData && reportData.timeSeries && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          
          {/* Chart 1: Production & Fuel Trend */}
          <div className="dashboard-white-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {reportType === 'annual' ? 'تطور الإنتاج والوقود على مدار شهور السنة' : 'تطور الإنتاج والوقود على مدار أسابيع الشهر'}
                </h4>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                  مقارنة كميات الإنتاج الركامي (طن) مقابل استهلاك السولار (لتر)
                </p>
              </div>
              <BarChart3 size={20} color="#64748b" />
            </div>

            <div style={{ width: '100%', height: '280px', direction: 'ltr' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.timeSeries} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis yAxisId="left" orientation="left" stroke="#2563eb" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#ea580c" tick={{ fontSize: 11 }} />
                  <Tooltip 
                    formatter={(value, name) => [
                      value.toLocaleString(), 
                      name === 'production' ? 'الإنتاج (طن)' : 'الوقود (لتر)'
                    ]}
                  />
                  <Legend 
                    formatter={(val) => val === 'production' ? 'الإنتاج الركامي (طن)' : 'استهلاك الوقود (لتر)'}
                  />
                  <Bar yAxisId="left" dataKey="production" fill="#2563eb" radius={[4, 4, 0, 0]} name="production" />
                  <Bar yAxisId="right" dataKey="fuel" fill="#ea580c" radius={[4, 4, 0, 0]} name="fuel" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Paving & Road Layer Progression */}
          <div className="dashboard-white-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  تقدم طبقات طريق أوباري - غات
                </h4>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                  معدل الإنجاز بالمتر الطولي لكل طبقة رصف خلال الفترة
                </p>
              </div>
              <Layers size={20} color="#64748b" />
            </div>

            <div style={{ width: '100%', height: '280px', direction: 'ltr' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reportData.timeSeries} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis stroke="#7c3aed" tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => [`${value.toLocaleString()} م.ط`, 'أعمال الطريق']} />
                  <Legend formatter={() => 'أعمال الرصف والتنفيذ (متر طولي)'} />
                  <Area type="monotone" dataKey="roadMeters" stroke="#7c3aed" fill="#ede9fe" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* Sector Comparison & Layers Tables Grid */}
      {reportData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          
          {/* Table 1: Sector A vs Sector B */}
          <div className="dashboard-white-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                مقارنة أداء القطاعات (القطعة A مقابل القطعة B)
              </h4>
              <Building2 size={18} color="#64748b" />
            </div>

            <table className="custom-table" style={{ width: '100%', fontSize: '0.84rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'right' }}>القطاع والشركة المنفذة</th>
                  <th>الإنتاج الركامي</th>
                  <th>استهلاك الوقود</th>
                  <th>مسافة الرصف</th>
                  <th>نسبة الإنجاز</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 800, color: '#1e40af' }}>
                    {reportData.sectorComparison.sectorA.name}
                  </td>
                  <td><strong>{reportData.sectorComparison.sectorA.productionTons.toLocaleString()}</strong> طن</td>
                  <td><strong>{reportData.sectorComparison.sectorA.fuelLiters.toLocaleString()}</strong> لتر</td>
                  <td>{reportData.sectorComparison.sectorA.roadMeters.toLocaleString()} م.ط</td>
                  <td>
                    <span style={{ fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                      {reportData.sectorComparison.sectorA.completionRate}%
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 800, color: '#0369a1' }}>
                    {reportData.sectorComparison.sectorB.name}
                  </td>
                  <td><strong>{reportData.sectorComparison.sectorB.productionTons.toLocaleString()}</strong> طن</td>
                  <td><strong>{reportData.sectorComparison.sectorB.fuelLiters.toLocaleString()}</strong> لتر</td>
                  <td>{reportData.sectorComparison.sectorB.roadMeters.toLocaleString()} م.ط</td>
                  <td>
                    <span style={{ fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                      {reportData.sectorComparison.sectorB.completionRate}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Table 2: Materials & Layers Breakdown */}
          <div className="dashboard-white-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                توزيع المواد وطبقات الطريق المنجزة بالفترة
              </h4>
              <Layers size={18} color="#64748b" />
            </div>

            <table className="custom-table" style={{ width: '100%', fontSize: '0.84rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'right' }}>البيان / الطبقة</th>
                  <th>الكمية المنجزة</th>
                  <th>الوحدة</th>
                  <th>الحالة التشغيلية</th>
                </tr>
              </thead>
              <tbody>
                {reportData.layers.map((layer, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{layer.name}</td>
                    <td><strong>{layer.meters.toLocaleString()}</strong></td>
                    <td>{layer.unit}</td>
                    <td>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                        {layer.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* SECTION: Contributing Daily Reports Breakdown (Source Records Table) */}
      {reportData && (
        <div className="dashboard-white-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #dbeafe'
              }}>
                <FileText size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    سجل التقارير اليومية المساهمة في هذا التقرير الدوري
                  </h4>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.65rem',
                    borderRadius: '20px',
                    background: reportData.hasRealReports ? '#dcfce7' : '#fef3c7',
                    color: reportData.hasRealReports ? '#15803d' : '#b45309',
                    border: `1px solid ${reportData.hasRealReports ? '#bbf7d0' : '#fde68a'}`
                  }}>
                    {reportData.contributingReportsCount > 0 
                      ? `${reportData.contributingReportsCount} تقرير يومي معتمد`
                      : 'بانتظار إدخال تقارير اليومية'}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                  {reportData.hasRealReports 
                    ? 'يتم تجميع كافة كميات الإنتاج والوقود وأمتار الرصف آلياً ومباشرة من هذه التقارير الميدانية.'
                    : 'لا توجد تقارير مدخلة لهذا الشهر حتى الآن. اضغط الزر لإضافة تقرير وسيقوم النظام بتحديث التقرير الشهري والسنوي تلقائياً.'}
                </p>
              </div>
            </div>

            <button
              className="primary-action-btn"
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                height: '36px',
                padding: '0 1rem',
                fontSize: '0.82rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderColor: '#059669'
              }}
            >
              <Plus size={15} />
              <span>إضافة تقرير يومي للفترة</span>
            </button>
          </div>

          {reportData.contributingReports && reportData.contributingReports.length > 0 ? (
            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <table className="custom-table" style={{ width: '100%', fontSize: '0.84rem' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={{ textAlign: 'right', padding: '0.75rem' }}>رقم التقرير</th>
                    <th>التاريخ</th>
                    <th>القطاع / الموقع</th>
                    <th>نوع التقرير</th>
                    <th>إنتاج الركام (طن)</th>
                    <th>استهلاك الوقود (لتر)</th>
                    <th>منجز الطريق (م.ط)</th>
                    <th>المهندس المُعد</th>
                    <th>الحالة</th>
                    <th style={{ textAlign: 'center' }}>معاينة وطباعة</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.contributingReports.map((r, idx) => (
                    <tr key={r.id || idx} style={{ transition: 'background-color 0.15s ease' }}>
                      <td style={{ fontWeight: 800, color: '#1e40af', padding: '0.75rem' }}>
                        {r.reportNumber}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                          {r.date ? new Date(r.date).toLocaleDateString('ar-LY') : '-'}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          background: String(r.sector).includes('A') ? '#e0f2fe' : '#fef3c7',
                          color: String(r.sector).includes('A') ? '#0369a1' : '#b45309'
                        }}>
                          {r.sector}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: '#334155' }}>
                        {r.reportType}
                      </td>
                      <td>
                        <strong style={{ color: '#0f172a' }}>
                          {Number(r.productionAmount || 0).toLocaleString()}
                        </strong> طن
                      </td>
                      <td>
                        <strong style={{ color: '#dc2626' }}>
                          {Number(r.fuelAmount || 0).toLocaleString()}
                        </strong> لتر
                      </td>
                      <td>
                        <strong style={{ color: '#16a34a' }}>
                          {Number(r.roadMeters || 0).toLocaleString()}
                        </strong> م.ط
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {r.uploadedBy}
                      </td>
                      <td>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          background: '#dcfce7',
                          color: '#15803d'
                        }}>
                          ✓ معتمد
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => setSelectedDailyReportForPrint(r)}
                          style={{
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '6px',
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#1d4ed8',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                          title="معاينة التقرير وطباعته رسمياً"
                        >
                          <Printer size={13} />
                          <span>معاينة / طباعة</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot style={{ background: '#f8fafc', fontWeight: 800, borderTop: '2px solid #cbd5e1' }}>
                  <tr>
                    <td colSpan={4} style={{ padding: '0.75rem', textAlign: 'right', color: '#0f172a' }}>
                      إجمالي المساهمة الميدانية الفعلية ({reportData.contributingReports.length} تقرير):
                    </td>
                    <td style={{ color: '#1d4ed8' }}>
                      {reportData.contributingReports.reduce((s, r) => s + (Number(r.productionAmount) || 0), 0).toLocaleString()} طن
                    </td>
                    <td style={{ color: '#dc2626' }}>
                      {reportData.contributingReports.reduce((s, r) => s + (Number(r.fuelAmount) || 0), 0).toLocaleString()} لتر
                    </td>
                    <td style={{ color: '#16a34a' }}>
                      {reportData.contributingReports.reduce((s, r) => s + (Number(r.roadMeters) || 0), 0).toLocaleString()} م.ط
                    </td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div style={{
              background: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '10px',
              padding: '2rem 1.5rem',
              textAlign: 'center'
            }}>
              <AlertCircle size={32} color="#94a3b8" style={{ margin: '0 auto 0.6rem auto' }} />
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                لا توجد تقارير يومية مدخلة لهذه الفترة المحددة
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748b', maxWidth: '600px', margin: '0 auto 1.25rem auto' }}>
                البيانات الإحصائية المعروضة حالياً تعتمد على معدلات الأداء القياسية للجهاز. يمكنك إضافة تقرير ميداني جديد ليتم ربطه واحتسابه ضمن هذا التقرير الدوري فوراً.
              </p>
              <button
                className="primary-action-btn"
                onClick={() => setIsCreateModalOpen(true)}
                style={{ padding: '0 1.25rem', height: '38px', fontSize: '0.85rem' }}
              >
                <Plus size={16} />
                <span>+ تسجيل وإدخال تقرير يومي جديد</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Executive Recommendations & Official Endorsement */}
      {reportData && (
        <div className="dashboard-white-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <Award size={22} color="#2563eb" />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              ملاحظات وتوصيات الإدارة التنفيذية لجهاز مشروعات المواصلات
            </h4>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <ul style={{ margin: 0, paddingRight: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {reportData.executiveNotes.map((note, idx) => (
                <li key={idx} style={{ fontSize: '0.88rem', color: '#334155', lineHeight: '1.6' }}>
                  {note}
                </li>
              ))}
            </ul>
          </div>

          {/* Official Signatories Banner */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px dashed #cbd5e1'
          }}>
            <div style={{ textAlign: 'center', padding: '0.75rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.4rem' }}>مهندس الموقع الميداني</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>{reportData.signatories.siteEngineer}</div>
              <div style={{ fontSize: '0.7rem', color: '#16a34a', marginTop: '0.3rem' }}>✓ تم التدقيق الميداني</div>
            </div>

            <div style={{ textAlign: 'center', padding: '0.75rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.4rem' }}>مدير متابعة القطاعات</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>{reportData.signatories.sectorManager}</div>
              <div style={{ fontSize: '0.7rem', color: '#16a34a', marginTop: '0.3rem' }}>✓ معتمد رسمياً</div>
            </div>

            <div style={{ textAlign: 'center', padding: '0.75rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.4rem' }}>مدير عام المشروع</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>{reportData.signatories.projectDirector}</div>
              <div style={{ fontSize: '0.7rem', color: '#16a34a', marginTop: '0.3rem' }}>✓ مصادق وموجه للوزارة</div>
            </div>
          </div>
        </div>
      )}

      {/* Official Print Preview Modal */}
      {showPrintModal && reportData && (
        <div className="modal-backdrop-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '900px',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '2.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            direction: 'rtl'
          }}>
            {/* Modal Controls Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  className="primary-action-btn"
                  onClick={handleExecuteBrowserPrint}
                  style={{ height: '38px', padding: '0 1.25rem', fontSize: '0.85rem' }}
                >
                  <Printer size={16} />
                  <span>طباعة فورية / حفظ PDF</span>
                </button>
              </div>

              <button 
                onClick={() => setShowPrintModal(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.4rem 0.85rem',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                إغلاق ✕
              </button>
            </div>

            {/* Printable Document Container (A4 layout styling) */}
            <div id="printable-periodic-report" style={{
              background: '#ffffff',
              border: '2px solid #0f172a',
              borderRadius: '8px',
              padding: '2.5rem',
              color: '#0f172a'
            }}>
              {/* Header with Agency Emblem */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 900, margin: '0 0 0.2rem 0' }}>دولة ليبيا</h3>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 0.2rem 0', color: '#1e3a8a' }}>حكومة الوحدة الوطنية</h4>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>وزارة المواصلات</h4>
                  <h5 style={{ fontSize: '0.88rem', fontWeight: 700, margin: '0.2rem 0 0 0', color: '#475569' }}>جهاز تنفيذ مشروعات المواصلات</h5>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <img 
                    src={`${import.meta.env.BASE_URL}logo-agency.jpg`} 
                    alt="شعار جهاز مشروعات المواصلات" 
                    style={{ width: '85px', height: '85px', objectFit: 'contain' }}
                  />
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, marginTop: '0.2rem' }}>مشروع أوباري - غات</div>
                </div>

                <div style={{ textAlign: 'left', fontSize: '0.8rem', lineHeight: '1.7' }}>
                  <div><strong>رقم التقرير:</strong> {reportData.reportCode}</div>
                  <div><strong>تاريخ الإصدار:</strong> {new Date(reportData.generatedAt).toLocaleDateString('ar-LY')}</div>
                  <div><strong>نوع التقرير:</strong> {reportType === 'annual' ? 'سنوي شامل' : 'شهري دوري'}</div>
                  <div><strong>الاعتماد:</strong> رسمي مصادق</div>
                </div>
              </div>

              {/* Title */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1e3a8a', margin: '0 0 0.4rem 0' }}>
                  {reportData.reportTitle}
                </h2>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>
                  نطاق التقرير: {reportData.sector} | أيام التشغيل: {reportData.periodDays} يوم عمل
                </div>
              </div>

              {/* KPIs Summary Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem' }}>إجمالي الإنتاج الركامي</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem' }}>استهلاك السولار</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem' }}>توريد الشرشور</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem' }}>منجز الطريق التراكمي</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem' }}>جاهزية الأسطول</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ textAlign: 'center' }}>
                    <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem', fontWeight: 800 }}>
                      {reportData.kpis.totalProduction.toLocaleString()} طن
                    </td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem', fontWeight: 800 }}>
                      {reportData.kpis.totalFuel.toLocaleString()} لتر
                    </td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem', fontWeight: 800 }}>
                      {reportData.kpis.sharshoorDelivered.toLocaleString()} طن
                    </td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem', fontWeight: 800 }}>
                      {reportData.kpis.projectCompletedKm} كم ({reportData.kpis.projectOverallPercentage}%)
                    </td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '0.6rem', fontWeight: 800 }}>
                      {reportData.kpis.fleetReadinessRate}%
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Sector Breakdown */}
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.5rem' }}>مقارنة أداء القطاعات:</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'right' }}>القطاع والشركة</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem' }}>الإنتاج (طن)</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem' }}>الوقود (لتر)</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem' }}>مسافة الرصف</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem' }}>نسبة الإنجاز</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ textAlign: 'center' }}>
                    <td style={{ border: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'right', fontWeight: 700 }}>
                      {reportData.sectorComparison.sectorA.name}
                    </td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '0.5rem' }}>{reportData.sectorComparison.sectorA.productionTons.toLocaleString()}</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '0.5rem' }}>{reportData.sectorComparison.sectorA.fuelLiters.toLocaleString()}</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '0.5rem' }}>{reportData.sectorComparison.sectorA.roadMeters.toLocaleString()} م.ط</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '0.5rem', fontWeight: 800 }}>{reportData.sectorComparison.sectorA.completionRate}%</td>
                  </tr>
                  <tr style={{ textAlign: 'center' }}>
                    <td style={{ border: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'right', fontWeight: 700 }}>
                      {reportData.sectorComparison.sectorB.name}
                    </td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '0.5rem' }}>{reportData.sectorComparison.sectorB.productionTons.toLocaleString()}</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '0.5rem' }}>{reportData.sectorComparison.sectorB.fuelLiters.toLocaleString()}</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '0.5rem' }}>{reportData.sectorComparison.sectorB.roadMeters.toLocaleString()} م.ط</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '0.5rem', fontWeight: 800 }}>{reportData.sectorComparison.sectorB.completionRate}%</td>
                  </tr>
                </tbody>
              </table>

              {/* Contributing Daily Reports in Print Preview */}
              {reportData.contributingReports && reportData.contributingReports.length > 0 && (
                <>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                    بيان التقارير اليومية المساهمة في هذا التقرير الدوري ({reportData.contributingReports.length} تقرير):
                  </h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9' }}>
                        <th style={{ border: '1px solid #cbd5e1', padding: '0.4rem' }}>رقم التقرير</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '0.4rem' }}>التاريخ</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '0.4rem' }}>القطاع</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '0.4rem' }}>الإنتاج (طن)</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '0.4rem' }}>الوقود (لتر)</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '0.4rem' }}>الرصف (م.ط)</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '0.4rem' }}>المسؤول</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.contributingReports.slice(0, 15).map((r, i) => (
                        <tr key={i} style={{ textAlign: 'center' }}>
                          <td style={{ border: '1px solid #cbd5e1', padding: '0.35rem', fontWeight: 700 }}>{r.reportNumber}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>{r.date ? new Date(r.date).toLocaleDateString('ar-LY') : '-'}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>{r.sector}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>{Number(r.productionAmount || 0).toLocaleString()}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>{Number(r.fuelAmount || 0).toLocaleString()}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>{Number(r.roadMeters || 0).toLocaleString()}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>{r.uploadedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* Notes */}
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.5rem' }}>ملاحظات وتوصيات الإدارة التنفيذية:</h4>
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.85rem', marginBottom: '2rem', fontSize: '0.82rem', lineHeight: '1.6' }}>
                <ul style={{ margin: 0, paddingRight: '1.25rem' }}>
                  {reportData.executiveNotes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>

              {/* Signatures and Stamp */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', textAlign: 'center', marginTop: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '2.5rem' }}>مهندس الموقع الميداني</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{reportData.signatories.siteEngineer}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>التوقيع: .....................</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '2.5rem' }}>مدير متابعة القطاعات</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{reportData.signatories.sectorManager}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>التوقيع: .....................</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '2.5rem' }}>اعتماد مدير المشروع (الجهاز)</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{reportData.signatories.projectDirector}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>الختم والتوقيع الرسمي: .....................</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Modal for Creating New Daily Report */}
      {isCreateModalOpen && (
        <CreateReportModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          currentUser={currentUser}
          onReportCreated={() => {
            setIsCreateModalOpen(false);
            fetchPeriodicReport();
          }}
        />
      )}

      {/* Modal for Printing Selected Daily Report */}
      {selectedDailyReportForPrint && (
        <OfficialPrintModal
          isOpen={!!selectedDailyReportForPrint}
          onClose={() => setSelectedDailyReportForPrint(null)}
          report={selectedDailyReportForPrint}
          currentUser={currentUser}
        />
      )}

    </div>
  );
};

export default PeriodicReportsView;
