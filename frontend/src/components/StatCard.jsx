function StatCard({
  label,
  value,
  detail,
  accent = 'from-cyan-400 to-teal-400',
}) {
  return (
    <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />

      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
        {label}
      </p>

      <p className="mt-4 text-4xl font-semibold text-white">
        {value}
      </p>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        {detail}
      </p>
    </article>
  );
}

export default StatCard;