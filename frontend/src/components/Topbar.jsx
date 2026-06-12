import StatusBadge from './StatusBadge';

function Topbar({ title, subtitle }) {
  return (
    <header className="flex flex-col gap-4 border-b border-white/10 bg-slate-950/45 px-6 py-5 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">LogShield Phase 1</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge tone="online">Backend connected</StatusBadge>
        <StatusBadge tone="neutral">PostgreSQL ready</StatusBadge>
      </div>
    </header>
  );
}

export default Topbar;
