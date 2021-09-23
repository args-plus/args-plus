import { MessageEmbed, Util, Constants, User } from "discord.js";
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
            content = `> ${newLineMessageContent}`;
        }
        if (message !== null) {
            if (!message.channel.isText()) {
                return false;
            }

            try {
                if (messagesOrEmbeds === "messages") {
                    let splitMessage: string[];

                    if (!messageHeader) {
                        splitMessage = Util.splitMessage(content);
                    } else {
                        splitMessage = Util.splitMessage(
                            `**${messageHeader}**\n${content}`
                        );
                    }

                    for (const messageContent of splitMessage) {
                        return message.channel.send(messageContent);
                    }
                } else {
                    const embed = new MessageEmbed()
                        .setColor(this.config.mainColor)
                        .setDescription(content);

                    if (messageHeader) {
                        embed.setAuthor(messageHeader);
                    }

                    const splitEmbed =
                        this.client.utils.splitMessageEmbedDescription(embed);

                    for (const embed of splitEmbed) {
                        return message.channel.send({ embeds: [embed] });
                    }
                }
            } catch {
                return false;
            }
        } else if (slashCommand !== null) {
            try {
                if (messagesOrEmbeds === "messages") {
                    let splitMessage: string[];

                    if (!messageHeader) {
                        splitMessage = Util.splitMessage(content);
                    } else {
                        splitMessage = Util.splitMessage(
                            `**${messageHeader}**\n${content}`
                        );
                    }

                    for (const messageContent of splitMessage) {
                        return slashCommand
                            .reply(messageContent)
                            .catch((error) => {
                                if (
                                    error.code === "INTERACTION_ALREADY_REPLIED"
                                ) {
                                    slashCommand.followUp(messageContent);
                                } else {
                                    console.error(error);
                                }
                            });
                    }
                } else {
                    const embed = new MessageEmbed()
                        .setColor(this.config.mainColor)
                        .setDescription(content);

                    if (messageHeader) {
                        embed.setAuthor(messageHeader);
                    }

                    const splitEmbed =
                        this.client.utils.splitMessageEmbedDescription(embed);

                    for (const embed of splitEmbed) {
                        return slashCommand
                            .reply({ embeds: [embed] })
                            .catch((error) => {
                                if (
                                    error.code === "INTERACTION_ALREADY_REPLIED"
                                ) {
                                    slashCommand.followUp({ embeds: [embed] });
                                } else {
                                    console.error(error);
                                }
                            });
                    }
                }
            } catch (error) {
                console.log("ONE");
                console.log(typeof error);
            }
        }
    };

    public sendError = (
        commandRan: commandRan,
        messageContent: string,
        errorHeader?: string
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
                newLineMessageContent.length
            )}`;
        }
        if (message !== null) {
            try {
                if (messagesOrEmbeds === "messages") {
                    let splitMessage: string[];

                    if (!errorHeader) {
                        splitMessage = Util.splitMessage(
                            `**Error:**\n${content}`
                        );
                    } else {
                        splitMessage = Util.splitMessage(
                            `***Error:* ${errorHeader}**\n${content}`
                        );
                    }

                    for (const messageContent of splitMessage) {
                        return message.channel.send(messageContent);
                    }
                } else {
                    const embed = new MessageEmbed()
                        .setColor(this.config.errorColor)
                        .setDescription(content);

                    if (errorHeader) {
                        embed.setAuthor(errorHeader);
                    }

                    const splitEmbed =
                        this.client.utils.splitMessageEmbedDescription(embed);

                    for (const embed of splitEmbed) {
                        return message.channel.send({ embeds: [embed] });
                    }
                }
            } catch {
                return false;
            }
        } else if (slashCommand !== null) {
            try {
                if (messagesOrEmbeds === "messages") {
                    let splitMessage: string[];

                    if (!errorHeader) {
                        splitMessage = Util.splitMessage(content);
                    } else {
                        splitMessage = Util.splitMessage(
                            `**${errorHeader}**\n${content}`
                        );
                    }

                    for (const messageContent of splitMessage) {
                        return slashCommand
                            .reply(messageContent)
                            .catch((error) => {
                                if (
                                    error.code === "INTERACTION_ALREADY_REPLIED"
                                ) {
                                    slashCommand.followUp(messageContent);
                                } else {
                                    console.error(error);
                                }
                            });
                    }
                } else {
                    const embed = new MessageEmbed()
                        .setColor(this.config.errorColor)
                        .setDescription(content);

                    if (errorHeader) {
                        embed.setAuthor(errorHeader);
                    }

                    const splitEmbed =
                        this.client.utils.splitMessageEmbedDescription(embed);

                    for (const embed of splitEmbed) {
                        return slashCommand
                            .reply({ embeds: [embed] })
                            .catch((error) => {
                                if (
                                    error.code === "INTERACTION_ALREADY_REPLIED"
                                ) {
                                    slashCommand.followUp({ embeds: [embed] });
                                } else {
                                    console.error(error);
                                }
                            });
                    }
                }
            } catch {
                return false;
            }
        }
    };

    public sendDm = (
        user: User,
        messageContent: string,
        messageHeader?: string
    ) => {
        const messagesOrEmbeds = this.config.messagesOrEmbeds;

        let content = messageContent;
        if (this.config.indentMessageContent) {
            const newLineMessageContent = this.client.utils
                .splitStringByNewLine(messageContent)
                .join(`\n> `);
            content = `> ${newLineMessageContent}`;
        }

        try {
            if (messagesOrEmbeds === "messages") {
                let splitMessage: string[];

                if (!messageHeader) {
                    splitMessage = Util.splitMessage(content);
                } else {
                    splitMessage = Util.splitMessage(
                        `**${messageHeader}**\n${content}`
                    );
                }

                for (const messageContent of splitMessage) {
                    return user.send(messageContent);
                }
            } else {
                const embed = new MessageEmbed()
                    .setColor(this.config.mainColor)
                    .setDescription(content);

                if (messageHeader) {
                    embed.setAuthor(messageHeader);
                }

                const splitEmbed =
                    this.client.utils.splitMessageEmbedDescription(embed);

                for (const embed of splitEmbed) {
                    return user.send({ embeds: [embed] });
                }
            }
        } catch {
            return false;
        }
    };

    public sendErrorDm = (
        user: User,
        messageContent: string,
        errorHeader?: string
    ) => {
        const messagesOrEmbeds = this.config.messagesOrEmbeds;

        let content = messageContent;
        if (this.config.indentMessageContent) {
            const newLineMessageContent = this.client.utils
                .splitStringByNewLine(messageContent)
                .join(`\n> `);
            content = `> ${newLineMessageContent.substring(
                0,
                newLineMessageContent.length
            )}`;
        }
        try {
            if (messagesOrEmbeds === "messages") {
                let splitMessage: string[];

                if (!errorHeader) {
                    splitMessage = Util.splitMessage(`**Error:**\n${content}`);
                } else {
                    splitMessage = Util.splitMessage(
                        `***Error:* ${errorHeader}**\n${content}`
                    );
                }

                for (const messageContent of splitMessage) {
                    return user.send(messageContent);
                }
            } else {
                const embed = new MessageEmbed()
                    .setColor(this.config.errorColor)
                    .setDescription(content);

                if (errorHeader) {
                    embed.setAuthor(errorHeader);
                }

                const splitEmbed =
                    this.client.utils.splitMessageEmbedDescription(embed);

                for (const embed of splitEmbed) {
                    return user.send({ embeds: [embed] });
                }
            }
        } catch {
            return false;
        }
    };

    public warn(
        warning: string,
        faliedToLoadFile?: boolean,
        failedToLoadType?: string
    ) {
        if (this.config.logWarnings === true) {
            if (faliedToLoadFile) {
                return console.warn(
                    `Warning: ${failedToLoadType.toLowerCase()} failed to load: ${warning}`
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
