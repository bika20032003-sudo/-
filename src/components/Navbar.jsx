import React, { useState } from 'react';
import { Gauge, Bell, ChevronDown, User, ShieldCheck, Menu, Mail } from 'lucide-react';
import { fastFetch } from '../utils/apiCache.js';

export const Navbar = ({ currentTabName, onBellClick, onMailClick, onProfileClick, currentUser, onToggleMobileSidebar }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);

    const fetchUnreadAlerts = async () => {
        try {
            const data = await fastFetch('/api/alerts');
            const alertsList = data?.alerts || (Array.isArray(data) ? data : []);
            const unread = alertsList.filter((a) => !a.isRead).length;
            setUnreadCount(unread);
        } catch {
            // silent fallback
        }
    };

    const fetchUnreadMessages = async () => {
        try {
            const u = currentUser?.username || 'admin';
            const res = await fastFetch(`/api/messages?username=${encodeURIComponent(u)}`);
            const list = res?.messages || (Array.isArray(res) ? res : []);
            const unread = list.filter(m => !m.isRead && (m.toUsername === u || m.toUsername === 'all')).length;
            setUnreadMessages(unread);
        } catch {
            // silent fallback
        }
    };

    React.useEffect(() => {
        fetchUnreadAlerts();
        fetchUnreadMessages();
        const interval = setInterval(() => {
            fetchUnreadAlerts();
            fetchUnreadMessages();
        }, 20000);
        return () => clearInterval(interval);
    }, [currentUser?.username]);

    // Determine clean official name and role
    const username = currentUser?.username || '';
    const userRole = currentUser?.role || '';

    let displayName = currentUser?.name || 'م. عبدالرحمن الأنصاري';
    let displayRole = currentUser?.title || userRole || 'جهاز الإشراف';

    if (username === 'admin' || userRole.includes('مدير المشروع')) {
      displayName = currentUser?.name || 'م. عبدالرحمن الأنصاري';
      displayRole = 'مدير المشروع (جهاز الإشراف)';
    } else if (username === 'abrikaw' || userRole.includes('رئيس جهاز الإشراف')) {
      displayName = currentUser?.name || 'م. عبدالسلام ابريكاو';
      displayRole = 'رئيس جهاز الإشراف والمتابعة';
    } else if (username === 'saleh_quality' || userRole.includes('الجودة')) {
      displayName = currentUser?.name || 'م. صالح حماد';
      displayRole = 'مسؤول الجودة والمختبر';
    } else if (username === 'salah_alarabi' || (userRole.includes('مشرف') && (userRole.includes('A') || userRole.includes('الأولى') || (currentUser?.sector || '').includes('A') || (currentUser?.sector || '').includes('الأولى')))) {
      displayName = currentUser?.name || 'م. صلاح العربي';
      displayRole = 'مهندس مشرف - المرحلة الأولى';
    } else if (username === 'issa_altahir' || (userRole.includes('مشرف') && (userRole.includes('B') || userRole.includes('الثانية') || (currentUser?.sector || '').includes('B') || (currentUser?.sector || '').includes('الثانية')))) {
      displayName = currentUser?.name || 'م. عيسى الطاهر';
      displayRole = 'مهندس مشرف - المرحلة الثانية';
    }

    const sectorBadge = currentUser?.sector && currentUser.sector !== 'all' 
      ? ((currentUser.sector.includes('A') || currentUser.sector.includes('الأولى')) ? 'المرحلة الأولى' : 'المرحلة الثانية')
      : null;

    const userAvatar = currentUser?.avatar || localStorage.getItem(`user_avatar_${username}`) || '';

    return (
      <header className="custom-app-navbar" style={{ height: '54px', padding: '0 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Right side in RTL: Mobile Toggle + Tab Title & Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="navbar-mobile-toggle-btn"
            onClick={onToggleMobileSidebar}
            title="القائمة الجانبية"
            style={{
              display: 'none',
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

          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)', flexShrink: 0 }}>
            <Gauge size={17}/>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '0.2rem 0.65rem', fontSize: '0.76rem', color: '#166534', fontWeight: 700 }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }}/>
            <span>متصل ومحدث</span>
          </div>

          {/* Notification Bell */}
          <button 
            onClick={onBellClick} 
            style={{
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
            }} 
            title={`${unreadCount} تنبيهات جديدة`}
          >
            <Bell size={16}/>
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#fff', fontSize: '0.68rem', fontWeight: 800, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Mail & Correspondence Button */}
          <button 
            onClick={onMailClick} 
            style={{
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
            }} 
            title={`${unreadMessages} مراسلات واردة غير مقروءة`}
          >
            <Mail size={16}/>
            {unreadMessages > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#2563eb', color: '#fff', fontSize: '0.68rem', fontWeight: 800, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                {unreadMessages}
              </span>
            )}
          </button>

          {/* User Profile Chip - Clickable for all users to open profile & upload picture */}
          <div 
            onClick={onProfileClick} 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '0.25rem 0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }} 
            title="انقر لتعديل الملف الشخصي ورفع صورتك"
          >
            {userAvatar ? (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', border: '1.5px solid #3b82f6', flexShrink: 0 }}>
                <img src={userAvatar} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>
                {displayName[0] || 'م'}
              </div>
            )}
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>{displayName}</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>{displayRole}</div>
            </div>
            <ChevronDown size={13} color="#94a3b8"/>
          </div>
        </div>
      </header>
    );
};

export default Navbar;
