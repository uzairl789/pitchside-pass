import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";

import { authOptions } from "../auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!
);

const APP_URL = (
  process.env.NEXTAUTH_URL ||
  "https://pitchsidepass.co.uk"
).replace(/\/$/, "");

export async function POST() {
  try {
    /*
    |--------------------------------------------------------------------------
    | CHECK LOGIN
    |--------------------------------------------------------------------------
    */

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
    | GET STRIPE CUSTOMER FROM SUPABASE
    |--------------------------------------------------------------------------
    */

    const {
      data: discordUser,
      error: lookupError,
    } = await supabaseAdmin
      .from("discord_users")
      .select(
        "stripe_customer_id, stripe_subscription_id"
      )
      .eq(
        "discord_id",
        discordId
      )
      .maybeSingle();

    if (lookupError) {
      console.error(
        "Failed to find Stripe customer:",
        lookupError
      );

      return NextResponse.json(
        {
          error:
            "Unable to find your membership.",
        },
        {
          status: 500,
        }
      );
    }

    if (!discordUser?.stripe_customer_id) {
      return NextResponse.json(
        {
          error:
            "No Stripe customer was found for this account.",
        },
        {
          status: 404,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE STRIPE CUSTOMER PORTAL SESSION
    |--------------------------------------------------------------------------
    */

    const portalSession =
      await stripe.billingPortal.sessions.create({
        customer:
          discordUser.stripe_customer_id,

        return_url:
          `${APP_URL}/account`,
      });

    console.log(
      "Stripe Customer Portal created for Discord user:",
      discordId
    );

    return NextResponse.json({
      url: portalSession.url,
    });
  } catch (error) {
    console.error(
      "Customer portal error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to open membership management.",
      },
      {
        status: 500,
      }
    );
  }
}