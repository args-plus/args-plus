import { MessageEmbed } from "discord.js";
import { Command } from "../../Client/Commands/command";

export const command = new Command();
command.name = "ping";
command.description = "Shows the latency of the bot and the discord API";
command.aliases = ["latency"];

command.run = async (args, commandRan, commandClass) => {
    if (commandRan.slashCommand) {
        return commandClass.client.messageHandler.sendMessage(
            commandRan,
            `The discord API latency is \`\`${Math.round(
                commandClass.client.ws.ping
            )}\`\`ms`
        );
    }

    const message = await commandClass.client.messageHandler.sendMessage(
        commandRan,
        `**Checking**`
    );

    if (message) {
        if (message.embeds.length === 0) {
            if (commandClass.client.config.indentMessageContent) {
                message.edit(
                    `> The bot latency is: \`\`${
                        Date.now() - message.createdTimestamp
                    }ms\`\`.\n> The discord API latency is \`\`${Math.round(
                        commandClass.client.ws.ping
                    )}\`\`ms`
                );
            } else {
                message.edit(
                    `The bot latency is: \`\`${
                        Date.now() - message.createdTimestamp
                    }ms\`\`.\nThe discord API latency is \`\`${Math.round(
                        commandClass.client.ws.ping
                    )}\`\`ms`
                );
            }
        } else {
            const pingEmbed = message.embeds[0];

            if (commandClass.client.config.indentMessageContent) {
                pingEmbed.setDescription(
                    `> The bot latency is: \`\`${
                        Date.now() - message.createdTimestamp
                    }ms\`\`.\n> The discord API latency is \`\`${Math.round(
                        commandClass.client.ws.ping
                    )}\`\`ms`
                );
            } else {
                pingEmbed.setDescription(
                    `The bot latency is: \`\`${
                        Date.now() - message.createdTimestamp
                    }ms\`\`.\nThe discord API latency is \`\`${Math.round(
                        commandClass.client.ws.ping
                    )}\`\`ms`
                );
            }
            message.edit({ embeds: [pingEmbed] });
        }
    }
};
