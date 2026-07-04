import { describe, expect, it } from "vitest";
import { doPostSeatAdjustment, violationScore } from "@/lib/sekigae/adjust";
import { isAdjacent } from "@/lib/sekigae/grid";
import type { Assignment, Student } from "@/lib/sekigae/types";

function makeStudent(id: string, overrides: Partial<Student> = {}): Student {
  return {
    studentId: id,
    prefs: { direction: "none", distantStudentIds: [] },
    ...overrides,
  };
}

describe("doPostSeatAdjustment", () => {
  it("brings a pair together when geometrically possible", () => {
    const students = [
      makeStudent("s1", { prefs: { direction: "none", distantStudentIds: [], pairStudentId: "s2" } }),
      makeStudent("s2"),
      makeStudent("s3"),
      makeStudent("s4"),
    ];
    const assignment: Assignment = new Map([
      ["s1", { row: 0, col: 0 }],
      ["s2", { row: 2, col: 2 }],
      ["s3", { row: 0, col: 1 }],
      ["s4", { row: 2, col: 1 }],
    ]);

    const result = doPostSeatAdjustment(assignment, students);
    expect(isAdjacent(result.get("s1")!, result.get("s2")!)).toBe(true);
  });

  it("reduces adjacency for a distant request", () => {
    const students = [
      makeStudent("s1", { prefs: { direction: "none", distantStudentIds: ["s2"] } }),
      makeStudent("s2"),
      makeStudent("s3"),
    ];
    const assignment: Assignment = new Map([
      ["s1", { row: 0, col: 0 }],
      ["s2", { row: 0, col: 1 }],
      ["s3", { row: 2, col: 2 }],
    ]);

    const before = violationScore(assignment, students);
    const result = doPostSeatAdjustment(assignment, students);
    const after = violationScore(result, students);
    expect(after).toBeLessThanOrEqual(before);
    expect(isAdjacent(result.get("s1")!, result.get("s2")!)).toBe(false);
  });

  it("never moves a fixed-seat student's seat", () => {
    const students = [
      makeStudent("s1", { fixedSeat: { row: 0, col: 0 }, prefs: { direction: "none", distantStudentIds: [], pairStudentId: "s2" } }),
      makeStudent("s2"),
      makeStudent("s3"),
    ];
    const assignment: Assignment = new Map([
      ["s1", { row: 0, col: 0 }],
      ["s2", { row: 2, col: 2 }],
      ["s3", { row: 0, col: 1 }],
    ]);

    const result = doPostSeatAdjustment(assignment, students);
    expect(result.get("s1")).toEqual({ row: 0, col: 0 });
  });
});
