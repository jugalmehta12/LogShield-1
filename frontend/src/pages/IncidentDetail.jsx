import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useIncidentDetail } from '../hooks/useIncidents';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';

// ── Badge helpers ─────────────────────────────────────────────────────────────
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

// Timeline dot colors by event type
const TIMELINE_DOTS = {
  incident_opened: 'bg-rose-400',
  status_changed: 'bg-amber-400',
  note_added: 'bg-cyan-400',
  resolved: 'bg-emerald-400',
  closed: 'bg-slate-400',
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

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatFull(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

// ── Build timeline items from incident + notes ────────────────────────────────
function buildTimeline(incident, notes) {
  if (!incident) return [];

  const events = [];

  // 1. Incident opened
  events.push({
    id: 'open',
    type: 'incident_opened',
    time: incident.created_at,
    label: 'Incident opened',
    detail: incident.title,
    dotClass: TIMELINE_DOTS.incident_opened,
  });

  // 2. Notes (analyst notes)
  notes.forEach((n) => {
    events.push({
      id: `note-${n.id}`,
      type: 'note_added',
      time: n.created_at,
      label: 'Analyst note added',
      detail: n.note,
      dotClass: TIMELINE_DOTS.note_added,
    });
  });

  // 3. Status transition (if not open)
  if (incident.status !== 'open') {
    const statusLabels = {
      investigating: 'Status changed to Investigating',
      resolved: 'Incident resolved',
      closed: 'Incident closed',
    };
    events.push({
      id: `status-${incident.status}`,
      type: incident.status === 'resolved' ? 'resolved' : incident.status === 'closed' ? 'closed' : 'status_changed',
      time: incident.updated_at,
      label: statusLabels[incident.status] ?? `Status changed to ${incident.status}`,
      detail: null,
      dotClass: TIMELINE_DOTS[incident.status] ?? TIMELINE_DOTS.status_changed,
    });
  }

  // Sort chronologically
  events.sort((a, b) => new Date(a.time) - new Date(b.time));
  return events;
}

// ── Status update dropdown ────────────────────────────────────────────────────
function StatusDropdown({ currentStatus, onUpdate, disabled }) {
  const statuses = ['open', 'investigating', 'resolved', 'closed'];
  return (
    <select
      id="incident-status-select"
      value={currentStatus}
      onChange={(e) => onUpdate(e.target.value)}
      disabled={disabled}
      className="rounded-xl border border-white/10 bg-slate-800 px-3 py-1.5 text-sm text-white focus:border-cyan-400/40 focus:outline-none disabled:opacity-50"
    >
      {statuses.map((s) => (
        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
      ))}
    </select>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function IncidentDetailPage() {
  const { id } = useParams();
  const incidentId = parseInt(id, 10);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { incident, notes, loading, error, refetch, updateIncident, addNote, submitting } =
    useIncidentDetail(incidentId);

  const [noteText, setNoteText] = useState('');
  const [noteError, setNoteError] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  const canEdit = user?.role === 'admin' || user?.role === 'analyst';

  // Real-time updates for this incident
  useRealtimeUpdates({
    incident_updated: (data) => {
      if (data?.id === incidentId) refetch();
    },
    note_added: (data) => {
      if (data?.incident_id === incidentId) refetch();
    },
  });

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try {
      await updateIncident({ status: newStatus });
    } catch {
      // silently handled by hook
    } finally {
      setStatusLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) {
      setNoteError('Note cannot be empty.');
      return;
    }
    setNoteError('');
    try {
      await addNote(noteText.trim());
      setNoteText('');
    } catch {
      setNoteError('Failed to add note. Please try again.');
    }
  };

  const timeline = buildTimeline(incident, notes);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner label="Loading incident…" />
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
        {error || 'Incident not found.'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb ─────────────────────────────────────────────── */}
      <button
        onClick={() => navigate('/incidents')}
        className="flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white"
      >
        ← Back to Incidents
      </button>

      {/* ── Incident Header Card ───────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 to-violet-500" />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-slate-500">#{incident.id}</span>
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
              {incident.alert_id && (
                <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-2.5 py-0.5 text-xs text-violet-300">
                  Alert #{incident.alert_id}
                </span>
              )}
            </div>
            <h2 className="mt-3 text-xl font-semibold text-white">{incident.title}</h2>
            {incident.description && (
              <p className="mt-2 text-sm leading-6 text-slate-400">{incident.description}</p>
            )}
          </div>

          {canEdit && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">Status:</span>
              <StatusDropdown
                currentStatus={incident.status}
                onUpdate={handleStatusChange}
                disabled={statusLoading}
              />
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-6 text-xs text-slate-500">
          <span>
            Created:{' '}
            <span className="text-slate-400">{formatFull(incident.created_at)}</span>
          </span>
          <span>
            Updated:{' '}
            <span className="text-slate-400">{formatFull(incident.updated_at)}</span>
          </span>
        </div>
      </div>

      {/* ── Main grid: Timeline + Notes ───────────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">

        {/* ── Timeline ───────────────────────────────────────────── */}
        <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
          <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Incident Timeline
          </h3>

          {timeline.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">No events recorded yet.</p>
          ) : (
            <ol className="mt-6 space-y-0">
              {timeline.map((event, idx) => (
                <li key={event.id} className="relative flex gap-4">
                  {/* Vertical connector */}
                  {idx < timeline.length - 1 && (
                    <div className="absolute left-[11px] top-6 h-full w-px bg-white/10" />
                  )}

                  {/* Dot */}
                  <div className={`relative z-10 mt-1 h-5 w-5 flex-shrink-0 rounded-full border-2 border-slate-900 ${event.dotClass}`} />

                  {/* Content */}
                  <div className="pb-8">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-500">
                        [{formatTime(event.time)}]
                      </span>
                      <span className="text-sm font-medium text-white">{event.label}</span>
                    </div>
                    {event.detail && (
                      <p className="mt-1 text-sm leading-5 text-slate-400">{event.detail}</p>
                    )}
                    <time className="mt-0.5 block text-xs text-slate-600">
                      {formatFull(event.time)}
                    </time>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* ── Notes Panel ────────────────────────────────────────── */}
        <section className="flex flex-col gap-4">
          {/* Notes list */}
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Investigation Notes ({notes.length})
            </h3>

            {notes.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No notes yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {notes.map((note) => (
                  <li
                    key={note.id}
                    className="rounded-2xl border border-white/5 bg-white/5 p-4"
                  >
                    <p className="text-sm leading-6 text-slate-200">{note.note}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>Analyst #{note.author_id ?? '—'}</span>
                      <span>·</span>
                      <time>{formatFull(note.created_at)}</time>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Add note form */}
          {canEdit && (
            <form
              onSubmit={handleAddNote}
              className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl"
            >
              <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Add Note
              </h3>

              {noteError && (
                <div className="mt-3 rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs text-rose-300">
                  {noteError}
                </div>
              )}

              <textarea
                id="note-textarea"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={4}
                placeholder="Document your findings, observations, or actions taken…"
                className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/20"
              />

              <button
                id="add-note-btn"
                type="submit"
                disabled={submitting}
                className="mt-3 w-full rounded-xl border border-cyan-400/30 bg-cyan-400/10 py-2.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/20 disabled:opacity-50"
              >
                {submitting ? 'Saving…' : 'Add Note'}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

export default IncidentDetailPage;
