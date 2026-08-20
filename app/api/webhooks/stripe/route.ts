import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const MANAGE_ROLES_PERMISSION = BigInt(1) << BigInt(28);

/* -------------------------------------------------------------------------- */
/*                        DISCORD TOKEN REFRESH                                */
/* -------------------------------------------------------------------------- */

type DiscordUserRecord = {
  discord_id: string;
  discord_access_token: string;
  discord_refresh_token: string | null;
  discord_token_expires_at: string | null;
};

async function refreshDiscordToken(
  discordUser: DiscordUserRecord
) {
  if (!discordUser.discord_refresh_token) {
    throw new Error(
      `Discord refresh token missing for ${discordUser.discord_id}`
    );
  }

  const clientId = process.env.DISCORD_CLIENT_ID!;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET!;

  console.log(
    "Refreshing Discord OAuth token for:",
    discordUser.discord_id
  );

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

  const responseText = await response.text();

  if (!response.ok) {
    console.error(
      "Discord token refresh failed:",
      response.status,
      responseText
    );

    throw new Error(
      `Discord OAuth token refresh failed: ${response.status}`
    );
  }

  const tokenData = JSON.parse(responseText);

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
      Number(tokenData.expires_in) * 1000
  ).toISOString();

  const { error } = await supabaseAdmin
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
    "Discord OAuth token refreshed successfully:",
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
  if (!discordUser.discord_token_expires_at) {
    console.log(
      "Discord token expiry missing — refreshing token"
    );

    return refreshDiscordToken(
      discordUser
    );
  }

  const expiresAt =
    new Date(
      discordUser.discord_token_expires_at
    ).getTime();

  /*
   * Refresh if token has less than 10 minutes remaining.
   *
   * This avoids the token expiring between checking it and
   * Discord processing the guild join request.
   */
  const refreshThreshold =
    Date.now() + 10 * 60 * 1000;

  if (expiresAt <= refreshThreshold) {
    console.log(
      "Discord access token expired or expiring soon"
    );

    return refreshDiscordToken(
      discordUser
    );
  }

  console.log(
    "Discord access token still valid"
  );

  return discordUser;
}

/* -------------------------------------------------------------------------- */
/*                              DISCORD JOIN                                   */
/* -------------------------------------------------------------------------- */

