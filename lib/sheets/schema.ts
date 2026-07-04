import { z } from "zod";

export const SCHEMA_VERSION = "1";

export type SheetTabKind = "students" | "config" | "assignment";

const CLASSROOMS_TAB = "Classrooms";

/** Builds the tab name for a class-scoped sheet, e.g. tabName("1A", "students") -> "1A_Students". */
export function tabName(className: string, kind: SheetTabKind): string {
  const suffix = { students: "Students", config: "Config", assignment: "Assignment" }[kind];
  return `${className}_${suffix}`;
}

export function classroomsTabName(): string {
  return CLASSROOMS_TAB;
}

export const classroomRowSchema = z.object({
  classroomId: z.string().min(1),
  name: z.string().min(1),
  rows: z.coerce.number().int().positive(),
  cols: z.coerce.number().int().positive(),
  layoutJson: z.string().min(1),
});
export type ClassroomRow = z.infer<typeof classroomRowSchema>;
export const CLASSROOMS_HEADER = ["classroomId", "name", "rows", "cols", "layoutJson"] as const;

export const studentRowSchema = z.object({
  studentId: z.string().min(1),
  name: z.string().optional().default(""),
  furigana: z.string().optional().default(""),
  prefFront: z.coerce.boolean().optional().default(false),
  prefRear: z.coerce.boolean().optional().default(false),
  prefLeft: z.coerce.boolean().optional().default(false),
  prefRight: z.coerce.boolean().optional().default(false),
  distantStudentIds: z.string().optional().default(""), // comma-separated
  pairStudentId: z.string().optional().default(""),
  fixedRow: z.string().optional().default(""), // numeric string or "" when unset
  fixedCol: z.string().optional().default(""),
  excluded: z.coerce.boolean().optional().default(false),
});
export type StudentRow = z.infer<typeof studentRowSchema>;
export const STUDENTS_HEADER = [
  "studentId",
  "name",
  "furigana",
  "prefFront",
  "prefRear",
  "prefLeft",
  "prefRight",
  "distantStudentIds",
  "pairStudentId",
  "fixedRow",
  "fixedCol",
  "excluded",
] as const;

export const configRowSchema = z.object({
  key: z.string().min(1),
  value: z.string().optional().default(""),
});
export type ConfigRow = z.infer<typeof configRowSchema>;
export const CONFIG_HEADER = ["key", "value"] as const;

export const assignmentRowSchema = z.object({
  studentId: z.string().min(1),
  row: z.coerce.number().int().nonnegative(),
  col: z.coerce.number().int().nonnegative(),
  seatNumber: z.coerce.number().int().nonnegative(),
  generatedAt: z.string(),
  isManualOverride: z.coerce.boolean().optional().default(false),
});
export type AssignmentRow = z.infer<typeof assignmentRowSchema>;
export const ASSIGNMENT_HEADER = [
  "studentId",
  "row",
  "col",
  "seatNumber",
  "generatedAt",
  "isManualOverride",
] as const;

/** Converts an array-of-arrays Sheets values response into typed row objects using a header row. */
export function rowsToObjects<T>(
  values: string[][],
  header: readonly string[],
  schema: { parse: (v: unknown) => T }
): T[] {
  if (values.length === 0) return [];
  const [headerRow, ...dataRows] = values;
  const indexOf = (col: string) => headerRow.indexOf(col);
  return dataRows
    .filter((row) => row.some((cell) => cell !== undefined && cell !== ""))
    .map((row) => {
      const obj: Record<string, string> = {};
      for (const col of header) {
        const idx = indexOf(col);
        obj[col] = idx >= 0 ? (row[idx] ?? "") : "";
      }
      return schema.parse(obj);
    });
}

/** Converts a typed row object back into a plain values-array row matching `header` order. */
export function objectToRow<T extends Record<string, unknown>>(
  obj: T,
  header: readonly string[]
): (string | number | boolean)[] {
  return header.map((col) => {
    const value = obj[col as keyof T];
    return value === undefined ? "" : (value as string | number | boolean);
  });
}
