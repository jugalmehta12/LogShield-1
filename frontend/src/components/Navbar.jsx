import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TITLES = {
  '/dashboard':      ['Dashboard',       'Operational overview for the LogShield workstation.'],
  '/logs':           ['Logs',            'Structured log review and table-first analysis view.'],
  '/alerts':         ['Alerts',          'Alert cards for SOC-style triage flow.'],
  '/analytics':      ['Analytics',       'Aggregated metrics and chart breakdowns.'],
  '/live-analytics': ['Live Analytics',  'Auto-refreshing analytics dashboard with KPIs and charts.'],
  '/rules':          ['Rules',           'Detection rule management and configuration.'],
  '/incidents':      ['Incidents',       'Security incident tracking and investigation.'],
  '/settings':       ['Settings',        'Application configuration and environment controls.'],
};

const ROLE_STYLES = {
  admin:   'border-rose-400/20 bg-rose-400/10 text-rose-300',
  analyst: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  viewer:  'border-slate-400/20 bg-slate-400/10 text-slate-300',
};

/**
 * Format a Date into "HH:MM:SS AM/PM" for the "Last Updated" display.
 * @param {Date | null} date
 * @returns {string}
 */
function formatTime(date) {
  if (!date) return '—';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/**
 * @param {{
 *   connectionStatus: 'connected' | 'connecting' | 'disconnected',
 *   lastUpdated?:     Date | null,
 * }} props
 */
function Navbar({ connectionStatus = 'disconnected', lastUpdated = null }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const [title, subtitle] = TITLES[pathname] ?? TITLES['/dashboard'];
  const roleStyle = ROLE_STYLES[user?.role] ?? ROLE_STYLES.viewer;

  // ── WS status badge config ─────────────────────────────────────────────────
  const statusConfig = {
    connected: {
      label:     '🟢 LIVE',
      className: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
    },
    connecting: {
      label:     '🟡 RECONNECTING',
      className: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
    },
    disconnected: {
      label:     '🔴 OFFLINE',
      className: 'border-rose-400/20 bg-rose-400/10 text-rose-200',
    },
  };

  const { label, className } = statusConfig[connectionStatus] ?? statusConfig.disconnected;

  return (
    <header className="flex flex-col gap-4 border-b border-white/10 bg-slate-950/50 px-6 py-4 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
      {/* ── Page title ──────────────────────────────────────────────────── */}
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">LogShield Frontend</p>
        <h2 className="mt-1.5 text-xl font-semibold text-white">{title}</h2>
        <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>
      </div>

      {/* ── Right cluster ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 self-start">

        {/* WebSocket connection status badge */}
        <div
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] ${className}`}
        >
          {label}
        </div>

        {/* Last Updated timestamp — only shown when we have a value */}
        {lastUpdated && (
          <div
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400"
            title="Time of last successful data refresh"
          >
            <svg
              width="11" height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ opacity: 0.7 }}
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Updated {formatTime(lastUpdated)}</span>
          </div>
        )}

        {/* User info */}
        {user && (
          <>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-semibold text-cyan-400">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="text-xs">
                <span className="text-slate-300">{user.username}</span>
                <span className="mx-1.5 text-slate-600">·</span>
                <span className={`inline-flex rounded-full border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.2em] ${roleStyle}`}>
                  {user.role}
                </span>
              </div>
            </div>

            {/* Logout */}
            <button
              id="logout-btn"
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs text-slate-400 transition hover:border-rose-400/30 hover:text-rose-300"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;