async function addDiscordMember(
  discordId: string,
  accessToken: string
) {
  const guildId =
    process.env.DISCORD_SERVER_ID!;

  const botToken =
    process.env.DISCORD_BOT_TOKEN!;

  console.log(
    "Attempting to add Discord member:",
    discordId
  );

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

  console.log(
    "Discord member join response:",
    response.status,
    responseText
  );

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

/* -------------------------------------------------------------------------- */
/*                         ROLE DIAGNOSTICS                                    */
/* -------------------------------------------------------------------------- */

async function diagnoseRolePermissions() {
  const guildId =
    process.env.DISCORD_SERVER_ID!;

  const roleId =
    process.env.DISCORD_PAID_ROLE_ID!;

  const botToken =
    process.env.DISCORD_BOT_TOKEN!;

  console.log(
    "---- DISCORD ROLE DIAGNOSTIC ----"
  );

  const botUserResponse =
    await fetch(
      "https://discord.com/api/v10/users/@me",
      {
        headers: {
          Authorization:
            `Bot ${botToken}`,
        },
      }
    );

  const botUserText =
    await botUserResponse.text();

  if (!botUserResponse.ok) {
    throw new Error(
      `Could not fetch bot identity: ${botUserResponse.status} ${botUserText}`
    );
  }

  const botUser =
    JSON.parse(botUserText);

  console.log(
    "Bot user ID:",
    botUser.id
  );

  console.log(
    "Bot username:",
    botUser.username
  );

  const botMemberResponse =
    await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${botUser.id}`,
      {
        headers: {
          Authorization:
            `Bot ${botToken}`,
        },
      }
    );

  const botMemberText =
    await botMemberResponse.text();

  if (!botMemberResponse.ok) {
    throw new Error(
      `Could not fetch bot guild member: ${botMemberResponse.status} ${botMemberText}`
    );
  }

  const botMember =
    JSON.parse(botMemberText);

  console.log(
    "Bot member role IDs:",
    botMember.roles
  );

  const rolesResponse =
    await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/roles`,
      {
        headers: {
          Authorization:
            `Bot ${botToken}`,
        },
      }
    );

  const rolesText =
    await rolesResponse.text();

  if (!rolesResponse.ok) {
    throw new Error(
      `Could not fetch guild roles: ${rolesResponse.status} ${rolesText}`
    );
  }

  const roles =
    JSON.parse(rolesText);

  const paidRole =
    roles.find(
      (role: any) =>
        role.id === roleId
    );

  if (!paidRole) {
    throw new Error(
      `Paid role ${roleId} was not found in this guild`
    );
  }

  console.log(
    "Paid role name:",
    paidRole.name
  );

  console.log(
    "Paid role ID:",
    paidRole.id
  );

  console.log(
    "Paid role position:",
    paidRole.position
  );

  console.log(
    "Paid role managed:",
    paidRole.managed
  );

  const botRoles =
    roles.filter(
      (role: any) =>
        botMember.roles.includes(
          role.id
        )
    );

  console.log(
    "Bot roles:",
    botRoles.map(
      (role: any) => ({
        name: role.name,
        id: role.id,
        position:
          role.position,
        permissions:
          role.permissions,
        managed:
          role.managed,
      })
    )
  );

  const highestBotRole =
    [...botRoles].sort(
      (a: any, b: any) =>
        b.position -
        a.position
    )[0];

  if (!highestBotRole) {
    throw new Error(
      "Could not determine bot highest role"
    );
  }

  let combinedPermissions =
    BigInt(0);

  for (
    const role of botRoles
  ) {
    combinedPermissions |=
      BigInt(
        role.permissions
      );
  }

  const hasManageRoles =
    (combinedPermissions &
      MANAGE_ROLES_PERMISSION) ===
    MANAGE_ROLES_PERMISSION;

  const botAbovePaidRole =
    highestBotRole.position >
    paidRole.position;

  console.log(
    "Bot highest role name:",
    highestBotRole.name
  );

  console.log(
    "Bot highest role position:",
    highestBotRole.position
  );

  console.log(
    "Bot has MANAGE_ROLES:",
    hasManageRoles
  );

  console.log(
    "Bot highest role above paid role:",
    botAbovePaidRole
  );

  console.log(
    "Paid role is integration-managed:",
    paidRole.managed
  );

  console.log(
    "---- END DISCORD ROLE DIAGNOSTIC ----"
  );

  return {
    paidRole,
    highestBotRole,
    hasManageRoles,
    botAbovePaidRole,
  };
}

/* -------------------------------------------------------------------------- */
/*                              ADD PAID ROLE                                  */
/* -------------------------------------------------------------------------- */

