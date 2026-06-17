import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

function normalizeRules(items) {
  return Array.isArray(items) ? items : [];
}

/**
 * Hook for managing detection rules.
 *
 * Exposes the full rules list along with helpers for creating, updating,
 * deleting, and toggling rules. All mutations broadcast WebSocket events
 * which will be handled via useRealtimeUpdates in the Rules page.
 */
export function useRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/rules');
      setRules(normalizeRules(response.data.items));
    } catch {
      setRules([]);
      setError('Unable to load rules. Check that the backend is running on http://127.0.0.1:8000.');
    } finally {
      setLoading(false);
    }
  }, []);

  const createRule = useCallback(async (payload) => {
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      await api.post('/rules', payload);
      setMessage('Rule created successfully.');
      await fetchRules();
      return true;
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((d) => d.msg).join(', ')
            : 'Failed to create rule.',
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [fetchRules]);

  const updateRule = useCallback(async (ruleId, payload) => {
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      await api.put(`/rules/${ruleId}`, payload);
      setMessage('Rule updated successfully.');
      await fetchRules();
      return true;
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((d) => d.msg).join(', ')
            : 'Failed to update rule.',
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [fetchRules]);

  const deleteRule = useCallback(async (ruleId) => {
    setError('');
    setMessage('');
    try {
      await api.delete(`/rules/${ruleId}`);
      setMessage('Rule deleted.');
      await fetchRules();
    } catch {
      setError('Failed to delete rule.');
    }
  }, [fetchRules]);

  const toggleRule = useCallback(async (ruleId, enabled) => {
    // Optimistic update
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled } : r)),
    );
    try {
      await api.patch(`/rules/${ruleId}/toggle`, { enabled });
    } catch {
      setError('Failed to toggle rule. Refreshing...');
      await fetchRules();
    }
  }, [fetchRules]);

  const clearMessage = useCallback(() => setMessage(''), []);
  const clearError = useCallback(() => setError(''), []);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!mounted) return;
      await fetchRules();
    };
    run();
    return () => { mounted = false; };
  }, [fetchRules]);

  return {
    rules,
    loading,
    error,
    message,
    submitting,
    refetch: fetchRules,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    clearMessage,
    clearError,
  };
}
