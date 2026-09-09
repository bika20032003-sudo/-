import React, { useState } from 'react';
import { 
  Gauge, 
  Bell, 
  ChevronDown, 
  User,
  Activity
} from 'lucide-react';

interface NavbarProps {
  currentTabName: string;
  onBellClick?: () => void;
  onProfileClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTabName, onBellClick, onProfileClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadAlerts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/alerts');
      const data = await response.json();
      if (data.success && data.alerts) {
        const unread = data.alerts.filter((a: any) => !a.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Failed to fetch alerts count', error);
    }
  };

  React.useEffect(() => {
    fetchUnreadAlerts();
    const interval = setInterval(fetchUnreadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="custom-app-navbar" style={{ height: '52px', padding: '0 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {/* Right side in RTL: Tab Title & Icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)' }}>
          <Gauge size={16} />
        </div>
        <h1 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          {currentTabName}
        </h1>
      </div>

      {/* Left side in RTL: Server Status, Notifications & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Live Server Pulse */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '0.2rem 0.65rem', fontSize: '0.78rem', color: '#166534', fontWeight: 700 }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }} />
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
          <Bell size={16} />
          {unreadCount > 0 && (
            <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#fff', fontSize: '0.68rem', fontWeight: 800, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile */}
        <div 
          onClick={onProfileClick} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.55rem', 
            background: '#f8fafc', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px', 
            padding: '0.25rem 0.65rem', 
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="مركز الحسابات والمستخدمين"
        >
          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
            <User size={14} />
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>م. عبدالرحمن</div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>مدير المشروع</div>
          </div>
          <ChevronDown size={13} color="#94a3b8" />
        </div>
      </div>
    </header>
  );
};
