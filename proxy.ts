import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, isValidSessionValue } from "@/lib/session/app-auth";

export default function proxy(req: NextRequest) {
  const cookieValue = req.cookies.get(SESSION_COOKIE)?.value;
  if (!isValidSessionValue(cookieValue)) {
    const loginUrl = new URL("/login", req.nextUrl);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/teacher/:path*"],
};
