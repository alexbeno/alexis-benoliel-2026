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
            className="stroke-red"
            strokeWidth="1.2"
          />
        </pattern>
      </defs>
      <path d="M0 0H24V18L36 12V36L24 30V48H0Z" className="fill-ink" />
      <path
        className="rp stroke-red"
        d="M24.9 0.9H47.1V47.1H24.9V30.6L36.9 36.6V11.4L24.9 17.4Z"
        fill="url(#logo-hatch)"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 grid grid-cols-12 border-b-[1.5px] border-ink bg-paper shadow-[0_6px_0_-4px_rgba(26,26,26,.08)]">
      <a
        href="#top"
        data-label="TOP OF SHEET"
        className="logo col-span-full flex items-center gap-[14px] px-5 py-[14px] sheet:col-span-4"
      >
        <DovetailMark />
        <span className="font-mono text-[13px] leading-[1.35] font-medium text-ink">
          ALEXIS BENOLIEL
          <br />
          <span className="font-normal text-grey">Product Engineer</span>
        </span>
      </a>
      <div className="col-span-4 flex justify-between gap-3 border-l border-ink px-5 py-[14px] max-sheet:hidden">
        <div>
          <span className="k block">Dwg. no.</span>
          <span className="font-mono text-[15px]">AB-2026-001</span>
        </div>
        <div className="text-right">
          <span className="k block">Cursor</span>
          <span data-cursor-xy className="font-mono text-[15px] text-red">
            X 0000 · Y 0000
          </span>
        </div>
      </div>
      <nav className="col-span-full flex items-center justify-end gap-6 border-ink px-5 py-[14px] font-mono text-[13px] uppercase sheet:col-span-4 sheet:border-l">
        <a className="ul" href="#parts" data-label="SECTION · PARTS">
          Parts
        </a>
        <a className="ul" href="#revisions" data-label="SECTION · REVISIONS">
          Revisions
        </a>
        <a
          className="ul text-red"
          href="#contact"
          data-label="SECTION · CONTACT"
        >
          Contact →
        </a>
      </nav>
    </header>
  );
}
