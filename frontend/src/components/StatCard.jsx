/**
 * StatCard — compact SOC metric tile.
 *
 * Strict height: 110–120 px.
 * Uses inline styles to guarantee pixel-exact dimensions
 * regardless of Tailwind purge or specificity issues.
 *
 * Props:
 *   label       {string}  – uppercase label (e.g. "Total Logs")
 *   value       {string}  – displayed metric value
 *   detail      {string}  – one-line status note (kept short)
 *   borderColor {string}  – CSS colour for the top accent bar
 *   glowColor   {string}  – CSS colour for the box-shadow glow
 */
function StatCard({
  label,
  value,
  detail,
  borderColor = '#22d3ee',
  glowColor   = 'rgba(34,211,238,0.06)',
  // legacy Tailwind accent prop — kept for backwards-compat, ignored visually
  accent,
}) {
  return (
    <article
      style={{
        position:       'relative',
        height:         '120px',
        minHeight:      '120px',
        maxHeight:      '120px',
        boxSizing:      'border-box',
        overflow:       'hidden',
        borderRadius:   '16px',
        border:         '1px solid rgba(255,255,255,0.06)',
        borderTop:      `2px solid ${borderColor}`,
        background:     'linear-gradient(180deg,rgba(8,12,24,0.95),rgba(3,6,15,0.95))',
        backdropFilter: 'blur(14px)',
        padding:        '12px 16px',
        boxShadow:      `0 0 20px ${glowColor}, 0 4px 16px rgba(0,0,0,0.4)`,
        transition:     'transform 0.2s ease, box-shadow 0.2s ease',
        cursor:         'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform  = 'translateY(-2px)';
        e.currentTarget.style.boxShadow  =
          `0 0 28px ${glowColor}, 0 8px 24px rgba(0,0,0,0.5)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform  = 'translateY(0)';
        e.currentTarget.style.boxShadow  =
          `0 0 20px ${glowColor}, 0 4px 16px rgba(0,0,0,0.4)`;
      }}
    >
      {/* corner accent glow */}
      <div
        aria-hidden="true"
        style={{
          position:       'absolute',
          top:            0,
          right:          0,
          width:          '70px',
          height:         '70px',
          background:     `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          opacity:        0.6,
          pointerEvents:  'none',
        }}
      />

      {/* LABEL */}
      <p
        style={{
          margin:          0,
          fontSize:        '10px',
          fontWeight:      500,
          letterSpacing:   '4px',
          textTransform:   'uppercase',
          color:           'rgba(255,255,255,0.6)',
          lineHeight:      1,
        }}
      >
        {label}
      </p>

      {/* VALUE */}
      <p
        style={{
          margin:              '8px 0 0',
          fontSize:            '32px',
          fontWeight:          700,
          lineHeight:          1,
          color:               '#f8fafc',
          fontVariantNumeric:  'tabular-nums',
        }}
      >
        {value ?? '—'}
      </p>

      {/* DETAIL — one short line */}
      {detail && (
        <p
          style={{
            margin:     '5px 0 0',
            fontSize:   '11px',
            color:      'rgba(255,255,255,0.7)',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow:   'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {detail}
        </p>
      )}
    </article>
  );
}

export default StatCard;