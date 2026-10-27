import React, { useState, useEffect } from 'react';
import { 
  Fuel, Search, FileSpreadsheet, Droplet, Calendar, X, 
  RefreshCw, Trash2, Eye, FileText, Printer, Layers, CheckCircle2,
  MapPin, ShieldCheck, Edit3
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { CreateFuelReportModal } from '../components/CreateFuelReportModal';
import { OfficialPrintModal } from '../components/OfficialPrintModal';
import { FuelDailyReportForm } from '../components/FuelDailyReportForm';

// Helper to safely parse numbers with commas, Arabic/Latin formats or strings
const cleanNum = (val) => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const s = String(val).replace(/,/g, '').trim();
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
};

export const FuelView = ({ currentUser, onNavigateTab }) => {
  const [activeViewMode, setActiveViewMode] = useState('dashboard'); // 'dashboard' | 'form'
  const [fuelReports, setFuelReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFuelReportModalOpen, setIsFuelReportModalOpen] = useState(false);
  const [selectedReportForPrint, setSelectedReportForPrint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewDetailsReport, setViewDetailsReport] = useState(null);
  const [reportToDelete, setReportToDelete] = useState(null);

  // Fetch fuel reports from API & localStorage
  const fetchFuelReports = async () => {
    setIsLoading(true);
    try {
      let remoteReports = [];
      try {
        const response = await fetch('http://localhost:5000/api/reports');
        const data = await response.json();
        remoteReports = data?.reports || (Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn('Backend API unavailable, using local storage:', err);
      }

      // Also read locally cached reports
      let localReports = [];
      try {
        localReports = JSON.parse(localStorage.getItem('local_reports') || '[]');
      } catch (e) {
        console.error(e);
      }

      // Combine & deduplicate
      const all = [...remoteReports, ...localReports];
      const uniqueMap = new Map();
      all.forEach(r => {
        if (r && r.id && !uniqueMap.has(String(r.id))) {
          uniqueMap.set(String(r.id), r);
        }
      });

      const uniqueList = Array.from(uniqueMap.values());
      const filtered = uniqueList.filter(r => 
        r.isFuelReport || 
        r.reportType === 'تقرير كميات الوقود اليومية' || 
        (r.title && r.title.includes('تقرير كميات الوقود')) ||
        (Array.isArray(r.fuelItems) && r.fuelItems.length > 0)
      );

      // Sort newest first
      filtered.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
      setFuelReports(filtered);
    } catch (e) {
      console.error('Failed to fetch fuel reports in FuelView', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFuelReports();

    const handleUpdate = () => fetchFuelReports();
    window.addEventListener('report-saved', handleUpdate);
    return () => window.removeEventListener('report-saved', handleUpdate);
  }, []);

  // Strict & Accurate Calculations directly from Daily Fuel Reports:
  // 1. عداد السولار المصروف (ديزل الآليات والمعدات)
  const totalSolarDispatched = fuelReports.reduce((acc, rep) => {
    const items = Array.isArray(rep?.fuelItems) ? rep.fuelItems : [];
    const disp = cleanNum(rep?.totalDispatchedLiters) || cleanNum(rep?.fuelAmount) || items.reduce((s, c) => s + cleanNum(c?.dispatchedLiters), 0);
    return acc + disp;
  }, 0);

  // 2. عداد وارد الوقود (الشحنات المستلمة بالخزانات)
  const totalFuelReceived = fuelReports.reduce((acc, rep) => {
    const items = Array.isArray(rep?.fuelItems) ? rep.fuelItems : [];
    const rec = cleanNum(rep?.totalReceivedLiters) || items.reduce((s, c) => s + cleanNum(c?.receivedLiters), 0);
    return acc + rec;
  }, 0);

  // 3. عداد رصيد الوقود المتبقي (المخزون الحالي المتوفر بالخزانات والصهاريج)
  const latestReport = fuelReports[0];
  const currentFuelRemaining = latestReport
    ? (cleanNum(latestReport.totalRemainingLiters) || (Array.isArray(latestReport.fuelItems) ? latestReport.fuelItems : []).reduce((s, c) => s + cleanNum(c?.remainingLiters), 0))
    : fuelReports.reduce((acc, rep) => {
        const items = Array.isArray(rep?.fuelItems) ? rep.fuelItems : [];
        const rem = cleanNum(rep?.totalRemainingLiters) || items.reduce((s, c) => s + cleanNum(c?.remainingLiters), 0);
        return acc + rem;
      }, 0);

  // Filter fuel reports based on search term
  const filteredReports = fuelReports.filter(rep => {
    if (!rep) return false;
    const term = searchTerm.toLowerCase();
    const repNum = (rep.reportNumber || `#FUEL-${rep.id}`).toLowerCase();
    const repSector = (rep.sector || '').toLowerCase();
    const repUploader = (rep.uploadedBy || '').toLowerCase();
    const repDate = (rep.dateFormatted || rep.date || '').toLowerCase();
    const items = Array.isArray(rep.fuelItems) ? rep.fuelItems : [];
    const repLocations = items.map(i => i?.location || '').join(' ').toLowerCase();

    return repNum.includes(term) || 
      repSector.includes(term) || 
      repUploader.includes(term) || 
      repDate.includes(term) || 
      repLocations.includes(term);
  });

  // Confirm delete of fuel report
  const confirmDeleteFuelReport = async () => {
    if (!reportToDelete) return;
    const targetId = reportToDelete.id;

    // Optimistic UI update
    setFuelReports(prev => prev.filter(r => r.id !== targetId && String(r.id) !== String(targetId)));
    
    // Update local storage
    try {
      const local = JSON.parse(localStorage.getItem('local_reports') || '[]');
      const updatedLocal = local.filter(r => r.id !== targetId && String(r.id) !== String(targetId));
      localStorage.setItem('local_reports', JSON.stringify(updatedLocal));
    } catch (e) {
      console.error(e);
    }

    setReportToDelete(null);

    // Call backend API
    try {
      await fetch(`http://localhost:5000/api/reports/${targetId}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Failed to delete fuel report from backend', error);
    }
    fetchFuelReports();
  };

  // Export Fuel Reports to Excel
  const exportToExcel = () => {
    if (fuelReports.length === 0) {
      alert('لا توجد تقارير وقود لتصديرها.');
      return;
    }

    const data = [];
    fuelReports.forEach((rep, idx) => {
      const repDate = rep?.dateFormatted || (rep?.date ? rep.date.split('T')[0] : 'اليوم');
      const items = Array.isArray(rep?.fuelItems) ? rep.fuelItems : [];
      const disp = cleanNum(rep?.totalDispatchedLiters) || cleanNum(rep?.fuelAmount) || items.reduce((acc, c) => acc + cleanNum(c?.dispatchedLiters), 0);
      const rec = cleanNum(rep?.totalReceivedLiters) || items.reduce((acc, c) => acc + cleanNum(c?.receivedLiters), 0);
      const rem = cleanNum(rep?.totalRemainingLiters) || items.reduce((acc, c) => acc + cleanNum(c?.remainingLiters), 0);
      const locations = items.map(i => `${i?.location || '-'}: (${cleanNum(i?.dispatchedLiters)} لتر)`).join(' | ') || rep?.sector || 'الموقع العام';

      data.push({
        'م': idx + 1,
        'رقم تقرير الوقود': rep?.reportNumber || `#FUEL-${rep?.id}`,
        'التاريخ': repDate,
        'اليوم': rep?.dayName || 'السبت',
        'المرحلة / الموقع': rep?.sector || 'المرحلة الأولى',
        'السولار المصروف (لتر)': disp,
        'الوارد (لتر)': rec,
        'الكمية المتبقية (لتر)': rem,
        'المواقع والخزانات': locations,
        'المعد / المشرف': rep?.uploadedBy || 'مسؤول الوقود',
        'حالة الاعتماد': rep?.status === 'approved' ? 'معتمد' : 'قيد المراجعة'
      });
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'تقارير كميات الوقود اليومية');
    XLSX.writeFile(wb, `سجل_تقارير_كميات_الوقود_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="view-content" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Top Header Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        background: '#ffffff',
        padding: '1.25rem 1.75rem',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#fff', 
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)' 
          }}>
            <Fuel size={26} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>
              إدارة الوقود والمحروقات
            </h2>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              متابعة تقارير كميات السولار المنصرف، وارد الوقود، والمخزون المتبقي بالخزانات والصهاريج الميدانية
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Main Action Button: إنشاء تقرير الوقود */}
          <button
            type="button"
            onClick={() => setIsFuelReportModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.7rem 1.35rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
              transition: 'all 0.15s ease'
            }}
          >
            <FileText size={18} />
            <span>إنشاء تقرير الوقود</span>
          </button>

          {/* Toggle Direct Edit of Approved Fuel Report */}
          <button
            type="button"
            onClick={() => setActiveViewMode(prev => prev === 'form' ? 'dashboard' : 'form')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.7rem 1.25rem',
              borderRadius: '10px',
              background: activeViewMode === 'form' ? '#1e293b' : '#fef3c7',
              border: activeViewMode === 'form' ? 'none' : '1.5px solid #f59e0b',
              color: activeViewMode === 'form' ? '#ffffff' : '#b45309',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Edit3 size={17} />
            <span>{activeViewMode === 'form' ? 'الرجوع لسجل الوقود' : 'تعديل تقرير الوقود المعتمد (24/10/2026)'}</span>
          </button>

          {/* Export Excel Button */}
          <button
            type="button"
            onClick={exportToExcel}
            className="secondary-action-btn"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.45rem', 
              padding: '0.7rem 1.15rem', 
              borderRadius: '10px', 
              fontWeight: 800,
              fontSize: '0.88rem'
            }}
            title="تصدير كشف تقارير الوقود إلى إكسل"
          >
            <FileSpreadsheet size={18} color="#16a34a" />
            <span>تصدير إكسل</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchFuelReports}
            className="secondary-action-btn"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              padding: '0.7rem 1rem', 
              borderRadius: '10px', 
              fontWeight: 800,
              fontSize: '0.88rem'
            }}
            title="تحديث البيانات"
          >
            <RefreshCw size={17} color="#475569" />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {activeViewMode === 'form' ? (
        <FuelDailyReportForm 
          currentUser={currentUser}
          onSaved={fetchFuelReports}
          onPrintReport={(rep) => setSelectedReportForPrint(rep)}
          onNavigateTab={onNavigateTab}
        />
      ) : (
        <>
      {/* =========================================================================
          SEPARATE GAUGES: عداد السولار وحده و عداد الوقود وحده (عدادات دقيقة ومستقلة)
         ========================================================================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.75rem'
      }}>
        
        {/* 1. عداد السولار وحده (المنصرف والمستهلك للآليات) */}
        <div className="kpi-metric-card" style={{ 
          borderTop: '4px solid #ea580c',
          background: 'linear-gradient(180deg, #fffbf7 0%, #ffffff 100%)'
        }}>
          <div className="kpi-card-header">
            <div>
              <span className="kpi-title" style={{ fontSize: '0.92rem', color: '#9a3412', fontWeight: 900 }}>
                عداد السولار (المنصرف)
              </span>
              <div style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 700, marginTop: '2px' }}>
                ديزل الآليات والكسارات الميدانية
              </div>
            </div>
            <div className="kpi-icon-circle orange" style={{ background: '#ffedd5', color: '#ea580c' }}>
              <Fuel size={22} color="#ea580c" />
            </div>
          </div>
          <div className="kpi-value-center" style={{ margin: '0.75rem 0' }}>
            <span className="kpi-big-num" style={{ fontSize: '2.3rem', color: '#c2410c' }}>
              {totalSolarDispatched.toLocaleString()}
            </span>
            <span className="kpi-unit-label" style={{ fontSize: '0.92rem', color: '#9a3412', fontWeight: 800 }}>
              لتر ديزل
            </span>
          </div>
          <div className="kpi-bottom-sub">
            <span className="kpi-green-badge" style={{ background: '#fff7ed', color: '#c2410c', borderColor: '#fed7aa', fontWeight: 800 }}>
              محسوب بدقة من واقع تقارير الوقود الميدانية
            </span>
          </div>
        </div>

        {/* 2. عداد وارد الوقود وحده (الشحنات الموردة للموقع) */}
        <div className="kpi-metric-card" style={{ 
          borderTop: '4px solid #2563eb',
          background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)'
        }}>
          <div className="kpi-card-header">
            <div>
              <span className="kpi-title" style={{ fontSize: '0.92rem', color: '#1e40af', fontWeight: 900 }}>
                عداد وارد الوقود
              </span>
              <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 700, marginTop: '2px' }}>
                شحنات التوريد لخزانات الموقع
              </div>
            </div>
            <div className="kpi-icon-circle blue" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Droplet size={22} color="#2563eb" />
            </div>
          </div>
          <div className="kpi-value-center" style={{ margin: '0.75rem 0' }}>
            <span className="kpi-big-num" style={{ fontSize: '2.3rem', color: '#1d4ed8' }}>
              {totalFuelReceived.toLocaleString()}
            </span>
            <span className="kpi-unit-label" style={{ fontSize: '0.92rem', color: '#1e40af', fontWeight: 800 }}>
              لتر وارد
            </span>
          </div>
          <div className="kpi-bottom-sub">
            <span className="kpi-green-badge" style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe', fontWeight: 800 }}>
              إجمالي الكميات الموردة والمستلمة بالخزانات
            </span>
          </div>
        </div>

        {/* 3. عداد رصيد الوقود المتبقي وحده (المخزون المتوفر بالخزانات والصهاريج) */}
        <div className="kpi-metric-card" style={{ 
          borderTop: '4px solid #16a34a',
          background: 'linear-gradient(180deg, #f6fdf8 0%, #ffffff 100%)'
        }}>
          <div className="kpi-card-header">
            <div>
              <span className="kpi-title" style={{ fontSize: '0.92rem', color: '#166534', fontWeight: 900 }}>
                عداد رصيد الوقود المتبقي
              </span>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, marginTop: '2px' }}>
                المخزون الحالي بالخزانات والصهاريج
              </div>
            </div>
            <div className="kpi-icon-circle green" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <Layers size={22} color="#16a34a" />
            </div>
          </div>
          <div className="kpi-value-center" style={{ margin: '0.75rem 0' }}>
            <span className="kpi-big-num" style={{ fontSize: '2.3rem', color: '#15803d' }}>
              {currentFuelRemaining.toLocaleString()}
            </span>
            <span className="kpi-unit-label" style={{ fontSize: '0.92rem', color: '#166534', fontWeight: 800 }}>
              لتر متوفر
            </span>
          </div>
          <div className="kpi-bottom-sub">
            <span className="kpi-green-badge" style={{ background: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0', fontWeight: 800 }}>
              رصيد المخزون الاحتياطي الجاهز للتشغيل
            </span>
          </div>
        </div>

        {/* 4. إجمالي تقارير الوقود المعتمدة */}
        <div className="kpi-metric-card" style={{ 
          borderTop: '4px solid #7c3aed',
          background: 'linear-gradient(180deg, #fcfaff 0%, #ffffff 100%)'
        }}>
          <div className="kpi-card-header">
            <div>
              <span className="kpi-title" style={{ fontSize: '0.92rem', color: '#5b21b6', fontWeight: 900 }}>
                تقارير الوقود اليومية المعتمدة
              </span>
              <div style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 700, marginTop: '2px' }}>
                سجل التوثيق الرسمي بالموقع
              </div>
            </div>
            <div className="kpi-icon-circle purple" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
              <FileText size={22} color="#7c3aed" />
            </div>
          </div>
          <div className="kpi-value-center" style={{ margin: '0.75rem 0' }}>
            <span className="kpi-big-num" style={{ fontSize: '2.3rem', color: '#6d28d9' }}>
              {fuelReports.length}
            </span>
            <span className="kpi-unit-label" style={{ fontSize: '0.92rem', color: '#5b21b6', fontWeight: 800 }}>
              تقرير معتمد
            </span>
          </div>
          <div className="kpi-bottom-sub">
            <span className="kpi-green-badge" style={{ background: '#f5f3ff', color: '#6d28d9', borderColor: '#ddd6fe', fontWeight: 800 }}>
              موثقة ومراجعة من جهاز الإشراف
            </span>
          </div>
        </div>

      </div>

      {/* Search and Filter Controls */}
      <div className="table-controls-bar" style={{ marginBottom: '1.25rem' }}>
        <div className="search-input-box" style={{ flex: 1, maxWidth: '520px' }}>
          <Search size={18} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="بحث برقم التقرير، الموقع، المشرف، أو التاريخ..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <X size={16} color="#94a3b8" />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.86rem', color: '#64748b', fontWeight: 700 }}>
            إجمالي التقارير المعروضة: <strong>{filteredReports.length}</strong>
          </span>
        </div>
      </div>

      {/* Main Table: تقارير كميات الوقود اليومية المرفوعة والمعتمدة */}
      <div className="table-container" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <table className="custom-table">
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ width: '130px' }}>رقم التقرير</th>
              <th style={{ width: '150px' }}>التاريخ واليوم</th>
              <th style={{ width: '130px' }}>المرحلة / الموقع</th>
              <th style={{ width: '140px', background: '#fffbeb', color: '#b45309' }}>السولار المصروف (لتر)</th>
              <th style={{ width: '130px', background: '#eff6ff', color: '#1e40af' }}>وارد الوقود (لتر)</th>
              <th style={{ width: '140px', background: '#f0fdf4', color: '#166534' }}>رصيد الوقود المتبقي (لتر)</th>
              <th style={{ width: '140px' }}>المعد / المشرف</th>
              <th style={{ width: '120px' }}>وثيقة التقرير</th>
              <th style={{ width: '180px', textAlign: 'center' }}>الإجراءات الرسمية</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.5rem', display: 'block', color: '#f59e0b' }} />
                  <p style={{ margin: 0, fontWeight: 700 }}>جاري تحميل تقارير الوقود...</p>
                </td>
              </tr>
            ) : filteredReports.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <Fuel size={42} color="#d97706" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>
                    {searchTerm ? 'لا توجد تقارير وقود مطابقة لبحثك' : 'لا توجد تقارير وقود مسجلة حتى الآن'}
                  </p>
                  <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0.35rem 0 1rem' }}>
                    يمكنك إنشاء تقرير يومي جديد من خلال الضغط على زر "إنشاء تقرير الوقود" أعلاه.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsFuelReportModalOpen(true)}
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.6rem 1.25rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)'
                    }}
                  >
                    إنشاء تقرير الوقود الآن
                  </button>
                </td>
              </tr>
            ) : (
              filteredReports.map(rep => {
                const repDate = rep?.dateFormatted || (rep?.date ? rep.date.split('T')[0] : 'اليوم');
                const items = Array.isArray(rep?.fuelItems) ? rep.fuelItems : [];
                const dispatched = cleanNum(rep?.totalDispatchedLiters) || cleanNum(rep?.fuelAmount) || items.reduce((acc, c) => acc + cleanNum(c?.dispatchedLiters), 0);
                const received = cleanNum(rep?.totalReceivedLiters) || items.reduce((acc, c) => acc + cleanNum(c?.receivedLiters), 0);
                const remaining = cleanNum(rep?.totalRemainingLiters) || items.reduce((acc, c) => acc + cleanNum(c?.remainingLiters), 0);
                
                return (
                  <tr key={rep.id}>
                    {/* Report Number */}
                    <td>
                      <span className="code-badge" style={{ 
                        background: '#fffbeb', 
                        color: '#b45309', 
                        border: '1px solid #fde68a',
                        fontWeight: 900
                      }}>
                        {rep.reportNumber || `#FUEL-${rep.id}`}
                      </span>
                    </td>

                    {/* Date and Day */}
                    <td>
                      <div className="flex-cell">
                        <Calendar size={14} color="#d97706" />
                        <strong>{repDate}</strong>
                        <span style={{ fontSize: '0.76rem', color: '#64748b' }}>({rep.dayName || 'السبت'})</span>
                      </div>
                    </td>

                    {/* Sector / Location */}
                    <td>
                      <span className="sector-tag" style={{ background: '#f1f5f9', color: '#1e293b', fontWeight: 800 }}>
                        {rep.sector || 'المرحلة الأولى'}
                      </span>
                    </td>

                    {/* Dispatched Solar */}
                    <td style={{ background: '#fffbeb' }}>
                      <span style={{ 
                        background: '#ffedd5', 
                        color: '#c2410c', 
                        padding: '4px 10px', 
                        borderRadius: '6px', 
                        fontWeight: 900,
                        display: 'inline-block'
                      }}>
                        {dispatched.toLocaleString()} لتر
                      </span>
                    </td>

                    {/* Received Fuel */}
                    <td style={{ background: '#eff6ff' }}>
                      <span style={{ 
                        background: '#dbeafe', 
                        color: '#1d4ed8', 
                        padding: '4px 10px', 
                        borderRadius: '6px', 
                        fontWeight: 900,
                        display: 'inline-block'
                      }}>
                        {received.toLocaleString()} لتر
                      </span>
                    </td>

                    {/* Remaining Fuel */}
                    <td style={{ background: '#f0fdf4' }}>
                      <span style={{ 
                        background: '#dcfce7', 
                        color: '#15803d', 
                        padding: '4px 10px', 
                        borderRadius: '6px', 
                        fontWeight: 900,
                        display: 'inline-block'
                      }}>
                        {remaining.toLocaleString()} لتر
                      </span>
                    </td>

                    {/* Uploader / Supervisor */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <ShieldCheck size={14} color="#16a34a" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                          {rep.uploadedBy || 'مسؤول الوقود'}
                        </span>
                      </div>
                    </td>

                    {/* Attached Image / Document Preview */}
                    <td>
                      {rep.imageUrl ? (
                        <div 
                          style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '0.4rem', 
                            cursor: 'pointer', 
                            background: '#fff7ed', 
                            padding: '0.25rem 0.6rem', 
                            borderRadius: '8px', 
                            border: '1px solid #fed7aa',
                            transition: 'all 0.15s ease'
                          }}
                          onClick={() => setSelectedImage(rep.imageUrl)}
                          title="انقر لتكبير الوثيقة المرفوعة"
                        >
                          <img 
                            src={rep.imageUrl} 
                            alt="وثيقة التقرير" 
                            style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '6px' }} 
                          />
                          <span style={{ fontSize: '0.76rem', color: '#c2410c', fontWeight: 700 }}>معاينة المستند</span>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>تقرير إلكتروني</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', justifyContent: 'center' }}>
                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => setViewDetailsReport(rep)}
                          style={{
                            background: '#f8fafc',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '0.35rem 0.65rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.76rem',
                            color: '#334155',
                            fontWeight: 800
                          }}
                          title="عرض تفاصيل التقرير والمواقع"
                        >
                          <Eye size={13} />
                          <span>عرض</span>
                        </button>

                        {/* Print Official Yellow Report */}
                        <button
                          type="button"
                          onClick={() => setSelectedReportForPrint(rep)}
                          style={{
                            background: '#fef3c7',
                            border: '1.5px solid #f59e0b',
                            borderRadius: '6px',
                            padding: '0.35rem 0.65rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.76rem',
                            color: '#b45309',
                            fontWeight: 800
                          }}
                          title="طباعة تقرير كميات الوقود اليومية (النموذج الأصفر المعتمد)"
                        >
                          <Printer size={13} />
                          <span>طباعة النموذج الأصفر</span>
                        </button>

                        {/* Delete Report */}
                        <button
                          type="button"
                          onClick={() => setReportToDelete(rep)}
                          style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            padding: '0.35rem 0.5rem',
                            cursor: 'pointer',
                            color: '#dc2626'
                          }}
                          title="حذف هذا التقرير"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* =========================================================================
          MODALS & LIGHTBOXES
         ========================================================================= */}

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div className="modal-backdrop" onClick={() => setSelectedImage(null)} style={{ zIndex: 99999 }}>
          <div className="modal-card" style={{ maxWidth: '720px', padding: '1.25rem' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>صورة وثيقة تقرير الوقود الميداني</h3>
              <button onClick={() => setSelectedImage(null)} className="close-btn"><X size={20}/></button>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <img 
                src={selectedImage} 
                alt="وثيقة تقرير الوقود" 
                style={{ maxWidth: '100%', maxHeight: '520px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
              />
            </div>
            <div className="modal-actions">
              <button className="primary-action-btn" onClick={() => setSelectedImage(null)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* View Detailed Fuel Report Modal */}
      {viewDetailsReport && (
        <div className="modal-backdrop" onClick={() => setViewDetailsReport(null)} style={{ zIndex: 99999 }}>
          <div className="modal-card" style={{ maxWidth: '750px', padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Fuel size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                    تفاصيل تقرير كميات الوقود ({viewDetailsReport.reportNumber || `#FUEL-${viewDetailsReport.id}`})
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    يوم {viewDetailsReport.dayName || 'السبت'} • {viewDetailsReport.dateFormatted || viewDetailsReport.date?.split('T')[0]}
                  </span>
                </div>
              </div>
              <button onClick={() => setViewDetailsReport(null)} className="close-btn"><X size={20}/></button>
            </div>

            <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Summary KPIs Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '0.85rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#c2410c', fontWeight: 800 }}>السولار المنصرف</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#9a3412', marginTop: '0.2rem' }}>
                    {cleanNum(viewDetailsReport.totalDispatchedLiters || viewDetailsReport.fuelAmount || 0).toLocaleString()} لتر
                  </div>
                </div>

                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '0.85rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#1d4ed8', fontWeight: 800 }}>الوارد للموقع</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e40af', marginTop: '0.2rem' }}>
                    {cleanNum(viewDetailsReport.totalReceivedLiters || 0).toLocaleString()} لتر
                  </div>
                </div>

                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.85rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 800 }}>المخزون المتبقي</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#166534', marginTop: '0.2rem' }}>
                    {cleanNum(viewDetailsReport.totalRemainingLiters || 0).toLocaleString()} لتر
                  </div>
                </div>
              </div>

              {/* Items Breakdown Table */}
              {Array.isArray(viewDetailsReport.fuelItems) && viewDetailsReport.fuelItems.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', display: 'block' }}>
                    جدول الكميات والمواقع المسجلة بالتقرير:
                  </span>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.85rem', border: '1px solid #e2e8f0' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                        <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem' }}>ت</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem' }}>الموقع / الخزان</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem', color: '#ea580c' }}>السولار المصروف (لتر)</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem', color: '#2563eb' }}>الوارد (لتر)</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem', color: '#16a34a' }}>الكمية المتبقية (لتر)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewDetailsReport.fuelItems.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ border: '1px solid #cbd5e1', padding: '0.45rem', fontWeight: 800 }}>{idx + 1}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '0.45rem', fontWeight: 700 }}>{item.location || '-'}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '0.45rem', fontWeight: 800, color: '#ea580c' }}>
                            {cleanNum(item.dispatchedLiters).toLocaleString()}
                          </td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '0.45rem', fontWeight: 800, color: '#2563eb' }}>
                            {cleanNum(item.receivedLiters).toLocaleString()}
                          </td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '0.45rem', fontWeight: 800, color: '#16a34a' }}>
                            {cleanNum(item.remainingLiters).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Notes */}
              {viewDetailsReport.notes && (
                <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.84rem' }}>
                  <strong style={{ color: '#475569', display: 'block', marginBottom: '0.25rem' }}>ملاحظات:</strong>
                  <span style={{ color: '#334155' }}>{viewDetailsReport.notes}</span>
                </div>
              )}
            </div>

            <div className="modal-actions" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem' }}>
              <button
                type="button"
                onClick={() => {
                  const rep = viewDetailsReport;
                  setViewDetailsReport(null);
                  setSelectedReportForPrint(rep);
                }}
                style={{
                  background: '#fef3c7',
                  border: '1.5px solid #f59e0b',
                  borderRadius: '8px',
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.88rem',
                  color: '#b45309',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Printer size={16} />
                <span>طباعة النموذج الأصفر</span>
              </button>
              <button 
                type="button" 
                className="primary-action-btn" 
                onClick={() => setViewDetailsReport(null)}
                style={{ padding: '0.6rem 1.5rem' }}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {reportToDelete && (
        <div className="modal-backdrop" style={{ zIndex: 99999 }}>
          <div className="modal-card" style={{ maxWidth: '440px', textAlign: 'center', padding: '1.75rem' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              border: '2px solid #fecaca'
            }}>
              <Trash2 size={26} />
            </div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
              تأكيد حذف تقرير الوقود
            </h3>
            <p style={{ margin: '0 0 1.5rem', fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6 }}>
              هل أنت متأكد من حذف تقرير الوقود رقم <strong>({reportToDelete.reportNumber || reportToDelete.id})</strong>؟ سيتم تحديث عدادات السولار والوقود الميدانية فوراً.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={confirmDeleteFuelReport}
                style={{
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.65rem 1.35rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                تأكيد الحذف
              </button>
              <button
                type="button"
                onClick={() => setReportToDelete(null)}
                className="secondary-action-btn"
                style={{ height: '42px', padding: '0 1.25rem' }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Daily Fuel Report Creation Modal */}
      {isFuelReportModalOpen && (
        <CreateFuelReportModal
          isOpen={isFuelReportModalOpen}
          currentUser={currentUser}
          onClose={() => setIsFuelReportModalOpen(false)}
          onReportCreated={(savedRep) => {
            fetchFuelReports();
          }}
          onPrintReport={(rep) => setSelectedReportForPrint(rep)}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* Official Print Modal for Fuel Report */}
      {selectedReportForPrint && (
        <OfficialPrintModal
          report={selectedReportForPrint}
          onClose={() => setSelectedReportForPrint(null)}
        />
      )}

    </div>
  );
};
