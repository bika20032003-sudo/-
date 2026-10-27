import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Info, CheckCircle2, Trash2, Bell, ShieldAlert, 
  Fuel, Truck, Wrench, FileText, Plus, Search, Filter, RefreshCw, 
  Eye, EyeOff, CheckCheck, Send, MapPin, Calendar, Clock, ChevronLeft,
  X, Sparkles, AlertOctagon, Megaphone, ShieldCheck
} from 'lucide-react';
import { fastFetch, clearApiCache } from '../utils/apiCache.js';

export const AlertsView = ({ currentUser, onNavigateTab }) => {
  const [alerts, setAlerts] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all'); // 'all' | 'unread' | 'equipment' | 'fuel' | 'progress' | 'quality'
  const [filterSector, setFilterSector] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  // New alert form state
  const [newAlertForm, setNewAlertForm] = useState({
    title: '',
    message: '',
    type: 'warning', // 'danger' | 'warning' | 'info'
    category: 'equipment', // 'equipment' | 'fuel' | 'progress' | 'quality' | 'general'
    priority: 'high', // 'urgent' | 'high' | 'normal'
    sector: 'المرحلة الأولى',
    actionLink: 'equipment'
  });

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/alerts');
      const data = await response.json();
      if (data && data.success && Array.isArray(data.alerts)) {
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.warn('Failed to fetch alerts from backend, using current local state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Auto-dismiss feedback
  useEffect(() => {
    if (feedback.text) {
      const timer = setTimeout(() => setFeedback({ type: '', text: '' }), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Mark all as read
  const markAllRead = async () => {
    try {
      await fetch('/api/alerts/read-all', { method: 'PUT' });
      setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
      clearApiCache();
      setFeedback({ type: 'success', text: 'تم تحديد جميع التنبيهات كمقروءة بنجاح' });
    } catch (error) {
      setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
      setFeedback({ type: 'success', text: 'تم تحديد جميع التنبيهات كمقروءة محلياً' });
    }
  };

  // Toggle single alert read status
  const toggleReadStatus = async (id) => {
    try {
      await fetch(`/api/alerts/${id}/toggle-read`, { method: 'PUT' });
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: !a.isRead } : a));
      clearApiCache();
    } catch (error) {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: !a.isRead } : a));
    }
  };

  // Clear single alert
  const clearAlert = async (id) => {
    try {
      await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.warn('Deleted alert locally');
    }
    setAlerts(prev => prev.filter(a => a.id !== id));
    clearApiCache();
    setFeedback({ type: 'success', text: 'تم حذف التنبيه بنجاح' });
  };

  // Submit new alert
  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!newAlertForm.title || !newAlertForm.message) return;

    const payload = {
      ...newAlertForm,
      author: currentUser?.name || 'جهاز الإشراف والمتابعة',
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.alert) {
        setAlerts(prev => [data.alert, ...prev]);
      } else {
        const localAlert = {
          id: Date.now(),
          ...payload,
          isRead: false,
          timestamp: 'الآن'
        };
        setAlerts(prev => [localAlert, ...prev]);
      }
      clearApiCache();
      setIsAddModalOpen(false);
      setNewAlertForm({
        title: '',
        message: '',
        type: 'warning',
        category: 'equipment',
        priority: 'high',
        sector: 'المرحلة الأولى',
        actionLink: 'equipment'
      });
      setFeedback({ type: 'success', text: 'تم نشر التنبيه / البلاغ الميداني بنجاح!' });
    } catch (err) {
      console.error(err);
      setIsAddModalOpen(false);
    }
  };

  // Calculations for Stat Cards
  const totalCount = alerts.length;
  const unreadCount = alerts.filter(a => !a.isRead).length;
  const dangerCount = alerts.filter(a => a.type === 'danger').length;
  const fuelCount = alerts.filter(a => a.category === 'fuel' || a.title?.includes('وقود') || a.message?.includes('وقود')).length;

  // Filtered List
  const filteredAlerts = alerts.filter(a => {
    // 1. Category / Unread filter
    if (filterCategory === 'unread' && a.isRead) return false;
    if (filterCategory === 'equipment' && a.category !== 'equipment') return false;
    if (filterCategory === 'fuel' && a.category !== 'fuel' && !a.title?.includes('وقود')) return false;
    if (filterCategory === 'progress' && a.category !== 'executive' && a.category !== 'progress') return false;
    if (filterCategory === 'quality' && a.category !== 'quality') return false;

    // 2. Type filter
    if (filterType !== 'all' && a.type !== filterType) return false;

    // 3. Sector filter
    if (filterSector !== 'all' && a.sector !== 'all' && a.sector !== filterSector) return false;

    // 4. Search query
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = (a.title || '').toLowerCase().includes(q);
      const matchMsg = (a.message || '').toLowerCase().includes(q);
      const matchAuthor = (a.author || '').toLowerCase().includes(q);
      if (!matchTitle && !matchMsg && !matchAuthor) return false;
    }

    return true;
  });

  // Category Icon & Styling Helper
  const getCategoryDetails = (category, type) => {
    switch (category) {
      case 'equipment':
        return {
          icon: <Wrench size={20} color="#dc2626" />,
          bg: '#fef2f2',
          border: '#fecaca',
          label: 'أعطال وتشغيل الآليات'
        };
      case 'fuel':
        return {
          icon: <Fuel size={20} color="#ea580c" />,
          bg: '#fff7ed',
          border: '#fed7aa',
          label: 'مخزون واستهلاك الوقود'
        };
      case 'quality':
        return {
          icon: <ShieldCheck size={20} color="#059669" />,
          bg: '#ecfdf5',
          border: '#a7f3d0',
          label: 'ضبط الجودة والمختبر'
        };
      case 'executive':
      case 'progress':
        return {
          icon: <FileText size={20} color="#2563eb" />,
          bg: '#eff6ff',
          border: '#bfdbfe',
          label: 'الموقف التنفيذي والتقارير'
        };
      default:
        return {
          icon: type === 'danger' ? <AlertOctagon size={20} color="#dc2626" /> : (type === 'warning' ? <AlertTriangle size={20} color="#d97706" /> : <Info size={20} color="#2563eb" />),
          bg: type === 'danger' ? '#fef2f2' : (type === 'warning' ? '#fffbeb' : '#eff6ff'),
          border: type === 'danger' ? '#fecaca' : (type === 'warning' ? '#fde68a' : '#bfdbfe'),
          label: 'إشعار إداري عام'
        };
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', direction: 'rtl', padding: '0.5rem 0' }}>
      
      {/* 1. Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #b91c1c 100%)',
        borderRadius: '16px',
        padding: '1.5rem 1.75rem',
        color: '#ffffff',
        marginBottom: '1.5rem',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
            color: '#ffffff',
            flexShrink: 0
          }}>
            <Bell size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#ffffff' }}>
                مركز التنبيهات والإشعارات الميدانية
              </h1>
              {unreadCount > 0 && (
                <span style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.65rem',
                  borderRadius: '20px',
                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.5)'
                }}>
                  {unreadCount} غير مقروءة
                </span>
              )}
            </div>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#cbd5e1' }}>
              متابعة الأعطال الفورية للمعدات، تنبيهات استهلاك الديزل، واعتمادات الموقف التنفيذي لطريق أوباري - غات (360 كم)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button 
            type="button"
            onClick={fetchAlerts}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              padding: '0.65rem 1rem',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.86rem',
              cursor: 'pointer'
            }}
            title="تحديث قائمة التنبيهات"
          >
            <RefreshCw size={16} className={isLoading ? 'spin-animation' : ''} />
            <span>تحديث</span>
          </button>

          <button 
            type="button"
            onClick={markAllRead}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '0.65rem 1.15rem',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.86rem',
              cursor: 'pointer'
            }}
          >
            <CheckCheck size={17} />
            <span>تحديد الكل كمقروء</span>
          </button>

          <button 
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.86rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
            }}
          >
            <Plus size={18} />
            <span>إرسال تعميم / بلاغ ميداني</span>
          </button>
        </div>
      </div>

      {/* Feedback Message */}
      {feedback.text && (
        <div style={{
          background: feedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${feedback.type === 'success' ? '#86efac' : '#fecaca'}`,
          borderRadius: '12px',
          padding: '0.85rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: feedback.type === 'success' ? '#166534' : '#991b1b',
          fontWeight: 800,
          fontSize: '0.88rem'
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={20} color="#16a34a" /> : <AlertTriangle size={20} color="#dc2626" />}
          <span>{feedback.text}</span>
          <button 
            onClick={() => setFeedback({ type: '', text: '' })} 
            style={{ marginRight: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* 2. Executive Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {/* Total Alerts Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '1.15rem 1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Bell size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>إجمالي التنبيهات المسجلة</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
              {totalCount} <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>إشعار</span>
            </div>
          </div>
        </div>

        {/* Urgent / Danger Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '1.15rem 1.25rem',
          border: '1px solid #fecaca',
          boxShadow: '0 2px 8px rgba(220, 38, 38, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertOctagon size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 800 }}>تنبيهات حرجة وعاجلة</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#dc2626', lineHeight: 1.2 }}>
              {dangerCount} <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#dc2626' }}>أعطال ميدانية</span>
            </div>
          </div>
        </div>

        {/* Fuel & Resources Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '1.15rem 1.25rem',
          border: '1px solid #fed7aa',
          boxShadow: '0 2px 8px rgba(234, 88, 12, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Fuel size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#ea580c', fontWeight: 800 }}>الوقود والمحطات</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#c2410c', lineHeight: 1.2 }}>
              {fuelCount} <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ea580c' }}>ملاحظات توريد</span>
            </div>
          </div>
        </div>

        {/* Unread Counter Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '1.15rem 1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: unreadCount > 0 ? '#fef2f2' : '#f0fdf4', color: unreadCount > 0 ? '#ef4444' : '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CheckCheck size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>بانتظار المعاينة</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: unreadCount > 0 ? '#ef4444' : '#16a34a', lineHeight: 1.2 }}>
              {unreadCount} <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>تنبيه غير مقروء</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter & Category Tabs Toolbar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1rem 1.25rem',
        marginBottom: '1.25rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem'
      }}>
        {/* Category Pill Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setFilterCategory('all')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '20px',
              border: 'none',
              background: filterCategory === 'all' ? '#0f172a' : '#f1f5f9',
              color: filterCategory === 'all' ? '#ffffff' : '#475569',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            كافة التنبيهات ({totalCount})
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory('unread')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '20px',
              border: 'none',
              background: filterCategory === 'unread' ? '#ef4444' : '#fee2e2',
              color: filterCategory === 'unread' ? '#ffffff' : '#b91c1c',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <span>غير مقروءة فقط</span>
            <span style={{
              background: filterCategory === 'unread' ? 'rgba(255,255,255,0.3)' : '#ef4444',
              color: '#ffffff',
              padding: '1px 6px',
              borderRadius: '10px',
              fontSize: '0.72rem'
            }}>
              {unreadCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory('equipment')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '20px',
              border: 'none',
              background: filterCategory === 'equipment' ? '#dc2626' : '#f1f5f9',
              color: filterCategory === 'equipment' ? '#ffffff' : '#475569',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Wrench size={14} />
            <span>أعطال الآليات والمعدات</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory('fuel')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '20px',
              border: 'none',
              background: filterCategory === 'fuel' ? '#ea580c' : '#f1f5f9',
              color: filterCategory === 'fuel' ? '#ffffff' : '#475569',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Fuel size={14} />
            <span>الوقود والمحطات</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory('progress')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '20px',
              border: 'none',
              background: filterCategory === 'progress' ? '#2563eb' : '#f1f5f9',
              color: filterCategory === 'progress' ? '#ffffff' : '#475569',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <FileText size={14} />
            <span>الموقف التنفيذي والتقارير</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory('quality')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '20px',
              border: 'none',
              background: filterCategory === 'quality' ? '#059669' : '#f1f5f9',
              color: filterCategory === 'quality' ? '#ffffff' : '#475569',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <ShieldCheck size={14} />
            <span>ضبط الجودة والمختبر</span>
          </button>
        </div>

        {/* Search & Sector Filters */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px', maxWidth: '420px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="بحث في نصوص وبلاغات التنبيهات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 2.4rem 0.55rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                outline: 'none',
                background: '#f8fafc'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select 
              value={filterSector} 
              onChange={(e) => setFilterSector(e.target.value)}
              style={{
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#334155',
                background: '#fff',
                cursor: 'pointer'
              }}
            >
              <option value="all">كافة القطاعات والمراحل</option>
              <option value="المرحلة الأولى">قطاع المرحلة الأولى (115 كم)</option>
              <option value="المرحلة الثانية">قطاع المرحلة الثانية (110 كم)</option>
            </select>

            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#334155',
                background: '#fff',
                cursor: 'pointer'
              }}
            >
              <option value="all">كافة مستويات الخطورة</option>
              <option value="danger">عاجل وطارئ (أحمر)</option>
              <option value="warning">تنبيه تشغيلي (برتقالي)</option>
              <option value="info">إشعار إداري (أزرق)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Alerts List Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredAlerts.length === 0 ? (
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              لا توجد أي تنبيهات أو بلاغات حالياً
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              كافة قطاعات المشروع والآليات ومنظومة الوقود تعمل وفق المعدلات التشغيلية المستقرة.
            </p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const cat = getCategoryDetails(alert.category, alert.type);
            const isRead = alert.isRead;

            return (
              <div 
                key={alert.id}
                style={{
                  background: isRead ? '#ffffff' : '#f8fafc',
                  border: `1.5px solid ${isRead ? '#e2e8f0' : (alert.type === 'danger' ? '#fca5a5' : (alert.type === 'warning' ? '#fde047' : '#93c5fd'))}`,
                  borderRight: `5px solid ${alert.type === 'danger' ? '#ef4444' : (alert.type === 'warning' ? '#f59e0b' : '#2563eb')}`,
                  borderRadius: '14px',
                  padding: '1.15rem 1.35rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  boxShadow: isRead ? '0 2px 6px rgba(0,0,0,0.02)' : '0 4px 12px rgba(0,0,0,0.05)',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Left side in RTL (Icon + Content) */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                  {/* Category Icon */}
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: cat.bg,
                    border: `1px solid ${cat.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {cat.icon}
                  </div>

                  {/* Text Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>
                        {alert.title}
                      </h4>

                      {!isRead && (
                        <span style={{
                          background: '#ef4444',
                          color: '#ffffff',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '6px'
                        }}>
                          جديد
                        </span>
                      )}

                      <span style={{
                        background: cat.bg,
                        color: alert.type === 'danger' ? '#b91c1c' : (alert.type === 'warning' ? '#b45309' : '#1d4ed8'),
                        border: `1px solid ${cat.border}`,
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        padding: '0.15rem 0.55rem',
                        borderRadius: '6px'
                      }}>
                        {cat.label}
                      </span>

                      {alert.sector && alert.sector !== 'all' && (
                        <span style={{
                          background: '#f1f5f9',
                          color: '#475569',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <MapPin size={11} />
                          <span>{alert.sector}</span>
                        </span>
                      )}
                    </div>

                    <p style={{ margin: '0 0 0.65rem', fontSize: '0.86rem', color: '#334155', lineHeight: 1.45 }}>
                      {alert.message}
                    </p>

                    {/* Metadata Footer of Alert */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.78rem', color: '#64748b' }}>
                      {alert.author && (
                        <span style={{ fontWeight: 700, color: '#1e293b' }}>
                          المصدر: {alert.author}
                        </span>
                      )}

                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={13} />
                        <span>{alert.timestamp || 'اليوم'}</span>
                      </span>

                      {/* Quick Action Link Button */}
                      {alert.actionLink && onNavigateTab && (
                        <button
                          type="button"
                          onClick={() => onNavigateTab(alert.actionLink)}
                          style={{
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '6px',
                            fontWeight: 800,
                            fontSize: '0.76rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            marginRight: 'auto'
                          }}
                        >
                          <span>معاينة وفحص في المنظومة</span>
                          <ChevronLeft size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side in RTL (Action controls) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => toggleReadStatus(alert.id)}
                    style={{
                      background: isRead ? '#f1f5f9' : '#eff6ff',
                      color: isRead ? '#64748b' : '#2563eb',
                      border: '1px solid #cbd5e1',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.76rem',
                      fontWeight: 700
                    }}
                    title={isRead ? 'تحديد كغير مقروء' : 'تحديد كمقروء'}
                  >
                    {isRead ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>{isRead ? 'غير مقروء' : 'مقروء'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => clearAlert(alert.id)}
                    style={{
                      background: '#fef2f2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      padding: '0.45rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="حذف هذا التنبيه"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Create New Alert / Bulletin Modal */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '560px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            direction: 'rtl'
          }}>
            <div style={{
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#dc2626', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Megaphone size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 900, color: '#0f172a' }}>
                    إرسال تعميم أو بلاغ ميداني عاجل
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                    بث تنبيه مباشر لكافة مهندسي جهاز الإشراف ومحطات العمل
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAlert} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                    عنوان البلاغ / التنبيه <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="مثال: تنبيه توقف شاحنة نقل أسفلت / انخفاض ديزل"
                    value={newAlertForm.title}
                    onChange={(e) => setNewAlertForm({ ...newAlertForm, title: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                      مستوى الخطورة والأهمية
                    </label>
                    <select
                      value={newAlertForm.type}
                      onChange={(e) => setNewAlertForm({ ...newAlertForm, type: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 700, outline: 'none', background: '#fff' }}
                    >
                      <option value="danger">عاجل وطارئ (أحمر)</option>
                      <option value="warning">تنبيه تشغيلي (برتقالي)</option>
                      <option value="info">إشعار إداري (أزرق)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                      التصنيف الوظيفي
                    </label>
                    <select
                      value={newAlertForm.category}
                      onChange={(e) => setNewAlertForm({ ...newAlertForm, category: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 700, outline: 'none', background: '#fff' }}
                    >
                      <option value="equipment">أعطال وتشغيل الآليات</option>
                      <option value="fuel">مخزون واستهلاك الوقود</option>
                      <option value="quality">ضبط الجودة والمختبر</option>
                      <option value="progress">الموقف التنفيذي والتقارير</option>
                      <option value="general">تعميم إداري عام</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                      القطاع الميداني المعني
                    </label>
                    <select
                      value={newAlertForm.sector}
                      onChange={(e) => setNewAlertForm({ ...newAlertForm, sector: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 700, outline: 'none', background: '#fff' }}
                    >
                      <option value="all">كامل مسار الطريق (360 كم)</option>
                      <option value="المرحلة الأولى">المرحلة الأولى (115.36 كم)</option>
                      <option value="المرحلة الثانية">المرحلة الثانية (110.92 كم)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                      رابط فحص سريع في المنظومة
                    </label>
                    <select
                      value={newAlertForm.actionLink}
                      onChange={(e) => setNewAlertForm({ ...newAlertForm, actionLink: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 700, outline: 'none', background: '#fff' }}
                    >
                      <option value="equipment">سجل المعدات والآليات</option>
                      <option value="fuel">إدارة الوقود والخزانات</option>
                      <option value="executive-progress">الموقف التنفيذي</option>
                      <option value="road-progress">سجل إنجاز الطريق</option>
                      <option value="dashboard">لوحة المتابعة العامة</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                    تفاصيل البلاغ والملاحظات الميدانية <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="اكتب تفاصيل التنبيه أو البلاغ، موقع الكيلومتر، والتعليمات الصادرة..."
                    value={newAlertForm.message}
                    onChange={(e) => setNewAlertForm({ ...newAlertForm, message: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', resize: 'vertical' }}
                  />
                </div>

              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button 
                  type="submit" 
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                  }}
                >
                  <Send size={16} />
                  <span>بث التنبيه الميداني الآن</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f1f5f9',
                    color: '#475569',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AlertsView;
