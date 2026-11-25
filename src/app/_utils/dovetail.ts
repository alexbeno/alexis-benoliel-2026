/** Offset (in drawing units) at which part 2 sits fully inside part 1. */
export const SEATED_X = -158;
/** Largest miss, in mm, that still counts as a fit. */
export const TOLERANCE_MM = 4;
/** A fit at or under this many mm kicks up sawdust. */
export const CLEAN_FIT_MM = 1.5;

const UNITS_PER_MM = 3;

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/** Distance in mm between where the part was dropped and the seated position. */
export function getMissDistance(x: number, y: number) {
  return Math.hypot(x - SEATED_X, y) / UNITS_PER_MM;
}

export function getFitGrade(toleranceMm: number) {
  if (toleranceMm <= 0.5) {
    return "MASTER CARPENTER";
  }
  if (toleranceMm <= CLEAN_FIT_MM) {
    return "JOURNEYMAN";
  }
  return "APPRENTICE";
}
