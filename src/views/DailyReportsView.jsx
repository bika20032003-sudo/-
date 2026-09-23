import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, FileSpreadsheet, Eye, X, RefreshCw, 
  Edit2, Trash2, CheckCircle2, Clock, AlertTriangle, Check, ShieldCheck,
  Printer, Plus
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { fastFetch, clearApiCache } from '../utils/apiCache.js';
import { OfficialPrintModal } from '../components/OfficialPrintModal';
import { CreateReportModal } from '../components/CreateReportModal';

export const DailyReportsView = ({ currentUser }) => {
    const [reports, setReports] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sectorFilter, setSectorFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [actionMsg, setActionMsg] = useState('');

    // Modals state
    const [viewModalReport, setViewModalReport] = useState(null);
    const [editModalReport, setEditModalReport] = useState(null);
    const [reportToDelete, setReportToDelete] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedReportForPrint, setSelectedReportForPrint] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Edit form state
    const [editFormData, setEditFormData] = useState({
        reportNumber: '',
        sector: 'القطعة A',
        materialName: '',
        crusherName: '',
        productionAmount: '',
        roadMeters: '',
        fuelAmount: '',
        date: '',
        status: 'approved',
        notes: ''
    });

    const isManager = true;

    const fetchReports = async () => {
        try {
            setIsLoading(true);
            const data = await fastFetch('http://localhost:5000/api/reports');
            let list = data && data.reports ? data.reports : (Array.isArray(data) ? data : []);

            // Filter out deleted reports and merge local reports
            try {
                const deletedSet = new Set(JSON.parse(localStorage.getItem('deleted_report_ids') || '[]'));
                const local = JSON.parse(localStorage.getItem('local_reports') || '[]');
                const existingIds = new Set(list.map(r => String(r.id || r.reportNumber)));
                const newOnes = local.filter(r => 
                    !deletedSet.has(String(r.id)) && 
                    !deletedSet.has(String(r.reportNumber)) && 
                    !existingIds.has(String(r.id || r.reportNumber))
                );
                list = [...newOnes, ...list];
                list = list.filter(r => !deletedSet.has(String(r.id)) && !deletedSet.has(String(r.reportNumber)));
            } catch (storageErr) {
                console.warn('DailyReportsView storage error:', storageErr);
            }

            setReports(list);
        }
        catch (error) {
            console.error('Failed to fetch daily reports', error);
        }
        finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
        const handleGlobalReportsSync = () => {
            fetchReports();
        };
        window.addEventListener('report-created', handleGlobalReportsSync);
        window.addEventListener('report-updated', handleGlobalReportsSync);
        window.addEventListener('report-deleted', handleGlobalReportsSync);

        return () => {
            window.removeEventListener('report-created', handleGlobalReportsSync);
            window.removeEventListener('report-updated', handleGlobalReportsSync);
            window.removeEventListener('report-deleted', handleGlobalReportsSync);
        };
    }, []);

    // Approve Report
    const handleApprove = async (id) => {
        try {
            const res = await fastFetch(`http://localhost:5000/api/reports/${id}/approve`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approvedBy: currentUser?.name || 'مدير القطاعات' })
            });
            if (res.success) {
                setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'approved', approvedBy: currentUser?.name || 'مدير القطاعات' } : r));
                setActionMsg('تم اعتماد التقرير بنجاح وتثبيت بياناته في المنظومة.');
                setTimeout(() => setActionMsg(''), 4000);
            }
        } catch (e) {
            alert('حدث خطأ أثناء اعتماد التقرير');
        }
    };

    // Reject / Request Revision
    const handleReject = async (id) => {
        const reason = window.prompt('يرجى كتابة سبب طلب التعديل أو الملاحظات للقطاع:');
        if (!reason) return;
        try {
            const res = await fastFetch(`http://localhost:5000/api/reports/${id}/reject`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });
            if (res.success) {
                setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected', reviewNotes: reason } : r));
                setActionMsg('تم إرجاع التقرير للقطاع للتعديل والمراجعة.');
                setTimeout(() => setActionMsg(''), 4000);
            }
        } catch (e) {
            alert('حدث خطأ أثناء العملية');
        }
    };

    // Handle Edit Submit
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editModalReport) return;
        try {
            const targetId = editModalReport.id;
            const targetNum = editModalReport.reportNumber;
            
            const payload = {
                ...editFormData,
                productionAmount: Number(editFormData.productionAmount) || 0,
                roadMeters: Number(editFormData.roadMeters) || 0,
                salesAmount: Number(editFormData.roadMeters) || 0,
                fuelAmount: Number(editFormData.fuelAmount) || 0
            };

            await fastFetch(`http://localhost:5000/api/reports/${targetId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(() => {});

            setReports(prev => prev.map(r => (String(r.id) === String(targetId) || String(r.reportNumber) === String(targetNum)) ? { ...r, ...payload } : r));

            try {
                const local = JSON.parse(localStorage.getItem('local_reports') || '[]');
                const updatedLocal = local.map(r => (String(r.id) === String(targetId) || String(r.reportNumber) === String(targetNum)) ? { ...r, ...payload } : r);
                localStorage.setItem('local_reports', JSON.stringify(updatedLocal));
            } catch (storageErr) {}

            window.dispatchEvent(new CustomEvent('report-updated', { detail: { id: targetId, ...payload } }));
            setEditModalReport(null);
            setActionMsg('تم حفظ وتحديث بيانات التقرير بنجاح ✅');
            setTimeout(() => setActionMsg(''), 4000);
        } catch (error) {
            alert('تعذر تحديث بيانات التقرير.');
        }
    };

    // Confirm Delete
    const confirmDeleteReport = async () => {
        if (!reportToDelete) return;
        const targetId = String(reportToDelete.id || '');
        const targetNum = String(reportToDelete.reportNumber || '');

        try {
            // 1. Immediately remove from React state
            setReports(prev => prev.filter(r => {
                const rId = String(r.id || '');
                const rNum = String(r.reportNumber || '');
                if (targetId && rId === targetId) return false;
                if (targetNum && rNum === targetNum) return false;
                if (targetNum && rId === targetNum) return false;
                if (targetId && rNum === targetId) return false;
                return true;
            }));

            // 2. Persist in localStorage: save to deleted_report_ids and remove from local_reports
            try {
                const deleted = JSON.parse(localStorage.getItem('deleted_report_ids') || '[]');
                if (targetId && !deleted.includes(targetId)) deleted.push(targetId);
                if (targetNum && !deleted.includes(targetNum)) deleted.push(targetNum);
                localStorage.setItem('deleted_report_ids', JSON.stringify(deleted));

                const local = JSON.parse(localStorage.getItem('local_reports') || '[]');
                const updatedLocal = local.filter(r => {
                    const rId = String(r.id || '');
                    const rNum = String(r.reportNumber || '');
                    return rId !== targetId && rNum !== targetNum && (targetNum ? rId !== targetNum : true) && (targetId ? rNum !== targetId : true);
                });
                localStorage.setItem('local_reports', JSON.stringify(updatedLocal));
            } catch (storageErr) {
                console.error('Storage error on delete:', storageErr);
            }

            // 3. Clear cache completely
            clearApiCache();

            // 4. Send DELETE request to backend
            const delParam = targetId || targetNum;
            if (delParam) {
                try {
                    await fetch(`http://localhost:5000/api/reports/${delParam}`, { method: 'DELETE' });
                } catch (err) {
                    console.warn('Backend DELETE error:', err);
                }
            }

            // 5. Global sync event
            window.dispatchEvent(new CustomEvent('report-deleted', { detail: { id: targetId, reportNumber: targetNum } }));

            setReportToDelete(null);
            setActionMsg('تم حذف التقرير نهائياً بنجاح 🗑️');
            setTimeout(() => setActionMsg(''), 4000);
        } catch (error) {
            alert('حدث خطأ أثناء حذف التقرير.');
        }
    };

    // Open Edit Modal
    const openEdit = (rep) => {
        setEditModalReport(rep);
        setEditFormData({
            reportNumber: rep.reportNumber || '',
            sector: rep.sector || 'القطعة A',
            materialName: rep.materialName || rep.reportType || '',
            crusherName: rep.crusherName || '',
            productionAmount: rep.productionAmount !== undefined ? String(rep.productionAmount) : '0',
            roadMeters: rep.roadMeters !== undefined ? String(rep.roadMeters) : (rep.salesAmount !== undefined ? String(rep.salesAmount) : '0'),
            fuelAmount: rep.fuelAmount !== undefined ? String(rep.fuelAmount) : '0',
            date: rep.date ? rep.date.split('T')[0] : new Date().toISOString().split('T')[0],
            status: rep.status || 'approved',
            notes: rep.notes || ''
        });
    };

    const pendingCount = reports.filter(r => r.status === 'pending_review').length;

    const filtered = reports.filter(r => {
        const name = r.crusherName || '';
        const mat = r.materialName || '';
        const notes = r.notes || '';
        const date = r.date || '';
        const sector = r.sector || '';
        const matchesSearch = name.includes(searchTerm) || mat.includes(searchTerm) || notes.includes(searchTerm) || date.includes(searchTerm);
        const matchesSector = sectorFilter === 'all' || sector.includes(sectorFilter) || name.includes(sectorFilter);
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        return matchesSearch && matchesSector && matchesStatus;
    });

    const exportExcel = () => {
        const rows = filtered.map(r => ({
            'رقم التقرير': r.reportNumber || `#REP-${r.id}`,
            'التاريخ': r.date ? new Date(r.date).toLocaleDateString('ar-LY') : '',
            'القطاع': r.sector || r.crusherName,
            'نوع التقرير': r.materialName || r.reportType,
            'الكمية': r.productionAmount || 0,
            'القائم بالرفع': r.uploadedBy || '',
            'حالة الاعتماد': r.status === 'approved' ? 'معتمد' : r.status === 'pending_review' ? 'قيد الاعتماد' : 'مطلوب تعديل',
            'الملاحظات': r.notes || ''
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'التقارير اليومية');
        XLSX.writeFile(wb, 'سجل_التقارير_الميدانية.xlsx');
    };

    return (
      <div className="daily-reports-view">
        {/* Header Title */}
        <div className="view-header" style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="view-title" style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>
              أرشيف وسجل التقارير اليومية
            </h2>
            <p className="view-subtitle" style={{ fontSize: '0.84rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
              متابعة التقارير الميدانية الواردة من القطاعين A و B واعتمادها رسمياً من مدير القطاعات
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#ffffff',
                border: 'none',
                padding: '0.65rem 1.35rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.28)',
                transition: 'all 0.2s ease'
              }}
            >
              <Plus size={17} />
              <span>إنشاء تقرير قطاع جديد ✍️</span>
            </button>

            <button
              onClick={exportExcel}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: '#ffffff',
                color: '#15803d',
                border: '1px solid #bbf7d0',
                padding: '0.65rem 1.15rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.08)',
                transition: 'all 0.2s ease'
              }}
            >
              <FileSpreadsheet size={16} color="#16a34a" />
              <span>تصدير إكسل</span>
            </button>

            <button
              onClick={fetchReports}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: '#ffffff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '0.65rem 1.15rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.2s ease'
              }}
            >
              <RefreshCw size={15} />
              <span>تحديث</span>
            </button>
          </div>
        </div>

        {/* Action Flash Alert */}
        {actionMsg && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '0.75rem 1rem', color: '#166534', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <CheckCircle2 size={18} />
            <span>{actionMsg}</span>
          </div>
        )}

        {/* Incoming Review Banner for Managers */}
        {isManager && pendingCount > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            border: '1px solid #fde68a',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#d97706', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: '#92400e' }}>
                  يوجد {pendingCount} تقارير ميدانية واردة بانتظار اعتماد مدير القطاعات
                </h4>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#b45309' }}>
                  يرجى مراجعة تفاصيل الكميات والصور المرفقة واعتمادها لتثبيتها في مؤشرات المشروع
                </p>
              </div>
            </div>

            <button
              onClick={() => setStatusFilter(statusFilter === 'pending_review' ? 'all' : 'pending_review')}
              style={{
                background: '#d97706',
                color: '#fff',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {statusFilter === 'pending_review' ? 'عرض كافة التقارير' : 'عرض التقارير قيد الاعتماد فقط'}
            </button>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="table-controls-card" style={{ marginBottom: '1rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '0.45rem', background: '#f1f5f9', padding: '0.3rem', borderRadius: '10px' }}>
            <button
              onClick={() => setStatusFilter('all')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === 'all' ? '#0f172a' : 'transparent',
                color: statusFilter === 'all' ? '#ffffff' : '#475569',
                boxShadow: statusFilter === 'all' ? '0 2px 6px rgba(15, 23, 42, 0.2)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              الكل ({reports.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending_review')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === 'pending_review' ? '#d97706' : 'transparent',
                color: statusFilter === 'pending_review' ? '#ffffff' : '#92400e',
                boxShadow: statusFilter === 'pending_review' ? '0 2px 6px rgba(217, 119, 6, 0.25)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Clock size={14} />
              <span>قيد الاعتماد ({pendingCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === 'approved' ? '#16a34a' : 'transparent',
                color: statusFilter === 'approved' ? '#ffffff' : '#166534',
                boxShadow: statusFilter === 'approved' ? '0 2px 6px rgba(22, 163, 74, 0.25)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s ease'
              }}
            >
              <CheckCircle2 size={14} />
              <span>المعتمدة ({reports.filter(r => r.status === 'approved').length})</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
            {/* Sector Filter */}
            <select
              className="filter-select"
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 700 }}
            >
              <option value="all">كافة القطاعات</option>
              <option value="A">القطاع (A)</option>
              <option value="B">القطاع (B)</option>
            </select>

            {/* Search Input */}
            <div className="search-box" style={{ position: 'relative' }}>
              <input
                type="text"
                className="search-input"
                placeholder="بحث في التقارير..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '0.4rem 1.75rem 0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
              />
              <Search size={14} style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="table-container" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>جاري جلب التقارير...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
              <FileText size={40} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
              <p style={{ fontSize: '0.9rem' }}>لا توجد تقارير مطابقة للشروط المحددة.</p>
            </div>
          ) : (
            <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>كود التقرير</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>التاريخ</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>القطاع</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>نوع وبيان التقرير</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>الكمية</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>القائم بالرفع</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>حالة الاعتماد</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const isPending = r.status === 'pending_review';
                  const isApproved = r.status === 'approved';
                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', background: isPending ? '#fffdf7' : '#ffffff' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className="code-badge" style={{ fontSize: '0.76rem', fontWeight: 800, background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          {r.reportNumber || `#REP-${r.id}`}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#475569' }}>
                        {r.date ? new Date(r.date).toLocaleDateString('ar-LY') : ''}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          background: (r.sector || '').includes('A') ? '#eff6ff' : '#fff7ed',
                          color: (r.sector || '').includes('A') ? '#1d4ed8' : '#c2410c'
                        }}>
                          {r.sector || r.crusherName}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                        {r.materialName || r.reportType}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 800 }}>
                          {(r.productionAmount || 0).toLocaleString()} طن
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                        {r.uploadedBy || 'مشرف القطاع'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '20px',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          background: isPending ? '#fef3c7' : isApproved ? '#dcfce7' : '#fee2e2',
                          color: isPending ? '#92400e' : isApproved ? '#166534' : '#991b1b',
                          border: isPending ? '1px solid #fde68a' : isApproved ? '1px solid #bbf7d0' : '1px solid #fecaca'
                        }}>
                          {isPending ? <Clock size={12} /> : isApproved ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                          <span>{isPending ? 'بانتظار الاعتماد' : isApproved ? 'معتمد رسمياً' : 'مطلوب تعديل'}</span>
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                          {/* Approval Actions for Pending Reports */}
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(r.id)}
                                style={{
                                  background: '#16a34a',
                                  color: '#fff',
                                  border: 'none',
                                  padding: '0.35rem 0.6rem',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.2rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 800
                                }}
                                title="اعتماد التقرير وتثبيت بياناته رسمياً"
                              >
                                <Check size={12} />
                                <span>اعتماد</span>
                              </button>

                              <button
                                onClick={() => handleReject(r.id)}
                                style={{
                                  background: '#fff',
                                  color: '#ea580c',
                                  border: '1px solid #fdba74',
                                  padding: '0.35rem 0.5rem',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                  fontWeight: 700
                                }}
                                title="طلب مراجعة أو تعديل للقطاع"
                              >
                                <span>طلب تعديل</span>
                              </button>
                            </>
                          )}

                          {/* View Button */}
                          <button
                            onClick={() => setViewModalReport(r)}
                            style={{
                              background: '#f8fafc',
                              color: '#334155',
                              border: '1px solid #cbd5e1',
                              padding: '0.35rem 0.6rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                            title="عرض تفاصيل التقرير"
                          >
                            <Eye size={13} />
                            <span>عرض</span>
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => openEdit(r)}
                            style={{
                              background: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #bfdbfe',
                              padding: '0.35rem 0.6rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                            title="تعديل بيانات التقرير"
                          >
                            <Edit2 size={13} />
                            <span>تعديل</span>
                          </button>

                          {/* Print Button */}
                          <button
                            onClick={() => setSelectedReportForPrint(r)}
                            style={{
                              background: '#f0fdf4',
                              color: '#16a34a',
                              border: '1px solid #bbf7d0',
                              padding: '0.35rem 0.6rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                            title="طباعة التقرير الرسمي (Print / PDF)"
                          >
                            <Printer size={13} />
                            <span>طباعة</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => setReportToDelete(r)}
                            style={{
                              background: '#fef2f2',
                              color: '#dc2626',
                              border: '1px solid #fecaca',
                              padding: '0.35rem 0.6rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                            title="حذف التقرير"
                          >
                            <Trash2 size={13} />
                            <span>حذف</span>
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

        {/* View Details Modal */}
        {viewModalReport && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.6)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}>
            <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '580px', padding: '1.75rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
                  تفاصيل التقرير ({viewModalReport.reportNumber || `#REP-${viewModalReport.id}`})
                </h3>
                <button onClick={() => setViewModalReport(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>القطاع الميداني:</span>
                  <span style={{ fontWeight: 800 }}>{viewModalReport.sector || viewModalReport.crusherName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>التاريخ:</span>
                  <span style={{ fontWeight: 800 }}>{new Date(viewModalReport.date).toLocaleDateString('ar-LY')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>نوع وبيان التقرير:</span>
                  <span style={{ fontWeight: 800 }}>{viewModalReport.materialName || viewModalReport.reportType}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>إنتاج الكسارة:</span>
                  <span style={{ fontWeight: 800, color: '#2563eb' }}>{(viewModalReport.productionAmount || 0).toLocaleString()} طن</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>أعمال الرصف المنفذة:</span>
                  <span style={{ fontWeight: 800, color: '#ea580c' }}>{(viewModalReport.roadMeters || viewModalReport.salesAmount || 0).toLocaleString()} م.ط</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>الوقود المستهلك:</span>
                  <span style={{ fontWeight: 800, color: '#16a34a' }}>{(viewModalReport.fuelAmount || 0).toLocaleString()} لتر</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>القائم بالإعداد والرفع:</span>
                  <span style={{ fontWeight: 800 }}>{viewModalReport.uploadedBy || 'مشرف القطاع'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>حالة الاعتماد:</span>
                  <span style={{ fontWeight: 800, color: viewModalReport.status === 'approved' ? '#16a34a' : '#d97706' }}>
                    {viewModalReport.status === 'approved' ? 'معتمد رسمياً ✅' : 'قيد الاعتماد من مدير القطاعات ⏳'}
                  </span>
                </div>
                {viewModalReport.notes && (
                  <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>الملاحظات والبيان:</div>
                    <div style={{ color: '#334155' }}>{viewModalReport.notes}</div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem' }}>
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
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  <Printer size={15} />
                  <span>طباعة رسمية (Print / PDF) 🖨️</span>
                </button>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                {viewModalReport.status === 'pending_review' && (
                  <button
                    onClick={() => {
                      handleApprove(viewModalReport.id);
                      setViewModalReport(null);
                    }}
                    style={{
                      background: '#16a34a',
                      color: '#fff',
                      border: 'none',
                      padding: '0.6rem 1.25rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    اعتماد التقرير الآن ✅
                  </button>
                )}
                <button
                  onClick={() => setViewModalReport(null)}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.75)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          direction: 'rtl'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.75rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={20} color="#2563eb" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  تعديل بيانات التقرير: {editModalReport.reportNumber || `#REP-${editModalReport.id}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditModalReport(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    رقم التقرير
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.reportNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, reportNumber: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    التاريخ
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    القطاع الميداني
                  </label>
                  <select
                    className="form-input"
                    value={editFormData.sector}
                    onChange={(e) => setEditFormData({ ...editFormData, sector: e.target.value })}
                  >
                    <option value="القطعة A">القطعة A (القطاع الشمالي)</option>
                    <option value="القطعة B">القطعة B (القطاع الأوسط)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    اسم وبيان المادة / التقرير
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.materialName}
                    onChange={(e) => setEditFormData({ ...editFormData, materialName: e.target.value })}
                    placeholder="مثال: ركام متدرج، سولار، أساس ركامي"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    إنتاج الكسارة (طن)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={editFormData.productionAmount}
                    onChange={(e) => setEditFormData({ ...editFormData, productionAmount: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    أعمال الرصف المنجزة (م.ط)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={editFormData.roadMeters}
                    onChange={(e) => setEditFormData({ ...editFormData, roadMeters: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    الوقود المنصرف (لتر)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={editFormData.fuelAmount}
                    onChange={(e) => setEditFormData({ ...editFormData, fuelAmount: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    حالة الاعتماد
                  </label>
                  <select
                    className="form-input"
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  >
                    <option value="approved">معتمد رسمياً</option>
                    <option value="pending_review">قيد المراجعة والاعتماد</option>
                    <option value="rejected">مطلوب مراجعة وتعديل</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  الملاحظات والبيان الميداني
                </label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  placeholder="اكتب أية تفاصيل أو ملاحظات إضافية..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setEditModalReport(null)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  حفظ التعديلات ✅
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {reportToDelete && (
        <div style={{
          position: 'fixed',
          inset: 0,
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
            maxWidth: '460px',
            padding: '2rem 1.75rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            textAlign: 'center',
            border: '1px solid #fee2e2'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              border: '2px solid #fecaca'
            }}>
              <Trash2 size={26} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
              تأكيد حذف التقرير نهائياً
            </h3>
            
            <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              هل أنت متأكد من رغبتك في حذف هذا التقرير من منظومة المتابعة؟
            </p>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '0.85rem 1.1rem',
              marginBottom: '1.5rem',
              textAlign: 'right',
              fontSize: '0.82rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: '#64748b' }}>كود التقرير:</span>
                <span style={{ fontWeight: 800, color: '#1e293b' }}>{reportToDelete.reportNumber || `#REP-${reportToDelete.id}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: '#64748b' }}>بيان التقرير:</span>
                <span style={{ fontWeight: 700, color: '#2563eb' }}>{reportToDelete.materialName || reportToDelete.reportType || 'تقرير يومي'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={confirmDeleteReport}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9px',
                  padding: '0.7rem 1.25rem',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={16} />
                <span>نعم، حذف التقرير</span>
              </button>

              <button
                type="button"
                onClick={() => setReportToDelete(null)}
                style={{
                  flex: 1,
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '9px',
                  padding: '0.7rem 1.25rem',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                إلغاء التراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Print Modal */}
      {selectedReportForPrint && (
        <OfficialPrintModal
          report={selectedReportForPrint}
          onClose={() => setSelectedReportForPrint(null)}
        />
      )}

      {/* Create Report Modal */}
      {isCreateModalOpen && (
        <CreateReportModal
          isOpen={isCreateModalOpen}
          currentUser={currentUser}
          onClose={() => setIsCreateModalOpen(false)}
          onReportCreated={() => {
            fetchReports();
          }}
          onPrintReport={(newRep) => {
            setSelectedReportForPrint(newRep);
          }}
        />
      )}

    </div>
  );
};

export default DailyReportsView;
