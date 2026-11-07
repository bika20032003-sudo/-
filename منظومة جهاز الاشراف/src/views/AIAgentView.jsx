import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Sparkles, Send, Copy, Check, Key, Plus,
  Paperclip, FileSpreadsheet, FileText, Image as ImageIcon, X,
  Layers, Milestone, Fuel, AlertTriangle, Printer,
  Award, Newspaper, HardHat, FileCheck2, ChevronLeft,
  Clock, CheckCircle2, UserCheck, Calendar, ArrowRight,
  UploadCloud, Mail, Filter, AlertCircle, Trash2
} from 'lucide-react';
import { 
  processLocalQuery, 
  callGeminiCloudAgent, 
  getLiveSystemContext, 
  getDefaultApiKey, 
  parseUploadedFile,
  fmt,
  generateExecutiveBriefingArticle,
  getSupervisoryTasks,
  saveSupervisoryTask,
  updateSupervisoryTaskStatus,
  deleteSupervisoryTask,
  generateSupervisoryTasksArticle
} from '../utils/aiAgentEngine.js';

const OFFICIAL_SUPERVISORS = [
  { username: 'abrikaw', name: 'م. الصالحين بريكاو', role: 'مشرف قطاع أ (المرحلة الأولى)' },
  { username: 'saleh_quality', name: 'م. صالح بن يحي', role: 'مهندس ضبط الجودة والمختبر' },
  { username: 'salah_alarabi', name: 'م. صلاح العربي', role: 'مشرف قطاع ب (المرحلة الثانية)' },
  { username: 'issa_altahir', name: 'م. عيسى الطاهر', role: 'مشرف محطة الخلط والموقع' },
  { username: 'project_manager', name: 'م. عبدالرحمن الأنصاري', role: 'مدير المشروع' },
  { username: 'all', name: 'كافة مهندسي جهاز الإشراف (تعميم)', role: 'جهاز الإشراف والمتابعة' }
];

