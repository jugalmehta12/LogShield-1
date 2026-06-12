function StatCard({ label, value, detail, accent = 'from-teal-400 to-cyan-500' }) {
  return (
    <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-glow backdrop-blur-xl">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
      <p className="text-sm uppercase tracking-[0.28em] text-slate-400">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-4xl font-semibold text-white">{value}</p>
          <p className="mt-2 text-sm text-slate-400">{detail}</p>
        </div>
      </div>
    </article>
  );
}

export default StatCard;
