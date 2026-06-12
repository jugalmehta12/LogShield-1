import { useEffect, useState } from 'react';
import { getLogs } from '../services/api';
import StatusBadge from '../components/StatusBadge';

function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await getLogs();
        if (mounted) {
          setLogs(data);
          setLoading(false);
        }
      } catch (fetchError) {
        if (mounted) {
          setError(fetchError);
          setLoading(false);
        }
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
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Log feed</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Latest incoming logs</h3>
        </div>
        <StatusBadge tone={loading ? 'warning' : error ? 'critical' : 'online'}>
          {loading ? 'Loading' : error ? 'Unavailable' : `${logs.length} records`}
        </StatusBadge>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
          Backend request failed. Check that FastAPI is running on the configured API URL.
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        {logs.map((log) => (
          <article key={log.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <h4 className="font-medium text-white">{log.event_type}</h4>
              <StatusBadge tone={log.severity === 'critical' ? 'critical' : log.severity === 'high' ? 'warning' : 'neutral'}>
                {log.severity}
              </StatusBadge>
              <span className="text-xs uppercase tracking-[0.25em] text-slate-500">{log.source}</span>
            </div>
            <p className="mt-3 text-sm text-slate-300">{log.raw_log}</p>
            <p className="mt-2 text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default LogsPage;
