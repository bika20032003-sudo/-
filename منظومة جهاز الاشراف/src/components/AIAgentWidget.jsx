import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Sparkles, X, Send, Copy, Check, RefreshCw, Key, 
  ChevronDown, Maximize2, Minimize2, MessageSquare, ShieldCheck, 
  Layers, Milestone, Fuel, AlertTriangle, FileText, Zap
} from 'lucide-react';
import { processLocalQuery, callGeminiCloudAgent, getLiveSystemContext } from '../utils/aiAgentEngine.js';

export const AIAgentWidget = ({ currentUser, onNavigateTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [useCloudLLM, setUseCloudLLM] = useState(true);
  const [apiKey, setApiKey] = useState(() => (typeof window !== 'undefined' && (localStorage.getItem('gemini_api_key') || getDefaultApiKey())) || '');
  const [showSettings, setShowSettings] = useState(false);

  // Initial welcome message
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'agent',
      time: new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' }),
      title: 'مرحباً بك! أنا الوكيل الذكي لجهاز الإشراف والمتابعة',
      text: `أهلاً بك يا باشمهندس **${currentUser?.name || ''}**.
أنا مساعدك الهندسي الذكي المعتمد لمشروع **طريق أوباري - غات (360 كم)**.

أنا مربوط مباشرة بكافة أقسام المنظومة وممنوح **كافة الصلاحيات التشغيلية والتحليلية والهندسية الشاملة (عدا صلاحية الحذف لحماية بيانات وسجلات المشروع)**.`,
      suggestions: [
        'ما هو الموقف التنفيذي والمالي اليوم؟',
        'كم المتر الطولي الجاهز لطبقة الأسفلت؟',
        'ما هي الفئات التعاقدية للبنود؟',
        'ما هو رصيد الوقود في المواقع؟',
        'صياغة تقرير رسمي لمدير المشروع'
      ]
    }
  ]);

  const messagesEndRef = useRef(null);

  // Load API Key from localStorage
  useEffect(() => {
    try {
      const storedKey = localStorage.getItem('gemini_api_key') || getDefaultApiKey();
      const storedPref = localStorage.getItem('use_cloud_llm') !== 'false';
      setApiKey(storedKey);
      setUseCloudLLM(storedPref);
      if (!localStorage.getItem('gemini_api_key')) {
        localStorage.setItem('gemini_api_key', getDefaultApiKey());
      }
      if (!localStorage.getItem('use_cloud_llm')) {
        localStorage.setItem('use_cloud_llm', 'true');
      }
    } catch (_) {}
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSaveSettings = () => {
    try {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      localStorage.setItem('use_cloud_llm', useCloudLLM ? 'true' : 'false');
      setShowSettings(false);
    } catch (_) {}
  };

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    setInputMessage('');
    const userMsgId = Date.now();
    const currentTime = new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' });

    // Append user message
    const newMessages = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user',
        time: currentTime,
        text: query
      }
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      let agentReplyText = '';
      let replyTitle = '';
      let suggestions = [];

      if (useCloudLLM && apiKey.trim()) {
        // Cloud LLM via Gemini API
        agentReplyText = await callGeminiCloudAgent(apiKey.trim(), query, newMessages);
        replyTitle = 'تحليل الذكاء الاصطناعي (Gemini Cloud)';
        suggestions = ['الموقف التنفيذي', 'الجاهز للأسفلت', 'أرصدة الوقود'];
      } else {
        // Fast Local NLP Engine with zero latency & 100% offline accuracy
        const localResult = processLocalQuery(query);
        agentReplyText = localResult.content;
        replyTitle = localResult.title;
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
          title: 'تنبيه النظام',
          text: `⚠️ **حدث تعذر في معالجة الطلب:**\n${err.message || 'يرجى التحقق من الاتصال أو العودة للوضع المحلي المدمج.'}`,
          isError: true,
          suggestions: ['الموقف التنفيذي والمالي', 'الجاهز للأسفلت', 'رصيد الوقود']
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

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'agent',
        time: new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' }),
        title: 'محادثة جديدة',
        text: 'تم بدء جلسة محادثة جديدة. تفضل بطرح أي سؤال عن المشروع أو اختيار أحد الإجراءات السريعة أدناه.',
        suggestions: [
          'ما هو الموقف التنفيذي والمالي اليوم؟',
          'كم المتر الطولي الجاهز لطبقة الأسفلت؟',
          'ما هي الفئات التعاقدية للبنود؟',
          'ما هو رصيد الوقود في المواقع؟'
        ]
      }
    ]);
  };

  // Format message text with markdown bold and code
  const renderFormattedText = (rawText) => {
    if (!rawText) return null;
    const lines = rawText.split('\n');

    return lines.map((line, lIdx) => {
      // Bullets
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
      const isHeader = line.trim().startsWith('#') || line.trim().startsWith('📌') || line.trim().startsWith('📋') || line.trim().startsWith('🚧') || line.trim().startsWith('🛣️') || line.trim().startsWith('⚠️') || line.trim().startsWith('⛽') || line.trim().startsWith('📐') || line.trim().startsWith('📄');

      // Simple markdown parser for **bold** and `code`
      const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);

      return (
        <div key={lIdx} style={{
          marginBottom: line.trim() === '' ? '0.45rem' : '0.25rem',
          paddingRight: isBullet ? '0.5rem' : '0',
          fontWeight: isHeader ? 800 : 500,
          color: isHeader ? '#0f172a' : 'inherit',
          fontSize: isHeader ? '0.94rem' : '0.88rem',
          lineHeight: 1.55
        }}>
          {parts.map((p, pIdx) => {
            if (p.startsWith('**') && p.endsWith('**')) {
              return <strong key={pIdx} style={{ color: '#0f172a', fontWeight: 900 }}>{p.slice(2, -2)}</strong>;
            }
            if (p.startsWith('`') && p.endsWith('`')) {
              return (
                <code key={pIdx} style={{
                  background: '#f1f5f9',
                  color: '#1e40af',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  fontSize: '0.84rem',
                  fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
                  fontWeight: 800,
                  direction: 'ltr',
                  display: 'inline-block'
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
    <>
      {/* 1. Floating Launch Button (Fixed Bottom-Left) */}
      {!isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #4f46e5 100%)',
              color: '#ffffff',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '50px',
              padding: '0.75rem 1.35rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4), 0 2px 6px rgba(0,0,0,0.1)',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(37, 99, 235, 0.5), 0 4px 10px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.4), 0 2px 6px rgba(0,0,0,0.1)';
            }}
            title="فتح الوكيل الذكي لجهاز الإشراف والمتابعة"
          >
            <div style={{ position: 'relative' }}>
              <Bot size={22} color="#ffffff" />
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-3px',
                width: '8px',
                height: '8px',
                background: '#22c55e',
                borderRadius: '50%',
                border: '1.5px solid #ffffff'
              }} />
            </div>

            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '-0.2px' }}>
                الوكيل الذكي (AI)
              </span>
              <span style={{ fontSize: '0.68rem', color: '#bfdbfe', fontWeight: 700 }}>
                مساعد الإشراف الهندسي
              </span>
            </div>

            <Sparkles size={16} color="#facc15" style={{ animation: 'pulse 2s infinite' }} />
          </button>
        </div>
      )}

      {/* 2. Interactive AI Chat Drawer / Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: 99999,
            width: isExpanded ? 'min(760px, calc(100vw - 40px))' : 'min(460px, calc(100vw - 40px))',
            height: isExpanded ? 'min(820px, calc(100vh - 40px))' : 'min(620px, calc(100vh - 40px))',
            background: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            direction: 'rtl',
            fontFamily: 'inherit',
            transition: 'width 0.2s ease, height 0.2s ease'
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            padding: '0.85rem 1.15rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(37,99,235,0.4)'
              }}>
                <Bot size={20} color="#ffffff" />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 900 }}>
                    الوكيل الذكي للإشراف
                  </h3>
                  <span style={{
                    fontSize: '0.65rem',
                    background: useCloudLLM ? '#38bdf8' : '#22c55e',
                    color: '#0f172a',
                    fontWeight: 900,
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}>
                    {useCloudLLM ? 'سحابي (Gemini)' : 'محلي (ميداني)'}
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  مشروع صيانة طريق أوباري - غات (360 كم)
                </span>
              </div>
            </div>

            {/* Header Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                style={{
                  background: showSettings ? '#334155' : 'transparent',
                  border: 'none',
                  color: '#cbd5e1',
                  borderRadius: '6px',
                  padding: '5px',
                  cursor: 'pointer'
                }}
                title="إعدادات المفتاح السحابي"
              >
                <Key size={16} />
              </button>

              <button
                type="button"
                onClick={handleClearChat}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#cbd5e1',
                  borderRadius: '6px',
                  padding: '5px',
                  cursor: 'pointer'
                }}
                title="مسح المحادثة وبدء جلسة جديدة"
              >
                <RefreshCw size={15} />
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#cbd5e1',
                  borderRadius: '6px',
                  padding: '5px',
                  cursor: 'pointer'
                }}
                title={isExpanded ? 'تصغير' : 'تكبير'}
              >
                {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#cbd5e1',
                  borderRadius: '6px',
                  padding: '5px',
                  cursor: 'pointer'
                }}
                title="إغلاق النافذة"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Settings Panel (Collapsible) */}
          {showSettings && (
            <div style={{
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              padding: '0.85rem 1.15rem',
              fontSize: '0.82rem'
            }}>
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Key size={15} color="#2563eb" />
                <span>إعدادات الاتصال بمحرك الذكاء السحابي (Gemini API):</span>
              </div>
              <div style={{ color: '#64748b', fontSize: '0.76rem', marginBottom: '0.55rem' }}>
                يعمل الوكيل تلقائياً في الوضع المحلي الفوري بدقة 100% بدون إنترنت. إذا رغبت بإجابات مفتوحة موسعة، أدخل مفتاحك السحابي:
              </div>
              <input
                type="password"
                placeholder="أدخل مفتاح Gemini API هنا..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.65rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  marginBottom: '0.5rem',
                  direction: 'ltr',
                  fontFamily: 'monospace'
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 700, color: '#334155' }}>
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
                    color: '#fff',
                    border: 'none',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '6px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  حفظ الإعدادات
                </button>
              </div>
            </div>
          )}

          {/* Messages Feed */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
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
                    maxWidth: '100%'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '3px',
                    fontSize: '0.72rem',
                    color: '#64748b'
                  }}>
                    <span>{isUser ? 'أنت' : 'الوكيل الذكي'}</span>
                    <span>•</span>
                    <span>{msg.time}</span>
                  </div>

                  <div
                    style={{
                      background: isUser ? '#2563eb' : '#ffffff',
                      color: isUser ? '#ffffff' : '#1e293b',
                      padding: '0.75rem 1rem',
                      borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      boxShadow: isUser ? '0 2px 6px rgba(37, 99, 235, 0.25)' : '0 2px 8px rgba(0,0,0,0.04)',
                      border: isUser ? 'none' : '1px solid #e2e8f0',
                      maxWidth: '92%',
                      position: 'relative'
                    }}
                  >
                    {!isUser && msg.title && (
                      <div style={{
                        fontWeight: 900,
                        fontSize: '0.86rem',
                        color: '#1e40af',
                        marginBottom: '0.45rem',
                        borderBottom: '1px solid #f1f5f9',
                        paddingBottom: '0.3rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span>{msg.title}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.text, idx)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: copiedIdx === idx ? '#16a34a' : '#94a3b8',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '0.7rem'
                          }}
                          title="نسخ النص"
                        >
                          {copiedIdx === idx ? <Check size={14} /> : <Copy size={14} />}
                          <span>{copiedIdx === idx ? 'تم النسخ' : 'نسخ'}</span>
                        </button>
                      </div>
                    )}

                    <div>
                      {isUser ? (
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.5 }}>
                          {msg.text}
                        </div>
                      ) : (
                        renderFormattedText(msg.text)
                      )}
                    </div>
                  </div>

                  {/* Suggestion Pills */}
                  {!isUser && Array.isArray(msg.suggestions) && msg.suggestions.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '5px',
                      marginTop: '0.5rem',
                      maxWidth: '95%'
                    }}>
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => handleSendMessage(sug)}
                          style={{
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            borderRadius: '20px',
                            padding: '3px 10px',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#dbeafe'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#eff6ff'}
                        >
                          ⚡ {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 0' }}>
                <div style={{
                  background: '#2563eb',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  animation: 'bounce 1s infinite'
                }} />
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
                  جاري تحليل البيانات وإعداد الرد الهندسي...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Shortcuts Bar */}
          <div style={{
            background: '#ffffff',
            borderTop: '1px solid #f1f5f9',
            padding: '0.45rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}>
            <button
              type="button"
              onClick={() => handleSendMessage('الموقف التنفيذي والمالي')}
              style={{
                fontSize: '0.73rem',
                fontWeight: 800,
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              📊 الموقف المالي
            </button>

            <button
              type="button"
              onClick={() => handleSendMessage('الجاهز لطبقة الأسفلت')}
              style={{
                fontSize: '0.73rem',
                fontWeight: 800,
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              🛣️ الجاهز للرصف
            </button>

            <button
              type="button"
              onClick={() => handleSendMessage('أرصدة الوقود اليومية')}
              style={{
                fontSize: '0.73rem',
                fontWeight: 800,
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              ⛽ رصيد الوقود
            </button>

            <button
              type="button"
              onClick={() => handleSendMessage('عائق المرحلة الأولى')}
              style={{
                fontSize: '0.73rem',
                fontWeight: 800,
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              ⚠️ العبارة المنهارة
            </button>

            <button
              type="button"
              onClick={() => handleSendMessage('صياغة تقرير رسمي للإدارة')}
              style={{
                fontSize: '0.73rem',
                fontWeight: 800,
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              📝 كتاب رسمي
            </button>
          </div>

          {/* Input Box */}
          <div style={{
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '0.65rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
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
              placeholder="اكتب استفسارك هنا (مثلاً: كم متبقي العقد؟ كم الجاهز للأسفلت؟)..."
              style={{
                flex: 1,
                border: '1.5px solid #cbd5e1',
                borderRadius: '10px',
                padding: '0.55rem 0.75rem',
                fontSize: '0.86rem',
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
                maxHeight: '80px',
                color: '#0f172a'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2563eb'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />

            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              style={{
                background: !inputMessage.trim() || isLoading ? '#94a3b8' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '0.6rem 0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: !inputMessage.trim() || isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
                transition: 'all 0.15s ease'
              }}
              title="إرسال"
            >
              <Send size={17} style={{ transform: 'rotate(180deg)' }} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
export default AIAgentWidget;

