import { isDevUser } from '../utils/permissionUtils';
import React, { useState, useEffect } from 'react';
import { 
  Target, Plus, Search, FileSpreadsheet, 
  Printer, Eye, Trash2, Calendar, Milestone, Truck, 
  Layers, CheckCircle2, AlertCircle, FileText, Send, Clock, Edit3,
  RefreshCw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { fastFetch, clearApiCache } from '../utils/apiCache.js';
import { CreateTargetedWorksReportModal, defaultApprovedTargetedWorksReport } from '../components/CreateTargetedWorksReportModal';
import { OfficialPrintModal } from '../components/OfficialPrintModal';
import { deleteReportFromIndexedDB } from '../utils/secureDatabase.js';

export const TargetedWorksView = ({ currentUser, onNavigateTab }) => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [selectedReportForPrint, setSelectedReportForPrint] = useState(null);
  const [viewDetailsReport, setViewDetailsReport] = useState(null);
  const [reportToDelete, setReportToDelete] = useState(null);

  const fetchTargetedReports = async () => {
    try {
      setIsLoading(true);

      // Read deleted IDs to completely exclude purged reports from appearing or re-seeding
      let deletedIds = [];
      try {
        deletedIds = JSON.parse(localStorage.getItem('deleted_report_ids') || '[]').map(String);
      } catch (e) {}

      let remoteReports = [];
      try {
        const data = await fastFetch('/api/reports');
        remoteReports = data?.reports || (Array.isArray(data) ? data : []);
      } catch (e) {}

      let localReports = [];
      try {
        localReports = JSON.parse(localStorage.getItem('local_reports') || '[]');
      } catch (e) {}

      const all = [...remoteReports, ...localReports];
      const uniqueMap = new Map();
      all.forEach(r => {
        if (r && r.id) {
          const rId = String(r.id);
          const rNum = String(r.reportNumber || '');
          if (deletedIds.includes(rId) || (rNum && deletedIds.includes(rNum))) {
            return; // Skip explicitly deleted
          }
          if (!uniqueMap.has(rId)) {
            uniqueMap.set(rId, r);
          }
        }
      });
      const uniqueList = Array.from(uniqueMap.values());

      // Only seed defaultApprovedTargetedWorksReport if not deleted and no targeted reports exist
      const defaultId = String(defaultApprovedTargetedWorksReport.id);
      const defaultNum = String(defaultApprovedTargetedWorksReport.reportNumber);
      const isDefaultDeleted = deletedIds.includes(defaultId) || deletedIds.includes(defaultNum);

      const hasApproved = uniqueList.some(r => 
        String(r.reportNumber) === defaultNum || String(r.id) === defaultId
      );

      if (!hasApproved && !isDefaultDeleted && uniqueList.length === 0) {
        uniqueList.unshift(defaultApprovedTargetedWorksReport);
        try {
          const local = JSON.parse(localStorage.getItem('local_reports') || '[]');
          const exists = local.some(r => String(r.reportNumber) === defaultNum || String(r.id) === defaultId);
          if (!exists) {
            local.unshift(defaultApprovedTargetedWorksReport);
            localStorage.setItem('local_reports', JSON.stringify(local));
          }
        } catch (e) {}
      }

      const targeted = uniqueList.filter(r => 
        r.isTargetedWorksReport || 
        r.reportType === 'تقرير الأعمال المستهدفة' ||
        r.reportType === 'بيان الأعمال المستهدفة' ||
        (Array.isArray(r.targetedSections) && r.targetedSections.length > 0)
      );
      targeted.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
      setReports(targeted);
    } catch (err) {
      console.error('Failed to fetch targeted reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTargetedReports();

    const handleUpdate = () => fetchTargetedReports();
    window.addEventListener('report-saved', handleUpdate);
    window.addEventListener('report-updated', handleUpdate);
    window.addEventListener('report-deleted', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    const interval = setInterval(handleUpdate, 8000);
    return () => {
      window.removeEventListener('report-saved', handleUpdate);
      window.removeEventListener('report-updated', handleUpdate);
      window.removeEventListener('report-deleted', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const handleDeleteReport = async () => {
    if (!reportToDelete) return;
    const targetId = String(reportToDelete.id || '');
    const targetNum = String(reportToDelete.reportNumber || '');

    // 1. Immediately update local UI state
    setReports(prev => prev.filter(r => {
      const rId = String(r.id || '');
      const rNum = String(r.reportNumber || '');
      if (targetId && rId === targetId) return false;
      if (targetNum && rNum === targetNum) return false;
      if (targetNum && rId === targetNum) return false;
      if (targetId && rNum === targetId) return false;
      return true;
    }));
    setReportToDelete(null);

    // 2. Add to deleted_report_ids in localStorage to permanently prevent re-seeding or re-fetching
    try {
      const deleted = JSON.parse(localStorage.getItem('deleted_report_ids') || '[]');
      if (targetId && !deleted.includes(targetId)) deleted.push(targetId);
      if (targetNum && !deleted.includes(targetNum)) deleted.push(targetNum);
      localStorage.setItem('deleted_report_ids', JSON.stringify(deleted));
    } catch (delErr) {
      console.error('Error recording deleted_report_ids:', delErr);
    }

    // 3. Remove completely from local_reports in localStorage
    try {
      const local = JSON.parse(localStorage.getItem('local_reports') || '[]');
      const updatedLocal = local.filter(r => {
        const rId = String(r.id || '');
        const rNum = String(r.reportNumber || '');
        if (targetId && rId === targetId) return false;
        if (targetNum && rNum === targetNum) return false;
        if (targetNum && rId === targetNum) return false;
        if (targetId && rNum === targetId) return false;
        return true;
      });
      localStorage.setItem('local_reports', JSON.stringify(updatedLocal));
    } catch (storageErr) {
      console.error('Error removing from local_reports:', storageErr);
    }

    // 4. Physically purge from IndexedDB
    try {
      if (targetId) await deleteReportFromIndexedDB(targetId);
      if (targetNum) await deleteReportFromIndexedDB(targetNum);
    } catch (idbErr) {
      console.error('IndexedDB delete error:', idbErr);
    }

    // 5. Invalidate API cache
    try {
      clearApiCache();
    } catch (e) {}

    // 6. Purge from backend if reachable
    try {
      if (targetId) {
        await fetch(`/api/reports/${targetId}`, { method: 'DELETE' }).catch(() => {});
        await fetch(`/api/reports/${targetId}`, { method: 'DELETE' }).catch(() => {});
      }
    } catch (fetchErr) {}

    // 7. Broadcast global event so other tabs and archives react immediately
    window.dispatchEvent(new CustomEvent('report-deleted', { detail: { id: targetId, reportNumber: targetNum } }));
  };

  const filteredReports = reports.filter(r => {
    if (sectorFilter !== 'all' && r.sector !== sectorFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const combined = `${r.reportNumber || ''} ${r.title || ''} ${r.uploadedBy || ''} ${r.sector || ''} ${r.sectorDirector || ''}`.toLowerCase();
      if (!combined.includes(q)) return false;
    }
    return true;
  });

  // Totals across all filtered targeted reports
  // تم إلغاء حساب إجمالي الأطوال لتعارض الجمع الهندسي بين الطبقات المستهدفة
  const totalEquipmentCount = filteredReports.reduce((sum, r) => sum + (Number(r.totalTargetEquipment) || 0), 0);

  // Export all targeted works summary to Excel
  const handleExportSummaryExcel = () => {
    const data = filteredReports.map((r, idx) => ({
      'م': idx + 1,
      'رقم البيان': r.reportNumber || `#TARGET-${r.id}`,
      'العنوان / اليوم': r.title || `بيان أعمال يوم ${r.dayName || ''}`,
      'التاريخ': r.dateFormatted || (r.date ? r.date.split('T')[0] : ''),
      'القطاع الميداني': r.sector || '',
      'حالة القياس': 'كل بند يُقاس على حدة طبقاً للمواصفات',
      'إجمالي المعدات والأطقم': Number(r.totalTargetEquipment || 0),
      'مدير القطاع': r.sectorDirector || r.uploadedBy || '',
      'ممثل الجهة المالكة': r.ownerRepresentative || '',
      'الحالة': r.status === 'approved' ? 'معتمد' : 'قيد المراجعة'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'سجل الأعمال المستهدفة');
    XLSX.writeFile(wb, 'سجل_الأعمال_المستهدفة_اليومية.xlsx');
  };

  return (
    <div className="view-content" style={{ direction: 'rtl', padding: '1rem' }}>
      
      {/* Top Action Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem',
        background: '#ffffff',
        padding: '1.25rem 1.5rem',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)'
          }}>
            <Target size={26} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>
              إدارة ومتابعة الأعمال المستهدفة
            </h1>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.84rem', color: '#64748b' }}>
              بيان خطط الإنجاز اليومية، محطات الرصف، المعدات والأعداد المطلوبة لفرق FDR، طبقة الأساس، والاسفلت
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* THE NEW BUTTON: إنشاء تقرير الأعمال المستهدفة */}
          <button
            type="button"
            id="create-targeted-report-btn"
            onClick={() => {
              setEditingReport(null);
              setIsCreateModalOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.7rem 1.35rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)'
            }}
          >
            <Plus size={18} />
            <span>إنشاء تقرير الأعمال المستهدفة</span>
          </button>

          <button
            type="button"
            onClick={handleExportSummaryExcel}
            className="secondary-action-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', height: '42px', padding: '0 1.1rem', borderRadius: '8px', fontWeight: 800 }}
          >
            <FileSpreadsheet size={17} color="#16a34a" />
            <span>تصدير Excel</span>
          </button>

          
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div className="kpi-metric-card" style={{ borderRight: '4px solid #0284c7' }}>
          <div className="kpi-card-header">
            <span className="kpi-title">القطاعات وفرق العمل الميدانية</span>
            <div className="kpi-icon-circle blue">
              <Milestone size={20} />
            </div>
          </div>
          <div className="kpi-value-center">
            <span className="kpi-big-num">{filteredReports.length || 2}</span>
            <span className="kpi-unit-label">قطاعات تشغيلية</span>
          </div>
          <div className="kpi-bottom-sub">
            <span className="kpi-green-badge">جاهزية تشغيلية مستقرة للأقسام</span>
          </div>
        </div>

        <div className="kpi-metric-card" style={{ borderRight: '4px solid #d97706' }}>
          <div className="kpi-card-header">
            <span className="kpi-title">المعدات والأطقم المستهدفة</span>
            <div className="kpi-icon-circle orange">
              <Truck size={20} />
            </div>
          </div>
          <div className="kpi-value-center">
            <span className="kpi-big-num">{totalEquipmentCount.toLocaleString('en-US')}</span>
            <span className="kpi-unit-label">آلية وطاقم تشغيل</span>
          </div>
          <div className="kpi-bottom-sub">
            <span style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 700 }}>
              جاهزية المعدات المطلوبة بمواقع العمل
            </span>
          </div>
        </div>

        <div className="kpi-metric-card" style={{ borderRight: '4px solid #16a34a' }}>
          <div className="kpi-card-header">
            <span className="kpi-title">بيانات وتقارير الاستهداف</span>
            <div className="kpi-icon-circle green">
              <Target size={20} />
            </div>
          </div>
          <div className="kpi-value-center">
            <span className="kpi-big-num">{filteredReports.length}</span>
            <span className="kpi-unit-label">بيان يومي معتمد</span>
          </div>
          <div className="kpi-bottom-sub">
            <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 700 }}>
              توثيق رسمي صادر من جهاز الإشراف
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="table-controls-bar">
        <div className="search-input-box">
          <Search size={18} color="#94a3b8"/>
          <input 
            type="text" 
            placeholder="بحث برقم البيان، اليوم، المشرف، أو القطاع..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#475569' }}>المرحلة / المسار:</span>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              style={{
                padding: '0.55rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.86rem',
                fontWeight: 700
              }}
            >
              <option value="all">كافة المراحل / المسارات</option>
              <option value="المرحلة الأولى">المرحلة الأولى</option>
              <option value="المرحلة الثانية">المرحلة الثانية</option>
              <option value="طريق أوباري - غات">طريق أوباري - غات</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table Container */}
      <div className="table-container">
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ margin: 0, fontWeight: 700 }}>جارِ تحميل سجلات الأعمال المستهدفة...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px dashed #cbd5e1'
          }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Target size={32} />
            </div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              لا توجد تقارير أعمال مستهدفة مسجلة حتى الآن
            </h3>
            <p style={{ margin: '0 0 1.25rem', color: '#64748b', fontSize: '0.9rem' }}>
              يمكنك إنشاء وتوثيق بيان الأعمال والمعدات المستهدفة لفرق الميدان باعتماد النموذج الرسمي المعتمد.
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingReport(null);
                setIsCreateModalOpen(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.7rem 1.4rem',
                borderRadius: '8px',
                background: '#0284c7',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.92rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Plus size={18} />
              <span>إنشاء بيان أعمال مستهدفة جديد</span>
            </button>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '45px' }}>ت</th>
                <th>رقم البيان</th>
                <th>العنوان / اليوم</th>
                <th>التاريخ</th>
                <th>القطاع</th>
                <th>حالة البنود</th>
                <th>المعدات المطلوبة</th>
                <th>مدير القطاع</th>
                <th>الحالة</th>
                <th style={{ textAlign: 'center' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report, idx) => (
                <tr key={report.id || idx}>
                  <td style={{ fontWeight: 800 }}>{idx + 1}</td>
                  
                  <td>
                    <span style={{ fontWeight: 800, color: '#0284c7' }}>
                      {report.reportNumber || `#TARGET-${report.id}`}
                    </span>
                  </td>

                  <td>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>
                      {report.title || `بيان أعمال يوم ${report.dayName || ''}`}
                    </div>
                  </td>

                  <td>
                    <span style={{ fontSize: '0.86rem', color: '#475569' }}>
                      {report.dateFormatted || (report.date ? report.date.split('T')[0] : '')}
                    </span>
                  </td>

                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      background: (report.sector || '').includes('B') ? '#ecfeff' : '#eff6ff',
                      color: (report.sector || '').includes('B') ? '#0891b2' : '#2563eb',
                      fontWeight: 800,
                      fontSize: '0.82rem'
                    }}>
                      {(report.sector || '').includes('B') || (report.sector || '').includes('الثانية') ? 'المرحلة الثانية' : ((report.sector || '').includes('أوباري') ? 'طريق أوباري - غات' : 'المرحلة الأولى')}
                    </span>
                  </td>

                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '6px',
                      background: '#f1f5f9',
                      color: '#475569',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}>
                      كل بند يُقاس مستقلاً
                    </span>
                  </td>

                  <td>
                    <span style={{ fontWeight: 800, color: '#b45309' }}>
                      {Number(report.totalTargetEquipment || 0)} آلية وطاقم
                    </span>
                  </td>

                  <td>
                    <span style={{ fontSize: '0.86rem', fontWeight: 700 }}>
                      {report.sectorDirector || report.uploadedBy || '-'}
                    </span>
                  </td>

                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '6px',
                      background: '#f0fdf4',
                      color: '#166534',
                      fontSize: '0.82rem',
                      fontWeight: 800
                    }}>
                      <CheckCircle2 size={13} />
                      <span>معتمد رسمي</span>
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingReport(report);
                          setIsCreateModalOpen(true);
                        }}
                        style={{
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          color: '#166534',
                          borderRadius: '6px',
                          padding: '0.4rem 0.65rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.82rem',
                          fontWeight: 800
                        }}
                        title="تعديل بيانات التقرير"
                      >
                        <Edit3 size={15} />
                        <span>تعديل</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedReportForPrint(report)}
                        style={{
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          color: '#2563eb',
                          borderRadius: '6px',
                          padding: '0.4rem 0.65rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.82rem',
                          fontWeight: 800
                        }}
                        title="طباعة ومعاينة التقرير الرسمي"
                      >
                        <Printer size={15} />
                        <span>طباعة</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setViewDetailsReport(report)}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          color: '#475569',
                          borderRadius: '6px',
                          padding: '0.4rem 0.65rem',
                          cursor: 'pointer'
                        }}
                        title="عرض تفاصيل البيان"
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setReportToDelete(report)}
                        style={{
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          color: '#dc2626',
                          borderRadius: '6px',
                          padding: '0.4rem 0.65rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.82rem',
                          fontWeight: 800
                        }}
                        title="حذف هذا البيان نهائياً"
                      >
                        <Trash2 size={15} />
                        <span>حذف</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Targeted Works Modal */}
      {isCreateModalOpen && (
        <CreateTargetedWorksReportModal
          isOpen={isCreateModalOpen}
          currentUser={currentUser}
          reportToEdit={editingReport}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingReport(null);
          }}
          onReportCreated={(newRep) => {
            fetchTargetedReports();
          }}
          onPrintReport={(newRep) => {
            setSelectedReportForPrint(newRep);
          }}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* Official Print Modal */}
      {selectedReportForPrint && (
        <OfficialPrintModal
          report={selectedReportForPrint}
          onClose={() => setSelectedReportForPrint(null)}
        />
      )}

      {/* Quick Details View Modal */}
      {viewDetailsReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.65)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          direction: 'rtl'
        }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '640px', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
                  {viewDetailsReport.title || 'بيان الأعمال المستهدفة'}
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  رقم البيان: {viewDetailsReport.reportNumber} • {viewDetailsReport.sector}
                </span>
              </div>
              <button onClick={() => setViewDetailsReport(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>حالة بنود المسار:</span>
                <span style={{ fontWeight: 800, color: '#0284c7' }}>كل بند يقاس بصورة مستقلة</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>إجمالي المعدات والأطقم:</span>
                <span style={{ fontWeight: 800, color: '#b45309' }}>{Number(viewDetailsReport.totalTargetEquipment || 0)} آلية/طاقم</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>مدير القطاع:</span>
                <span style={{ fontWeight: 800 }}>{viewDetailsReport.sectorDirector || viewDetailsReport.uploadedBy}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>ممثل الجهة المالكة:</span>
                <span style={{ fontWeight: 800 }}>{viewDetailsReport.ownerRepresentative || 'م. عبدالرحمن الأنصاري'}</span>
              </div>

              {/* Sections summary */}
              <div style={{ marginTop: '0.5rem' }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#1e293b' }}>الأقسام المستهدفة بالبيان:</strong>
                {(viewDetailsReport.targetedSections || []).map((sec, i) => (
                  <div key={i} style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{sec.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                      {sec.startTimeNote} • {sec.workItems?.length || 0} بنود أعمال • {sec.equipmentItems?.length || 0} آليات
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    const rep = viewDetailsReport;
                    setViewDetailsReport(null);
                    setSelectedReportForPrint(rep);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    background: '#0284c7',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  <Printer size={16} />
                  <span>طباعة التقرير</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const rep = viewDetailsReport;
                    setViewDetailsReport(null);
                    setReportToDelete(rep);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.65rem 1.1rem',
                    borderRadius: '8px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={16} />
                  <span>حذف البيان</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setViewDetailsReport(null)}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {reportToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '1rem',
          direction: 'rtl'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '440px',
            padding: '2rem 1.75rem',
            textAlign: 'center',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            border: '1px solid #fee2e2'
          }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', border: '2px solid #fecaca' }}>
              <Trash2 size={26} />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
              تأكيد حذف بيان الأعمال المستهدفة
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '1.25rem' }}>
              هل أنت متأكد من حذف البيان ({reportToDelete.reportNumber})؟ سيتم حذفه نهائياً من الأرشيف.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={handleDeleteReport}
                style={{
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.65rem 1.25rem',
                  fontWeight: 800,
                  cursor: 'pointer'
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

    </div>
  );
};

export default TargetedWorksView;
