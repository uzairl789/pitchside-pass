import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const PUBLISH_SECRET = process.env.DISCORD_SELECTOR_SECRET!;

const DASHBOARD_CHANNEL_ID = "1540799795289923774";
const JOIN_CHANNEL_ID = "1540799832275288144";
const SUPPORT_CHANNEL_ID = "1540800981430829137";

const SITE_URL = "https://pitchsidepass.co.uk";

async function sendDiscordMessage(
  channelId: string,
  payload: unknown
) {
  const response = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `Discord message failed in channel ${channelId}: ${response.status} ${responseText}`
    );
  }

  return JSON.parse(responseText);
}

export async function POST(
  request: NextRequest
) {
  try {
    const authorization =
      request.headers.get("authorization");

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
    | MEMBERSHIP DASHBOARD
    |--------------------------------------------------------------------------
    */

    const dashboardMessage =
      await sendDiscordMessage(
        DASHBOARD_CHANNEL_ID,
        {
          embeds: [
            {
              title:
                "🎟️ Membership Dashboard",

              description:
                "Manage your Pitchside Pass membership, billing and Discord access from your personal dashboard.",

              color: 2537552,

              footer: {
                text:
                  "Pitchside Pass • Member Portal",
              },
            },
          ],

          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 5,
                  label:
                    "Open Dashboard",
                  url:
                    `${SITE_URL}/account`,
                  emoji: {
                    name: "⚙️",
                  },
                },
              ],
            },
          ],
        }
      );

    /*
    |--------------------------------------------------------------------------
    | JOIN PITCHSIDE PASS
    |--------------------------------------------------------------------------
    */

    const joinMessage =
      await sendDiscordMessage(
        JOIN_CHANNEL_ID,
        {
          embeds: [
            {
              title:
                "⚡ Join Pitchside Pass",

              description:
                "Get instant ticket alerts with Pitchside Pass.\n\nConnect your Discord account, activate your membership and get access to our alert channels.",

              color: 2537552,

              footer: {
                text:
                  "Pitchside Pass • Instant Ticket Alerts",
              },
            },
          ],

          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 5,
                  label:
                    "Get Started",
                  url:
                    `${SITE_URL}/login`,
                  emoji: {
                    name: "⚡",
                  },
                },
              ],
            },
          ],
        }
      );

    /*
    |--------------------------------------------------------------------------
    | SUPPORT
    |--------------------------------------------------------------------------
    */

    const supportMessage =
      await sendDiscordMessage(
        SUPPORT_CHANNEL_ID,
        {
          embeds: [
            {
              title:
                "🎫 Pitchside Pass Support",

              description:
                "Need help with your membership, billing, Discord access or anything else?\n\nOpen a private support ticket below and we’ll help you directly.",

              color: 2537552,

              footer: {
                text:
                  "Your support ticket will only be visible to you and Pitchside Pass.",
              },
            },
          ],

          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 3,
                  custom_id:
                    "open_support_ticket",
                  label:
                    "Open Support Ticket",
                  emoji: {
                    name: "🎫",
                  },
                },
              ],
            },
          ],
        }
      );

    return NextResponse.json({
      success: true,

      dashboardMessageId:
        dashboardMessage.id,

      joinMessageId:
        joinMessage.id,

      supportMessageId:
        supportMessage.id,
    });
  } catch (error) {
    console.error(
      "Utility panel publishing error:",
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