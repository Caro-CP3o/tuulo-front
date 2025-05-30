// import { NextRequest, NextResponse } from "next/server";
// import { verify } from "jsonwebtoken";

// const PROTECTED_PATHS = [
//   '/auth/',
//   '/profile',
//   '/home',
//   '/create-family',
//   '/update-family',
// ];

// export function middleware(req: NextRequest) {
//   const token = req.cookies.get("token")?.value;
//   const isAuthRoute = req.nextUrl.pathname.startsWith("/auth");
  

  
//   if (isAuthRoute) {
//     if (!token) {
//       return NextResponse.redirect(new URL("/login", req.url));
//     }

//     try {
//       const publicKey = process.env.JWT_PUBLIC_KEY!;
//       verify(token, publicKey, { algorithms: ["RS256"] });

//       return NextResponse.next();
//     } catch (err) {
//       console.warn("Invalid token", err);
//       return NextResponse.redirect(new URL("/login", req.url));
//     }
//   }

//   return NextResponse.next();
// }
import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

const PROTECTED_PATHS = [
  '/auth/',
  '/profile',
  '/home',
  '/create-family',
  '/update-family',
];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const path = req.nextUrl.pathname;

  const isProtected = PROTECTED_PATHS.some((protectedPath) =>
    path.startsWith(protectedPath)
  );

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const publicKey = process.env.JWT_PUBLIC_KEY!.replace(/\\n/g, '\n');
      verify(token, publicKey, { algorithms: ["RS256"] });
      return NextResponse.next();
    } catch (err) {
      console.warn("Invalid token", err);
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}
