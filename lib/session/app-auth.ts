import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "sekigae_session";
const SESSION_VALUE = "authenticated";

function sign(value: string): string {
  const secret = process.env.AUTH_SECRET ?? "";
  return createHmac("sha256", secret).update(value).digest("hex");
}

function safeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function verifyAccessCode(code: string): boolean {
  const expected = process.env.TEACHER_ACCESS_CODE;
  if (!expected) return false;
  return safeEquals(code, expected);
}

/** Validates a raw session cookie value. Usable from proxy.ts, which can't call `cookies()`. */
export function isValidSessionValue(value: string | undefined): boolean {
  if (!value) return false;
  return safeEquals(value, sign(SESSION_VALUE));
}

export async function createSession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, sign(SESSION_VALUE), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return isValidSessionValue(store.get(SESSION_COOKIE)?.value);
}
