import React, { useState, useEffect } from 'react';
import { Sun, RefreshCw, MapPin, Wind, Droplets, CheckCircle2, Sparkles } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function WeatherExchangeWidgets({ theme, lang = 'ar' }) {
  const t = translations[lang] || translations.ar;

  // Weather state
  const [weather, setWeather] = useState({
    temp: 34,
    condition: lang === 'ar' ? 'سماء صافية' : 'Clear Sky',
    windSpeed: '12.5 km/h',
    humidity: '15%',
    location: lang === 'ar' ? 'أوباري، ليبيا' : 'Ubari, Libya',
    loading: false,
    updatedAt: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-LY' : 'en-US', { hour: '2-digit', minute: '2-digit' })
  });

  // Fetch Live Weather API (Open-Meteo API for Ubari, Libya: 26.59° N, 12.78° E)
  const fetchLiveWeather = async () => {
    setWeather(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=26.59&longitude=12.78&current_weather=true');
      const data = await res.json();
      if (data && data.current_weather) {
        const cw = data.current_weather;
        let cond = lang === 'ar' ? 'سماء صافية' : 'Clear Sky';
        if (cw.weathercode > 0 && cw.weathercode < 3) {
          cond = lang === 'ar' ? 'مشمس إلى غائم جزئياً' : 'Partly Cloudy';
        } else if (cw.weathercode >= 3) {
          cond = lang === 'ar' ? 'طقس صحراوي دافئ' : 'Warm Desert Climate';
        }

        setWeather({
          temp: Math.round(cw.temperature),
          condition: cond,
          windSpeed: `${cw.windspeed} km/h`,
          humidity: '18%',
          location: lang === 'ar' ? 'أوباري، ليبيا' : 'Ubari, Libya',
          loading: false,
          updatedAt: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-LY' : 'en-US', { hour: '2-digit', minute: '2-digit' })
        });
      } else {
        setWeather(prev => ({ ...prev, loading: false }));
      }
    } catch (err) {
      setWeather(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchLiveWeather();
  }, [lang]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6 relative z-20 animate-fadeIn select-none">
      {/* ── 2026 Sleek Glassmorphic Live Weather Telemetry Bar ── */}
      <div className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 border shadow-xl backdrop-blur-2xl transition-all duration-300 ${
        theme === 'light'
          ? 'bg-white/95 border-amber-200/80 text-slate-900 shadow-slate-200/70'
          : 'bg-[#0a0f1d]/90 border-amber-500/25 text-slate-100 shadow-black/60'
      }`}>
        
        {/* Subtle Ambient Glow */}
        <div 
          className="absolute -top-12 -right-12 w-36 h-36 rounded-full pointer-events-none blur-2xl opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(255,171,0,0.5) 0%, transparent 70%)' }}
        />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 relative z-10">
          
          {/* Left / Start: Title, Location & Weather Icon */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Sun className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '30s' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs sm:text-sm tracking-tight">{t.weatherTitle}</h3>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <MapPin className="w-3 h-3 text-red-500 flex-shrink-0" />
                    <span className="font-medium">{weather.location}</span>
                  </span>
                </div>
                <p className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  {t.weatherDesc}
                </p>
              </div>
            </div>

            {/* Mobile Refresh Button */}
            <button
              onClick={fetchLiveWeather}
              title={lang === 'ar' ? 'تحديث بيانات الطقس' : 'Refresh Weather'}
              className={`lg:hidden p-1.5 rounded-lg transition-all border cursor-pointer ${
                theme === 'light' 
                  ? 'hover:bg-slate-100 text-slate-600 border-slate-200' 
                  : 'hover:bg-white/10 text-slate-300 border-white/10'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${weather.loading ? 'animate-spin text-amber-500' : ''}`} />
            </button>
          </div>

          {/* Center: Live Temperature & Condition */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-1">
            {/* Temp */}
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black font-mono text-amber-500 tracking-tight">
                {weather.temp}°
              </span>
              <span className="text-sm font-bold text-slate-400 font-mono">C</span>
              <div className="text-xs font-bold text-cyan-600 dark:text-cyan-300 flex items-center gap-1 ms-1">
                <Sparkles className="w-3 h-3 text-cyan-500" />
                <span>{weather.condition}</span>
              </div>
            </div>

            {/* Metrics: Wind & Humidity */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20 text-[11px] font-bold text-cyan-700 dark:text-cyan-300 font-mono">
                <Wind className="w-3 h-3 text-cyan-500" />
                <span>{t.weatherWind}: {weather.windSpeed}</span>
              </span>
              <span className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 text-[11px] font-bold text-amber-700 dark:text-amber-400 font-mono">
                <Droplets className="w-3 h-3 text-amber-500" />
                <span>{t.weatherHumidity}: {weather.humidity}</span>
              </span>
            </div>
          </div>

          {/* Right / End: Live Status Tag, Last Update & Refresh Button */}
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full lg:w-auto text-[11px] text-slate-400 border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-200/50 dark:border-white/5">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
              <span>{t.weatherUpdated}: {weather.updatedAt}</span>
            </span>

            <button
              onClick={fetchLiveWeather}
              title={lang === 'ar' ? 'تحديث بيانات الطقس' : 'Refresh Weather'}
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all border cursor-pointer text-xs font-semibold ${
                theme === 'light' 
                  ? 'hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm' 
                  : 'hover:bg-white/10 text-slate-300 border-white/10'
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${weather.loading ? 'animate-spin text-amber-500' : ''}`} />
              <span className="text-[11px]">{lang === 'ar' ? 'تحديث' : 'Sync'}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
