import type { sheets_v4 } from "googleapis";
import type { Assignment, Classroom, SeatPos } from "@/lib/sekigae/types";
import { getSeatNumber } from "@/lib/sekigae/grid";
import {
  ASSIGNMENT_HEADER,
  assignmentRowSchema,
  objectToRow,
  rowsToObjects,
  tabName,
  type AssignmentRow,
} from "./schema";

export async function readAssignment(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  className: string
): Promise<AssignmentRow[]> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: tabName(className, "assignment"),
  });
  return rowsToObjects(res.data.values ?? [], ASSIGNMENT_HEADER, assignmentRowSchema);
}

export async function writeAssignment(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  className: string,
  assignment: Assignment,
  classroom: Classroom
): Promise<void> {
  const generatedAt = new Date().toISOString();
  const rows: AssignmentRow[] = [...assignment.entries()].map(([studentId, pos]) => ({
    studentId,
    row: pos.row,
    col: pos.col,
    seatNumber: getSeatNumber(classroom, pos),
    generatedAt,
    isManualOverride: false,
  }));

  const values = [
    [...ASSIGNMENT_HEADER],
    ...rows.map((r) => objectToRow(r, ASSIGNMENT_HEADER)),
  ];
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tabName(className, "assignment")}!A1`,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}

/** Swaps whichever students occupy `from` and `to`, marking both as manual overrides. */
export async function swapAssignedSeats(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  className: string,
  from: SeatPos,
  to: SeatPos,
  classroom: Classroom
): Promise<void> {
  const rows = await readAssignment(sheets, spreadsheetId, className);
  const now = new Date().toISOString();
  const fromRow = rows.find((r) => r.row === from.row && r.col === from.col);
  const toRow = rows.find((r) => r.row === to.row && r.col === to.col);

  if (fromRow) {
    fromRow.row = to.row;
    fromRow.col = to.col;
    fromRow.seatNumber = getSeatNumber(classroom, to);
    fromRow.generatedAt = now;
    fromRow.isManualOverride = true;
  }
  if (toRow) {
    toRow.row = from.row;
    toRow.col = from.col;
    toRow.seatNumber = getSeatNumber(classroom, from);
    toRow.generatedAt = now;
    toRow.isManualOverride = true;
  }

  const values = [
    [...ASSIGNMENT_HEADER],
    ...rows.map((r) => objectToRow(r, ASSIGNMENT_HEADER)),
  ];
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tabName(className, "assignment")}!A1`,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}
