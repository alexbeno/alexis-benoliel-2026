import { Revisions } from "./revisions";

const SECTION_LETTER = "fade font-mono text-[15px] font-medium text-red";

/** Horizontal dimension line above the name: "7 yrs · 2017 → 2026". */
function YearsDimension() {
  return (
    <div className="dimx relative mb-[22px] ml-11 flex items-center">
      <span
        aria-hidden="true"
        className="absolute -top-[9px] left-0 h-6 w-px bg-ink"
      />
      <span
        aria-hidden="true"
        className="absolute -top-[9px] right-0 h-6 w-px bg-ink"
      />
      <svg width="11" height="7" viewBox="0 0 11 7" aria-hidden="true">
        <path d="M0 3.5L11 0.5V6.5Z" className="fill-ink" />
      </svg>
      <span className="h-px flex-1 bg-ink" />
      <span className="k px-3 text-ink">7 yrs · 2017 → 2026</span>
      <span className="h-px flex-1 bg-ink" />
      <svg width="11" height="7" viewBox="0 0 11 7" aria-hidden="true">
        <path d="M11 3.5L0 0.5V6.5Z" className="fill-ink" />
      </svg>
    </div>
  );
}

/** Vertical dimension line left of the name: "Paris, FR". */
function LocationDimension() {
  return (
    <div className="dimy relative flex w-6 flex-none flex-col items-center max-sheet:hidden">
      <span
        aria-hidden="true"
        className="absolute top-0 left-[2px] h-px w-[22px] bg-ink"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-[2px] h-px w-[22px] bg-ink"
      />
      <svg width="7" height="11" viewBox="0 0 7 11" aria-hidden="true">
        <path d="M3.5 0L6.5 11H0.5Z" className="fill-ink" />
      </svg>
      <span className="w-px flex-1 bg-ink" />
      <span className="k rotate-180 py-[10px] text-ink [writing-mode:vertical-rl]">
        Paris, FR
      </span>
      <span className="w-px flex-1 bg-ink" />
      <svg width="7" height="11" viewBox="0 0 7 11" aria-hidden="true">
        <path d="M3.5 11L6.5 0H0.5Z" className="fill-ink" />
      </svg>
    </div>
  );
}

/** Cutting-plane line "A — A" under the name. */
function SectionLine() {
  return (
    <div className="mt-[clamp(28px,3.6vw,44px)] flex items-center">
      <span className={`${SECTION_LETTER} pr-[10px]`}>A</span>
      <svg
        className="fade"
        width="34"
        height="28"
        viewBox="0 0 34 28"
        aria-hidden="true"
      >
        <path d="M0 2H32" className="stroke-red" strokeWidth="3.5" />
        <path d="M16 4V22" className="stroke-red" strokeWidth="1.5" />
        <path d="M16 28L11.5 18H20.5Z" className="fill-red" />
      </svg>
      <span className="cut cutd mt-[1.2px] flex-1 self-start" />
      <svg
        className="fade"
        width="34"
        height="28"
        viewBox="0 0 34 28"
        aria-hidden="true"
      >
        <path d="M2 2H34" className="stroke-red" strokeWidth="3.5" />
        <path d="M18 4V22" className="stroke-red" strokeWidth="1.5" />
        <path d="M18 28L13.5 18H22.5Z" className="fill-red" />
      </svg>
      <span className={`${SECTION_LETTER} pl-[10px]`}>A</span>
    </div>
  );
}

export function Hero() {
  return (
    <section id="top" className="grid grid-cols-12 border-b-[1.5px] border-ink">
      <div className="col-span-full flex flex-col justify-center overflow-hidden px-[clamp(20px,3vw,44px)] py-[clamp(40px,5vw,64px)] sheet:col-span-9">
        <YearsDimension />

        <div className="flex gap-5">
          <LocationDimension />
          <h1
            data-snap="PART 00 · NAME"
            className="m-0 min-w-0 font-display text-[clamp(38px,7.4vw,108px)] leading-[0.84] font-black tracking-[-0.03em] uppercase [font-stretch:125%]"
          >
            <span className="relative block">
              <span
                aria-hidden="true"
                className="gd top-[0.06em]"
              />
              <span
                aria-hidden="true"
                className="gd bottom-[0.08em]"
              />
              <span className="nm">Alexis</span>
            </span>
            <span className="relative block pl-[0.5em]">
              <span
                aria-hidden="true"
                className="gd top-[0.06em]"
              />
              <span
                aria-hidden="true"
                className="gd bottom-[0.08em]"
              />
              <span className="nm">Benoliel</span>
            </span>
          </h1>
        </div>

        <SectionLine />

        <p
          data-snap="NOTE · CATCHLINE"
          className="mt-[clamp(24px,3vw,36px)] max-w-[860px] font-serif text-[clamp(34px,4.2vw,60px)] leading-[1.02] tracking-[-0.01em]"
        >
          Interfaces that hold,{" "}
          <em className="text-red">between people and AI.</em>
        </p>
      </div>

      <Revisions />
    </section>
  );
}
