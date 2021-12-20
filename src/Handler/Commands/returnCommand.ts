import { APIMessage } from "discord-api-types";
import {
    ColorResolvable,
    CommandInteraction,
    Constants,
    DiscordAPIError,
    Guild,
    GuildMember,
    Message,
    MessageEmbed,
    MessageMentions,
    TextBasedChannels,
    User,
    Util
} from "discord.js";
import { Command } from ".";
import { Client } from "..";
import { Argument } from "./argument";

export class ReturnCommand {
    public commandRan: Message | CommandInteraction;
    public commandClass: Command;
    public args: Argument[];

    public returnValues: any[] = [];

    private commandRepliedTo: boolean = false;
    private client: Client;

    constructor(
        commandRan: Message | CommandInteraction,
        commandClass: Command,
        client: Client
    ) {
        this.client = client;
        this.commandRan = commandRan;
        this.commandClass = commandClass;
        this.args = commandClass.args;
    }

    public setRepliedTo() {
        this.commandRepliedTo = true;
    }

    public getRepliedTo() {
        return this.commandRepliedTo;
    }

    public getMessage() {
        if (this.isMessage(this.commandRan)) {
            return this.commandRan;
        } else {
            return false;
        }
    }

    public isMessage(
        message: Message | CommandInteraction = this.commandRan
    ): message is Message {
        return this.commandRan instanceof Message;
    }

    public getInteraction() {
        if (this.isInteraction(this.commandRan)) {
            return this.commandRan;
        } else {
            return false;
        }
    }

    public isInteraction(
        interaction: Message | CommandInteraction = this.commandRan
    ): interaction is CommandInteraction {
        return this.commandRan instanceof CommandInteraction;
    }

    public getGuild(): Guild | false {
        if (this.commandRan.guild) {
            return this.commandRan.guild;
        } else {
            return false;
        }
    }

    public getAuthor(): User {
        if (this.isInteraction(this.commandRan)) {
            return this.commandRan.user;
        } else {
            return this.commandRan.author;
        }
    }

    public getChannel(): TextBasedChannels | false {
        if (this.isMessage(this.commandRan)) {
            return this.commandRan.channel;
        } else {
            if (this.commandRan.channel) {
                return this.commandRan.channel;
            }
        }
        return false;
    }

    public getMember(): GuildMember | false {
        if (this.isMessage(this.commandRan)) {
            return this.commandRan.member ? this.commandRan.member : false;
        } else {
            if (this.commandRan.member && this.commandRan.member instanceof GuildMember) {
                return this.commandRan.member;
            }
        }
        return false;
    }

    public getCreatedAt(): Date {
        return this.commandRan.createdAt;
    }

    public getTimestamp(): number {
        return this.commandRan.createdTimestamp;
    }

    public getContent(): string | false {
        if (this.isMessage(this.commandRan)) {
            return this.commandRan.content;
        }
        return false;
    }

    public getMentions(): MessageMentions | false {
        if (this.isMessage(this.commandRan)) {
            return this.commandRan.mentions;
        }
        return false;
    }

    private sendMessageError(client: Client, error: DiscordAPIError) {
        if (error.code !== Constants.APIErrors.MISSING_PERMISSIONS) {
            client.console.error(error.message);
        }
    }

    private getTextMessage(body: string, header?: string) {
        const { client } = this;
        const { config } = client;

        if (config.indentMessageContent) {
            body = `> ${client.utils.splitStringByNewLine(body).join(`\n> `)}`;
        }

        const splitMessage = Util.splitMessage(
            `${header ? `**${header}**` : ""}\n${body}`
        );

        return splitMessage;
    }

    private splitMessageEmbedDescription(embed: MessageEmbed) {
        if (!embed.description) {
            return [embed];
        }

        if (embed.length < 6000 && embed.description && embed.description.length < 4096) {
            return [embed];
        }

        let returnEmbeds: MessageEmbed[] = [];

        let embedFooter = embed.footer;

        const splitEmbeds = Util.splitMessage(embed.description, {
            maxLength: 4096
        });

        let index = 0;
        for (const embedDescription of splitEmbeds) {
            if (index === 0) {
                returnEmbeds.push(embed.setDescription(embedDescription).setFooter(""));
            } else if (index === splitEmbeds.length - 1) {
                const newEmbed = new MessageEmbed()
                    .setColor(embed.color !== null ? embed.color : "#000000")
                    .setDescription(embedDescription);
                if (embedFooter) {
                    if (embedFooter.text && !embedFooter.iconURL) {
                        newEmbed.setFooter(embedFooter.text);
                    } else if (embedFooter.text && embedFooter.iconURL) {
                        newEmbed.setFooter(embedFooter.text, embedFooter.iconURL);
                    } else if (embedFooter.iconURL) {
                        newEmbed.setFooter(embedFooter.iconURL);
                    }
                }

                returnEmbeds.push(newEmbed);
            } else {
                returnEmbeds.push(
                    new MessageEmbed()
                        .setColor(embed.color !== null ? embed.color : "#000000")
                        .setDescription(embedDescription)
                );
            }

            index++;
        }

        return returnEmbeds;
    }

