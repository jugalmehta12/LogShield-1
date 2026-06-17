import AlertsStatusChart from '../charts/AlertsStatusChart';
import LogsSeverityChart from '../charts/LogsSeverityChart';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import { useAlerts } from '../hooks/useAlerts';
import { useIncidents } from '../hooks/useIncidents';
import { useLogs } from '../hooks/useLogs';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';
import { useRules } from '../hooks/useRules';

// ── accent tokens ────────────────────────────────────────────────────────────
const ACCENTS = {
  cyan:   { borderColor: '#22d3ee', glowColor: 'rgba(34,211,238,0.07)'  },
  orange: { borderColor: '#f97316', glowColor: 'rgba(249,115,22,0.07)'  },
  red:    { borderColor: '#f43f5e', glowColor: 'rgba(244,63,94,0.07)'   },
  purple: { borderColor: '#a78bfa', glowColor: 'rgba(167,139,250,0.07)' },
  green:  { borderColor: '#34d399', glowColor: 'rgba(52,211,153,0.07)'  },
  indigo: { borderColor: '#818cf8', glowColor: 'rgba(129,140,248,0.07)' },
};

// ── section label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div
      style={{
        display:     'flex',
        alignItems:  'center',
        gap:         '8px',
        marginBottom:'10px',
      }}
    >
      <span
        style={{
          display:    'inline-block',
          width:      '3px',
          height:     '13px',
          background: 'linear-gradient(to bottom,#22d3ee,#818cf8)',
          borderRadius:'2px',
          flexShrink:  0,
        }}
      />
      <span
        style={{
          fontSize:      '10px',
          fontWeight:    600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color:         '#475569',
        }}
      >
        {children}
      </span>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────
function DashboardPage() {
  const { logs,      loading: logsLoading,    error: logsError,    refetch: refetchLogs    } = useLogs();
  const { alerts,    loading: alertsLoading,  error: alertsError,  refetch: refetchAlerts  } = useAlerts();
  const { rules,     refetch: refetchRules    } = useRules();
  const { incidents, refetch: refetchIncidents} = useIncidents();

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

  const isLoading = logsLoading || alertsLoading;
  const error     = logsError   || alertsError;

  // ── derived metrics ──────────────────────────────────────────────────────
  const totalLogs              = logs.length;
  const totalAlerts            = alerts.length;
  const openAlerts             = alerts.filter((a) => String(a.status || '').toLowerCase() === 'open').length;
  const investigatingAlerts    = alerts.filter((a) => String(a.status || '').toLowerCase() === 'investigating').length;
  const resolvedAlerts         = alerts.filter((a) => String(a.status || '').toLowerCase() === 'resolved').length;
  const criticalLogs           = logs.filter((l)   => String(l.severity || '').toLowerCase() === 'critical').length;
  const activeRules            = rules.filter((r)   => r.enabled).length;
  const openIncidents          = incidents.filter((i) => i.status === 'open').length;
  const investigatingIncidents = incidents.filter((i) => i.status === 'investigating').length;

  // ── KPI card definitions ─────────────────────────────────────────────────
  // Row 1 – primary 4 (always shown, matches the spec)
  const primaryCards = [
    { label: 'Total Logs',    value: totalLogs.toLocaleString(),   detail: 'Updated live',  ...ACCENTS.cyan   },
    { label: 'Total Alerts',  value: totalAlerts.toLocaleString(), detail: 'All severities',...ACCENTS.orange  },
    { label: 'Open Alerts',   value: openAlerts.toLocaleString(),  detail: 'Needs triage',  ...ACCENTS.red    },
    { label: 'Critical Logs', value: criticalLogs.toLocaleString(),detail: 'High severity', ...ACCENTS.purple },
  ];

  // Row 2 – secondary 4
  const secondaryCards = [
    { label: 'Investigating', value: investigatingAlerts.toLocaleString(),    detail: 'In review',     ...ACCENTS.orange },
    { label: 'Resolved',      value: resolvedAlerts.toLocaleString(),         detail: 'Closed',        ...ACCENTS.green  },
    { label: 'Open Incidents',value: openIncidents.toLocaleString(),          detail: 'Active',        ...ACCENTS.red    },
    { label: 'Active Rules',  value: activeRules.toLocaleString(),            detail: 'Monitoring',    ...ACCENTS.indigo },
  ];

  // ── inline grid style (responsive via CSS class) ─────────────────────────
  const gridStyle = {
    display:               'grid',
    gridTemplateColumns:   'repeat(4, 1fr)',
    gap:                   '12px',
    marginBottom:          '12px',
  };

  return (
    <div
      style={{
        maxWidth: '1400px',
        margin:   '0 auto',
        padding:  '0',          // outer padding is handled by MainLayout
      }}
    >
      {/* ── Loading pill ─────────────────────────────────────────────────── */}
      {isLoading && (
        <div style={{ marginBottom: '12px' }}>
          <LoadingSpinner label="Refreshing dashboard data" />
        </div>
      )}

      {/* ── Error banner ─────────────────────────────────────────────────── */}
      {error && (
        <div
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:          '10px',
            marginBottom: '12px',
            padding:      '10px 14px',
            borderRadius: '10px',
            border:       '1px solid rgba(244,63,94,0.2)',
            background:   'rgba(244,63,94,0.08)',
            fontSize:     '12px',
            color:        '#fda4af',
          }}
        >
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── Section: Security Metrics ─────────────────────────────────────── */}
      <SectionLabel>Security Metrics</SectionLabel>

      {/* KPI Grid (8 cards, 4 cols, wraps to 2 rows automatically) */}
      <div className="stat-grid-responsive" style={{ ...gridStyle, marginBottom: '18px' }}>
        {[...primaryCards, ...secondaryCards].map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* ── Section: Threat Analytics ─────────────────────────────────────── */}
      <SectionLabel>Threat Analytics</SectionLabel>

      {/* Chart row – Severity + Alert Status */}
      <div
        className="chart-row-responsive"
        style={{
          display:             'grid',
          gridTemplateColumns: '1fr 1fr',
          gap:                 '12px',
          marginBottom:        '12px',
        }}
      >
        <LogsSeverityChart  logs={logs}     />
        <AlertsStatusChart  alerts={alerts} />
      </div>

      {/* ── Section: Operational Status ──────────────────────────────────── */}
      <SectionLabel>Operational Status</SectionLabel>

      <div
        style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap:                 '10px',
        }}
        className="stat-grid-responsive"
      >
        {[
          { label: 'Open Alerts',            value: openAlerts,             accent: '2px solid #f43f5e' },
          { label: 'Open Incidents',         value: openIncidents,          accent: '2px solid #f97316' },
          { label: 'Investigating Incidents',value: investigatingIncidents,  accent: '2px solid #facc15' },
          { label: 'System Status',          value: error ? 'Degraded' : 'Online', accent: error ? '2px solid #f43f5e' : '2px solid #34d399' },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              borderRadius:   '12px',
              border:         '1px solid rgba(255,255,255,0.06)',
              borderTop:      item.accent,
              background:     'rgba(8,12,24,0.8)',
              backdropFilter: 'blur(12px)',
              padding:        '12px 14px',
            }}
          >
            <p style={{ margin: 0, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#475569' }}>
              {item.label}
            </p>
            <p style={{ margin: '5px 0 0', fontSize: '26px', fontWeight: 700, color: '#f1f5f9', lineHeight: 1 }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardPage;
