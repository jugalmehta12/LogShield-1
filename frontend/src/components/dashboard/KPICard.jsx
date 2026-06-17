/**
 * KPICard — compact SOC-grade metric tile.
 *
 * Max height ~110 px. Colored top border only.
 * Hover: lift + subtle cyan glow.
 *
 * @param {{
 *   label: string,
 *   value: string | number,
 *   borderColor: string,
 *   glowColor: string,
 *   icon: string,
 *   loading?: boolean,
 *   status?: string,
 *   statusColor?: string,
 * }} props
 */
function KPICard({
  label,
  value,
  borderColor,
  glowColor,
  icon,
  loading = false,
  status,
  statusColor = '#64748b',
}) {
  return (
    <article
      style={{
        position: 'relative',
        height: '120px',
        minHeight: '120px',
        maxHeight: '120px',
        boxSizing: 'border-box',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.07)',
        borderTop: `2px solid ${borderColor}`,
        background: 'linear-gradient(180deg,rgba(8,12,24,0.95),rgba(3,6,15,0.95))',
        backdropFilter: 'blur(16px)',
        padding: '12px 16px',
        boxShadow: `0 0 20px ${glowColor}`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        cursor: 'default',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 0 32px ${glowColor}, 0 8px 24px rgba(0,0,0,0.4)`;
        e.currentTarget.style.borderColor = borderColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = `0 0 20px ${glowColor}`;
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
      }}
    >
      {/* subtle corner glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '70px',
          height: '70px',
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          opacity: 0.15,
          pointerEvents: 'none',
        }}
      />

      {/* LABEL row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '4px',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: '14px', opacity: 0.3 }}>{icon}</span>
      </div>

      {/* VALUE */}
      {loading ? (
        <div
          style={{
            height: '32px',
            width: '80px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.05)',
            animation: 'pulse 1.5s ease-in-out infinite',
            marginTop: '8px',
          }}
        />
      ) : (
        <p
          style={{
            fontSize: '32px',
            fontWeight: 700,
            lineHeight: 1,
            color: '#f8fafc',
            margin: '8px 0 0',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value ?? '—'}
        </p>
      )}

      {/* STATUS / TREND */}
      {status && !loading && (
        <p
          style={{
            marginTop: '5px',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.7)',
            margin: '5px 0 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {status}
        </p>
      )}
    </article>
  );
}

export default KPICard;
