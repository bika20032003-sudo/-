import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Play, 
  Copy, 
  Check, 
  RefreshCw, 
  Server, 
  Globe, 
  Terminal, 
  Zap, 
  Database,
  ArrowRight
} from 'lucide-react';
import { fetchProjectSummary, fetchSectors, fetchContractors, fetchDocuments } from '../services/api';

export default function ApiConsole({ customApiUrl, setCustomApiUrl }) {
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/v1/project/summary');
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [latency, setLatency] = useState(42);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const endpoints = [
    { id: '/api/v1/project/summary', label: 'ملخص المشروع والإنجاز (Summary)' },
    { id: '/api/v1/sectors', label: 'تفاصيل القطاعات الـ 4 (Sectors)' },
    { id: '/api/v1/contractors', label: 'الشركات المنفذة والآليات (Contractors)' },
    { id: '/api/v1/documents', label: 'الوثائق والنتائج المعملية (Documents)' }
  ];

  const executeApiCall = async (ep = selectedEndpoint) => {
    setLoading(true);
    const start = performance.now();

    let data;
    if (ep.includes('summary')) {
      data = await fetchProjectSummary(customApiUrl);
    } else if (ep.includes('sectors')) {
      data = await fetchSectors();
    } else if (ep.includes('contractors')) {
      data = await fetchContractors();
    } else if (ep.includes('documents')) {
      data = await fetchDocuments();
    }

    const end = performance.now();
    setLatency(Math.round(end - start + 18));
    setResponseData(data);
    setLoading(false);
  };

  useEffect(() => {
    executeApiCall();
  }, [selectedEndpoint]);

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(responseData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>مركز الـ REST API اللحظي | Live Developer Console</span>
          </div>
          <h2 className="text-3xl font-black text-white">
            شاشة اختبار واجهات برمجة التطبيقات (APIs)
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            ربط واستدعاء بيانات طريق ﻱ – غات بصيغة JSON القياسية للمنظومات والجهات المعنية
          </p>
        </div>

        {/* Custom API Base URL Config */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="https://api.transport.gov.ly/ubari-ghat"
              value={customApiUrl || ''}
              onChange={(e) => setCustomApiUrl(e.target.value)}
              className="bg-slate-900/90 text-slate-200 placeholder-slate-500 font-mono text-xs rounded-xl px-3.5 py-2.5 w-64 md:w-80 border border-white/10 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Endpoint Selectors & Controls */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#0d1220] space-y-4">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-400" />
              <span>اختر واجهة الـ Endpoint:</span>
            </h3>

            <div className="space-y-2">
              {endpoints.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => setSelectedEndpoint(ep.id)}
                  className={`w-full text-right p-3 rounded-xl text-xs font-medium transition-all duration-200 border flex items-center justify-between ${
                    selectedEndpoint === ep.id
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border-white/5'
                  }`}
                >
                  <span className="truncate">{ep.label}</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-emerald-400">GET</span>
                </button>
              ))}
            </div>

            {/* Test Trigger Button */}
            <button
              onClick={() => executeApiCall()}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <Play className={`w-4 h-4 fill-black ${loading ? 'animate-spin' : ''}`} />
              <span>تشغيل الطلب (Execute Request)</span>
            </button>
          </div>

          {/* API Metrics Card */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-[#0d1220] flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">حالة الاستجابة (HTTP Status)</span>
              <span className="text-emerald-400 font-bold">200 OK</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px]">زمن الاستجابة (Latency)</span>
              <span className="text-amber-400 font-bold">{latency} ms</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px]">النوع</span>
              <span className="text-cyan-400 font-bold">application/json</span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive JSON Viewer Window */}
        <div className="lg:col-span-8 glass-panel rounded-2xl border border-slate-700 bg-[#080b13] overflow-hidden flex flex-col h-[520px]">
          
          {/* Code Window Header */}
          <div className="bg-[#0e1424] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
              </div>
              <span className="text-xs font-mono text-slate-400 mr-3">{selectedEndpoint}</span>
            </div>

            <button
              onClick={copyJson}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>نسخ الـ JSON</span>
                </>
              )}
            </button>
          </div>

          {/* JSON Display Area */}
          <div className="p-5 overflow-auto flex-1 font-mono text-xs text-amber-200/90 leading-relaxed bg-[#060810]">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-500 gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                <span>جاري استدعاء البيانات من سيرفر الجهاز...</span>
              </div>
            ) : (
              <pre>{JSON.stringify(responseData, null, 2)}</pre>
            )}
          </div>

        </div>

      </div>

    </section>
  );
}
