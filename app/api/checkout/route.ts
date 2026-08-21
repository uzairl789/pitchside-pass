import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";

import { authOptions } from "../auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!
);

const APP_URL =
  process.env.NEXTAUTH_URL ||
  "https://pitchsidepass.co.uk";

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

    /*
    |--------------------------------------------------------------------------
    | PREVENT DUPLICATE SUBSCRIPTIONS
    |--------------------------------------------------------------------------
    */

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
            "Duplicate subscription prevented:",
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
         * If the stored Stripe subscription no longer exists,
         * clear the stale reference and allow a fresh checkout.
         */
        if (
          error instanceof
          Stripe.errors.StripeInvalidRequestError
        ) {
          console.log(
            "Stored Stripe subscription is stale. Clearing:",
            discordUser.stripe_subscription_id
          );

          const { error: clearError } =
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

          if (clearError) {
            console.error(
              "Failed to clear stale subscription:",
              clearError
            );
          }
        } else {
          throw error;
        }
      }
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE STRIPE CHECKOUT SESSION
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

        /*
         * This connects the Stripe checkout back to
         * the logged-in Discord user.
         */
        client_reference_id:
          discordId,

        metadata: {
          discordId,
        },

        /*
         * Also put Discord ID directly onto the
         * Stripe subscription itself.
         */
        subscription_data: {
          metadata: {
            discordId,
          },
        },

        /*
         * Reuse an existing Stripe customer when possible.
         * This avoids creating unnecessary duplicate customers.
         */
        ...(discordUser?.stripe_customer_id
          ? {
              customer:
                discordUser.stripe_customer_id,
            }
          : session.user.email
            ? {
                customer_email:
                  session.user.email,
              }
            : {}),

        success_url:
          `${APP_URL}/account?success=true`,

        cancel_url:
          `${APP_URL}/account?cancelled=true`,

        allow_promotion_codes: false,

        billing_address_collection:
          "auto",
      });

    console.log(
      "Stripe Checkout created:",
      checkoutSession.id
    );

    console.log(
      "Discord user:",
      discordId
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