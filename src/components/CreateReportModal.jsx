import React, { useState, useRef } from 'react';
import { X, Send, Camera, FileText, CheckCircle2, Factory, Fuel, Milestone, Truck, Calendar, Layers, Sparkles } from 'lucide-react';
import { fastFetch } from '../utils/apiCache.js';

export const CreateReportModal = ({ isOpen, onClose, currentUser, onReportCreated, onPrintReport }) => {
  if (!isOpen) return null;

  const isSectorSupervisor = currentUser?.role?.includes('مشرف') || Boolean(currentUser?.sector && currentUser.sector !== 'all');
  const userSectorCode = (currentUser?.sector || '').includes('B') || (currentUser?.username || '').includes('b') ? 'B' : 'A';
  
  // Selected Sector
  const [selectedSector, setSelectedSector] = useState(isSectorSupervisor ? userSectorCode : 'A');
  const isA = selectedSector === 'A';
  const sectorNameArabic = isA ? 'القطعة A' : 'القطعة B';
  const sectorLabel = isA ? 'القطاع الأول (A)' : 'القطاع الثاني (B)';
  const defaultCompanyName = isA ? 'شركة الرواد للمقاولات العامة' : 'شركة نيوم للمقاولات والاستثمار';

  // Auto-generate report number
  const [reportNumber, setReportNumber] = useState(`REP-SEC-${selectedSector}-${Date.now().toString().slice(-4)}`);
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportType, setReportType] = useState('تقرير يومي شامل');
  const [shiftType, setShiftType] = useState('وردية صباحية (07:00 ص - 04:00 م)');
  
  // Quantitative values
  const [productionAmount, setProductionAmount] = useState('');
  const [roadMeters, setRoadMeters] = useState('');
  const [fuelAmount, setFuelAmount] = useState('');
  const [workingEquipment, setWorkingEquipment] = useState(isA ? '12' : '14');
  const [stoppedEquipment, setStoppedEquipment] = useState('2');
  const [notes, setNotes] = useState('');

  // Attachment
  const [attachedFile, setAttachedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdReportData, setCreatedReportData] = useState(null);

  const handleSectorChange = (newSec) => {
    setSelectedSector(newSec);
    setReportNumber(`REP-SEC-${newSec}-${Date.now().toString().slice(-4)}`);
    setWorkingEquipment(newSec === 'A' ? '12' : '14');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAttachedFile(ev.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        reportNumber: reportNumber || `REP-SEC-${selectedSector}-${Date.now().toString().slice(-4)}`,
        date: new Date(reportDate).toISOString(),
        sector: sectorNameArabic,
        sectorCode: selectedSector,
        companyName: defaultCompanyName,
        reportType,
        shiftType,
        crusherName: isA ? 'كسارة القطاع (A)' : 'كسارة القطاع (B)',
        materialName: `${reportType} - ${sectorLabel}`,
        productionAmount: Number(productionAmount) || 0,
        salesAmount: Number(roadMeters) || 0,
        roadMeters: Number(roadMeters) || 0,
        fuelAmount: Number(fuelAmount) || 0,
        workingEquipmentCount: Number(workingEquipment) || 0,
        stoppedEquipmentCount: Number(stoppedEquipment) || 0,
        uploadedBy: currentUser?.name || `مشرف ${sectorLabel}`,
        status: isSectorSupervisor ? 'pending_review' : 'approved',
        approvedBy: isSectorSupervisor ? null : (currentUser?.name || 'مدير القطاعات'),
        notes: notes || `تنفيذ أعمال اليوم بموقع ${sectorLabel}`,
        imageUrl: attachedFile,
        fileName
      };

      const res = await fastFetch('http://localhost:5000/api/reports/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res && res.success && res.report) {
        setCreatedReportData(res.report);
        if (onReportCreated) onReportCreated(res.report);
      } else {
        alert('حدث خطأ أثناء حفظ التقرير في النظام.');
      }
    } catch (err) {
      console.error(err);
      alert('تعذر الاتصال بالخادم، يرجى التحقق من تشغيل النظام.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '780px',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0f172a, #1e293b)',
          color: '#ffffff',
          borderRadius: '16px 16px 0 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={22} color="#fff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>
                إنشاء تقرير ميداني رسمي للقطاع
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                طريق أوباري - غات | جهاز تنفيذ مشروعات المواصلات
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#cbd5e1',
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Success Screen after creation */}
        {createdReportData ? (
          <div style={{ padding: '2.5rem', textAlign: 'center' }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <CheckCircle2 size={40} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              تم تسجيل التقرير الميداني بنجاح!
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#475569', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
              تم حفظ التقرير برقم <strong>{createdReportData.reportNumber}</strong> في أرشيف {sectorLabel} وتوجيهه للاعتماد الرسمي.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  onClose();
                  if (onPrintReport) onPrintReport(createdReportData);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '0.75rem 1.6rem',
                  borderRadius: '10px',
                  fontWeight: 900,
                  fontSize: '0.94rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
                }}
              >
                <span>🖨️ طباعة التقرير الرسمي الآن (Print / PDF)</span>
              </button>

              <button
                onClick={onClose}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '0.75rem 1.4rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                العودة للأرشيف
              </button>
            </div>
          </div>
        ) : (
          /* Report Form */
          <form onSubmit={handleSubmit} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Sector Selector & Number */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                  القطاع الميداني *
                </label>
                {isSectorSupervisor ? (
                  <input
                    type="text"
                    disabled
                    value={`${sectorLabel} - ${defaultCompanyName}`}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontWeight: 800,
                      color: '#1e293b',
                      cursor: 'not-allowed',
                      boxSizing: 'border-box'
                    }}
                  />
                ) : (
                  <select
                    value={selectedSector}
                    onChange={(e) => handleSectorChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontWeight: 800,
                      color: '#1e293b',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="A">القطاع الأول (A) - شركة الرواد للمقاولات</option>
                    <option value="B">القطاع الثاني (B) - شركة نيوم للمقاولات</option>
                  </select>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                  رقم التقرير الرسمي
                </label>
                <input
                  type="text"
                  value={reportNumber}
                  onChange={(e) => setReportNumber(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    direction: 'ltr',
                    fontWeight: 800,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                  تاريخ التقرير *
                </label>
                <input
                  type="date"
                  required
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Report Type & Shift */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                  نوع وتصنيف التقرير *
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="تقرير يومي شامل">تقرير يومي شامل لكافة بنود القطاع</option>
                  <option value="تقرير تقدم أعمال الرصف">تقرير تقدم أعمال الرصف والطبقات</option>
                  <option value="تقرير تشغيل وإنتاج الكسارة">تقرير تشغيل وإنتاج الكسارة والشرشور</option>
                  <option value="تقرير تزويد واستهلاك الوقود">تقرير تزويد واستهلاك الديزل</option>
                  <option value="تقرير حركة وتشغيل المعدات">تقرير تشغيل وصيانة أسطول المعدات</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                  الوردية التشغيلية
                </label>
                <select
                  value={shiftType}
                  onChange={(e) => setShiftType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="وردية صباحية (07:00 ص - 04:00 م)">وردية صباحية (07:00 ص - 04:00 م)</option>
                  <option value="وردية مسائية (04:00 م - 12:00 م)">وردية مسائية (04:00 م - 12:00 م)</option>
                  <option value="وردية كاملة (تشغيل متواصل)">وردية كاملة (تشغيل متواصل)</option>
                </select>
              </div>
            </div>

            {/* Operational Metrics Cards */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.25rem'
            }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Layers size={16} color="#2563eb" />
                <span>المؤشرات وكميات الإنجاز الفعلية لليوم</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>
                    إنتاج الكسارة (طن)
                  </label>
                  <input
                    type="number"
                    placeholder="مثال: 850"
                    value={productionAmount}
                    onChange={(e) => setProductionAmount(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>
                    أعمال الرصف المنفذة (م.ط)
                  </label>
                  <input
                    type="number"
                    placeholder="مثال: 650"
                    value={roadMeters}
                    onChange={(e) => setRoadMeters(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>
                    الوقود المستهلك (لتر ديزل)
                  </label>
                  <input
                    type="number"
                    placeholder="مثال: 1850"
                    value={fuelAmount}
                    onChange={(e) => setFuelAmount(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>
                    الآليات العاملة
                  </label>
                  <input
                    type="number"
                    value={workingEquipment}
                    onChange={(e) => setWorkingEquipment(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>
                    الآليات المتوقفة / صيانة
                  </label>
                  <input
                    type="number"
                    value={stoppedEquipment}
                    onChange={(e) => setStoppedEquipment(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                بيان الأعمال الميدانية والملاحظات الفنية
              </label>
              <textarea
                rows={3}
                placeholder="اكتب أية ملاحظات تخص جودة الرصف، إنتاجية الكسارة، حركة الشاحنات، أو أية معوقات ميدانية..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '0.86rem' }}
              />
            </div>

            {/* File Attachment */}
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                إرفاق صورة أو وثيقة من الميدان (اختياري)
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,.pdf,.xlsx"
                style={{ display: 'none' }}
              />
              {attachedFile ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 1rem',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontWeight: 700, fontSize: '0.84rem' }}>
                    <FileText size={18} />
                    <span>{fileName || 'تم إرفاق الملف بنجاح'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setAttachedFile(null); setFileName(''); }}
                    style={{ background: '#fee2e2', border: 'none', color: '#dc2626', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.74rem', fontWeight: 700 }}
                  >
                    حذف المرفق
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '1.5px dashed #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.85rem',
                    textAlign: 'center',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    color: '#64748b'
                  }}
                >
                  <Camera size={20} style={{ margin: '0 auto 0.2rem auto', color: '#94a3b8' }} />
                  <span>انقر لاختيار صورة من الميدان أو ملف التقرير</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '1.25rem',
              marginTop: '0.5rem',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '0.65rem 1.4rem',
                  borderRadius: '8px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                إلغاء
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: isA ? '#2563eb' : '#ea580c',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.75rem 1.8rem',
                  borderRadius: '8px',
                  fontWeight: 900,
                  fontSize: '0.94rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: isA ? '0 4px 14px rgba(37, 99, 235, 0.4)' : '0 4px 14px rgba(234, 88, 12, 0.4)'
                }}
              >
                <Send size={16} />
                <span>{isSubmitting ? 'جاري الحفظ والتوجيه...' : 'حفظ وإرسال التقرير الميداني 📤'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

export default CreateReportModal;
