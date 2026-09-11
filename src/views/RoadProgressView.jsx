import React, { useState, useEffect } from 'react';
import { Milestone, RefreshCw, FileSpreadsheet, MapPin, Edit3, Check, X, Layers } from 'lucide-react';
import * as XLSX from 'xlsx';
import { fastFetch } from '../utils/apiCache.js';

export const RoadProgressView = ({ onNavigateTab }) => {
    const [projectData, setProjectData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // Quick Edit State
    const [editingId, setEditingId] = useState(null);
    const [editMeters, setEditMeters] = useState(0);
    const [editNotes, setEditNotes] = useState('');

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
            if (data.success) {
                setEditingId(null);
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
        XLSX.writeFile(wb, `نسبة_الانجاز_اليومية_طريق_اوباري_غات_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const allItems = projectData?.items || [];

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
                المسار الكلي الموحد: 226.28 كم
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.2rem' }}>
              المتابعة اليومية الدقيقة لطبقات الرصف وإعادة التدوير والأسفلت والشرشور (الأساس التشغيلي للمنظومة)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          <button className="secondary-action-btn" onClick={fetchRoadProgress} disabled={isLoading} style={{ height: '38px' }}>
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''}/>
            <span>تحديث البيانات</span>
          </button>

          <button className="primary-action-btn" onClick={handleExportExcel} style={{ height: '38px' }}>
            <FileSpreadsheet size={16}/>
            <span>تصدير تقرير الإنجاز Excel</span>
          </button>
        </div>
      </div>

      {/* 4 Main Layer Progress KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.75rem' }}>
        {/* Card 1: FDR */}
        <div className="dashboard-white-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>1. إعادة التدوير (FDR)</span>
            <span className="stock-pill" style={{ fontSize: '0.78rem' }}>{projectData?.kpis?.fdr?.percentage || 97.3}%</span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#2563eb', marginBottom: '0.4rem' }}>
            {(projectData?.kpis?.fdr?.meters || 220203).toLocaleString()} <span style={{ fontSize: '0.85rem' }}>م.ط</span>
          </div>
          <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${projectData?.kpis?.fdr?.percentage || 97.3}%`, height: '100%', background: '#2563eb' }}/>
          </div>
          <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.4rem', display: 'block' }}>منفذ فرمة ثانية مع الإسمنت</span>
        </div>

        {/* Card 2: Aggregate Base */}
        <div className="dashboard-white-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>2. الأساس الحبيبي (الشرشور)</span>
            <span className="stock-pill" style={{ fontSize: '0.78rem', color: '#16a34a' }}>{projectData?.kpis?.aggregateBase?.percentage || 95.2}%</span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#16a34a', marginBottom: '0.4rem' }}>
            {(projectData?.kpis?.aggregateBase?.meters || 215483).toLocaleString()} <span style={{ fontSize: '0.85rem' }}>م.ط</span>
          </div>
          <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${projectData?.kpis?.aggregateBase?.percentage || 95.2}%`, height: '100%', background: '#16a34a' }}/>
          </div>
          <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.4rem', display: 'block' }}>توريد من كسارات الموقع</span>
        </div>

        {/* Card 3: MCO */}
        <div className="dashboard-white-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>3. رش التشريب (MCO)</span>
            <span className="stock-pill" style={{ fontSize: '0.78rem', color: '#ea580c' }}>{projectData?.kpis?.mco?.percentage || 94.7}%</span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ea580c', marginBottom: '0.4rem' }}>
            {(projectData?.kpis?.mco?.meters || 214303).toLocaleString()} <span style={{ fontSize: '0.85rem' }}>م.ط</span>
          </div>
          <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${projectData?.kpis?.mco?.percentage || 94.7}%`, height: '100%', background: '#ea580c' }}/>
          </div>
          <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.4rem', display: 'block' }}>تجهيز لفرش الأسفلت</span>
        </div>

        {/* Card 4: Asphalt */}
        <div className="dashboard-white-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>4. الأسفلت المحسن</span>
            <span className="stock-pill" style={{ fontSize: '0.78rem', color: '#7c3aed' }}>{projectData?.kpis?.asphalt?.percentage || 92.8}%</span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#7c3aed', marginBottom: '0.4rem' }}>
            {(projectData?.kpis?.asphalt?.meters || 209923).toLocaleString()} <span style={{ fontSize: '0.85rem' }}>م.ط</span>
          </div>
          <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${projectData?.kpis?.asphalt?.percentage || 92.8}%`, height: '100%', background: '#7c3aed' }}/>
          </div>
          <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.4rem', display: 'block' }}>الطبقة الرابطة والسطحية المكتملة</span>
        </div>
      </div>

      {/* Comprehensive Unified Road Progress Table */}
      <div className="dashboard-white-card" style={{ padding: '1.5rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} color="#2563eb"/>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              الموقف التنفيذي التفصيلي لبنود وأعمال المسار الميدانية
            </h3>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#166534', background: '#dcfce7', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 700 }}>
            طول المسار الكلي: 226.28 كم
          </span>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
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
            {allItems.map((item) => (<tr key={item.id}>
                <td><strong>{item.itemName}</strong></td>
                <td>
                  <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: item.category.includes('أساسية') ? '#eff6ff' : '#f8fafc', color: item.category.includes('أساسية') ? '#2563eb' : '#64748b', fontWeight: 700 }}>
                    {item.category}
                  </span>
                </td>
                <td>
                  {editingId === item.id ? (
                    <input type="number" className="form-input" value={editMeters} onChange={(e) => setEditMeters(parseFloat(e.target.value) || 0)} style={{ width: '90px', height: '32px', padding: '0.2rem' }}/>
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
    </div>);
};

export default RoadProgressView;
