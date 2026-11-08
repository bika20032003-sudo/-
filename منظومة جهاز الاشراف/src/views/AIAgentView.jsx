import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Sparkles, Send, Copy, Check, Key, Paperclip, 
  FileSpreadsheet, FileText, Image as ImageIcon, X,
  Layers, Milestone, Fuel, AlertTriangle, Printer,
  Award, Newspaper, HardHat, CheckCircle2, Calendar,
  ArrowRight, Mail, Search, RefreshCw, ExternalLink,
  ChevronLeft, Eye, MessageSquare, Clock
} from 'lucide-react';
import { 
  processLocalQuery, 
  callGeminiCloudAgent, 
  getLiveSystemContext, 
  getDefaultApiKey, 
  parseUploadedFile,
  fmt,
  generateExecutiveBriefingArticle
} from '../utils/aiAgentEngine.js';
import { canAccessGeneralArchive } from '../utils/permissionUtils.js';

export const AIAgentView = ({ currentUser, onNavigateTab }) => {
  // Navigation tabs: 'chat' (المحادثة والاستعلام التنفيذي) | 'feed' (سجل المنظومة والأرشيف الحي)
  const [activeTab, setActiveTab] = useState('chat');

  // Chat states
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [useCloudLLM, setUseCloudLLM] = useState(true);
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      return localStorage.getItem('gemini_api_key') || (typeof getDefaultApiKey === 'function' ? getDefaultApiKey() : '');
    } catch (_) {
      return '';
    }
  });
  const [showSettings, setShowSettings] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [liveContext, setLiveContext] = useState(() => getLiveSystemContext());

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initial welcome message
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'agent',
      time: new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' }),
      title: 'مرحباً بك! أنا مساعد مدير المشروع',
      text: `أهلاً بك يا باشمهندس **${currentUser?.name || 'عبدالرحمن الأنصاري'}**.
أنا **مساعد مدير المشروع** المعتمد لمشروع **صيانة وتطوير طريق أوباري - غات (360 كم)**.

أنا مربوط لحظياً ومباشرة بكافة قواعد بيانات المنظومة:
• **أرشيف التقارير المعتمدة:** قراءة وبحث فوري في كافة تقارير الطريق والوقود والمرحلتين.
• **البريد والمراسلات:** متابعة التوجيهات، المراسلات الواردة، والإحالات الرسمية.
• **الموقف التنفيذي والمالي:** متابعة نسبة الإنجاز (%71.11)، أطوال الرصف، وجاهزية التتابع الإنشائي.
• **إدارة الوقود والآليات:** مراقبة أرصدة صهاريج نقطة 107 ونقطة 240 وجاهزية الـ 25 آلية.

يمكنك الضغط على أي كبسولة استعلام سريعة أدناه، أو كتابة أي سؤال، أو إرفاق مستندات وجداول Excel لتحليلها فورياً!`,
      suggestions: [
        '📰 الموجز التنفيذي لمدير المشروع',
        '📁 فحص أرشيف التقارير المعتمدة',
        '📬 المراسلات والبريد الوارد لمدير المشروع',
        '🛣️ موقف أعمال الطريق (المرحلة 1 و 2)',
        '⛽ موقف أرصدة واستهلاك الوقود بالمواقع'
      ]
    }
  ]);

  // Sync live context on mount and on storage/custom events
  useEffect(() => {
    const refreshContext = () => {
      setLiveContext(getLiveSystemContext());
    };

    window.addEventListener('storage', refreshContext);
    window.addEventListener('report-saved', refreshContext);
    window.addEventListener('report-updated', refreshContext);
    window.addEventListener('messages-updated', refreshContext);
    window.addEventListener('fuel-updated', refreshContext);
    window.addEventListener('road-progress-updated', refreshContext);

    const interval = setInterval(refreshContext, 6000);
    return () => {
      window.removeEventListener('storage', refreshContext);
      window.removeEventListener('report-saved', refreshContext);
      window.removeEventListener('report-updated', refreshContext);
      window.removeEventListener('messages-updated', refreshContext);
      window.removeEventListener('fuel-updated', refreshContext);
      window.removeEventListener('road-progress-updated', refreshContext);
      clearInterval(interval);
    };
  }, []);

  // Auto-scroll chat feed
  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, activeTab]);

  // Handle file select in chat
  const handleChatFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsParsingFile(true);
    try {
      const parsed = await parseUploadedFile(file);
      setAttachedFile(parsed);
    } catch (err) {
      console.error('File parsing error:', err);
    } finally {
      setIsParsingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Send Chat message
  const handleSendMessage = async (textToSend, overrideFile = null) => {
    const query = (textToSend !== undefined ? textToSend : inputMessage).trim();
    const fileToProcess = overrideFile || attachedFile;

    if (!query && !fileToProcess) return;
    if (isLoading) return;

    if (activeTab !== 'chat') {
      setActiveTab('chat');
    }

    setInputMessage('');
    setAttachedFile(null);
    const userMsgId = Date.now();
    const currentTime = new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' });

    const userMessageObj = {
      id: userMsgId,
      sender: 'user',
      time: currentTime,
      text: query || (fileToProcess ? `يرجى فحص وتحليل هذا المستند المرفق (${fileToProcess.name}) بالتفصيل وتقديم تقرير تنفيذي لمحتوياته.` : ''),
      attachedFile: fileToProcess ? {
        name: fileToProcess.name,
        size: fileToProcess.size,
        type: fileToProcess.type,
        previewUrl: fileToProcess.previewUrl || null
      } : null
    };

    const newMessages = [...messages, userMessageObj];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      let agentReplyText = '';
      let replyTitle = '';
      let actionTab = null;
      let actionLabel = null;
      let suggestions = [];

      if (useCloudLLM && apiKey.trim()) {
        agentReplyText = await callGeminiCloudAgent(apiKey.trim(), userMessageObj.text, newMessages, fileToProcess);
        replyTitle = fileToProcess ? `تقرير فحص وتحليل المستند: ${fileToProcess.name}` : (query.includes('موجز') || query.includes('المستجدات') || query.includes('المشروع') ? 'الموجز التنفيذي لمدير المشروع' : 'تحليل مساعد مدير المشروع');
        
        // Auto-assign navigation quick action if relevant
        if (query.includes('أرشيف') || query.includes('تقرير') || query.includes('تقارير')) {
          actionTab = canAccessGeneralArchive(currentUser) ? 'general-archive' : 'reports-archive';
          actionLabel = canAccessGeneralArchive(currentUser) ? 'الانتقال إلى الأرشيف العام للمشروع' : 'الانتقال إلى أرشيف تقاريري الميدانية';
        } else if (query.includes('مراسلات') || query.includes('بريد') || query.includes('رسائل') || query.includes('وارد')) {
          actionTab = 'messages';
          actionLabel = 'الانتقال إلى صندوق البريد والمراسلات';
        } else if (query.includes('وقود') || query.includes('ديزل')) {
          actionTab = 'fuel';
          actionLabel = 'الانتقال إلى منظومة الوقود';
        } else if (query.includes('طريق') || query.includes('أسفلت') || query.includes('fdr')) {
          actionTab = 'road-progress';
          actionLabel = 'الانتقال إلى متابعة إنجاز الطريق';
        }
        suggestions = ['📰 الموجز التنفيذي لمدير المشروع', '📁 فحص أرشيف التقارير المعتمدة', '📬 المراسلات والبريد الوارد', '⛽ موقف أرصدة الوقود بالمواقع'];
      } else {
        const localResult = processLocalQuery(userMessageObj.text, fileToProcess);
        agentReplyText = localResult.content;
        replyTitle = localResult.title;
        actionTab = localResult.actionTab || null;
        actionLabel = localResult.actionLabel || null;
        suggestions = localResult.quickSuggestions || [];
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'agent',
          time: new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' }),
          title: replyTitle,
          text: agentReplyText,
          actionTab,
          actionLabel,
          suggestions
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'agent',
          time: new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' }),
          title: 'تنبيه مساعد مدير المشروع',
          text: `⚠️ **تعذر إتمام الاستعلام السحابي:**\n${err.message || 'تم تحويل الطلب تلقائياً للمحرك المدمج لمساعد مدير المشروع.'}`,
          isError: true,
          suggestions: ['📰 الموجز التنفيذي لمدير المشروع', '📁 أرشيف التقارير', '📬 المراسلات والبريد الوارد']
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleResetChat = () => {
    if (window.confirm('هل ترغب في بدء جلسة استعلام جديدة مع مساعد مدير المشروع؟')) {
      setMessages([
        {
          id: Date.now(),
          sender: 'agent',
          time: new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' }),
          title: 'جلسة جديدة - مساعد مدير المشروع',
          text: `أهلاً بك مجدداً يا باشمهندس **${currentUser?.name || 'عبدالرحمن الأنصاري'}**. 
أنا جاهز لأي استفسارات تنفيذية، فحص أرشيف التقارير، متابعة المراسلات، أو رصد الأعمال الميدانية.`,
          suggestions: [
            '📰 الموجز التنفيذي لمدير المشروع',
            '📁 فحص أرشيف التقارير المعتمدة',
            '📬 المراسلات والبريد الوارد لمدير المشروع',
            '🛣️ موقف أعمال الطريق (المرحلة 1 و 2)',
            '⛽ موقف أرصدة واستهلاك الوقود بالمواقع'
          ]
        }
      ]);
      setAttachedFile(null);
    }
  };

  const handleSaveSettings = () => {
    try {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      localStorage.setItem('use_cloud_llm', useCloudLLM ? 'true' : 'false');
      setShowSettings(false);
    } catch (_) {}
  };

  // Render markdown formatting
  const renderFormattedText = (rawText) => {
    if (!rawText) return null;
    const lines = rawText.split('\n');

    return lines.map((line, lIdx) => {
      const trimmed = line.trim();
      const isDivider = trimmed === '---' || trimmed === '***';

      if (isDivider) {
        return <hr key={lIdx} style={{ margin: '0.85rem 0', borderColor: '#e2e8f0', borderWidth: '1px 0 0' }} />;
      }

      // Check if table row
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const cells = trimmed.split('|').slice(1, -1);
        const isSeparatorRow = cells.every(c => c.trim().replace(/-/g, '') === '');
        if (isSeparatorRow) return null;

        return (
          <div key={lIdx} style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cells.length}, 1fr)`,
            background: lIdx % 2 === 0 ? '#f8fafc' : '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '6px 8px',
            fontSize: '0.82rem',
            fontWeight: 600,
            direction: 'rtl'
          }}>
            {cells.map((cell, cIdx) => (
              <div key={cIdx} style={{ padding: '0 4px', textAlign: 'right' }}>
                {cell.trim()}
              </div>
            ))}
          </div>
        );
      }

      const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);

      return (
        <div key={lIdx} style={{
          margin: '0.32rem 0',
          lineHeight: '1.65',
          fontSize: trimmed.startsWith('### ') ? '1rem' : (trimmed.startsWith('## ') ? '1.08rem' : '0.92rem'),
          fontWeight: (trimmed.startsWith('### ') || trimmed.startsWith('## ')) ? 900 : 500,
          color: (trimmed.startsWith('### ') || trimmed.startsWith('## ')) ? '#1e3a8a' : '#1e293b'
        }}>
          {parts.map((p, pIdx) => {
            if (p.startsWith('**') && p.endsWith('**')) {
              return <strong key={pIdx} style={{ fontWeight: 800, color: '#0f172a' }}>{p.slice(2, -2)}</strong>;
            }
            if (p.startsWith('`') && p.endsWith('`')) {
              return (
                <code key={pIdx} style={{
                  background: '#f1f5f9',
                  color: '#0369a1',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  fontFamily: 'monospace'
                }}>
                  {p.slice(1, -1)}
                </code>
              );
            }
            return <span key={pIdx}>{p}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', paddingBottom: '3.5rem' }}>
      
      {/* 1. Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #1e3a8a 100%)',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '1.25rem 1.6rem',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(37,99,235,0.4)',
            border: '2px solid rgba(255,255,255,0.2)'
          }}>
            <Bot size={28} color="#ffffff" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900 }}>
                مساعد مدير المشروع
              </h1>
              <span style={{
                background: '#22c55e',
                color: '#0f172a',
                fontSize: '0.72rem',
                fontWeight: 900,
                padding: '2px 8px',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0f172a' }}></span>
                <span>مربوط لحظياً بالتقارير، الأرشيف والمراسلات</span>
              </span>
            </div>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.84rem', color: '#cbd5e1' }}>
              المنصة التنفيذية الذكية لسعادة مدير المشروع م. عبدالرحمن الأنصاري — مشروع صيانة وتطوير طريق أوباري - غات (360 كم)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleResetChat}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              padding: '0.5rem 0.9rem',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer'
            }}
            title="بدء جلسة استعلام جديدة"
          >
            <Sparkles size={15} color="#67e8f9" />
            <span>جلسة جديدة</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: showSettings ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: showSettings ? '#0f172a' : '#ffffff',
              padding: '0.5rem 0.9rem',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer'
            }}
          >
            <Key size={15} />
            <span>إعدادات الذكاء الاصطناعي</span>
          </button>
        </div>
      </div>

      {/* Settings Panel (Collapsible) */}
      {showSettings && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bfdbfe',
          borderRadius: '14px',
          padding: '1.15rem 1.4rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
        }}>
          <h3 style={{ margin: '0 0 0.4rem', fontSize: '0.95rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Key size={17} color="#2563eb" />
            <span>إعدادات الاتصال بمحرك الذكاء الاصطناعي السحابي (Google Gemini)</span>
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.85rem', lineHeight: 1.5 }}>
            يعمل مساعد مدير المشروع تلقائياً بمفتاح الذكاء الاصطناعي المدمج المعتمد، ويدعم العمل السحابي والمحلي المباشر:
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                flex: 1,
                minWidth: '260px',
                padding: '0.55rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                direction: 'ltr',
                fontFamily: 'monospace'
              }}
            />

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#334155', cursor: 'pointer', fontSize: '0.84rem' }}>
              <input
                type="checkbox"
                checked={useCloudLLM}
                onChange={(e) => setUseCloudLLM(e.target.checked)}
              />
              <span>تفعيل الوضع السحابي (Cloud LLM)</span>
            </label>

            <button
              type="button"
              onClick={handleSaveSettings}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '0.55rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 900,
                fontSize: '0.84rem',
                cursor: 'pointer'
              }}
            >
              حفظ وتطبيق
            </button>
          </div>
        </div>
      )}

      {/* 2. Executive Live Ribbon (5 Interactive Live KPI Cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0.75rem'
      }}>
        {/* Reports Archive Card */}
        <div 
          onClick={() => handleSendMessage('ما هو موقف أرشيف التقارير المعتمدة بالمنظومة وأحدث التقارير المسجلة؟')}
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'transform 0.15s, border-color 0.15s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2563eb'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          title="اضغط لاستعلام مساعد مدير المشروع عن أرشيف التقارير"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b' }}>أرشيف التقارير المعتمدة</span>
            <FileText size={17} color="#2563eb" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e3a8a' }}>
            {liveContext.reportsCount} تقريراً
          </div>
          <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 800 }}>
            {liveContext.latestReport?.dateFormatted || 'مربوط بالأرشيف الحي'}
          </span>
        </div>

        {/* Correspondence & Messages Card */}
        <div 
          onClick={() => handleSendMessage('ما هي المراسلات والبريد الوارد لمدير المشروع؟')}
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'transform 0.15s, border-color 0.15s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#0284c7'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          title="اضغط لاستعلام مساعد مدير المشروع عن المراسلات والتوجيهات"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b' }}>المراسلات والتوجيهات</span>
            <Mail size={17} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0369a1' }}>
            {liveContext.messagesCount} مراسلة
          </div>
          <span style={{ fontSize: '0.72rem', color: liveContext.unreadMessagesCount > 0 ? '#dc2626' : '#0284c7', fontWeight: 800 }}>
            {liveContext.unreadMessagesCount > 0 ? `${liveContext.unreadMessagesCount} وارد غير مقروء` : 'البريد محدث بالكامل'}
          </span>
        </div>

        {/* Financial & General Progress Card */}
        <div 
          onClick={() => handleSendMessage('ما هو الموقف التنفيذي والمالي لمشروع طريق أوباري - غات؟')}
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'transform 0.15s, border-color 0.15s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#16a34a'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          title="اضغط لاستعلام مساعد مدير المشروع عن الموقف المالي والتنفيذي"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b' }}>الإنجاز المالي والتعاقدي</span>
            <Award size={17} color="#16a34a" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#16a34a' }}>
            %{liveContext.financialProgressPct}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 800 }}>
            {fmt(liveContext.grandExecutedSum, 0)} د.ل منجز
          </span>
        </div>

        {/* Road Progress Card */}
        <div 
          onClick={() => handleSendMessage('ما هو موقف تقدم أعمال الطريق بالمرحلة الأولى والمرحلة الثانية؟')}
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'transform 0.15s, border-color 0.15s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ea580c'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          title="اضغط لاستعلام مساعد مدير المشروع عن تقدم الطريق"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b' }}>أعمال الطريق (360 كم)</span>
            <Milestone size={17} color="#ea580c" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ea580c' }}>
            2,230 م.ط
          </div>
          <span style={{ fontSize: '0.72rem', color: '#c2410c', fontWeight: 800 }}>
            جاهز لطرح الأسفلت فورياً
          </span>
        </div>

        {/* Fuel Card */}
        <div 
          onClick={() => handleSendMessage('ما هو موقف أرصدة واستهلاك الوقود بالصهاريج في نقطة 107 ونقطة 240؟')}
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'transform 0.15s, border-color 0.15s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ca8a04'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          title="اضغط لاستعلام مساعد مدير المشروع عن أرصدة الوقود"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b' }}>رصيد الوقود بالمواقع</span>
            <Fuel size={17} color="#ca8a04" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#a16207' }}>
            {fmt(liveContext.totalRemainingFuel, 0)} لتر
          </div>
          <span style={{ fontSize: '0.72rem', color: '#a16207', fontWeight: 800 }}>
            الخزانات (نقطة 107 و240)
          </span>
        </div>
      </div>

      {/* 3. Executive Action Prompt Pills */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '4px',
        whiteSpace: 'nowrap'
      }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', paddingLeft: '4px' }}>
          <Sparkles size={14} color="#2563eb" />
          <span>استعلام سريع:</span>
        </span>

        {[
          { label: '📰 الموجز التنفيذي لمدير المشروع', query: 'أريد المقالة التقريرية الشاملة والموجز التنفيذي لمدير المشروع عن آخر المستجدات' },
          { label: '📁 فحص أرشيف التقارير المعتمدة', query: 'أعطني تفاصيل أرشيف التقارير المسجلة بالمنظومة وأحدث التقارير المعتمدة' },
          { label: '📬 المراسلات والبريد الوارد لمدير المشروع', query: 'ما هي المراسلات والبريد الوارد لمدير المشروع والتوجيهات المعلقة؟' },
          { label: '🛣️ موقف أعمال الطريق (المرحلة 1 و 2)', query: 'ما هو موقف أعمال الطريق بالتفصيل بين المرحلة الأولى والمرحلة الثانية؟' },
          { label: '⛽ موقف أرصدة واستهلاك الوقود بالمواقع', query: 'ما هو موقف أرصدة الوقود في صهاريج نقطة 107 ونقطة 240 والاستهلاك اليومي؟' },
          { label: '🚜 جاهزية أسطول الآليات (25 آلية)', query: 'ما هي جاهزية أسطول الآليات والمعدات الهندسية العاملة بالمشروع؟' },
          { label: '⚠️ تنبيهات الجودة والمختبر', query: 'ما هي ملاحظات ضبط الجودة واختبارات المختبر والتنبيهات المفتوحة؟' }
        ].map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(item.query)}
            disabled={isLoading}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '20px',
              padding: '0.4rem 0.85rem',
              fontSize: '0.78rem',
              fontWeight: 800,
              color: '#334155',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#eff6ff';
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.color = '#1d4ed8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.color = '#334155';
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 4. Clean Navigation Tab Switcher */}
      <div style={{
        display: 'flex',
        gap: '6px',
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: '2px'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          style={{
            background: activeTab === 'chat' ? '#1e3a8a' : '#ffffff',
            color: activeTab === 'chat' ? '#ffffff' : '#475569',
            border: activeTab === 'chat' ? 'none' : '1px solid #cbd5e1',
            borderRadius: '10px 10px 0 0',
            padding: '0.65rem 1.3rem',
            fontWeight: 900,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'chat' ? '0 3px 8px rgba(30,58,138,0.2)' : 'none'
          }}
        >
          <Bot size={17} />
          <span>المحادثة والاستعلام التنفيذي لمدير المشروع</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('feed')}
          style={{
            background: activeTab === 'feed' ? '#1e3a8a' : '#ffffff',
            color: activeTab === 'feed' ? '#ffffff' : '#475569',
            border: activeTab === 'feed' ? 'none' : '1px solid #cbd5e1',
            borderRadius: '10px 10px 0 0',
            padding: '0.65rem 1.3rem',
            fontWeight: 900,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'feed' ? '0 3px 8px rgba(30,58,138,0.2)' : 'none'
          }}
        >
          <FileText size={17} />
          <span>سجل المنظومة الحي (الأرشيف + المراسلات المباشرة)</span>
          <span style={{
            background: activeTab === 'feed' ? '#22c55e' : '#e2e8f0',
            color: activeTab === 'feed' ? '#0f172a' : '#334155',
            fontSize: '0.72rem',
            fontWeight: 900,
            padding: '2px 7px',
            borderRadius: '10px'
          }}>
            {liveContext.reportsCount + liveContext.messagesCount}
          </span>
        </button>
      </div>

      {/* 5. TAB 1: Chat & Executive Intelligence */}
      {activeTab === 'chat' && (
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '520px'
        }}>
          {/* Messages Feed */}
          <div style={{
            flex: 1,
            padding: '1.25rem 1.4rem',
            overflowY: 'auto',
            maxHeight: '680px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.15rem',
            background: '#f8fafc'
          }}>
            {messages.map((msg, idx) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id || idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    width: '100%'
                  }}
                >
                  <div style={{
                    maxWidth: isUser ? '85%' : '94%',
                    background: isUser ? 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' : '#ffffff',
                    color: isUser ? '#ffffff' : '#0f172a',
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding: '1.1rem 1.35rem',
                    boxShadow: isUser ? '0 4px 12px rgba(37,99,235,0.2)' : '0 2px 10px rgba(0,0,0,0.05)',
                    border: isUser ? 'none' : '1.5px solid #e2e8f0',
                    direction: 'rtl'
                  }}>
                    {/* Header line inside bubble */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.55rem',
                      borderBottom: isUser ? '1px solid rgba(255,255,255,0.2)' : '1px solid #f1f5f9',
                      paddingBottom: '0.45rem',
                      gap: '1rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isUser ? (
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#e0f2fe' }}>
                            مدير المشروع ({currentUser?.name || 'م. عبدالرحمن الأنصاري'})
                          </span>
                        ) : (
                          <>
                            <div style={{
                              background: '#eff6ff',
                              borderRadius: '6px',
                              width: '24px',
                              height: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Bot size={15} color="#2563eb" />
                            </div>
                            <span style={{ fontSize: '0.84rem', fontWeight: 900, color: '#1e3a8a' }}>
                              {msg.title || 'مساعد مدير المشروع'}
                            </span>
                          </>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.72rem', color: isUser ? '#cbd5e1' : '#94a3b8' }}>
                          {msg.time}
                        </span>
                        {!isUser && (
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg.text, idx)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#64748b',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '2px',
                              borderRadius: '4px'
                            }}
                            title="نسخ التقرير إلى الحافظة"
                          >
                            {copiedIdx === idx ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Attached file tag if user sent file */}
                    {msg.attachedFile && (
                      <div style={{
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.78rem'
                      }}>
                        <Paperclip size={14} />
                        <span>مستند مرفق: <strong>{msg.attachedFile.name}</strong> ({msg.attachedFile.size})</span>
                      </div>
                    )}

                    {/* Content body */}
                    <div style={{ fontSize: '0.9rem', lineHeight: 1.65 }}>
                      {isUser ? msg.text : renderFormattedText(msg.text)}
                    </div>

                    {/* Action buttons footer for Assistant response */}
                    {!isUser && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '0.9rem',
                        paddingTop: '0.65rem',
                        borderTop: '1px solid #f1f5f9',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg.text, idx)}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              color: '#334155',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {copiedIdx === idx ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                            <span>{copiedIdx === idx ? 'تم النسخ!' : 'نسخ التقرير'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => window.print()}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              color: '#334155',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Printer size={13} />
                            <span>طباعة رسمية</span>
                          </button>
                        </div>

                        {/* Navigation pill button if reply references a section */}
                        {msg.actionTab && onNavigateTab && (
                          <button
                            type="button"
                            onClick={() => onNavigateTab(msg.actionTab)}
                            style={{
                              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '4px 12px',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 2px 6px rgba(37,99,235,0.25)'
                            }}
                          >
                            <span>{msg.actionLabel || 'فتح القسم في المنظومة'}</span>
                            <ExternalLink size={13} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.75rem 1rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', width: 'fit-content' }}>
                <div style={{ width: '18px', height: '18px', border: '3px solid #bfdbfe', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1e3a8a' }}>
                  مساعد مدير المشروع يقوم بفحص قواعد البيانات وإعداد الرد التنفيذي...
                </span>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat File Attachment Chip */}
          {attachedFile && (
            <div style={{
              background: '#f0fdf4',
              borderTop: '1px solid #bbf7d0',
              padding: '0.5rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {attachedFile.type === 'excel' ? (
                  <FileSpreadsheet size={17} color="#16a34a" />
                ) : attachedFile.isImage ? (
                  <ImageIcon size={17} color="#0284c7" />
                ) : (
                  <FileText size={17} color="#ea580c" />
                )}
                <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#166534' }}>
                  {attachedFile.name}
                </span>
                <span style={{ fontSize: '0.74rem', color: '#15803d' }}>
                  ({attachedFile.size})
                </span>
                <span style={{
                  background: '#dcfce7',
                  color: '#15803d',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: '4px'
                }}>
                  تم فحص الملف وجاهز للتحليل
                </span>
              </div>

              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#dc2626',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="إلغاء الإرفاق"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Chat Input Bar */}
          <div style={{
            background: '#ffffff',
            borderTop: '1.5px solid #e2e8f0',
            padding: '0.75rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,.txt,.json,.pdf,image/*"
              style={{ display: 'none' }}
              onChange={handleChatFileSelect}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isParsingFile}
              style={{
                background: attachedFile ? '#dcfce7' : '#f1f5f9',
                border: attachedFile ? '1.5px solid #86efac' : '1px solid #cbd5e1',
                color: attachedFile ? '#16a34a' : '#475569',
                borderRadius: '10px',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: isLoading || isParsingFile ? 'not-allowed' : 'pointer',
                fontWeight: 800,
                fontSize: '0.8rem',
                whiteSpace: 'nowrap'
              }}
              title="إرفاق ملف Excel، PDF، أو صورة"
            >
              <Paperclip size={16} />
              <span>{isParsingFile ? 'جاري الفحص...' : (attachedFile ? 'مرفق' : 'إرفاق ملف')}</span>
            </button>

            <textarea
              rows={1}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={attachedFile ? "اكتب تعليمات التحليل لهذا الملف أو اضغط إرسال لتحليله فورياً..." : "اسأل مساعد مدير المشروع عن أرشيف التقارير، المراسلات، موقف الإنجاز، أو الوقود..."}
              style={{
                flex: 1,
                border: '1.5px solid #cbd5e1',
                borderRadius: '12px',
                padding: '0.65rem 1rem',
                fontSize: '0.88rem',
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
                color: '#0f172a'
              }}
            />

            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={isLoading || (!inputMessage.trim() && !attachedFile)}
              style={{
                background: (!inputMessage.trim() && !attachedFile) || isLoading ? '#94a3b8' : 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '0.7rem 1.35rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: (!inputMessage.trim() && !attachedFile) || isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(37,99,235,0.25)'
              }}
            >
              <span>إرسال</span>
              <Send size={15} style={{ transform: 'rotate(180deg)' }} />
            </button>
          </div>
        </div>
      )}

      {/* 6. TAB 2: Live Feed & Audit Explorer (الأرشيف + المراسلات المباشرة) */}
      {activeTab === 'feed' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
          
          {/* Reports Archive Live Column */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid #e2e8f0',
            padding: '1.25rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '6px' }}>
                  <FileText size={20} color="#2563eb" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>
                    أحدث التقارير المعتمدة بالأرشيف
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {liveContext.reportsCount} تقرير مؤرشف في قواعد بيانات المنظومة
                  </span>
                </div>
              </div>

              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab(canAccessGeneralArchive(currentUser) ? 'general-archive' : 'reports-archive')}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    color: '#2563eb',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>{canAccessGeneralArchive(currentUser) ? 'الأرشيف العام' : 'أرشيفي الشخصي'}</span>
                  <ExternalLink size={13} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '520px', overflowY: 'auto' }}>
              {liveContext.recentReports && liveContext.recentReports.length > 0 ? (
                liveContext.recentReports.map((r, rIdx) => {
                  const repNum = r.reportNumber || r.id || `#${rIdx + 1}`;
                  const repDate = r.dateFormatted || (r.date ? r.date.split('T')[0] : '—');
                  const eng = r.engineer || r.supervisor || 'مهندس مشرف';
                  const sec = r.phase || r.sector || (r.isTwoPhaseProgressReport ? 'المرحلتين' : 'طريق أوباري غات');
                  const isFuel = r.isFuelReport || r.reportType === 'fuel';

                  return (
                    <div
                      key={r.id || rIdx}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '0.85rem 1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            background: isFuel ? '#fef3c7' : '#dbeafe',
                            color: isFuel ? '#92400e' : '#1e40af',
                            fontSize: '0.72rem',
                            fontWeight: 900,
                            padding: '2px 7px',
                            borderRadius: '6px'
                          }}>
                            {isFuel ? '⛽ تقرير وقود' : '🛣️ تقرير طريق'}
                          </span>
                          <span style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0f172a' }}>
                            [{repNum}]
                          </span>
                        </div>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{repDate}</span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                        <strong>المشرف:</strong> {eng} | <strong>الموقع:</strong> {sec}
                      </div>

                      {r.summary && (
                        <div style={{ fontSize: '0.76rem', color: '#64748b', background: '#ffffff', padding: '4px 8px', borderRadius: '6px', border: '1px solid #f1f5f9', marginTop: '2px' }}>
                          {r.summary}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('chat');
                            handleSendMessage(`يرجى استخراج وتلخيص بيانات التقرير رقم (${repNum}) الصادر بتأريخ (${repDate}) بإشراف (${eng}).`);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#2563eb',
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Sparkles size={13} />
                          <span>استعلام المساعد عن هذا التقرير</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  لا توجد تقارير مسجلة اليوم قيد الأرشفة.
                </div>
              )}
            </div>
          </div>

          {/* Correspondence & Messages Live Column */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid #e2e8f0',
            padding: '1.25rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: '#f0f9ff', borderRadius: '8px', padding: '6px' }}>
                  <Mail size={20} color="#0284c7" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>
                    المراسلات والتوجيهات الإدارية
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {liveContext.messagesCount} مراسلة مسجلة ({liveContext.unreadMessagesCount} وارد غير مقروء)
                  </span>
                </div>
              </div>

              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('messages')}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    color: '#0284c7',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>صندوق البريد</span>
                  <ExternalLink size={13} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '520px', overflowY: 'auto' }}>
              {liveContext.recentMessages && liveContext.recentMessages.length > 0 ? (
                liveContext.recentMessages.map((m, mIdx) => {
                  const sender = m.senderName || m.sender || 'مهندس مشرف';
                  const subj = m.type || m.subject || 'مراسلة إدارية';
                  const dt = m.date || m.timestamp || 'اليوم';
                  const isUnread = !m.read;

                  return (
                    <div
                      key={m.id || mIdx}
                      style={{
                        background: isUnread ? '#f0fdf4' : '#f8fafc',
                        border: isUnread ? '1.5px solid #86efac' : '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '0.85rem 1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {isUnread && (
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626' }}></span>
                          )}
                          <span style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0f172a' }}>
                            {subj}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{dt}</span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                        <strong>من:</strong> {sender}
                      </div>

                      {(m.body || m.content) && (
                        <div style={{ fontSize: '0.76rem', color: '#475569', background: '#ffffff', padding: '6px 8px', borderRadius: '6px', border: '1px solid #f1f5f9', marginTop: '2px', lineHeight: 1.5 }}>
                          {String(m.body || m.content).slice(0, 140)}...
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('chat');
                            handleSendMessage(`يرجى استعراض وتلخيص تفاصيل المراسلة الواردة من (${sender}) بخصوص موضوع: (${subj}).`);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#0284c7',
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Sparkles size={13} />
                          <span>استعلام المساعد عن هذه المراسلة</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  لا توجد مراسلات واردة معلقة.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
