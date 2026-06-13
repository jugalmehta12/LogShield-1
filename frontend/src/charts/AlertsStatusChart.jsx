import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from 'recharts';

const STATUS_COLORS = {
  open: '#ef4444',
  investigating: '#eab308',
  resolved: '#22c55e',
};

function AlertsStatusChart({ alerts }) {
  const counts = alerts.reduce(
    (accumulator, alert) => {
      const status = String(alert.status || 'unknown').toLowerCase();
      accumulator[status] = (accumulator[status] || 0) + 1;
      return accumulator;
    },
    { open: 0, investigating: 0, resolved: 0 },
  );

  const data = [
    { name: 'Open', value: counts.open, color: STATUS_COLORS.open },
    { name: 'Investigating', value: counts.investigating, color: STATUS_COLORS.investigating },
    { name: 'Resolved', value: counts.resolved, color: STATUS_COLORS.resolved },
  ].filter((item) => item.value > 0);

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Charts</p>
      <h3 className="mt-2 text-lg font-semibold text-white">Alerts by Status</h3>
      <div className="mt-5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                background: '#020617',
                border: '1px solid rgba(148,163,184,0.2)',
                borderRadius: 16,
                color: '#e2e8f0',
              }}
            />
            <Legend />
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} innerRadius={48} paddingAngle={3}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AlertsStatusChart;
