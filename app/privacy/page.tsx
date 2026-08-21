import Link from "next/link";

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>

        <p className="mt-4 text-sm text-neutral-500">
          Last updated: 21 August 2026
        </p>

        <div className="mt-12 space-y-10 leading-7 text-neutral-300">
          <section>
            <h2 className="text-xl font-semibold text-white">
              1. About this policy
            </h2>

            <p className="mt-3">
              This Privacy Policy explains how Pitchside Pass processes
              personal information when you use our website, connect your
              Discord account or purchase a membership.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              2. Information we process
            </h2>

            <p className="mt-3">
              Depending on how you use Pitchside Pass, we may process
              information including your Discord account identifier,
              Discord profile information made available through
              authentication, email address, membership status, Stripe
              customer and subscription identifiers, and necessary
              technical or security logs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              3. Discord authentication
            </h2>

            <p className="mt-3">
              We use Discord authentication to identify your account and to
              provide access to relevant Pitchside Pass Discord services.
            </p>

            <p className="mt-3">
              Where required for this functionality, authentication tokens
              may be stored securely and used to provide the service you
              requested.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              4. Payments
            </h2>

            <p className="mt-3">
              Payments are processed by Stripe. Pitchside Pass does not
              directly store your full payment card details.
            </p>

            <p className="mt-3">
              We may store Stripe customer and subscription identifiers so
              that we can determine your membership status and manage
              access to the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              5. Why we use your information
            </h2>

            <p className="mt-3">
              We process information where necessary to provide and manage
              your membership, authenticate your account, provide Discord
              access, process subscription status changes, operate and
              secure the service, respond to support requests, and comply
              with applicable legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              6. Service providers
            </h2>

            <p className="mt-3">
              We use third-party service providers to operate Pitchside
              Pass, including providers for payments, authentication,
              hosting and data infrastructure.
            </p>

            <p className="mt-3">
              These currently include Stripe, Discord, Vercel and Supabase
              where relevant to the operation of the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              7. Retention
            </h2>

            <p className="mt-3">
              We retain personal information only for as long as reasonably
              necessary for the purposes for which it was collected,
              including providing the service, maintaining appropriate
              records, resolving disputes and meeting legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              8. Your rights
            </h2>

            <p className="mt-3">
              Depending on applicable data protection law, you may have
              rights relating to your personal information, including
              rights of access, correction, deletion, restriction,
              objection and data portability in certain circumstances.
            </p>

            <p className="mt-3">
              To make a privacy request, contact
              support@pitchsidepass.co.uk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              9. Security
            </h2>

            <p className="mt-3">
              We use reasonable technical and organisational measures
              designed to protect personal information. No internet-based
              service can guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              10. Contact
            </h2>

            <p className="mt-3">
              Privacy enquiries can be sent to
              support@pitchsidepass.co.uk.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}