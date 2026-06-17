import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertsStatusChart from '../charts/AlertsStatusChart';
import LogsSeverityChart from '../charts/LogsSeverityChart';
import { useAlerts } from '../hooks/useAlerts';
import { useLogs } from '../hooks/useLogs';
import { useRules } from '../hooks/useRules';
import { useIncidents } from '../hooks/useIncidents';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';

function DashboardPage() {
  const { logs, loading: logsLoading, error: logsError, refetch: refetchLogs } = useLogs();
  const { alerts, loading: alertsLoading, error: alertsError, refetch: refetchAlerts } = useAlerts();
  const { rules, refetch: refetchRules } = useRules();
  const { incidents, refetch: refetchIncidents } = useIncidents();

  useRealtimeUpdates({
    log_created: () => {
      refetchLogs();
      refetchAlerts();
    },
    alert_created: () => {
      refetchAlerts();
    },
    alert_updated: () => {
      refetchAlerts();
    },
    rule_created: () => refetchRules(),
    rule_updated: () => refetchRules(),
    rule_deleted: () => refetchRules(),
    incident_created: () => refetchIncidents(),
    incident_updated: () => refetchIncidents(),
  });

  const isLoading = logsLoading || alertsLoading;
  const error = logsError || alertsError;

  const totalLogs = logs.length;
  const totalAlerts = alerts.length;
  const openAlerts = alerts.filter((alert) => String(alert.status || '').toLowerCase() === 'open').length;
  const investigatingAlerts = alerts.filter((alert) => String(alert.status || '').toLowerCase() === 'investigating').length;
  const resolvedAlerts = alerts.filter((alert) => String(alert.status || '').toLowerCase() === 'resolved').length;
  const activeRules = rules.filter((r) => r.enabled).length;
  const openIncidents = incidents.filter((i) => i.status === 'open').length;
  const investigatingIncidents = incidents.filter((i) => i.status === 'investigating').length;

  const cards = [
    {
      label: 'Total Logs',
      value: totalLogs.toString(),
      detail: 'Fetched from the backend logs endpoint.',
      accent: 'from-cyan-400 to-teal-400',
    },
    {
      label: 'Total Alerts',
      value: totalAlerts.toString(),
      detail: 'Aggregated from backend alert data.',
      accent: 'from-amber-400 to-orange-500',
    },
    {
      label: 'Open Alerts',
      value: openAlerts.toString(),
      detail: 'Alerts requiring immediate attention.',
      accent: 'from-rose-400 to-red-500',
    },
    {
      label: 'Investigating Alerts',
      value: investigatingAlerts.toString(),
      detail: 'Alerts currently in active review.',
      accent: 'from-amber-400 to-yellow-500',
    },
    {
      label: 'Resolved Alerts',
      value: resolvedAlerts.toString(),
      detail: 'Alerts closed from workflow management.',
      accent: 'from-emerald-400 to-cyan-400',
    },
    {
      label: 'Open Incidents',
      value: openIncidents.toString(),
      detail: 'Security incidents awaiting investigation.',
      accent: 'from-rose-500 to-pink-500',
    },
    {
      label: 'Investigating Incidents',
      value: investigatingIncidents.toString(),
      detail: 'Incidents actively under analyst review.',
      accent: 'from-violet-400 to-indigo-500',
    },
    {
      label: 'Active Rules',
      value: activeRules.toString(),
      detail: 'Detection rules currently enabled.',
      accent: 'from-violet-400 to-purple-500',
    },
    {
      label: 'System Status',
      value: error ? 'Degraded' : 'Online',
      detail: error || 'Backend API and frontend are connected.',
      accent: 'from-cyan-400 to-teal-400',
    },
  ];

  const dashboardSummary = [
    { label: 'Open Alerts', value: openAlerts },
    { label: 'Open Incidents', value: openIncidents },
    { label: 'Logs Loaded', value: totalLogs },
    { label: 'Active Rules', value: activeRules },
  ];

  return (
    <div className="space-y-6">
      {isLoading ? <LoadingSpinner label="Refreshing dashboard data" /> : null}

      {error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <LogsSeverityChart logs={logs} />
        <AlertsStatusChart alerts={alerts} />
      </section>

      <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Summary</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboardSummary.map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Auto Refresh</p>
        <h3 className="mt-2 text-lg font-semibold text-white">Dashboard updates instantly via WebSocket</h3>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          The dashboard listens for realtime log, alert, and incident events and refreshes itself without polling.
        </p>
      </section>
    </div>
  );
}

export default DashboardPage;

