import type { Assignment, Student } from "./types";
import { isAdjacent } from "./grid";

const DEFAULT_MAX_PASSES = 50;

/**
 * Counts unmet constraints: pairs that should be adjacent but aren't, plus
 * pairs that should be distant but are adjacent. Lower is better.
 */
export function violationScore(assignment: Assignment, students: Student[]): number {
  let score = 0;

  for (const student of students) {
    const mySeat = assignment.get(student.studentId);
    if (!mySeat) continue;

    const pairId = student.prefs.pairStudentId;
    if (pairId) {
      const pairSeat = assignment.get(pairId);
      if (pairSeat && !isAdjacent(mySeat, pairSeat)) score++;
    }

    for (const distantId of student.prefs.distantStudentIds) {
      const distantSeat = assignment.get(distantId);
      if (distantSeat && isAdjacent(mySeat, distantSeat)) score++;
    }
  }

  return score;
}

/**
 * Greedily swaps seats among non-fixed, seated students to reduce
 * `violationScore` (satisfy pairStudentId / distantStudentIds preferences),
 * without ever moving a fixed-seat student. Runs until no improving swap is
 * found or `maxAdjustPasses` is reached.
 */
export function doPostSeatAdjustment(
  assignment: Assignment,
  students: Student[],
  maxAdjustPasses = DEFAULT_MAX_PASSES
): Assignment {
  const fixedIds = new Set(students.filter((s) => s.fixedSeat).map((s) => s.studentId));
  const swappableIds = [...assignment.keys()].filter((id) => !fixedIds.has(id));

  const result = new Map(assignment);

  for (let pass = 0; pass < maxAdjustPasses; pass++) {
    let improved = false;

    outer: for (let i = 0; i < swappableIds.length; i++) {
      for (let j = i + 1; j < swappableIds.length; j++) {
        const idA = swappableIds[i];
        const idB = swappableIds[j];

        const before = violationScore(result, students);
        const seatA = result.get(idA)!;
        const seatB = result.get(idB)!;
        result.set(idA, seatB);
        result.set(idB, seatA);
        const after = violationScore(result, students);

        if (after < before) {
          improved = true;
          break outer;
        }
        // revert
        result.set(idA, seatA);
        result.set(idB, seatB);
      }
    }

    if (!improved) break;
  }

  return result;
}
