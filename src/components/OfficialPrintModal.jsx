import React from 'react';
import { Printer, X, CheckCircle2, Clock, AlertTriangle, ShieldCheck, FileText, Calendar, Building2, User, Layers, Fuel, Factory, Truck } from 'lucide-react';

export const OfficialPrintModal = ({ report, onClose }) => {
  if (!report) return null;

  const isSectorA = (report.sector || '').includes('A') || (report.sector || '').includes('أ') || (report.crusherName || '').includes('A');
  const sectorTitle = isSectorA ? 'القطاع الأول (A)' : 'القطاع الثاني (B)';
  const companyTitle = report.companyName || (isSectorA ? 'شركة الرواد للمقاولات العامة' : 'شركة نيوم للمقاولات والاستثمار');
  const totalLengthKm = isSectorA ? '115.36 كم' : '110.92 كم';

  const handlePrint = () => {
    window.print();
  };

  const reportNumber = report.reportNumber || `#REP-${report.id || '2026'}`;
  const reportDateStr = report.date ? new Date(report.date).toLocaleDateString('ar-LY', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : new Date().toLocaleDateString('ar-LY');

  const printTimeStr = new Date().toLocaleDateString('ar-LY', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="official-print-modal-overlay">
      {/* Top Action Bar (Hidden on Print) */}
      <div className="print-controls-bar no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FileText size={22} color="#2563eb" />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
              معاينة التقرير الميداني الرسمي للطباعة
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              {reportNumber} - {sectorTitle} ({companyTitle})
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '0.65rem 1.4rem',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}
          >
            <Printer size={18} />
            <span>طباعة التقرير الرسمي (Print / PDF)</span>
          </button>

          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1',
              padding: '0.65rem 1.1rem',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
            <span>إغلاق</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="print-sheet-wrapper">
        <div className="official-print-document" id="printable-report-content">

          {/* 1. Official Header with Agency Logo and Libyan Emblems */}
          <div className="official-report-header">
            <div className="header-agency-info">
              <h4>دولة ليبيا</h4>
              <h3>وزارة المواصلات</h3>
              <h2>جهاز تنفيذ مشروعات المواصلات</h2>
              <p>مشروع صيانة وتطوير طريق أوباري - غات (226.28 كم)</p>
            </div>

            <div className="header-agency-emblem">
              <img src="/logo-agency.jpg" alt="شعار جهاز تنفيذ مشروعات المواصلات" />
              <div className="emblem-sub">منظومة المتابعة اليومية المعتمدة</div>
            </div>

            <div className="header-report-meta">
              <div className="meta-box-row">
                <span className="lbl">رقم التقرير:</span>
                <span className="val bold" style={{ direction: 'ltr' }}>{reportNumber}</span>
              </div>
              <div className="meta-box-row">
                <span className="lbl">التاريخ:</span>
                <span className="val">{reportDateStr}</span>
              </div>
              <div className="meta-box-row">
                <span className="lbl">القطاع الميداني:</span>
                <span className="val bold" style={{ color: '#1e3a8a' }}>{sectorTitle}</span>
              </div>
              <div className="meta-box-row">
                <span className="lbl">الشركة المنفذة:</span>
                <span className="val">{companyTitle}</span>
              </div>
            </div>
          </div>

          {/* Title Banner */}
          <div className="official-title-ribbon">
            <span>التقرير الفني اليومي الميداني لمتابعة الأعمال والتشغيل</span>
          </div>

          {/* 2. Overview Meta Grid */}
          <div className="official-section-block">
            <table className="official-info-table">
              <tbody>
                <tr>
                  <td className="cell-label">بيان ونوع التقرير:</td>
                  <td className="cell-value bold">{report.materialName || report.reportType || 'تقرير يومي شامل'}</td>
                  <td className="cell-label">الوردية / التوقيت:</td>
                  <td className="cell-value">{report.shiftType || 'وردية صباحية (07:00 ص - 04:00 م)'}</td>
                </tr>
                <tr>
                  <td className="cell-label">المشرف الميداني المعد:</td>
                  <td className="cell-value">{report.uploadedBy || (isSectorA ? 'مشرف القطاع (A)' : 'مشرف القطاع (B)')}</td>
                  <td className="cell-label">طول مسار القطاع:</td>
                  <td className="cell-value">{totalLengthKm}</td>
                </tr>
                <tr>
                  <td className="cell-label">حالة الاعتماد الرسمية:</td>
                  <td className="cell-value" colSpan={3}>
                    <span className={`status-tag ${report.status || 'pending_review'}`}>
                      {report.status === 'approved' 
                        ? `معتمد رسمياً بواسطة (${report.approvedBy || 'مدير القطاعات'})`
                        : report.status === 'rejected'
                        ? `مطلوب مراجعة وتعديل: ${report.reviewNotes || 'بيانات غير مطابقة'}`
                        : 'قيد مراجعة واعتماد مدير إدارة القطاعات'
                      }
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Detailed Operational Tables */}
          <div className="official-section-title">
            <span>أولاً: إحصائيات وكميات التشغيل الميداني لليوم</span>
          </div>

          <table className="official-data-grid">
            <thead>
              <tr>
                <th>م</th>
                <th>البند التشغيلي / الفني</th>
                <th>الموقع / الآلية المحددة</th>
                <th>الكمية المنجزة اليوم</th>
                <th>الوحدة</th>
                <th>المعدل / الملاحظة</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="center">1</td>
                <td className="bold">إنتاج وتشغيل الكسارة</td>
                <td>{report.crusherName || (isSectorA ? 'كسارة القطاع (A)' : 'كسارة القطاع (B)')}</td>
                <td className="center bold highlight-blue">{Number(report.productionAmount || 0).toLocaleString()}</td>
                <td className="center">طن</td>
                <td>ركام طبقة أساس / شرشور معتمد</td>
              </tr>
              <tr>
                <td className="center">2</td>
                <td className="bold">أعمال الرصف المنفذة اليوم</td>
                <td>مسار {sectorTitle}</td>
                <td className="center bold highlight-green">
                  {Number(report.roadMeters || report.salesAmount || 0).toLocaleString()}
                </td>
                <td className="center">متر طولي (م.ط)</td>
                <td>تنفيذ طبقات الطريق والأساس الحبيبي</td>
              </tr>
              <tr>
                <td className="center">3</td>
                <td className="bold">الوقود المستهلك (ديزل)</td>
                <td>خزان القطاع والآليات الميدانية</td>
                <td className="center bold highlight-amber">{Number(report.fuelAmount || 0).toLocaleString()}</td>
                <td className="center">لتر</td>
                <td>تزويد الكسارة وأسطول الشاحنات والمعدات</td>
              </tr>
              <tr>
                <td className="center">4</td>
                <td className="bold">الآليات العاملة بالقطاع</td>
                <td>معدات التسوية، الرص، والنقل</td>
                <td className="center bold">{report.workingEquipmentCount || (isSectorA ? '12' : '14')}</td>
                <td className="center">آلية عاملة</td>
                <td>جاهزية تشغيلية مستقرة</td>
              </tr>
              <tr>
                <td className="center">5</td>
                <td className="bold">الآليات المتوقفة / الصيانة</td>
                <td>ورشة الصيانة الميدانية</td>
                <td className="center bold" style={{ color: '#dc2626' }}>{report.stoppedEquipmentCount || (isSectorA ? '2' : '2')}</td>
                <td className="center">آلية متوقفة</td>
                <td>أعمال صيانة دورية وفحص زيت</td>
              </tr>
            </tbody>
          </table>

          {/* 4. Notes & Operational Statement */}
          <div className="official-section-title" style={{ marginTop: '1.25rem' }}>
            <span>ثانياً: بيان الأعمال الميدانية والملاحظات الفنية</span>
          </div>

          <div className="official-notes-box">
            <p>
              {report.notes || 'تمت كافة الأعمال الميدانية وفقاً للجدول الزمني المعتمد لليوم، مع الالتزام بالمواصفات الفنية القياسية المعتمدة من جهاز تنفيذ مشروعات المواصلات.'}
            </p>
            {report.reviewNotes && (
              <div style={{ marginTop: '0.65rem', padding: '0.5rem', background: '#fee2e2', borderRadius: '6px', color: '#991b1b', fontSize: '0.82rem' }}>
                <strong>ملاحظة مراجعة مدير القطاعات:</strong> {report.reviewNotes}
              </div>
            )}
          </div>

          {/* 5. Attached Photo if available */}
          {report.imageUrl && (
            <div className="official-photo-section">
              <div className="photo-title">وثيقة / صورة توثيقية من الميدان مرفقة بالتقرير:</div>
              <div className="photo-frame">
                <img src={report.imageUrl} alt="صورة ميدانية" />
              </div>
            </div>
          )}

          {/* 6. Signatures and Official Seals */}
          <div className="official-signatures-section">
            <div className="sig-column">
              <h4>مشرف القطاع الميداني</h4>
              <p className="sig-role">إعداد وتوثيق الميدان</p>
              <div className="sig-name">{report.uploadedBy || (isSectorA ? 'مشرف القطاع (A)' : 'مشرف القطاع (B)')}</div>
              <div className="sig-signature-line">
                <span className="digital-stamp-badge">✓ توثيق رقمي معتمد</span>
              </div>
            </div>

            <div className="sig-column">
              <h4>مدير إدارة القطاعات</h4>
              <p className="sig-role">مراجعة وتدقيق الكميات</p>
              <div className="sig-name">{report.approvedBy || 'مدير عام القطاعات'}</div>
              <div className="sig-signature-line">
                {report.status === 'approved' ? (
                  <span className="digital-stamp-badge approved">✓ اعتماد رسمي مكتمل</span>
                ) : (
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>بانتظار الاعتماد</span>
                )}
              </div>
            </div>

            <div className="sig-column">
              <h4>جهاز تنفيذ مشروعات المواصلات</h4>
              <p className="sig-role">إدارة متابعة مشروعات الطرق</p>
              <div className="official-seal-box">
                <div className="seal-inner">
                  <span>جهاز تنفيذ</span>
                  <span className="bold">مشروعات المواصلات</span>
                  <span>معتمد رسمياً</span>
                </div>
              </div>
            </div>
          </div>

          {/* 7. Footer Meta */}
          <div className="official-report-footer">
            <span>منظومة متابعة الكسارات والوقود والمعدات - جهاز تنفيذ مشروعات المواصلات</span>
            <span>طُبع بتاريخ ووقت: {printTimeStr}</span>
            <span>صفحة 1 من 1</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OfficialPrintModal;
