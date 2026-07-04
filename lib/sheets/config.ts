import type { sheets_v4 } from "googleapis";
import {
  CONFIG_HEADER,
  configRowSchema,
  objectToRow,
  rowsToObjects,
  tabName,
  type ConfigRow,
} from "./schema";

const CLASSROOM_ID_KEY = "classroomId";

export async function getClassConfig(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  className: string
): Promise<ConfigRow[]> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: tabName(className, "config"),
  });
  return rowsToObjects(res.data.values ?? [], CONFIG_HEADER, configRowSchema);
}

export async function getClassClassroomId(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  className: string
): Promise<string | undefined> {
  const rows = await getClassConfig(sheets, spreadsheetId, className);
  return rows.find((r) => r.key === CLASSROOM_ID_KEY)?.value || undefined;
}

export async function setClassClassroomId(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  className: string,
  classroomId: string
): Promise<void> {
  const rows = await getClassConfig(sheets, spreadsheetId, className);
  const index = rows.findIndex((r) => r.key === CLASSROOM_ID_KEY);
  const updated: ConfigRow = { key: CLASSROOM_ID_KEY, value: classroomId };
  if (index >= 0) rows[index] = updated;
  else rows.push(updated);

  const values = [[...CONFIG_HEADER], ...rows.map((r) => objectToRow(r, CONFIG_HEADER))];
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tabName(className, "config")}!A1`,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}
