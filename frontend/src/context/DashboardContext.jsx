/**
 * DashboardContext — shared context so Dashboard can publish
 * lastUpdated / connectionState to the Navbar without prop drilling
 * through MainLayout.
 */
import { createContext, useCallback, useContext, useState } from 'react';

const DashboardCtx = createContext({
  lastUpdated:        null,
  setLastUpdated:     () => {},
});

export function DashboardProvider({ children }) {
  const [lastUpdated, setLastUpdatedRaw] = useState(null);

  const setLastUpdated = useCallback((date) => {
    setLastUpdatedRaw(date);
  }, []);

  return (
    <DashboardCtx.Provider value={{ lastUpdated, setLastUpdated }}>
      {children}
    </DashboardCtx.Provider>
  );
}

/** @returns {{ lastUpdated: Date | null, setLastUpdated: (d: Date) => void }} */
export function useDashboardContext() {
  return useContext(DashboardCtx);
}
