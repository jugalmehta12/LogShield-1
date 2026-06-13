import LoadingSpinner from '../components/LoadingSpinner';
import { useLogs } from '../hooks/useLogs';

const SEVERITY_STYLES = {
  low: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  medium: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
  high: 'border-orange-400/20 bg-orange-400/10 text-orange-200',
  critical: 'border-rose-400/20 bg-rose-400/10 text-rose-200',
};

function LogsPage() {
  const { logs, loading, error } = useLogs();

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Logs</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Backend log table</h3>
        </div>
        {loading ? <LoadingSpinner label="Loading logs" /> : <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">Live</span>}
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {!loading && !error && logs.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-400">
          No logs are available yet.
        </div>
      ) : null}

      {!error && logs.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Timestamp</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Event Type</th>
                <th className="px-4 py-3 font-medium">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-slate-950/40 text-slate-200">
              {logs.map((row) => {
                const severityKey = String(row.severity || 'low').toLowerCase();
                return (
                  <tr key={row.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{new Date(row.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3">{row.source}</td>
                    <td className="px-4 py-3">{row.event_type}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.25em] ${SEVERITY_STYLES[severityKey] || SEVERITY_STYLES.low}`}>
                        {String(row.severity || 'low')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

export default LogsPage;
