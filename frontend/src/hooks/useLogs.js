import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

function normalizeLogs(items) {
  return Array.isArray(items) ? items : [];
}

export function useLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/logs');
      setLogs(normalizeLogs(response.data.items));
    } catch (requestError) {
      setLogs([]);
      setError('Unable to load logs. Check that the backend is running on http://127.0.0.1:8000.');
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
      await fetchLogs();
    };

    run();

    return () => {
      mounted = false;
    };
  }, [fetchLogs]);

  return { logs, loading, error, refetch: fetchLogs };
}
