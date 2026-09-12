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
    // Clear potentially corrupt local cache and perform hard reload
    try {
      localStorage.removeItem('api_cache');
      sessionStorage.clear();
    } catch {}
    window.location.reload(true);
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
              يرجى النقر على زر التحديث لتطبيق أحدث إصدار من المنظومة وحذف الملفات المؤقتة القديمة من المتصفح.
            </p>

            <button
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
              تحديث المنظومة وإعادة التحميل الآن ⚡
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
