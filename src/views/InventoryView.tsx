import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  FileSpreadsheet, 
  TrendingUp, 
  Layers,
  X,
  Compass,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface InventoryItem {
  id: string;
  materialName: string;
  sector: string;
  totalStockTons: number;
  lastUpdated: string;
  unit: string;
  threshold: number;
}

export const InventoryView: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({ materialName: 'شرشور ناعم 0-5 مم', sector: 'القطعة A', amount: 500, type: 'in', note: '' });

  const fetchInventoryData = async () => {
    try {
      setIsLoading(true);
      const [sharshoorRes, crusherRes] = await Promise.all([
        fetch('http://localhost:5000/api/sharshoor').then(r => r.json()).catch(() => ({})),
        fetch('http://localhost:5000/api/crushers').then(r => r.json()).catch(() => ({}))
      ]);

      const sharshoorLogs = sharshoorRes.logs || [];
      const crusherLogs = crusherRes.logs || [];

      // Calculate live stock if any records exist
      const totalSharshoorTons = sharshoorLogs.reduce((acc: number, curr: any) => acc + (curr.amountTons || 0), 0);
      const totalCrusherStock = crusherLogs.reduce((acc: number, curr: any) => acc + (curr.dailyProductionTons || 0), 0);

      const dynamicItems: InventoryItem[] = [];
      if (totalSharshoorTons > 0 || totalCrusherStock > 0) {
        dynamicItems.push({
          id: 'INV-01',
          materialName: 'شرشور وركام ناتج التكسير',
          sector: 'القطعة A',
          totalStockTons: totalSharshoorTons || totalCrusherStock,
          lastUpdated: new Date().toISOString().split('T')[0],
          unit: 'طن',
          threshold: 5000
        });
      }

      setInventory(dynamicItems);
      setLogs(sharshoorLogs);
    } catch (e) {
      console.error('Error fetching inventory data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const totalStock = inventory.reduce((acc, curr) => acc + curr.totalStockTons, 0);

  const filteredInventory = inventory.filter(item =>
    item.materialName.includes(searchTerm) || item.sector.includes(searchTerm)
  );

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const newAmount = Number(form.amount);
    const newItem: InventoryItem = {
      id: `INV-0${inventory.length + 1}`,
      materialName: form.materialName,
      sector: form.sector,
      totalStockTons: newAmount,
      lastUpdated: new Date().toISOString().split('T')[0],
      unit: 'طن',
      threshold: 1000
    };

    setInventory([...inventory, newItem]);

    const newLog = {
      id: `TX-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      material: form.materialName,
      amount: newAmount,
      type: form.type,
      note: form.note || (form.type === 'in' ? 'توريد يدوي' : 'صرف يدوي')
    };

    setLogs([newLog, ...logs]);
    setIsModalOpen(false);
  };

  const exportExcel = () => {
    const data = inventory.map(item => ({
      'كود المادة': item.id,
      'نوع المادة': item.materialName,
      'القطعة': item.sector,
      'الرصيد المتوفر': item.totalStockTons,
      'الوحدة': item.unit,
      'تاريخ آخر تحديث': item.lastUpdated
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'المخزون العام');
    XLSX.writeFile(wb, 'تقرير_المخزون_العام_للمواد.xlsx');
  };

  return (
    <div className="view-content">
      {/* Top 3 Metric Cards */}
      <div className="top-5-metrics-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="kpi-metric-card">
          <div className="kpi-card-header">
            <span className="kpi-title">إجمالي الرصيد المخزني المتاح</span>
            <div className="kpi-icon-circle blue"><Package size={20} /></div>
          </div>
          <div className="kpi-value-center">
            <span className="kpi-big-num">{totalStock.toLocaleString()}</span>
            <span className="kpi-unit-label">طن</span>
          </div>
          <div className="kpi-bottom-sub">
            <span className="kpi-green-badge">محسوب آلياً من التقارير</span>
          </div>
        </div>

        <div className="kpi-metric-card">
          <div className="kpi-card-header">
            <span className="kpi-title">أصناف المواد المعتمدة</span>
            <div className="kpi-icon-circle emerald"><Layers size={20} /></div>
          </div>
          <div className="kpi-value-center">
            <span className="kpi-big-num">{inventory.length}</span>
            <span className="kpi-unit-label">أصناف</span>
          </div>
          <div className="kpi-bottom-sub"><span className="kpi-gray-text">شرشور • ركام • مواد أساس</span></div>
        </div>

        <div className="kpi-metric-card">
          <div className="kpi-card-header">
            <span className="kpi-title">حركات التوريد والصرف</span>
            <div className="kpi-icon-circle orange"><Compass size={20} /></div>
          </div>
          <div className="kpi-value-center">
            <span className="kpi-big-num">{logs.length}</span>
            <span className="kpi-unit-label">عملية</span>
          </div>
          <div className="kpi-bottom-sub"><span className="kpi-gray-text">سجل الوارد والمنصرف المعتمد</span></div>
        </div>
      </div>

      {/* Table Controls */}
      <div className="table-controls-bar">
        <div className="search-input-box">
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="بحث بنوع المادة أو القطعة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <button className="secondary-action-btn" onClick={fetchInventoryData} title="تحديث">
            <RefreshCw size={16} />
            <span>تحديث</span>
          </button>
          <button className="secondary-action-btn" onClick={exportExcel}>
            <FileSpreadsheet size={17} />
            <span>تصدير إكسل</span>
          </button>
          <button className="primary-action-btn" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            <span>إضافة صنف / رصيد</span>
          </button>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="table-container" style={{ marginBottom: '2rem' }}>
        {filteredInventory.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <Package size={40} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
            <p>لا توجد أرصدة مخزون مسجلة حالياً. يتم احتساب الأرصدة تلقائياً عند رفع التقارير أو إضافة رصيد جديد.</p>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>كود الصنف</th>
                <th>نوع المادة والمنتج</th>
                <th>القطعة الميدانية</th>
                <th>الرصيد المخزني الحالي</th>
                <th>الوحدة</th>
                <th>تاريخ آخر تحديث</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.id}>
                  <td><span className="code-badge">{item.id}</span></td>
                  <td><strong>{item.materialName}</strong></td>
                  <td><span className="sector-tag">{item.sector}</span></td>
                  <td><span className="stock-pill"><strong>{item.totalStockTons.toLocaleString()}</strong> طن</span></td>
                  <td>{item.unit}</td>
                  <td>{item.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>إضافة صنف أو تحديث رصيد مخزني</h3>
              <button onClick={() => setIsModalOpen(false)} className="close-btn"><X size={20} /></button>
            </div>

            <form onSubmit={handleUpdate} className="modal-form">
              <div className="form-group">
                <label className="form-label">نوع المادة / الصنف <span className="required-asterisk">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={form.materialName}
                  onChange={(e) => setForm({ ...form, materialName: e.target.value })}
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">القطعة الميدانية</label>
                  <select className="form-input" value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })}>
                    <option value="القطعة A">القطعة A</option>
                    <option value="القطعة B">القطعة B</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">الكمية (طن) <span className="required-asterisk">*</span></label>
                  <input
                    type="number"
                    className="form-input"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="primary-action-btn" style={{ width: '100%', height: '48px', justifyContent: 'center' }}>
                  حفظ وتسجيل الصنف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
