"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  CLEAN_FIT_MM,
  SEATED_X,
  TOLERANCE_MM,
  clamp,
  getFitGrade,
  getMissDistance,
} from "../_utils/dovetail";

interface GameState {
  x: number;
  y: number;
  isDragging: boolean;
  isAssembled: boolean;
  isClacking: boolean;
  hasDust: boolean;
  hasFitStamp: boolean;
  isMiss: boolean;
  tries: number;
  best: number | null;
  message: string;
  stampText: string;
}

interface Drag {
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  scale: number;
  handleMove: (event: PointerEvent) => void;
  handleUp: () => void;
}

const INITIAL_STATE: GameState = {
  x: 0,
  y: 0,
  isDragging: false,
  isAssembled: false,
  isClacking: false,
  hasDust: false,
  hasFitStamp: false,
  isMiss: false,
  tries: 0,
  best: null,
  message: "",
  stampText: "",
};

const VIEWBOX_WIDTH = 480;
const PART_1 = "M70 70H142V124L178 106V178L142 160V214H70Z";
const PART_2 = "M300 70H372V214H300V160L336 178V106L300 124Z";
const PART_2_SEATED = "M142 70H214V214H142V160L178 178V106L142 124Z";

const DUST = [
  { cx: 142, cy: 96, r: 2.2, dx: -26, dy: -22 },
  { cx: 142, cy: 110, r: 1.6, dx: 30, dy: -30 },
  { cx: 146, cy: 124, r: 2, dx: 38, dy: -8 },
  { cx: 140, cy: 136, r: 1.4, dx: -36, dy: -4 },
  { cx: 144, cy: 150, r: 2.4, dx: 34, dy: 12 },
  { cx: 140, cy: 162, r: 1.6, dx: -30, dy: 20 },
  { cx: 146, cy: 176, r: 2, dx: 26, dy: 30 },
  { cx: 142, cy: 190, r: 1.5, dx: -22, dy: 34 },
];

function getDustStyle(dx: number, dy: number) {
  return { "--dx": `${dx}px`, "--dy": `${dy}px` } as CSSProperties;
}

function getPartTransition(state: GameState) {
  if (state.isDragging) {
    return "none";
  }
  if (state.isAssembled) {
    return "transform .55s cubic-bezier(.75,0,.25,1)";
  }
  return "transform .7s cubic-bezier(.3,1.5,.5,1)";
}

function getStatus(state: GameState) {
  if (state.message) {
    return state.message;
  }
  if (state.isAssembled) {
    return "ASSEMBLED · NO GLUE";
  }
  return `DRAG PART 2 INTO PART 1 · TOLERANCE ±${TOLERANCE_MM} MM`;
}

function getBestLine(state: GameState) {
  if (state.best === null) {
    return "";
  }
  return `BEST ±${state.best.toFixed(1)} MM · ${state.tries} TRIES`;
}

