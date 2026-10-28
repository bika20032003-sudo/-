import React, { useState, useEffect } from 'react';
import { Fuel, UploadCloud, Factory, Truck, CheckCircle2, X, FileText, Calendar, Layers, ChevronLeft, ShieldAlert, Milestone, BarChart3, Printer, ExternalLink } from 'lucide-react';
import { fastFetch } from '../utils/apiCache.js';
import { OfficialPrintModal } from '../components/OfficialPrintModal';

export const DashboardView = ({ onNavigateTab }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [activeChartTab, setActiveChartTab] = useState('progress');
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedReportForPrint, setSelectedReportForPrint] = useState(null);
    // Live Metrics State
    const [metrics, setMetrics] = useState({
        totalProduction: 0,
        totalFuel: 0,
        totalSolar: 0,
        totalFuelReceived: 0,
        totalFuelRemaining: 0,
        totalSharshoor: 0,
        totalEquipment: 0,
        activeEquipment: 0,
        stoppedEquipment: 0,
        operatingHours: 0,
        sectorAFuel: 0,
        sectorBFuel: 0,
        sectorAProd: 0,
        sectorBProd: 0,
        recentReports: [],
        recentAlerts: [],
        urgentIssues: [],
        tomorrowPlan: null,
        // Road Project Progress Metrics (360 KM Project)
        roadProgress: {
            totalRoadLengthKm: 360.00,
            overallPercentage: 65.9,
            sectorAPercentage: 100.0,
            sectorBPercentage: 8.4,
            totalTodayMeters: 3820,
            totalExecutedKm: 237.39,
            remainingKm: 122.61,
            layers: [
                { name: 'إعادة التدوير (FDR)', meters: 242323, percentage: 67.3, color: '#2563eb', sectorA: 100.0, sectorB: 12.1 },
                { name: 'الأساس الحبيبي (الشرشور)', meters: 236493, percentage: 65.7, color: '#16a34a', sectorA: 100.0, sectorB: 7.8 },
                { name: 'رش التشريب (MCO)', meters: 236493, percentage: 65.7, color: '#ea580c', sectorA: 100.0, sectorB: 7.8 },
                { name: 'الاسفلت المحسن', meters: 234243, percentage: 65.1, color: '#7c3aed', sectorA: 100.0, sectorB: 6.1 }
            ]
        },
        // Weekly Trend Data for Charting (Starts at 0 until reports are logged)
        weeklyTrends: [
            { day: 'السبت', production: 0, fuel: 0, sharshoor: 0, meters: 0 },
            { day: 'الأحد', production: 0, fuel: 0, sharshoor: 0, meters: 0 },
            { day: 'الإثنين', production: 0, fuel: 0, sharshoor: 0, meters: 0 },
            { day: 'الثلاثاء', production: 0, fuel: 0, sharshoor: 0, meters: 0 },
            { day: 'الأربعاء', production: 0, fuel: 0, sharshoor: 0, meters: 0 },
            { day: 'الخميس', production: 0, fuel: 0, sharshoor: 0, meters: 0 },
            { day: 'اليوم', production: 0, fuel: 0, sharshoor: 0, meters: 0 }
        ]
    });
    const fetchDashboardData = async () => {
        try {
            const summaryRes = await fastFetch('/api/dashboard/summary');
            if (summaryRes && summaryRes.success) {
                const roadRes = summaryRes.roadProgress;
                const fdrP = roadRes?.kpis?.fdr?.percentage !== undefined ? parseFloat(roadRes.kpis.fdr.percentage) : 67.3;
                const asphP = roadRes?.kpis?.asphalt?.percentage !== undefined ? parseFloat(roadRes.kpis.asphalt.percentage) : 65.1;
                const aggP = roadRes?.kpis?.aggregateBase?.percentage !== undefined ? parseFloat(roadRes.kpis.aggregateBase.percentage) : 65.7;
                const mcoP = roadRes?.kpis?.mco?.percentage !== undefined ? parseFloat(roadRes.kpis.mco.percentage) : 65.7;
                
                const overallVal = roadRes?.overallPercentage !== undefined ? parseFloat(roadRes.overallPercentage) : parseFloat(((fdrP + asphP + aggP + mcoP) / 4).toFixed(1));
                const secAVal = roadRes?.sectorAPercentage !== undefined ? parseFloat(roadRes.sectorAPercentage) : 100.0;
                const secBVal = roadRes?.sectorBPercentage !== undefined ? parseFloat(roadRes.sectorBPercentage) : 8.4;
                const execKm = roadRes?.totalExecutedKm !== undefined ? parseFloat(roadRes.totalExecutedKm) : 237.39;
                const remKm = roadRes?.remainingKm !== undefined ? parseFloat(roadRes.remainingKm) : 122.61;
                const todayM = roadRes?.kpis?.totalTodayMeters !== undefined ? parseFloat(roadRes.kpis.totalTodayMeters) : 3820;

                let reportsList = summaryRes.recentReports || [];
                if (typeof window !== 'undefined' && window.localStorage) {
                    try {
                        const local = JSON.parse(localStorage.getItem('local_reports') || '[]');
                        const deletedSet = new Set(JSON.parse(localStorage.getItem('deleted_report_ids') || '[]'));
                        const existingIds = new Set(reportsList.map(r => String(r.id || r.reportNumber)));
                        const validLocal = local.filter(r => !deletedSet.has(String(r.id)) && !deletedSet.has(String(r.reportNumber)) && !existingIds.has(String(r.id || r.reportNumber)));
                        reportsList = [...validLocal, ...reportsList];
                        reportsList = reportsList.filter(r => !deletedSet.has(String(r.id)) && !deletedSet.has(String(r.reportNumber)));
                        reportsList.sort((a, b) => {
                            const dateA = a.date ? new Date(a.date).getTime() : (Number(a.id) || 0);
                            const dateB = b.date ? new Date(b.date).getTime() : (Number(b.id) || 0);
                            return dateB - dateA;
                        });
                    } catch (storageErr) {}
                }

                setMetrics(prev => ({
                    ...prev,
                    totalProduction: summaryRes.totalProduction || 0,
                    totalFuel: summaryRes.totalFuel || 0,
                    totalSolar: summaryRes.totalSolar ?? summaryRes.totalFuel ?? 0,
                    totalFuelReceived: summaryRes.totalFuelReceived || 0,
                    totalFuelRemaining: summaryRes.totalFuelRemaining || 0,
                    totalSharshoor: summaryRes.totalSharshoor || 0,
                    totalEquipment: summaryRes.totalEquipment || 0,
                    activeEquipment: summaryRes.activeEquipment || 0,
                    stoppedEquipment: summaryRes.stoppedEquipment || 0,
                    operatingHours: summaryRes.operatingHours || 0,
                    sectorAFuel: summaryRes.sectorAFuel || 0,
                    sectorBFuel: summaryRes.sectorBFuel || 0,
                    sectorAProd: summaryRes.sectorAProd || 0,
                    sectorBProd: summaryRes.sectorBProd || 0,
                    recentReports: reportsList,
                    recentAlerts: summaryRes.recentAlerts || [],
                    urgentIssues: summaryRes.urgentIssues || [],
                    tomorrowPlan: summaryRes.tomorrowPlan || null,
                    roadProgress: {
                        totalRoadLengthKm: 360.00,
                        overallPercentage: overallVal || 65.9,
                        sectorAPercentage: secAVal || 100.0,
                        sectorBPercentage: secBVal || 8.4,
                        totalExecutedKm: execKm,
                        remainingKm: remKm,
                        totalTodayMeters: todayM,
                        latestTwoPhaseReport: roadRes?.latestTwoPhaseReport || null,
                        layers: [
                            { name: 'إعادة التدوير (FDR)', meters: roadRes?.kpis?.fdr?.meters || 242323, percentage: fdrP, color: '#2563eb', sectorA: 100.0, sectorB: 12.1 },
                            { name: 'الأساس الحبيبي (الشرشور)', meters: roadRes?.kpis?.aggregateBase?.meters || 236493, percentage: aggP, color: '#16a34a', sectorA: 100.0, sectorB: 7.8 },
                            { name: 'رش التشريب (MCO)', meters: roadRes?.kpis?.mco?.meters || 236493, percentage: mcoP, color: '#ea580c', sectorA: 100.0, sectorB: 7.8 },
                            { name: 'الاسفلت المحسن', meters: roadRes?.kpis?.asphalt?.meters || 234243, percentage: asphP, color: '#7c3aed', sectorA: 100.0, sectorB: 6.1 }
                        ]
                    },
                    weeklyTrends: [
                        { day: 'السبت', production: 0, fuel: 0, sharshoor: 0, meters: 0 },
                        { day: 'الأحد', production: 0, fuel: 0, sharshoor: 0, meters: 0 },
                        { day: 'الإثنين', production: 0, fuel: 0, sharshoor: 0, meters: 0 },
                        { day: 'الثلاثاء', production: 0, fuel: 0, sharshoor: 0, meters: 0 },
                        { day: 'الأربعاء', production: 0, fuel: 0, sharshoor: 0, meters: 0 },
                        { day: 'الخميس', production: 0, fuel: 0, sharshoor: 0, meters: 0 },
                        { day: 'اليوم', production: summaryRes.totalProduction || 0, fuel: summaryRes.totalFuel || 0, sharshoor: summaryRes.totalSharshoor || 0, meters: todayM }
                    ]
                }));
            }
        }
        catch (e) {
            console.error('Error fetching dashboard data', e);
        }
        finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();

        // Reactive updates whenever a report is saved or uploaded
        const handleSync = () => fetchDashboardData();
        window.addEventListener('report-saved', handleSync);
        window.addEventListener('road-progress-updated', handleSync);
        window.addEventListener('fuel-updated', handleSync);
        window.addEventListener('report-deleted', handleSync);

        return () => {
            window.removeEventListener('report-saved', handleSync);
            window.removeEventListener('road-progress-updated', handleSync);
            window.removeEventListener('fuel-updated', handleSync);
            window.removeEventListener('report-deleted', handleSync);
        };
    }, []);
    return (<div className="view-content" style={{ maxWidth: '1400px', margin: '0 auto' }}>

      {/* ================= HERO CARD: OVERALL ROAD PROJECT PROGRESS ================= */}
      <div className="dashboard-white-card" style={{
            padding: '1.5rem 1.75rem',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #cbd5e1',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
        }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Milestone size={22}/>
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                مشروع صيانة طريق أوباري - غات (نسبة الإنجاز التنفيذي العام)
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.2rem 0 0' }}>
                المشروع العام للمرحلتين بطول إجمالي: <strong>360.00 كم</strong> (المرحلة الأولى: 226.08 كم • المرحلة الثانية: 133.92 كم) • معدل الإنجاز اليومي: <strong>+{metrics.roadProgress.totalTodayMeters.toLocaleString()} م.ط</strong>
              </p>
            </div>
          </div>

          <button onClick={() => onNavigateTab('road-progress')} className="secondary-action-btn" style={{ background: '#fff', fontSize: '0.82rem', fontWeight: 800, color: '#2563eb', borderColor: '#bfdbfe' }}>
            <span>عرض تفاصيل مسار الطريق</span>
            <ChevronLeft size={16}/>
          </button>
        </div>

        {/* 3 Main Radial / Progress Indicators */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
          {/* Main Total Project Percentage */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
            borderRadius: '14px',
            padding: '1.25rem 1.5rem',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 20px rgba(30, 58, 138, 0.2)'
        }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: '#93c5fd', fontWeight: 700 }}>نسبة الإنجاز الإجمالي للمشروع</span>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.1, margin: '0.35rem 0' }}>
                {metrics.roadProgress.overallPercentage}%
              </div>
              <span style={{ fontSize: '0.78rem', color: '#bfdbfe' }}>مكتمل من إجمالي 360.00 كم</span>
            </div>

            {/* Circular Visual Gauge */}
            <div style={{ position: 'relative', width: '74px', height: '74px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="74" height="74" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3.5"/>
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#38bdf8" strokeWidth="3.5" strokeDasharray={`${metrics.roadProgress.overallPercentage}, 100`} strokeLinecap="round"/>
              </svg>
              <span style={{ position: 'absolute', fontSize: '0.85rem', fontWeight: 900, color: '#fff' }}>
                {Math.round(metrics.roadProgress.overallPercentage)}%
              </span>
            </div>
          </div>

          {/* Road Length Progress Card */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.2rem 1.35rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>🛣️ المسافة المنفذة والمتبقية</span>
              <strong style={{ fontSize: '1.15rem', color: '#2563eb' }}>{(metrics.roadProgress.totalExecutedKm || 237.39).toFixed(2)} كم</strong>
            </div>
            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', margin: '0.5rem 0' }}>
              <div style={{ width: `${Math.min(100, ((metrics.roadProgress.totalExecutedKm || 237.39) / 360.00) * 100)}%`, height: '100%', background: '#2563eb', borderRadius: '4px' }}/>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
              <span>المنجز: {(metrics.roadProgress.totalExecutedKm || 237.39).toFixed(2)} كم</span>
              <span style={{ color: '#dc2626', fontWeight: 700 }}>المتبقي: {(metrics.roadProgress.remainingKm || 122.61).toFixed(2)} كم</span>
            </div>
          </div>

          {/* Daily Productivity & Readiness Card */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.2rem 1.35rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>⚡ معدل الإنتاج والجاهزية</span>
              <strong style={{ fontSize: '1.15rem', color: '#16a34a' }}>+{metrics.roadProgress.totalTodayMeters} م.ط</strong>
            </div>
            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', margin: '0.5rem 0' }}>
              <div style={{ width: '88%', height: '100%', background: '#16a34a', borderRadius: '4px' }}/>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
              <span>{metrics.operatingHours} ساعة تشغيل اليوم</span>
              <span style={{ color: '#16a34a', fontWeight: 700 }}>{metrics.activeEquipment} معدة ميدانية جاهزة</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= DEDICATED VISUAL CHARTS HUB (الرسوم البيانية التفاعلية) ================= */}
      <div className="dashboard-white-card" style={{ padding: '1.5rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={20}/>
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                لوحة الرسوم والمخططات البيانية التفاعلية
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.15rem 0 0' }}>
                تحليل مرئي فوري لمعدلات الإنجاز التراكمي لطبقات المسار ومنحنيات الإنتاج الأسبوعية
              </p>
            </div>
          </div>

          {/* Chart Switcher Buttons */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.2rem', borderRadius: '8px', gap: '0.2rem' }}>
            <button onClick={() => setActiveChartTab('progress')} style={{
            background: activeChartTab === 'progress' ? '#ffffff' : 'transparent',
            color: activeChartTab === 'progress' ? '#2563eb' : '#64748b',
            fontWeight: 800,
            fontSize: '0.8rem',
            border: 'none',
            borderRadius: '6px',
            padding: '0.35rem 0.85rem',
            cursor: 'pointer',
            boxShadow: activeChartTab === 'progress' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none'
        }}>
              نسب إنجاز طبقات الطريق
            </button>

            <button onClick={() => setActiveChartTab('trends')} style={{
            background: activeChartTab === 'trends' ? '#ffffff' : 'transparent',
            color: activeChartTab === 'trends' ? '#2563eb' : '#64748b',
            fontWeight: 800,
            fontSize: '0.8rem',
            border: 'none',
            borderRadius: '6px',
            padding: '0.35rem 0.85rem',
            cursor: 'pointer',
            boxShadow: activeChartTab === 'trends' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none'
        }}>
              منحنى الرصف والوقود
            </button>

            <button onClick={() => setActiveChartTab('fleet')} style={{
            background: activeChartTab === 'fleet' ? '#ffffff' : 'transparent',
            color: activeChartTab === 'fleet' ? '#2563eb' : '#64748b',
            fontWeight: 800,
            fontSize: '0.8rem',
            border: 'none',
            borderRadius: '6px',
            padding: '0.35rem 0.85rem',
            cursor: 'pointer',
            boxShadow: activeChartTab === 'fleet' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none'
        }}>
              جاهزية أسطول المعدات
            </button>
          </div>
        </div>

        {/* ================= CHART 1: 4-LAYER ROAD PROGRESS & COMPARATIVE BARS ================= */}
        {activeChartTab === 'progress' && (<div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
              {/* Left Side: Layer Completion Grouped Bars */}
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', marginBottom: '1rem', display: 'block' }}>
                  نسب الإنجاز التفصيلية لطبقات الطريق (المسافة الكلية 226.28 كم):
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  {metrics.roadProgress.layers.map((layer, idx) => (<div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: layer.color }}/>
                          <strong style={{ fontSize: '0.86rem', color: '#0f172a' }}>{layer.name}</strong>
                        </div>
                        <span style={{ fontSize: '0.88rem', fontWeight: 900, color: layer.color }}>{layer.percentage}%</span>
                      </div>

                      {/* Stacked / Grouped Visual Bars */}
                      <div style={{ height: '16px', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', display: 'flex', position: 'relative' }}>
                        <div style={{
                    width: `${layer.percentage}%`,
                    background: `linear-gradient(90deg, ${layer.color} 0%, ${layer.color}dd 100%)`,
                    borderRadius: '8px',
                    transition: 'width 0.8s ease'
                }}/>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#64748b', marginTop: '0.25rem' }}>
                        <span>المنجز: <strong>{layer.meters.toLocaleString()} م.ط</strong></span>
                        <span>المتبقي: <strong style={{ color: '#dc2626' }}>{Math.max(0, 226280 - layer.meters).toLocaleString()} م.ط</strong></span>
                        <span style={{ color: '#16a34a', fontWeight: 700 }}>الحالة: نشط ومستمر</span>
                      </div>
                    </div>))}
                </div>
              </div>

              {/* Right Side: 4 Layers Comparative Bar Chart (SVG) */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', display: 'block' }}>
                  المخطط المقارن للطبقات الأربع للمشروع:
                </span>

                <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', paddingTop: '1rem', borderBottom: '2px solid #cbd5e1' }}>
                  {metrics.roadProgress.layers.map((layer, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem', width: '22%' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 900, color: layer.color }}>{layer.percentage}%</span>
                      <div style={{
                        width: '100%',
                        height: `${layer.percentage * 1.3}px`,
                        background: `linear-gradient(180deg, ${layer.color} 0%, ${layer.color}cc 100%)`,
                        borderRadius: '6px 6px 0 0',
                        boxShadow: `0 4px 10px ${layer.color}33`
                      }}/>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1e293b', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                        {idx === 0 ? 'FDR' : idx === 1 ? 'الأساس' : idx === 2 ? 'MCO' : 'الاسفلت'}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginTop: '0.85rem', fontSize: '0.74rem', color: '#64748b' }}>
                  {metrics.roadProgress.layers.map((layer, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: layer.color }}/>
                      <span style={{ fontWeight: 600 }}>{layer.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>)}

        {/* ================= CHART 2: WEEKLY PRODUCTION & FUEL TRENDS ================= */}
        {activeChartTab === 'trends' && (<div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
              {/* Left Side: Road Paving Meters Chart Columns */}
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', marginBottom: '0.75rem', display: 'block' }}>
                  معدلات رصف الطريق اليومية (متر طولي / يوم):
                </span>

                <div style={{ height: '170px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '2px solid #e2e8f0', gap: '0.5rem' }}>
                  {metrics.weeklyTrends.map((trend, idx) => {
                const heightPercent = Math.min(100, ((trend.meters || 800) / 1200) * 100);
                return (<div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '0.35rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563eb' }}>{trend.meters || 0}</span>
                        <div style={{
                        width: '100%',
                        height: `${heightPercent * 1.3}px`,
                        background: idx === metrics.weeklyTrends.length - 1 ? 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)' : '#93c5fd',
                        borderRadius: '4px 4px 0 0'
                    }} title={`${trend.day}: ${trend.meters || 0} م.ط`}/>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{trend.day.split(' ')[0]}</span>
                      </div>);
            })}
                </div>
              </div>

              {/* Right Side: Fuel Consumption Chart Columns */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ea580c', marginBottom: '0.75rem', display: 'block' }}>
                  استهلاك الوقود الأسبوعي (لتر / يوم):
                </span>

                <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '2px solid #fed7aa', gap: '0.4rem' }}>
                  {metrics.weeklyTrends.map((trend, idx) => {
                const heightPercent = Math.min(100, (trend.fuel / 4500) * 100);
                return (<div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#ea580c' }}>{trend.fuel}</span>
                        <div style={{
                        width: '100%',
                        height: `${heightPercent * 1.1}px`,
                        background: idx === metrics.weeklyTrends.length - 1 ? 'linear-gradient(180deg, #f97316 0%, #ea580c 100%)' : '#fed7aa',
                        borderRadius: '4px 4px 0 0'
                    }}/>
                        <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{trend.day.slice(0, 3)}</span>
                      </div>);
            })}
                </div>
              </div>
            </div>
          </div>)}

        {/* ================= CHART 3: FLEET READINESS DONUT & RADIAL ================= */}
        {activeChartTab === 'fleet' && (<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#166534' }}>المعدات العاملة بالموقع</span>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#16a34a', margin: '0.4rem 0' }}>
                {metrics.activeEquipment}
              </div>
              <span style={{ fontSize: '0.78rem', color: '#15803d' }}>نسبة تشغيل 83.3% من الأسطول</span>
            </div>

            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#991b1b' }}>المعدات تحت الصيانة</span>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#dc2626', margin: '0.4rem 0' }}>
                {metrics.stoppedEquipment}
              </div>
              <span style={{ fontSize: '0.78rem', color: '#b91c1c' }}>جاري متابعة الإصلاح بالورشة</span>
            </div>

            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e3a8a' }}>إجمالي ساعات التشغيل اليوم</span>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#2563eb', margin: '0.4rem 0' }}>
                {metrics.operatingHours}
              </div>
              <span style={{ fontSize: '0.78rem', color: '#1d4ed8' }}>متوسط 8.2 ساعة / معدة</span>
            </div>
          </div>)}

        {/* ================= LIVE TWO-PHASE REPORT FEED CARD ================= */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1.25rem 1.5rem',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          border: '1px solid #cbd5e1',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#1e40af', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 900, color: '#0f172a' }}>
                    بيانات تقرير إنجاز المرحلتين اليومي المعتمد
                  </h4>
                  <span style={{ background: '#dbeafe', color: '#1e40af', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                    يغذي الداش بورد تلقائياً ⚡
                  </span>
                </div>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  {metrics.roadProgress.latestTwoPhaseReport 
                    ? `تاريخ آخر تقرير مرفوع: ${metrics.roadProgress.latestTwoPhaseReport.dayName || 'السبت'} ${metrics.roadProgress.latestTwoPhaseReport.dateFormatted || ''} • رقم: ${metrics.roadProgress.latestTwoPhaseReport.reportNumber}`
                    : 'بمجرد رفع تقرير إنجاز المرحلتين الميداني اليومي؛ ستنزل أرقامه وجداوله فوراً هنا'}
                </p>
              </div>
            </div>

            <button 
              onClick={() => onNavigateTab('upload-reports')} 
              className="primary-action-btn"
              style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', height: 'auto', background: 'linear-gradient(135deg, #1e40af, #2563eb)' }}
            >
              <UploadCloud size={15} />
              <span>رفع تقرير إنجاز المرحلتين 📤</span>
            </button>
          </div>

          {/* Quick Metrics of Phase 1 vs Phase 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '0.85rem' }}>
            <div style={{ background: '#fff', padding: '0.85rem 1.1rem', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: '0.76rem', color: '#1e40af', fontWeight: 800 }}>المرحلة الأولى (226.08 كم)</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#1d4ed8', marginTop: '0.2rem' }}>
                {metrics.roadProgress.sectorAPercentage}%
              </div>
              <span style={{ fontSize: '0.74rem', color: '#166534', fontWeight: 700 }}>مكتملة بالكامل (100%)</span>
            </div>

            <div style={{ background: '#fff', padding: '0.85rem 1.1rem', borderRadius: '10px', border: '1px solid #a5f3fc' }}>
              <div style={{ fontSize: '0.76rem', color: '#0891b2', fontWeight: 800 }}>المرحلة الثانية (133.92 كم)</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0284c7', marginTop: '0.2rem' }}>
                {metrics.roadProgress.sectorBPercentage}%
              </div>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>نسبة الإنجاز التراكمي للمرحلة</span>
            </div>

            <div style={{ background: '#fff', padding: '0.85rem 1.1rem', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '0.76rem', color: '#166534', fontWeight: 800 }}>إنجاز اليوم بالمرحلتين</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#16a34a', marginTop: '0.2rem' }}>
                +{metrics.roadProgress.totalTodayMeters.toLocaleString()} <span style={{ fontSize: '0.85rem' }}>م.ط</span>
              </div>
              <span style={{ fontSize: '0.74rem', color: '#15803d' }}>معدل تقدم الرصف اليومي</span>
            </div>
          </div>

          {/* Remaining Items Summary Table from the Two-Phase Report */}
          {metrics.roadProgress.latestTwoPhaseReport?.remainingItems && metrics.roadProgress.latestTwoPhaseReport.remainingItems.length > 0 && (
            <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '0.85rem 1rem', marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '0.5rem' }}>
                📋 جدول المتبقي من البنود (من واقع آخر تقرير مرفوع للمرحلتين):
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse', textAlign: 'center' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '0.4rem', textAlign: 'right' }}>البند</th>
                      <th style={{ padding: '0.4rem' }}>المرحلة الأولى</th>
                      <th style={{ padding: '0.4rem' }}>المرحلة الثانية</th>
                      <th style={{ padding: '0.4rem' }}>الإجمالي</th>
                      <th style={{ padding: '0.4rem' }}>ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.roadProgress.latestTwoPhaseReport.remainingItems.slice(0, 4).map((rem, rIdx) => (
                      <tr key={rIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.4rem', textAlign: 'right', fontWeight: 700, color: '#1e293b' }}>{rem.name}</td>
                        <td style={{ padding: '0.4rem', color: '#2563eb', fontWeight: 700 }}>{rem.phase1 ? Number(rem.phase1).toLocaleString() : '-'}</td>
                        <td style={{ padding: '0.4rem', color: '#0891b2', fontWeight: 700 }}>{rem.phase2 ? Number(rem.phase2).toLocaleString() : '-'}</td>
                        <td style={{ padding: '0.4rem', fontWeight: 800, color: '#dc2626' }}>{rem.total ? Number(rem.total).toLocaleString() : '-'}</td>
                        <td style={{ padding: '0.4rem', color: '#64748b' }}>{rem.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= TOP 4 KPI CARDS: ROAD, SOLAR, FUEL, FLEET ================= */}
      <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
            marginBottom: '1.5rem'
        }}>
        {/* Card 1: إنجاز رصف الطريق */}
        <div className="kpi-metric-card" onClick={() => onNavigateTab('road-progress')} style={{ padding: '1.25rem 1.5rem', cursor: 'pointer' }} title="فتح متابعة إنجاز الطريق">
          <div className="kpi-card-header">
            <span className="kpi-title" style={{ fontSize: '0.88rem' }}>إنجاز رصف الطريق اليوم</span>
            <div className="kpi-icon-circle green">
              <Milestone size={20} color="#16a34a"/>
            </div>
          </div>
          <div className="kpi-value-center" style={{ margin: '0.6rem 0' }}>
            <span className="kpi-big-num" style={{ fontSize: '2.1rem' }}>
              +{metrics.roadProgress.totalTodayMeters.toLocaleString()}
            </span>
            <span className="kpi-unit-label" style={{ fontSize: '0.9rem' }}>م.ط</span>
          </div>
          <div className="kpi-bottom-sub">
            <span className="kpi-green-text" style={{ fontSize: '0.78rem' }}>نسبة الإنجاز العام {metrics.roadProgress.overallPercentage}%</span>
          </div>
        </div>

        {/* Card 2: عداد الوقود وحده (المنصرف للآليات) */}
        <div className="kpi-metric-card" onClick={() => onNavigateTab('fuel')} style={{ padding: '1.25rem 1.5rem', cursor: 'pointer', borderTop: '3px solid #ea580c' }} title="فتح قسم إدارة الوقود">
          <div className="kpi-card-header">
            <span className="kpi-title" style={{ fontSize: '0.88rem', color: '#9a3412', fontWeight: 800 }}>عداد الوقود (المنصرف)</span>
            <div className="kpi-icon-circle orange" style={{ background: '#ffedd5', color: '#ea580c' }}>
              <Fuel size={20} color="#ea580c"/>
            </div>
          </div>
          <div className="kpi-value-center" style={{ margin: '0.6rem 0' }}>
            <span className="kpi-big-num" style={{ fontSize: '2.1rem', color: '#c2410c' }}>
              {(metrics.totalSolar || metrics.totalFuel).toLocaleString()}
            </span>
            <span className="kpi-unit-label" style={{ fontSize: '0.9rem', color: '#9a3412', fontWeight: 700 }}>لتر ديزل</span>
          </div>
          <div className="kpi-bottom-sub">
            <span className="kpi-green-text" style={{ fontSize: '0.78rem', color: '#ea580c' }}>منصرف تشغيل الآليات والمعدات الميدانية</span>
          </div>
        </div>

        {/* Card 3: عداد وارد الوقود والمخزون وحده */}
        <div className="kpi-metric-card" onClick={() => onNavigateTab('fuel')} style={{ padding: '1.25rem 1.5rem', cursor: 'pointer', borderTop: '3px solid #2563eb' }} title="فتح قسم إدارة الوقود">
          <div className="kpi-card-header">
            <span className="kpi-title" style={{ fontSize: '0.88rem', color: '#1e40af', fontWeight: 800 }}>عداد وارد الوقود والمخزون</span>
            <div className="kpi-icon-circle blue" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Fuel size={20} color="#2563eb"/>
            </div>
          </div>
          <div className="kpi-value-center" style={{ margin: '0.6rem 0' }}>
            <span className="kpi-big-num" style={{ fontSize: '2.1rem', color: '#1d4ed8' }}>
              {(metrics.totalFuelReceived || metrics.totalFuelRemaining || 0).toLocaleString()}
            </span>
            <span className="kpi-unit-label" style={{ fontSize: '0.9rem', color: '#1e40af', fontWeight: 700 }}>لتر بالخزانات</span>
          </div>
          <div className="kpi-bottom-sub">
            <span className="kpi-green-text" style={{ fontSize: '0.78rem', color: '#2563eb' }}>المخزون المتوفر بالصهاريج والخزانات</span>
          </div>
        </div>

        {/* Card 4: أسطول المعدات */}
        <div className="kpi-metric-card" onClick={() => onNavigateTab('equipment')} style={{ padding: '1.25rem 1.5rem', cursor: 'pointer', borderTop: '3px solid #7c3aed' }} title="فتح قسم المعدات">
          <div className="kpi-card-header">
            <span className="kpi-title" style={{ fontSize: '0.88rem' }}>أسطول المعدات والآليات</span>
            <div className="kpi-icon-circle purple" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
              <Truck size={20} color="#7c3aed"/>
            </div>
          </div>
          <div className="kpi-value-center" style={{ margin: '0.6rem 0' }}>
            <span className="kpi-big-num" style={{ fontSize: '2.1rem' }}>{metrics.totalEquipment}</span>
            <span className="kpi-unit-label" style={{ fontSize: '0.9rem' }}>معدة</span>
          </div>
          <div className="kpi-bottom-sub">
            <span className={metrics.stoppedEquipment > 0 ? 'kpi-danger-badge' : 'kpi-green-badge'} style={{ fontSize: '0.78rem' }}>
              {metrics.stoppedEquipment > 0 ? `${metrics.stoppedEquipment} معدات تحت الصيانة` : 'جاهزية الأسطول كاملة'}
            </span>
          </div>
        </div>
      </div>

      {/* ================= MIDDLE SECTION: RECENT REPORTS ================= */}
      <div style={{ marginBottom: '1.5rem' }}>
        {/* Latest Uploaded Reports */}
        <div className="dashboard-white-card" style={{ padding: '1.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={20}/>
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  أحدث التقارير والوثائق المرفوعة
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.15rem 0 0' }}>
                  سجل التقارير الميدانية والمستندات المعتمدة - انقر على أي تقرير للمعاينة والطباعة الفورية
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => onNavigateTab && onNavigateTab('create-report')} 
                style={{ 
                  background: '#2563eb', 
                  border: 'none', 
                  color: '#ffffff', 
                  padding: '0.5rem 0.95rem', 
                  borderRadius: '8px', 
                  fontSize: '0.82rem', 
                  fontWeight: 800, 
                  cursor: 'pointer',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
                }}
              >
                <span>+ إنشاء تقرير جديد</span>
              </button>
              <button 
                onClick={() => onNavigateTab && onNavigateTab('reports-archive')} 
                style={{ 
                  background: '#f8fafc', 
                  border: '1px solid #cbd5e1', 
                  color: '#334155', 
                  padding: '0.5rem 0.95rem', 
                  borderRadius: '8px', 
                  fontSize: '0.82rem', 
                  fontWeight: 800, 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.3rem' 
                }}
              >
                <span>كامل الأرشيف ({metrics.recentReports.length})</span>
                <ChevronLeft size={15}/>
              </button>
            </div>
          </div>

          {metrics.recentReports.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {metrics.recentReports.slice(0, 8).map((rep) => {
                const repTypeStr = String(rep.reportType || '');
                const repTitleStr = String(rep.title || '');
                const isRoad = rep.reportCategory === 'road' || repTypeStr.includes('طريق') || repTitleStr.includes('طريق') || (rep.roadMeters && !repTypeStr.includes('المرحلتين'));
                const isFuel = rep.reportCategory === 'fuel' || rep.isFuelReport || repTypeStr.includes('وقود') || repTitleStr.includes('وقود');
                const isTargeted = rep.reportCategory === 'targeted' || rep.isTargetedWorksReport || repTypeStr.includes('مستهدف');
                const isTwoPhase = rep.reportCategory === 'two_phase' || rep.isTwoPhaseProgressReport || repTypeStr.includes('المرحلتين');
                const isExecutive = rep.reportCategory === 'executive' || repTypeStr.includes('تنفيذي') || repTitleStr.includes('الموقف التنفيذي');

                let badgeColor = '#2563eb';
                let badgeBg = '#eff6ff';
                let typeLabel = rep.reportType || 'تقرير ميداني';
                if (isFuel) {
                  badgeColor = '#ea580c';
                  badgeBg = '#ffedd5';
                  typeLabel = '⛽ تقرير كميات الوقود';
                } else if (isTwoPhase) {
                  badgeColor = '#7c3aed';
                  badgeBg = '#f3e8ff';
                  typeLabel = '📊 إنجاز المرحلتين (360 كم)';
                } else if (isRoad) {
                  badgeColor = '#16a34a';
                  badgeBg = '#dcfce7';
                  typeLabel = '🛣️ أعمال الطريق اليومية';
                } else if (isExecutive) {
                  badgeColor = '#0f172a';
                  badgeBg = '#e2e8f0';
                  typeLabel = '📑 الموقف التنفيذي العام';
                } else if (isTargeted) {
                  badgeColor = '#0284c7';
                  badgeBg = '#e0f2fe';
                  typeLabel = '🎯 الأعمال المستهدفة';
                }

                const repTitle = rep.title || (isRoad ? 'تقرير أعمال الطريق اليومي' : (isFuel ? 'تقرير كميات الوقود اليومية' : (rep.materialName || 'تقرير ميداني معتمد')));
                const repDate = rep.dateFormatted || (rep.date ? new Date(rep.date).toLocaleDateString('ar-LY') : '2026-10-24');
                const repSector = rep.sector || rep.crusherName || 'مشروع صيانة طريق أوباري - غات';
                const repNumber = rep.reportNumber || (rep.id ? `REP-${rep.id}` : 'REP-001');

                return (
                  <div 
                    key={rep.id || rep.reportNumber} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1.15rem',
                      background: '#ffffff',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s ease',
                      flexWrap: 'wrap',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      {rep.imageUrl ? (
                        <img 
                          src={rep.imageUrl} 
                          alt="معاينة" 
                          onClick={() => setSelectedImage(rep.imageUrl)} 
                          style={{ width: '46px', height: '46px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '2px solid #2563eb' }} 
                          title="انقر لتكبير الوثيقة المرفوعة"
                        />
                      ) : (
                        <div style={{ width: '46px', height: '46px', borderRadius: '8px', background: badgeBg, color: badgeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FileText size={22}/>
                        </div>
                      )}

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <h4 
                            onClick={() => setSelectedReportForPrint(rep)}
                            style={{ fontSize: '0.94rem', fontWeight: 900, color: '#0f172a', margin: 0, cursor: 'pointer' }}
                            title="انقر لمعاينة التقرير وطباعته"
                          >
                            {repTitle}
                          </h4>
                          <span style={{ fontSize: '0.74rem', fontWeight: 800, padding: '0.15rem 0.55rem', borderRadius: '6px', background: badgeBg, color: badgeColor }}>
                            {typeLabel}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace', background: '#f8fafc', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                            {repNumber}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '0.3rem 0 0', display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                          <span>📍 {repSector}</span>
                          <span>📅 {repDate} {rep.dayName ? `(${rep.dayName})` : ''}</span>
                          {rep.uploadedBy && <span>👤 المشرف: {rep.uploadedBy}</span>}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      {/* Metric Value Pill */}
                      {rep.roadMeters ? (
                        <span style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', background: '#dcfce7', color: '#166534', fontSize: '0.82rem', fontWeight: 800 }}>
                          {Number(rep.roadMeters).toLocaleString()} م.ط
                        </span>
                      ) : rep.fuelAmount ? (
                        <span style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', background: '#ffedd5', color: '#9a3412', fontSize: '0.82rem', fontWeight: 800 }}>
                          {Number(rep.fuelAmount).toLocaleString()} لتر
                        </span>
                      ) : rep.productionAmount ? (
                        <span style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', background: '#eff6ff', color: '#1e40af', fontSize: '0.82rem', fontWeight: 800 }}>
                          {Number(rep.productionAmount).toLocaleString()} طن
                        </span>
                      ) : null}

                      {/* Official Print & Preview Button */}
                      <button
                        onClick={() => setSelectedReportForPrint(rep)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.48rem 0.95rem',
                          borderRadius: '8px',
                          background: '#ffffff',
                          border: '1.5px solid #2563eb',
                          color: '#2563eb',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 1px 3px rgba(37, 99, 235, 0.1)'
                        }}
                        title="معاينة وطباعة النموذج الرسمي المعتمد"
                      >
                        <Printer size={15} />
                        <span>معاينة / طباعة 🖨️</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
              <FileText size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.35 }}/>
              <p style={{ fontSize: '0.88rem', fontWeight: 700 }}>لا توجد تقارير مسجلة بعد.</p>
              <button 
                onClick={() => onNavigateTab && onNavigateTab('create-report')} 
                style={{ marginTop: '0.5rem', background: '#2563eb', border: 'none', color: '#fff', padding: '0.5rem 1.1rem', borderRadius: '6px', fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer' }}
              >
                + إنشاء أول تقرير ميداني الآن
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Official Print Modal */}
      {selectedReportForPrint && (
        <OfficialPrintModal
          isOpen={!!selectedReportForPrint}
          report={selectedReportForPrint}
          onClose={() => setSelectedReportForPrint(null)}
        />
      )}

      {/* Lightbox Modal for Photo Zoom */}
      {selectedImage && (<div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0, 0, 0, 0.85)',
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem'
            }} onClick={() => setSelectedImage(null)}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <button onClick={() => setSelectedImage(null)} style={{ position: 'absolute', top: '-40px', right: '0', background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
              <X size={32}/>
            </button>
            <img src={selectedImage} alt="صورة التقرير الميداني المكبرة" style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', objectFit: 'contain' }}/>
          </div>
        </div>)}
    </div>);
};
