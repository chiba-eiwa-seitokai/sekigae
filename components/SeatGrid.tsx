"use client";

import type { Classroom, SeatPos } from "@/lib/sekigae/types";
import { seatKey } from "@/lib/sekigae/grid";
import { SeatCell } from "./SeatCell";

export function SeatGrid({
  classroom,
  labels,
  selected,
  onCellClick,
}: {
  classroom: Classroom;
  /** studentId or other label keyed by "row:col" */
  labels?: Record<string, string>;
  selected?: SeatPos;
  onCellClick?: (pos: SeatPos) => void;
}) {
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${classroom.cols}, minmax(0, 1fr))` }}
    >
      {classroom.layout.map((rowCells, row) =>
        rowCells.map((cellType, col) => {
          const pos = { row, col };
          const key = seatKey(pos);
          return (
            <SeatCell
              key={key}
              type={cellType}
              label={labels?.[key]}
              selected={selected && selected.row === row && selected.col === col}
              onClick={onCellClick ? () => onCellClick(pos) : undefined}
            />
          );
        })
      )}
    </div>
  );
}
