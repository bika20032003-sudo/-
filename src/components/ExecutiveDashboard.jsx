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
  Sparkles,
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
  ImagePlus
} from 'lucide-react';
import { initialFieldPhotos, initialDocuments, initialSectors, initialContractors, initialSummary } from '../services/api';

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
  onBackToPortal
}) {
  const [activeSidebarItem, setActiveSidebarItem] = useState('home');
  const [yearFilter, setYearFilter] = useState('2026');
  const [toastMessage, setToastMessage] = useState(null);

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
  const [newMedia, setNewMedia] = useState({ title: '', sector: 'القطاع 01', category: 'رصف الأسفلت', img: '/road-asphalt-paver.jpg', photographer: '' });

  // Data Ingestion Form in data_io tab
  const [importReportForm, setImportReportForm] = useState({
    title: '',
    contractor: '',
    sector: 'القطاع 01',
    category: 'تقارير الإنجاز',
    type: 'PDF',
    size: '3.4 MB'
  });

  // Sidebar navigation menu definition (streamlined per user request)
  const sidebarNavItems = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'sectors', label: 'القطاعات ومراحل التنفيذ', icon: Layers },
    { id: 'contractors', label: 'الشركات والمقاولون', icon: Building2 },
    { id: 'fleet', label: 'المعدات والآليات', icon: Truck },
    { id: 'reports', label: 'التقارير والمستخلصات', icon: FileText },
    { id: 'media', label: 'الصور والفيديو', icon: ImageIcon },
    { id: 'users', label: 'المستخدمون والصلاحيات', icon: Users },
    { id: 'site_mgmt', label: 'إدارة الموقع التعريفي', icon: Globe }
  ];

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
        showToast(nextState ? `تم نشر التقرير (${r.title}) على البوابة العامة 🌐` : `تم حجب التقرير (${r.title}) عن البوابة (داخلي فقط) 🔒`);
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
    showToast('تم استيراد التقرير وإدراجه بقسم التقارير! بانتظار قرار مدير المحتوى للنشر 🌐');
    setActiveSidebarItem('reports');
  };

  // ── Handlers: Photos / Media ──
  const handleAddPhoto = (e) => {
    e.preventDefault();
    if (!newMedia.title) return;
    const item = {
      id: `P-${String(localPhotos.length + 1).padStart(2, '0')}`,
      title: newMedia.title,
      sector: newMedia.sector,
      category: newMedia.category,
      date: new Date().toISOString().split('T')[0],
      img: newMedia.img || '/road-asphalt-paver.jpg',
      photographer: newMedia.photographer || 'م. الموقع'
    };
    const updated = [item, ...localPhotos];
    setLocalPhotos(updated);
    localStorage.setItem('portal-field-photos-v2', JSON.stringify(updated));
    setIsAddMediaModalOpen(false);
    setNewMedia({ title: '', sector: 'القطاع 01', category: 'رصف الأسفلت', img: '/road-asphalt-paver.jpg', photographer: '' });
    showToast('تمت إضافة الصورة الميدانية بنجاح!');
  };

  const handleConfirmDeletePhoto = () => {
    if (!photoToDelete) return;
    const updated = localPhotos.filter(p => p.id !== photoToDelete.id);
    setLocalPhotos(updated);
    localStorage.setItem('portal-field-photos-v2', JSON.stringify(updated));
    showToast(`تم حذف الصورة (${photoToDelete.title}) من المعرض`);
    setPhotoToDelete(null);
  };

  const handleSaveEditPhoto = (e) => {
    e.preventDefault();
    if (!selectedPhotoEditModal) return;
    const updated = localPhotos.map(p => p.id === selectedPhotoEditModal.id ? selectedPhotoEditModal : p);
    setLocalPhotos(updated);
    localStorage.setItem('portal-field-photos-v2', JSON.stringify(updated));
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
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-slate-950"></span>}
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
                  {sidebarNavItems.find(i => i.id === activeSidebarItem)?.label || 'الرئيسية'}
                </h2>
                <div className="w-7 h-7 rounded-lg bg-[#0A1128] text-white flex items-center justify-center">
                  <Home className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <span>لوحة التحكم</span>
                <ChevronLeft className="w-3 h-3 text-slate-400" />
                <span className="text-slate-800 font-bold">
                  {sidebarNavItems.find(i => i.id === activeSidebarItem)?.label || 'الرئيسية'}
                </span>
              </div>
            </div>

            {/* Actions Bar per active view */}
            <div className="flex items-center gap-2">
              {activeSidebarItem === 'reports' && (
                <button
                  onClick={() => setIsAddReportModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#0A1128] hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>رفع تقرير جديد</span>
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
              {activeSidebarItem === 'sectors' && (
                <button
                  onClick={() => setIsAddSectorModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة قطاع جديد</span>
                </button>
              )}
              {activeSidebarItem === 'users' && (
                <button
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>إضافة مستخدم جديد</span>
                </button>
              )}
              {activeSidebarItem === 'data_io' && (
                <button
                  onClick={handleExportBackup}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>تصدير نسخة احتياطية (JSON)</span>
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
                              {rep.isPublic ? 'معروض 🌐' : 'مسودة 🔒'}
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
              VIEW 3: REPORTS & CLAIMS (التقارير وقرار مدير المحتوى بالعرض أو الحجب)
          ══════════════════════════════════════════════════════════════════════════════ */}
          {activeSidebarItem === 'reports' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 animate-fadeIn text-start">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900">مركز التقارير وقرار النشر في البوابة</h3>
                  <p className="text-xs text-slate-500">إدارة التقارير المرفوعة والتحكم بقرار مدير المحتوى في عرضها على البوابة العامة أو حجبها</p>
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
                      <th className="p-3">قرار النشر في البوابة 🌐</th>
                      <th className="p-3">الإجراءات (عرض / تعديل / حذف)</th>
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
                        
                        {/* Content Manager Decision Toggle */}
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleReportPublic(rep.id)}
                            className={`px-3 py-1.5 rounded-xl font-black text-[10px] flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                              rep.isPublic
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                            }`}
                            title="انقر لتبديل حالة العرض في البوابة العامة"
                          >
                            {rep.isPublic ? (
                              <>
                                <Globe2 className="w-3.5 h-3.5" />
                                <span>معروض في البوابة</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                <span>داخلي فقط (حجب)</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Actions (View, Edit, Delete, Download) */}
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
                        <img src={photo.img} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                          <span>المصور: {photo.photographer || 'م. الموقع'}</span>
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



          {/* ══════════════════════════════════════════════════════════════════════════════
              VIEW 7: CONTRACTORS
          ══════════════════════════════════════════════════════════════════════════════ */}
          {activeSidebarItem === 'contractors' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 animate-fadeIn text-start">
              <div className="border-b pb-4 border-slate-100">
                <h3 className="text-lg font-black text-slate-900">الشركات والائتلافات الهندسية المنفذة</h3>
                <p className="text-xs text-slate-500">كشوفات عقود الشركات ونسب الإنجاز والتقييم الفني الميداني</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { name: 'شركة السهل الصحراوي للمقاولات', sector: 'القطاع 01 و 02 (أوباري - القرقيبة)', contract: '38,500,000 د.ل', progress: 84.0, score: '98.5%', fleet: 70 },
                  { name: 'شركة الهضبة لإعادة الإعمار والطرق', sector: 'القطاع 03 و 05 (بيسان - العوينات)', contract: '42,000,000 د.ل', progress: 72.0, score: '96.2%', fleet: 77 },
                  { name: 'شركة الطريق السريع للإنشاءات', sector: 'القطاع 04 (بيسان - تين الوه)', contract: '35,000,000 د.ل', progress: 68.0, score: '97.0%', fleet: 55 },
                  { name: 'شركة الأفق الوطني للهندسة', sector: 'القطاع 06 و 08 (العوينات - أيسين)', contract: '39,000,000 د.ل', progress: 61.0, score: '95.8%', fleet: 62 },
                  { name: 'شركة الجنوب للمشاريع والجسور', sector: 'القطاع 11 (مدخل غات التاريخي)', contract: '25,500,000 د.ل', progress: 55.0, score: '94.5%', fleet: 38 },
                  { name: 'شركة المستقبل للمقاولات العامة', sector: 'القطاع 10 (البركت - غات)', contract: '28,000,000 د.ل', progress: 35.4, score: '92.0%', fleet: 40 }
                ].map((c) => (
                  <div key={c.name} className="p-5 rounded-2xl border border-slate-200 hover:border-amber-400 space-y-3 transition-all">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-sm text-slate-900">{c.name}</h4>
                      <span className="font-mono font-black text-sm text-emerald-600">{c.progress}%</span>
                    </div>
                    <div className="text-xs text-slate-500 space-y-1">
                      <div>نطاق العمل: <strong className="text-slate-800">{c.sector}</strong></div>
                      <div>قيمة العقد: <strong className="text-amber-600 font-mono">{c.contract}</strong></div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500" style={{ width: `${c.progress}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>تقييم الجودة: <strong className="text-slate-700">{c.score}</strong></span>
                      <span>الآليات: <strong className="text-slate-700">{c.fleet} آلية</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════════════
              VIEW 8: OTHER ESSENTIAL VIEWS (Fallback)
          ══════════════════════════════════════════════════════════════════════════════ */}
          {!['home', 'sectors', 'reports', 'media', 'contractors', 'users'].includes(activeSidebarItem) && (
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
                    <option value="true">معروض في البوابة العامة 🌐</option>
                    <option value="false">داخلي فقط (مخفي) 🔒</option>
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

      {/* ── MODAL 3: ADD PHOTO MODAL ── */}
      {isAddMediaModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <form onSubmit={handleAddPhoto} className="relative max-w-lg w-full rounded-3xl p-6 bg-white border border-slate-200 shadow-2xl space-y-4 text-start animate-scaleUp">
            <button
              type="button"
              onClick={() => setIsAddMediaModalOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <ImagePlus className="w-5 h-5 text-amber-500" />
              <span>إضافة صورة فوتوغرافية 4K للمعرض</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">عنوان الصورة / وصف العمل:</label>
                <input
                  type="text"
                  required
                  value={newMedia.title}
                  onChange={(e) => setNewMedia({ ...newMedia, title: e.target.value })}
                  placeholder="مثال: رصف الأسفلت بالفرادة Vögele"
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
                    <option value="الأعمال الترابية">الأعمال الترابية والتسوية</option>
                    <option value="العبارات والجسور">العبارات وتصريف السيول</option>
                    <option value="الإنارة والسلامة">الإنارة بالطاقة الشمسية</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">اسم المصور / المهندس:</label>
                <input
                  type="text"
                  value={newMedia.photographer}
                  onChange={(e) => setNewMedia({ ...newMedia, photographer: e.target.value })}
                  placeholder="م. فلان الفلاني"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddMediaModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-md"
              >
                إضافة الصورة
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── MODAL 4: EDIT PHOTO MODAL ── */}
      {selectedPhotoEditModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <form onSubmit={handleSaveEditPhoto} className="relative max-w-lg w-full rounded-3xl p-6 bg-white border border-slate-200 shadow-2xl space-y-4 text-start animate-scaleUp">
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
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
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
              <div>حالة النشر على البوابة: <strong className={selectedReportModal.isPublic ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>{selectedReportModal.isPublic ? 'معروض في البوابة 🌐' : 'داخلي فقط (مخفي) 🔒'}</strong></div>
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
                {selectedReportModal.isPublic ? 'حجب عن البوابة 🔒' : 'عرض في البوابة 🌐'}
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
              <img src={selectedPhotoModal.img} alt={selectedPhotoModal.title} className="w-full h-full object-contain" />
            </div>

            <div className="p-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-amber-600">
                <span>{selectedPhotoModal.sector} • {selectedPhotoModal.category}</span>
                <span>{selectedPhotoModal.date}</span>
              </div>
              <h4 className="font-black text-base text-slate-900">{selectedPhotoModal.title}</h4>
              <p className="text-xs text-slate-500">تم التوثيق بواسطة: {selectedPhotoModal.photographer || 'م. الموقع'}</p>
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

    </div>
  );
}
