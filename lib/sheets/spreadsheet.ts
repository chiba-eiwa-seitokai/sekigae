import type { drive_v3, sheets_v4 } from "googleapis";
import {
  ASSIGNMENT_HEADER,
  CLASSROOMS_HEADER,
  CONFIG_HEADER,
  STUDENTS_HEADER,
  classroomsTabName,
  tabName,
} from "./schema";

const APP_TITLE_PREFIX = "【席替え】";

/**
 * Creates a new spreadsheet owned by the app's service account, then shares it
 * back to the teacher's email so they can open/edit it directly in Google Sheets.
 */
export async function createSekigaeSpreadsheet(
  sheets: sheets_v4.Sheets,
  drive: drive_v3.Drive,
  gradeName: string,
  teacherEmail: string
): Promise<string> {
  const res = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: `${APP_TITLE_PREFIX}${gradeName}` },
      sheets: [{ properties: { title: classroomsTabName() } }],
    },
  });
  const spreadsheetId = res.data.spreadsheetId;
  if (!spreadsheetId) throw new Error("Failed to create spreadsheet");
  await writeHeader(sheets, spreadsheetId, classroomsTabName(), [...CLASSROOMS_HEADER]);
  await drive.permissions.create({
    fileId: spreadsheetId,
    sendNotificationEmail: false,
    requestBody: { type: "user", role: "writer", emailAddress: teacherEmail },
  });
  return spreadsheetId;
}

/** Ensures the tabs required for a class exist, creating any that are missing. Idempotent. */
export async function ensureClassSchema(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  className: string
): Promise<void> {
  const existing = await listTabTitles(sheets, spreadsheetId);

  if (!existing.includes(classroomsTabName())) {
    await addTab(sheets, spreadsheetId, classroomsTabName());
    await writeHeader(sheets, spreadsheetId, classroomsTabName(), [...CLASSROOMS_HEADER]);
  }

  const studentsTab = tabName(className, "students");
  if (!existing.includes(studentsTab)) {
    await addTab(sheets, spreadsheetId, studentsTab);
    await writeHeader(sheets, spreadsheetId, studentsTab, [...STUDENTS_HEADER]);
  }

  const configTab = tabName(className, "config");
  if (!existing.includes(configTab)) {
    await addTab(sheets, spreadsheetId, configTab);
    await writeHeader(sheets, spreadsheetId, configTab, [...CONFIG_HEADER]);
  }

  const assignmentTab = tabName(className, "assignment");
  if (!existing.includes(assignmentTab)) {
    await addTab(sheets, spreadsheetId, assignmentTab);
    await writeHeader(sheets, spreadsheetId, assignmentTab, [...ASSIGNMENT_HEADER]);
  }
}

export async function listClassNames(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string
): Promise<string[]> {
  const titles = await listTabTitles(sheets, spreadsheetId);
  const suffix = "_Students";
  return titles.filter((t) => t.endsWith(suffix)).map((t) => t.slice(0, -suffix.length));
}

async function listTabTitles(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string
): Promise<string[]> {
  const res = await sheets.spreadsheets.get({ spreadsheetId, fields: "sheets.properties.title" });
  return (res.data.sheets ?? []).map((s) => s.properties?.title ?? "").filter(Boolean);
}

async function addTab(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  title: string
): Promise<void> {
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: [{ addSheet: { properties: { title } } }] },
  });
}

async function writeHeader(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  tab: string,
  header: string[]
): Promise<void> {
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tab}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: [header] },
  });
}
