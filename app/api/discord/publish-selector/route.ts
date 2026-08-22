import { NextRequest, NextResponse } from "next/server";

const CHANNEL_ID = "1540778175582437459";
const MESSAGE_ID = "1540785295807483957";

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const SELECTOR_SECRET = process.env.DISCORD_SELECTOR_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");

    if (
      !SELECTOR_SECRET ||
      authorization !== `Bearer ${SELECTOR_SECRET}`
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
          error: "DISCORD_BOT_TOKEN is missing",
        },
        {
          status: 500,
        }
      );
    }

    const message = {
      embeds: [
        {
          title: "Choose your ticket alerts",

          description:
            "Personalise the ticket alerts you receive by selecting your preferences below. You’ll receive an @ mention when tickets matching your selected preference are released on the site!",

          color: 2537552,

          fields: [
            {
              name: "📣 Atmosphere",
              value:
                "Alerts when tickets are released in the Lower Stretford End (W201–W212 + W101–W106).",
              inline: false,
            },
            {
              name: "🏟️ Stretty",
              value:
                "Alerts when tickets are released in any Stretford End block, lower or upper.",
              inline: false,
            },
            {
              name: "⭐ Pitchside",
              value:
                "Alerts when tickets are released in blocks by the pitch (N1, S1, E1, W1).",
              inline: false,
            },
            {
              name: "👨‍👩‍👧‍👦 Big Drops",
              value:
                "Alerts when more than 10 tickets are released in the same block.",
              inline: false,
            },
          ],

          footer: {
            text: "MUFC Pitchside Pass • Alert Preferences",
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

    const response = await fetch(
      `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages/${MESSAGE_ID}`,
      {
        method: "PATCH",

        headers: {
          Authorization: `Bot ${BOT_TOKEN}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify(message),
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      console.error(
        "Discord selector update failed:",
        response.status,
        responseText
      );

      return NextResponse.json(
        {
          error: "Failed to update role selector",
          discordStatus: response.status,
          details: responseText,
        },
        {
          status: 500,
        }
      );
    }

    const discordMessage = JSON.parse(responseText);

    console.log(
      "Discord role selector updated:",
      discordMessage.id
    );

    return NextResponse.json({
      success: true,
      messageId: discordMessage.id,
      channelId: CHANNEL_ID,
    });
  } catch (error) {
    console.error(
      "Update selector error:",
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