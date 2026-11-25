"use client";

import { useEffect, useRef, useState } from "react";
import { getRevealDelay } from "../_utils/reveal";

const EMAIL = "alexbenoliel@gmail.com";
const STAMP_DURATION_MS = 2400;
const CELL = "border-b border-ink px-4 py-3";
const LINK = "ul border-r border-ink px-4 py-[14px] font-semibold";

export function TitleBlock() {
  const [isCopied, setIsCopied] = useState(false);
  const stampTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => clearTimeout(stampTimer.current);
  }, []);

  function handleCopy() {
    // The stamp shows either way; clipboard access can be refused.
    navigator.clipboard?.writeText(EMAIL).catch(() => {});
    setIsCopied(true);
    clearTimeout(stampTimer.current);
    stampTimer.current = setTimeout(() => {
      setIsCopied(false);
    }, STAMP_DURATION_MS);
  }

  return (
    <div
      data-r
      style={getRevealDelay(0.15)}
      className="relative col-span-full grid grid-cols-4 border-ink bg-paper text-[15px] sheet:col-span-7 sheet:border-l-[1.5px]"
    >
      <div className={`${CELL} border-r`}>
        <span className="k block">Drawn by</span>A. Benoliel
      </div>
      <div className={`${CELL} border-r`}>
        <span className="k block">Location</span>Paris, FR
      </div>
      <div className={`${CELL} border-r`}>
        <span className="k block">Scale · Sheet</span>1:1 · 1/1
      </div>
      <div className={CELL}>
        <span className="k block">Status</span>
        <span className="inline-flex items-center gap-2 font-semibold text-red">
          <span className="dot size-2 rounded-full bg-red" />
          Open to work
        </span>
      </div>

      <div className="col-span-full flex flex-wrap items-end justify-between gap-4 border-b border-ink px-4 pt-4 pb-[18px]">
        <a
          href={`mailto:${EMAIL}`}
          data-label="SEND AN EMAIL"
          className="font-serif text-[clamp(28px,3.4vw,46px)] leading-none [overflow-wrap:anywhere]"
        >
          <span className="k mb-2 block">Contact</span>
          {EMAIL}
        </a>
        <button
          type="button"
          data-label="COPY EMAIL"
          onClick={handleCopy}
          className="btn box-content min-h-11 border-[1.5px] border-ink bg-transparent px-4 font-mono text-[12px] tracking-[.06em] uppercase"
        >
          Copy
        </button>
      </div>

      <a
        className={LINK}
        href="https://www.linkedin.com/in/alexis-benoliel-a679a7108"
        target="_blank"
        rel="noopener"
      >
        LinkedIn ↗
      </a>
      <a
        className={LINK}
        href="/cv-alexis-benoliel-en.pdf"
        target="_blank"
        rel="noopener"
        data-label="RESUME · PDF"
      >
        Resume ↗
      </a>
      <a
        className={LINK}
        href="/cv-alexis-benoliel.pdf"
        target="_blank"
        rel="noopener"
        data-label="CV FR · PDF"
      >
        CV (FR) ↗
      </a>
      <div className="px-4 py-[14px] font-mono text-[13px]">
        <span className="k block">Rev</span>E · 2026
      </div>

      {isCopied ? (
        <div
          aria-live="polite"
          className="stamp pointer-events-none absolute top-[14px] right-7 border-[3px] border-red bg-paper px-[14px] py-2 font-mono text-[18px] font-medium tracking-[.12em] text-red"
        >
          COPIED ✓ APPROVED
        </div>
      ) : null}
    </div>
  );
}
