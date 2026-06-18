/**
 * StatCard — Enterprise SOC command-center metric widget.
 *
 * Design targets:
 *   - Height: 90–100 px (strict)
 *   - Structure: [LABEL + ICON top-right] / [VALUE large] / [status chip]
 *   - Lucide icons at 18 px, opacity 0.8
 *   - Number: 40 px / 800 weight
 *   - Status chip with coloured dot indicator
 *   - Dark glass background with coloured top border + subtle glow
 *
 * Props:
 *   label       {string}   — uppercase label
 *   value       {string}   — metric value
 *   status      {string}   — short status text  ("Updated Live", "Monitoring", …)
 *   statusType  {string}   — "live" | "warn" | "alert" | "ok" (controls dot colour)
 *   icon        {element}  — Lucide React element (pre-sized by parent)
 *   borderColor {string}   — top accent colour
 *   glowColor   {string}   — glow rgba string
 */
function StatCard({
  label,
  value,
  status     = 'Active',
  statusType = 'live',
  icon,
  borderColor = '#22d3ee',
  glowColor   = 'rgba(34,211,238,0.06)',
  // legacy compat
  detail,
  accent,
}) {
  // dot colours map
  const dotColors = {
    live:  '#22d3ee',
    ok:    '#34d399',
    warn:  '#facc15',
    alert: '#f43f5e',
  };
  const dotColor = dotColors[statusType] ?? dotColors.live;

  return (
    <article
      style={{
        position:       'relative',
        height:         '96px',
        minHeight:      '96px',
        maxHeight:      '96px',
        boxSizing:      'border-box',
        overflow:       'hidden',
        borderRadius:   '14px',
        border:         '1px solid rgba(255,255,255,0.08)',
        borderTop:      `2px solid ${borderColor}`,
        background:     'rgba(5,10,25,0.90)',
        backdropFilter: 'blur(16px)',
        padding:        '12px 16px',
        boxShadow:      `0 0 20px rgba(0,255,255,0.05), 0 4px 16px rgba(0,0,0,0.45)`,
        transition:     'transform 0.18s ease, box-shadow 0.18s ease',
        cursor:         'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow =
          `0 0 32px ${glowColor}, 0 8px 28px rgba(0,0,0,0.55)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow =
          `0 0 20px rgba(0,255,255,0.05), 0 4px 16px rgba(0,0,0,0.45)`;
      }}
    >
      {/* corner radial glow */}
      <div
        aria-hidden="true"
        style={{
          position:      'absolute',
          top:           0,
          right:         0,
          width:         '60px',
          height:        '60px',
          background:    `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          opacity:       0.7,
          pointerEvents: 'none',
        }}
      />

      {/* ── ROW 1 : label + icon ── */}
      <div
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          marginBottom:   '4px',
        }}
      >
        <span
          style={{
            fontSize:      '9px',
            fontWeight:    600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color:         'rgba(255,255,255,0.45)',
            lineHeight:    1,
          }}
        >
          {label}
        </span>

        {icon && (
          <span
            style={{
              color:   borderColor,
              opacity: 0.8,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {icon}
          </span>
        )}
      </div>

      {/* ── ROW 2 : metric value ── */}
      <p
        style={{
          margin:             '0 0 6px',
          fontSize:           '38px',
          fontWeight:         800,
          lineHeight:         1,
          color:              '#f8fafc',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing:      '-0.02em',
        }}
      >
        {value ?? '—'}
      </p>

      {/* ── ROW 3 : status chip ── */}
      <div
        style={{
          display:     'flex',
          alignItems:  'center',
          gap:         '5px',
        }}
      >
        {/* pulsing dot */}
        <span
          style={{
            display:      'inline-block',
            width:        '6px',
            height:       '6px',
            borderRadius: '50%',
            background:   dotColor,
            boxShadow:    `0 0 6px ${dotColor}`,
            flexShrink:   0,
          }}
        />
        <span
          style={{
            fontSize:      '10px',
            fontWeight:    500,
            color:         'rgba(255,255,255,0.55)',
            letterSpacing: '0.04em',
            whiteSpace:    'nowrap',
          }}
        >
          {status || detail || 'Active'}
        </span>
      </div>
    </article>
  );
}

export default StatCard;