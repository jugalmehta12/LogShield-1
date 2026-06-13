import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AlertsPage from './pages/Alerts';
import DashboardPage from './pages/Dashboard';
import LogsPage from './pages/Logs';
import SettingsPage from './pages/Settings';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate replace to="/dashboard" />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
