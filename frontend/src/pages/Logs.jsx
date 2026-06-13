import { useEffect } from 'react';
import { useMemo, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLogs } from '../hooks/useLogs';

const SEVERITY_STYLES = {
  low: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  medium: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
  high: 'border-orange-400/20 bg-orange-400/10 text-orange-200',
  critical: 'border-rose-400/20 bg-rose-400/10 text-rose-200',
};

const SEVERITY_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

function LogsPage() {
  const { logs, loading, error, refetch } = useLogs();
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [source, setSource] = useState('');
  const [eventType, setEventType] = useState('');

  const queryParams = useMemo(() => {
    const params = {};

    if (severity) {
      params.severity = severity;
    }

    if (source) {
      params.source = source;
    }

    if (eventType) {
      params.event_type = eventType;
    }

    if (search.trim()) {
      params.search = search.trim();
    }

    return params;
  }, [eventType, search, severity, source]);

  const sourceOptions = useMemo(() => {
    return Array.from(new Set(logs.map((log) => log.source).filter(Boolean))).sort((left, right) =>
      String(left).localeCompare(String(right)),
    );
  }, [logs]);

  const eventTypeOptions = useMemo(() => {
    return Array.from(new Set(logs.map((log) => log.event_type).filter(Boolean))).sort((left, right) =>
      String(left).localeCompare(String(right)),
    );
  }, [logs]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch(queryParams);
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [queryParams, refetch]);

  useEffect(() => {
    refetch(queryParams);
  }, [queryParams, refetch]);

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Logs</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Backend log table</h3>
        </div>
        <div className="flex items-center gap-3">
          {loading ? <LoadingSpinner label="Loading logs" /> : <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">Live</span>}
          <button
            type="button"
            onClick={() => refetch(queryParams)}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-200 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-white"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-4">
        <label className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <span className="text-xs uppercase tracking-[0.25em] text-slate-500">Search</span>
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search raw logs..."
            className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
          />
        </label>

        <label className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <span className="text-xs uppercase tracking-[0.25em] text-slate-500">Severity</span>
          <select
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
            className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none"
          >
            {SEVERITY_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <span className="text-xs uppercase tracking-[0.25em] text-slate-500">Source</span>
          <select
            value={source}
            onChange={(event) => setSource(event.target.value)}
            className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="">All</option>
            {sourceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <span className="text-xs uppercase tracking-[0.25em] text-slate-500">Event Type</span>
          <select
            value={eventType}
            onChange={(event) => setEventType(event.target.value)}
            className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="">All</option>
            {eventTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
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
