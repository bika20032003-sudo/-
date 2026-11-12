import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, CheckCircle2, AlertCircle, Smartphone, Monitor, Globe, 
  Copy, Check, QrCode, X, Wifi, ShieldCheck, Zap
} from 'lucide-react';
import { 
  getSyncStatus, 
  setCustomCloudApiUrl, 
  checkServerUpdates, 
  testCloudApiConnection, 
  getMobileSyncShareUrl,
  AUTO_SYNC_INTERVAL_MS 
} from '../utils/realtimeSync';

export const CloudSyncModal = ({ isOpen, onClose }) => {
  const [syncStatus, setSyncStatus] = useState(getSyncStatus());
  const [customUrl, setCustomUrl] = useState(syncStatus.apiBaseUrl || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [manualSyncMsg, setManualSyncMsg] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSyncStatus(getSyncStatus());
    setCustomUrl(getSyncStatus().apiBaseUrl || '');
    setTestResult(null);
    setManualSyncMsg(null);

    const handleStatus = (e) => {
      setSyncStatus(e.detail || getSyncStatus());
    };
    window.addEventListener('sync-status-changed', handleStatus);
    return () => window.removeEventListener('sync-status-changed', handleStatus);
  }, [isOpen]);

  if (!isOpen) return null;

  const secondsAgo = Math.max(0, Math.floor((Date.now() - (syncStatus.lastSyncTimestamp || Date.now())) / 1000));
  const mobileShareUrl = getMobileSyncShareUrl();

  const handleTestAndSave = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const clean = customUrl.trim();
      const res = await testCloudApiConnection(clean);
      setTestResult(res);
      if (res.success) {
        setCustomCloudApiUrl(clean);
        setSyncStatus(getSyncStatus());
      }
    } catch (e) {
      setTestResult({ success: false, message: e.message || 'فشل الاتصال' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleResetDefault = () => {
    setCustomCloudApiUrl('');
    setCustomUrl('');
    setTestResult({ success: true, message: 'تمت استعادة الربط التلقائي الافتراضي بنجاح' });
    setSyncStatus(getSyncStatus());
  };

  const handleManualSyncNow = async () => {
    setIsManualSyncing(true);
    setManualSyncMsg(null);
    try {
      await checkServerUpdates(true);
      setSyncStatus(getSyncStatus());
      setManualSyncMsg({ type: 'success', text: 'تمت مزامنة وتحديث كافة بيانات المنظومة والأجهزة بنجاح!' });
    } catch (e) {
      setManualSyncMsg({ type: 'error', text: 'حدث خطأ أثناء المزامنة: ' + (e.message || '') });
    } finally {
      setIsManualSyncing(false);
      setTimeout(() => setManualSyncMsg(null), 4000);
    }
  };

  const handleCopyMobileLink = () => {
    try {
      navigator.clipboard.writeText(mobileShareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (_) {}
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(mobileShareUrl)}`;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        direction: 'rtl',
        fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif"
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          maxWidth: '620px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          padding: '1.75rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}>
              <Globe size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                المزامنة السحابية وتوحيد كافة الأجهزة
              </h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                تحديث تلقائي كل دقيقة عبر الهواتف، الحواسب، وأجهزة مهندسي الموقع
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Status Banner */}
        <div style={{
          background: syncStatus.lastSyncSuccess ? '#f0fdf4' : '#fffbeb',
          border: syncStatus.lastSyncSuccess ? '1px solid #bbf7d0' : '1px solid #fde68a',
          borderRadius: '14px',
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: syncStatus.lastSyncSuccess ? '#22c55e' : '#f59e0b',
              boxShadow: syncStatus.lastSyncSuccess ? '0 0 10px #22c55e' : '0 0 10px #f59e0b',
              display: 'inline-block'
            }} />
            <div>
              <div style={{ fontWeight: 900, fontSize: '0.92rem', color: syncStatus.lastSyncSuccess ? '#166534' : '#92400e' }}>
                {syncStatus.lastSyncSuccess ? 'المزامنة السحابية نشطة ومحدثة' : 'الاتصال السحابي قيد المراجعة'}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                آخر مزامنة: {secondsAgo === 0 ? 'منذ لحظات' : `منذ ${secondsAgo} ثانية`} • التحديث الدوري: كل 60 ثانية تلقائياً
              </div>
            </div>
          </div>

          <button
            onClick={handleManualSyncNow}
            disabled={isManualSyncing || syncStatus.isSyncing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 1rem',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: isManualSyncing ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 6px rgba(37,99,235,0.2)'
            }}
          >
            <RefreshCw size={14} className={isManualSyncing || syncStatus.isSyncing ? 'spin-animation' : ''} />
            <span>{isManualSyncing ? 'جارِ المزامنة...' : 'مزامنة فورية الآن'}</span>
          </button>
        </div>

        {manualSyncMsg && (
          <div style={{
            background: manualSyncMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
            border: manualSyncMsg.type === 'success' ? '1px solid #a7f3d0' : '1px solid #fecaca',
            color: manualSyncMsg.type === 'success' ? '#065f46' : '#991b1b',
            borderRadius: '10px',
            padding: '0.65rem 1rem',
            marginBottom: '1rem',
            fontSize: '0.82rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={16} />
            <span>{manualSyncMsg.text}</span>
          </div>
        )}

        {/* Feature Highlights: Like Opening on One Device */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '1rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 900, fontSize: '0.88rem', color: '#1e3a8a', marginBottom: '0.5rem' }}>
            <Zap size={16} color="#2563eb" />
            <span>مبدأ العمل: المنظومة موحدة كأنها تعمل على جهاز واحد</span>
          </div>
          <ul style={{ margin: 0, paddingRight: '1.25rem', fontSize: '0.8rem', color: '#475569', lineHeight: 1.7 }}>
            <li>بمجرد حفظ أي تقرير (وقود، طريق، إنجاز المرحلتين، مراسلات) على الهاتف، يُرفع للسيرفر فورياً.</li>
            <li>يقوم حساب مدير المشروع وأجهزة باقي المهندسين بفحص وجلب التحديثات تلقائياً كل دقيقة.</li>
            <li>عند فتح الهاتف أو الانتقال إلى الشاشة، يتم الفحص المباشر وتحديث الأرشيف والأقسام دون الحاجة لإعادة تحميل الصفحة.</li>
          </ul>
        </div>

        {/* Central Server URL Configuration */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.4rem' }}>
            رابط الخادم السحابي المركزي (Cloud Server / cPanel API):
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="مثال: https://your-domain.com أو اتركه فارغاً للوضع التلقائي"
              style={{
                flex: 1,
                minWidth: '240px',
                padding: '0.55rem 0.85rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontFamily: 'monospace',
                direction: 'ltr',
                textAlign: 'left'
              }}
            />
            <button
              onClick={handleTestAndSave}
              disabled={isTesting}
              style={{
                padding: '0.55rem 1rem',
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: isTesting ? 'not-allowed' : 'pointer'
              }}
            >
              {isTesting ? 'جارِ الاختبار...' : 'حفظ واختبار'}
            </button>
            {customUrl && (
              <button
                onClick={handleResetDefault}
                style={{
                  padding: '0.55rem 0.85rem',
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                تلقائي
              </button>
            )}
          </div>

          {testResult && (
            <div style={{
              marginTop: '0.5rem',
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 800,
              background: testResult.success ? '#f0fdf4' : '#fef2f2',
              color: testResult.success ? '#15803d' : '#b91c1c',
              border: testResult.success ? '1px solid #bbf7d0' : '1px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              {testResult.success ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* 1-Click Mobile Pairing Section */}
        <div style={{
          border: '1px solid #e0e7ff',
          background: '#eef2ff',
          borderRadius: '14px',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 900, fontSize: '0.88rem', color: '#3730a3' }}>
              <Smartphone size={16} />
              <span>ربط هواتف المهندسين بضغطة واحدة (1-Click Mobile Link)</span>
            </div>
            <button
              onClick={() => setShowQr(!showQr)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: '#ffffff',
                border: '1px solid #c7d2fe',
                borderRadius: '6px',
                padding: '0.3rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#4338ca',
                cursor: 'pointer'
              }}
            >
              <QrCode size={13} />
              <span>{showQr ? 'إخفاء QR' : 'مسح QR بالهاتف'}</span>
            </button>
          </div>

          <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', color: '#4b5563', lineHeight: 1.6 }}>
            انسخ الرابط التالي وأرسله للمهندسين الميدانيين؛ بمجرد فتح الرابط على الهاتف، سيتصل تلقائياً بنفس السيرفر المركزي ويتم توحيد التقارير لحظياً.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="text"
              readOnly
              value={mobileShareUrl}
              style={{
                flex: 1,
                padding: '0.45rem 0.75rem',
                background: '#ffffff',
                border: '1px solid #c7d2fe',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontFamily: 'monospace',
                direction: 'ltr'
              }}
            />
            <button
              onClick={handleCopyMobileLink}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                background: copiedLink ? '#059669' : '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedLink ? 'تم النسخ!' : 'نسخ الرابط'}</span>
            </button>
          </div>

          {showQr && (
            <div style={{ marginTop: '1rem', textAlign: 'center', background: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #c7d2fe' }}>
              <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#3730a3', marginBottom: '0.5rem' }}>
                امسح الرمز بكاميرا الهاتف للفتح والربط الفوري:
              </div>
              <img src={qrImageUrl} alt="QR Code" style={{ width: '160px', height: '160px', margin: '0 auto', display: 'block', borderRadius: '8px' }} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.55rem 1.4rem',
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 800,
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

export default CloudSyncModal;
