"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type PropsWithChildren,
} from "react";
import { DraftingCursor } from "./drafting-cursor";
import { SketchIntro } from "./sketch-intro";

interface SheetContextValue {
  isBlueprint: boolean;
  hasBeenScaled: boolean;
  toggleBlueprint: () => void;
  scaleDrawing: () => void;
}

const SheetContext = createContext<SheetContextValue | null>(null);

export function useSheet() {
  const value = use(SheetContext);
  if (value === null) {
    throw new Error("useSheet must be used inside <Sheet>");
  }
  return value;
}

const FINE_POINTER = "(pointer: fine)";
const ZONE_COLUMNS = ["A", "B", "C", "D", "E", "F"];
const ZONE_ROWS = ["1", "2", "3", "4"];
const ZONE = "k fade absolute flex justify-around text-ink max-sheet:hidden";

function subscribeFinePointer(onChange: () => void) {
  const query = window.matchMedia(FINE_POINTER);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getFinePointer() {
  return window.matchMedia(FINE_POINTER).matches;
}

function getServerFinePointer() {
  return false;
}

function ZoneLabels({ zones }: { zones: string[] }) {
  return zones.map((zone) => <span key={zone}>{zone}</span>);
}

/**
 * The drawing sheet: desk background, bordered paper with zone markers,
 * blueprint theme, the sketch intro and the drafting cursor.
 */
export function Sheet({ children }: PropsWithChildren) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scaleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [isBlueprint, setIsBlueprint] = useState(false);
  const [isScaled, setIsScaled] = useState(false);
  const [hasBeenScaled, setHasBeenScaled] = useState(false);

  const hasFinePointer = useSyncExternalStore(
    subscribeFinePointer,
    getFinePointer,
    getServerFinePointer,
  );

  const toggleBlueprint = useCallback(() => setIsBlueprint((on) => !on), []);
  const scaleDrawing = useCallback(() => {
    setIsScaled(true);
    clearTimeout(scaleTimer.current);
    scaleTimer.current = setTimeout(() => {
      setIsScaled(false);
      setHasBeenScaled(true);
    }, 700);
  }, []);

  useEffect(() => {
    return () => clearTimeout(scaleTimer.current);
  }, []);

  const context = useMemo(
    () => ({ isBlueprint, hasBeenScaled, toggleBlueprint, scaleDrawing }),
    [isBlueprint, hasBeenScaled, toggleBlueprint, scaleDrawing],
  );

  return (
    <SheetContext value={context}>
      <div
        ref={rootRef}
        data-theme={isBlueprint ? "blueprint" : undefined}
        className={`min-h-screen overflow-x-clip bg-desk p-[clamp(10px,2vw,28px)] font-sans leading-[normal] text-ink [transition:background_.6s] ${hasFinePointer ? "cur-on" : ""}`}
      >
        <div
          className="sheet-drop relative mx-auto box-content max-w-[1384px] border-2 border-ink bg-paper sheet:p-[26px] [transition:transform_.5s_cubic-bezier(.3,1.5,.5,1)]"
          style={{ transform: isScaled ? "scale(.93) rotate(-.8deg)" : "none" }}
        >
          <div className={`${ZONE} top-[6px] right-[26px] left-[26px]`}>
            <ZoneLabels zones={ZONE_COLUMNS} />
          </div>
          <div className={`${ZONE} right-[26px] bottom-[6px] left-[26px]`}>
            <ZoneLabels zones={ZONE_COLUMNS} />
          </div>
          <div
            className={`${ZONE} top-[26px] bottom-[26px] left-[9px] flex-col`}
          >
            <ZoneLabels zones={ZONE_ROWS} />
          </div>
          <div
            className={`${ZONE} top-[26px] right-[9px] bottom-[26px] flex-col`}
          >
            <ZoneLabels zones={ZONE_ROWS} />
          </div>

          <div className="grid-paper border-ink sheet:border-[1.5px]">
            <SketchIntro>{children}</SketchIntro>
          </div>
        </div>

        {hasFinePointer ? <DraftingCursor rootRef={rootRef} /> : null}
      </div>
    </SheetContext>
  );
}
