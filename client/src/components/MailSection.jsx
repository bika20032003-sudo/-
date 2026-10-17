import React, { useState, useEffect, useMemo, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Mail,
  Send,
  Inbox,
  Printer,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  FileCheck,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Building2,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Download,
  Share2,
  Paperclip,
  Check,
  Shield,
  Phone,
  RefreshCw
} from 'lucide-react';
import ForceNameAutocomplete from './ForceNameAutocomplete';

// Default initial Outgoing Mail matching Image 1 & Image 3
const INITIAL_OUTGOING_MAIL = [
  {
    id: 1,
    code_no: '2026-002',
    record_number: '1',
    reference: '12/2026',
    reply_to_reference: '1.2/2026',
    reply_date: '10/10/2026',
    recipient: 'آمر المنطقة العسكرية الجنوبية',
    recipient_title: 'إلى السيد / آمر المنطقة العسكرية الجنوبية',
    date: '11/10/2026',
    subject: 'التنسيق الأمني وتسيير الدوريات بالمنطقة الجنوبية وتأمين مداخل مدينة أوباري',
    delivery_method: 'إلكتروني (منظومة/إيميل)',
    sender_employee: 'عبدالصمد',
    editor_employee: 'عبدالصمد',
    print_employee: 'عبدالصمد',
    status: 'delivered', // 'delivered' = تم التسليم (مغلق), 'pending' = قيد الإرسال, 'action_required'
    attachment_name: 'مذكرة_تنسيق_رسمية.pdf',
    letter_body: 'إليكم من حيث الاختصاص للتفضل بالعلم واتخاذ ما يلزم من إجراءات وفق ما تقتضيه المصلحة الأمنية العامة.',
    cc_list: [
      'السيد / وكيل وزارة الداخلية',
      'معالي / وزير الداخلية',
      'آمر المنطقة العسكرية الجنوبية',
      'المساعد للشؤون الأمنية',
      'الغرفة الأمنية المشتركة',
      'الإدارة العامة للتفتيش والمتابعة'
    ],
    signer_name: 'لواء / موسى سعد محمد',
    signer_title: 'مدير مديرية أمن أوباري',
    phone: '0915938137',
    email: 'Info@ubari-security.ly',
    created_at: '2026-10-11T10:30:00'
  },
  {
    id: 2,
    code_no: '2026-001',
    record_number: '150',
    reference: '10/2026',
    reply_to_reference: '',
    reply_date: '',
    recipient: 'مدير الإدارة العامة للتفتيش والمتابعة',
    recipient_title: 'إلى السيد / مدير الإدارة العامة للتفتيش والمتابعة',
    date: '08/10/2026',
    subject: 'إحالة التقرير الشهري لضبطيات الدوريات ومراكز الشرطة بالمديرية',
    delivery_method: 'يدوي / ورقي',
    sender_employee: 'عبدالصمد',
    editor_employee: 'عبدالصمد',
    print_employee: 'عبدالصمد',
    status: 'delivered',
    attachment_name: 'تقرير_شهري_أكتوبر.pdf',
    letter_body: 'نحيل إليكم طيه كشف التقرير الأمني الدوري لمديرية أمن أوباري، المتضمن كافة المحاضر والضبطيات ومناوبات الأجهزة الأمنية لشهر أكتوبر 2026م للتفضل بالاطلاع.',
    cc_list: [
      'السيد / وكيل وزارة الداخلية',
      'المساعد للشؤون الأمنية'
    ],
    signer_name: 'لواء / موسى سعد محمد',
    signer_title: 'مدير مديرية أمن أوباري',
    phone: '0915938137',
    email: 'Info@ubari-security.ly',
    created_at: '2026-10-08T09:15:00'
  }
];

// Default initial Incoming Mail matching Image 2
const INITIAL_INCOMING_MAIL = [
  {
    id: 1,
    incoming_reference: '1.2/2026',
    linked_reference: '12/2026',
    source_entity: 'آمر المنطقة العسكرية الجنوبية',
    date: '10/10/2026',
    time: '11:45',
    subject: 'طلب تنسيق مشترك بخصوص تأمين النقاط والمراكز الحيوية',
    receive_method: 'مناولة باليد (مراسل)',
    receiver_employee: 'عبدالصمد',
    status: 'replied', // 'in_progress' = تحت الإجراء, 'replied' = تم الرد والمتابعة, 'archived'
    attachment_name: 'كتاب_عسكري_وارد_1_2.pdf',
    created_at: '2026-10-10T11:45:00'
  },
  {
    id: 2,
    incoming_reference: '77/م.و/2026',
    linked_reference: '',
    source_entity: 'مكتب وكيل وزارة الداخلية للشؤون الفنية',
    date: '05/10/2026',
    time: '09:30',
    subject: 'تعليمات عاجلة بشأن جاهزية الاتصالات اللاسلكية والغرف المشتركة',
    receive_method: 'بريد إلكتروني رسمي',
    receiver_employee: 'عبدالصمد',
    status: 'in_progress',
    attachment_name: 'تعليمات_وكيل_الوزارة.pdf',
    created_at: '2026-10-05T09:30:00'
  }
];

// Security entities quick suggestions list
const ENTITY_SUGGESTIONS = [
  'السيد / آمر المنطقة العسكرية الجنوبية',
  'معالي / وزير الداخلية',
  'السيد / وكيل وزارة الداخلية',
  'المساعد للشؤون الأمنية - مديرية أمن أوباري',
  'الغرفة الأمنية المشتركة بالجنوب',
  'الإدارة العامة للتفتيش والمتابعة',
  'مركز شرطة أوباري المدينة',
  'مركز شرطة بنت بيه',
  'مركز شرطة الغريفة',
  'إدارة شؤون المرور والتراخيص أوباري',
  'غرفة السيطرة والاتصالات اللاسلكية',
  'فرع البحث الجنائي أوباري',
  'مصلحة الجوازات والجنسية أوباري'
];

