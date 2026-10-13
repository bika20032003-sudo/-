import React, { useState, useEffect, useMemo, useRef } from 'react';
import QRCode from 'qrcode';
import {
  FileText,
  Printer,
  Search,
  User,
  Users,
  Building2,
  Calendar,
  Send,
  Eye,
  Trash2,
  Check,
  ChevronDown,
  X,
  Plus,
  Edit,
  Shield,
  Download,
  Share2,
  RefreshCw,
  Sparkles,
  FileCheck,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// Sample pre-seeded employees matching reference image 4 + directorate officers
const SAMPLE_EMPLOYEES = [
  {
    id: 'emp-1',
    name: 'عبدالرحمن المهدي إبراهيم يونس',
    role: 'موظف',
    job_number: '8163450',
    national_id: '119940251120',
    department: 'الشؤون الإدارية والمالية',
    hire_date: '2016-04-12',
    salary: '1,850'
  },
  {
    id: 'emp-2',
    name: 'مريم المهدي إبراهيم يونس',
    role: 'موظف',
    job_number: '8163451',
    national_id: '219960251121',
    department: 'قسم السجلات والمحفوظات',
    hire_date: '2018-09-01',
    salary: '1,720'
  },
  {
    id: 'emp-3',
    name: 'أبوبكر المهدي إبراهيم يونس',
    role: 'موظف',
    job_number: '8163452',
    national_id: '119920251122',
    department: 'إدارة شؤون المرور والتراخيص',
    hire_date: '2014-02-15',
    salary: '1,950'
  },
  {
    id: 'emp-4',
    name: 'عبدالصمد موسى محمد الشيخ الانصارى',
    role: 'ضابط شرطة',
    job_number: '8163155',
    national_id: '119900342512',
    department: 'قسم العمليات والسيطرة',
    hire_date: '2012-06-20',
    salary: '2,400'
  },
  {
    id: 'emp-5',
    name: 'محمد إبراهيم عثمان التيندي',
    role: 'شرطي',
    job_number: '8163210',
    national_id: '119950456123',
    department: 'مركز شرطة أوباري المدينة',
    hire_date: '2017-08-10',
    salary: '1,650'
  }
];

// All 11 Template Types exactly matching Image 3 dropdown
export const TEMPLATE_TYPES = [
  { id: 'whomitmayconcern', name: 'إفادة لمن يهمه الأمر', icon: '📄', subject: 'إفادة لمن يهمه الأمر بخصوص العمل بالمديرية' },
  { id: 'work_resumption', name: 'إفادة مباشرة عمل', icon: '💼', subject: 'إفادة مباشرة عمل رسمي' },
  { id: 'work_continuation', name: 'إفادة استمرار بالعمل', icon: '⏱️', subject: 'إفادة استمرار بالعمل على رأس العمل' },
  { id: 'experience_cert', name: 'شهادة خبرة', icon: '🎖️', subject: 'شهادة خبرة وكفاءة وظيفية' },
  { id: 'clearance', name: 'إخلاء طرف', icon: '✅', subject: 'شهادة إخلاء طرف من العهد والمسؤوليات' },
  { id: 'internal_assignment', name: 'قرار تكليف داخلي', icon: '📜', subject: 'قرار تكليف ومهام عمل داخلية' },
  { id: 'secondment', name: 'قرار ندب', icon: '🔄', subject: 'قرار ندب لصالح جهة رسمية' },
  { id: 'referral_letter', name: 'رسالة إحالة', icon: '📤', subject: 'إحالة ملف ومستندات وظيفية' },
  { id: 'salary_cert', name: 'شهادة راتب', icon: '💳', subject: 'شهادة بيان مفردات مرتب شهري' },
  { id: 'clinic_referral', name: 'نموذج عيادة (إحالة طبية)', icon: '🏥', subject: 'إحالة للكشف الطبي والعلاج بالعيادة' },
  { id: 'free_letter', name: 'مراسلة حرة (مستند فارغ ومحرر نصوص)', icon: '📝', subject: 'مراسلة رسمية صادرة' }
];

// Normalize Arabic text for accurate search matching
const normalizeArabicText = (text) => {
  if (!text) return '';
  return String(text)
    .trim()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[إأآاٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[ىي]/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .toLowerCase();
};

export default function TemplatesSection({ user, forceMembers = [] }) {
  // 1. Form Inputs State (Matching Photo 1, 2, 3, 4)
  const [employeeSearch, setEmployeeSearch] = useState('عبدالرحمن المهدي إبراهيم يونس');
  const [selectedEmployee, setSelectedEmployee] = useState(SAMPLE_EMPLOYEES[0]);
  const [selectedTemplateType, setSelectedTemplateType] = useState('free_letter'); // 'مراسلة حرة (مستند فارغ ومحرر نصوص)'
  const [referenceNumber, setReferenceNumber] = useState('14'); // Value shown in image 1 or 15/2026 in image 2
  
  // Autocomplete UI dropdown state (Photo 4)
  const [showEmployeeSuggestions, setShowEmployeeSuggestions] = useState(false);
  const employeeInputRef = useRef(null);
  const suggestionsBoxRef = useRef(null);

  // 2. Active Generated Document State for Preview & Print
  const [activeDocument, setActiveDocument] = useState(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [isEditingBody, setIsEditingBody] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [notificationMsg, setNotificationMsg] = useState('');

  // 3. Saved Templates History Archive
  const [savedTemplates, setSavedTemplates] = useState(() => {
    const saved = localStorage.getItem('ubari_generated_templates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 1,
        code_no: '2026-T01',
        record_number: '14',
        reference: '14/2026',
        template_type_id: 'free_letter',
        template_name: 'مراسلة حرة (مستند فارغ ومحرر نصوص)',
        employee_name: 'عبدالرحمن المهدي إبراهيم يونس',
        employee_role: 'موظف',
        employee_job_no: '8163450',
        date: new Date().toLocaleDateString('ar-LY'),
        subject: 'مراسلة حرة بخصوص متابعة الأعمال الإدارية المنوطة بالقسم',
        recipient: 'إلى السيد / مدير إدارة الشؤون الإدارية والمالية',
        body_text: 'نحيل إليكم هذا الكتاب للتفضل بالعلم واتخاذ ما يلزم من إجراءات وفق ما تقتضيه المصلحة العامة المنظمة لمديرية أمن أوباري.',
        signer_name: 'لواء / موسى سعد محمد',
        signer_title: 'مدير مديرية أمن أوباري',
        editor: 'عبدالصمد',
        printer: 'عبدالصمد',
        created_at: new Date().toISOString()
      }
    ];
  });

  const [archiveSearch, setArchiveSearch] = useState('');

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        employeeInputRef.current &&
        !employeeInputRef.current.contains(e.target) &&
        suggestionsBoxRef.current &&
        !suggestionsBoxRef.current.contains(e.target)
      ) {
        setShowEmployeeSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered employees for autocomplete suggestions (Combining SAMPLE_EMPLOYEES and forceMembers)
  const employeeSuggestions = useMemo(() => {
    const term = normalizeArabicText(employeeSearch);
    if (!term) return SAMPLE_EMPLOYEES;

    const fromSample = SAMPLE_EMPLOYEES.filter(emp =>
      normalizeArabicText(emp.name).includes(term) ||
      (emp.job_number && emp.job_number.includes(term))
    );

    const fromForce = forceMembers
      .filter(m => m.name && normalizeArabicText(m.name).includes(term))
      .slice(0, 15)
      .map(m => ({
        id: `force-${m.id}`,
        name: m.name,
        role: m.type === 'شرطي' ? 'شرطي' : 'موظف مدني',
        job_number: m.job_number || m.financial_number || '-',
        national_id: m.national_id || '-',
        department: m.job_title || 'مديرية أمن أوباري',
        hire_date: m.birth_date || '2020-01-01',
        salary: '1,750'
      }));

    // Combine and deduplicate by name
    const combined = [...fromSample];
    fromForce.forEach(f => {
      if (!combined.some(c => c.name === f.name)) {
        combined.push(f);
      }
    });

    return combined.slice(0, 25);
  }, [employeeSearch, forceMembers]);

  // Generate body text according to template type and employee
  const generateTemplateContent = (typeId, emp, ref) => {
    const empName = emp?.name || employeeSearch || 'السيد الموظف';
    const jobNo = emp?.job_number || '8163450';
    const nationalId = emp?.national_id || '119940251120';
    const dept = emp?.department || 'مديرية أمن أوباري';
    const today = new Date().toLocaleDateString('ar-LY');

    switch (typeId) {
      case 'whomitmayconcern':
        return {
          subject: `إفادة لمن يهمه الأمر / ${empName}`,
          recipient: 'إلى من يهمه الأمر المحترمين ،،،',
          body: `تفيد مديرية أمن أوباري بأن السيد / ${empName}، الرقم الوطني: (${nationalId})، والرقم المالي والوظيفي: (${jobNo})، يعمل لدينا بالمديرية بصفة (${emp?.role || 'موظف'}) لدى (${dept})، ولا يزال مستمراً في أداء مهامه الوظيفية والنظامية حتى تاريخ إصدار هذه الإفادة.\n\nوقد أُعطيت له هذه الإفادة بناءً على طلبه الشخصي لتقديمها إلى من يهمه الأمر دون أدنى مسؤولية على مديرية أمن أوباري تجاه حقوق الغير أو أي التزامات مالية.`
        };

      case 'work_resumption':
        return {
          subject: `إفادة مباشرة عمل رسمي / ${empName}`,
          recipient: 'إلى السيد / رئيس قسم الشؤون الإدارية والمالية',
          body: `تفيد مديرية أمن أوباري بأن السيد / ${empName}، الرقم المالي: (${jobNo})، المقيد بقسم (${dept})، قد باشر عمله اليومي والفعلي بالمديرية اعتباراً من تاريخ اليوم ${today}م، وذلك بعد انتهاء فترة الإجازة / التكليف الممنوحة له قانوناً، وهو الآن يمارس اختصاصاته الوظيفية كالمعتاد.`
        };

      case 'work_continuation':
        return {
          subject: `إفادة استمرار بالعمل على رأس العمل / ${empName}`,
          recipient: 'إلى من يهمه الأمر المحترمين ،،،',
          body: `تشهد مديرية أمن أوباري بأن الموظف / ${empName}، حامل الرقم الوطني: (${nationalId}) والرقم المالي: (${jobNo})، هو أحد منتسبي المديرية التابعين لـ (${dept})، ولا يزال مستمراً في وظيفته الرسمية ومقيداً ضمن القوة العاملة على رأس العمل ولم ينقطع عن أداء واجباته الوظيفية.`
        };

      case 'experience_cert':
        return {
          subject: `شهادة خبرة وكفاءة مهنية / ${empName}`,
          recipient: 'إلى من يهمه الأمر المحترمين ،،،',
          body: `تشهد مديرية أمن أوباري بأن السيد / ${empName} قد عمل بالمديرية بصفة (${emp?.role || 'موظف رسمي'}) ومارس مهامه لدى (${dept}) بكل تفانٍ وإخلاص، وكان طيلة فترة عمله مثالاً للانضباط العالي والالتزام الأخلاقي وحسن السيرة والسلوك وتنفيذ التعليمات والأوامر الصادرة إليه بكفاءة واقتدار.`
        };

      case 'clearance':
        return {
          subject: `شهادة إخلاء طرف رسمية / ${empName}`,
          recipient: 'إلى السيد / مدير إدارة الشؤون الإدارية والمالية',
          body: `تشهد مديرية أمن أوباري بأن السيد / ${empName}، الرقم المالي: (${jobNo})، قد أتم إجراءات إخلاء طرفه بالكامل من كافة العهد الإدارية والمالية والأسلحة والآليات المسلمة إليه لدى كافة أقسام ومخازن ومكاتب مديرية أمن أوباري، وليس في ذمته أي التزامات وظيفية أو عينية حتى تاريخ إصدار هذا المستند.`
        };

      case 'internal_assignment':
        return {
          subject: `قرار تكليف داخلي رقم (${ref || '15/2026'}) بشأن تكليف موظف`,
          recipient: 'إلى كافة الأقسام والمراكز والوحدات التابعة للمديرية',
          body: `بناءً على مقتضيات المصلحة الأمنية العامة وحسن سير العمل بمديرية أمن أوباري:\n\nمادة (1): يُكلف السيد / ${empName}، الرقم المالي (${jobNo})، بالعمل في (${dept}) اعتباراً من تاريخ صدور هذا القرار.\n\nمادة (2): على كافة الأقسام والإدارات ذات العلاقة وضع هذا القرار موضع التنفيذ والعمل بموجبه من تاريخ صدوره.`
        };

      case 'secondment':
        return {
          subject: `قرار ندب وظيفي رقم (${ref || '15/2026'})`,
          recipient: 'إلى السيد / وكيل وزارة الداخلية المحترم',
          body: `بناءً على مقتضيات المصلحة العامة، يُندب السيد / ${empName}، الرقم المالي: (${jobNo})، من عمله بمديرية أمن أوباري للعمل لدى الجهة الطالبة، على أن تسري بحقه كافة القوانين واللوائح المنظمة للندب الوظيفي بوزارة الداخلية.`
        };

      case 'referral_letter':
        return {
          subject: `إحالة مستندات ومعاملة رسمية تخص / ${empName}`,
          recipient: 'إلى السيد / مدير الإدارة العامة للتفتيش والمتابعة',
          body: `نحيل إليكم طيه ملف ومعاملة السيد / ${empName}، الرقم المالي: (${jobNo})، للتفضل بالاطلاع وإجراء ما يلزم من اختصاص وفق الضوابط والتعليمات المنظمة والمعمول بها لدينا.`
        };

      case 'salary_cert':
        return {
          subject: `شهادة بيان مرتب شهري تخص / ${empName}`,
          recipient: 'إلى إدارة المصرف المحترمين ،،،',
          body: `تشهد الشؤون المالية والمرتبات بمديرية أمن أوباري بأن السيد / ${empName}، الرقم المالي: (${jobNo})، يتقاضى مرتباً شهرياً إجمالياً قدره (${emp?.salary || '1,850'}) د.ل، وبعد خصم الاستقطاعات القانونية يبلغ صافي المرتب الشهري المحال إلى حسابه المصرفي مبلغاً وقدره (${parseInt(emp?.salary?.replace(/,/g, '') || 1850) - 150}) د.ل، وقد أُعطيت له هذه الشهادة بناءً على طلبه لتقديمها إلى مصرفكم.`
        };

      case 'clinic_referral':
        return {
          subject: `إحالة طبية وعلاجية للكشف بالعيادة / ${empName}`,
          recipient: 'إلى السادة / إدارة الخدمات الطبية والعيادة المعتمدة المحترمين',
          body: `يرجى التفضل بقبول السيد / ${empName}، الرقم المالي: (${jobNo})، التابع لمديرية أمن أوباري، وتوقيع الكشف الطبي والفحوصات اللازمة عليه وموافاتنا بتقريركم الطبي حول حالته الصحية وما يتقرر له من علاج أو راحة طبية وفق الأصول الطبية المعتمدة.`
        };

      case 'free_letter':
      default:
        return {
          subject: 'مراسلة حرة بخصوص متابعة الإجراءات الإدارية والأمنية',
          recipient: 'إلى السيد / مدير إدارة الشؤون الإدارية والمالية',
          body: `وفقكم الله لما فيه خدمة الوطن والمواطن، والسلام عليكم ورحمة الله وبركاتــــه\n\nنحيل إليكم هذا الكتاب بخصوص الموظف / ${empName} (الرقم المالي: ${jobNo}) للتفضل بالعلم واتخاذ ما يلزم من إجراءات وفق ما تقتضيه المصلحة الأمنية العامة المنظمة لمديرية أمن أوباري.`
        };
    }
  };

  // Handler: "إنشاء وطباعة النموذج" button (Photo 1 & 2)
  const handleCreateTemplate = () => {
    if (!employeeSearch.trim()) {
      alert('يرجى إدخال أو اختيار اسم الموظف أولاً');
      return;
    }

    const tplInfo = TEMPLATE_TYPES.find(t => t.id === selectedTemplateType) || TEMPLATE_TYPES[0];
    const content = generateTemplateContent(selectedTemplateType, selectedEmployee, referenceNumber);
    const codeNo = `2026-T${String(savedTemplates.length + 1).padStart(2, '0')}`;
    const dateFormatted = new Date().toLocaleDateString('ar-LY');

    const newDoc = {
      id: Date.now(),
      code_no: codeNo,
      record_number: referenceNumber || '14',
      reference: referenceNumber ? `${referenceNumber}/2026` : '15/2026',
      template_type_id: selectedTemplateType,
      template_name: tplInfo.name,
      employee_name: employeeSearch,
      employee_role: selectedEmployee?.role || 'موظف',
      employee_job_no: selectedEmployee?.job_number || '8163450',
      employee_national_id: selectedEmployee?.national_id || '119940251120',
      date: dateFormatted,
      subject: content.subject,
      recipient: content.recipient,
      body_text: content.body,
      signer_name: 'لواء / موسى سعد محمد',
      signer_title: 'مدير مديرية أمن أوباري',
      editor: (user && user.full_name && user.full_name.includes('عبدالصمد')) ? 'عبدالصمد' : (user?.full_name || 'عبدالصمد'),
      printer: (user && user.full_name && user.full_name.includes('عبدالصمد')) ? 'عبدالصمد' : (user?.full_name || 'عبدالصمد'),
      phone: '0915938137',
      email: 'Info@ubari-security.ly',
      created_at: new Date().toISOString()
    };

    // Save to list
    const updatedList = [newDoc, ...savedTemplates];
    setSavedTemplates(updatedList);
    localStorage.setItem('ubari_generated_templates', JSON.stringify(updatedList));

    // Open active document modal
    setActiveDocument(newDoc);
    setShowDocModal(true);
    setNotificationMsg(`تم إنشاء نموذج «${tplInfo.name}» بنجاح وهو جاهز للمعاينة والطباعة`);
    setTimeout(() => setNotificationMsg(''), 4500);
  };

  // Generate QR Code dynamically
  useEffect(() => {
    if (activeDocument) {
      const qrPayload = `دولة ليبيا - وزارة الداخلية\nمديرية أمن أوباري\nالنوع: ${activeDocument.template_name}\nالمعني: ${activeDocument.employee_name}\nالرقم الإشاري: ${activeDocument.reference}\nالكود: ${activeDocument.code_no}\nالتاريخ: ${activeDocument.date}\nتحقق: https://moi.gov.ly/verify?cert=${activeDocument.code_no}`;
      QRCode.toDataURL(qrPayload, {
        width: 140,
        margin: 1,
        color: { dark: '#0a192f', light: '#ffffff' }
      })
        .then(url => setQrCodeDataUrl(url))
        .catch(err => console.error('QR code error:', err));
    }
  }, [activeDocument]);

  // Direct Browser Print Trigger
  const handlePrintDocument = () => {
    window.print();
  };

  // Delete from archive
  const handleDeleteTemplate = (id, name) => {
    if (window.confirm(`هل أنت متأكد من حذف المستند الخاص بـ "${name}"؟`)) {
      const updated = savedTemplates.filter(t => t.id !== id);
      setSavedTemplates(updated);
      localStorage.setItem('ubari_generated_templates', JSON.stringify(updated));
      if (activeDocument && activeDocument.id === id) {
        setShowDocModal(false);
      }
    }
  };

  // Filtered archive list
  const filteredArchive = useMemo(() => {
    if (!archiveSearch.trim()) return savedTemplates;
    const term = normalizeArabicText(archiveSearch);
    return savedTemplates.filter(doc =>
      normalizeArabicText(doc.employee_name).includes(term) ||
      normalizeArabicText(doc.template_name).includes(term) ||
      (doc.reference && doc.reference.includes(term)) ||
      (doc.code_no && doc.code_no.toLowerCase().includes(term.toLowerCase()))
    );
  }, [savedTemplates, archiveSearch]);

  return (
    <div className="templates-section-wrapper">
      {/* Floating Notification */}
      {notificationMsg && (
        <div className="moi-success-notification">
          <CheckCircle2 size={18} color="#16a34a" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN CARD: EXACT REPLICA OF USER PHOTOS 1, 2, 3, 4                         */}
      {/* ========================================================================= */}
      <div className="templates-official-card">
        {/* Header with Title and Orange Vertical Bar (Photo 1) */}
        <div className="templates-card-header">
          <div className="templates-title-block">
            <span className="orange-vertical-bar" />
            <h3 className="templates-title-text">النماذج والرسائل الإدارية</h3>
          </div>
        </div>

        {/* The 3 Inputs Row (Photo 1 & Photo 2) */}
        <div className="templates-inputs-row">
          {/* Input 1: Employee Name Search with Smart Autocomplete (Right) */}
          <div className="template-field-wrap position-relative" ref={employeeInputRef}>
            <div className="field-input-box">
              <input
                type="text"
                className="template-text-input employee-search-input"
                placeholder="ابحث باسم الموظف أو الرقم المالي..."
                value={employeeSearch}
                onChange={(e) => {
                  setEmployeeSearch(e.target.value);
                  setShowEmployeeSuggestions(true);
                }}
                onFocus={() => setShowEmployeeSuggestions(true)}
              />
              {employeeSearch && (
                <button
                  type="button"
                  className="btn-clear-emp"
                  onClick={() => {
                    setEmployeeSearch('');
                    setSelectedEmployee(null);
                    setShowEmployeeSuggestions(true);
                  }}
                  title="مسح"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Smart Autocomplete Dropdown Popup (Photo 4) */}
            {showEmployeeSuggestions && (
              <div className="employee-suggestions-popup" ref={suggestionsBoxRef}>
                <div className="popup-scroll-indicator top">▲</div>
                <div className="popup-items-container">
                  {employeeSuggestions.length > 0 ? (
                    employeeSuggestions.map((emp) => (
                      <div
                        key={emp.id}
                        className={`suggestion-item-row ${selectedEmployee?.name === emp.name ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setEmployeeSearch(emp.name);
                          setShowEmployeeSuggestions(false);
                        }}
                      >
                        <div className="suggestion-name-line">{emp.name}</div>
                        <div className="suggestion-role-line">{emp.role || 'موظف'}</div>
                      </div>
                    ))
                  ) : (
                    <div className="suggestion-no-results">
                      <span>لا يوجد موظف مطابق، يمكنك كتابة الاسم يدوياً</span>
                    </div>
                  )}
                </div>
                <div className="popup-scroll-indicator bottom">▼</div>
              </div>
            )}
          </div>

          {/* Input 2: Template Type Dropdown (Center) - Photo 3 */}
          <div className="template-field-wrap">
            <div className="field-select-box">
              <select
                className="template-dropdown-select"
                value={selectedTemplateType}
                onChange={(e) => setSelectedTemplateType(e.target.value)}
              >
                {TEMPLATE_TYPES.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="select-arrow-icon" />
            </div>
          </div>

          {/* Input 3: Reference Number (Left) - Photo 2 */}
          <div className="template-field-wrap">
            <div className="field-input-box">
              <input
                type="text"
                className="template-text-input ref-number-input"
                placeholder="الرقم الإشاري (اختياري) مثال: 15/2026"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Action Button: [ إنشاء وطباعة النموذج 🖨️ ] (Photo 1 & Photo 2) */}
        <div className="templates-actions-row">
          <button
            type="button"
            className="btn-create-template-print"
            onClick={handleCreateTemplate}
          >
            <Printer size={16} />
            <span>إنشاء وطباعة النموذج</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ARCHIVE TABLE: HISTORY OF GENERATED TEMPLATES & RECENT DOCUMENTS           */}
      {/* ========================================================================= */}
      <div className="templates-archive-card">
        <div className="archive-card-header">
          <div className="archive-title-group">
            <h4>سجل النماذج والرسائل المنشأة ({filteredArchive.length})</h4>
            <span>الأرشيف الإداري للمستندات والإفادات والقرارات الصادرة</span>
          </div>

          <div className="archive-search-box">
            <Search size={14} />
            <input
              type="text"
              placeholder="بحث بالاسم، نوع النموذج، أو الرقم الإشاري..."
              value={archiveSearch}
              onChange={(e) => setArchiveSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="archive-table-wrapper">
          <table className="templates-official-table">
            <thead>
              <tr>
                <th>الكود</th>
                <th>نوع النموذج</th>
                <th>اسم المعني / الموظف</th>
                <th>الرقم الإشاري</th>
                <th>التاريخ</th>
                <th>المحرر</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredArchive.length > 0 ? (
                filteredArchive.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="code-pill-blue">{item.code_no}</span>
                    </td>
                    <td style={{ fontWeight: 800, color: '#0a192f' }}>
                      {item.template_name}
                    </td>
                    <td style={{ fontWeight: 700, color: '#1e3a8a' }}>
                      {item.employee_name}
                    </td>
                    <td>
                      <span className="ref-pill-slate">{item.reference || '—'}</span>
                    </td>
                    <td>{item.date}</td>
                    <td>{item.editor || 'عبدالصمد'}</td>
                    <td>
                      <div className="table-actions-group">
                        <button
                          type="button"
                          className="btn-action-preview"
                          onClick={() => {
                            setActiveDocument(item);
                            setShowDocModal(true);
                          }}
                          title="معاينة وطباعة A4"
                        >
                          <Eye size={13} />
                          <span>معاينة وطباعة</span>
                        </button>
                        <button
                          type="button"
                          className="btn-action-delete"
                          onClick={() => handleDeleteTemplate(item.id, item.employee_name)}
                          title="حذف المستند"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    لا توجد نماذج محفوظة حالياً، يمكنك إنشاء نموذج جديد من النموذج أعلاه.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: PREVIEW & REAL A4 PRINTING OF THE GENERATED TEMPLATE               */}
      {/* ========================================================================= */}
      {showDocModal && activeDocument && (
        <div className="moi-modal-overlay" onClick={() => setShowDocModal(false)}>
          <div className="moi-modal-box letter-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="moi-modal-header letter-modal-topbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="#1e3a8a" />
                <h3 style={{ margin: 0 }}>
                  معاينة وطباعة النموذج: {activeDocument.template_name}
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-toggle-edit"
                  onClick={() => setIsEditingBody(!isEditingBody)}
                  style={{
                    padding: '6px 14px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: isEditingBody ? '#eff6ff' : '#ffffff',
                    color: isEditingBody ? '#1e3a8a' : '#475569',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Edit size={14} />
                  <span>{isEditingBody ? 'إنهاء التعديل' : 'تعديل النص'}</span>
                </button>

                <button
                  type="button"
                  className="btn-toolbar-save"
                  onClick={handlePrintDocument}
                  style={{ padding: '6px 16px', fontSize: '13px' }}
                >
                  <Printer size={15} />
                  <span>طباعة فورية (A4)</span>
                </button>

                <button
                  type="button"
                  className="moi-modal-close-btn"
                  onClick={() => setShowDocModal(false)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Editable Controls Banner if editing mode is active */}
            {isEditingBody && (
              <div className="template-edit-banner" style={{ background: '#f8fafc', padding: '14px 20px', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, display: 'block', marginBottom: '3px' }}>المخاطب الرئيسي:</label>
                    <input
                      type="text"
                      style={{ width: '100%', padding: '6px 10px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      value={activeDocument.recipient}
                      onChange={(e) => setActiveDocument({ ...activeDocument, recipient: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, display: 'block', marginBottom: '3px' }}>بخصوص (الموضوع):</label>
                    <input
                      type="text"
                      style={{ width: '100%', padding: '6px 10px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      value={activeDocument.subject}
                      onChange={(e) => setActiveDocument({ ...activeDocument, subject: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, display: 'block', marginBottom: '3px' }}>الرقم الإشاري:</label>
                    <input
                      type="text"
                      style={{ width: '100%', padding: '6px 10px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      value={activeDocument.reference}
                      onChange={(e) => setActiveDocument({ ...activeDocument, reference: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, display: 'block', marginBottom: '3px' }}>نص المستند أو القرار المعتمد:</label>
                  <textarea
                    rows={3}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1', lineHeight: '1.6' }}
                    value={activeDocument.body_text}
                    onChange={(e) => setActiveDocument({ ...activeDocument, body_text: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Modal Body: The Official A4 Document Sheet */}
            <div className="letter-modal-body">
              <OfficialTemplateA4Sheet doc={activeDocument} qrUrl={qrCodeDataUrl} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: OFFICIAL A4 TEMPLATE DOCUMENT SHEET (Print-ready)
// =========================================================================
function OfficialTemplateA4Sheet({ doc, qrUrl }) {
  if (!doc) return null;

  return (
    <div className="official-a4-letter-sheet" id="official-template-to-print">
      {/* Top Header Block matching Directorate Standard */}
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

      {/* Metadata Table (Right) and QR Code (Left) */}
      <div className="a4-metadata-qr-row">
        {/* Table on the right (1st child in RTL) */}
        <div className="official-meta-table-box">
          <div className="meta-row">
            <div className="meta-cell record-cell">
              <span className="meta-lbl">القيـــــد:</span>
              <span className="meta-val">{doc.record_number || '14'}</span>
            </div>
            <div className="meta-cell code-cell">
              <span className="meta-lbl">:Code No</span>
              <span className="meta-val">{doc.code_no || '2026-T01'}</span>
            </div>
          </div>
          <div className="meta-row">
            <div className="meta-cell ref-cell">
              <span className="meta-lbl">الإشاري:</span>
              <span className="meta-val">{doc.reference || '14/2026'}</span>
            </div>
            <div className="meta-cell date-cell">
              <span className="meta-lbl">الموافق:</span>
              <span className="meta-val">{doc.date}</span>
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

      {/* Framed Subject Box */}
      <div className="a4-subject-bordered-box">
        <span className="subject-title-lbl">بخصوص /</span>
        <span className="subject-title-content">{doc.subject}</span>
      </div>

      {/* Reference Sub-line */}
      <div className="a4-reference-subline">
        <span>
          إشارة إلى السجلات الرسمية وقواعد بيانات منتسبي مديرية أمن أوباري المنظمة للعمل
        </span>
      </div>

      {/* Recipient Headline */}
      <div className="a4-recipient-headline">
        <h3>{doc.recipient}</h3>
      </div>

      {/* Formal Greetings */}
      <div className="a4-greetings-section">
        <p className="greeting-line-1">بعد التحيـــــة والســــلام ،،،</p>
        <p className="greeting-line-2">
          الحمد لله والصلاة والسلام على رسول الله وعلى اله وصحبه ومن اتبع هداه اما بعد
        </p>
      </div>

      {/* Document Body Content */}
      <div className="a4-body-content">
        <p className="body-prayer-line">
          وفقكم الله لما فيه خدمة الوطن والمواطن، والسلام عليكم ورحمة الله وبركاتــــه
        </p>
        <div className="body-main-clause" style={{ whiteSpace: 'pre-line', fontSize: '16.5px', lineHeight: '2' }}>
          {doc.body_text}
        </div>
      </div>

      {/* Signature Block (Centered) */}
      <div className="a4-signature-block">
        <div className="sig-inner">
          <h4 className="sig-officer-name">{doc.signer_name || 'لواء / موسى سعد محمد'}</h4>
          <h5 className="sig-officer-rank">{doc.signer_title || 'مدير مديرية أمن أوباري'}</h5>
          <div className="sig-space-placeholder">
            <div className="official-stamp-seal-circle">
              <div className="stamp-inner-text">
                <span>وزارة الداخلية</span>
                <span>مديرية أمن أوباري</span>
                <span>* مكتب المدير *</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CC Distribution List (Two Columns) */}
      <div className="a4-cc-distribution-block">
        <div className="cc-header">صورة منه إلى :-</div>
        <div className="cc-grid-2cols">
          <ul className="cc-col">
            <li>- السيد / وكيل وزارة الداخلية</li>
            <li>- الملف الوظيفي والشخصي للمعني</li>
            <li>- قسم الشؤون الإدارية والمالية</li>
          </ul>
          <ul className="cc-col">
            <li>- قسم المحفوظات والسجلات بالمديرية</li>
            <li>- الإدارة العامة للتفتيش والمتابعة</li>
            <li>- وحدة المتابعة والتوثيق</li>
          </ul>
        </div>
      </div>

      {/* Bottom Footer Line & Details */}
      <footer className="a4-letter-footer">
        <div className="footer-solid-divider" />
        <div className="footer-details-row">
          <div className="footer-cell editor-cell">
            <span>المحرر: {doc.editor || 'عبدالصمد'}</span>
          </div>
          <div className="footer-cell print-cell">
            <span style={{ marginLeft: '4px' }}>🖨️</span>
            <span>الطباعة: {doc.printer || 'عبدالصمد'}</span>
          </div>
          <div className="footer-cell phone-cell">
            <span>Phone: {doc.phone || '0915938137'}</span>
          </div>
          <div className="footer-cell email-cell">
            <span>Email: {doc.email || 'Info@ubari-security.ly'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
