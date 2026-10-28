import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Image as ImageIcon, 
  CheckCircle2, 
  Calendar, 
  UploadCloud, 
  Filter, 
  Eye, 
  ShieldCheck,
  FileCheck,
  DollarSign,
  Search,
  Clock,
  Layers,
  ArrowUpRight,
  X,
  Plus,
  ImagePlus
} from 'lucide-react';
import { translations } from '../i18n/translations';
import { fetchFieldPhotos, initialFieldPhotos, initialFinancialReports, saveFieldPhotos } from '../services/api';
import { compressImageFile } from '../utils/imageCompressor';

const HUB_PRESET_PHOTOS = [
  { title: 'آليات رصف الأسفلت الساخن ومتابعة درجات الحرارة', category: 'رصف الأسفلت', src: '/road-asphalt-paver.jpg' },
  { title: 'دمك الأسفلت بالمداحل الأسطوانية والمطاطية', category: 'الدمك وضبط المناسيب', src: '/road-rollers-compaction.jpg' },
  { title: 'تسوية الأساس الحجري بالكاشطات الموتورية', category: 'كشط وتأسيس', src: '/road-grader-earthwork.jpg' },
  { title: 'تركيب الشواخص المرورية وتخطيط مسارات الطريق', category: 'السلامة المرورية والإرشاد', src: '/road-solar-lighting.jpg' },
  { title: 'فحص عينات الكور الإسفلتي ومطابقة الجودة المعملية', category: 'ضبط الجودة المعملي', src: '/road-qa-testing-core.jpg' },
  { title: 'مشهد جوي بانورامي لمسار الطريق الصحراوي (360 كم)', category: 'بانوراما جوية', src: '/road-aerial-desert-highway.jpg' }
];

const DEFAULT_DOCS = [
  {
    id: 'DOC-2026-08',
    title: 'التقرير التنفيذي الشهري الشامل - أغسطس 2026',
    titleEn: 'Monthly Comprehensive Executive Report – August 2026',
    category: 'تقارير الإنجاز',
    categoryEn: 'Progress Reports',
    date: '2026-08-10',
    size: '4.8 MB',
    author: 'إدارة المشروعات بالمنطقة الجنوبية',
    authorEn: 'Southern Region Projects Administration',
    type: 'PDF'
  },
  {
    id: 'LAB-2026-11',
    title: 'نتائج الفحص المعملي لعينات الأسفلت والدمك بالقطاع 01',
    titleEn: 'Laboratory Asphalt & Compaction Test Results – Sector 01',
    category: 'ضبط الجودة المعملي',
    categoryEn: 'Lab Quality Control',
    date: '2026-08-08',
    size: '2.1 MB',
    author: 'مختبرات الهندسة الجيوتقنية المعتمدة',
    authorEn: 'Certified Geotechnical Engineering Labs',
    type: 'PDF'
  },
  {
    id: 'ENV-2026-04',
    title: 'دراسة السلامة المرورية والشواخص وتصريف السيول',
    titleEn: 'Traffic Safety, Signage & Flood Drainage Study',
    category: 'الدراسات الفنية',
    categoryEn: 'Technical Studies',
    date: '2026-07-28',
    size: '6.4 MB',
    author: 'قسم الاستشارات والسلامة الهندسية',
    authorEn: 'Engineering Safety & Consulting Dept.',
    type: 'PDF'
  },
  {
    id: 'FIN-2026-Q3',
    title: 'كشف المستخلصات المالية المعتمدة للشركات المنفذة لطريق أوباري – غات',
    titleEn: 'Approved Financial Claims Ledger for Executing Contractors',
    category: 'التقارير المالية',
    categoryEn: 'Financial Claims',
    date: '2026-08-01',
    size: '1.9 MB',
    author: 'الإدارة المالية - جهاز تنفيذ مشروعات المواصلات',
    authorEn: 'Financial Administration – Authority HQ',
    type: 'PDF'
  }
];

