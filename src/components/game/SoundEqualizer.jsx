/**
 * SoundEqualizer — animated neon bars shown to non-host players
 * while a track is playing. Pure CSS animation, no JS timers.
 *
 * Props:
 *   active: bool — if false, bars are flat (paused state)
 *   size:   'sm' | 'md' | 'lg'
 */
const BAR_CONFIGS = [
  { color: 'var(--brand-cyan)',   delay: '0s',    duration: '0.9s',  minH: 8,  maxH: 32 },
  { color: 'var(--brand-pink)',   delay: '0.15s', duration: '1.1s',  minH: 14, maxH: 48 },
  { color: 'var(--brand-purple)', delay: '0.3s',  duration: '0.75s', minH: 6,  maxH: 36 },
  { color: 'var(--brand-cyan)',   delay: '0.45s', duration: '1.2s',  minH: 10, maxH: 44 },
  { color: 'var(--brand-pink)',   delay: '0.05s', duration: '0.85s', minH: 8,  maxH: 28 },
  { color: 'var(--brand-purple)', delay: '0.6s',  duration: '1.0s',  minH: 12, maxH: 40 },
  { color: 'var(--brand-cyan)',   delay: '0.2s',  duration: '0.95s', minH: 6,  maxH: 34 },
];

const SIZE_MAP = {
  sm: { barW: 4, gap: 3, wrapH: 40 },
  md: { barW: 5, gap: 4, wrapH: 56 },
  lg: { barW: 7, gap: 5, wrapH: 72 },
};

const SoundEqualizer = ({ active = true, size = 'md' }) => {
  const { barW, gap, wrapH } = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div
      className="flex items-end justify-center"
      style={{ height: wrapH, gap }}
      aria-label="Reproduciendo música"
      role="img"
    >
      {BAR_CONFIGS.map((bar, i) => (
        <div
          key={i}
          style={{
            width: barW,
            backgroundColor: bar.color,
            borderRadius: barW,
            height: active ? bar.maxH : bar.minH,
            minHeight: bar.minH,
            maxHeight: bar.maxH,
            boxShadow: active ? `0 0 6px ${bar.color}` : 'none',
            animation: active
              ? `equalizerBounce ${bar.duration} ${bar.delay} ease-in-out infinite alternate`
              : 'none',
            transition: 'height 0.4s ease, box-shadow 0.4s ease',
          }}
        />
      ))}
    </div>
  );
};

export default SoundEqualizer;
