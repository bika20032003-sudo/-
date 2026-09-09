import React, { useState, useEffect } from 'react';
import { RefreshCw, Fuel, Factory, Mountain, Truck, AlertTriangle, CheckCircle2, Calendar } from 'lucide-react';
export const DailyAnalysisView = ({ onNavigateTab }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSector, setSelectedSector] = useState('all');
    const [analysisData, setAnalysisData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const fetchAnalysis = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`http://localhost:5000/api/analysis/daily?date=${selectedDate}&sector=${selectedSector}`);
            const data = await res.json();
            if (data.success) {
                setAnalysisData(data);
            }
        }
        catch (error) {
            console.error('Failed to fetch daily analysis', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchAnalysis();
    }, [selectedDate, selectedSector]);
    const handleResolveIssue = async (id) => {
        try {
            await fetch(`http://localhost:5000/api/analysis/issues/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'resolved' })
            });
            fetchAnalysis();
        }
        catch (e) {
            console.error('Error resolving issue', e);
        }
    };
    return (<div className="view-content" style={{ maxWidth: '1350px', margin: '0 auto' }}>
      {/* Top Filter & Actions Header */}
      <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '1.1rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
        }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            تحليل اليومية والأداء التشغيلي الميداني
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.2rem' }}>
            مقارنة المؤشرات مع آخر 7 أيام، رصد الانحرافات، وتصنيف المشاكل لدعم قرار خطة الغد
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input type="date" className="form-input" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ width: '150px', height: '38px', fontSize: '0.85rem' }}/>

          <select className="filter-select" value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)} style={{ height: '38px', fontSize: '0.85rem' }}>
            <option value="all">كافة القطاعات (الإجمالي)</option>
            <option value="A">القطعة A (المقلع الشمالي)</option>
            <option value="B">القطعة B (المقلع الأوسط)</option>
          </select>

          <button className="secondary-action-btn" onClick={fetchAnalysis} disabled={isLoading} style={{ height: '38px' }}>
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''}/>
            <span>تحديث</span>
          </button>

          {onNavigateTab && (<button className="primary-action-btn" onClick={() => onNavigateTab('tomorrow-plan')} style={{ height: '38px', padding: '0 1.25rem' }}>
              <Calendar size={16}/>
              <span>إعداد خطة الغد</span>
            </button>)}
        </div>
      </div>

      {/* Smart Warning Alerts Row */}
      {analysisData?.warnings && analysisData.warnings.length > 0 && (<div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {analysisData.warnings.map((w, idx) => (<div key={idx} style={{
                    background: w.type === 'danger' ? '#fef2f2' : '#fffbeb',
                    border: `1px solid ${w.type === 'danger' ? '#fecaca' : '#fde68a'}`,
                    borderRadius: '12px',
                    padding: '0.85rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <AlertTriangle size={20} color={w.type === 'danger' ? '#dc2626' : '#d97706'}/>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: w.type === 'danger' ? '#991b1b' : '#92400e' }}>
                    {w.title}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: w.type === 'danger' ? '#b91c1c' : '#b45309', marginTop: '0.1rem' }}>
                    {w.message}
                  </p>
                </div>
              </div>

              <span style={{ fontSize: '0.78rem', background: '#fff', padding: '0.3rem 0.65rem', borderRadius: '6px', fontWeight: 700, color: '#475569', border: '1px solid rgba(0,0,0,0.06)' }}>
                الإجراء: {w.suggestedAction}
              </span>
            </div>))}
        </div>)}

      {/* 4 Analytics Domain Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.75rem' }}>
        {/* 1. الوضع التشغيلي */}
        <div className="dashboard-white-card" style={{ padding: '1.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>1. الوضع التشغيلي</span>
            <div className="kpi-icon-circle purple" style={{ width: '32px', height: '32px', background: '#f5f3ff', color: '#7c3aed' }}>
              <Truck size={17}/>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>المعدات العاملة:</span>
            <strong style={{ color: '#16a34a' }}>{analysisData?.operational?.workingEquipment || 0} معدة</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>المعدات المتوقفة:</span>
            <strong style={{ color: '#ef4444' }}>{analysisData?.operational?.stoppedEquipment || 0} معدة</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>ساعات التشغيل:</span>
            <strong>{analysisData?.operational?.totalOperatingHours || 0} ساعة</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>نسبة الجاهزية:</span>
            <span className="kpi-green-badge">{analysisData?.operational?.readinessRate || 0}%</span>
          </div>
        </div>

        {/* 2. الوقود والسولار */}
        <div className="dashboard-white-card" style={{ padding: '1.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>2. الوقود والسولار</span>
            <div className="kpi-icon-circle orange" style={{ width: '32px', height: '32px' }}>
              <Fuel size={17}/>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>المنصرف اليوم:</span>
            <strong style={{ color: '#ea580c' }}>{(analysisData?.fuel?.dispensedToday || 0).toLocaleString()} لتر</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>متوسط 7 أيام:</span>
            <strong>{(analysisData?.fuel?.avg7Days || 0).toLocaleString()} لتر</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>فارق الاستهلاك:</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: (analysisData?.fuel?.variancePercentage || 0) > 0 ? '#ea580c' : '#16a34a' }}>
              {(analysisData?.fuel?.variancePercentage || 0) > 0 ? `+${analysisData?.fuel?.variancePercentage}%` : `${analysisData?.fuel?.variancePercentage}%`}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>الرصيد المتاح:</span>
            <strong>{(analysisData?.fuel?.fuelBalance || 0).toLocaleString()} لتر</strong>
          </div>
        </div>

        {/* 3. الكسارات والإنتاج */}
        <div className="dashboard-white-card" style={{ padding: '1.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>3. الكسارات والإنتاج</span>
            <div className="kpi-icon-circle blue" style={{ width: '32px', height: '32px' }}>
              <Factory size={17}/>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>إنتاج اليوم:</span>
            <strong style={{ color: '#2563eb' }}>{(analysisData?.crushers?.productionToday || 0).toLocaleString()} طن</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>متوسط 7 أيام:</span>
            <strong>{(analysisData?.crushers?.avg7Days || 0).toLocaleString()} طن</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>معدل الإنتاجية:</span>
            <strong>{analysisData?.crushers?.productivityPerHour || 0} طن / ساعة</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>ساعات العمل:</span>
            <strong>{analysisData?.crushers?.operatingHours || 0} ساعة</strong>
          </div>
        </div>

        {/* 4. الشرشور والركام */}
        <div className="dashboard-white-card" style={{ padding: '1.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>4. الشرشور والركام</span>
            <div className="kpi-icon-circle green" style={{ width: '32px', height: '32px' }}>
              <Mountain size={17}/>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>الناتج اليومي (60%):</span>
            <strong style={{ color: '#16a34a' }}>{(analysisData?.sharshoor?.producedToday || 0).toLocaleString()} طن</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>المنصرف للموقع:</span>
            <strong>{(analysisData?.sharshoor?.dispatchedToday || 0).toLocaleString()} طن</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>الرصيد بالموقع:</span>
            <strong>{(analysisData?.sharshoor?.currentBalance || 0).toLocaleString()} طن</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>حالة المخزون:</span>
            <span className="kpi-green-badge">مستقر</span>
          </div>
        </div>
      </div>

      {/* Classified Issues and Stoppages Table */}
      <div className="dashboard-white-card" style={{ padding: '1.5rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
              سجل تصنيف المشاكل والأعطال المستخرجة
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>
              المشاكل التشغيلية المستخلصة آلياً من ملاحظات التقارير الميدانية
            </p>
          </div>
        </div>

        {analysisData?.issues && analysisData.issues.length > 0 ? (<table className="custom-table">
            <thead>
              <tr>
                <th>التاريخ والقطعة</th>
                <th>التصنيف</th>
                <th>عنوان المشكلة</th>
                <th>تفاصيل البيان</th>
                <th>الإجراء المقترح لخطة الغد</th>
                <th>الحالة</th>
                <th>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {analysisData.issues.map((iss) => (<tr key={iss.id}>
                  <td>
                    <div>{iss.date?.split('T')[0]}</div>
                    <span className="sector-tag" style={{ fontSize: '0.72rem' }}>{iss.sector}</span>
                  </td>
                  <td>
                    <span style={{
                    padding: '0.2rem 0.55rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    background: iss.category === 'عطل' ? '#fee2e2' : iss.category === 'صيانة' ? '#fef3c7' : '#eff6ff',
                    color: iss.category === 'عطل' ? '#dc2626' : iss.category === 'صيانة' ? '#d97706' : '#2563eb'
                }}>
                      {iss.category}
                    </span>
                  </td>
                  <td><strong>{iss.title}</strong></td>
                  <td style={{ fontSize: '0.82rem', color: '#475569' }}>{iss.description}</td>
                  <td style={{ fontSize: '0.82rem', color: '#047857', fontWeight: 600 }}>{iss.suggestedAction || 'مراجعة وتضمين في خطة الغد'}</td>
                  <td>
                    <span className={`status-pill ${iss.status === 'resolved' ? 'approved' : 'pending'}`}>
                      {iss.status === 'resolved' ? 'تمت المعالجة' : 'مفتوحة'}
                    </span>
                  </td>
                  <td>
                    {iss.status !== 'resolved' && (<button onClick={() => handleResolveIssue(iss.id)} style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>
                        إغلاق المشكلة
                      </button>)}
                  </td>
                </tr>))}
            </tbody>
          </table>) : (<div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
            <CheckCircle2 size={36} color="#16a34a" style={{ margin: '0 auto 0.4rem', opacity: 0.5 }}/>
            <p style={{ fontSize: '0.85rem' }}>كافة العمليات منتظمة ولا توجد أعطال أو مشاكل مسجلة لليومية المحددة.</p>
          </div>)}
      </div>
    </div>);
};