export const AIAgentView = ({ currentUser, onNavigateTab }) => {
  // Navigation tabs within Assistant view
  const [activeTab, setActiveTab] = useState('manager'); // 'manager' | 'chat' | 'files'

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

  // Dedicated file analysis center state
  const [uploadedFilesCenter, setUploadedFilesCenter] = useState([]);
  const [selectedFileForAnalysis, setSelectedFileForAnalysis] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzingFileCenter, setIsAnalyzingFileCenter] = useState(false);

  // Project Manager Suite states
  const [executiveArticle, setExecutiveArticle] = useState(() => generateExecutiveBriefingArticle());
  const [articleCopied, setArticleCopied] = useState(false);
  const [supervisoryTasks, setSupervisoryTasks] = useState(() => getSupervisoryTasks());
  const [taskFilter, setTaskFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [taskNotice, setTaskNotice] = useState('');

  // Task creation form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('abrikaw');
  const [taskSector, setTaskSector] = useState('المرحلة الأولى (المحطة 236)');
  const [taskPriority, setTaskPriority] = useState('urgent');
  const [taskDueDate, setTaskDueDate] = useState(() => {
    const d = new Date(Date.now() + 86400000 * 2);
    return d.toISOString().split('T')[0];
  });
  const [taskDetails, setTaskDetails] = useState('');

  const fileInputRef = useRef(null);
  const centerFileInputRef = useRef(null);
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

✨ **القدرات الإشرافية المتاحة بين يديك:**
1. **مكتب مدير المشروع:** طلب تقرير آخر المستجدات الميدانية بضغطة زر، وتكليف ومتابعة المهام الإشرافية الميدانية.
2. **مركز رفع وفحص الملفات:** رفع مصنفات الإكسل (XLSX)، الجداول، ومستندات الفحص لتحليلها ومطابقتها فورياً.
3. **الاستشارات الهندسية:** استعلام مباشر وفوري عن الكميات، المحطات، أسعار البنود، وأرصدة الوقود.`,
      suggestions: [
        '📰 مقالة المستجدات لمدير المشروع',
        '📋 عرض المهام الإشرافية المفتوحة',
        'ما هو الموقف التنفيذي والمالي اليوم؟',
        'كم المتر الطولي الجاهز لطبقة الأسفلت؟',
        'ما هي الفئات التعاقدية للبنود؟',
        'ما هو رصيد الوقود في المواقع؟'
      ]
    }
  ]);

  // Load API Key & preferences
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

  // Listen to supervisory tasks updates and sync in real time
  useEffect(() => {
    const handleTasksUpdate = () => {
      setSupervisoryTasks(getSupervisoryTasks());
    };
    window.addEventListener('supervisory-tasks-updated', handleTasksUpdate);
    window.addEventListener('storage', handleTasksUpdate);
    return () => {
      window.removeEventListener('supervisory-tasks-updated', handleTasksUpdate);
      window.removeEventListener('storage', handleTasksUpdate);
    };
  }, []);

  // Auto-scroll chat feed
  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, activeTab]);

  const handleSaveSettings = () => {
    try {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      localStorage.setItem('use_cloud_llm', useCloudLLM ? 'true' : 'false');
      setShowSettings(false);
    } catch (_) {}
  };

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

  // Handle file select in Dedicated Files Center
  const handleCenterFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAnalyzingFileCenter(true);
    try {
      const parsed = await parseUploadedFile(file);
      setUploadedFilesCenter(prev => [parsed, ...prev]);
      setSelectedFileForAnalysis(parsed);

      // Instant local analysis
      const analysis = processLocalQuery(`يرجى فحص ومطابقة هذا الملف هندسياً`, parsed);
      setAnalysisResult(analysis);
    } catch (err) {
      console.error('File analysis error:', err);
    } finally {
      setIsAnalyzingFileCenter(false);
      if (centerFileInputRef.current) centerFileInputRef.current.value = '';
    }
  };

  const handleRunFileAnalysis = (fileObj, queryText) => {
    setIsAnalyzingFileCenter(true);
    setTimeout(() => {
      const analysis = processLocalQuery(queryText, fileObj);
      setAnalysisResult(analysis);
      setIsAnalyzingFileCenter(false);
    }, 200);
  };

  // Send Chat message
  const handleSendMessage = async (textToSend, overrideFile = null) => {
    const query = (textToSend !== undefined ? textToSend : inputMessage).trim();
    const fileToProcess = overrideFile || attachedFile;

    if (!query && !fileToProcess) return;
    if (isLoading) return;

    // If currently on manager or files tab, switch to chat tab smoothly
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
        replyTitle = fileToProcess ? `تقرير فحص وتحليل المستند: ${fileToProcess.name}` : (query.includes('مقالة') || query.includes('المستجدات') ? 'المقالة التقريرية لمدير المشروع (مساعد جهاز الإشراف)' : 'تحليل مساعد جهاز الإشراف');
        suggestions = ['📰 مقالة المستجدات لمدير المشروع', '📋 عرض المهام الإشرافية المفتوحة', 'الموقف التنفيذي والمالي', 'الجاهز للأسفلت'];
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
          title: 'تنبيه مساعد الإشراف',
          text: `⚠️ **تعذر إتمام الاستعلام السحابي:**\n${err.message || 'تم تحويل الطلب تلقائياً للمحرك المدمج لمساعد الإشراف.'}`,
          isError: true,
          suggestions: ['📰 مقالة المستجدات لمدير المشروع', '📋 عرض المهام الإشرافية المفتوحة', 'الموقف التنفيذي والمالي', 'رصيد الوقود']
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
          text: `أهلاً بك مجدداً يا باشمهندس **${currentUser?.name || ''}**. أنا جاهز لأي استفسارات هندسية، إعداد مقالات المستجدات، أو فحص المستندات والمهام.`,
          suggestions: [
            '📰 مقالة المستجدات لمدير المشروع',
            '📋 عرض المهام الإشرافية المفتوحة',
            'ما هو الموقف التنفيذي والمالي اليوم؟',
            'كم المتر الطولي الجاهز لطبقة الأسفلت؟'
          ]
        }
      ]);
      setAttachedFile(null);
    }
  };

  // Project Manager: Generate / Refresh Executive Briefing Article
  const handleGenerateLatestBriefing = () => {
    const art = generateExecutiveBriefingArticle();
    setExecutiveArticle(art);
    setTaskNotice('تم تحديث المقالة التقريرية لمدير المشروع بأحدث مؤشرات الميدان والقيم التعاقدية المعتمدة.');
    setTimeout(() => setTaskNotice(''), 4000);
  };

  const handleCopyArticle = () => {
    navigator.clipboard.writeText(executiveArticle);
    setArticleCopied(true);
    setTimeout(() => setArticleCopied(false), 2000);
  };

  // Project Manager: Create & Assign Task
  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      alert('يرجى كتابة عنوان المهمة الإشرافية.');
      return;
    }

    const assignedTarget = OFFICIAL_SUPERVISORS.find(s => s.username === taskAssignee) || OFFICIAL_SUPERVISORS[0];

    const newTask = saveSupervisoryTask({
      title: taskTitle,
      assignedToUsername: assignedTarget.username,
      assignedToName: assignedTarget.name,
      assignedToRole: assignedTarget.role,
      sector: taskSector,
      priority: taskPriority,
      dueDate: taskDueDate,
      details: taskDetails
    }, currentUser);

    if (newTask) {
      setSupervisoryTasks(getSupervisoryTasks());
      setTaskTitle('');
      setTaskDetails('');
      setTaskNotice(`✅ تم إصدار وتكليف المهمة بنجاح وتوجيه بريد إشرافي رسمي إلى (${assignedTarget.name}).`);
      setTimeout(() => setTaskNotice(''), 5000);
    }
  };

  const handleToggleTaskStatus = (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    updateSupervisoryTaskStatus(taskId, nextStatus);
    setSupervisoryTasks(getSupervisoryTasks());
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المهمة الإشرافية؟')) {
      deleteSupervisoryTask(taskId);
      setSupervisoryTasks(getSupervisoryTasks());
    }
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
          margin: '0.35rem 0',
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

  // Filtered supervisory tasks
  const filteredTasks = supervisoryTasks.filter(t => {
    if (taskFilter === 'pending') return t.status === 'pending';
    if (taskFilter === 'completed') return t.status === 'completed';
    return true;
  });

  const pendingCount = supervisoryTasks.filter(t => t.status === 'pending').length;
  const completedCount = supervisoryTasks.filter(t => t.status === 'completed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '3.5rem' }}>
      
      {/* 1. Master Header Banner */}
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
                <span>متصل بالقواعد الهندسية والتقارير الميدانية (تحديث حي ومباشر)</span>
              </span>
            </div>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.86rem', color: '#cbd5e1' }}>
              المنصة الذكية المعتمدة لجهاز الإشراف على مشروع طريق أوباري - غات (360 كم): تقارير مدير المشروع، تكليف المهام، واستشارات هندسية فورية
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

      {/* 2. Top Primary Navigation Tabs (Manager Suite | Interactive Chat | File Analysis Center) */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: '4px',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('manager')}
          style={{
            background: activeTab === 'manager' ? '#1e3a8a' : '#ffffff',
            color: activeTab === 'manager' ? '#ffffff' : '#475569',
            border: activeTab === 'manager' ? 'none' : '1px solid #cbd5e1',
            borderRadius: '10px 10px 0 0',
            padding: '0.75rem 1.4rem',
            fontWeight: 900,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'manager' ? '0 3px 8px rgba(30,58,138,0.25)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <Newspaper size={18} />
          <span>مكتب مدير المشروع (المستجدات والمهام الإشرافية)</span>
          {pendingCount > 0 && (
            <span style={{
              background: activeTab === 'manager' ? '#ef4444' : '#fee2e2',
              color: activeTab === 'manager' ? '#ffffff' : '#b91c1c',
              fontSize: '0.72rem',
              fontWeight: 900,
              padding: '2px 7px',
              borderRadius: '10px'
            }}>
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          style={{
            background: activeTab === 'chat' ? '#1e3a8a' : '#ffffff',
            color: activeTab === 'chat' ? '#ffffff' : '#475569',
            border: activeTab === 'chat' ? 'none' : '1px solid #cbd5e1',
            borderRadius: '10px 10px 0 0',
            padding: '0.75rem 1.4rem',
            fontWeight: 900,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'chat' ? '0 3px 8px rgba(30,58,138,0.25)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <Bot size={18} />
          <span>المحادثة والاستشارات الهندسية التفاعلية</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('files')}
          style={{
            background: activeTab === 'files' ? '#1e3a8a' : '#ffffff',
            color: activeTab === 'files' ? '#ffffff' : '#475569',
            border: activeTab === 'files' ? 'none' : '1px solid #cbd5e1',
            borderRadius: '10px 10px 0 0',
            padding: '0.75rem 1.4rem',
            fontWeight: 900,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'files' ? '0 3px 8px rgba(30,58,138,0.25)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <FileSpreadsheet size={18} />
          <span>مركز رفع وفحص المستندات والملفات</span>
          {uploadedFilesCenter.length > 0 && (
            <span style={{
              background: activeTab === 'files' ? '#22c55e' : '#dcfce7',
              color: activeTab === 'files' ? '#0f172a' : '#15803d',
              fontSize: '0.72rem',
              fontWeight: 900,
              padding: '2px 7px',
              borderRadius: '10px'
            }}>
              {uploadedFilesCenter.length}
            </span>
          )}
        </button>
      </div>

      {/* Global Status Notice (if any) */}
      {taskNotice && (
        <div style={{
          background: '#f0fdf4',
          border: '1.5px solid #86efac',
          color: '#166534',
          padding: '0.85rem 1.25rem',
          borderRadius: '12px',
          fontWeight: 800,
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(22,101,52,0.08)'
        }}>
          <CheckCircle2 size={18} color="#16a34a" />
          <span>{taskNotice}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 1: PROJECT MANAGER SUITE (BRIEFINGS & SUPERVISORY TASKS) */}
      {/* ========================================================= */}
      {activeTab === 'manager' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Executive Action Bar */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            borderRadius: '14px',
            padding: '1.25rem 1.6rem',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 4px 14px rgba(37,99,235,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '14px',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <Newspaper size={26} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>
                  مكتب مدير المشروع: تقرير آخر المستجدات وإدارة التكليفات الإشرافية
                </div>
                <div style={{ fontSize: '0.84rem', color: '#dbeafe', marginTop: '2px' }}>
                  مكتب سعادة المهندس / عبدالرحمن الأنصاري - متابعة التطورات الميدانية، الرصف، المحروقات، والمهام المفتوحة
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateLatestBriefing}
              style={{
                background: '#ffffff',
                color: '#1e3a8a',
                border: 'none',
                borderRadius: '10px',
                padding: '0.75rem 1.35rem',
                fontWeight: 900,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
              }}
            >
              <Sparkles size={17} color="#2563eb" />
              <span>طلب آخر المستجدات وتقرير الحالة الآن</span>
            </button>
          </div>

          {/* KPI Dashboard Cards */}
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

          {/* Section: Task Submission & Task Board */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '1.5rem',
            alignItems: 'start'
          }}>
            
            {/* Task Creation Form */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1.5px solid #bfdbfe',
              padding: '1.4rem',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                <div style={{
                  background: '#eff6ff',
                  borderRadius: '8px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <UserCheck size={20} color="#2563eb" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
                  تقديم وتكليف مهمة إشرافية جديدة
                </h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1.15rem' }}>
                يتم حفظ المهمة بسجل الإشراف وإرسالها فورياً إلى البريد والمراسلات الداخلية للمهندس المكلف:
              </p>

              <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                    عنوان المهمة الإشرافية *
                  </label>
                  <input
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="مثال: فحص استلام طبقة الأساس بالمحطة 236 أو متابعة الوقود..."
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.9rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.86rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      المهندس المكلف *
                    </label>
                    <select
                      value={taskAssignee}
                      onChange={(e) => setTaskAssignee(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.84rem',
                        fontFamily: 'inherit',
                        background: '#ffffff',
                        outline: 'none'
                      }}
                    >
                      {OFFICIAL_SUPERVISORS.map(s => (
                        <option key={s.username} value={s.username}>
                          {s.name} ({s.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      مستوى الأولوية
                    </label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.84rem',
                        fontFamily: 'inherit',
                        background: '#ffffff',
                        outline: 'none'
                      }}
                    >
                      <option value="urgent">🔴 عاجل وفوري</option>
                      <option value="high">🟠 أولوية عالية</option>
                      <option value="normal">🟢 متابعة دورية</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      القطاع / المحطة
                    </label>
                    <input
                      type="text"
                      value={taskSector}
                      onChange={(e) => setTaskSector(e.target.value)}
                      placeholder="مثال: المرحلة الأولى محطة 236"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.9rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.84rem',
                        fontFamily: 'inherit',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      تاريخ الإنجاز المطلوب
                    </label>
                    <input
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.9rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.84rem',
                        fontFamily: 'inherit',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                    تفاصيل التوجيهات الفنية والميدانية
                  </label>
                  <textarea
                    rows={3}
                    value={taskDetails}
                    onChange={(e) => setTaskDetails(e.target.value)}
                    placeholder="اكتب التوجيهات، المعايير المطلوب التحقق منها، أو تعليمات السلامة..."
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.9rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.86rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      resize: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.75rem 1.4rem',
                    fontWeight: 900,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 3px 10px rgba(37,99,235,0.25)',
                    marginTop: '0.35rem'
                  }}
                >
                  <Send size={16} style={{ transform: 'rotate(180deg)' }} />
                  <span>إصدار وتكليف المهمة الإشرافية فورياً</span>
                </button>
              </form>
            </div>

            {/* Supervisory Tasks Board */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '1.4rem',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
                    سجل المهام الإشرافية الميدانية والتكليفات
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    إجمالي المهام: {supervisoryTasks.length} | قيد المتابعة: {pendingCount} | المكتملة: {completedCount}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setTaskFilter('all')}
                    style={{
                      background: taskFilter === 'all' ? '#1e3a8a' : '#f1f5f9',
                      color: taskFilter === 'all' ? '#ffffff' : '#475569',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    الكل ({supervisoryTasks.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskFilter('pending')}
                    style={{
                      background: taskFilter === 'pending' ? '#ef4444' : '#f1f5f9',
                      color: taskFilter === 'pending' ? '#ffffff' : '#475569',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    قيد المتابعة ({pendingCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskFilter('completed')}
                    style={{
                      background: taskFilter === 'completed' ? '#16a34a' : '#f1f5f9',
                      color: taskFilter === 'completed' ? '#ffffff' : '#475569',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    المكتملة ({completedCount})
                  </button>
                </div>
              </div>

              {/* Tasks List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto' }}>
                {filteredTasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                    لا توجد مهام إشرافية في هذا القسم حالياً.
                  </div>
                ) : (
                  filteredTasks.map((task) => {
                    const isDone = task.status === 'completed';
                    return (
                      <div
                        key={task.id}
                        style={{
                          background: isDone ? '#f8fafc' : '#ffffff',
                          border: isDone ? '1px solid #e2e8f0' : (task.priority === 'urgent' ? '1.5px solid #fca5a5' : '1px solid #cbd5e1'),
                          borderRadius: '12px',
                          padding: '0.9rem 1.1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{
                            background: task.priority === 'urgent' ? '#fee2e2' : (task.priority === 'normal' ? '#f0fdf4' : '#fef3c7'),
                            color: task.priority === 'urgent' ? '#b91c1c' : (task.priority === 'normal' ? '#15803d' : '#b45309'),
                            fontSize: '0.72rem',
                            fontWeight: 900,
                            padding: '2px 8px',
                            borderRadius: '10px'
                          }}>
                            {task.priorityLabel}
                          </span>

                          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={13} />
                            <span>تاريخ الإنجاز: {task.dueDate}</span>
                          </span>
                        </div>

                        <div style={{ fontWeight: 900, fontSize: '0.92rem', color: isDone ? '#64748b' : '#0f172a', textDecoration: isDone ? 'line-through' : 'none' }}>
                          {task.title}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#475569' }}>
                          <span style={{ fontWeight: 800, color: '#1e40af' }}>المكلف: {task.assignedToName}</span>
                          <span>•</span>
                          <span>الموقع: {task.sector}</span>
                        </div>

                        {task.details && (
                          <div style={{ fontSize: '0.8rem', color: '#64748b', background: '#f8fafc', padding: '6px 8px', borderRadius: '6px', marginTop: '2px' }}>
                            {task.details}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleTaskStatus(task.id, task.status)}
                            style={{
                              background: isDone ? '#f1f5f9' : '#dcfce7',
                              color: isDone ? '#475569' : '#15803d',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <CheckCircle2 size={13} />
                            <span>{isDone ? 'إعادة فتح المهمة' : 'تعليم كمكتملة ومُنجزة'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task.id)}
                            style={{
                              background: 'transparent',
                              color: '#ef4444',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title="حذف المهمة"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Rendered Executive Briefing Article for Project Manager */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid #bfdbfe',
            padding: '1.8rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2px solid #e2e8f0',
              paddingBottom: '0.85rem',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#1e3a8a' }}>
                  المقالة التقريرية الشاملة لمدير المشروع (آخر المستجدات الهندسية والتنفيذية)
                </h2>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  وثيقة الموقف المعتمد لمشروع طريق أوباري - غات (360 كم)
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleCopyArticle}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: articleCopied ? '#16a34a' : '#334155',
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  {articleCopied ? <Check size={15} /> : <Copy size={15} />}
                  <span>{articleCopied ? 'تم نسخ التقرير' : 'نسخ التقرير'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    background: '#1e3a8a',
                    border: 'none',
                    color: '#ffffff',
                    borderRadius: '8px',
                    padding: '0.5rem 1.15rem',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Printer size={15} />
                  <span>طباعة المقالة</span>
                </button>
              </div>
            </div>

            {/* Article Content */}
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              {renderFormattedText(executiveArticle)}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: INTERACTIVE CONSULTATION CHAT */}
      {/* ========================================================= */}
      {activeTab === 'chat' && (
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          height: '720px',
          overflow: 'hidden'
        }}>
          {/* Messages Feed */}
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
              onClick={() => handleSendMessage('طلب آخر المستجدات وتقرير الحالة لمدير المشروع')}
              style={{
                fontSize: '0.82rem',
                fontWeight: 900,
                padding: '7px 14px',
                borderRadius: '8px',
                border: '2px solid #0284c7',
                background: '#e0f2fe',
                color: '#0369a1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Newspaper size={15} />
              <span>طلب آخر المستجدات لمدير المشروع</span>
            </button>

            <button
              type="button"
              onClick={() => handleSendMessage('عرض وموقف المهام الإشرافية وتكليفات مدير المشروع')}
              style={{
                fontSize: '0.82rem',
                fontWeight: 900,
                padding: '7px 14px',
                borderRadius: '8px',
                border: '1.5px solid #2563eb',
                background: '#eff6ff',
                color: '#1e40af',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <UserCheck size={15} />
              <span>عرض المهام الإشرافية المفتوحة</span>
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
              ⛽ رصيد الوقود بالمواقع
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
          </div>

          {/* Chat File Attachment Chip */}
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
            borderTop: '1px solid #e2e8f0',
            padding: '0.85rem 1.25rem',
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
              title="رفع ملف إكسل، جدول، أو صورة للتحليل"
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
              placeholder={attachedFile ? "اكتب تعليمات التحليل لهذا الملف أو اضغط إرسال لتحليله فورياً..." : "اكتب سؤالك، أو اطلب مقالة لمدير المشروع، أو استفسر عن المهام الإشرافية..."}
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
            />

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
      )}

      {/* ========================================================= */}
      {/* TAB 3: DEDICATED FILE UPLOAD & ENGINEERING ANALYSIS CENTER */}
      {/* ========================================================= */}
      {activeTab === 'files' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Top Drag & Drop Zone */}
          <div
            onClick={() => centerFileInputRef.current?.click()}
            style={{
              background: '#f8fafc',
              border: '2px dashed #93c5fd',
              borderRadius: '16px',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#eff6ff';
              e.currentTarget.style.borderColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#93c5fd';
            }}
          >
            <input
              ref={centerFileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,.txt,.json,.pdf,image/*"
              style={{ display: 'none' }}
              onChange={handleCenterFileSelect}
            />

            <div style={{
              background: '#dbeafe',
              borderRadius: '50%',
              width: '64px',
              height: '64px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <UploadCloud size={32} color="#1d4ed8" />
            </div>

            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
              انقر هنا لرفع ملفات ومستندات الفحص لمساعد جهاز الإشراف
            </h3>
            <p style={{ margin: '0 0 1rem', fontSize: '0.86rem', color: '#64748b' }}>
              يدعم مصنفات الإكسل (XLSX, XLS)، الجداول (CSV)، مستندات PDF الهندسية، صور المواقع، وملفات التقارير النصية
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.74rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                Excel (.xlsx, .xls)
              </span>
              <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.74rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                جداول CSV
              </span>
              <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.74rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                مستندات PDF
              </span>
              <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.74rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                صور ومعاينات الموقع
              </span>
            </div>
          </div>

          {/* Analysis View if file selected */}
          {selectedFileForAnalysis && (
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1.5px solid #bfdbfe',
              padding: '1.5rem',
              boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1.5px solid #f1f5f9',
                paddingBottom: '0.85rem',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {selectedFileForAnalysis.type === 'excel' ? (
                    <FileSpreadsheet size={28} color="#16a34a" />
                  ) : selectedFileForAnalysis.isImage ? (
                    <ImageIcon size={28} color="#0284c7" />
                  ) : (
                    <FileText size={28} color="#ea580c" />
                  )}
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
                      {selectedFileForAnalysis.name}
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      الحجم: {selectedFileForAnalysis.size} | النوع: {selectedFileForAnalysis.type} {selectedFileForAnalysis.rowCount ? `| عدد الصفوف: ${selectedFileForAnalysis.rowCount}` : ''}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleRunFileAnalysis(selectedFileForAnalysis, 'تحليل كميات الإكسل ومطابقتها تعاقدياً مع وثيقة 29/10/2026')}
                    style={{
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    📊 مطابقة الكميات والأسعار تعاقدياً
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRunFileAnalysis(selectedFileForAnalysis, 'فحص محطات الرصف والتتابع الإنشائي للطبقات')}
                    style={{
                      background: '#f0fdf4',
                      color: '#166534',
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    🛣️ فحص محطات وتتابع الرصف
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRunFileAnalysis(selectedFileForAnalysis, 'صياغة تقرير إشرافي رسمي معتمد لمدير المشروع')}
                    style={{
                      background: '#1e3a8a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 14px',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    📄 إعداد تقرير إشرافي معتمد
                  </button>
                </div>
              </div>

              {/* Analysis Results Display */}
              {isAnalyzingFileCenter ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  جاري فحص وتحليل المستند واستخراج النتائج الهندسية...
                </div>
              ) : analysisResult ? (
                <div style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '1.25rem'
                }}>
                  <div style={{ fontWeight: 900, fontSize: '1rem', color: '#1e3a8a', marginBottom: '0.75rem' }}>
                    {analysisResult.title}
                  </div>
                  {renderFormattedText(analysisResult.content)}
                </div>
              ) : null}
            </div>
          )}

          {/* Uploaded Files History */}
          {uploadedFilesCenter.length > 0 && (
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '1.25rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}>
              <h4 style={{ margin: '0 0 0.85rem', fontSize: '0.96rem', fontWeight: 900, color: '#0f172a' }}>
                المستندات التي تم فحصها في هذه الجلسة ({uploadedFilesCenter.length})
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                {uploadedFilesCenter.map((f, fIdx) => (
                  <div
                    key={fIdx}
                    onClick={() => {
                      setSelectedFileForAnalysis(f);
                      const a = processLocalQuery(`فحص مستند ${f.name}`, f);
                      setAnalysisResult(a);
                    }}
                    style={{
                      background: selectedFileForAnalysis?.name === f.name ? '#eff6ff' : '#f8fafc',
                      border: selectedFileForAnalysis?.name === f.name ? '1.5px solid #3b82f6' : '1px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '0.85rem 1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {f.type === 'excel' ? <FileSpreadsheet size={20} color="#16a34a" /> : <FileText size={20} color="#0284c7" />}
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {f.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        {f.size}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default AIAgentView;
