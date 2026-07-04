"use client";

import { useState } from "react";
import type { Classroom, Student } from "@/lib/sekigae/types";
import { seatKey } from "@/lib/sekigae/grid";
import { SeatGrid } from "./SeatGrid";

export function FixedSeatPicker({
  classroom,
  students,
  onSetFixedSeat,
  onClearFixedSeat,
}: {
  classroom: Classroom;
  students: Student[];
  onSetFixedSeat: (studentId: string, row: number, col: number) => Promise<void>;
  onClearFixedSeat: (studentId: string) => Promise<void>;
}) {
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const labels: Record<string, string> = {};
  for (const s of students) {
    if (s.fixedSeat) labels[seatKey(s.fixedSeat)] = s.name?.slice(0, 4) ?? s.studentId.slice(0, 4);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="">生徒を選択して座席をクリック</option>
          {students.map((s) => (
            <option key={s.studentId} value={s.studentId}>
              {s.name || s.studentId}
              {s.fixedSeat ? "(固定済み)" : ""}
            </option>
          ))}
        </select>
        {selectedStudentId && (
          <button
            type="button"
            onClick={() => onClearFixedSeat(selectedStudentId)}
            className="rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700"
          >
            固定解除
          </button>
        )}
      </div>

      <SeatGrid
        classroom={classroom}
        labels={labels}
        onCellClick={
          selectedStudentId
            ? (pos) => onSetFixedSeat(selectedStudentId, pos.row, pos.col)
            : undefined
        }
      />
    </div>
  );
}
