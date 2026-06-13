function SettingsPage() {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Settings</p>
      <h3 className="mt-2 text-lg font-semibold text-white">Application configuration</h3>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <label className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <span className="text-sm text-slate-400">Theme</span>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-base font-medium text-white">Dark Cybersecurity</span>
            <button
              type="button"
              className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-200"
            >
              Toggle
            </button>
          </div>
        </label>

        <label className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <span className="text-sm text-slate-400">Backend URL</span>
          <input
            type="text"
            value="http://localhost:8000"
            readOnly
            className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none"
          />
        </label>
      </div>
    </section>
  );
}

export default SettingsPage;
