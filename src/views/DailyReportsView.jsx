import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, FileSpreadsheet, Eye, X, RefreshCw, 
  Edit2, Trash2, CheckCircle2, Clock, AlertTriangle, Check, ShieldCheck,
  Printer, Plus
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { fastFetch } from '../utils/apiCache.js';
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
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedReportForPrint, setSelectedReportForPrint] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Edit form state
    const [editFormData, setEditFormData] = useState({
        materialName: '',
        crusherName: '',
        productionAmount: '',
        date: '',
        notes: ''
    });

    const isManager = currentUser?.role?.includes('مدير') || !currentUser?.role;

    const fetchReports = async () => {
        try {
            setIsLoading(true);
            const data = await fastFetch('http://localhost:5000/api/reports');
            if (data.success && data.reports) {
                setReports(data.reports);
            }
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
            const response = await fetch(`http://localhost:5000/api/reports/${editModalReport.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editFormData)
            });
            const data = await response.json();
            if (data.success) {
                setReports(reports.map(r => r.id === editModalReport.id ? { ...r, ...editFormData } : r));
                setEditModalReport(null);
            } else {
                alert('حدث خطأ أثناء تعديل التقرير.');
            }
        } catch (error) {
            alert('تعذر الاتصال بالخادم.');
        }
    };

    // Handle Delete
    const handleDeleteReport = async (id, title) => {
        if (!window.confirm(`هل أنت متأكد من حذف التقرير (${title}) نهائياً؟`))
            return;
        try {
            const response = await fetch(`http://localhost:5000/api/reports/${id}`, { method: 'DELETE' });
            const data = await response.json();
            if (data.success) {
                setReports(reports.filter(r => r.id !== id));
            } else {
                alert('حدث خطأ أثناء حذف التقرير.');
            }
        } catch (error) {
            alert('تعذر الاتصال بالخادم.');
        }
    };

    // Open Edit Modal
    const openEdit = (rep) => {
        setEditModalReport(rep);
        setEditFormData({
            materialName: rep.materialName || '',
            crusherName: rep.crusherName || '',
            productionAmount: rep.productionAmount ? String(rep.productionAmount) : '',
            date: rep.date ? rep.date.split('T')[0] : '',
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

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                fontWeight: 900,
                fontSize: '0.86rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
              }}
            >
              <Plus size={16} />
              <span>إنشاء تقرير قطاع جديد ✍️</span>
            </button>

            <button className="secondary-action-btn" onClick={fetchReports} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <RefreshCw size={15} />
              <span>تحديث</span>
            </button>
            <button className="secondary-action-btn" onClick={exportExcel} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
              <FileSpreadsheet size={15} />
              <span>تصدير إكسل</span>
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
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setStatusFilter('all')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === 'all' ? '#0f172a' : '#f1f5f9',
                color: statusFilter === 'all' ? '#fff' : '#475569'
              }}
            >
              الكل ({reports.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending_review')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === 'pending_review' ? '#d97706' : '#fef3c7',
                color: statusFilter === 'pending_review' ? '#fff' : '#92400e',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Clock size={14} />
              <span>قيد الاعتماد ({pendingCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === 'approved' ? '#16a34a' : '#f0fdf4',
                color: statusFilter === 'approved' ? '#fff' : '#166534',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {/* Approval Actions for Sector Manager / Project Manager */}
                          {isManager && isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(r.id)}
                                style={{
                                  background: '#16a34a',
                                  color: '#fff',
                                  border: 'none',
                                  padding: '0.35rem 0.65rem',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  fontSize: '0.76rem',
                                  fontWeight: 800
                                }}
                                title="اعتماد التقرير وتثبيت بياناته رسمياً"
                              >
                                <Check size={13} />
                                <span>اعتماد</span>
                              </button>

                              <button
                                onClick={() => handleReject(r.id)}
                                style={{
                                  background: '#fff',
                                  color: '#dc2626',
                                  border: '1px solid #fca5a5',
                                  padding: '0.35rem 0.55rem',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '0.76rem',
                                  fontWeight: 700
                                }}
                                title="طلب تعديل التقرير"
                              >
                                <span>تعديل</span>
                              </button>
                            </>
                          )}

                          {/* Print Button */}
                          <button
                            onClick={() => setSelectedReportForPrint(r)}
                            style={{
                              background: '#2563eb',
                              color: '#fff',
                              border: 'none',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
                            }}
                            title="طباعة التقرير الرسمي (Print / PDF)"
                          >
                            <Printer size={13} />
                            <span>طباعة</span>
                          </button>

                          {/* View Button */}
                          <button
                            onClick={() => setViewModalReport(r)}
                            style={{
                              background: '#f8fafc',
                              color: '#475569',
                              border: '1px solid #cbd5e1',
                              padding: '0.35rem 0.55rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.76rem',
                              fontWeight: 700
                            }}
                            title="عرض تفاصيل التقرير"
                          >
                            <Eye size={13} />
                            <span>عرض</span>
                          </button>

                          {/* Delete Button */}
                          {isManager && (
                            <button
                              onClick={() => handleDeleteReport(r.id, r.materialName || r.reportType)}
                              style={{
                                background: '#fee2e2',
                                color: '#dc2626',
                                border: 'none',
                                padding: '0.35rem 0.55rem',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                              title="حذف التقرير"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
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
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>القطاع:</span>
                  <span style={{ fontWeight: 800 }}>{viewModalReport.sector || viewModalReport.crusherName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>التاريخ:</span>
                  <span style={{ fontWeight: 800 }}>{new Date(viewModalReport.date).toLocaleDateString('ar-LY')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>نوع وبيان التقرير:</span>
                  <span style={{ fontWeight: 800 }}>{viewModalReport.materialName || viewModalReport.reportType}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>الكمية المسجلة:</span>
                  <span style={{ fontWeight: 800, color: '#2563eb' }}>{viewModalReport.productionAmount} طن</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>القائم بالرفع:</span>
                  <span style={{ fontWeight: 800 }}>{viewModalReport.uploadedBy || 'مشرف القطاع'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>حالة الاعتماد:</span>
                  <span style={{ fontWeight: 800, color: viewModalReport.status === 'approved' ? '#16a34a' : '#d97706' }}>
                    {viewModalReport.status === 'approved' ? 'معتمد رسمياً' : 'قيد الاعتماد من مدير القطاعات'}
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
                {isManager && viewModalReport.status === 'pending_review' && (
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
