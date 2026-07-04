import { google, sheets_v4 } from "googleapis";

/** Creates a per-request authenticated Sheets client from the signed-in user's OAuth access token. */
export function getSheetsClient(accessToken: string): sheets_v4.Sheets {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.sheets({ version: "v4", auth });
}

/** Creates a per-request authenticated Drive client, used only for the Picker's "create new" flow. */
export function getDriveClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.drive({ version: "v3", auth });
}
