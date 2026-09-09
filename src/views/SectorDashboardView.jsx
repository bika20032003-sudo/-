import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, CheckCircle2, Clock, AlertTriangle, 
  FileText, Camera, RefreshCw, Eye, Check, Send, 
  Sparkles, X, Shield, Lock, TrendingUp, Layers, 
  Factory, Fuel, Truck, Milestone, Calendar, ChevronRight,
  Printer, Plus, Download
} from 'lucide-react';
import { fastFetch } from '../utils/apiCache.js';
import { OfficialPrintModal } from '../components/OfficialPrintModal';
import { CreateReportModal } from '../components/CreateReportModal';

export const SectorDashboardView = ({ currentUser }) => {
  const isSectorA = (currentUser?.sector || '').includes('A') || (currentUser?.username || '').includes('a');
  const sectorCode = isSectorA ? 'A' : 'B';
  const sectorName = isSectorA ? 'القطاع (A)' : 'القطاع (B)';
  const sectorArabic = isSectorA ? 'القطعة A' : 'القطعة B';
  const totalLengthKm = isSectorA ? '115.36' : '110.92';

  // Sector Overview Summary Data
  const [sectorData, setSectorData] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Print & Create Modal States
  const [selectedReportForPrint, setSelectedReportForPrint] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Sector Reports List State
  const [reports, setReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [reportFilter, setReportFilter] = useState('all');

  // Form State
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportType, setReportType] = useState('تقرير يومي شامل');
  const [productionAmount, setProductionAmount] = useState('');
  const [fuelAmount, setFuelAmount] = useState('');
  const [todayMeters, setTodayMeters] = useState('');
  const [notes, setNotes] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewModalReport, setViewModalReport] = useState(null);

  const fileInputRef = useRef(null);

  // 1. Fetch Sector Summary (Indicators, Road Layers, Crushers, Fuel, Equipment)
  const fetchSectorSummary = async () => {
    try {
      setIsDataLoading(true);
      const res = await fastFetch(`http://localhost:5000/api/dashboard/sector/${sectorCode}`);
      if (res && res.success) {
        setSectorData(res);
      }
    } catch (err) {
      console.error('Failed to load sector dashboard metrics', err);
    } finally {
      setIsDataLoading(false);
    }
  };

  // 2. Fetch Reports strictly belonging to this sector
  const fetchSectorReports = async () => {
    try {
      setIsLoadingReports(true);
      const res = await fastFetch(`http://localhost:5000/api/reports?sector=${sectorCode}`);
      let list = [];
      if (res && res.reports) {
        list = res.reports;
      } else if (Array.isArray(res)) {
        list = res;
      }
      
      try {
        const local = JSON.parse(localStorage.getItem('local_reports') || '[]');
        const matchingLocal = local.filter(r => (r.sectorCode === sectorCode || (r.sector || '').includes(sectorCode)));
        const existingIds = new Set(list.map(r => String(r.id || r.reportNumber)));
        const newOnes = matchingLocal.filter(r => !existingIds.has(String(r.id || r.reportNumber)));
        list = [...newOnes, ...list];
      } catch (e) {}

      setReports(list);
    } catch (err) {
      console.error('Failed to load sector reports', err);
    } finally {
      setIsLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchSectorSummary();
    fetchSectorReports();
  }, [sectorCode]);

  // Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedFile(event.target?.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle Form Submission & Direct Forwarding to Sector Manager
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg('');

    try {
      const payload = {
        date: new Date(reportDate).toISOString(),
        sector: sectorArabic,
        crusherName: `موقع ${sectorName}`,
        materialName: `${reportType} - ${sectorName}`,
        productionAmount: Number(productionAmount) || 0,
        salesAmount: Number(todayMeters) || 0,
        imageUrl: attachedFile,
        fileName,
        reportType,
        uploadedBy: currentUser?.name || `مشرف ${sectorName}`,
        status: 'pending_review', // Automatically placed in Sector Manager's review queue
        notes: notes ? `${notes} (وقود: ${fuelAmount || 0} لتر - إنجاز رصف: ${todayMeters || 0} م.ط)` : `وقود: ${fuelAmount || 0} لتر - إنجاز رصف: ${todayMeters || 0} م.ط`
      };

      const res = await fastFetch('http://localhost:5000/api/reports/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res && res.success) {
        setSuccessMsg(`تم إرسال وتحويل التقرير بنجاح إلى حساب مدير القطاعات للمراجعة والاعتماد.`);
        // Reset form
        setProductionAmount('');
        setFuelAmount('');
        setTodayMeters('');
        setNotes('');
        setAttachedFile(null);
        setFileName('');
        // Refresh local data
        fetchSectorReports();
        fetchSectorSummary();
      } else {
        alert('حدث خطأ أثناء إرسال التقرير');
      }
    } catch (err) {
      alert('تعذر الاتصال بالخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered reports
  const filteredReports = reports.filter(r => {
    if (reportFilter === 'all') return true;
    return r.status === reportFilter;
  });

  const pendingCount = reports.filter(r => r.status === 'pending_review').length;
  const approvedCount = reports.filter(r => r.status === 'approved').length;
  const rejectedCount = reports.filter(r => r.status === 'rejected').length;

  return (
    <div className="sector-portal-container" style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3.5rem' }}>
      
      {/* ================= 1. Top Executive Banner ================= */}
      <div style={{
        background: isSectorA 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)' 
          : 'linear-gradient(135deg, #0f172a 0%, #7c2d12 50%, #0f172a 100%)',
        borderRadius: '16px',
        padding: '1.75rem 2.25rem',
        color: '#fff',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative background glow */}
        <div style={{
          position: 'absolute',
          top: '-30%',
          right: '-5%',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: isSectorA ? 'rgba(59, 130, 246, 0.18)' : 'rgba(249, 115, 22, 0.18)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: '62px',
            height: '62px',
            borderRadius: '16px',
            background: isSectorA ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'linear-gradient(135deg, #ea580c, #c2410c)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isSectorA ? '0 8px 18px rgba(37, 99, 235, 0.4)' : '0 8px 18px rgba(234, 88, 12, 0.4)',
            flexShrink: 0
          }}>
            <Milestone size={32} color="#fff" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, color: '#fff' }}>
                لوحة العمليات والتقارير الميدانية - {sectorName}
              </h1>
              <span style={{
                background: isSectorA ? 'rgba(59, 130, 246, 0.25)' : 'rgba(249, 115, 22, 0.25)',
                border: isSectorA ? '1px solid rgba(96, 165, 250, 0.4)' : '1px solid rgba(251, 146, 60, 0.4)',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.76rem',
                fontWeight: 800,
                color: '#fff'
              }}>
                بوابة حصرية ومقفلة للقطاع
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.5rem', fontSize: '0.86rem', color: '#cbd5e1', flexWrap: 'wrap' }}>
              <span>📍 <strong>المشروع:</strong> طريق أوباري - غات</span>
              <span>📏 <strong>طول مسار القطاع:</strong> {totalLengthKm} كم</span>
              <span>👤 <strong>المشرف المسؤول:</strong> {currentUser?.name || `مشرف ${sectorName}`}</span>
            </div>
          </div>
        </div>

        {/* Overall Completion Progress Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '0.85rem 1.4rem',
          borderRadius: '14px',
          position: 'relative',
          zIndex: 1
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>نسبة إنجاز القطاع الكلية</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#38bdf8', lineHeight: 1.1, marginTop: '0.2rem' }}>
              {sectorData?.overallPercentage || '95.0'}%
            </div>
          </div>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'rgba(56, 189, 248, 0.15)',
            border: '2px solid #38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8'
          }}>
            <TrendingUp size={22} />
          </div>
        </div>
      </div>

      {/* Sector Quick Actions Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '0.85rem 1.25rem',
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#334155' }}>
            العمليات الميدانية السريعة لـ {sectorName}:
          </span>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            (سجل الأرشيف يحتوي على {reports.length} تقرير موثق)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: isSectorA ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'linear-gradient(135deg, #ea580c, #c2410c)',
              color: '#ffffff',
              border: 'none',
              padding: '0.55rem 1.2rem',
              borderRadius: '8px',
              fontSize: '0.86rem',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: isSectorA ? '0 3px 10px rgba(37, 99, 235, 0.3)' : '0 3px 10px rgba(234, 88, 12, 0.3)'
            }}
          >
            <Plus size={16} />
            <span>إنشاء تقرير ميداني جديد ✍️</span>
          </button>

          {reports.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedReportForPrint(reports[0])}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: '#f8fafc',
                color: '#1e3a8a',
                border: '1px solid #bfdbfe',
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              <Printer size={16} />
              <span>طباعة أحدث تقرير معتمد 🖨️</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: '12px',
          padding: '1rem 1.4rem',
          color: '#166534',
          fontWeight: 800,
          fontSize: '0.92rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          boxShadow: '0 3px 12px rgba(34, 197, 94, 0.15)'
        }}>
          <CheckCircle2 size={24} color="#16a34a" />
          <div style={{ flex: 1 }}>{successMsg}</div>
          <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534' }}>
            <X size={20} />
          </button>
        </div>
      )}

      {/* ================= 2. Sector KPI Operational Cards ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        
        {/* Card 1: Today Paving Meters */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '1.35rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b' }}>أعمال اليوم بمسار القطاع</span>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', marginTop: '0.3rem' }}>
                {sectorData?.todayMeters ? sectorData.todayMeters.toLocaleString() : '620'} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 700 }}>م.ط</span>
              </div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Milestone size={20} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.76rem', color: '#166534', fontWeight: 700, background: '#f0fdf4', padding: '0.35rem 0.65rem', borderRadius: '6px', display: 'inline-block', width: 'fit-content' }}>
            جاهزية التشغيل متواصلة ✅
          </div>
        </div>

        {/* Card 2: Sector Crusher Production */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '1.35rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b' }}>إنتاج كسارة {sectorName}</span>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', marginTop: '0.3rem' }}>
                {sectorData?.crushers?.productionToday ? sectorData.crushers.productionToday.toLocaleString() : (isSectorA ? '850' : '620')} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 700 }}>طن</span>
              </div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Factory size={20} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>
            رصيد الشرشور المنتج: <strong>{sectorData?.crushers?.sharshoorToday || (isSectorA ? '510' : '372')} طن</strong>
          </div>
        </div>

        {/* Card 3: Sector Fuel Dispensed */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '1.35rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b' }}>ديزل منصرف لآليات القطاع</span>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', marginTop: '0.3rem' }}>
                {sectorData?.fuel?.dispensedToday ? sectorData.fuel.dispensedToday.toLocaleString() : (isSectorA ? '1,850' : '2,100')} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 700 }}>لتر</span>
              </div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fdf2f8', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Fuel size={20} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>
            رصيد خزان القطاع الميداني: <strong>{sectorData?.fuel?.balanceLiters ? sectorData.fuel.balanceLiters.toLocaleString() : '26,000'} لتر</strong>
          </div>
        </div>

        {/* Card 4: Sector Equipment Fleet */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '1.35rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b' }}>آليات ومعدات القطاع</span>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', marginTop: '0.3rem' }}>
                {sectorData?.equipment?.active || '10'} <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 700 }}>عاملة</span>
              </div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={20} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>
            الإجمالي: {sectorData?.equipment?.total || '12'} آلية ({sectorData?.equipment?.stopped || '2'} متوقفة للصيانة)
          </div>
        </div>

      </div>

      {/* ================= 3. Road Paving Layers Progress (Sector Specific) ================= */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1.75rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={20} color="#2563eb" />
              <span>معدلات إنجاز طبقات الرصف الأربعة - {sectorName}</span>
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              تتبع المسافة المنجزة بالمتر الطولي لكل طبقة على طول مسار القطاع المعتمد ({totalLengthKm} كم)
            </p>
          </div>
          <span style={{ fontSize: '0.76rem', fontWeight: 800, background: '#f8fafc', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#475569' }}>
            الطول الإجمالي للقطاع: {totalLengthKm} كم
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {(sectorData?.layers || [
            { name: 'طبقة إعادة التدوير (FDR)', meters: isSectorA ? 112243 : 107960, percentage: 97.3, color: '#2563eb' },
            { name: 'طبقة الأساس الحبيبي (الشرشور)', meters: isSectorA ? 109373 : 106110, percentage: 94.8, color: '#16a34a' },
            { name: 'رش طبقة التشريب (MCO)', meters: isSectorA ? 109373 : 104930, percentage: 94.8, color: '#ea580c' },
            { name: 'طبقة الاسفلت المحسن', meters: isSectorA ? 107363 : 102560, percentage: 93.1, color: '#7c3aed' }
          ]).map((layer, idx) => (
            <div key={idx} style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.15rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1e293b' }}>{layer.name}</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 900, color: layer.color }}>{layer.percentage}%</span>
              </div>

              {/* Progress Track */}
              <div style={{ width: '100%', height: '9px', background: '#e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, layer.percentage)}%`,
                  height: '100%',
                  background: layer.color,
                  borderRadius: '8px',
                  transition: 'width 0.6s ease'
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#64748b' }}>
                <span>المنجز: <strong>{layer.meters.toLocaleString()}</strong> م.ط</span>
                <span>المتبقي: <strong>{Math.max(0, (isSectorA ? 115363 : 110920) - layer.meters).toLocaleString()}</strong> م.ط</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= 4. Report Upload Form & Direct Routing to Sector Manager ================= */}
      <div id="upload-section" style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <UploadCloud size={22} color={isSectorA ? '#2563eb' : '#ea580c'} />
              <span>رفع التقرير الميداني اليومي وتحويله إلى مدير القطاعات</span>
            </h3>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.84rem', color: '#64748b' }}>
              قم بإدخال بيانات اليومية الميدانية للقطاع وارفق صورة الوثيقة؛ سيتم توجيه التقرير مباشرة إلى مدير القطاعات للاعتماد الرسمي
            </p>
          </div>
          
          <div style={{
            background: isSectorA ? '#eff6ff' : '#fff7ed',
            color: isSectorA ? '#1d4ed8' : '#c2410c',
            border: isSectorA ? '1px solid #bfdbfe' : '1px solid #fed7aa',
            padding: '0.4rem 0.95rem',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 800
          }}>
            المرسل الميداني: {currentUser?.name || `مشرف ${sectorName}`}
          </div>
        </div>

        <form onSubmit={handleSubmitReport}>
          {/* Row 1: Date & Report Type & Locked Sector */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem' }}>
                تاريخ التقرير اليومي *
              </label>
              <input
                type="date"
                required
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem' }}>
                نوع التقرير الميداني *
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
              >
                <option value="تقرير يومي شامل">تقرير يومي شامل لكافة الأعمال</option>
                <option value="تقرير تقدم أعمال الرصف">تقرير تقدم أعمال الرصف والطبقات</option>
                <option value="تقرير تشغيل وإنتاج الكسارة">تقرير تشغيل وإنتاج الكسارة والشرشور</option>
                <option value="تقرير تزويد واستهلاك الوقود">تقرير تزويد واستهلاك الديزل</option>
                <option value="تقرير حركة وتشغيل المعدات">تقرير تشغيل وصيانة أسطول المعدات</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem' }}>
                القطاع الميداني التابع له
              </label>
              <input
                type="text"
                disabled
                value={`${sectorName} (مقفل آلياً لحسابك المعتمد)`}
                style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#f8fafc', color: '#1e293b', fontWeight: 800, cursor: 'not-allowed', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Row 2: Quantities (Production, Fuel, Meters) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem' }}>
                إنتاج الكسارة اليوم (طن)
              </label>
              <input
                type="number"
                placeholder="مثال: 850"
                value={productionAmount}
                onChange={(e) => setProductionAmount(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem' }}>
                الوقود المنصرف بالقطاع (لتر)
              </label>
              <input
                type="number"
                placeholder="مثال: 1850"
                value={fuelAmount}
                onChange={(e) => setFuelAmount(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem' }}>
                أعمال الرصف المنجزة اليوم (م.ط)
              </label>
              <input
                type="number"
                placeholder="مثال: 650"
                value={todayMeters}
                onChange={(e) => setTodayMeters(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Row 3: Attachment (Photo or Document) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem' }}>
              صورة أو وثيقة التقرير الميداني (اختياري)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,.pdf,.xlsx,.xls"
              style={{ display: 'none' }}
            />
            {attachedFile ? (
              <div style={{
                border: '2px dashed #10b981',
                borderRadius: '10px',
                padding: '0.85rem 1.25rem',
                background: '#f0fdf4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FileText size={22} color="#16a34a" />
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#166534' }}>{fileName || 'تم إرفاق الوثيقة'}</span>
                    <div style={{ fontSize: '0.74rem', color: '#15803d' }}>جاهز للإرسال والتحويل مع التقرير</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setAttachedFile(null); setFileName(''); }}
                  style={{ background: '#fee2e2', border: 'none', color: '#dc2626', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                >
                  إلغاء الملف
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '10px',
                  padding: '1.35rem',
                  textAlign: 'center',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Camera size={26} style={{ margin: '0 auto 0.4rem auto', color: '#94a3b8' }} />
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#475569' }}>
                  انقر هنا لاختيار صورة من الميدان أو ملف التقرير الورقي
                </div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                  يدعم صور الكاميرا (JPG, PNG) وملفات PDF و Excel
                </div>
              </div>
            )}
          </div>

          {/* Row 4: Notes */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem' }}>
              ملاحظات وبيان الأعمال الميدانية
            </label>
            <textarea
              rows={3}
              placeholder="اكتب أية تفاصيل تخص وردية اليوم، الآليات العاملة، أو أي معوقات ميدانية..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
            />
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lock size={14} />
              <span>سيتم إرسال التقرير بحالة <strong>قيد المراجعة</strong> وتوجيهه لحساب مدير القطاعات مباشرة.</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                background: isSectorA ? '#2563eb' : '#ea580c',
                color: '#fff',
                border: 'none',
                padding: '0.85rem 2rem',
                borderRadius: '10px',
                fontSize: '0.96rem',
                fontWeight: 900,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: isSectorA ? '0 4px 14px rgba(37, 99, 235, 0.4)' : '0 4px 14px rgba(234, 88, 12, 0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              <Send size={18} />
              <span>{isSubmitting ? 'جاري التحويل...' : 'إرسال وتحويل التقرير إلى مدير القطاعات 📤'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ================= 5. Submitted Reports Table & Approval Tracker ================= */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1.75rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
              سجل تقارير {sectorName} وحالة الاعتماد لدى مدير القطاعات
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              متابعة فورية للتقارير التي قمت برفعها وتأكيد اعتمادها رسمياً من مدير القطاعات
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Filter Buttons */}
            <button
              onClick={() => setReportFilter('all')}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                border: reportFilter === 'all' ? '2px solid #0f172a' : '1px solid #cbd5e1',
                background: reportFilter === 'all' ? '#0f172a' : '#fff',
                color: reportFilter === 'all' ? '#fff' : '#475569'
              }}
            >
              الكل ({reports.length})
            </button>

            <button
              onClick={() => setReportFilter('pending_review')}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                border: reportFilter === 'pending_review' ? '2px solid #d97706' : '1px solid #fde68a',
                background: reportFilter === 'pending_review' ? '#d97706' : '#fffdf5',
                color: reportFilter === 'pending_review' ? '#fff' : '#b45309'
              }}
            >
              قيد المراجعة ({pendingCount})
            </button>

            <button
              onClick={() => setReportFilter('approved')}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                border: reportFilter === 'approved' ? '2px solid #16a34a' : '1px solid #bbf7d0',
                background: reportFilter === 'approved' ? '#16a34a' : '#f0fdf4',
                color: reportFilter === 'approved' ? '#fff' : '#166534'
              }}
            >
              معتمد رسمياً ({approvedCount})
            </button>

            {rejectedCount > 0 && (
              <button
                onClick={() => setReportFilter('rejected')}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: reportFilter === 'rejected' ? '2px solid #dc2626' : '1px solid #fecaca',
                  background: reportFilter === 'rejected' ? '#dc2626' : '#fef2f2',
                  color: reportFilter === 'rejected' ? '#fff' : '#b91c1c'
                }}
              >
                مطلوب تعديل ({rejectedCount})
              </button>
            )}

            <button
              onClick={fetchSectorReports}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#334155',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={13} />
              <span>تحديث</span>
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          {isLoadingReports ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>جاري تحميل التقارير...</div>
          ) : filteredReports.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              <FileText size={38} style={{ margin: '0 auto 0.5rem auto', opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: '0.9rem' }}>لا توجد تقارير مطابقة في هذا السجل.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>رقم التقرير</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>التاريخ</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>بيان ونوع التقرير</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>إنتاج الكسارة</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>الوثيقة المرفقة</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>حالة الاعتماد لدى مدير القطاعات</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((r) => {
                  const isPending = r.status === 'pending_review';
                  const isApproved = r.status === 'approved';
                  const isRejected = r.status === 'rejected';

                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', background: isPending ? '#fffdf7' : isRejected ? '#fef2f2' : '#ffffff' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, background: '#f1f5f9', padding: '0.2rem 0.55rem', borderRadius: '4px' }}>
                          {r.reportNumber || `#REP-${r.id}`}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#475569' }}>
                        {r.date ? new Date(r.date).toLocaleDateString('ar-LY') : ''}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                        {r.materialName || r.reportType}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#2563eb' }}>
                          {r.productionAmount ? `${r.productionAmount.toLocaleString()} طن` : '-'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {r.imageUrl ? (
                          <button
                            type="button"
                            onClick={() => setSelectedImage(r.imageUrl)}
                            style={{
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              border: '1px solid #bfdbfe',
                              padding: '0.25rem 0.6rem',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              cursor: 'pointer'
                            }}
                          >
                            عرض الوثيقة
                          </button>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>بدون مرفق</span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.3rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.76rem',
                          fontWeight: 800,
                          background: isPending ? '#fef3c7' : isApproved ? '#dcfce7' : '#fee2e2',
                          color: isPending ? '#92400e' : isApproved ? '#166534' : '#991b1b',
                          border: isPending ? '1px solid #fde68a' : isApproved ? '1px solid #bbf7d0' : '1px solid #fecaca'
                        }}>
                          {isPending ? <Clock size={13} /> : isApproved ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                          <span>
                            {isPending ? 'قيد مراجعة واعتماد مدير القطاعات ⏳' : isApproved ? `معتمد رسمياً (${r.approvedBy || 'مدير القطاعات'}) ✅` : 'مطلوب تعديل ومراجعة ✏️'}
                          </span>
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedReportForPrint(r)}
                            title="طباعة التقرير الرسمي (Print / PDF)"
                            style={{
                              background: '#2563eb',
                              color: '#ffffff',
                              border: 'none',
                              padding: '0.35rem 0.75rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
                            }}
                          >
                            <Printer size={13} />
                            <span>طباعة</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setViewModalReport(r)}
                            style={{
                              background: '#f8fafc',
                              color: '#334155',
                              border: '1px solid #cbd5e1',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.76rem',
                              fontWeight: 700
                            }}
                          >
                            <Eye size={13} />
                            <span>تفاصيل</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ================= Details Modal ================= */}
      {viewModalReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.65)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '560px', padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                  تفاصيل التقرير الميداني ({viewModalReport.reportNumber || `#REP-${viewModalReport.id}`})
                </h3>
                <span style={{ fontSize: '0.76rem', color: '#64748b' }}>المرسل: {viewModalReport.uploadedBy || `مشرف ${sectorName}`}</span>
              </div>
              <button onClick={() => setViewModalReport(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.86rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>تاريخ التقرير:</span>
                <span style={{ fontWeight: 800 }}>{new Date(viewModalReport.date).toLocaleDateString('ar-LY')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>نوع وبيان التقرير:</span>
                <span style={{ fontWeight: 800 }}>{viewModalReport.materialName || viewModalReport.reportType}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>إنتاج الكسارة:</span>
                <span style={{ fontWeight: 800, color: '#2563eb' }}>{viewModalReport.productionAmount || 0} طن</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>حالة الاعتماد لدى مدير القطاعات:</span>
                <span style={{
                  fontWeight: 900,
                  color: viewModalReport.status === 'approved' ? '#16a34a' : viewModalReport.status === 'rejected' ? '#dc2626' : '#d97706'
                }}>
                  {viewModalReport.status === 'approved' ? 'معتمد رسمياً ✅' : viewModalReport.status === 'rejected' ? 'مطلوب تعديل ✏️' : 'قيد مراجعة واعتماد مدير القطاعات ⏳'}
                </span>
              </div>

              {viewModalReport.approvedBy && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>المعتمد بواسطة:</span>
                  <span style={{ fontWeight: 800, color: '#16a34a' }}>{viewModalReport.approvedBy}</span>
                </div>
              )}

              {viewModalReport.reviewNotes && (
                <div style={{ padding: '0.75rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                  <div style={{ fontWeight: 800, color: '#991b1b', marginBottom: '0.25rem' }}>ملاحظات مدير القطاعات (طلب التعديل):</div>
                  <div style={{ color: '#b91c1c' }}>{viewModalReport.reviewNotes}</div>
                </div>
              )}

              {viewModalReport.notes && (
                <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>البيان والملاحظات الميدانية:</div>
                  <div style={{ color: '#334155' }}>{viewModalReport.notes}</div>
                </div>
              )}

              {viewModalReport.imageUrl && (
                <div style={{ marginTop: '0.5rem' }}>
                  <button
                    onClick={() => setSelectedImage(viewModalReport.imageUrl)}
                    style={{
                      width: '100%',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      padding: '0.6rem',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    معاينة الوثيقة المرفقة 🖼️
                  </button>
                </div>
              )}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => {
                  const rep = viewModalReport;
                  setViewModalReport(null);
                  setSelectedReportForPrint(rep);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '0.6rem 1.4rem',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  cursor: 'pointer'
                }}
              >
                <Printer size={16} />
                <span>طباعة هذا التقرير رسمياً (Print / PDF)</span>
              </button>

              <button
                onClick={() => setViewModalReport(null)}
                style={{ background: '#f1f5f9', border: 'none', padding: '0.6rem 1.4rem', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', color: '#475569' }}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= Image Preview Lightbox ================= */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.85)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <img src={selectedImage} alt="وثيقة ميدانية" style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '10px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }} />
        </div>
      )}

      {/* ================= Official Print Modal ================= */}
      {selectedReportForPrint && (
        <OfficialPrintModal
          report={selectedReportForPrint}
          onClose={() => setSelectedReportForPrint(null)}
        />
      )}

      {/* ================= Create Report Modal ================= */}
      {isCreateModalOpen && (
        <CreateReportModal
          isOpen={isCreateModalOpen}
          currentUser={currentUser}
          onClose={() => setIsCreateModalOpen(false)}
          onReportCreated={() => {
            fetchSectorReports();
            fetchSectorSummary();
          }}
          onPrintReport={(newRep) => {
            setSelectedReportForPrint(newRep);
          }}
        />
      )}

    </div>
  );
};

export default SectorDashboardView;