export default function DocumentReportsHub({ documents = DEFAULT_DOCS, theme, lang = 'ar' }) {
  const t = translations[lang] || translations.ar;
  const [activeMainTab, setActiveMainTab] = useState('progress'); // 'progress' | 'financial' | 'photos' | 'specs'
  const [searchQuery, setSearchQuery] = useState('');
  const [photoFilter, setPhotoFilter] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState(null);

  const [liveDocs, setLiveDocs] = useState(() => {
    try {
      const saved = localStorage.getItem('portal-dashboard-reports');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Only show reports that the content manager chose to publish (isPublic !== false)
          const publicReports = parsed
            .filter(r => r.isPublic !== false)
            .map(r => ({
              id: r.id,
              title: r.title,
              titleEn: r.title,
              category: r.category || 'تقارير الإنجاز',
              categoryEn: 'Progress Reports',
              date: r.date,
              size: r.size || '2.5 MB',
              author: r.contractor || 'الإدارة العامة للمشروع',
              authorEn: r.contractor || 'Project General Administration',
              type: r.type || 'PDF'
            }));
          if (publicReports.length > 0) return publicReports;
        }
      }
    } catch (e) {}
    return documents || DEFAULT_DOCS;
  });

  const [fieldPhotos, setFieldPhotos] = useState(() => {
    try {
      const saved = localStorage.getItem('portal-field-photos-v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialFieldPhotos || [];
  });

  const [isUploadPhotoModalOpen, setIsUploadPhotoModalOpen] = useState(false);
  const [photoUploadSuccess, setPhotoUploadSuccess] = useState(null);
  const photoUploadInputRef = useRef(null);
  const [uploadTab, setUploadTab] = useState('file'); // 'file' | 'presets' | 'url'
  const [newUploadPhoto, setNewUploadPhoto] = useState({
    title: '',
    sector: 'القطاع الأول (أوباري - الفيوات)',
    category: 'رصف الأسفلت',
    src: '/road-asphalt-paver.jpg',
    img: '/road-asphalt-paver.jpg',
    author: '',
    desc: ''
  });

  const handlePhotoFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file, 1600, 1100, 0.82);
      setNewUploadPhoto(prev => ({
        ...prev,
        src: dataUrl,
        img: dataUrl,
        title: prev.title || file.name.replace(/\.[^/.]+$/, "")
      }));
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        if (dataUrl) {
          setNewUploadPhoto(prev => ({
            ...prev,
            src: dataUrl,
            img: dataUrl,
            title: prev.title || file.name.replace(/\.[^/.]+$/, "")
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveUploadedPhoto = (e) => {
    e.preventDefault();
    if (!newUploadPhoto.title.trim()) return;

    const finalImage = newUploadPhoto.src || newUploadPhoto.img || '/road-asphalt-paver.jpg';
    const item = {
      id: `PH-${Date.now().toString().slice(-4)}`,
      title: newUploadPhoto.title.trim(),
      titleEn: newUploadPhoto.title.trim(),
      sector: newUploadPhoto.sector || 'القطاع الأول (أوباري - الفيوات)',
      category: newUploadPhoto.category || 'رصف الأسفلت',
      desc: newUploadPhoto.desc?.trim() || `توثيق ميداني فوتوغرافي لأعمال ${newUploadPhoto.category} في ${newUploadPhoto.sector}.`,
      date: new Date().toISOString().split('T')[0],
      src: finalImage,
      img: finalImage,
      author: newUploadPhoto.author?.trim() || 'م. الموقع الميداني',
      photographer: newUploadPhoto.author?.trim() || 'م. الموقع الميداني'
    };

    const updated = [item, ...fieldPhotos];
    setFieldPhotos(updated);
    saveFieldPhotos(updated);

    setIsUploadPhotoModalOpen(false);
    setPhotoUploadSuccess(item.title);
    setTimeout(() => setPhotoUploadSuccess(null), 4000);
    setNewUploadPhoto({
      title: '',
      sector: 'القطاع الأول (أوباري - الفيوات)',
      category: 'رصف الأسفلت',
      src: '/road-asphalt-paver.jpg',
      img: '/road-asphalt-paver.jpg',
      author: '',
      desc: ''
    });
  };

  useEffect(() => {
    const handleStorage = () => {
      try {
        const savedReports = localStorage.getItem('portal-dashboard-reports');
        if (savedReports) {
          const parsed = JSON.parse(savedReports);
          if (Array.isArray(parsed)) {
            const publicReports = parsed
              .filter(r => r.isPublic !== false)
              .map(r => ({
                id: r.id,
                title: r.title,
                titleEn: r.title,
                category: r.category || 'تقارير الإنجاز',
                categoryEn: 'Progress Reports',
                date: r.date,
                size: r.size || '2.5 MB',
                author: r.contractor || 'الإدارة العامة للمشروع',
                authorEn: r.contractor || 'Project General Administration',
                type: r.type || 'PDF'
              }));
            setLiveDocs(publicReports);
          }
        }
        const savedPhotos = localStorage.getItem('portal-field-photos-v2');
        if (savedPhotos) {
          const parsed = JSON.parse(savedPhotos);
          if (Array.isArray(parsed)) setFieldPhotos(parsed);
        }
      } catch (e) {}
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('cloud_photos_updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('cloud_photos_updated', handleStorage);
    };
  }, []);

  const handleDownload = (doc) => {
    const name = lang === 'ar' ? doc.title : doc.titleEn || doc.title;
    setDownloadSuccess(name);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  const photoCategories = [
    { id: 'all', label: lang === 'ar' ? 'الكل' : 'All' },
    { id: 'رصف الأسفلت', label: lang === 'ar' ? 'رصف الأسفلت' : 'Asphalt Paving' },
    { id: 'الدمك وضبط المناسيب', label: lang === 'ar' ? 'الدمك والمناسيب' : 'Compaction' },
    { id: 'كشط وتأسيس', label: lang === 'ar' ? 'كشط وتأسيس' : 'Earthwork' },
    { id: 'السلامة المرورية والإرشاد', label: lang === 'ar' ? 'السلامة والإرشاد' : 'Safety & Signage' },
    { id: 'ضبط الجودة المعملي', label: lang === 'ar' ? 'ضبط الجودة' : 'Lab QA' },
    { id: 'بانوراما جوية', label: lang === 'ar' ? 'مشاهد جوية' : 'Aerial Views' }
  ];

  const filteredPhotos = fieldPhotos.filter(p => {
    const matchCat = photoFilter === 'all' || p.category === photoFilter;
    const matchSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.desc?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredDocs = liveDocs.filter(d => {
    const matchSearch = !searchQuery || d.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  return (
    <section id="transparency-reports-hub" className="py-4 sm:py-6 max-w-7xl mx-auto space-y-8 animate-fadeIn select-none">
      
      {/* ── Section Title & Verified Timestamp ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-6 border-slate-200 dark:border-white/10">
        <div className="text-start space-y-2">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black border shadow-sm ${
            theme === 'light'
              ? 'bg-amber-100/90 border-amber-300 text-amber-950'
              : 'bg-amber-500/10 border-amber-500/35 text-amber-300'
          }`}>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>{lang === 'ar' ? 'منظومة الشفافية والمتابعة الرسمية' : 'Official Transparency & Field Oversight'}</span>
          </div>
          <h2 className={`text-3xl sm:text-5xl font-black leading-snug ${
            theme === 'light' ? 'text-slate-950' : 'text-white'
          }`}>
            {lang === 'ar' ? 'الشفافية والمتابعة الميدانية' : 'Transparency & Field Oversight'}
          </h2>
          <p className={`text-xs sm:text-base font-medium max-w-2xl ${
            theme === 'light' ? 'text-slate-600' : 'text-slate-400'
          }`}>
            {lang === 'ar'
              ? 'تقارير الإنجاز الشهرية، البيانات المالية، التوثيق البصري الميداني، وكراسات ضبط الجودة المعتمدة.'
              : 'Monthly progress audits, financial ledger statements, 4K field visual media, and QA technical compliance sheets.'}
          </p>
        </div>

        {/* Certified Timestamp Pill */}
        <div className={`p-3 rounded-2xl border text-xs font-mono flex items-center gap-2.5 shadow-sm ${
          theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-slate-300'
        }`}>
          <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">آخر تحديث معتمد وموثق:</span>
            <strong className="font-bold text-amber-500">20 أغسطس 2026</strong>
          </div>
        </div>
      </div>

      {/* ── Download Success Toast Banner ── */}
      {downloadSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-between shadow-2xl animate-scaleUp">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>تم تحميل الملف بنجاح: <strong>{downloadSuccess}</strong></span>
          </div>
          <button onClick={() => setDownloadSuccess(null)} className="p-1 hover:bg-black/10 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── 4 Main Category Tabs & Search Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className={`p-1.5 rounded-2xl border flex flex-wrap items-center gap-1 ${
          theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0a0f1d] border-white/10'
        }`}>
          {[
            { id: 'progress', label: lang === 'ar' ? 'تقارير الإنجاز' : 'Progress Reports' },
            { id: 'financial', label: lang === 'ar' ? 'التقارير المالية' : 'Financial Reports' },
            { id: 'photos', label: lang === 'ar' ? 'التوثيق البصري' : 'Visual Media' },
            { id: 'specs', label: lang === 'ar' ? 'كراسات وضبط الجودة' : 'QA Specifications' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveMainTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeMainTab === tab.id
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className={`relative flex items-center min-w-[240px] px-3.5 py-2 rounded-2xl border ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0a0f1d] border-white/10'
        }`}>
          <Search className="w-4 h-4 text-amber-500 me-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'ar' ? 'بحث في التقارير والتوثيق...' : 'Search reports & docs...'}
            className="w-full bg-transparent text-xs outline-none text-slate-900 dark:text-white placeholder-slate-400 font-medium"
          />
        </div>
      </div>

      {/* ── TAB 1: PROGRESS REPORTS ── */}
      {activeMainTab === 'progress' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className={`p-6 rounded-[28px] border shadow-xl space-y-4 text-start transition-all glass-card-hover ${
                theme === 'light' ? 'bg-white border-slate-200/90 shadow-slate-100' : 'bg-[#0a0f1d]/95 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-black bg-amber-500/15 text-amber-500 border border-amber-500/30">
                  {doc.id}
                </span>
                <span className="text-xs text-slate-400 font-mono">{doc.date} • {doc.size}</span>
              </div>

              <h3 className={`font-black text-base leading-snug ${theme === 'light' ? 'text-slate-950' : 'text-white'}`}>
                {doc.title}
              </h3>

              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <div>الجهة المصدرة: <strong className="text-slate-700 dark:text-slate-200">{doc.author}</strong></div>
                <div>التصنيف: <strong className="text-amber-500">{doc.category}</strong></div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>معتمد رسمياً من الإدارة</span>
                </span>
                <button
                  onClick={() => handleDownload(doc)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 2: FINANCIAL REPORTS ── */}
      {activeMainTab === 'financial' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {initialFinancialReports.map((fin) => (
              <div
                key={fin.id}
                className={`p-6 rounded-[28px] border shadow-xl space-y-5 text-start transition-all glass-card-hover ${
                  theme === 'light' ? 'bg-white border-slate-200/90 shadow-slate-100' : 'bg-[#0a0f1d]/95 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-black bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                    {fin.id}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{fin.date} • {fin.size}</span>
                </div>

                <h3 className={`font-black text-base leading-snug ${theme === 'light' ? 'text-slate-950' : 'text-white'}`}>
                  {fin.title}
                </h3>

                {/* Financial Figures Tile */}
                <div className={`p-4 rounded-2xl border grid grid-cols-2 gap-3 text-xs ${
                  theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
                }`}>
                  <div>
                    <span className="text-[10px] text-slate-400 block">المخصص المالي:</span>
                    <strong className="text-sm font-black font-mono text-amber-500">{fin.allocatedLyd}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">المصروف الفعلي:</span>
                    <strong className="text-sm font-black font-mono text-emerald-500">{fin.disbursedLyd} ({fin.rate})</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{fin.author}</span>
                  <button
                    onClick={() => handleDownload(fin)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل التقرير المالي</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: 4K FIELD VISUAL MEDIA ── */}
      {activeMainTab === 'photos' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Sub Categories for Photos & Upload Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {photoCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setPhotoFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    photoFilter === cat.id
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                      : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsUploadPhotoModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto transition-transform hover:scale-105"
            >
              <ImagePlus className="w-4 h-4" />
              <span>إضافة ورفع صورة للتوثيق</span>
            </button>
          </div>

          {/* Photo Upload Success Toast Alert */}
          {photoUploadSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>تمت إضافة الصورة بنجاح وعرضها في التوثيق البصري: {photoUploadSuccess}</span>
            </div>
          )}

          {/* Photo Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className={`rounded-3xl border shadow-xl overflow-hidden cursor-pointer group transition-all text-start glass-card-hover ${
                  theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0a0f1d] border-white/10'
                }`}
              >
                <div className="h-56 overflow-hidden relative">
                  <img
                    src={photo.src || photo.img || '/road-asphalt-paver.jpg'}
                    alt={photo.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-4 py-2 rounded-2xl bg-black/70 text-amber-400 text-xs font-black flex items-center gap-2 border border-amber-400/40 backdrop-blur-md">
                      <Eye className="w-4 h-4" />
                      <span>معاينة بدقة 4K</span>
                    </span>
                  </div>
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-white text-[10px] font-black border border-white/10">
                    {photo.category}
                  </span>
                </div>

                <div className="p-4 space-y-1">
                  <span className="text-[10px] font-mono text-amber-500 font-bold block">{photo.sector}</span>
                  <h4 className={`font-black text-xs sm:text-sm line-clamp-1 ${theme === 'light' ? 'text-slate-950' : 'text-white'}`}>
                    {photo.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{photo.desc || 'توثيق ميداني فوتوغرافي عالي الدقة'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: QA SPECS & TECHNICAL SPECS ── */}
      {activeMainTab === 'specs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className={`p-6 rounded-[28px] border shadow-xl space-y-4 text-start transition-all glass-card-hover ${
                theme === 'light' ? 'bg-white border-slate-200/90 shadow-slate-100' : 'bg-[#0a0f1d]/95 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-black bg-cyan-500/15 text-cyan-500 border border-cyan-500/30">
                  {doc.id}
                </span>
                <span className="text-xs text-slate-400 font-mono">{doc.date} • {doc.size}</span>
              </div>

              <h3 className={`font-black text-base leading-snug ${theme === 'light' ? 'text-slate-950' : 'text-white'}`}>
                {doc.title}
              </h3>

              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <div>الجهة الفنية: <strong className="text-slate-700 dark:text-slate-200">{doc.author}</strong></div>
                <div>المواصفات: <strong className="text-cyan-500">معايير مارشال والاختبارات الجيوتقنية</strong></div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>شهادة مطابقة معملية</span>
                </span>
                <button
                  onClick={() => handleDownload(doc)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل التفاصيل</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 4K Lightbox Modal ── */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
          <div className={`relative max-w-4xl w-full rounded-[32px] overflow-hidden border shadow-2xl space-y-4 animate-scaleUp text-start ${
            theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#090d18] border-amber-500/35 text-white'
          }`}>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 left-4 z-20 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[65vh] overflow-hidden relative bg-black flex items-center justify-center">
              <img src={selectedPhoto.src || selectedPhoto.img || '/road-asphalt-paver.jpg'} alt={selectedPhoto.title} className="w-full h-full object-contain" />
            </div>

            <div className="p-6 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-amber-500">
                <span>{selectedPhoto.sector}</span>
                <span>{selectedPhoto.date} • {selectedPhoto.author || selectedPhoto.photographer || 'م. الموقع'}</span>
              </div>
              <h3 className="font-black text-lg">{selectedPhoto.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{selectedPhoto.desc || 'توثيق هندسي ميداني عالي الدقة'}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Visual Documentation Upload Modal ── */}
      {isUploadPhotoModalOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <form onSubmit={handleSaveUploadedPhoto} className={`relative max-w-xl w-full rounded-3xl p-6 border shadow-2xl space-y-4 text-start animate-scaleUp max-h-[92vh] overflow-y-auto ${
            theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0a0f1d] border-white/10 text-white'
          }`}>
            <button
              type="button"
              onClick={() => setIsUploadPhotoModalOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-black text-base flex items-center gap-2">
                <ImagePlus className="w-5 h-5 text-amber-500" />
                <span>إضافة ورفع صورة جديدة للتوثيق البصري (4K)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                ارفع صورة ميدانية عالية الدقة من هاتفك أو جهازك لتضمينها في أرشيف التوثيق البصري
              </p>
            </div>

            {/* Upload Method Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setUploadTab('file')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  uploadTab === 'file'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>رفع من الجهاز</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadTab('presets')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  uploadTab === 'presets'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>صور المشروع المعتمدة</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadTab('url')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  uploadTab === 'url'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <span>رابط خارجي</span>
              </button>
            </div>

            {/* File Upload Zone */}
            {uploadTab === 'file' && (
              <div>
                <input
                  type="file"
                  ref={photoUploadInputRef}
                  accept="image/*"
                  onChange={handlePhotoFileUpload}
                  className="hidden"
                />
                {newUploadPhoto.src && newUploadPhoto.src.startsWith('data:') ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/50 bg-black">
                    <img src={newUploadPhoto.src} alt="معاينة" className="w-full h-44 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-3">
                      <span className="text-[11px] font-bold text-emerald-400 bg-black/60 px-2 py-0.5 rounded-lg backdrop-blur-md flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تم اختيار الصورة</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => photoUploadInputRef.current?.click()}
                          className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold cursor-pointer"
                        >
                          تغيير
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewUploadPhoto(prev => ({ ...prev, src: '/road-asphalt-paver.jpg', img: '/road-asphalt-paver.jpg' }))}
                          className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-bold cursor-pointer"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => photoUploadInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-amber-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 dark:bg-white/5 hover:bg-amber-500/10 transition-all group"
                  >
                    <UploadCloud className="w-9 h-9 text-amber-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      اضغط لاختيار صورة من جهاز الكمبيوتر أو الهاتف
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      يدعم صيغ JPG, PNG, WEBP بدقة عالية
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Presets */}
            {uploadTab === 'presets' && (
              <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1">
                {HUB_PRESET_PHOTOS.map(p => {
                  const isSel = newUploadPhoto.src === p.src;
                  return (
                    <div
                      key={p.src}
                      onClick={() => setNewUploadPhoto(prev => ({ ...prev, src: p.src, img: p.src, category: p.category, title: prev.title || p.title }))}
                      className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        isSel ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-slate-200 dark:border-white/10'
                      }`}
                    >
                      <img src={p.src} alt={p.title} className="w-full h-16 object-cover" />
                      <div className="p-1 bg-black/60 text-[10px] font-bold text-white truncate text-center">
                        {p.category}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* URL input */}
            {uploadTab === 'url' && (
              <div className="space-y-2">
                <input
                  type="url"
                  value={newUploadPhoto.src.startsWith('data:') ? '' : newUploadPhoto.src}
                  onChange={(e) => setNewUploadPhoto({ ...newUploadPhoto, src: e.target.value, img: e.target.value })}
                  placeholder="https://... أو /road-asphalt-paver.jpg"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 outline-none focus:border-amber-500 bg-transparent text-xs"
                />
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-3 text-xs pt-1 border-t border-slate-200 dark:border-white/10">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">عنوان وتفاصيل التوثيق:</label>
                <input
                  type="text"
                  required
                  value={newUploadPhoto.title}
                  onChange={(e) => setNewUploadPhoto({ ...newUploadPhoto, title: e.target.value })}
                  placeholder="مثال: رصف الأسفلت ومتابعة الدمك بدرجات الحرارة"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 outline-none focus:border-amber-500 bg-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">القطاع:</label>
                  <select
                    value={newUploadPhoto.sector}
                    onChange={(e) => setNewUploadPhoto({ ...newUploadPhoto, sector: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 outline-none focus:border-amber-500 bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white"
                  >
                    <option value="القطاع الأول (أوباري - الفيوات)">القطاع الأول (أوباري - الفيوات)</option>
                    <option value="القطاع الثاني (الفيوات - العوينات)">القطاع الثاني (الفيوات - العوينات)</option>
                    <option value="القطاع الثالث (العوينات - تهالة)">القطاع الثالث (العوينات - تهالة)</option>
                    <option value="القطاع الرابع (البركت - غات)">القطاع الرابع (البركت - غات)</option>
                    <option value="مسار طريق أوباري – غات الدولي (360 كم)">كافة مسار المشروع (360 كم)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">التصنيف الفني:</label>
                  <select
                    value={newUploadPhoto.category}
                    onChange={(e) => setNewUploadPhoto({ ...newUploadPhoto, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 outline-none focus:border-amber-500 bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white"
                  >
                    <option value="رصف الأسفلت">رصف الأسفلت</option>
                    <option value="الدمك وضبط المناسيب">الدمك وضبط المناسيب</option>
                    <option value="كشط وتأسيس">الأعمال الترابية والتسوية</option>
                    <option value="السلامة المرورية والإرشاد">السلامة المرورية والإرشاد</option>
                    <option value="ضبط الجودة المعملي">ضبط الجودة المعملي</option>
                    <option value="بانوراما جوية">مشاهد وتوثيق جوي</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">المصور / المهندس المشرف:</label>
                <input
                  type="text"
                  value={newUploadPhoto.author}
                  onChange={(e) => setNewUploadPhoto({ ...newUploadPhoto, author: e.target.value })}
                  placeholder="م. عبد السلام الفزاني"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 outline-none focus:border-amber-500 bg-transparent"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">وصف العمل وملاحظات الجودة:</label>
                <textarea
                  rows="2"
                  value={newUploadPhoto.desc}
                  onChange={(e) => setNewUploadPhoto({ ...newUploadPhoto, desc: e.target.value })}
                  placeholder="تفاصيل التوثيق الميداني والمعدات المشغلة..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 outline-none focus:border-amber-500 bg-transparent resize-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setIsUploadPhotoModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <ImagePlus className="w-4 h-4" />
                <span>حفظ وإدراج في التوثيق البصري</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </section>
  );
}
