function DovetailMark() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 48 48"
      role="img"
      aria-label="Dovetail joint monogram"
      className="overflow-visible"
    >
      <defs>
        <pattern
          id="logo-hatch"
          width="4"
          height="4"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="4"
            className="stroke-accent"
            strokeWidth="1.2"
          />
        </pattern>
      </defs>
      <path d="M0 0H24V18L36 12V36L24 30V48H0Z" className="fill-ink" />
      <path
        className="rp stroke-accent"
        d="M24.9 0.9H47.1V47.1H24.9V30.6L36.9 36.6V11.4L24.9 17.4Z"
        fill="url(#logo-hatch)"
        strokeWidth="1.8"
      />
    </svg>
  );
}

const NAV_LINK =
  "ul flex min-h-11 items-center justify-center border-ink sheet:inline sheet:min-h-0 sheet:border-l-0";

/**
 * Desktop: one strip of three cells (name, drawing number and cursor, nav).
 * Mobile: name and drawing number on top, then the nav as three equal cells,
 * each a full-height tap target.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 grid grid-cols-12 border-b-[1.5px] border-ink bg-paper shadow-[0_6px_0_-4px_rgba(26,26,26,.08)]">
      <a
        href="#top"
        data-label="TOP OF SHEET"
        className="logo col-span-8 flex items-center gap-3 px-4 py-[10px] sheet:col-span-4 sheet:gap-[14px] sheet:px-5 sheet:py-[14px]"
      >
        <DovetailMark />
        <span className="font-mono text-[13px] leading-[1.35] font-medium text-ink">
          ALEXIS BENOLIEL
          <br />
          <span className="font-normal text-grey">Product Engineer</span>
        </span>
      </a>
      <div className="col-span-4 flex flex-col justify-center border-l border-ink px-3 sheet:hidden">
        <span className="k block text-[10px]">Dwg. no.</span>
        <span className="font-mono text-[12px]">AB-2026-001</span>
      </div>
      <div className="col-span-4 flex justify-between gap-3 border-l border-ink px-5 py-[14px] max-sheet:hidden">
        <div>
          <span className="k block">Dwg. no.</span>
          <span className="font-mono text-[15px]">AB-2026-001</span>
        </div>
        <div className="text-right">
          <span className="k block">Cursor</span>
          <span data-cursor-xy className="font-mono text-[15px] text-accent">
            X 0000 · Y 0000
          </span>
        </div>
      </div>
      <nav className="col-span-full grid grid-cols-3 border-t border-ink font-mono text-[12px] uppercase sheet:col-span-4 sheet:flex sheet:items-center sheet:justify-end sheet:gap-6 sheet:border-t-0 sheet:border-l sheet:px-5 sheet:py-[14px] sheet:text-[13px]">
        <a
          className={NAV_LINK}
          href="#parts"
          data-label="SECTION · PARTS"
        >
          Parts
        </a>
        <a
          className={`${NAV_LINK} border-l`}
          href="#revisions"
          data-label="SECTION · REVISIONS"
        >
          Revisions
        </a>
        <a
          className={`${NAV_LINK} border-l text-accent`}
          href="#contact"
          data-label="SECTION · CONTACT"
        >
          Contact →
        </a>
      </nav>
    </header>
  );
}