export default function MailSection({ user, forceMembers = [] }) {
  // Navigation Tabs: 'outgoing', 'incoming', 'all_logs', 'letter_designer'
  const [activeTab, setActiveTab] = useState('outgoing');

  // Outgoing Mail State
  const [outgoingList, setOutgoingList] = useState(() => {
    const saved = localStorage.getItem('ubari_outgoing_mail');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_OUTGOING_MAIL;
  });

  // Incoming Mail State
  const [incomingList, setIncomingList] = useState(() => {
    const saved = localStorage.getItem('ubari_incoming_mail');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_INCOMING_MAIL;
  });

  // Outgoing Form State matching Image 1
  const [outgoingForm, setOutgoingForm] = useState({
    code_no: '2026-003',
    record_number: '151',
    reference: '13/2026',
    reply_to_reference: '',
    reply_date: '',
    recipient: '',
    date: new Date().toLocaleDateString('en-GB'), // e.g. 12/10/2026
    subject: '',
    delivery_method: 'إلكتروني (منظومة/إيميل)',
    sender_employee: (user && user.full_name) ? (user.full_name.includes('عبدالصمد') ? 'عبدالصمد' : user.full_name) : 'عبدالصمد',
    status: 'delivered', // تم التسليم (مغلق)
    attachment_name: ''
  });

  // Incoming Form State matching Image 2
  const [incomingForm, setIncomingForm] = useState({
    incoming_reference: '',
    linked_reference: '',
    source_entity: '',
    date: new Date().toLocaleDateString('en-GB'),
    time: new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' }),
    subject: '',
    receive_method: 'مناولة باليد (مراسل)',
    receiver_employee: (user && user.full_name) ? (user.full_name.includes('عبدالصمد') ? 'عبدالصمد' : user.full_name) : 'عبدالصمد',
    status: 'in_progress', // تحت الإجراء
    attachment_name: ''
  });

  // Active Letter for Preview & Print matching Image 3
  const [previewLetter, setPreviewLetter] = useState(INITIAL_OUTGOING_MAIL[0]);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [notificationMsg, setNotificationMsg] = useState('');

  // Register Print Modal State (Print all outgoing or incoming register)
  const [showRegisterPrintModal, setShowRegisterPrintModal] = useState(false);
  const [registerPrintType, setRegisterPrintType] = useState('outgoing'); // 'outgoing' or 'incoming'

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Recipient autocomplete suggestions visibility
  const [showRecipientSuggestions, setShowRecipientSuggestions] = useState(false);
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);

  // Generate QR code whenever preview letter changes
  useEffect(() => {
    if (previewLetter) {
      const qrPayload = `وزارة الداخلية - مديرية أمن أوباري\nرمز القيد: ${previewLetter.record_number}\nالكود: ${previewLetter.code_no}\nالإشاري: ${previewLetter.reference}\nالموافق: ${previewLetter.date}\nالموضوع: ${previewLetter.subject}\nالمحرر: ${previewLetter.editor_employee || 'عبدالصمد'}\nتحقق: https://moi.gov.ly/verify?code=${previewLetter.code_no}`;
      QRCode.toDataURL(qrPayload, {
        width: 145,
        margin: 1,
        color: { dark: '#0a192f', light: '#ffffff' }
      })
        .then(url => setQrCodeDataUrl(url))
        .catch(err => console.error('QR code generation error:', err));
    }
  }, [previewLetter]);

  // Save Outgoing Mail Handler (Image 1)
  const handleSaveOutgoing = (e) => {
    if (e) e.preventDefault();
    if (!outgoingForm.subject || !outgoingForm.recipient) {
      alert('يرجى كتابة الموضوع والجهة الموجه إليها بدقة');
      return;
    }

    const nextId = outgoingList.length > 0 ? Math.max(...outgoingList.map(o => o.id)) + 1 : 1;
    const newRecord = {
      ...outgoingForm,
      id: nextId,
      recipient_title: outgoingForm.recipient.startsWith('إلى') ? outgoingForm.recipient : `إلى السيد / ${outgoingForm.recipient}`,
      editor_employee: (user && user.full_name) ? (user.full_name.includes('عبدالصمد') ? 'عبدالصمد' : user.full_name) : 'عبدالصمد',
      print_employee: (user && user.full_name) ? (user.full_name.includes('عبدالصمد') ? 'عبدالصمد' : user.full_name) : 'عبدالصمد',
      signer_name: 'لواء / موسى سعد محمد',
      signer_title: 'مدير مديرية أمن أوباري',
      letter_body: outgoingForm.letter_body || 'إليكم من حيث الاختصاص للتفضل بالعلم واتخاذ ما يلزم من إجراءات وفق ما تقتضيه المصلحة الأمنية العامة.',
      cc_list: [
        'السيد / وكيل وزارة الداخلية',
        'معالي / وزير الداخلية',
        'آمر المنطقة العسكرية الجنوبية',
        'المساعد للشؤون الأمنية',
        'الغرفة الأمنية المشتركة',
        'الإدارة العامة للتفتيش والمتابعة'
      ],
      phone: '0915938137',
      email: 'Info@ubari-security.ly',
      created_at: new Date().toISOString()
    };

    const updatedList = [newRecord, ...outgoingList];
    setOutgoingList(updatedList);
    localStorage.setItem('ubari_outgoing_mail', JSON.stringify(updatedList));

    // Prepare next auto-increment codes
    const nextCodeNum = parseInt(outgoingForm.code_no.split('-')[1] || '1', 10) + 1;
    const nextRecordNum = parseInt(outgoingForm.record_number || '151', 10) + 1;

    setOutgoingForm({
      code_no: `2026-${String(nextCodeNum).padStart(3, '0')}`,
      record_number: String(nextRecordNum),
      reference: `${nextRecordNum}/2026`,
      reply_to_reference: '',
      reply_date: '',
      recipient: '',
      date: new Date().toLocaleDateString('en-GB'),
      subject: '',
      delivery_method: 'إلكتروني (منظومة/إيميل)',
      sender_employee: (user && user.full_name) ? (user.full_name.includes('عبدالصمد') ? 'عبدالصمد' : user.full_name) : 'عبدالصمد',
      status: 'delivered',
      attachment_name: ''
    });

    setNotificationMsg(`تم تقييد وحفظ البريد الصادر برقم قيد (${newRecord.record_number}) بنجاح`);
    setTimeout(() => setNotificationMsg(''), 4500);

    // Prompt user to preview the generated official letter
    setPreviewLetter(newRecord);
  };

  // Save Incoming Mail Handler (Image 2)
  const handleSaveIncoming = (e) => {
    if (e) e.preventDefault();
    if (!incomingForm.incoming_reference || !incomingForm.subject || !incomingForm.source_entity) {
      alert('يرجى إدخال الرقم الإشاري، الجهة الوارد منها، وموضوع البريد');
      return;
    }

    const nextId = incomingList.length > 0 ? Math.max(...incomingList.map(i => i.id)) + 1 : 1;
    const newRecord = {
      ...incomingForm,
      id: nextId,
      created_at: new Date().toISOString()
    };

    const updatedList = [newRecord, ...incomingList];
    setIncomingList(updatedList);
    localStorage.setItem('ubari_incoming_mail', JSON.stringify(updatedList));

    setIncomingForm({
      incoming_reference: '',
      linked_reference: '',
      source_entity: '',
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' }),
      subject: '',
      receive_method: 'مناولة باليد (مراسل)',
      receiver_employee: (user && user.full_name) ? (user.full_name.includes('عبدالصمد') ? 'عبدالصمد' : user.full_name) : 'عبدالصمد',
      status: 'in_progress',
      attachment_name: ''
    });

    setNotificationMsg(`تم توثيق وتقييد البريد الوارد برقم إشاري (${newRecord.incoming_reference}) بنجاح`);
    setTimeout(() => setNotificationMsg(''), 4500);
  };

  // Delete Mail Item
  const handleDeleteOutgoing = (id) => {
    if (confirm('هل أنت متأكد من حذف هذا السجل الصادر من المنظومة؟')) {
      const updated = outgoingList.filter(o => o.id !== id);
      setOutgoingList(updated);
      localStorage.setItem('ubari_outgoing_mail', JSON.stringify(updated));
    }
  };

  const handleDeleteIncoming = (id) => {
    if (confirm('هل أنت متأكد من حذف هذا السجل الوارد؟')) {
      const updated = incomingList.filter(i => i.id !== id);
      setIncomingList(updated);
      localStorage.setItem('ubari_incoming_mail', JSON.stringify(updated));
    }
  };

  // Open Letter Preview Modal matching Image 3
  const handleOpenLetterPreview = (letterItem) => {
    setPreviewLetter(letterItem);
    setShowLetterModal(true);
  };

  // Print Letter function
  const handlePrintOfficialLetter = () => {
    window.print();
  };

  // Filtered Outgoing List
  const filteredOutgoing = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return outgoingList.filter(item => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!term) return true;
      return (
        (item.subject && item.subject.toLowerCase().includes(term)) ||
        (item.recipient && item.recipient.toLowerCase().includes(term)) ||
        (item.reference && item.reference.toLowerCase().includes(term)) ||
        (item.code_no && item.code_no.toLowerCase().includes(term)) ||
        (item.record_number && String(item.record_number).includes(term))
      );
    });
  }, [outgoingList, searchTerm, statusFilter]);

  // Filtered Incoming List
  const filteredIncoming = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return incomingList.filter(item => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!term) return true;
      return (
        (item.subject && item.subject.toLowerCase().includes(term)) ||
        (item.source_entity && item.source_entity.toLowerCase().includes(term)) ||
        (item.incoming_reference && item.incoming_reference.toLowerCase().includes(term)) ||
        (item.linked_reference && item.linked_reference.toLowerCase().includes(term))
      );
    });
  }, [incomingList, searchTerm, statusFilter]);

  return (
    <div className="mail-section-container">
      {/* Top Banner & Sub-Tabs Navigation */}
      <div className="mail-header-tabs-bar">
        <div className="mail-title-badge-area">
          <div className="mail-gold-indicator" />
          <div className="mail-title-group">
            <h1>إدارة البريد والمراسلات الرسمية</h1>
            <span>مديرية أمن أوباري | التوثيق الرقمي للصادر والوارد وتصميم الرسائل الرسمية المعتمدة</span>
          </div>
        </div>

        <div className="mail-nav-tabs">
          <button
            type="button"
            className={`mail-tab-btn ${activeTab === 'outgoing' ? 'active' : ''}`}
            onClick={() => setActiveTab('outgoing')}
          >
            <Send size={16} />
            <span>سجل البريد الصادر</span>
            <span className="tab-count-pill">{outgoingList.length}</span>
          </button>

          <button
            type="button"
            className={`mail-tab-btn ${activeTab === 'incoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('incoming')}
          >
            <Inbox size={16} />
            <span>سجل البريد الوارد</span>
            <span className="tab-count-pill">{incomingList.length}</span>
          </button>

          <button
            type="button"
            className={`mail-tab-btn ${activeTab === 'letter_designer' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('letter_designer');
              if (outgoingList.length > 0) setPreviewLetter(outgoingList[0]);
            }}
          >
            <FileText size={16} />
            <span>نموذج الرسالة الرسمية (معاينة وطباعة)</span>
          </button>
        </div>
      </div>

      {/* Floating Notification */}
      {notificationMsg && (
        <div className="moi-success-notification">
          <CheckCircle2 size={18} color="#16a34a" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. OUTGOING MAIL TAB (Exact match to Image 1)                            */}
      {/* ========================================================================= */}
      {activeTab === 'outgoing' && (
        <div className="mail-tab-content-wrapper">
          {/* Outgoing Form Card matching Image 1 */}
          <div className="mail-official-card">
            {/* Header row with title and print all button */}
            <div className="mail-card-header-row">
              <div className="mail-section-title-with-bar">
                <span className="orange-vertical-bar" />
                <div className="section-title-text">
                  <h3>سجل البريد الصادر</h3>
                  <div className="official-feather-badge">📯</div>
                </div>
              </div>

              <button
                type="button"
                className="btn-print-full-register"
                onClick={() => {
                  setRegisterPrintType('outgoing');
                  setShowRegisterPrintModal(true);
                }}
              >
                <Printer size={15} />
                <span>طباعة كل السجل الصادر</span>
              </button>
            </div>

            {/* Form matching Image 1 grid */}
            <form onSubmit={handleSaveOutgoing} className="official-mail-form">
              {/* Row 1: Code No, رقم القيد, الرقم الإشاري, رد على */}
              <div className="form-fields-grid-4">
                {/* 1. Code No */}
                <div className="mail-input-group">
                  <label>الكود (Code No):</label>
                  <input
                    type="text"
                    className="mail-input input-blue-border"
                    placeholder="مثال: 001-2026"
                    value={outgoingForm.code_no}
                    onChange={(e) => setOutgoingForm({ ...outgoingForm, code_no: e.target.value })}
                    required
                  />
                </div>

                {/* 2. رقم القيد */}
                <div className="mail-input-group">
                  <label>رقم القيد:</label>
                  <input
                    type="text"
                    className="mail-input input-red-border"
                    placeholder="مثال: 150"
                    value={outgoingForm.record_number}
                    onChange={(e) => setOutgoingForm({ ...outgoingForm, record_number: e.target.value })}
                    required
                  />
                </div>

                {/* 3. الرقم الإشاري */}
                <div className="mail-input-group">
                  <label>الرقم الإشاري:</label>
                  <input
                    type="text"
                    className="mail-input"
                    placeholder="مثال: 12/2026"
                    value={outgoingForm.reference}
                    onChange={(e) => setOutgoingForm({ ...outgoingForm, reference: e.target.value })}
                    required
                  />
                </div>

                {/* 4. رد على (إشاري الوارد) */}
                <div className="mail-input-group">
                  <label>رد على (إشاري الوارد):</label>
                  <input
                    type="text"
                    className="mail-input"
                    placeholder="اختياري: يُترك فارغاً إن لم يكن رداً..."
                    value={outgoingForm.reply_to_reference}
                    onChange={(e) => setOutgoingForm({ ...outgoingForm, reply_to_reference: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 2: الجهة الموجه إليها, الموافق (التاريخ) */}
              <div className="form-fields-grid-2" style={{ marginTop: '16px' }}>
                {/* الجهة الموجه إليها مع بحث ذكي */}
                <div className="mail-input-group position-relative">
                  <label>الجهة الموجه إليها:</label>
                  <input
                    type="text"
                    className="mail-input input-smart-search"
                    placeholder="الجهة الموجه إليها (بحث ذكي...)"
                    value={outgoingForm.recipient}
                    onChange={(e) => {
                      setOutgoingForm({ ...outgoingForm, recipient: e.target.value });
                      setShowRecipientSuggestions(true);
                    }}
                    onFocus={() => setShowRecipientSuggestions(true)}
                    required
                  />
                  {showRecipientSuggestions && (
                    <div className="smart-entity-suggestions">
                      <div className="suggestions-header">الجهات الأمنية والقيادية المقترحة:</div>
                      {ENTITY_SUGGESTIONS.map((item, idx) => (
                        <div
                          key={idx}
                          className="suggestion-row"
                          onClick={() => {
                            setOutgoingForm({ ...outgoingForm, recipient: item });
                            setShowRecipientSuggestions(false);
                          }}
                        >
                          <Building2 size={13} color="#1e3a8a" />
                          <span>{item}</span>
                        </div>
                      ))}
                      <div className="suggestions-footer" onClick={() => setShowRecipientSuggestions(false)}>إغلاق القائمة ✕</div>
                    </div>
                  )}
                </div>

                {/* الموافق (التاريخ) */}
                <div className="mail-input-group">
                  <label>الموافق (التاريخ):</label>
                  <div className="date-input-wrap">
                    <input
                      type="text"
                      className="mail-input"
                      placeholder="فنس/رهش/موي"
                      value={outgoingForm.date}
                      onChange={(e) => setOutgoingForm({ ...outgoingForm, date: e.target.value })}
                      required
                    />
                    <Calendar size={16} className="date-icon-inside" />
                  </div>
                </div>
              </div>

              {/* Row 3: بخصوص (الموضوع) */}
              <div className="mail-input-group" style={{ marginTop: '16px' }}>
                <label>بخصوص (الموضوع):</label>
                <input
                  type="text"
                  className="mail-input mail-subject-input"
                  placeholder="اكتب الموضوع بدقة..."
                  value={outgoingForm.subject}
                  onChange={(e) => setOutgoingForm({ ...outgoingForm, subject: e.target.value })}
                  required
                />
              </div>

              {/* Row 4: طريقة الإرسال, الموظف المرسل, حالة التسليم, اختيار ملف */}
              <div className="form-fields-grid-4" style={{ marginTop: '16px', alignItems: 'flex-end' }}>
                {/* طريقة الإرسال */}
                <div className="mail-input-group">
                  <label>طريقة الإرسال:</label>
                  <select
                    className="mail-select"
                    value={outgoingForm.delivery_method}
                    onChange={(e) => setOutgoingForm({ ...outgoingForm, delivery_method: e.target.value })}
                  >
                    <option value="إلكتروني (منظومة/إيميل)">إلكتروني (منظومة/إيميل)</option>
                    <option value="يدوي / ورقي">يدوي / ورقي بموجب كشف</option>
                    <option value="بريد رسمي مسجل">بريد رسمي مسجل</option>
                    <option value="برقية لاسلكية / فاكس">برقية لاسلكية / فاكس</option>
                  </select>
                </div>

                {/* الموظف المرسل */}
                <div className="mail-input-group">
                  <label>الموظف المرسل:</label>
                  <ForceNameAutocomplete
                    value={outgoingForm.sender_employee}
                    onChange={(val) => setOutgoingForm({ ...outgoingForm, sender_employee: val })}
                    onSelect={(m) => setOutgoingForm({ ...outgoingForm, sender_employee: m.name })}
                    forceMembers={forceMembers}
                    placeholder="اكتب أول حرف لعرض الأسماء المطابقة..."
                    required
                  />
                </div>

                {/* حالة التسليم */}
                <div className="mail-input-group">
                  <label>حالة التسليم:</label>
                  <select
                    className="mail-select status-select-green"
                    value={outgoingForm.status}
                    onChange={(e) => setOutgoingForm({ ...outgoingForm, status: e.target.value })}
                  >
                    <option value="delivered">✅ تم التسليم (مغلق)</option>
                    <option value="pending">⏳ قيد الإرسال والمتابعة</option>
                    <option value="action_required">⚡ محال لاتخاذ إجراء</option>
                  </select>
                </div>

                {/* اختيار ملف */}
                <div className="mail-input-group">
                  <label>المرفقات والملفات:</label>
                  <div className="file-attachment-box">
                    <label className="btn-choose-file">
                      <span>اختيار ملف</span>
                      <input
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setOutgoingForm({ ...outgoingForm, attachment_name: e.target.files[0].name });
                          }
                        }}
                      />
                    </label>
                    <span className="file-chosen-status">
                      {outgoingForm.attachment_name || 'لم يتم اختيار أي ملف'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="mail-form-submit-row" style={{ marginTop: '22px' }}>
                <button type="submit" className="btn-save-record">
                  <Send size={16} />
                  <span>حفظ وتقييد السجل</span>
                </button>

                <button
                  type="button"
                  className="btn-create-official-letter"
                  onClick={() => {
                    const tempLetter = {
                      ...outgoingForm,
                      id: Date.now(),
                      recipient_title: outgoingForm.recipient.startsWith('إلى') ? outgoingForm.recipient : `إلى السيد / ${outgoingForm.recipient || 'آمر المنطقة العسكرية الجنوبية'}`,
                      editor_employee: outgoingForm.sender_employee || 'عبدالصمد',
                      print_employee: outgoingForm.sender_employee || 'عبدالصمد',
                      signer_name: 'لواء / موسى سعد محمد',
                      signer_title: 'مدير مديرية أمن أوباري',
                      letter_body: outgoingForm.letter_body || 'إليكم من حيث الاختصاص للتفضل بالعلم واتخاذ ما يلزم من إجراءات وفق ما تقتضيه المصلحة الأمنية العامة.',
                      cc_list: [
                        'السيد / وكيل وزارة الداخلية',
                        'معالي / وزير الداخلية',
                        'آمر المنطقة العسكرية الجنوبية',
                        'المساعد للشؤون الأمنية',
                        'الغرفة الأمنية المشتركة',
                        'الإدارة العامة للتفتيش والمتابعة'
                      ],
                      phone: '0915938137',
                      email: 'Info@ubari-security.ly'
                    };
                    handleOpenLetterPreview(tempLetter);
                  }}
                >
                  <FileText size={16} />
                  <span>معاينة وطباعة الرسالة الرسمية الصادرة (النموذج المعتمد)</span>
                </button>
              </div>
            </form>
          </div>

          {/* Outgoing Mail Registry Table */}
          <div className="mail-table-card">
            <div className="mail-table-header-bar">
              <div className="table-title-area">
                <h4>جدول قيود البريد الصادر المعتمد ({filteredOutgoing.length})</h4>
                <span>سجل المراسلات الصادرة عن مديرية أمن أوباري</span>
              </div>

              <div className="table-search-filters">
                <div className="search-input-wrapper">
                  <Search size={14} />
                  <input
                    type="text"
                    placeholder="بحث برقم القيد، الإشاري، الجهة، أو الموضوع..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  className="filter-select-mini"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">كافة الحالات</option>
                  <option value="delivered">تم التسليم (مغلق)</option>
                  <option value="pending">قيد الإرسال</option>
                </select>
              </div>
            </div>

            <div className="table-responsive-wrapper">
              <table className="mail-official-table">
                <thead>
                  <tr>
                    <th>الكود</th>
                    <th>رقم القيد</th>
                    <th>الرقم الإشاري</th>
                    <th>الجهة الموجه إليها</th>
                    <th>الموضوع</th>
                    <th>الموافق</th>
                    <th>طريقة الإرسال</th>
                    <th>المحرر</th>
                    <th>الحالة</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOutgoing.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="code-badge-blue">{item.code_no}</span>
                      </td>
                      <td>
                        <span className="record-badge-red">{item.record_number}</span>
                      </td>
                      <td style={{ fontWeight: 700, color: '#0a192f' }}>{item.reference}</td>
                      <td style={{ fontWeight: 700, color: '#1e3a8a' }}>{item.recipient}</td>
                      <td className="subject-cell" title={item.subject}>{item.subject}</td>
                      <td>{item.date}</td>
                      <td>
                        <span className="method-pill">{item.delivery_method}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{item.sender_employee || 'عبدالصمد'}</td>
                      <td>
                        <span className={`status-pill ${item.status === 'delivered' ? 'active' : 'suspended'}`}>
                          {item.status === 'delivered' ? 'تم التسليم (مغلق)' : 'قيد المتابعة'}
                        </span>
                      </td>
                      <td>
                        <div className="table-action-buttons">
                          <button
                            type="button"
                            className="btn-action-preview"
                            title="معاينة وطباعة الرسالة الرسمية"
                            onClick={() => handleOpenLetterPreview(item)}
                          >
                            <Printer size={13} />
                            <span>الرسالة</span>
                          </button>
                          <button
                            type="button"
                            className="btn-action-delete"
                            title="حذف القيد"
                            onClick={() => handleDeleteOutgoing(item.id)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredOutgoing.length === 0 && (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                        لا توجد سجلات بريد صادر مطابقة لمعايير البحث الحالية
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. INCOMING MAIL TAB (Exact match to Image 2)                            */}
      {/* ========================================================================= */}
      {activeTab === 'incoming' && (
        <div className="mail-tab-content-wrapper">
          {/* Incoming Form Card matching Image 2 */}
          <div className="mail-official-card">
            {/* Header row with title and print all button */}
            <div className="mail-card-header-row">
              <div className="mail-section-title-with-bar">
                <span className="orange-vertical-bar" />
                <div className="section-title-text">
                  <h3>سجل البريد الوارد</h3>
                  <div className="official-feather-badge">📥</div>
                </div>
              </div>

              <button
                type="button"
                className="btn-print-full-register"
                onClick={() => {
                  setRegisterPrintType('incoming');
                  setShowRegisterPrintModal(true);
                }}
              >
                <Printer size={15} />
                <span>طباعة كل السجل الوارد</span>
              </button>
            </div>

            {/* Form matching Image 2 grid */}
            <form onSubmit={handleSaveIncoming} className="official-mail-form">
              {/* Row 1: رقم إشاري, الرقم الإشاري للرسالة المرتبطة (للردود), الجهة الوارد منها, التاريخ / الموافق */}
              <div className="form-fields-grid-4">
                {/* 1. رقم إشاري */}
                <div className="mail-input-group">
                  <label>رقم إشاري:</label>
                  <input
                    type="text"
                    className="mail-input input-blue-border"
                    placeholder="أدخل الرقم..."
                    value={incomingForm.incoming_reference}
                    onChange={(e) => setIncomingForm({ ...incomingForm, incoming_reference: e.target.value })}
                    required
                  />
                </div>

                {/* 2. الرقم الإشاري للرسالة المرتبطة (للردود) */}
                <div className="mail-input-group">
                  <label>الرقم الإشاري للرسالة المرتبطة (للردود):</label>
                  <input
                    type="text"
                    className="mail-input"
                    placeholder="الرقم الإشاري للرسالة المرتبطة (للردود)"
                    value={incomingForm.linked_reference}
                    onChange={(e) => setIncomingForm({ ...incomingForm, linked_reference: e.target.value })}
                  />
                </div>

                {/* 3. الجهة الوارد منها (بحث ذكي...) */}
                <div className="mail-input-group position-relative">
                  <label>الجهة الوارد منها (بحث ذكي...):</label>
                  <input
                    type="text"
                    className="mail-input input-smart-search input-blue-border"
                    placeholder="الجهة الوارد منها (بحث ذكي...)"
                    value={incomingForm.source_entity}
                    onChange={(e) => {
                      setIncomingForm({ ...incomingForm, source_entity: e.target.value });
                      setShowSourceSuggestions(true);
                    }}
                    onFocus={() => setShowSourceSuggestions(true)}
                    required
                  />
                  {showSourceSuggestions && (
                    <div className="smart-entity-suggestions">
                      <div className="suggestions-header">الجهات الرسمية المقترحة:</div>
                      {ENTITY_SUGGESTIONS.map((item, idx) => (
                        <div
                          key={idx}
                          className="suggestion-row"
                          onClick={() => {
                            setIncomingForm({ ...incomingForm, source_entity: item.replace('إلى السيد / ', '').replace('إلى ', '') });
                            setShowSourceSuggestions(false);
                          }}
                        >
                          <Building2 size={13} color="#1e3a8a" />
                          <span>{item.replace('إلى السيد / ', '').replace('إلى ', '')}</span>
                        </div>
                      ))}
                      <div className="suggestions-footer" onClick={() => setShowSourceSuggestions(false)}>إغلاق القائمة ✕</div>
                    </div>
                  )}
                </div>

                {/* 4. التاريخ / الموافق */}
                <div className="mail-input-group">
                  <label>الموافق (التاريخ):</label>
                  <div className="date-input-wrap">
                    <input
                      type="text"
                      className="mail-input"
                      placeholder="فنس/رهش/موي"
                      value={incomingForm.date}
                      onChange={(e) => setIncomingForm({ ...incomingForm, date: e.target.value })}
                      required
                    />
                    <Calendar size={16} className="date-icon-inside" />
                  </div>
                </div>
              </div>

              {/* Row 2: الموضوع */}
              <div className="mail-input-group" style={{ marginTop: '16px' }}>
                <label>الموضوع:</label>
                <input
                  type="text"
                  className="mail-input mail-subject-input"
                  placeholder="الموضوع"
                  value={incomingForm.subject}
                  onChange={(e) => setIncomingForm({ ...incomingForm, subject: e.target.value })}
                  required
                />
              </div>

              {/* Row 3: طريقة الاستلام, اسم الموظف المستلم, التاريخ والوقت, حالة الإجراء */}
              <div className="form-fields-grid-4" style={{ marginTop: '16px', alignItems: 'flex-end' }}>
                {/* طريقة الاستلام */}
                <div className="mail-input-group">
                  <label>طريقة الاستلام:</label>
                  <select
                    className="mail-select"
                    value={incomingForm.receive_method}
                    onChange={(e) => setIncomingForm({ ...incomingForm, receive_method: e.target.value })}
                  >
                    <option value="مناولة باليد (مراسل)">مناولة باليد (مراسل)</option>
                    <option value="بريد إلكتروني رسمي">بريد إلكتروني رسمي</option>
                    <option value="برقية لاسلكية / فاكس">برقية لاسلكية / فاكس</option>
                    <option value="بريد رسمي مسجل">بريد رسمي مسجل</option>
                  </select>
                </div>

                {/* اسم الموظف المستلم */}
                <div className="mail-input-group">
                  <label>اسم الموظف المستلم:</label>
                  <ForceNameAutocomplete
                    value={incomingForm.receiver_employee}
                    onChange={(val) => setIncomingForm({ ...incomingForm, receiver_employee: val })}
                    onSelect={(m) => setIncomingForm({ ...incomingForm, receiver_employee: m.name })}
                    forceMembers={forceMembers}
                    placeholder="اكتب أول حرف لعرض الأسماء المطابقة..."
                    required
                  />
                </div>

                {/* التاريخ والوقت */}
                <div className="mail-input-group">
                  <label>التاريخ والوقت:</label>
                  <div className="date-input-wrap">
                    <input
                      type="text"
                      className="mail-input"
                      placeholder="فنس/رهش/موي --:--"
                      value={`${incomingForm.date} ${incomingForm.time}`}
                      onChange={(e) => {
                        const parts = e.target.value.split(' ');
                        setIncomingForm({ ...incomingForm, date: parts[0] || incomingForm.date, time: parts[1] || incomingForm.time });
                      }}
                    />
                    <Clock size={16} className="date-icon-inside" />
                  </div>
                </div>

                {/* حالة الإجراء */}
                <div className="mail-input-group">
                  <label>حالة الإجراء:</label>
                  <select
                    className="mail-select status-select-amber"
                    value={incomingForm.status}
                    onChange={(e) => setIncomingForm({ ...incomingForm, status: e.target.value })}
                  >
                    <option value="in_progress">⏳ تحت الإجراء</option>
                    <option value="replied">✅ تم الرد والمتابعة</option>
                    <option value="referred">↗️ محال لسيادة اللواء</option>
                    <option value="archived">📁 محفوظ بالأرشيف</option>
                  </select>
                </div>
              </div>

              {/* Row 4: المرفقات */}
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-start' }}>
                <div className="file-attachment-box" style={{ maxWidth: '380px' }}>
                  <label className="btn-choose-file">
                    <span>اختيار ملف</span>
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setIncomingForm({ ...incomingForm, attachment_name: e.target.files[0].name });
                        }
                      }}
                    />
                  </label>
                  <span className="file-chosen-status">
                    {incomingForm.attachment_name || 'لم يتم اختيار أي ملف'}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mail-form-submit-row" style={{ marginTop: '22px' }}>
                <button type="submit" className="btn-save-record">
                  <Inbox size={16} />
                  <span>حفظ وتقييد</span>
                </button>
              </div>
            </form>
          </div>

          {/* Incoming Mail Registry Table */}
          <div className="mail-table-card">
            <div className="mail-table-header-bar">
              <div className="table-title-area">
                <h4>جدول قيود البريد الوارد المعتمد ({filteredIncoming.length})</h4>
                <span>سجل المراسلات الواردة إلى مديرية أمن أوباري</span>
              </div>

              <div className="table-search-filters">
                <div className="search-input-wrapper">
                  <Search size={14} />
                  <input
                    type="text"
                    placeholder="بحث برقم الإشاري، الجهة، أو الموضوع..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="table-responsive-wrapper">
              <table className="mail-official-table">
                <thead>
                  <tr>
                    <th>الرقم الإشاري</th>
                    <th>الرسالة المرتبطة</th>
                    <th>الجهة الوارد منها</th>
                    <th>الموضوع</th>
                    <th>تاريخ الاستلام</th>
                    <th>طريقة الاستلام</th>
                    <th>المستلم</th>
                    <th>حالة الإجراء</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncoming.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="code-badge-blue">{item.incoming_reference}</span>
                      </td>
                      <td style={{ color: item.linked_reference ? '#1e3a8a' : '#94a3b8' }}>
                        {item.linked_reference || '—'}
                      </td>
                      <td style={{ fontWeight: 700, color: '#1e3a8a' }}>{item.source_entity}</td>
                      <td className="subject-cell" title={item.subject}>{item.subject}</td>
                      <td>{item.date} {item.time}</td>
                      <td>
                        <span className="method-pill">{item.receive_method}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{item.receiver_employee || 'عبدالصمد'}</td>
                      <td>
                        <span className={`status-pill ${item.status === 'replied' ? 'active' : 'suspended'}`}>
                          {item.status === 'replied' ? 'تم الرد' : 'تحت الإجراء'}
                        </span>
                      </td>
                      <td>
                        <div className="table-action-buttons">
                          <button
                            type="button"
                            className="btn-action-delete"
                            title="حذف القيد"
                            onClick={() => handleDeleteIncoming(item.id)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredIncoming.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                        لا توجد سجلات بريد وارد مطابقة
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. OFFICIAL LETTER DESIGNER & PREVIEW TAB (Exact match to Image 3)        */}
      {/* ========================================================================= */}
      {activeTab === 'letter_designer' && (
        <div className="letter-designer-view-wrapper">
          <div className="designer-top-toolbar">
            <div className="designer-toolbar-info">
              <FileCheck size={18} color="#1e3a8a" />
              <div>
                <h4>معاينة وطباعة الرسالة الرسمية المعتمدة</h4>
                <span>نموذج الكتاب الرسمي الصادر عن سيادة اللواء مدير مديرية أمن أوباري</span>
              </div>
            </div>

            <div className="designer-actions">
              <button
                type="button"
                className="btn-toolbar-print"
                onClick={handlePrintOfficialLetter}
              >
                <Printer size={16} />
                <span>طباعة الرسالة الرسمية (A4)</span>
              </button>
            </div>
          </div>

          {/* Letter Editor Controls */}
          <div className="letter-customizer-panel">
            <div className="panel-title">تعديل بيانات الرسالة المباشرة:</div>
            <div className="customizer-inputs-grid">
              <div>
                <label>رقم القيد:</label>
                <input
                  type="text"
                  value={previewLetter.record_number || '1'}
                  onChange={(e) => setPreviewLetter({ ...previewLetter, record_number: e.target.value })}
                />
              </div>
              <div>
                <label>كود الرسالة (Code No):</label>
                <input
                  type="text"
                  value={previewLetter.code_no || '2026-002'}
                  onChange={(e) => setPreviewLetter({ ...previewLetter, code_no: e.target.value })}
                />
              </div>
              <div>
                <label>الرقم الإشاري:</label>
                <input
                  type="text"
                  value={previewLetter.reference || '12/2026'}
                  onChange={(e) => setPreviewLetter({ ...previewLetter, reference: e.target.value })}
                />
              </div>
              <div>
                <label>التاريخ (الموافق):</label>
                <input
                  type="text"
                  value={previewLetter.date || '11/10/2026'}
                  onChange={(e) => setPreviewLetter({ ...previewLetter, date: e.target.value })}
                />
              </div>
              <div>
                <label>إشارة إلى مراسلتكم رقم:</label>
                <input
                  type="text"
                  value={previewLetter.reply_to_reference || '1.2/2026'}
                  onChange={(e) => setPreviewLetter({ ...previewLetter, reply_to_reference: e.target.value })}
                />
              </div>
              <div>
                <label>بتاريخ:</label>
                <input
                  type="text"
                  value={previewLetter.reply_date || '10/10/2026'}
                  onChange={(e) => setPreviewLetter({ ...previewLetter, reply_date: e.target.value })}
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label>المخاطب الرئيسي (إلى السيد / ...):</label>
                <input
                  type="text"
                  value={previewLetter.recipient_title || 'إلى السيد / آمر المنطقة العسكرية الجنوبية'}
                  onChange={(e) => setPreviewLetter({ ...previewLetter, recipient_title: e.target.value })}
                />
              </div>
              <div style={{ gridColumn: 'span 4' }}>
                <label>بخصوص (الموضوع):</label>
                <input
                  type="text"
                  value={previewLetter.subject || 'التنسيق الأمني المشترك'}
                  onChange={(e) => setPreviewLetter({ ...previewLetter, subject: e.target.value })}
                />
              </div>
              <div style={{ gridColumn: 'span 4' }}>
                <label>نص الرسالة والتعليمات:</label>
                <textarea
                  rows={3}
                  value={previewLetter.letter_body || ''}
                  onChange={(e) => setPreviewLetter({ ...previewLetter, letter_body: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* THE OFFICIAL LETTER PREVIEW (EXACT REPLICA OF IMAGE 3) */}
          <div className="official-letter-sheet-container">
            <OfficialLetterSheet letter={previewLetter} qrUrl={qrCodeDataUrl} />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: PREVIEW & PRINT OFFICIAL LETTER (Image 3)                       */}
      {/* ========================================================================= */}
      {showLetterModal && previewLetter && (
        <div className="moi-modal-overlay" onClick={() => setShowLetterModal(false)}>
          <div className="moi-modal-box letter-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="moi-modal-header letter-modal-topbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="#1e3a8a" />
                <h3 style={{ margin: 0 }}>معاينة وطباعة الرسالة الرسمية الصادرة</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-toolbar-save"
                  onClick={handlePrintOfficialLetter}
                  style={{ padding: '6px 14px', fontSize: '13px' }}
                >
                  <Printer size={15} />
                  <span>طباعة الرسالة فوراً</span>
                </button>
                <button
                  type="button"
                  className="moi-modal-close-btn"
                  onClick={() => setShowLetterModal(false)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="letter-modal-body">
              <OfficialLetterSheet letter={previewLetter} qrUrl={qrCodeDataUrl} />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: PRINT FULL REGISTER (طباعة كل السجل)                             */}
      {/* ========================================================================= */}
      {showRegisterPrintModal && (
        <div className="moi-modal-overlay" onClick={() => setShowRegisterPrintModal(false)}>
          <div className="moi-modal-box register-print-box" onClick={(e) => e.stopPropagation()}>
            <div className="moi-modal-header">
              <h3>
                <Printer size={18} />
                <span>
                  {registerPrintType === 'outgoing' ? 'طباعة كشف سجل البريد الصادر الكامل' : 'طباعة كشف سجل البريد الوارد الكامل'}
                </span>
              </h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-toolbar-save"
                  onClick={() => window.print()}
                >
                  <Printer size={15} />
                  <span>طباعة الكشف</span>
                </button>
                <button
                  type="button"
                  className="moi-modal-close-btn"
                  onClick={() => setShowRegisterPrintModal(false)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="register-print-document" id="printable-register-area">
              <div className="register-header-official">
                <div className="header-side-right">
                  <h3>دولة ليبيا</h3>
                  <h4>وزارة الداخلية</h4>
                  <p>مديرية أمن أوباري</p>
                </div>
                <div className="header-logo-center">
                  <img src="./moi-logo.png" onError={(e) => { e.currentTarget.src = './moi-logo.png'; }} alt="شعار وزارة الداخلية" />
                </div>
                <div className="header-side-left">
                  <p>تاريخ الاستخراج: {new Date().toLocaleDateString('ar-LY')}</p>
                  <p>القائم بالطباعة: {user?.full_name || 'عبدالصمد'}</p>
                  <p>الحالة: سجل رسمي معتمد</p>
                </div>
              </div>

              <div className="register-title-banner">
                <h2>{registerPrintType === 'outgoing' ? 'كشف سجل البريد الصادر الرسمي' : 'كشف سجل البريد الوارد الرسمي'}</h2>
                <p>القيود المسجلة بمديرية أمن أوباري لعام 2026م</p>
              </div>

              <table className="register-print-table">
                <thead>
                  {registerPrintType === 'outgoing' ? (
                    <tr>
                      <th>#</th>
                      <th>الكود</th>
                      <th>رقم القيد</th>
                      <th>الرقم الإشاري</th>
                      <th>الجهة الموجه إليها</th>
                      <th>الموضوع</th>
                      <th>الموافق</th>
                      <th>طريقة الإرسال</th>
                      <th>المحرر</th>
                      <th>الحالة</th>
                    </tr>
                  ) : (
                    <tr>
                      <th>#</th>
                      <th>الرقم الإشاري</th>
                      <th>المرتبطة</th>
                      <th>الجهة الوارد منها</th>
                      <th>الموضوع</th>
                      <th>تاريخ الاستلام</th>
                      <th>طريقة الاستلام</th>
                      <th>المستلم</th>
                      <th>الحالة</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {(registerPrintType === 'outgoing' ? outgoingList : incomingList).map((row, idx) => (
                    <tr key={row.id}>
                      <td>{idx + 1}</td>
                      {registerPrintType === 'outgoing' ? (
                        <>
                          <td>{row.code_no}</td>
                          <td>{row.record_number}</td>
                          <td>{row.reference}</td>
                          <td>{row.recipient}</td>
                          <td>{row.subject}</td>
                          <td>{row.date}</td>
                          <td>{row.delivery_method}</td>
                          <td>{row.sender_employee}</td>
                          <td>{row.status === 'delivered' ? 'تم التسليم' : 'قيد المتابعة'}</td>
                        </>
                      ) : (
                        <>
                          <td>{row.incoming_reference}</td>
                          <td>{row.linked_reference || '—'}</td>
                          <td>{row.source_entity}</td>
                          <td>{row.subject}</td>
                          <td>{row.date} {row.time}</td>
                          <td>{row.receive_method}</td>
                          <td>{row.receiver_employee}</td>
                          <td>{row.status === 'replied' ? 'تم الرد' : 'تحت الإجراء'}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="register-footer-signatures">
                <div className="sig-block">
                  <p>المحرر والموثق</p>
                  <span>{user?.full_name || 'عبدالصمد موسى محمد الشيخ'}</span>
                </div>
                <div className="sig-block">
                  <p>رئيس قسم المحفوظات والبريد</p>
                  <span>رائد شرطة / عمر مصطفى الفاسي</span>
                </div>
                <div className="sig-block">
                  <p>يعتمد مدير مديرية أمن أوباري</p>
                  <span>لواء / موسى سعد محمد البدين</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: OFFICIAL LETTER SHEET (Exact Replica of Image 3)
// =========================================================================
function OfficialLetterSheet({ letter, qrUrl }) {
  if (!letter) return null;

  return (
    <div className="official-a4-letter-sheet" id="official-letter-to-print">
      {/* Top Header Block matching Image 3 */}
      <header className="a4-letter-header">
        <div className="header-lang-right">
          <h2 className="title-moi-ar">وزارة الداخليـــــــــــــــــــة</h2>
          <h3 className="title-dir-ar">مديرية أمن أوبـــــــــــــــــاري</h3>
        </div>

        <div className="header-emblem-center">
          <img src="./moi-logo.png" onError={(e) => { e.currentTarget.src = './moi-logo.png'; }} alt="شعار مديرية أمن أوباري" className="emblem-img" />
        </div>

        <div className="header-lang-left">
          <h2 className="title-moi-en">Ministry of Interior</h2>
          <h3 className="title-dir-en">Ubari Security Directorate</h3>
        </div>
      </header>

      {/* QR Code and Metadata Table Row matching Image 3 */}
      <div className="a4-metadata-qr-row">
        {/* Table on the right (1st child in RTL) */}
        <div className="official-meta-table-box">
          <div className="meta-row">
            <div className="meta-cell record-cell">
              <span className="meta-lbl">القيـــــد:</span>
              <span className="meta-val" style={{ unicodeBidi: 'plaintext' }}>{letter.record_number || '1'}</span>
            </div>
            <div className="meta-cell code-cell">
              <span className="meta-lbl">:Code No</span>
              <span className="meta-val" dir="ltr" style={{ unicodeBidi: 'plaintext' }}>{letter.code_no || '2026-002'}</span>
            </div>
          </div>
          <div className="meta-row">
            <div className="meta-cell ref-cell">
              <span className="meta-lbl">الإشاري:</span>
              <span className="meta-val" dir="ltr" style={{ unicodeBidi: 'plaintext' }}>{letter.reference || '12/2026'}</span>
            </div>
            <div className="meta-cell date-cell">
              <span className="meta-lbl">الموافق:</span>
              <span className="meta-val" dir="ltr" style={{ unicodeBidi: 'plaintext' }}>{letter.date || '11/10/2026'}</span>
            </div>
          </div>
        </div>

        {/* QR Code on the left (2nd child in RTL) */}
        <div className="qr-code-box">
          {qrUrl ? (
            <img src={qrUrl} alt="رمز التحقق الأمني QR" className="qr-img" />
          ) : (
            <div className="qr-placeholder" />
          )}
        </div>
      </div>

      {/* Subject Box matching Image 3 */}
      <div className="a4-subject-bordered-box">
        <span className="subject-title-lbl">بخصوص /</span>
        <span className="subject-title-content">
          {letter.subject || '....................................................................................................'}
        </span>
      </div>

      {/* Reference Sub-line matching Image 3 */}
      <div className="a4-reference-subline">
        {letter.reply_to_reference ? (
          <span>
            إشارة إلى مراسلتكم رقم : {letter.reply_to_reference} بتاريخ {letter.reply_date || '10/10/2026'}م
          </span>
        ) : (
          <span>
            إشارة إلى مراسلتكم رقم : 1.2/2026 بتاريخ 10/10/2026م
          </span>
        )}
      </div>

      {/* Recipient Headline matching Image 3 */}
      <div className="a4-recipient-headline">
        <h3>{letter.recipient_title || `إلى السيد / ${letter.recipient || 'آمر المنطقة العسكرية الجنوبية'}`}</h3>
      </div>

      {/* Formal Greetings */}
      <div className="a4-greetings-section">
        <p className="greeting-line-1">بعد التحيـــــة والســــلام ،،،</p>
      </div>

      {/* Letter Body Text */}
      <div className="a4-body-content">
        <p className="body-main-clause">
          {(letter.letter_body || 'إليكم من حيث الاختصاص للتفضل بالعلم واتخاذ ما يلزم من إجراءات وفق ما تقتضيه المصلحة الأمنية العامة.')
            .replace(/وفقكم الله لما فيه خدمة الوطن والمواطن[،,]?\s*والسلام عليكم ورحمة الله وبركاتــــ?ه?\n*/g, '')
            .trim()}
        </p>
      </div>

      {/* Signature Block (Left side) */}
      <div className="a4-signature-block pos-left">
        <div className="sig-inner layout-stacked">
          <div className="sig-text-side">
            <h4 className="sig-officer-name">{letter.signer_name || 'لواء / موسى سعد محمد'}</h4>
            <h5 className="sig-officer-rank">{letter.signer_title || 'مدير مديرية أمن أوباري'}</h5>
          </div>
        </div>
      </div>

      {/* CC List matching Image 3 (2 columns) */}
      <div className="a4-cc-distribution-block">
        <div className="cc-header">صورة منه إلى :-</div>
        <div className="cc-grid-2cols">
          <ul className="cc-col">
            <li>- السيد / وكيل وزارة الداخلية</li>
            <li>- أمر المنطقة العسكرية الجنوبية</li>
            <li>- الغرفة الأمنية المشتركة</li>
          </ul>
          <ul className="cc-col">
            <li>- معالي / وزير الداخلية</li>
            <li>- المساعد للشؤون الأمنية</li>
            <li>- الإدارة العامة للتفتيش والمتابعة</li>
          </ul>
        </div>
      </div>

      {/* Bottom Footer Line & Contact Info matching Image 3 */}
      <footer className="a4-letter-footer">
        <div className="footer-solid-divider" />
        <div className="footer-details-row">
          <div className="footer-cell editor-cell">
            <span>المحرر: {letter.editor_employee || 'عبدالصمد'}</span>
          </div>
          <div className="footer-cell print-cell">
            <span style={{ marginLeft: '4px' }}>🖨️</span>
            <span>الطباعة: {letter.print_employee || 'عبدالصمد'}</span>
          </div>
          <div className="footer-cell phone-cell">
            <span>Phone: {letter.phone || '0915938137'}</span>
          </div>
          <div className="footer-cell email-cell">
            <span>Email: {letter.email || 'Info@ubari-security.ly'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
