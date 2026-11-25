"use client";

import { useEffect, useRef } from "react";
import {
  DROP_DURATION,
  createPaperRenderer,
  getSheetPose,
  type PaperFrame,
} from "../_utils/paper-gl";

/** Anything sharper costs fill rate for nothing on a moving sheet. */
const MAX_PIXEL_RATIO = 2;
/** Meshed past the bottom of the screen, so the cut is never seen. */
const BELOW_FOLD = 320;
const FADE_OUT_MS = 180;

/**
 * Measures where the real sheet rests, so the WebGL one lands exactly on it.
 * Uses layout offsets, not bounding boxes: the sheet is being transformed.
 */
function measure(
  sheet: HTMLElement,
  ruled: HTMLElement,
  time: number,
): PaperFrame {
  const left = sheet.offsetLeft - window.scrollX;
  const top = sheet.offsetTop - window.scrollY;
  const visible = window.innerHeight - top + BELOW_FOLD;
  return {
    time,
    view: [window.innerWidth, window.innerHeight],
    sheet: [left, top, sheet.offsetWidth, sheet.offsetHeight],
    frame: [
      ruled.offsetLeft + sheet.clientLeft,
      ruled.offsetTop + sheet.clientTop,
      ruled.offsetWidth,
      ruled.offsetHeight,
    ],
    frameBorder: parseFloat(getComputedStyle(ruled).borderTopWidth) || 0,
    meshHeight: Math.min(sheet.offsetHeight, Math.max(visible, BELOW_FOLD)),
  };
}

/** Moves the real sheet (and the drawing on it) along with the WebGL one. */
function follow(sheet: HTMLElement, frame: PaperFrame) {
  const pose = getSheetPose(frame);
  sheet.style.transformOrigin = `${pose.origin[0]}px ${pose.origin[1]}px`;
  sheet.style.transform = `translate(${pose.translate[0]}px, ${pose.translate[1]}px) scale(${pose.scale}) rotate(${pose.degrees}deg)`;
}

/**
 * The blank sheet being laid down on the desk, in WebGL so it can bend, catch
 * the light and cast a real shadow. It is drawn behind the page (so it must
 * come before the sheet in the DOM) while the drawing is projected on top.
 * The real sheet follows its position, twist and height frame by frame, so
 * the drawing rides on the paper; its own paper stays see-through until the
 * WebGL sheet is flat, then
 * takes over when `data-intro` switches on the sheet root (the states are
 * listed in globals.css). Without WebGL2 the CSS version of the drop plays.
 */
export function PaperDrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = canvas?.closest<HTMLElement>("[data-intro]") ?? null;
    const sheet = root?.querySelector<HTMLElement>(".sheet-drop") ?? null;
    const ruled = root?.querySelector<HTMLElement>(".grid-paper") ?? null;
    if (canvas == null || root === null || sheet === null || ruled === null) {
      return;
    }
    const stage: HTMLCanvasElement = canvas;
    const sheetRoot: HTMLElement = root;
    const sheetNode: HTMLElement = sheet;
    const ruledNode: HTMLElement = ruled;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) {
      sheetRoot.dataset.intro = "done";
      return;
    }
    const gl = stage.getContext("webgl2", { antialias: true, alpha: true });
    const draw = gl === null ? null : createPaperRenderer(gl);
    if (draw === null) {
      sheetRoot.dataset.intro = "css";
      return;
    }
    const drawFrame: (frame: PaperFrame) => void = draw;

    let frameId = 0;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    let startTime = 0;

    function fitToScreen() {
      const ratio = Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO);
      const width = Math.round(window.innerWidth * ratio);
      const height = Math.round(window.innerHeight * ratio);
      if (stage.width !== width || stage.height !== height) {
        stage.width = width;
        stage.height = height;
      }
    }

    function handOver() {
      sheetRoot.dataset.intro = "project";
      sheetNode.style.transformOrigin = "";
      sheetNode.style.transform = "none";
      stage.style.opacity = "0";
      hideTimer = setTimeout(() => {
        stage.style.display = "none";
      }, FADE_OUT_MS);
    }

    function tick(now: number) {
      if (startTime === 0) {
        startTime = now;
      }
      const time = Math.min((now - startTime) / 1000, DROP_DURATION);
      fitToScreen();
      const frame = measure(sheetNode, ruledNode, time);
      drawFrame(frame);
      follow(sheetNode, frame);
      if (time >= DROP_DURATION) {
        frameId = 0;
        handOver();
        return;
      }
      frameId = requestAnimationFrame(tick);
    }

    sheetRoot.dataset.intro = "webgl";
    stage.style.display = "";
    stage.style.opacity = "1";
    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 size-full [transition:opacity_.18s_linear]"
    />
  );
}
