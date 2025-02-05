import { CommandInteraction, GuildMember } from "discord.js";
import axios from "axios";
import dotenv from "dotenv";
import { getUserSession } from "./auth";
dotenv.config();

const API_URL = `https://${process.env.HOST}:${process.env.PORT}/panel/api/inbounds/list`;

export const getClients = async (interaction: CommandInteraction) => {
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

  const sessionToken = sessionCookieRaw;

  if (!sessionToken) {
    console.error("❌ Failed to extract session token!");
    await interaction.reply({
      content: "❌ Invalid session token. Please log in again.",
      flags: 64,
    });
    return;
  }

  try {
    const response = await axios.get(API_URL, {
      headers: {
        Accept: "application/json",
        Cookie: `3x-ui=${sessionToken}`,
      },
    });

    const inbounds = response.data.obj;

    if (Array.isArray(inbounds) && inbounds.length > 0) {
      let clientDetails = "";

      inbounds.forEach((inbound: any) => {
        const settings = JSON.parse(inbound.settings);
        const clients = settings.clients;

        if (Array.isArray(clients) && clients.length > 0) {
          clients.forEach((client: any) => {
            clientDetails += `📧 Email: ${client.email}\n💾 Total GB: ${client.totalGB}\n\n`;
          });

          interaction.reply({
            content: `✅ Here are the client details:\n${clientDetails}`,
            flags: 64,
          });
        }
      });
    } else {
      await interaction.reply({
        content: "❌ No inbounds available.",
        flags: 64,
      });
    }
  } catch (error: any) {
    console.error(
      "❌ Error fetching inbounds:",
      error?.response?.data || error.message
    );
    await interaction.reply({
      content:
        "❌ Failed to retrieve inbounds. Please ensure you're logged in.",
      flags: 64,
    });
  }
};
