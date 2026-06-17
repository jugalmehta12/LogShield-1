import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

/** @type {Record<string, string>} */
const SEVERITY_COLORS = {
  critical: '#f43f5e',
  high:     '#f97316',
  medium:   '#facc15',
  low:      '#22d3ee',
  info:     '#818cf8',
};

const FALLBACK_PALETTE = [
  '#22d3ee', '#818cf8', '#f43f5e', '#34d399',
  '#facc15', '#f97316', '#a78bfa', '#60a5fa',
];

/** @param {string} name */
function resolveColor(name) {
  return (
    SEVERITY_COLORS[String(name).toLowerCase()] ??
    FALLBACK_PALETTE[Math.abs(name.charCodeAt(0)) % FALLBACK_PALETTE.length]
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value, payload: item } = payload[0];
  return (
    <div
      style={{
        background: 'rgba(8,12,30,0.97)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        padding: '8px 12px',
        fontSize: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      <p style={{ color: '#94a3b8', textTransform: 'capitalize', margin: '0 0 2px' }}>
        {name ?? item?.severity}
      </p>
      <p style={{ color: '#f8fafc', fontWeight: 600, margin: 0 }}>
        {Number(value).toLocaleString()} events
      </p>
    </div>
  );
};

const CustomLegend = ({ payload }) => (
  <div
    style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '10px',
      marginTop: '8px',
    }}
  >
    {payload?.map((entry) => (
      <div key={entry.value} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span
          style={{
            display: 'inline-block',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: entry.color,
          }}
        />
        <span style={{ fontSize: '11px', textTransform: 'capitalize', color: '#94a3b8' }}>
          {entry.value}
        </span>
      </div>
    ))}
  </div>
);

/**
 * SeverityPieChart — compact donut chart for threat analytics panel.
 *
 * @param {{
 *   data: { severity: string; count: number }[],
 *   loading?: boolean,
 * }} props
 */
function SeverityPieChart({ data, loading = false }) {
  const emptyStyle = {
    display: 'flex',
    height: '220px',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    color: '#334155',
  };

  if (loading) {
    return (
      <div style={emptyStyle}>
        <span
          style={{
            width: '20px',
            height: '20px',
            border: '2px solid rgba(34,211,238,0.2)',
            borderTopColor: '#22d3ee',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            display: 'inline-block',
          }}
        />
      </div>
    );
  }

  if (!data.length) {
    return <div style={emptyStyle}>No severity data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="severity"
          cx="50%"
          cy="48%"
          innerRadius={58}
          outerRadius={88}
          paddingAngle={3}
          strokeWidth={0}
        >
          {data.map((entry) => (
            <Cell
              key={entry.severity}
              fill={resolveColor(entry.severity)}
              opacity={0.92}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default SeverityPieChart;
