import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../services/api';

const POLL_INTERVAL_MS = 15_000;

function normalizeLogs(items) {
  return Array.isArray(items) ? items : [];
}

export function useLogs() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const cancelledRef = useRef(false);

  const fetchLogs = useCallback(async (params = {}) => {
    if (cancelledRef.current) return;
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/logs', { params });
      if (!cancelledRef.current) {
        setLogs(normalizeLogs(response.data.items));
      }
    } catch {
      if (!cancelledRef.current) {
        setError('Unable to load logs. Check that the backend is running on http://127.0.0.1:8000.');
      }
    } finally {
      if (!cancelledRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    cancelledRef.current = false;
    fetchLogs();

    const id = setInterval(() => {
      if (!cancelledRef.current) fetchLogs();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelledRef.current = true;
      clearInterval(id);
    };
  }, [fetchLogs]);

  return { logs, loading, error, refetch: fetchLogs };
}
