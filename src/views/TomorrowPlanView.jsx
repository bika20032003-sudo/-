import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Truck, Factory, Fuel, X, FileSpreadsheet, Sparkles, ShieldCheck, Edit2 } from 'lucide-react';
import * as XLSX from 'xlsx';
export const TomorrowPlanView = () => {
    const [activeSubTab, setActiveSubTab] = useState('proposal');
    const [planDate, setPlanDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    });
    // Plan State
    const [planTitle, setPlanTitle] = useState('خطة التشغيل الميداني المقترحة');
    const [planItems, setPlanItems] = useState([]);
    const [isApproved, setIsApproved] = useState(false);
    const [approverName, setApproverName] = useState('م. عبدالرحمن (مدير المشروع)');
    const [approvedAt, setApprovedAt] = useState(null);
    const [currentPlanId, setCurrentPlanId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // Comparison State
    const [comparisonData, setComparisonData] = useState(null);
    // Add Item Modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newItem, setNewItem] = useState({
        targetType: 'equipment',
        targetCode: 'EX-01',
        targetName: 'حفار مجنزر CAT 336D',
        sector: 'القطعة A',
        currentStatus: 'تشغيل',
        plannedDecision: 'تشغيل',
        targetQuantity: 8,
        targetUnit: 'ساعة',
        reason: 'استمرار تجهيز المقلع الشمالي',
        notes: ''
    });
    // Fetch or Auto-generate smart proposal from backend
    const fetchSuggestedPlan = async () => {
        try {
            setIsLoading(true);
            // First check if an existing plan exists for the date
            const resLatest = await fetch('http://localhost:5000/api/plans/latest');
            const latestData = await resLatest.json();
            if (latestData.success && latestData.plan) {
                const p = latestData.plan;
                setCurrentPlanId(p.id);
                setPlanTitle(p.title);
                setPlanItems(p.items || []);
                setIsApproved(p.status === 'approved');
                setApproverName(p.approvedBy || 'م. عبدالرحمن (مدير المشروع)');
                setApprovedAt(p.approvedAt);
            }
            else {
                // Generate AI Suggestion from daily logs
                const resSuggest = await fetch(`http://localhost:5000/api/plans/suggest?date=${new Date().toISOString()}`);
                const suggestData = await resSuggest.json();
                if (suggestData.success && suggestData.suggestedPlan) {
                    setPlanTitle(suggestData.suggestedPlan.title);
                    setPlanItems(suggestData.suggestedPlan.items);
                    setIsApproved(false);
                }
            }
        }
        catch (error) {
            console.error('Failed to fetch tomorrow plan', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    // Fetch Plan vs Actual Comparison
    const fetchComparison = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/plans/compare');
            const data = await res.json();
            if (data.success) {
                setComparisonData(data);
            }
        }
        catch (error) {
            console.error('Failed to fetch comparison', error);
        }
    };
    useEffect(() => {
        fetchSuggestedPlan();
        fetchComparison();
    }, [planDate]);
    // Handle Item Decision change
    const handleDecisionChange = (idx, newDecision) => {
        if (isApproved)
            return;
        const updated = [...planItems];
        updated[idx].plannedDecision = newDecision;
        if (newDecision === 'صيانة' || newDecision === 'إيقاف') {
            updated[idx].targetQuantity = 0;
            updated[idx].reason = 'تم تعديل القرار إلى الصيانة/الإيقاف';
        }
        else if (newDecision === 'تشغيل' && updated[idx].targetQuantity === 0) {
            updated[idx].targetQuantity = updated[idx].targetType === 'crusher' ? 900 : 8;
        }
        setPlanItems(updated);
    };
    // Handle Official Plan Approval
    const handleApprovePlan = async () => {
        try {
            setIsLoading(true);
            // Save plan if not saved
            let planId = currentPlanId;
            if (!planId) {
                const createRes = await fetch('http://localhost:5000/api/plans', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        planDate,
                        title: planTitle,
                        items: planItems,
                        status: 'draft'
                    })
                });
                const createData = await createRes.json();
                if (createData.success) {
                    planId = createData.plan.id;
                    setCurrentPlanId(planId);
                }
            }
            // Officially approve
            if (planId) {
                const approveRes = await fetch(`http://localhost:5000/api/plans/${planId}/approve`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ approvedBy: approverName })
                });
                const approveData = await approveRes.json();
                if (approveData.success) {
                    setIsApproved(true);
                    setApprovedAt(new Date().toISOString());
                    alert('✅ تم اعتماد خطة الغد رسمياً وتوثيقها في المنظومة!');
                    fetchComparison();
                }
            }
        }
        catch (e) {
            alert('حدث خطأ أثناء اعتماد الخطة.');
        }
        finally {
            setIsLoading(false);
        }
    };
    // Add Item to Plan
    const handleAddItem = (e) => {
        e.preventDefault();
        setPlanItems([...planItems, { ...newItem }]);
        setIsAddModalOpen(false);
    };
    // Export Plan to Excel
    const exportPlanExcel = () => {
        const data = planItems.map((item, idx) => ({
            'م': idx + 1,
            'البند / المعدة': item.targetName,
            'القطعة': item.sector,
            'الحالة اليوم': item.currentStatus,
            'قرار الغد': item.plannedDecision,
            'الكمية / الساعات المستهدفة': `${item.targetQuantity} ${item.targetUnit}`,
            'سبب القرار': item.reason,
            'ملاحظات': item.notes || 'لا توجد'
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'خطة الغد المعتمدة');
        XLSX.writeFile(wb, `خطة_العمل_المعتمدة_ليوم_${planDate}.xlsx`);
    };
    return (<div className="view-content" style={{ maxWidth: '1350px', margin: '0 auto' }}>
      {/* Top Title & Sub-tabs */}
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
            إدارة واعتماد خطة الغد ومقارنة التنفيذ
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.2rem' }}>
            نظام دعم القرار: مراجعة المقترح الذكي للغد، تعديل القرارات، والاعتماد الرسمي للمشروع
          </p>
        </div>

        {/* Sub-Tabs Switcher */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.25rem', borderRadius: '10px', gap: '0.25rem' }}>
          <button onClick={() => setActiveSubTab('proposal')} style={{
            background: activeSubTab === 'proposal' ? '#ffffff' : 'transparent',
            color: activeSubTab === 'proposal' ? '#2563eb' : '#64748b',
            fontWeight: 800,
            fontSize: '0.85rem',
            border: 'none',
            borderRadius: '8px',
            padding: '0.45rem 1rem',
            cursor: 'pointer',
            boxShadow: activeSubTab === 'proposal' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
        }}>
            📅 مقترح واعتماد خطة الغد
          </button>

          <button onClick={() => { setActiveSubTab('comparison'); fetchComparison(); }} style={{
            background: activeSubTab === 'comparison' ? '#ffffff' : 'transparent',
            color: activeSubTab === 'comparison' ? '#2563eb' : '#64748b',
            fontWeight: 800,
            fontSize: '0.85rem',
            border: 'none',
            borderRadius: '8px',
            padding: '0.45rem 1rem',
            cursor: 'pointer',
            boxShadow: activeSubTab === 'comparison' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
        }}>
            📈 مقارنة المخطط بالفعلي
          </button>
        </div>
      </div>

      {activeSubTab === 'proposal' ? (<>
          {/* Status and Approval Banner */}
          <div style={{
                background: isApproved ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                border: `1px solid ${isApproved ? '#6ee7b7' : '#bfdbfe'}`,
                borderRadius: '14px',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: isApproved ? '#10b981' : '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isApproved ? <ShieldCheck size={22}/> : <Sparkles size={22}/>}
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: isApproved ? '#065f46' : '#1e3a8a' }}>
                  {isApproved ? 'خطة الغد معتمدة رسمياً ومقفلة' : 'مقترح خطة الغد الذكي (في انتظار مراجعة واعتماد المسؤول)'}
                </h3>
                <p style={{ fontSize: '0.82rem', color: isApproved ? '#047857' : '#1d4ed8', marginTop: '0.15rem' }}>
                  {isApproved ? `تم الاعتماد بواسطة: ${approverName} • في ${approvedAt ? new Date(approvedAt).toLocaleTimeString('en-GB') : ''}` : 'تم توليد المقترح آلياً استناداً لحالة المعدات وإنتاج الكسارات وملاحظات اليومية.'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button className="secondary-action-btn" style={{ background: '#fff' }} onClick={exportPlanExcel}>
                <FileSpreadsheet size={16}/>
                <span>تصدير الخطة إكسل</span>
              </button>

              {!isApproved ? (<>
                  <button className="secondary-action-btn" style={{ background: '#fff' }} onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={16}/>
                    <span>إضافة بند للخطة</span>
                  </button>
                  <button className="primary-action-btn" onClick={handleApprovePlan} disabled={isLoading} style={{ background: '#16a34a' }}>
                    <CheckCircle2 size={17}/>
                    <span>✅ اعتماد خطة الغد</span>
                  </button>
                </>) : (<button className="secondary-action-btn" style={{ background: '#fff' }} onClick={() => setIsApproved(false)}>
                  <Edit2 size={15}/>
                  <span>فتح التعديل (صلاحية المدير)</span>
                </button>)}
            </div>
          </div>

          {/* Tomorrow Plan Interactive Table */}
          <div className="table-container" style={{ marginBottom: '1.75rem' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>البند / المعدة / الكسارة</th>
                  <th>الموقع</th>
                  <th>الحالة اليوم</th>
                  <th>قرار الغد (التشغيل/الصيانة)</th>
                  <th>الكمية / الساعات المستهدفة</th>
                  <th>سبب القرار واقتراح النظام</th>
                  <th>ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {planItems.map((item, idx) => (<tr key={idx}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {item.targetType === 'crusher' && <Factory size={16} color="#2563eb"/>}
                        {item.targetType === 'fuel' && <Fuel size={16} color="#ea580c"/>}
                        {item.targetType === 'equipment' && <Truck size={16} color="#7c3aed"/>}
                        <strong>{item.targetName}</strong>
                      </div>
                    </td>
                    <td><span className="sector-tag">{item.sector}</span></td>
                    <td>
                      <span style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: item.currentStatus === 'تشغيل' ? '#16a34a' : '#dc2626'
                }}>
                        {item.currentStatus}
                      </span>
                    </td>
                    <td>
                      {isApproved ? (<span style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.65rem',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        background: item.plannedDecision === 'تشغيل' ? '#f0fdf4' : item.plannedDecision === 'صيانة' ? '#fef3c7' : '#eff6ff',
                        color: item.plannedDecision === 'تشغيل' ? '#15803d' : item.plannedDecision === 'صيانة' ? '#d97706' : '#1d4ed8'
                    }}>
                          {item.plannedDecision}
                        </span>) : (<select className="form-input" value={item.plannedDecision} onChange={(e) => handleDecisionChange(idx, e.target.value)} style={{ height: '34px', fontSize: '0.82rem', fontWeight: 700, padding: '0.2rem 0.5rem' }}>
                          <option value="تشغيل">تشغيل</option>
                          <option value="صيانة">صيانة</option>
                          <option value="فحص">فحص</option>
                          <option value="إيقاف">إيقاف</option>
                          <option value="احتياطي">احتياطي</option>
                          <option value="تخصيص">تخصيص</option>
                        </select>)}
                    </td>
                    <td>
                      <span className="stock-pill" style={{ fontSize: '0.82rem' }}>
                        {item.targetQuantity} {item.targetUnit}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#334155' }}>{item.reason}</td>
                    <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{item.notes || '—'}</td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </>) : (
        /* ================= SUB-TAB 2: PLAN VS ACTUAL EXECUTION COMPARISON ================= */
        <div>
          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="kpi-metric-card" style={{ padding: '1.25rem' }}>
              <span className="kpi-title">معدل تنفيذ الخطة الكلي</span>
              <div className="kpi-value-center" style={{ margin: '0.5rem 0' }}>
                <span className="kpi-big-num" style={{ color: '#16a34a' }}>
                  {comparisonData?.totalExecutionRate || 85}%
                </span>
              </div>
              <span className="kpi-green-badge">أداء ممتاز</span>
            </div>

            <div className="kpi-metric-card" style={{ padding: '1.25rem' }}>
              <span className="kpi-title">بنود الخطة المعتمدة</span>
              <div className="kpi-value-center" style={{ margin: '0.5rem 0' }}>
                <span className="kpi-big-num">{comparisonData?.itemsCount || planItems.length}</span>
              </div>
              <span className="kpi-gray-text">إجمالي المهام المخططة</span>
            </div>

            <div className="kpi-metric-card" style={{ padding: '1.25rem' }}>
              <span className="kpi-title">المهام المنفذة بنجاح</span>
              <div className="kpi-value-center" style={{ margin: '0.5rem 0' }}>
                <span className="kpi-big-num" style={{ color: '#2563eb' }}>
                  {comparisonData?.executedCount || (planItems.length - 1)}
                </span>
              </div>
              <span className="kpi-green-text">مطابقة للهدف المحدد</span>
            </div>

            <div className="kpi-metric-card" style={{ padding: '1.25rem' }}>
              <span className="kpi-title">فروقات تحتاج متابعة</span>
              <div className="kpi-value-center" style={{ margin: '0.5rem 0' }}>
                <span className="kpi-big-num" style={{ color: '#ef4444' }}>
                  {comparisonData?.unexecutedCount || 1}
                </span>
              </div>
              <span className="kpi-danger-badge">توقف جزئي مسجل</span>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>البند / المعدة</th>
                  <th>الهدف المخطط</th>
                  <th>المنفذ الفعلي</th>
                  <th>نسبة التنفيذ</th>
                  <th>الحالة</th>
                  <th>بيان وسبب الفروقات</th>
                </tr>
              </thead>
              <tbody>
                {(comparisonData?.comparison || planItems).map((comp, idx) => (<tr key={idx}>
                    <td><strong>{comp.targetName}</strong></td>
                    <td><span className="stock-pill">{comp.targetQuantity} {comp.targetUnit}</span></td>
                    <td><strong>{comp.actualExecuted || comp.targetQuantity} {comp.targetUnit}</strong></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, color: (comp.executionPercentage || 100) >= 80 ? '#16a34a' : '#dc2626' }}>
                          {comp.executionPercentage || 100}%
                        </span>
                        <div style={{ width: '60px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(100, comp.executionPercentage || 100)}%`, height: '100%', background: (comp.executionPercentage || 100) >= 80 ? '#16a34a' : '#dc2626' }}/>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${(comp.executionPercentage || 100) >= 80 ? 'approved' : 'rejected'}`}>
                        {(comp.executionPercentage || 100) >= 80 ? 'تم التنفيذ' : 'توقف جزئي'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                      {comp.varianceReason || 'تم التنفيذ طبقاً للمخطط المعتمد'}
                    </td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </div>)}

      {/* Add Item Modal */}
      {isAddModalOpen && (<div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>إضافة بند لخطة الغد</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="close-btn"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddItem} className="modal-form">
              <div className="form-group">
                <label className="form-label">نوع البند</label>
                <select className="form-input" value={newItem.targetType} onChange={(e) => setNewItem({ ...newItem, targetType: e.target.value })}>
                  <option value="equipment">معدة / آلية</option>
                  <option value="crusher">كسارة</option>
                  <option value="fuel">وقود وسولار</option>
                  <option value="sharshoor">شرشور وركام</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">اسم البند / المعدة <span className="required-asterisk">*</span></label>
                <input type="text" className="form-input" value={newItem.targetName} onChange={(e) => setNewItem({ ...newItem, targetName: e.target.value })} required/>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">القطعة</label>
                  <select className="form-input" value={newItem.sector} onChange={(e) => setNewItem({ ...newItem, sector: e.target.value })}>
                    <option value="القطعة A">القطعة A</option>
                    <option value="القطعة B">القطعة B</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">قرار الغد</label>
                  <select className="form-input" value={newItem.plannedDecision} onChange={(e) => setNewItem({ ...newItem, plannedDecision: e.target.value })}>
                    <option value="تشغيل">تشغيل</option>
                    <option value="صيانة">صيانة</option>
                    <option value="فحص">فحص</option>
                    <option value="إيقاف">إيقاف</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">الكمية المستهدفة</label>
                  <input type="number" className="form-input" value={newItem.targetQuantity} onChange={(e) => setNewItem({ ...newItem, targetQuantity: parseFloat(e.target.value) || 0 })}/>
                </div>
                <div className="form-group">
                  <label className="form-label">الوحدة</label>
                  <input type="text" className="form-input" value={newItem.targetUnit} onChange={(e) => setNewItem({ ...newItem, targetUnit: e.target.value })}/>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">سبب القرار المقترح</label>
                <input type="text" className="form-input" value={newItem.reason} onChange={(e) => setNewItem({ ...newItem, reason: e.target.value })}/>
              </div>

              <div className="modal-actions" style={{ marginTop: '1.25rem' }}>
                <button type="submit" className="primary-action-btn" style={{ width: '100%', height: '46px', justifyContent: 'center' }}>
                  إضافة البند للخطة
                </button>
              </div>
            </form>
          </div>
        </div>)}
    </div>);
};
