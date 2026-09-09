import React, { useState } from 'react';
import { Building2, MapPin } from 'lucide-react';
export const SectorsView = () => {
    const [selectedSectorId, setSelectedSectorId] = useState('all');
    // Exact 4 Sectors & Contracting Companies from Project Excel File
    const sectorsData = [
        {
            id: 'sector-1',
            code: 'SEC-01',
            name: 'القطاع الأول (A)',
            contractor: 'إدارة العمليات الميدانية - القطاع (A)',
            chainage: 'من المحطة 00-640 إلى المحطة 44+426',
            totalLengthKm: 45.06,
            totalLengthMeters: 45066,
            completionRate: 98.2,
            status: 'متقدم جداً',
            crushersCount: 2,
            activeEquipment: 14,
            dailyFuelLiters: 1850,
            layers: [
                { name: 'طبقة إعادة التدوير (FDR)', completedMeters: 45066, percentage: 100, status: 'مكتمل' },
                { name: 'طبقة الأساس الحبيبي', completedMeters: 44867, percentage: 99.5, status: 'مكتمل' },
                { name: 'رش طبقة التشريب (MCO)', completedMeters: 44867, percentage: 99.5, status: 'مكتمل' },
                { name: 'طبقة الاسفلت المحسن', completedMeters: 44287, percentage: 98.2, status: 'قيد اللمسات الأخيرة' }
            ],
            remaining: {
                fdr: 0,
                base: 199,
                mco: 199,
                asphalt: 779
            }
        },
        {
            id: 'sector-2',
            code: 'SEC-02',
            name: 'القطاع الثاني (B)',
            contractor: 'إدارة العمليات الميدانية - القطاع (B)',
            chainage: 'من المحطة 45+580 إلى المحطة 89+867',
            totalLengthKm: 44.28,
            totalLengthMeters: 44287,
            completionRate: 95.8,
            status: 'عمليات مستمرة',
            crushersCount: 2,
            activeEquipment: 16,
            dailyFuelLiters: 2100,
            layers: [
                { name: 'طبقة إعادة التدوير (FDR)', completedMeters: 44287, percentage: 100, status: 'مكتمل' },
                { name: 'طبقة الأساس الحبيبي', completedMeters: 44287, percentage: 100, status: 'مكتمل' },
                { name: 'رش طبقة التشريب (MCO)', completedMeters: 43600, percentage: 98.4, status: 'عمليات رش' },
                { name: 'طبقة الاسفلت المحسن', completedMeters: 41800, percentage: 94.3, status: 'فرش أسفلت' }
            ],
            remaining: {
                fdr: 0,
                base: 0,
                mco: 687,
                asphalt: 2487
            }
        },
        {
            id: 'sector-3',
            code: 'SEC-03',
            name: 'القطاع الثالث (C)',
            contractor: 'إدارة العمليات الميدانية - القطاع (C)',
            chainage: 'من المحطة 90+580 إلى المحطة 159+960',
            totalLengthKm: 69.38,
            totalLengthMeters: 69380,
            completionRate: 94.6,
            status: 'أعلى وتيرة إنتاج',
            crushersCount: 3,
            activeEquipment: 22,
            dailyFuelLiters: 2850,
            layers: [
                { name: 'طبقة إعادة التدوير (FDR)', completedMeters: 69380, percentage: 100, status: 'مكتمل' },
                { name: 'طبقة الأساس الحبيبي', completedMeters: 66420, percentage: 95.7, status: 'متقدم' },
                { name: 'رش طبقة التشريب (MCO)', completedMeters: 66420, percentage: 95.7, status: 'متقدم' },
                { name: 'طبقة الاسفلت المحسن', completedMeters: 66080, percentage: 95.2, status: 'فرش أسفلت' }
            ],
            remaining: {
                fdr: 0,
                base: 2960,
                mco: 2960,
                asphalt: 3300
            }
        },
        {
            id: 'sector-4',
            code: 'SEC-04',
            name: 'القطاع الرابع (D)',
            contractor: 'إدارة العمليات الميدانية - القطاع (D)',
            chainage: 'من المحطة 189+840 إلى المحطة 226+280',
            totalLengthKm: 36.44,
            totalLengthMeters: 36440,
            completionRate: 97.4,
            status: 'مكتمل جزئياً',
            crushersCount: 1,
            activeEquipment: 12,
            dailyFuelLiters: 1450,
            layers: [
                { name: 'طبقة إعادة التدوير (FDR)', completedMeters: 36440, percentage: 100, status: 'مكتمل' },
                { name: 'طبقة الأساس الحبيبي', completedMeters: 36440, percentage: 100, status: 'مكتمل' },
                { name: 'رش طبقة التشريب (MCO)', completedMeters: 36440, percentage: 100, status: 'مكتمل' },
                { name: 'طبقة الاسفلت المحسن', completedMeters: 36430, percentage: 99.9, status: 'المحطة الأخيرة' }
            ],
            remaining: {
                fdr: 0,
                base: 0,
                mco: 0,
                asphalt: 10
            }
        }
    ];
    const filteredSectors = selectedSectorId === 'all'
        ? sectorsData
        : sectorsData.filter(s => s.id === selectedSectorId);
    return (<div className="view-content" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={24}/>
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              متابعة قطاعات المشروع والشركات المنفذة
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.2rem' }}>
              مشروع صيانة طريق أوباري - غات (4 قطاعات تنفيذية بطول 226.28 كم)
            </p>
          </div>
        </div>

        {/* Sector Filter Buttons */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.25rem', borderRadius: '10px', gap: '0.25rem' }}>
          <button onClick={() => setSelectedSectorId('all')} style={{
            background: selectedSectorId === 'all' ? '#ffffff' : 'transparent',
            color: selectedSectorId === 'all' ? '#2563eb' : '#64748b',
            fontWeight: 800,
            fontSize: '0.82rem',
            border: 'none',
            borderRadius: '8px',
            padding: '0.4rem 0.85rem',
            cursor: 'pointer',
            boxShadow: selectedSectorId === 'all' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
        }}>
            كافة القطاعات (الإجمالي)
          </button>
          {sectorsData.map(s => (<button key={s.id} onClick={() => setSelectedSectorId(s.id)} style={{
                background: selectedSectorId === s.id ? '#ffffff' : 'transparent',
                color: selectedSectorId === s.id ? '#2563eb' : '#64748b',
                fontWeight: 800,
                fontSize: '0.82rem',
                border: 'none',
                borderRadius: '8px',
                padding: '0.4rem 0.85rem',
                cursor: 'pointer',
                boxShadow: selectedSectorId === s.id ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
            }}>
              {s.code}
            </button>))}
        </div>
      </div>

      {/* 4 Sector Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedSectorId === 'all' ? 'repeat(2, 1fr)' : '1fr', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {filteredSectors.map((sector) => (<div key={sector.id} className="dashboard-white-card" style={{
                padding: '1.5rem',
                border: '1.5px solid #e2e8f0',
                borderRadius: '16px',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
            }}>
            {/* Sector Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="code-badge" style={{ fontSize: '0.78rem' }}>{sector.code}</span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                    {sector.name}
                  </h3>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={14} color="#2563eb"/>
                  <span>{sector.chainage}</span>
                </p>
              </div>

              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#2563eb' }}>
                  {sector.completionRate}%
                </span>
                <span style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700, display: 'block' }}>{sector.status}</span>
              </div>
            </div>

            {/* Operational Resources Allocated */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.65rem', marginBottom: '1.25rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '10px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>طول القطاع</span>
                <strong style={{ fontSize: '0.88rem', display: 'block', color: '#0f172a' }}>{sector.totalLengthKm} كم</strong>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>الكسارات العاملة</span>
                <strong style={{ fontSize: '0.88rem', display: 'block', color: '#2563eb' }}>{sector.crushersCount} محطات</strong>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>المعدات بالموقع</span>
                <strong style={{ fontSize: '0.88rem', display: 'block', color: '#7c3aed' }}>{sector.activeEquipment} آلية</strong>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>استهلاك السولار</span>
                <strong style={{ fontSize: '0.88rem', display: 'block', color: '#ea580c' }}>{sector.dailyFuelLiters.toLocaleString()} لتر</strong>
              </div>
            </div>

            {/* Layers Breakdown Table */}
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem', display: 'block' }}>
              موقف طبقات الرصف المنجزة والمتبقي:
            </span>

            <table className="custom-table" style={{ fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th>الطبقة / البند</th>
                  <th>المنجز (م.ط)</th>
                  <th>نسبة الإنجاز</th>
                  <th>المتبقي (م.ط)</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {sector.layers.map((layer, idx) => (<tr key={idx}>
                    <td><strong>{layer.name}</strong></td>
                    <td>{layer.completedMeters.toLocaleString()} م.ط</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 800, color: layer.percentage >= 98 ? '#16a34a' : '#2563eb' }}>{layer.percentage}%</span>
                        <div style={{ width: '50px', height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${layer.percentage}%`, height: '100%', background: layer.percentage >= 98 ? '#16a34a' : '#2563eb' }}/>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: idx === 3 ? '#ea580c' : '#64748b', fontWeight: idx === 3 ? 800 : 500 }}>
                        {idx === 0 ? sector.remaining.fdr : idx === 1 ? sector.remaining.base : idx === 2 ? sector.remaining.mco : sector.remaining.asphalt} م
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${layer.percentage === 100 ? 'approved' : 'pending'}`} style={{ fontSize: '0.72rem' }}>
                        {layer.status}
                      </span>
                    </td>
                  </tr>))}
              </tbody>
            </table>
          </div>))}
      </div>
    </div>);
};
