import { useEffect, useState } from 'react';
import AlertsLineChart from '../components/dashboard/AlertsLineChart';
import KPICard from '../components/dashboard/KPICard';
import SeverityPieChart from '../components/dashboard/SeverityPieChart';
import TopSourcesBarChart from '../components/dashboard/TopSourcesBarChart';
import { useAnalytics } from '../hooks/useAnalytics';

// ── token palette ───────────────────────────────────────────────────────────

const TOKENS = {
  logs: {
    borderColor: '#22d3ee',
    glowColor: 'rgba(34,211,238,0.08)',
    icon: '📋',
    statusColor: '#0e7490',
  },
  alerts: {
    borderColor: '#f97316',
    glowColor: 'rgba(249,115,22,0.08)',
    icon: '🔔',
    statusColor: '#9a3412',
  },
  open: {
    borderColor: '#f43f5e',
    glowColor: 'rgba(244,63,94,0.08)',
    icon: '🚨',
    statusColor: '#be123c',
  },
  critical: {
    borderColor: '#a78bfa',
    glowColor: 'rgba(167,139,250,0.08)',
    icon: '⚠️',
    statusColor: '#6d28d9',
  },
};

// ── helpers ─────────────────────────────────────────────────────────────────

/** @param {Date | null} d */
function fmtTime(d) {
  if (!d) return null;
  return d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// ── countdown ring ───────────────────────────────────────────────────────────

/** @param {{ secondsLeft: number }} props */
function CountdownRing({ secondsLeft }) {
  const r = 9;
  const circ = 2 * Math.PI * r;
  const dash = circ * (secondsLeft / 30);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#475569' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
        <circle cx="12" cy="12" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
        <circle
          cx="12"
          cy="12"
          r={r}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="2"
          strokeDasharray={circ}
          strokeDashoffset={circ - dash}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <span>{secondsLeft}s</span>
    </div>
  );
}

// ── section label ────────────────────────────────────────────────────────────

/** @param {{ title: string; right?: React.ReactNode }} props */
function SectionLabel({ title, right }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            display: 'inline-block',
            width: '3px',
            height: '14px',
            background: 'linear-gradient(to bottom, #22d3ee, #818cf8)',
            borderRadius: '2px',
          }}
        />
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#64748b',
          }}
        >
          {title}
        </span>
      </div>
      {right}
    </div>
  );
}

// ── chart panel ──────────────────────────────────────────────────────────────

/** @param {{ title: string; subtitle?: string; children: React.ReactNode }} props */
function ChartPanel({ title, subtitle, children }) {
  return (
    <div
      style={{
        borderRadius: '14px',
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(2,6,23,0.72)',
        backdropFilter: 'blur(16px)',
        padding: '16px 18px 14px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
      }}
    >
      <div style={{ marginBottom: '10px' }}>
        <p
          style={{
            margin: 0,
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#64748b',
          }}
        >
          {title}
        </p>
        {subtitle && (
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#334155' }}>{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// ── main page ────────────────────────────────────────────────────────────────

function LiveAnalyticsDashboard() {
  const {
    summary,
    severity,
    topSources,
    alertsOverTime,
    loading,
    error,
    refetch,
    lastRefreshed,
  } = useAnalytics();

  const [secondsLeft, setSecondsLeft] = useState(30);

  useEffect(() => {
    setSecondsLeft(30);
    const tick = setInterval(
      () => setSecondsLeft((s) => (s <= 1 ? 30 : s - 1)),
      1000,
    );
    return () => clearInterval(tick);
  }, [lastRefreshed]);

  const kpiCards = [
    {
      label: 'Total Logs',
      value: loading ? null : (summary?.total_logs?.toLocaleString() ?? '—'),
      status: 'Updated live',
      ...TOKENS.logs,
    },
    {
      label: 'Total Alerts',
      value: loading ? null : (summary?.total_alerts?.toLocaleString() ?? '—'),
      status: 'Monitoring',
      ...TOKENS.alerts,
    },
    {
      label: 'Open Alerts',
      value: loading ? null : (summary?.open_alerts?.toLocaleString() ?? '—'),
      status: 'Active',
      ...TOKENS.open,
    },
    {
      label: 'Critical Logs',
      value: loading ? null : (summary?.critical_logs?.toLocaleString() ?? '—'),
      status: 'Active',
      ...TOKENS.critical,
    },
  ];

  // ── outer shell ─────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px', fontFamily: 'inherit' }}>

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'rgba(34,211,238,0.7)',
            }}
          >
            Security Operations Center
          </p>
          <h1
            style={{
              margin: '4px 0 2px',
              fontSize: '20px',
              fontWeight: 700,
              color: '#f8fafc',
              lineHeight: 1.2,
            }}
          >
            Live Analytics Dashboard
          </h1>
          <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>
            Auto-refreshes every 30 s · JWT-authenticated
          </p>
        </div>

        {/* toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {lastRefreshed && (
            <span style={{ fontSize: '11px', color: '#334155' }}>
              Updated {fmtTime(lastRefreshed)}
            </span>
          )}

          <CountdownRing secondsLeft={secondsLeft} />

          <button
            id="analytics-refresh-btn"
            type="button"
            onClick={refetch}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent',
              color: '#64748b',
              fontSize: '11px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.4 : 1,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.color = '#22d3ee';
                e.currentTarget.style.borderColor = 'rgba(34,211,238,0.35)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#64748b';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          >
            <svg
              style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }}
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* ── Error banner ─────────────────────────────────────────────────────── */}
      {error && (
        <div
          id="analytics-error-banner"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(244,63,94,0.2)',
            background: 'rgba(244,63,94,0.08)',
            fontSize: '12px',
            color: '#fda4af',
          }}
        >
          <span>⚠</span>
          <span style={{ flex: 1 }}>{error}</span>
          <button
            type="button"
            onClick={refetch}
            style={{
              padding: '3px 10px',
              borderRadius: '6px',
              border: '1px solid rgba(244,63,94,0.25)',
              background: 'transparent',
              color: '#fda4af',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── SECTION 1: Security Metrics (KPI row) ───────────────────────────── */}
      <SectionLabel title="Security Metrics" />

      <div
        id="analytics-kpi-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '20px',
        }}
        className="kpi-grid-responsive"
      >
        {kpiCards.map((card) => (
          <KPICard key={card.label} loading={loading} {...card} />
        ))}
      </div>

      {/* ── SECTION 2: Threat Analytics ─────────────────────────────────────── */}
      <SectionLabel
        title="Threat Analytics"
        right={
          <span style={{ fontSize: '11px', color: '#334155' }}>
            Last 30 days
          </span>
        }
      />

      {/* Row 1: Pie + Bar side by side */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '12px',
        }}
        className="chart-row-responsive"
      >
        <ChartPanel
          title="Severity Distribution"
          subtitle="Log counts by severity level"
        >
          <SeverityPieChart data={severity} loading={loading} />
        </ChartPanel>

        <ChartPanel
          title="Top Sources"
          subtitle="Top 5 event emitters by volume"
        >
          <TopSourcesBarChart data={topSources} loading={loading} />
        </ChartPanel>
      </div>

      {/* Row 2: Alerts Over Time full width */}
      <ChartPanel
        title="Alerts Over Time"
        subtitle="Daily alert volume"
      >
        <AlertsLineChart data={alertsOverTime} loading={loading} />
      </ChartPanel>
    </div>
  );
}

export default LiveAnalyticsDashboard;
