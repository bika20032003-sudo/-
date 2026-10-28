import React, { useState } from 'react';
import { 
  ClipboardList, CheckCircle2, AlertTriangle, Wrench, X, 
  Printer, Download, Plus, Trash2, Fuel, Clock, MapPin, 
  User, ShieldCheck, FileSpreadsheet, Truck 
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const EquipmentInspectionModal = ({ isOpen, onClose, onSave, currentUser }) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const daysOfWeek = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dayName = daysOfWeek[new Date().getDay()];

  const [inspectionData, setInspectionData] = useState({
    inspectionNumber: `EQ-INSP-${Date.now().toString().slice(-6)}`,
    date: todayStr,
    dayName: dayName,
    location: 'مسار طريق أوباري - غات (360 كم)',
    inspectorName: currentUser?.name || 'م. مهندس الآليات والمعدات',
    inspectorRole: currentUser?.title || currentUser?.role || 'مسؤول الحركة والآليات',
    notes: 'تم فحص ومطابقة المعدات والآليات بالموقع الميداني والتأكد من الجاهزية التشغيلية.'
  });

  const [equipmentRows, setEquipmentRows] = useState([
    { id: 1, name: 'ماكينة تدوير FDR-01', code: 'FDR-01', operator: 'محمود التاورغي', status: 'operational', meterHours: '1240', fuelLevel: '85%', notes: 'جاهزة للوردية الصباحية' },
    { id: 2, name: 'ماكينة تدوير FDR-02', code: 'FDR-02', operator: 'عبدالسلام الزروق', status: 'operational', meterHours: '980', fuelLevel: '90%', notes: 'جاهزة وتعمل بكفاءة' },
    { id: 3, name: 'جريدر CAT 140K', code: 'GRD-01', operator: 'علي الصويعي', status: 'operational', meterHours: '3420', fuelLevel: '75%', notes: 'أعمال تسوية وضبط مناسيب' },
    { id: 4, name: 'جريدر Komatsu 705', code: 'GRD-02', operator: 'عمر المهدوي', status: 'operational', meterHours: '2890', fuelLevel: '80%', notes: 'أعمال تسوية الأساس' },
    { id: 5, name: 'هراس حافر غنم Hamm', code: 'ROL-01', operator: 'محمد الطاهر', status: 'operational', meterHours: '1850', fuelLevel: '70%', notes: 'دك أولي لطبقة الفرمة' },
    { id: 6, name: 'هراس تربة ناعم Bomag', code: 'ROL-02', operator: 'إبراهيم غيث', status: 'operational', meterHours: '2100', fuelLevel: '85%', notes: 'دمك نهائي وتثبيت السطح' },
    { id: 7, name: 'صهريج مياه Mercedes (30 طن)', code: 'WTR-01', operator: 'فرج المقرحي', status: 'operational', meterHours: '4210', fuelLevel: '95%', notes: 'تغذية ماكينة FDR بالمياه' },
    { id: 8, name: 'لودر CAT 950', code: 'LDR-01', operator: 'يوسف العريبي', status: 'operational', meterHours: '3150', fuelLevel: '65%', notes: 'تشوين ومناولة الركام' },
    { id: 9, name: 'قلاب نقل ركام (4 محاور)', code: 'TRK-01', operator: 'جمعة السنوسي', status: 'operational', meterHours: '5120', fuelLevel: '80%', notes: 'نقل وتوزيع السن' },
    { id: 10, name: 'ماسينزا رش الأسفلت MCO', code: 'MSN-01', operator: 'رمضان الفيتوري', status: 'maintenance', meterHours: '1430', fuelLevel: '50%', notes: 'صيانة دورية للرشاشات والمضخة' }
  ]);

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Row operations
  const handleAddRow = () => {
    setEquipmentRows(prev => [
      ...prev,
      {
        id: Date.now(),
        name: '',
        code: '',
        operator: '',
        status: 'operational',
        meterHours: '',
        fuelLevel: '100%',
        notes: ''
      }
    ]);
  };

  const handleRemoveRow = (id) => {
    if (equipmentRows.length <= 1) return;
    setEquipmentRows(prev => prev.filter(r => r.id !== id));
  };

  const handleUpdateRow = (id, field, value) => {
    setEquipmentRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  // Calculations
  const totalInspected = equipmentRows.length;
  const operationalCount = equipmentRows.filter(r => r.status === 'operational').length;
  const maintenanceCount = equipmentRows.filter(r => r.status === 'maintenance').length;
  const stoppedCount = equipmentRows.filter(r => r.status === 'stopped').length;
  const readinessPct = totalInspected > 0 ? ((operationalCount / totalInspected) * 100).toFixed(1) : '0';

  // Export to Excel
  const handleExportExcel = () => {
    try {
      const dataRows = [
        ['كشف حصر وفحص المعدات والآليات الميدانية اليومي'],
        [`رقم الكشف: ${inspectionData.inspectionNumber}`, `التاريخ: ${inspectionData.date}`, `اليوم: ${inspectionData.dayName}`],
        [`الموقع: ${inspectionData.location}`, `المفتش / المشرف: ${inspectionData.inspectorName}`],
        [],
        ['م', 'اسم المعدة / الآلية', 'كود الآلية / اللوحة', 'السائق / المشغل', 'الحالة الفنية', 'ساعات التشغيل', 'مستوى الوقود', 'ملاحظات الفحص']
      ];

      equipmentRows.forEach((r, idx) => {
        dataRows.push([
          idx + 1,
          r.name || '-',
          r.code || '-',
          r.operator || '-',
          r.status === 'operational' ? 'جاهزة وتعمل' : r.status === 'maintenance' ? 'تحت الصيانة' : 'معطلة / متوقفة',
          r.meterHours || '-',
          r.fuelLevel || '-',
          r.notes || '-'
        ]);
      });

      dataRows.push([]);
      dataRows.push(['إجمالي المعدات المفحوصة:', totalInspected, 'الجاهزة والعاملة:', operationalCount, 'تحت الصيانة:', maintenanceCount, 'نسبة الجاهزية:', `${readinessPct}%`]);
      dataRows.push([]);
      dataRows.push(['مهندس الآليات:', inspectionData.inspectorName, '', 'مدير المشروع:', 'م. عبدالرحمن الأنصاري']);

      const ws = XLSX.utils.aoa_to_sheet(dataRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'كشف المعدات');
      XLSX.writeFile(wb, `كشف_المعدات_${inspectionData.inspectionNumber}.xlsx`);
    } catch (err) {
      console.error('Error exporting equipment sheet:', err);
    }
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Save
  const handleSave = () => {
    const sheetPayload = {
      ...inspectionData,
      id: `eq-sheet-${Date.now()}`,
      rows: equipmentRows,
      totalInspected,
      operationalCount,
      maintenanceCount,
      stoppedCount,
      readinessPct,
      createdAt: new Date().toISOString()
    };

    try {
      const existing = JSON.parse(localStorage.getItem('equipment_inspection_sheets') || '[]');
      existing.unshift(sheetPayload);
      localStorage.setItem('equipment_inspection_sheets', JSON.stringify(existing));
    } catch (e) {
      console.error('Error saving equipment inspection sheet:', e);
    }

    if (onSave) onSave(sheetPayload);

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(15, 23, 42, 0.78)',
      backdropFilter: 'blur(6px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      direction: 'rtl',
      padding: '1rem',
      overflowY: 'auto'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        maxWidth: '1150px',
        width: '100%',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        border: '1px solid #cbd5e1',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: '#ffffff',
          padding: '1.25rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid #1d4ed8'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ClipboardList size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>
                كشف حصر وفحص المعدات والآليات الميدانية
              </h2>
              <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                مشروع صيانة وتطوير طريق أوباري - غات (360 كم)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'rgba(255,255,255,0.18)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              <Printer size={15} />
              <span>طباعة</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: '#16a34a',
                color: '#fff',
                border: 'none',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              <FileSpreadsheet size={15} />
              <span>إكسل</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '0.4rem',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {savedSuccess && (
            <div style={{
              background: '#f0fdf4',
              color: '#166534',
              border: '1px solid #bbf7d0',
              padding: '0.85rem 1.25rem',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle2 size={18} />
              <span>تم حفظ كشف فحص المعدات بنجاح في السجل الميداني!</span>
            </div>
          )}

          {/* Meta Info Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '1.1rem',
            borderRadius: '12px'
          }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>
                رقم الكشف المرجعي
              </label>
              <input
                type="text"
                value={inspectionData.inspectionNumber}
                onChange={(e) => setInspectionData({ ...inspectionData, inspectionNumber: e.target.value })}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>
                تاريخ الكشف
              </label>
              <input
                type="date"
                value={inspectionData.date}
                onChange={(e) => setInspectionData({ ...inspectionData, date: e.target.value })}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>
                الموقع / المحطة الميدانية
              </label>
              <input
                type="text"
                value={inspectionData.location}
                onChange={(e) => setInspectionData({ ...inspectionData, location: e.target.value })}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>
                مهندس الفحص / المشرف
              </label>
              <input
                type="text"
                value={inspectionData.inspectorName}
                onChange={(e) => setInspectionData({ ...inspectionData, inspectorName: e.target.value })}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700 }}
              />
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem' }}>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '0.85rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.76rem', color: '#1e40af', fontWeight: 800 }}>إجمالي المعدات المفحوصة</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1d4ed8', marginTop: '0.15rem' }}>
                {totalInspected} <span style={{ fontSize: '0.8rem' }}>آلية</span>
              </div>
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.85rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.76rem', color: '#166534', fontWeight: 800 }}>المعدات الجاهزة والعاملة</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#15803d', marginTop: '0.15rem' }}>
                {operationalCount} <span style={{ fontSize: '0.8rem' }}>آلية</span>
              </div>
            </div>

            <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '10px', padding: '0.85rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.76rem', color: '#a16207', fontWeight: 800 }}>المعدات قيد الصيانة</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ca8a04', marginTop: '0.15rem' }}>
                {maintenanceCount} <span style={{ fontSize: '0.8rem' }}>آلية</span>
              </div>
            </div>

            <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '0.85rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.76rem', color: '#7e22ce', fontWeight: 800 }}>نسبة الجاهزية الميدانية</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#9333ea', marginTop: '0.15rem' }}>
                {readinessPct}%
              </div>
            </div>
          </div>

          {/* Equipment Table */}
          <div style={{ border: '1.5px solid #000000', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{
              background: '#0284c7',
              color: '#ffffff',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontWeight: 900, fontSize: '0.95rem' }}>
                جدول حصر المعدات والآليات وحالتها الفنية
              </span>
              <button
                type="button"
                onClick={handleAddRow}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: '#ffffff',
                  color: '#0284c7',
                  border: 'none',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                <Plus size={14} />
                <span>+ إضافة معدة للكشف</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#000000', fontWeight: 900 }}>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.6rem', width: '40px' }}>م</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.6rem', minWidth: '180px' }}>اسم ونوع المعدة</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.6rem', width: '110px' }}>كود الآلية / اللوحة</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.6rem', width: '140px' }}>السائق / المشغل</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.6rem', width: '140px' }}>الحالة الفنية</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.6rem', width: '110px' }}>العداد (ساعة)</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.6rem', width: '90px' }}>الوقود</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.6rem', minWidth: '160px' }}>ملاحظات الفحص</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.6rem', width: '50px' }}>حذف</th>
                  </tr>
                </thead>
                <tbody>
                  {equipmentRows.map((row, idx) => (
                    <tr key={row.id} style={{ background: idx % 2 === 0 ? '#ffffff' : '#fbfcfd' }}>
                      <td style={{ border: '1px solid #cbd5e1', padding: '0.45rem', fontWeight: 800 }}>{idx + 1}</td>
                      
                      <td style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => handleUpdateRow(row.id, 'name', e.target.value)}
                          placeholder="مثال: جريدر تسوية CAT"
                          style={{ width: '100%', padding: '0.4rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '0.85rem', fontWeight: 700 }}
                        />
                      </td>

                      <td style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>
                        <input
                          type="text"
                          value={row.code}
                          onChange={(e) => handleUpdateRow(row.id, 'code', e.target.value)}
                          placeholder="كود"
                          style={{ width: '100%', padding: '0.4rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '0.85rem', textAlign: 'center', direction: 'ltr' }}
                        />
                      </td>

                      <td style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>
                        <input
                          type="text"
                          value={row.operator}
                          onChange={(e) => handleUpdateRow(row.id, 'operator', e.target.value)}
                          placeholder="اسم المشغل"
                          style={{ width: '100%', padding: '0.4rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '0.85rem' }}
                        />
                      </td>

                      <td style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>
                        <select
                          value={row.status}
                          onChange={(e) => handleUpdateRow(row.id, 'status', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.4rem 0.5rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '5px',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            background: row.status === 'operational' ? '#f0fdf4' : row.status === 'maintenance' ? '#fefce8' : '#fef2f2',
                            color: row.status === 'operational' ? '#166534' : row.status === 'maintenance' ? '#854d0e' : '#991b1b'
                          }}
                        >
                          <option value="operational">🟢 جاهزة وتعمل</option>
                          <option value="maintenance">🟡 صيانة دورية</option>
                          <option value="stopped">🔴 متوقفة عطل</option>
                        </select>
                      </td>

                      <td style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>
                        <input
                          type="text"
                          value={row.meterHours}
                          onChange={(e) => handleUpdateRow(row.id, 'meterHours', e.target.value)}
                          placeholder="ساعات"
                          style={{ width: '100%', padding: '0.4rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '0.85rem', textAlign: 'center', direction: 'ltr' }}
                        />
                      </td>

                      <td style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>
                        <input
                          type="text"
                          value={row.fuelLevel}
                          onChange={(e) => handleUpdateRow(row.id, 'fuelLevel', e.target.value)}
                          placeholder="%"
                          style={{ width: '100%', padding: '0.4rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '0.85rem', textAlign: 'center' }}
                        />
                      </td>

                      <td style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>
                        <input
                          type="text"
                          value={row.notes}
                          onChange={(e) => handleUpdateRow(row.id, 'notes', e.target.value)}
                          placeholder="ملاحظات"
                          style={{ width: '100%', padding: '0.4rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '0.82rem' }}
                        />
                      </td>

                      <td style={{ border: '1px solid #cbd5e1', padding: '0.35rem' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(row.id)}
                          style={{
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            borderRadius: '5px',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            margin: '0 auto'
                          }}
                          title="حذف هذا الصف"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures & General Notes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                ملاحظات وتوصيات الفحص الميداني:
              </label>
              <textarea
                value={inspectionData.notes}
                onChange={(e) => setInspectionData({ ...inspectionData, notes: e.target.value })}
                rows={3}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', resize: 'vertical' }}
              />
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '0.85rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                <span style={{ fontWeight: 800, color: '#475569' }}>مهندس الآليات والحركة:</span>
                <span style={{ fontWeight: 900, color: '#0f172a' }}>{inspectionData.inspectorName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                <span style={{ fontWeight: 800, color: '#475569' }}>اعتماد مدير المشروع:</span>
                <span style={{ fontWeight: 900, color: '#1e40af' }}>المهندس عبدالرحمن الأنصاري</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.75rem',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.65rem 1.35rem',
              borderRadius: '8px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#475569',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: '0.88rem'
            }}
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '0.65rem 1.75rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 900,
              cursor: 'pointer',
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
            }}
          >
            <CheckCircle2 size={17} />
            <span>حفظ واعتماد كشف المعدات</span>
          </button>
        </div>
      </div>
    </div>
  );
};
