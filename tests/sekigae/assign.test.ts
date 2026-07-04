import { describe, expect, it } from "vitest";
import { assignSeats } from "@/lib/sekigae/assign";
import type { Classroom, Student } from "@/lib/sekigae/types";

function makeClassroom(): Classroom {
  return {
    id: "c1",
    name: "3x3",
    rows: 3,
    cols: 3,
    layout: [
      ["seat", "seat", "seat"],
      ["seat", "gap", "seat"],
      ["seat", "seat", "seat"],
    ],
  };
}

function makeStudent(id: string, overrides: Partial<Student> = {}): Student {
  return {
    studentId: id,
    prefs: { direction: "none", distantStudentIds: [] },
    ...overrides,
  };
}

describe("assignSeats", () => {
  it("never moves a student with a fixed seat", () => {
    const classroom = makeClassroom();
    const students = [
      makeStudent("s1", { fixedSeat: { row: 1, col: 0 } }),
      makeStudent("s2"),
      makeStudent("s3"),
    ];
    const { assignment } = assignSeats(students, classroom, { seed: 42 });
    expect(assignment.get("s1")).toEqual({ row: 1, col: 0 });
  });

  it("never assigns a seat to an excluded student", () => {
    const classroom = makeClassroom();
    const students = [makeStudent("s1", { excluded: true }), makeStudent("s2")];
    const { assignment } = assignSeats(students, classroom, { seed: 1 });
    expect(assignment.has("s1")).toBe(false);
    expect(assignment.has("s2")).toBe(true);
  });

  it("throws on duplicate fixed-seat assignment", () => {
    const classroom = makeClassroom();
    const students = [
      makeStudent("s1", { fixedSeat: { row: 0, col: 0 } }),
      makeStudent("s2", { fixedSeat: { row: 0, col: 0 } }),
    ];
    expect(() => assignSeats(students, classroom)).toThrow();
  });

  it("respects directional preference zones", () => {
    const classroom = makeClassroom();
    const students = [makeStudent("s1", { prefs: { direction: "front", distantStudentIds: [] } })];
    const { assignment } = assignSeats(students, classroom, { seed: 7 });
    const seat = assignment.get("s1")!;
    expect(seat.row).toBe(0);
  });

  it("reports unseated students when there aren't enough seats", () => {
    const classroom: Classroom = {
      id: "tiny",
      name: "tiny",
      rows: 1,
      cols: 1,
      layout: [["seat"]],
    };
    const students = [makeStudent("s1"), makeStudent("s2")];
    const { assignment, unseated } = assignSeats(students, classroom, { seed: 3 });
    expect(assignment.size).toBe(1);
    expect(unseated.length).toBe(1);
  });
});
