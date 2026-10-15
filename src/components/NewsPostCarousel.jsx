import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  MapPin, 
  Tag, 
  Newspaper
} from 'lucide-react';
import { getSavedNewsPosts } from '../services/api';
import { resolveAsset } from '../utils/assets';
import NewsDetailModal from './NewsDetailModal';

export default function NewsPostCarousel({ theme, lang = 'ar' }) {
  const [posts, setPosts] = useState(getSavedNewsPosts);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedPostModal, setSelectedPostModal] = useState(null);

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
        <div className="px-4 sm:px-8 pt-5 sm:pt-6 pb-3.5 sm:pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/10 relative z-10">
          
          {/* Author / Source Emblem */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-[1.5px] shadow-md shadow-amber-500/20 flex-shrink-0">
              <img 
                src={resolveAsset('./logo-agency.jpg')} 
                alt="جهاز تنفيذ مشروعات المواصلات" 
                className="w-full h-full object-contain rounded-2xl bg-white"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <div className="text-start min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-black text-xs sm:text-sm leading-tight sm:leading-snug truncate">
                  {lang === 'ar' ? 'جهاز تنفيذ مشروعات المواصلات' : 'Transport Projects Authority'}
                </h4>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  {lang === 'ar' ? 'معتمد' : 'Verified'}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate mt-0.5">
                {lang === 'ar' ? currentPost.author : currentPost.authorEn} • {lang === 'ar' ? currentPost.timeAgo : currentPost.timeAgoEn}
              </p>
            </div>
          </div>

          {/* Right Badges: Category & Live Indicator */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <span className="px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-black bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-1.5">
              <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{lang === 'ar' ? currentPost.category : currentPost.categoryEn}</span>
            </span>

            <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-red-500/10 text-red-500 border border-red-500/25 text-[11px] sm:text-xs font-black">
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
            onClick={() => setSelectedPostModal(currentPost)}
            className="lg:col-span-7 relative overflow-hidden h-64 sm:h-80 md:h-96 lg:h-auto min-h-[250px] sm:min-h-[360px] bg-[#0c1220] group cursor-pointer"
            data-cursor-image="true"
            data-cursor-label={lang === 'ar' ? 'عرض التفاصيل الكاملة ↗' : 'View Full Story ↗'}
          >
            <div 
              className={`w-full h-full relative transition-all duration-500 ease-in-out ${
                isFading ? 'opacity-0 scale-[1.03]' : 'opacity-100 scale-100'
              }`}
            >
              <img 
                src={resolveAsset(currentPost.image)} 
                alt={currentPost.title} 
                className="w-full h-full object-cover object-center min-h-[250px] sm:min-h-[360px] photo-hover-zoom group-hover:scale-108 transition-transform duration-700 ease-out"
                loading="eager"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = resolveAsset('./road-asphalt-paver.jpg');
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-75" />
            </div>

            {/* Overlaid Location Info */}
            <div className="absolute bottom-3.5 sm:bottom-4 start-3.5 sm:start-5 flex items-center text-white text-[11px] sm:text-xs font-bold pointer-events-none">
              <span className="flex items-center gap-1.5 bg-black/85 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl border border-white/20 shadow-lg">
                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                <span>{lang === 'ar' ? currentPost.location : currentPost.locationEn}</span>
              </span>
            </div>

            {/* Arrow Nav Overlay on Image */}
            <div className="absolute inset-y-0 start-2.5 sm:start-3 flex items-center">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                title={lang === 'ar' ? 'الخبر السابق' : 'Previous News'}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center border border-white/25 shadow-xl transition-transform hover:scale-110 cursor-pointer"
              >
                {lang === 'ar' ? <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
            <div className="absolute inset-y-0 end-2.5 sm:end-3 flex items-center">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                title={lang === 'ar' ? 'الخبر التالي' : 'Next News'}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center border border-white/25 shadow-xl transition-transform hover:scale-110 cursor-pointer"
              >
                {lang === 'ar' ? <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>

          {/* ── 2. The Post Content (Text & Narrative) ── */}
          <div className="lg:col-span-5 p-4 sm:p-7 md:p-8 flex flex-col justify-between text-start space-y-4 sm:space-y-6">
            
            <div 
              className={`space-y-3 sm:space-y-4 transition-all duration-400 ease-in-out ${
                isFading ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
              }`}
            >
              {/* Badge & News Counter */}
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="inline-flex items-center gap-1.5 text-amber-500 font-bold">
                  <span>{lang === 'ar' ? 'المستجدات الميدانية الرسمية' : 'Official Field Update'}</span>
                </span>
                <span className="font-mono text-slate-400 font-extrabold text-xs">
                  {currentIndex + 1} / {posts.length}
                </span>
              </div>

              {/* Bold Title */}
              <h3 
                onClick={() => setSelectedPostModal(currentPost)}
                className={`text-base sm:text-xl lg:text-2xl font-black leading-snug cursor-pointer hover:text-amber-500 transition-colors ${
                  theme === 'light' ? 'text-slate-950' : 'text-white'
                }`}
              >
                {lang === 'ar' ? currentPost.title : currentPost.titleEn}
              </h3>

              {/* Comprehensive Description */}
              <p className={`text-xs sm:text-sm leading-relaxed font-medium ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-300'
              }`}>
                {lang === 'ar' ? currentPost.desc : currentPost.descEn}
              </p>

              {/* Read Full Article Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPostModal(currentPost)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 border border-amber-500/35 text-xs font-black transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
                >
                  <span>{lang === 'ar' ? 'قراءة تفاصيل الخبر بالكامل ↗' : 'Read Full Article ↗'}</span>
                </button>
              </div>
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

      {/* ── Full News Post Modal (يظهر الخبر بالكامل عند النقر) ── */}
      <NewsDetailModal 
        post={selectedPostModal}
        isOpen={Boolean(selectedPostModal)}
        onClose={() => setSelectedPostModal(null)}
        theme={theme}
        lang={lang}
      />
    </section>
  );
}
