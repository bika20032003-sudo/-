import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  MapPin, 
  Tag, 
  Newspaper
} from 'lucide-react';
import { getSavedNewsPosts } from '../services/api';

export default function NewsPostCarousel({ theme, lang = 'ar' }) {
  const [posts, setPosts] = useState(getSavedNewsPosts);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Sync with localStorage updates dispatched across tabs/components
  useEffect(() => {
    const handleStorage = () => {
      const updated = getSavedNewsPosts();
      setPosts(updated);
      if (currentIndex >= updated.length) {
        setCurrentIndex(0);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [currentIndex]);

  // Transition handler with smooth fade animation
  const goToSlide = useCallback((newIndex) => {
    if (newIndex === currentIndex || isFading || posts.length === 0) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex(newIndex % posts.length);
      setIsFading(false);
    }, 280); // Smooth fade transition delay
  }, [currentIndex, isFading, posts.length]);

  const nextSlide = useCallback(() => {
    if (posts.length === 0) return;
    const next = (currentIndex + 1) % posts.length;
    goToSlide(next);
  }, [currentIndex, goToSlide, posts.length]);

  const prevSlide = useCallback(() => {
    if (posts.length === 0) return;
    const prev = (currentIndex - 1 + posts.length) % posts.length;
    goToSlide(prev);
  }, [currentIndex, goToSlide, posts.length]);

  // 5-second automatic progression with fade animation
  useEffect(() => {
    if (isPaused || posts.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused, posts.length]);

  if (!posts || posts.length === 0) return null;

  const currentPost = posts[currentIndex] || posts[0];


  return (
    <section 
      id="news-post-section" 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 select-none animate-fadeIn"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Standalone Post Card (زي البوست بروحها اخبار معا الصور) ── */}
      <div className={`relative overflow-hidden rounded-[32px] border shadow-2xl transition-all duration-500 glass-card-hover ${
        theme === 'light'
          ? 'bg-white border-amber-300/80 shadow-slate-200/90 text-slate-900'
          : 'bg-[#090e1a]/95 border-amber-500/25 shadow-black/80 text-white'
      }`}>
        
        {/* Ambient Top Glow Orbs (GPU-friendly zero-blur) */}
        <div 
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(255,171,0,0.3) 0%, transparent 70%)' }}
        />
        <div 
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full pointer-events-none opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)' }}
        />

        {/* ── Post Header: Source Brand, Live Tag & Category ── */}
        <div className="px-5 sm:px-8 pt-6 pb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-white/10 relative z-10">
          
          {/* Author / Source Emblem */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-[1.5px] shadow-md shadow-amber-500/20 flex-shrink-0">
              <img 
                src="/logo-agency.jpg" 
                alt="جهاز تنفيذ مشروعات المواصلات" 
                className="w-full h-full object-contain rounded-2xl bg-white"
              />
            </div>
            <div className="text-start">
              <div className="flex items-center gap-2">
                <h4 className="font-black text-xs sm:text-sm leading-snug">
                  {lang === 'ar' ? 'جهاز تنفيذ مشروعات المواصلات' : 'Transport Projects Authority'}
                </h4>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  {lang === 'ar' ? 'حساب رسمي معتمد' : 'Verified'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {lang === 'ar' ? currentPost.author : currentPost.authorEn} • {lang === 'ar' ? currentPost.timeAgo : currentPost.timeAgoEn}
              </p>
            </div>
          </div>

          {/* Right Badges: Category & Live Indicator */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl text-xs font-black bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? currentPost.category : currentPost.categoryEn}</span>
            </span>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-500/10 text-red-500 border border-red-500/25 text-xs font-black">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span>{lang === 'ar' ? 'مستجدات حية' : 'Live Post'}</span>
            </div>
          </div>

        </div>

        {/* ── Main Post Body: Photo + Editorial News ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative z-10 items-stretch">
          
          {/* ── 1. The Post Visual Photo with Fade Animation & Hover Zoom ── */}
          <div 
            className="lg:col-span-7 relative overflow-hidden min-h-[300px] sm:min-h-[420px] bg-black group cursor-pointer"
            data-cursor-image="true"
            data-cursor-label={lang === 'ar' ? 'معاينة الصورة ↗' : 'View Photo ↗'}
          >
            <div 
              className={`w-full h-full relative transition-all duration-500 ease-in-out ${
                isFading ? 'opacity-0 scale-[1.03]' : 'opacity-100 scale-100'
              }`}
            >
              <img 
                src={currentPost.image} 
                alt={currentPost.title} 
                className="w-full h-full object-cover object-center min-h-[300px] sm:min-h-[420px] photo-hover-zoom group-hover:scale-108 transition-transform duration-700 ease-out"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-75" />
            </div>

            {/* Overlaid Location Info */}
            <div className="absolute bottom-4 start-5 flex items-center text-white text-xs font-bold pointer-events-none">
              <span className="flex items-center gap-1.5 bg-black/85 px-3.5 py-1.5 rounded-xl border border-white/20 shadow-lg">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'ar' ? currentPost.location : currentPost.locationEn}</span>
              </span>
            </div>

            {/* Arrow Nav Overlay on Image */}
            <div className="absolute inset-y-0 start-3 flex items-center">
              <button
                onClick={prevSlide}
                title={lang === 'ar' ? 'الخبر السابق' : 'Previous News'}
                className="w-10 h-10 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center border border-white/25 shadow-xl transition-transform hover:scale-110 cursor-pointer"
              >
                {lang === 'ar' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>
            </div>
            <div className="absolute inset-y-0 end-3 flex items-center">
              <button
                onClick={nextSlide}
                title={lang === 'ar' ? 'الخبر التالي' : 'Next News'}
                className="w-10 h-10 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center border border-white/25 shadow-xl transition-transform hover:scale-110 cursor-pointer"
              >
                {lang === 'ar' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* ── 2. The Post Content (Text & Narrative) ── */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between text-start space-y-6">
            
            <div 
              className={`space-y-4 transition-all duration-400 ease-in-out ${
                isFading ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
              }`}
            >
              {/* Badge & News Counter */}
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="inline-flex items-center gap-1.5 text-amber-500 font-bold">
                  <span>{lang === 'ar' ? 'المستجدات الميدانية الرسمية' : 'Official Field Update'}</span>
                </span>
                <span className="font-mono text-slate-400 font-extrabold">
                  {currentIndex + 1} / {posts.length}
                </span>
              </div>

              {/* Bold Title */}
              <h3 className={`text-xl sm:text-2xl font-black leading-snug ${
                theme === 'light' ? 'text-slate-950' : 'text-white'
              }`}>
                {lang === 'ar' ? currentPost.title : currentPost.titleEn}
              </h3>

              {/* Comprehensive Description */}
              <p className={`text-xs sm:text-sm leading-relaxed font-medium ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-300'
              }`}>
                {lang === 'ar' ? currentPost.desc : currentPost.descEn}
              </p>
            </div>

          </div>

        </div>

        {/* ── Post Footer: Pagination Dots (Exact style from user's image: Capsule with Blue Active Dot) ── */}
        <div className="py-4 px-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-black/30 flex items-center justify-center relative z-10">
          
          {/* Centered Pill Capsule with Dots matching the user's photo! */}
          <div className="flex items-center gap-2 py-1.5 px-3.5 rounded-full bg-slate-900/95 dark:bg-black/90 border border-white/20 shadow-lg">
            {posts.map((post, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={post.id}
                  onClick={() => goToSlide(idx)}
                  title={`${lang === 'ar' ? 'عرض الخبر' : 'View Post'} ${idx + 1}`}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    isActive
                      ? 'w-5 h-2 bg-blue-500 shadow-md shadow-blue-500/60 scale-105'
                      : 'w-2 h-2 bg-white/40 hover:bg-white/90 hover:scale-125'
                  }`}
                />
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
