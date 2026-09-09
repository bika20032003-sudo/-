import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  FileSpreadsheet, 
  Mountain, 
  TrendingUp, 
  Calendar,
  X,
  CheckCircle2
} from 'lucide-react';
import { CrusherStock } from '../types';
import { initialCrusherStocks } from '../data/mockData';
import * as XLSX from 'xlsx';

export const CrusherView: React.FC = () => {
  const [crushers, setCrushers] = useState<CrusherStock[]>(initialCrusherStocks);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<CrusherStock>>({
    crusherName: 'الكسارة المركزية رقم 1 (المقلع الشمالي)',
    location: 'محطة الكسارات أوباري',
    dailyProductionM3: 500,
    totalStockM3: 40000,
    aggregateType: 'شرشور ناعم 0-5 مم'
  });

  const totalStockAll = crushers.reduce((acc, curr) => acc + (curr.totalStockM3 || curr.totalStockTons || 0), 0);
  const totalDailyProd = crushers.reduce((acc, curr) => acc + (curr.dailyProductionM3 || curr.dailyProductionTons || 0), 0);

  const handleUpdateStock = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = crushers.map(c => {
      if (c.crusherName === formData.crusherName) {
        return {
          ...c,
          dailyProductionM3: Number(formData.dailyProductionM3) || c.dailyProductionM3 || 0,
          totalStockM3: (c.totalStockM3 || 0) + (Number(formData.dailyProductionM3) || 0),
          lastUpdated: '2026-08-16'
        };
      }
      return c;
    });

    setCrushers(updated);
    setIsModalOpen(false);
  };

  const exportToExcel = () => {
    const data = crushers.map(c => ({
      'اسم وحدة الكسارة / المقلع': c.crusherName,
      'الموقع الميداني': c.location,
      'نوع الركام / الشرشور': c.aggregateType,
      'الإنتاج اليومي (م³)': c.dailyProductionM3,
      'إجمالي المخزون التراكمي (م³)': c.totalStockM3,
      'الحالة التشغيلية': c.status === 'active' ? 'تعمل بكفاءة' : 'صيانة',
      'تاريخ آخر تحديث': c.lastUpdated
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'أرصدة الكسارات والشرشور');
    XLSX.writeFile(wb, 'أرصدة_الكسارات_والشرشور_جهاز_مشروعات_المواصلات.xlsx');
  };

  return (
    <div className="view-content">
      {/* Top Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card emerald">
          <div className="metric-card-header">
            <span className="metric-badge emerald">إجمالي المخزون الكلي</span>
            <div className="metric-icon-wrap emerald">
              <Mountain size={22} />
            </div>
          </div>
          <div className="metric-value-wrap">
            <h2>{totalStockAll.toLocaleString()} <span className="sub-val">م³</span></h2>
            <p>المخزون الإجمالي للشرشور والركام</p>
          </div>
        </div>

        <div className="metric-card primary">
          <div className="metric-card-header">
            <span className="metric-badge green">الإنتاج اليومي الحالي</span>
            <div className="metric-icon-wrap primary">
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="metric-value-wrap">
            <h2>+{totalDailyProd.toLocaleString()} <span className="sub-val">م³/اليوم</span></h2>
            <p>معدل تكسير وغربلة المواد</p>
          </div>
        </div>

        <div className="metric-card amber">
          <div className="metric-card-header">
            <span className="metric-badge amber">وحدات التكسير العاملة</span>
            <div className="metric-icon-wrap amber">
              <Layers size={22} />
            </div>
          </div>
          <div className="metric-value-wrap">
            <h2>3 <span className="sub-val">/ 3 كسارات</span></h2>
            <p>جاهزية خطوط الإنتاج بنسبة 100%</p>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="table-controls-bar">
        <div className="search-input-box">
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="بحث باسم الكسارة، الموقع، أو نوع الركام والشرشور..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <button className="secondary-action-btn" onClick={exportToExcel}>
            <FileSpreadsheet size={17} />
            <span>تصدير إكسل</span>
          </button>

          <button className="primary-action-btn" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            <span>تسجيل دفعة إنتاج يومية</span>
          </button>
        </div>
      </div>

      {/* Crushers Detailed Cards / Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>اسم الكسارة / المقلع</th>
              <th>الموقع الميداني</th>
              <th>نوعية المواد والركام</th>
              <th>معدل الإنتاج اليومي</th>
              <th>إجمالي الرصيد المخزني</th>
              <th>الحالة التشغيلية</th>
              <th>تاريخ التحديث</th>
            </tr>
          </thead>
          <tbody>
            {crushers.map(c => (
              <tr key={c.id}>
                <td>
                  <strong>{c.crusherName}</strong>
                </td>
                <td>{c.location}</td>
                <td>
                  <span className="category-tag">{c.aggregateType}</span>
                </td>
                <td>
                  <strong style={{ color: '#059669' }}>+{(c.dailyProductionM3 || c.dailyProductionTons || 0).toLocaleString()} م³</strong>
                </td>
                <td>
                  <span className="stock-pill">{(c.totalStockM3 || c.totalStockTons || 0).toLocaleString()} م³</span>
                </td>
                <td>
                  <span className="status-badge operational">تعمل بكفاءة</span>
                </td>
                <td>{c.lastUpdated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Production Batch Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card small">
            <div className="modal-header">
              <h3>تسجيل إنتاج وتوريد شرشور وركام يومي</h3>
              <button onClick={() => setIsModalOpen(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateStock} className="modal-form">
              <div className="form-group">
                <label className="form-label">اختر وحدة الكسارة / الموقع</label>
                <select
                  className="form-input"
                  value={formData.crusherName}
                  onChange={(e) => setFormData({ ...formData, crusherName: e.target.value })}
                >
                  {crushers.map(c => (
                    <option key={c.id} value={c.crusherName}>{c.crusherName}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">الكمية المنتجة المضافة اليوم (م³)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.dailyProductionM3}
                  onChange={(e) => setFormData({ ...formData, dailyProductionM3: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-action-btn" onClick={() => setIsModalOpen(false)}>
                  إلغاء
                </button>
                <button type="submit" className="primary-action-btn">
                  تحديث وإضافة الرصيد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
