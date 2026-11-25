"use client";

import { useEffect, useRef, type PropsWithChildren } from "react";

/**
 * Shows the whole sheet as a pencil sketch on load, then refreshes it to the
 * final drawing with an e-ink style flash (all CSS, see `.sketch` in
 * globals.css). Below the fold, `[data-r]` elements get `.in` the first time
 * they are seen.
 */
export function SketchIntro({ children }: PropsWithChildren) {
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (frame === null) {
      return;
    }
    const targets = frame.querySelectorAll("[data-r]");
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach((node) => node.classList.add("in"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );
    targets.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frameRef} className="frame-trace relative">
      <div className="sketch">{children}</div>
      <div aria-hidden="true" className="sketch-flash" />
    </div>
  );
}
