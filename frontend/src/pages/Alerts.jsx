import { useEffect, useState } from 'react';
import { getAlerts } from '../services/api';
import StatusBadge from '../components/StatusBadge';

function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const data = await getAlerts();
      if (mounted) {
        setAlerts(data);
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-glow backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Alerts</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Alert workspace</h3>
        </div>
        <StatusBadge tone={loading ? 'warning' : 'neutral'}>{loading ? 'Loading' : `${alerts.length} alerts`}</StatusBadge>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        {alerts.map((alert) => (
          <article key={alert.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <h4 className="font-medium text-white">{alert.alert_type}</h4>
              <StatusBadge tone={alert.severity === 'critical' ? 'critical' : alert.severity === 'high' ? 'warning' : 'neutral'}>
                {alert.severity}
              </StatusBadge>
              <span className="text-xs uppercase tracking-[0.25em] text-slate-500">{alert.status}</span>
            </div>
            <p className="mt-2 text-sm text-slate-400">Created {new Date(alert.created_at).toLocaleString()}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default AlertsPage;
