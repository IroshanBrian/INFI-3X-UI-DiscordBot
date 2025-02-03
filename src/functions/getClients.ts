import { CommandInteraction, GuildMember } from "discord.js";
import axios from "axios";
import dotenv from "dotenv";
import { getUserSession } from "./auth";
dotenv.config();

const API_URL = `https://${process.env.HOST}:${process.env.PORT}/${process.env.WEBBASEPATH}/panel/api/inbounds/list`;

export const getClients = async (interaction: CommandInteraction) => {
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

  const sessionCookieRaw = getUserSession(interaction.user.id);
  console.log("Raw Session Cookie:", sessionCookieRaw);

  if (!sessionCookieRaw) {
    await interaction.reply({
      content: "❌ Session expired or not found. Please log in again.",
      ephemeral: true,
    });
    return;
  }

  const sessionToken = sessionCookieRaw;

  if (!sessionToken) {
    console.error("❌ Failed to extract session token!");
    await interaction.reply({
      content: "❌ Invalid session token. Please log in again.",
      ephemeral: true,
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

    console.log("API Response:", response.data);

    const inbounds = response.data;

    if (Array.isArray(inbounds) && inbounds.length > 0) {
      const inboundList = inbounds
        .map((inbound: any) => `${inbound.name}`)
        .join("\n");
      await interaction.reply({
        content: `✅ Here are the available inbounds:\n${inboundList}`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "❌ No inbounds available.",
        ephemeral: true,
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
      ephemeral: true,
    });
  }
};
