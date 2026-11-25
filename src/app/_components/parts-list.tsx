import type { ReactNode } from "react";
import { getRevealDelay } from "../_utils/reveal";

interface Part {
  item: string;
  name: string;
  description: ReactNode;
  material: string;
  snap: string;
}

const PARTS: Part[] = [
  {
    item: "01",
    name: "What I do",
    description:
      "Senior Fullstack Product Engineer. I turn product needs into reliable interfaces, from design system to production.",
    material: "TypeScript · React · Node",
    snap: "ITEM 01 · WHAT I DO",
  },
  {
    item: "02",
    name: "Right now",
    description: (
      <>
        Founding Product Engineer at{" "}
        <a
          className="ul underline"
          href="https://heal.dev"
          target="_blank"
          rel="noopener"
        >
          Heal.dev
        </a>
        . I design how people work with our AI agents: desktop, CLI, VS Code,
        web. Launched at #4 Product of the Day on Product Hunt.
      </>
    ),
    material: "Claude Agent SDK · Electron",
    snap: "ITEM 02 · RIGHT NOW",
  },
  {
    item: "03",
    name: "Before",
    description:
      "Tengo, OnlyDust, Talk, Flatsy, Clint. Lead three times, shipping generative AI features since 2022, and six years of freelance alongside.",
    material: "Design systems · Product",
    snap: "ITEM 03 · BEFORE",
  },
];

const HEAD = "border-b border-ink font-normal";

export function PartsList() {
  return (
    <div
      data-r
      style={getRevealDelay(0.15)}
      className="col-span-full overflow-x-auto border-ink bg-paper sheet:col-span-7 sheet:border-l-[1.5px]"
    >
      <table className="w-full min-w-[480px] border-collapse text-[16px]">
        <thead>
          <tr className="k text-left">
            <th className={`${HEAD} box-content w-14 py-3 pr-2 pl-[18px]`}>
              Item
            </th>
            <th className={`${HEAD} w-[24%] p-3`}>Part</th>
            <th className={`${HEAD} py-3 pr-5 pl-3`}>Description · Material</th>
          </tr>
        </thead>
        <tbody>
          {PARTS.map((part, index) => (
            <tr
              key={part.item}
              data-snap={part.snap}
              className={`pt ${index > 0 ? "border-t border-rule" : ""}`}
            >
              <td className="py-[18px] pr-2 pl-[14px] align-top font-mono leading-6 text-red">
                <span className="itm">{part.item}</span>
              </td>
              <td className="px-3 py-[18px] align-top font-serif text-[27px] leading-6">
                {part.name}
              </td>
              <td className="py-[18px] pr-5 pl-3 align-top leading-6">
                {part.description}
                <span className="mt-[6px] block font-mono text-[13px] text-grey">
                  {part.material}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
