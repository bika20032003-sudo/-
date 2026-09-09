import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  CheckCircle2, 
  Info,
  AlertTriangle
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface LogItem {
  id: string;
  date: string;
  time: string;
  user: string;
  action: string;
  details: string;
  category: 'report' | 'fuel' | 'production' | 'user' | 'system';
  ipAddress: string;
}

export const ActivityLogView: React.FC = () => {
  const [logs, setLogs] = useState<LogItem[]>([
    { id: 'LOG-001', date: '2026/08/16', time: '12:05', user: 'م. يحيى التاورغي', action: 'رفع تقرير ميداني', details: 'تم رفع تقرير حركة المعدات اليومي للقطعة A بنجاح', category: 'report', ipAddress: '192.168.1.45' },
    { id: 'LOG-002', date: '2026/08/16', time: '11:32', user: 'علي الفرجاني', action: 'تسجيل صرف وقود', details: 'إصدار إذن صرف وقود بقيمة 950 لتر للكسارة رقم 1', category: 'fuel', ipAddress: '192.168.1.102' },
    { id: 'LOG-003', date: '2026/08/16', time: '10:15', user: 'م. يحيى التاورغي', action: 'تسجيل إنتاج كسارة', details: 'تحديث إنتاج الكسارة الشمالية (1250 طن و800 طن شرشور)', category: 'production', ipAddress: '192.168.1.45' },
    { id: 'LOG-004', date: '2026/08/16', time: '09:00', user: 'د. المهدي الشريف', action: 'تسجيل دخول للنظام', details: 'تسجيل دخول ناجح للمدير العام لفرع المنطقة الجنوبية', category: 'system', ipAddress: '192.168.1.22' },
    { id: 'LOG-005', date: '2026/08/15', time: '16:45', user: 'م. عبدالسلام الورفلي', action: 'اعتماد تقرير يومي', details: 'اعتماد البيان الشامل لحركة المعدات والوقود ليوم 15 أغسطس', category: 'report', ipAddress: '192.168.1.12' },
    { id: 'LOG-006', date: '2026/08/15', time: '14:20', user: 'علي الفرجاني', action: 'تعديل بيانات مخزون', details: 'تعديل رصيد الشرشور المتاح في مخزن القطعة B يدوياً', category: 'production', ipAddress: '192.168.1.102' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = logs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const exportExcel = () => {
    const data = logs.map(l => ({
      'رقم العملية': l.id,
      'التاريخ': l.date,
      'الوقت': l.time,
      'المستخدم': l.user,
      'نوع الإجراء': l.action,
      'التفاصيل': l.details,
      'العنوان الرقمي IP': l.ipAddress
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'سجل العمليات والتدقيق');
    XLSX.writeFile(wb, 'سجل_العمليات_والتدقيق_اليومي.xlsx');
  };

  return (
    <div className="view-content">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>سجل تدقيق الأنشطة والعمليات الفورية</h2>
        <p style={{ fontSize: '0.86rem', color: '#64748b' }}>
          مراقبة عمليات الإدخال والتعديل وتغيير الصلاحيات وحركات أذونات الصرف التي تتم عبر المنظومة لضمان مطابقة البيانات
        </p>
      </div>

      <div className="table-controls-bar">
        <div className="search-input-box" style={{ maxWidth: '350px' }}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="بحث بالمستخدم، نوع العملية، أو التفاصيل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <select className="filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">كافة الفئات</option>
            <option value="report">تقارير واعتمادات</option>
            <option value="fuel">صرف وقود</option>
            <option value="production">إنتاج ومخازن</option>
            <option value="system">أمن ونظام</option>
          </select>

          <button className="secondary-action-btn" onClick={exportExcel}>
            <FileSpreadsheet size={17} />
            <span>تصدير إكسل</span>
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>رقم الإجراء</th>
              <th>التاريخ والوقت</th>
              <th>المستخدم المسؤول</th>
              <th>نوع العملية</th>
              <th>التفاصيل والبيان الميداني</th>
              <th>العنوان الرقمي IP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(log => (
              <tr key={log.id}>
                <td><span className="code-badge">{log.id}</span></td>
                <td>{log.date} ({log.time})</td>
                <td><strong>{log.user}</strong></td>
                <td>
                  <span 
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.25rem', 
                      fontSize: '0.78rem', 
                      fontWeight: 700, 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '6px',
                      background: log.category === 'report' ? '#e0f2fe' : log.category === 'fuel' ? '#fef3c7' : log.category === 'production' ? '#dcfce7' : '#f1f5f9',
                      color: log.category === 'report' ? '#0369a1' : log.category === 'fuel' ? '#b45309' : log.category === 'production' ? '#15803d' : '#475569'
                    }}
                  >
                    {log.action}
                  </span>
                </td>
                <td style={{ fontSize: '0.85rem', color: '#334155' }}>{log.details}</td>
                <td style={{ color: '#94a3b8', fontSize: '0.8rem', fontFamily: 'monospace' }}>{log.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
