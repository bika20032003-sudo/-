import React, { useState } from 'react';
import { AlertTriangle, Info, CheckCircle2, Trash2 } from 'lucide-react';
export const AlertsView = () => {
    const [alerts, setAlerts] = useState([]);
    const [filterType, setFilterType] = useState('all');
    const fetchAlerts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/alerts');
            const data = await response.json();
            if (data.success && data.alerts) {
                setAlerts(data.alerts);
            }
        }
        catch (error) {
            console.error('Failed to fetch alerts', error);
        }
    };
    React.useEffect(() => {
        fetchAlerts();
    }, []);
    const filtered = alerts.filter(a => filterType === 'all' || a.type === filterType);
    const markAllRead = async () => {
        try {
            await fetch('http://localhost:5000/api/alerts/read-all', { method: 'PUT' });
            fetchAlerts();
        }
        catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };
    const clearAlert = (id) => {
        // In a real app we'd delete it, for now just filter locally or implement a delete endpoint
        setAlerts(alerts.filter(a => a.id !== id));
    };
    return (<div className="view-content">
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>مركز التنبيهات والإشعارات الميدانية</h2>
          <p style={{ fontSize: '0.86rem', color: '#64748b' }}>
            متابعة الأعطال الفورية، تنبيهات استهلاك السولار، ونقص الأرصدة في القطعتين A و B
          </p>
        </div>

        <div className="filters-group">
          <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">كافة التنبيهات</option>
            <option value="danger">أعطال وتوقف معدات</option>
            <option value="warning">تنبيهات استهلاك ومخزون</option>
            <option value="info">إشعارات وتقارير</option>
          </select>

          <button className="secondary-action-btn" onClick={markAllRead}>
            <CheckCircle2 size={17}/>
            <span>تحديد الكل كمقروء</span>
          </button>
        </div>
      </div>

      <div className="table-container" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(a => (<div key={a.id} className={`alert-single-item ${a.type}`} style={{ padding: '1rem', background: a.read ? '#ffffff' : '#f8fafc', border: `1px solid ${a.read ? '#e2e8f0' : '#cbd5e1'}` }}>
              <div className="alert-icon-wrap" style={{ marginLeft: '0.75rem' }}>
                {a.type === 'danger' && <AlertTriangle size={22} color="#ef4444"/>}
                {a.type === 'warning' && <AlertTriangle size={22} color="#f59e0b"/>}
                {a.type === 'info' && <Info size={22} color="#2563eb"/>}
              </div>
              <div className="alert-text-wrap" style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800 }}>{a.title}</h4>
                  {!a.read && <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>جديد</span>}
                </div>
                <p style={{ fontSize: '0.84rem', color: '#475569', marginTop: '0.2rem' }}>{a.message}</p>
              </div>
              <span className="alert-time-tag" style={{ marginLeft: '1rem' }}>{a.timestamp}</span>
              <button onClick={() => clearAlert(a.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }} title="حذف التنبيه">
                <Trash2 size={16}/>
              </button>
            </div>))}
        </div>
      </div>
    </div>);
};
