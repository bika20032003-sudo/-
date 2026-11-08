import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Sparkles, X, Send, Copy, Check, Key, 
  ChevronDown, Maximize2, Minimize2, Paperclip, FileSpreadsheet,
  FileText, Image as ImageIcon, Layers, Milestone, Fuel, AlertTriangle, Newspaper,
  ExternalLink, UserCheck
} from 'lucide-react';
import { 
  processLocalQuery, 
  callGeminiCloudAgent, 
  getLiveSystemContext, 
  getDefaultApiKey,
  parseUploadedFile,
  fmt
} from '../utils/aiAgentEngine.js';

export const AIAgentWidget = ({ currentUser, onNavigateTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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
أنا مساعدك التنفيذي المعتمد لمشروع **طريق أوباري - غات (360 كم)**.

أنا مربوط مباشرة بكافة تقارير المنظومة، أرشيف المستندات، والمراسلات الإدارية والفنية.
يمكنك الآن طلب **الموجز التنفيذي لمدير المشروع** أو استعراض الأرشيف والمراسلات فورياً!`,
      suggestions: [
        '📰 الموجز التنفيذي لمدير المشروع',
        '📁 فحص أرشيف التقارير المعتمدة',
        '📬 المراسلات والبريد الوارد لمدير المشروع',
        '🛣️ موقف أعمال الطريق (المرحلة 1 و 2)',
        '⛽ موقف أرصدة واستهلاك الوقود بالمواقع'
      ]
    }
  ]);

  // Load API Key from localStorage
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

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const handleSaveSettings = () => {
    try {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      localStorage.setItem('use_cloud_llm', useCloudLLM ? 'true' : 'false');
      setShowSettings(false);
    } catch (_) {}
  };

  const handleFileSelect = async (e) => {
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

  const handleSendMessage = async (textToSend, overrideFile = null) => {
    const query = (textToSend !== undefined ? textToSend : inputMessage).trim();
    const fileToProcess = overrideFile || attachedFile;

    if (!query && !fileToProcess) return;
    if (isLoading) return;

    setInputMessage('');
    setAttachedFile(null);
    const userMsgId = Date.now();
    const currentTime = new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' });

    const userMessageObj = {
      id: userMsgId,
      sender: 'user',
      time: currentTime,
      text: query || (fileToProcess ? `يرجى فحص وتحليل هذا المستند المرفق (${fileToProcess.name}) بالتفصيل وتقديم تقرير هندسي لمحتوياته.` : ''),
      attachedFile: fileToProcess ? {
        name: fileToProcess.name,
        size: fileToProcess.size,
        type: fileToProcess.type
      } : null
    };

    const newMessages = [...messages, userMessageObj];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      let agentReplyText = '';
      let replyTitle = '';
      let suggestions = [];

      if (useCloudLLM && apiKey.trim()) {
        agentReplyText = await callGeminiCloudAgent(apiKey.trim(), userMessageObj.text, newMessages, fileToProcess);
        replyTitle = fileToProcess ? `تحليل المستند: ${fileToProcess.name}` : (query.includes('مقالة') || query.includes('المستجدات') || query.includes('موجز') ? 'الموجز التنفيذي لمدير المشروع' : 'تحليل مساعد مدير المشروع');
        suggestions = ['📰 الموجز التنفيذي لمدير المشروع', '📁 أرشيف التقارير', '📬 المراسلات والبريد الوارد'];
      } else {
        const localResult = processLocalQuery(userMessageObj.text, fileToProcess);
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
          text: `⚠️ **تعذر استكمال الاتصال:**\n${err.message || 'تم تحويل الطلب تلقائياً للمحرك المدمج.'}`,
          isError: true,
          suggestions: ['📰 مقالة المستجدات لمدير المشروع', 'الموقف التنفيذي والمالي', 'رصيد الوقود']
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
      const trimmed = line.trim();
      const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-');
      const isDivider = trimmed === '---' || trimmed === '***';
      const isHeader = trimmed.startsWith('#') || trimmed.startsWith('📌') || trimmed.startsWith('📋') || trimmed.startsWith('🚧') || trimmed.startsWith('🛣️') || trimmed.startsWith('⚠️') || trimmed.startsWith('⛽') || trimmed.startsWith('📐') || trimmed.startsWith('📄') || trimmed.startsWith('📰');

      if (isDivider) {
        return <hr key={lIdx} style={{ margin: '0.65rem 0', borderColor: '#e2e8f0', borderWidth: '1px 0 0' }} />;
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
            padding: '4px 6px',
            fontSize: '0.76rem',
            fontWeight: 600,
            direction: 'rtl'
          }}>
            {cells.map((cell, cIdx) => (
              <div key={cIdx} style={{ padding: '0 2px', textAlign: 'right' }}>
                {cell.trim()}
              </div>
            ))}
          </div>
        );
      }

      const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);

      return (
        <div key={lIdx} style={{
          marginBottom: trimmed === '' ? '0.35rem' : '0.2rem',
          paddingRight: isBullet ? '0.45rem' : '0',
          fontWeight: isHeader ? 800 : 500,
          color: isHeader ? '#0f172a' : '#1e293b',
          fontSize: isHeader ? '0.9rem' : '0.84rem',
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
                  color: '#1d4ed8',
                  padding: '1px 4px',
                  borderRadius: '3px',
                  fontSize: '0.8rem',
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
      {/* 1. Floating Trigger Button */}
      {!isOpen && (
        <div style={{ position: 'fixed', bottom: '24px', left: '24px', zIndex: 99999 }}>
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
            title="فتح مساعد مدير المشروع"
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
                مساعد مدير المشروع
              </span>
              <span style={{ fontSize: '0.68rem', color: '#bfdbfe', fontWeight: 700 }}>
                الذكاء الهندسي (AI)
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
                    مساعد مدير المشروع
                  </h3>
                  <span style={{
                    fontSize: '0.65rem',
                    background: useCloudLLM ? '#38bdf8' : '#22c55e',
                    color: '#0f172a',
                    fontWeight: 900,
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}>
                    {useCloudLLM ? 'Gemini AI' : 'مدمج'}
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  طريق أوباري - غات (360 كم)
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onNavigateTab('ai-agent');
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#ffffff',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="فتح في الواجهة الرئيسية الكاملة"
                >
                  <ExternalLink size={13} />
                  <span>الواجهة الكاملة</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                style={{
                  background: showSettings ? 'rgba(255,255,255,0.2)' : 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  padding: '5px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                title="إعدادات المفتاح"
              >
                <Key size={16} />
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  padding: '5px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                title={isExpanded ? 'تصغير النافذة' : 'تكبير النافذة'}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  padding: '5px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                title="إغلاق"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Settings Panel (Collapsible) */}
          {showSettings && (
            <div style={{
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              padding: '0.75rem 1rem',
              fontSize: '0.82rem'
            }}>
              <div style={{ fontWeight: 800, marginBottom: '6px', color: '#0f172a' }}>
                مفتاح Google Gemini API:
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  style={{
                    flex: 1,
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.78rem',
                    direction: 'ltr',
                    fontFamily: 'monospace'
                  }}
                />
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  حفظ
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
            gap: '0.85rem'
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
                    <span>{isUser ? 'أنت' : 'مساعد مدير المشروع'}</span>
                    <span>•</span>
                    <span>{msg.time}</span>
                  </div>

                  <div
                    style={{
                      background: isUser ? 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' : '#ffffff',
                      color: isUser ? '#ffffff' : '#1e293b',
                      padding: '0.85rem 1.05rem',
                      borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      boxShadow: isUser ? '0 2px 6px rgba(37, 99, 235, 0.25)' : '0 2px 8px rgba(0,0,0,0.04)',
                      border: isUser ? 'none' : '1px solid #e2e8f0',
                      maxWidth: '92%',
                      position: 'relative'
                    }}
                  >
                    {isUser && msg.attachedFile && (
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        marginBottom: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.74rem'
                      }}>
                        <Paperclip size={13} />
                        <span>مرفق: {msg.attachedFile.name} ({msg.attachedFile.size})</span>
                      </div>
                    )}

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
                            cursor: 'pointer'
                          }}
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
                  مساعد مدير المشروع يحلل البيانات ويعد الرد...
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
              onClick={() => handleSendMessage('طلب آخر المستجدات وتقرير الحالة لمدير المشروع')}
              style={{
                fontSize: '0.75rem',
                fontWeight: 900,
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1.5px solid #0284c7',
                background: '#e0f2fe',
                color: '#0369a1',
                cursor: 'pointer'
              }}
            >
              📰 طلب آخر المستجدات لمدير المشروع
            </button>

            <button
              type="button"
              onClick={() => handleSendMessage('عرض وموقف المهام الإشرافية وتكليفات مدير المشروع')}
              style={{
                fontSize: '0.75rem',
                fontWeight: 900,
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1.5px solid #2563eb',
                background: '#eff6ff',
                color: '#1e40af',
                cursor: 'pointer'
              }}
            >
              📋 عرض المهام الإشرافية
            </button>

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
          </div>

          {/* Attached File Preview inside Widget */}
          {attachedFile && (
            <div style={{
              background: '#f0fdf4',
              borderTop: '1px solid #bbf7d0',
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.74rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Paperclip size={14} color="#16a34a" />
                <span style={{ fontWeight: 800, color: '#166534' }}>{attachedFile.name}</span>
                <span style={{ color: '#15803d' }}>({attachedFile.size})</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Input Box with Attachment Trigger */}
          <div style={{
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '0.65rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,.txt,.json,.pdf,image/*"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isParsingFile}
              style={{
                background: attachedFile ? '#dcfce7' : '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '6px 8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: attachedFile ? '#16a34a' : '#64748b'
              }}
              title="إرفاق ملف إكسل أو صورة"
            >
              <Paperclip size={16} />
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
              placeholder={attachedFile ? "اضغط إرسال لتحليل الملف أو اكتب سؤالك..." : "اكتب استفسارك، أو اطلب مقالة لمدير المشروع..."}
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
              disabled={isLoading || (!inputMessage.trim() && !attachedFile)}
              style={{
                background: (!inputMessage.trim() && !attachedFile) || isLoading ? '#94a3b8' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '0.6rem 0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: (!inputMessage.trim() && !attachedFile) || isLoading ? 'not-allowed' : 'pointer',
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
