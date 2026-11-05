import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Sparkles, Send, Copy, Check, RefreshCw, Key, 
  Paperclip, FileSpreadsheet, FileText, Image as ImageIcon, X,
  Layers, Milestone, Fuel, AlertTriangle, Printer,
  Award, Newspaper, HardHat, FileCheck2, ChevronLeft
} from 'lucide-react';
import { 
  processLocalQuery, 
  callGeminiCloudAgent, 
  getLiveSystemContext, 
  getDefaultApiKey, 
  parseUploadedFile,
  fmt
} from '../utils/aiAgentEngine.js';

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
  const [attachedFile, setAttachedFile] = useState(null);
  const [isParsingFile, setIsParsingFile] = useState(false);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const liveContext = getLiveSystemContext();

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'agent',
      time: new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' }),
      title: 'مرحباً بك! أنا مساعد جهاز الإشراف والمتابعة',
      text: `أهلاً بك يا باشمهندس **${currentUser?.name || ''}**.
أنا **مساعد جهاز الإشراف والمتابعة** المعتمد لمشروع **صيانة وتطوير طريق أوباري - غات (360 كم)**.

أنا مربوط مباشرة بكافة قواعد بيانات المنظومة والوثائق المعتمدة (29/10/2026): الموقف المالي (81.62%)، حاسبة المحطات، التتابع الإنشائي، أرصدة الوقود، وأسطول الآليات.

✨ **جديد المنظومة:**
• يمكنك الآن طلب **المقالة التقريرية الشاملة لمدير المشروع** بضغطة زر واحدة.
• يمكنك **رفع ملفات الإكسل (XLSX)، الجداول، والصور** لأقوم بفحصها وتحليلها فورياً.`,
      suggestions: [
        '📰 مقالة المستجدات لمدير المشروع',
        'ما هو الموقف التنفيذي والمالي اليوم؟',
        'كم المتر الطولي الجاهز لطبقة الأسفلت؟',
        'ما هي الفئات التعاقدية للبنود؟',
        'ما هو رصيد الوقود في المواقع؟'
      ]
    }
  ]);

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
  }, [messages, isLoading]);

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
      let suggestions = [];

      if (useCloudLLM && apiKey.trim()) {
        agentReplyText = await callGeminiCloudAgent(apiKey.trim(), userMessageObj.text, newMessages, fileToProcess);
        replyTitle = fileToProcess ? `تقرير فحص وتحليل المستند: ${fileToProcess.name}` : (query.includes('مقالة') || query.includes('المستجدات') ? 'المقالة التقريرية لمدير المشروع (مساعد الإشراف الذكي)' : 'تحليل مساعد جهاز الإشراف');
        suggestions = ['📰 مقالة المستجدات لمدير المشروع', 'الموقف التنفيذي والمالي', 'الجاهز للأسفلت'];
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
          text: `⚠️ **تعذر إتمام الاستعلام السحابي:**\n${err.message || 'تم تحويل الطلب تلقائياً للمحرك المدمج لمساعد الإشراف.'}`,
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

  const handleResetChat = () => {
    if (window.confirm('هل ترغب في بدء جلسة استعلام جديدة مع مساعد جهاز الإشراف؟')) {
      setMessages([
        {
          id: Date.now(),
          sender: 'agent',
          time: new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' }),
          title: 'جلسة جديدة - مساعد جهاز الإشراف والمتابعة',
          text: `أهلاً بك مجدداً يا باشمهندس **${currentUser?.name || ''}**. أنا جاهز لأي استفسارات هندسية أو صياغة مقالات أو فحص مستندات.`,
          suggestions: [
            '📰 مقالة المستجدات لمدير المشروع',
            'ما هو الموقف التنفيذي والمالي اليوم؟',
            'كم المتر الطولي الجاهز لطبقة الأسفلت؟'
          ]
        }
      ]);
      setAttachedFile(null);
    }
  };

  const renderFormattedText = (rawText) => {
    if (!rawText) return null;
    const lines = rawText.split('\n');

    return lines.map((line, lIdx) => {
      const trimmed = line.trim();
      const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-');
      const isNumbered = /^\d+[\.\)]\s/.test(trimmed);
      const isHeader3 = trimmed.startsWith('### ');
      const isHeader2 = trimmed.startsWith('## ') || trimmed.startsWith('📌') || trimmed.startsWith('📋') || trimmed.startsWith('🚧') || trimmed.startsWith('🛣️') || trimmed.startsWith('⚠️') || trimmed.startsWith('⛽') || trimmed.startsWith('📐') || trimmed.startsWith('📄') || trimmed.startsWith('📰');
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
          marginBottom: trimmed === '' ? '0.45rem' : '0.25rem',
          paddingRight: isBullet ? '0.65rem' : (isNumbered ? '0.5rem' : '0'),
          fontWeight: isHeader2 || isHeader3 ? 900 : 500,
          color: isHeader2 ? '#0f172a' : (isHeader3 ? '#1e3a8a' : '#1e293b'),
          fontSize: isHeader2 ? '1.02rem' : (isHeader3 ? '0.94rem' : '0.88rem'),
          lineHeight: 1.65
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
                  padding: '1px 6px',
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
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #1e3a8a 100%)',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '1.4rem 1.8rem',
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
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(37,99,235,0.45)',
            border: '2px solid rgba(255,255,255,0.2)'
          }}>
            <Bot size={30} color="#ffffff" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900 }}>
                مساعد جهاز الإشراف (AI Supervision Assistant)
              </h1>
              <span style={{
                background: '#22c55e',
                color: '#0f172a',
                fontSize: '0.72rem',
                fontWeight: 900,
                padding: '2px 8px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0f172a' }}></span>
                <span>متصل بقواعد البيانات (29/10/2026)</span>
              </span>
            </div>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.86rem', color: '#cbd5e1' }}>
              المساعد الهندسي الذكي لمدير المشروع وجهاز الإشراف لتحليل الموقف الميداني، فحص المستندات، وإعداد التقارير الاستراتيجية
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleResetChat}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              padding: '0.55rem 0.95rem',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer'
            }}
            title="بدء جلسة جديدة"
          >
            <RefreshCw size={15} />
            <span>جلسة جديدة</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: showSettings ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: showSettings ? '#0f172a' : '#ffffff',
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
          border: '1.5px solid #bfdbfe',
          borderRadius: '14px',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
        }}>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.98rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Key size={18} color="#2563eb" />
            <span>إعدادات الاتصال بمحرك Google Gemini API السحابي</span>
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.5 }}>
            يعمل مساعد جهاز الإشراف تلقائياً وبأقصى كفاءة اعتماداً على مفتاح Gemini المعتمد المدمج والبيانات الهندسية المحدثة. يمكنك تعديل المفتاح أو التحكم بوضع الاتصال:
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
                padding: '0.6rem 0.9rem',
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
                padding: '0.6rem 1.35rem',
                borderRadius: '8px',
                fontWeight: 900,
                fontSize: '0.86rem',
                cursor: 'pointer'
              }}
            >
              حفظ وتطبيق
            </button>
          </div>
        </div>
      )}

      {/* 2. Top Executive Feature Banner (Highlight for Project Manager Article) */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
        borderRadius: '14px',
        padding: '1rem 1.4rem',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 4px 14px rgba(37,99,235,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Newspaper size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '1rem' }}>
              المقالة التقريرية الشاملة لمدير المشروع (آخر المستجدات الهندسية والميدانية)
            </div>
            <div style={{ fontSize: '0.82rem', color: '#dbeafe', marginTop: '2px' }}>
              إعداد تقرير استراتيجي متكامل لمكتب م. عبدالرحمن الأنصاري يشمل نسب الإنجاز، أطوال الرصف، المخزون، والتوصيات
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleSendMessage('📰 إعداد المقالة التقريرية الشاملة لمدير المشروع عن آخر المستجدات')}
          disabled={isLoading}
          style={{
            background: '#ffffff',
            color: '#1e3a8a',
            border: 'none',
            borderRadius: '10px',
            padding: '0.65rem 1.25rem',
            fontWeight: 900,
            fontSize: '0.86rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}
        >
          <Sparkles size={16} color="#2563eb" />
          <span>طلب المقالة التقريرية الآن</span>
        </button>
      </div>

      {/* 3. Live Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '0.85rem'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '0.9rem 1.15rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b' }}>إجمالي المنفذ المالي</span>
            <Award size={18} color="#16a34a" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#16a34a' }}>
            {fmt(liveContext.grandExecutedSum)} د.ل
          </div>
          <span style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 800 }}>
            نسبة الإنجاز المالي: %{liveContext.financialProgressPct}
          </span>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '0.9rem 1.15rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b' }}>الجاهز لطبقة الأسفلت</span>
            <Milestone size={18} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0284c7' }}>
            2,230.00 م.ط
          </div>
          <span style={{ fontSize: '0.74rem', color: '#0369a1', fontWeight: 800 }}>
            مرشوش MC0 وجاهز للطرح فورياً
          </span>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '0.9rem 1.15rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b' }}>الجاهز للأساس الحبيبي</span>
            <Layers size={18} color="#ea580c" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ea580c' }}>
            6,670.00 م.ط
          </div>
          <span style={{ fontSize: '0.74rem', color: '#c2410c', fontWeight: 800 }}>
            منجز فرمة ثانية وجاهز للفرش
          </span>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '0.9rem 1.15rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b' }}>رصيد الوقود المتبقي</span>
            <Fuel size={18} color="#eab308" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ca8a04' }}>
            209.00 لتر
          </div>
          <span style={{ fontSize: '0.74rem', color: '#a16207', fontWeight: 800 }}>
            مواقع 107 و 240 والكسارات
          </span>
        </div>
      </div>

      {/* 4. Main Chat Interface Container */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        height: '680px',
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
                  <span style={{ fontWeight: 800 }}>{isUser ? 'أنت' : 'مساعد جهاز الإشراف'}</span>
                  <span>•</span>
                  <span>{msg.time}</span>
                </div>

                <div style={{
                  background: isUser ? 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' : '#ffffff',
                  color: isUser ? '#ffffff' : '#1e293b',
                  padding: '1.1rem 1.35rem',
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  boxShadow: isUser ? '0 3px 10px rgba(37,99,235,0.25)' : '0 2px 10px rgba(0,0,0,0.04)',
                  border: isUser ? 'none' : '1px solid #e2e8f0',
                  maxWidth: '88%',
                  position: 'relative'
                }}>
                  {/* Attached file chip on user message */}
                  {isUser && msg.attachedFile && (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.78rem'
                    }}>
                      <Paperclip size={14} />
                      <span style={{ fontWeight: 800 }}>مستند مرفق:</span>
                      <span>{msg.attachedFile.name}</span>
                      <span style={{ opacity: 0.8 }}>({msg.attachedFile.size})</span>
                    </div>
                  )}

                  {!isUser && msg.title && (
                    <div style={{
                      fontWeight: 900,
                      fontSize: '0.96rem',
                      color: '#1e3a8a',
                      marginBottom: '0.75rem',
                      borderBottom: '1px solid #f1f5f9',
                      paddingBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Bot size={16} color="#2563eb" />
                        <span>{msg.title}</span>
                      </div>

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
                      <div style={{ fontWeight: 600, fontSize: '0.92rem', lineHeight: 1.6 }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 0' }}>
              <div style={{
                background: '#2563eb',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                animation: 'bounce 1s infinite'
              }} />
              <span style={{ fontSize: '0.84rem', color: '#475569', fontWeight: 800 }}>
                مساعد جهاز الإشراف يقوم بتحليل قواعد البيانات والوثائق وإعداد الرد...
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
            onClick={() => handleSendMessage('📰 المقالة التقريرية الشاملة لمدير المشروع')}
            style={{
              fontSize: '0.78rem',
              fontWeight: 900,
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1.5px solid #93c5fd',
              background: '#eff6ff',
              color: '#1d4ed8',
              cursor: 'pointer'
            }}
          >
            📰 مقالة المستجدات لمدير المشروع
          </button>

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
            📄 صياغة مذكرة إشرافية
          </button>
        </div>

        {/* File Preview Attachment Pill (If file is selected) */}
        {attachedFile && (
          <div style={{
            background: '#f0fdf4',
            borderTop: '1px solid #bbf7d0',
            padding: '0.55rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {attachedFile.type === 'excel' ? (
                <FileSpreadsheet size={18} color="#16a34a" />
              ) : attachedFile.isImage ? (
                <ImageIcon size={18} color="#0284c7" />
              ) : (
                <FileText size={18} color="#ea580c" />
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
                تم استخراج البيانات وجاهز للتحليل
              </span>
            </div>

            <button
              type="button"
              onClick={handleRemoveFile}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#dc2626',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title="إلغاء إرفاق الملف"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Input Bar with File Upload Support */}
        <div style={{
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv,.txt,.json,.pdf,image/*"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />

          {/* Paperclip Upload Button */}
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
            title="رفع ملف إكسل، جدول، أو صورة للتحليل"
          >
            <Paperclip size={16} />
            <span>{isParsingFile ? 'جاري القراءة...' : (attachedFile ? 'مرفق' : 'إرفاق ملف')}</span>
          </button>

          {/* Text Area Input */}
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
            placeholder={attachedFile ? "اكتب تعليمات التحليل لهذا الملف أو اضغط إرسال لتحليله فورياً..." : "اكتب سؤالك، أو اطلب مقالة لمدير المشروع، أو أرفق ملف إكسل/صورة للتحليل..."}
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

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={isLoading || (!inputMessage.trim() && !attachedFile)}
            style={{
              background: (!inputMessage.trim() && !attachedFile) || isLoading ? '#94a3b8' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '0.75rem 1.35rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: (!inputMessage.trim() && !attachedFile) || isLoading ? 'not-allowed' : 'pointer',
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
