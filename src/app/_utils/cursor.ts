const PX_TO_MM = 0.2646;

/** Zero-padded, never negative: `42` → `"0042"`. */
export function padCoordinate(value: number) {
  return String(Math.max(0, Math.round(value))).padStart(4, "0");
}

export function getCoordinateReadout(x: number, y: number) {
  return `X ${padCoordinate(x)} · Y ${padCoordinate(y)}`;
}

export function pxToMm(px: number) {
  return Math.round(px * PX_TO_MM);
}

/** Label shown when the cursor snaps onto a link or a button. */
export function getLinkLabel(link: Element) {
  const explicit = link.getAttribute("data-label");
  if (explicit) {
    return explicit;
  }
  if (link.tagName === "BUTTON") {
    return (link.textContent ?? "").trim().toUpperCase();
  }
  const href = link.getAttribute("href") ?? "";
  if (href.startsWith("mailto:")) {
    return "SEND AN EMAIL";
  }
  if (href.startsWith("#")) {
    return `SECTION · ${href.slice(1).toUpperCase()}`;
  }
  if (/\.pdf$/i.test(href)) {
    return "PDF";
  }
  try {
    return new URL(href).hostname.replace(/^www\./, "").toUpperCase();
  } catch {
    return "LINK";
  }
}
