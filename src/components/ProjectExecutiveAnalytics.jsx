import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Activity,
  Layers,
  Sun,
  Users,
  ShieldCheck,
  Award,
  MapPin,
  Clock,
  ArrowUpRight,
  CheckCircle2
} from 'lucide-react';
import { fetchMonthlyProgressHistory } from '../services/api';
import { translations } from '../i18n/translations';

export default function ProjectExecutiveAnalytics({ 
  summaryData, 
  sectors = [], 
  theme, 
  lang = 'ar' 
}) {
  const t = translations[lang] || translations.ar;
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    fetchMonthlyProgressHistory().then(data => setHistoryData(data));
  }, []);

  const COLORS = ['#FFAB00', '#10B981', '#00F5D4', '#8B5CF6'];

  // Real-time directives ticker data
  const liveDirectives = [
    {
      id: 1,
      title: lang === 'ar' ? 'فحص عينات مارشال للطبقة الرابطة' : 'Marshall Compaction Sample Inspection',
      sector: lang === 'ar' ? 'القطاع الأول (أوبارﻱ - الفيوات)' : 'Sector 01 (Ubari – Al-Faywat)',
      status: lang === 'ar' ? 'مطابق للمواصفات 100%' : '100% Passed Specs',
      author: 'م. عبد السلام الفزاني',
      time: lang === 'ar' ? 'قبل ساعتين' : '2 hours ago'
    },
    {
      id: 2,
      title: lang === 'ar' ? 'تشغيل دفعة أعمدة الطاقة الشمسية' : 'Solar Lighting Commissioning',
      sector: lang === 'ar' ? 'القطاع الثالث (العوينات - البركت)' : 'Sector 03 (Al-Uwaynat – Barkat)',
      status: lang === 'ar' ? '120 عمود مشغل' : '120 Poles Active',
      author: 'م. سالم التواتي',
      time: lang === 'ar' ? 'قبل 5 ساعات' : '5 hours ago'
    },
    {
      id: 3,
      title: lang === 'ar' ? 'اعتماد المستخلص الفني الرابع' : 'Technical Claim 04 Approved',
      sector: lang === 'ar' ? 'القطاع الثاني (الفروض - بيسان)' : 'Sector 02 (Al-Furoos – Bisan)',
      status: lang === 'ar' ? 'مطابقة نسبة الإنجاز 74%' : '74% Progress Verified',
      author: 'أ. فاطمة الورفلي',
      time: lang === 'ar' ? 'يوم أمس' : 'Yesterday'
    }
  ];

  // Dynamic calculations based on live sectors
  const safeSectors = Array.isArray(sectors) && sectors.length > 0 ? sectors : [
    { id: 'SEC-01', name: 'القطاع الأول', progress: 84, lengthKm: 85, solarPolesInstalled: 640, activeWorkers: 115, machineryCount: 38 },
    { id: 'SEC-02', name: 'القطاع الثاني', progress: 72, lengthKm: 95, solarPolesInstalled: 480, activeWorkers: 130, machineryCount: 42 },
    { id: 'SEC-03', name: 'القطاع الثالث', progress: 61, lengthKm: 100, solarPolesInstalled: 320, activeWorkers: 98, machineryCount: 36 },
    { id: 'SEC-04', name: 'القطاع الرابع', progress: 55, lengthKm: 80, solarPolesInstalled: 290, activeWorkers: 85, machineryCount: 26 }
  ];

  const totalLength = safeSectors.reduce((acc, s) => acc + (Number(s.lengthKm) || 0), 0) || 360;
  const avgProgress = (safeSectors.reduce((acc, s) => acc + (Number(s.progress) || 0), 0) / safeSectors.length).toFixed(1);
  const totalSolarPoles = safeSectors.reduce((acc, s) => acc + (Number(s.solarPolesInstalled) || 0), 0) || 760;
  const totalWorkers = safeSectors.reduce((acc, s) => acc + (Number(s.activeWorkers) || 0), 0) || 380;
  const totalMachinery = safeSectors.reduce((acc, s) => acc + (Number(s.machineryCount) || 0), 0) || 142;

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 animate-fadeIn select-none">
      
      {/* ── Section Title Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6 border-slate-200 dark:border-white/10 text-start">
        <div className="space-y-2">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black border shadow-sm ${
            theme === 'light'
              ? 'bg-amber-100/90 border-amber-300 text-amber-950'
              : 'bg-amber-500/10 border-amber-500/35 text-amber-300'
          }`}>
            <Activity className="w-4 h-4 text-amber-500" />
            <span>{lang === 'ar' ? 'التحليلات والمؤشرات الاستراتيجية 2026' : 'Strategic Executive Analytics 2026'}</span>
          </div>

          <h2 className={`text-3xl sm:text-5xl font-black leading-snug ${
            theme === 'light' ? 'text-slate-950' : 'text-white'
          }`}>
            {lang === 'ar' ? 'مؤشرات الإنجاز والبيانات الحية للمشروع' : 'Live Project KPIs & Real-Time Analytics'}
          </h2>

          <p className={`text-xs sm:text-sm font-medium max-w-2xl leading-relaxed ${
            theme === 'light' ? 'text-slate-600' : 'text-slate-400'
          }`}>
            {lang === 'ar' 
              ? 'عرض شامل ومباشر لنسب رصف الأسفلت، المخطط الزمني المعتمد، وتوزيع المعدات والكوادر الهندسية على طول مسار 360 كم.'
              : 'Comprehensive live visualization of asphalt paving rates, monthly milestone velocity, and heavy equipment allocation.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono font-black text-emerald-500">
            {lang === 'ar' ? 'تحديث لحظي متزامن' : 'Live Real-Time Sync'}
          </span>
        </div>
      </div>

      {/* ── Master 4 4K Metric Highlight Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { 
            label: lang === 'ar' ? 'نسبة الإنجاز الكلي' : 'Overall Progress Rate', 
            value: `${avgProgress}%`, 
            sub: lang === 'ar' ? 'متقدم +4.2% عن المخطط' : '+4.2% Ahead of Schedule', 
            icon: Activity, 
            color: 'text-amber-500', 
            bg: 'bg-amber-500/15 border-amber-500/30' 
          },
          { 
            label: lang === 'ar' ? 'المسافة المرصوفة المنجزة' : 'Total Asphalt Layered', 
            value: `${((Number(avgProgress) / 100) * totalLength).toFixed(1)} ${lang === 'ar' ? 'كم' : 'km'}`, 
            sub: lang === 'ar' ? `من أصل ${totalLength} كم إجمالي الطريق` : `Out of ${totalLength} km total`, 
            icon: Layers, 
            color: 'text-emerald-500', 
            bg: 'bg-emerald-500/15 border-emerald-500/30' 
          },
          { 
            label: lang === 'ar' ? 'الإنارة بالطاقة الشمسية' : 'Solar Lighting Poles', 
            value: `${totalSolarPoles} ${lang === 'ar' ? 'عمود' : 'Poles'}`, 
            sub: lang === 'ar' ? 'خلايا شمسية تعمل بالكامل' : 'Self-Powered Active Units', 
            icon: Sun, 
            color: 'text-cyan-500', 
            bg: 'bg-cyan-500/15 border-cyan-500/30' 
          },
          { 
            label: lang === 'ar' ? 'الكوادر والآليات الثقيلة' : 'Personnel & Heavy Fleet', 
            value: `${totalWorkers} ${lang === 'ar' ? 'فني ومهندس' : 'Staff'}`, 
            sub: lang === 'ar' ? `${totalMachinery} آلية تعمل بالموقع` : `${totalMachinery} active heavy units`, 
            icon: Users, 
            color: 'text-purple-500', 
            bg: 'bg-purple-500/15 border-purple-500/30' 
          },
        ].map((kpi, idx) => (
          <div 
            key={idx} 
            className={`p-6 rounded-[28px] border shadow-2xl text-start space-y-3 glass-card-hover ${
              theme === 'light' 
                ? 'bg-white border-slate-200 shadow-slate-200/80' 
                : 'bg-[#0a0f1d] border-white/10 shadow-black/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-black ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                {kpi.label}
              </span>
              <div className={`p-2 rounded-xl border ${kpi.bg}`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500">
              {kpi.value}
            </div>
            <div className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{kpi.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── 4K Interactive Recharts Charts Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Area Chart: Monthly Velocity Curve */}
        <div className={`lg:col-span-8 p-6 sm:p-8 rounded-[32px] border shadow-2xl space-y-6 ${
          theme === 'light' ? 'bg-white border-slate-200 shadow-slate-200/80' : 'bg-[#0a0f1d] border-white/10 shadow-black/80'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-start">
            <div>
              <h3 className={`font-black text-lg sm:text-xl ${theme === 'light' ? 'text-slate-950' : 'text-white'}`}>
                {lang === 'ar' ? 'منحنى تطور الإنجاز الشهري الفعلي (%)' : 'Monthly Project Execution Curve (%)'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ar' ? 'مقارنة نسبة التنفيذ الميداني الفعلي مع الجدول الزمني المعتمد' : 'Actual field progress vs planned schedule timeline'}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold font-mono">
              <span className="flex items-center gap-1.5 text-amber-500">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span>{lang === 'ar' ? 'الفعلي' : 'Actual'}</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-500">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>{lang === 'ar' ? 'المخطط' : 'Planned'}</span>
              </span>
            </div>
          </div>

          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="colorActualPublic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFAB00" stopOpacity={0.45}/>
                    <stop offset="95%" stopColor="#FFAB00" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPlannedPublic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#E2E8F0' : '#1E293B'} />
                <XAxis dataKey="month" stroke={theme === 'light' ? '#64748B' : '#94A3B8'} fontSize={11} />
                <YAxis stroke={theme === 'light' ? '#64748B' : '#94A3B8'} fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: theme === 'light' ? '#fff' : '#0B101E', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)' }} />
                <Area type="monotone" dataKey="actualProgress" stroke="#FFAB00" strokeWidth={3.5} fillOpacity={1} fill="url(#colorActualPublic)" name={lang === 'ar' ? 'الإنجاز الفعلي %' : 'Actual %'} />
                <Area type="monotone" dataKey="plannedProgress" stroke="#10B981" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorPlannedPublic)" name={lang === 'ar' ? 'المخطط %' : 'Planned %'} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Progress per Sector */}
        <div className={`lg:col-span-4 p-6 sm:p-8 rounded-[32px] border shadow-2xl space-y-6 ${
          theme === 'light' ? 'bg-white border-slate-200 shadow-slate-200/80' : 'bg-[#0a0f1d] border-white/10 shadow-black/80'
        }`}>
          <div className="text-start space-y-1">
            <h3 className={`font-black text-lg sm:text-xl ${theme === 'light' ? 'text-slate-950' : 'text-white'}`}>
              {lang === 'ar' ? 'الإنجاز حسب القطاعات' : 'Progress by Sectors'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'ar' ? 'مقارنة تقدم الرصف في كل قطاع' : 'Paving rate across road sectors'}
            </p>
          </div>

          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={safeSectors.map(s => ({ name: s.id || 'SEC', progress: Number(s.progress) || 50, length: Number(s.lengthKm) || 90 }))}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#E2E8F0' : '#1E293B'} />
                <XAxis dataKey="name" stroke={theme === 'light' ? '#64748B' : '#94A3B8'} fontSize={11} />
                <YAxis stroke={theme === 'light' ? '#64748B' : '#94A3B8'} fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: theme === 'light' ? '#fff' : '#0B101E', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)' }} />
                <Bar dataKey="progress" fill="#FFAB00" radius={[10, 10, 0, 0]}>
                  {safeSectors.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ── Live Field Directives & Engineering Log Ticker ── */}
      <div className={`p-6 sm:p-8 rounded-[32px] border shadow-2xl space-y-6 ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0a0f1d] border-white/10'
      }`}>
        <div className="flex items-center justify-between text-start border-b pb-4 border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center justify-center">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className={`font-black text-base sm:text-lg ${theme === 'light' ? 'text-slate-950' : 'text-white'}`}>
                {lang === 'ar' ? 'شريط التوجيهات والأوامر الميدانية الحية' : 'Live Field Directives & Engineering Dispatch'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ar' ? 'آخر التوجيهات الفنية الصادرة عن مهندسي الإشراف الميداني' : 'Latest technical directives by certified resident engineers'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-start">
          {liveDirectives.map((d) => (
            <div 
              key={d.id}
              className={`p-5 rounded-2xl border space-y-2 glass-card-hover ${
                theme === 'light' ? 'bg-slate-50 border-slate-200 shadow-sm' : 'bg-white/[0.03] border-white/10'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-amber-500">{d.sector}</span>
                <span className="text-slate-400 text-[10px]">{d.time}</span>
              </div>
              <h4 className={`font-black text-sm ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                {d.title}
              </h4>
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-emerald-500 font-bold text-[11px] bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                  {d.status}
                </span>
                <span className="text-slate-400 text-[11px] font-medium">{d.author}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
