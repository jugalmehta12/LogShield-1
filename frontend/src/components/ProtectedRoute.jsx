import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * Layout-level auth guard for React Router v6.
 *
 * When used as a ``<Route element={<ProtectedRoute />}>`` wrapper it:
 * - Shows a loading spinner while the session is being restored.
 * - Redirects unauthenticated users to ``/login`` (preserving the intended URL).
 * - Optionally enforces a specific role via ``requiredRole``.
 * - When auth is satisfied it renders either its ``children`` prop (when
 *   provided) or a React Router ``<Outlet />`` so nested routes work.
 *
 * @param {{ children?: React.ReactNode, requiredRole?: string }} props
 */
function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <LoadingSpinner label="Restoring session…" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-sm rounded-3xl border border-rose-400/20 bg-slate-900 p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-400/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-rose-400">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-rose-400/70">Access Denied</p>
          <h2 className="mt-2 text-base font-semibold text-white">Insufficient Permissions</h2>
          <p className="mt-2 text-sm text-slate-400">
            This page requires the{' '}
            <span className="text-rose-300">{requiredRole}</span> role. Your role is{' '}
            <span className="text-slate-300">{user.role}</span>.
          </p>
        </div>
      </div>
    );
  }

  // Render children directly (e.g., <MainLayout />) or fall through to <Outlet />
  // for nested routes.
  return children ?? <Outlet />;
}

export default ProtectedRoute;
