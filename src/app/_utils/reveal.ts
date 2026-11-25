import type { CSSProperties } from "react";

/** Delays the scroll reveal of a `[data-r]` element (see globals.css). */
export function getRevealDelay(seconds: number) {
  return { "--d": `${seconds}s` } as CSSProperties;
}
