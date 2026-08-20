import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";

import { authOptions } from "../auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!
);

export async function POST() {
  try {
    const session =
      await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "You must be signed in.",
        },
        {
          status: 401,
        }
      );
    }

    const discordId =
      session.user.discordId;

    if (!discordId) {
      return NextResponse.json(
        {
          error:
            "Discord ID is missing from your session.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CHECK EXISTING SUBSCRIPTION
    |--------------------------------------------------------------------------
    */

    const {
      data: discordUser,
      error: userLookupError,
    } = await supabaseAdmin
      .from("discord_users")
      .select(
        "discord_id, stripe_customer_id, stripe_subscription_id"
      )
      .eq(
        "discord_id",
        discordId
      )
      .maybeSingle();

    if (userLookupError) {
      console.error(
        "Supabase user lookup error:",
        userLookupError
      );

      return NextResponse.json(
        {
          error:
            "Unable to check your membership.",
        },
        {
          status: 500,
        }
      );
    }

    if (
      discordUser?.stripe_subscription_id
    ) {
      try {
        const existingSubscription =
          await stripe.subscriptions.retrieve(
            discordUser.stripe_subscription_id
          );

        const blockedStatuses = [
          "active",
          "trialing",
          "past_due",
          "unpaid",
          "incomplete",
          "paused",
        ];

        if (
          blockedStatuses.includes(
            existingSubscription.status
          )
        ) {
          console.log(
            "Duplicate subscription prevented for Discord user:",
            discordId,
            existingSubscription.id,
            existingSubscription.status
          );

          return NextResponse.json(
            {
              error:
                "You already have a Pitchside Pass membership.",
              alreadySubscribed: true,
              status:
                existingSubscription.status,
            },
            {
              status: 409,
            }
          );
        }
      } catch (error) {
        /*
         * If Stripe says the subscription no longer exists,
         * clear the stale Supabase reference and allow checkout.
         */

        if (
          error instanceof Stripe.errors.StripeInvalidRequestError
        ) {
          console.log(
            "Stored Stripe subscription no longer exists. Clearing stale reference:",
            discordUser.stripe_subscription_id
          );

          await supabaseAdmin
            .from("discord_users")
            .update({
              stripe_subscription_id:
                null,
              updated_at:
                new Date().toISOString(),
            })
            .eq(
              "discord_id",
              discordId
            );
        } else {
          throw error;
        }
      }
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE CHECKOUT
    |--------------------------------------------------------------------------
    */

    const checkoutSession =
      await stripe.checkout.sessions.create({
        mode: "subscription",

        line_items: [
          {
            price:
              process.env.STRIPE_PRICE_ID!,
            quantity: 1,
          },
        ],

        client_reference_id:
          discordId,

        metadata: {
          discordId,
        },

        subscription_data: {
          metadata: {
            discordId,
          },
        },

        customer_email:
          session.user.email ??
          undefined,

        success_url:
          "http://localhost:3000/account?success=true",

        cancel_url:
          "http://localhost:3000/account?cancelled=true",
      });

    console.log(
      "Stripe Checkout created for Discord user:",
      discordId,
      checkoutSession.id
    );

    return NextResponse.json({
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error(
      "Stripe checkout error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create checkout session",
      },
      {
        status: 500,
      }
    );
  }
}