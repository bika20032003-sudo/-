import React, { useState, useEffect } from 'react';
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
  Sparkles,
  DollarSign,
  Search,
  Clock,
  Layers,
  ArrowUpRight,
  X
} from 'lucide-react';
import { translations } from '../i18n/translations';
import { fetchFieldPhotos, initialFieldPhotos, initialFinancialReports } from '../services/api';

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
    title: 'دراسة السلامة المرورية والإنارة بالطاقة الشمسية وتصريف السيول',
    titleEn: 'Traffic Safety, Solar Lighting & Flood Drainage Study',
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
    return () => window.removeEventListener('storage', handleStorage);
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
    { id: 'الطاقة الشمسية والإنارة', label: lang === 'ar' ? 'الإنارة الشمسية' : 'Solar Lighting' },
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
    <section id="media-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 animate-fadeIn select-none">
      
      {/* ── Section Title & Verified Timestamp ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-6 border-slate-200 dark:border-white/10">
        <div className="text-start space-y-2">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black border shadow-sm ${
            theme === 'light'
              ? 'bg-amber-100/90 border-amber-300 text-amber-950'
              : 'bg-amber-500/10 border-amber-500/35 text-amber-300'
          }`}>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>{lang === 'ar' ? 'منظومة الشفافية والمتابعة الرسمية 🇱🇾' : 'Official Transparency & Field Oversight 🇱🇾'}</span>
          </div>
          <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${
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
            { id: 'progress', label: lang === 'ar' ? '📊 تقارير الإنجاز' : '📊 Progress Reports' },
            { id: 'financial', label: lang === 'ar' ? '💰 التقارير المالية' : '💰 Financial Reports' },
            { id: 'photos', label: lang === 'ar' ? '📸 التوثيق البصري 4K' : '📸 Visual Media' },
            { id: 'specs', label: lang === 'ar' ? '📋 كراسات وضبط الجودة' : '📋 QA Specs' }
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
          {/* Sub Categories for Photos */}
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
                    src={photo.src}
                    alt={photo.title}
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
                  <p className="text-[11px] text-slate-400 line-clamp-2">{photo.desc}</p>
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
              <img src={selectedPhoto.src} alt={selectedPhoto.title} className="w-full h-full object-contain" />
            </div>

            <div className="p-6 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-amber-500">
                <span>{selectedPhoto.sector}</span>
                <span>{selectedPhoto.date} • {selectedPhoto.author}</span>
              </div>
              <h3 className="font-black text-lg">{selectedPhoto.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{selectedPhoto.desc}</p>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
