import { CommandInteraction, GuildMember } from "discord.js";
import axios from "axios";
import dotenv from "dotenv";
import logger from "../../utils/logger";
dotenv.config();

const userSessions = new Map<string, string>();
const API_URL = `https://${process.env.HOST}:${process.env.PORT}/login`;

export const auth = async (interaction: CommandInteraction) => {
  if (!(interaction.member instanceof GuildMember)) {
    await interaction.reply({
      content: "❌ You must be a member of the server to use this.",
      ephemeral: true,
    });
    return;
  }

  const REQUIRED_ROLE = "X";

  if (
    !interaction.member.roles.cache.some((role) => role.name === REQUIRED_ROLE)
  ) {
    await interaction.reply({
      content: "❌ You do not have the required role to access this.",
      ephemeral: true,
    });
    return;
  }

  const username = interaction.options.get("username")?.value as string;
  const password = interaction.options.get("password")?.value as string;

  try {
    const response = await axios.post(
      API_URL,
      new URLSearchParams({
        username: username,
        password: password,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        withCredentials: true,
      }
    );

    if (response.status === 200 && response.data) {
      const cookies = response.headers["set-cookie"];
      if (cookies && cookies.length >= 2) {
        const secondCookie = cookies[1];
        const tokenMatch = secondCookie.match(/3x-ui=([^;]+)/);

        if (tokenMatch) {
          const sessionCookie = tokenMatch[1];
          if (sessionCookie) {
            userSessions.set(interaction.user.id, sessionCookie);
            logger.info(`User ${interaction.user.id} logged in.`);
            await interaction.reply(
              "✅ Login successful! Your session ID has been created."
            );
          } else {
            await interaction.reply("❌ Session ID could not be retrieved.");
          }
        } else {
          await interaction.reply("❌ Token not found in the second cookie.");
        }
      } else {
        await interaction.reply("❌ Not enough cookies in the response.");
      }
    } else {
      await interaction.reply("❌ Invalid username or password.");
    }
  } catch (error) {
    console.error("Login error:", error);
    await interaction.reply(
      "❌ There was an error with the login process. Please try again."
    );
  }
};

export const getUserSession = (userId: string): string | undefined => {
  return userSessions.get(userId);
};
