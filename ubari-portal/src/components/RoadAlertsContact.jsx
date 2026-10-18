import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Sun, 
  Wind, 
  Send, 
  CheckCircle, 
  PhoneCall, 
  Mail, 
  MapPin, 
  MessageSquare 
} from 'lucide-react';

export default function RoadAlertsContact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    category: 'استفسار عن حالة الطريق',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', phone: '', category: 'استفسار عن حالة الطريق', message: '' });
    }, 4000);
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 animate-fadeIn">
      
      {/* Weather & Road Safety Alert Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-[#17140f] via-[#0d1220] to-[#120d1c]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0 animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                تنبيه ميداني للسلامة المرورية
              </span>
              <h3 className="text-lg font-extrabold text-white mt-1">
                حالة الطقس ورياح الصحراء بالقطاع 03 (العوينات – البركت)
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                سرعة الرياح 22 كم/ساعة – الرؤية الأفقية ممتازة (10 كم). يرجى توخي الحذر عند تجاوز الآليات الميدانية للرصف.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="bg-white/5 px-3.5 py-2 rounded-xl border border-white/10 text-center">
              <span className="text-slate-400 block text-[10px]">حرارة الأسفلت الميدانية</span>
              <span className="text-amber-400 font-bold text-sm">155°C</span>
            </div>
            <div className="bg-white/5 px-3.5 py-2 rounded-xl border border-white/10 text-center">
              <span className="text-slate-400 block text-[10px]">حالة حركة السير</span>
              <span className="text-emerald-400 font-bold text-sm">مفتوح وسالك</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact & Feedback Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Contact Info Column */}
        <div className="lg:col-span-5 glass-panel p-8 rounded-3xl border border-white/10 bg-[#0d1220] space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
              <PhoneCall className="w-4 h-4 text-amber-400" />
              <span>التواصل والمتابعة المباشرة</span>
            </div>
            <h3 className="text-2xl font-black text-white">
              جهاز تنفيذ مشروعات المواصلات
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              يسعدنا استقبال الملاحظات والبلاغات الفنية من المواطنين والشركات وسائقي الشاحنات التجاريين على مدار الساعة.
            </p>
          </div>

          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex items-center gap-3 bg-white/5 p-3.5 rounded-xl border border-white/5">
              <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <strong className="text-white block font-bold">المقر الرئيس للجهاز:</strong>
                <span>طرابلس / غريان / الفرع الجنوبي (سبها - أوبارﻱ)</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 p-3.5 rounded-xl border border-white/5">
              <PhoneCall className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              <div>
                <strong className="text-white block font-bold">غرفة العمليات والطوارئ:</strong>
                <span className="font-mono text-amber-300">+218 (0) 71 223 4567</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 p-3.5 rounded-xl border border-white/5">
              <Mail className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <strong className="text-white block font-bold">البريد الإلكتروني المباشر:</strong>
                <span className="font-mono text-emerald-300">info@transport.gov.ly</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Form Column */}
        <div className="lg:col-span-7 glass-panel p-8 rounded-3xl border border-white/10 bg-[#0d1220]">
          <h3 className="text-xl font-black text-white mb-2">
            إرسال ملاحظة أو بلاغ فني عن الطريق
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            يتم توجيه جميع الرسائل تلقائياً إلى إدارة الإشراف الفني والمهندس المشرف بالقطاع المعني.
          </p>

          {submitted ? (
            <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-lg font-bold text-white">تم استلام بلاغك بنجاح!</h4>
              <p className="text-xs text-slate-300">شكراً لمساهمتك في متابعة جودة طريق أوبارﻱ – غات.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-right text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">الاسم الكريم</label>
                  <input
                    type="text"
                    required
                    placeholder="أدخل اسمك"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900 text-white rounded-xl px-4 py-3 border border-white/10 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">رقم الهاتف</label>
                  <input
                    type="tel"
                    required
                    placeholder="09XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-900 text-white rounded-xl px-4 py-3 border border-white/10 focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">نوع الملاحظة</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-900 text-white rounded-xl px-4 py-3 border border-white/10 focus:border-amber-500 focus:outline-none"
                >
                  <option value="استفسار عن حالة الطريق">استفسار عن حالة الطريق وسالكيته</option>
                  <option value="بلاغ عن عطل آلية أو كشط">بلاغ عن عطل آلية أو أعمال كشط</option>
                  <option value="اقتراح لإدارة الإشراف">اقتراح لإدارة الإشراف بالجهاز</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">تفاصيل الرسالة</label>
                <textarea
                  rows="4"
                  required
                  placeholder="اكتب تفاصيل ملاحظتك هنا..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-slate-900 text-white rounded-xl px-4 py-3 border border-white/10 focus:border-amber-500 focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>إرسال الرسالة للإدارة</span>
              </button>
            </form>
          )}

        </div>

      </div>

    </section>
  );
}
