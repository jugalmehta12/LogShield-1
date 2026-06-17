import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ROLE_OPTIONS = [
  { value: 'viewer', label: 'Viewer — Read-only access' },
  { value: 'analyst', label: 'Analyst — View & update alerts' },
  { value: 'admin', label: 'Admin — Full access' },
];

function validate(form) {
  const errs = {};
  if (!form.username.trim()) errs.username = 'Username is required.';
  else if (form.username.length < 3) errs.username = 'Username must be at least 3 characters.';
  if (!form.email.trim()) errs.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.';
  if (!form.password) errs.password = 'Password is required.';
  else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
  return errs;
}

function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'viewer',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setServerError('');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      navigate('/login', {
        replace: true,
        state: { registered: true },
      });
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setServerError(
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((d) => d.msg).join(', ')
            : 'Registration failed. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_24%),radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_20%),linear-gradient(180deg,#020617_0%,#050816_48%,#020617_100%)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-violet-400">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="text-xs uppercase tracking-[0.35em] text-violet-300/70">LogShield SIEM</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Create Account</h1>
          <p className="mt-1 text-sm text-slate-400">Register for SOC console access.</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-8 shadow-[0_32px_100px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Server error */}
            {serverError && (
              <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                {serverError}
              </div>
            )}

            {/* Username */}
            <div>
              <label htmlFor="reg-username" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                Username <span className="text-rose-400">*</span>
              </label>
              <input
                id="reg-username"
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={set('username')}
                placeholder="e.g. analyst01"
                className={`w-full rounded-xl border bg-slate-800/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:ring-1 focus:ring-violet-400/50 ${errors.username ? 'border-rose-400/50' : 'border-white/10 focus:border-violet-400/30'}`}
              />
              {errors.username && <p className="mt-1 text-xs text-rose-400">{errors.username}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                Email <span className="text-rose-400">*</span>
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={set('email')}
                placeholder="analyst@logshield.io"
                className={`w-full rounded-xl border bg-slate-800/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:ring-1 focus:ring-violet-400/50 ${errors.email ? 'border-rose-400/50' : 'border-white/10 focus:border-violet-400/30'}`}
              />
              {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                Password <span className="text-rose-400">*</span>
              </label>
              <input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={set('password')}
                placeholder="At least 8 characters"
                className={`w-full rounded-xl border bg-slate-800/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:ring-1 focus:ring-violet-400/50 ${errors.password ? 'border-rose-400/50' : 'border-white/10 focus:border-violet-400/30'}`}
              />
              {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password}</p>}
            </div>

            {/* Role */}
            <div>
              <label htmlFor="reg-role" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                Role
              </label>
              <select
                id="reg-role"
                value={form.role}
                onChange={set('role')}
                className="w-full rounded-xl border border-white/10 bg-slate-800/70 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400/30 focus:ring-1 focus:ring-violet-400/50"
              >
                {ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Role hint */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-xs text-slate-500 leading-5">
              <span className="text-cyan-400">Admin</span> — Full access &nbsp;·&nbsp;
              <span className="text-amber-400">Analyst</span> — View + update &nbsp;·&nbsp;
              <span className="text-slate-400">Viewer</span> — Read-only
            </div>

            {/* Submit */}
            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full rounded-xl border border-violet-400/30 bg-gradient-to-r from-violet-500/20 to-purple-500/20 py-3 text-sm font-medium text-violet-300 transition hover:from-violet-500/30 hover:to-purple-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 transition hover:text-cyan-300">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
