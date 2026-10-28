import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    // Clear all potentially corrupt local cache from older builds
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
          regs.forEach(r => r.unregister());
        });
      }
    } catch {}
    const cleanUrl = window.location.pathname + '?v=' + Date.now();
    window.location.replace(cleanUrl);
  };

  handleBypass = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          padding: '1.5rem',
          direction: 'rtl',
          fontFamily: "'Cairo', sans-serif"
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              fontSize: '30px'
            }}>
              🔄
            </div>

            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.6rem' }}>
              تم رصد تحديث في ملفات المنظومة
            </h2>

            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.65, marginBottom: '1.75rem' }}>
              تم رفع أحدث إصدار من منظومة جهاز الإشراف. انقر على الزر بالأسفل لتحديث المنظومة وتفريغ الذاكرة المؤقتة القديمة والدخول مباشرة.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.5rem',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                تحديث المنظومة وتفريغ الذاكرة المؤقتة الآن ⚡
              </button>

              <button
                type="button"
                onClick={this.handleBypass}
                style={{
                  width: '100%',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f8fafc',
                  color: '#1e293b',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                الدخول إلى شاشة تسجيل الدخول مباشرة 🚀
              </button>
            </div>

            {this.state.error && (
              <details style={{ marginTop: '1.25rem', textAlign: 'left', direction: 'ltr', fontSize: '0.75rem', color: '#64748b' }}>
                <summary style={{ cursor: 'pointer', direction: 'rtl', textAlign: 'center', color: '#2563eb', fontWeight: 700 }}>
                  تفاصيل التحديث / الخطأ الفني
                </summary>
                <pre style={{ background: '#f1f5f9', padding: '0.75rem', borderRadius: '8px', overflowX: 'auto', marginTop: '0.5rem', whiteSpace: 'pre-wrap', maxHeight: '150px' }}>
                  {this.state.error?.message || String(this.state.error)}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
