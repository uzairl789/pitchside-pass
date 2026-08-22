import {
  NextRequest,
  NextResponse,
} from "next/server";

import nacl from "tweetnacl";

const GUILD_ID =
  process.env.DISCORD_SERVER_ID!;

const BOT_TOKEN =
  process.env.DISCORD_BOT_TOKEN!;

const PAID_ROLE_ID =
  process.env.DISCORD_PAID_ROLE_ID!;

const PUBLIC_KEY =
  process.env.DISCORD_PUBLIC_KEY!;

/*
|--------------------------------------------------------------------------
| SUPPORT CONFIG
|--------------------------------------------------------------------------
*/

const SUPPORT_CATEGORY_ID =
  "1251695418358759504";

const SUPPORT_ADMIN_USER_ID =
  "1063145913415106681";

/*
|--------------------------------------------------------------------------
| ALERT ROLE CONFIG
|--------------------------------------------------------------------------
*/

const ROLE_MAP: Record<
  string,
  {
    name: string;
    roleId: string;
  }
> = {
  atmosphere: {
    name: "Atmosphere",
    roleId:
      "1243770205273063435",
  },

  stretty: {
    name: "Stretty",
    roleId:
      "1243770393811095573",
  },

  pitchside: {
    name: "Pitchside",
    roleId:
      "1243770318116356148",
  },

  bigdrops: {
    name: "Big Drops",
    roleId:
      "1243770359644160022",
  },
};

/*
|--------------------------------------------------------------------------
| DISCORD PERMISSION FLAGS
|--------------------------------------------------------------------------
*/

const VIEW_CHANNEL = "1024";
const SEND_MESSAGES = "2048";
const EMBED_LINKS = "16384";
const ATTACH_FILES = "32768";
const READ_MESSAGE_HISTORY =
  "65536";

const MEMBER_ALLOW_PERMISSIONS =
  (
    BigInt(VIEW_CHANNEL) |
    BigInt(SEND_MESSAGES) |
    BigInt(EMBED_LINKS) |
    BigInt(ATTACH_FILES) |
    BigInt(READ_MESSAGE_HISTORY)
  ).toString();

/*
|--------------------------------------------------------------------------
| VERIFY DISCORD REQUEST
|--------------------------------------------------------------------------
*/

function verifyDiscordRequest(
  rawBody: string,
  signature: string,
  timestamp: string
) {
  try {
    return nacl.sign.detached.verify(
      Buffer.from(
        timestamp + rawBody
      ),

      Buffer.from(
        signature,
        "hex"
      ),

      Buffer.from(
        PUBLIC_KEY,
        "hex"
      )
    );
  } catch {
    return false;
  }
}

/*
|--------------------------------------------------------------------------
| MEMBER LOOKUP
|--------------------------------------------------------------------------
*/

async function getGuildMember(
  userId: string
) {
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userId}`,
    {
      headers: {
        Authorization:
          `Bot ${BOT_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

/*
|--------------------------------------------------------------------------
| ROLE HELPERS
|--------------------------------------------------------------------------
*/

async function addRole(
  userId: string,
  roleId: string
) {
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userId}/roles/${roleId}`,
    {
      method: "PUT",

      headers: {
        Authorization:
          `Bot ${BOT_TOKEN}`,

        "Content-Type":
          "application/json",
      },
    }
  );

  if (!response.ok) {
    const responseText =
      await response.text();

    throw new Error(
      `Failed to add role ${roleId}: ${response.status} ${responseText}`
    );
  }
}

async function removeRole(
  userId: string,
  roleId: string
) {
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userId}/roles/${roleId}`,
    {
      method: "DELETE",

      headers: {
        Authorization:
          `Bot ${BOT_TOKEN}`,

        "Content-Type":
          "application/json",
      },
    }
  );

  if (
    !response.ok &&
    response.status !== 404
  ) {
    const responseText =
      await response.text();

    throw new Error(
      `Failed to remove role ${roleId}: ${response.status} ${responseText}`
    );
  }
}

