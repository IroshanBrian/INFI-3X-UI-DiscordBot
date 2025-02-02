import { CommandInteraction, GuildMember } from "discord.js";
import logger from "../../utils/logger";

export const auth = async (interaction: CommandInteraction) => {
    if (!(interaction.member instanceof GuildMember)) {
        await interaction.reply({
            content: "You must be a member of the server to use this.",
            ephemeral: true,
        });
        return;
    }

    const REQUIRED_ROLE = "X";

    if (!interaction.member.roles.cache.some(role => role.name === REQUIRED_ROLE)) {
        await interaction.reply({
            content: "You do not have the required role to access this.",
            ephemeral: true,
        });
        return;
    }


    const username = interaction.options.get('username')?.value as string;
    const password = interaction.options.get('password')?.value as string;


    if (username === "admin" && password === "password") {
        await interaction.reply("Login successful!");
        logger.info(`User ${username} logged in.!`)
    } else {
        await interaction.reply("Invalid username or password.");
        logger.error(`Invalid username or password.`)
    }
};
