import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import AlertsPage from './pages/Alerts';
import DashboardPage from './pages/Dashboard';
import LoginPage from './pages/Login';
import LogsPage from './pages/Logs';
import RegisterPage from './pages/Register';
import RulesPage from './pages/Rules';
import SettingsPage from './pages/Settings';

/**
 * Root application router.
 *
 * Layout:
 *   /login           → LoginPage      (public)
 *   /register        → RegisterPage   (public)
 *   /*               → MainLayout     (protected — redirects to /login if not authenticated)
 *     /dashboard, /logs, /alerts, /rules, /settings
 *
 * ``AuthProvider`` wraps everything so ``useAuth`` is available to all
 * descendants including MainLayout, Navbar, and page components.
 */
function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ── Public routes ──────────────────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Protected app shell ───────────────────────────────── */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<Navigate replace to="/dashboard" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate replace to="/dashboard" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
