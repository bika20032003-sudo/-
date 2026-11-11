import React, { useState, useEffect, useMemo } from 'react';
import { 
  Mail, Send, Inbox, ArrowUpRight, CheckCheck, Trash2, 
  FileText, Printer, PlusCircle, Search, Filter, RefreshCw, 
  User, CheckCircle2, Clock, AlertCircle, Eye, ShieldCheck, 
  Paperclip, ArrowRight, CornerDownLeft, MessageSquare, Sparkles
} from 'lucide-react';
import { fastFetch } from '../utils/apiCache.js';
import { 
  getAllSupervisors, 
  getSelectableRecipients, 
  canonicalizeUsername, 
  isSameSupervisor, 
  isMessageForUser, 
  isMessageFromUser, 
  getSupervisorInfo 
} from '../utils/supervisionTeam.js';
import { 
  isReportOwnedByEngineer, 
  canAccessGeneralArchive, 
  getUserDeletedMessageIds, 
  markMessageDeletedForUser, 
  getUserReadMessageIds, 
  markMessageReadForUser 
} from '../utils/permissionUtils.js';

export const CorrespondenceView = ({ currentUser, onNavigateTab, onPrintReport }) => {
  const [activeSubTab, setActiveSubTab] = useState('inbox'); // 'inbox' | 'sent' | 'compose'
  const [messages, setMessages] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'unread' | 'with-report'
  const [statusNotification, setStatusNotification] = useState(null);

  // Compose Form State
  const [composeRecipient, setComposeRecipient] = useState('all');
  const [composeType, setComposeType] = useState('إحالة تقرير يومي');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [attachedReportId, setAttachedReportId] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Expanded message for detailed reading
  const [selectedMessage, setSelectedMessage] = useState(null);

  const rawUsername = currentUser?.username || 'project_manager';
  const u = canonicalizeUsername(rawUsername);

  // Dynamic system supervisors & active team members (all valid correspondents)
  const officialSupervisors = useMemo(() => {
    return getAllSupervisors();
  }, []);

  // Filter out the current user so they don't send messages to themselves
  const selectableRecipients = useMemo(() => {
    return getSelectableRecipients(u);
  }, [u]);

  useEffect(() => {
    if (!composeRecipient || isSameSupervisor(composeRecipient, u)) {
      setComposeRecipient(selectableRecipients.length > 0 ? selectableRecipients[0].username : 'all');
    }
  }, [selectableRecipients, composeRecipient, u]);

  // Fetch messages from backend & local storage
  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const res = await fastFetch(`/api/messages?username=${encodeURIComponent(u)}`);
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
        const local = JSON.parse(localStorage.getItem('system_messages') || localStorage.getItem('local_messages') || '[]');
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
      const res = await fastFetch('/api/reports');
      const list = res?.reports || (Array.isArray(res) ? res : []);
      if (list.length > 0) {
        setReportsList(list);
      } else {
        const local = JSON.parse(localStorage.getItem('local_reports') || '[]');
        setReportsList(local);
      }
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

    const handleUpdate = () => {
      fetchMessages();
      fetchReports();
    };

    window.addEventListener('messages-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    const interval = setInterval(fetchMessages, 8000);

    return () => {
      window.removeEventListener('messages-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, [u]);

  // Filter messages strictly for current user's isolated mailbox
  const userDeletedIds = getUserDeletedMessageIds(u);
  const userReadIds = getUserReadMessageIds(u);

  // 1. صندوق الوارد المستقل للمستخدم الحالي (لا يرى رسائل غيره ولا الرسائل المحذوفة من طرفه)
  const inboxMessages = messages.filter(m => {
    if (!m || !m.id) return false;
    const msgId = String(m.id);
    if (userDeletedIds.has(msgId)) return false;
    const deletedBy = (m.deletedBy || []).map(d => canonicalizeUsername(d));
    if (deletedBy.includes(u) || deletedBy.includes(rawUsername.toLowerCase())) return false;

    // الرسائل الصادرة من هذا المستخدم تذهب لصندوق الصادر فقط
    if (isMessageFromUser(m, u)) return false;

    // المراسلات الموجهة لهذا المستخدم حصرياً أو تعميم لكافة الفريق
    return isMessageForUser(m, u);
  }).map(m => {
    const to = canonicalizeUsername(m.toUsername);
    if (to === 'all' || m.toUsername === 'all') {
      const readBy = (m.readBy || []).map(r => canonicalizeUsername(r));
      const isRead = userReadIds.has(String(m.id)) || readBy.includes(u) || readBy.includes(rawUsername.toLowerCase()) || Boolean(m.isRead);
      return { ...m, isRead };
    }
    return m;
  });

  // 2. صندوق الصادر المستقل للمستخدم الحالي (فقط المراسلات التي أرسلها هو)
  const sentMessages = messages.filter(m => {
    if (!m || !m.id) return false;
    const msgId = String(m.id);
    if (userDeletedIds.has(msgId)) return false;
    const deletedBy = (m.deletedBy || []).map(d => canonicalizeUsername(d));
    if (deletedBy.includes(u) || deletedBy.includes(rawUsername.toLowerCase())) return false;

    return isMessageFromUser(m, u);
  });

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
      const matchBody = (m.content || '').toLowerCase().includes(q);
      return matchSub || matchTo || matchRep || matchBody;
    }
    return true;
  });

  // Handle Mark as Read
  const handleMarkAsRead = async (msgId) => {
    markMessageReadForUser(msgId, username);
    try {
      await fastFetch(`/api/messages/${msgId}/read?username=${encodeURIComponent(username)}`, { method: 'PUT' });
    } catch (err) {
      console.warn('Failed to mark read on server, updating local state:', err);
    }
    setMessages(prev => prev.map(m => String(m.id) === String(msgId) ? { ...m, isRead: true } : m));
    window.dispatchEvent(new CustomEvent('messages-updated'));
  };

  // Handle Delete Single Message (Independent per-user soft delete)
  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المراسلة من صندوق بريدك؟\n\nلن يؤثر الحذف على الطرف الآخر.')) return;
    markMessageDeletedForUser(msgId, username);

    try {
      await fastFetch(`/api/messages/${msgId}?username=${encodeURIComponent(username)}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend delete error, preserved local mark:', err);
    }

    setMessages(prev => prev.filter(m => String(m.id) !== String(msgId)));
    if (String(selectedMessage?.id) === String(msgId)) setSelectedMessage(null);
    setStatusNotification({ type: 'success', text: 'تم حذف المراسلة من صندوق بريدك بنجاح.' });
    window.dispatchEvent(new CustomEvent('messages-updated'));
  };

  // Handle Delete All Messages in User's Personal Mailbox
  const handleDeleteAllMessages = async () => {
    const totalCount = inboxMessages.length + sentMessages.length;
    if (totalCount === 0) {
      alert('صندوق بريدك فارغ بالفعل.');
      return;
    }
    const confirmed = window.confirm(
      `تحذير: هل أنت متأكد من تفريغ كافة المراسلات الخاصة بك (${totalCount} مراسلة) من صندوقي الوارد والصادر؟\n\nملاحظة: هذا الإجراء مستقل وخاص بحسابك فقط، ولن يؤثر على بريد باقي المهندسين.`
    );
    if (!confirmed) return;

    [...inboxMessages, ...sentMessages].forEach(m => markMessageDeletedForUser(m.id, username));
    try {
      await fastFetch(`/api/messages/clear-all?username=${encodeURIComponent(username)}&box=all`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Backend clear failed:', e);
    }

    const myIds = new Set([...inboxMessages, ...sentMessages].map(m => String(m.id)));
    setMessages(prev => prev.filter(m => !myIds.has(String(m.id))));
    setSelectedMessage(null);
    setStatusNotification({ type: 'success', text: 'تم تفريغ صندوق بريدك بالكامل بنجاح.' });
    window.dispatchEvent(new CustomEvent('messages-updated'));
  };

  // Handle Clear All Inbox Messages (User-isolated)
  const handleClearAllInbox = async () => {
    if (inboxMessages.length === 0) return;
    const confirmed = window.confirm(
      `هل أنت متأكد من تفريغ كافة الرسائل الواردة الخاصة بك (${inboxMessages.length} رسالة)؟\n\nلن تتأثر المراسلات لدى المرسلين.`
    );
    if (!confirmed) return;

    inboxMessages.forEach(m => markMessageDeletedForUser(m.id, username));
    try {
      await fastFetch(`/api/messages/clear-all?username=${encodeURIComponent(username)}&box=inbox`, { method: 'DELETE' });
    } catch (e) {}

    const inboxIds = new Set(inboxMessages.map(m => String(m.id)));
    setMessages(prev => prev.filter(m => !inboxIds.has(String(m.id))));
    if (selectedMessage && inboxIds.has(String(selectedMessage.id))) setSelectedMessage(null);
    setStatusNotification({ type: 'success', text: 'تم تفريغ صندوق الوارد الخاص بك بنجاح.' });
    window.dispatchEvent(new CustomEvent('messages-updated'));
  };

  // Handle Clear All Sent Messages (User-isolated)
  const handleClearAllSent = async () => {
    if (sentMessages.length === 0) return;
    const confirmed = window.confirm(
      `هل أنت متأكد من تفريغ كافة الرسائل الصادرة منك (${sentMessages.length} رسالة)؟\n\nستظل المراسلات محفوظة في صناديق الوارد لدى المستلمين.`
    );
    if (!confirmed) return;

    sentMessages.forEach(m => markMessageDeletedForUser(m.id, username));
    try {
      await fastFetch(`/api/messages/clear-all?username=${encodeURIComponent(username)}&box=sent`, { method: 'DELETE' });
    } catch (e) {}

    const sentIds = new Set(sentMessages.map(m => String(m.id)));
    setMessages(prev => prev.filter(m => !sentIds.has(String(m.id))));
    if (selectedMessage && sentIds.has(String(selectedMessage.id))) setSelectedMessage(null);
    setStatusNotification({ type: 'success', text: 'تم تفريغ صندوق الصادر الخاص بك بنجاح.' });
    window.dispatchEvent(new CustomEvent('messages-updated'));
  };

  // Reports accessible for attachment in correspondence
  const attachableReports = useMemo(() => {
    if (canAccessGeneralArchive(currentUser)) {
      return reportsList;
    }
    return reportsList.filter(r => isReportOwnedByEngineer(r, currentUser));
  }, [reportsList, currentUser]);

  // Handle Send Compose
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!composeSubject.trim() || !composeBody.trim()) {
      alert('يرجى كتابة موضوع ونص المراسلة.');
      return;
    }

    setIsSending(true);

    let toName = 'مدير المشروع';
    let toRole = 'جهاز الإشراف';

    if (composeRecipient === 'all') {
      toName = 'كافة أعضاء جهاز الإشراف (تعميم)';
      toRole = 'جهاز الإشراف والمتابعة';
    } else {
      const sup = getSupervisorInfo(composeRecipient);
      toName = sup.name || 'عضو جهاز الإشراف';
      toRole = sup.role || 'جهاز الإشراف';
    }

    // Attached report details
    let repData = null;
    let repNumber = null;
    if (attachedReportId) {
      const rep = attachableReports.find(r => String(r.id) === String(attachedReportId) || r.reportNumber === attachedReportId);
      if (rep) {
        repNumber = rep.reportNumber;
        repData = rep;
      }
    }

    const senderInfo = getSupervisorInfo(u);
    const payload = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      fromUsername: u,
      fromName: currentUser?.name || senderInfo.name || 'مدير المشروع',
      fromRole: currentUser?.title || currentUser?.role || senderInfo.role || 'جهاز الإشراف',
      toUsername: composeRecipient,
      toName,
      toRole,
      type: composeType,
      subject: composeSubject.trim(),
      content: composeBody.trim(),
      reportId: attachedReportId || null,
      reportNumber: repNumber,
      reportData: repData,
      createdAt: new Date().toISOString(),
      isRead: false,
      readBy: [],
      deletedBy: []
    };

    try {
      const res = await fastFetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const newMsg = res?.message || payload;
      setMessages(prev => [newMsg, ...prev.filter(m => String(m.id) !== String(newMsg.id))]);

      // Reset form
      setComposeSubject('');
      setComposeBody('');
      setAttachedReportId('');
      setStatusNotification({ type: 'success', text: `تم إرسال المراسلة بنجاح إلى (${toName})!` });
      setActiveSubTab('sent');
    } catch (err) {
      console.error('Error sending message:', err);
      const newMsg = payload;
      setMessages(prev => [newMsg, ...prev.filter(m => String(m.id) !== String(newMsg.id))]);
      setStatusNotification({ type: 'success', text: `تم تسجيل وإرسال المراسلة بنجاح.` });
      setActiveSubTab('sent');
    } finally {
      setIsSending(false);
    }
  };

  // Reply shortcut
  const handleReplyTo = (msg) => {
    const rawReply = msg.fromUsername || 'project_manager';
    const replyRecipient = canonicalizeUsername(rawReply);
    setComposeRecipient(replyRecipient);
    setComposeSubject(`رد: ${msg.subject}`);
    setComposeBody(`\n\n--------------------\nرداً على مراسلة ${msg.fromName} بتاريخ ${new Date(msg.createdAt).toLocaleDateString('ar-LY')}:\n${msg.content}`);
    if (msg.reportId) {
      setAttachedReportId(msg.reportId);
    }
    setActiveSubTab('compose');
    setSelectedMessage(null);
  };

  // Template Quick Chips
  const applyQuickTemplate = (templateSubject, templateBody, type = 'إحالة تقرير يومي') => {
    setComposeSubject(templateSubject);
    setComposeBody(templateBody);
    setComposeType(type);
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
      case 'إحاطة إدارية ومتابعة الموقف التنفيذي':
        return { bg: '#fdf2f8', color: '#be185d', border: '#fbcfe8' };
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>
                البريد والمراسلات الرسمية
              </h1>
              <span style={{
                background: 'rgba(59, 130, 246, 0.25)',
                color: '#93c5fd',
                border: '1px solid rgba(147, 197, 253, 0.3)',
                padding: '2px 10px',
                borderRadius: '999px',
                fontSize: '0.74rem',
                fontWeight: 800
              }}>
                صندوق خاص: {currentUser?.name || 'المهندس المشرف'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#94a3b8' }}>
              صندوق بريد ومراسلات مستقل وخاص بك ({currentUser?.name || ''}) - إرسال واستقبال التقارير والتوجيهات الفنية مع كافة أعضاء جهاز الإشراف
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => { setActiveSubTab('compose'); setSelectedMessage(null); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              transition: 'all 0.15s ease'
            }}
          >
            <PlusCircle size={18} />
            <span>إرسال مراسلة جديدة</span>
          </button>

          <button
            type="button"
            onClick={handleDeleteAllMessages}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.65rem 1.15rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)',
              transition: 'all 0.15s ease'
            }}
            title="تفريغ كافة المراسلات الخاصة بك فقط من الصندوقين (الوارد والصادر)"
          >
            <Trash2 size={16} />
            <span>تفريغ بريدي</span>
          </button>

          
        </div>
      </div>

      {/* Quick KPI Stat Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div 
          onClick={() => { setActiveSubTab('inbox'); setSelectedMessage(null); }}
          style={{ 
            background: activeSubTab === 'inbox' ? '#eff6ff' : '#fff', 
            borderRadius: '12px', 
            padding: '1rem 1.25rem', 
            border: activeSubTab === 'inbox' ? '2px solid #2563eb' : '1px solid #e2e8f0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>صندوق الوارد</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>{inboxMessages.length}</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <Inbox size={20} />
          </div>
        </div>

        <div 
          onClick={() => { setActiveSubTab('inbox'); setFilterType('unread'); setSelectedMessage(null); }}
          style={{ 
            background: filterType === 'unread' && activeSubTab === 'inbox' ? '#fef2f2' : '#fff', 
            borderRadius: '12px', 
            padding: '1rem 1.25rem', 
            border: filterType === 'unread' && activeSubTab === 'inbox' ? '2px solid #ef4444' : '1px solid #e2e8f0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>رسائل غير مقروءة</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: unreadCount > 0 ? '#ef4444' : '#10b981' }}>{unreadCount}</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: unreadCount > 0 ? '#fef2f2' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: unreadCount > 0 ? '#ef4444' : '#10b981' }}>
            <AlertCircle size={20} />
          </div>
        </div>

        <div 
          onClick={() => { setActiveSubTab('inbox'); setFilterType('with-report'); setSelectedMessage(null); }}
          style={{ 
            background: filterType === 'with-report' && activeSubTab === 'inbox' ? '#f5f3ff' : '#fff', 
            borderRadius: '12px', 
            padding: '1rem 1.25rem', 
            border: filterType === 'with-report' && activeSubTab === 'inbox' ? '2px solid #8b5cf6' : '1px solid #e2e8f0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
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

        <div 
          onClick={() => { setActiveSubTab('sent'); setSelectedMessage(null); }}
          style={{ 
            background: activeSubTab === 'sent' ? '#f8fafc' : '#fff', 
            borderRadius: '12px', 
            padding: '1rem 1.25rem', 
            border: activeSubTab === 'sent' ? '2px solid #475569' : '1px solid #e2e8f0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>البريد الصادر</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>{sentMessages.length}</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            <ArrowUpRight size={20} />
          </div>
        </div>
      </div>

      {/* Status Notification */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} />
            <span>{statusNotification.text}</span>
          </div>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
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

            <button
              type="button"
              onClick={() => { setActiveSubTab('compose'); setSelectedMessage(null); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.9rem 1.25rem',
                border: 'none',
                background: activeSubTab === 'compose' ? '#eff6ff' : 'transparent',
                borderBottom: activeSubTab === 'compose' ? '3px solid #2563eb' : '3px solid transparent',
                color: activeSubTab === 'compose' ? '#2563eb' : '#64748b',
                fontWeight: activeSubTab === 'compose' ? 800 : 600,
                fontSize: '0.92rem',
                cursor: 'pointer'
              }}
            >
              <Send size={18} />
              <span>إرسال مراسلة جديدة</span>
            </button>
          </div>

          {/* Quick Search */}
          {(activeSubTab === 'inbox' || activeSubTab === 'sent') && (
            <div style={{ position: 'relative', width: '280px', margin: '0.5rem 0' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: '1px solid #f1f5f9', background: '#fff', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                مرفق تقرير ({inboxMessages.filter(m => m.reportNumber).length})
              </button>
            </div>

            {inboxMessages.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllInbox}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '6px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
                title="حذف كافة الرسائل الواردة نهائياً"
              >
                <Trash2 size={14} />
                <span>حذف رسائل الوارد ({inboxMessages.length})</span>
              </button>
            )}
          </div>

            {/* List or Expanded View */}
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} />
                <p>جاري تحميل المراسلات...</p>
              </div>
            ) : filteredInbox.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94a3b8' }}>
                <Inbox size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#475569' }}>لا توجد رسائل واردة حالياً</h3>
                <p style={{ margin: '0.5rem 0 1rem', fontSize: '0.85rem' }}>
                  يمكنك بدء التواصل وإرسال التوجيهات أو التقارير لأي مهندس بالنقر أدناه
                </p>
                <button
                  type="button"
                  onClick={() => { setActiveSubTab('compose'); setSelectedMessage(null); }}
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  إنشاء مراسلة جديدة
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {filteredInbox.map((msg) => {
                  const isSelected = selectedMessage?.id === msg.id;
                  const typeStyle = getTypeBadgeStyle(msg.type);

                  return (
                    <div 
                      key={msg.id}
                      onClick={() => {
                        setSelectedMessage(isSelected ? null : msg);
                        if (!msg.isRead) handleMarkAsRead(msg.id);
                      }}
                      style={{
                        padding: '1.25rem',
                        borderBottom: '1px solid #f1f5f9',
                        background: msg.isRead ? '#ffffff' : '#f8fafc',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                        borderRight: msg.isRead ? '3px solid transparent' : '3px solid #2563eb'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.92rem', fontWeight: msg.isRead ? 700 : 900, color: '#0f172a' }}>
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
                              <span style={{ fontSize: '0.68rem', background: '#ef4444', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 800 }}>
                                جديد
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize: '0.95rem', fontWeight: msg.isRead ? 600 : 800, color: '#1e293b', marginTop: '0.35rem' }}>
                            {msg.subject}
                          </div>

                          <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.25rem', lineHeight: 1.5 }}>
                            {isSelected ? msg.content : (msg.content?.length > 130 ? msg.content.slice(0, 130) + '...' : msg.content)}
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

                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleReplyTo(msg); }}
                              style={{
                                padding: '0.35rem 0.65rem',
                                borderRadius: '6px',
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                color: '#2563eb',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}
                            >
                              <CornerDownLeft size={13} />
                              <span>رد</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg.id); }}
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

                      {/* Expanded Card Details */}
                      {isSelected && (
                        <div style={{
                          marginTop: '1.25rem',
                          padding: '1.25rem',
                          background: '#f8fafc',
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0'
                        }}>
                          <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: 700 }}>
                            نص المراسلة الكامل:
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#0f172a', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                            {msg.content}
                          </div>

                          {/* Report Quick Action Box if attached */}
                          {msg.reportNumber && (
                            <div style={{
                              marginTop: '1rem',
                              padding: '0.85rem 1rem',
                              background: '#ffffff',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '0.75rem'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <FileText size={20} color="#2563eb" />
                                <div>
                                  <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>
                                    مرفق تقرير رقم: {msg.reportNumber}
                                  </strong>
                                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                    {msg.reportData?.title || 'تقرير ميداني معتمد'}
                                  </span>
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onPrintReport && msg.reportData) {
                                      onPrintReport(msg.reportData);
                                    } else if (onNavigateTab) {
                                      onNavigateTab('reports-archive');
                                    }
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    padding: '0.45rem 0.85rem',
                                    background: '#2563eb',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Printer size={14} />
                                  <span>معاينة وطباعة التقرير</span>
                                </button>
                              </div>
                            </div>
                          )}

                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', gap: '0.5rem' }}>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleReplyTo(msg); }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.5rem 1rem',
                                background: '#2563eb',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.84rem',
                                fontWeight: 800,
                                cursor: 'pointer'
                              }}
                            >
                              <CornerDownLeft size={15} />
                              <span>رد على المراسلة الآن</span>
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

        {/* Tab 2: SENT */}
        {activeSubTab === 'sent' && (
          <div>
            {/* Sent Sub-bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: '1px solid #f1f5f9', background: '#fff', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
                إجمالي الرسائل الصادرة: ({sentMessages.length})
              </span>

              {sentMessages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllSent}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '6px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                  title="حذف كافة الرسائل الصادرة نهائياً"
                >
                  <Trash2 size={14} />
                  <span>حذف الرسائل الصادرة ({sentMessages.length})</span>
                </button>
              )}
            </div>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} />
                <p>جاري تحميل المراسلات...</p>
              </div>
            ) : filteredSent.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94a3b8' }}>
                <ArrowUpRight size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#475569' }}>لا توجد رسائل صادرة بعد</h3>
                <p style={{ margin: '0.5rem 0 1rem', fontSize: '0.85rem' }}>
                  الرسائل التي ترسلها لأعضاء جهاز الإشراف ستظهر هنا
                </p>
                <button
                  type="button"
                  onClick={() => { setActiveSubTab('compose'); setSelectedMessage(null); }}
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  إنشاء مراسلة جديدة
                </button>
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

                          <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.25rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
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

        {/* Tab 3: COMPOSE NEW MESSAGE (Full-featured, professional form) */}
        {activeSubTab === 'compose' && (
          <div style={{ padding: '1.5rem', background: '#ffffff' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <Send size={22} color="#2563eb" />
              <div>
                <strong style={{ fontSize: '0.98rem', color: '#1e3a8a', display: 'block' }}>
                  إنشاء وإرسال مراسلة رسمية جديدة
                </strong>
                <span style={{ fontSize: '0.78rem', color: '#475569' }}>
                  اختر المسؤول المستلم وأرفق التقرير المعتمد (إن وجد) لتسجيل المراسلة فوراً بحساب المستلم
                </span>
              </div>
            </div>

            <form onSubmit={handleSendMessage}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                {/* Recipient Dropdown */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                    المسؤول المستلم للمراسلة: <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={composeRecipient}
                    onChange={(e) => setComposeRecipient(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      background: '#fff',
                      color: '#0f172a'
                    }}
                  >
                    <option value="all">📢 تعميم رسمي لكافة أعضاء جهاز الإشراف</option>
                    {selectableRecipients.map((sup) => (
                      <option key={sup.username} value={sup.username}>
                        {sup.name} - ({sup.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message Type Dropdown */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                    نوع وتصنيف المراسلة: <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={composeType}
                    onChange={(e) => setComposeType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      background: '#fff',
                      color: '#0f172a'
                    }}
                  >
                    <option value="إحالة تقرير يومي">إحالة تقرير يومي</option>
                    <option value="توجيه فني وملاحظات ميدانية">توجيه فني وملاحظات ميدانية</option>
                    <option value="إشعار اعتماد">إشعار اعتماد</option>
                    <option value="طلب فحص أو اختبار جودة">طلب فحص أو اختبار جودة</option>
                    <option value="إحاطة إدارية ومتابعة الموقف التنفيذي">إحاطة إدارية ومتابعة الموقف التنفيذي</option>
                  </select>
                </div>
              </div>

              {/* Subject Input */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                  موضوع المراسلة: <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: إحالة تقرير كميات الرصف لمحطة 241+200 للاعتماد..."
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    background: '#fff'
                  }}
                />
              </div>

              {/* Report Attachment Dropdown */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                  إرفاق تقرير من سجل تقاريرك المعتمدة (اختياري):
                </label>
                <select
                  value={attachedReportId}
                  onChange={(e) => setAttachedReportId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.86rem',
                    background: '#fff',
                    color: '#334155'
                  }}
                >
                  <option value="">-- بدون إرفاق تقرير (مراسلة نصية فقط) --</option>
                  {attachableReports.map((r, idx) => (
                    <option key={r.id || idx} value={r.id || r.reportNumber}>
                      {r.reportNumber ? `[${r.reportNumber}] ` : ''}
                      {r.title || r.reportType || 'تقرير ميداني'} 
                      {r.dateFormatted || r.date ? ` - بتاريخ ${r.dateFormatted || r.date}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message Content */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                  نص المراسلة والتفاصيل الميدانية: <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  rows={6}
                  placeholder="اكتب تفاصيل التوجيه أو التقرير أو الإحاطة الهندسية..."
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('inbox')}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={isSending}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 1.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    cursor: isSending ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
                    opacity: isSending ? 0.7 : 1
                  }}
                >
                  <Send size={16} />
                  <span>{isSending ? 'جاري الإرسال...' : 'إرسال المراسلة الآن ✉️'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default CorrespondenceView;
