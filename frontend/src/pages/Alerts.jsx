import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useAlerts } from '../hooks/useAlerts';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';

const SEVERITY_STYLES = {
  low: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  medium: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
  high: 'border-orange-400/20 bg-orange-400/10 text-orange-200',
  critical: 'border-rose-400/20 bg-rose-400/10 text-rose-200',
};

const STATUS_STYLES = {
  open: 'border-rose-400/20 bg-rose-400/10 text-rose-200',
  investigating: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
  resolved: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
};

const STATUS_BUTTON_STYLES = {
  open: 'border-rose-400/30 bg-rose-400/10 text-rose-100 hover:bg-rose-400/20',
  investigating: 'border-amber-400/30 bg-amber-400/10 text-amber-100 hover:bg-amber-400/20',
  resolved: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/20',
};

function AlertsPage() {
  const { can } = useAuth();
  const { alerts, loading, error, message, updatingAlertId, refetch, updateAlertStatus } = useAlerts();

  useRealtimeUpdates({
    alert_created: () => { refetch(); },
    alert_updated: () => { refetch(); },
  });

  const handleStatusChange = async (alertId, status) => {
    await updateAlertStatus(alertId, status);
  };

  // RBAC — analysts and admins can update alert status; viewers cannot
  const canUpdateAlerts = can('update_alerts');

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Alerts</p>
        <h3 className="mt-2 text-lg font-semibold text-white">Security Alert Cards</h3>
        {!canUpdateAlerts && (
          <p className="mt-1 text-xs text-slate-500">
            You have read-only access. Alert status updates require Analyst or Admin role.
          </p>
        )}
      </div>

      {loading ? <LoadingSpinner label="Loading alerts" /> : null}

      {error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {message}
        </div>
      ) : null}

      {!loading && !error && alerts.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-400">
          No alerts are available yet.
        </div>
      ) : null}

      {!error && alerts.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {alerts.map((alert) => {
            const severityKey = String(alert.severity || 'low').toLowerCase();
            const statusKey = String(alert.status || 'open').toLowerCase();

            return (
              <article key={alert.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Alert Type</p>
                <h4 className="mt-2 text-xl font-semibold text-white">{alert.alert_type}</h4>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Severity</p>
                    <p className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.25em] ${SEVERITY_STYLES[severityKey] || SEVERITY_STYLES.low}`}>
                      {String(alert.severity || 'low')}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Status</p>
                    <p className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.25em] ${STATUS_STYLES[statusKey] || STATUS_STYLES.open}`}>
                      {String(alert.status || 'open')}
                    </p>
                  </div>
                </div>

                {/* Status workflow buttons — hidden for viewers */}
                {canUpdateAlerts && (
                  <div className="mt-5 flex flex-wrap gap-3">
                    {['open', 'investigating', 'resolved'].map((s) => {
                      const isActive = statusKey === s;
                      const isUpdating = updatingAlertId === alert.id;

                      return (
                        <button
                          key={s}
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(alert.id, s)}
                          className={`rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] transition ${STATUS_BUTTON_STYLES[s]} ${
                            isActive ? 'ring-1 ring-white/30' : ''
                          } ${isUpdating ? 'cursor-not-allowed opacity-60' : ''}`}
                        >
                          {isUpdating && isActive ? 'Updating...' : s}
                        </button>
                      );
                    })}
                  </div>
                )}

                <p className="mt-4 text-sm text-slate-400">
                  Created At: {new Date(alert.created_at).toLocaleString()}
                </p>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

export default AlertsPage;
