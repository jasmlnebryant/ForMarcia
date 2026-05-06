// Gracie — small black fluffy dog with happy tongue out
export default function DogGracie({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <circle cx="60" cy="84" r="20" fill="#222222"/>

      {/* Left ear - floppy, dark */}
      <ellipse cx="30" cy="54" rx="14" ry="20" fill="#111111" transform="rotate(-15 30 54)"/>
      <ellipse cx="30" cy="56" rx="9" ry="14" fill="#1E1E1E" transform="rotate(-15 30 56)"/>

      {/* Right ear */}
      <ellipse cx="90" cy="54" rx="14" ry="20" fill="#111111" transform="rotate(15 90 54)"/>
      <ellipse cx="90" cy="56" rx="9" ry="14" fill="#1E1E1E" transform="rotate(15 90 56)"/>

      {/* Fluffy head - dark with bumpy edges */}
      <circle cx="60" cy="52" r="28" fill="#222222"/>
      <circle cx="40" cy="38" r="10" fill="#222222"/>
      <circle cx="55" cy="30" r="10" fill="#222222"/>
      <circle cx="70" cy="30" r="10" fill="#222222"/>
      <circle cx="82" cy="40" r="10" fill="#222222"/>

      {/* Brown muzzle area */}
      <ellipse cx="60" cy="60" rx="16" ry="13" fill="#5C3A1E"/>
      <ellipse cx="60" cy="57" rx="12" ry="9" fill="#6B4526"/>

      {/* Eyes — bright to pop from dark fur */}
      <circle cx="45" cy="48" r="7.5" fill="#1A1A1A"/>
      <circle cx="75" cy="48" r="7.5" fill="#1A1A1A"/>
      {/* Warm brown iris */}
      <circle cx="45" cy="48" r="5.5" fill="#5C3D1A"/>
      <circle cx="75" cy="48" r="5.5" fill="#5C3D1A"/>
      {/* Eye shine */}
      <circle cx="47" cy="45.5" r="2.5" fill="white"/>
      <circle cx="77" cy="45.5" r="2.5" fill="white"/>

      {/* Nose */}
      <ellipse cx="60" cy="57" rx="6" ry="4.5" fill="#0D0D0D"/>
      <ellipse cx="58" cy="55.5" rx="2" ry="1.2" fill="#2A2A2A" opacity="0.7"/>

      {/* Happy mouth */}
      <path d="M50 63 Q60 68 70 63" stroke="#3A2010" strokeWidth="1.5" fill="none" strokeLinecap="round"/>

      {/* Tongue - pink, sticking out */}
      <ellipse cx="60" cy="70" rx="9" ry="7" fill="#FF8FAB"/>
      <path d="M51 66 Q60 72 69 66" fill="#FF8FAB"/>
      {/* Tongue crease */}
      <path d="M60 65 L60 75" stroke="#E07090" strokeWidth="1.8" strokeLinecap="round"/>

      {/* Cheek fluffs */}
      <circle cx="36" cy="63" r="10" fill="#222222"/>
      <circle cx="84" cy="63" r="10" fill="#222222"/>
    </svg>
  );
}
