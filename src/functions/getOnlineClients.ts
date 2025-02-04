import { CommandInteraction, GuildMember } from "discord.js";
import axios from "axios";
import dotenv from "dotenv";
import { getUserSession } from "./auth";
dotenv.config();

const API_URL = `https://${process.env.HOST}:${process.env.PORT}/panel/api/inbounds/onlines`;

export const getOnlineClients = async (interaction: CommandInteraction) => {
  if (!(interaction.member instanceof GuildMember)) {
    await interaction.reply({
      content: "❌ You must be a member of the server to use this.",
      flags: 64,
    });
    return;
  }

  const REQUIRED_ROLE = "X";
  if (
    !interaction.member.roles.cache.some((role) => role.name === REQUIRED_ROLE)
  ) {
    await interaction.reply({
      content: "❌ You do not have the required role to access this.",
      flags: 64,
    });
    return;
  }

  const sessionCookieRaw = getUserSession(interaction.user.id);

  if (!sessionCookieRaw) {
    await interaction.reply({
      content: "❌ Session expired or not found. Please log in again.",
      flags: 64,
    });
    return;
  }

  const sessionToken = sessionCookieRaw.trim();

  if (!sessionToken) {
    console.error("❌ Failed to extract session token!");
    await interaction.reply({
      content: "❌ Invalid session token. Please log in again.",
      flags: 64,
    });
    return;
  }

  try {
    const response = await axios.post(
      API_URL,
      {},
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Cookie: `3x-ui=${sessionToken}`,
        },
        timeout: 5000,
      }
    );

    const inbounds = response.data.obj;

    if (Array.isArray(inbounds) && inbounds.length > 0) {
      await interaction.reply({
        content: `🌐 Online clients: ${inbounds.join(", ")}`,
      });
    } else {
      await interaction.reply({
        content: "🔍 No online clients found.",
      });
    }
  } catch (error: any) {
    console.error(
      "❌ Failed to fetch online clients:",
      error?.response?.data || error.message
    );
    await interaction.reply({
      content: "❌ An error occurred while fetching online clients.",
      flags: 64,
    });
  }
};
