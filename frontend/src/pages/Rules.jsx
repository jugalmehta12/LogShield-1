import { useCallback, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useRules } from '../hooks/useRules';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';

// ── Constants ──────────────────────────────────────────────────────────────

const FIELD_OPTIONS = [
  { value: 'event_type', label: 'Event Type' },
  { value: 'source', label: 'Source' },
  { value: 'severity', label: 'Severity' },
  { value: 'raw_log', label: 'Raw Log' },
];

const OPERATOR_OPTIONS = [
  { value: 'equals', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'startswith', label: 'Starts With' },
  { value: 'endswith', label: 'Ends With' },
];

const SEVERITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const SEVERITY_STYLES = {
  low: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  medium: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  high: 'border-orange-400/20 bg-orange-400/10 text-orange-300',
  critical: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
};

const EMPTY_FORM = {
  name: '',
  description: '',
  field_name: 'event_type',
  operator: 'equals',
  value: '',
  alert_type: '',
  severity: 'medium',
  enabled: true,
};

// ── Validation ─────────────────────────────────────────────────────────────

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Rule name is required.';
  if (!form.value.trim()) errors.value = 'Match value is required.';
  if (!form.alert_type.trim()) errors.alert_type = 'Alert type is required.';
  return errors;
}

// ── Rule Form Modal ────────────────────────────────────────────────────────

