import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!
);

type DiscordUserRecord = {
  discord_id: string;
  discord_access_token: string;
  discord_refresh_token: string | null;
  discord_token_expires_at: string | null;
};

/* -------------------------------------------------------------------------- */
/* DISCORD TOKEN REFRESH                                                      */
/* -------------------------------------------------------------------------- */

async function refreshDiscordToken(
  discordUser: DiscordUserRecord
) {
  if (!discordUser.discord_refresh_token) {
    throw new Error(
      `Discord refresh token missing for ${discordUser.discord_id}`
    );
  }

  const clientId =
    process.env.DISCORD_CLIENT_ID!;

  const clientSecret =
    process.env.DISCORD_CLIENT_SECRET!;

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token:
      discordUser.discord_refresh_token,
  });

  const basicAuth = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64");

  const response = await fetch(
    "https://discord.com/api/v10/oauth2/token",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    }
  );

  const responseText =
    await response.text();

  if (!response.ok) {
    throw new Error(
      `Discord OAuth token refresh failed: ${response.status} ${responseText}`
    );
  }

  const tokenData =
    JSON.parse(responseText);

  if (
    !tokenData.access_token ||
    !tokenData.refresh_token
  ) {
    throw new Error(
      "Discord token refresh response was incomplete"
    );
  }

  const expiresAt = new Date(
    Date.now() +
      Number(tokenData.expires_in) *
        1000
  ).toISOString();

  const { error } =
    await supabaseAdmin
      .from("discord_users")
      .update({
        discord_access_token:
          tokenData.access_token,

        discord_refresh_token:
          tokenData.refresh_token,

        discord_token_expires_at:
          expiresAt,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "discord_id",
        discordUser.discord_id
      );

  if (error) {
    throw new Error(
      `Failed to save refreshed Discord token: ${error.message}`
    );
  }

  console.log(
    "Discord OAuth token refreshed:",
    discordUser.discord_id
  );

  return {
    ...discordUser,
    discord_access_token:
      tokenData.access_token,

    discord_refresh_token:
      tokenData.refresh_token,

    discord_token_expires_at:
      expiresAt,
  };
}

async function ensureValidDiscordToken(
  discordUser: DiscordUserRecord
) {
  if (
    !discordUser.discord_token_expires_at
  ) {
    return refreshDiscordToken(
      discordUser
    );
  }

  const expiresAt = new Date(
    discordUser.discord_token_expires_at
  ).getTime();

  const refreshThreshold =
    Date.now() + 10 * 60 * 1000;

  if (
    expiresAt <= refreshThreshold
  ) {
    return refreshDiscordToken(
      discordUser
    );
  }

  return discordUser;
}

/* -------------------------------------------------------------------------- */
/* DISCORD MEMBERSHIP                                                         */
/* -------------------------------------------------------------------------- */

async function addDiscordMember(
  discordId: string,
  accessToken: string
) {
  const guildId =
    process.env.DISCORD_SERVER_ID!;

  const botToken =
    process.env.DISCORD_BOT_TOKEN!;

  const response = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`,
    {
      method: "PUT",
      headers: {
        Authorization:
          `Bot ${botToken}`,

        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        access_token:
          accessToken,
      }),
    }
  );

  const responseText =
    await response.text();

  if (
    response.status !== 201 &&
    response.status !== 204
  ) {
    throw new Error(
      `Discord member join failed: ${response.status} ${responseText}`
    );
  }

  console.log(
    "Discord member ready:",
    discordId
  );
}

async function addDiscordRole(
  discordId: string
) {
  const guildId =
    process.env.DISCORD_SERVER_ID!;

  const roleId =
    process.env.DISCORD_PAID_ROLE_ID!;

  const botToken =
    process.env.DISCORD_BOT_TOKEN!;

  const response = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}/roles/${roleId}`,
    {
      method: "PUT",
      headers: {
        Authorization:
          `Bot ${botToken}`,

        "Content-Type":
          "application/json",
      },
    }
  );

  const responseText =
    await response.text();

  if (!response.ok) {
    throw new Error(
      `Discord role assignment failed: ${response.status} ${responseText}`
    );
  }

  console.log(
    "Pitchside Pass role assigned:",
    discordId
  );
}

async function removeDiscordRole(
  discordId: string
) {
  const guildId =
    process.env.DISCORD_SERVER_ID!;

  const roleId =
    process.env.DISCORD_PAID_ROLE_ID!;

  const botToken =
    process.env.DISCORD_BOT_TOKEN!;

  const response = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}/roles/${roleId}`,
    {
      method: "DELETE",
      headers: {
        Authorization:
          `Bot ${botToken}`,

        "Content-Type":
          "application/json",
      },
    }
  );

  const responseText =
    await response.text();

  if (
    !response.ok &&
    response.status !== 404
  ) {
    throw new Error(
      `Discord role removal failed: ${response.status} ${responseText}`
    );
  }

  console.log(
    "Pitchside Pass role removed:",
    discordId
  );
}

/* -------------------------------------------------------------------------- */
/* SUPABASE                                                                   */
/* -------------------------------------------------------------------------- */

async function getDiscordUser(
  discordId: string
): Promise<DiscordUserRecord> {
  const { data, error } =
    await supabaseAdmin
      .from("discord_users")
      .select(
        "discord_id, discord_access_token, discord_refresh_token, discord_token_expires_at"
      )
      .eq(
        "discord_id",
        discordId
      )
      .single();

  if (error) {
    throw new Error(
      `Could not find Discord OAuth details: ${error.message}`
    );
  }

  if (
    !data?.discord_access_token
  ) {
    throw new Error(
      `Discord access token missing for ${discordId}`
    );
  }

  return data;
}

/* -------------------------------------------------------------------------- */
/* WEBHOOK DEDUPLICATION                                                      */
/* -------------------------------------------------------------------------- */

async function webhookAlreadyProcessed(
  eventId: string
) {
  const { data, error } =
    await supabaseAdmin
      .from(
        "stripe_webhook_events"
      )
      .select("event_id")
      .eq(
        "event_id",
        eventId
      )
      .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to check webhook history: ${error.message}`
    );
  }

  return Boolean(data);
}

