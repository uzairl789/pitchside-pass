import Link from "next/link";

export default function RefundsPage() {
  return (
    <main className="min-h-screen bg-[#020806] px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm text-[#32b971] transition hover:text-[#45d389]"
        >
          ← Back to Pitchside Pass
        </Link>

        <p className="mt-12 text-xs font-bold uppercase tracking-[0.22em] text-[#32b971]">
          Pitchside Pass
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Refund & Cancellation Policy
        </h1>

        <p className="mt-4 text-sm text-neutral-500">
          Last updated: 21 August 2026
        </p>

        <div className="mt-12 space-y-10 leading-7 text-neutral-300">
          <section>
            <h2 className="text-xl font-semibold text-white">
              Cancelling your subscription
            </h2>

            <p className="mt-3">
              You can cancel your Pitchside Pass subscription at any time
              through your account.
            </p>

            <p className="mt-3">
              Cancelling stops future automatic renewals. Unless applicable
              law requires otherwise, your access will ordinarily continue
              until the end of your current paid billing period.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              14-day cancellation rights
            </h2>

            <p className="mt-3">
              UK consumers may have a statutory right to cancel an online
              service contract during the applicable cancellation period.
            </p>

            <p className="mt-3">
              If you expressly request that Pitchside Pass begins providing
              the monitoring and alert service during that period and then
              exercise a statutory cancellation right, we may be entitled
              to charge a proportionate amount for the service already
              provided, where permitted by law.
            </p>

            <p className="mt-3">
              Your statutory consumer rights are not affected by this
              policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              Service problems
            </h2>

            <p className="mt-3">
              If you believe the service has not been provided as described,
              contact us at support@pitchsidepass.co.uk and provide details
              of the issue so that we can investigate it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              Ticket availability
            </h2>

            <p className="mt-3">
              Pitchside Pass provides monitoring and notifications rather
              than tickets themselves. The fact that a particular match
              does not have suitable ticket availability does not by itself
              mean that the monitoring service has not been supplied.
            </p>

            <p className="mt-3">
              We cannot guarantee that tickets will become available or
              remain available after an alert is sent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              Requesting a refund
            </h2>

            <p className="mt-3">
              For refund or statutory cancellation requests, contact
              support@pitchsidepass.co.uk with the email address or Discord
              account associated with your membership.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}