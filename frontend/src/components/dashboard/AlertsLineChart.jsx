import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

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
        {Number(payload[0].value).toLocaleString()} alerts
      </p>
    </div>
  );
};

/**
 * AlertsLineChart — compact area chart, alerts per day.
 *
 * @param {{
 *   data: { date: string; count: number }[],
 *   loading?: boolean,
 * }} props
 */
function AlertsLineChart({ data, loading = false }) {
  const emptyStyle = {
    display: 'flex',
    height: '200px',
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
    return <div style={emptyStyle}>No timeline data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: -4 }}>
        <defs>
          <linearGradient id="alertAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#22d3ee" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#818cf8" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="alertLineStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />

        <XAxis
          dataKey="date"
          tick={{ fill: '#475569', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#475569', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          width={26}
        />

        <Tooltip content={<CustomTooltip />} />

        <Area
          type="monotone"
          dataKey="count"
          name="Alerts"
          stroke="url(#alertLineStroke)"
          strokeWidth={2}
          fill="url(#alertAreaFill)"
          dot={false}
          activeDot={{ r: 4, fill: '#22d3ee', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default AlertsLineChart;
