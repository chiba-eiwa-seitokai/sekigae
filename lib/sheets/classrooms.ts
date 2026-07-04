import type { sheets_v4 } from "googleapis";
import type { Classroom } from "@/lib/sekigae/types";
import {
  CLASSROOMS_HEADER,
  classroomRowSchema,
  classroomsTabName,
  objectToRow,
  rowsToObjects,
  type ClassroomRow,
} from "./schema";

function rowToClassroom(row: ClassroomRow): Classroom {
  return {
    id: row.classroomId,
    name: row.name,
    rows: row.rows,
    cols: row.cols,
    layout: JSON.parse(row.layoutJson),
  };
}

function classroomToRow(classroom: Classroom): ClassroomRow {
  return {
    classroomId: classroom.id,
    name: classroom.name,
    rows: classroom.rows,
    cols: classroom.cols,
    layoutJson: JSON.stringify(classroom.layout),
  };
}

export async function listClassrooms(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string
): Promise<Classroom[]> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: classroomsTabName(),
  });
  const rows = rowsToObjects(res.data.values ?? [], CLASSROOMS_HEADER, classroomRowSchema);
  return rows.map(rowToClassroom);
}

export async function upsertClassroom(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  classroom: Classroom
): Promise<void> {
  const existing = await listClassrooms(sheets, spreadsheetId);
  const index = existing.findIndex((c) => c.id === classroom.id);
  const rows = [...existing];
  if (index >= 0) rows[index] = classroom;
  else rows.push(classroom);

  const values = [
    [...CLASSROOMS_HEADER],
    ...rows.map((c) => objectToRow(classroomToRow(c), CLASSROOMS_HEADER)),
  ];
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${classroomsTabName()}!A1`,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}
