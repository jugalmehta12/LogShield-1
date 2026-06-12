function Sidebar({ navItems, activePage, onNavigate }) {
  return (
    <aside className="flex h-full flex-col border-r border-white/10 bg-slate-950/70 p-5 backdrop-blur-xl">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-teal-300/70">LogShield</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Security Command Center</h1>
        <p className="mt-2 text-sm text-slate-400">Desktop SIEM foundation for log intake, visualization, and future threat detection.</p>
      </div>
      <nav className="mt-8 space-y-2">
        {navItems.map((item) => {
          const isActive = item.id === activePage;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                isActive
                  ? 'border-teal-400/30 bg-teal-400/10 text-white'
                  : 'border-white/5 bg-white/0 text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="font-medium">{item.label}</span>
              <span className="text-xs uppercase tracking-[0.25em] text-slate-500">{String(item.id).padStart(2, '0')}</span>
            </button>
          );
        })}
      </nav>
      <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
        <p className="font-medium text-white">Foundation mode</p>
        <p className="mt-2 text-slate-400">Detection and automated response modules are intentionally not enabled in Phase 1.</p>
      </div>
    </aside>
  );
}

export default Sidebar;
