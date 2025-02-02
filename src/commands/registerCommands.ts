import { REST, Routes, SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";
import logger from "../../utils/logger";

dotenv.config();

const CLIENT_ID = process.env.CLIENT_ID!;
const GUILD_ID = process.env.GUILD_ID!;

const commands = [
    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!"),
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN!);

export async function registerCommands() {
    try {
        logger.info("Registering slash commands...");
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands }
        );
        logger.info("Slash commands registered successfully!");
    } catch (error) {
        logger.error("Error registering commands:", error);
    }
}
