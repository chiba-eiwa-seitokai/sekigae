import "server-only";
import { isAuthenticated } from "@/lib/session/app-auth";
import { getDriveClient, getSheetsClient } from "./client";
import type { drive_v3, sheets_v4 } from "googleapis";

async function requireLoggedIn(): Promise<void> {
  if (!(await isAuthenticated())) {
    throw new Error("Not authenticated");
  }
}

/** Returns the app's service-account Sheets client, or throws if the caller isn't logged in. */
export async function requireSheetsClient(): Promise<sheets_v4.Sheets> {
  await requireLoggedIn();
  return getSheetsClient();
}

/** Returns the app's service-account Drive client, or throws if the caller isn't logged in. */
export async function requireDriveClient(): Promise<drive_v3.Drive> {
  await requireLoggedIn();
  return getDriveClient();
}
