import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function LogsSeverityChart({ logs }) {
  const counts = logs.reduce(
    (accumulator, log) => {
      const severity = String(log.severity || 'unknown').toLowerCase();
      accumulator[severity] = (accumulator[severity] || 0) + 1;
      return accumulator;
    },
    { low: 0, medium: 0, high: 0, critical: 0 },
  );

  const data = [
    { name: 'Low', value: counts.low, fill: '#22c55e' },
    { name: 'Medium', value: counts.medium, fill: '#eab308' },
    { name: 'High', value: counts.high, fill: '#f97316' },
    { name: 'Critical', value: counts.critical, fill: '#ef4444' },
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Charts</p>
      <h3 className="mt-2 text-lg font-semibold text-white">Logs by Severity</h3>
      <div className="mt-5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: '#020617',
                border: '1px solid rgba(148,163,184,0.2)',
                borderRadius: 16,
                color: '#e2e8f0',
              }}
            />
            <Bar dataKey="value" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default LogsSeverityChart;
