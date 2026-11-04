import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Sparkles, Send, Copy, Check, RefreshCw, Key, 
  MessageSquare, ShieldCheck, Layers, Milestone, Fuel, 
  AlertTriangle, FileText, Zap, HelpCircle, Terminal, CheckCircle2,
  TrendingUp, Award, BarChart3, Database
} from 'lucide-react';
import { processLocalQuery, callGeminiCloudAgent, getLiveSystemContext, getDefaultApiKey } from '../utils/aiAgentEngine.js';

export const AIAgentView = ({ currentUser, onNavigateTab }) => {
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
  const [activeQuickCategory, setActiveQuickCategory] = useState('all');

  const liveContext = getLiveSystemContext();

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'agent',
      time: new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' }),
      title: 'مرحباً بك! أنا الوكيل الذكي لجهاز الإشراف والمتابعة',
      text: `أهلاً بك يا باشمهندس **${currentUser?.name || ''}**.
أنا الوكيل الذكي المعتمد لجهاز الإشراف والمتابعة لمشروع **صيانة وتطوير طريق أوباري - غات (360 كم)**.

أنا مربوط مباشرة بأحدث بيانات الموقف التنفيذي المالي (29/10/2026)، حاسبة المحطات، التتابع الإنشائي للرصف، ومخزون الوقود الميداني.

تفضل بكتابة أي استفسار، أو اختر من بطاقات الاستعلام والتقارير الفورية أدناه:`,
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

  useEffect(() => {
    try {
      const defaultKey = typeof getDefaultApiKey === 'function' ? getDefaultApiKey() : '';
      const storedKey = localStorage.getItem('gemini_api_key') || defaultKey;
      const storedPref = localStorage.getItem('use_cloud_llm') !== 'false';
      setApiKey(storedKey);
      setUseCloudLLM(storedPref);
      if (!localStorage.getItem('gemini_api_key') && defaultKey) {
        localStorage.setItem('gemini_api_key', defaultKey);
      }
      if (!localStorage.getItem('use_cloud_llm')) {
        localStorage.setItem('use_cloud_llm', 'true');
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        agentReplyText = await callGeminiCloudAgent(apiKey.trim(), query, newMessages);
        replyTitle = 'تحليل الذكاء الاصطناعي (Gemini Cloud)';
        suggestions = ['الموقف التنفيذي', 'الجاهز للأسفلت', 'أرصدة الوقود'];
      } else {
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

  const renderFormattedText = (rawText) => {
    if (!rawText) return null;
    const lines = rawText.split('\n');

    return lines.map((line, lIdx) => {
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
      const isHeader = line.trim().startsWith('#') || line.trim().startsWith('📌') || line.trim().startsWith('📋') || line.trim().startsWith('🚧') || line.trim().startsWith('🛣️') || line.trim().startsWith('⚠️') || line.trim().startsWith('⛽') || line.trim().startsWith('📐') || line.trim().startsWith('📄');
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '3rem' }}>
      
      {/* 1. Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1e3a8a 100%)',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '1.5rem 2rem',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37,99,235,0.4)'
          }}>
            <Bot size={28} color="#ffffff" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>
                الوكيل الذكي لجهاز الإشراف والمتابعة (AI Engineering Copilot)
              </h1>
              <span style={{
                background: '#22c55e',
                color: '#0f172a',
                fontSize: '0.72rem',
                fontWeight: 900,
                padding: '2px 8px',
                borderRadius: '12px'
              }}>
                متاح ومحدث (29/10/2026)
              </span>
            </div>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.86rem', color: '#cbd5e1' }}>
              مساعد هندسي خبير ومحلل فوري للموقف التنفيذي، التتابع الإنشائي، أرصدة المحروقات، وحساب كميات المحطات
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer'
            }}
          >
            <Key size={16} />
            <span>إعدادات Gemini API</span>
          </button>
        </div>
      </div>

      {/* Settings Modal (Collapsible) */}
      {showSettings && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Key size={18} color="#2563eb" />
            <span>إعدادات المحرك السحابي (Gemini API Cloud Engine)</span>
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '1rem' }}>
            الوكيل الذكي يعمل محلياً في الموقع بدون إنترنت بدقة 100% اعتماداً على بيانات المشروع المعتمدة. إذا كنت ترغب بتفعيل التفكير السحابي العميق وإرسال أسئلة عامة أو تحليل ملفات وصور، يمكنك إدخال مفتاحك المجاني هنا:
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                flex: 1,
                minWidth: '280px',
                padding: '0.55rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.86rem',
                direction: 'ltr',
                fontFamily: 'monospace'
              }}
            />

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
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
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer'
              }}
            >
              حفظ الإعدادات
            </button>
          </div>
        </div>
      )}

      {/* 2. Live Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>إجمالي المنفذ المالي</span>
            <Award size={18} color="#16a34a" />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#16a34a' }}>
            {Number(liveContext.grandExecutedSum).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.ل
          </div>
          <span style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 700 }}>
            نسبة الإنجاز المالي: %{liveContext.financialProgressPct}
          </span>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>الجاهز لطبقة الأسفلت</span>
            <Milestone size={18} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0284c7' }}>
            2,230.00 م.ط
          </div>
          <span style={{ fontSize: '0.74rem', color: '#0369a1', fontWeight: 700 }}>
            مرشوش MC0 وجاهز للطرح فورياً
          </span>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>الجاهز للأساس الحبيبي</span>
            <Layers size={18} color="#ea580c" />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ea580c' }}>
            6,670.00 م.ط
          </div>
          <span style={{ fontSize: '0.74rem', color: '#c2410c', fontWeight: 700 }}>
            منجز فرمة ثانية وجاهز للفرش
          </span>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>رصيد الوقود المتبقي</span>
            <Fuel size={18} color="#eab308" />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ca8a04' }}>
            209.00 لتر
          </div>
          <span style={{ fontSize: '0.74rem', color: '#a16207', fontWeight: 700 }}>
            مواقع 107 و 240 والكسارات
          </span>
        </div>
      </div>

      {/* 3. Main Chat Interface Container */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        height: '650px',
        overflow: 'hidden'
      }}>
        {/* Chat Feed */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          background: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
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
                  marginBottom: '4px',
                  fontSize: '0.74rem',
                  color: '#64748b'
                }}>
                  <span style={{ fontWeight: 800 }}>{isUser ? 'أنت' : 'الوكيل الذكي'}</span>
                  <span>•</span>
                  <span>{msg.time}</span>
                </div>

                <div style={{
                  background: isUser ? '#2563eb' : '#ffffff',
                  color: isUser ? '#ffffff' : '#1e293b',
                  padding: '1rem 1.25rem',
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  boxShadow: isUser ? '0 2px 8px rgba(37,99,235,0.25)' : '0 2px 10px rgba(0,0,0,0.04)',
                  border: isUser ? 'none' : '1px solid #e2e8f0',
                  maxWidth: '85%',
                  position: 'relative'
                }}>
                  {!isUser && msg.title && (
                    <div style={{
                      fontWeight: 900,
                      fontSize: '0.94rem',
                      color: '#1e40af',
                      marginBottom: '0.65rem',
                      borderBottom: '1px solid #f1f5f9',
                      paddingBottom: '0.45rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span>{msg.title}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg.text, idx)}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          color: copiedIdx === idx ? '#16a34a' : '#475569',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 800
                        }}
                      >
                        {copiedIdx === idx ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedIdx === idx ? 'تم النسخ' : 'نسخ الإجابة'}</span>
                      </button>
                    </div>
                  )}

                  <div>
                    {isUser ? (
                      <div style={{ fontWeight: 600, fontSize: '0.94rem', lineHeight: 1.6 }}>
                        {msg.text}
                      </div>
                    ) : (
                      renderFormattedText(msg.text)
                    )}
                  </div>
                </div>

                {/* Suggestions */}
                {!isUser && Array.isArray(msg.suggestions) && msg.suggestions.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginTop: '0.65rem',
                    maxWidth: '90%'
                  }}>
                    {msg.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => handleSendMessage(sug)}
                        style={{
                          background: '#ffffff',
                          color: '#1d4ed8',
                          border: '1px solid #bfdbfe',
                          borderRadius: '20px',
                          padding: '4px 12px',
                          fontSize: '0.76rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#eff6ff'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
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
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                animation: 'bounce 1s infinite'
              }} />
              <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 800 }}>
                جاري تحليل قواعد بيانات المشروع وتجهيز الرد...
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div style={{
          background: '#ffffff',
          borderTop: '1px solid #f1f5f9',
          padding: '0.65rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          <button
            type="button"
            onClick={() => handleSendMessage('الموقف التنفيذي والمالي')}
            style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#1e293b',
              cursor: 'pointer'
            }}
          >
            📊 الموقف المالي العام
          </button>

          <button
            type="button"
            onClick={() => handleSendMessage('الجاهز لطبقة الأسفلت')}
            style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#1e293b',
              cursor: 'pointer'
            }}
          >
            🛣️ جاهزية طبقات الرصف
          </button>

          <button
            type="button"
            onClick={() => handleSendMessage('الفئات التعاقدية للبنود')}
            style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#1e293b',
              cursor: 'pointer'
            }}
          >
            📋 الفئات وأسعار البنود
          </button>

          <button
            type="button"
            onClick={() => handleSendMessage('أرصدة الوقود اليومية')}
            style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#1e293b',
              cursor: 'pointer'
            }}
          >
            ⛽ رصيد الديزل بالمواقع
          </button>

          <button
            type="button"
            onClick={() => handleSendMessage('عائق المرحلة الأولى')}
            style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#1e293b',
              cursor: 'pointer'
            }}
          >
            ⚠️ العبارة المنهارة (165)
          </button>

          <button
            type="button"
            onClick={() => handleSendMessage('صياغة تقرير رسمي للإدارة')}
            style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#1e293b',
              cursor: 'pointer'
            }}
          >
            📄 صياغة كتاب رسمي
          </button>
        </div>

        {/* Input Bar */}
        <div style={{
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
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
            placeholder="اكتب سؤالك أو استفسارك هنا (مثال: كم نسبة الإنجاز؟ كم المتر الجاهز للأسفلت؟)..."
            style={{
              flex: 1,
              border: '1.5px solid #cbd5e1',
              borderRadius: '12px',
              padding: '0.7rem 1rem',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              resize: 'none',
              outline: 'none',
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
              borderRadius: '12px',
              padding: '0.75rem 1.35rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: !inputMessage.trim() || isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(37,99,235,0.3)'
            }}
          >
            <span>إرسال</span>
            <Send size={16} style={{ transform: 'rotate(180deg)' }} />
          </button>
        </div>
      </div>
    </div>
  );
};
export default AIAgentView;

