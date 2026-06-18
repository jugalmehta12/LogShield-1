import { useCallback, useEffect, useRef, useState } from 'react';
import apiClient from '../services/api';

const REFRESH_INTERVAL_MS = 15_000;

/**
 * @typedef {Object} AnalyticsSummary
 * @property {number} total_logs
 * @property {number} total_alerts
 * @property {number} open_alerts
 * @property {number} critical_logs
 */

/**
 * @typedef {Object} SeverityStats
 * @property {string} severity
 * @property {number} count
 */

/**
 * @typedef {Object} SourceStats
 * @property {string} source
 * @property {number} count
 */

/**
 * @typedef {Object} AlertTimeline
 * @property {string} date
 * @property {number} count
 */

/**
 * Fetches all analytics data and auto-refreshes every 30 s.
 *
 * @returns {{
 *   summary: AnalyticsSummary | null,
 *   severity: SeverityStats[],
 *   topSources: SourceStats[],
 *   alertsOverTime: AlertTimeline[],
 *   loading: boolean,
 *   error: string | null,
 *   refetch: () => void,
 *   lastRefreshed: Date | null,
 * }}
 */
export function useAnalytics() {
  const [summary, setSummary] = useState(/** @type {AnalyticsSummary | null} */ (null));
  const [severity, setSeverity] = useState(/** @type {SeverityStats[]} */ ([]));
  const [topSources, setTopSources] = useState(/** @type {SourceStats[]} */ ([]));
  const [alertsOverTime, setAlertsOverTime] = useState(/** @type {AlertTimeline[]} */ ([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [lastRefreshed, setLastRefreshed] = useState(/** @type {Date | null} */ (null));

  const cancelledRef = useRef(false);

  const isFirstFetch = useRef(true);

  const fetchAll = useCallback(async () => {
    if (isFirstFetch.current) setLoading(true);
    setError(null);

    try {
      const [summaryRes, severityRes, sourcesRes, timelineRes] = await Promise.all([
        apiClient.get('/analytics/summary'),
        apiClient.get('/analytics/severity'),
        apiClient.get('/analytics/top-sources'),
        apiClient.get('/analytics/alerts-over-time'),
      ]);

      if (!cancelledRef.current) {
        setSummary(summaryRes.data);
        setSeverity(Array.isArray(severityRes.data) ? severityRes.data : []);
        setTopSources(Array.isArray(sourcesRes.data) ? sourcesRes.data : []);
        setAlertsOverTime(Array.isArray(timelineRes.data) ? timelineRes.data : []);
        setLastRefreshed(new Date());
        isFirstFetch.current = false;
      }
    } catch (err) {
      if (!cancelledRef.current) {
        const detail =
          err?.response?.data?.detail ??
          err?.message ??
          'Failed to load analytics data.';
        setError(String(detail));
      }
    } finally {
      if (!cancelledRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    cancelledRef.current = false;

    fetchAll();

    const interval = setInterval(fetchAll, REFRESH_INTERVAL_MS);

    return () => {
      cancelledRef.current = true;
      clearInterval(interval);
    };
  }, [fetchAll]);

  return {
    summary,
    severity,
    topSources,
    alertsOverTime,
    loading,
    error,
    refetch: fetchAll,
    lastRefreshed,
  };
}
