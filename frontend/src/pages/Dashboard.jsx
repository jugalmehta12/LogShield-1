import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle,
  FileText,
  Radar,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { useEffect } from 'react';
import AlertsStatusChart from '../charts/AlertsStatusChart';
import LogsSeverityChart from '../charts/LogsSeverityChart';
import KpiSkeleton from '../components/KpiSkeleton';
import StatCard from '../components/StatCard';
import { useDashboardContext } from '../context/DashboardContext';
import { useAlerts } from '../hooks/useAlerts';
import { useDashboardRefresh } from '../hooks/useDashboardRefresh';
import { useIncidents } from '../hooks/useIncidents';
import { useLogs } from '../hooks/useLogs';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';
import { useRules } from '../hooks/useRules';

// ── accent tokens ─────────────────────────────────────────────────────────────
const ACCENTS = {
  cyan:   { borderColor: '#22d3ee', glowColor: 'rgba(34,211,238,0.10)'  },
  orange: { borderColor: '#f97316', glowColor: 'rgba(249,115,22,0.10)'  },
  red:    { borderColor: '#f43f5e', glowColor: 'rgba(244,63,94,0.10)'   },
  purple: { borderColor: '#a78bfa', glowColor: 'rgba(167,139,250,0.10)' },
  green:  { borderColor: '#34d399', glowColor: 'rgba(52,211,153,0.10)'  },
  indigo: { borderColor: '#818cf8', glowColor: 'rgba(129,140,248,0.10)' },
  yellow: { borderColor: '#facc15', glowColor: 'rgba(250,204,21,0.10)'  },
};

const ICON_SIZE = 18;

// ── section divider label ─────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
      <span
        style={{
          display:      'inline-block',
          width:        '3px',
          height:       '12px',
          background:   'linear-gradient(to bottom,#22d3ee,#818cf8)',
          borderRadius: '2px',
          flexShrink:   0,
        }}
      />
      <span
        style={{
          fontSize:      '9px',
          fontWeight:    700,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color:         '#334155',
        }}
      >
        {children}
      </span>
    </div>
  );
}

// ── subtle non-blocking refresh indicator ─────────────────────────────────────
function RefreshIndicator({ connectionState }) {
  if (connectionState === 'live') return null;

  const isError = connectionState === 'error';
  return (
    <div
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:          '7px',
        marginBottom: '10px',
        padding:      '7px 12px',
        borderRadius: '8px',
        border:       `1px solid ${isError ? 'rgba(244,63,94,0.2)' : 'rgba(250,204,21,0.15)'}`,
        background:   isError ? 'rgba(244,63,94,0.06)' : 'rgba(250,204,21,0.04)',
        fontSize:     '11px',
        color:        isError ? '#fda4af' : '#fde68a',
      }}
    >
      <RefreshCw
        size={11}
        style={{
          animation:   connectionState === 'refreshing' ? 'spin 1s linear infinite' : 'none',
          flexShrink:  0,
        }}
      />
      <span>
        {isError
          ? 'Could not reach backend — showing last known data. Retrying automatically…'
          : 'Refreshing dashboard data…'}
      </span>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────
