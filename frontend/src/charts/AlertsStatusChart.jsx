import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const STATUS_COLORS = {
  open:         '#ef4444',
  investigating:'#eab308',
  resolved:     '#22c55e',
};

const CustomLegend = ({ payload }) => (
  <div
    style={{
      display:        'flex',
      flexWrap:       'wrap',
      justifyContent: 'center',
      gap:            '10px',
      marginTop:      '6px',
    }}
  >
    {payload?.map((entry) => (
      <div key={entry.value} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span
          style={{
            display:         'inline-block',
            width:           '7px',
            height:          '7px',
            borderRadius:    '50%',
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

function AlertsStatusChart({ alerts }) {
  const counts = alerts.reduce(
    (acc, alert) => {
      const status = String(alert.status || 'unknown').toLowerCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    { open: 0, investigating: 0, resolved: 0 },
  );

  const data = [
    { name: 'Open',         value: counts.open,         color: STATUS_COLORS.open },
    { name: 'Investigating',value: counts.investigating, color: STATUS_COLORS.investigating },
    { name: 'Resolved',     value: counts.resolved,     color: STATUS_COLORS.resolved },
  ].filter((d) => d.value > 0);

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
          Alerts by Status
        </h3>
      </div>

      {/* chart */}
      <div style={{ height: '220px' }}>
        {data.length === 0 ? (
          <div
            style={{
              height:         '100%',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              fontSize:       '13px',
              color:          '#334155',
            }}
          >
            No alert data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
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
              <Legend content={<CustomLegend />} />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="46%"
                outerRadius={78}
                innerRadius={42}
                paddingAngle={3}
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default AlertsStatusChart;
