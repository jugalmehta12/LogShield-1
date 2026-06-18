import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../services/api';

const POLL_INTERVAL_MS = 15_000;

function normalizeAlerts(items) {
  return Array.isArray(items) ? items : [];
}

export function useAlerts() {
  const [alerts,          setAlerts]          = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [updatingAlertId, setUpdatingAlertId] = useState(null);
  const [error,           setError]           = useState('');
  const [message,         setMessage]         = useState('');

  const cancelledRef = useRef(false);

  const fetchAlerts = useCallback(async () => {
    if (cancelledRef.current) return;
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/alerts');
      if (!cancelledRef.current) {
        setAlerts(normalizeAlerts(response.data.items));
      }
    } catch {
      if (!cancelledRef.current) {
        setError('Unable to load alerts. Check that the backend is running on http://127.0.0.1:8000.');
      }
    } finally {
      if (!cancelledRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const updateAlertStatus = useCallback(async (alertId, status) => {
    setUpdatingAlertId(alertId);
    setError('');
    setMessage('');

    // Optimistic update
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, status } : alert,
      ),
    );

    try {
      await api.patch(`/alerts/${alertId}`, { status });
      if (!cancelledRef.current) {
        setMessage(`Alert ${alertId} updated to ${status}.`);
        await fetchAlerts();
      }
    } catch {
      // roll back
      if (!cancelledRef.current) {
        await fetchAlerts();
        setError('Unable to update alert status. Please try again.');
      }
    } finally {
      if (!cancelledRef.current) {
        setUpdatingAlertId(null);
      }
    }
  }, [fetchAlerts]);

  useEffect(() => {
    cancelledRef.current = false;
    fetchAlerts();

    const id = setInterval(() => {
      if (!cancelledRef.current) fetchAlerts();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelledRef.current = true;
      clearInterval(id);
    };
  }, [fetchAlerts]);

  return { alerts, loading, error, message, updatingAlertId, refetch: fetchAlerts, updateAlertStatus };
}