/*
|--------------------------------------------------------------------------
| GET BOT USER ID
|--------------------------------------------------------------------------
*/

async function getBotUserId() {
  const response = await fetch(
    "https://discord.com/api/v10/users/@me",
    {
      headers: {
        Authorization:
          `Bot ${BOT_TOKEN}`,
      },
    }
  );

  const responseText =
    await response.text();

  if (!response.ok) {
    throw new Error(
      `Unable to identify Discord bot: ${response.status} ${responseText}`
    );
  }

  const bot = JSON.parse(
    responseText
  );

  return String(bot.id);
}

/*
|--------------------------------------------------------------------------
| FIND EXISTING SUPPORT TICKET
|--------------------------------------------------------------------------
|
| Every ticket is called ticket-pitchsidepass.
|
| The opener's Discord ID is stored in the channel topic,
| which lets us prevent that user from opening multiple tickets.
|
*/

async function findExistingTicket(
  userId: string
) {
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${GUILD_ID}/channels`,
    {
      headers: {
        Authorization:
          `Bot ${BOT_TOKEN}`,
      },
    }
  );

  const responseText =
    await response.text();

  if (!response.ok) {
    throw new Error(
      `Unable to check support tickets: ${response.status} ${responseText}`
    );
  }

  const channels =
    JSON.parse(responseText);

  return channels.find(
    (channel: any) =>
      channel.parent_id ===
        SUPPORT_CATEGORY_ID &&
      channel.name ===
        "ticket-pitchsidepass" &&
      channel.topic ===
        `pitchside-support:${userId}`
  );
}

/*
|--------------------------------------------------------------------------
| CREATE SUPPORT TICKET
|--------------------------------------------------------------------------
*/

async function createSupportTicket(
  userId: string
) {
  const existingTicket =
    await findExistingTicket(
      userId
    );

  if (existingTicket) {
    return {
      channel:
        existingTicket,

      alreadyExists: true,
    };
  }

  const botUserId =
    await getBotUserId();

  /*
   * @everyone role ID is the guild ID.
   */
  const permissionOverwrites = [
    /*
     * Hide from everybody.
     */
    {
      id: GUILD_ID,
      type: 0,
      deny: VIEW_CHANNEL,
      allow: "0",
    },

    /*
     * Ticket opener.
     */
    {
      id: userId,
      type: 1,
      allow:
        MEMBER_ALLOW_PERMISSIONS,
      deny: "0",
    },

    /*
     * You.
     */
    {
      id:
        SUPPORT_ADMIN_USER_ID,
      type: 1,
      allow:
        MEMBER_ALLOW_PERMISSIONS,
      deny: "0",
    },

    /*
     * Pitchside Pass bot.
     */
    {
      id:
        botUserId,
      type: 1,
      allow:
        MEMBER_ALLOW_PERMISSIONS,
      deny: "0",
    },
  ];

  const response = await fetch(
    `https://discord.com/api/v10/guilds/${GUILD_ID}/channels`,
    {
      method: "POST",

      headers: {
        Authorization:
          `Bot ${BOT_TOKEN}`,

        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        name:
          "ticket-pitchsidepass",

        type: 0,

        parent_id:
          SUPPORT_CATEGORY_ID,

        topic:
          `pitchside-support:${userId}`,

        permission_overwrites:
          permissionOverwrites,
      }),
    }
  );

  const responseText =
    await response.text();

  if (!response.ok) {
    throw new Error(
      `Unable to create support ticket: ${response.status} ${responseText}`
    );
  }

  const channel =
    JSON.parse(responseText);

  /*
  |--------------------------------------------------------------------------
  | SEND WELCOME MESSAGE INSIDE TICKET
  |--------------------------------------------------------------------------
  */

  const welcomeResponse =
    await fetch(
      `https://discord.com/api/v10/channels/${channel.id}/messages`,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bot ${BOT_TOKEN}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          content:
            `<@${userId}> <@${SUPPORT_ADMIN_USER_ID}>`,

          embeds: [
            {
              title:
                "🎫 Pitchside Pass Support",

              description:
                "Your private support ticket is now open.\n\nPlease explain what you need help with and include any useful information or screenshots.",

              color: 2537552,

              footer: {
                text:
                  "When your issue has been resolved, use the button below to close this ticket.",
              },
            },
          ],

          components: [
            {
              type: 1,

              components: [
                {
                  type: 2,
                  style: 4,

                  custom_id:
                    "close_support_ticket",

                  label:
                    "Close Ticket",

                  emoji: {
                    name: "🔒",
                  },
                },
              ],
            },
          ],

          allowed_mentions: {
            users: [
              userId,
              SUPPORT_ADMIN_USER_ID,
            ],
          },
        }),
      }
    );

  const welcomeText =
    await welcomeResponse.text();

  if (!welcomeResponse.ok) {
    console.error(
      "Ticket created but welcome message failed:",
      welcomeResponse.status,
      welcomeText
    );
  }

  return {
    channel,
    alreadyExists: false,
  };
}

