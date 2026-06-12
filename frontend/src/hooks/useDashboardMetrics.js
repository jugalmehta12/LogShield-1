import { useEffect, useState } from 'react';
import { getAlerts, getLogs } from '../services/api';

const initialState = {
  logs: [],
  alerts: [],
  loading: true,
  error: null,
};

export function useDashboardMetrics() {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [logs, alerts] = await Promise.all([getLogs(), getAlerts()]);
        if (!mounted) {
          return;
        }
        setState({ logs, alerts, loading: false, error: null });
      } catch (error) {
        if (!mounted) {
          return;
        }
        setState({ logs: [], alerts: [], loading: false, error: error });
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}
