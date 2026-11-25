import { ImageResponse } from "next/og";
import { SITE_TITLE } from "./_utils/site";

export const alt = SITE_TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#f6f7f4";
const INK = "#15181c";
const ACCENT = "#e2500a";
const GREY = "#5b6068";

/** Link preview: the title block of the drawing sheet, in the light theme. */
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        padding: 36,
        background: "#eaebe6",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "44px 56px",
          border: `4px solid ${INK}`,
          background: PAPER,
          color: INK,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            letterSpacing: 2,
            color: GREY,
          }}
        >
          <span>DWG. NO. AB-2026-001</span>
          <span>PARIS, FR</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: 132,
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: -4,
            }}
          >
            ALEXIS
          </span>
          <span
            style={{
              fontSize: 132,
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: -4,
              marginLeft: 64,
            }}
          >
            BENOLIEL
          </span>
          <div
            style={{
              display: "flex",
              height: 4,
              marginTop: 40,
              background: ACCENT,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <span style={{ fontSize: 36, letterSpacing: -0.5 }}>
            Interfaces that hold, between people and AI.
          </span>
          <span style={{ flexShrink: 0, fontSize: 24, color: ACCENT }}>
            Product Engineer
          </span>
        </div>
      </div>
    </div>,
    size,
  );
}
