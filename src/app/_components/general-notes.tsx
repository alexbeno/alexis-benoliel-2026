"use client";

import { useSheet } from "./sheet";

export function GeneralNotes() {
  const { isBlueprint, hasBeenScaled, toggleBlueprint, scaleDrawing } =
    useSheet();

  return (
    <div
      data-r
      className="col-span-full px-[clamp(20px,3vw,40px)] py-6 sheet:col-span-5"
    >
      <p className="k mb-[14px] text-ink">General notes</p>
      <ol className="list-decimal pl-[22px] font-mono text-[13px] leading-[1.8] text-grey">
        <li>All dimensions in years unless noted.</li>
        <li>Built in TypeScript (React, Node).</li>
        <li>Human stays in the loop at all times.</li>
        <li>
          <button
            className="nb"
            type="button"
            data-label="NOTE 4 · DON'T"
            onClick={scaleDrawing}
          >
            {hasBeenScaled
              ? "You scaled it anyway. Now ask the author."
              : "Do not scale drawing. Ask the author."}
          </button>
        </li>
        <li>
          <button
            className="nb"
            type="button"
            data-label="NOTE 5 · REALLY, DON'T"
            onClick={toggleBlueprint}
          >
            {isBlueprint
              ? "Fine. Switch back to paper."
              : "Do not switch to blueprint mode."}
          </button>
        </li>
      </ol>
    </div>
  );
}
