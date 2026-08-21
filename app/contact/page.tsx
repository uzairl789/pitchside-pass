import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020806] px-6 text-white">
      <div className="w-full max-w-xl rounded-[28px] border border-white/[0.07] bg-[#07100c] p-8 text-center shadow-2xl sm:p-12">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#32b971]/20 bg-[#32b971]/10">
          <span className="h-2.5 w-2.5 rounded-full bg-[#32b971]" />
        </div>

        <p className="mt-7 text-xs font-bold uppercase tracking-[0.22em] text-[#32b971]">
          Pitchside Pass
        </p>

        <h1 className="mt-4 text-4xl font-bold tracking-tight">
          Get in touch
        </h1>

        <p className="mx-auto mt-5 max-w-md leading-7 text-neutral-400">
          Need help with your membership, Discord access, billing or
          something else? Get in touch with us.
        </p>

        <a
          href="mailto:support@pitchsidepass.co.uk"
          className="mt-8 inline-flex h-14 items-center justify-center rounded-lg bg-[#12633d] px-8 text-sm font-bold transition hover:bg-[#17784b]"
        >
          support@pitchsidepass.co.uk
        </a>

        <div className="mt-8">
          <Link
            href="/"
            className="text-sm text-neutral-500 transition hover:text-white"
          >
            ← Back to Pitchside Pass
          </Link>
        </div>
      </div>
    </main>
  );
}