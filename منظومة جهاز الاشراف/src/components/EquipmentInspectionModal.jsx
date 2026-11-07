import React, { useState } from 'react';
import { 
  ClipboardList, CheckCircle2, AlertTriangle, Wrench, X, 
  Printer, Download, Plus, Trash2, Fuel, Clock, MapPin, 
  User, ShieldCheck, FileSpreadsheet, Truck, Check, Eye
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const EquipmentInspectionModal = ({ isOpen, onClose, onSave, currentUser }) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const daysOfWeek = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dayName = daysOfWeek[new Date().getDay()];

  const [inspectionData, setInspectionData] = useState({
    inspectionNumber: `EQP-INSP-${Date.now().toString().slice(-6)}`,
    date: todayStr,
    dayName: dayName,
    location: 'مسار طريق أوباري - غات (360 كم) • المرحلة الأولى والثانية',
    contractor: 'الشركة العامة للطرق والجسور / ائتلاف الشركات المنفذة',
    inspectorName: currentUser?.name || 'م. مهندس الآليات والمعدات',
    inspectorRole: currentUser?.title || currentUser?.role || 'مسؤول المعدات والآليات الميداني',
    weather: 'صحو ومعتدل (ملائم للتشغيل والإنتاج)',
    notes: 'تمت المعاينة والفحص الميداني لكافة الآليات والمعدات في مواقع العمل، والتأكد من الجاهزية التشغيلية وسجلات الصيانة اليومية ومناسيب الوقود.'
  });

  const [equipmentRows, setEquipmentRows] = useState([
    { id: 1, name: 'ماكينة إعادة التدوير على البارد (FDR-01)', code: 'FDR-01', operator: 'محمود التاورغي', sector: 'المرحلة الأولى (كم 236)', status: 'operational', meterHours: '1,240', fuelLevel: '85%', notes: 'جاهزة للوردية الصباحية ودك الأساس' },
    { id: 2, name: 'ماكينة إعادة التدوير على البارد (FDR-02)', code: 'FDR-02', operator: 'عبدالسلام الزروق', sector: 'المرحلة الثانية (كم 242)', status: 'operational', meterHours: '980', fuelLevel: '90%', notes: 'جاهزة وتعمل بكفاءة عالية' },
    { id: 3, name: 'جريدر تسوية وضبط مناسيب (CAT 140K)', code: 'GRD-01', operator: 'علي الصويعي', sector: 'المرحلة الأولى (كم 236)', status: 'operational', meterHours: '3,420', fuelLevel: '75%', notes: 'تسوية وضبط ميول طبقة الأساس' },
    { id: 4, name: 'جريدر تسوية وضبط مناسيب (Komatsu 705)', code: 'GRD-02', operator: 'عمر المهدوي', sector: 'المرحلة الثانية (كم 241)', status: 'operational', meterHours: '2,890', fuelLevel: '80%', notes: 'ضبط المناسيب والميول الهندسية' },
    { id: 5, name: 'هراس حافر غنم دك عميق (Hamm 3411)', code: 'ROL-01', operator: 'محمد الطاهر', sector: 'المرحلة الأولى (كم 236)', status: 'operational', meterHours: '1,850', fuelLevel: '70%', notes: 'دك أولي لطبقة الفرمة والأساس' },
    { id: 6, name: 'هراس تربة ناعم (Bomag BW213)', code: 'ROL-02', operator: 'إبراهيم غيث', sector: 'المرحلة الأولى (كم 236)', status: 'operational', meterHours: '2,100', fuelLevel: '85%', notes: 'دمك وتثبيت نهائي للسطح' },
    { id: 7, name: 'شاحنة صهريج مياه Mercedes (30 طن)', code: 'WTR-01', operator: 'فرج المقرحي', sector: 'المرحلة الأولى (كم 236)', status: 'operational', meterHours: '4,210', fuelLevel: '95%', notes: 'رش وترطيب وتغذية ماكينة FDR' },
    { id: 8, name: 'لودر تشوين ومناولة (CAT 950)', code: 'LDR-01', operator: 'يوسف العريبي', sector: 'الكسارة موقع 107', status: 'operational', meterHours: '3,150', fuelLevel: '65%', notes: 'مناولة الركام وتشوين مواد الأساس' },
    { id: 9, name: 'شاحنة قلاب نقل ركام (Mercedes Actros)', code: 'TRK-01', operator: 'جمعة السنوسي', sector: 'المرحلة الأولى (كم 236)', status: 'operational', meterHours: '5,120', fuelLevel: '80%', notes: 'نقل وتوزيع السن والركام الميداني' },
    { id: 10, name: 'ماسينزا رش أسفلت وتوزيع MC0', code: 'MSN-01', operator: 'رمضان الفيتوري', sector: 'المرحلة الأولى (كم 236)', status: 'maintenance', meterHours: '1,430', fuelLevel: '50%', notes: 'صيانة دورية للمضخة ورؤوس الرش' }
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
        sector: 'مسار طريق أوباري - غات',
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
        ['دولة ليبيا - وزارة المواصلات - جهاز تنفيذ مشروعات المواصلات'],
        ['مشروع صيانة وتطوير طريق أوباري - غات (360 كم)'],
        ['كشف وسجل حصر وفحص المعدات والآليات الميدانية الرسمي (المعتمد)'],
        [],
        [`رقم الكشف المرجعي: ${inspectionData.inspectionNumber}`, `التاريخ: ${inspectionData.date}`, `اليوم: ${inspectionData.dayName}`],
        [`الموقع والقطاع: ${inspectionData.location}`, `المقاول المنفذ: ${inspectionData.contractor}`],
        [`مهندس الفحص والمشرف: ${inspectionData.inspectorName}`, `حالة الطقس: ${inspectionData.weather}`],
        [],
        ['م', 'اسم ونوع المعدة / الآلية', 'كود الآلية / اللوحة', 'السائق / المشغل', 'قطاع وموقع العمل', 'الحالة الفنية والتشغيلية', 'ساعات التشغيل (العداد)', 'منسوب الوقود (%)', 'ملاحظات الفحص والجاهزية']
      ];

      equipmentRows.forEach((r, idx) => {
        dataRows.push([
          idx + 1,
          r.name || '-',
          r.code || '-',
          r.operator || '-',
          r.sector || '-',
          r.status === 'operational' ? 'جاهزة وتعمل' : r.status === 'maintenance' ? 'تحت الصيانة' : 'معطلة / متوقفة',
          r.meterHours || '-',
          r.fuelLevel || '-',
          r.notes || '-'
        ]);
      });

      dataRows.push([]);
      dataRows.push(['إجمالي المعدات المفحوصة:', totalInspected, 'الجاهزة والعاملة:', operationalCount, 'تحت الصيانة:', maintenanceCount, 'المتوقفة:', stoppedCount, 'نسبة الجاهزية التشغيلية:', `${readinessPct}%`]);
      dataRows.push([]);
      dataRows.push(['ملاحظات الفحص:', inspectionData.notes]);
      dataRows.push([]);
      dataRows.push(['مهندس الآليات والحركة:', inspectionData.inspectorName, '', 'مهندس الجودة:', 'م. صالح بن يحي', '', 'مدير المشروع:', 'م. عبدالرحمن الأنصاري']);

      const ws = XLSX.utils.aoa_to_sheet(dataRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'كشف المعدات الرسمي');
      XLSX.writeFile(wb, `كشف_المعدات_الرسمي_${inspectionData.inspectionNumber}.xlsx`);
    } catch (err) {
      console.error('Error exporting equipment sheet:', err);
    }
  };

  // Direct Print
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
      window.dispatchEvent(new CustomEvent('equipment-updated'));
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
    <>
      {/* Print Specific CSS to ensure letter-perfect official output */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #official-equipment-print-area,
          #official-equipment-print-area * {
            visibility: visible !important;
          }
          #official-equipment-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm 12mm !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print-zone {
            display: none !important;
          }
          @page {
            size: A4 landscape;
            margin: 8mm;
          }
        }
      `}</style>

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
        <div 
          id="official-equipment-print-area"
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '1280px',
            width: '100%',
            maxHeight: '94vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            border: '2px solid #0f172a',
            overflow: 'hidden',
            fontFamily: 'inherit'
          }}
        >
          {/* Action Toolbar Header (Hidden on Print) */}
          <div className="no-print-zone" style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            padding: '1rem 1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(37,99,235,0.4)'
              }}>
                <ClipboardList size={22} color="#ffffff" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>
                  فورم كشف حصر وفحص المعدات والآليات الميدانية الرسمي (بالشعار)
                </h2>
                <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                  جهاز تنفيذ مشروعات المواصلات • مشروع صيانة وتطوير طريق أوباري - غات (360 كم)
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <button
                type="button"
                onClick={handlePrint}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.55rem 1.15rem',
                  borderRadius: '8px',
                  fontSize: '0.86rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.3)'
                }}
              >
                <Printer size={16} />
                <span>طباعة الكشف الرسمي</span>
              </button>

              <button
                type="button"
                onClick={handleExportExcel}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  padding: '0.55rem 1.15rem',
                  borderRadius: '8px',
                  fontSize: '0.86rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(22,163,74,0.3)'
                }}
              >
                <FileSpreadsheet size={16} />
                <span>تصدير Excel</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="إغلاق النافذة"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Form Printable Body */}
          <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {savedSuccess && (
              <div className="no-print-zone" style={{
                background: '#f0fdf4',
                color: '#166534',
                border: '1.5px solid #86efac',
                padding: '0.85rem 1.25rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle2 size={20} color="#16a34a" />
                <span>تم حفظ واعتماد كشف المعدات بنجاح في السجل الميداني للمنظومة!</span>
              </div>
            )}

            {/* 1. Official Libyan Government Letterhead with Agency Emblem */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2.5px solid #000000',
              paddingBottom: '0.65rem',
              marginBottom: '0.5rem'
            }}>
              {/* Right: State Entities */}
              <div style={{ textAlign: 'right' }}>
                <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#000000' }}>دولة ليبيا</h4>
                <h3 style={{ margin: '0.15rem 0', fontSize: '1.1rem', fontWeight: 900, color: '#000000' }}>وزارة المواصلات</h3>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#1e3a8a' }}>جهاز تنفيذ مشروعات المواصلات</h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.88rem', fontWeight: 800, color: '#334155' }}>
                  مكتب جهاز الإشراف والمتابعة • إدارة المشروعات الكبرى
                </p>
              </div>

              {/* Center: Official Agency Emblem */}
              <div style={{ textAlign: 'center' }}>
                <img
                  src={`${import.meta.env.BASE_URL}logo-agency.jpg`}
                  alt="شعار جهاز تنفيذ مشروعات المواصلات"
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'contain',
                    borderRadius: '50%',
                    border: '2px solid #000000',
                    padding: '3px',
                    background: '#ffffff',
                    display: 'inline-block',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
                <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#1e3a8a', marginTop: '0.25rem' }}>
                  جهاز الإشراف المعتمد
                </div>
              </div>

              {/* Left: Official Reference Metadata */}
              <div style={{ textAlign: 'left', direction: 'ltr', fontSize: '0.86rem', fontWeight: 800, color: '#000000' }}>
                <div><strong>Manifest No:</strong> {inspectionData.inspectionNumber}</div>
                <div><strong>Date:</strong> {inspectionData.date} ({inspectionData.dayName})</div>
                <div><strong>Project:</strong> Obari - Ghat (360 km)</div>
                <div style={{ color: '#16a34a' }}><strong>Status:</strong> Certified Active Fleet</div>
              </div>
            </div>

            {/* 2. Official Cyan / Gold Title Banner */}
            <div style={{
              background: '#38bdf8',
              color: '#000000',
              textAlign: 'center',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              border: '2px solid #000000',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            }}>
              <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-0.3px' }}>
                كشف وسجل حصر وفحص المعدات والآليات الميدانية الرسمي
              </h1>
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.92rem', fontWeight: 800 }}>
                مشروع صيانة وتطوير طريق أوباري - غات بطول 360 كم (المرحلة الأولى: 226.08 كم • المرحلة الثانية: 133.92 كم)
              </p>
            </div>

            {/* 3. Official Project & Site Metadata Strip */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '0.75rem',
              background: '#f8fafc',
              border: '1.5px solid #000000',
              padding: '0.85rem 1.15rem',
              borderRadius: '8px'
            }}>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '2px' }}>
                  الموقع الميداني وجبهات العمل:
                </label>
                <input
                  type="text"
                  value={inspectionData.location}
                  onChange={(e) => setInspectionData({ ...inspectionData, location: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '2px' }}>
                  المقاول المنفذ / جهة التشغيل:
                </label>
                <input
                  type="text"
                  value={inspectionData.contractor}
                  onChange={(e) => setInspectionData({ ...inspectionData, contractor: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '2px' }}>
                  مهندس الفحص / مسؤول الآليات:
                </label>
                <input
                  type="text"
                  value={inspectionData.inspectorName}
                  onChange={(e) => setInspectionData({ ...inspectionData, inspectorName: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '2px' }}>
                  ظروف الطقس والتشغيل:
                </label>
                <input
                  type="text"
                  value={inspectionData.weather}
                  onChange={(e) => setInspectionData({ ...inspectionData, weather: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }}
                />
              </div>
            </div>

            {/* 4. Fleet Statistics & Readiness Strip */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '0.5rem',
              textAlign: 'center'
            }}>
              <div style={{ border: '1.5px solid #000000', background: '#f8fafc', padding: '0.5rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#334155' }}>إجمالي المعدات المفحوصة</div>
                <strong style={{ fontSize: '1.35rem', color: '#1e3a8a', display: 'block' }}>
                  {totalInspected} <span style={{ fontSize: '0.8rem' }}>آلية</span>
                </strong>
              </div>

              <div style={{ border: '1.5px solid #000000', background: '#f0fdf4', padding: '0.5rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#166534' }}>الجاهزة والعاملة فورياً</div>
                <strong style={{ fontSize: '1.35rem', color: '#15803d', display: 'block' }}>
                  {operationalCount} <span style={{ fontSize: '0.8rem' }}>آلية</span>
                </strong>
              </div>

              <div style={{ border: '1.5px solid #000000', background: '#fefce8', padding: '0.5rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#a16207' }}>المعدات قيد الصيانة</div>
                <strong style={{ fontSize: '1.35rem', color: '#ca8a04', display: 'block' }}>
                  {maintenanceCount} <span style={{ fontSize: '0.8rem' }}>آلية</span>
                </strong>
              </div>

              <div style={{ border: '1.5px solid #000000', background: '#fef2f2', padding: '0.5rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#991b1b' }}>المتوقفة / الاحتياطية</div>
                <strong style={{ fontSize: '1.35rem', color: '#dc2626', display: 'block' }}>
                  {stoppedCount} <span style={{ fontSize: '0.8rem' }}>آلية</span>
                </strong>
              </div>

              <div style={{ border: '1.5px solid #000000', background: '#eff6ff', padding: '0.5rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#1d4ed8' }}>نسبة الجاهزية الميدانية</div>
                <strong style={{ fontSize: '1.35rem', color: '#2563eb', display: 'block' }}>
                  %{readinessPct}
                </strong>
              </div>
            </div>

            {/* 5. Detailed Equipment Manifest Table */}
            <div style={{ border: '2px solid #000000', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{
                background: '#1e3a8a',
                color: '#ffffff',
                padding: '0.65rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontWeight: 900, fontSize: '0.98rem' }}>
                  جدول كشف حصر وتوزيع المعدات والآليات الميدانية
                </span>
                <button
                  type="button"
                  className="no-print-zone"
                  onClick={handleAddRow}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: '#ffffff',
                    color: '#1e3a8a',
                    border: 'none',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={15} />
                  <span>+ إضافة آلية للكشف</span>
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', color: '#000000', fontWeight: 900 }}>
                      <th style={{ border: '1.5px solid #000000', padding: '0.55rem', width: '38px' }}>م</th>
                      <th style={{ border: '1.5px solid #000000', padding: '0.55rem', minWidth: '190px' }}>اسم ونوع المعدة / الآلية</th>
                      <th style={{ border: '1.5px solid #000000', padding: '0.55rem', width: '105px' }}>كود / اللوحة</th>
                      <th style={{ border: '1.5px solid #000000', padding: '0.55rem', width: '130px' }}>السائق / المشغل</th>
                      <th style={{ border: '1.5px solid #000000', padding: '0.55rem', width: '150px' }}>قطاع وجبهة العمل</th>
                      <th style={{ border: '1.5px solid #000000', padding: '0.55rem', width: '135px' }}>الحالة التشغيلية</th>
                      <th style={{ border: '1.5px solid #000000', padding: '0.55rem', width: '100px' }}>العداد (ساعة)</th>
                      <th style={{ border: '1.5px solid #000000', padding: '0.55rem', width: '80px' }}>الوقود</th>
                      <th style={{ border: '1.5px solid #000000', padding: '0.55rem', minWidth: '160px' }}>ملاحظات الفحص والجاهزية</th>
                      <th className="no-print-zone" style={{ border: '1.5px solid #000000', padding: '0.55rem', width: '45px' }}>إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipmentRows.map((row, idx) => (
                      <tr key={row.id} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ border: '1px solid #000000', padding: '0.4rem', fontWeight: 900 }}>{idx + 1}</td>
                        
                        <td style={{ border: '1px solid #000000', padding: '0.3rem' }}>
                          <input
                            type="text"
                            value={row.name}
                            onChange={(e) => handleUpdateRow(row.id, 'name', e.target.value)}
                            placeholder="اسم المعدة"
                            style={{ width: '100%', padding: '0.35rem 0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.84rem', fontWeight: 800 }}
                          />
                        </td>

                        <td style={{ border: '1px solid #000000', padding: '0.3rem' }}>
                          <input
                            type="text"
                            value={row.code}
                            onChange={(e) => handleUpdateRow(row.id, 'code', e.target.value)}
                            placeholder="كود الآلية"
                            style={{ width: '100%', padding: '0.35rem 0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.84rem', textAlign: 'center', direction: 'ltr', fontWeight: 800 }}
                          />
                        </td>

                        <td style={{ border: '1px solid #000000', padding: '0.3rem' }}>
                          <input
                            type="text"
                            value={row.operator}
                            onChange={(e) => handleUpdateRow(row.id, 'operator', e.target.value)}
                            placeholder="اسم السائق"
                            style={{ width: '100%', padding: '0.35rem 0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.84rem' }}
                          />
                        </td>

                        <td style={{ border: '1px solid #000000', padding: '0.3rem' }}>
                          <input
                            type="text"
                            value={row.sector}
                            onChange={(e) => handleUpdateRow(row.id, 'sector', e.target.value)}
                            placeholder="قطاع العمل"
                            style={{ width: '100%', padding: '0.35rem 0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.82rem' }}
                          />
                        </td>

                        <td style={{ border: '1px solid #000000', padding: '0.3rem' }}>
                          <select
                            value={row.status}
                            onChange={(e) => handleUpdateRow(row.id, 'status', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.35rem 0.4rem',
                              border: '1px solid #cbd5e1',
                              borderRadius: '4px',
                              fontSize: '0.82rem',
                              fontWeight: 900,
                              background: row.status === 'operational' ? '#f0fdf4' : row.status === 'maintenance' ? '#fefce8' : '#fef2f2',
                              color: row.status === 'operational' ? '#166534' : row.status === 'maintenance' ? '#854d0e' : '#991b1b'
                            }}
                          >
                            <option value="operational">🟢 جاهزة وتعمل</option>
                            <option value="maintenance">🟡 صيانة دورية</option>
                            <option value="stopped">🔴 متوقفة عطل</option>
                          </select>
                        </td>

                        <td style={{ border: '1px solid #000000', padding: '0.3rem' }}>
                          <input
                            type="text"
                            value={row.meterHours}
                            onChange={(e) => handleUpdateRow(row.id, 'meterHours', e.target.value)}
                            placeholder="ساعات"
                            style={{ width: '100%', padding: '0.35rem 0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.84rem', textAlign: 'center', direction: 'ltr', fontWeight: 800 }}
                          />
                        </td>

                        <td style={{ border: '1px solid #000000', padding: '0.3rem' }}>
                          <input
                            type="text"
                            value={row.fuelLevel}
                            onChange={(e) => handleUpdateRow(row.id, 'fuelLevel', e.target.value)}
                            placeholder="%"
                            style={{ width: '100%', padding: '0.35rem 0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.84rem', textAlign: 'center', fontWeight: 800 }}
                          />
                        </td>

                        <td style={{ border: '1px solid #000000', padding: '0.3rem' }}>
                          <input
                            type="text"
                            value={row.notes}
                            onChange={(e) => handleUpdateRow(row.id, 'notes', e.target.value)}
                            placeholder="ملاحظات فنية"
                            style={{ width: '100%', padding: '0.35rem 0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.82rem' }}
                          />
                        </td>

                        <td className="no-print-zone" style={{ border: '1px solid #000000', padding: '0.3rem' }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(row.id)}
                            style={{
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              borderRadius: '4px',
                              width: '26px',
                              height: '26px',
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
                  <tfoot>
                    <tr style={{ background: '#e2e8f0', fontWeight: 900, color: '#000000' }}>
                      <td colSpan={5} style={{ border: '1.5px solid #000000', padding: '0.6rem', textAlign: 'right', fontSize: '0.92rem' }}>
                        الإجمالي العام لأسطول المعدات والآليات المفحوصة بالكشف
                      </td>
                      <td style={{ border: '1.5px solid #000000', padding: '0.6rem', fontSize: '0.92rem' }}>
                        {totalInspected} آلية (جاهز: {operationalCount})
                      </td>
                      <td colSpan={3} style={{ border: '1.5px solid #000000', padding: '0.6rem', textAlign: 'center', fontSize: '0.88rem', color: '#1e3a8a' }}>
                        نسبة الجاهزية التشغيلية: %{readinessPct}
                      </td>
                      <td className="no-print-zone" style={{ border: '1.5px solid #000000' }}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* 6. Technical Recommendations & Notes */}
            <div style={{
              background: '#f8fafc',
              border: '1.5px solid #000000',
              borderRadius: '8px',
              padding: '0.85rem 1.15rem'
            }}>
              <label style={{ fontSize: '0.84rem', fontWeight: 900, color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                ملاحظات وتوصيات الفحص الميداني والجاهزية الفنية:
              </label>
              <textarea
                value={inspectionData.notes}
                onChange={(e) => setInspectionData({ ...inspectionData, notes: e.target.value })}
                rows={2}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.86rem', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            {/* 7. Official Endorsements & Signatures Section */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.75rem',
              marginTop: '0.5rem',
              textAlign: 'center'
            }}>
              <div style={{ border: '1.5px solid #000000', background: '#ffffff', padding: '0.75rem 0.5rem', borderRadius: '6px' }}>
                <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 900, color: '#000000' }}>مهندس الآليات والمعدات</h4>
                <div style={{ margin: '0.35rem 0', fontWeight: 800, fontSize: '0.85rem', color: '#1e3a8a' }}>
                  {inspectionData.inspectorName}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>التوقيع: .....................</div>
              </div>

              <div style={{ border: '1.5px solid #000000', background: '#ffffff', padding: '0.75rem 0.5rem', borderRadius: '6px' }}>
                <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 900, color: '#000000' }}>مهندس ضبط الجودة والمختبر</h4>
                <div style={{ margin: '0.35rem 0', fontWeight: 800, fontSize: '0.85rem', color: '#1e3a8a' }}>
                  م. صالح بن يحي
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>التوقيع: .....................</div>
              </div>

              <div style={{ border: '1.5px solid #000000', background: '#ffffff', padding: '0.75rem 0.5rem', borderRadius: '6px' }}>
                <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 900, color: '#000000' }}>اعتماد مدير المشروع</h4>
                <div style={{ margin: '0.35rem 0', fontWeight: 900, fontSize: '0.85rem', color: '#16a34a' }}>
                  م. عبدالرحمن الأنصاري
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>التوقيع والاعتماد: .....................</div>
              </div>

              <div style={{ border: '1.5px solid #000000', background: '#ffffff', padding: '0.75rem 0.5rem', borderRadius: '6px' }}>
                <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 900, color: '#000000' }}>ختم واعتماد الجهة المالكة</h4>
                <div style={{ margin: '0.35rem 0', fontWeight: 900, fontSize: '0.78rem', color: '#1e3a8a' }}>
                  جهاز تنفيذ مشروعات المواصلات
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>الختم الرسمي للمشروع</div>
              </div>
            </div>

          </div>

          {/* Modal Footer Controls (Hidden on Print) */}
          <div className="no-print-zone" style={{
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

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                type="button"
                onClick={handlePrint}
                style={{
                  padding: '0.65rem 1.35rem',
                  borderRadius: '8px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#1e293b',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}
              >
                <Printer size={16} />
                <span>طباعة الكشف الرسمي</span>
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
                <CheckCircle2 size={18} />
                <span>حفظ واعتماد كشف المعدات</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EquipmentInspectionModal;
