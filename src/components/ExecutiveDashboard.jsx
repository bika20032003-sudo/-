import React, { useState, useEffect, useRef } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Home,
  BarChart3,
  Globe,
  LayoutGrid,
  FileText,
  Image as ImageIcon,
  Layers,
  Building2,
  Truck,
  MapPin,
  Users,
  Database,
  Bell,
  Activity,
  Settings,
  LogOut,
  Maximize2,
  Mail,
  ChevronDown,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  Edit2,
  Trash2,
  UploadCloud,
  FileSpreadsheet,
  FileBox,
  Eye,
  ShieldCheck,
  ExternalLink,
  ChevronLeft,
  X,
  Search,
  Download,
  Filter,
  Save,
  RefreshCw,
  Sliders,
  DollarSign,
  Calendar,
  AlertTriangle,
  FolderPlus,
  Send,
  UserPlus,
  Lock,
  Unlock,
  Check,
  Globe2,
  ShieldAlert,
  FileCheck2,
  FileClock,
  ImagePlus,
  Newspaper,
  Crown
} from 'lucide-react';
import { 
  initialFieldPhotos, 
  initialDocuments, 
  initialSectors, 
  initialContractors, 
  initialSummary, 
  nationalProjects, 
  initialTickerNews,
  getSavedExecutiveProjects,
  saveExecutiveProjects,
  getSavedNewsPosts,
  saveNewsPosts,
  getSavedHeroCard,
  saveHeroCard
} from '../services/api';
import DocumentReportsHub from './DocumentReportsHub';
import MarqueeTicker from './MarqueeTicker';
import { compressImageFile, safeStorageSet, safeStorageGet } from '../utils/imageCompressor';

// S-Curve Progress Data (Planned vs Actual)
const progressCurveData2026 = [
  { month: 'يناير', planned: 20, actual: 15 },
  { month: 'فبراير', planned: 40, actual: 28 },
  { month: 'مارس', planned: 60, actual: 45 },
  { month: 'أبريل', planned: 80, actual: 60 },
  { month: 'مايو', planned: 100, actual: 78 },
  { month: 'يونيو', planned: 120, actual: 95 },
  { month: 'يوليو', planned: 140, actual: 115 },
  { month: 'أغسطس', planned: 180, actual: 153.54 },
  { month: 'سبتمبر', planned: 210, actual: null },
  { month: 'أكتوبر', planned: 240, actual: null },
  { month: 'نوفمبر', planned: 280, actual: null },
  { month: 'ديسمبر', planned: 360, actual: null }
];

const progressCurveData2025 = [
  { month: 'يناير', planned: 5, actual: 5 },
  { month: 'فبراير', planned: 10, actual: 9 },
  { month: 'مارس', planned: 18, actual: 16 },
  { month: 'أبريل', planned: 25, actual: 24 },
  { month: 'مايو', planned: 35, actual: 32 },
  { month: 'يونيو', planned: 45, actual: 42 },
  { month: 'يوليو', planned: 58, actual: 55 },
  { month: 'أغسطس', planned: 70, actual: 68 },
  { month: 'سبتمبر', planned: 85, actual: 82 },
  { month: 'أكتوبر', planned: 100, actual: 96 },
  { month: 'نوفمبر', planned: 115, primary: 110 },
  { month: 'ديسمبر', planned: 130, actual: 125 }
];

// Work type breakdown donut chart data
const workTypeData = [
  { name: 'طبقات ورصف الأسفلت', value: 50.46, color: '#3B82F6' },
  { name: 'الأعمال الترابية والتسوية', value: 60.25, color: '#F97316' },
  { name: 'العبارات وتصريف السيول', value: 30.40, color: '#10B981' },
  { name: 'الأعمال الصناعية والخرسانية', value: 40.20, color: '#EAB308' },
  { name: 'أعمال أخرى وإنارة', value: 25.30, color: '#8B5CF6' }
];

// Sectors Status breakdown data
const sectorsStatusData = [
  { name: 'متقدم / ممتاز', value: 3, color: '#10B981' },
  { name: 'وفق الجدول', value: 5, color: '#34D399' },
  { name: 'متوسطة', value: 3, color: '#FBBF24' },
  { name: 'ضعيفة / متأخرة', value: 1, color: '#EF4444' }
];

// Preset High-Resolution Project Documentation Images
const PRESET_PROJECT_PHOTOS = [
  {
    title: 'آليات رصف الأسفلت الساخن ومتابعة درجات الحرارة',
    category: 'رصف الأسفلت',
    url: '/road-asphalt-paver.jpg',
    desc: 'عمليات مد ورصف الطبقة السطحية الرابطة ومتابعة درجة حرارة الخلطة الإسفلتية المعتمدة (160°C).'
  },
  {
    title: 'دمك الأسفلت بالمداحل الأسطوانية والمطاطية',
    category: 'الدمك وضبط المناسيب',
    url: '/road-rollers-compaction.jpg',
    desc: 'تشغيل أسطول المداحل الاهتزازية Dynapac & CAT للدمك النهائي وتحديد المناسيب عبر التوتال ستيشن.'
  },
  {
    title: 'تسوية الأساس الحجري بالكاشطات الموتورية',
    category: 'كشط وتأسيس',
    url: '/road-grader-earthwork.jpg',
    desc: 'تسوية وضبط سمك طبقة الأساس الحجرية المكسورة وتوزيع الشاحنات وصهاريج رش المياه قبل الرصف.'
  },
  {
    title: 'تركيب وتشغيل منظومة الإنارة الذكية بالطاقة الشمسية',
    category: 'الطاقة الشمسية والإنارة',
    url: '/road-solar-lighting.jpg',
    desc: 'تثبيت أعمدة الإنارة المزدوجة بالطاقة الشمسية المقاومة للرياح الصحراوية وتخطيط مسارات الطريق.'
  },
  {
    title: 'فحص عينات الكور الإسفلتي ومطابقة الجودة المعملية',
    category: 'ضبط الجودة المعملي',
    url: '/road-qa-testing-core.jpg',
    desc: 'سحب وفحص عينات الكور الإسفلتي باستخدام أجهزة القياس الرقمية والمختبر الميداني المتنقل.'
  },
  {
    title: 'مشهد جوي بانورامي لمسار الطريق الصحراوي المعبد',
    category: 'بانوراما جوية',
    url: '/road-aerial-highway.jpg',
    desc: 'توثيق جوي شامل لحركة قطار الرصف والآليات والشاحنات على امتداد الطريق الصحراوي الدولي.'
  }
];

// Extended 12 Sectors Dataset for complete Road Management
const default12Sectors = [
  { id: 'SEC-01', name: 'القطاع 01: أوباري - الفيوات', lengthKm: 30, progress: 84.0, contractor: 'شركة السهل الصحراوي', residentEngineer: 'م. عبد السلام الفزاني', status: 'متقدم جداً', statusColor: 'emerald', thickness: 12, machinery: 38, workers: 115 },
  { id: 'SEC-02', name: 'القطاع 02: الفيوات - القرقيبة', lengthKm: 30, progress: 76.5, contractor: 'شركة السهل الصحراوي', residentEngineer: 'م. يحيى التاورغي', status: 'متقدم جداً', statusColor: 'emerald', thickness: 12, machinery: 32, workers: 95 },
  { id: 'SEC-03', name: 'القطاع 03: القرقيبة - بيسان', lengthKm: 30, progress: 72.0, contractor: 'شركة الهضبة للإعمار', residentEngineer: 'م. طارق المحجوب', status: 'وفق الجدول', statusColor: 'emerald', thickness: 10, machinery: 42, workers: 130 },
  { id: 'SEC-04', name: 'القطاع 04: بيسان - تين الوه', lengthKm: 30, progress: 68.0, contractor: 'شركة الطريق السريع', residentEngineer: 'م. منصور المهدي', status: 'وفق الجدول', statusColor: 'emerald', thickness: 10, machinery: 30, workers: 90 },
  { id: 'SEC-05', name: 'القطاع 05: تين الوه - العوينات الشرقية', lengthKm: 30, progress: 64.5, contractor: 'شركة الهضبة للإعمار', residentEngineer: 'م. سالم التواتي', status: 'وفق الجدول', statusColor: 'emerald', thickness: 10, machinery: 35, workers: 105 },
  { id: 'SEC-06', name: 'القطاع 06: مفرق العوينات الرئيسي', lengthKm: 30, progress: 61.0, contractor: 'شركة الأفق الوطني', residentEngineer: 'م. عمران الفيتوري', status: 'وفق الجدول', statusColor: 'emerald', thickness: 9, machinery: 36, workers: 98 },
  { id: 'SEC-07', name: 'القطاع 07: العوينات - تخرخوري', lengthKm: 30, progress: 54.0, contractor: 'شركة الجسر الحديث', residentEngineer: 'م. عادل الشريف', status: 'متوسطة', statusColor: 'amber', thickness: 8, machinery: 28, workers: 84 },
  { id: 'SEC-08', name: 'القطاع 08: وادي تخرخوري - أيسين', lengthKm: 30, progress: 48.0, contractor: 'شركة الأفق الوطني', residentEngineer: 'م. فتحي الزروق', status: 'متوسطة', statusColor: 'amber', thickness: 8, machinery: 26, workers: 78 },
  { id: 'SEC-09', name: 'القطاع 09: أيسين - وادي البركت', lengthKm: 30, progress: 42.0, contractor: 'شركة الطرق الليبية', residentEngineer: 'م. أحمد المقريف', status: 'متوسطة', statusColor: 'amber', thickness: 8, machinery: 24, workers: 70 },
  { id: 'SEC-10', name: 'القطاع 10: البركت - المدخل الشمالي', lengthKm: 30, progress: 35.4, contractor: 'شركة المستقبل للمقاولات', residentEngineer: 'م. علي الغاتي', status: 'ضعيفة', statusColor: 'rose', thickness: 7, machinery: 26, workers: 85 },
  { id: 'SEC-11', name: 'القطاع 11: مدخل مدينة غات التاريخية', lengthKm: 30, progress: 55.0, contractor: 'شركة الجنوب للمشاريع', residentEngineer: 'م. خالد التيندي', status: 'وفق الجدول', statusColor: 'emerald', thickness: 10, machinery: 30, workers: 92 },
  { id: 'SEC-12', name: 'القطاع 12: غات - المثلث الحدودي والوصلات', lengthKm: 30, progress: 28.7, contractor: 'شركة التضامن للمقاولات', residentEngineer: 'م. نوري الحاسي', status: 'ضعيفة', statusColor: 'rose', thickness: 7, machinery: 20, workers: 60 }
];

