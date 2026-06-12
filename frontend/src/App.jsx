import { useMemo, useState } from 'react';
import AppShell from './layouts/AppShell';
import DashboardPage from './pages/Dashboard';
import LogsPage from './pages/Logs';
import AlertsPage from './pages/Alerts';
import SettingsPage from './pages/Settings';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'logs', label: 'Logs' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'settings', label: 'Settings' },
];

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const page = useMemo(() => {
    switch (activePage) {
      case 'logs':
        return <LogsPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  }, [activePage]);

  return (
    <AppShell navItems={NAV_ITEMS} activePage={activePage} onNavigate={setActivePage}>
      {page}
    </AppShell>
  );
}

export default App;
