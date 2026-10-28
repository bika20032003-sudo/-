import React, { useState, useEffect } from 'react';
import { 
  Truck, Plus, Minus, Search, RefreshCw, FileSpreadsheet, Printer, 
  CheckCircle2, AlertOctagon, Wrench, Edit3, Trash2, X, Check,
  Layers, MapPin, Eye, FileText, ShieldCheck, ClipboardList
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { fastFetch, clearApiCache } from '../utils/apiCache.js';
import { EquipmentInspectionModal } from '../components/EquipmentInspectionModal';

export const EquipmentView = ({ currentUser }) => {
  // Official baseline equipment requirements for the 360 km project
  const initialDefaultEquipment = [
    { id: 1, name: 'ماكينة إعادة التدوير (FDR)', type: 'معدات تدوير وأساس', count: 3, operationalCount: 3, maintenanceCount: 0, phase1Count: 2, phase2Count: 1, status: 'operational', notes: 'ماكينات فرم وتأهيل طبقة الأساس والأسفلت' },
    { id: 2, name: 'جريدر تسوية وضبط مناسيب', type: 'معدات تسوية وفرش', count: 2, operationalCount: 2, maintenanceCount: 0, phase1Count: 1, phase2Count: 1, status: 'operational', notes: 'ضبط المناسيب والميول الهندسية' },
    { id: 3, name: 'هراس حافر غنم (دك عميق)', type: 'معدات دك ودمك', count: 3, operationalCount: 3, maintenanceCount: 0, phase1Count: 2, phase2Count: 1, status: 'operational', notes: 'دك أولي لطبقة الفرمة والأساس' },
    { id: 4, name: 'هراس تربة ناعم (Smooth Drum)', type: 'معدات دك ودمك', count: 3, operationalCount: 3, maintenanceCount: 0, phase1Count: 2, phase2Count: 1, status: 'operational', notes: 'دمك نهائي وتثبيت السطح' },
    { id: 5, name: 'تانك صهريج مياه', type: 'شاحنات صهريج', count: 7, operationalCount: 7, maintenanceCount: 0, phase1Count: 3, phase2Count: 3, status: 'operational', notes: 'رش وترطيب وتغذية ماكينات FDR' },
    { id: 6, name: 'لودر تشوين ومناولة', type: 'معدات ثقيلة', count: 1, operationalCount: 1, maintenanceCount: 0, phase1Count: 1, phase2Count: 0, status: 'operational', notes: 'مناولة الركام ومواد الفرمة' },
    { id: 7, name: 'قلابات نقل مواد وركام', type: 'شاحنات نقل', count: 1, operationalCount: 1, maintenanceCount: 0, phase1Count: 1, phase2Count: 0, status: 'operational', notes: 'نقل وتوزيع مواد الردم والأساس' },
    { id: 8, name: 'ماسينزا رش الأسفلت (MCO)', type: 'معدات رش أسفلت', count: 1, operationalCount: 1, maintenanceCount: 0, phase1Count: 1, phase2Count: 0, status: 'operational', notes: 'رش طبقة التشريب والأسفلت السائل' },
    { id: 9, name: 'جرار زراعي خدمي وسحب', type: 'آليات مساعدة', count: 1, operationalCount: 1, maintenanceCount: 0, phase1Count: 1, phase2Count: 0, status: 'operational', notes: 'أعمال مساعدة وسحب المعدات بالمسار' },
    { id: 10, name: 'طاقم مساحة متكامل', type: 'أجهزة مساحة وهندسة', count: 3, operationalCount: 3, maintenanceCount: 0, phase1Count: 1, phase2Count: 1, status: 'operational', notes: 'عدد 3 طواقم مساحة (6 أفراد) لضبط المناسيب' }
  ];

  const [equipmentList, setEquipmentList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('all'); // 'all' | 'phase1' | 'phase2'
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    type: 'معدات الطريق',
    count: 1,
    phase1Count: 1,
    phase2Count: 0,
    operationalCount: 1,
    maintenanceCount: 0,
    status: 'operational',
    notes: ''
  });

  // Fetch or consolidate equipment
  const fetchEquipment = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/equipment');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.equipment) && data.equipment.length > 0) {
        // Check if list is individual machines or counted equipment
        const rawList = data.equipment;
        const hasCounts = rawList.some(item => typeof item.count === 'number' && item.count > 1);

        if (hasCounts) {
          setEquipmentList(rawList);
        } else {
          // Group individual records by machine type/name
          const groupedMap = {};
          rawList.forEach(eq => {
            const key = eq.type || eq.name || 'آلية';
            if (!groupedMap[key]) {
              groupedMap[key] = {
                id: eq.id || Date.now(),
                name: key,
                type: eq.category || 'معدات الطريق',
                count: 0,
                operationalCount: 0,
                maintenanceCount: 0,
                phase1Count: 0,
                phase2Count: 0,
                status: 'operational',
                notes: eq.notes || ''
              };
            }
            groupedMap[key].count += 1;
            const isOp = eq.status === 'operational' || eq.status === 'جاهز' || eq.status === 'working';
            if (isOp) groupedMap[key].operationalCount += 1;
            else groupedMap[key].maintenanceCount += 1;

            const loc = String(eq.location || eq.sector || '');
            if (loc.includes('الثانية') || loc.includes('B')) {
              groupedMap[key].phase2Count += 1;
            } else {
              groupedMap[key].phase1Count += 1;
            }
          });

          const consolidated = Object.values(groupedMap);
          if (consolidated.length > 0) {
            setEquipmentList(consolidated);
          } else {
            setEquipmentList(initialDefaultEquipment);
          }
        }
      } else {
        setEquipmentList(initialDefaultEquipment);
      }
    } catch (err) {
      console.warn('Backend unavailable, using default road equipment list:', err);
      setEquipmentList(initialDefaultEquipment);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  // Quick Counter Increment / Decrement
  const handleUpdateCount = async (id, delta) => {
    const updatedList = equipmentList.map(item => {
      if (item.id === id) {
        const newCount = Math.max(0, (Number(item.count) || 0) + delta);
        const opDiff = Math.max(0, (Number(item.operationalCount) || 0) + delta);
        return {
          ...item,
          count: newCount,
          operationalCount: opDiff
        };
      }
      return item;
    });

    setEquipmentList(updatedList);

    // Save update to backend if possible
    try {
      const target = updatedList.find(i => i.id === id);
      if (target) {
        await fetch(`http://localhost:5000/api/equipment/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(target)
        });
        clearApiCache();
      }
    } catch (e) {
      console.warn('Local update only:', e);
    }
  };

  // Open modal for new item
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      type: 'معدات الطريق',
      count: 1,
      phase1Count: 1,
      phase2Count: 0,
      operationalCount: 1,
      maintenanceCount: 0,
      status: 'operational',
      notes: ''
    });
    setIsModalOpen(true);
  };

  // Open modal for editing existing item
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      type: item.type || 'معدات الطريق',
      count: item.count || 1,
      phase1Count: item.phase1Count || 0,
      phase2Count: item.phase2Count || 0,
      operationalCount: item.operationalCount || item.count || 1,
      maintenanceCount: item.maintenanceCount || 0,
      status: item.status || 'operational',
      notes: item.notes || ''
    });
    setIsModalOpen(true);
  };

  // Save Modal Form
  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const countNum = Math.max(0, parseInt(formData.count, 10) || 1);
    const p1Num = Math.min(countNum, parseInt(formData.phase1Count, 10) || 0);
    const p2Num = Math.max(0, countNum - p1Num);
    const opNum = Math.min(countNum, parseInt(formData.operationalCount, 10) || countNum);
    const mainNum = Math.max(0, countNum - opNum);

    if (editingItem) {
      // Update
      const updatedItem = {
        ...editingItem,
        name: formData.name.trim(),
        type: formData.type || 'معدات الطريق',
        count: countNum,
        phase1Count: p1Num,
        phase2Count: p2Num,
        operationalCount: opNum,
        maintenanceCount: mainNum,
        status: mainNum > 0 && opNum === 0 ? 'maintenance' : 'operational',
        notes: formData.notes || ''
      };

      setEquipmentList(prev => prev.map(i => i.id === editingItem.id ? updatedItem : i));
      setIsModalOpen(false);

      try {
        await fetch(`http://localhost:5000/api/equipment/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem)
        });
        clearApiCache();
      } catch (err) {
        console.warn('Saved in local state:', err);
      }
    } else {
      // Create New
      const newItem = {
        id: Date.now(),
        name: formData.name.trim(),
        type: formData.type || 'معدات الطريق',
        count: countNum,
        phase1Count: p1Num,
        phase2Count: p2Num,
        operationalCount: opNum,
        maintenanceCount: mainNum,
        status: 'operational',
        notes: formData.notes || ''
      };

      setEquipmentList(prev => [newItem, ...prev]);
      setIsModalOpen(false);

      try {
        await fetch('http://localhost:5000/api/equipment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem)
        });
        clearApiCache();
      } catch (err) {
        console.warn('Saved in local state:', err);
      }
    }
  };

  // Delete Item
  const handleDeleteItem = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المعدة من السجل؟')) return;
    setEquipmentList(prev => prev.filter(i => i.id !== id));
    try {
      await fetch(`http://localhost:5000/api/equipment/${id}`, { method: 'DELETE' });
      clearApiCache();
    } catch (e) {}
  };

  // Export Excel
  const handleExportExcel = () => {
    const exportRows = equipmentList.map((item, idx) => ({
      'م': idx + 1,
      'اسم المعدة / الآلية': item.name,
      'التصنيف والنوع': item.type || 'معدات الطريق',
      'العدد الإجمالي المتوفر بالموقع': item.count,
      'العدد الجاهز والعامل': item.operationalCount ?? item.count,
      'العدد قيد الصيانة': item.maintenanceCount ?? 0,
      'ملاحظات التشغيل الميداني': item.notes || '—'
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'سجل أسماء وأعداد المعدات');
    XLSX.writeFile(wb, `سجل_اسماء_واعدام_المعدات_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Stats calculation
  const totalCount = equipmentList.reduce((acc, curr) => acc + (Number(curr.count) || 0), 0);
  const totalOperational = equipmentList.reduce((acc, curr) => acc + (Number(curr.operationalCount) || Number(curr.count) || 0), 0);
  const totalMaintenance = equipmentList.reduce((acc, curr) => acc + (Number(curr.maintenanceCount) || 0), 0);
  const phase1Total = equipmentList.reduce((acc, curr) => acc + (Number(curr.phase1Count) || 0), 0);
  const phase2Total = equipmentList.reduce((acc, curr) => acc + (Number(curr.phase2Count) || 0), 0);
  const readinessRate = totalCount > 0 ? ((totalOperational / totalCount) * 100).toFixed(1) : '100.0';

  // Filtered list
  const filteredList = equipmentList.filter(item => {
    const term = searchTerm.toLowerCase();
    const matchSearch = item.name.toLowerCase().includes(term) || (item.type && item.type.toLowerCase().includes(term));
    if (!matchSearch) return false;

    if (phaseFilter === 'operational') return (item.operationalCount ?? item.count) > 0;
    if (phaseFilter === 'maintenance') return (item.maintenanceCount || 0) > 0;
    return true;
  });

  return (
    <div className="view-content" style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Top Banner & Control Bar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1.25rem 1.75rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
          }}>
            <Truck size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                إدارة سجل المعدات والآليات
              </h2>
              <span style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                background: '#f0fdf4',
                color: '#166534',
                border: '1px solid #bbf7d0',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px'
              }}>
                كشف الأسماء والعدد المعتمد 🚜
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem', margin: 0 }}>
              حصر دقيق ومباشر لأسماء المعدات وأعدادها المتوفرة والجاهزة في الموقع لمشروع صيانة طريق أوباري - غات
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button 
            type="button"
            onClick={() => setIsInspectionModalOpen(true)}
            style={{ 
              height: '38px', 
              padding: '0 1.25rem', 
              fontSize: '0.85rem',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
            }}
          >
            <ClipboardList size={16} />
            <span>📋 فورم كشف المعدات الميداني</span>
          </button>

          <button 
            className="primary-action-btn"
            onClick={handleOpenAdd}
            style={{ 
              height: '38px', 
              padding: '0 1.25rem', 
              fontSize: '0.85rem',
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
            }}
          >
            <Plus size={16} />
            <span>+ إضافة معدة بالاسم والعدد</span>
          </button>

          <button 
            className="secondary-action-btn"
            onClick={fetchEquipment}
            disabled={isLoading}
            style={{ height: '38px', padding: '0 1rem', fontSize: '0.85rem' }}
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            <span>تحديث</span>
          </button>

          <button 
            className="secondary-action-btn"
            onClick={handleExportExcel}
            style={{ height: '38px', padding: '0 1rem', fontSize: '0.85rem', color: '#16a34a', borderColor: '#bbf7d0' }}
          >
            <FileSpreadsheet size={16} />
            <span>تصدير Excel</span>
          </button>

          <button 
            className="secondary-action-btn"
            onClick={() => window.print()}
            style={{ height: '38px', padding: '0 1rem', fontSize: '0.85rem' }}
          >
            <Printer size={16} />
            <span>طباعة الكشف</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        
        {/* Total Equipment */}
        <div className="dashboard-white-card" style={{ padding: '1.25rem', borderTop: '4px solid #2563eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748b' }}>إجمالي عدد المعدات والآليات</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.2rem' }}>
            {totalCount} <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>آلية ومعدة</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            موزعة على {equipmentList.length} نوع وتصنيف معتمد
          </div>
        </div>

        {/* Operational */}
        <div className="dashboard-white-card" style={{ padding: '1.25rem', borderTop: '4px solid #16a34a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748b' }}>المعدات الجاهزة والعاملة</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#16a34a', marginBottom: '0.2rem' }}>
            {totalOperational} <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>آلية</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700 }}>
            نسبة الجاهزية التشغيلية: {readinessRate}%
          </div>
        </div>

        {/* Inspection Sheet Card */}
        <div className="dashboard-white-card" style={{ padding: '1.25rem', borderTop: '4px solid #0284c7', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748b' }}>كشف حصر وفحص المعدات</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList size={18} />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsInspectionModalOpen(true)}
            style={{
              width: '100%',
              marginTop: '0.35rem',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)'
            }}
          >
            <ClipboardList size={16} />
            <span>فتح فورم كشف المعدات 📋</span>
          </button>
        </div>

        {/* Maintenance */}
        <div className="dashboard-white-card" style={{ padding: '1.25rem', borderTop: '4px solid #eab308' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748b' }}>المعدات قيد الصيانة</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fefce8', color: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wrench size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: totalMaintenance > 0 ? '#ca8a04' : '#64748b', marginBottom: '0.2rem' }}>
            {totalMaintenance} <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>آلية</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: totalMaintenance > 0 ? '#a16207' : '#16a34a' }}>
            {totalMaintenance > 0 ? 'ورشة الصيانة الميدانية تتابع الجاهزية' : 'كافة المعدات تعمل بحالة ممتازة'}
          </div>
        </div>

      </div>

      {/* Main Table Card */}
      <div className="dashboard-white-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Table Toolbar & Search */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', gap: '4px' }}>
            <button
              onClick={() => setPhaseFilter('all')}
              style={{
                border: 'none',
                background: phaseFilter === 'all' ? '#ffffff' : 'transparent',
                color: phaseFilter === 'all' ? '#0f172a' : '#64748b',
                fontWeight: phaseFilter === 'all' ? 800 : 600,
                padding: '0.4rem 1rem',
                borderRadius: '8px',
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: phaseFilter === 'all' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              كافة المعدات ({equipmentList.length})
            </button>
            <button
              onClick={() => setPhaseFilter('operational')}
              style={{
                border: 'none',
                background: phaseFilter === 'operational' ? '#ffffff' : 'transparent',
                color: phaseFilter === 'operational' ? '#16a34a' : '#64748b',
                fontWeight: phaseFilter === 'operational' ? 800 : 600,
                padding: '0.4rem 1rem',
                borderRadius: '8px',
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: phaseFilter === 'operational' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              الجاهزة والعاملة ({equipmentList.filter(i => (i.operationalCount || i.count) > 0).length})
            </button>
            <button
              onClick={() => setPhaseFilter('maintenance')}
              style={{
                border: 'none',
                background: phaseFilter === 'maintenance' ? '#ffffff' : 'transparent',
                color: phaseFilter === 'maintenance' ? '#ca8a04' : '#64748b',
                fontWeight: phaseFilter === 'maintenance' ? 800 : 600,
                padding: '0.4rem 1rem',
                borderRadius: '8px',
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: phaseFilter === 'maintenance' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              قيد الصيانة ({equipmentList.filter(i => (i.maintenanceCount || 0) > 0).length})
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '280px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              className="form-input"
              placeholder="بحث باسم المعدة أو النوع..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingRight: '2.4rem', height: '38px', fontSize: '0.84rem', width: '100%' }}
            />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="responsive-table-wrap">
          <table className="custom-table" style={{ minWidth: '850px' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ width: '50px', textAlign: 'center' }}>م</th>
                <th style={{ minWidth: '240px' }}>اسم المعدة / الآلية الميدانية</th>
                <th style={{ width: '180px' }}>التصنيف الفني</th>
                <th style={{ width: '180px', textAlign: 'center' }}>العدد الإجمالي المتوفر</th>
                <th style={{ width: '140px', textAlign: 'center' }}>حالة الجاهزية</th>
                <th style={{ width: '130px', textAlign: 'center' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <Truck size={36} color="#cbd5e1" style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                    <p style={{ margin: 0, fontWeight: 700 }}>لا توجد معدات مطابقة للبحث أو التصفية.</p>
                  </td>
                </tr>
              ) : (
                filteredList.map((item, index) => {
                  const count = Number(item.count) || 0;
                  const p1 = item.phase1Count ?? Math.ceil(count / 2);
                  const p2 = item.phase2Count ?? Math.floor(count / 2);
                  const isMaintenance = item.maintenanceCount > 0;

                  return (
                    <tr key={item.id}>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: '#64748b' }}>
                        {index + 1}
                      </td>

                      {/* Equipment Name */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: '#eff6ff',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            flexShrink: 0
                          }}>
                            🚜
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.94rem', color: '#0f172a', display: 'block' }}>
                              {item.name}
                            </strong>
                            {item.notes && (
                              <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                                {item.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td>
                        <span style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          background: '#f1f5f9',
                          color: '#334155'
                        }}>
                          {item.type || 'معدات الطريق'}
                        </span>
                      </td>

                      {/* Count with Direct + / - buttons */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '3px 8px' }}>
                          <button
                            onClick={() => handleUpdateCount(item.id, -1)}
                            disabled={count <= 0}
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '6px',
                              border: 'none',
                              background: count <= 0 ? '#e2e8f0' : '#ffffff',
                              color: count <= 0 ? '#94a3b8' : '#dc2626',
                              fontWeight: 900,
                              cursor: count <= 0 ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                            }}
                            title="إنقاص العدد بواحد"
                          >
                            <Minus size={13} />
                          </button>

                          <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', minWidth: '32px', textAlign: 'center' }}>
                            {count}
                          </span>

                          <button
                            onClick={() => handleUpdateCount(item.id, 1)}
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '6px',
                              border: 'none',
                              background: '#ffffff',
                              color: '#16a34a',
                              fontWeight: 900,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                            }}
                            title="زيادة العدد بواحد"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </td>


                      {/* Status */}
                      <td style={{ textAlign: 'center' }}>
                        {isMaintenance ? (
                          <span style={{ background: '#fefce8', color: '#a16207', border: '1px solid #fef08a', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                            {item.maintenanceCount} صيانة
                          </span>
                        ) : (
                          <span style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                            ✓ جاهزة بالكامل
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            style={{
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#1d4ed8',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                            title="تعديل المعدة والعدد"
                          >
                            <Edit3 size={13} />
                            <span>تعديل</span>
                          </button>

                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            style={{
                              background: '#fef2f2',
                              border: '1px solid #fecaca',
                              color: '#dc2626',
                              padding: '0.35rem 0.55rem',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                            title="حذف من السجل"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Simplified Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '540px',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            direction: 'rtl'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Truck size={20} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                  {editingItem ? 'تعديل بيانات المعدة والعدد' : 'إضافة معدة جديدة للسجل'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveModal}>
              
              {/* Name */}
              <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 800 }}>
                  اسم المعدة / الآلية الميدانية *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="مثال: ماكينة FDR، جريدر تسوية، هراس..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{ fontWeight: 800, fontSize: '0.9rem' }}
                />
              </div>

              {/* Type & Total Count */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                    التصنيف الفني
                  </label>
                  <select
                    className="form-input"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={{ fontWeight: 700 }}
                  >
                    <option value="معدات تدوير وأساس">معدات تدوير وأساس</option>
                    <option value="معدات تسوية وفرش">معدات تسوية وفرش</option>
                    <option value="معدات دك ودمك">معدات دك ودمك</option>
                    <option value="شاحنات صهريج">شاحنات صهريج</option>
                    <option value="شاحنات نقل">شاحنات نقل</option>
                    <option value="معدات رش أسفلت">معدات رش أسفلت</option>
                    <option value="آليات مساعدة">آليات مساعدة</option>
                    <option value="أجهزة مساحة وهندسة">أجهزة مساحة وهندسة</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 800, color: '#16a34a' }}>
                    العدد الإجمالي المتوفر *
                  </label>
                  <input
                    type="text" inputMode="decimal" dir="ltr" lang="en"
                    className="form-input"
                    min="1"
                    value={formData.count}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 1;
                      setFormData({
                        ...formData,
                        count: val,
                        operationalCount: val,
                        phase1Count: Math.ceil(val / 2),
                        phase2Count: Math.floor(val / 2)
                      });
                    }}
                    required
                    style={{ fontWeight: 900, fontSize: '1.05rem', color: '#16a34a' }}
                  />
                </div>
              </div>

              {/* Phase Distribution */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c2410c' }}>
                    العدد في المرحلة الأولى
                  </label>
                  <input
                    type="text" inputMode="decimal" dir="ltr" lang="en"
                    className="form-input"
                    min="0"
                    value={formData.phase1Count}
                    onChange={(e) => setFormData({ ...formData, phase1Count: parseInt(e.target.value, 10) || 0 })}
                    style={{ fontWeight: 800 }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0369a1' }}>
                    العدد في المرحلة الثانية
                  </label>
                  <input
                    type="text" inputMode="decimal" dir="ltr" lang="en"
                    className="form-input"
                    min="0"
                    value={formData.phase2Count}
                    onChange={(e) => setFormData({ ...formData, phase2Count: parseInt(e.target.value, 10) || 0 })}
                    style={{ fontWeight: 800 }}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                  ملاحظات التشغيل الميداني
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="ملاحظات حول موقع الآلية أو طبيعة عملها..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="secondary-action-btn"
                  onClick={() => setIsModalOpen(false)}
                  style={{ height: '38px', padding: '0 1.25rem' }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="primary-action-btn"
                  style={{
                    height: '38px',
                    padding: '0 1.5rem',
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                    border: 'none',
                    fontWeight: 800
                  }}
                >
                  <Check size={16} />
                  <span>{editingItem ? 'تحديث السجل' : 'حفظ المعدة'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Equipment Inspection Modal Form */}
      <EquipmentInspectionModal
        isOpen={isInspectionModalOpen}
        onClose={() => setIsInspectionModalOpen(false)}
        currentUser={currentUser}
      />

    </div>
  );
};

export default EquipmentView;
