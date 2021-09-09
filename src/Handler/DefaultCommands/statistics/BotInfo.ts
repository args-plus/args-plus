import { MessageEmbed } from "discord.js";
import { Command } from "../../Client/Commands/command";

export const command = new Command();
command.name = "botinfo";
command.description = "Shows the statistics of the bot";

command.run = async (args, commandRan, commandClass) => {
    const { client } = commandClass;

    client.messageHandler.sendMessage(
        commandRan,
        `**Displaying bot information for ${client.user.tag}**\n\n**ID:** \`\`${client.user.id}\`\`\n**Total servers:** \`\`${client.guilds.cache.size}\`\`\n**Total people:** \`\`${client.users.cache.size}\`\``
    );
};
