import React, { useState, useEffect, useRef } from 'react';
import { 
  Layers, 
  MapPin, 
  Compass, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowUpRight, 
  Building2, 
  Wrench, 
  FileText, 
  Info, 
  X,
  ImagePlus,
  UploadCloud,
  Eye,
  Camera,
  Trash2,
  Loader2
} from 'lucide-react';
import { nationalProjects } from '../services/api';
import MarqueeTicker from './MarqueeTicker';
import { compressImageFile, safeStorageSet, safeStorageGet } from '../utils/imageCompressor';
import { resolveAsset } from '../utils/assets';

const PROJECT_PRESET_IMAGES = [
  { title: 'آليات رصف الأسفلت الساخن ومتابعة درجات الحرارة', category: 'رصف الأسفلت', src: './road-asphalt-paver.jpg' },
  { title: 'دمك الأسفلت بالمداحل الأسطوانية والمطاطية', category: 'الدمك وضبط المناسيب', src: './road-rollers-compaction.jpg' },
  { title: 'تسوية الأساس الحجري بالكاشطات الموتورية', category: 'كشط وتأسيس', src: './road-grader-earthwork.jpg' },
  { title: 'تركيب وتشغيل منظومة الإنارة الذكية بالطاقة الشمسية', category: 'الطاقة الشمسية والإنارة', src: './road-solar-lighting.jpg' },
  { title: 'فحص عينات الكور الإسفلتي ومطابقة الجودة المعملية', category: 'ضبط الجودة المعملي', src: './road-qa-testing-core.jpg' },
  { title: 'مشهد جوي بانورامي لمسار الطريق الصحراوي (360 كم)', category: 'بانوراما جوية', src: './road-aerial-highway.jpg' }
];

