import { useEffect, useState } from "react";
import DogDash  from "./dogs/DogDash";
import DogGracie from "./dogs/DogGracie";
import DogMako  from "./dogs/DogMako";

export default function SplashScreen({ onDone }) {
  const [visible, setVisible] = useState(true); // controls opacity

  useEffect(() => {
    // Start fade-out after 1.6s, call onDone after the 0.5s fade completes
    const fadeTimer = setTimeout(() => setVisible(false), 1600);
    const doneTimer = setTimeout(onDone, 2100);
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer); };
  }, [onDone]);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "var(--cream)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 32,
      zIndex: 9999,
      opacity: visible ? 1 : 0,
      transition: "opacity 0.5s ease",
    }}>
      {/* Dogs */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
        <div style={{ opacity: 0, animation: "splashPop 0.4s ease 0.1s forwards" }}>
          <DogGracie size={72} />
        </div>
        <div style={{ opacity: 0, animation: "splashPop 0.4s ease 0.25s forwards" }}>
          <DogDash size={92} />
        </div>
        <div style={{ opacity: 0, animation: "splashPop 0.4s ease 0.4s forwards" }}>
          <DogMako size={72} />
        </div>
      </div>

      {/* App name */}
      <div style={{ textAlign: "center", opacity: 0, animation: "splashPop 0.4s ease 0.5s forwards" }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: "var(--green-dark)", letterSpacing: "-0.5px" }}>
          ForMarcia
        </div>
        <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
          Your kitchen, simplified.
        </div>
      </div>
    </div>
  );
}
