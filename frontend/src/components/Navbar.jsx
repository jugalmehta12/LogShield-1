import { useLocation } from 'react-router-dom';

const TITLES = {
  '/dashboard': ['Dashboard', 'Operational overview for the LogShield workstation.'],
  '/logs': ['Logs', 'Structured log review and table-first analysis view.'],
  '/alerts': ['Alerts', 'Alert cards for SOC-style triage flow.'],
  '/settings': ['Settings', 'Application configuration and environment controls.'],
};

function Navbar() {
  const { pathname } = useLocation();
  const [title, subtitle] = TITLES[pathname] ?? TITLES['/dashboard'];

  return (
    <header className="flex flex-col gap-4 border-b border-white/10 bg-slate-950/50 px-6 py-5 backdrop-blur-xl">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">LogShield Frontend</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      </div>
    </header>
  );
}

export default Navbar;