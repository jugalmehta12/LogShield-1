import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

function normalizeAlerts(items) {
  return Array.isArray(items) ? items : [];
}

export function useAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingAlertId, setUpdatingAlertId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/alerts');
      setAlerts(normalizeAlerts(response.data.items));
    } catch (requestError) {
      setAlerts([]);
      setError('Unable to load alerts. Check that the backend is running on http://127.0.0.1:8000.');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAlertStatus = useCallback(async (alertId, status) => {
    setUpdatingAlertId(alertId);
    setError('');
    setMessage('');

    const previousAlerts = alerts;
    const nextAlerts = previousAlerts.map((alert) =>
      alert.id === alertId ? { ...alert, status } : alert,
    );

    setAlerts(nextAlerts);

    try {
      await api.patch(`/alerts/${alertId}`, { status });
      setMessage(`Alert ${alertId} updated to ${status}.`);
      await fetchAlerts();
    } catch (requestError) {
      setAlerts(previousAlerts);
      setError('Unable to update alert status. Please try again.');
    } finally {
      setUpdatingAlertId(null);
    }
  }, [alerts, fetchAlerts]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!mounted) {
        return;
      }
      await fetchAlerts();
    };

    run();

    return () => {
      mounted = false;
    };
  }, [fetchAlerts]);

  return { alerts, loading, error, message, updatingAlertId, refetch: fetchAlerts, updateAlertStatus };
}
