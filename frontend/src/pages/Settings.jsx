function SettingsPage() {
  const settings = [
    ['Backend API', 'http://localhost:8000'],
    ['Frontend Dev Server', 'http://localhost:5173'],
    ['Database', 'PostgreSQL'],
    ['Deployment State', 'Foundation only'],
  ];

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-glow backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Settings</p>
      <h3 className="mt-2 text-lg font-semibold text-white">Application configuration</h3>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {settings.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-2 text-base font-medium text-white">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SettingsPage;