export default function ExecutiveDashboard({
  summaryData = initialSummary,
  sectors = default12Sectors,
  setSectors,
  contractors = initialContractors,
  setContractors,
  documents = initialDocuments,
  setDocuments,
  authorizedUsers = [],
  setAuthorizedUsers,
  theme,
  lang = 'ar',
  user,
  onOpenGoogleAuth,
  onLogout,
  onBackToPortal,
  tickerNews,
  setTickerNews
}) {
  const [activeSidebarItem, setActiveSidebarItem] = useState('executive-projects');
  const [yearFilter, setYearFilter] = useState('2026');
  const [toastMessage, setToastMessage] = useState(null);

  // ── Executive Corridor Projects Management State ──
  const [localExecutiveProjects, setLocalExecutiveProjects] = useState(getSavedExecutiveProjects);
  const [isAddExecutiveProjectModalOpen, setIsAddExecutiveProjectModalOpen] = useState(false);
  const [selectedExecutiveProjectEditModal, setSelectedExecutiveProjectEditModal] = useState(null);
  const [executiveProjectToDelete, setExecutiveProjectToDelete] = useState(null);
  const [executiveProjectForm, setExecutiveProjectForm] = useState({
    title: '',
    region: 'فزان (أوباري - غات)',
    progress: 68.5,
    status: 'in_progress',
    contractor: 'ائتلاف شركات الطرق الوطنية',
    image: '/road-aerial-highway.jpg',
    desc: 'مشروع صيانة وتأهيل المسار الاستراتيجي مع تطبيق أعلى معايير الجودة والسلامة.'
  });

  // ── News Center (المصورة) Management State ──
  const [localNewsPosts, setLocalNewsPosts] = useState(getSavedNewsPosts);
  const [isAddNewsPostModalOpen, setIsAddNewsPostModalOpen] = useState(false);
  const [selectedNewsPostEditModal, setSelectedNewsPostEditModal] = useState(null);
  const [newsPostToDelete, setNewsPostToDelete] = useState(null);
  const [newsCenterSubTab, setNewsCenterSubTab] = useState('posts'); // 'posts' | 'ticker'
  const [newsPostForm, setNewsPostForm] = useState({
    title: '',
    category: 'رصف الأسفلت',
    desc: '',
    image: '/road-asphalt-paver.jpg',
    author: 'المكتب الإعلامي - جهاز مشروعات المواصلات',
    location: 'مسار طريق أوباري – غات'
  });

  // ── Hero 3D Showcase Card Management State ──
  const [localHeroCard, setLocalHeroCard] = useState(getSavedHeroCard);
  const [isEditHeroCardModalOpen, setIsEditHeroCardModalOpen] = useState(false);
  const [heroCardForm, setHeroCardForm] = useState(getSavedHeroCard);
  const [isHeroCardImageCompressing, setIsHeroCardImageCompressing] = useState(false);
  const heroCardFileInputRef = useRef(null);

  // Synchronize across components via storage event
  useEffect(() => {
    const handleStorageUpdate = () => {
      setLocalExecutiveProjects(getSavedExecutiveProjects());
      setLocalNewsPosts(getSavedNewsPosts());
      setLocalHeroCard(getSavedHeroCard());
    };
    window.addEventListener('storage', handleStorageUpdate);
    return () => window.removeEventListener('storage', handleStorageUpdate);
  }, []);

  // News ticker management state
  const [localNews, setLocalNews] = useState(() => {
    if (tickerNews && tickerNews.length > 0) return tickerNews;
    try {
      const saved = localStorage.getItem('portal_ticker_news');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialTickerNews;
  });
  const [isAddNewsModalOpen, setIsAddNewsModalOpen] = useState(false);
  const [selectedNewsEditModal, setSelectedNewsEditModal] = useState(null);
  const [newsToDelete, setNewsToDelete] = useState(null);
  const [newsForm, setNewsForm] = useState({
    text: '',
    tag: 'تحديث حي',
    active: true
  });

  // Modals state
  const [selectedReportModal, setSelectedReportModal] = useState(null);
  const [selectedReportEditModal, setSelectedReportEditModal] = useState(null);
  
  const [selectedPhotoModal, setSelectedPhotoModal] = useState(null);
  const [selectedPhotoEditModal, setSelectedPhotoEditModal] = useState(null);
  
  const [selectedUserViewModal, setSelectedUserViewModal] = useState(null);
  const [selectedUserEditModal, setSelectedUserEditModal] = useState(null);

  // In-App Delete Confirmation Modals
  const [userToDelete, setUserToDelete] = useState(null);
  const [photoToDelete, setPhotoToDelete] = useState(null);
  const [reportToDelete, setReportToDelete] = useState(null);

  const [isAddReportModalOpen, setIsAddReportModalOpen] = useState(false);
  const [isAddSectorModalOpen, setIsAddSectorModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAddMediaModalOpen, setIsAddMediaModalOpen] = useState(false);
  const [isWorkDetailsModalOpen, setIsWorkDetailsModalOpen] = useState(false);

  // Local live state with localStorage persistence
  const [localSectors, setLocalSectors] = useState(() => {
    try {
      const saved = localStorage.getItem('portal-sectors-12');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return default12Sectors;
  });

  const [localReports, setLocalReports] = useState(() => {
    try {
      const saved = localStorage.getItem('portal-dashboard-reports');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'REP-01', title: 'التقرير اليومي - القطاع 04', contractor: 'شركة الطريق السريع', sector: 'القطاع 04', date: '2026-08-20', status: 'معتمد', type: 'PDF', size: '2.4 MB', isPublic: true },
      { id: 'REP-02', title: 'التقرير اليومي - القطاع 07', contractor: 'شركة الجسر الحديث', sector: 'القطاع 07', date: '2026-08-19', status: 'معتمد', type: 'XLSX', size: '1.8 MB', isPublic: true },
      { id: 'REP-03', title: 'التقرير الأسبوعي - القطاع 03', contractor: 'شركة الطرق الليبية', sector: 'القطاع 03', date: '2026-08-18', status: 'معتمد', type: 'PDF', size: '4.1 MB', isPublic: true },
      { id: 'REP-04', title: 'التقرير اليومي - القطاع 10', contractor: 'شركة المستقبل للمقاولات', sector: 'القطاع 10', date: '2026-08-17', status: 'معتمد', type: 'XLSX', size: '3.2 MB', isPublic: false },
      { id: 'REP-05', title: 'التقرير الشهري - يوليو 2026', contractor: 'الإدارة العامة للمشروع', sector: 'كافة القطاعات', date: '2026-08-01', status: 'معتمد', type: 'PDF', size: '8.5 MB', isPublic: true }
    ];
  });

  const [localPhotos, setLocalPhotos] = useState(() => {
    try {
      const saved = localStorage.getItem('portal-field-photos-v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'P-01', title: 'أعمال رصف الأسفلت بالدكاكات', sector: 'القطاع 07', category: 'رصف الأسفلت', date: '2026-08-20', img: '/road-rollers-compaction.jpg', photographer: 'م. عبد السلام الفزاني' },
      { id: 'P-02', title: 'تسوية وتمهيد الأساس الحجري بالكاشطات', sector: 'القطاع 10', category: 'الأعمال الترابية', date: '2026-08-20', img: '/road-grader-earthwork.jpg', photographer: 'م. طارق المحجوب' },
      { id: 'P-03', title: 'بناء عبّارات السيول الصندوقية المزدوجة', sector: 'القطاع 03', category: 'العبارات والجسور', date: '2026-08-20', img: '/road-qa-testing-core.jpg', photographer: 'م. سالم التواتي' },
      { id: 'P-04', title: 'قطار الرصف الآلي المزدوج في قطاع الفيوات', sector: 'القطاع 01', category: 'رصف الأسفلت', date: '2026-08-20', img: '/road-asphalt-paver.jpg', photographer: 'فريق الإعلام الهندسي' },
      { id: 'P-05', title: 'تركيب أعمدة الإنارة الذكية بالطاقة الشمسية', sector: 'القطاع 04', category: 'الإنارة والسلامة', date: '2026-08-19', img: '/road-solar-lighting.jpg', photographer: 'م. منصور المهدي' },
      { id: 'P-06', title: 'مسار الطريق الصحراوي الممتد من أوباري لغات', sector: 'القطاع 02', category: 'بانوراما جوية', date: '2026-08-18', img: '/road-aerial-desert-highway.jpg', photographer: 'طائرة التصوير الميداني' }
    ];
  });

  const [localUsers, setLocalUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('portal-auth-users');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'USR-01', name: 'أحمد محمد', email: 'ahmed.mohammed@transport.gov.ly', role: 'مدير النظام', status: 'نشط', permissions: 'كامل الصلاحيات (Super Admin)', sectorsAssigned: 'كافة القطاعات (01 - 12)', phone: '+218 91 234 5678' },
      { id: 'USR-02', name: 'م. عبد السلام الفزاني', email: 'a.fazzani@transport.gov.ly', role: 'مهندس إشراف موقعي', status: 'نشط', permissions: 'إدارة وتعديل القطاعات والتقارير', sectorsAssigned: 'القطاع 01، القطاع 02', phone: '+218 92 345 6789' },
      { id: 'USR-03', name: 'د. سالم التواتي', email: 's.touati@transport.gov.ly', role: 'مدير ضبط الجودة والمختبرات', status: 'نشط', permissions: 'اعتماد محاضر الاختبارات المعملية', sectorsAssigned: 'مختبرات أوباري وغات', phone: '+218 91 456 7890' },
      { id: 'USR-04', name: 'أ. فاطمة الورفلي', email: 'f.werfalli@finance.gov.ly', role: 'مدقق مالي ومستخلصات', status: 'نشط', permissions: 'إدارة القيود والمستخلصات المالية', sectorsAssigned: 'الإدارة المالية المركزية', phone: '+218 93 567 8901' }
    ];
  });

  const [systemLogs, setSystemLogs] = useState([
    { id: 'LOG-01', user: 'أحمد محمد', action: 'تسجيل دخول ناجح إلى لوحة التحكم', time: 'منذ 10 دقائق', type: 'info' },
    { id: 'LOG-02', user: 'م. عبد السلام الفزاني', action: 'تحديث نسبة إنجاز القطاع 01 إلى 84%', time: 'منذ 45 دقيقة', type: 'success' },
    { id: 'LOG-03', user: 'د. سالم التواتي', action: 'اعتماد تقرير فحص الكور الإسفلتي لمارشال', time: 'منذ ساعتين', type: 'success' },
    { id: 'LOG-04', user: 'أ. فاطمة الورفلي', action: 'تعديل مستخلص مالي للشركة العامة', time: 'منذ 3 ساعات', type: 'warning' },
    { id: 'LOG-05', user: 'النظام الآلي', action: 'نسخ احتياطي تلقائي لقاعدة البيانات', time: 'منذ 6 ساعات', type: 'info' }
  ]);

  // Dynamic calculations from sectors
  const totalLength = 360;
  const executedKm = Number((localSectors.reduce((acc, s) => acc + (s.lengthKm * (s.progress / 100)), 0)).toFixed(2));
  const remainingKm = Number((totalLength - executedKm).toFixed(2));
  const overallPercentage = Number(((executedKm / totalLength) * 100).toFixed(2));

  // Save changes helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form inputs
  const [newReport, setNewReport] = useState({ title: '', contractor: '', sector: 'القطاع 01', type: 'PDF' });
  const [newSector, setNewSector] = useState({ name: '', lengthKm: 30, progress: 50, contractor: '', residentEngineer: '', thickness: 10 });
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'مهندس إشراف موقعي', permissions: 'إدارة وتعديل القطاعات', phone: '', sectorsAssigned: 'القطاع 01' });
  const [newMedia, setNewMedia] = useState({
    title: '',
    sector: 'القطاع 01: أوباري - الفيوات',
    category: 'رصف الأسفلت',
    img: '/road-asphalt-paver.jpg',
    src: '/road-asphalt-paver.jpg',
    photographer: '',
    desc: '',
    date: new Date().toISOString().split('T')[0],
    targetProject: 'new'
  });
  const [mediaUploadTab, setMediaUploadTab] = useState('upload'); // 'upload' | 'gallery' | 'url'
  const photoFileInputRef = useRef(null);
  const editPhotoFileInputRef = useRef(null);
  const projectImageFileInputRef = useRef(null);
  const newsPostImageFileInputRef = useRef(null);
  const [isCompressingProjectImage, setIsCompressingProjectImage] = useState(false);
  const [isCompressingNewsImage, setIsCompressingNewsImage] = useState(false);

  // File Upload Handler for Executive Project Cover Image
  const handleProjectImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsCompressingProjectImage(true);
      const compressed = await compressImageFile(file, 1600, 1100, 0.82);
      setExecutiveProjectForm(prev => ({ ...prev, image: compressed }));
      showToast('تم رفع ومعالجة صورة المشروع بنجاح');
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setExecutiveProjectForm(prev => ({ ...prev, image: ev.target.result }));
        showToast('تم رفع صورة المشروع بنجاح');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressingProjectImage(false);
      if (e.target) e.target.value = '';
    }
  };

  // File Upload Handler for News Post Image
  const handleNewsPostImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsCompressingNewsImage(true);
      const compressed = await compressImageFile(file, 1600, 1100, 0.82);
      setNewsPostForm(prev => ({ ...prev, image: compressed }));
      showToast('تم رفع ومعالجة صورة الخبر بنجاح');
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewsPostForm(prev => ({ ...prev, image: ev.target.result }));
        showToast('تم رفع صورة الخبر بنجاح');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressingNewsImage(false);
      if (e.target) e.target.value = '';
    }
  };

  // Data Ingestion Form in data_io tab
  const [importReportForm, setImportReportForm] = useState({
    title: '',
    contractor: '',
    sector: 'القطاع 01',
    category: 'تقارير الإنجاز',
    type: 'PDF',
    size: '3.4 MB'
  });

  const [demoPmAccess, setDemoPmAccess] = useState(false);

  // Role-Based Access Control: Check if current user is the Project Manager
  // Defaults to true when inside Executive Dashboard, or checks credentials
  const isProjectManager = Boolean(
    demoPmAccess ||
    !user || 
    (user && (
      (user.role && (
        user.role.includes('مدير') || 
        user.role.includes('Manager') || 
        user.role.includes('مسؤول')
      )) ||
      user.email === 'eng.ahmed@trans.gov.ly' ||
      user.email === 'yahi.alhafiz@transport.gov.ly' ||
      user.type === 'حساب رسمي معتمد'
    ))
  );

  // Sidebar navigation menu definition (Executive Projects, News Center, Media)
  const sidebarNavItems = [
    { id: 'executive-projects', label: 'المشروعات التنفيذية للمسار', icon: Building2, badge: 'مشاريع المسار' },
    { id: 'news-center', label: 'مركز الأخبار والمستجدات', icon: Newspaper, badge: 'مركز الأخبار' },
    { id: 'media', label: 'الصور والفيديو', icon: ImageIcon }
  ];

  // ── Handlers: Executive Projects Management ──
  const handleSaveExecutiveProject = (e) => {
    e.preventDefault();
    if (!executiveProjectForm.title.trim()) {
      showToast('يرجى إدخال اسم أو عنوان المشروع التنفيذي');
      return;
    }

    let updated;
    if (selectedExecutiveProjectEditModal) {
      updated = localExecutiveProjects.map(p =>
        p.id === selectedExecutiveProjectEditModal.id
          ? {
              ...p,
              title: executiveProjectForm.title.trim(),
              region: executiveProjectForm.region,
              progress: Number(executiveProjectForm.progress),
              status: executiveProjectForm.status,
              statusLabel: executiveProjectForm.status === 'completed' ? 'مكتمل' : Number(executiveProjectForm.progress) > 70 ? 'متقدم جداً' : 'جاري التنفيذ',
              contractor: executiveProjectForm.contractor,
              image: executiveProjectForm.image || p.image,
              desc: executiveProjectForm.desc
            }
          : p
      );
      showToast('تم تحديث بيانات المشروع التنفيذي بنجاح');
      setSelectedExecutiveProjectEditModal(null);
    } else {
      const newProj = {
        id: `PRJ-EXEC-${Date.now().toString().slice(-4)}`,
        title: executiveProjectForm.title.trim(),
        titleEn: executiveProjectForm.title.trim(),
        region: executiveProjectForm.region || 'مسار أوباري - غات',
        regionEn: 'Ubari - Ghat Corridor',
        lengthKm: 90,
        progress: Number(executiveProjectForm.progress) || 50,
        status: executiveProjectForm.status || 'in_progress',
        statusLabel: executiveProjectForm.status === 'completed' ? 'مكتمل' : Number(executiveProjectForm.progress) > 70 ? 'متقدم جداً' : 'جاري التنفيذ',
        statusColor: 'emerald',
        contractor: executiveProjectForm.contractor || 'ائتلاف شركات الطرق الوطنية',
        startDate: new Date().toISOString().split('T')[0],
        targetDate: '2026-12-31',
        image: executiveProjectForm.image || '/road-aerial-highway.jpg',
        desc: executiveProjectForm.desc || 'مشروع تنفيذي ميداني على مسار أوباري - غات.',
        specs: {
          thickness: '10-12 سم',
          paved: 'منجز وموثق',
          solarPoles: 'معتمد',
          fleet: 'آليات عاملة',
          qualityScore: '100% مطابقة'
        }
      };
      updated = [newProj, ...localExecutiveProjects];
      showToast('تمت إضافة المشروع التنفيذي الجديد بنجاح');
    }

    setLocalExecutiveProjects(updated);
    saveExecutiveProjects(updated);
    setIsAddExecutiveProjectModalOpen(false);
  };

  const handleDeleteExecutiveProject = () => {
    if (!executiveProjectToDelete) return;
    const updated = localExecutiveProjects.filter(p => p.id !== executiveProjectToDelete.id);
    setLocalExecutiveProjects(updated);
    saveExecutiveProjects(updated);
    showToast(`تم حذف مشروع "${executiveProjectToDelete.title}" بنجاح`);
    setExecutiveProjectToDelete(null);
  };

  // ── Handlers: Hero Showcase Card Management (بطاقة الواجهة الرئيسية) ──
  const handleHeroCardImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsHeroCardImageCompressing(true);
      const compressedDataUrl = await compressImageFile(file, 1600, 1100, 0.82);
      setHeroCardForm(prev => ({
        ...prev,
        image: compressedDataUrl
      }));
    } catch (err) {
      alert(err.message || 'تعذر معالجة الصورة، يرجى اختيار ملف صورة آخر');
    } finally {
      setIsHeroCardImageCompressing(false);
    }
  };

  const handleSaveHeroCard = (e) => {
    e.preventDefault();
    if (!heroCardForm.title?.trim()) {
      showToast('يرجى إدخال عنوان بطاقة الموقف التنفيذي للواجهة');
      return;
    }
    saveHeroCard(heroCardForm);
    setLocalHeroCard(heroCardForm);
    setIsEditHeroCardModalOpen(false);
    showToast('تم تحديث بطاقة الموقف التنفيذي للواجهة الرئيسية بنجاح!');
  };

  // ── Handlers: News Posts Management (مركز الأخبار المصورة) ──
  const handleSaveNewsPost = (e) => {
    e.preventDefault();
    if (!newsPostForm.title.trim()) {
      showToast('يرجى إدخال عنوان الخبر');
      return;
    }

    let updated;
    if (selectedNewsPostEditModal) {
      updated = localNewsPosts.map(p =>
        p.id === selectedNewsPostEditModal.id
          ? {
              ...p,
              title: newsPostForm.title.trim(),
              category: newsPostForm.category,
              desc: newsPostForm.desc,
              image: newsPostForm.image || p.image,
              author: newsPostForm.author,
              location: newsPostForm.location
            }
          : p
      );
      showToast('تم تحديث الخبر بمركز الأخبار بنجاح');
      setSelectedNewsPostEditModal(null);
    } else {
      const newPost = {
        id: `POST-${Date.now().toString().slice(-4)}`,
        title: newsPostForm.title.trim(),
        titleEn: newsPostForm.title.trim(),
        desc: newsPostForm.desc,
        descEn: newsPostForm.desc,
        category: newsPostForm.category,
        categoryEn: newsPostForm.category,
        image: newsPostForm.image || '/road-asphalt-paver.jpg',
        timeAgo: 'الآن',
        timeAgoEn: 'Just now',
        location: newsPostForm.location || 'مسار طريق أوباري – غات',
        locationEn: 'Ubari – Ghat Highway Corridor',
        author: newsPostForm.author || 'المكتب الإعلامي - جهاز مشروعات المواصلات',
        authorEn: 'Media Office – Transportation Projects Authority',
        viewsCount: '1,200'
      };
      updated = [newPost, ...localNewsPosts];
      showToast('تمت إضافة ونشر الخبر بمركز الأخبار بنجاح');
    }

    setLocalNewsPosts(updated);
    saveNewsPosts(updated);
    setIsAddNewsPostModalOpen(false);
  };

  const handleDeleteNewsPost = () => {
    if (!newsPostToDelete) return;
    const updated = localNewsPosts.filter(p => p.id !== newsPostToDelete.id);
    setLocalNewsPosts(updated);
    saveNewsPosts(updated);
    showToast('تم حذف الخبر من مركز الأخبار بنجاح');
    setNewsPostToDelete(null);
  };

  // ── Handlers: News Ticker Management ──
  const handleSaveNews = (e) => {
    e.preventDefault();
    if (!newsForm.text.trim()) return;

    let updated;
    if (selectedNewsEditModal) {
      updated = localNews.map(item =>
        item.id === selectedNewsEditModal.id
          ? { ...item, text: newsForm.text.trim(), tag: newsForm.tag, active: newsForm.active }
          : item
      );
      showToast('تم تحديث الخبر في الشريط العلوي بنجاح');
      setSelectedNewsEditModal(null);
    } else {
      const newItem = {
        id: `NEWS-${Date.now()}`,
        text: newsForm.text.trim(),
        tag: newsForm.tag || 'تحديث حي',
        active: newsForm.active,
        date: new Date().toISOString().split('T')[0]
      };
      updated = [newItem, ...localNews];
      showToast('تمت إضافة الخبر ونشره في الشريط العلوي بنجاح');
    }

    setLocalNews(updated);
    localStorage.setItem('portal_ticker_news', JSON.stringify(updated));
    if (setTickerNews) setTickerNews(updated);
    setIsAddNewsModalOpen(false);
    setNewsForm({ text: '', tag: 'تحديث حي', active: true });
  };

  const handleToggleNewsActive = (id) => {
    const updated = localNews.map(item => {
      if (item.id === id) {
        const nextActive = !item.active;
        showToast(nextActive ? 'تم تفعيل ظهور الخبر في الشريط العلوي' : 'تم إيقاف ظهور الخبر من الشريط العلوي');
        return { ...item, active: nextActive };
      }
      return item;
    });
    setLocalNews(updated);
    localStorage.setItem('portal_ticker_news', JSON.stringify(updated));
    if (setTickerNews) setTickerNews(updated);
  };

  const handleDeleteNews = () => {
    if (!newsToDelete) return;
    const updated = localNews.filter(item => item.id !== newsToDelete.id);
    setLocalNews(updated);
    localStorage.setItem('portal_ticker_news', JSON.stringify(updated));
    if (setTickerNews) setTickerNews(updated);
    showToast('تم حذف الخبر من الشريط العلوي');
    setNewsToDelete(null);
  };

  // Contractors ranking list
  const contractorsRanking = [
    { name: 'شركة الطريق السريع', progress: 62.30, color: 'bg-emerald-500' },
    { name: 'شركة الجسر الحديث', progress: 48.20, color: 'bg-emerald-500' },
    { name: 'شركة الطرق الليبية', progress: 42.10, color: 'bg-emerald-500' },
    { name: 'شركة المستقبل للمقاولات', progress: 35.40, color: 'bg-cyan-500' },
    { name: 'شركة التضامن للمقاولات', progress: 28.70, color: 'bg-cyan-500' }
  ];

  // Radial progress calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallPercentage / 100) * circumference;

  // ── Handlers: Reports ──
  const handleAddReport = (e) => {
    e.preventDefault();
    if (!newReport.title) return;
    const item = {
      id: `REP-${String(localReports.length + 1).padStart(2, '0')}`,
      title: newReport.title,
      contractor: newReport.contractor || 'الإدارة العامة للمشروع',
      sector: newReport.sector,
      date: new Date().toISOString().split('T')[0],
      status: 'معتمد',
      type: newReport.type,
      size: '2.5 MB',
      isPublic: true
    };
    const updated = [item, ...localReports];
    setLocalReports(updated);
    localStorage.setItem('portal-dashboard-reports', JSON.stringify(updated));
    setIsAddReportModalOpen(false);
    setNewReport({ title: '', contractor: '', sector: 'القطاع 01', type: 'PDF' });
    showToast('تمت إضافة التقرير واعتماده ونشره بنجاح!');
  };

  const handleToggleReportPublic = (id) => {
    const updated = localReports.map(r => {
      if (r.id === id) {
        const nextState = !r.isPublic;
        showToast(nextState ? `تم نشر التقرير (${r.title}) على البوابة العامة` : `تم حجب التقرير (${r.title}) عن البوابة (داخلي فقط)`);
        return { ...r, isPublic: nextState };
      }
      return r;
    });
    setLocalReports(updated);
    localStorage.setItem('portal-dashboard-reports', JSON.stringify(updated));
  };

  const handleConfirmDeleteReport = () => {
    if (!reportToDelete) return;
    const updated = localReports.filter(r => r.id !== reportToDelete.id);
    setLocalReports(updated);
    localStorage.setItem('portal-dashboard-reports', JSON.stringify(updated));
    showToast(`تم حذف التقرير (${reportToDelete.title}) بنجاح`);
    setReportToDelete(null);
  };

  const handleSaveEditReport = (e) => {
    e.preventDefault();
    if (!selectedReportEditModal) return;
    const updated = localReports.map(r => r.id === selectedReportEditModal.id ? selectedReportEditModal : r);
    setLocalReports(updated);
    localStorage.setItem('portal-dashboard-reports', JSON.stringify(updated));
    setSelectedReportEditModal(null);
    showToast('تم حفظ تعديلات التقرير بنجاح');
  };

  // ── Handler: Ingest Report from Data IO tab ──
  const handleIngestReportFromDataIO = (e) => {
    e.preventDefault();
    if (!importReportForm.title) return;
    const item = {
      id: `REP-${String(localReports.length + 1).padStart(2, '0')}`,
      title: importReportForm.title,
      contractor: importReportForm.contractor || 'الإدارة العامة للمشروع',
      sector: importReportForm.sector,
      date: new Date().toISOString().split('T')[0],
      status: 'قيد المراجعة / مسودة',
      type: importReportForm.type,
      size: importReportForm.size,
      isPublic: false // Content manager decides whether to show on portal!
    };
    const updated = [item, ...localReports];
    setLocalReports(updated);
    localStorage.setItem('portal-dashboard-reports', JSON.stringify(updated));
    setImportReportForm({ title: '', contractor: '', sector: 'القطاع 01', category: 'تقارير الإنجاز', type: 'PDF', size: '3.4 MB' });
    showToast('تم استيراد التقرير وإدراجه بقسم التقارير! بانتظار قرار مدير المحتوى للنشر');
    setActiveSidebarItem('reports');
  };

  // ── Handlers: Photos / Media ──
  const handlePhotoFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('جاري ضغط ومعالجة الصورة بجودة 4K...');
      const dataUrl = await compressImageFile(file, 1600, 1100, 0.82);
      setNewMedia(prev => ({
        ...prev,
        img: dataUrl,
        src: dataUrl,
        title: prev.title || file.name.replace(/\.[^/.]+$/, "")
      }));
      showToast('تم رفع الصورة من جهازك ومعالجتها بدقة 4K بنجاح');
    } catch (err) {
      showToast(err.message || 'تعذر قراءة ملف الصورة، يرجى المحاولة مرة أخرى');
    }
  };

  const handleEditPhotoFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('جاري ضغط ومعالجة الصورة...');
      const dataUrl = await compressImageFile(file, 1600, 1100, 0.82);
      setSelectedPhotoEditModal(prev => ({
        ...prev,
        img: dataUrl,
        src: dataUrl
      }));
      showToast('تم تحديث ملف الصورة ومعالجته بنجاح');
    } catch (err) {
      showToast(err.message || 'تعذر قراءة ملف الصورة');
    }
  };

  const handleAddPhoto = (e) => {
    e.preventDefault();
    if (!newMedia.title.trim()) {
      showToast('يرجى إدخال عنوان الصورة أو موضوع التوثيق');
      return;
    }
    const finalImg = newMedia.img || newMedia.src || '/road-asphalt-paver.jpg';
    const item = {
      id: `PH-${Date.now().toString().slice(-4)}`,
      title: newMedia.title.trim(),
      titleEn: newMedia.title.trim(),
      sector: newMedia.sector || 'القطاع 01: أوباري - الفيوات',
      category: newMedia.category || 'رصف الأسفلت',
      desc: newMedia.desc?.trim() || `توثيق ميداني فوتوغرافي عالي الدقة لأعمال ${newMedia.category} في ${newMedia.sector}.`,
      date: newMedia.date || new Date().toISOString().split('T')[0],
      img: finalImg,
      src: finalImg,
      photographer: newMedia.photographer?.trim() || 'م. الموقع الميداني',
      author: newMedia.photographer?.trim() || 'م. الموقع الميداني'
    };
    const updated = [item, ...localPhotos];
    setLocalPhotos(updated);
    safeStorageSet('portal-field-photos-v2', updated);

    // Sync with executive projects list (portal-national-projects):
    let projects = [...nationalProjects];
    try {
      const savedCustom = safeStorageGet('portal-national-projects', null);
      if (savedCustom && Array.isArray(savedCustom)) {
        projects = savedCustom;
      }
    } catch (err) {}

    if (newMedia.targetProject === 'new') {
      const newProj = {
        id: `PRJ-EXEC-${Date.now().toString().slice(-4)}`,
        title: newMedia.title.trim(),
        titleEn: newMedia.title.trim(),
        region: newMedia.sector || 'القطاع الأول (أوباري - الفيوات)',
        regionEn: newMedia.sector || 'Corridor Sector',
        lengthKm: 35,
        progress: 88,
        status: 'in_progress',
        statusLabel: 'توثيق تنفيذي ميداني 4K',
        statusLabelEn: 'Field Execution',
        statusColor: 'amber',
        budget: 'معتمد وموثق',
        contractor: newMedia.photographer?.trim() || 'م. الموقع الميداني',
        startDate: newMedia.date || new Date().toISOString().split('T')[0],
        targetDate: '2026-12-31',
        image: finalImg,
        desc: newMedia.desc?.trim() || `توثيق تنفيذي ميداني عالي الدقة لأعمال ${newMedia.category} بطريق أوباري - غات.`,
        isFieldDoc: true,
        isCustomUploaded: true,
        specs: {
          thickness: '10-12 سم',
          paved: 'منجز وموثق',
          solarPoles: 'معتمد',
          fleet: 'آليات عاملة',
          qualityScore: '100% مطابقة'
        }
      };
      const updatedProjects = [newProj, ...projects];
      safeStorageSet('portal-national-projects', updatedProjects);
    } else if (newMedia.targetProject) {
      const updatedProjects = projects.map(p => {
        if (p.id === newMedia.targetProject) {
          return { ...p, image: finalImg };
        }
        return p;
      });
      safeStorageSet('portal-national-projects', updatedProjects);
    }

    window.dispatchEvent(new Event('storage'));
    setIsAddMediaModalOpen(false);
    setNewMedia({
      title: '',
      sector: 'القطاع 01: أوباري - الفيوات',
      category: 'رصف الأسفلت',
      img: '/road-asphalt-paver.jpg',
      src: '/road-asphalt-paver.jpg',
      photographer: '',
      desc: '',
      date: new Date().toISOString().split('T')[0],
      targetProject: 'new'
    });
    showToast('تمت إضافة الصورة بنجاح وربطها بالمشروعات التنفيذية والمعرض 4K!');
  };

  const handleConfirmDeletePhoto = () => {
    if (!photoToDelete) return;
    const updated = localPhotos.filter(p => p.id !== photoToDelete.id);
    setLocalPhotos(updated);
    try {
      localStorage.setItem('portal-field-photos-v2', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {}
    showToast(`تم حذف الصورة (${photoToDelete.title}) من المعرض`);
    setPhotoToDelete(null);
  };

  const handleSaveEditPhoto = (e) => {
    e.preventDefault();
    if (!selectedPhotoEditModal) return;
    const finalImg = selectedPhotoEditModal.src || selectedPhotoEditModal.img || '/road-asphalt-paver.jpg';
    const updatedItem = {
      ...selectedPhotoEditModal,
      img: finalImg,
      src: finalImg,
      author: selectedPhotoEditModal.photographer || selectedPhotoEditModal.author || 'م. الموقع الميداني'
    };
    const updated = localPhotos.map(p => p.id === selectedPhotoEditModal.id ? updatedItem : p);
    setLocalPhotos(updated);
    try {
      localStorage.setItem('portal-field-photos-v2', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {}
    setSelectedPhotoEditModal(null);
    showToast('تم حفظ بيانات الصورة بنجاح');
  };

  // ── Handlers: Users / RBAC ──
  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    const item = {
      id: `USR-${String(localUsers.length + 1).padStart(2, '0')}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'نشط',
      permissions: newUser.permissions,
      sectorsAssigned: newUser.sectorsAssigned || 'القطاع 01',
      phone: newUser.phone || '+218 91 000 0000'
    };
    const updated = [...localUsers, item];
    setLocalUsers(updated);
    localStorage.setItem('portal-auth-users', JSON.stringify(updated));
    if (setAuthorizedUsers) setAuthorizedUsers(updated);
    setIsAddUserModalOpen(false);
    setNewUser({ name: '', email: '', role: 'مهندس إشراف موقعي', permissions: 'إدارة وتعديل القطاعات', phone: '', sectorsAssigned: 'القطاع 01' });
    showToast('تم تسجيل وتعيين صلاحيات المستخدم بنجاح!');
  };

  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;
    const updated = localUsers.filter(u => u.id !== userToDelete.id);
    setLocalUsers(updated);
    localStorage.setItem('portal-auth-users', JSON.stringify(updated));
    if (setAuthorizedUsers) setAuthorizedUsers(updated);
    showToast(`تم حذف حساب المستخدم (${userToDelete.name}) بنجاح`);
    setUserToDelete(null);
  };

  const handleSaveEditUser = (e) => {
    e.preventDefault();
    if (!selectedUserEditModal) return;
    const updated = localUsers.map(u => u.id === selectedUserEditModal.id ? selectedUserEditModal : u);
    setLocalUsers(updated);
    localStorage.setItem('portal-auth-users', JSON.stringify(updated));
    if (setAuthorizedUsers) setAuthorizedUsers(updated);
    setSelectedUserEditModal(null);
    showToast('تم حفظ تعديلات المستخدم والصلاحيات بنجاح');
  };

  // ── Handlers: Sectors ──
  const handleAddSector = (e) => {
    e.preventDefault();
    if (!newSector.name) return;
    const item = {
      id: `SEC-${String(localSectors.length + 1).padStart(2, '0')}`,
      name: newSector.name,
      lengthKm: Number(newSector.lengthKm) || 30,
      progress: Number(newSector.progress) || 0,
      contractor: newSector.contractor || 'شركة الطرق الوطنية',
      residentEngineer: newSector.residentEngineer || 'م. مهندس معتمد',
      status: Number(newSector.progress) > 70 ? 'متقدم جداً' : Number(newSector.progress) > 40 ? 'وفق الجدول' : 'متوسطة',
      statusColor: Number(newSector.progress) > 50 ? 'emerald' : 'amber',
      thickness: Number(newSector.thickness) || 10,
      machinery: 25,
      workers: 80
    };
    const updated = [...localSectors, item];
    setLocalSectors(updated);
    if (setSectors) setSectors(updated);
    localStorage.setItem('portal-sectors-12', JSON.stringify(updated));
    setIsAddSectorModalOpen(false);
    setNewSector({ name: '', lengthKm: 30, progress: 50, contractor: '', residentEngineer: '', thickness: 10 });
    showToast('تمت إضافة القطاع الهندسي بنجاح!');
  };

  const handleUpdateSectorProgress = (id, newProg) => {
    const updated = localSectors.map(s => s.id === id ? { ...s, progress: Number(newProg) } : s);
    setLocalSectors(updated);
    if (setSectors) setSectors(updated);
    localStorage.setItem('portal-sectors-12', JSON.stringify(updated));
    showToast(`تم تحديث نسبة الإنجاز للقطاع ${id} إلى ${newProg}%`);
  };

  // ── Handler: Export Backup JSON ──
  const handleExportBackup = () => {
    const backupData = {
      project: 'مشروع طريق أوباري - غات 360 كم',
      timestamp: new Date().toISOString(),
      summary: summaryData,
      sectors: localSectors,
      reports: localReports,
      photos: localPhotos,
      users: localUsers
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ubari-ghat-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('تم تصدير النسخة الاحتياطية بنجاح!');
  };

  // ── Handler: Import Backup JSON ──
  const fileInputRef = useRef(null);
  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.sectors) {
          setLocalSectors(parsed.sectors);
          localStorage.setItem('portal-sectors-12', JSON.stringify(parsed.sectors));
          if (setSectors) setSectors(parsed.sectors);
        }
        if (parsed.reports) {
          setLocalReports(parsed.reports);
          localStorage.setItem('portal-dashboard-reports', JSON.stringify(parsed.reports));
        }
        if (parsed.photos) {
          setLocalPhotos(parsed.photos);
          localStorage.setItem('portal-field-photos-v2', JSON.stringify(parsed.photos));
        }
        if (parsed.users) {
          setLocalUsers(parsed.users);
          localStorage.setItem('portal-auth-users', JSON.stringify(parsed.users));
        }
        showToast('تمت استعادة البيانات بنجاح وتحديث كافة المؤشرات!');
      } catch (err) {
        alert('الملف غير صالح أو تالف');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-800 font-sans flex flex-col antialiased select-none" dir="rtl">
      
      {/* ── Top Header Navigation Bar (Dark Navy Theme) ── */}
      <header className="bg-[#0A1128] text-white px-4 sm:px-6 py-2.5 flex items-center justify-between border-b border-[#1E293B] shadow-md z-30 flex-shrink-0">
        
        {/* Right side: Project Title & Emblem */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-amber-500/80 p-0.5 bg-white flex items-center justify-center shadow-md flex-shrink-0">
            <img src="/logo-agency.jpg" alt="جهاز تنفيذ مشروعات المواصلات" className="w-full h-full object-contain rounded-full" />
          </div>
          <div className="text-start">
            <h1 className="font-black text-sm sm:text-base tracking-wide text-white flex items-center gap-2">
              <span>مشروع طريق أوباري – غات 360 كم</span>
            </h1>
            <span className="text-[11px] text-amber-400 font-bold block">
              جهاز تنفيذ مشروعات المواصلات
            </span>
          </div>
        </div>

        {/* Left side: User Profile & Actions */}
        <div className="flex items-center gap-4">
          {/* Fullscreen Icon */}
          <div className="hidden sm:flex items-center gap-2 text-slate-300">
            <button
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => {});
                } else {
                  document.exitFullscreen().catch(() => {});
                }
              }}
              title="ملء الشاشة"
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 pr-2 border-r border-white/15">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-amber-400/60 flex-shrink-0 bg-slate-700">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={user?.name || 'أحمد محمد'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-start hidden sm:block">
              <div className="font-bold text-xs text-white leading-tight">{user?.name || 'أحمد محمد'}</div>
              <div className="text-[10px] text-slate-400 font-medium">مدير النظام</div>
            </div>
          </div>

          {/* Return to Public Portal Button */}
          {onBackToPortal && (
            <button
              onClick={onBackToPortal}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>العودة للبوابة</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

      </header>

      {/* ── Toast Notification Banner ── */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[200] bg-slate-950 text-white px-5 py-2.5 rounded-2xl shadow-2xl border border-amber-500/50 flex items-center gap-2.5 text-xs font-bold animate-scaleUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Main Workspace Body (Sidebar + Content Canvas) ── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ── Right Sidebar Navigation (Dark Navy `#0A1128`) ── */}
        <aside className="w-64 bg-[#0A1128] text-slate-300 flex flex-col justify-between border-l border-[#1E293B] shadow-xl flex-shrink-0 select-none overflow-y-auto">
          
          {/* Navigation Links List */}
          <nav className="p-2.5 space-y-1 overflow-y-auto flex-1 text-xs font-bold">
            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSidebarItem === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSidebarItem(item.id)}
                  className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#E5A93C] text-slate-950 font-black shadow-md shadow-amber-500/20 scale-[1.01]'
                      : 'hover:bg-white/10 hover:text-white text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${
                        isActive
                          ? 'bg-slate-950 text-amber-300 border-slate-800'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-slate-950"></span>}
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Bottom Logout Button */}
          <div className="p-3 border-t border-white/10">
            <button
              onClick={() => {
                if (onLogout) onLogout();
                if (onBackToPortal) onBackToPortal();
              }}
              className="w-full px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/15 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>تسجيل الخروج</span>
            </button>
          </div>

        </aside>

        {/* ── Main Content View Canvas (Light Slate Background `#F0F4F8`) ── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Breadcrumb Header Bar */}
          <div className="flex items-center justify-between">
            <div className="text-start space-y-0.5">
              <div className="flex items-center gap-2 text-slate-800">
                <h2 className="text-xl sm:text-2xl font-black">
                  {sidebarNavItems.find(i => i.id === activeSidebarItem)?.label || 'الصور والفيديو'}
                </h2>
                <div className="w-7 h-7 rounded-lg bg-[#0A1128] text-white flex items-center justify-center">
                  {activeSidebarItem === 'news' ? <Newspaper className="w-4 h-4 text-amber-400" /> : <ImageIcon className="w-4 h-4 text-amber-400" />}
                </div>
              </div>
              <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <span>لوحة التحكم</span>
                <ChevronLeft className="w-3 h-3 text-slate-400" />
                <span className="text-slate-800 font-bold">
                  {sidebarNavItems.find(i => i.id === activeSidebarItem)?.label || 'الصور والفيديو'}
                </span>
              </div>
            </div>

            {/* Actions Bar per active view */}
            <div className="flex items-center gap-2">
              {activeSidebarItem === 'executive-projects' && (
                <button
                  onClick={() => {
                    setExecutiveProjectForm({
                      title: '',
                      region: 'فزان (أوباري - غات)',
                      progress: 68.5,
                      status: 'in_progress',
                      contractor: 'ائتلاف شركات الطرق الوطنية',
                      image: '/road-aerial-highway.jpg',
                      desc: 'مشروع صيانة وتأهيل المسار الاستراتيجي مع تطبيق أعلى معايير الجودة والسلامة.'
                    });
                    setSelectedExecutiveProjectEditModal(null);
                    setIsAddExecutiveProjectModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة مشروع تنفيذي للمسار</span>
                </button>
              )}
              {(activeSidebarItem === 'news-center' || activeSidebarItem === 'news') && (
                <button
                  onClick={() => {
                    if (newsCenterSubTab === 'posts') {
                      setNewsPostForm({
                        title: '',
                        category: 'رصف الأسفلت',
                        desc: '',
                        image: '/road-asphalt-paver.jpg',
                        author: 'المكتب الإعلامي - جهاز مشروعات المواصلات',
                        location: 'مسار طريق أوباري – غات'
                      });
                      setSelectedNewsPostEditModal(null);
                      setIsAddNewsPostModalOpen(true);
                    } else {
                      setNewsForm({ text: '', tag: 'تحديث حي', active: true });
                      setSelectedNewsEditModal(null);
                      setIsAddNewsModalOpen(true);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{newsCenterSubTab === 'posts' ? 'إضافة خبر مصور جديد' : 'إضافة خبر للشريط العلوي'}</span>
                </button>
              )}
              {activeSidebarItem === 'media' && (
                <button
                  onClick={() => setIsAddMediaModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <ImagePlus className="w-4 h-4" />
                  <span>إضافة صورة جديدة</span>
                </button>
              )}

              {/* Quick Live Clock / Date */}
              <div className="text-xs font-mono font-bold text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
                20/08/2026 • 13:00 GMT+2
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════════════════
              VIEW 1: HOME (المظهر الرئيسي المتطابق مع الصورة)
          ══════════════════════════════════════════════════════════════════════════════ */}
          {activeSidebarItem === 'home' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* ── ROW 1: TOP 4 KPI CARDS ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Card 1: Radial Progress Gauge */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="space-y-1 text-start">
                    <span className="text-xs font-bold text-slate-600">نسبة الإنجاز العامة</span>
                    <div className="text-2xl font-black font-mono text-amber-500">{overallPercentage}%</div>
                    <div className="text-[10px] text-slate-400 font-mono">التاريخ: 20/08/2026</div>
                  </div>

                  {/* Mini SVG Donut Chart */}
                  <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r={radius} stroke="#0A1128" strokeWidth="12" fill="transparent" />
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        stroke="#FBBF24"
                        strokeWidth="12"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                  </div>
                </div>

                {/* Card 2: المنفذ (Executed Distance) */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="space-y-1 text-start">
                    <span className="text-xs font-bold text-slate-600">المنفذ</span>
                    <div className="text-2xl font-black font-mono text-emerald-600">{executedKm} كم</div>
                    <div className="text-[10px] text-slate-400">من إجمالي {totalLength} كم</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
                    <Layers className="w-6 h-6" />
                  </div>
                </div>

                {/* Card 3: المتبقي (Remaining Distance) */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="space-y-1 text-start">
                    <span className="text-xs font-bold text-slate-600">المتبقي</span>
                    <div className="text-2xl font-black font-mono text-red-500">{remainingKm} كم</div>
                    <div className="text-[10px] text-slate-400">من إجمالي {totalLength} كم</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
                    <Layers className="w-6 h-6" />
                  </div>
                </div>

                {/* Card 4: إجمالي قيمة المشروع (Total Project Budget) */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="space-y-1 text-start">
                    <span className="text-xs font-bold text-slate-600">إجمالي قيمة المشروع</span>
                    <div className="text-xl sm:text-2xl font-black font-mono text-blue-600">1,248,000,000</div>
                    <div className="text-[10px] text-slate-400">دينار ليبي</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
                    <Database className="w-6 h-6" />
                  </div>
                </div>

              </div>

              {/* ── ROW 2: 5 QUICK STATS COUNTERS ── */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { label: 'عدد المستخدمين', count: String(localUsers.length), unit: 'مستخدم', icon: Users, bg: 'bg-purple-50', text: 'text-purple-600', action: 'users' },
                  { label: 'عدد القطاعات', count: String(localSectors.length), unit: 'قطاع', icon: Layers, bg: 'bg-blue-50', text: 'text-blue-600', action: 'sectors' },
                  { label: 'عدد الشركات', count: '18', unit: 'شركة', icon: Building2, bg: 'bg-amber-50', text: 'text-amber-600', action: 'contractors' },
                  { label: 'عدد الصور', count: String(localPhotos.length), unit: 'صورة 4K', icon: ImageIcon, bg: 'bg-emerald-50', text: 'text-emerald-600', action: 'media' },
                  { label: 'عدد التقارير', count: String(localReports.length), unit: 'تقرير', icon: FileText, bg: 'bg-purple-50', text: 'text-purple-600', action: 'reports' }
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      onClick={() => setActiveSidebarItem(stat.action)}
                      className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all hover:scale-[1.02]"
                    >
                      <div className="text-start space-y-0.5">
                        <span className="text-[11px] font-bold text-slate-500 block">{stat.label}</span>
                        <div className="text-lg font-black font-mono text-slate-900">{stat.count}</div>
                        <span className="text-[10px] text-slate-400">{stat.unit}</span>
                      </div>
                      <div className={`w-9 h-9 rounded-xl ${stat.bg} ${stat.text} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── ROW 3: MAIN ANALYTICS & CHARTS GRID ── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Column 1 (3 Cols): آخر التقارير المرفوعة */}
                <div className="lg:col-span-3 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between text-start">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                      <h3 className="font-black text-sm text-slate-800">آخر التقارير المرفوعة</h3>
                      <button
                        onClick={() => setActiveSidebarItem('reports')}
                        className="text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-2 py-1 rounded-lg cursor-pointer"
                      >
                        عرض الكل
                      </button>
                    </div>

                    {/* List of Reports */}
                    <div className="space-y-2">
                      {localReports.slice(0, 5).map((rep) => (
                        <div
                          key={rep.id}
                          onClick={() => setSelectedReportModal(rep)}
                          className="p-2.5 rounded-xl border border-slate-100 hover:border-amber-300 hover:bg-amber-50/40 transition-all flex items-center justify-between text-xs cursor-pointer"
                        >
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-800 text-[11px] line-clamp-1">{rep.title}</div>
                            <div className="text-[10px] text-slate-400">{rep.contractor}</div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${rep.isPublic ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {rep.isPublic ? 'معروض' : 'مسودة'}
                            </span>
                            {rep.type === 'PDF' ? (
                              <FileText className="w-4 h-4 text-red-500" />
                            ) : (
                              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Button */}
                  <button
                    onClick={() => setActiveSidebarItem('reports')}
                    className="w-full py-2 rounded-xl bg-[#0A1128] hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    جميع التقارير
                  </button>
                </div>

                {/* Column 2 (6 Cols): المخطط مقابل المنفذ (S-Curve) */}
                <div className="lg:col-span-6 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4 text-start">
                  <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                    <div>
                      <h3 className="font-black text-sm sm:text-base text-slate-800">المخطط مقابل المنفذ</h3>
                      <span className="text-[10px] text-slate-400">تتبع مسار رصف الـ 360 كم على مدار الأشهر</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Legend */}
                      <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold">
                        <span className="flex items-center gap-1 text-cyan-600">
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                          <span>المخطط</span>
                        </span>
                        <span className="flex items-center gap-1 text-emerald-600">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                          <span>المنفذ</span>
                        </span>
                      </div>

                      <select
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 outline-none cursor-pointer"
                      >
                        <option value="2026">هذه السنة 2026</option>
                        <option value="2025">سنة 2025</option>
                      </select>
                    </div>
                  </div>

                  {/* Recharts Area / Line Chart */}
                  <div className="h-56 w-full" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={yearFilter === '2026' ? progressCurveData2026 : progressCurveData2025} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#64748B' }} domain={[0, 400]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0A1128', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="planned"
                          stroke="#06B6D4"
                          strokeWidth={2.5}
                          strokeDasharray="4 4"
                          dot={{ r: 3, fill: '#06B6D4' }}
                          name="المخطط (كم)"
                        />
                        <Area
                          type="monotone"
                          dataKey="actual"
                          stroke="#10B981"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorActual)"
                          dot={{ r: 4, fill: '#10B981' }}
                          name="المنفذ (كم)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Bottom 4 Metric Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center font-mono">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-sans block">نسبة الإنجاز</span>
                      <strong className="text-xs font-black text-amber-500">{overallPercentage}%</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-sans block">المخطط</span>
                      <strong className="text-xs font-black text-slate-700">{totalLength} كم</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-sans block">المنفذ</span>
                      <strong className="text-xs font-black text-emerald-600">{executedKm} كم</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-sans block">المتبقي</span>
                      <strong className="text-xs font-black text-red-500">{remainingKm} كم</strong>
                    </div>
                  </div>
                </div>

                {/* Column 3 (3 Cols): نسبة الإنجاز حسب نوع العمل */}
                <div className="lg:col-span-3 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between text-start">
                  <div className="space-y-3">
                    <div className="border-b pb-2 border-slate-100">
                      <h3 className="font-black text-sm text-slate-800">نسبة الإنجاز حسب نوع العمل</h3>
                    </div>

                    {/* Donut Chart */}
                    <div className="relative h-40 w-full flex items-center justify-center" dir="ltr">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={workTypeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {workTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className="text-sm font-black font-mono text-slate-900">{overallPercentage}%</span>
                        <span className="text-[9px] text-slate-400 font-bold">الإجمالي</span>
                      </div>
                    </div>

                    {/* Breakdown Legend Items */}
                    <div className="space-y-1.5 text-[10px]">
                      {workTypeData.map((item) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-600 font-medium truncate">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="truncate">{item.name}</span>
                          </span>
                          <span className="font-mono font-black text-slate-800">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Button */}
                  <button
                    onClick={() => setIsWorkDetailsModalOpen(true)}
                    className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                  >
                    عرض التفاصيل
                  </button>
                </div>

              </div>

              {/* ── ROW 4: BOTTOM 3 WIDGETS ── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Widget 1 (4 Cols): آخر الصور الميدانية */}
                <div className="lg:col-span-4 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 text-start">
                  <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                    <h3 className="font-black text-sm text-slate-800 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-amber-500" />
                      <span>آخر الصور الميدانية</span>
                    </h3>
                    <button
                      onClick={() => setActiveSidebarItem('media')}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-2 py-0.5 rounded cursor-pointer"
                    >
                      عرض الكل
                    </button>
                  </div>

                  {/* 4 Photo Thumbnails Grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {localPhotos.slice(0, 4).map((photo) => (
                      <div
                        key={photo.id}
                        onClick={() => setSelectedPhotoModal(photo)}
                        className="rounded-xl overflow-hidden border border-slate-200 relative group cursor-pointer h-24 shadow-sm"
                      >
                        <img src={photo.img} alt={photo.title} className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-1.5 text-[9px] text-white font-mono">
                          <span className="font-bold text-amber-300">{photo.sector}</span>
                          <span className="text-slate-300">{photo.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Widget 2 (4 Cols): حالة القطاعات */}
                <div className="lg:col-span-4 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 text-start">
                  <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                    <h3 className="font-black text-sm text-slate-800">حالة القطاعات</h3>
                    <button
                      onClick={() => setActiveSidebarItem('sectors')}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-2 py-1 rounded-lg cursor-pointer"
                    >
                      عرض الكل
                    </button>
                  </div>

                  <div className="grid grid-cols-12 items-center gap-2">
                    {/* Donut Chart */}
                    <div className="col-span-6 relative h-32 flex items-center justify-center" dir="ltr">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={sectorsStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={36}
                            outerRadius={52}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {sectorsStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className="text-sm font-black font-mono text-slate-900">{localSectors.length}</span>
                        <span className="text-[9px] text-slate-400 font-bold">قطاع</span>
                      </div>
                    </div>

                    {/* Status Breakdown Legend */}
                    <div className="col-span-6 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-bold text-slate-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>3 قطاع</span>
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold">ممتاز</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-bold text-slate-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          <span>5 قطاع</span>
                        </span>
                        <span className="text-[10px] text-emerald-500 font-bold">وفق الجدول</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-bold text-slate-700">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          <span>3 قطاع</span>
                        </span>
                        <span className="text-[10px] text-amber-500 font-bold">متوسطة</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-bold text-slate-700">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          <span>1 قطاع</span>
                        </span>
                        <span className="text-[10px] text-red-500 font-bold">ضعيفة</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Widget 3 (4 Cols): الشركات - نسب الإنجاز */}
                <div className="lg:col-span-4 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 text-start">
                  <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                    <h3 className="font-black text-sm text-slate-800">الشركات – نسب الإنجاز</h3>
                    <button
                      onClick={() => setActiveSidebarItem('contractors')}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-2 py-1 rounded-lg cursor-pointer"
                    >
                      عرض الكل
                    </button>
                  </div>

                  {/* Progress ranking list */}
                  <div className="space-y-2.5">
                    {contractorsRanking.map((item) => (
                      <div key={item.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700 truncate">{item.name}</span>
                          <span className="font-mono font-black text-slate-900">{item.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.progress}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════════════
              VIEW 2: SECTORS MANAGER (12 قطاع)
          ══════════════════════════════════════════════════════════════════════════════ */}
          {activeSidebarItem === 'sectors' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 animate-fadeIn text-start">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900">إدارة قطاعات الطريق ومراحل الرصف (12 قطاع)</h3>
                  <p className="text-xs text-slate-500">تعديل نسب الإنجاز الحية وسُمك الأسفلت والمهندس المقيم مباشرة</p>
                </div>
                <button
                  onClick={() => setIsAddSectorModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-sm cursor-pointer self-start"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة قطاع جديد</span>
                </button>
              </div>

              {/* Sectors Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <th className="p-3">الرمز</th>
                      <th className="p-3">اسم القطاع</th>
                      <th className="p-3">الطول (كم)</th>
                      <th className="p-3">نسبة الإنجاز الفعلية</th>
                      <th className="p-3">الشركة المنفذة</th>
                      <th className="p-3">المهندس المقيم</th>
                      <th className="p-3">سُمك الأسفلت</th>
                      <th className="p-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {localSectors.map((sec) => (
                      <tr key={sec.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-amber-600">{sec.id}</td>
                        <td className="p-3 font-bold text-slate-900">{sec.name}</td>
                        <td className="p-3 font-mono">{sec.lengthKm} كم</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={sec.progress}
                              onChange={(e) => handleUpdateSectorProgress(sec.id, e.target.value)}
                              className="w-24 accent-amber-500 cursor-pointer"
                            />
                            <span className="font-mono font-black text-xs text-amber-600 min-w-[40px]">{sec.progress}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-700">{sec.contractor}</td>
                        <td className="p-3 text-slate-500">{sec.residentEngineer}</td>
                        <td className="p-3 font-mono text-cyan-600 font-bold">{sec.thickness} سم</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sec.progress > 70 ? 'bg-emerald-100 text-emerald-700' : sec.progress > 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {sec.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════════════
              VIEW 3: REPORTS & TRANSPARENCY (الشفافية والتقارير - خاص بمدير المشروع فقط)
          ══════════════════════════════════════════════════════════════════════════════ */}
          {activeSidebarItem === 'reports' && (
            !isProjectManager ? (
              /* Access Denied for Non-Project-Manager users */
              <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm text-center max-w-xl mx-auto my-12 space-y-5 animate-fadeIn">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 mx-auto shadow-sm">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900">
                    صلاحية مقيدة: خاص بمدير المشروع فقط
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                    تم نقل منظومة الشفافية والمتابعة، وتقارير الإنجاز الشهرية، وكشوفات المستخلصات المالية، وكراسات ضبط الجودة إلى هذا القسم، وهي مخصصة حصرياً لاطلاع واعتماد <strong>مدير المشروع</strong>.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 inline-block">
                  <span>الحساب المسجل حالياً: </span>
                  <strong className="text-slate-900">{user?.name || 'مستخدم غير محدد'}</strong>
                  <span className="mx-2">•</span>
                  <span className="text-amber-700 font-bold">{user?.role || 'مستخدم عام'}</span>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setDemoPmAccess(true);
                      showToast('تم التبديل بنجاح إلى صلاحية مدير المشروع المعتمدة');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs inline-flex items-center gap-2 cursor-pointer shadow-md transition-transform hover:scale-105"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>التبديل إلى صلاحية مدير المشروع وعرض منظومة الشفافية</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Full Reports & Transparency Hub for Project Manager */
              <div className="space-y-8 animate-fadeIn text-start">
                
                {/* Executive Header Banner */}
                <div className="bg-gradient-to-r from-[#0A1128] via-[#0E1A38] to-[#1E293B] text-white rounded-3xl p-6 sm:p-8 border border-white/10 shadow-lg relative overflow-hidden">
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 mb-2">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>منظومة الشفافية والمتابعة الرسمية • صلاحية مدير المشروع المعتمدة</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black">
                        قسم الشفافية والمتابعة والتقارير التنفيذية
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                        الاطلاع الحصري لمدير المشروع على تقارير الإنجاز الشهرية الشاملة، المستخلصات المالية، نتائج الفحوصات المعملية لعينات الأسفلت والدمك، والتوثيق البصري الميداني لطريق أوباري – غات (360 كم).
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => setIsAddReportModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إيداع تقرير جديد</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section A: Integrated Document Reports & Transparency Hub */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                  <DocumentReportsHub documents={documents} theme="light" lang={lang} />
                </div>

                {/* Section B: Reports Management & Ledger Table */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-100">
                    <div>
                      <h3 className="text-base font-black text-slate-900">سجل التقارير الإدارية والتنفيذية المودعة</h3>
                      <p className="text-xs text-slate-500">إدارة التقارير المرفوعة والتحكم بقرار مدير المشروع في تصنيفها داخلياً أو إتاحتها</p>
                    </div>
                    <button
                      onClick={() => setIsAddReportModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-[#0A1128] hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer self-start"
                    >
                      <Plus className="w-4 h-4 text-amber-400" />
                      <span>رفع تقرير جديد</span>
                    </button>
                  </div>

                  {/* Reports Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-start">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                          <th className="p-3">كود التقرير</th>
                          <th className="p-3">عنوان التقرير</th>
                          <th className="p-3">القطاع</th>
                          <th className="p-3">الجهة المصدرة</th>
                          <th className="p-3">تاريخ الإيداع</th>
                          <th className="p-3">حالة الإتاحة</th>
                          <th className="p-3">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {localReports.map((rep) => (
                          <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 font-mono font-bold text-amber-600">{rep.id}</td>
                            <td className="p-3 font-bold text-slate-900">
                              <div className="flex items-center gap-1.5">
                                {rep.type === 'PDF' ? <FileText className="w-4 h-4 text-red-500 flex-shrink-0" /> : <FileSpreadsheet className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                                <span>{rep.title}</span>
                              </div>
                            </td>
                            <td className="p-3 text-slate-600">{rep.sector}</td>
                            <td className="p-3 text-slate-700">{rep.contractor}</td>
                            <td className="p-3 font-mono text-slate-500">{rep.date}</td>
                            
                            {/* Toggle */}
                            <td className="p-3">
                              <button
                                onClick={() => handleToggleReportPublic(rep.id)}
                                className={`px-3 py-1.5 rounded-xl font-black text-[10px] flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                                  rep.isPublic
                                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                    : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                                }`}
                                title="تبديل تصنيف التقرير"
                              >
                                {rep.isPublic ? (
                                  <>
                                    <Globe2 className="w-3.5 h-3.5" />
                                    <span>متاح بالمنظومة</span>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>داخلي خاص</span>
                                  </>
                                )}
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setSelectedReportModal(rep)}
                                  className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer"
                                  title="عرض التفاصيل"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setSelectedReportEditModal({ ...rep })}
                                  className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 transition-colors cursor-pointer"
                                  title="تعديل التقرير"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setReportToDelete(rep)}
                                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                                  title="حذف التقرير"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => showToast(`جاري تحميل الملف: ${rep.title}`)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                  title="تحميل الملف"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )
          )}

          {/* ══════════════════════════════════════════════════════════════════════════════
              VIEW 4: MEDIA & PHOTOS (الصور والفيديو مع العرض والتعديل والرفع والحذف)
          ══════════════════════════════════════════════════════════════════════════════ */}
          {activeSidebarItem === 'media' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 animate-fadeIn text-start">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900">معرض التوثيق البصري الميداني (4K Media Gallery)</h3>
                  <p className="text-xs text-slate-500">إدارة وعرض وتعديل وحذف الصور الفوتوغرافية عالية الدقة للمشروع</p>
                </div>
                <button
                  onClick={() => setIsAddMediaModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-sm cursor-pointer self-start"
                >
                  <ImagePlus className="w-4 h-4" />
                  <span>إضافة صورة جديدة</span>
                </button>
              </div>

              {/* Photo Cards Grid with Full Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {localPhotos.map((photo) => (
                  <div key={photo.id} className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 shadow-sm hover:border-amber-400 transition-all group flex flex-col justify-between">
                    <div>
                      <div className="relative h-44 overflow-hidden bg-black cursor-pointer" onClick={() => setSelectedPhotoModal(photo)}>
                        <img src={photo.src || photo.img || '/road-asphalt-paver.jpg'} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-amber-300 text-[10px] font-bold font-mono">
                          {photo.sector}
                        </div>
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px]">
                          {photo.category}
                        </div>
                      </div>

                      <div className="p-4 space-y-1.5 text-start">
                        <h4 className="font-black text-xs text-slate-900 line-clamp-1">{photo.title}</h4>
                        <div className="text-[10px] text-slate-500 flex items-center justify-between">
                          <span>المصور: {photo.photographer || photo.author || 'م. الموقع'}</span>
                          <span className="font-mono">{photo.date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedPhotoModal(photo)}
                        className="flex-1 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>عرض 4K</span>
                      </button>
                      <button
                        onClick={() => setSelectedPhotoEditModal({ ...photo })}
                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 cursor-pointer"
                        title="تعديل الصورة"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setPhotoToDelete(photo)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                        title="حذف الصورة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════════════
              VIEW: EXECUTIVE CORRIDOR PROJECTS (المشروعات التنفيذية لمسار طريق أوباري - غات)
          ══════════════════════════════════════════════════════════════════════════════ */}
          {activeSidebarItem === 'executive-projects' && (
            <div className="space-y-6 animate-fadeIn text-start">
              
              {/* Header Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <span>المشروعات التنفيذية لمسار طريق أوباري – غات</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                          ربط مباشر مع البوابة العامة
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        التحكم الشامل في مشروعات المسار المعروضة للمواطنين بالبوابة (تعديل نسب الإنجاز، الشركات، التفاصيل، الحذف، والإضافة الفورية)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setExecutiveProjectForm({
                        title: '',
                        region: 'فزان (أوباري - غات)',
                        progress: 68.5,
                        status: 'in_progress',
                        contractor: 'ائتلاف شركات الطرق الوطنية',
                        image: '/road-aerial-highway.jpg',
                        desc: 'مشروع صيانة وتأهيل المسار الاستراتيجي مع تطبيق أعلى معايير الجودة والسلامة.'
                      });
                      setSelectedExecutiveProjectEditModal(null);
                      setIsAddExecutiveProjectModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة مشروع تنفيذي جديد</span>
                  </button>
                </div>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-start space-y-1">
                  <span className="text-xs font-bold text-slate-500 block">إجمالي المشروعات التنفيذية</span>
                  <div className="text-2xl font-black font-mono text-slate-900">{localExecutiveProjects.length}</div>
                  <span className="text-[10px] text-slate-400 font-medium">مشروعات مدرجة بالبوابة</span>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-start space-y-1">
                  <span className="text-xs font-bold text-slate-500 block">متوسط نسبة الإنجاز</span>
                  <div className="text-2xl font-black font-mono text-amber-600">
                    {localExecutiveProjects.length > 0 
                      ? Math.round(localExecutiveProjects.reduce((acc, p) => acc + (Number(p.progress) || 0), 0) / localExecutiveProjects.length)
                      : 0}%
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">متابعة هندسية ميدانية</span>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-start space-y-1">
                  <span className="text-xs font-bold text-slate-500 block">مشروعات جارية</span>
                  <div className="text-2xl font-black font-mono text-blue-600">
                    {localExecutiveProjects.filter(p => p.status !== 'completed').length}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">تحت الأعمال الإنشائية</span>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-start space-y-1">
                  <span className="text-xs font-bold text-slate-500 block">مشروعات منجزة / متقدمة</span>
                  <div className="text-2xl font-black font-mono text-emerald-600">
                    {localExecutiveProjects.filter(p => p.status === 'completed' || Number(p.progress) >= 70).length}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">أعلى من 70% أو مكتمل</span>
                </div>
              </div>

              {/* ── Featured Hero Showcase Card Manager (التحكم في بطاقة الواجهة الرئيسية) ── */}
              <div className="bg-gradient-to-br from-slate-900 via-[#0b101e] to-slate-900 rounded-3xl p-6 sm:p-7 border border-amber-500/30 shadow-xl text-white relative overflow-hidden">
                {/* Ambient Decorative Glows */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  
                  {/* Left Column: Description & Action */}
                  <div className="space-y-3.5 max-w-xl text-start">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-full text-[11px] font-black bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/25">
                        <Crown className="w-3.5 h-3.5" />
                        <span>بطاقة الواجهة الرئيسية (Hero Showcase)</span>
                      </span>
                      <span className="text-xs text-amber-300 font-bold flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>معروضة في صدارة البوابة العامة</span>
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                      لوحة الموقف التنفيذي الميداني المعتمد
                    </h3>
                    
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                      هذه هي البطاقة الإدارية الاستراتيجية البارزة التي تظهر للمواطنين والزوار في أعلى صفحة الموقع الرئيسية بجوار عنوان المشروع. يمكنك تغيير صورتها (برفع صورة جديدة من جهازك)، تعديل عنوانها، وسمها، نسبة إنجازها، ومؤشرات مسارها في أي وقت بنقرة واحدة.
                    </p>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={() => {
                          setHeroCardForm({ ...localHeroCard });
                          setIsEditHeroCardModalOpen(true);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/30 cursor-pointer transition-all hover:scale-105"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>تعديل بيانات وصورة بطاقة الواجهة</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Live Interactive Preview */}
                  <div className="w-full lg:w-80 flex-shrink-0">
                    <div className="text-[11px] font-bold text-amber-400 mb-2.5 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>المعاينة الحية للبطاقة بالواجهة:</span>
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">● متصل بالبوابة</span>
                    </div>
                    
                    <div className="w-full rounded-2xl overflow-hidden border border-white/15 bg-[#070b14] shadow-2xl text-start group">
                      <div className="h-40 relative overflow-hidden">
                        <img 
                          src={localHeroCard.image || "/road-asphalt-paver.jpg"} 
                          alt="Hero Card" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-black/30 to-transparent" />
                        <div className="absolute bottom-2.5 start-3 end-3 text-white">
                          <span className="text-[10px] font-bold text-amber-400 block mb-0.5">
                            {localHeroCard.tag || 'الموقف التنفيذي الميداني المعتمد'}
                          </span>
                          <h4 className="text-xs font-black truncate text-white">
                            {localHeroCard.title || 'أعمال رصف وتأهيل مسار 360 كم'}
                          </h4>
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-400">نسبة الإنجاز الفعلي:</span>
                            <span className="font-mono font-black text-amber-400 text-sm">{localHeroCard.progress ?? 68.5}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${localHeroCard.progress ?? 68.5}%` }} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-white/10 text-[11px]">
                          <div>
                            <span className="text-slate-400 block text-[10px]">المسافة:</span>
                            <strong className="text-slate-200 font-bold">{localHeroCard.distance || '360 كيلومتراً'}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">الجهة المشرفة:</span>
                            <strong className="text-slate-200 font-bold truncate block">{localHeroCard.supervisor || 'مشروعات المواصلات'}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">تاريخ البدء:</span>
                            <strong className="text-slate-200 font-bold font-mono">{localHeroCard.startDate || 'يناير 2025'}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">الموعد المخطط:</span>
                            <strong className="text-emerald-400 font-bold font-mono">{localHeroCard.completionDate || 'ديسمبر 2026'}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {localExecutiveProjects.map((project) => {
                  const progressVal = Number(project.progress) || 0;
                  return (
                    <div
                      key={project.id}
                      className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-all flex flex-col group"
                    >
                      {/* Image Header with Badge */}
                      <div className="relative h-48 bg-slate-950 overflow-hidden">
                        <img
                          src={project.image || '/road-aerial-highway.jpg'}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />
                        
                        {/* Top Badges */}
                        <div className="absolute top-3 right-3 flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-slate-900/80 text-amber-300 backdrop-blur-md border border-amber-500/30">
                            {project.id}
                          </span>
                          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black backdrop-blur-md border ${
                            project.status === 'completed'
                              ? 'bg-emerald-600/90 text-white border-emerald-400/40'
                              : progressVal > 70
                              ? 'bg-blue-600/90 text-white border-blue-400/40'
                              : 'bg-amber-600/90 text-white border-amber-400/40'
                          }`}>
                            {project.statusLabel || (project.status === 'completed' ? 'مكتمل' : 'جاري التنفيذ')}
                          </span>
                        </div>

                        {/* Progress overlay tag at bottom right of image */}
                        <div className="absolute bottom-3 right-3 flex items-center gap-2 text-white">
                          <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center font-mono shadow-md">
                            {progressVal}%
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-300 block">نسبة الإنجاز الفعلية</span>
                            <span className="text-xs font-bold text-amber-300">محدثة لحظياً</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2.5">
                          <div>
                            <h4 className="font-black text-base text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                              {project.title}
                            </h4>
                            <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                              <span className="truncate">{project.region || 'مسار أوباري - غات'}</span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {project.desc || 'مشروع تنفيذي استراتيجي مسجل على منظومة المتابعة لجهاز مشروات المواصلات.'}
                          </p>

                          {/* Progress bar */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="text-slate-500">معدل الإنجاز الميداني</span>
                              <span className="font-mono text-slate-900">{progressVal}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, Math.max(0, progressVal))}%` }}
                              />
                            </div>
                          </div>

                          {/* Metadata Grid (Without Budget) */}
                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100">
                            <div className="p-2 rounded-xl bg-slate-50">
                              <span className="text-slate-400 block text-[10px]">المقاول / المنفذ</span>
                              <span className="font-bold text-slate-800 truncate block">{project.contractor || 'ائتلاف الطرق'}</span>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-50">
                              <span className="text-slate-400 block text-[10px]">حالة المشروع</span>
                              <span className="font-bold text-emerald-700 truncate block">
                                {project.statusLabel || (project.status === 'completed' ? 'مكتمل' : 'جاري التنفيذ')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Actions Footer */}
                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                          <button
                            onClick={() => {
                              setSelectedExecutiveProjectEditModal(project);
                              setExecutiveProjectForm({
                                title: project.title || '',
                                region: project.region || 'مسار أوباري - غات',
                                progress: project.progress ?? 50,
                                status: project.status || 'in_progress',
                                contractor: project.contractor || '',
                                image: project.image || '/road-aerial-highway.jpg',
                                desc: project.desc || ''
                              });
                              setIsAddExecutiveProjectModalOpen(true);
                            }}
                            className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 border border-slate-200 text-slate-700 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-amber-500" />
                            <span>تعديل المشروع</span>
                          </button>
                          
                          <button
                            onClick={() => setExecutiveProjectToDelete(project)}
                            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors border border-red-200 cursor-pointer"
                            title="حذف المشروع من البوابة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════════════
              VIEW: NEWS CENTER & TICKER (مركز الأخبار والمستجدات + شريط الأخبار)
          ══════════════════════════════════════════════════════════════════════════════ */}
          {(activeSidebarItem === 'news-center' || activeSidebarItem === 'news') && (
            <div className="space-y-6 animate-fadeIn text-start">
              
              {/* Top Navigation & Subtabs */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Newspaper className="w-6 h-6 text-amber-500" />
                    <h3 className="text-lg font-black text-slate-900">مركز الأخبار والمستجدات الميدانية</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    التحكم المتكامل في منشورات الأخبار المصورة بالبوابة وشريط الأخبار العاجلة المتحرك
                  </p>
                </div>

                {/* SubTab Switchers */}
                <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
                  <button
                    onClick={() => setNewsCenterSubTab('posts')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      newsCenterSubTab === 'posts'
                        ? 'bg-white text-slate-950 font-black shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>الأخبار والمنشورات المصورة</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${newsCenterSubTab === 'posts' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'}`}>
                      {localNewsPosts.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setNewsCenterSubTab('ticker')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      newsCenterSubTab === 'ticker'
                        ? 'bg-white text-slate-950 font-black shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>شريط الأخبار المتحرك</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${newsCenterSubTab === 'ticker' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'}`}>
                      {localNews.length}
                    </span>
                  </button>
                </div>
              </div>

              {/* ── SUBTAB 1: NEWS POSTS (المنشورات المصورة) ── */}
              {newsCenterSubTab === 'posts' && (
                <div className="space-y-6">
                  {/* Actions Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-800 text-sm">الأخبار الميدانية المصورة المعروضة بالبوابة</h4>
                      <p className="text-[11px] text-slate-500">تظهر في مركز الأخبار كبطاقات احترافية موثقة بالصور والموقع</p>
                    </div>
                    <button
                      onClick={() => {
                        setNewsPostForm({
                          title: '',
                          category: 'رصف الأسفلت',
                          desc: '',
                          image: '/road-asphalt-paver.jpg',
                          author: 'المكتب الإعلامي - جهاز مشروعات المواصلات',
                          location: 'مسار طريق أوباري – غات'
                        });
                        setSelectedNewsPostEditModal(null);
                        setIsAddNewsPostModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة خبر مصور جديد</span>
                    </button>
                  </div>

                  {/* Grid of News Posts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {localNewsPosts.map((post) => (
                      <div
                        key={post.id}
                        className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-all flex flex-col group"
                      >
                        {/* Image Banner */}
                        <div className="relative h-44 bg-slate-950 overflow-hidden">
                          <img
                            src={post.image || '/road-asphalt-paver.jpg'}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                          <div className="absolute top-3 right-3">
                            <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-amber-500 text-slate-950 shadow-md">
                              {post.category || 'أخبار المسار'}
                            </span>
                          </div>
                          <div className="absolute bottom-3 right-3 text-white text-[11px] flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-amber-400" />
                            <span className="truncate max-w-[200px]">{post.location || 'مسار أوباري – غات'}</span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                              <span>{post.author || 'المكتب الإعلامي'}</span>
                              <span className="font-mono">{post.timeAgo || 'الآن'}</span>
                            </div>
                            <h4 className="font-black text-sm text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                              {post.title}
                            </h4>
                            <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                              {post.desc}
                            </p>
                          </div>

                          {/* Footer Actions */}
                          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                            <button
                              onClick={() => {
                                setSelectedNewsPostEditModal(post);
                                setNewsPostForm({
                                  title: post.title || '',
                                  category: post.category || 'رصف الأسفلت',
                                  desc: post.desc || '',
                                  image: post.image || '/road-asphalt-paver.jpg',
                                  author: post.author || 'المكتب الإعلامي - جهاز مشروعات المواصلات',
                                  location: post.location || 'مسار طريق أوباري – غات'
                                });
                                setIsAddNewsPostModalOpen(true);
                              }}
                              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 border border-slate-200 text-slate-700 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-amber-500" />
                              <span>تعديل الخبر</span>
                            </button>
                            
                            <button
                              onClick={() => setNewsPostToDelete(post)}
                              className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors border border-red-200 cursor-pointer"
                              title="حذف الخبر من مركز الأخبار"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── SUBTAB 2: TICKER NEWS (شريط الأخبار المتحرك) ── */}
              {newsCenterSubTab === 'ticker' && (
                <div className="space-y-6">
                  {/* Header & Add Button */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-800 text-sm">أخبار ومستجدات الشريط العلوي المتحرك</h4>
                      <p className="text-[11px] text-slate-500">تظهر مباشرة في شريط العناوين العاجلة بأعلى المنظومة</p>
                    </div>
                    <button
                      onClick={() => {
                        setNewsForm({ text: '', tag: 'تحديث حي', active: true });
                        setSelectedNewsEditModal(null);
                        setIsAddNewsModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة خبر جديد للشريط العلوي</span>
                    </button>
                  </div>

                  {/* Live Preview Box */}
                  <div className="rounded-2xl border border-amber-500/30 bg-slate-950 p-4 text-white space-y-2 shadow-inner">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-400 border-b border-white/10 pb-2">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span>معاينة حية: كيف يظهر الشريط العلوي للمواطنين والزوار</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        الأخبار المفعلة: {localNews.filter(n => n.active).length} من {localNews.length}
                      </span>
                    </div>
                    <div className="overflow-hidden py-1 rounded-xl">
                      <MarqueeTicker 
                        items={localNews.filter(n => n.active)} 
                        theme="dark" 
                        variant="hero" 
                      />
                    </div>
                  </div>

                  {/* News Items Table / List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-700">قائمة الأخبار المسجلة في الشريط ({localNews.length})</h4>
                      <span className="text-[11px] text-slate-400">يمكنك تفعيل أو إيقاف أي خبر بنقرة واحدة</span>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-xs text-start">
                        <thead>
                          <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                            <th className="p-3 text-start">الوسم / التصنيف</th>
                            <th className="p-3 text-start">نص الخبر الميداني</th>
                            <th className="p-3 text-start">تاريخ الإضافة</th>
                            <th className="p-3 text-center">حالة العرض بالشريط</th>
                            <th className="p-3 text-center">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {localNews.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-3 whitespace-nowrap">
                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-500/15 text-amber-700 border border-amber-500/30">
                                  {item.tag || 'أخبار المشروع'}
                                </span>
                              </td>
                              <td className="p-3 font-bold text-slate-900 max-w-md">
                                {item.text}
                              </td>
                              <td className="p-3 text-slate-400 font-mono whitespace-nowrap">
                                {item.date || '2026-08-20'}
                              </td>
                              <td className="p-3 text-center whitespace-nowrap">
                                <button
                                  onClick={() => handleToggleNewsActive(item.id)}
                                  className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                                    item.active
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                      : 'bg-slate-100 text-slate-500 border-slate-200'
                                  }`}
                                >
                                  {item.active ? 'معروض في الشريط' : 'متوقف مؤقتاً'}
                                </button>
                              </td>
                              <td className="p-3 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      setSelectedNewsEditModal(item);
                                      setNewsForm({ text: item.text, tag: item.tag || 'تحديث حي', active: item.active });
                                      setIsAddNewsModalOpen(true);
                                    }}
                                    className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 cursor-pointer"
                                    title="تعديل الخبر"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setNewsToDelete(item)}
                                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                                    title="حذف الخبر"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════════════
              VIEW 5: USERS & RBAC (المستخدمون والصلاحيات مع العرض والتعديل والحذف)
          ══════════════════════════════════════════════════════════════════════════════ */}
          {activeSidebarItem === 'users' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 animate-fadeIn text-start">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900">إدارة المستخدمين والصلاحيات (RBAC)</h3>
                  <p className="text-xs text-slate-500">عرض وتعديل صلاحيات المهندسين والمدققين وإضافة أو حذف الحسابات</p>
                </div>
                <button
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer self-start"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>إضافة مستخدم جديد</span>
                </button>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <th className="p-3">المعرف</th>
                      <th className="p-3">الاسم الكامل</th>
                      <th className="p-3">البريد الإلكتروني</th>
                      <th className="p-3">الدور الوظيفي</th>
                      <th className="p-3">الصلاحيات الممنوحة</th>
                      <th className="p-3">الحالة</th>
                      <th className="p-3">الإجراءات (عرض / تعديل / حذف)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {localUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-purple-600">{u.id}</td>
                        <td className="p-3 font-bold text-slate-900">{u.name}</td>
                        <td className="p-3 font-mono text-slate-500">{u.email}</td>
                        <td className="p-3 font-bold text-slate-700">{u.role}</td>
                        <td className="p-3 text-slate-500">{u.permissions}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            {u.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedUserViewModal(u)}
                              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer"
                              title="عرض ملف المستخدم"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setSelectedUserEditModal({ ...u })}
                              className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 transition-colors cursor-pointer"
                              title="تعديل الصلاحيات"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setUserToDelete(u)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                              title="حذف المستخدم"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}



          {!['home', 'sectors', 'reports', 'media', 'users', 'executive-projects', 'news-center', 'news'].includes(activeSidebarItem) && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4 text-center animate-fadeIn">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <LayoutGrid className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {sidebarNavItems.find(i => i.id === activeSidebarItem)?.label}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                القسم متصل بالقاعدة الميدانية الحية ويعمل بكامل وظائفه الإدارية والتنفيذية.
              </p>
              <button
                onClick={() => setActiveSidebarItem('home')}
                className="px-6 py-2.5 rounded-xl bg-[#0A1128] hover:bg-slate-800 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>العودة للرئيسية</span>
              </button>
            </div>
          )}

          {/* ── FOOTER BAR (Dark Navy `#0A1128`) ── */}
          <footer className="bg-[#0A1128] text-slate-400 rounded-2xl p-3.5 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm font-medium">
            <span>جميع الحقوق محفوظة © 2026</span>
            <span className="text-white font-bold">جهاز تنفيذ مشروعات المواصلات</span>
            <span className="font-mono text-amber-400">الإصدار 1.0.0</span>
          </footer>

        </main>

      </div>

      {/* ── MODAL 1: ADD REPORT MODAL ── */}
      {isAddReportModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <form onSubmit={handleAddReport} className="relative max-w-lg w-full rounded-3xl p-6 bg-white border border-slate-200 shadow-2xl space-y-4 text-start animate-scaleUp">
            <button
              type="button"
              onClick={() => setIsAddReportModalOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              <span>رفع تقرير فني جديد</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">عنوان التقرير:</label>
                <input
                  type="text"
                  required
                  value={newReport.title}
                  onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                  placeholder="مثال: تقرير استلام أعمال الرصف - أغسطس 2026"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الجهة المصدرة / الشركة:</label>
                <input
                  type="text"
                  value={newReport.contractor}
                  onChange={(e) => setNewReport({ ...newReport, contractor: e.target.value })}
                  placeholder="مثال: شركة السهل الصحراوي"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">القطاع:</label>
                  <select
                    value={newReport.sector}
                    onChange={(e) => setNewReport({ ...newReport, sector: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500 bg-white"
                  >
                    {localSectors.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">صيغة الملف:</label>
                  <select
                    value={newReport.type}
                    onChange={(e) => setNewReport({ ...newReport, type: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500 bg-white"
                  >
                    <option value="PDF">PDF (وثيقة معتمدة)</option>
                    <option value="XLSX">Excel (جداول كميات)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddReportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-md"
              >
                حفظ واعتماد التقرير
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── MODAL 2: EDIT REPORT MODAL ── */}
      {selectedReportEditModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <form onSubmit={handleSaveEditReport} className="relative max-w-lg w-full rounded-3xl p-6 bg-white border border-slate-200 shadow-2xl space-y-4 text-start animate-scaleUp">
            <button
              type="button"
              onClick={() => setSelectedReportEditModal(null)}
              className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-amber-500" />
              <span>تعديل بيانات التقرير ({selectedReportEditModal.id})</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">عنوان التقرير:</label>
                <input
                  type="text"
                  required
                  value={selectedReportEditModal.title}
                  onChange={(e) => setSelectedReportEditModal({ ...selectedReportEditModal, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الشركة / المقاول:</label>
                <input
                  type="text"
                  value={selectedReportEditModal.contractor}
                  onChange={(e) => setSelectedReportEditModal({ ...selectedReportEditModal, contractor: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">القطاع:</label>
                  <input
                    type="text"
                    value={selectedReportEditModal.sector}
                    onChange={(e) => setSelectedReportEditModal({ ...selectedReportEditModal, sector: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">قرار النشر في البوابة:</label>
                  <select
                    value={selectedReportEditModal.isPublic ? 'true' : 'false'}
                    onChange={(e) => setSelectedReportEditModal({ ...selectedReportEditModal, isPublic: e.target.value === 'true' })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500 bg-white"
                  >
                    <option value="true">معروض في البوابة العامة</option>
                    <option value="false">داخلي فقط (مخفي)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedReportEditModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-md"
              >
                حفظ التعديلات
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── MODAL 3: ADD & UPLOAD PHOTO MODAL ── */}
      {isAddMediaModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <form onSubmit={handleAddPhoto} className="relative max-w-xl w-full rounded-3xl p-6 bg-white border border-slate-200 shadow-2xl space-y-4 text-start animate-scaleUp max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsAddMediaModalOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <ImagePlus className="w-5 h-5 text-amber-500" />
                <span>إضافة ورفع صورة جديدة للتوثيق البصري (4K)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                ارفع صورة حية من جهازك أو هاتفك أو اختر من مكتبة صور المشروع المعتمدة
              </p>
            </div>

            {/* Media Source Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
              <button
                type="button"
                onClick={() => setMediaUploadTab('upload')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mediaUploadTab === 'upload'
                    ? 'bg-white text-slate-950 shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5 text-amber-500" />
                <span>رفع من الجهاز</span>
              </button>
              <button
                type="button"
                onClick={() => setMediaUploadTab('gallery')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mediaUploadTab === 'gallery'
                    ? 'bg-white text-slate-950 shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                <span>صور المشروع</span>
              </button>
              <button
                type="button"
                onClick={() => setMediaUploadTab('url')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mediaUploadTab === 'url'
                    ? 'bg-white text-slate-950 shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-amber-500" />
                <span>رابط خارجي</span>
              </button>
            </div>

            {/* Tab 1: Upload from device */}
            {mediaUploadTab === 'upload' && (
              <div className="space-y-3">
                <input
                  type="file"
                  ref={photoFileInputRef}
                  accept="image/*"
                  onChange={handlePhotoFileUpload}
                  className="hidden"
                />

                {newMedia.img && newMedia.img.startsWith('data:') ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/50 bg-slate-950">
                    <img
                      src={newMedia.img}
                      alt="معاينة الصورة المرفوعة"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-3">
                      <span className="text-[11px] font-bold text-emerald-400 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تم اختيار الصورة وجاهزة للتوثيق</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => photoFileInputRef.current?.click()}
                          className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                        >
                          تغيير
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewMedia(prev => ({ ...prev, img: '/road-asphalt-paver.jpg', src: '/road-asphalt-paver.jpg' }))}
                          className="px-3 py-1 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold cursor-pointer"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => photoFileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-amber-50/30 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div className="font-bold text-xs text-slate-800">
                      اضغط لاختيار صورة من جهازك أو هاتفك
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      يدعم صيغ JPG, PNG, WEBP بدقة 4K عالية الوضوح
                    </div>
                    <button
                      type="button"
                      className="mt-3 px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
                    >
                      استعراض الصور
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Project Gallery Preset */}
            {mediaUploadTab === 'gallery' && (
              <div className="space-y-2">
                <span className="text-[11px] text-slate-500 block">اختر صورة من آليات وأعمال المشروع المسجلة:</span>
                <div className="grid grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
                  {PRESET_PROJECT_PHOTOS.map((p) => {
                    const isSelected = (newMedia.img === p.url);
                    return (
                      <div
                        key={p.url}
                        onClick={() => {
                          setNewMedia(prev => ({
                            ...prev,
                            img: p.url,
                            src: p.url,
                            category: p.category,
                            title: prev.title || p.title,
                            desc: prev.desc || p.desc
                          }));
                        }}
                        className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                          isSelected ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <img src={p.url} alt={p.title} className="w-full h-16 object-cover" />
                        <div className="p-1 bg-white text-[10px] font-bold text-slate-800 truncate">
                          {p.category}
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-sm">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Direct URL */}
            {mediaUploadTab === 'url' && (
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block text-xs">رابط الصورة المباشر (URL):</label>
                <input
                  type="url"
                  value={newMedia.img.startsWith('data:') ? '' : newMedia.img}
                  onChange={(e) => setNewMedia({ ...newMedia, img: e.target.value, src: e.target.value })}
                  placeholder="https://... أو /road-asphalt-paver.jpg"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500 text-xs"
                />
                {newMedia.img && !newMedia.img.startsWith('data:') && (
                  <div className="h-28 rounded-xl overflow-hidden border border-slate-200 bg-black">
                    <img src={newMedia.img} alt="معاينة" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )}

            {/* Metadata Fields */}
            <div className="space-y-3 text-xs pt-1 border-t border-slate-100">
              <div>
                <label className="font-bold text-slate-700 block mb-1">عنوان الصورة / وصف العمل الميداني:</label>
                <input
                  type="text"
                  required
                  value={newMedia.title}
                  onChange={(e) => setNewMedia({ ...newMedia, title: e.target.value })}
                  placeholder="مثال: رصف الأسفلت الساخن بالفرادة Vögele وضبط درجات الحرارة"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">القطاع:</label>
                  <select
                    value={newMedia.sector}
                    onChange={(e) => setNewMedia({ ...newMedia, sector: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500 bg-white"
                  >
                    {localSectors.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">التصنيف الفني:</label>
                  <select
                    value={newMedia.category}
                    onChange={(e) => setNewMedia({ ...newMedia, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500 bg-white"
                  >
                    <option value="رصف الأسفلت">رصف الأسفلت</option>
                    <option value="الدمك وضبط المناسيب">الدمك وضبط المناسيب</option>
                    <option value="كشط وتأسيس">الأعمال الترابية والتسوية</option>
                    <option value="العبارات والجسور">العبارات وتصريف السيول</option>
                    <option value="الطاقة الشمسية والإنارة">الإنارة بالطاقة الشمسية</option>
                    <option value="ضبط الجودة المعملي">ضبط الجودة المعملي</option>
                    <option value="بانوراما جوية">مشاهد وتوثيق جوي</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">اسم المصور / المهندس:</label>
                  <input
                    type="text"
                    value={newMedia.photographer}
                    onChange={(e) => setNewMedia({ ...newMedia, photographer: e.target.value })}
                    placeholder="م. عبد السلام الفزاني"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">تاريخ التوثيق:</label>
                  <input
                    type="date"
                    value={newMedia.date}
                    onChange={(e) => setNewMedia({ ...newMedia, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">المشروع التنفيذي بالمنصة الرئيسية:</label>
                <select
                  value={newMedia.targetProject || 'new'}
                  onChange={(e) => setNewMedia({ ...newMedia, targetProject: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500 bg-white"
                >
                  <option value="new">إدراج كحزمة عمل وصورة جديدة في المشروعات التنفيذية (تظهر فوراً في المقدمة)</option>
                  <option value="PRJ-UBG-360">تحديث الصورة الرئيسية: مشروع صيانة ورصف طريق أوباري – غات</option>
                  <option value="PRJ-UBG-SOL-1100">تحديث الصورة الرئيسية: مشروع إنارة مسار أوباري – غات بالطاقة الشمسية</option>
                  <option value="PRJ-UBG-CUL-028">تحديث الصورة الرئيسية: مشروع عبّارات تصريف السيول</option>
                  <option value="PRJ-UBG-DUN-120">تحديث الصورة الرئيسية: مشروع تثبيت الكثبان الرملية وتوسعة الأكتاف</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">تفاصيل وملاحظات العمل الميداني:</label>
                <textarea
                  rows="2"
                  value={newMedia.desc}
                  onChange={(e) => setNewMedia({ ...newMedia, desc: e.target.value })}
                  placeholder="ملاحظات حول سير الأعمال، الآليات المشغلة، درجات الحرارة أو نتائج الفحص الموقعي..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500 resize-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddMediaModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <ImagePlus className="w-4 h-4" />
                <span>حفظ ورفع الصورة للتوثيق البصري</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── MODAL 4: EDIT PHOTO MODAL ── */}
      {selectedPhotoEditModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <form onSubmit={handleSaveEditPhoto} className="relative max-w-lg w-full rounded-3xl p-6 bg-white border border-slate-200 shadow-2xl space-y-4 text-start animate-scaleUp max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedPhotoEditModal(null)}
              className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-amber-500" />
              <span>تعديل بيانات الصورة ({selectedPhotoEditModal.id})</span>
            </h3>

            {/* Current Image Preview & Change */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-black h-36">
              <img
                src={selectedPhotoEditModal.src || selectedPhotoEditModal.img || '/road-asphalt-paver.jpg'}
                alt={selectedPhotoEditModal.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <input
                  type="file"
                  ref={editPhotoFileInputRef}
                  accept="image/*"
                  onChange={handleEditPhotoFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => editPhotoFileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>تغيير ملف الصورة من الجهاز</span>
                </button>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">عنوان الصورة:</label>
                <input
                  type="text"
                  required
                  value={selectedPhotoEditModal.title}
                  onChange={(e) => setSelectedPhotoEditModal({ ...selectedPhotoEditModal, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">القطاع:</label>
                  <input
                    type="text"
                    value={selectedPhotoEditModal.sector}
                    onChange={(e) => setSelectedPhotoEditModal({ ...selectedPhotoEditModal, sector: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">التصنيف:</label>
                  <input
                    type="text"
                    value={selectedPhotoEditModal.category}
                    onChange={(e) => setSelectedPhotoEditModal({ ...selectedPhotoEditModal, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">المصور / المهندس المشرف:</label>
                <input
                  type="text"
                  value={selectedPhotoEditModal.photographer || selectedPhotoEditModal.author || ''}
                  onChange={(e) => setSelectedPhotoEditModal({ ...selectedPhotoEditModal, photographer: e.target.value, author: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الوصف التفصيلي:</label>
                <textarea
                  rows="2"
                  value={selectedPhotoEditModal.desc || ''}
                  onChange={(e) => setSelectedPhotoEditModal({ ...selectedPhotoEditModal, desc: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500 resize-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedPhotoEditModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-md"
              >
                حفظ التعديلات
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── MODAL 5: VIEW USER DETAILS MODAL ── */}
      {selectedUserViewModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-md w-full rounded-3xl p-6 bg-white border border-slate-200 shadow-2xl space-y-4 text-start animate-scaleUp">
            <button
              onClick={() => setSelectedUserViewModal(null)}
              className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-purple-600">{selectedUserViewModal.id}</span>
                <h4 className="font-black text-base text-slate-900">{selectedUserViewModal.name}</h4>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div>البريد الإلكتروني: <strong className="text-slate-800 font-mono">{selectedUserViewModal.email}</strong></div>
              <div>الدور الوظيفي: <strong className="text-purple-700 font-bold">{selectedUserViewModal.role}</strong></div>
              <div>الصلاحيات المعتمدة: <strong className="text-slate-800">{selectedUserViewModal.permissions}</strong></div>
              <div>نطاق القطاعات: <strong className="text-amber-700">{selectedUserViewModal.sectorsAssigned || 'كافة القطاعات'}</strong></div>
              <div>رقم الهاتف: <strong className="text-slate-700 font-mono">{selectedUserViewModal.phone || '+218 91 000 0000'}</strong></div>
              <div>حالة الحساب: <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-700">{selectedUserViewModal.status}</span></div>
            </div>

            <button
              onClick={() => setSelectedUserViewModal(null)}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer shadow-md"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL 6: EDIT USER MODAL ── */}
      {selectedUserEditModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <form onSubmit={handleSaveEditUser} className="relative max-w-md w-full rounded-3xl p-6 bg-white border border-slate-200 shadow-2xl space-y-4 text-start animate-scaleUp">
            <button
              type="button"
              onClick={() => setSelectedUserEditModal(null)}
              className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-purple-600" />
              <span>تعديل بيانات وصلاحيات المستخدم ({selectedUserEditModal.id})</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">الاسم الكامل:</label>
                <input
                  type="text"
                  required
                  value={selectedUserEditModal.name}
                  onChange={(e) => setSelectedUserEditModal({ ...selectedUserEditModal, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الدور الوظيفي:</label>
                <select
                  value={selectedUserEditModal.role}
                  onChange={(e) => setSelectedUserEditModal({ ...selectedUserEditModal, role: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-white"
                >
                  <option value="مدير النظام">مدير النظام (Super Admin)</option>
                  <option value="مهندس إشراف موقعي">مهندس إشراف موقعي</option>
                  <option value="مدير ضبط الجودة والمختبرات">مدير ضبط الجودة</option>
                  <option value="مدقق مالي ومستخلصات">مدقق مالي</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الصلاحيات الممنوحة:</label>
                <input
                  type="text"
                  value={selectedUserEditModal.permissions}
                  onChange={(e) => setSelectedUserEditModal({ ...selectedUserEditModal, permissions: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الحالة:</label>
                <select
                  value={selectedUserEditModal.status}
                  onChange={(e) => setSelectedUserEditModal({ ...selectedUserEditModal, status: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-white"
                >
                  <option value="نشط">نشط (Active)</option>
                  <option value="معلق">معلق (Suspended)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedUserEditModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                حفظ التعديلات
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── MODAL 7: REPORT DETAIL VIEW MODAL ── */}
      {selectedReportModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-md w-full rounded-3xl p-6 bg-white border border-slate-200 shadow-2xl space-y-4 text-start animate-scaleUp">
            <button
              onClick={() => setSelectedReportModal(null)}
              className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-amber-600">{selectedReportModal.id}</span>
                <h4 className="font-black text-base text-slate-900">{selectedReportModal.title}</h4>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div>الشركة المنفذة: <strong className="text-slate-800">{selectedReportModal.contractor}</strong></div>
              <div>القطاع الهندسي: <strong className="text-slate-800">{selectedReportModal.sector || 'القطاع 01'}</strong></div>
              <div>حالة الاعتماد: <span className="font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">معتمد رسمياً من الإدارة</span></div>
              <div>حالة النشر على البوابة: <strong className={selectedReportModal.isPublic ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>{selectedReportModal.isPublic ? 'معروض في البوابة' : 'داخلي فقط (مخفي)'}</strong></div>
              <div>صيغة الملف والحجم: <strong className="font-mono text-blue-600">{selectedReportModal.type} • {selectedReportModal.size || '2.4 MB'}</strong></div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  handleToggleReportPublic(selectedReportModal.id);
                  setSelectedReportModal({ ...selectedReportModal, isPublic: !selectedReportModal.isPublic });
                }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                  selectedReportModal.isPublic ? 'bg-amber-500 hover:bg-amber-400 text-slate-950' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {selectedReportModal.isPublic ? 'حجب عن البوابة' : 'عرض في البوابة'}
              </button>
              <button
                onClick={() => {
                  showToast(`تم تحميل التقرير ${selectedReportModal.title}`);
                  setSelectedReportModal(null);
                }}
                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>تحميل</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 8: PHOTO LIGHTBOX MODAL ── */}
      {selectedPhotoModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-2xl w-full rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-2xl text-start animate-scaleUp">
            <button
              onClick={() => setSelectedPhotoModal(null)}
              className="absolute top-3 left-3 z-10 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="h-72 overflow-hidden bg-black">
              <img src={selectedPhotoModal.src || selectedPhotoModal.img || '/road-asphalt-paver.jpg'} alt={selectedPhotoModal.title} className="w-full h-full object-contain" />
            </div>

            <div className="p-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-amber-600">
                <span>{selectedPhotoModal.sector} • {selectedPhotoModal.category}</span>
                <span>{selectedPhotoModal.date}</span>
              </div>
              <h4 className="font-black text-base text-slate-900">{selectedPhotoModal.title}</h4>
              {selectedPhotoModal.desc && (
                <p className="text-xs text-slate-600 leading-relaxed">{selectedPhotoModal.desc}</p>
              )}
              <p className="text-xs text-slate-500">تم التوثيق بواسطة: {selectedPhotoModal.photographer || selectedPhotoModal.author || 'م. الموقع'}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 9: WORK BREAKDOWN DETAILS MODAL ── */}
      {isWorkDetailsModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-lg w-full rounded-3xl p-6 bg-white border border-slate-200 shadow-2xl space-y-4 text-start animate-scaleUp">
            <button
              onClick={() => setIsWorkDetailsModalOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>تفاصيل نسب الإنجاز حسب بنود العمل الفنية</span>
            </h3>

            <div className="space-y-3 text-xs">
              {workTypeData.map(item => (
                <div key={item.name} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{item.name}</span>
                    <span className="font-mono font-black text-sm" style={{ color: item.color }}>{item.value}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsWorkDetailsModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#0A1128] hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL 10: ADD SECTOR MODAL ── */}
      {isAddSectorModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <form onSubmit={handleAddSector} className="relative max-w-lg w-full rounded-3xl p-6 bg-white border border-slate-200 shadow-2xl space-y-4 text-start animate-scaleUp">
            <button
              type="button"
              onClick={() => setIsAddSectorModalOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              <span>إضافة قطاع هندسي جديد للمسار</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">اسم القطاع:</label>
                <input
                  type="text"
                  required
                  value={newSector.name}
                  onChange={(e) => setNewSector({ ...newSector, name: e.target.value })}
                  placeholder="مثال: القطاع 13: وصلات المعابر الحدودية"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الطول (كم):</label>
                  <input
                    type="number"
                    value={newSector.lengthKm}
                    onChange={(e) => setNewSector({ ...newSector, lengthKm: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">نسبة الإنجاز (%):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newSector.progress}
                    onChange={(e) => setNewSector({ ...newSector, progress: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الشركة المنفذة:</label>
                  <input
                    type="text"
                    value={newSector.contractor}
                    onChange={(e) => setNewSector({ ...newSector, contractor: e.target.value })}
                    placeholder="اسم الشركة"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">المهندس المقيم:</label>
                  <input
                    type="text"
                    value={newSector.residentEngineer}
                    onChange={(e) => setNewSector({ ...newSector, residentEngineer: e.target.value })}
                    placeholder="م. فلان الفلاني"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddSectorModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-md"
              >
                إضافة القطاع
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── MODAL 11: ADD USER MODAL ── */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <form onSubmit={handleAddUser} className="relative max-w-md w-full rounded-3xl p-6 bg-white border border-slate-200 shadow-2xl space-y-4 text-start animate-scaleUp">
            <button
              type="button"
              onClick={() => setIsAddUserModalOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-600" />
              <span>إضافة وتعيين مستخدم وصلاحيات</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">الاسم الكامل:</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="م. محمد علي"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">البريد الإلكتروني المؤسسي:</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="name@transport.gov.ly"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الدور الوظيفي والصلاحيات:</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value, permissions: e.target.value === 'مدير النظام' ? 'كامل الصلاحيات' : 'إدارة وتعديل القطاعات والتقارير' })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-white"
                >
                  <option value="مهندس إشراف موقعي">مهندس إشراف موقعي (Field Engineer)</option>
                  <option value="مدير ضبط الجودة والمختبرات">مدير ضبط الجودة (QA Lab Lead)</option>
                  <option value="مدقق مالي ومستخلصات">مدقق مالي (Financial Auditor)</option>
                  <option value="مدير النظام">مدير النظام (Administrator)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">رقم الهاتف:</label>
                <input
                  type="text"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  placeholder="+218 91 123 4567"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                حفظ المستخدم
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── MODAL 12: DELETE USER CONFIRMATION MODAL ── */}
      {userToDelete && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-sm w-full rounded-3xl p-6 bg-white border border-slate-200 shadow-2xl space-y-4 text-start animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-black text-base text-slate-900">تأكيد حذف المستخدم</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف حساب <strong className="text-slate-900 font-bold">({userToDelete.name})</strong> وسحب كافة الصلاحيات نهائياً؟
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                نعم، تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 13: DELETE PHOTO CONFIRMATION MODAL ── */}
      {photoToDelete && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-sm w-full rounded-3xl p-6 bg-white border border-slate-200 shadow-2xl space-y-4 text-start animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-black text-base text-slate-900">تأكيد حذف الصورة</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                هل أنت متأكد من حذف صورة <strong className="text-slate-900 font-bold">({photoToDelete.title})</strong> من المعرض؟
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPhotoToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePhoto}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                نعم، حذف الصورة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 14: DELETE REPORT CONFIRMATION MODAL ── */}
      {reportToDelete && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-sm w-full rounded-3xl p-6 bg-white border border-slate-200 shadow-2xl space-y-4 text-start animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-black text-base text-slate-900">تأكيد حذف التقرير</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                هل أنت متأكد من حذف تقرير <strong className="text-slate-900 font-bold">({reportToDelete.title})</strong> نهائياً؟
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReportToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteReport}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                نعم، حذف التقرير
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD / EDIT NEWS MODAL (إدارة أخبار الشريط العلوي) ── */}
      {isAddNewsModalOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-start space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-base text-slate-900">
                  {selectedNewsEditModal ? 'تعديل خبر الشريط العلوي' : 'إضافة خبر جديد للشريط العلوي'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddNewsModalOpen(false);
                  setSelectedNewsEditModal(null);
                }}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNews} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  نص الخبر الميداني (يُعرض في الشريط المتحرك):
                </label>
                <textarea
                  required
                  rows={3}
                  value={newsForm.text}
                  onChange={(e) => setNewsForm({ ...newsForm, text: e.target.value })}
                  placeholder="مثال: وصول شحنات الأسفلت والمباشرة في فرش الطبقة السطحية بالقطاع 02..."
                  className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-amber-500 text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">تصنيف / وسم الخبر:</label>
                  <select
                    value={newsForm.tag}
                    onChange={(e) => setNewsForm({ ...newsForm, tag: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500 bg-white text-xs font-bold"
                  >
                    <option value="تحديث حي">تحديث حي</option>
                    <option value="مشروع وطني">مشروع وطني</option>
                    <option value="سير الأعمال">سير الأعمال</option>
                    <option value="متابعة دورية">متابعة دورية</option>
                    <option value="السلامة والإنارة">السلامة والإنارة</option>
                    <option value="ضبط الجودة">ضبط الجودة</option>
                    <option value="الإشراف الهندسي">الإشراف الهندسي</option>
                    <option value="إشعار عاجل">إشعار عاجل</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={newsForm.active}
                      onChange={(e) => setNewsForm({ ...newsForm, active: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 cursor-pointer"
                    />
                    <span className="font-bold text-slate-800">تفعيل فوري في الشريط</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddNewsModalOpen(false);
                    setSelectedNewsEditModal(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-md"
                >
                  {selectedNewsEditModal ? 'حفظ التعديلات' : 'نشر في الشريط العلوي'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: DELETE NEWS CONFIRMATION MODAL ── */}
      {newsToDelete && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-start space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-slate-900">تأكيد حذف الخبر</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                هل أنت متأكد من حذف هذا الخبر نهائياً من الشريط العلوي؟
              </p>
              <p className="text-xs font-bold text-slate-800 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                "{newsToDelete.text}"
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setNewsToDelete(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteNews}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD / EDIT EXECUTIVE PROJECT MODAL ── */}
      {isAddExecutiveProjectModalOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 text-start space-y-4 animate-scaleUp max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-base text-slate-900">
                  {selectedExecutiveProjectEditModal ? 'تعديل بيانات المشروع التنفيذي للمسار' : 'إضافة مشروع تنفيذي جديد للمسار'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddExecutiveProjectModalOpen(false);
                  setSelectedExecutiveProjectEditModal(null);
                }}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExecutiveProject} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  اسم / عنوان المشروع التنفيذي:
                </label>
                <input
                  type="text"
                  required
                  value={executiveProjectForm.title}
                  onChange={(e) => setExecutiveProjectForm({ ...executiveProjectForm, title: e.target.value })}
                  placeholder="مثال: مشروع صيانة وتأهيل مسار أوباري - غات 360 كم"
                  className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-amber-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">المنطقة والمسار الجغرافي:</label>
                  <input
                    type="text"
                    value={executiveProjectForm.region}
                    onChange={(e) => setExecutiveProjectForm({ ...executiveProjectForm, region: e.target.value })}
                    placeholder="فزان (أوباري - غات)"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">المقاول / الائتلاف المنفذ:</label>
                  <input
                    type="text"
                    value={executiveProjectForm.contractor}
                    onChange={(e) => setExecutiveProjectForm({ ...executiveProjectForm, contractor: e.target.value })}
                    placeholder="ائتلاف شركات الطرق الوطنية"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    نسبة الإنجاز الميداني ({executiveProjectForm.progress}%):
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.5"
                      value={executiveProjectForm.progress}
                      onChange={(e) => setExecutiveProjectForm({ ...executiveProjectForm, progress: Number(e.target.value) })}
                      className="flex-1 accent-amber-500 cursor-pointer"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={executiveProjectForm.progress}
                      onChange={(e) => setExecutiveProjectForm({ ...executiveProjectForm, progress: Number(e.target.value) })}
                      className="w-20 p-2 text-center rounded-xl border border-slate-200 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">حالة المشروع:</label>
                  <select
                    value={executiveProjectForm.status}
                    onChange={(e) => setExecutiveProjectForm({ ...executiveProjectForm, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500 bg-white font-bold"
                  >
                    <option value="in_progress">جاري التنفيذ</option>
                    <option value="advanced">متقدم جداً</option>
                    <option value="completed">مكتمل ومنجز</option>
                  </select>
                </div>
              </div>

              {/* Hidden File Input for Device Photo Upload */}
              <input
                type="file"
                ref={projectImageFileInputRef}
                accept="image/*"
                onChange={handleProjectImageUpload}
                className="hidden"
              />

              {/* Dedicated Image Upload & Management Box */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="font-black text-slate-800 text-xs flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-amber-500" />
                      <span>صورة المشروع الميدانية (4K):</span>
                    </label>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      ارفع صورة حية من جهازك مباشرة أو اختر من الصور المعتمدة
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => projectImageFileInputRef.current?.click()}
                    disabled={isCompressingProjectImage}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all hover:scale-[1.02] self-start sm:self-auto"
                  >
                    {isCompressingProjectImage ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                        <span>جاري ضغط ومعالجة الصورة...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4 text-slate-950" />
                        <span>رفع صورة جديدة من جهازك</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Current Image Preview */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-black h-44 group shadow-inner">
                  <img
                    src={executiveProjectForm.image || '/road-aerial-highway.jpg'}
                    alt="معاينة صورة المشروع"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
                  
                  {/* Badges on preview */}
                  <div className="absolute top-2.5 right-2.5">
                    <span className="px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md text-amber-300 text-[10px] font-bold border border-white/20 shadow-md">
                      {executiveProjectForm.image?.startsWith('data:') ? 'صورة مرفوعة حديثاً من جهازك' : 'صورة معتمدة للمشروع'}
                    </span>
                  </div>

                  {/* Bottom bar inside preview */}
                  <div className="absolute bottom-2.5 right-2.5 left-2.5 flex items-center justify-between text-white text-xs">
                    <span className="text-[10px] text-slate-300 truncate max-w-[220px]">
                      {executiveProjectForm.image?.startsWith('data:') ? 'تم تحميل الصورة وحفظها بنجاح' : executiveProjectForm.image}
                    </span>
                    <button
                      type="button"
                      onClick={() => projectImageFileInputRef.current?.click()}
                      className="px-3 py-1 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-[10px] cursor-pointer flex items-center gap-1.5 transition-all shadow-md"
                    >
                      <ImagePlus className="w-3 h-3 text-amber-400" />
                      <span>تغيير الصورة</span>
                    </button>
                  </div>
                </div>

                {/* Quick Preset Photos */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 block">
                    أو اختر صورة سريعة من أرشيف أعمال المسار المعتمدة:
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {PRESET_PROJECT_PHOTOS.map((p) => {
                      const isSelected = (executiveProjectForm.image === p.url);
                      return (
                        <div
                          key={p.url}
                          onClick={() => setExecutiveProjectForm({ ...executiveProjectForm, image: p.url })}
                          className={`relative rounded-xl overflow-hidden border-2 cursor-pointer h-16 transition-all ${
                            isSelected ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          <img src={p.url} alt={p.category} className="w-full h-full object-cover" />
                          <div className="absolute inset-x-0 bottom-0 bg-black/70 text-[9px] text-white p-0.5 truncate text-center">
                            {p.category}
                          </div>
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  نبذة ووصف المشروع التنفيذي:
                </label>
                <textarea
                  rows={3}
                  value={executiveProjectForm.desc}
                  onChange={(e) => setExecutiveProjectForm({ ...executiveProjectForm, desc: e.target.value })}
                  placeholder="وصف تفصيلي لأعمال المشروع، مراحل الرصف، وإجراءات السلامة والجودة..."
                  className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-amber-500 resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddExecutiveProjectModalOpen(false);
                    setSelectedExecutiveProjectEditModal(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{selectedExecutiveProjectEditModal ? 'حفظ تعديلات المشروع' : 'إضافة المشروع للمنظومة'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT HERO SHOWCASE CARD MODAL (بطاقة الواجهة الرئيسية) ── */}
      {isEditHeroCardModalOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 text-start space-y-4 animate-scaleUp max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    تعديل بيانات وصورة بطاقة الواجهة الرئيسية (Hero Showcase Card)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    التحكم الفوري في البطاقة المعروضة بأعلى واجهة البوابة العامة
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditHeroCardModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveHeroCard} className="space-y-4 text-xs">
              {/* Photo Upload Section */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">
                  صورة بطاقة الواجهة:
                </label>

                {/* Hidden File Input */}
                <input
                  ref={heroCardFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleHeroCardImageUpload}
                  className="hidden"
                />

                {/* Upload Button & Preview */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => heroCardFileInputRef.current?.click()}
                    disabled={isHeroCardImageCompressing}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-500/30 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <ImagePlus className="w-4 h-4 text-amber-600" />
                    <span>{isHeroCardImageCompressing ? 'جارِ ضغط وتحسين الصورة...' : 'رفع صورة جديدة من جهازك'}</span>
                  </button>

                  <span className="text-[11px] text-slate-400">
                    أو اختر من المعرض المعتمد للمشروع أدناه
                  </span>
                </div>

                {/* Image Preview Box */}
                {heroCardForm.image && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-44 bg-slate-900 group">
                    <img
                      src={heroCardForm.image}
                      alt="معاينة صورة بطاقة الواجهة"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-3 start-3 end-3 flex items-center justify-between text-white text-[11px]">
                      <span className="bg-slate-900/80 px-2 py-0.5 rounded-lg border border-white/20">
                        معاينة الصورة المعتمدة
                      </span>
                      <button
                        type="button"
                        onClick={() => heroCardFileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors cursor-pointer"
                      >
                        تغيير الصورة
                      </button>
                    </div>
                  </div>
                )}

                {/* Preset Options */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1.5 font-bold">صور سريعة من الموقع:</span>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { src: '/road-asphalt-paver.jpg', label: 'رصف الأسفلت' },
                      { src: '/road-aerial-highway.jpg', label: 'بانوراما الطريق' },
                      { src: '/road-rollers-compaction.jpg', label: 'مداحل الدمك' },
                      { src: '/road-grader-earthwork.jpg', label: 'كاشطات الأساس' },
                      { src: '/road-solar-lighting.jpg', label: 'أعمدة الإنارة' }
                    ].map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setHeroCardForm({ ...heroCardForm, image: opt.src })}
                        className={`group relative rounded-xl overflow-hidden border h-14 cursor-pointer transition-all ${
                          heroCardForm.image === opt.src
                            ? 'border-amber-500 ring-2 ring-amber-500/30 scale-105'
                            : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={opt.src} alt={opt.label} className="w-full h-full object-cover" />
                        <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-[9px] font-bold text-white text-center p-0.5">
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Title & Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    عنوان البطاقة:
                  </label>
                  <input
                    type="text"
                    required
                    value={heroCardForm.title || ''}
                    onChange={(e) => setHeroCardForm({ ...heroCardForm, title: e.target.value })}
                    placeholder="أعمال رصف وتأهيل مسار 360 كم"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    الوسم / التصنيف العلوي:
                  </label>
                  <input
                    type="text"
                    value={heroCardForm.tag || ''}
                    onChange={(e) => setHeroCardForm({ ...heroCardForm, tag: e.target.value })}
                    placeholder="الموقف التنفيذي الميداني المعتمد"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Progress Slider */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">نسبة الإنجاز الإجمالي الفعلي (%):</label>
                  <span className="font-mono font-black text-sm text-amber-600">
                    {heroCardForm.progress ?? 68.5}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={heroCardForm.progress ?? 68.5}
                    onChange={(e) => setHeroCardForm({ ...heroCardForm, progress: parseFloat(e.target.value) || 0 })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={heroCardForm.progress ?? 68.5}
                    onChange={(e) => setHeroCardForm({ ...heroCardForm, progress: parseFloat(e.target.value) || 0 })}
                    className="w-20 p-2 rounded-xl border border-slate-200 text-center font-mono font-bold"
                  />
                </div>
              </div>

              {/* Distance & Supervisor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">المسافة الإجمالية:</label>
                  <input
                    type="text"
                    value={heroCardForm.distance || ''}
                    onChange={(e) => setHeroCardForm({ ...heroCardForm, distance: e.target.value })}
                    placeholder="360 كيلومتراً"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">الجهة المشرفة:</label>
                  <input
                    type="text"
                    value={heroCardForm.supervisor || ''}
                    onChange={(e) => setHeroCardForm({ ...heroCardForm, supervisor: e.target.value })}
                    placeholder="مشروعات المواصلات"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Start Date & Target Completion Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">تاريخ البدء المعتمد:</label>
                  <input
                    type="text"
                    value={heroCardForm.startDate || ''}
                    onChange={(e) => setHeroCardForm({ ...heroCardForm, startDate: e.target.value })}
                    placeholder="يناير 2025"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">الموعد المخطط للإنجاز:</label>
                  <input
                    type="text"
                    value={heroCardForm.completionDate || ''}
                    onChange={(e) => setHeroCardForm({ ...heroCardForm, completionDate: e.target.value })}
                    placeholder="ديسمبر 2026"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditHeroCardModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isHeroCardImageCompressing}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ وتحديث الواجهة الرئيسية فوراً</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: DELETE EXECUTIVE PROJECT CONFIRMATION ── */}
      {executiveProjectToDelete && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-start space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-slate-900">تأكيد حذف المشروع التنفيذي</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                هل أنت متأكد من حذف هذا المشروع نهائياً؟ سيتم إزالته من البوابة فوراً.
              </p>
              <div className="text-xs font-bold text-slate-800 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-start space-y-0.5">
                <div className="font-black text-amber-700">{executiveProjectToDelete.title}</div>
                <div className="text-[10px] text-slate-400">{executiveProjectToDelete.region}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setExecutiveProjectToDelete(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteExecutiveProject}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD / EDIT NEWS POST MODAL (مركز الأخبار المصورة) ── */}
      {isAddNewsPostModalOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 text-start space-y-4 animate-scaleUp max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-base text-slate-900">
                  {selectedNewsPostEditModal ? 'تعديل المنشور الإخباري' : 'إضافة منشور إخباري مصور جديد'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddNewsPostModalOpen(false);
                  setSelectedNewsPostEditModal(null);
                }}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewsPost} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  عنوان الخبر الميداني:
                </label>
                <input
                  type="text"
                  required
                  value={newsPostForm.title}
                  onChange={(e) => setNewsPostForm({ ...newsPostForm, title: e.target.value })}
                  placeholder="مثال: وصول شحنات الأسفلت الساخن والمباشرة في فرش الطبقة السطحية..."
                  className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-amber-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">تصنيف الخبر:</label>
                  <select
                    value={newsPostForm.category}
                    onChange={(e) => setNewsPostForm({ ...newsPostForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500 bg-white font-bold"
                  >
                    <option value="رصف الأسفلت">رصف الأسفلت</option>
                    <option value="الدمك وضبط المناسيب">الدمك وضبط المناسيب</option>
                    <option value="كشط وتأسيس">كشط وتأسيس</option>
                    <option value="العبارات والجسور">العبارات وتصريف السيول</option>
                    <option value="الطاقة الشمسية والإنارة">الطاقة الشمسية والإنارة</option>
                    <option value="ضبط الجودة المعملي">ضبط الجودة المعملي</option>
                    <option value="جولات ميدانية">جولات تفقدية ميدانية</option>
                    <option value="بيانات صحفية">بيان صحفي رسمي</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">الموقع الميداني:</label>
                  <input
                    type="text"
                    value={newsPostForm.location}
                    onChange={(e) => setNewsPostForm({ ...newsPostForm, location: e.target.value })}
                    placeholder="مسار طريق أوباري – غات"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">جهة النشر / المحرر:</label>
                  <input
                    type="text"
                    value={newsPostForm.author}
                    onChange={(e) => setNewsPostForm({ ...newsPostForm, author: e.target.value })}
                    placeholder="المكتب الإعلامي - جهاز مشروعات المواصلات"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 block text-xs">صورة الخبر الميداني:</label>
                    <button
                      type="button"
                      onClick={() => newsPostImageFileInputRef.current?.click()}
                      disabled={isCompressingNewsImage}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      {isCompressingNewsImage ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>جاري الرفع...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3 h-3" />
                          <span>رفع من الجهاز</span>
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={newsPostImageFileInputRef}
                    accept="image/*"
                    onChange={handleNewsPostImageUpload}
                    className="hidden"
                  />
                  <input
                    type="text"
                    value={newsPostForm.image}
                    onChange={(e) => setNewsPostForm({ ...newsPostForm, image: e.target.value })}
                    placeholder="/road-asphalt-paver.jpg"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>

              {/* Quick Image Presets Selector */}
              <div>
                <span className="text-[11px] font-bold text-slate-600 block mb-1.5">اختر صورة توثيقية معتمدة للخبر:</span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_PROJECT_PHOTOS.map((p) => {
                    const isSelected = newsPostForm.image === p.url;
                    return (
                      <div
                        key={p.url}
                        onClick={() => setNewsPostForm({ ...newsPostForm, image: p.url, category: p.category })}
                        className={`relative rounded-xl overflow-hidden border-2 cursor-pointer h-16 transition-all ${
                          isSelected ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <img src={p.url} alt={p.category} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  نص وتفاصيل الخبر:
                </label>
                <textarea
                  rows={4}
                  required
                  value={newsPostForm.desc}
                  onChange={(e) => setNewsPostForm({ ...newsPostForm, desc: e.target.value })}
                  placeholder="اكتب تفاصيل الخبر الميداني وأبرز النقاط المتعلقة بالإنجاز والآليات..."
                  className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-amber-500 resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddNewsPostModalOpen(false);
                    setSelectedNewsPostEditModal(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>{selectedNewsPostEditModal ? 'حفظ تعديلات الخبر' : 'نشر الخبر في البوابة'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: DELETE NEWS POST CONFIRMATION ── */}
      {newsPostToDelete && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-start space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-slate-900">تأكيد حذف الخبر</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                هل أنت متأكد من حذف هذا الخبر نهائياً من مركز الأخبار بالبوابة؟
              </p>
              <div className="text-xs font-bold text-slate-800 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-start">
                "{newsPostToDelete.title}"
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setNewsPostToDelete(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteNewsPost}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
