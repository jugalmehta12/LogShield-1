import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/logs', label: 'Logs' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/live-analytics', label: 'Live Analytics' },
  { to: '/incidents', label: 'Incidents' },
  { to: '/rules', label: 'Rules' },
  { to: '/settings', label: 'Settings' },
];

function Sidebar() {
  return (
    <aside className="flex h-full flex-col border-r border-cyan-400/10 bg-slate-950/80 px-4 py-6 backdrop-blur-xl">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">
          LogShield
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-white">
          SOC Console
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Dark cybersecurity workspace for log visibility, alert review, and
          operational readiness.
        </p>
      </div>

      <nav className="mt-8 space-y-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                'flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition',
                isActive
                  ? 'border-cyan-400/30 bg-cyan-400/10 text-white'
                  : 'border-white/5 text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white',
              ].join(' ')
            }
          >
            <span>{item.label}</span>
            <span className="text-xs uppercase tracking-[0.28em] text-slate-500">
              nav
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-3xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-400">
        Detection logic is intentionally not enabled in the frontend skeleton.
      </div>
    </aside>
  );
}

export default Sidebar;