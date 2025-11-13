import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// In local dev, bypass auth entirely to keep the app mock-friendly.
const isLocal = process.env.NEXT_PUBLIC_APP_ENV === 'local';

const passThrough = () => NextResponse.next();

const isProtectedRoute = createRouteMatcher(['/builder(.*)', '/dashboard(.*)']);

export default isLocal
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