import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import { authOptions } from "../auth/[...nextauth]/route";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be signed in." },
        { status: 401 }
      );
    }

    const customers = await stripe.customers.list({
      email: session.user.email,
      limit: 10,
    });

    if (customers.data.length === 0) {
      return NextResponse.json(
        { error: "No Stripe customer found for this account." },
        { status: 404 }
      );
    }

    const customer = customers.data[0];

    const portalSession =
      await stripe.billingPortal.sessions.create({
        customer: customer.id,
        return_url: "http://localhost:3000/account",
      });

    return NextResponse.json({
      url: portalSession.url,
    });
  } catch (error) {
    console.error("Customer portal error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to open customer portal",
      },
      { status: 500 }
    );
  }
}