import { NextRequest, NextResponse } from "next/server";
import nacl from "tweetnacl";

const GUILD_ID = process.env.DISCORD_SERVER_ID!;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const PAID_ROLE_ID = process.env.DISCORD_PAID_ROLE_ID!;
const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY!;

const ROLE_MAP: Record<
  string,
  {
    name: string;
    roleId: string;
  }
> = {
  atmosphere: {
    name: "Atmosphere",
    roleId: "1243770205273063435",
  },

  stretty: {
    name: "Stretty",
    roleId: "1243770393811095573",
  },

  pitchside: {
    name: "Pitchside",
    roleId: "1243770318116356148",
  },

  bigdrops: {
    name: "Big Drops",
    roleId: "1243770359644160022",
  },
};

function verifyDiscordRequest(
  rawBody: string,
  signature: string,
  timestamp: string
) {
  try {
    return nacl.sign.detached.verify(
      Buffer.from(timestamp + rawBody),
      Buffer.from(signature, "hex"),
      Buffer.from(PUBLIC_KEY, "hex")
    );
  } catch {
    return false;
  }
}

async function getGuildMember(
  userId: string
) {
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userId}`,
    {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

async function addRole(
  userId: string,
  roleId: string
) {
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userId}/roles/${roleId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `Failed to add role ${roleId}: ${response.status} ${body}`
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
        Authorization: `Bot ${BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok && response.status !== 404) {
    const body = await response.text();

    throw new Error(
      `Failed to remove role ${roleId}: ${response.status} ${body}`
    );
  }
}

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

  if (!signature || !timestamp) {
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
  | DISCORD PING
  |--------------------------------------------------------------------------
  */

  if (interaction.type === 1) {
    return NextResponse.json({
      type: 1,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | BUTTON INTERACTION
  |--------------------------------------------------------------------------
  */

  if (interaction.type === 3) {
    try {
      const customId =
        interaction.data?.custom_id;

      const role =
        ROLE_MAP[customId];

      if (!role) {
        return NextResponse.json({
          type: 4,
          data: {
            content:
              "That alert option could not be found.",
            flags: 64,
          },
        });
      }

      const userId =
        interaction.member?.user?.id;

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
      |--------------------------------------------------------------------------
      | REQUIRE ACTIVE MUFC PITCHSIDE PASS ROLE
      |--------------------------------------------------------------------------
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

      /*
      |--------------------------------------------------------------------------
      | TOGGLE SELECTED ALERT ROLE
      |--------------------------------------------------------------------------
      */

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
            "Something went wrong while updating your alert preferences.",
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