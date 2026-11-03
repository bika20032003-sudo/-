import React, { useState, useMemo } from 'react';
import { 
  Layers, Calculator, FileSpreadsheet, X, Plus, Trash2, 
  CheckCircle2, ArrowRightLeft, Sparkles, MapPin, Ruler
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { parseCleanNumber } from '../utils/engineeringFormulas.js';

// Pre-populated official station datasets from certified project Excel sheets (29/10/2026)
export const initialMCOStations = [
  { id: 1, from: -640, to: 3300, length: 3940, width: 'متغير', area: 48124.78 },
  { id: 2, from: 3300, to: 5740, length: 2440, width: 9, area: 21960 },
  { id: 3, from: 5740, to: 8270, length: 2530, width: 11, area: 27830 },
  { id: 4, from: 8270, to: 8355, length: 85, width: 8.5, area: 722.5 },
  { id: 5, from: 8355, to: 8545, length: 190, width: 8.75, area: 1662.5 },
  { id: 6, from: 8545, to: 10300, length: 1755, width: 11, area: 19305 },
  { id: 7, from: 10300, to: 11010, length: 710, width: 10.5, area: 7455 },
  { id: 8, from: 11010, to: 11745, length: 735, width: 11, area: 8085 },
  { id: 9, from: 11745, to: 12965, length: 1220, width: 10.4, area: 12688 },
  { id: 10, from: 12965, to: 13420, length: 455, width: 11, area: 5005 },
  { id: 11, from: 13420, to: 13590, length: 170, width: 10.8, area: 1836.00 },
  { id: 12, from: 13590, to: 13780, length: 190, width: 9.7, area: 1843.00 },
  { id: 13, from: 13780, to: 14990, length: 1210, width: 10.5, area: 12705 },
  { id: 14, from: 14990, to: 44426, length: 29436, width: 9, area: 264924 },
  { id: 15, from: 45000, to: 89867.41, length: 44867.41, width: 9, area: 403806.69 },
  { id: 16, from: 90000, to: 90600, length: 600, width: 9, area: 5400 },
  { id: 17, from: 90600, to: 92700, length: 2100, width: 10.6, area: 22260 },
  { id: 18, from: 92700, to: 157360, length: 64660, width: 9, area: 581940 },
  { id: 19, from: 157360, to: 159950, length: 2590, width: 9, area: 23310 },
  { id: 20, from: 160080, to: 163250, length: 3170, width: 9, area: 28530 },
  { id: 21, from: 163250, to: 165500, length: 2250, width: 9, area: 20250 },
  { id: 22, from: 165500, to: 165900, length: 400, width: 9, area: 3600 },
  { id: 23, from: 165900, to: 167500, length: 1600, width: 9, area: 14400 },
  { id: 24, from: 167500, to: 168910, length: 1410, width: 9, area: 12690 },
  { id: 25, from: 168910, to: 169930, length: 1020, width: 9, area: 9180 },
  { id: 26, from: 169930, to: 172900, length: 2970, width: 9, area: 26730 },
  { id: 27, from: 172900, to: 226280, length: 53380, width: 9, area: 480420 },
  { id: 28, from: 226280, to: 237560, length: 11280, width: 9, area: 101520 },
  { id: 29, from: 237660, to: 238900, length: 1240, width: 9, area: 11160 }
];

export const initialFDRStations = [
  { id: 1, from: -640, to: 3300, length: 3940, width: 'متغير', area: 47706.94 },
  { id: 2, from: 3300, to: 5740, length: 2440, width: 9, area: 21960 },
  { id: 3, from: 5740, to: 8270, length: 2530, width: 11, area: 27830 },
  { id: 4, from: 8270, to: 8355, length: 85, width: 8.5, area: 722.5 },
  { id: 5, from: 8355, to: 8545, length: 190, width: 8.75, area: 1662.5 },
  { id: 6, from: 8545, to: 10300, length: 1755, width: 11, area: 19305 },
  { id: 7, from: 10300, to: 11010, length: 710, width: 10.5, area: 7455 },
  { id: 8, from: 11010, to: 11745, length: 735, width: 11, area: 8085 },
  { id: 9, from: 11745, to: 12965, length: 1220, width: 10.4, area: 12688 },
  { id: 10, from: 12965, to: 13410, length: 445, width: 11, area: 4895 },
  { id: 11, from: 13410, to: 13590, length: 180, width: 10.8, area: 1944 },
  { id: 12, from: 13590, to: 13780, length: 190, width: 9.7, area: 1843 },
  { id: 13, from: 13780, to: 15000, length: 1220, width: 10.5, area: 12810 },
  { id: 14, from: 15000, to: 17870, length: 2870, width: 9, area: 25830 },
  { id: 15, from: 17870, to: 17975, length: 105, width: 8, area: 840 },
  { id: 16, from: 17975, to: 44426, length: 26451, width: 9, area: 238059 },
  { id: 17, from: 45000, to: 89867.41, length: 44867.41, width: 9, area: 403806.69 },
  { id: 18, from: 90000, to: 90950, length: 950, width: 9, area: 8550 },
  { id: 19, from: 90950, to: 92600, length: 1650, width: 11, area: 18150 },
  { id: 20, from: 92600, to: 157360, length: 64760, width: 9, area: 582840 },
  { id: 21, from: 157360, to: 159950, length: 2590, width: 9, area: 23310 },
  { id: 22, from: 160080, to: 164200, length: 4120, width: 9, area: 37080 },
  { id: 23, from: 164200, to: 165500, length: 1300, width: 9, area: 11700 },
  { id: 24, from: 165500, to: 166600, length: 1100, width: 9, area: 9900 },
  { id: 25, from: 166600, to: 167200, length: 600, width: 9, area: 5400 },
  { id: 26, from: 167200, to: 226280, length: 59080, width: 9, area: 531720 },
  { id: 27, from: 226280, to: 241620, length: 15340, width: 9, area: 138060 },
  { id: 28, from: 241620, to: 237600, length: -4020, width: 9, area: -36180 },
  { id: 29, from: 237620, to: 245600, length: 7980, width: 9, area: 71820 }
];

export const initialAsphaltStations = [
  { id: 1, from: -640, to: 3300, length: 3940, width: 'متغير', area: 48124.78 },
  { id: 2, from: 3300, to: 8270, length: 4970, width: 9, area: 44730 },
  { id: 3, from: 8270, to: 8355, length: 85, width: 8.5, area: 722.5 },
  { id: 4, from: 8355, to: 8545, length: 190, width: 8.75, area: 1662.5 },
  { id: 5, from: 8545, to: 11745, length: 3200, width: 9, area: 28800 },
  { id: 6, from: 11745, to: 12965, length: 1220, width: 8.7, area: 10614 },
  { id: 7, from: 12965, to: 17870, length: 4905, width: 9, area: 44145 },
  { id: 8, from: 17870, to: 17975, length: 105, width: 8, area: 840 },
  { id: 9, from: 17975, to: 44426, length: 26451, width: 9, area: 238059 },
  { id: 10, from: 45000, to: 89867.41, length: 44867.41, width: 9, area: 403806.69 },
  { id: 11, from: 90000, to: 157360, length: 67360, width: 9, area: 606240 },
  { id: 12, from: 157360, to: 159950, length: 2590, width: 9, area: 23310 },
  { id: 13, from: 160080, to: 164220, length: 4140, width: 9, area: 37260 },
  { id: 14, from: 164220, to: 173010, length: 8790, width: 9, area: 79110 },
  { id: 15, from: 173010, to: 226280, length: 53270, width: 9, area: 479430 },
  { id: 16, from: 226280, to: 236570, length: 10290, width: 9, area: 92610 }
];

export const initialBaseStations = [
  { id: 1, from: -640, to: 3300, length: 3940, width: 'متغير', area: 48124.78, thicknessCm: 12.5, volume: 6015.5975 },
  { id: 2, from: 3300, to: 5740, length: 2440, width: 9, area: 21960, thicknessCm: 12.5, volume: 2745 },
  { id: 3, from: 5740, to: 8270, length: 2530, width: 9, area: 22770, thicknessCm: 12.5, volume: 2846.25 },
  { id: 4, from: 8270, to: 8355, length: 85, width: 8.5, area: 722.5, thicknessCm: 12.5, volume: 90.3125 },
  { id: 5, from: 8355, to: 8545, length: 190, width: 8.75, area: 1662.5, thicknessCm: 12.5, volume: 207.8125 },
  { id: 6, from: 8545, to: 10300, length: 1755, width: 9, area: 15795, thicknessCm: 12.5, volume: 1974.375 },
  { id: 7, from: 10300, to: 11010, length: 710, width: 9, area: 6390, thicknessCm: 12.5, volume: 798.75 },
  { id: 8, from: 11010, to: 11745, length: 735, width: 9, area: 6615, thicknessCm: 12.5, volume: 826.875 },
  { id: 9, from: 11745, to: 12965, length: 1220, width: 8.7, area: 10614, thicknessCm: 12.5, volume: 1326.75 },
  { id: 10, from: 12965, to: 13420, length: 455, width: 9, area: 4095, thicknessCm: 12.5, volume: 511.875 },
  { id: 11, from: 13420, to: 13590, length: 170, width: 9, area: 1530, thicknessCm: 12.5, volume: 191.25 },
  { id: 12, from: 13590, to: 13780, length: 190, width: 9, area: 1710, thicknessCm: 12.5, volume: 213.75 },
  { id: 13, from: 13780, to: 14990, length: 1210, width: 9, area: 10890, thicknessCm: 12.5, volume: 1361.25 },
  { id: 14, from: 14990, to: 44426, length: 29436, width: 9, area: 264924, thicknessCm: 12.5, volume: 33115.5 },
  { id: 15, from: 45000, to: 89867.41, length: 44867.41, width: 9, area: 403806.69, thicknessCm: 12.5, volume: 50475.836 },
  { id: 16, from: 90000, to: 90600, length: 600, width: 9, area: 5400, thicknessCm: 12.5, volume: 675 },
  { id: 17, from: 90600, to: 92700, length: 2100, width: 9, area: 18900, thicknessCm: 12.5, volume: 2362.5 },
  { id: 18, from: 92700, to: 157360, length: 64660, width: 9, area: 581940, thicknessCm: 12.5, volume: 72742.5 },
  { id: 19, from: 157360, to: 159950, length: 2590, width: 9, area: 23310, thicknessCm: 12.5, volume: 2913.75 },
  { id: 20, from: 160080, to: 162750, length: 2670, width: 9, area: 24030, thicknessCm: 12.5, volume: 3003.75 },
  { id: 21, from: 162750, to: 165500, length: 2750, width: 9, area: 24750, thicknessCm: 12.5, volume: 3093.75 },
  { id: 22, from: 165500, to: 226280, length: 60780, width: 9, area: 547020, thicknessCm: 12.5, volume: 68377.5 },
  { id: 23, from: 226280, to: 226850, length: 570, width: 9, area: 5130, thicknessCm: 12.5, volume: 641.25 },
  { id: 24, from: 226850, to: 237590, length: 10740, width: 9, area: 96660, thicknessCm: 12.5, volume: 12082.5 },
  { id: 25, from: 237630, to: 238950, length: 1320, width: 9, area: 11880, thicknessCm: 12.5, volume: 1485 }
];

export const StationQuantitiesModal = ({ isOpen, onClose }) => {
  const [activeLayer, setActiveLayer] = useState('mco'); // 'mco' | 'fdr' | 'asphalt' | 'base'
  const [mcoList, setMcoList] = useState(initialMCOStations);
  const [fdrList, setFdrList] = useState(initialFDRStations);
  const [asphaltList, setAsphaltList] = useState(initialAsphaltStations);
  const [baseList, setBaseList] = useState(initialBaseStations);

  if (!isOpen) return null;

  const currentList = activeLayer === 'mco' ? mcoList : (activeLayer === 'fdr' ? fdrList : (activeLayer === 'asphalt' ? asphaltList : baseList));
  const setList = activeLayer === 'mco' ? setMcoList : (activeLayer === 'fdr' ? setFdrList : (activeLayer === 'asphalt' ? setAsphaltList : setBaseList));

  // Auto calculate totals
  const totalLength = currentList.reduce((acc, row) => acc + parseCleanNumber(row.length), 0);
  const totalArea = currentList.reduce((acc, row) => acc + parseCleanNumber(row.area), 0);
  const totalVolume = activeLayer === 'base' ? currentList.reduce((acc, row) => acc + parseCleanNumber(row.volume), 0) : null;

  // Handle cell edits with automatic recalculation of length, area, volume
  const handleCellChange = (id, field, value) => {
    setList(prev => prev.map(row => {
      if (row.id !== id) return row;
      const updated = { ...row, [field]: value };
      
      const f = parseCleanNumber(field === 'from' ? value : row.from);
      const t = parseCleanNumber(field === 'to' ? value : row.to);
      const w = parseCleanNumber(field === 'width' ? value : row.width, 9);
      const h = parseCleanNumber(field === 'thicknessCm' ? value : (row.thicknessCm || 12.5), 12.5);

      if (field === 'from' || field === 'to') {
        updated.length = Math.abs(t - f);
      }

      const len = parseCleanNumber(updated.length);
      if (row.width !== 'متغير' && field !== 'area') {
        updated.area = parseFloat((len * w).toFixed(2));
      }

      if (activeLayer === 'base') {
        const areaVal = parseCleanNumber(updated.area);
        updated.volume = parseFloat((areaVal * (h / 100)).toFixed(4));
      }

      return updated;
    }));
  };

  const handleAddRow = () => {
    const newId = Date.now();
    const lastRow = currentList[currentList.length - 1];
    const newFrom = lastRow ? lastRow.to : 0;
    const newTo = newFrom + 1000;
    const len = 1000;
    const w = 9;
    const area = len * w;
    const newRow = {
      id: newId,
      from: newFrom,
      to: newTo,
      length: len,
      width: w,
      area: area,
      ...(activeLayer === 'base' ? { thicknessCm: 12.5, volume: parseFloat((area * 0.125).toFixed(4)) } : {})
    };
    setList(prev => [...prev, newRow]);
  };

  const handleDeleteRow = (id) => {
    setList(prev => prev.filter(r => r.id !== id));
  };

  const handleExportExcel = () => {
    const layerNames = {
      mco: 'حساب_MCO_طبقة_التشريب',
      fdr: 'حساب_FDR_إعادة_التدوير',
      asphalt: 'حساب_الأسفلت_المحسن',
      base: 'حساب_طبقة_الأساس_الحبيبي'
    };

    const exportData = currentList.map((r, idx) => ({
      'م': idx + 1,
      'من المحطة': r.from,
      'إلى المحطة': r.to,
      'الطول (م)': r.length,
      'العرض (م)': r.width,
      'المساحة (م2)': r.area,
      ...(activeLayer === 'base' ? { 'السمك (سم)': r.thicknessCm || 12.5, 'الحجم (م3)': r.volume } : {})
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'محطات_الكميات');
    XLSX.writeFile(wb, `${layerNames[activeLayer]}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(6px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      direction: 'rtl',
      fontFamily: "'Segoe UI', Roboto, 'Cairo', sans-serif"
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '1200px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calculator size={22} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>
                حاسبة محطات وكميات طبقات الرصف الميدانية (حساب تلقائي)
              </h2>
              <span style={{ fontSize: '0.82rem', opacity: 0.9 }}>
                مشروع صيانة وتطوير طريق أوباري - غات (360 كم) • مطابقة لملفات الإكسل المعتمدة 29/10/2026
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              onClick={handleExportExcel}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#16a34a',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 0.9rem',
                fontSize: '0.84rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              <FileSpreadsheet size={16} />
              <span>تصدير Excel</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#fff',
                borderRadius: '8px',
                padding: '0.45rem',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Layer Selector Tabs */}
        <div style={{
          display: 'flex',
          padding: '0.75rem 1.5rem',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          gap: '0.65rem',
          overflowX: 'auto'
        }}>
          {[
            { key: 'mco', label: '1. حساب رش التشريب (MCO)', sub: 'إجمالي: 238,603 م.ط • 2,179,342 م2' },
            { key: 'fdr', label: '2. حساب إعادة التدوير (FDR)', sub: 'إجمالي: 245,383 م.ط • 2,239,792 م2' },
            { key: 'asphalt', label: '3. حساب الأسفلت المحسن (Asphalt)', sub: 'إجمالي: 236,373 م.ط • 2,139,464 م2' },
            { key: 'base', label: '4. حساب الأساس الحبيبي (Base)', sub: 'إجمالي: 238,713 م.ط • 270,078 م3' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveLayer(tab.key)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                border: activeLayer === tab.key ? '2px solid #2563eb' : '1px solid #cbd5e1',
                background: activeLayer === tab.key ? '#eff6ff' : '#ffffff',
                color: activeLayer === tab.key ? '#1e40af' : '#475569',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.86rem',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{tab.label}</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: activeLayer === tab.key ? '#2563eb' : '#64748b' }}>
                {tab.sub}
              </span>
            </button>
          ))}
        </div>

        {/* Summary Metrics Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: activeLayer === 'base' ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
          gap: '1rem',
          padding: '1rem 1.5rem',
          background: '#ffffff',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem 1rem', borderRadius: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 700 }}>إجمالي الطول المنفذ بالمسار</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#15803d' }}>
              {totalLength.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style={{ fontSize: '0.85rem' }}>م.ط</span>
            </div>
          </div>

          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.75rem 1rem', borderRadius: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: '#1e40af', fontWeight: 700 }}>إجمالي المساحة السطحية المنفذة</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1d4ed8' }}>
              {totalArea.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style={{ fontSize: '0.85rem' }}>م²</span>
            </div>
          </div>

          {activeLayer === 'base' && (
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '0.75rem 1rem', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.78rem', color: '#c2410c', fontWeight: 700 }}>إجمالي الحجم المنفذ (بسمك 12.5 سم)</span>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ea580c' }}>
                {totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} <span style={{ fontSize: '0.85rem' }}>م³</span>
              </div>
            </div>
          )}
        </div>

        {/* Stations Table Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
              قائمة المحطات التفصيلية ({currentList.length} محطة مسجلة)
            </span>
            <button
              onClick={handleAddRow}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.4rem 0.8rem',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              <Plus size={15} />
              <span>إضافة محطة عمل جديدة</span>
            </button>
          </div>

          <div style={{ width: '100%', overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
            <table className="custom-table" style={{ width: '100%', minWidth: '780px', textAlign: 'center' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ width: '45px', textAlign: 'center' }}>م</th>
                  <th style={{ width: '140px', textAlign: 'center' }}>من المحطة (م)</th>
                  <th style={{ width: '140px', textAlign: 'center' }}>إلى المحطة (م)</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>الطول (م)</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>العرض (م)</th>
                  <th style={{ width: '140px', textAlign: 'center' }}>المساحة (م²)</th>
                  {activeLayer === 'base' && (
                    <>
                      <th style={{ width: '110px', textAlign: 'center' }}>السمك (سم)</th>
                      <th style={{ width: '140px', textAlign: 'center' }}>الحجم (م³)</th>
                    </>
                  )}
                  <th style={{ width: '60px', textAlign: 'center' }}>حذف</th>
                </tr>
              </thead>
              <tbody>
                {currentList.map((row, idx) => (
                  <tr key={row.id}>
                    <td style={{ fontWeight: 800, color: '#64748b' }}>{idx + 1}</td>
                    <td>
                      <input
                        type="text"
                        inputMode="decimal"
                        dir="ltr"
                        value={row.from}
                        onChange={(e) => handleCellChange(row.id, 'from', e.target.value)}
                        style={{ width: '90px', padding: '0.25rem', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 700 }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        inputMode="decimal"
                        dir="ltr"
                        value={row.to}
                        onChange={(e) => handleCellChange(row.id, 'to', e.target.value)}
                        style={{ width: '90px', padding: '0.25rem', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 700 }}
                      />
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }} dir="ltr">
                        {Number(row.length).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </strong>
                    </td>
                    <td>
                      {row.width === 'متغير' ? (
                        <span style={{ padding: '2px 8px', background: '#fef3c7', color: '#b45309', borderRadius: '4px', fontWeight: 800, fontSize: '0.8rem' }}>
                          متغير
                        </span>
                      ) : (
                        <input
                          type="text"
                          inputMode="decimal"
                          dir="ltr"
                          value={row.width}
                          onChange={(e) => handleCellChange(row.id, 'width', e.target.value)}
                          style={{ width: '65px', padding: '0.25rem', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 700 }}
                        />
                      )}
                    </td>
                    <td>
                      <strong style={{ color: '#2563eb' }} dir="ltr">
                        {Number(row.area).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </strong>
                    </td>
                    {activeLayer === 'base' && (
                      <>
                        <td>
                          <input
                            type="text"
                            inputMode="decimal"
                            dir="ltr"
                            value={row.thicknessCm || 12.5}
                            onChange={(e) => handleCellChange(row.id, 'thicknessCm', e.target.value)}
                            style={{ width: '65px', padding: '0.25rem', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 700 }}
                          />
                        </td>
                        <td>
                          <strong style={{ color: '#ea580c' }} dir="ltr">
                            {Number(row.volume || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                          </strong>
                        </td>
                      </>
                    )}
                    <td>
                      <button
                        onClick={() => handleDeleteRow(row.id)}
                        style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }}
                        title="حذف المحطة"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f8fafc', fontWeight: 900, borderTop: '2px solid #cbd5e1' }}>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '0.75rem', fontSize: '0.9rem' }}>
                    الإجمالي العام التراكمي للطبقة
                  </td>
                  <td style={{ color: '#16a34a', fontSize: '0.95rem' }} dir="ltr">
                    {totalLength.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} م.ط
                  </td>
                  <td>—</td>
                  <td style={{ color: '#2563eb', fontSize: '0.95rem' }} dir="ltr">
                    {totalArea.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} م²
                  </td>
                  {activeLayer === 'base' && (
                    <>
                      <td>12.5 سم</td>
                      <td style={{ color: '#ea580c', fontSize: '0.95rem' }} dir="ltr">
                        {totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} م³
                      </td>
                    </>
                  )}
                  <td>—</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.85rem 1.75rem',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            💡 تتطابق هذه الكميات مع بنود التقرير التنفيذي: المساحة الإجمالية لـ MCO (2.179 مليون م²) و FDR (2.239 مليون م²) وحجم الأساس الحبيبي (270,078 م³).
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1.25rem',
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
