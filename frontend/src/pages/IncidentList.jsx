import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { useIncidents } from '../hooks/useIncidents';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';
import { useAuth } from '../context/AuthContext';

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  open: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  investigating: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  resolved: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  closed: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

const SEVERITY_COLORS = {
  critical: 'bg-red-600/20 text-red-300 border-red-600/30',
  high: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  low: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
};

const INITIAL_FORM = {
  title: '',
  description: '',
  severity: 'medium',
  status: 'open',
  alert_id: '',
};

function SeverityBadge({ severity }) {
  const cls = SEVERITY_COLORS[severity] ?? 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${cls}`}>
      {severity}
    </span>
  );
}

function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status] ?? 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize tracking-wider ${cls}`}>
      {status}
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

function CreateIncidentModal({ onClose, onCreate }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onCreate({
        ...form,
        alert_id: form.alert_id ? parseInt(form.alert_id, 10) : null,
      });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to create incident.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-white">Create New Incident</h2>
        <p className="mt-1 text-sm text-slate-400">Open a new security incident for investigation.</p>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-400">
              Title *
            </label>
            <input
              id="incident-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/20"
              placeholder="e.g. Brute-force login detected"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-400">
              Description
            </label>
            <textarea
              id="incident-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/20"
              placeholder="Describe the incident..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400">
                Severity
              </label>
              <select
                id="incident-severity"
                name="severity"
                value={form.severity}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-cyan-400/40 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400">
                Status
              </label>
              <select
                id="incident-status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-cyan-400/40 focus:outline-none"
              >
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-400">
              Source Alert ID (optional)
            </label>
            <input
              id="incident-alert-id"
              name="alert_id"
              type="number"
              value={form.alert_id}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/20"
              placeholder="Alert ID"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Cancel
            </button>
            <button
              id="incident-submit-btn"
              type="submit"
              disabled={submitting}
              className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/20 disabled:opacity-50"
            >
              {submitting ? 'Creating…' : 'Create Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function IncidentListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { incidents, loading, error, refetch, createIncident } = useIncidents();
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  // Realtime updates
  useRealtimeUpdates({
    incident_created: () => refetch(),
    incident_updated: () => refetch(),
  });

  const canCreate = user?.role === 'admin' || user?.role === 'analyst';

  const filtered = statusFilter
    ? incidents.filter((i) => i.status === statusFilter)
    : incidents;

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Incidents</h2>
          <p className="mt-1 text-sm text-slate-400">
            Security incidents under investigation — {incidents.length} total
          </p>
        </div>
        {canCreate && (
          <button
            id="open-create-incident-modal"
            onClick={() => setShowModal(true)}
            className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-2.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
          >
            + New Incident
          </button>
        )}
      </div>

      {/* ── Filter bar ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {['', 'open', 'investigating', 'resolved', 'closed'].map((s) => (
          <button
            key={s || 'all'}
            id={`filter-${s || 'all'}`}
            onClick={() => setStatusFilter(s)}
            className={[
              'rounded-xl border px-3 py-1.5 text-xs font-medium capitalize transition',
              statusFilter === s
                ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300'
                : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white',
            ].join(' ')}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* ── Loading / Error ────────────────────────────────────────── */}
      {loading && <LoadingSpinner label="Loading incidents…" />}
      {error && (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────────────── */}
      {!loading && (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
          {filtered.length === 0 ? (
            <div className="px-6 py-16 text-center text-slate-400">
              No incidents found.{' '}
              {canCreate && (
                <button
                  onClick={() => setShowModal(true)}
                  className="text-cyan-400 hover:underline"
                >
                  Create one?
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3 text-left">ID</th>
                  <th className="px-5 py-3 text-left">Title</th>
                  <th className="px-5 py-3 text-left">Severity</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Created</th>
                  <th className="px-5 py-3 text-left">Updated</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inc) => (
                  <tr
                    key={inc.id}
                    className="border-b border-white/5 transition hover:bg-white/5"
                  >
                    <td className="px-5 py-3 font-mono text-slate-400">#{inc.id}</td>
                    <td className="px-5 py-3 font-medium text-white">{inc.title}</td>
                    <td className="px-5 py-3">
                      <SeverityBadge severity={inc.severity} />
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={inc.status} />
                    </td>
                    <td className="px-5 py-3 text-slate-400">{formatDate(inc.created_at)}</td>
                    <td className="px-5 py-3 text-slate-400">{formatDate(inc.updated_at)}</td>
                    <td className="px-5 py-3">
                      <button
                        id={`view-incident-${inc.id}`}
                        onClick={() => navigate(`/incidents/${inc.id}`)}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                      >
                        Investigate →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Create Modal ───────────────────────────────────────────── */}
      {showModal && (
        <CreateIncidentModal
          onClose={() => setShowModal(false)}
          onCreate={createIncident}
        />
      )}
    </div>
  );
}

export default IncidentListPage;
