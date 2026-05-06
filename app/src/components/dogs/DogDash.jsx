// Dash — fluffy golden Goldendoodle
export default function DogDash({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <circle cx="60" cy="82" r="22" fill="#D4A25A"/>

      {/* Tail */}
      <path d="M80 78 Q98 65 94 52 Q90 42 82 48" stroke="#C4904A" strokeWidth="8" fill="none" strokeLinecap="round"/>

      {/* Left ear - floppy */}
      <ellipse cx="28" cy="56" rx="13" ry="19" fill="#C4904A" transform="rotate(-12 28 56)"/>
      <ellipse cx="28" cy="56" rx="9" ry="14" fill="#D4A25A" transform="rotate(-12 28 56)"/>

      {/* Right ear - floppy */}
      <ellipse cx="92" cy="56" rx="13" ry="19" fill="#C4904A" transform="rotate(12 92 56)"/>
      <ellipse cx="92" cy="56" rx="9" ry="14" fill="#D4A25A" transform="rotate(12 92 56)"/>

      {/* Fluffy head - bumpy edges for curly fur */}
      <circle cx="60" cy="52" r="30" fill="#D4A25A"/>
      <circle cx="38" cy="36" r="11" fill="#D4A25A"/>
      <circle cx="52" cy="28" r="10" fill="#D4A25A"/>
      <circle cx="67" cy="28" r="10" fill="#D4A25A"/>
      <circle cx="80" cy="36" r="11" fill="#D4A25A"/>
      <circle cx="86" cy="50" r="9" fill="#D4A25A"/>
      <circle cx="34" cy="50" r="9" fill="#D4A25A"/>

      {/* Lighter fur highlights */}
      <circle cx="50" cy="40" r="13" fill="#E8C07A" opacity="0.55"/>
      <circle cx="70" cy="40" r="11" fill="#E8C07A" opacity="0.5"/>
      <circle cx="60" cy="34" r="9" fill="#E8C07A" opacity="0.45"/>

      {/* Eyes */}
      <circle cx="46" cy="50" r="7" fill="#1C1008"/>
      <circle cx="74" cy="50" r="7" fill="#1C1008"/>
      {/* Eye shine */}
      <circle cx="48" cy="47" r="2.5" fill="white"/>
      <circle cx="76" cy="47" r="2.5" fill="white"/>

      {/* Nose */}
      <ellipse cx="60" cy="62" rx="7" ry="5.5" fill="#2D1A08"/>
      <ellipse cx="60" cy="60" rx="4" ry="2" fill="#4A3020" opacity="0.6"/>

      {/* Mouth */}
      <path d="M53 67 Q60 73 67 67" stroke="#2D1A08" strokeWidth="2" fill="none" strokeLinecap="round"/>

      {/* Cheek fluffs */}
      <circle cx="34" cy="64" r="11" fill="#D4A25A"/>
      <circle cx="86" cy="64" r="11" fill="#D4A25A"/>
    </svg>
  );
}
