import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Bypass auth if Clerk keys are not configured.
// This allows the app to run in demo mode without authentication.
const hasClerkKeys =
  !!process.env.CLERK_SECRET_KEY &&
  (!!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !!process.env.CLERK_PUBLISHABLE_KEY);

const passThrough = () => NextResponse.next();

const isProtectedRoute = createRouteMatcher(['/builder(.*)', '/dashboard(.*)']);

export default !hasClerkKeys
  ? passThrough
  : clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        const a = await auth();
        if (!a.userId) {
          const url = new URL('/sign-in', req.url);
          url.searchParams.set('redirect_url', req.url);
          return NextResponse.redirect(url);
        }
      }
      return NextResponse.next();
    }) as any;

// Protect everything except Next internals and static assets when not local.
export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};