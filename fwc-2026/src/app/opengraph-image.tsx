import { ImageResponse } from "next/og";

export const alt = "World Cup Predictions 2026 - Predict the Football World Cup";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "radial-gradient(ellipse at 20% 10%, #1a3a5c 0%, #0b1224 55%, #05070f 100%)",
          color: "#f8fafc",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(90deg, rgba(34,197,94,0.05) 0 2px, transparent 2px 120px)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: "#22c55e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 800,
              color: "#0b1224",
            }}
          >
            FWC
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#94a3b8",
              fontWeight: 600,
            }}
          >
            USA - Canada - Mexico
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 128,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: -4,
            }}
          >
            World Cup&nbsp;
            <span style={{ color: "#22c55e" }}>Predictions</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 128,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: -4,
              color: "#facc15",
            }}
          >
            2026
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 36,
              color: "#cbd5e1",
              marginTop: 12,
              maxWidth: 900,
            }}
          >
            Predict scores, build your bracket and compete for the trophy with your
            friends.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 26px",
              borderRadius: 999,
              background: "#22c55e",
              color: "#0b1224",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            Start your predictions
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: "#64748b",
              fontWeight: 600,
            }}
          >
            11 Jun - 19 Jul 2026
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
