// middleware.ts
import { auth } from "@/auth";

export default auth((req) => {
    if (!req.auth && req.nextUrl.pathname !== "/login") {
        if (req.nextUrl.pathname === "/") {
            return Response.redirect("/login");
        } else {
            const newUrl = new URL(
                "/login?" +
                    new URLSearchParams({
                        callbackUrl: req.nextUrl.pathname,
                    }),
                req.nextUrl.origin
            );
            return Response.redirect(newUrl);
        }
    }
});

export const config = {
    matcher: ["/", "/f/:path*"], // Apply middleware only to /profile route
};
