// Animated Nilgiris hills + highway scene evoking the Coimbatore-Ooty
// corridor traffic — pure SVG + CSS keyframe animations (no video file), so
// it loads instantly and stays on-brand. Sits behind the hero copy with a
// gradient overlay for text contrast.

const VEHICLE_BODIES = {
  truck: { body: { x: -34, y: -22, w: 46, h: 24 }, cab: { x: 12, y: -14, w: 22, h: 16 }, wheels: [-20, 24] },
  miniTruck: { body: { x: -26, y: -16, w: 34, h: 18 }, cab: { x: 8, y: -12, w: 16, h: 14 }, wheels: [-15, 18] },
  cab: { body: { x: -22, y: -12, w: 40, h: 14 }, cab: { x: -8, y: -20, w: 22, h: 10 }, wheels: [-13, 15] },
  car: { body: { x: -20, y: -11, w: 36, h: 12 }, cab: { x: -6, y: -18, w: 18, h: 9 }, wheels: [-11, 13] },
}

function Vehicle({ variant, y, animationClass, duration, delay, scale = 1 }) {
  const shape = VEHICLE_BODIES[variant]

  // Two nested groups: the outer one sets the static lane position/scale via
  // the SVG `transform` attribute, the inner one gets the CSS animation. A
  // CSS `transform` (from the animation) replaces rather than composes with
  // a `transform` attribute on the *same* element, so they must live on
  // separate elements or the lane position/scale would be lost.
  return (
    <g transform={`translate(0, ${y}) scale(${scale})`}>
      <g className={animationClass} style={{ animationDuration: duration, animationDelay: delay }}>
        {variant === 'bike' ? (
          <>
            <path d="M-11,1 L-2,-15 L10,1" fill="none" stroke="#F9FAFB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="-6" y="-16" width="7" height="9" rx="2" fill="#F9FAFB" />
            <circle cx="-2.5" cy="-20" r="3.5" fill="#F9FAFB" />
            <circle cx="-11" cy="1" r="5" fill="#0d2019" />
            <circle cx="10" cy="1" r="5" fill="#0d2019" />
          </>
        ) : (
          <>
            <rect x={shape.body.x} y={shape.body.y} width={shape.body.w} height={shape.body.h} rx="3" fill="#F9FAFB" />
            <rect x={shape.cab.x} y={shape.cab.y} width={shape.cab.w} height={shape.cab.h} rx="2" fill="#F9FAFB" />
            {shape.wheels.map((wx) => (
              <circle key={wx} cx={wx} cy={shape.body.y + shape.body.h} r="6" fill="#0d2019" />
            ))}
          </>
        )}
      </g>
    </g>
  )
}

export default function HeroBackground() {
  return (
    <svg
      viewBox="0 0 1440 640"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      {/* soft sun glow */}
      <circle cx="1180" cy="110" r="140" fill="#F59E0B" opacity="0.12" />
      <circle cx="1180" cy="110" r="70" fill="#F59E0B" opacity="0.18" />

      {/* drifting clouds */}
      <g fill="#F9FAFB" opacity="0.1">
        <ellipse className="animate-ot-cloud-drift" style={{ animationDuration: '38s' }} cx="200" cy="90" rx="70" ry="18" />
        <ellipse className="animate-ot-cloud-drift" style={{ animationDuration: '52s', animationDelay: '-20s' }} cx="600" cy="150" rx="90" ry="22" />
        <ellipse className="animate-ot-cloud-drift" style={{ animationDuration: '45s', animationDelay: '-8s' }} cx="1000" cy="70" rx="60" ry="16" />
      </g>

      {/* back hill range */}
      <path
        d="M0,300 C220,240 420,280 640,250 C880,218 1120,270 1440,230 L1440,640 L0,640 Z"
        fill="#2D6A4F"
        opacity="0.35"
      />
      {/* mid hill range */}
      <path
        d="M0,380 C240,330 460,390 680,355 C940,315 1180,390 1440,345 L1440,640 L0,640 Z"
        fill="#2D6A4F"
        opacity="0.55"
      />
      {/* tea-estate texture dots on the mid range */}
      <g fill="#123024" opacity="0.3">
        {Array.from({ length: 24 }).map((_, i) => (
          <ellipse key={i} cx={60 + i * 58} cy={400 + ((i * 37) % 60)} rx="16" ry="8" />
        ))}
      </g>

      {/* highway band running across the valley */}
      <rect x="0" y="452" width="1440" height="72" fill="#3f3835" />
      <line
        x1="0" y1="488" x2="1440" y2="488"
        stroke="#F59E0B"
        strokeWidth="4"
        strokeDasharray="36 28"
        strokeLinecap="round"
        opacity="0.9"
        className="animate-ot-road-flow"
      />

      {/* moving traffic — empty vehicles heading back down the corridor */}
      <Vehicle variant="truck" y={465} animationClass="animate-ot-drive-right" duration="16s" delay="-2s" scale={1.1} />
      <Vehicle variant="miniTruck" y={478} animationClass="animate-ot-drive-right" duration="13s" delay="-9s" scale={0.85} />
      <Vehicle variant="car" y={490} animationClass="animate-ot-drive-right" duration="10s" delay="-4s" scale={0.95} />
      <Vehicle variant="bike" y={497} animationClass="animate-ot-drive-left" duration="8s" delay="-3s" scale={0.8} />
      <Vehicle variant="cab" y={507} animationClass="animate-ot-drive-left" duration="11s" delay="-6s" scale={0.9} />
      <Vehicle variant="cab" y={517} animationClass="animate-ot-drive-left" duration="18s" delay="-1s" scale={1} />

      {/* front hill mass (foreground, partially frames the road) */}
      <path
        d="M0,560 C280,520 520,555 760,530 C1020,502 1260,548 1440,522 L1440,640 L0,640 Z"
        fill="#123024"
      />
      <g fill="#0d2019" opacity="0.5">
        {Array.from({ length: 26 }).map((_, i) => (
          <ellipse key={i} cx={40 + i * 56} cy={585 + ((i * 43) % 40)} rx="18" ry="9" />
        ))}
      </g>
    </svg>
  )
}
