import { NextRequest, NextResponse } from "next/server";

const CHANNEL_ID = "1540778175582437459";

const BOT_TOKEN =
  process.env.DISCORD_BOT_TOKEN!;

const SELECTOR_SECRET =
  process.env.DISCORD_SELECTOR_SECRET!;

export async function POST(
  request: NextRequest
) {
  try {
    /*
    |--------------------------------------------------------------------------
    | ADMIN PROTECTION
    |--------------------------------------------------------------------------
    */

    const authorization =
      request.headers.get("authorization");

    if (
      !SELECTOR_SECRET ||
      authorization !==
        `Bearer ${SELECTOR_SECRET}`
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
    | ROLE SELECTOR MESSAGE
    |--------------------------------------------------------------------------
    */

    const message = {
      embeds: [
        {
          title:
            "Choose your ticket alerts",

          description:
            "Personalise the ticket alerts you receive by selecting the options below.\n\nYou can change your selections at any time by pressing the same button again.",

          color: 2537552,

          fields: [
            {
              name: "📣 Atmosphere",
              value:
                "Alerts focused on seats and areas known for atmosphere.",
              inline: false,
            },
            {
              name: "🏟️ Stretty",
              value:
                "Alerts for Stretford End availability.",
              inline: false,
            },
            {
              name: "⭐ Pitchside",
              value:
                "Alerts for seats closer to the pitch.",
              inline: false,
            },
            {
              name: "👨‍👩‍👧‍👦 Big Drops",
              value:
                "Alerts when larger quantities of tickets become available.",
              inline: false,
            },
          ],

          footer: {
            text:
              "MUFC Pitchside Pass • Alert Preferences",
          },
        },
      ],

      components: [
        {
          type: 1,

          components: [
            {
              type: 2,
              style: 2,
              custom_id: "atmosphere",
              label: "Atmosphere",
              emoji: {
                name: "📣",
              },
            },

            {
              type: 2,
              style: 2,
              custom_id: "stretty",
              label: "Stretty",
              emoji: {
                name: "🏟️",
              },
            },

            {
              type: 2,
              style: 2,
              custom_id: "pitchside",
              label: "Pitchside",
              emoji: {
                name: "⭐",
              },
            },

            {
              type: 2,
              style: 2,
              custom_id: "bigdrops",
              label: "Big Drops",
              emoji: {
                name: "👨‍👩‍👧‍👦",
              },
            },
          ],
        },
      ],
    };

    /*
    |--------------------------------------------------------------------------
    | SEND TO DISCORD
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
        "Discord selector publish failed:",
        response.status,
        responseText
      );

      return NextResponse.json(
        {
          error:
            "Failed to publish role selector",
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
      "Discord role selector published:",
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
      "Publish selector error:",
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