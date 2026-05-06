import DogDash from "../components/dogs/DogDash";
import DogGracie from "../components/dogs/DogGracie";
import DogMako from "../components/dogs/DogMako";

export default function Login() {
  return (
    <div className="page center" style={{ gap: 0, padding: "40px 28px" }}>

      {/* Dogs illustration */}
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 0,
        marginBottom: 8,
      }}>
        {/* Gracie — small, left */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 4 }}>
          <DogGracie size={88} />
          <span className="dog-tag">Gracie</span>
        </div>
        {/* Mako — big, center, slightly raised */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
          <DogMako size={112} />
          <span className="dog-tag">Mako</span>
        </div>
        {/* Dash — small, right */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 4 }}>
          <DogDash size={88} />
          <span className="dog-tag">Dash</span>
        </div>
      </div>

      {/* Welcome text */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36, marginTop: 16 }}>
        <h1 style={{ fontSize: 32 }}>For Marcia</h1>
        <p style={{ fontSize: 17 }}>Your kitchen, always organized.</p>
      </div>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
        <button className="btn btn-primary" style={{ fontSize: 18, padding: "18px 24px" }}>
          Get Started
        </button>
      </div>

    </div>
  );
}
