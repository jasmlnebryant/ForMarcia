import { useRef, useState } from "react";

const DELETE_W = 76;

export default function SwipeableRow({ children, onDelete }) {
  const [offset, setOffset] = useState(0);
  const startX   = useRef(null);
  const startY   = useRef(null);
  const startOff = useRef(0);
  const isHoriz  = useRef(null);

  function onTouchStart(e) {
    startX.current   = e.touches[0].clientX;
    startY.current   = e.touches[0].clientY;
    startOff.current = offset;
    isHoriz.current  = null;
  }

  function onTouchMove(e) {
    if (startX.current === null) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;
    if (isHoriz.current === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      isHoriz.current = Math.abs(dx) >= Math.abs(dy);
    }
    if (!isHoriz.current) return;
    const next = Math.max(-DELETE_W, Math.min(0, startOff.current + dx));
    setOffset(next);
  }

  function onTouchEnd() {
    setOffset(offset < -DELETE_W / 2 ? -DELETE_W : 0);
    startX.current = null;
  }

  const isSnapping = offset === 0 || offset === -DELETE_W;

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      {/* Red delete zone revealed on swipe */}
      <div
        onClick={onDelete}
        style={{
          position: "absolute", right: 0, top: 0, bottom: 0,
          width: DELETE_W,
          background: "var(--coral)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: 20 }}>🗑️</span>
      </div>

      {/* Sliding content */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform: `translateX(${offset}px)`,
          transition: isSnapping ? "transform 0.22s ease" : "none",
          background: "var(--white)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
}
