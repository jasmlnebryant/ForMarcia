// Mako — big Boxer, brown and white with classic square face
export default function DogMako({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body — brown with white chest */}
      <circle cx="60" cy="86" r="24" fill="#B86E2A"/>
      {/* White chest patch */}
      <ellipse cx="60" cy="90" rx="13" ry="18" fill="#F5EFE0"/>

      {/* Left ear — floppy boxer ear */}
      <ellipse cx="28" cy="44" rx="13" ry="16" fill="#A06025" transform="rotate(-8 28 44)"/>
      <ellipse cx="28" cy="44" rx="9" ry="11" fill="#B87030" transform="rotate(-8 28 44)"/>

      {/* Right ear */}
      <ellipse cx="92" cy="44" rx="13" ry="16" fill="#A06025" transform="rotate(8 92 44)"/>
      <ellipse cx="92" cy="44" rx="9" ry="11" fill="#B87030" transform="rotate(8 92 44)"/>

      {/* Head — broader/squarer for Boxer */}
      <ellipse cx="60" cy="50" rx="31" ry="28" fill="#B86E2A"/>

      {/* White blaze up the face — classic Boxer marking */}
      <ellipse cx="60" cy="60" rx="13" ry="17" fill="#F5EFE0"/>
      {/* White forehead blaze */}
      <ellipse cx="60" cy="44" rx="7" ry="10" fill="#F5EFE0"/>

      {/* Forehead wrinkles — Boxer trait */}
      <path d="M46 36 Q60 33 74 36" stroke="#A06025" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7"/>
      <path d="M48 41 Q60 38 72 41" stroke="#A06025" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5"/>

      {/* Eyes — deep, soulful Boxer eyes */}
      <circle cx="44" cy="46" r="7.5" fill="#1A1008"/>
      <circle cx="76" cy="46" r="7.5" fill="#1A1008"/>
      {/* Dark iris */}
      <circle cx="44" cy="46" r="5.5" fill="#2D1A08"/>
      <circle cx="76" cy="46" r="5.5" fill="#2D1A08"/>
      {/* Eye shine */}
      <circle cx="46" cy="43.5" r="2.5" fill="white"/>
      <circle cx="78" cy="43.5" r="2.5" fill="white"/>

      {/* Dark/black muzzle — very Boxer */}
      <ellipse cx="60" cy="61" rx="15" ry="11" fill="#1A1008"/>
      <ellipse cx="60" cy="59" rx="12" ry="8" fill="#2D1A08"/>

      {/* Nose */}
      <ellipse cx="60" cy="57" rx="8" ry="5.5" fill="#0D0805"/>
      {/* Nostrils */}
      <circle cx="55.5" cy="57.5" r="2.5" fill="#1A1008"/>
      <circle cx="64.5" cy="57.5" r="2.5" fill="#1A1008"/>
      {/* Nose highlight */}
      <ellipse cx="57" cy="55" rx="2.5" ry="1.5" fill="#3A2A18" opacity="0.7"/>

      {/* White chin/jowl */}
      <ellipse cx="60" cy="68" rx="10" ry="7" fill="#F5EFE0"/>

      {/* Jowl lines */}
      <path d="M51 65 Q60 71 69 65" stroke="#2D1A08" strokeWidth="1.5" fill="none" strokeLinecap="round"/>

      {/* Cheek/jowl puffs — Boxer has big jowls */}
      <circle cx="36" cy="60" r="10" fill="#B86E2A"/>
      <circle cx="84" cy="60" r="10" fill="#B86E2A"/>
    </svg>
  );
}