async function markWebhookProcessed(
  eventId: string,
  eventType: string
) {
  const { error } =
    await supabaseAdmin
      .from(
        "stripe_webhook_events"
      )
      .insert({
        event_id:
          eventId,

        event_type:
          eventType,
      });

  if (error) {
    if (
      error.code === "23505"
    ) {
      return;
    }

    throw new Error(
      `Unable to record webhook event: ${error.message}`
    );
  }

  console.log(
    "Webhook processed:",
    eventType,
    eventId
  );
}

/* -------------------------------------------------------------------------- */
/* WEBHOOK                                                                    */
/* -------------------------------------------------------------------------- */

export async function POST(
  request: NextRequest
) {
  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      {
        error:
          "Webhook secret missing",
      },
      {
        status: 500,
      }
    );
  }

  const signature =
    request.headers.get(
      "stripe-signature"
    );

  if (!signature) {
    return NextResponse.json(
      {
        error:
          "Missing Stripe signature",
      },
      {
        status: 400,
      }
    );
  }

  const body =
    await request.text();

  let event: Stripe.Event | null =
    null;

  try {
    event =
      stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
  } catch (error) {
    console.error(
      "Webhook signature verification failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Invalid webhook signature",
      },
      {
        status: 400,
      }
    );
  }

  if (!event) {
    return NextResponse.json(
      {
        error:
          "Unable to process Stripe event",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const duplicate =
      await webhookAlreadyProcessed(
        event.id
      );

    if (duplicate) {
      return NextResponse.json({
        received: true,
        duplicate: true,
      });
    }

    /* ---------------------------------------------------------------------- */
    /* SUCCESSFUL CHECKOUT                                                    */
    /* ---------------------------------------------------------------------- */

    if (
      event.type ===
      "checkout.session.completed"
    ) {
      const checkoutSession =
        event.data
          .object as Stripe.Checkout.Session;

      const discordId =
        checkoutSession.metadata
          ?.discordId ??
        checkoutSession
          .client_reference_id;

      if (!discordId) {
        throw new Error(
          "No Discord ID found on Checkout Session"
        );
      }

      let discordUser =
        await getDiscordUser(
          discordId
        );

      discordUser =
        await ensureValidDiscordToken(
          discordUser
        );

      await addDiscordMember(
        discordId,
        discordUser.discord_access_token
      );

      await addDiscordRole(
        discordId
      );

      const subscriptionId =
        typeof checkoutSession
          .subscription ===
        "string"
          ? checkoutSession
              .subscription
          : checkoutSession
              .subscription
              ?.id ?? null;

      const customerId =
        typeof checkoutSession
          .customer === "string"
          ? checkoutSession
              .customer
          : checkoutSession
              .customer
              ?.id ?? null;

      const {
        error: updateError,
      } =
        await supabaseAdmin
          .from(
            "discord_users"
          )
          .update({
            stripe_customer_id:
              customerId,

            stripe_subscription_id:
              subscriptionId,

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "discord_id",
            discordId
          );

      if (updateError) {
        throw new Error(
          `Failed to save Stripe IDs: ${updateError.message}`
        );
      }

      console.log(
        "Pitchside Pass activation complete:",
        discordId
      );
    }

    /* ---------------------------------------------------------------------- */
    /* SUBSCRIPTION ENDED                                                     */
    /* ---------------------------------------------------------------------- */

    if (
      event.type ===
      "customer.subscription.deleted"
    ) {
      const subscription =
        event.data
          .object as Stripe.Subscription;

      let discordId =
        subscription.metadata
          ?.discordId;

      if (!discordId) {
        const {
          data,
          error,
        } =
          await supabaseAdmin
            .from(
              "discord_users"
            )
            .select(
              "discord_id"
            )
            .eq(
              "stripe_subscription_id",
              subscription.id
            )
            .maybeSingle();

        if (error) {
          throw new Error(
            `Failed to locate Discord user: ${error.message}`
          );
        }

        discordId =
          data?.discord_id ??
          undefined;
      }

      if (discordId) {
        await removeDiscordRole(
          discordId
        );

        const {
          error: clearError,
        } =
          await supabaseAdmin
            .from(
              "discord_users"
            )
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
          throw new Error(
            `Failed to clear subscription ID: ${clearError.message}`
          );
        }
      }
    }

    await markWebhookProcessed(
      event.id,
      event.type
    );

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(
      "Webhook processing error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Webhook processing failed",
      },
      {
        status: 500,
      }
    );
  }
}