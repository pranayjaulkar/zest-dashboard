import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoutes = createRouteMatcher(["/api/(.*)", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoutes(req)) auth().protect();

  const { pathname } = req.nextUrl;
  const { userId } = auth();
  const restrictedMethods = ["POST", "PATCH", "PUT", "DELETE"];
  const restrictedPaths = [
    /^\/api\/stores\/[^/]+\/products\/?$/,
    /^\/api\/stores\/[^/]+\/products\/[^/]+\/?$/,
    /^\/api\/stores\/[^/]+\/billboards\/?$/,
    /^\/api\/stores\/[^/]+\/billboards\/[^/]+\/?$/,
    /^\/api\/stores\/[^/]+\/colors\/?$/,
    /^\/api\/stores\/[^/]+\/colors\/[^/]+\/?$/,
    /^\/api\/stores\/[^/]+\/sizes\/?$/,
    /^\/api\/stores\/[^/]+\/sizes\/[^/]+\/?$/,
    /^\/api\/stores\/[^/]+\/orders\/?$/,
    /^\/api\/stores\/[^/]+\/orders\/[^/]+\/?$/,
    /^\/api\/stores\/[^/]+\/categories\/?$/,
    /^\/api\/stores\/[^/]+\/categories\/[^/]+\/?$/,
  ];

  if (restrictedMethods.includes(req.method) && restrictedPaths.some((path) => path.test(pathname)) && !userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
