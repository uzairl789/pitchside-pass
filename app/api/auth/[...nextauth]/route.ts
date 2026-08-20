import NextAuth, { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "identify email guilds.join",
          prompt: "consent",
        },
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account, profile }) {
      /*
       * This callback also runs during ordinary session checks.
       * account/profile will only exist during a fresh Discord login.
       */

      if (profile?.id) {
        token.discordId = String(profile.id);
      }

      if (
        account?.provider === "discord" &&
        profile?.id &&
        account.access_token
      ) {
        const discordId = String(profile.id);

        console.log("---- FRESH DISCORD OAUTH ----");
        console.log("Discord ID:", discordId);
        console.log(
          "Access token received:",
          Boolean(account.access_token)
        );
        console.log(
          "Refresh token received:",
          Boolean(account.refresh_token)
        );

        const expiresAt = account.expires_at
          ? new Date(
              account.expires_at * 1000
            ).toISOString()
          : null;

        const { data, error } = await supabaseAdmin
          .from("discord_users")
          .upsert(
            {
              discord_id: discordId,
              discord_access_token:
                account.access_token,

              discord_refresh_token:
                account.refresh_token ?? null,

              discord_token_expires_at:
                expiresAt,

              updated_at:
                new Date().toISOString(),
            },
            {
              onConflict: "discord_id",
            }
          )
          .select();

        if (error) {
          console.error(
            "SUPABASE UPSERT ERROR:",
            error
          );
        } else {
          console.log(
            "SUPABASE UPSERT SUCCESS for:",
            discordId
          );

          console.log(
            "Rows returned:",
            data?.length ?? 0
          );
        }

        console.log(
          "---- END FRESH DISCORD OAUTH ----"
        );
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.discordId) {
        session.user.discordId =
          token.discordId as string;
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };