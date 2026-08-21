import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#020604] text-white">
      {/* NAVIGATION */}
      <header className="border-b border-white/[0.06] bg-[#020604]">
        <div className="mx-auto flex h-24 max-w-[1400px] items-center justify-between px-6 lg:px-10">
          <Link href="/" className="flex items-center">
            <Image
              src="/pitchside-logo.png"
              alt="Pitchside Pass"
              width={240}
              height={90}
              priority
              className="h-[72px] w-auto"
            />
          </Link>

          <nav className="hidden items-center gap-10 text-xs font-semibold tracking-wide text-neutral-300 md:flex">
            <a href="#features" className="transition hover:text-white">
              FEATURES
            </a>

            <a href="#how-it-works" className="transition hover:text-white">
              HOW IT WORKS
            </a>

            <a href="#pricing" className="transition hover:text-white">
              MEMBERSHIP
            </a>

            <a href="#faq" className="transition hover:text-white">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden text-xs font-semibold text-neutral-300 transition hover:text-white sm:block"
            >
              SIGN IN
            </Link>

            <Link
              href="/login"
              className="rounded-md bg-[#176b3f] px-7 py-3 text-xs font-bold transition hover:bg-[#208151]"
            >
              GET ACCESS
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative">
        <div className="pointer-events-none absolute left-[35%] top-[20%] h-[600px] w-[600px] rounded-full bg-[#0f5d39]/12 blur-[180px]" />

        <div className="mx-auto grid min-h-[650px] max-w-[1400px] items-center gap-10 px-6 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
          {/* LEFT */}
          <div>
            <h1 className="text-[54px] font-black uppercase leading-[0.92] tracking-[-0.055em] sm:text-[72px] lg:text-[82px]">
              YOUR PASS TO

              <span className="mt-2 block text-[#35b96f]">
                PITCHSIDE.
              </span>
            </h1>

            <p className="mt-6 max-w-[520px] text-lg leading-7 text-neutral-300">
              Instant ticket alerts. Face-value seats.
              <br />

              <span className="font-semibold text-white">
                Beat the touts to the best tickets.
              </span>
            </p>

            <div className="mt-8 flex items-center gap-6">
              <Link
                href="/login"
                className="rounded-md bg-[#176b3f] px-10 py-4 text-sm font-bold transition hover:bg-[#208151]"
              >
                GET ACCESS
              </Link>

              <a
                href="#how-it-works"
                className="text-sm font-semibold text-neutral-300 transition hover:text-white"
              >
                See how it works →
              </a>
            </div>

            {/* TRUST GRID */}
            <div className="mt-9 grid max-w-[560px] grid-cols-2 gap-y-5 border-t border-white/[0.08] pt-6 sm:grid-cols-4">
              <TrustMini
                icon="◇"
                label="Official ticket links"
              />

              <TrustMini
                icon="♙"
                label="Your own membership"
              />

              <TrustMini
                icon="▭"
                label="Secure Stripe payments"
              />

              <TrustMini
                icon="▦"
                label="Manage online"
              />
            </div>
          </div>

          {/* PHONE */}
          <div className="relative flex min-h-[600px] items-center justify-center">
            <div className="pointer-events-none absolute bottom-[30px] h-[120px] w-[400px] rounded-full bg-[#2fa66a]/20 blur-[55px]" />

            <div className="relative">
              <div className="relative w-[300px] rounded-[46px] border border-white/[0.16] bg-[#070907] p-[8px] shadow-[0_40px_100px_rgba(0,0,0,0.7)] sm:w-[330px]">
                <div className="absolute -left-[4px] top-[110px] h-12 w-[4px] rounded-l bg-neutral-700" />

                <div className="absolute -left-[4px] top-[170px] h-16 w-[4px] rounded-l bg-neutral-700" />

                <div className="absolute -right-[4px] top-[145px] h-20 w-[4px] rounded-r bg-neutral-700" />

                <div className="relative aspect-[9/19.5] overflow-hidden rounded-[38px] bg-black">
                  <div className="absolute left-1/2 top-3 z-20 h-[23px] w-[78px] -translate-x-1/2 rounded-full bg-black" />

                  <Image
                    src="/alerts.jpeg?v=10"
                    alt="Pitchside Pass alerts"
                    fill
                    sizes="(max-width: 640px) 300px, 330px"
                    priority
                    unoptimized
                    className="object-cover object-top"
                  />

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REAL TIME AVAILABILITY */}
      <section className="px-6 pb-6 lg:px-10">
        <div className="mx-auto grid max-w-[1280px] gap-10 rounded-2xl border border-white/[0.08] bg-[#07100c] p-8 lg:grid-cols-2 lg:p-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#39bd76]">
              REAL-TIME AVAILABILITY
            </p>

            <h2 className="mt-4 max-w-md text-3xl font-bold leading-tight sm:text-4xl">
              From availability to
              <br />
              your phone in seconds.
            </h2>

            <p className="mt-5 max-w-md text-sm leading-6 text-neutral-400">
              When ticket availability changes, Pitchside Pass detects it and
              sends the relevant information straight to Discord.
            </p>

            <div className="mt-7 space-y-4">
              <NumberPoint
                number="01"
                title="Detected automatically"
                text="No need to sit refreshing ticket pages all day."
              />

              <NumberPoint
                number="02"
                title="Sent instantly"
                text="The alert is pushed straight to the relevant Discord channel."
              />

              <NumberPoint
                number="03"
                title="Buy officially"
                text="Use direct links and purchase through the official website with your own membership."
              />
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-[470px] rounded-2xl border border-white/[0.09] bg-[#0a1510] p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-[0.1em] text-neutral-300">
                    • TICKETS AVAILABLE
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    Manchester United
                  </p>
                </div>

                <span className="rounded-full bg-[#2a7d4e] px-3 py-1 text-xs font-bold">
                  LIVE
                </span>
              </div>

              <div className="mt-6 space-y-3">
                <TicketRow
                  block="N1404"
                  availability="7 available"
                />

                <TicketRow
                  block="W208"
                  availability="9 available"
                />

                <TicketRow
                  block="S123"
                  availability="4 available"
                />
              </div>

              <div className="mt-6 flex h-12 items-center justify-center rounded-md bg-[#2a8a52] font-bold">
                VIEW EVENT →
              </div>

              <p className="mt-4 text-center text-xs text-neutral-600">
                Example alert
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="px-6 py-5 lg:px-10">
        <div className="mx-auto max-w-[1280px] rounded-2xl border border-white/[0.08] bg-[#07100c] p-8">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#39bd76]">
              BUILT FOR SPEED
            </p>

            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              The information you need. Nothing you don&apos;t.
            </h2>
          </div>

          <div className="mt-8 grid overflow-hidden rounded-xl border border-white/[0.07] md:grid-cols-3">
            <FeatureCard
              icon="24/7"
              number="01"
              title="24/7 EVENT MONITORING"
              text="Our monitors continuously watch supported events for changes in ticket availability."
            />

            <FeatureCard
              icon="◯"
              number="02"
              title="PERSONALISED NOTIFICATIONS"
              text="Receive alerts for the ticket information and events that matter to you."
            />

            <FeatureCard
              icon="▦"
              number="03"
              title="UP-TO-DATE HOME TICKET INFORMATION"
              text="Keep track of changing home ticket availability without constantly checking yourself."
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="px-6 py-5 lg:px-10"
      >
        <div className="mx-auto max-w-[1280px] rounded-2xl border border-white/[0.08] bg-[#07100c] p-8">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#39bd76]">
              HOW IT WORKS
            </p>

            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              Tickets move fast. Now you can too.
            </h2>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
            <HowCard
              icon="◉"
              number="01"
              title="WE WATCH"
              text="Our monitors do the hard work, watching each event 24/7."
            />

            <Arrow />

            <HowCard
              icon="◌"
              number="02"
              title="WE ALERT"
              text="Our monitor pings you via Discord when a ticket comes available."
            />

            <Arrow />

            <HowCard
              icon="◇"
              number="03"
              title="YOU BUY"
              text="Jump straight to the available block and secure your tickets at face value."
            />
          </div>
        </div>
      </section>

      {/* MEMBERSHIP */}
      <section id="pricing" className="px-6 py-5 lg:px-10">
        <div className="mx-auto max-w-[1280px] rounded-2xl border border-white/[0.08] bg-[#07100c] p-8">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#39bd76]">
              MEMBERSHIP
            </p>

            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              Choose your club.
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-500">
              Select your club and get instant home ticket alerts delivered
              directly to Discord.
            </p>
          </div>

          <div className="mt-10 grid items-stretch gap-5 md:grid-cols-3">
            {/* LIVERPOOL */}
            <ComingSoonCard
              club="LFC Pitchside Pass"
              logo="/lfc-logo.png"
            />

            {/* MANCHESTER UNITED */}
            <div className="relative flex h-full flex-col rounded-xl border border-[#2e915b] bg-[#09150f] p-7 shadow-[0_20px_70px_rgba(16,105,61,0.12)]">
              <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#42b976]/25 bg-[#163d29] px-4 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#78dda3]">
                AVAILABLE NOW
              </div>

              {/* CLUB HEADER */}
              <div className="flex min-h-[78px] items-center gap-4">
                <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center">
                  <Image
                    src="/mufc-logo.png"
                    alt="Manchester United"
                    width={68}
                    height={68}
                    className="max-h-[68px] w-auto object-contain grayscale brightness-[2] contrast-125"
                  />
                </div>

                <div className="text-left">
                  <p className="text-base font-bold uppercase tracking-[-0.01em] text-white">
                    MUFC Pitchside Pass
                  </p>

                  <p className="mt-1 text-xs font-medium text-[#50c584]">
                    Instant ticket alerts
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-white/[0.07] pt-6">
                <div className="space-y-3 text-sm text-neutral-300">
                  <Included text="24/7 home event monitoring" />
                  <Included text="Instant Discord alerts" />
                  <Included text="Direct event & block links" />
                  <Included text="Online subscription management" />
                </div>
              </div>

              <div className="mt-auto pt-7">
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold tracking-[-0.04em]">
                    £6.99
                  </span>

                  <span className="mb-1 text-sm text-neutral-500">
                    / month
                  </span>
                </div>

                <Link
                  href="/login"
                  className="mt-6 flex h-12 items-center justify-center rounded-md bg-[#2a8a52] text-sm font-bold transition hover:bg-[#35a763]"
                >
                  GET ACCESS NOW
                </Link>
              </div>
            </div>

            {/* ARSENAL */}
            <ComingSoonCard
              club="Arsenal Pitchside Pass"
              logo="/arsenal-logo.png"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-5 lg:px-10">
        <div className="mx-auto max-w-[1280px] rounded-2xl border border-white/[0.08] bg-[#07100c] p-8">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#39bd76]">
              FAQ
            </p>

            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              Questions, answered.
            </h2>
          </div>

          <div className="mx-auto mt-8 max-w-[900px]">
            <FAQ
              question="Does Pitchside Pass sell tickets?"
              answer="No, Pitchside Pass does not sell tickets. The aim of our service is to provide you with the platform to buy tickets at face value via official means, directly from the website and on your own official membership."
            />

            <FAQ
              question="Where do I receive alerts?"
              answer="Our alerts are sent via our Discord channel. Upon signing up, you will connect your Discord account and once you have completed your purchase you will automatically be granted access to our alert channels."
            />

            <FAQ
              question="How quickly are alerts sent?"
              answer="Our monitor detects real-time changes on the website and instantly sends a notification with direct links to the event page and to the specific block of the available tickets."
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-5 border-t border-white/[0.06]">
        <div className="mx-auto max-w-[1280px] px-6 py-9 lg:px-10">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <Image
              src="/pitchside-logo.png"
              alt="Pitchside Pass"
              width={150}
              height={50}
              className="h-[42px] w-auto"
            />

            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-neutral-500">
              <Link
                href="/terms"
                className="transition hover:text-white"
              >
                Terms
              </Link>

              <Link
                href="/privacy"
                className="transition hover:text-white"
              >
                Privacy
              </Link>

              <Link
                href="/refunds"
                className="transition hover:text-white"
              >
                Refunds & Cancellation
              </Link>

              <Link
                href="/contact"
                className="transition hover:text-white"
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="mt-7 flex flex-col items-center justify-between gap-3 border-t border-white/[0.05] pt-6 text-[11px] text-neutral-700 sm:flex-row">
            <span>© 2026 Pitchside Pass</span>

            <span>
              Instant alerts. Better chances. Face value.
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* COMPONENTS                                                                 */
/* -------------------------------------------------------------------------- */

function TrustMini({
  icon,
  label,
}: {
  icon: string;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xl text-[#39bd76]">
        {icon}
      </span>

      <span className="max-w-[90px] text-xs leading-5 text-neutral-300">
        {label}
      </span>
    </div>
  );
}

function NumberPoint({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2f7f4e] text-xs font-bold">
        {number}
      </div>

      <div>
        <p className="text-sm font-bold">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-neutral-500">
          {text}
        </p>
      </div>
    </div>
  );
}

function TicketRow({
  block,
  availability,
}: {
  block: string;
  availability: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-md bg-white/[0.04] px-4 py-3">
      <span className="text-sm">
        Block {block}
      </span>

      <span className="text-sm text-[#56c989]">
        {availability} →
      </span>
    </div>
  );
}

function FeatureCard({
  icon,
  number,
  title,
  text,
}: {
  icon: string;
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="border-white/[0.07] p-7 md:border-r last:border-r-0">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#2d8757] text-[#48be7e]">
          {icon}
        </div>

        <span className="text-sm font-bold text-[#39bd76]">
          {number}
        </span>
      </div>

      <p className="mt-5 text-xs font-bold">
        {title}
      </p>

      <p className="mt-3 text-xs leading-5 text-neutral-500">
        {text}
      </p>
    </div>
  );
}

function HowCard({
  icon,
  number,
  title,
  text,
}: {
  icon: string;
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-5">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#2d8757] text-2xl text-white">
        {icon}
      </div>

      <div>
        <span className="text-sm font-bold text-[#39bd76]">
          {number}
        </span>

        <p className="mt-1 text-sm font-bold">
          {title}
        </p>

        <p className="mt-2 text-xs leading-5 text-neutral-500">
          {text}
        </p>
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <span className="hidden text-xl text-neutral-600 md:block">
      →
    </span>
  );
}

function Included({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#39bd76] text-[9px] font-bold text-[#041008]">
        ✓
      </span>

      <span>{text}</span>
    </div>
  );
}

function MutedIncluded({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/[0.12] text-[9px] text-neutral-400">
        ✓
      </span>

      <span>{text}</span>
    </div>
  );
}

function ComingSoonCard({
  club,
  logo,
}: {
  club: string;
  logo: string;
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-white/[0.08] bg-white/[0.015] p-7">
      {/* CLUB HEADER */}
      <div className="flex min-h-[78px] items-center gap-4">
        <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center">
          <Image
            src={logo}
            alt={club}
            width={68}
            height={68}
            className="max-h-[68px] w-auto object-contain grayscale brightness-[2] contrast-125 opacity-90"
          />
        </div>

        <div className="text-left">
          <p className="text-base font-bold uppercase tracking-[-0.01em] text-white">
            {club}
          </p>

          <p className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-white">
            Coming Soon
          </p>
        </div>
      </div>

      <div className="mt-6 border-t border-white/[0.07] pt-6">
        <div className="space-y-3 text-sm text-neutral-500">
          <MutedIncluded text="24/7 home event monitoring" />
          <MutedIncluded text="Instant Discord alerts" />
          <MutedIncluded text="Direct event & block links" />
          <MutedIncluded text="Online subscription management" />
        </div>
      </div>

      <div className="mt-auto pt-7">
        <button
          type="button"
          disabled
          className="flex h-12 w-full cursor-not-allowed items-center justify-center rounded-md border border-white/[0.14] bg-white/[0.055] text-xs font-bold tracking-[0.08em] text-white"
        >
          COMING SOON
        </button>
      </div>
    </div>
  );
}

function FAQ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details className="group border-b border-white/[0.08] py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
        {question}

        <span className="text-lg text-neutral-500 transition group-open:rotate-45">
          +
        </span>
      </summary>

      <p className="max-w-3xl pt-4 text-sm leading-6 text-neutral-500">
        {answer}
      </p>
    </details>
  );
}