async function addDiscordRole(
  discordId: string
) {
  const guildId =
    process.env.DISCORD_SERVER_ID!;

  const roleId =
    process.env.DISCORD_PAID_ROLE_ID!;

  const botToken =
    process.env.DISCORD_BOT_TOKEN!;

  const diagnostic =
    await diagnoseRolePermissions();

  if (
    diagnostic.paidRole.managed
  ) {
    throw new Error(
      `Paid role "${diagnostic.paidRole.name}" is managed and cannot be assigned manually`
    );
  }

  if (
    !diagnostic.hasManageRoles
  ) {
    throw new Error(
      "Discord bot does not have Manage Roles permission"
    );
  }

  if (
    !diagnostic.botAbovePaidRole
  ) {
    throw new Error(
      `Bot role "${diagnostic.highestBotRole.name}" must be above "${diagnostic.paidRole.name}"`
    );
  }

  console.log(
    "Attempting Pitchside Pass role assignment:",
    discordId
  );

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

  console.log(
    "Discord role response:",
    response.status,
    responseText
  );

  if (!response.ok) {
    throw new Error(
      `Discord role assignment failed: ${response.status} ${responseText}`
    );
  }

  const verifyResponse =
    await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`,
      {
        headers: {
          Authorization:
            `Bot ${botToken}`,
        },
      }
    );

  const verifyText =
    await verifyResponse.text();

  if (!verifyResponse.ok) {
    throw new Error(
      `Could not verify Discord member roles: ${verifyResponse.status} ${verifyText}`
    );
  }

  const member =
    JSON.parse(verifyText);

  const rolePresent =
    Array.isArray(
      member.roles
    ) &&
    member.roles.includes(
      roleId
    );

  console.log(
    "Paid role actually present:",
    rolePresent
  );

  if (!rolePresent) {
    throw new Error(
      `Discord returned success but role ${roleId} is not present`
    );
  }

  console.log(
    "Pitchside Pass role successfully assigned and verified:",
    discordId
  );
}

/* -------------------------------------------------------------------------- */
/*                              REMOVE ROLE                                    */
/* -------------------------------------------------------------------------- */

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

  console.log(
    "Discord role removal response:",
    response.status,
    responseText
  );

  if (
    !response.ok &&
    response.status !== 404
  ) {
    throw new Error(
      `Discord role removal failed: ${response.status} ${responseText}`
    );
  }

  console.log(
    "Pitchside Pass role successfully removed:",
    discordId
  );
}

/* -------------------------------------------------------------------------- */
/*                           GET DISCORD USER                                  */
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
/*                         WEBHOOK DEDUPLICATION                               */
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
    "Webhook marked as processed:",
    eventId
  );
}

/* -------------------------------------------------------------------------- */
/*                                  WEBHOOK                                    */
/* -------------------------------------------------------------------------- */

export async function POST(
  request: NextRequest
) {
  const webhookSecret =
    process.env
      .STRIPE_WEBHOOK_SECRET;

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

  let event: Stripe.Event;

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

  console.log(
    "Stripe webhook received:",
    event.type,
    event.id
  );

  try {
    const duplicate =
      await webhookAlreadyProcessed(
        event.id
      );

    if (duplicate) {
      console.log(
        "Duplicate Stripe webhook ignored:",
        event.id
      );

      return NextResponse.json({
        received: true,
        duplicate: true,
      });
    }

    /* ---------------------------------------------------------------------- */
    /*                           SUCCESSFUL CHECKOUT                            */
    /* ---------------------------------------------------------------------- */

    if (
      event.type ===
      "checkout.session.completed"
    ) {
      const checkoutSession =
        event.data
          .object as Stripe.Checkout.Session;

      const discordId =
        checkoutSession
          .metadata
          ?.discordId ??
        checkoutSession
          .client_reference_id;

      if (!discordId) {
        throw new Error(
          "No Discord ID found on Checkout Session"
        );
      }

      console.log(
        "Successful checkout for Discord user:",
        discordId
      );

      /*
       * Load the user's stored Discord OAuth credentials.
       */
      let discordUser =
        await getDiscordUser(
          discordId
        );

      /*
       * Make sure the OAuth access token is still valid.
       *
       * If it has expired or is about to expire, this automatically
       * uses the refresh token and updates Supabase.
       */
      discordUser =
        await ensureValidDiscordToken(
          discordUser
        );

      /*
       * Automatically add them to the server.
       */
      await addDiscordMember(
        discordId,
        discordUser.discord_access_token
      );

      /*
       * Assign paid membership role.
       */
      await addDiscordRole(
        discordId
      );

      /*
       * Store Stripe customer and subscription IDs.
       */
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
          .customer ===
        "string"
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
    /*                         SUBSCRIPTION ENDED                               */
    /* ---------------------------------------------------------------------- */

    if (
      event.type ===
      "customer.subscription.deleted"
    ) {
      const subscription =
        event.data
          .object as Stripe.Subscription;

      let discordId =
        subscription
          .metadata
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
        console.log(
          "Subscription ended for Discord user:",
          discordId
        );

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