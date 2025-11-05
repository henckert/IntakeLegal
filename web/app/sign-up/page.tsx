"use client";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY;
  if (!pk) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 p-6">
        <h2 className="heading-serif text-xl">Auth not configured</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to enable Clerk sign-up, or run in local mode without auth.
        </p>
      </div>
    );
  }
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center">
      <SignUp redirectUrl="/dashboard" />
    </div>
  );
}
