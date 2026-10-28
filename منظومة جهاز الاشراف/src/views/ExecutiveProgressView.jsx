import React, { useState, useEffect } from 'react';
import { 
  Award, TrendingUp, BarChart3, Layers, FileSpreadsheet, Printer, 
  Save, DollarSign, Calendar, Milestone, CheckCircle2, ShieldCheck, 
  Edit3, ArrowUpRight, PieChart, Sparkles, RefreshCw, FileText
} from 'lucide-react';
import { ExecutiveProgressForm, initialExecutiveData } from '../components/ExecutiveProgressForm';
import { OfficialPrintModal } from '../components/OfficialPrintModal';
import { fastFetch } from '../utils/apiCache.js';

export const ExecutiveProgressView = ({ currentUser, onNavigateTab, onPrintReport }) => {
  const [activeSubTab, setActiveSubTab] = useState('form'); // 'form' | 'dashboard'
  const [executiveData, setExecutiveData] = useState(initialExecutiveData);
  const [loading, setLoading] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fastFetch('http://localhost:5000/api/executive-progress');
        if (res && res.success && res.data && isMounted) {
          setExecutiveData(res.data);
        }
      } catch (err) {
        console.warn('Could not fetch executive progress data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Format currency
  const fmt = (num) => {
    if (num === null || num === undefined || num === '') return '-';
    const val = Number(num);
    if (isNaN(val)) return num;
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
  };

  // Financial summary
  const contractVal = Number(executiveData.contractValue) || 897665675.03;
  
  const basicExecutedSum = (executiveData.basicItems || []).reduce((acc, it) => acc + (Number(it.executedValue) || 0), 0);
  const additionalExecutedSum = (executiveData.additionalItems || []).reduce((acc, it) => acc + (Number(it.executedValue) || 0), 0);
  const totalExecutedVal = basicExecutedSum + additionalExecutedSum;
  const totalRemainingVal = Math.max(0, contractVal - totalExecutedVal);
  const overallFinancialPercent = contractVal > 0 ? ((totalExecutedVal / contractVal) * 100).toFixed(2) : 0;
  const basicFinancialPercent = contractVal > 0 ? ((basicExecutedSum / contractVal) * 100).toFixed(2) : 0;

  const getExecutiveReportData = () => ({
    isExecutiveProgressReport: true,
    reportType: 'الموقف التنفيذي',
    reportCategory: 'executive',
    projectName: executiveData.projectName,
    reportTitle: executiveData.reportTitle,
    contractValue: contractVal,
    currency: executiveData.currency || 'دينار',
    reportDate: executiveData.reportDate,
    reportNumber: executiveData.reportNumber,
    basicItems: executiveData.basicItems,
    additionalItems: executiveData.additionalItems,
    calculations: {
      contractVal,
      basicExecutedSum,
      additionalExecutedSum,
      grandExecutedSum: totalExecutedVal,
      grandRemainingVal: totalRemainingVal,
      overallFinancialPercentage: overallFinancialPercent,
      basicPercentage: basicFinancialPercent
    },
    signatories: executiveData.signatories || initialExecutiveData.signatories
  });

  const handleTriggerPrint = () => {
    const reportData = getExecutiveReportData();
    if (onPrintReport) {
      onPrintReport(reportData);
    } else {
      setShowPrintModal(true);
    }
  };

  return (
    <div style={{ padding: '1.25rem', maxWidth: '1440px', margin: '0 auto', direction: 'rtl', minHeight: '85vh' }}>
      
      {/* Top Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%)',
        borderRadius: '16px',
        padding: '1.5rem 1.75rem',
        color: '#ffffff',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.25)',
        marginBottom: '1.5rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #2563eb 0%, #0284c7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
            color: '#ffffff'
          }}>
            <Award size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, color: '#ffffff' }}>
                الموقف التنفيذي (الفني والمالي)
              </h1>
              <span style={{
                background: 'rgba(56, 189, 248, 0.2)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                fontSize: '0.78rem',
                fontWeight: 800,
                padding: '0.2rem 0.65rem',
                borderRadius: '20px'
              }}>
                وثيقة معتمدة ومحدثة
              </span>
            </div>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: '#cbd5e1' }}>
              {executiveData.projectName || 'مشروع صيانة طريق اوباري غات بطول 360 كيلومتر'} | قيمة العقد: <strong>{fmt(contractVal)} د.ل</strong>
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveSubTab('form')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.65rem 1.15rem',
              borderRadius: '10px',
              border: 'none',
              background: activeSubTab === 'form' ? '#0284c7' : 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.86rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeSubTab === 'form' ? '0 4px 12px rgba(2, 132, 199, 0.4)' : 'none'
            }}
          >
            <Edit3 size={16} />
            <span>استمارة التعديل والحفظ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.65rem 1.15rem',
              borderRadius: '10px',
              border: 'none',
              background: activeSubTab === 'dashboard' ? '#0284c7' : 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.86rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeSubTab === 'dashboard' ? '0 4px 12px rgba(2, 132, 199, 0.4)' : 'none'
            }}
          >
            <BarChart3 size={16} />
            <span>لوحة المؤشرات والتحليل</span>
          </button>

          <button
            type="button"
            onClick={handleTriggerPrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.65rem 1.2rem',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.86rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
            }}
            title="معاينة وطباعة تقرير الموقف التنفيذي الرسمي المعتمد"
          >
            <Printer size={16} />
            <span>طباعة الموقف التنفيذي (PDF)</span>
          </button>

          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('create-report')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                background: 'transparent',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer'
              }}
            >
              <FileText size={16} />
              <span>قسم إنشاء التقارير</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {/* Card 1 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '1.15rem 1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: '#eff6ff',
            color: '#1d4ed8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>قيمة العقد الكلية</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', direction: 'ltr', textAlign: 'right' }}>
              {fmt(contractVal)} <span style={{ fontSize: '0.78rem', color: '#64748b' }}>د.ل</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '1.15rem 1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: '#f0fdf4',
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>إجمالي المنفذ (أساسية + إضافية)</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#16a34a', direction: 'ltr', textAlign: 'right' }}>
              {fmt(totalExecutedVal)} <span style={{ fontSize: '0.78rem', color: '#64748b' }}>د.ل</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '1.15rem 1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: '#fef3c7',
            color: '#d97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>نسبة الإنجاز المالي الإجمالي</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#b45309' }}>
              %{overallFinancialPercent}
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '1.15rem 1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: '#f8fafc',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Milestone size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>المتبقي المالي للعقد</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#475569', direction: 'ltr', textAlign: 'right' }}>
              {fmt(totalRemainingVal)} <span style={{ fontSize: '0.78rem', color: '#64748b' }}>د.ل</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeSubTab === 'form' ? (
        <ExecutiveProgressForm 
          currentUser={currentUser} 
          onNavigateTab={onNavigateTab} 
          onPrintReport={onPrintReport}
          onDataChange={(updated) => setExecutiveData(updated)}
        />
      ) : (
        /* Analytics & Breakdown Dashboard */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Section Breakdown Grid */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                مقارنة نسب الإنجاز حسب الأقسام المعتمدة في الموقف التنفيذي
              </h2>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                طريق أوباري غات (360 كم)
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {/* Study & Design */}
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '0.92rem', color: '#1e293b' }}>أولاً: الدراسة والتصميم</strong>
                  <span style={{ fontWeight: 800, color: '#0284c7', fontSize: '0.92rem' }}>87.50%</span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                  <div style={{ width: '87.5%', height: '100%', background: '#0284c7', borderRadius: '4px' }}></div>
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                  المنفذ: 0.875 مقطوعية | القيمة: 15,401,126.78 د.ل
                </p>
              </div>

              {/* Asphalt Works */}
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '0.92rem', color: '#1e293b' }}>ثانياً: أعمال الرصف (FDR, MC0, اسفلت 6سم)</strong>
                  <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '0.92rem' }}>70.4%</span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                  <div style={{ width: '70.4%', height: '100%', background: '#16a34a', borderRadius: '4px' }}></div>
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                  إجمالي قيمة الرصف المنفذة: 501,935,471.45 د.ل
                </p>
              </div>

              {/* Road Markings & Paint */}
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '0.92rem', color: '#1e293b' }}>رابعاً: أعمال الطلاء وجلاء الطريق</strong>
                  <span style={{ fontWeight: 800, color: '#d97706', fontSize: '0.92rem' }}>53.2%</span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                  <div style={{ width: '53.2%', height: '100%', background: '#d97706', borderRadius: '4px' }}></div>
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                  قيمة المنفذ: 13,909,579.12 د.ل من أعمال الجلاء والخطوط
                </p>
              </div>

              {/* Additional Items */}
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '0.92rem', color: '#1e293b' }}>البنود الإضافية (أساس حبيبي وطريق خدمي)</strong>
                  <span style={{ fontWeight: 800, color: '#8b5cf6', fontSize: '0.92rem' }}>منفذة</span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                  <div style={{ width: '100%', height: '100%', background: '#8b5cf6', borderRadius: '4px' }}></div>
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                  قيمة المنفذ: 93,573,854.26 د.ل (207,597 م3 أساس حبيبي + 225.6 كم خدمي)
                </p>
              </div>
            </div>
          </div>

          {/* Quick Edit CTA Card */}
          <div style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '1px solid #bfdbfe',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e3a8a' }}>
                هل ترغب في تحديث كميات أو قيم البنود المنفذة؟
              </h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#1e40af' }}>
                يمكنك التعديل المباشر على جميع البنود الأساسية والإضافية وحفظها فوراً في قاعدة بيانات المنظومة وتصديرها.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSubTab('form')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
            >
              <Edit3 size={18} />
              <span>فتح استمارة التعديل الآن</span>
            </button>
          </div>
        </div>
      )}

      {/* Official Print Modal (Direct trigger from Dashboard View) */}
      {showPrintModal && (
        <OfficialPrintModal
          report={getExecutiveReportData()}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
};

export default ExecutiveProgressView;
