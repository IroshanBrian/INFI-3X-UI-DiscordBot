import { CommandInteraction } from "discord.js";

/**
 * Handles the /ping command.
 * @param interaction - The Discord command interaction
 */
export async function handlePing(interaction: CommandInteraction) {
    await interaction.reply("Pong! 🏓");
}
