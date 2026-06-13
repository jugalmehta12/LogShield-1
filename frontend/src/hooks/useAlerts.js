import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

function normalizeAlerts(items) {
  return Array.isArray(items) ? items : [];
}

export function useAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return { alerts, loading, error, refetch: fetchAlerts };
}
