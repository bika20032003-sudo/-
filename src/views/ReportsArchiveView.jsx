import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Printer, Plus, RefreshCw, FileSpreadsheet, 
  CheckCircle2, Clock, AlertTriangle, Eye, Edit2, Trash2, 
  Building2, Milestone, Factory, Fuel, Truck, Layers, Filter, Calendar, Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { fastFetch } from '../utils/apiCache.js';
import { OfficialPrintModal } from '../components/OfficialPrintModal';
import { CreateReportModal } from '../components/CreateReportModal';

export const ReportsArchiveView = ({ currentUser }) => {
  const isSectorSupervisor = currentUser?.role?.includes('مشرف') || Boolean(currentUser?.sector && currentUser.sector !== 'all');
  const userSectorCode = (currentUser?.sector || '').includes('B') || (currentUser?.username || '').includes('b') ? 'B' : 'A';
  
  // Sector filter default
  const [sectorFilter, setSectorFilter] = useState(isSectorSupervisor ? userSectorCode : 'all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Data state
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedReportForPrint, setSelectedReportForPrint] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewDetailsReport, setViewDetailsReport] = useState(null);

  // Fetch Reports
  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const url = sectorFilter !== 'all' 
        ? `http://localhost:5000/api/reports?sector=${sectorFilter}`
        : 'http://localhost:5000/api/reports';
      
      const res = await fastFetch(url);
      if (res && res.success && res.reports) {
        setReports(res.reports);
      }
    } catch (err) {
      console.error('Failed to load reports archive', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [sectorFilter]);

  // Filtering Logic
  const filteredReports = reports.filter((r) => {
    // Sector filter
    if (sectorFilter !== 'all') {
      const s = (r.sector || '') + (r.crusherName || '') + (r.reportNumber || '');
      if (!s.toUpperCase().includes(sectorFilter.toUpperCase())) return false;
    }

    // Status filter
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;

    // Type filter
    if (typeFilter !== 'all' && r.reportType !== typeFilter) return false;

    // Date range filter
    if (startDate && r.date && r.date.split('T')[0] < startDate) return false;
    if (endDate && r.date && r.date.split('T')[0] > endDate) return false;

    // Search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const combined = `${r.reportNumber || ''} ${r.materialName || ''} ${r.reportType || ''} ${r.uploadedBy || ''} ${r.notes || ''} ${r.sector || ''}`.toLowerCase();
      if (!combined.includes(q)) return false;
    }

    return true;
  });

  // Summary Metrics calculation
  const totalReportsCount = filteredReports.length;
  const approvedCount = filteredReports.filter(r => r.status === 'approved').length;
  const pendingCount = filteredReports.filter(r => r.status === 'pending_review').length;
  
  const totalCrusherProduction = filteredReports.reduce((acc, r) => acc + (Number(r.productionAmount) || 0), 0);
  const totalRoadMeters = filteredReports.reduce((acc, r) => acc + (Number(r.roadMeters) || Number(r.salesAmount) || 0), 0);
  const totalFuelDispensed = filteredReports.reduce((acc, r) => acc + (Number(r.fuelAmount) || 0), 0);

  // Export to Excel
  const handleExportExcel = () => {
    const data = filteredReports.map((r, idx) => ({
      'م': idx + 1,
      'رقم التقرير': r.reportNumber || `#REP-${r.id}`,
      'التاريخ': r.date ? r.date.split('T')[0] : '',
      'القطاع الميداني': r.sector || '',
      'الشركة المنفذة': (r.sector || '').includes('B') ? 'شركة نيوم للمقاولات' : 'شركة الرواد للمقاولات',
      'نوع التقرير': r.reportType || 'شامل',
      'إنتاج الكسارة (طن)': Number(r.productionAmount) || 0,
      'أعمال الرصف (م.ط)': Number(r.roadMeters || r.salesAmount) || 0,
      'الوقود المنصرف (لتر)': Number(r.fuelAmount) || 0,
      'المشرف المعد': r.uploadedBy || '',
      'حالة الاعتماد': r.status === 'approved' ? 'معتمد رسمياً' : r.status === 'rejected' ? 'مطلوب تعديل' : 'قيد المراجعة',
      'المعتمد بواسطة': r.approvedBy || '',
      'الملاحظات': r.notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'أرشيف تقارير القطاعات');
    XLSX.writeFile(wb, `أرشيف_تقارير_القطاعات_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Delete Report handler
  const handleDeleteReport = async (id, repNum) => {
    if (!window.confirm(`هل أنت متأكد من حذف التقرير (${repNum || id}) نهائياً من الأرشيف؟`)) return;
    try {
      const res = await fastFetch(`http://localhost:5000/api/reports/${id}`, { method: 'DELETE' });
      if (res && res.success) {
        setReports(prev => prev.filter(r => r.id !== id));
      } else {
        alert('تعذر حذف التقرير.');
      }
    } catch (e) {
      alert('حدث خطأ أثناء الحذف.');
    }
  };

  return (
    <div className="view-content" style={{ maxWidth: '1380px', margin: '0 auto', paddingBottom: '3.5rem' }}>
      
      {/* 1. Header Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1.35rem 1.85rem',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                أرشيف تقارير القطاعات ونظام الطباعة المعتمد
              </h2>
              <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                السجل المركزي الموثق لكافة تقارير القطاعين (A و B) مع إمكانية الإنشاء الفوري والطباعة الرسمية
              </p>
            </div>
          </div>
        </div>

        {/* Top Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              border: 'none',
              padding: '0.7rem 1.5rem',
              borderRadius: '10px',
              fontWeight: 900,
              fontSize: '0.92rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            <Plus size={18} />
            <span>إنشاء تقرير ميداني جديد ✍️</span>
          </button>

          <button
            onClick={handleExportExcel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: '#f8fafc',
              color: '#166534',
              border: '1px solid #bbf7d0',
              padding: '0.7rem 1.25rem',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            <FileSpreadsheet size={18} color="#16a34a" />
            <span>تصدير Excel</span>
          </button>

          <button
            onClick={fetchReports}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#f8fafc',
              color: '#475569',
              border: '1px solid #cbd5e1',
              padding: '0.7rem 1.1rem',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Badges for Archive */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 800 }}>إجمالي التقارير بالأرشيف</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#0f172a', marginTop: '0.2rem' }}>
            {totalReportsCount} <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>تقرير</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 800 }}>تقارير معتمدة رسمياً</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#16a34a', marginTop: '0.2rem' }}>
            {approvedCount} <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d' }}>معتمد</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #fde68a', borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 800 }}>قيد مراجعة الاعتماد</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#d97706', marginTop: '0.2rem' }}>
            {pendingCount} <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400e' }}>بالانتظار</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.78rem', color: '#1e40af', fontWeight: 800 }}>إنتاج الكسارات الموثق</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#2563eb', marginTop: '0.2rem' }}>
            {totalCrusherProduction.toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1d4ed8' }}>طن</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #fed7aa', borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.78rem', color: '#9a3412', fontWeight: 800 }}>الرصف المنجز بالأرشيف</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#ea580c', marginTop: '0.2rem' }}>
            {totalRoadMeters.toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c2410c' }}>م.ط</span>
          </div>
        </div>
      </div>

      {/* 3. Filters & Search Control Bar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '1.1rem 1.5rem',
        marginBottom: '1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="بحث برقم التقرير، المشرف، الكسارة، أو الملاحظات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 2.5rem 0.65rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.86rem',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Sector Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>القطاع:</span>
          {isSectorSupervisor ? (
            <span style={{
              background: '#eff6ff',
              color: '#1d4ed8',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.82rem',
              border: '1px solid #bfdbfe'
            }}>
              {userSectorCode === 'A' ? 'القطاع الأول (A)' : 'القطاع الثاني (B)'}
            </span>
          ) : (
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 700 }}
            >
              <option value="all">كافة القطاعات (A و B)</option>
              <option value="A">القطاع الأول (A) - شركة الرواد</option>
              <option value="B">القطاع الثاني (B) - شركة نيوم</option>
            </select>
          )}
        </div>

        {/* Status Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>الحالة:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 700 }}
          >
            <option value="all">جميع الحالات</option>
            <option value="approved">معتمد رسمياً</option>
            <option value="pending_review">قيد المراجعة</option>
            <option value="rejected">مطلوب تعديل</option>
          </select>
        </div>

        {/* Dates */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>من:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ padding: '0.55rem 0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
          />
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>إلى:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ padding: '0.55rem 0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
          />
          {(startDate || endDate || searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); setSearchTerm(''); setStatusFilter('all'); }}
              style={{ background: '#fee2e2', border: 'none', color: '#b91c1c', padding: '0.55rem 0.8rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
            >
              إلغاء الفلترة
            </button>
          )}
        </div>

      </div>

      {/* 4. Reports Table */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
      }}>
        {isLoading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem auto', color: '#2563eb' }} />
            <div>جاري تحميل أرشيف تقارير القطاعات...</div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
            <FileText size={48} style={{ margin: '0 auto 0.75rem auto', opacity: 0.35 }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#475569', fontSize: '1.1rem' }}>لا توجد تقارير مطابقة في الأرشيف</h3>
            <p style={{ margin: 0, fontSize: '0.88rem' }}>يمكنك تغيير خيارات البحث أو النقر على "إنشاء تقرير ميداني جديد".</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.9rem 1.1rem', fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>رقم التقرير</th>
                  <th style={{ padding: '0.9rem 1.1rem', fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>التاريخ</th>
                  <th style={{ padding: '0.9rem 1.1rem', fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>القطاع والشركة</th>
                  <th style={{ padding: '0.9rem 1.1rem', fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>بيان ونوع التقرير</th>
                  <th style={{ padding: '0.9rem 1.1rem', fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>إنتاج الكسارة</th>
                  <th style={{ padding: '0.9rem 1.1rem', fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>أعمال الرصف</th>
                  <th style={{ padding: '0.9rem 1.1rem', fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>حالة الاعتماد</th>
                  <th style={{ padding: '0.9rem 1.1rem', fontSize: '0.82rem', fontWeight: 800, color: '#475569', textAlign: 'center' }}>الإجراءات والطباعة</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((r) => {
                  const isA = (r.sector || '').includes('A') || (r.crusherName || '').includes('A');
                  const isApproved = r.status === 'approved';
                  const isPending = r.status === 'pending_review';
                  const isRejected = r.status === 'rejected';

                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', background: isPending ? '#fffdf7' : '#ffffff' }}>
                      {/* Report Number */}
                      <td style={{ padding: '0.9rem 1.1rem' }}>
                        <span style={{
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          background: '#f1f5f9',
                          color: '#0f172a',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          direction: 'ltr',
                          display: 'inline-block'
                        }}>
                          {r.reportNumber || `#REP-${r.id}`}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '0.9rem 1.1rem', fontSize: '0.84rem', color: '#475569' }}>
                        {r.date ? new Date(r.date).toLocaleDateString('ar-LY') : '—'}
                      </td>

                      {/* Sector */}
                      <td style={{ padding: '0.9rem 1.1rem' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.86rem', color: isA ? '#1e40af' : '#c2410c' }}>
                          {isA ? 'القطاع الأول (A)' : 'القطاع الثاني (B)'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          {isA ? 'شركة الرواد' : 'شركة نيوم'}
                        </div>
                      </td>

                      {/* Title & Statement */}
                      <td style={{ padding: '0.9rem 1.1rem' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0f172a' }}>
                          {r.materialName || r.reportType || 'تقرير يومي شامل'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          المشرف: {r.uploadedBy || 'المشرف الميداني'}
                        </div>
                      </td>

                      {/* Crusher Production */}
                      <td style={{ padding: '0.9rem 1.1rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.84rem', color: '#2563eb' }}>
                          {r.productionAmount ? `${Number(r.productionAmount).toLocaleString()} طن` : '—'}
                        </span>
                      </td>

                      {/* Road Meters */}
                      <td style={{ padding: '0.9rem 1.1rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.84rem', color: '#ea580c' }}>
                          {(r.roadMeters || r.salesAmount) ? `${Number(r.roadMeters || r.salesAmount).toLocaleString()} م.ط` : '—'}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.9rem 1.1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.3rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.76rem',
                          fontWeight: 800,
                          background: isApproved ? '#dcfce7' : isPending ? '#fef3c7' : '#fee2e2',
                          color: isApproved ? '#166534' : isPending ? '#92400e' : '#991b1b',
                          border: isApproved ? '1px solid #bbf7d0' : isPending ? '1px solid #fde68a' : '1px solid #fecaca'
                        }}>
                          {isApproved ? <CheckCircle2 size={13} /> : isPending ? <Clock size={13} /> : <AlertTriangle size={13} />}
                          <span>
                            {isApproved ? 'معتمد رسمياً' : isPending ? 'قيد المراجعة' : 'مطلوب تعديل'}
                          </span>
                        </span>
                      </td>

                      {/* Actions with Official Print */}
                      <td style={{ padding: '0.9rem 1.1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}>
                          {/* Print Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedReportForPrint(r)}
                            title="طباعة التقرير الرسمي (Print / PDF)"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              background: '#2563eb',
                              color: '#ffffff',
                              border: 'none',
                              padding: '0.4rem 0.8rem',
                              borderRadius: '7px',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
                            }}
                          >
                            <Printer size={14} />
                            <span>طباعة</span>
                          </button>

                          {/* Details Button */}
                          <button
                            type="button"
                            onClick={() => setViewDetailsReport(r)}
                            title="عرض التفاصيل"
                            style={{
                              background: '#f8fafc',
                              color: '#334155',
                              border: '1px solid #cbd5e1',
                              padding: '0.4rem 0.65rem',
                              borderRadius: '7px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <Eye size={14} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteReport(r.id, r.reportNumber)}
                            title="حذف التقرير"
                            style={{
                              background: '#fef2f2',
                              color: '#dc2626',
                              border: '1px solid #fecaca',
                              padding: '0.4rem 0.65rem',
                              borderRadius: '7px',
                              fontSize: '0.78rem',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details View Modal */}
      {viewDetailsReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.65)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '580px', padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                  تفاصيل التقرير ({viewDetailsReport.reportNumber})
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>المرسل: {viewDetailsReport.uploadedBy}</span>
              </div>
              <button onClick={() => setViewDetailsReport(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.86rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>القطاع الميداني:</span>
                <span style={{ fontWeight: 800 }}>{viewDetailsReport.sector}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>تاريخ التقرير:</span>
                <span style={{ fontWeight: 800 }}>{new Date(viewDetailsReport.date).toLocaleDateString('ar-LY')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>إنتاج الكسارة:</span>
                <span style={{ fontWeight: 800, color: '#2563eb' }}>{viewDetailsReport.productionAmount || 0} طن</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>أعمال الرصف المنجزة:</span>
                <span style={{ fontWeight: 800, color: '#ea580c' }}>{viewDetailsReport.roadMeters || viewDetailsReport.salesAmount || 0} م.ط</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>الوقود المستهلك:</span>
                <span style={{ fontWeight: 800, color: '#16a34a' }}>{viewDetailsReport.fuelAmount || 0} لتر</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>حالة الاعتماد:</span>
                <span style={{ fontWeight: 800 }}>{viewDetailsReport.status === 'approved' ? 'معتمد رسمياً ✅' : 'قيد المراجعة ⏳'}</span>
              </div>
              {viewDetailsReport.notes && (
                <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
                  <div style={{ fontWeight: 800, color: '#475569', marginBottom: '0.2rem' }}>البيان والملاحظات:</div>
                  <div style={{ color: '#334155' }}>{viewDetailsReport.notes}</div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => {
                  const rep = viewDetailsReport;
                  setViewDetailsReport(null);
                  setSelectedReportForPrint(rep);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '0.6rem 1.4rem',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  cursor: 'pointer'
                }}
              >
                <Printer size={16} />
                <span>طباعة هذا التقرير رسمياً</span>
              </button>

              <button
                onClick={() => setViewDetailsReport(null)}
                style={{ background: '#f1f5f9', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', color: '#475569' }}
              >
                إغلاق
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
          onReportCreated={(newRep) => {
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

export default ReportsArchiveView;
