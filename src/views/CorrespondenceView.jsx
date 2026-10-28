import React, { useState, useEffect } from 'react';
import { 
  Mail, Send, Inbox, ArrowUpRight, CheckCheck, Trash2, 
  FileText, Printer, PlusCircle, Search, Filter, RefreshCw, 
  User, CheckCircle2, Clock, AlertCircle, Eye, ShieldCheck, 
  Paperclip, ArrowRight
} from 'lucide-react';
import { fastFetch } from '../utils/apiCache.js';

export const CorrespondenceView = ({ currentUser, onNavigateTab, onPrintReport }) => {
  const [activeSubTab, setActiveSubTab] = useState('inbox'); // 'inbox' | 'sent' | 'compose'
  const [messages, setMessages] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'unread' | 'with-report'
  const [statusNotification, setStatusNotification] = useState(null);

  // Compose Form State
  const [composeRecipient, setComposeRecipient] = useState('admin');
  const [composeType, setComposeType] = useState('إحالة تقرير يومي');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [attachedReportId, setAttachedReportId] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Expanded message for detailed reading
  const [selectedMessage, setSelectedMessage] = useState(null);

  const username = currentUser?.username || 'admin';

  const officialSupervisors = [
    { username: 'admin', name: 'م. عبدالرحمن الأنصاري', role: 'مدير المشروع', badge: 'إشراف عام' },
    { username: 'abrikaw', name: 'م. عبدالسلام ابريكاو', role: 'رئيس جهاز الإشراف', badge: 'رئاسة الجهاز' },
    { username: 'saleh_quality', name: 'م. صالح حماد', role: 'مسؤول الجودة', badge: 'ضبط الجودة' },
    { username: 'salah_alarabi', name: 'م. صلاح العربي', role: 'مهندس مشرف (المرحلة الأولى)', badge: 'المرحلة الأولى' },
    { username: 'issa_altahir', name: 'م. عيسى الطاهر', role: 'مهندس مشرف (المرحلة الثانية)', badge: 'المرحلة الثانية' },
  ];

  // Fetch messages from backend
  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const res = await fastFetch(`http://localhost:5000/api/messages?username=${encodeURIComponent(username)}`);
      if (res && res.messages) {
        setMessages(res.messages);
      } else if (Array.isArray(res)) {
        setMessages(res);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.warn('Could not load messages from server:', err);
      // Fallback to local storage if offline
      try {
        const local = JSON.parse(localStorage.getItem('local_messages') || '[]');
        setMessages(local);
      } catch {
        setMessages([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch available reports for attachment
  const fetchReports = async () => {
    try {
      const res = await fastFetch('http://localhost:5000/api/reports');
      const list = res?.reports || (Array.isArray(res) ? res : []);
      setReportsList(list);
    } catch {
      try {
        const local = JSON.parse(localStorage.getItem('local_reports') || '[]');
        setReportsList(local);
      } catch {
        setReportsList([]);
      }
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchReports();
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, [username]);

  // Filter messages for Inbox vs Sent
  const inboxMessages = messages.filter(m => 
    m.toUsername === username || m.toUsername === 'all' || (!m.toUsername && m.fromUsername !== username)
  );

  const sentMessages = messages.filter(m => 
    m.fromUsername === username
  );

  const unreadCount = inboxMessages.filter(m => !m.isRead).length;

  // Filtered inbox based on search & filter tabs
  const filteredInbox = inboxMessages.filter(m => {
    if (filterType === 'unread' && m.isRead) return false;
    if (filterType === 'with-report' && !m.reportNumber && !m.reportId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSub = (m.subject || '').toLowerCase().includes(q);
      const matchFrom = (m.fromName || '').toLowerCase().includes(q);
      const matchRep = (m.reportNumber || '').toLowerCase().includes(q);
      const matchBody = (m.content || '').toLowerCase().includes(q);
      return matchSub || matchFrom || matchRep || matchBody;
    }
    return true;
  });

  const filteredSent = sentMessages.filter(m => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSub = (m.subject || '').toLowerCase().includes(q);
      const matchTo = (m.toName || '').toLowerCase().includes(q);
      const matchRep = (m.reportNumber || '').toLowerCase().includes(q);
      return matchSub || matchTo || matchRep;
    }
    return true;
  });

  // Handle Mark as Read
  const handleMarkAsRead = async (msgId) => {
    try {
      await fastFetch(`http://localhost:5000/api/messages/${msgId}/read`, { method: 'PUT' });
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isRead: true } : m));
    } catch (err) {
      console.warn('Failed to mark read on server, updating local state:', err);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isRead: true } : m));
    }
  };

  // Handle Delete Message
  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المراسلة؟')) return;
    try {
      await fastFetch(`http://localhost:5000/api/messages/${msgId}`, { method: 'DELETE' });
      setMessages(prev => prev.filter(m => m.id !== msgId));
      if (selectedMessage?.id === msgId) setSelectedMessage(null);
      setStatusNotification({ type: 'success', text: 'تم حذف المراسلة بنجاح.' });
    } catch {
      setMessages(prev => prev.filter(m => m.id !== msgId));
      setStatusNotification({ type: 'success', text: 'تم حذف المراسلة بنجاح.' });
    }
  };

  // Handle Send Compose
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!composeSubject.trim() || !composeBody.trim()) {
      alert('يرجى كتابة موضوع ونص المراسلة.');
      return;
    }

    setIsSending(true);

    let targetUser = officialSupervisors.find(u => u.username === composeRecipient);
    let toName = targetUser?.name || 'مدير المشروع';
    let toRole = targetUser?.role || 'جهاز الإشراف';

    if (composeRecipient === 'all') {
      toName = 'كافة أعضاء جهاز الإشراف (تعميم)';
      toRole = 'جهاز الإشراف والمتابعة';
    }

    // Attached report details
    let repData = null;
    let repNumber = null;
    if (attachedReportId) {
      const rep = reportsList.find(r => String(r.id) === String(attachedReportId) || r.reportNumber === attachedReportId);
      if (rep) {
        repNumber = rep.reportNumber;
        repData = rep;
      }
    }

    const payload = {
      fromUsername: currentUser?.username || 'user',
      fromName: currentUser?.name || 'مهندس الإشراف',
      fromRole: currentUser?.title || currentUser?.role || 'جهاز الإشراف',
      toUsername: composeRecipient,
      toName,
      toRole,
      type: composeType,
      subject: composeSubject.trim(),
      content: composeBody.trim(),
      reportId: attachedReportId || null,
      reportNumber: repNumber,
      reportData: repData,
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fastFetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const newMsg = res?.message || { id: Date.now(), ...payload };
      setMessages(prev => [newMsg, ...prev]);

      // Reset form
      setComposeSubject('');
      setComposeBody('');
      setAttachedReportId('');
      setStatusNotification({ type: 'success', text: `تم إرسال المراسلة بنجاح إلى (${toName})!` });
      setActiveSubTab('sent');
    } catch (err) {
      console.error('Error sending message:', err);
      // Fallback
      const newMsg = { id: Date.now(), ...payload };
      setMessages(prev => [newMsg, ...prev]);
      setStatusNotification({ type: 'success', text: `تم تسجيل وإرسال المراسلة محلياً بنجاح.` });
      setActiveSubTab('sent');
    } finally {
      setIsSending(false);
    }
  };

  // Reply shortcut
  const handleReplyTo = (msg) => {
    setComposeRecipient(msg.fromUsername || 'admin');
    setComposeSubject(`رد: ${msg.subject}`);
    setComposeBody(`\n\n--------------------\nرداً على مراسلة ${msg.fromName} بتاريخ ${new Date(msg.createdAt).toLocaleDateString('ar-LY')}:\n${msg.content}`);
    if (msg.reportId) {
      setAttachedReportId(msg.reportId);
    }
    setActiveSubTab('compose');
    setSelectedMessage(null);
  };

  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case 'إحالة تقرير يومي':
        return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
      case 'توجيه فني وملاحظات ميدانية':
        return { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' };
      case 'إشعار اعتماد':
        return { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
      case 'طلب فحص أو اختبار جودة':
        return { bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
      default:
        return { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
    }
  };

  return (
    <div style={{ padding: '1.25rem', maxWidth: '1350px', margin: '0 auto', direction: 'rtl' }}>
      {/* Top Banner Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '16px',
        padding: '1.5rem 1.75rem',
        color: '#fff',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.25)',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
          }}>
            <Mail size={28} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
              البريد والمراسلات الرسمية
            </h1>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.86rem', color: '#94a3b8' }}>
              إرسال واستقبال التقارير الميدانية والتوجيهات الفنية بين مدير المشروع، رئيس الجهاز، ومسؤولي القطاعات والجودة
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={fetchMessages}
            title="تحديث صندوق البريد"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f1f5f9',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={17} />
          </button>
        </div>
      </div>

      {/* Quick KPI Stat Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1rem 1.25rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>صندوق الوارد</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>{inboxMessages.length}</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <Inbox size={20} />
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '1rem 1.25rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>رسائل غير مقروءة</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: unreadCount > 0 ? '#ef4444' : '#10b981' }}>{unreadCount}</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: unreadCount > 0 ? '#fef2f2' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: unreadCount > 0 ? '#ef4444' : '#10b981' }}>
            <AlertCircle size={20} />
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '1rem 1.25rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>تقارير محالة رسميًا</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#3b82f6' }}>
              {messages.filter(m => m.reportNumber).length}
            </div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
            <FileText size={20} />
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '1rem 1.25rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>البريد الصادر</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>{sentMessages.length}</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            <ArrowUpRight size={20} />
          </div>
        </div>
      </div>

      {/* Status Notification if any */}
      {statusNotification && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: '10px',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#15803d',
          fontWeight: 700,
          fontSize: '0.88rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>{statusNotification.text}</span>
          <button
            type="button"
            onClick={() => setStatusNotification(null)}
            style={{ background: 'transparent', border: 'none', color: '#15803d', cursor: 'pointer', fontWeight: 800 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Mailbox Shell */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        
        {/* Navigation Tabs Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => { setActiveSubTab('inbox'); setSelectedMessage(null); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.9rem 1.25rem',
                border: 'none',
                background: 'transparent',
                borderBottom: activeSubTab === 'inbox' ? '3px solid #2563eb' : '3px solid transparent',
                color: activeSubTab === 'inbox' ? '#2563eb' : '#64748b',
                fontWeight: activeSubTab === 'inbox' ? 800 : 600,
                fontSize: '0.92rem',
                cursor: 'pointer'
              }}
            >
              <Inbox size={18} />
              <span>صندوق الوارد</span>
              {unreadCount > 0 && (
                <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.72rem', padding: '0.1rem 0.45rem', borderRadius: '10px', fontWeight: 800 }}>
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setActiveSubTab('sent'); setSelectedMessage(null); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.9rem 1.25rem',
                border: 'none',
                background: 'transparent',
                borderBottom: activeSubTab === 'sent' ? '3px solid #2563eb' : '3px solid transparent',
                color: activeSubTab === 'sent' ? '#2563eb' : '#64748b',
                fontWeight: activeSubTab === 'sent' ? 800 : 600,
                fontSize: '0.92rem',
                cursor: 'pointer'
              }}
            >
              <ArrowUpRight size={18} />
              <span>البريد الصادر</span>
              <span style={{ background: '#e2e8f0', color: '#475569', fontSize: '0.72rem', padding: '0.1rem 0.45rem', borderRadius: '10px', fontWeight: 700 }}>
                {sentMessages.length}
              </span>
            </button>
          </div>

          {/* Quick Search */}
          {(activeSubTab === 'inbox' || activeSubTab === 'sent') && (
            <div style={{ position: 'relative', width: '280px' }}>
              <input
                type="text"
                placeholder="بحث في المراسلات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.75rem 0.45rem 2rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.84rem',
                  background: '#fff'
                }}
              />
              <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          )}
        </div>

        {/* Tab 1: INBOX */}
        {activeSubTab === 'inbox' && (
          <div>
            {/* Filter Sub-bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderBottom: '1px solid #f1f5f9', background: '#fff' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>تصفية:</span>
              <button
                type="button"
                onClick={() => setFilterType('all')}
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: filterType === 'all' ? '#2563eb' : '#e2e8f0',
                  background: filterType === 'all' ? '#eff6ff' : '#fff',
                  color: filterType === 'all' ? '#1d4ed8' : '#64748b',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                الكل ({inboxMessages.length})
              </button>

              <button
                type="button"
                onClick={() => setFilterType('unread')}
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: filterType === 'unread' ? '#ef4444' : '#e2e8f0',
                  background: filterType === 'unread' ? '#fef2f2' : '#fff',
                  color: filterType === 'unread' ? '#b91c1c' : '#64748b',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                غير مقروء ({unreadCount})
              </button>

              <button
                type="button"
                onClick={() => setFilterType('with-report')}
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: filterType === 'with-report' ? '#8b5cf6' : '#e2e8f0',
                  background: filterType === 'with-report' ? '#f5f3ff' : '#fff',
                  color: filterType === 'with-report' ? '#6d28d9' : '#64748b',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                تحتوي على تقارير ({inboxMessages.filter(m => m.reportNumber).length})
              </button>
            </div>

            {/* Empty State */}
            {filteredInbox.length === 0 ? (
              <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#94a3b8' }}>
                  <Inbox size={32} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#334155', margin: 0 }}>
                  صندوق الوارد فارغ ونظيف
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.35rem 0 1.25rem' }}>
                  لا توجد مراسلات أو إحالات تقارير واردة لحسابك حالياً.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('compose')}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    background: '#2563eb',
                    border: 'none',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  إرسال مراسلة جديدة
                </button>
              </div>
            ) : (
              /* Message List */
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {filteredInbox.map((msg) => {
                  const typeStyle = getTypeBadgeStyle(msg.type);
                  const isExpanded = selectedMessage?.id === msg.id;

                  return (
                    <div 
                      key={msg.id}
                      style={{
                        padding: '1.25rem',
                        borderBottom: '1px solid #f1f5f9',
                        background: msg.isRead ? '#ffffff' : '#f0f7ff',
                        transition: 'background 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        if (!msg.isRead) handleMarkAsRead(msg.id);
                        setSelectedMessage(isExpanded ? null : msg);
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                        {/* Sender Avatar & Info */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                          <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            background: msg.isRead ? '#e2e8f0' : '#2563eb',
                            color: msg.isRead ? '#475569' : '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            flexShrink: 0
                          }}>
                            {(msg.fromName || 'م')[0]}
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.92rem', fontWeight: msg.isRead ? 700 : 800, color: '#0f172a' }}>
                                {msg.fromName}
                              </span>
                              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                ({msg.fromRole})
                              </span>
                              <span style={{
                                fontSize: '0.72rem',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '6px',
                                background: typeStyle.bg,
                                color: typeStyle.color,
                                border: `1px solid ${typeStyle.border}`,
                                fontWeight: 700
                              }}>
                                {msg.type}
                              </span>

                              {!msg.isRead && (
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                              )}
                            </div>

                            <div style={{ fontSize: '0.95rem', fontWeight: msg.isRead ? 600 : 800, color: '#1e293b', marginTop: '0.25rem' }}>
                              {msg.subject}
                            </div>

                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem', lineHeight: 1.5 }}>
                              {isExpanded ? msg.content : `${(msg.content || '').slice(0, 110)}${(msg.content || '').length > 110 ? '...' : ''}`}
                            </div>
                          </div>
                        </div>

                        {/* Date and Quick Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', flexShrink: 0 }}>
                          <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600 }}>
                            {new Date(msg.createdAt).toLocaleDateString('ar-LY')}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={(e) => e.stopPropagation()}>

                            <button
                              type="button"
                              onClick={() => handleDeleteMessage(msg.id)}
                              title="حذف المراسلة"
                              style={{
                                padding: '0.35rem',
                                borderRadius: '6px',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#ef4444',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Attached Report Box if Present */}
                      {(msg.reportNumber || msg.reportData) && (
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            marginTop: '0.85rem',
                            padding: '0.85rem 1rem',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '0.75rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8' }}>
                              <FileText size={17} />
                            </div>
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                                التقرير المرفق: ({msg.reportNumber || msg.reportData?.reportNumber})
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {msg.reportData?.sector || 'موقع المشروع'} • {msg.reportData?.roadMeters ? `إنجاز: ${msg.reportData.roadMeters} متر` : 'تقرير شامل'}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                              type="button"
                              onClick={() => onPrintReport && onPrintReport(msg.reportData || { reportNumber: msg.reportNumber })}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '6px',
                                background: '#2563eb',
                                border: 'none',
                                color: '#fff',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              <Printer size={14} />
                              <span>معاينة وطباعة التقرير</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => onNavigateTab && onNavigateTab('reports-archive')}
                              style={{
                                padding: '0.4rem 0.8rem',
                                borderRadius: '6px',
                                background: '#fff',
                                border: '1px solid #cbd5e1',
                                color: '#475569',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              أرشيف التقارير
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: SENT MAIL */}
        {activeSubTab === 'sent' && (
          <div>
            {filteredSent.length === 0 ? (
              <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#94a3b8' }}>
                  <ArrowUpRight size={32} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#334155', margin: 0 }}>
                  لا توجد مراسلات صادرة
                </h3>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {filteredSent.map((msg) => {
                  const typeStyle = getTypeBadgeStyle(msg.type);

                  return (
                    <div 
                      key={msg.id}
                      style={{
                        padding: '1.25rem',
                        borderBottom: '1px solid #f1f5f9',
                        background: '#ffffff'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>مرسلة إلى:</span>
                            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                              {msg.toName}
                            </span>
                            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                              ({msg.toRole})
                            </span>
                            <span style={{
                              fontSize: '0.72rem',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '6px',
                              background: typeStyle.bg,
                              color: typeStyle.color,
                              border: `1px solid ${typeStyle.border}`,
                              fontWeight: 700
                            }}>
                              {msg.type}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', marginTop: '0.35rem' }}>
                            {msg.subject}
                          </div>

                          <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.25rem', lineHeight: 1.5 }}>
                            {msg.content}
                          </div>

                          {msg.reportNumber && (
                            <div style={{ marginTop: '0.6rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '0.25rem 0.65rem', fontSize: '0.78rem', color: '#1d4ed8', fontWeight: 700 }}>
                              <FileText size={14} />
                              <span>مرفق تقرير: {msg.reportNumber}</span>
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600 }}>
                            {new Date(msg.createdAt).toLocaleDateString('ar-LY')}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.id)}
                            style={{
                              padding: '0.35rem',
                              borderRadius: '6px',
                              background: '#fef2f2',
                              border: '1px solid #fecaca',
                              color: '#ef4444',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CorrespondenceView;
