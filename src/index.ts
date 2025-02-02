import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { handlePing } from "./functions/handlePing";
import { registerCommands } from "./commands/registerCommands";
import logger from "../utils/logger";
import { auth } from "./functions/auth";

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

client.once("ready", async () => {
    logger.info(`Logged in as ${client.user?.tag}!`);
    await registerCommands();
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    try {
        switch (interaction.commandName) {
            case "ping":
                await handlePing(interaction);
                break;
            case "login":
                await auth(interaction);
                break;
            default:
                await interaction.reply("Unknown command.");
        }
    } catch (error) {
        logger.error(`Error handling command ${interaction.commandName}:`, error);
        await interaction.reply("An error occurred while executing the command.");
    }
});

client.login(process.env.TOKEN).catch((err) => {
    logger.error("Failed to log in:", err);
});
