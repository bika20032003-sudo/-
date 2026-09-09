import React, { useState, useEffect } from 'react';
import { FileText, FileSpreadsheet, Printer, Calendar, Factory, Fuel, Mountain, Truck, AlertTriangle, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
export const ReportsView = () => {
    const [selectedReportType, setSelectedReportType] = useState('daily-comprehensive');
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [selectedSector, setSelectedSector] = useState('all');
    const [reportsData, setReportsData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const reportTemplates = [
        { id: 'daily-comprehensive', title: 'تقرير يومي شامل للمشروع', icon: FileText, color: '#2563eb' },
        { id: 'equipment-movement', title: 'تقرير حركة وساعات عمل المعدات', icon: Truck, color: '#7c3aed' },
        { id: 'crusher-production', title: 'تقرير إنتاج الكسارات والركام', icon: Factory, color: '#0284c7' },
        { id: 'fuel-solar', title: 'تقرير استهلاك وأذونات السولار', icon: Fuel, color: '#ea580c' },
        { id: 'sharshoor-aggregate', title: 'تقرير توريدات ورصيد الشرشور', icon: Mountain, color: '#16a34a' },
        { id: 'issues-breakdowns', title: 'تقرير الأعطال والمشاكل الفنية', icon: AlertTriangle, color: '#dc2626' },
        { id: 'tomorrow-plan-execution', title: 'تقرير مقارنة خطة الغد بالفعلي', icon: Calendar, color: '#0891b2' }
    ];
    const fetchReportsData = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('http://localhost:5000/api/reports');
            const data = await res.json();
            if (data.success) {
                setReportsData(data.reports || []);
            }
        }
        catch (e) {
            console.error('Error fetching reports data', e);
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchReportsData();
    }, [selectedReportType, dateRange, selectedSector]);
    const handleExportExcel = () => {
        const selectedTemplate = reportTemplates.find(t => t.id === selectedReportType);
        const data = reportsData.map((r, idx) => ({
            'م': idx + 1,
            'رقم التقرير': `#REP-0${r.id}`,
            'التاريخ': r.date?.split('T')[0],
            'القطعة': r.crusherName,
            'نوع التقرير / المادة': r.materialName,
            'الكمية المسجلة': r.productionAmount,
            'المسؤول': r.uploadedBy || 'م. عبدالرحمن',
            'الملاحظات': r.notes || 'لا توجد'
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, selectedTemplate?.title || 'تقرير');
        XLSX.writeFile(wb, `${selectedTemplate?.title || 'تقرير'}_${dateRange.endDate}.xlsx`);
    };
    const handlePrint = () => {
        window.print();
    };
    return (<div className="view-content" style={{ maxWidth: '1350px', margin: '0 auto' }}>
      {/* Top Header */}
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
            مركز التقارير والتحليلات المعتمدة
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.2rem' }}>
            إنشاء واستخراج التقارير الجاهزة للإدارة والوزارة مع خيارات التصدير والطباعة الرسمية
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button className="secondary-action-btn" onClick={handlePrint}>
            <Printer size={16}/>
            <span>طباعة التقرير</span>
          </button>

          <button className="primary-action-btn" onClick={handleExportExcel}>
            <FileSpreadsheet size={16}/>
            <span>تصدير ملف Excel</span>
          </button>
        </div>
      </div>

      {/* Templates Grid Selection */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem', marginBottom: '1.5rem' }}>
        {reportTemplates.map((tmpl) => {
            const Icon = tmpl.icon;
            const isSelected = selectedReportType === tmpl.id;
            return (<div key={tmpl.id} onClick={() => setSelectedReportType(tmpl.id)} style={{
                    background: isSelected ? '#eff6ff' : '#ffffff',
                    border: `1.5px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                    borderRadius: '12px',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.12)' : 'none'
                }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${tmpl.color}15`, color: tmpl.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18}/>
              </div>
              <div>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 800, color: isSelected ? '#1d4ed8' : '#0f172a', margin: 0 }}>
                  {tmpl.title}
                </h4>
              </div>
            </div>);
        })}
      </div>

      {/* Filter Row */}
      <div className="table-controls-bar" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>من تاريخ:</span>
          <input type="date" className="form-input" value={dateRange.startDate} onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })} style={{ width: '140px', height: '36px', fontSize: '0.82rem' }}/>

          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>إلى تاريخ:</span>
          <input type="date" className="form-input" value={dateRange.endDate} onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })} style={{ width: '140px', height: '36px', fontSize: '0.82rem' }}/>

          <select className="filter-select" value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)} style={{ height: '36px', fontSize: '0.82rem' }}>
            <option value="all">كافة القطاعات (الإجمالي)</option>
            <option value="A">القطعة A</option>
            <option value="B">القطعة B</option>
          </select>
        </div>

        <button className="secondary-action-btn" onClick={fetchReportsData} disabled={isLoading}>
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''}/>
          <span>تحديث البيانات</span>
        </button>
      </div>

      {/* Report Preview Document Card */}
      <div className="dashboard-white-card" style={{ padding: '2rem' }}>
        {/* Printable Report Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>جهاز تنفيذ مشروعات المواصلات</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.15rem' }}>منظومة المتابعة الميدانية للكسارات والمعدات والوقود</p>
          </div>

          <div style={{ textAlign: 'left' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#2563eb' }}>
              {reportTemplates.find(t => t.id === selectedReportType)?.title}
            </h4>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
              الفترة: {dateRange.startDate} إلى {dateRange.endDate}
            </p>
          </div>
        </div>

        {/* Data Table */}
        <table className="custom-table">
          <thead>
            <tr>
              <th>كود التقرير</th>
              <th>التاريخ</th>
              <th>الموقع / القطعة</th>
              <th>نوع التقرير / المادة</th>
              <th>الكمية المعتمدة</th>
              <th>المسؤول المعتمد</th>
              <th>الملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {reportsData.map((r) => (<tr key={r.id}>
                <td><span className="code-badge">#REP-0{r.id}</span></td>
                <td>{r.date?.split('T')[0]}</td>
                <td><span className="sector-tag">{r.crusherName}</span></td>
                <td><strong>{r.materialName}</strong></td>
                <td><span className="stock-pill">{r.productionAmount}</span></td>
                <td>{r.uploadedBy || 'م. عبدالرحمن'}</td>
                <td style={{ fontSize: '0.82rem', color: '#475569' }}>{r.notes || '—'}</td>
              </tr>))}
          </tbody>
        </table>
      </div>
    </div>);
};
