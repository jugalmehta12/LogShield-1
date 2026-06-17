import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const TOKEN_KEY = 'logshield_token';
const USER_KEY = 'logshield_user';

/**
 * AuthContext shape:
 * {
 *   user: { id, username, email, role, is_active, created_at } | null,
 *   token: string | null,
 *   loading: boolean,   // true while restoring session on mount
 *   login(username, password): Promise<void>,
 *   logout(): void,
 *   isAdmin: boolean,
 *   isAnalyst: boolean,
 *   isViewer: boolean,
 *   can(action): boolean,  // action-based permission helper
 * }
 */
const AuthContext = createContext(null);

/**
 * Permission matrix — maps abstract actions to allowed roles.
 *
 * @type {Record<string, string[]>}
 */
const PERMISSIONS = {
  manage_rules: ['admin'],
  manage_users: ['admin'],
  delete_alerts: ['admin'],
  create_logs: ['admin', 'analyst'],
  update_alerts: ['admin', 'analyst'],
  view_rules: ['admin', 'analyst', 'viewer'],
  view_logs: ['admin', 'analyst', 'viewer'],
  view_alerts: ['admin', 'analyst', 'viewer'],
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  // ── Re-validate stored token on mount ─────────────────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then(({ data }) => {
        setUser(data);
        localStorage.setItem(USER_KEY, JSON.stringify(data));
      })
      .catch(() => {
        // Token expired or revoked — clear session
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const { data: tokenData } = await api.post('/auth/login', { username, password });
    const { access_token } = tokenData;

    localStorage.setItem(TOKEN_KEY, access_token);
    setToken(access_token);

    // Fetch full user profile
    const { data: userData } = await api.get('/auth/me');
    setUser(userData);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  /**
   * Check whether the current user has permission for a given action.
   *
   * @param {string} action - Key from the PERMISSIONS map.
   * @returns {boolean}
   */
  const can = useCallback(
    (action) => {
      if (!user) return false;
      const allowed = PERMISSIONS[action] ?? [];
      return allowed.includes(user.role);
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      can,
      isAdmin: user?.role === 'admin',
      isAnalyst: user?.role === 'analyst',
      isViewer: user?.role === 'viewer',
    }),
    [user, token, loading, login, logout, can],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Consume the authentication context.
 *
 * @returns {ReturnType<typeof useMemo>} The AuthContext value.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