/** Section A–A: drag the machine part into the human part to seat the joint. */
export function DovetailGame() {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const [state, setState] = useState(INITIAL_STATE);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      const drag = dragRef.current;
      if (drag) {
        window.removeEventListener("pointermove", drag.handleMove);
        window.removeEventListener("pointerup", drag.handleUp);
      }
    };
  }, []);

  function patch(changes: Partial<GameState>) {
    setState((previous) => ({ ...previous, ...changes }));
  }

  function moveTo(x: number, y: number) {
    positionRef.current = { x, y };
  }

  function later(name: string, ms: number, changes: Partial<GameState>) {
    clearTimeout(timersRef.current.get(name));
    timersRef.current.set(
      name,
      setTimeout(() => patch(changes), ms),
    );
  }

  function seat(toleranceMm: number) {
    const tolerance = toleranceMm.toFixed(1);
    moveTo(SEATED_X, 0);
    setState((previous) => ({
      ...previous,
      x: SEATED_X,
      y: 0,
      isDragging: false,
      isAssembled: true,
      isClacking: true,
      hasDust: toleranceMm <= CLEAN_FIT_MM,
      hasFitStamp: true,
      isMiss: false,
      tries: previous.tries + 1,
      best:
        previous.best === null
          ? toleranceMm
          : Math.min(previous.best, toleranceMm),
      message: `FIT ±${tolerance} MM · ${getFitGrade(toleranceMm)}`,
      stampText: `APPROVED ±${tolerance} MM`,
    }));
    later("clack", 500, { isClacking: false });
    later("dust", 950, { hasDust: false });
    later("stamp", 2200, { hasFitStamp: false });
  }

  function reject(missMm: number) {
    moveTo(0, 0);
    setState((previous) => ({
      ...previous,
      x: 0,
      y: 0,
      isDragging: false,
      isAssembled: false,
      isMiss: true,
      tries: previous.tries + 1,
      message: `NO FIT · OFF BY ${missMm.toFixed(1)} MM · TRY AGAIN`,
    }));
  }

  function handleDragMove(event: PointerEvent) {
    const drag = dragRef.current;
    if (drag === null) {
      return;
    }
    const x = clamp(
      drag.originX + (event.clientX - drag.startX) * drag.scale,
      -230,
      90,
    );
    const y = clamp(
      drag.originY + (event.clientY - drag.startY) * drag.scale,
      -90,
      90,
    );
    moveTo(x, y);
    patch({ x, y });
  }

  function handleDragEnd() {
    const drag = dragRef.current;
    if (drag === null) {
      return;
    }
    window.removeEventListener("pointermove", drag.handleMove);
    window.removeEventListener("pointerup", drag.handleUp);
    dragRef.current = null;

    const { x, y } = positionRef.current;
    const missMm = getMissDistance(x, y);
    if (missMm <= TOLERANCE_MM) {
      seat(Math.round(missMm * 10) / 10);
      return;
    }
    reject(missMm);
  }

  function handlePointerDown(event: ReactPointerEvent<SVGGElement>) {
    const svg = svgRef.current;
    if (svg === null || dragRef.current !== null) {
      return;
    }
    event.preventDefault();
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: positionRef.current.x,
      originY: positionRef.current.y,
      scale: VIEWBOX_WIDTH / svg.getBoundingClientRect().width,
      handleMove: handleDragMove,
      handleUp: handleDragEnd,
    };
    patch({
      isDragging: true,
      isAssembled: false,
      isMiss: false,
      message: "ALIGN THE TAIL WITH THE SOCKET…",
    });
    window.addEventListener("pointermove", handleDragMove);
    window.addEventListener("pointerup", handleDragEnd);
  }

  function handleToggle() {
    if (state.isAssembled) {
      moveTo(0, 0);
      patch({ x: 0, y: 0, isAssembled: false, isMiss: false, message: "" });
      return;
    }
    moveTo(SEATED_X, 0);
    patch({
      x: SEATED_X,
      y: 0,
      isAssembled: true,
      isClacking: true,
      isMiss: false,
      message: "AUTO-ASSEMBLED · CHEATER",
    });
    later("clack", 1100, { isClacking: false });
  }

  const isHome = state.x === 0 && state.y === 0;
  const isAwaitingAssembly = isHome && !state.isAssembled;
  const buttonLabel = state.isAssembled ? "← Explode" : "Auto-assemble";

  return (
    <div
      data-r
      className="relative col-span-full flex flex-col gap-[14px] px-[clamp(20px,3vw,40px)] py-6 sheet:col-span-5"
    >
      <p className="k text-ink">Section A–A · Dovetail joint · Scale 3:1</p>
      <svg
        ref={svgRef}
        viewBox="0 0 480 312"
        width="100%"
        role="img"
        aria-label="Dovetail joint game: drag part 2, the machine, into part 1, the human"
        className={`my-auto block max-w-[540px] overflow-visible select-none ${state.isClacking ? "clack" : ""}`}
      >
        <defs>
          <pattern
            id="part-hatch"
            width="7"
            height="7"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="7"
              className="stroke-red"
              strokeWidth="1.3"
            />
          </pattern>
          <marker
            id="dim-arrow"
            viewBox="0 0 10 6"
            refX="10"
            refY="3"
            markerWidth="10"
            markerHeight="6"
            orient="auto-start-reverse"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0 0L10 3L0 6Z" className="fill-ink" />
          </marker>
          <marker
            id="dim-dot"
            viewBox="0 0 6 6"
            refX="3"
            refY="3"
            markerWidth="5"
            markerHeight="5"
            markerUnits="userSpaceOnUse"
          >
            <circle cx="3" cy="3" r="3" className="fill-ink" />
          </marker>
        </defs>

        <path
          className="fillin stroke-ink"
          d="M54 142H466"
          strokeWidth="0.7"
          strokeDasharray="16 3 3 3"
        />
        <path
          d={PART_2_SEATED}
          fill="none"
          className="stroke-red [transition:opacity_.3s]"
          strokeWidth="1"
          strokeDasharray="3 4"
          style={{ opacity: state.isDragging ? 0.9 : 0 }}
        />
        <g className="stroke-ink" strokeWidth="0.7" fill="none">
          <path
            className="draw"
            pathLength="1"
            d="M70 66V30M142 66V30M178 102V30"
          />
          <path
            className="draw"
            pathLength="1"
            d="M70 38H142"
            markerStart="url(#dim-arrow)"
            markerEnd="url(#dim-arrow)"
          />
          <path
            className="draw"
            pathLength="1"
            d="M142 38H178"
            markerStart="url(#dim-arrow)"
            markerEnd="url(#dim-arrow)"
          />
          <path className="draw" pathLength="1" d="M66 70H30M66 214H30" />
          <path
            className="draw"
            pathLength="1"
            d="M38 70V214"
            markerStart="url(#dim-arrow)"
            markerEnd="url(#dim-arrow)"
          />
        </g>
        <path
          className="fillin fill-ink"
          data-snap="PART 1 · HUMAN"
          d={PART_1}
        />
        <g
          className="[transition:opacity_.3s]"
          style={{ opacity: isAwaitingAssembly ? 1 : 0 }}
        >
          <path
            d="M196 252H282"
            className="stroke-ink"
            strokeWidth="0.7"
            strokeDasharray="6 4"
            fill="none"
            markerEnd="url(#dim-arrow)"
          />
          <text
            x="239"
            y="244"
            textAnchor="middle"
            fontSize="10"
            className="fill-grey font-mono"
          >
            ASSEMBLY
          </text>
        </g>

        <g
          data-snap="PART 2 · MACHINE · DRAG ME"
          onPointerDown={handlePointerDown}
          className="cursor-grab touch-none"
          style={{
            transform: `translate(${state.x}px,${state.y}px)`,
            transition: getPartTransition(state),
          }}
        >
          <path className="fillin" d={PART_2} fill="url(#part-hatch)" />
          <path d={PART_2} fill="transparent" />
          <path
            className="draw stroke-red"
            pathLength="1"
            d={PART_2}
            fill="none"
            strokeWidth="2"
          />
          <g
            className="stroke-ink [transition:opacity_.2s]"
            strokeWidth="0.7"
            fill="none"
            style={{ opacity: isHome ? 1 : 0 }}
          >
            <path className="draw" pathLength="1" d="M376 70H420M376 214H420" />
            <path
              className="draw"
              pathLength="1"
              d="M412 70V214"
              markerStart="url(#dim-arrow)"
              markerEnd="url(#dim-arrow)"
            />
            <path
              className="draw"
              pathLength="1"
              d="M322 171L356 238H392"
              markerStart="url(#dim-dot)"
            />
          </g>
          <g
            className="fill-ink font-mono [transition:opacity_.2s]"
            style={{ opacity: isHome ? 1 : 0 }}
          >
            <text
              x="426"
              y="146"
              transform="rotate(-90 426 142)"
              textAnchor="middle"
              fontSize="12"
            >
              48
            </text>
            <text x="358" y="234" fontSize="11" letterSpacing="1">
              SLOPE 1:2
            </text>
          </g>
          <text
            x="300"
            y="304"
            fontSize="11"
            letterSpacing="1"
            className="fill-red font-mono"
          >
            2 · MACHINE
          </text>
        </g>

        <g className="fill-ink font-mono" fontSize="12" textAnchor="middle">
          <text x="106" y="32">
            24
          </text>
          <text x="160" y="32">
            12
          </text>
          <text x="30" y="146" transform="rotate(-90 30 142)">
            48
          </text>
        </g>
        <text
          x="70"
          y="286"
          fontSize="11"
          letterSpacing="1"
          className="fill-ink font-mono"
        >
          1 · HUMAN
        </text>
        <text
          x="250"
          y="256"
          textAnchor="middle"
          fontSize="12"
          letterSpacing="1.5"
          className="fill-red font-mono [transition:opacity_.3s_.5s]"
          style={{ opacity: state.isAssembled ? 1 : 0 }}
        >
          ✓ NO GLUE REQUIRED
        </text>
        {state.hasDust ? (
          <g>
            {DUST.map((speck, index) => (
              <circle
                key={speck.cy}
                className={`dust ${index % 2 === 0 ? "fill-red" : "fill-ink"}`}
                cx={speck.cx}
                cy={speck.cy}
                r={speck.r}
                style={getDustStyle(speck.dx, speck.dy)}
              />
            ))}
          </g>
        ) : null}
      </svg>

      <div className="flex flex-wrap items-center gap-[14px]">
        <button
          type="button"
          data-label={buttonLabel}
          onClick={handleToggle}
          className="btn box-content min-h-11 border-[1.5px] border-ink bg-transparent px-[18px] font-mono text-[13px] tracking-[.06em] uppercase"
        >
          {buttonLabel}
        </button>
        <div className="flex flex-col gap-[2px]">
          <span className={`k ${state.isMiss ? "text-red" : ""}`}>
            {getStatus(state)}
          </span>
          <span className="k">{getBestLine(state)}</span>
        </div>
      </div>

      {state.hasFitStamp ? (
        <div
          aria-live="polite"
          className="stamp pointer-events-none absolute top-10 right-6 border-[3px] border-red bg-paper px-[14px] py-2 font-mono text-[16px] font-medium tracking-[.1em] whitespace-nowrap text-red"
        >
          {state.stampText}
        </div>
      ) : null}
    </div>
  );
}
