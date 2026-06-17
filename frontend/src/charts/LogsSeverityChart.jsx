import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const SEVERITY_DATA_TEMPLATE = [
  { name: 'Low',      key: 'low',      fill: '#22c55e' },
  { name: 'Medium',   key: 'medium',   fill: '#eab308' },
  { name: 'High',     key: 'high',     fill: '#f97316' },
  { name: 'Critical', key: 'critical', fill: '#ef4444' },
];

function LogsSeverityChart({ logs }) {
  const counts = logs.reduce(
    (acc, log) => {
      const sev = String(log.severity || 'unknown').toLowerCase();
      acc[sev] = (acc[sev] || 0) + 1;
      return acc;
    },
    { low: 0, medium: 0, high: 0, critical: 0 },
  );

  const data = SEVERITY_DATA_TEMPLATE.map((d) => ({ ...d, value: counts[d.key] ?? 0 }));

  return (
    <div
      style={{
        borderRadius:   '14px',
        border:         '1px solid rgba(255,255,255,0.07)',
        background:     'linear-gradient(180deg,rgba(8,12,24,0.92),rgba(3,6,15,0.92))',
        backdropFilter: 'blur(14px)',
        padding:        '14px 16px 12px',
        boxShadow:      '0 4px 20px rgba(0,0,0,0.35)',
      }}
    >
      {/* header */}
      <div style={{ marginBottom: '10px' }}>
        <p
          style={{
            margin:        0,
            fontSize:      '10px',
            fontWeight:    600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color:         '#475569',
          }}
        >
          Charts
        </p>
        <h3
          style={{
            margin:     '2px 0 0',
            fontSize:   '13px',
            fontWeight: 600,
            color:      '#f1f5f9',
          }}
        >
          Logs by Severity
        </h3>
      </div>

      {/* chart */}
      <div style={{ height: '220px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#475569"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#475569"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={24}
            />
            <Tooltip
              contentStyle={{
                background:   'rgba(8,12,30,0.97)',
                border:       '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color:        '#f1f5f9',
                fontSize:     '12px',
                boxShadow:    '0 8px 32px rgba(0,0,0,0.5)',
              }}
            />
            <Bar dataKey="value" radius={[5, 5, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default LogsSeverityChart;
