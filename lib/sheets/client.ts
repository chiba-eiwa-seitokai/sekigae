import { google, sheets_v4, drive_v3 } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

function serviceAccountAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !privateKey) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY is not configured"
    );
  }
  return new google.auth.JWT({ email, key: privateKey, scopes: SCOPES });
}

/** The service account's email address, shown to teachers so they can share their spreadsheet with it. */
export function getServiceAccountEmail(): string {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  if (!email) throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL is not configured");
  return email;
}

/** Creates a Sheets client authenticated as the app's Google service account. */
export function getSheetsClient(): sheets_v4.Sheets {
  return google.sheets({ version: "v4", auth: serviceAccountAuth() });
}

/** Creates a Drive client authenticated as the app's Google service account, used to share newly-created spreadsheets back to a teacher. */
export function getDriveClient(): drive_v3.Drive {
  return google.drive({ version: "v3", auth: serviceAccountAuth() });
}
