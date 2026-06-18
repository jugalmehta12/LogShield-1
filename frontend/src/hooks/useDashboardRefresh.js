/**
 * useDashboardRefresh — Central 15-second polling orchestrator for Dashboard.
 *
 * Responsibilities:
 *   - Fire all four data-fetchers in parallel every INTERVAL_MS
 *   - Track isFirstLoad (true until first successful fetch)
 *   - Track connectionState: 'live' | 'refreshing' | 'error'
 *   - Track lastUpdated: Date | null
 *   - Clean up interval + mark-cancelled on unmount
 *
 * Usage:
 *   const { lastUpdated, connectionState, isFirstLoad } =
 *     useDashboardRefresh({ refetchLogs, refetchAlerts, refetchRules, refetchIncidents });
 */
import { useCallback, useEffect, useRef, useState } from 'react';

const INTERVAL_MS = 15_000;

/**
 * @param {{
 *   refetchLogs:      () => Promise<void>,
 *   refetchAlerts:    () => Promise<void>,
 *   refetchRules:     () => Promise<void>,
 *   refetchIncidents: () => Promise<void>,
 *   intervalMs?:      number,
 * }} options
 *
 * @returns {{
 *   lastUpdated:     Date | null,
 *   connectionState: 'live' | 'refreshing' | 'error',
 *   isFirstLoad:     boolean,
 *   triggerRefresh:  () => void,
 * }}
 */
export function useDashboardRefresh({
  refetchLogs,
  refetchAlerts,
  refetchRules,
  refetchIncidents,
  intervalMs = INTERVAL_MS,
}) {
  const [lastUpdated,     setLastUpdated]     = useState(/** @type {Date|null} */ (null));
  const [connectionState, setConnectionState] = useState(/** @type {'live'|'refreshing'|'error'} */ ('refreshing'));
  const [isFirstLoad,     setIsFirstLoad]     = useState(true);

  const cancelledRef = useRef(false);

  const refresh = useCallback(async () => {
    if (cancelledRef.current) return;
    setConnectionState('refreshing');

    try {
      await Promise.all([
        refetchLogs(),
        refetchAlerts(),
        refetchRules(),
        refetchIncidents(),
      ]);

      if (!cancelledRef.current) {
        setLastUpdated(new Date());
        setConnectionState('live');
        setIsFirstLoad(false);
      }
    } catch {
      if (!cancelledRef.current) {
        setConnectionState('error');
        // keep isFirstLoad false once we've ever loaded
      }
    }
  }, [refetchLogs, refetchAlerts, refetchRules, refetchIncidents]);

  useEffect(() => {
    cancelledRef.current = false;

    // immediate first fetch
    refresh();

    const id = setInterval(() => {
      if (!cancelledRef.current) refresh();
    }, intervalMs);

    return () => {
      cancelledRef.current = true;
      clearInterval(id);
    };
  }, [refresh, intervalMs]);

  return { lastUpdated, connectionState, isFirstLoad, triggerRefresh: refresh };
}
