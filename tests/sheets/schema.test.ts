import { describe, expect, it } from "vitest";
import {
  STUDENTS_HEADER,
  studentRowSchema,
  rowsToObjects,
  objectToRow,
  tabName,
} from "@/lib/sheets/schema";

describe("sheets schema", () => {
  it("builds class-scoped tab names", () => {
    expect(tabName("1A", "students")).toBe("1A_Students");
    expect(tabName("1A", "assignment")).toBe("1A_Assignment");
  });

  it("round-trips student rows through header-indexed arrays", () => {
    const values = [
      [...STUDENTS_HEADER],
      ["s1", "山田太郎", "やまだたろう", "TRUE", "", "", "", "s2,s3", "s4", "1", "2", ""],
    ];
    const [student] = rowsToObjects(values, STUDENTS_HEADER, studentRowSchema);
    expect(student.studentId).toBe("s1");
    expect(student.prefFront).toBe(true);
    expect(student.distantStudentIds).toBe("s2,s3");

    const row = objectToRow(student, STUDENTS_HEADER);
    expect(row[0]).toBe("s1");
  });

  it("skips blank rows", () => {
    const values = [[...STUDENTS_HEADER], ["", "", "", "", "", "", "", "", "", "", "", ""]];
    expect(rowsToObjects(values, STUDENTS_HEADER, studentRowSchema)).toHaveLength(0);
  });
});
