import type { sheets_v4 } from "googleapis";
import type { Student } from "@/lib/sekigae/types";
import {
  STUDENTS_HEADER,
  objectToRow,
  rowsToObjects,
  studentRowSchema,
  tabName,
  type StudentRow,
} from "./schema";

function rowToStudent(row: StudentRow): Student {
  const hasFixed = row.fixedRow !== "" && row.fixedCol !== "";
  return {
    studentId: row.studentId,
    name: row.name || undefined,
    furigana: row.furigana || undefined,
    fixedSeat: hasFixed ? { row: Number(row.fixedRow), col: Number(row.fixedCol) } : undefined,
    excluded: row.excluded,
    prefs: {
      direction: row.prefFront
        ? "front"
        : row.prefRear
          ? "rear"
          : row.prefLeft
            ? "left"
            : row.prefRight
              ? "right"
              : "none",
      distantStudentIds: row.distantStudentIds
        ? row.distantStudentIds.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      pairStudentId: row.pairStudentId || undefined,
    },
  };
}

function studentToRow(student: Student): StudentRow {
  const direction = student.prefs.direction;
  return {
    studentId: student.studentId,
    name: student.name ?? "",
    furigana: student.furigana ?? "",
    prefFront: direction === "front",
    prefRear: direction === "rear",
    prefLeft: direction === "left",
    prefRight: direction === "right",
    distantStudentIds: student.prefs.distantStudentIds.join(","),
    pairStudentId: student.prefs.pairStudentId ?? "",
    fixedRow: student.fixedSeat ? String(student.fixedSeat.row) : "",
    fixedCol: student.fixedSeat ? String(student.fixedSeat.col) : "",
    excluded: student.excluded ?? false,
  };
}

export async function listStudents(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  className: string
): Promise<Student[]> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: tabName(className, "students"),
  });
  const rows = rowsToObjects(res.data.values ?? [], STUDENTS_HEADER, studentRowSchema);
  return rows.map(rowToStudent);
}

export async function upsertStudent(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  className: string,
  student: Student
): Promise<void> {
  const existing = await listStudents(sheets, spreadsheetId, className);
  const index = existing.findIndex((s) => s.studentId === student.studentId);
  const rows = [...existing];
  if (index >= 0) rows[index] = student;
  else rows.push(student);
  await writeAll(sheets, spreadsheetId, className, rows);
}

/** Bulk-replaces the class roster, e.g. from a CSV import. */
export async function bulkImportStudents(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  className: string,
  students: Student[]
): Promise<void> {
  await writeAll(sheets, spreadsheetId, className, students);
}

async function writeAll(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  className: string,
  students: Student[]
): Promise<void> {
  const values = [
    [...STUDENTS_HEADER],
    ...students.map((s) => objectToRow(studentToRow(s), STUDENTS_HEADER)),
  ];
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tabName(className, "students")}!A1`,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}
