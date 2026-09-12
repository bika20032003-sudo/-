import React, { useState } from 'react';
import { Gauge, Bell, ChevronDown, User, ShieldCheck, Menu } from 'lucide-react';
import { fastFetch } from '../utils/apiCache.js';

export const Navbar = ({ currentTabName, onBellClick, onProfileClick, currentUser, onToggleMobileSidebar }) => {
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadAlerts = async () => {
        try {
            const data = await fastFetch('http://localhost:5000/api/alerts');
            const alertsList = data?.alerts || (Array.isArray(data) ? data : []);
            const unread = alertsList.filter((a) => !a.isRead).length;
            setUnreadCount(unread);
        }
        catch {
            // silent fallback
        }
    };

    const isSectorSupervisor = currentUser?.role?.includes('مشرف') || Boolean(currentUser?.sector && currentUser.sector !== 'all');

    React.useEffect(() => {
        if (isSectorSupervisor) return;
        fetchUnreadAlerts();
        const interval = setInterval(fetchUnreadAlerts, 20000);
        return () => clearInterval(interval);
    }, [isSectorSupervisor]);

    const displayName = currentUser?.name || 'مدير المشروع';
    const displayRole = currentUser?.role || 'الإدارة التنفيذية';
    const sectorBadge = currentUser?.sector && currentUser.sector !== 'all' 
      ? (currentUser.sector.includes('A') ? 'القطاع (A)' : 'القطاع (B)')
      : null;

    return (<header className="custom-app-navbar" style={{ height: '52px', padding: '0 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {/* Right side in RTL: Mobile Toggle + Tab Title & Icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="navbar-mobile-toggle-btn"
          onClick={onToggleMobileSidebar}
          title="القائمة الجانبية"
          style={{
            display: 'none', // Shown on mobile via CSS
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            width: '36px',
            height: '36px',
            color: '#1e293b',
            cursor: 'pointer'
          }}
        >
          <Menu size={20} />
        </button>

        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)', flexShrink: 0 }}>
          <Gauge size={16}/>
        </div>
        <h1 className="navbar-tab-title" style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          {currentTabName}
        </h1>
        {sectorBadge && (
          <span style={{
            background: sectorBadge.includes('A') ? '#eff6ff' : '#fff7ed',
            color: sectorBadge.includes('A') ? '#1d4ed8' : '#c2410c',
            border: sectorBadge.includes('A') ? '1px solid #bfdbfe' : '1px solid #fed7aa',
            borderRadius: '6px',
            padding: '0.15rem 0.55rem',
            fontSize: '0.74rem',
            fontWeight: 800
          }}>
            {sectorBadge}
          </span>
        )}
      </div>

      {/* Left side in RTL: Server Status, Notifications & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Live Server Pulse */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '0.2rem 0.65rem', fontSize: '0.78rem', color: '#166534', fontWeight: 700 }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }}/>
          <span>متصل ومحدث</span>
        </div>

        {/* Notification Bell (Only for managers who oversee alerts) */}
        {!isSectorSupervisor ? (
          <button onClick={onBellClick} style={{
              position: 'relative',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569'
          }} title={`${unreadCount} تنبيهات جديدة`}>
            <Bell size={16}/>
            {unreadCount > 0 && (<span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#fff', fontSize: '0.68rem', fontWeight: 800, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                {unreadCount}
              </span>)}
          </button>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '20px',
            padding: '0.2rem 0.65rem',
            fontSize: '0.74rem',
            color: '#1d4ed8',
            fontWeight: 800
          }}>
            <ShieldCheck size={14}/>
            <span>صلاحية خاصة بالقطاع</span>
          </div>
        )}

        {/* User Profile */}
        <div 
          onClick={!isSectorSupervisor ? onProfileClick : undefined} 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '0.25rem 0.65rem',
            cursor: !isSectorSupervisor ? 'pointer' : 'default',
            transition: 'all 0.2s ease'
        }} title="بيانات المستخدم الحالي">
          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
            <User size={14}/>
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>{displayName}</div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>{displayRole}</div>
          </div>
          {!isSectorSupervisor && <ChevronDown size={13} color="#94a3b8"/>}
        </div>
      </div>
    </header>);
};
