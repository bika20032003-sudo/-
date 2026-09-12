import React, { useState, useEffect } from 'react';
import { Fuel, UploadCloud, Factory, Truck, Mountain, CheckCircle2, X, RefreshCw, FileText, Calendar, Layers, ChevronLeft, ShieldAlert, Milestone, BarChart3 } from 'lucide-react';
import { fastFetch } from '../utils/apiCache.js';
export const DashboardView = ({ onNavigateTab }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [activeChartTab, setActiveChartTab] = useState('progress');
    const [selectedImage, setSelectedImage] = useState(null);
    // Live Metrics State
    const [metrics, setMetrics] = useState({
        totalProduction: 0,
        totalFuel: 0,
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
        // Road Project Progress Metrics from Excel
        roadProgress: {
            totalRoadLengthKm: 226.28,
            overallPercentage: 95.0,
            sectorAPercentage: 96.2,
            sectorBPercentage: 93.8,
            totalTodayMeters: 1060,
            layers: [
                { name: 'إعادة التدوير (FDR)', meters: 220203, percentage: 97.3, color: '#2563eb', sectorA: 97.5, sectorB: 97.1 },
                { name: 'الأساس الحبيبي (الشرشور)', meters: 215483, percentage: 95.2, color: '#16a34a', sectorA: 95.8, sectorB: 94.6 },
                { name: 'رش التشريب (MCO)', meters: 214303, percentage: 94.7, color: '#ea580c', sectorA: 95.1, sectorB: 94.3 },
                { name: 'الاسفلت المحسن', meters: 209923, percentage: 92.8, color: '#7c3aed', sectorA: 93.5, sectorB: 92.1 }
            ]
        },
        // Weekly Trend Data for Charting
        weeklyTrends: [
            { day: 'السبت', production: 1150, fuel: 3400, sharshoor: 690, meters: 850 },
            { day: 'الأحد', production: 1280, fuel: 3750, sharshoor: 760, meters: 920 },
            { day: 'الإثنين', production: 1400, fuel: 4100, sharshoor: 840, meters: 1050 },
            { day: 'الثلاثاء', production: 1350, fuel: 3900, sharshoor: 810, meters: 980 },
            { day: 'الأربعاء', production: 1200, fuel: 3600, sharshoor: 720, meters: 890 },
            { day: 'الخميس', production: 1450, fuel: 4250, sharshoor: 870, meters: 1060 },
            { day: 'اليوم (الجمعة)', production: 1250, fuel: 3850, sharshoor: 750, meters: 1060 }
        ]
    });
    const fetchDashboardData = async () => {
        try {
            const summaryRes = await fastFetch('http://localhost:5000/api/dashboard/summary');
            if (summaryRes && summaryRes.success) {
                const roadRes = summaryRes.roadProgress;
                const fdrP = roadRes?.kpis?.fdr?.percentage ? parseFloat(roadRes.kpis.fdr.percentage) : 97.3;
                const asphP = roadRes?.kpis?.asphalt?.percentage ? parseFloat(roadRes.kpis.asphalt.percentage) : 92.8;
                const aggP = roadRes?.kpis?.aggregateBase?.percentage ? parseFloat(roadRes.kpis.aggregateBase.percentage) : 95.2;
                const mcoP = roadRes?.kpis?.mco?.percentage ? parseFloat(roadRes.kpis.mco.percentage) : 94.7;
                const overallAvg = parseFloat(((fdrP + asphP + aggP + mcoP) / 4).toFixed(1));

                setMetrics(prev => ({
                    ...prev,
                    totalProduction: summaryRes.totalProduction,
                    totalFuel: summaryRes.totalFuel,
                    totalSharshoor: summaryRes.totalSharshoor,
                    totalEquipment: summaryRes.totalEquipment,
                    activeEquipment: summaryRes.activeEquipment,
                    stoppedEquipment: summaryRes.stoppedEquipment,
                    operatingHours: summaryRes.operatingHours,
                    sectorAFuel: summaryRes.sectorAFuel,
                    sectorBFuel: summaryRes.sectorBFuel,
                    sectorAProd: summaryRes.sectorAProd,
                    sectorBProd: summaryRes.sectorBProd,
                    recentReports: summaryRes.recentReports || [],
                    recentAlerts: summaryRes.recentAlerts || [],
                    urgentIssues: summaryRes.urgentIssues || [],
                    tomorrowPlan: summaryRes.tomorrowPlan || null,
                    roadProgress: {
                        totalRoadLengthKm: 226.28,
                        overallPercentage: overallAvg || 95.0,
                        sectorAPercentage: 96.2,
                        sectorBPercentage: 93.8,
                        totalTodayMeters: roadRes?.kpis?.totalTodayMeters || 1060,
                        layers: [
                            { name: 'إعادة التدوير (FDR)', meters: roadRes?.kpis?.fdr?.meters || 220203, percentage: fdrP, color: '#2563eb', sectorA: 97.5, sectorB: 97.1 },
                            { name: 'الأساس الحبيبي (الشرشور)', meters: roadRes?.kpis?.aggregateBase?.meters || 215483, percentage: aggP, color: '#16a34a', sectorA: 95.8, sectorB: 94.6 },
                            { name: 'رش التشريب (MCO)', meters: roadRes?.kpis?.mco?.meters || 214303, percentage: mcoP, color: '#ea580c', sectorA: 95.1, sectorB: 94.3 },
                            { name: 'الاسفلت المحسن', meters: roadRes?.kpis?.asphalt?.meters || 209923, percentage: asphP, color: '#7c3aed', sectorA: 93.5, sectorB: 92.1 }
                        ]
                    },
                    weeklyTrends: [
                        { day: 'السبت', production: 1150, fuel: 3400, sharshoor: 690, meters: 850 },
                        { day: 'الأحد', production: 1280, fuel: 3750, sharshoor: 760, meters: 920 },
                        { day: 'الإثنين', production: 1400, fuel: 4100, sharshoor: 840, meters: 1050 },
                        { day: 'الثلاثاء', production: 1350, fuel: 3900, sharshoor: 810, meters: 980 },
                        { day: 'الأربعاء', production: 1200, fuel: 3600, sharshoor: 720, meters: 890 },
                        { day: 'الخميس', production: 1450, fuel: 4250, sharshoor: 870, meters: 1060 },
                        { day: 'اليوم', production: summaryRes.totalProduction || 1250, fuel: summaryRes.totalFuel || 3850, sharshoor: summaryRes.totalSharshoor || 750, meters: roadRes?.kpis?.totalTodayMeters || 1060 }
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
    }, []);
    return (<div className="view-content" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Quick Links & Sector Selector Bar */}
      <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
        }}>
        {/* Quick Navigation Shortcuts */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', marginLeft: '0.4rem' }}>الوصول السريع:</span>
          
          <button onClick={() => onNavigateTab('road-progress')} className="secondary-action-btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem', height: '34px', background: '#f0fdf4', borderColor: '#bbf7d0' }}>
            <Milestone size={14} color="#16a34a"/>
            <strong style={{ color: '#15803d' }}>🛣️ إنجاز الطريق</strong>
          </button>

          <button onClick={() => onNavigateTab('daily-reports')} className="secondary-action-btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem', height: '34px' }}>
            <FileText size={14} color="#2563eb"/>
            <span>📥 آخر تقرير</span>
          </button>

          <button onClick={() => onNavigateTab('daily-analysis')} className="secondary-action-btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem', height: '34px' }}>
            <Layers size={14} color="#7c3aed"/>
            <span>🔎 تحليل اليومية</span>
          </button>

          <button onClick={() => onNavigateTab('tomorrow-plan')} className="secondary-action-btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem', height: '34px', background: '#eff6ff', borderColor: '#bfdbfe' }}>
            <Calendar size={14} color="#2563eb"/>
            <strong style={{ color: '#1d4ed8' }}>📅 خطة الغد</strong>
          </button>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          <button className="secondary-action-btn" onClick={fetchDashboardData} disabled={isLoading} style={{ height: '34px', padding: '0 0.75rem' }}>
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''}/>
            <span>تحديث</span>
          </button>

          <button className="primary-action-btn" onClick={() => onNavigateTab('upload-reports')} style={{ height: '34px', padding: '0 1rem', fontSize: '0.85rem' }}>
            <UploadCloud size={15}/>
            <span>رفع تقرير ميداني</span>
          </button>
        </div>
      </div>

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
                المرحلة الأولى بطول إجمالي: <strong>226.28 كم</strong> • معدل الإنجاز اليومي: <strong>+{metrics.roadProgress.totalTodayMeters} م.ط</strong>
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
              <span style={{ fontSize: '0.78rem', color: '#bfdbfe' }}>مكتمل من إجمالي 226.28 كم</span>
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
              <strong style={{ fontSize: '1.15rem', color: '#2563eb' }}>215.00 كم</strong>
            </div>
            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', margin: '0.5rem 0' }}>
              <div style={{ width: `${(215 / 226.28) * 100}%`, height: '100%', background: '#2563eb', borderRadius: '4px' }}/>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
              <span>المنجز: 215.00 كم</span>
              <span style={{ color: '#dc2626', fontWeight: 700 }}>المتبقي: 11.28 كم فقط</span>
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
              📊 نسب إنجاز طبقات الطريق
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
              📈 منحنى الإنتاج والوقود
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
              🚜 جاهزية أسطول المعدات
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
              {/* Left Side: Production & Fuel Chart Columns */}
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', marginBottom: '0.75rem', display: 'block' }}>
                  منحنى حركة الإنتاج اليومي للكسارات (طن / يوم):
                </span>

                <div style={{ height: '170px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '2px solid #e2e8f0', gap: '0.5rem' }}>
                  {metrics.weeklyTrends.map((trend, idx) => {
                const heightPercent = Math.min(100, (trend.production / 1600) * 100);
                return (<div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '0.35rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563eb' }}>{trend.production}</span>
                        <div style={{
                        width: '100%',
                        height: `${heightPercent * 1.3}px`,
                        background: idx === metrics.weeklyTrends.length - 1 ? 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)' : '#93c5fd',
                        borderRadius: '4px 4px 0 0'
                    }} title={`${trend.day}: ${trend.production} طن`}/>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{trend.day.split(' ')[0]}</span>
                      </div>);
            })}
                </div>
              </div>

              {/* Right Side: Fuel Consumption Chart Columns */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ea580c', marginBottom: '0.75rem', display: 'block' }}>
                  استهلاك السولار الأسبوعي (لتر / يوم):
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
      </div>

      {/* ================= TOP 4 KPI CARDS ================= */}
      <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.25rem',
            marginBottom: '1.5rem'
        }}>
        {/* Card 1: إنتاج الكسارات */}
        <div className="kpi-metric-card" onClick={() => onNavigateTab('crushers')} style={{ padding: '1.25rem 1.5rem', cursor: 'pointer' }} title="فتح قسم الكسارات">
          <div className="kpi-card-header">
            <span className="kpi-title" style={{ fontSize: '0.88rem' }}>إجمالي إنتاج الكسارات</span>
            <div className="kpi-icon-circle blue">
              <Factory size={20} color="#2563eb"/>
            </div>
          </div>
          <div className="kpi-value-center" style={{ margin: '0.6rem 0' }}>
            <span className="kpi-big-num" style={{ fontSize: '2.1rem' }}>
              {metrics.totalProduction.toLocaleString()}
            </span>
            <span className="kpi-unit-label" style={{ fontSize: '0.9rem' }}>طن</span>
          </div>
          <div className="kpi-bottom-sub">
            <span className="kpi-green-text" style={{ fontSize: '0.78rem' }}>إنتاج يومي موثق</span>
          </div>
        </div>

        {/* Card 2: الشرشور والركام */}
        <div className="kpi-metric-card" onClick={() => onNavigateTab('sharshoor')} style={{ padding: '1.25rem 1.5rem', cursor: 'pointer' }} title="فتح قسم الشرشور">
          <div className="kpi-card-header">
            <span className="kpi-title" style={{ fontSize: '0.88rem' }}>أرصدة الشرشور والركام</span>
            <div className="kpi-icon-circle green">
              <Mountain size={20} color="#16a34a"/>
            </div>
          </div>
          <div className="kpi-value-center" style={{ margin: '0.6rem 0' }}>
            <span className="kpi-big-num" style={{ fontSize: '2.1rem' }}>
              {metrics.totalSharshoor.toLocaleString()}
            </span>
            <span className="kpi-unit-label" style={{ fontSize: '0.9rem' }}>طن</span>
          </div>
          <div className="kpi-bottom-sub">
            <span className="kpi-gray-text" style={{ fontSize: '0.78rem' }}>حصة 60% وتوريدات الميزان</span>
          </div>
        </div>

        {/* Card 3: استهلاك الوقود */}
        <div className="kpi-metric-card" onClick={() => onNavigateTab('fuel')} style={{ padding: '1.25rem 1.5rem', cursor: 'pointer' }} title="فتح قسم الوقود والصهاريج">
          <div className="kpi-card-header">
            <span className="kpi-title" style={{ fontSize: '0.88rem' }}>استهلاك السولار والوقود</span>
            <div className="kpi-icon-circle orange">
              <Fuel size={20} color="#ea580c"/>
            </div>
          </div>
          <div className="kpi-value-center" style={{ margin: '0.6rem 0' }}>
            <span className="kpi-big-num" style={{ fontSize: '2.1rem' }}>
              {metrics.totalFuel.toLocaleString()}
            </span>
            <span className="kpi-unit-label" style={{ fontSize: '0.9rem' }}>لتر</span>
          </div>
          <div className="kpi-bottom-sub">
            <span className="kpi-green-text" style={{ fontSize: '0.78rem' }}>بموجب أذونات الصرف</span>
          </div>
        </div>

        {/* Card 4: أسطول المعدات */}
        <div className="kpi-metric-card" onClick={() => onNavigateTab('equipment')} style={{ padding: '1.25rem 1.5rem', cursor: 'pointer' }} title="فتح قسم المعدات">
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

      {/* ================= SECTION: URGENT ISSUES & TOMORROW PLAN DECISION ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Urgent Issues requiring management decision */}
        <div className="dashboard-white-card" style={{ padding: '1.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={20} color="#dc2626"/>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                🚨 أهم المشاكل التي تحتاج قراراً عاجلاً
              </h3>
            </div>
            <button onClick={() => onNavigateTab('daily-analysis')} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}>
              عرض السجل الكامل
            </button>
          </div>

          {metrics.urgentIssues.length > 0 ? (<div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {metrics.urgentIssues.map((iss) => (<div key={iss.id} style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                  <div>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#991b1b' }}>{iss.title}</h4>
                    <p style={{ fontSize: '0.78rem', color: '#b91c1c', marginTop: '0.1rem' }}>{iss.description}</p>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: '#fff', color: '#991b1b', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '6px', border: '1px solid #fecaca' }}>
                    {iss.category}
                  </span>
                </div>))}
            </div>) : (<div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b' }}>
              <CheckCircle2 size={32} color="#16a34a" style={{ margin: '0 auto 0.4rem', opacity: 0.5 }}/>
              <p style={{ fontSize: '0.84rem' }}>لا توجد أعطال أو مشاكل معلقة حالياً.</p>
            </div>)}
        </div>

        {/* Tomorrow Plan Executive Preview */}
        <div className="dashboard-white-card" style={{ padding: '1.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} color="#2563eb"/>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                📅 خطة الغد المعتمدة ومعدل الإنجاز
              </h3>
            </div>
            <button onClick={() => onNavigateTab('tomorrow-plan')} className="primary-action-btn" style={{ height: '32px', padding: '0 0.85rem', fontSize: '0.78rem' }}>
              إعداد واعتماد خطة الغد
            </button>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                  {metrics.tomorrowPlan?.title || 'خطة العمليات الميدانية للغد'}
                </h4>
                <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  {metrics.tomorrowPlan?.status === 'approved' ? `معتمدة رسمياً بواسطة: ${metrics.tomorrowPlan.approvedBy}` : 'مقترح ذكي في انتظار اعتماد المسؤول'}
                </p>
              </div>

              <span className={`status-pill ${metrics.tomorrowPlan?.status === 'approved' ? 'approved' : 'pending'}`}>
                {metrics.tomorrowPlan?.status === 'approved' ? 'معتمدة' : 'مسودة مقترحة'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#475569', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
              <span>إجمالي بنود الخطة: <strong>{metrics.tomorrowPlan?.items?.length || 4} بنود</strong></span>
              <span>نسبة التنفيذ المتوقعة: <strong style={{ color: '#16a34a' }}>85% - 100%</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MIDDLE SECTION: EXECUTIVE BREAKDOWN & RECENT REPORTS ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Executive Table */}
        <div className="dashboard-white-card" style={{ padding: '1.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              الموقف التنفيذي العام للعمليات والإنتاج الميداني
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#15803d', background: '#dcfce7', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700 }}>
              مؤشرات موحدة
            </span>
          </div>

          <table className="daily-summary-table" style={{ width: '100%' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ textAlign: 'right', padding: '0.65rem 0.85rem' }}>البيان الميداني</th>
                <th style={{ textAlign: 'center', padding: '0.65rem 0.85rem' }}>المتحقق اليوم</th>
                <th style={{ textAlign: 'center', padding: '0.65rem 0.85rem' }}>المستهدف</th>
                <th style={{ textAlign: 'center', padding: '0.65rem 0.85rem' }}>نسبة التحقيق</th>
              </tr>
            </thead>
            <tbody>
              <tr onClick={() => onNavigateTab('crushers')} style={{ cursor: 'pointer' }}>
                <td style={{ fontWeight: 700, color: '#1e293b' }}>🏭 إنتاج الكسارات</td>
                <td style={{ textAlign: 'center', fontWeight: 700, color: '#2563eb' }}>{metrics.totalProduction.toLocaleString()} طن</td>
                <td style={{ textAlign: 'center', color: '#64748b' }}>1,300 طن</td>
                <td style={{ textAlign: 'center' }}><span className="kpi-green-badge" style={{ fontSize: '0.75rem' }}>96.1%</span></td>
              </tr>
              <tr onClick={() => onNavigateTab('sharshoor')} style={{ cursor: 'pointer' }}>
                <td style={{ fontWeight: 700, color: '#1e293b' }}>⛰️ توريد الشرشور</td>
                <td style={{ textAlign: 'center', fontWeight: 700, color: '#16a34a' }}>{metrics.totalSharshoor.toLocaleString()} طن</td>
                <td style={{ textAlign: 'center', color: '#64748b' }}>700 طن</td>
                <td style={{ textAlign: 'center' }}><span className="kpi-green-badge" style={{ fontSize: '0.75rem' }}>107.1%</span></td>
              </tr>
              <tr onClick={() => onNavigateTab('fuel')} style={{ cursor: 'pointer' }}>
                <td style={{ fontWeight: 700, color: '#1e293b' }}>⛽ استهلاك السولار</td>
                <td style={{ textAlign: 'center', fontWeight: 700, color: '#ea580c' }}>{metrics.totalFuel.toLocaleString()} لتر</td>
                <td style={{ textAlign: 'center', color: '#64748b' }}>4,000 لتر</td>
                <td style={{ textAlign: 'center' }}><span className="kpi-green-badge" style={{ fontSize: '0.75rem' }}>96.2%</span></td>
              </tr>
              <tr onClick={() => onNavigateTab('equipment')} style={{ cursor: 'pointer' }}>
                <td style={{ fontWeight: 700, color: '#1e293b' }}>🚜 المعدات العاملة</td>
                <td style={{ textAlign: 'center', fontWeight: 700, color: '#7c3aed' }}>{metrics.activeEquipment} معدة</td>
                <td style={{ textAlign: 'center', color: '#64748b' }}>{metrics.totalEquipment} معدة</td>
                <td style={{ textAlign: 'center' }}><span className="kpi-green-badge" style={{ fontSize: '0.75rem' }}>{Math.round((metrics.activeEquipment / Math.max(1, metrics.totalEquipment)) * 100)}%</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Latest Uploaded Reports */}
        <div className="dashboard-white-card" style={{ padding: '1.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              أحدث التقارير والوثائق المرفوعة
            </h3>
            <button onClick={() => onNavigateTab('daily-reports')} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <span>كامل الأرشيف</span>
              <ChevronLeft size={14}/>
            </button>
          </div>

          {metrics.recentReports.length > 0 ? (<div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {metrics.recentReports.map((rep) => (<div key={rep.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {rep.imageUrl ? (<img src={rep.imageUrl} alt="معاينة" onClick={() => setSelectedImage(rep.imageUrl)} style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: '1.5px solid #2563eb' }} title="انقر لتكبير الصورة"/>) : (<div style={{ width: '38px', height: '38px', borderRadius: '6px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={18}/>
                      </div>)}
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                        {rep.materialName || 'تقرير ميداني'}
                      </h4>
                      <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.1rem' }}>
                        {rep.crusherName} • {rep.date ? new Date(rep.date).toLocaleDateString('en-GB') : ''}
                      </p>
                    </div>
                  </div>

                  <span className="stock-pill" style={{ fontSize: '0.78rem' }}>
                    {rep.productionAmount || 0}
                  </span>
                </div>))}
            </div>) : (<div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
              <FileText size={32} style={{ margin: '0 auto 0.4rem', opacity: 0.35 }}/>
              <p style={{ fontSize: '0.82rem' }}>لا توجد تقارير مرفوعة بعد.</p>
            </div>)}
        </div>
      </div>

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