function DashboardPage() {
  const { logs,      loading: logsLoading,   error: logsError,   refetch: refetchLogs      } = useLogs();
  const { alerts,    loading: alertsLoading, error: alertsError, refetch: refetchAlerts    } = useAlerts();
  const { rules,     refetch: refetchRules     } = useRules();
  const { incidents, refetch: refetchIncidents } = useIncidents();

  // Central 15-second auto-refresh orchestrator
  const { lastUpdated, connectionState, isFirstLoad, triggerRefresh } = useDashboardRefresh({
    refetchLogs,
    refetchAlerts,
    refetchRules,
    refetchIncidents,
  });

  // Publish lastUpdated to Navbar via context
  const { setLastUpdated } = useDashboardContext();
  useEffect(() => {
    if (lastUpdated) setLastUpdated(lastUpdated);
  }, [lastUpdated, setLastUpdated]);

  // WebSocket instant-refresh on events (best-of-both-worlds)
  useRealtimeUpdates({
    log_created:      () => { refetchLogs(); refetchAlerts(); },
    alert_created:    () => refetchAlerts(),
    alert_updated:    () => refetchAlerts(),
    rule_created:     () => refetchRules(),
    rule_updated:     () => refetchRules(),
    rule_deleted:     () => refetchRules(),
    incident_created: () => refetchIncidents(),
    incident_updated: () => refetchIncidents(),
  });

  const error = logsError || alertsError;

  // ── derived metrics ──────────────────────────────────────────────────────
  const totalLogs              = logs.length;
  const totalAlerts            = alerts.length;
  const openAlerts             = alerts.filter((a) => String(a.status || '').toLowerCase() === 'open').length;
  const investigatingAlerts    = alerts.filter((a) => String(a.status || '').toLowerCase() === 'investigating').length;
  const resolvedAlerts         = alerts.filter((a) => String(a.status || '').toLowerCase() === 'resolved').length;
  const activeRules            = rules.filter((r)  => r.enabled).length;
  const openIncidents          = incidents.filter((i) => i.status === 'open').length;
  const investigatingIncidents = incidents.filter((i) => i.status === 'investigating').length;
  const systemOnline           = !error;

  // ── KPI card definitions ─────────────────────────────────────────────────
  const row1 = [
    {
      label:      'Total Logs',
      value:      totalLogs.toLocaleString(),
      status:     'Updated Live',
      statusType: 'live',
      icon:       <FileText size={ICON_SIZE} />,
      ...ACCENTS.cyan,
    },
    {
      label:      'Total Alerts',
      value:      totalAlerts.toLocaleString(),
      status:     'Monitoring',
      statusType: 'live',
      icon:       <Bell size={ICON_SIZE} />,
      ...ACCENTS.orange,
    },
    {
      label:      'Open Alerts',
      value:      openAlerts.toLocaleString(),
      status:     openAlerts > 0 ? 'Attention Required' : 'No Issues',
      statusType: openAlerts > 0 ? 'alert' : 'ok',
      icon:       <AlertTriangle size={ICON_SIZE} />,
      ...ACCENTS.red,
    },
    {
      label:      'Investigating',
      value:      investigatingAlerts.toLocaleString(),
      status:     investigatingAlerts > 0 ? 'Investigating' : 'No Issues',
      statusType: investigatingAlerts > 0 ? 'warn' : 'ok',
      icon:       <Search size={ICON_SIZE} />,
      ...ACCENTS.yellow,
    },
    {
      label:      'Resolved Alerts',
      value:      resolvedAlerts.toLocaleString(),
      status:     'Closed',
      statusType: 'ok',
      icon:       <CheckCircle size={ICON_SIZE} />,
      ...ACCENTS.green,
    },
  ];

  const row2 = [
    {
      label:      'Open Incidents',
      value:      openIncidents.toLocaleString(),
      status:     openIncidents > 0 ? 'Attention Required' : 'Healthy',
      statusType: openIncidents > 0 ? 'alert' : 'ok',
      icon:       <ShieldAlert size={ICON_SIZE} />,
      ...ACCENTS.red,
    },
    {
      label:      'Investigating Incidents',
      value:      investigatingIncidents.toLocaleString(),
      status:     investigatingIncidents > 0 ? 'Investigating' : 'No Issues',
      statusType: investigatingIncidents > 0 ? 'warn' : 'ok',
      icon:       <Radar size={ICON_SIZE} />,
      ...ACCENTS.purple,
    },
    {
      label:      'Active Rules',
      value:      activeRules.toLocaleString(),
      status:     'Monitoring',
      statusType: 'live',
      icon:       <ShieldCheck size={ICON_SIZE} />,
      ...ACCENTS.indigo,
    },
    {
      label:      'System Status',
      value:      systemOnline ? 'Online' : 'Degraded',
      status:     systemOnline ? 'Healthy' : 'Attention Required',
      statusType: systemOnline ? 'ok'      : 'alert',
      icon:       <Activity size={ICON_SIZE} />,
      ...(systemOnline ? ACCENTS.green : ACCENTS.red),
    },
  ];

  // ── grid styles ──────────────────────────────────────────────────────────
  const row1Grid = {
    display:             'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap:                 '10px',
    marginBottom:        '10px',
  };
  const row2Grid = {
    display:             'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap:                 '10px',
    marginBottom:        '16px',
  };

  // First load — show skeleton instead of zeros
  const showSkeleton = isFirstLoad && (logsLoading || alertsLoading);

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0' }}>

      {/* ── Subtle non-blocking refresh/error indicator ─────────────────── */}
      <RefreshIndicator connectionState={connectionState} />

      {/* ── Error banner (persistent backend failure) ────────────────────── */}
      {error && connectionState === 'error' && (
        <div
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:          '10px',
            marginBottom: '10px',
            padding:      '9px 14px',
            borderRadius: '10px',
            border:       '1px solid rgba(244,63,94,0.25)',
            background:   'rgba(244,63,94,0.08)',
            fontSize:     '11px',
            color:        '#fda4af',
          }}
        >
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── KPI Section ─────────────────────────────────────────────────── */}
      <SectionLabel>Security Metrics</SectionLabel>

      {showSkeleton ? (
        <KpiSkeleton />
      ) : (
        <>
          {/* Row 1 — 5 cards */}
          <div style={row1Grid} className="kpi-row-5">
            {row1.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          {/* Row 2 — 4 cards */}
          <div style={row2Grid} className="kpi-row-4">
            {row2.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>
        </>
      )}

      {/* ── Charts Section ──────────────────────────────────────────────── */}
      <SectionLabel>Threat Analytics</SectionLabel>

      <div
        className="chart-row-responsive"
        style={{
          display:             'grid',
          gridTemplateColumns: '1fr 1fr',
          gap:                 '12px',
        }}
      >
        <LogsSeverityChart logs={logs}     />
        <AlertsStatusChart alerts={alerts} />
      </div>
    </div>
  );
}

export default DashboardPage;
