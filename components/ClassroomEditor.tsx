"use client";

import { useState } from "react";
import type { CellType, Classroom } from "@/lib/sekigae/types";
import { SeatGrid } from "./SeatGrid";

const CYCLE: CellType[] = ["seat", "gap", "podium", "door", "window"];

function resizeLayout(layout: CellType[][], rows: number, cols: number): CellType[][] {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => layout[row]?.[col] ?? "seat")
  );
}

export function ClassroomEditor({
  initial,
  onSave,
}: {
  initial: Classroom;
  onSave: (classroom: Classroom) => Promise<void>;
}) {
  const [classroom, setClassroom] = useState<Classroom>(initial);
  const [saving, setSaving] = useState(false);

  function cycleCell(row: number, col: number) {
    setClassroom((prev) => {
      const layout = prev.layout.map((r) => r.slice());
      const current = layout[row][col];
      const nextIndex = (CYCLE.indexOf(current) + 1) % CYCLE.length;
      layout[row][col] = CYCLE[nextIndex];
      return { ...prev, layout };
    });
  }

  function resize(rows: number, cols: number) {
    setClassroom((prev) => ({
      ...prev,
      rows,
      cols,
      layout: resizeLayout(prev.layout, rows, cols),
    }));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col text-sm">
          教室名
          <input
            value={classroom.name}
            onChange={(e) => setClassroom((prev) => ({ ...prev, name: e.target.value }))}
            className="rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col text-sm">
          行数
          <input
            type="number"
            min={1}
            max={12}
            value={classroom.rows}
            onChange={(e) => resize(Number(e.target.value), classroom.cols)}
            className="w-20 rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col text-sm">
          列数
          <input
            type="number"
            min={1}
            max={12}
            value={classroom.cols}
            onChange={(e) => resize(classroom.rows, Number(e.target.value))}
            className="w-20 rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
      </div>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        セルをクリックすると種類が切り替わります(座席 → 空き → 教卓 → 扉 → 窓)。
      </p>

      <SeatGrid classroom={classroom} onCellClick={(pos) => cycleCell(pos.row, pos.col)} />

      <button
        type="button"
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          try {
            await onSave(classroom);
          } finally {
            setSaving(false);
          }
        }}
        className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
      >
        {saving ? "保存中..." : "保存"}
      </button>
    </div>
  );
}
