import StatCard from '../components/StatCard';
import ThreatTrendChart from '../charts/ThreatTrendChart';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';

function DashboardPage() {
  const { logs, alerts, loading, error } = useDashboardMetrics();

  const cards = [
    {
      label: 'Total Logs',
      value: loading ? '...' : logs.length.toString(),
      detail: 'Collected from backend sample feed',
      accent: 'from-teal-400 to-cyan-500',
    },
    {
      label: 'Alerts',
      value: loading ? '...' : alerts.length.toString(),
      detail: 'Open or investigating events',
      accent: 'from-amber-400 to-orange-500',
    },
    {
      label: 'Critical Threats',
      value: loading ? '...' : alerts.filter((alert) => alert.severity === 'critical').length.toString(),
      detail: 'Reserved for future detection engine output',
      accent: 'from-rose-400 to-fuchsia-500',
    },
    {
      label: 'System Status',
      value: error ? 'Degraded' : 'Online',
      detail: error ? 'Backend fetch failed' : 'Backend API and UI connected',
      accent: 'from-emerald-400 to-teal-500',
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <ThreatTrendChart />
        <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-glow backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Phase 1 scope</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Foundation tasks</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li>Backend health endpoint and API scaffolding</li>
            <li>PostgreSQL session and ORM model base</li>
            <li>Electron desktop shell with React and Tailwind</li>
            <li>Axios integration for backend reads</li>
          </ul>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
            Sample data is intentionally lightweight so the structure can evolve without locking in detection logic yet.
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