/*
|--------------------------------------------------------------------------
| DELETE SUPPORT TICKET
|--------------------------------------------------------------------------
*/

async function deleteSupportTicket(
  channelId: string
) {
  const response = await fetch(
    `https://discord.com/api/v10/channels/${channelId}`,
    {
      method: "DELETE",

      headers: {
        Authorization:
          `Bot ${BOT_TOKEN}`,
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
      `Unable to close support ticket: ${response.status} ${responseText}`
    );
  }
}

/*
|--------------------------------------------------------------------------
| INTERACTION ENDPOINT
|--------------------------------------------------------------------------
*/

export async function POST(
  request: NextRequest
) {
  const signature =
    request.headers.get(
      "x-signature-ed25519"
    );

  const timestamp =
    request.headers.get(
      "x-signature-timestamp"
    );

  if (
    !signature ||
    !timestamp
  ) {
    return new NextResponse(
      "Missing Discord signature",
      {
        status: 401,
      }
    );
  }

  const rawBody =
    await request.text();

  const valid =
    verifyDiscordRequest(
      rawBody,
      signature,
      timestamp
    );

  if (!valid) {
    return new NextResponse(
      "Invalid Discord signature",
      {
        status: 401,
      }
    );
  }

  const interaction =
    JSON.parse(rawBody);

  /*
  |--------------------------------------------------------------------------
  | DISCORD VERIFICATION PING
  |--------------------------------------------------------------------------
  */

  if (interaction.type === 1) {
    return NextResponse.json({
      type: 1,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | BUTTON INTERACTIONS
  |--------------------------------------------------------------------------
  */

  if (interaction.type === 3) {
    try {
      const customId =
        interaction.data
          ?.custom_id;

      const userId =
        interaction.member
          ?.user?.id;

      if (!userId) {
        return NextResponse.json({
          type: 4,

          data: {
            content:
              "We couldn't identify your Discord account.",

            flags: 64,
          },
        });
      }

      /*
      |--------------------------------------------------------------------------
      | OPEN SUPPORT TICKET
      |--------------------------------------------------------------------------
      */

      if (
        customId ===
        "open_support_ticket"
      ) {
        const result =
          await createSupportTicket(
            userId
          );

        if (
          result.alreadyExists
        ) {
          return NextResponse.json({
            type: 4,

            data: {
              content:
                `You already have an open support ticket: <#${result.channel.id}>`,

              flags: 64,
            },
          });
        }

        return NextResponse.json({
          type: 4,

          data: {
            content:
              `Your private support ticket has been created: <#${result.channel.id}>`,

            flags: 64,
          },
        });
      }

      /*
      |--------------------------------------------------------------------------
      | CLOSE SUPPORT TICKET
      |--------------------------------------------------------------------------
      */

      if (
        customId ===
        "close_support_ticket"
      ) {
        const channelId =
          interaction.channel_id;

        if (!channelId) {
          return NextResponse.json({
            type: 4,

            data: {
              content:
                "Unable to identify this support ticket.",

              flags: 64,
            },
          });
        }

        /*
         * Check this is actually a support ticket before deleting it.
         */
        const channelResponse =
          await fetch(
            `https://discord.com/api/v10/channels/${channelId}`,
            {
              headers: {
                Authorization:
                  `Bot ${BOT_TOKEN}`,
              },
            }
          );

        const channelText =
          await channelResponse.text();

        if (
          !channelResponse.ok
        ) {
          return NextResponse.json({
            type: 4,

            data: {
              content:
                "Unable to verify this support ticket.",

              flags: 64,
            },
          });
        }

        const channel =
          JSON.parse(
            channelText
          );

        if (
          channel.parent_id !==
            SUPPORT_CATEGORY_ID ||
          channel.name !==
            "ticket-pitchsidepass"
        ) {
          return NextResponse.json({
            type: 4,

            data: {
              content:
                "This button can only be used inside a Pitchside Pass support ticket.",

              flags: 64,
            },
          });
        }

        /*
         * Only the opener or you can close it.
         */
        const openerId =
          typeof channel.topic ===
            "string" &&
          channel.topic.startsWith(
            "pitchside-support:"
          )
            ? channel.topic.replace(
                "pitchside-support:",
                ""
              )
            : null;

        const allowedToClose =
          userId === openerId ||
          userId ===
            SUPPORT_ADMIN_USER_ID;

        if (!allowedToClose) {
          return NextResponse.json({
            type: 4,

            data: {
              content:
                "Only the person who opened this ticket or Pitchside Pass support can close it.",

              flags: 64,
            },
          });
        }

        await deleteSupportTicket(
          channelId
        );

        return NextResponse.json({
          type: 4,

          data: {
            content:
              "Support ticket closed.",

            flags: 64,
          },
        });
      }

      /*
      |--------------------------------------------------------------------------
      | ALERT ROLE SELECTOR
      |--------------------------------------------------------------------------
      */

      const role =
        ROLE_MAP[customId];

      if (!role) {
        return NextResponse.json({
          type: 4,

          data: {
            content:
              "That option could not be found.",

            flags: 64,
          },
        });
      }

      const member =
        await getGuildMember(
          userId
        );

      if (!member) {
        return NextResponse.json({
          type: 4,

          data: {
            content:
              "We couldn't find your Discord membership.",

            flags: 64,
          },
        });
      }

      /*
       * Alert roles require the paid membership role.
       */
      const hasPaidRole =
        Array.isArray(
          member.roles
        ) &&
        member.roles.includes(
          PAID_ROLE_ID
        );

      if (!hasPaidRole) {
        return NextResponse.json({
          type: 4,

          data: {
            content:
              "🔒 An active MUFC Pitchside Pass membership is required to select ticket alert preferences.",

            flags: 64,
          },
        });
      }

      const alreadyHasRole =
        member.roles.includes(
          role.roleId
        );

      if (alreadyHasRole) {
        await removeRole(
          userId,
          role.roleId
        );

        return NextResponse.json({
          type: 4,

          data: {
            content:
              `✓ ${role.name} alerts removed.`,

            flags: 64,
          },
        });
      }

      await addRole(
        userId,
        role.roleId
      );

      return NextResponse.json({
        type: 4,

        data: {
          content:
            `✓ ${role.name} alerts enabled.`,

          flags: 64,
        },
      });
    } catch (error) {
      console.error(
        "Discord interaction error:",
        error
      );

      return NextResponse.json({
        type: 4,

        data: {
          content:
            "Something went wrong. Please try again.",

          flags: 64,
        },
      });
    }
  }

  return NextResponse.json({
    type: 4,

    data: {
      content:
        "Unsupported interaction.",

      flags: 64,
    },
  });
}