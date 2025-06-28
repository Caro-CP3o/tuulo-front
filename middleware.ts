import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { hasRole } from "@/helpers/auth";
import { UserType } from "@/types/api";

const PROTECTED_PATHS = [
  "/auth/",
  "/profile",
  "/home",
  "/create-family",
  "/update-family",
];
const ADMIN_ONLY_PATHS = ["/auth/settings", "/settings"];


export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const path = req.nextUrl.pathname;
  

  const isProtected = PROTECTED_PATHS.some((protectedPath) => path.startsWith(protectedPath));
  const isAdminOnly = ADMIN_ONLY_PATHS.some((adminPath) => path.startsWith(adminPath));
  

  if (isProtected || isAdminOnly) {
    if (!token) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    try {
      const publicKey = process.env.JWT_PUBLIC_KEY?.replace(/\\n/g, "\n");
      if (!publicKey) throw new Error("Missing JWT public key");

      const decoded = verify(token, publicKey, { algorithms: ["RS256"] }) as UserType;

      if (isAdminOnly) {
  if (!hasRole(decoded, "ROLE_FAMILY_ADMIN")) {
    throw new Error(`Unauthorized. Roles: ${JSON.stringify(decoded.roles)}`);
  }
}

      return NextResponse.next();
    } catch (err) {
      console.warn("Invalid token", err);
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();

  
}