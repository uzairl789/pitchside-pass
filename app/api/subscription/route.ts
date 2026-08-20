import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import { authOptions } from "../auth/[...nextauth]/route";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.discordId) {
      return NextResponse.json(
        { error: "You must be signed in with Discord." },
        { status: 401 }
      );
    }

    const discordId = session.user.discordId;

    const subscriptions = await stripe.subscriptions.list({
      status: "all",
      limit: 100,
    });

    const matchingSubscriptions = subscriptions.data.filter(
      (subscription) =>
        subscription.metadata?.discordId === discordId
    );

    if (matchingSubscriptions.length === 0) {
      return NextResponse.json({
        active: false,
        status: "none",
      });
    }

    const subscription =
      matchingSubscriptions.find((sub) =>
        ["active", "trialing", "past_due"].includes(sub.status)
      ) ?? matchingSubscriptions[0];

    const currentPeriodEnd =
      subscription.items.data[0]?.current_period_end ?? null;

    const cancellationDate =
      subscription.cancel_at ??
      (subscription.cancel_at_period_end
        ? currentPeriodEnd
        : null);

    const scheduledToCancel =
      subscription.cancel_at_period_end ||
      subscription.cancel_at !== null;

    return NextResponse.json({
      active: ["active", "trialing", "past_due"].includes(
        subscription.status
      ),

      status: subscription.status,

      cancelAtPeriodEnd:
        subscription.cancel_at_period_end,

      cancelAt:
        subscription.cancel_at,

      scheduledToCancel,

      currentPeriodEnd,

      cancellationDate,

      subscriptionId:
        subscription.id,
    });
  } catch (error) {
    console.error("Subscription status error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load subscription status",
      },
      { status: 500 }
    );
  }
}