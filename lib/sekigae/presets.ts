import type { CellType, Classroom } from "./types";

function grid(rows: number, cols: number, fill: CellType = "seat"): CellType[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => fill));
}

/** Standard 6x6 rows/columns grid with the podium at the front. */
function standardGrid(): Classroom {
  const rows = 6;
  const cols = 6;
  const layout = grid(rows, cols);
  layout[0][cols - 1] = "podium";
  return { id: "preset-standard", name: "標準グリッド", rows, cols, layout };
}

/** A room with a window-side gap column (e.g. a walkway along the windows). */
function windowGapGrid(): Classroom {
  const rows = 6;
  const cols = 7;
  const layout = grid(rows, cols);
  for (let row = 0; row < rows; row++) layout[row][cols - 1] = "window";
  layout[0][0] = "podium";
  return { id: "preset-window-gap", name: "窓側通路あり", rows, cols, layout };
}

/** A room with a gap next to the door. */
function doorGapGrid(): Classroom {
  const rows = 6;
  const cols = 6;
  const layout = grid(rows, cols);
  layout[rows - 1][0] = "door";
  layout[rows - 1][1] = "gap";
  layout[0][cols - 1] = "podium";
  return { id: "preset-door-gap", name: "扉横に空きあり", rows, cols, layout };
}

export function classroomPresets(): Classroom[] {
  return [standardGrid(), windowGapGrid(), doorGapGrid()];
}
