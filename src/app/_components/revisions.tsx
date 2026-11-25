interface Revision {
  letter: string;
  title: string;
  detail: string;
  year: string;
  snap: string;
}

/** Career history, oldest first; the last entry is the current one. */
const REVISIONS: Revision[] = [
  {
    letter: "A",
    title: "Carpentry diploma",
    detail: "Before software",
    year: "2015",
    snap: "REV A · CARPENTRY · 2015",
  },
  {
    letter: "B",
    title: "HETIC",
    detail: "Master’s begins",
    year: "2015",
    snap: "REV B · HETIC · 2015",
  },
  {
    letter: "C",
    title: "Freelance",
    detail: "Full-stack · sites, apps",
    year: "2017",
    snap: "REV C · FREELANCE · 2017",
  },
  {
    letter: "D",
    title: "Flatsy",
    detail: "Graduated · lead frontend",
    year: "2020",
    snap: "REV D · FLATSY · 2020",
  },
  {
    letter: "E",
    title: "Akwai (Talk)",
    detail: "Lead · first gen-AI work",
    year: "2022",
    snap: "REV E · TALK · 2022",
  },
  {
    letter: "F",
    title: "OnlyDust",
    detail: "Frontend · design system",
    year: "2023",
    snap: "REV F · ONLYDUST · 2023",
  },
  {
    letter: "G",
    title: "Tengo",
    detail: "Full-stack · AI tenders",
    year: "2025",
    snap: "REV G · TENGO · 2025",
  },
  {
    letter: "H",
    title: "Heal.dev",
    detail: "Founding engineer · agents",
    year: "2026",
    snap: "REV H · CURRENT · 2026",
  },
];

const ROW = "grid grid-cols-[40px_minmax(0,1fr)_52px]";

export function Revisions() {
  const lastIndex = REVISIONS.length - 1;

  return (
    <div
      id="revisions"
      className="col-span-full flex flex-col border-ink bg-paper text-[14px] leading-[1.3] sheet:col-span-3 max-sheet:border-t-[1.5px] sheet:border-l-[1.5px]"
    >
      <p className="k border-b border-ink px-4 py-3 text-ink">Revisions</p>
      <div className={`${ROW} border-b border-ink`}>
        <span className="k py-2 pl-4">Rev</span>
        <span className="k p-2">Description</span>
        <span className="k py-2 pr-4">Year</span>
      </div>
      {REVISIONS.map((revision, index) => {
        const isCurrent = index === lastIndex;
        return (
          <div
            key={revision.letter}
            data-snap={revision.snap}
            className={`rev ${ROW} ${isCurrent ? "" : "border-b border-rule"}`}
          >
            <span
              className={`rl py-[7px] pl-4 font-mono ${isCurrent ? "text-accent" : ""}`}
            >
              {revision.letter}
            </span>
            <span className="min-w-0 px-2 py-[7px]">
              <span className={`block ${isCurrent ? "font-semibold" : ""}`}>
                {revision.title}
              </span>
              <span className="mt-[2px] block font-mono text-[11px] leading-[1.35] text-grey">
                {revision.detail}
              </span>
            </span>
            <span className="py-[7px] pr-4 font-mono">{revision.year}</span>
          </div>
        );
      })}
      <p className="mt-auto border-t border-ink p-4 font-mono text-[13px] leading-[1.6] text-grey"
      >
        Trained as a carpenter. Product engineer today. Same craft: joints that
        hold, between people and tools.
      </p>
    </div>
  );
}