export default function FeaturedProjects({ theme, lang = 'ar' }) {
  const [selectedModalProject, setSelectedModalProject] = useState(null);
  const [projectFilter, setProjectFilter] = useState('all'); // 'all' | 'field' | 'strategic'
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadSuccessAlert, setUploadSuccessAlert] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef(null);
  const [uploadTab, setUploadTab] = useState('file'); // 'file' | 'presets' | 'url'
  
  const [newProjectPhoto, setNewProjectPhoto] = useState({
    title: '',
    region: 'القطاع الأول (أوباري - الفيوات)',
    image: '/road-asphalt-paver.jpg',
    desc: '',
    contractor: '',
    targetProject: 'new'
  });

  const loadAllExecutiveProjects = () => {
    let baseProjects = [...nationalProjects];
    try {
      const savedCustom = safeStorageGet('portal-national-projects', null);
      if (savedCustom && Array.isArray(savedCustom) && savedCustom.length > 0) {
        baseProjects = savedCustom;
      }
    } catch (e) {}
    return baseProjects;
  };

  const [projectsList, setProjectsList] = useState(loadAllExecutiveProjects);

  useEffect(() => {
    const handleStorageUpdate = () => {
      setProjectsList(loadAllExecutiveProjects());
    };
    window.addEventListener('storage', handleStorageUpdate);
    return () => window.removeEventListener('storage', handleStorageUpdate);
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const compressedDataUrl = await compressImageFile(file, 1600, 1100, 0.82);
      setNewProjectPhoto(prev => ({
        ...prev,
        image: compressedDataUrl,
        title: prev.title || file.name.replace(/\.[^/.]+$/, "")
      }));
    } catch (err) {
      alert(err.message || 'تعذر معالجة الصورة، يرجى اختيار ملف صورة آخر');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSaveProjectPhoto = (e) => {
    e.preventDefault();
    if (!newProjectPhoto.title.trim()) return;

    const finalImage = newProjectPhoto.image || '/road-asphalt-paver.jpg';
    let currentProjects = loadAllExecutiveProjects();

    // 1. If user chose to create a new executive project card:
    if (newProjectPhoto.targetProject === 'new') {
      const newCustomProject = {
        id: `PRJ-EXEC-${Date.now().toString().slice(-4)}`,
        title: newProjectPhoto.title.trim(),
        titleEn: newProjectPhoto.title.trim(),
        region: newProjectPhoto.region || 'القطاع الأول (أوباري - الفيوات)',
        regionEn: newProjectPhoto.region || 'Ubari - Ghat Sector',
        lengthKm: 35,
        progress: 88,
        status: 'in_progress',
        statusLabel: 'توثيق تنفيذي ميداني 4K',
        statusLabelEn: 'Field Execution',
        statusColor: 'amber',
        budget: 'معتمد وموثق',
        contractor: newProjectPhoto.contractor?.trim() || 'م. الموقع الميداني',
        startDate: new Date().toISOString().split('T')[0],
        targetDate: '2026-12-31',
        image: finalImage,
        desc: newProjectPhoto.desc?.trim() || `توثيق تنفيذي ميداني عالي الدقة لأعمال الرصف والتطوير بمشروع طريق أوباري - غات.`,
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

      const updated = [newCustomProject, ...currentProjects];
      safeStorageSet('portal-national-projects', updated);
      setProjectsList(updated);
    } else {
      // 2. User chose to update an existing strategic project cover:
      const updated = currentProjects.map(p => {
        if (p.id === newProjectPhoto.targetProject) {
          return { ...p, image: finalImage, title: newProjectPhoto.title || p.title };
        }
        return p;
      });
      safeStorageSet('portal-national-projects', updated);
      setProjectsList(updated);
    }

    // 3. Also register in field photos (portal-field-photos-v2) for the 4K media gallery:
    const newDoc = {
      id: `PH-${Date.now().toString().slice(-4)}`,
      title: newProjectPhoto.title.trim(),
      titleEn: newProjectPhoto.title.trim(),
      sector: newProjectPhoto.region,
      category: 'رصف الأسفلت',
      desc: newProjectPhoto.desc?.trim() || `توثيق تنفيذي ميداني جديد أضيف لقسم المشروعات التنفيذية.`,
      date: new Date().toISOString().split('T')[0],
      src: finalImage,
      img: finalImage,
      author: newProjectPhoto.contractor?.trim() || 'م. الموقع الميداني',
      photographer: newProjectPhoto.contractor?.trim() || 'م. الموقع الميداني'
    };

    let photos = [];
    try {
      const saved = safeStorageGet('portal-field-photos-v2', []);
      if (Array.isArray(saved)) photos = saved;
    } catch (e) {}
    photos = [newDoc, ...photos];
    safeStorageSet('portal-field-photos-v2', photos);

    // Dispatch event and update state
    window.dispatchEvent(new Event('storage'));
    setIsUploadModalOpen(false);
    setUploadSuccessAlert(newProjectPhoto.title);
    setTimeout(() => setUploadSuccessAlert(null), 4000);
    setNewProjectPhoto({
      title: '',
      region: 'القطاع الأول (أوباري - الفيوات)',
      image: '/road-asphalt-paver.jpg',
      desc: '',
      contractor: '',
      targetProject: 'new'
    });
  };

  const handleDeleteCustomProject = (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('هل تريد بالتأكيد حذف هذا المشروع التنفيذي المرفوع؟')) return;
    const current = loadAllExecutiveProjects();
    const updated = current.filter(p => p.id !== id);
    safeStorageSet('portal-national-projects', updated);
    setProjectsList(updated);
    if (selectedModalProject && selectedModalProject.id === id) {
      setSelectedModalProject(null);
    }
    window.dispatchEvent(new Event('storage'));
  };

  const filteredProjects = projectsList.filter(p => {
    if (projectFilter === 'field') return p.isFieldDoc;
    if (projectFilter === 'strategic') return !p.isFieldDoc;
    return true;
  });

  return (
    <section id="projects-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 select-none">

      {/* ── Section Title Header with GSAP Reveal ── */}
      <div className="text-center max-w-3xl mx-auto space-y-3 gsap-header">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black border shadow-sm ${theme === 'light'
            ? 'bg-amber-100/90 border-amber-300 text-amber-950'
            : 'bg-amber-500/10 border-amber-500/35 text-amber-300'
          }`}>
          <Layers className="w-4 h-4 text-amber-500" />
          <span>{lang === 'ar' ? 'حزم ومشاريع مسار أوباري – غات' : 'Ubari – Ghat Corridor Projects'}</span>
        </div>
        <h2 className={`text-3xl sm:text-5xl font-black leading-snug ${theme === 'light' ? 'text-slate-950' : 'text-white'
          }`}>
          {lang === 'ar' ? 'المشروعات التنفيذية لمسار أوباري – غات (360 كم)' : 'Execution Projects – Ubari – Ghat Highway'}
        </h2>
        <p className={`text-xs sm:text-base font-medium ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'
          }`}>
          {lang === 'ar'
            ? 'الحزم والمشاريع الهندسية المتكاملة والتوثيقات الميدانية 4K الجاري تنفيذها على امتداد قطاعات طريق أوباري - غات.'
            : 'Integrated engineering packages and 4K field execution visuals along the Ubari – Ghat highway corridor.'}
        </p>
      </div>

      {/* ── Continuous Moving Marquee for Selected Work ── */}
      <div className="w-full">
        <MarqueeTicker variant="selected-work" theme={theme} direction={lang === 'ar' ? 'rtl' : 'ltr'} />
      </div>



      {/* Upload Success Alert */}
      {uploadSuccessAlert && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>تمت إضافة الصورة بنجاح ودمجها مباشرة في المشروعات التنفيذية: {uploadSuccessAlert}</span>
        </div>
      )}

      {/* ── Luxury Cards Grid (Ubari - Ghat Projects) with GSAP Stagger ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 gsap-stagger-container">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className={`p-4 sm:p-8 rounded-2xl sm:rounded-[36px] border shadow-2xl space-y-4 sm:space-y-6 text-start relative overflow-hidden glass-card-hover gsap-stagger-item ${
              project.isFieldDoc ? 'border-amber-500/40 ring-1 ring-amber-500/20' : ''
            } ${theme === 'light'
                ? 'bg-white border-slate-200/90 text-slate-900 shadow-slate-200/80'
                : 'bg-[#0a0f1d]/95 border-white/15 text-white shadow-black/80'
              }`}
          >
            {/* Top 4K Photo Box with Live Overlay */}
            <div 
              className="h-48 xs:h-56 sm:h-72 rounded-xl sm:rounded-[26px] overflow-hidden relative border border-slate-200 dark:border-white/10 group cursor-pointer bg-[#0c1220]" 
              onClick={() => setSelectedModalProject(project)}
              data-cursor-image="true"
              data-cursor-label={lang === 'ar' ? 'عرض 4K ↗' : 'View 4K ↗'}
            >
              <img
                src={resolveAsset(project.image)}
                alt={project.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover photo-hover-zoom group-hover:scale-110 transition-transform duration-700 ease-out"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = resolveAsset('./road-asphalt-paver.jpg');
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-75" />

              {/* Status Badge */}
              <span className={`absolute top-2.5 sm:top-3.5 right-2.5 sm:right-3.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-black shadow-lg border ${
                project.isFieldDoc
                  ? 'bg-amber-500 text-slate-950 border-amber-300'
                  : project.status === 'completed'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : project.status === 'in_progress'
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-rose-500 text-white border-rose-400'
                }`}>
                {project.statusLabel}
              </span>

              {/* Distance / Sector Tag */}
              <span className="absolute bottom-3.5 right-3.5 px-3 py-1.5 rounded-xl bg-black/85 text-amber-400 font-mono font-black text-xs border border-white/10">
                {project.lengthKm ? `${project.lengthKm} ${lang === 'ar' ? 'كم' : 'KM'} • ` : ''}{project.region}
              </span>
            </div>

            {/* Title and Narrative */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-amber-500 font-mono font-bold">
                <span>{project.id}</span>
                <span>{project.startDate} {project.targetDate ? `— ${project.targetDate}` : ''}</span>
              </div>
              <h3 className={`text-xl sm:text-2xl font-black ${theme === 'light' ? 'text-slate-950' : 'text-white'}`}>
                {project.title}
              </h3>
              <p className={`text-xs sm:text-sm font-medium leading-relaxed line-clamp-2 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'
                }`}>
                {project.desc}
              </p>
            </div>

            {/* Live Progress Bar with Glow */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  {lang === 'ar' ? 'نسبة الإنجاز الفعلي:' : 'Actual Completion:'}
                </span>
                <span className="font-mono font-black text-amber-500 text-sm">{project.progress}%</span>
              </div>
              <div className={`w-full h-3 rounded-full overflow-hidden p-0.5 border ${theme === 'light' ? 'bg-slate-200 border-slate-300' : 'bg-slate-800 border-white/5'
                }`}>
                <div
                  className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 h-full rounded-full shimmer-active shadow-md transition-all duration-700"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Specifications Strip & Interactive Button */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Building2 className="w-3.5 h-3.5 text-amber-500" />
                  <span className="truncate max-w-[140px]">{project.contractor}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{project.statusLabel || (project.status === 'completed' ? 'مشروع مكتمل' : 'جاري التنفيذ')}</span>
                </div>
              </div>

              {/* Optional Delete Button for Custom Uploaded Projects */}
              {(project.isCustomUploaded || project.id?.startsWith('PRJ-EXEC-')) && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleDeleteCustomProject(project.id, e)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer border border-rose-500/20"
                    title="حذف هذا المشروع التنفيذي المرفوع"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* ── Full Specifications Modal Dialog ── */}
      {selectedModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className={`w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-5 border shadow-2xl text-start relative animate-scaleUp max-h-[92vh] overflow-y-auto ${theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#090e1a] border-amber-500/30 text-white'
            }`}>

            {/* Close Button */}
            <button
              onClick={() => setSelectedModalProject(null)}
              className="absolute top-5 left-5 w-9 h-9 rounded-full bg-slate-500/10 hover:bg-slate-500/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Photo preview in Modal */}
            <div className="h-56 sm:h-64 rounded-2xl overflow-hidden bg-black border border-slate-200 dark:border-white/10 relative">
              <img src={selectedModalProject.image} alt={selectedModalProject.title} className="w-full h-full object-cover" />
              <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md text-amber-400 text-xs font-bold font-mono">
                {selectedModalProject.region}
              </div>
            </div>

            {/* Modal Header */}
            <div className="space-y-1.5 pr-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-500">
                <span>{selectedModalProject.id}</span>
                <span>•</span>
                <span>{selectedModalProject.region}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black">
                {selectedModalProject.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                {selectedModalProject.desc}
              </p>
            </div>

            {/* Key Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 block">{lang === 'ar' ? 'الطول الإجمالي:' : 'Total Length:'}</span>
                <strong className="text-amber-500 font-mono text-base">{selectedModalProject.lengthKm} كم</strong>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 block">{lang === 'ar' ? 'نسبة الإنجاز:' : 'Progress:'}</span>
                <strong className="text-emerald-400 font-mono text-base">{selectedModalProject.progress}%</strong>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 block">{lang === 'ar' ? 'الجهة المشرفة:' : 'Authority:'}</span>
                <strong className="text-amber-300 text-xs">جهاز مشروعات المواصلات</strong>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 block">{lang === 'ar' ? 'الحالة:' : 'Status:'}</span>
                <strong className="text-cyan-400 text-xs">{selectedModalProject.statusLabel}</strong>
              </div>
            </div>

            {/* Scope of Work Points */}
            <div className="space-y-2 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
              <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                <Wrench className="w-4 h-4" />
                <span>{lang === 'ar' ? 'بنود ونطاق الأعمال الهندسية المعتمدة:' : 'Approved Scope of Engineering Work:'}</span>
              </h4>
              <ul className="text-xs space-y-1.5 text-slate-300 list-disc list-inside leading-relaxed">
                <li>قشط الطبقات الأسفلتية المتهالكة وإعادة تدويرها وتسوية طبقة الأساس الحبيبي (Sub-base).</li>
                <li>رصف طبقة أسفلتية سطحية معززة بمادة البوليمر بسماكة 7 سم وفق معايير AASHTO.</li>
                <li>إنشاء عبّارات خرسانية هيدروليكية لتصريف مياه السيول وحماية أكتاف الطريق.</li>
                <li>تركيب منظومات إنارة ذكية بالطاقة الشمسية وشواخص فسفورية عاكسة للرؤية الليلية.</li>
              </ul>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
              <div className="text-slate-400 font-medium">
                {lang === 'ar' ? 'المقاول المنفذ:' : 'Contractor:'} <strong className="text-white">{selectedModalProject.contractor}</strong>
              </div>
              <button
                onClick={() => setSelectedModalProject(null)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer shadow-lg transition-transform active:scale-95"
              >
                {lang === 'ar' ? 'إغلاق النافذة' : 'Close'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Direct Upload Modal for Featured Projects ── */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <form onSubmit={handleSaveProjectPhoto} className={`w-full max-w-xl rounded-3xl p-6 sm:p-7 space-y-4 border shadow-2xl text-start relative animate-scaleUp max-h-[92vh] overflow-y-auto ${
            theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#090e1a] border-amber-500/30 text-white'
          }`}>
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-black text-base flex items-center gap-2">
                <ImagePlus className="w-5 h-5 text-amber-500" />
                <span>إضافة ورفع صورة للمشروعات التنفيذية (4K)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                ارفع صورة من جهازك لعرضها فوراً في بطاقات المشروعات التنفيذية بالمنصة
              </p>
            </div>

            {/* Source Tabs */}
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
                <span>صور المشروع</span>
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

            {/* Tab 1: File Upload */}
            {uploadTab === 'file' && (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {isCompressing ? (
                  <div className="border-2 border-dashed border-amber-500 rounded-2xl p-8 text-center bg-amber-500/10 animate-pulse">
                    <Loader2 className="w-8 h-8 text-amber-500 mx-auto mb-2 animate-spin" />
                    <div className="font-black text-xs text-amber-600 dark:text-amber-400">
                      جاري معالجة وضغط الصورة بجودة 4K فائقة...
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      يتم تقليص حجم الملف تلقائياً لسرعة التحميل والحفظ
                    </div>
                  </div>
                ) : newProjectPhoto.image && (newProjectPhoto.image.startsWith('data:') || newProjectPhoto.image.startsWith('/')) ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/50 bg-black">
                    <img src={newProjectPhoto.image} alt="معاينة" className="w-full h-44 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-3">
                      <span className="text-[11px] font-bold text-emerald-400 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تم اختيار الصورة بنجاح</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold cursor-pointer"
                        >
                          تغيير
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewProjectPhoto(prev => ({ ...prev, image: '/road-asphalt-paver.jpg' }))}
                          className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-bold cursor-pointer"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-amber-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 dark:bg-white/5 hover:bg-amber-500/10 transition-all group"
                  >
                    <UploadCloud className="w-8 h-8 text-amber-500 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      اضغط لاختيار صورة من جهازك أو هاتفك
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      يدعم ملفات JPG, PNG, WEBP بدقة 4K
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Presets */}
            {uploadTab === 'presets' && (
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                {PROJECT_PRESET_IMAGES.map(p => {
                  const isSel = newProjectPhoto.image === p.src;
                  return (
                    <div
                      key={p.src}
                      onClick={() => setNewProjectPhoto(prev => ({ ...prev, image: p.src, title: prev.title || p.title }))}
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

            {/* Tab 3: URL */}
            {uploadTab === 'url' && (
              <div>
                <input
                  type="url"
                  value={newProjectPhoto.image.startsWith('data:') ? '' : newProjectPhoto.image}
                  onChange={(e) => setNewProjectPhoto({ ...newProjectPhoto, image: e.target.value })}
                  placeholder="https://... أو /road-asphalt-paver.jpg"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 outline-none focus:border-amber-500 bg-transparent text-xs"
                />
              </div>
            )}

            {/* Destination Selector */}
            <div className="space-y-3 text-xs pt-1 border-t border-slate-200 dark:border-white/10">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">مكان العرض في المشروعات التنفيذية:</label>
                <select
                  value={newProjectPhoto.targetProject}
                  onChange={(e) => setNewProjectPhoto({ ...newProjectPhoto, targetProject: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 outline-none focus:border-amber-500 bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white"
                >
                  <option value="new">إدراج كحزمة عمل وصورة تنفيذية جديدة (تظهر في المقدمة فوراً)</option>
                  <option value="PRJ-UBG-360">تحديث الصورة الرئيسية: مشروع صيانة ورصف طريق أوباري – غات</option>
                  <option value="PRJ-UBG-SOL-1100">تحديث الصورة الرئيسية: مشروع إنارة مسار أوباري – غات بالطاقة الشمسية</option>
                  <option value="PRJ-UBG-CUL-028">تحديث الصورة الرئيسية: مشروع عبّارات تصريف السيول</option>
                  <option value="PRJ-UBG-DUN-120">تحديث الصورة الرئيسية: مشروع تثبيت الكثبان الرملية وتوسعة الأكتاف</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">عنوان المشروع أو الصورة التنفيذية:</label>
                <input
                  type="text"
                  required
                  value={newProjectPhoto.title}
                  onChange={(e) => setNewProjectPhoto({ ...newProjectPhoto, title: e.target.value })}
                  placeholder="مثال: رصف الأسفلت الساخن بالقطاع الأول"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 outline-none focus:border-amber-500 bg-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">نطاق العمل / القطاع:</label>
                  <input
                    type="text"
                    value={newProjectPhoto.region}
                    onChange={(e) => setNewProjectPhoto({ ...newProjectPhoto, region: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 outline-none focus:border-amber-500 bg-transparent"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">المقاول / المهندس المشرف:</label>
                  <input
                    type="text"
                    value={newProjectPhoto.contractor}
                    onChange={(e) => setNewProjectPhoto({ ...newProjectPhoto, contractor: e.target.value })}
                    placeholder="م. عبد السلام الفزاني"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 outline-none focus:border-amber-500 bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">تفاصيل العمل الهندسي:</label>
                <textarea
                  rows="2"
                  value={newProjectPhoto.desc}
                  onChange={(e) => setNewProjectPhoto({ ...newProjectPhoto, desc: e.target.value })}
                  placeholder="وصف تفصيلي للأعمال التنفيذية الموثقة..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 outline-none focus:border-amber-500 bg-transparent resize-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <ImagePlus className="w-4 h-4" />
                <span>حفظ وإدراج في المشروعات التنفيذية</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </section>
  );
}
