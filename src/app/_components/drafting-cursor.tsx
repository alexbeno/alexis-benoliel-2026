"use client";

import { useEffect, useRef, type RefObject } from "react";
import { getCoordinateReadout, getLinkLabel, pxToMm } from "../_utils/cursor";

const INK = "var(--color-ink)";
const RED = "var(--color-accent)";
const CORNER = "absolute box-content size-[10px] border-current";

interface DraftingCursorProps {
  rootRef: RefObject<HTMLElement | null>;
}

interface Pointer {
  x: number;
  y: number;
  target: EventTarget | null;
}

/**
 * CAD-style cursor: crosshair lines, a reticle, and a box that snaps onto
 * links, buttons and `[data-snap]` parts with a label. Also feeds the
 * `[data-cursor-xy]` readout in the header.
 */
export function DraftingCursor({ rootRef }: DraftingCursorProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const hRef = useRef<HTMLDivElement>(null);
  const vRef = useRef<HTMLDivElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const layer = layerRef.current;
    const h = hRef.current;
    const v = vRef.current;
    const reticle = reticleRef.current;
    const box = boxRef.current;
    const label = labelRef.current;
    if (!root || !layer || !h || !v || !reticle || !box || !label) {
      return;
    }

    const readout = root.querySelector("[data-cursor-xy]");
    let last: Pointer | null = null;
    let frame = 0;

    function snapTo(target: Element, isLink: boolean) {
      const rect = target.getBoundingClientRect();
      const margin = isLink ? 6 : 4;
      const left = rect.left - margin;
      const top = rect.top - margin;
      const color = isLink ? RED : INK;
      box!.style.opacity = "1";
      box!.style.color = color;
      box!.style.transform = `translate(${left}px,${top}px)`;
      box!.style.width = `${rect.width + margin * 2}px`;
      box!.style.height = `${rect.height + margin * 2}px`;
      reticle!.style.opacity = isLink ? "0" : "1";
      label!.textContent = isLink
        ? `SNAP → ${getLinkLabel(target)}`
        : `${target.getAttribute("data-snap")} · ${pxToMm(rect.width)} × ${pxToMm(rect.height)} MM`;
      label!.style.background = color;
      label!.style.transform = `translate(${left}px,${Math.max(0, top - 22)}px)`;
    }

    function paint() {
      frame = 0;
      if (last === null) {
        return;
      }
      const { x, y } = last;
      const xy = getCoordinateReadout(x, y);
      layer!.style.opacity = "1";
      h!.style.transform = `translateY(${y}px)`;
      v!.style.transform = `translateX(${x}px)`;
      reticle!.style.transform = `translate(${x}px,${y}px)`;
      if (readout) {
        readout.textContent = xy;
      }

      const element = last.target instanceof Element ? last.target : null;
      const link = element?.closest("a[href], button") ?? null;
      if (link) {
        snapTo(link, true);
        return;
      }
      const part = element?.closest("[data-snap]") ?? null;
      if (part) {
        snapTo(part, false);
        return;
      }
      box!.style.opacity = "0";
      reticle!.style.opacity = "1";
      label!.textContent = xy;
      label!.style.background = INK;
      label!.style.transform = `translate(${x + 16}px,${y + 16}px)`;
    }

    function handlePointerMove(event: PointerEvent) {
      if (event.pointerType === "touch") {
        return;
      }
      last = { x: event.clientX, y: event.clientY, target: event.target };
      if (frame === 0) {
        frame = requestAnimationFrame(paint);
      }
    }

    // Keep the cursor visible while a drag is in progress.
    function handleMouseLeave(event: MouseEvent) {
      if (event.buttons === 0) {
        layer!.style.opacity = "0";
      }
    }

    window.addEventListener("pointermove", handlePointerMove);
    root.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("mouseleave", handleMouseLeave);
      if (frame !== 0) {
        cancelAnimationFrame(frame);
      }
    };
  }, [rootRef]);

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-60 opacity-0 [transition:opacity_.2s]"
    >
      <div
        ref={hRef}
        className="absolute top-0 right-0 left-0 h-px bg-accent/28"
      />
      <div
        ref={vRef}
        className="absolute top-0 bottom-0 left-0 w-px bg-accent/28"
      />
      <div
        ref={reticleRef}
        className="absolute top-0 left-0 [transition:opacity_.15s]"
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 26 26"
          className="absolute -top-[13px] -left-[13px] max-w-none fill-none stroke-ink"
          strokeWidth="1.2"
        >
          <circle cx="13" cy="13" r="6" />
          <path d="M13 0V9M13 17V26M0 13H9M17 13H26" />
        </svg>
      </div>
      <div
        ref={boxRef}
        className="absolute top-0 left-0 size-0 text-accent opacity-0 [transition:transform_.2s_cubic-bezier(.3,1.4,.5,1),width_.2s,height_.2s,opacity_.15s]"
      >
        <span className={`${CORNER} top-0 left-0 border-t-2 border-l-2`} />
        <span className={`${CORNER} top-0 right-0 border-t-2 border-r-2`} />
        <span className={`${CORNER} bottom-0 left-0 border-b-2 border-l-2`} />
        <span className={`${CORNER} right-0 bottom-0 border-r-2 border-b-2`} />
      </div>
      <span
        ref={labelRef}
        className="absolute top-0 left-0 bg-ink px-[7px] py-[3px] font-mono text-[10px] tracking-[.08em] whitespace-nowrap text-paper"
      />
    </div>
  );
}
