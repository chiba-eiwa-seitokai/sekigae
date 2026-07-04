import "server-only";
import { cookies } from "next/headers";

const SPREADSHEET_COOKIE = "sekigae_spreadsheet_id";
const CLASS_COOKIE = "sekigae_active_class";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function getConnectedSpreadsheetId(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(SPREADSHEET_COOKIE)?.value;
}

export async function setConnectedSpreadsheetId(spreadsheetId: string): Promise<void> {
  const store = await cookies();
  store.set(SPREADSHEET_COOKIE, spreadsheetId, COOKIE_OPTIONS);
}

export async function getActiveClassName(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(CLASS_COOKIE)?.value;
}

export async function setActiveClassName(className: string): Promise<void> {
  const store = await cookies();
  store.set(CLASS_COOKIE, className, COOKIE_OPTIONS);
}
