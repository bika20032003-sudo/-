import React, { useState, useEffect } from 'react';
import { Milestone, RefreshCw, FileSpreadsheet, MapPin, Edit3, Check, X, Layers, FileText, Printer, Calendar, Trash2, Eye } from 'lucide-react';
import * as XLSX from 'xlsx';
import { fastFetch, clearApiCache } from '../utils/apiCache.js';
import { OfficialPrintModal } from '../components/OfficialPrintModal';
import { RoadDailyReportForm } from '../components/RoadDailyReportForm';
import { TwoPhaseDailyReportForm } from '../components/TwoPhaseDailyReportForm';
import { canAccessTwoPhaseReport } from '../utils/permissionUtils';
import { CheckCircle2 } from 'lucide-react';

export const RoadProgressView = ({ currentUser, onNavigateTab }) => {
    const [activeViewMode, setActiveViewMode] = useState('matrix'); // 'matrix' | 'form'
    const [projectData, setProjectData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [progressReports, setProgressReports] = useState([]);
    const [selectedReportForPrint, setSelectedReportForPrint] = useState(null);
    const [activePhase, setActivePhase] = useState('all'); // 'all' | 'phase1' | 'phase2'
    // Quick Edit State
    const [editingId, setEditingId] = useState(null);
    const [editMeters, setEditMeters] = useState(0);
    const [editNotes, setEditNotes] = useState('');

    const fetchProgressReports = async () => {
        try {
            let remoteReports = [];
            try {
              const data = await fastFetch('http://localhost:5000/api/reports');
              remoteReports = data?.reports || (Array.isArray(data) ? data : []);
            } catch (err) {}

            let localReports = [];
            try {
              localReports = JSON.parse(localStorage.getItem('local_reports') || '[]');
            } catch (e) {}

            const all = [...remoteReports, ...localReports];
            const uniqueMap = new Map();
            all.forEach(r => {
              if (r && r.id && !uniqueMap.has(String(r.id))) {
                uniqueMap.set(String(r.id), r);
              }
            });
            const uniqueList = Array.from(uniqueMap.values());

            const filtered = uniqueList.filter(r => 
                r.isTwoPhaseProgressReport || 
                r.reportType === 'تقرير إنجاز المرحلتين' ||
                r.reportType === 'تقرير أعمال الطريق اليومي' ||
                r.reportType === 'تقرير أعمال الطريق اليومية' ||
                r.reportType === 'تقرير أعمال يومي' ||
                (r.title && (r.title.includes('بيان أعمال') || r.title.includes('المرحلتين')))
            );
            filtered.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
            setProgressReports(filtered);
        } catch (e) {
            console.error('Error fetching progress reports in RoadProgressView', e);
        }
    };

    const fetchRoadProgress = async () => {
        try {
            const data = await fastFetch('http://localhost:5000/api/road-progress');
            if (data && data.success) {
                setProjectData(data);
            }
        }
        catch (e) {
            console.error('Error fetching road progress', e);
        }
        finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRoadProgress();
        fetchProgressReports();

        const handleRealtimeUpdate = () => {
          fetchRoadProgress();
          fetchProgressReports();
        };

        window.addEventListener('report-saved', handleRealtimeUpdate);
        window.addEventListener('road-progress-updated', handleRealtimeUpdate);
        return () => {
          window.removeEventListener('report-saved', handleRealtimeUpdate);
          window.removeEventListener('road-progress-updated', handleRealtimeUpdate);
        };
    }, []);

    const handleSaveEdit = async (id) => {
        try {
            const data = await fastFetch('http://localhost:5000/api/road-progress/update-daily', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    todayMeters: editMeters,
                    notes: editNotes
                })
            });
            if (data && data.success) {
                setEditingId(null);
                clearApiCache();
                fetchRoadProgress();
            }
        }
        catch (e) {
            alert('خطأ أثناء حفظ التحديث');
        }
    };

    const handleExportExcel = () => {
        if (!projectData?.items)
            return;
        const exportData = projectData.items.map((item, idx) => ({
            'م': idx + 1,
            'المرحلة / القطاع': item.sector || (idx < 6 ? 'المرحلة الأولى' : 'المرحلة الثانية'),
            'التصنيف': item.category,
            'الوصف / البند': item.itemName,
            'أعمال اليوم (م.ط)': item.todayMeters,
            'الأعمال السابقة (م.ط)': item.previousMeters,
            'الإجمالي (م.ط)': item.totalMeters,
            'المستهدف اليومي': item.dailyTarget,
            'الزيادة / النقصان': item.varianceMeters,
            'الجاهز للعمل بالبند (م.ط)': item.readyLength,
            'ملاحظات': item.notes || '—'
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'نسبة الإنجاز اليومية');
        XLSX.writeFile(wb, `نسبة_الانجاز_طريق_اوباري_غات_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const allItems = projectData?.items || [];

    // Filter items based on activePhase tab
    const filteredItems = allItems.filter(item => {
        if (activePhase === 'phase1') return (item.sector || '').includes('الأولى');
        if (activePhase === 'phase2') return (item.sector || '').includes('الثانية');
        return true;
    });

    // Dynamic layer calculations based on selected Phase or Total
    const getLayerStats = (layerName, defaultMeters, defaultPct) => {
        const matching = filteredItems.filter(i => (i.itemName || '').includes(layerName));
        if (matching.length === 0) return { meters: defaultMeters, percentage: defaultPct };
        const meters = matching.reduce((acc, curr) => acc + (Number(curr.totalMeters) || 0), 0);
        const targetLen = activePhase === 'phase1' ? 226083 : (activePhase === 'phase2' ? 133917 : 360000);
        const percentage = Math.min(100, parseFloat(((meters / targetLen) * 100).toFixed(1)));
        return { meters, percentage };
    };

    const fdrStats = getLayerStats('إعادة التدوير', 241103, 67.0);
    const aggStats = getLayerStats('أساس حبيبي', 235993, 65.6);
    const mcoStats = getLayerStats('التشريب', 236033, 65.6);
    const asphStats = getLayerStats('الاسفلت', 233103, 64.8);

    return (
    <div className="view-content" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Project Badge & Header */}
      <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Milestone size={24}/>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                مشروع صيانة طريق أوباري - غات
              </h2>
              <span className="stock-pill" style={{ fontSize: '0.78rem', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                المسار الكلي الموحد: 360.00 كم (المرحلة الأولى: 226.08 كم • المرحلة الثانية: 133.92 كم)
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.2rem' }}>
              المتابعة اليومية الدقيقة لطبقات الرصف وإعادة التدوير والأسفلت والشرشور (الأساس التشغيلي للمنظومة)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          {canAccessTwoPhaseReport(currentUser) ? (
            <button 
              className="primary-action-btn" 
              onClick={() => onNavigateTab && onNavigateTab('create-report')} 
              style={{ 
                height: '38px', 
                background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', 
                border: 'none',
                boxShadow: '0 2px 8px rgba(30, 58, 138, 0.25)' 
              }}
            >
              <Layers size={16}/>
              <span>+ إنشاء تقرير إنجاز المرحلتين</span>
            </button>
          ) : (
            <button 
              className="primary-action-btn" 
              onClick={() => onNavigateTab && onNavigateTab('create-report')} 
              style={{ 
                height: '38px', 
                background: 'linear-gradient(135deg, #0f172a 0%, #16a34a 100%)', 
                border: 'none',
                boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)' 
              }}
            >
              <Milestone size={16}/>
              <span>+ إنشاء تقرير أعمال الطريق</span>
            </button>
          )}

          {/* Direct Edit of Road Daily Report (24/10/2026) */}
          <button 
            type="button"
            onClick={() => setActiveViewMode(prev => prev === 'form' ? 'matrix' : 'form')}
            style={{ 
              height: '38px', 
              background: activeViewMode === 'form' ? '#1e293b' : '#e0f2fe', 
              border: activeViewMode === 'form' ? 'none' : '1.5px solid #0284c7',
              color: activeViewMode === 'form' ? '#ffffff' : '#0369a1',
              borderRadius: '8px',
              padding: '0 1rem',
              fontWeight: 800,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Edit3 size={15}/>
            <span>{activeViewMode === 'form' ? 'الرجوع لمتابعة المسار' : 'تعديل تقرير أعمال الطريق المعتمد (24/10/2026)'}</span>
          </button>

          <button className="secondary-action-btn" onClick={fetchRoadProgress} disabled={isLoading} style={{ height: '38px' }}>
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''}/>
            <span>تحديث البيانات</span>
          </button>

          <button className="primary-action-btn" onClick={handleExportExcel} style={{ height: '38px', background: '#16a34a', border: 'none' }}>
            <FileSpreadsheet size={16}/>
            <span>تصدير تقرير الإنجاز Excel</span>
          </button>
        </div>
      </div>

      {activeViewMode === 'form' ? (
        <RoadDailyReportForm 
          currentUser={currentUser}
          onSaved={fetchProgressReports}
          onPrintReport={(rep) => setSelectedReportForPrint(rep)}
          onNavigateTab={onNavigateTab}
        />
      ) : (
        <>
      {/* 4 Main Layer Progress KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.75rem' }}>
        {/* Card 1: FDR */}
        <div className="dashboard-white-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>1. إعادة التدوير (FDR)</span>
            <span className="stock-pill" style={{ fontSize: '0.78rem' }}>{fdrStats.percentage}%</span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#2563eb', marginBottom: '0.4rem' }}>
            {fdrStats.meters.toLocaleString()} <span style={{ fontSize: '0.85rem' }}>م.ط</span>
          </div>
          <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, fdrStats.percentage)}%`, height: '100%', background: '#2563eb' }}/>
          </div>
          <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.4rem', display: 'block' }}>منفذ فرمة ثانية مع الإسمنت</span>
        </div>

        {/* Card 2: Aggregate Base */}
        <div className="dashboard-white-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>2. الأساس الحبيبي (الشرشور)</span>
            <span className="stock-pill" style={{ fontSize: '0.78rem', color: '#16a34a' }}>{aggStats.percentage}%</span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#16a34a', marginBottom: '0.4rem' }}>
            {aggStats.meters.toLocaleString()} <span style={{ fontSize: '0.85rem' }}>م.ط</span>
          </div>
          <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, aggStats.percentage)}%`, height: '100%', background: '#16a34a' }}/>
          </div>
          <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.4rem', display: 'block' }}>توريد من كسارات الموقع</span>
        </div>

        {/* Card 3: MCO */}
        <div className="dashboard-white-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>3. رش التشريب (MCO)</span>
            <span className="stock-pill" style={{ fontSize: '0.78rem', color: '#ea580c' }}>{mcoStats.percentage}%</span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ea580c', marginBottom: '0.4rem' }}>
            {mcoStats.meters.toLocaleString()} <span style={{ fontSize: '0.85rem' }}>م.ط</span>
          </div>
          <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, mcoStats.percentage)}%`, height: '100%', background: '#ea580c' }}/>
          </div>
          <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.4rem', display: 'block' }}>تجهيز لفرش الأسفلت</span>
        </div>

        {/* Card 4: Asphalt */}
        <div className="dashboard-white-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>4. الأسفلت المحسن</span>
            <span className="stock-pill" style={{ fontSize: '0.78rem', color: '#7c3aed' }}>{asphStats.percentage}%</span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#7c3aed', marginBottom: '0.4rem' }}>
            {asphStats.meters.toLocaleString()} <span style={{ fontSize: '0.85rem' }}>م.ط</span>
          </div>
          <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, asphStats.percentage)}%`, height: '100%', background: '#7c3aed' }}/>
          </div>
          <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.4rem', display: 'block' }}>الطبقة الرابطة والسطحية المكتملة</span>
        </div>
      </div>

      {/* Comprehensive Unified Road Progress Table */}
      <div className="dashboard-white-card" style={{ padding: '1.5rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} color="#2563eb"/>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              الموقف التنفيذي التفصيلي لبنود وأعمال المسار الميدانية
            </h3>
          </div>

          {/* Phase Filter Tabs */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '3px' }}>
            <button
              onClick={() => setActivePhase('all')}
              style={{
                border: 'none',
                background: activePhase === 'all' ? '#ffffff' : 'transparent',
                color: activePhase === 'all' ? '#0f172a' : '#64748b',
                fontWeight: activePhase === 'all' ? 800 : 600,
                padding: '0.35rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: activePhase === 'all' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              كل المسار (360 كم)
            </button>
            <button
              onClick={() => setActivePhase('phase1')}
              style={{
                border: 'none',
                background: activePhase === 'phase1' ? '#ffffff' : 'transparent',
                color: activePhase === 'phase1' ? '#ea580c' : '#64748b',
                fontWeight: activePhase === 'phase1' ? 800 : 600,
                padding: '0.35rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: activePhase === 'phase1' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              المرحلة الأولى (226.08 كم)
            </button>
            <button
              onClick={() => setActivePhase('phase2')}
              style={{
                border: 'none',
                background: activePhase === 'phase2' ? '#ffffff' : 'transparent',
                color: activePhase === 'phase2' ? '#0284c7' : '#64748b',
                fontWeight: activePhase === 'phase2' ? 800 : 600,
                padding: '0.35rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: activePhase === 'phase2' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              المرحلة الثانية (133.92 كم)
            </button>
          </div>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>المرحلة / القطاع</th>
              <th>البند / الوصف الميداني</th>
              <th>التصنيف الفني</th>
              <th>أعمال اليوم (م.ط)</th>
              <th>الأعمال السابقة (م.ط)</th>
              <th>الإجمالي المنفذ (م.ط)</th>
              <th>المستهدف اليومي</th>
              <th>الزيادة / الفارق</th>
              <th>الجاهز للعمل بالبند</th>
              <th>ملاحظات الموقع</th>
              <th>تحديث</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (<tr key={item.id}>
                <td>
                  <span style={{
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '6px',
                    background: (item.sector || '').includes('الأولى') ? '#fff7ed' : '#f0f9ff',
                    color: (item.sector || '').includes('الأولى') ? '#c2410c' : '#0369a1',
                    border: `1px solid ${(item.sector || '').includes('الأولى') ? '#fed7aa' : '#bae6fd'}`
                  }}>
                    {item.sector || 'المرحلة الأولى'}
                  </span>
                </td>
                <td><strong>{item.itemName}</strong></td>
                <td>
                  <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: item.category.includes('أساسية') ? '#eff6ff' : '#f8fafc', color: item.category.includes('أساسية') ? '#2563eb' : '#64748b', fontWeight: 700 }}>
                    {item.category}
                  </span>
                </td>
                <td>
                  {editingId === item.id ? (
                    <input type="text" inputMode="decimal" dir="ltr" lang="en" className="form-input" value={editMeters} onChange={(e) => setEditMeters(parseFloat(e.target.value) || 0)} style={{ width: '90px', height: '32px', padding: '0.2rem' }}/>
                  ) : (
                    <strong style={{ color: item.todayMeters > 0 ? '#16a34a' : '#64748b' }}>
                      {item.todayMeters.toLocaleString()}
                    </strong>
                  )}
                </td>
                <td>{item.previousMeters.toLocaleString()}</td>
                <td><strong>{item.totalMeters.toLocaleString()}</strong></td>
                <td>{item.dailyTarget}</td>
                <td>
                  <span style={{ fontWeight: 800, color: item.varianceMeters >= 0 ? '#16a34a' : '#dc2626' }}>
                    {item.varianceMeters > 0 ? `+${item.varianceMeters}` : item.varianceMeters}
                  </span>
                </td>
                <td><span className="stock-pill">{item.readyLength.toLocaleString()} م</span></td>
                <td style={{ fontSize: '0.8rem', color: '#475569' }}>
                  {editingId === item.id ? (
                    <input type="text" className="form-input" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} style={{ height: '32px', fontSize: '0.8rem' }}/>
                  ) : (
                    item.notes || '—'
                  )}
                </td>
                <td>
                  {editingId === item.id ? (
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button onClick={() => handleSaveEdit(item.id)} style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>
                        <Check size={14}/>
                      </button>
                      <button onClick={() => setEditingId(null)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>
                        <X size={14}/>
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingId(item.id); setEditMeters(item.todayMeters); setEditNotes(item.notes || ''); }} style={{ background: '#f1f5f9', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', color: '#2563eb' }} title="تحديث منجز اليوم">
                      <Edit3 size={14}/>
                    </button>
                  )}
                </td>
              </tr>))}
          </tbody>
        </table>
      </div>

      {/* 2. Uploaded / Approved Road Progress Reports Section */}
      <div style={{ marginTop: '2.5rem' }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '1.25rem 1.5rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                تقارير الأعمال اليومية وإنجاز المرحلتين المعتمدة ({progressReports.length})
              </h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                سجل التقارير المرفوعة والمعتمدة لإنجاز المرحلتين الأولى والثانية وبيانات الأعمال اليومية
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              onClick={() => onNavigateTab && onNavigateTab('upload-reports')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <span>+ رفع تقرير إنجاز جديد</span>
            </button>
            <button
              onClick={fetchProgressReports}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#1d4ed8',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} />
              <span>تحديث</span>
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th>رقم التقرير</th>
                <th>التاريخ واليوم</th>
                <th>نوع التقرير المعتمد</th>
                <th>المرحلة</th>
                <th>إنجاز اليوم (م.ط)</th>
                <th>المشرف المعد</th>
                <th>حالة الاعتماد</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {progressReports.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    <Layers size={32} color="#94a3b8" style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                    <p style={{ margin: 0, fontWeight: 700 }}>لا توجد تقارير إنجاز مرفوعة حالياً.</p>
                    <span style={{ fontSize: '0.8rem' }}>يمكنك رفع تقرير جديد من قسم "رفع ومعالجة التقارير".</span>
                  </td>
                </tr>
              ) : (
                progressReports.map(rep => {
                  const repDate = rep.dateFormatted || (rep.date ? rep.date.split('T')[0] : 'اليوم');
                  const isTwoPhase = Boolean(rep.isTwoPhaseProgressReport || rep.reportType === 'تقرير إنجاز المرحلتين');
                  const todayM = isTwoPhase 
                    ? (rep.twoPhaseTotals?.todayMeters || (rep.combinedItems || []).reduce((acc, c) => acc + (parseFloat(c.todayMeters) || 0), 0))
                    : (rep.totalLength || rep.roadMeters || 0);

                  return (
                    <tr key={rep.id}>
                      <td>
                        <span className="code-badge" style={{ background: isTwoPhase ? '#eff6ff' : '#f0fdf4', color: isTwoPhase ? '#1d4ed8' : '#15803d' }}>
                          {rep.reportNumber || `#REP-${rep.id}`}
                        </span>
                      </td>
                      <td>
                        <div className="flex-cell">
                          <Calendar size={14} color="#64748b" />
                          <strong>{repDate}</strong>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>({rep.dayName || 'السبت'})</span>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          background: isTwoPhase ? '#dbeafe' : '#dcfce7',
                          color: isTwoPhase ? '#1e40af' : '#166534'
                        }}>
                          {isTwoPhase ? 'تقرير إنجاز المرحلتين (عرضي)' : 'بيان أعمال الطريق اليومي'}
                        </span>
                      </td>
                      <td>
                        <span className="sector-tag">{(rep.sector || '').includes('B') || (rep.sector || '').includes('الثانية') ? 'المرحلة الثانية' : ((rep.sector || '').includes('أوباري') ? 'طريق أوباري - غات' : 'المرحلة الأولى')}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 900, color: '#0f172a' }}>
                          {Number(todayM).toLocaleString()} م.ط
                        </span>
                      </td>
                      <td>{rep.uploadedBy || 'المشرف الميداني'}</td>
                      <td>
                        <span style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
                          ✓ معتمد رسمياً
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <button
                            onClick={() => setSelectedReportForPrint(rep)}
                            style={{
                              background: isTwoPhase ? '#eff6ff' : '#f0fdf4',
                              border: isTwoPhase ? '1.5px solid #2563eb' : '1.5px solid #16a34a',
                              borderRadius: '6px',
                              padding: '0.35rem 0.75rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.78rem',
                              color: isTwoPhase ? '#1e40af' : '#15803d',
                              fontWeight: 800
                            }}
                            title="طباعة التقرير بالنموذج المعتمد"
                          >
                            <Printer size={14} />
                            <span>طباعة النموذج المعتمد</span>
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
      </div>
        </>
      )}

      {/* Official Print Modal */}
      {selectedReportForPrint && (
        <OfficialPrintModal
          report={selectedReportForPrint}
          onClose={() => setSelectedReportForPrint(null)}
        />
      )}
    </div>);
};

export default RoadProgressView;
