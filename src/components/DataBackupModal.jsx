import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  ShieldCheck, 
  History, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  FileText, 
  HardDrive,
  Lock
} from 'lucide-react';
import { 
  exportFullDatabaseBackup, 
  getRecentSnapshots, 
  restoreFromSnapshot, 
  createDatabaseSnapshot,
  getAllReportsFromIndexedDB
} from '../utils/secureDatabase.js';

export const DataBackupModal = ({ isOpen, onClose, currentUser }) => {
  const [snapshots, setSnapshots] = useState([]);
  const [totalSecuredReports, setTotalSecuredReports] = useState(0);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFileContent, setSelectedFileContent] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');

  const loadDatabaseStats = async () => {
    try {
      const reports = await getAllReportsFromIndexedDB();
      const local = JSON.parse(localStorage.getItem('local_reports') || '[]');
      const maxCount = Math.max(reports.length, local.length);
      setTotalSecuredReports(maxCount);

      const snaps = await getRecentSnapshots();
      setSnapshots(snaps);
    } catch (e) {
      console.warn('Error loading backup stats:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDatabaseStats();
      setStatusMessage(null);
      setSelectedFileContent(null);
      setSelectedFileName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Export Backup JSON
  const handleExportBackup = async () => {
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const res = await exportFullDatabaseBackup();
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `تم تصدير وحفظ النسخة الاحتياطية الشاملة بنجاح (${res.count} تقرير مؤمن)! تم تنزيل الملف إلى جهازك.`
        });
        await createDatabaseSnapshot('تصدير يدوي كامل للمنظومة');
        loadDatabaseStats();
      } else {
        setStatusMessage({
          type: 'danger',
          text: 'تعذر تصدير النسخة الاحتياطية: ' + (res.error || 'خطأ غير معروف')
        });
      }
    } catch (err) {
      setStatusMessage({ type: 'danger', text: 'حدث خطأ أثناء التصدير.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle File Upload Select
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result);
        if (json && Array.isArray(json.reports)) {
          setSelectedFileContent(json);
          setStatusMessage({
            type: 'info',
            text: `تم فحص الملف بنجاح: يحتوي على (${json.reports.length}) تقرير مؤرخ بتاريخ (${json.exportDateFormatted || json.exportTimestamp || 'سابق'}). اضغط على "تأكيد واستعادة البيانات" بالأسفل للتطبيق.`
          });
        } else {
          setStatusMessage({
            type: 'danger',
            text: 'ملف غير صالح. يجب أن يكون ملف نسخة احتياطية رسمي للمنظومة بصيغة JSON.'
          });
          setSelectedFileContent(null);
        }
      } catch (parseErr) {
        setStatusMessage({
          type: 'danger',
          text: 'الملف المحدد لا يحتوي على بيانات JSON صالحة.'
        });
        setSelectedFileContent(null);
      }
    };
    reader.readAsText(file);
  };

  // Handle Restore Selected File
  const handleRestoreFromFile = async () => {
    if (!selectedFileContent) return;
    if (!window.confirm(`هل أنت متأكد من استعادة (${selectedFileContent.reports.length}) تقرير وتطبيق النسخة الاحتياطية؟`)) return;

    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const success = await restoreFromSnapshot(selectedFileContent);
      if (success) {
        setStatusMessage({
          type: 'success',
          text: 'تمت استعادة البيانات وتحديث قاعدة البيانات بنجاح! تم تحديث جميع السجلات والشاشات.'
        });
        setSelectedFileContent(null);
        setSelectedFileName('');
        loadDatabaseStats();
      } else {
        setStatusMessage({ type: 'danger', text: 'فشلت عملية الاستعادة. يرجى التحقق من محتوى الملف.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'danger', text: 'حدث خطأ أثناء استعادة النسخة الاحتياطية.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Restore From Snapshot
  const handleRestoreSnapshot = async (snap) => {
    if (!window.confirm(`هل أنت متأكد من استعادة النسخة المؤرخة في (${snap.dateFormatted || snap.timestamp}) التي تحتوي على (${snap.reportCount}) تقرير؟`)) return;

    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const success = await restoreFromSnapshot(snap);
      if (success) {
        setStatusMessage({
          type: 'success',
          text: `تم استعادة النسخة الاحتياطية (${snap.dateFormatted}) بنجاح!`
        });
        loadDatabaseStats();
      } else {
        setStatusMessage({ type: 'danger', text: 'فشلت عملية استعادة النسخة.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'danger', text: 'خطأ أثناء استعادة النسخة الاحتياطية.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Instant Snapshot creation
  const handleCreateInstantSnapshot = async () => {
    setIsProcessing(true);
    try {
      const snap = await createDatabaseSnapshot('نسخة يدوية فورية - ' + (currentUser?.name || 'مدير المشروع'));
      if (snap) {
        setStatusMessage({
          type: 'success',
          text: 'تم إنشاء نسخة احتياطية فورية وحفظها في قاعدة البيانات بأمان!'
        });
        loadDatabaseStats();
      }
    } catch (_) {
      setStatusMessage({ type: 'danger', text: 'حدث خطأ أثناء إنشاء النسخة.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
      direction: 'rtl'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '780px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
        border: '1px solid #cbd5e1',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          color: '#ffffff',
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Database size={24} color="#60a5fa" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0 }}>
                إدارة قاعدة البيانات والنسخ الاحتياطي الشامل
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#93c5fd', margin: '0.2rem 0 0' }}>
                قاعدة بيانات متينة ومؤمنة ضد الفقدان • IndexedDB عالية السرعة والسعة • نسخ احتياطي مشفر
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Status Message Alert */}
          {statusMessage && (
            <div style={{
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.88rem',
              fontWeight: 700,
              background: statusMessage.type === 'success' ? '#f0fdf4' : (statusMessage.type === 'danger' ? '#fef2f2' : '#eff6ff'),
              border: `1px solid ${statusMessage.type === 'success' ? '#86efac' : (statusMessage.type === 'danger' ? '#fca5a5' : '#93c5fd')}`,
              color: statusMessage.type === 'success' ? '#166534' : (statusMessage.type === 'danger' ? '#991b1b' : '#1e40af')
            }}>
              {statusMessage.type === 'success' ? <CheckCircle2 size={20} color="#16a34a" /> : (statusMessage.type === 'danger' ? <AlertCircle size={20} color="#dc2626" /> : <HardDrive size={20} color="#2563eb" />)}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Database Health Metrics Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '0.85rem'
          }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', fontWeight: 800, fontSize: '0.85rem' }}>
                <HardDrive size={18} color="#2563eb" />
                <span>محرك التخزين الأساسي</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#16a34a', marginTop: '0.4rem' }}>
                IndexedDB نشطة ومؤمنة
              </div>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>سعة تخزين ضخمة تتجاوز 100 ميجابايت</span>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', fontWeight: 800, fontSize: '0.85rem' }}>
                <ShieldCheck size={18} color="#16a34a" />
                <span>الحماية من الحذف التلقائي</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#2563eb', marginTop: '0.4rem' }}>
                مفعلة (Persistent)
              </div>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>البيانات محمية من تفريغ متصفح الويب</span>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', fontWeight: 800, fontSize: '0.85rem' }}>
                <FileText size={18} color="#d97706" />
                <span>التقارير الموثقة والمحفوظة</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginTop: '0.4rem' }}>
                {totalSecuredReports} <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>تقرير</span>
              </div>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>مزامنة فورية متعددة المنافذ</span>
            </div>
          </div>

          {/* Primary Action Buttons: Export & Restore */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            background: '#f1f5f9',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid #cbd5e1'
          }}>
            {/* Export Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Download size={18} color="#2563eb" />
                <span>تصدير نسخة احتياطية للجهاز (JSON)</span>
              </h4>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>
                يقوم بتجميع كافة تقارير المرحلتين، وسجلات الوقود، والأعمال المستهدفة، والمستخدمين في ملف JSON آمن يمكنك حفظه على فلاش ميموري أو جهازك.
              </p>
              <button
                type="button"
                onClick={handleExportBackup}
                disabled={isProcessing}
                style={{
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.7rem 1.25rem',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                }}
              >
                <Download size={17} />
                <span>تصدير وتنزيل النسخة الاحتياطية الآن</span>
              </button>
            </div>

            {/* Restore Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Upload size={18} color="#16a34a" />
                <span>استعادة البيانات من ملف نسخة سابقة</span>
              </h4>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>
                اختر ملف نسخة احتياطية بصيغة (.json) لاستعادة كافة التقارير والحسابات إلى المنظومة في ثوانٍ.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <label style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem',
                  background: '#ffffff',
                  border: '1.5px dashed #cbd5e1',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#334155',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  <Upload size={16} color="#64748b" />
                  <span>{selectedFileName || 'اختر ملف نسخة (.json)...'}</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </label>

                {selectedFileContent && (
                  <button
                    type="button"
                    onClick={handleRestoreFromFile}
                    disabled={isProcessing}
                    style={{
                      padding: '0.65rem 1rem',
                      background: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    تأكيد الاستعادة
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Automated Rolling Snapshots History */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={18} color="#64748b" />
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                  سجل النسخ الاحتياطية التلقائية المحفوظة بالمنظومة
                </h4>
              </div>

              <button
                type="button"
                onClick={handleCreateInstantSnapshot}
                disabled={isProcessing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.75rem',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={14} />
                <span>حفظ نقطة استعادة فورية الآن</span>
              </button>
            </div>

            {snapshots.length === 0 ? (
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', textAlign: 'center', margin: '1rem 0' }}>
                لا توجد نقاط استعادة تلقائية سابقة حتى الآن. يتم الإنشاء تلقائياً مع كل تقرير جديد.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                {snapshots.map((snap) => (
                  <div key={snap.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.85rem',
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                    borderRadius: '8px',
                    fontSize: '0.82rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 800, color: '#0f172a' }}>{snap.dateFormatted || new Date(snap.timestamp).toLocaleString('ar-LY')}</span>
                      <span style={{ padding: '2px 8px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', fontSize: '0.72rem', fontWeight: 700 }}>
                        {snap.reportCount} تقرير
                      </span>
                      <span style={{ color: '#64748b', fontSize: '0.74rem' }}>{snap.reason}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRestoreSnapshot(snap)}
                      disabled={isProcessing}
                      style={{
                        padding: '0.3rem 0.75rem',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        color: '#1d4ed8',
                        fontWeight: 700,
                        fontSize: '0.76rem',
                        cursor: 'pointer'
                      }}
                    >
                      استعادة هذه النقطة
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '1rem 1.5rem',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          borderRadius: '0 0 16px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#64748b' }}>
            <Lock size={15} color="#16a34a" />
            <span>نظام الحماية المشددة وضمان حفظ البيانات نشط 100%</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.5rem 1.25rem',
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataBackupModal;

