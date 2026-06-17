import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const SOURCE_COLORS = [
  '#22d3ee', '#818cf8', '#f43f5e',
  '#34d399', '#facc15', '#f97316',
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
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
      <p style={{ color: '#94a3b8', margin: '0 0 2px' }}>{label}</p>
      <p style={{ color: '#f8fafc', fontWeight: 600, margin: 0 }}>
        {Number(payload[0].value).toLocaleString()} events
      </p>
    </div>
  );
};

/**
 * TopSourcesBarChart — compact horizontal bar chart.
 *
 * @param {{
 *   data: { source: string; count: number }[],
 *   loading?: boolean,
 * }} props
 */
function TopSourcesBarChart({ data, loading = false }) {
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
    return <div style={emptyStyle}>No source data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 12, bottom: 0, left: 0 }}
        barCategoryGap="30%"
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.04)"
          horizontal={false}
        />
        <XAxis
          type="number"
          tick={{ fill: '#475569', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="source"
          width={82}
          tick={{ fill: '#94a3b8', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: 'rgba(255,255,255,0.025)' }}
        />
        <Bar dataKey="count" name="Events" radius={[0, 5, 5, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={entry.source}
              fill={SOURCE_COLORS[index % SOURCE_COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default TopSourcesBarChart;
