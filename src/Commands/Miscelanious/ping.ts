import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../Handler";

const command = new Command("ping")
    .setAliases(["latency"])
    .setDescription("Shows the latency of teh bot and the discord API");
command.run = async (client, command) => {
    const message = await command.sendMessage("Checking...");

    const pingMessage = (timestamp: number) => {
        let pingMessage = `The bot latency is \`\`${
            Date.now() - timestamp
        }ms\`\`.\nThe discord API latency is \`\`${Math.round(client.ws.ping)}ms\`\`.`;

        if (client.config.indentMessageContent) {
            pingMessage = `> ${client.utils
                .splitStringByNewLine(pingMessage)
                .join(`\n> `)}`;
        }

        return pingMessage;
    };

    const pingEmbed = new MessageEmbed().setColor(client.config.mainColor);

    if (!message) {
        if (command.getRepliedTo() && command.isInteraction(command.commandRan)) {
            const sentMessage = await command.commandRan.fetchReply();
            if (sentMessage instanceof Message) {
                if (client.config.messagesOrEmbeds === "messages") {
                    command.commandRan.editReply(
                        pingMessage(sentMessage.createdTimestamp)
                    );
                } else {
                    command.commandRan.editReply({
                        embeds: [
                            pingEmbed.setDescription(
                                pingMessage(sentMessage.createdTimestamp)
                            )
                        ]
                    });
                }
            }
        } else {
            return;
        }
    }

    if (!(message instanceof Message)) {
        return;
    }

    if (client.config.messagesOrEmbeds === "messages") {
        message.edit(pingMessage(message.createdTimestamp));
    } else {
        message.edit({
            embeds: [pingEmbed.setDescription(pingMessage(message.createdTimestamp))]
        });
    }
};

export default command;
