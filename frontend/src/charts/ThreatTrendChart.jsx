import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
  { name: 'Mon', logs: 140 },
  { name: 'Tue', logs: 176 },
  { name: 'Wed', logs: 149 },
  { name: 'Thu', logs: 210 },
  { name: 'Fri', logs: 188 },
  { name: 'Sat', logs: 244 },
  { name: 'Sun', logs: 221 },
];

function ThreatTrendChart() {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-glow backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Telemetry</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Log volume trend</h3>
        </div>
        <span className="rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-xs text-teal-200">Placeholder analytics</span>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="logTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: '#020617',
                border: '1px solid rgba(148,163,184,0.2)',
                borderRadius: 16,
                color: '#e2e8f0',
              }}
            />
            <Area type="monotone" dataKey="logs" stroke="#2dd4bf" fill="url(#logTrend)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ThreatTrendChart;
