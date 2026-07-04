"use client";

import { useState } from "react";
import type { Classroom, SeatPos } from "@/lib/sekigae/types";
import { seatKey } from "@/lib/sekigae/grid";
import { SeatGrid } from "./SeatGrid";

export function ManualSeatEditor({
  classroom,
  labels,
  onSwap,
}: {
  classroom: Classroom;
  labels: Record<string, string>;
  onSwap: (from: SeatPos, to: SeatPos) => Promise<void>;
}) {
  const [selected, setSelected] = useState<SeatPos | undefined>(undefined);

  async function handleClick(pos: SeatPos) {
    if (!selected) {
      if (labels[seatKey(pos)]) setSelected(pos);
      return;
    }
    if (seatKey(selected) !== seatKey(pos)) {
      await onSwap(selected, pos);
    }
    setSelected(undefined);
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        生徒のいる座席をクリックして選択し、移動先の座席をクリックすると入れ替わります。
      </p>
      <SeatGrid classroom={classroom} labels={labels} selected={selected} onCellClick={handleClick} />
    </div>
  );
}
