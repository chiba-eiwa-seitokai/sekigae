"use client";

import type { CellType } from "@/lib/sekigae/types";

const CELL_LABEL: Record<CellType, string> = {
  seat: "",
  gap: "",
  podium: "教卓",
  door: "扉",
  window: "窓",
};

const CELL_STYLE: Record<CellType, string> = {
  seat: "bg-white border-zinc-300 dark:bg-zinc-900 dark:border-zinc-700",
  gap: "bg-transparent border-dashed border-zinc-300 dark:border-zinc-700",
  podium: "bg-amber-100 border-amber-300 dark:bg-amber-950 dark:border-amber-800",
  door: "bg-sky-100 border-sky-300 dark:bg-sky-950 dark:border-sky-800",
  window: "bg-cyan-50 border-cyan-200 dark:bg-cyan-950 dark:border-cyan-900",
};

export function SeatCell({
  type,
  label,
  onClick,
  selected,
}: {
  type: CellType;
  label?: string;
  onClick?: () => void;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`flex h-14 w-14 items-center justify-center rounded-md border text-xs ${CELL_STYLE[type]} ${
        selected ? "ring-2 ring-blue-500" : ""
      }`}
    >
      {label ?? CELL_LABEL[type]}
    </button>
  );
}
