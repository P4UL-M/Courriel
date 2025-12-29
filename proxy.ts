// middleware.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    if (!req.auth && req.nextUrl.pathname !== "/login") {
        if (req.nextUrl.pathname === "/") {
            return NextResponse.redirect(new URL("/login", req.url));
        } else {
            const newUrl = new URL(
                "/login?" +
                    new URLSearchParams({
                        callbackUrl: req.nextUrl.pathname,
                    }),
                req.url
            );

            return NextResponse.redirect(newUrl);
        }
    }
});

export const config = {
    matcher: ["/", "/f/:path*"], // Apply middleware only to /profile route
};
