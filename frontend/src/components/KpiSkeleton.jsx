/**
 * KpiSkeleton — Shimmer placeholder cards shown during first dashboard load.
 *
 * Renders two rows of compact 96 px cards (5 + 4) matching the StatCard layout.
 * Uses a CSS animation defined in index.css (@keyframes shimmer).
 */

// ── shimmer block helper ──────────────────────────────────────────────────────
function Shimmer({ width = '100%', height = '10px', style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: '6px',
        background:   'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%)',
        backgroundSize: '200% 100%',
        animation:    'shimmer 1.6s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

// ── single skeleton card ──────────────────────────────────────────────────────
function SkeletonCard({ borderColor = 'rgba(255,255,255,0.15)' }) {
  return (
    <div
      style={{
        height:         '96px',
        minHeight:      '96px',
        maxHeight:      '96px',
        boxSizing:      'border-box',
        borderRadius:   '14px',
        border:         '1px solid rgba(255,255,255,0.06)',
        borderTop:      `2px solid ${borderColor}`,
        background:     'rgba(5,10,25,0.80)',
        backdropFilter: 'blur(16px)',
        padding:        '12px 16px',
        display:        'flex',
        flexDirection:  'column',
        justifyContent: 'space-between',
      }}
    >
      {/* label row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Shimmer width="55%" height="9px" />
        <Shimmer width="18px" height="18px" style={{ borderRadius: '4px' }} />
      </div>

      {/* value */}
      <Shimmer width="40%" height="34px" style={{ borderRadius: '8px' }} />

      {/* status chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Shimmer width="6px" height="6px" style={{ borderRadius: '50%' }} />
        <Shimmer width="60px" height="9px" />
      </div>
    </div>
  );
}

// ── border colours cycle ──────────────────────────────────────────────────────
const COLORS = [
  '#22d3ee', '#f97316', '#f43f5e', '#facc15', '#34d399',
  '#f43f5e', '#a78bfa', '#818cf8', '#34d399',
];

// ── exported component ────────────────────────────────────────────────────────
const row1Grid = {
  display:             'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap:                 '10px',
  marginBottom:        '10px',
};

const row2Grid = {
  display:             'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap:                 '10px',
  marginBottom:        '16px',
};

function KpiSkeleton() {
  return (
    <>
      {/* Row 1 — 5 cards */}
      <div style={row1Grid} className="kpi-row-5">
        {COLORS.slice(0, 5).map((c, i) => (
          <SkeletonCard key={i} borderColor={c} />
        ))}
      </div>

      {/* Row 2 — 4 cards */}
      <div style={row2Grid} className="kpi-row-4">
        {COLORS.slice(5).map((c, i) => (
          <SkeletonCard key={i} borderColor={c} />
        ))}
      </div>
    </>
  );
}

export default KpiSkeleton;
