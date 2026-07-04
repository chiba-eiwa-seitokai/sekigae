import type { Classroom, SeatPos } from "./types";

/** Row/col/diagonal adjacency check (8-neighborhood). */
export function isAdjacent(a: SeatPos, b: SeatPos): boolean {
  if (a.row === b.row && a.col === b.col) return false;
  return Math.abs(a.row - b.row) <= 1 && Math.abs(a.col - b.col) <= 1;
}

/** All `seat` cells in a classroom, excluding any teacher-excluded coordinates. */
export function availableSeats(
  classroom: Classroom,
  excludedSeats: SeatPos[] = []
): SeatPos[] {
  const excludedKeys = new Set(excludedSeats.map(seatKey));
  const seats: SeatPos[] = [];
  for (let row = 0; row < classroom.rows; row++) {
    for (let col = 0; col < classroom.cols; col++) {
      if (classroom.layout[row]?.[col] !== "seat") continue;
      const pos = { row, col };
      if (excludedKeys.has(seatKey(pos))) continue;
      seats.push(pos);
    }
  }
  return seats;
}

export function seatKey(pos: SeatPos): string {
  return `${pos.row}:${pos.col}`;
}

/** Sequential seat number (skipping non-`seat` cells), reading rows top-to-bottom, left-to-right. */
export function getSeatNumber(classroom: Classroom, pos: SeatPos): number {
  let number = 0;
  for (let row = 0; row < classroom.rows; row++) {
    for (let col = 0; col < classroom.cols; col++) {
      if (classroom.layout[row]?.[col] !== "seat") continue;
      number++;
      if (row === pos.row && col === pos.col) return number;
    }
  }
  return -1;
}

/** Converts a studentId -> SeatPos assignment into a 2D grid of studentIds (or null for empty/non-seat cells). */
export function arrangeSeats(
  assignment: Map<string, SeatPos>,
  classroom: Classroom
): (string | null)[][] {
  const grid: (string | null)[][] = Array.from({ length: classroom.rows }, () =>
    Array.from({ length: classroom.cols }, () => null)
  );
  for (const [studentId, pos] of assignment) {
    if (grid[pos.row]) grid[pos.row][pos.col] = studentId;
  }
  return grid;
}