function RuleModal({ mode, initial, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) =>
    setForm((prev) => ({
      ...prev,
      [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    onSubmit(form);
  };

  const isEdit = mode === 'edit';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? 'Edit detection rule' : 'Create detection rule'}
    >
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-[0_32px_100px_rgba(0,0,0,0.7)]">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/70">
              {isEdit ? 'Edit Rule' : 'New Rule'}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-white">
              {isEdit ? 'Modify Detection Rule' : 'Create Detection Rule'}
            </h2>
          </div>
          <button
            type="button"
            id="rule-modal-close"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:border-white/20 hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Rule Name */}
          <div>
            <label htmlFor="rule-name" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
              Rule Name <span className="text-rose-400">*</span>
            </label>
            <input
              id="rule-name"
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Brute Force Rule"
              className={`w-full rounded-xl border bg-slate-800/70 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:ring-1 focus:ring-cyan-400/50 ${errors.name ? 'border-rose-400/50' : 'border-white/10 focus:border-cyan-400/30'}`}
            />
            {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="rule-description" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
              Description
            </label>
            <textarea
              id="rule-description"
              value={form.description}
              onChange={set('description')}
              placeholder="Optional — describe what this rule detects"
              rows={2}
              className="w-full resize-none rounded-xl border border-white/10 bg-slate-800/70 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/30 focus:ring-1 focus:ring-cyan-400/50"
            />
          </div>

          {/* Condition row */}
          <div className="grid grid-cols-3 gap-3">
            {/* Field Name */}
            <div>
              <label htmlFor="rule-field" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                Field
              </label>
              <select
                id="rule-field"
                value={form.field_name}
                onChange={set('field_name')}
                className="w-full rounded-xl border border-white/10 bg-slate-800/70 px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-400/30 focus:ring-1 focus:ring-cyan-400/50"
              >
                {FIELD_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Operator */}
            <div>
              <label htmlFor="rule-operator" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                Operator
              </label>
              <select
                id="rule-operator"
                value={form.operator}
                onChange={set('operator')}
                className="w-full rounded-xl border border-white/10 bg-slate-800/70 px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-400/30 focus:ring-1 focus:ring-cyan-400/50"
              >
                {OPERATOR_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Value */}
            <div>
              <label htmlFor="rule-value" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                Value <span className="text-rose-400">*</span>
              </label>
              <input
                id="rule-value"
                type="text"
                value={form.value}
                onChange={set('value')}
                placeholder="e.g. login_failed"
                className={`w-full rounded-xl border bg-slate-800/70 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:ring-1 focus:ring-cyan-400/50 ${errors.value ? 'border-rose-400/50' : 'border-white/10 focus:border-cyan-400/30'}`}
              />
              {errors.value && <p className="mt-1 text-xs text-rose-400">{errors.value}</p>}
            </div>
          </div>

          {/* Alert Type & Severity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="rule-alert-type" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                Alert Type <span className="text-rose-400">*</span>
              </label>
              <input
                id="rule-alert-type"
                type="text"
                value={form.alert_type}
                onChange={set('alert_type')}
                placeholder="e.g. Suspicious Login"
                className={`w-full rounded-xl border bg-slate-800/70 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:ring-1 focus:ring-cyan-400/50 ${errors.alert_type ? 'border-rose-400/50' : 'border-white/10 focus:border-cyan-400/30'}`}
              />
              {errors.alert_type && <p className="mt-1 text-xs text-rose-400">{errors.alert_type}</p>}
            </div>

            <div>
              <label htmlFor="rule-severity" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                Severity
              </label>
              <select
                id="rule-severity"
                value={form.severity}
                onChange={set('severity')}
                className="w-full rounded-xl border border-white/10 bg-slate-800/70 px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-400/30 focus:ring-1 focus:ring-cyan-400/50"
              >
                {SEVERITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Enabled toggle */}
          <label htmlFor="rule-enabled" className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-slate-800/40 px-4 py-3 transition hover:border-white/20">
            <div className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${form.enabled ? 'bg-cyan-500' : 'bg-slate-600'}`}>
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${form.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <input
              id="rule-enabled"
              type="checkbox"
              checked={form.enabled}
              onChange={set('enabled')}
              className="sr-only"
            />
            <span className="text-sm text-slate-300">
              Rule is <span className={form.enabled ? 'text-cyan-400' : 'text-slate-500'}>{form.enabled ? 'enabled' : 'disabled'}</span>
            </span>
          </label>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
            >
              Cancel
            </button>
            <button
              id="rule-submit-btn"
              type="submit"
              disabled={submitting}
              className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-2.5 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Confirm Delete Dialog ──────────────────────────────────────────────────

function ConfirmDeleteModal({ rule, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl border border-rose-400/20 bg-slate-900 p-6 shadow-[0_32px_100px_rgba(0,0,0,0.7)]">
        <p className="text-xs uppercase tracking-[0.3em] text-rose-400/70">Confirm Delete</p>
        <h2 className="mt-2 text-base font-semibold text-white">Delete &quot;{rule.name}&quot;?</h2>
        <p className="mt-2 text-sm text-slate-400">
          This rule will be permanently removed and will no longer fire on incoming logs.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            id="delete-cancel-btn"
            onClick={onCancel}
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-slate-300 transition hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            id="delete-confirm-btn"
            onClick={onConfirm}
            className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-5 py-2.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20"
          >
            Delete Rule
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

function RulesPage() {
  const { can } = useAuth();
  const canManageRules = can('manage_rules');
  const {
    rules,
    loading,
    error,
    message,
    submitting,
    refetch,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    clearMessage,
    clearError,
  } = useRules();

  const [modal, setModal] = useState(null); // null | { mode: 'create' } | { mode: 'edit', rule }
  const [deleteTarget, setDeleteTarget] = useState(null); // rule | null

  useRealtimeUpdates({
    rule_created: () => refetch(),
    rule_updated: () => refetch(),
    rule_deleted: () => refetch(),
  });

  const activeCount = rules.filter((r) => r.enabled).length;

  const openCreate = useCallback(() => {
    clearError();
    clearMessage();
    setModal({ mode: 'create' });
  }, [clearError, clearMessage]);

  const openEdit = useCallback(
    (rule) => {
      clearError();
      clearMessage();
      setModal({ mode: 'edit', rule });
    },
    [clearError, clearMessage],
  );

  const closeModal = useCallback(() => setModal(null), []);

  const handleSubmit = useCallback(
    async (formData) => {
      let ok = false;
      if (modal?.mode === 'create') {
        ok = await createRule(formData);
      } else if (modal?.mode === 'edit') {
        ok = await updateRule(modal.rule.id, formData);
      }
      if (ok) setModal(null);
    },
    [modal, createRule, updateRule],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteTarget) {
      await deleteRule(deleteTarget.id);
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteRule]);

  const handleToggle = useCallback(
    (rule) => toggleRule(rule.id, !rule.enabled),
    [toggleRule],
  );

  const conditionLabel = (rule) =>
    `${rule.field_name} ${rule.operator} "${rule.value}"`;

  return (
    <section className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Detection Engine</p>
          <h1 className="mt-1 text-xl font-semibold text-white">Rule Management</h1>
          <p className="mt-1 text-sm text-slate-400">
            Define custom rules that automatically generate alerts when incoming logs match.
          </p>
        </div>
        {canManageRules && (
          <button
            id="create-rule-btn"
            type="button"
            onClick={openCreate}
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-2.5 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Rule
          </button>
        )}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Rules', value: rules.length, color: 'text-white' },
          { label: 'Active Rules', value: activeCount, color: 'text-cyan-400' },
          { label: 'Disabled Rules', value: rules.length - activeCount, color: 'text-slate-400' },
          { label: 'WebSocket', value: 'Live', color: 'text-emerald-400' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 backdrop-blur"
          >
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{stat.label}</p>
            <p className={`mt-2 text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Feedback banners */}
      {loading && <LoadingSpinner label="Loading rules" />}

      {error && (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {message}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && rules.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-10 text-center backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <p className="text-sm text-slate-400">No detection rules yet.</p>
          <p className="mt-1 text-xs text-slate-600">Click &quot;New Rule&quot; to create your first rule.</p>
        </div>
      )}

      {/* Rules table */}
      {!loading && rules.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left">
                <th className="px-5 py-3.5 text-xs font-medium uppercase tracking-[0.25em] text-slate-500">Name</th>
                <th className="hidden px-5 py-3.5 text-xs font-medium uppercase tracking-[0.25em] text-slate-500 lg:table-cell">Condition</th>
                <th className="hidden px-5 py-3.5 text-xs font-medium uppercase tracking-[0.25em] text-slate-500 sm:table-cell">Alert Type</th>
                <th className="px-5 py-3.5 text-xs font-medium uppercase tracking-[0.25em] text-slate-500">Severity</th>
                <th className="px-5 py-3.5 text-xs font-medium uppercase tracking-[0.25em] text-slate-500">Enabled</th>
                <th className="px-5 py-3.5 text-xs font-medium uppercase tracking-[0.25em] text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rules.map((rule) => {
                const sevKey = String(rule.severity || 'low').toLowerCase();
                return (
                  <tr
                    key={rule.id}
                    className="transition-colors hover:bg-white/[0.02]"
                  >
                    {/* Name + description */}
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{rule.name}</p>
                      {rule.description && (
                        <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">{rule.description}</p>
                      )}
                    </td>

                    {/* Condition */}
                    <td className="hidden px-5 py-4 lg:table-cell">
                      <code className="rounded-lg border border-white/5 bg-white/5 px-2 py-1 text-xs text-slate-300 font-mono">
                        {conditionLabel(rule)}
                      </code>
                    </td>

                    {/* Alert Type */}
                    <td className="hidden px-5 py-4 text-slate-300 sm:table-cell">
                      {rule.alert_type}
                    </td>

                    {/* Severity */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs uppercase tracking-[0.2em] ${SEVERITY_STYLES[sevKey] || SEVERITY_STYLES.low}`}>
                        {rule.severity}
                      </span>
                    </td>

                    {/* Toggle — admin only */}
                    <td className="px-5 py-4">
                      {canManageRules ? (
                        <button
                          type="button"
                          id={`toggle-rule-${rule.id}`}
                          onClick={() => handleToggle(rule)}
                          className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${rule.enabled ? 'bg-cyan-500' : 'bg-slate-600'}`}
                          aria-label={rule.enabled ? 'Disable rule' : 'Enable rule'}
                        >
                          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${rule.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      ) : (
                        <span className={`inline-block h-5 w-9 rounded-full ${rule.enabled ? 'bg-cyan-500/40' : 'bg-slate-700'}`} />
                      )}
                    </td>

                    {/* Actions — admin only */}
                    <td className="px-5 py-4">
                      {canManageRules ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            id={`edit-rule-${rule.id}`}
                            onClick={() => openEdit(rule)}
                            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-300"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            id={`delete-rule-${rule.id}`}
                            onClick={() => setDeleteTarget(rule)}
                            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:border-rose-400/30 hover:text-rose-300"
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600">Read-only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {modal && (
        <RuleModal
          mode={modal.mode}
          initial={modal.rule}
          onClose={closeModal}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          rule={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </section>
  );
}

export default RulesPage;
