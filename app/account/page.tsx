"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type SubscriptionData = {
  active: boolean;
  status: string;
  cancelAtPeriodEnd?: boolean;
  cancelAt?: number | null;
  scheduledToCancel?: boolean;
  currentPeriodEnd?: number | null;
  cancellationDate?: number | null;
};

export default function AccountPage() {
  const { data: session, status } = useSession();

  const [subscription, setSubscription] =
    useState<SubscriptionData | null>(null);

  const [subscriptionLoading, setSubscriptionLoading] =
    useState(true);

  const [checkoutLoading, setCheckoutLoading] =
    useState(false);

  const [portalLoading, setPortalLoading] =
    useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      loadSubscription();
    }

    if (status === "unauthenticated") {
      setSubscriptionLoading(false);
    }
  }, [status]);

  async function loadSubscription() {
    try {
      const response = await fetch("/api/subscription", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Subscription error:", data);
        return;
      }

      setSubscription(data);
    } catch (error) {
      console.error("Failed to load subscription:", error);
    } finally {
      setSubscriptionLoading(false);
    }
  }

  async function handleSubscribe() {
    try {
      setCheckoutLoading(true);

      const response = await fetch("/api/checkout", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Checkout failed to start.");
        return;
      }

      if (data.url) {
        window.location.assign(data.url);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function handleManageSubscription() {
    try {
      setPortalLoading(true);

      const response = await fetch("/api/customer-portal", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Unable to open subscription management."
        );
        return;
      }

      if (data.url) {
        window.location.assign(data.url);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setPortalLoading(false);
    }
  }

  function formatDate(timestamp?: number | null) {
    if (!timestamp) return null;

    return new Date(timestamp * 1000).toLocaleDateString(
      "en-GB",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  }

  if (
    status === "loading" ||
    (status === "authenticated" && subscriptionLoading)
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020604] text-white">
        <div className="flex items-center gap-3 text-sm text-neutral-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#39bd76]" />
          Loading your account...
        </div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020604] px-6 text-white">
        <div className="w-full max-w-md rounded-[24px] border border-white/[0.08] bg-[#07100c] p-8 text-center">
          <Image
            src="/pitchside-logo.png"
            alt="Pitchside Pass"
            width={190}
            height={70}
            className="mx-auto h-auto w-[170px]"
          />

          <h1 className="mt-8 text-3xl font-bold">
            Sign in to your account
          </h1>

          <p className="mt-4 leading-7 text-neutral-400">
            Connect your Discord account to view and manage
            your Pitchside Pass membership.
          </p>

          <Link
            href="/login"
            className="mt-7 flex h-14 items-center justify-center rounded-lg bg-[#176b3f] text-sm font-bold transition hover:bg-[#208151]"
          >
            SIGN IN WITH DISCORD
          </Link>
        </div>
      </main>
    );
  }

  const renewalDate = formatDate(
    subscription?.currentPeriodEnd
  );

  const cancellationDate = formatDate(
    subscription?.cancellationDate
  );

  return (
    <main className="min-h-screen bg-[#020604] text-white">
      {/* HEADER */}
      <header className="border-b border-white/[0.06] bg-[#020604]">
        <div className="mx-auto flex h-24 max-w-[1180px] items-center justify-between px-6">
          <Link href="/">
            <Image
              src="/pitchside-logo.png"
              alt="Pitchside Pass"
              width={220}
              height={82}
              priority
              className="h-[64px] w-auto"
            />
          </Link>

          <button
            type="button"
            onClick={() =>
              signOut({
                callbackUrl: "/",
              })
            }
            className="text-sm font-medium text-neutral-400 transition hover:text-white"
          >
            Sign out
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-[1050px] px-6 py-14">
        {/* INTRO */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#39bd76]">
            Member Portal
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
            Welcome back
            {session?.user?.name
              ? `, ${session.user.name}`
              : ""}
            .
          </h1>

          <p className="mt-4 max-w-xl text-neutral-500">
            Manage your Pitchside Pass membership and
            Discord access.
          </p>
        </div>

        {/* MAIN GRID */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          {/* MEMBERSHIP */}
          <div className="rounded-[26px] border border-white/[0.08] bg-[#07100c] p-7 sm:p-9">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-500">
                  Your Membership
                </p>

                <h2 className="mt-3 text-2xl font-bold">
                  MUFC Pitchside Pass
                </h2>

                <p className="mt-2 text-sm text-neutral-500">
                  Instant home ticket alerts via Discord.
                </p>
              </div>

              <span
                className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${
                  subscription?.active
                    ? "bg-[#193d2b] text-[#69d79d]"
                    : "bg-white/[0.05] text-neutral-500"
                }`}
              >
                {subscription?.active
                  ? "● ACTIVE"
                  : "INACTIVE"}
              </span>
            </div>

            {subscription?.active ? (
              <>
                <div className="mt-8 grid gap-6 border-y border-white/[0.07] py-6 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-neutral-500">
                      PLAN
                    </p>

                    <p className="mt-2 text-lg font-semibold">
                      £6.99 / month
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-500">
                      {subscription.scheduledToCancel
                        ? "ACCESS UNTIL"
                        : "NEXT RENEWAL"}
                    </p>

                    <p className="mt-2 text-lg font-semibold">
                      {subscription.scheduledToCancel
                        ? cancellationDate
                        : renewalDate}
                    </p>
                  </div>
                </div>

                {subscription.scheduledToCancel &&
                  cancellationDate && (
                    <div className="mt-6 rounded-xl border border-amber-500/15 bg-amber-500/[0.06] p-4 text-sm leading-6 text-amber-200">
                      Your membership will not renew.
                      Discord access remains active until{" "}
                      {cancellationDate}.
                    </div>
                  )}

                <button
                  type="button"
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  className="mt-7 flex h-14 w-full items-center justify-center rounded-lg bg-[#176b3f] text-sm font-bold transition hover:bg-[#208151] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {portalLoading
                    ? "OPENING..."
                    : "MANAGE MEMBERSHIP"}
                </button>

                <p className="mt-3 text-center text-xs text-neutral-600">
                  Update your card, view invoices or manage
                  renewal securely through Stripe.
                </p>
              </>
            ) : (
              <>
                <div className="mt-7 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold">
                      £6.99
                    </span>

                    <span className="mb-1 text-neutral-500">
                      / month
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 text-sm text-neutral-400">
                    <Included text="24/7 home event monitoring" />
                    <Included text="Instant Discord alerts" />
                    <Included text="Direct event and block links" />
                    <Included text="Online subscription management" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSubscribe}
                  disabled={checkoutLoading}
                  className="mt-7 flex h-14 w-full items-center justify-center rounded-lg bg-[#176b3f] text-sm font-bold transition hover:bg-[#208151] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {checkoutLoading
                    ? "OPENING CHECKOUT..."
                    : "GET MUFC PITCHSIDE PASS"}
                </button>
              </>
            )}
          </div>

          {/* DISCORD CARD */}
          <div className="rounded-[26px] border border-white/[0.08] bg-[#07100c] p-7">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-500">
              Discord
            </p>

            <div className="mt-5 flex items-center gap-4">
              {session?.user?.image ? (
  <img
    src={session.user.image}
    alt="Discord avatar"
    width={54}
    height={54}
    className="h-[54px] w-[54px] rounded-full object-cover"
  />
) : (
                <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-white/[0.05] text-lg font-bold text-neutral-400">
                  {session?.user?.name?.charAt(0) || "D"}
                </div>
              )}

              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {session?.user?.name ||
                    "Discord account"}
                </p>

                {session?.user?.email && (
                  <p className="mt-1 truncate text-xs text-neutral-500">
                    {session.user.email}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">
                  Connection
                </span>

                <span className="rounded-full bg-[#193d2b] px-3 py-1 text-xs font-bold text-[#69d79d]">
                  CONNECTED
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-neutral-400">
                  Alert access
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    subscription?.active
                      ? "bg-[#193d2b] text-[#69d79d]"
                      : "bg-white/[0.05] text-neutral-500"
                  }`}
                >
                  {subscription?.active
                    ? "ENABLED"
                    : "LOCKED"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ACCESS INFO */}
        <div className="mt-6 rounded-[26px] border border-white/[0.08] bg-[#07100c] p-7 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-500">
            Your Access
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <AccessItem
              title="Discord alerts"
              active={Boolean(subscription?.active)}
            />

            <AccessItem
              title="Direct event links"
              active={Boolean(subscription?.active)}
            />

            <AccessItem
              title="Block availability"
              active={Boolean(subscription?.active)}
            />
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-neutral-600 transition hover:text-white"
          >
            ← Back to Pitchside Pass
          </Link>
        </div>
      </section>
    </main>
  );
}

function Included({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[#39bd76]">✓</span>
      <span>{text}</span>
    </div>
  );
}

function AccessItem({
  title,
  active,
}: {
  title: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4">
      <span className="text-sm text-neutral-300">
        {title}
      </span>

      <span
        className={
          active
            ? "text-[#39bd76]"
            : "text-neutral-700"
        }
      >
        {active ? "✓" : "—"}
      </span>
    </div>
  );
}