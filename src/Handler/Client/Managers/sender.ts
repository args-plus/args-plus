import { Channel, MessageEmbed, PartialDMChannel } from "discord.js";
import { Client } from "../..";
import { commandRan, Config } from "../../Interaces";

export class MessageSender {
    public config: Config;
    public client: Client;

    public sendMessage = (
        commandRan: commandRan,
        messageContent: string,
        messageHeader?: string
    ) => {
        const { message, slashCommand } = commandRan;
        const messagesOrEmbeds = this.config.messagesOrEmbeds;

        let content = messageContent;
        if (this.config.indentMessageContent) {
            const newLineMessageContent = this.client.utils
                .splitStringByNewLine(messageContent)
                .join(`\n> `);
            content = `> ${newLineMessageContent.substring(
                0,
                newLineMessageContent.length - 5
            )}`;
        }
        if (message !== null) {
            if (!message.channel.isText()) {
                return false;
            }

            try {
                if (messagesOrEmbeds === "messages") {
                    if (!messageHeader) {
                        return message.channel.send(content);
                    } else {
                        return message.channel.send(
                            `**${messageHeader}**\n${content}`
                        );
                    }
                } else {
                    const embed = new MessageEmbed()
                        .setColor(this.config.mainColor)
                        .setDescription(content);

                    if (!messageHeader) {
                        return message.channel.send({ embeds: [embed] });
                    } else {
                        embed.setAuthor(messageHeader);
                        return message.channel.send({ embeds: [embed] });
                    }
                }
            } catch {
                return false;
            }
        } else if (slashCommand !== null) {
            try {
                if (messagesOrEmbeds === "messages") {
                    if (!messageHeader) {
                        return slashCommand.reply({ content: content });
                        // return message.channel.send(content);
                    } else {
                        return slashCommand.reply({
                            content: `**${messageHeader}**\n${content}`,
                        });
                    }
                } else {
                    const embed = new MessageEmbed()
                        .setColor(this.config.mainColor)
                        .setDescription(content);

                    if (!messageHeader) {
                        return slashCommand.reply({ embeds: [embed] });
                    } else {
                        embed.setAuthor(messageHeader);
                        return slashCommand.reply({ embeds: [embed] });
                    }
                }
            } catch (error) {
                console.log(error);
                return false;
            }
        }
    };

    public sendError(
        commandRan: commandRan,
        messageContent: string,
        errorHeader?: string
    ) {
        const { message, slashCommand } = commandRan;
        const messagesOrEmbeds = this.config.messagesOrEmbeds;

        let content = messageContent;
        if (this.config.indentMessageContent) {
            const newLineMessageContent = this.client.utils
                .splitStringByNewLine(messageContent)
                .join(`\n> `);
            content = `> ${newLineMessageContent.substring(
                0,
                newLineMessageContent.length - 5
            )}`;
        }
        if (message !== null) {
            try {
                if (messagesOrEmbeds === "messages") {
                    if (!errorHeader) {
                        return message.channel.send(`**Error:**\n${content}`);
                    } else {
                        return message.channel.send(
                            `***Error:* ${errorHeader}**\n${content}`
                        );
                    }
                } else {
                    const embed = new MessageEmbed()
                        .setColor(this.config.errorColor)
                        .setDescription(content);

                    if (!errorHeader) {
                        return message.channel.send({ embeds: [embed] });
                    } else {
                        embed.setAuthor(errorHeader);
                        return message.channel.send({ embeds: [embed] });
                    }
                }
            } catch {
                return false;
            }
        } else if (slashCommand !== null) {
            try {
                if (messagesOrEmbeds === "messages") {
                    if (!errorHeader) {
                        return slashCommand.reply({ content: content });
                    } else {
                        return slashCommand.reply({
                            content: `**${errorHeader}**\n${content}`,
                        });
                    }
                } else {
                    const embed = new MessageEmbed()
                        .setColor(this.config.errorColor)
                        .setDescription(content);

                    if (!errorHeader) {
                        return slashCommand.reply({ embeds: [embed] });
                    } else {
                        embed.setAuthor(errorHeader);
                        return slashCommand.reply({ embeds: [embed] });
                    }
                }
            } catch {
                return false;
            }
        }
    }

    public warn(
        warning: string,
        faliedToLoadFile?: boolean,
        failesToLoadType?: string
    ) {
        if (this.config.logWarnings === true) {
            if (faliedToLoadFile) {
                return console.warn(
                    `Warning: ${failesToLoadType.toLowerCase()} failed to load: ${warning}`
                );
            } else {
                return console.warn(`Warning: ${warning}`);
            }
        } else {
            return false;
        }
    }

    public log(log: string) {
        if (this.client.config.logMessages) {
            return console.log(log);
        } else {
            return false;
        }
    }

    public devLog(log: string) {
        if (this.client.config.logMessages) {
            return console.info(log);
        } else {
            return false;
        }
    }

    public debug(log: string) {
        if (this.client.config.logDebugs) {
            return console.debug(log);
        } else {
            return false;
        }
    }

    public error(log: string) {
        if (this.client.config.logErrorMessages) {
            return console.error(log);
        } else {
            return false;
        }
    }
}
