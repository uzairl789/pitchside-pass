import {
  NextRequest,
  NextResponse,
} from "next/server";

const CHANNEL_ID =
  "1540821571483082872";

const BOT_TOKEN =
  process.env.DISCORD_BOT_TOKEN!;

const PUBLISH_SECRET =
  process.env.DISCORD_SELECTOR_SECRET!;

export async function POST(
  request: NextRequest
) {
  try {
    const authorization =
      request.headers.get(
        "authorization"
      );

    /*
    |--------------------------------------------------------------------------
    | AUTHORISATION
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
    | TICKET BUYING GUIDE
    |--------------------------------------------------------------------------
    */

    const message = {
      embeds: [
        /*
        |--------------------------------------------------------------------------
        | INTRODUCTION
        |--------------------------------------------------------------------------
        */
        {
          title:
            "🎟️ Ticket Buying Guide",

          description:
            "**Make the most of your Pitchside Pass alerts.**\n\nWhen an alert comes through, you'll have two ways to access the available tickets:\n\n🏟️ **Hallmap** — Opens the stadium view and gives you the **Choose seats for me** option.\n\n📍 **Block View** — Takes you directly to the block where the ticket has appeared.",

          color: 2537552,
        },

        /*
        |--------------------------------------------------------------------------
        | HALLMAP
        |--------------------------------------------------------------------------
        */
        {
          title:
            "🏟️ Using the Hallmap",

          description:
            "**Best for: Pairs or multiple tickets**\n\nSelect the number of tickets you need and press **Choose seats for me**. The website will automatically try to find seats for you.\n\n⚠️ If several blocks match your filters, the website may choose seats from **any of those blocks**.",

          color: 2537552,

          fields: [
            {
              name: "💡 TOP TIP",

              value:
                "**1.** Keep the match open in your browser.\n**2.** Select the number of tickets you need in advance.\n**3.** When an alert appears, go straight to your open browser tab.\n**4.** Refresh → **Choose seats for me**.\n\n🔄 **Refresh the page every 10–15 minutes while waiting.** This helps avoid a full reload when tickets appear and can save valuable time.",

              inline: false,
            },
          ],
        },

        /*
        |--------------------------------------------------------------------------
        | BLOCK VIEW
        |--------------------------------------------------------------------------
        */
        {
          title:
            "📍 Using Block View",

          description:
            "**Best for: Larger ticket drops or choosing specific seats**\n\nTap the alert → **Block View** → wait for the seat map to load → select the highlighted available seats.",

          color: 2537552,

          fields: [
            {
              name:
                "💡 HOW TO KNOW YOU'VE BASKETED IT",

              value:
                "A highlighted seat **doesn't necessarily mean it's yours yet**.\n\nAfter selecting it, scroll down. If you can see the **Row and Seat Number**, the ticket has been added to your basket.",

              inline: false,
            },
          ],
        },

        /*
        |--------------------------------------------------------------------------
        | SINGLE DROPS
        |--------------------------------------------------------------------------
        */
        {
          title:
            "🚨 Don't worry about missing single drops",

          description:
            "Single-ticket alerts can disappear extremely quickly, so **don't be disheartened if you miss them**.\n\nThe biggest advantage of Pitchside Pass comes when **larger ticket drops** happen.\n\nManchester United can release additional seats outside the scheduled releases, sometimes with significant numbers appearing at once.\n\nThese larger drops can provide some of the **best opportunities to secure tickets — including for high-demand fixtures.**",

          color: 2537552,
        },

        /*
        |--------------------------------------------------------------------------
        | FINAL REMINDER
        |--------------------------------------------------------------------------
        */
        {
          title: "⚡ Remember",

          description:
            "Pitchside Pass gives you the information **as quickly as possible**, but an alert does not guarantee a ticket.\n\nOther supporters may be trying to secure the same seats at the same time, so **speed matters once an alert arrives.**\n\nThe more familiar you become with the **Hallmap** and **Block View** methods, the quicker you'll be able to react.",

          color: 2537552,

          footer: {
            text:
              "MUFC Pitchside Pass • Ticket Buying Guide",
          },
        },
      ],
    };

    /*
    |--------------------------------------------------------------------------
    | SEND TO DISCORD
    |--------------------------------------------------------------------------
    */

    const response =
      await fetch(
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

    /*
    |--------------------------------------------------------------------------
    | DISCORD ERROR
    |--------------------------------------------------------------------------
    */

    if (!response.ok) {
      console.error(
        "Ticket guide publish failed:",
        response.status,
        responseText
      );

      return NextResponse.json(
        {
          error:
            "Failed to publish ticket buying guide",

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

    /*
    |--------------------------------------------------------------------------
    | SUCCESS
    |--------------------------------------------------------------------------
    */

    const discordMessage =
      JSON.parse(responseText);

    console.log(
      "Ticket buying guide published:",
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
      "Ticket guide publish error:",
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