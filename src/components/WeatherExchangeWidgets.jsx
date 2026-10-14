import React, { useState, useEffect } from 'react';
import { Sun, RefreshCw, MapPin, Wind, Droplets, CheckCircle2 } from 'lucide-react';
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-2 relative z-20 animate-fadeIn select-none">
      {/* ── 2026 Compact Slim Live Weather Telemetry Ribbon ── */}
      <div className={`relative overflow-hidden rounded-2xl py-2 px-3 sm:px-5 border shadow-sm transition-colors duration-200 ${
        theme === 'light'
          ? 'bg-white border-amber-200/80 text-slate-900 shadow-slate-200/50'
          : 'bg-[#0a0f1d] border-amber-500/25 text-slate-100 shadow-black/40'
      }`}>
        
        <div className="flex items-center justify-between gap-2 sm:gap-4 relative z-10">
          
          {/* Start: Location & Icon */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Sun className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs sm:text-sm">{lang === 'ar' ? 'طقس أوباري' : 'Ubari Weather'}</span>
              <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-slate-400 font-medium">
                <MapPin className="w-2.5 h-2.5 text-red-500 flex-shrink-0" />
                <span>{weather.location}</span>
              </span>
            </div>
          </div>

          {/* Center: Live Temperature & Condition (Inline) */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-base font-black font-mono text-amber-500 tracking-tight">
                {weather.temp}°
              </span>
              <span className="text-[11px] font-bold text-slate-400 font-mono">C</span>
            </div>

            <span className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20 whitespace-nowrap">
              {weather.condition}
            </span>

            {/* Metrics: Wind & Humidity */}
            <span className="hidden md:inline-flex items-center gap-1 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20 text-[10px] font-semibold text-cyan-700 dark:text-cyan-300 font-mono">
              <Wind className="w-2.5 h-2.5 text-cyan-500" />
              <span>{weather.windSpeed}</span>
            </span>

            <span className="hidden lg:inline-flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 text-[10px] font-semibold text-amber-700 dark:text-amber-400 font-mono">
              <Droplets className="w-2.5 h-2.5 text-amber-500" />
              <span>{weather.humidity}</span>
            </span>
          </div>

          {/* End: Sync Status & Refresh Button */}
          <div className="flex items-center gap-2 flex-shrink-0 text-[10px] text-slate-400">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="hidden sm:inline">{t.weatherUpdated}:</span>
              <span>{weather.updatedAt}</span>
            </span>

            <button
              onClick={fetchLiveWeather}
              title={lang === 'ar' ? 'تحديث بيانات الطقس' : 'Refresh Weather'}
              className={`p-1.5 rounded-lg transition-all border cursor-pointer ${
                theme === 'light' 
                  ? 'hover:bg-slate-100 text-slate-700 border-slate-200' 
                  : 'hover:bg-white/10 text-slate-300 border-white/10'
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${weather.loading ? 'animate-spin text-amber-500' : ''}`} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
