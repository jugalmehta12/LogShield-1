import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import apiClient from '../services/api';

// ── Colour palette ─────────────────────────────────────────────────────────
const SEVERITY_COLORS = {
  critical: '#f43f5e',
  high: '#f97316',
  medium: '#facc15',
  low: '#22d3ee',
  info: '#818cf8',
};

const FALLBACK_COLORS = [
  '#22d3ee', '#818cf8', '#f43f5e', '#34d399', '#facc15',
  '#f97316', '#a78bfa', '#60a5fa', '#fb7185', '#4ade80',
];

function severityColor(name) {
  return SEVERITY_COLORS[String(name).toLowerCase()] ?? FALLBACK_COLORS[0];
}

// ── Shared chart tooltip ────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/95 px-3 py-2 text-xs shadow-2xl backdrop-blur">
      {label && <p className="mb-1 text-slate-400">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color ?? p.fill ?? '#22d3ee' }}>
          {p.name}: <span className="font-semibold text-white">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ── KPI card ───────────────────────────────────────────────────────────────
function KpiCard({ label, value, accent, icon }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_8px_32px_rgba(2,6,23,0.5)] backdrop-blur-xl transition hover:border-white/20">
      <div
        className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${accent}`}
      />
      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{label}</p>
      <p className={`mt-3 bg-gradient-to-r ${accent} bg-clip-text text-4xl font-bold text-transparent`}>
        {value ?? '—'}
      </p>
      {icon && <span className="absolute right-4 top-4 text-2xl opacity-20">{icon}</span>}
    </div>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────
function ChartCard({ title, children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
      <p className="mb-6 text-xs uppercase tracking-[0.3em] text-slate-500">{title}</p>
      {children}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
function AnalyticsPage() {
  const [summary, setSummary] = useState(null);
  const [severity, setSeverity] = useState([]);
  const [topSources, setTopSources] = useState([]);
  const [alertsOverTime, setAlertsOverTime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      setError(null);

      try {
        const [summaryRes, severityRes, sourcesRes, timelineRes] = await Promise.all([
          apiClient.get('/analytics/summary'),
          apiClient.get('/analytics/severity'),
          apiClient.get('/analytics/top-sources'),
          apiClient.get('/analytics/alerts-over-time'),
        ]);

        if (!cancelled) {
          setSummary(summaryRes.data);
          setSeverity(severityRes.data ?? []);
          setTopSources(sourcesRes.data ?? []);
          setAlertsOverTime(timelineRes.data ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.detail ?? err?.message ?? 'Failed to load analytics data.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  const kpiCards = [
    {
      label: 'Total Logs',
      value: summary?.total_logs?.toLocaleString() ?? '…',
      accent: 'from-cyan-400 to-teal-400',
      icon: '📋',
    },
    {
      label: 'Total Alerts',
      value: summary?.total_alerts?.toLocaleString() ?? '…',
      accent: 'from-amber-400 to-orange-500',
      icon: '🔔',
    },
    {
      label: 'Open Alerts',
      value: summary?.open_alerts?.toLocaleString() ?? '…',
      accent: 'from-rose-400 to-red-500',
      icon: '🚨',
    },
    {
      label: 'Critical Logs',
      value: summary?.critical_logs?.toLocaleString() ?? '…',
      accent: 'from-fuchsia-400 to-violet-500',
      icon: '⚠️',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Security Operations</p>
        <h2 className="mt-1 text-2xl font-bold text-white">Analytics Dashboard</h2>
        <p className="mt-1 text-sm text-slate-400">
          Aggregated metrics and visual breakdowns across logs and alerts.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {/* KPI cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </section>

      {/* Charts row 1: Pie + Bar */}
      <section className="grid gap-6 xl:grid-cols-2">
        {/* Pie – Severity Distribution */}
        <ChartCard title="Severity Distribution">
          {loading ? (
            <div className="flex h-64 items-center justify-center text-slate-500 text-sm">Loading…</div>
          ) : severity.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-slate-500 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={severity}
                  dataKey="count"
                  nameKey="severity"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {severity.map((entry) => (
                    <Cell
                      key={entry.severity}
                      fill={severityColor(entry.severity)}
                    />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs capitalize text-slate-300">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Bar – Top Sources */}
        <ChartCard title="Top Sources">
          {loading ? (
            <div className="flex h-64 items-center justify-center text-slate-500 text-sm">Loading…</div>
          ) : topSources.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-slate-500 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topSources} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="source"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="count" name="Events" radius={[6, 6, 0, 0]}>
                  {topSources.map((entry, index) => (
                    <Cell
                      key={entry.source}
                      fill={FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </section>

      {/* Line – Alerts Over Time */}
      <ChartCard title="Alerts Over Time">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-slate-500 text-sm">Loading…</div>
        ) : alertsOverTime.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-slate-500 text-sm">No timeline data</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={alertsOverTime} margin={{ left: 4, right: 16 }}>
              <defs>
                <linearGradient id="alertLineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                formatter={(value) => (
                  <span className="text-xs text-slate-300">{value}</span>
                )}
              />
              <Line
                type="monotone"
                dataKey="count"
                name="Alerts"
                stroke="url(#alertLineGradient)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#22d3ee', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#818cf8', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}

export default AnalyticsPage;
