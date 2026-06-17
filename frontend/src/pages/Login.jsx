import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError('Username and password are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(form.username.trim(), form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(
        typeof detail === 'string'
          ? detail
          : 'Login failed. Check your credentials.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_24%),radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_20%),linear-gradient(180deg,#020617_0%,#050816_48%,#020617_100%)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cyan-400">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">LogShield SIEM</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Sign In</h1>
          <p className="mt-1 text-sm text-slate-400">Enter your credentials to access the SOC console.</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-8 shadow-[0_32px_100px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Error */}
            {error && (
              <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            {/* Username */}
            <div>
              <label htmlFor="login-username" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                Username
              </label>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={set('username')}
                placeholder="e.g. analyst01"
                className="w-full rounded-xl border border-white/10 bg-slate-800/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/30 focus:ring-1 focus:ring-cyan-400/50"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={set('password')}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-slate-800/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/30 focus:ring-1 focus:ring-cyan-400/50"
              />
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full rounded-xl border border-cyan-400/30 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 py-3 text-sm font-medium text-cyan-300 transition hover:from-cyan-500/30 hover:to-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Authenticating…' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-cyan-400 transition hover:text-cyan-300">
              Register
            </Link>
          </p>
        </div>

        {/* Bottom hint */}
        <p className="mt-6 text-center text-xs text-slate-600">
          LogShield v1.0 · Security Operations Center
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
