import Link from "next/link";

export default function TermsPage() {
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
          Terms & Conditions
        </h1>

        <p className="mt-4 text-sm text-neutral-500">
          Last updated: 21 August 2026
        </p>

        <div className="mt-12 space-y-10 leading-7 text-neutral-300">
          <section>
            <h2 className="text-xl font-semibold text-white">
              1. About Pitchside Pass
            </h2>

            <p className="mt-3">
              Pitchside Pass is an independent ticket availability
              monitoring and notification service. Our service monitors
              selected official ticketing platforms for changes in ticket
              availability and sends notifications to eligible subscribers.
            </p>

            <p className="mt-3">
              Pitchside Pass does not sell, resell, allocate, reserve or
              purchase football tickets on behalf of subscribers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              2. Ticket purchases
            </h2>

            <p className="mt-3">
              Any ticket purchase is made directly by you through the
              relevant official ticketing platform using your own account
              and, where required, your own eligible membership.
            </p>

            <p className="mt-3">
              Pitchside Pass is not a party to the purchase of any ticket
              between you and a football club or ticketing platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              3. Alerts and availability
            </h2>

            <p className="mt-3">
              Our monitoring system is designed to detect changes in ticket
              availability and send alerts as quickly as reasonably
              possible.
            </p>

            <p className="mt-3">
              Ticket availability can change extremely quickly. An alert
              does not guarantee that a ticket will remain available when
              you open the relevant ticketing platform.
            </p>

            <p className="mt-3">
              We do not guarantee that tickets will become available for a
              particular match, block, seat, price or quantity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              4. Membership
            </h2>

            <p className="mt-3">
              A paid Pitchside Pass membership provides access to the
              monitoring and alert services included in the membership you
              selected.
            </p>

            <p className="mt-3">
              Access is personal to the subscriber and may not be resold,
              shared or commercially redistributed without our permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              5. Discord
            </h2>

            <p className="mt-3">
              Pitchside Pass currently delivers alerts through Discord.
              You must connect an eligible Discord account in order to
              receive access to the relevant alert channels.
            </p>

            <p className="mt-3">
              Your access may be automatically granted or removed based on
              the status of your Pitchside Pass subscription.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              6. Subscription and renewal
            </h2>

            <p className="mt-3">
              Your membership is a recurring subscription at the price and
              billing frequency shown to you before checkout.
            </p>

            <p className="mt-3">
              Unless cancelled, your subscription will automatically renew
              and your selected payment method will be charged for the next
              billing period.
            </p>

            <p className="mt-3">
              You can manage or cancel your subscription through your
              Pitchside Pass account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              7. Cancellation
            </h2>

            <p className="mt-3">
              You may cancel your recurring subscription at any time.
              Unless applicable law requires otherwise, cancelling future
              renewal does not immediately end a billing period that has
              already been paid for and access will ordinarily continue
              until the end of that period.
            </p>

            <p className="mt-3">
              Nothing in these Terms limits any cancellation or refund
              rights you have under applicable consumer law.
            </p>

            <p className="mt-3">
              Further information is available in our{" "}
              <Link
                href="/refunds"
                className="text-[#32b971] hover:underline"
              >
                Refund & Cancellation Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              8. Immediate commencement
            </h2>

            <p className="mt-3">
              When subscribing, you may request that Pitchside Pass begins
              providing the monitoring and alert service immediately rather
              than waiting for the expiry of any applicable statutory
              cancellation period.
            </p>

            <p className="mt-3">
              Where you exercise a statutory right to cancel after
              requesting that the service begins during a cancellation
              period, we may be entitled to charge for the proportion of
              the service already supplied, where permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              9. Acceptable use
            </h2>

            <p className="mt-3">
              You must not reproduce, redistribute, resell or commercially
              exploit Pitchside Pass alerts, private channels or monitoring
              information without permission.
            </p>

            <p className="mt-3">
              You must also use official ticketing platforms in accordance
              with their applicable terms and conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              10. Service availability
            </h2>

            <p className="mt-3">
              We aim to provide a reliable monitoring service but cannot
              guarantee uninterrupted or error-free operation.
            </p>

            <p className="mt-3">
              Monitoring may occasionally be affected by maintenance,
              technical failures, changes to third-party websites or
              services, internet outages or circumstances outside our
              reasonable control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              11. Independence from football clubs
            </h2>

            <p className="mt-3">
              Pitchside Pass is an independent service and is not
              affiliated with, endorsed by, sponsored by or an official
              partner of Manchester United Football Club or any other
              football club, league or ticketing platform unless expressly
              stated otherwise.
            </p>

            <p className="mt-3">
              Club names and other references are used only to identify the
              events and ticketing services being monitored.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              12. Liability
            </h2>

            <p className="mt-3">
              Nothing in these Terms excludes or limits liability where it
              would be unlawful to do so.
            </p>

            <p className="mt-3">
              Subject to applicable law, Pitchside Pass is not responsible
              for tickets becoming unavailable after an alert, decisions
              made by football clubs or ticketing providers, eligibility
              restrictions imposed by those providers, or losses resulting
              from circumstances outside our reasonable control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              13. Changes
            </h2>

            <p className="mt-3">
              We may update these Terms where reasonably necessary,
              including to reflect changes to our service or applicable
              law. Material changes affecting existing subscribers will be
              communicated where required.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              14. Contact
            </h2>

            <p className="mt-3">
              Questions about these Terms can be sent to
              support@pitchsidepass.co.uk.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}