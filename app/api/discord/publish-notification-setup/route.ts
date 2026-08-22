import { NextRequest, NextResponse } from "next/server";

const CHANNEL_ID = "1247587314142675026";

const BOT_TOKEN =
  process.env.DISCORD_BOT_TOKEN!;

const PUBLISH_SECRET =
  process.env.DISCORD_SELECTOR_SECRET!;

const SITE_URL =
  "https://pitchsidepass.co.uk";

export async function POST(
  request: NextRequest
) {
  try {
    const authorization =
      request.headers.get("authorization");

    /*
    |--------------------------------------------------------------------------
    | PROTECT THE PUBLISH ROUTE
    |--------------------------------------------------------------------------
    */

    if (
      !PUBLISH_SECRET ||
      authorization !==
        `Bearer ${PUBLISH_SECRET}`
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    if (!BOT_TOKEN) {
      return NextResponse.json(
        {
          error:
            "DISCORD_BOT_TOKEN is missing",
        },
        {
          status: 500,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | NOTIFICATION SETUP MESSAGE
    |--------------------------------------------------------------------------
    */

    const message = {
      embeds: [
        /*
        |--------------------------------------------------------------------------
        | INTRO
        |--------------------------------------------------------------------------
        */
        {
          title: "🔔 Notification Setup",

          description:
            "Here we will show you how to switch on notifications and customise your Discord in order to receive the specific notifications you would like.",

          color: 2537552,
        },

        /*
        |--------------------------------------------------------------------------
        | 1. MUTE CHANNEL
        |--------------------------------------------------------------------------
        */
        {
          title:
            "1. How to mute a specific channel",

          description:
            "You may want to mute a specific game channel if you already have a ticket for the fixture, or if tickets are readily available on the site for that fixture.\n\n**Follow the steps below on mobile:**\n\n• Press and hold the specific channel you would like to mute\n• Press **Mute Channel**\n• Press **Until I turn it back on**",

          color: 2537552,

          image: {
            url:
              `${SITE_URL}/mute-channel.png`,
          },
        },

        {
          color: 2537552,

          image: {
            url:
              `${SITE_URL}/mute-until-back-on.png`,
          },
        },

        /*
        |--------------------------------------------------------------------------
        | 2. ALL SEATS
        |--------------------------------------------------------------------------
        */
        {
          title:
            "2. How to receive notifications for all seats",

          description:
            "If you want to receive notifications for **any seat** which appears on the website — and not just seats matching the preferences selected through our role selector — follow the steps below:\n\n• Press and hold the specific channel you would like to receive notifications for\n• Press **Notification Settings**\n• Press **All Messages**",

          color: 2537552,

          image: {
            url:
              `${SITE_URL}/notification-settings.png`,
          },
        },

        {
          color: 2537552,

          image: {
            url:
              `${SITE_URL}/all-messages.png`,
          },
        },

        /*
        |--------------------------------------------------------------------------
        | 3. ROLE-ONLY NOTIFICATIONS
        |--------------------------------------------------------------------------
        */
        {
          title:
            "3. How to receive notifications only for your specific roles",

          description:
            "You may only want to sit in a certain area of the stadium, for example **Stretford End, TRA or Pitchside**.\n\nFirstly, head over to <#1245790102446145677> to choose your alert preferences.\n\nIf you **only** want to receive notifications for the roles you selected, follow the steps below for each game channel:\n\n• Press and hold the specific channel you would like to receive notifications for\n• Press **Notification Settings**\n• Press **Only @mentions**\n\nYou will then be notified when one of your selected alert roles is mentioned.",

          color: 2537552,

          image: {
            url:
              `${SITE_URL}/notification-settings.png`,
          },
        },

        {
          color: 2537552,

          image: {
            url:
              `${SITE_URL}/only-mentions.png`,
          },

          footer: {
            text:
              "MUFC Pitchside Pass • Notification Setup",
          },
        },
      ],
    };

    /*
    |--------------------------------------------------------------------------
    | SEND MESSAGE
    |--------------------------------------------------------------------------
    */

    const response = await fetch(
      `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bot ${BOT_TOKEN}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          message
        ),
      }
    );

    const responseText =
      await response.text();

    if (!response.ok) {
      console.error(
        "Notification setup publish failed:",
        response.status,
        responseText
      );

      return NextResponse.json(
        {
          error:
            "Failed to publish notification setup",

          discordStatus:
            response.status,

          details:
            responseText,
        },
        {
          status: 500,
        }
      );
    }

    const discordMessage =
      JSON.parse(responseText);

    console.log(
      "Notification setup published:",
      discordMessage.id
    );

    return NextResponse.json({
      success: true,

      messageId:
        discordMessage.id,

      channelId:
        CHANNEL_ID,
    });
  } catch (error) {
    console.error(
      "Notification setup publish error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}