import React, { useState, useEffect } from 'react';
import { Sun, RefreshCw, MapPin, Wind, Droplets, CheckCircle2, Navigation, ArrowRightLeft } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function WeatherExchangeWidgets({ theme, lang = 'ar' }) {
  const t = translations[lang] || translations.ar;

  // Selected city on mobile screens: 'ubari' | 'ghat'
  const [activeCityTab, setActiveCityTab] = useState('ubari');
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(() => 
    new Date().toLocaleTimeString(lang === 'ar' ? 'ar-LY' : 'en-US', { hour: '2-digit', minute: '2-digit' })
  );

  // Weather states for both Ubari & Ghat
  const [ubariWeather, setUbariWeather] = useState({
    temp: 34,
    condition: lang === 'ar' ? 'سماء صافية' : 'Clear Sky',
    windSpeed: '12 km/h',
    humidity: '15%',
    location: lang === 'ar' ? 'أوباري (بداية الطريق)' : 'Ubari (Start)'
  });

  const [ghatWeather, setGhatWeather] = useState({
    temp: 33,
    condition: lang === 'ar' ? 'سماء صافية' : 'Clear Sky',
    windSpeed: '15 km/h',
    humidity: '18%',
    location: lang === 'ar' ? 'غات (نهاية الطريق)' : 'Ghat (Terminal)'
  });

  const parseWeatherCondition = (code) => {
    if (code === 0) return lang === 'ar' ? 'سماء صافية' : 'Clear Sky';
    if (code > 0 && code < 3) return lang === 'ar' ? 'مشمس إلى غائم جزئياً' : 'Partly Cloudy';
    if (code >= 3 && code < 50) return lang === 'ar' ? 'طقس صحراوي دافئ' : 'Warm Desert Climate';
    if (code >= 50 && code < 80) return lang === 'ar' ? 'رياح وأتربة خفيفة' : 'Dust / Light Haze';
    return lang === 'ar' ? 'طقس صحراوي' : 'Desert Climate';
  };

  // Fetch Live Weather API for Ubari (26.59° N, 12.78° E) & Ghat (24.96° N, 10.18° E)
  const fetchLiveWeather = async () => {
    setLoading(true);
    try {
      const [resUbari, resGhat] = await Promise.all([
        fetch('https://api.open-meteo.com/v1/forecast?latitude=26.59&longitude=12.78&current_weather=true'),
        fetch('https://api.open-meteo.com/v1/forecast?latitude=24.9647&longitude=10.1764&current_weather=true')
      ]);

      const dataUbari = await resUbari.json();
      const dataGhat = await resGhat.json();

      if (dataUbari && dataUbari.current_weather) {
        const cw = dataUbari.current_weather;
        setUbariWeather({
          temp: Math.round(cw.temperature),
          condition: parseWeatherCondition(cw.weathercode),
          windSpeed: `${Math.round(cw.windspeed)} km/h`,
          humidity: '15%',
          location: lang === 'ar' ? 'أوباري (بداية الطريق)' : 'Ubari (Start)'
        });
      }

      if (dataGhat && dataGhat.current_weather) {
        const cw = dataGhat.current_weather;
        setGhatWeather({
          temp: Math.round(cw.temperature),
          condition: parseWeatherCondition(cw.weathercode),
          windSpeed: `${Math.round(cw.windspeed)} km/h`,
          humidity: '18%',
          location: lang === 'ar' ? 'غات (نهاية الطريق)' : 'Ghat (Terminal)'
        });
      }

      setUpdatedAt(new Date().toLocaleTimeString(lang === 'ar' ? 'ar-LY' : 'en-US', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      // Fallback silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveWeather();
  }, [lang]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-2 relative z-20 animate-fadeIn select-none">
      {/* ── 2026 Dual-City Highway Weather Telemetry Ribbon (Ubari & Ghat) ── */}
      <div className={`relative overflow-hidden rounded-2xl py-2 px-3 sm:px-5 border shadow-sm transition-colors duration-200 ${
        theme === 'light'
          ? 'bg-white border-amber-200/80 text-slate-900 shadow-slate-200/50'
          : 'bg-[#0a0f1d] border-amber-500/25 text-slate-100 shadow-black/40'
      }`}>
        
        {/* Mobile View: Balanced 2-Column Corridor Weather Cards */}
        <div className="sm:hidden flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2 text-start">
            {/* Ubari Card */}
            <div className={`p-2.5 rounded-xl border flex flex-col justify-between gap-1.5 ${
              theme === 'light' ? 'bg-amber-50/50 border-amber-200/70' : 'bg-white/5 border-amber-500/20'
            }`}>
              <div className="flex items-center justify-between gap-1">
                <span className="font-black text-xs">{lang === 'ar' ? 'أوباري' : 'Ubari'}</span>
                <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded font-mono">
                  {lang === 'ar' ? 'البداية' : 'Start'}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-1">
                <span className="text-sm font-black font-mono text-amber-500">{ubariWeather.temp}°C</span>
                <span className="text-[9px] text-slate-400 font-medium truncate">{ubariWeather.condition}</span>
              </div>
            </div>

            {/* Ghat Card */}
            <div className={`p-2.5 rounded-xl border flex flex-col justify-between gap-1.5 ${
              theme === 'light' ? 'bg-cyan-50/50 border-cyan-200/70' : 'bg-white/5 border-cyan-500/20'
            }`}>
              <div className="flex items-center justify-between gap-1">
                <span className="font-black text-xs">{lang === 'ar' ? 'غات' : 'Ghat'}</span>
                <span className="text-[9px] font-bold text-cyan-500 bg-cyan-500/10 px-1.5 py-0.2 rounded font-mono">
                  {lang === 'ar' ? 'النهاية' : 'End'}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-1">
                <span className="text-sm font-black font-mono text-cyan-500">{ghatWeather.temp}°C</span>
                <span className="text-[9px] text-slate-400 font-medium truncate">{ghatWeather.condition}</span>
              </div>
            </div>
          </div>

          {/* Telemetry Status Strip */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-white/5">
            <span className="font-medium text-[9px] text-amber-500/80">360 KM • {lang === 'ar' ? 'مسار أوباري - غات' : 'Highway'}</span>
            <div className="flex items-center gap-1.5 font-mono text-[9px]">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
              <span>{updatedAt}</span>
              <button
                onClick={fetchLiveWeather}
                className="p-1 rounded text-slate-400 hover:text-amber-500 cursor-pointer"
                title={lang === 'ar' ? 'تحديث' : 'Refresh'}
              >
                <RefreshCw className={`w-2.5 h-2.5 ${loading ? 'animate-spin text-amber-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden sm:flex items-center justify-between gap-4 relative z-10">
          
          {/* ── City 1: Ubari Weather Block ── */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
            </div>
            <div className="text-start">
              <div className="flex items-center gap-1">
                <span className="font-black text-xs sm:text-sm">{lang === 'ar' ? 'أوباري' : 'Ubari'}</span>
                <span className="hidden xs:inline text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded">
                  {lang === 'ar' ? 'البداية' : 'Start'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="text-xs sm:text-base font-black font-mono text-amber-500 tracking-tight">
                {ubariWeather.temp}°C
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-cyan-600 dark:text-cyan-300 bg-cyan-500/10 px-1.5 sm:px-2 py-0.5 rounded-full border border-cyan-500/20 whitespace-nowrap">
                {ubariWeather.condition}
              </span>
              <span className="hidden md:inline-flex items-center gap-1 bg-cyan-500/10 px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-cyan-700 dark:text-cyan-300 font-mono">
                <Wind className="w-2.5 h-2.5 text-cyan-500" />
                <span>{ubariWeather.windSpeed}</span>
              </span>
            </div>
          </div>

          {/* ── Center Highway Corridor Connector (Desktop) ── */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <Navigation className="w-3 h-3 text-amber-500 rotate-90" />
            <span className="font-mono text-amber-500 font-black">360 KM</span>
            <span>{lang === 'ar' ? 'مسار الطريق الصحراوي' : 'Highway Route'}</span>
          </div>

          {/* ── City 2: Ghat Weather Block ── */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500" />
            </div>
            <div className="text-start">
              <div className="flex items-center gap-1">
                <span className="font-black text-xs sm:text-sm">{lang === 'ar' ? 'غات' : 'Ghat'}</span>
                <span className="hidden xs:inline text-[9px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-1 py-0.2 rounded">
                  {lang === 'ar' ? 'النهاية' : 'End'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="text-xs sm:text-base font-black font-mono text-cyan-500 tracking-tight">
                {ghatWeather.temp}°C
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-amber-600 dark:text-amber-300 bg-amber-500/10 px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-500/20 whitespace-nowrap">
                {ghatWeather.condition}
              </span>
              <span className="hidden md:inline-flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-amber-700 dark:text-amber-400 font-mono">
                <Wind className="w-2.5 h-2.5 text-amber-500" />
                <span>{ghatWeather.windSpeed}</span>
              </span>
            </div>
          </div>

          {/* ── End: Sync Status & Refresh Button ── */}
          <div className="flex items-center gap-2 flex-shrink-0 text-[10px] text-slate-400 ms-auto sm:ms-0">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="hidden xl:inline">{t.weatherUpdated}:</span>
              <span>{updatedAt}</span>
            </span>

            <button
              onClick={fetchLiveWeather}
              title={lang === 'ar' ? 'تحديث بيانات طقس أوباري وغات' : 'Refresh Weather'}
              className={`p-1.5 rounded-lg transition-all border cursor-pointer ${
                theme === 'light' 
                  ? 'hover:bg-slate-100 text-slate-700 border-slate-200' 
                  : 'hover:bg-white/10 text-slate-300 border-white/10'
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-amber-500' : ''}`} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
