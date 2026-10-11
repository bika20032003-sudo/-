import React, { useState } from 'react';
import { MessageCircle, X, Send, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function FloatingWhatsApp({ lang = 'ar' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  // Official authority support number (customizable)
  const phoneNumber = '218910000000'; // Default Libya international prefix format

  const defaultTemplates = [
    {
      id: 1,
      textAr: 'السلام عليكم، أود الاستفسار عن الموقف التنفيذي لمشروع طريق أوباري - غات.',
      textEn: 'Hello, I would like to inquire about the execution status of the Ubari - Ghat road project.'
    },
    {
      id: 2,
      textAr: 'السلام عليكم، استفسار بشأن التنسيق الفني لقطاعات الطريق والشركات المنفذة.',
      textEn: 'Hello, inquiry regarding technical coordination for highway sectors and contractors.'
    },
    {
      id: 3,
      textAr: 'السلام عليكم، أرغب في تقديم بلاغ أو ملاحظة موقعية على مسار الطريق.',
      textEn: 'Hello, I would like to submit a field observation/report on the highway corridor.'
    }
  ];

  const handleSendMessage = (customMsg) => {
    const textToSend = customMsg || message || defaultTemplates[0][lang === 'ar' ? 'textAr' : 'textEn'];
    const encodedText = encodeURIComponent(textToSend);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    setMessage('');
  };

  return (
    <aside 
      aria-label={lang === 'ar' ? 'الدعم الفني عبر واتساب' : 'WhatsApp Support'}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9990] select-none flex flex-col items-end gap-3 pointer-events-auto"
    >
      
      {/* ── Quick Chat Dialog Popup ── */}
      {isOpen && (
        <div 
          className="w-[calc(100vw-2rem)] max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/30 bg-[#0c121e]/98 backdrop-blur-md text-white animate-fadeIn transition-all duration-200 shadow-emerald-950/50 flex flex-col"
          style={{ transformOrigin: 'bottom right' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 p-4 flex items-center justify-between text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center p-2 backdrop-blur-sm border border-white/30">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-emerald-800 rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-black tracking-wide">
                    {lang === 'ar' ? 'خدمة التواصل الميداني' : 'Field Support Center'}
                  </h4>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                </div>
                <p className="text-[10px] text-emerald-100 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  {lang === 'ar' ? 'متاح الآن للمواطنين والمقاولين' : 'Available for inquiries'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors text-white cursor-pointer"
              aria-label="إغلاق نافذة المحادثة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 space-y-3 bg-[#080d17]/80 text-xs">
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {lang === 'ar' 
                ? 'مرحباً بك في البوابة الإلكترونية لمشروع طريق أوباري – غات (360 كم). اختر قالباً جاهزاً أو اكتب رسالتك للتواصل المباشر عبر واتساب:'
                : 'Welcome to Ubari – Ghat Highway Portal. Choose a template or write your custom message for instant WhatsApp connection:'}
            </p>

            {/* Quick Templates */}
            <div className="space-y-1.5">
              {defaultTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSendMessage(lang === 'ar' ? t.textAr : t.textEn)}
                  className="w-full text-start p-2.5 rounded-xl bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 text-slate-200 text-[11px] font-medium transition-all duration-200 flex items-center gap-2 group cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 flex-shrink-0" />
                  <span className="line-clamp-2">{lang === 'ar' ? t.textAr : t.textEn}</span>
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="pt-2">
              <div className="relative flex items-center">
                <input 
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                  placeholder={lang === 'ar' ? 'اكتب استفسارك هنا...' : 'Type your inquiry...'}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-400 transition-colors"
                />
                <button
                  onClick={() => handleSendMessage()}
                  className="absolute left-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black flex items-center justify-center transition-transform active:scale-95 cursor-pointer shadow-md"
                  aria-label="إرسال عبر واتساب"
                >
                  <Send className="w-3.5 h-3.5 rotate-180" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="px-4 py-2 bg-black/40 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>ديوان مشروعات الجنوب</span>
            <span>24/7 Hotline</span>
          </div>
        </div>
      )}

      {/* ── Main WhatsApp Floating Trigger Button ── */}
      <div className="relative flex items-center gap-3">
        
        {/* Tooltip on hover (when chat modal is closed) */}
        {!isOpen && (
          <div 
            className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0c1322]/95 border border-emerald-500/40 text-emerald-300 text-xs font-black shadow-xl backdrop-blur-md transition-all duration-300 pointer-events-none ${
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{lang === 'ar' ? 'تواصل عبر واتساب' : 'Chat via WhatsApp'}</span>
          </div>
        )}

        {/* Floating Action Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative group w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-emerald-600 via-[#25D366] to-emerald-400 text-white flex items-center justify-center shadow-[0_10px_30px_rgba(37,211,102,0.45)] hover:shadow-[0_15px_40px_rgba(37,211,102,0.7)] transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer border-2 border-white/30"
          aria-label={lang === 'ar' ? 'فتح المحادثة الفورية عبر واتساب' : 'Open WhatsApp Support'}
          data-cursor-label="WhatsApp"
        >
          {/* Animated Pulse Waves */}
          <span className="animate-ping absolute -inset-1 rounded-full bg-emerald-400/40 pointer-events-none duration-1000" />
          <span className="absolute -inset-2 rounded-full border border-emerald-400/30 animate-pulse pointer-events-none" />

          {/* SVG WhatsApp Vector */}
          {isOpen ? (
            <X className="w-7 h-7 text-white transition-transform group-hover:rotate-90" />
          ) : (
            <svg 
              className="w-7 h-7 sm:w-8 sm:h-8 fill-current text-white transition-transform group-hover:scale-110" 
              viewBox="0 0 24 24"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
          )}

          {/* Unread Ping Badge */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 text-[9px] font-black text-black items-center justify-center border border-white">
              1
            </span>
          </span>
        </button>
      </div>
    </aside>
  );
}
