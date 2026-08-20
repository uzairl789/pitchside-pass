"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.replace("/account");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020806] text-white">
        <div className="flex items-center gap-3 text-sm text-neutral-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#32b971]" />
          Checking your account...
        </div>
      </main>
    );
  }

  if (status === "authenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020806] text-white">
        <div className="flex items-center gap-3 text-sm text-neutral-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#32b971]" />
          Taking you to your account...
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020806] px-6 text-white">
      <div className="pointer-events-none absolute h-[500px] w-[500px] rounded-full bg-[#0d5133]/20 blur-[160px]" />

      <div className="relative w-full max-w-[440px] rounded-[28px] border border-white/[0.07] bg-[#07100c] p-8 text-center shadow-2xl sm:p-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#32b971]/20 bg-[#32b971]/10">
          <span className="h-2.5 w-2.5 rounded-full bg-[#32b971]" />
        </div>

        <p className="mt-7 text-xs font-bold uppercase tracking-[0.22em] text-[#32b971]">
          Pitchside Pass
        </p>

        <h1 className="mt-4 text-3xl font-bold tracking-[-0.03em]">
          Connect your Discord
        </h1>

        <p className="mx-auto mt-4 max-w-sm leading-7 text-neutral-400">
          Your Discord account is used to automatically grant access to your
          Pitchside Pass alert channels.
        </p>

        <button
          type="button"
          onClick={() =>
            signIn("discord", {
              callbackUrl: "/account",
            })
          }
          className="mt-8 flex h-14 w-full cursor-pointer items-center justify-center rounded-lg bg-[#12633d] text-sm font-bold transition hover:bg-[#17784b]"
        >
          CONTINUE WITH DISCORD
        </button>

        <a
          href="/"
          className="mt-6 inline-block text-sm text-neutral-500 transition hover:text-white"
        >
          ← Back to Pitchside Pass
        </a>
      </div>
    </main>
  );
}