    private getEmbedMessages(body: string, color: ColorResolvable, header?: string) {
        const { client } = this;
        const { config } = client;

        if (config.indentMessageContent) {
            body = `> ${client.utils.splitStringByNewLine(body).join(`\n> `)}`;
        }

        const embed = new MessageEmbed().setColor(color).setDescription(body);

        const getIcon = (): string => {
            if (config.embedIcon) {
                if (config.embedIcon === "botAvatar" && client.user) {
                    return client.user.displayAvatarURL();
                } else {
                    return config.embedIcon;
                }
            }
            return "";
        };

        const getFooter = (): string => {
            if (config.embedFooter) {
                return config.embedFooter;
            } else {
                return "";
            }
        };

        embed.setFooter(getFooter(), getIcon());

        if (header) {
            embed.setAuthor(header, getIcon());
        }

        if (config.sendTimestamp) {
            embed.setTimestamp(Date.now());
        }

        const splitEmbeds = this.splitMessageEmbedDescription(embed);

        return splitEmbeds;
    }

    private async sendMessageMethod(
        body: string,
        color: ColorResolvable,
        header?: string,
        overideEmbed?: boolean
    ) {
        const { client, commandRan, commandRepliedTo } = this;

        const { config } = client;
        const { messagesOrEmbeds, sendMessageWithoutPermissions } = config;

        if (this.isMessage(commandRan)) {
            if (
                messagesOrEmbeds === "messages" ||
                overideEmbed ||
                (sendMessageWithoutPermissions &&
                    commandRan.channel.type !== "DM" &&
                    commandRan.guild &&
                    commandRan.guild.me &&
                    !commandRan.channel
                        .permissionsFor(commandRan.guild.me)
                        .has("EMBED_LINKS"))
            ) {
                const messages = this.getTextMessage(body, header);
                let lastMessage: void | Message;
                for (const message in messages) {
                    lastMessage = await commandRan.channel
                        .send(message)
                        .catch((error: DiscordAPIError) => {
                            this.sendMessageError(client, error);
                        });
                }
                return lastMessage;
            } else {
                const embeds = this.getEmbedMessages(body, color, header);
                let lastMessage: void | Message;
                for (const embed of embeds) {
                    lastMessage = await commandRan.channel
                        .send({ embeds: [embed] })
                        .catch((error: DiscordAPIError) => {
                            this.sendMessageError(client, error);
                        });
                }
                return lastMessage;
            }
        } else {
            if (
                messagesOrEmbeds === "messages" ||
                overideEmbed ||
                (sendMessageWithoutPermissions &&
                    commandRan.channel &&
                    commandRan.channel.type !== "DM" &&
                    commandRan.guild &&
                    commandRan.guild.me &&
                    !commandRan.channel
                        .permissionsFor(commandRan.guild.me)
                        .has("EMBED_LINKS"))
            ) {
                const messages = this.getTextMessage(body, header);

                let lastMessage: Message | APIMessage | void;

                for (const message of messages) {
                    if (!commandRepliedTo) {
                        lastMessage = await commandRan
                            .reply(message)
                            .catch((error: DiscordAPIError) => {
                                this.sendMessageError(client, error);
                            });
                        this.setRepliedTo();
                    } else {
                        lastMessage = await commandRan
                            .followUp(message)
                            .catch((error: DiscordAPIError) => {
                                this.sendMessageError(client, error);
                            });
                    }
                }
                return lastMessage;
            } else {
                const embeds = this.getEmbedMessages(body, color, header);

                let lastMessage: Message | APIMessage | void;
                for (const embed of embeds) {
                    if (!this.commandRepliedTo) {
                        lastMessage = await commandRan
                            .reply({ embeds: [embed] })
                            .catch((error: DiscordAPIError) => {
                                this.sendMessageError(client, error);
                            });
                    } else {
                        lastMessage = await commandRan
                            .followUp({ embeds: [embed] })
                            .catch((error: DiscordAPIError) => {
                                this.sendMessageError(client, error);
                            });
                    }
                }
                return lastMessage;
            }
        }
    }

    public async sendMessageBase(
        body: string | string[],
        color: ColorResolvable,
        header?: string | string[] | null,
        overideEmbed: boolean = false
    ) {
        let messageBody: string;
        let messageHeader: string;
        if (typeof body !== "string") {
            messageBody = this.client.utils.randomElement(body);
        } else {
            messageBody = body;
        }

        if (!header) {
            messageHeader = "";
        } else if (typeof header !== "string") {
            messageHeader = this.client.utils.randomElement(header);
        } else {
            messageHeader = header;
        }

        return await this.sendMessageMethod(
            messageBody,
            color,
            messageHeader,
            overideEmbed
        );
    }

    public async sendMessage(body: string | string[], header?: string | string[] | null) {
        return await this.sendMessageBase(body, this.client.config.mainColor, header);
    }

    public async sendError(body: string | string[], header?: string | string[] | null) {
        return await this.sendMessageBase(body, this.client.config.errorColor, header);
    }

    public async sendMessageNoEmbed(
        body: string | string[],
        header?: string | string[] | null
    ) {
        return await this.sendMessageBase(
            body,
            this.client.config.errorColor,
            header,
            true
        );
    }
}
