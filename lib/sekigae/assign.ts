import type {
  AssignSeatsOptions,
  AssignSeatsResult,
  Classroom,
  SeatPos,
  Student,
} from "./types";
import { availableSeats, seatKey } from "./grid";
import { assignablePool, sortByPriority } from "./priority";
import { createRng, shuffleArray } from "./rng";

const ZONE_BAND_RATIO = 1 / 3;

/**
 * Picks a seat for `student` from `seats` (already shuffled), preferring the
 * zone matching their directional preference. Falls back to any remaining
 * seat when the preferred zone is empty or the student has no preference.
 */
export function findBestSeat(
  student: Student,
  seats: SeatPos[],
  classroom: Classroom
): SeatPos | undefined {
  if (seats.length === 0) return undefined;
  const direction = student.prefs.direction;
  if (direction === "none") return seats[0];

  const rowBand = Math.max(1, Math.round(classroom.rows * ZONE_BAND_RATIO));
  const colBand = Math.max(1, Math.round(classroom.cols * ZONE_BAND_RATIO));

  const inZone = seats.filter((seat) => {
    switch (direction) {
      case "front":
        return seat.row < rowBand;
      case "rear":
        return seat.row >= classroom.rows - rowBand;
      case "left":
        return seat.col < colBand;
      case "right":
        return seat.col >= classroom.cols - colBand;
      default:
        return false;
    }
  });

  return inZone[0] ?? seats[0];
}

export function assignSeats(
  students: Student[],
  classroom: Classroom,
  options: AssignSeatsOptions = {}
): AssignSeatsResult {
  const rng = createRng(options.seed);
  const pool = assignablePool(students);

  const fixedSeatKeys = new Map<string, string>(); // seatKey -> studentId, for duplicate validation
  for (const student of pool) {
    if (!student.fixedSeat) continue;
    const key = seatKey(student.fixedSeat);
    const existing = fixedSeatKeys.get(key);
    if (existing) {
      throw new Error(
        `Duplicate fixed seat assignment: students "${existing}" and "${student.studentId}" are both fixed to seat ${key}`
      );
    }
    fixedSeatKeys.set(key, student.studentId);
  }

  let seats = shuffleArray(availableSeats(classroom), rng);
  const assignment = new Map<string, SeatPos>();

  // Fixed-seat students are placed first and unconditionally; their seats are
  // removed from the pool so the algorithm never touches them again.
  const fixedStudents = pool.filter((s) => s.fixedSeat);
  for (const student of fixedStudents) {
    assignment.set(student.studentId, student.fixedSeat!);
    seats = seats.filter((seat) => seatKey(seat) !== seatKey(student.fixedSeat!));
  }

  const remaining = sortByPriority(pool.filter((s) => !s.fixedSeat));
  const unseated: string[] = [];

  for (const student of remaining) {
    const seat = findBestSeat(student, seats, classroom);
    if (!seat) {
      unseated.push(student.studentId);
      continue;
    }
    assignment.set(student.studentId, seat);
    seats = seats.filter((s) => seatKey(s) !== seatKey(seat));
  }

  return { assignment, unseated };
}
