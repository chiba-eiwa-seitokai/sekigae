import "server-only";
import { auth } from "@/lib/auth";
import { getSheetsClient } from "./client";
import type { sheets_v4 } from "googleapis";

/** Returns an authenticated Sheets client for the current logged-in teacher, or throws. */
export async function requireSheetsClient(): Promise<sheets_v4.Sheets> {
  const session = await auth();
  if (!session?.accessToken) {
    throw new Error("Not authenticated with Google");
  }
  return getSheetsClient(session.accessToken);
}
