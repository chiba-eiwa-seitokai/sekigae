import type { Student } from "./types";

const DIRECTION_RANK: Record<Student["prefs"]["direction"], number> = {
  front: 0,
  rear: 1,
  left: 2,
  right: 3,
  none: 4,
};

/**
 * Orders students for sequential seat placement: fixed-seat students first
 * (placed unconditionally, handled separately in assignSeats), then by
 * directional preference front > rear > left > right > none.
 */
export function sortByPriority(students: Student[]): Student[] {
  return students.slice().sort((a, b) => {
    const aFixed = a.fixedSeat ? 0 : 1;
    const bFixed = b.fixedSeat ? 0 : 1;
    if (aFixed !== bFixed) return aFixed - bFixed;
    return DIRECTION_RANK[a.prefs.direction] - DIRECTION_RANK[b.prefs.direction];
  });
}

/** Students eligible for automatic assignment (excludes teacher-excluded students). */
export function assignablePool(students: Student[]): Student[] {
  return students.filter((s) => !s.excluded);
}
