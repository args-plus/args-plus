import { Client } from "..";
import fs from "fs";
import path from "path";
import { GuildPrefixModel } from "../../Defaults/Schemas";
import {
    Util,
    ColorResolvable,
    Guild,
    MessageEmbed,
    DiscordAPIError,
    Constants,
    GuildMemberManager,
    GuildChannelManager
} from "discord.js";

export class ClientUtils {
    public client: Client;

    constructor(client: Client) {
        this.client = client;
        this.loadFiles.bind(this);
    }

    private isFile(name: string): boolean {
        if (
            (name.endsWith(".ts") && !name.endsWith(".d.ts")) ||
            (name.endsWith(".js") && !name.endsWith(".map.js"))
        ) {
            return true;
        } else {
            return false;
        }
    }

    public async loadFiles(
        parentDir: string,
        enonentError = "Could not load folder %FOLDER"
    ) {
        const filePaths: string[] = [];
        const readCommands = async (dir: string) => {
            let files: string[];
            try {
                files = fs.readdirSync(dir);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                if (error && error.code && error.code === "ENOENT") {
                    this.client.console.error(
                        enonentError.replace(/%FOLDER/g, parentDir),
                        false
                    );
                } else {
                    throw error;
                }
                return false;
            }
            for (const file of files) {
                const stat = fs.lstatSync(path.join(dir, file));
                if (stat.isDirectory()) {
                    readCommands(path.join(dir, file));
                } else {
                    if (this.isFile(file)) {
                        const commandDir = path.join(dir, file);
                        filePaths.push(commandDir);
                    }
                }
            }
        };
        await readCommands(parentDir);
        return filePaths;
    }

    public splitStringByNewLine(string: string) {
        return string.split(/\r?\n/);
    }

    public static splitStringByNewLine(string: string) {
        return string.split(/\r?\n/);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public randomElement<array extends any[]>(array: array): typeof array[0] {
        const element = array[Math.floor(Math.random() * array.length)];
        return element;
    }

    // prettier-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static randomElement<array extends any[]>(array: array): typeof array[0] {
        const element = array[Math.floor(Math.random() * array.length)];
        return element;
    }

    public generateId(string: string) {
        return string.toUpperCase().replace(/[ +]/g, "_");
    }

    public static generateId(string: string) {
        return string.toUpperCase().replace(/[ +]/g, "_");
    }

    public async getGuildPrefix(guild: Guild | false): Promise<string> {
        if (!guild) {
            return this.getGlobalPrefix();
        }
        const getCachedPrefix = this.client.cachedGuildPrefixes.get(guild.id);
        if (getCachedPrefix) {
            return getCachedPrefix;
        }
        const findPrefix = await GuildPrefixModel.findById(guild.id);
        if (!findPrefix) {
            return this.getGlobalPrefix();
        }

        this.client.cachedGuildPrefixes.set(guild.id, findPrefix.guildPrefix);
        return findPrefix.guildPrefix;
    }

    public getGlobalPrefix(): string {
        if (this.client.getConnected() !== false) {
            const cachedPrefix = this.client.configurations.get("global prefix");
            if (!cachedPrefix) {
                return this.client.config.prefix;
            } else {
                return cachedPrefix.options.globalPrefix;
            }
        } else {
            return this.client.config.prefix;
        }
    }

    // Copied like a pro:
    // https://stackoverflow.com/questions/19700283/how-to-convert-time-in-milliseconds-to-hours-min-sec-format-in-javascript
    // (Second answer)

    public msToTime(ms: number) {
        const seconds = (ms / 1000).toFixed(1);
        const minutes = (ms / (1000 * 60)).toFixed(1);
        const hours = (ms / (1000 * 60 * 60)).toFixed(1);
        const days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
        if (parseFloat(seconds) < 60) return seconds + " seconds";
        else if (parseFloat(minutes) < 60) return minutes + " minutes";
        else if (parseFloat(hours) < 24) return hours + " hours";
        else return days + " days";
    }

    public static msToTime(ms: number) {
        const seconds = (ms / 1000).toFixed(1);
        const minutes = (ms / (1000 * 60)).toFixed(1);
        const hours = (ms / (1000 * 60 * 60)).toFixed(1);
        const days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
        if (parseFloat(seconds) < 60) return seconds + " seconds";
        else if (parseFloat(minutes) < 60) return minutes + " minutes";
        else if (parseFloat(hours) < 24) return hours + " hours";
        else return days + " days";
    }

    public returnMessage(
        responses: [string[], string[] | null] | string[],
        values: [string, string][] = []
    ): [string, string] | [string, null] {
        let message = "";

        let header: string | null = "";

        if (typeof responses[0] === "string") {
            message = this.client.utils.randomElement(responses as string[]);
        } else {
            message = this.client.utils.randomElement(responses[0] as string[]);
        }

        if (typeof responses[0] === "string") {
            header = null;
        } else {
            if (!(responses[1] as string[] | null)) {
                header = null;
            } else {
                header = this.client.utils.randomElement(responses[1] as string[]);
            }
        }

        let newMessage = message;
        let newHeader = header;

        for (const value of values) {
            newMessage = newMessage.replace(
                new RegExp(`%${this.client.utils.generateId(value[0])}`, "g"),
                value[1]
            );

            if (newHeader)
                newHeader = newHeader.replace(
                    new RegExp(`%${this.client.utils.generateId(value[0])}`, "g"),
                    value[1]
                );
        }
        return [newMessage, newHeader ? newHeader : null];
    }

    public static capitaliseString(string: string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    public capitaliseString(string: string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
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

        const returnEmbeds: MessageEmbed[] = [];

        const embedFooter = embed.footer;

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

    public constructMessages<T extends messageOrEmbed>(
        messageOrEmbed: T,
        body: string,
        header = "",
        color: ColorResolvable = "#000000"
    ): MessageConstructorType<T> {
        if (messageOrEmbed === "messages") {
            return [
                messageOrEmbed,
                this.getTextMessage(body, header)
            ] as MessageConstructorType<T>;
        } else {
            return [
                "embeds",
                this.getEmbedMessages(body, color, header)
            ] as MessageConstructorType<T>;
        }
    }

    public async fetchUser(id: string) {
        const { client } = this;
        return await client.users.fetch(id).catch((error: DiscordAPIError) => {
            if (
                error.code !== Constants.APIErrors.INVALID_FORM_BODY &&
                error.code !== Constants.APIErrors.UNKNOWN_USER
            ) {
                client.console.error(error.message);
            }
        });
    }

    public async fetchGuild(id: string) {
        const { client } = this;
        return await client.guilds.fetch(id).catch((error: DiscordAPIError) => {
            if (
                error.code !== Constants.APIErrors.INVALID_FORM_BODY &&
                error.code !== Constants.APIErrors.UNKNOWN_GUILD
            ) {
                client.console.error(error.message);
            }
        });
    }

    public async fetchChannel(id: string) {
        const { client } = this;
        return await client.channels.fetch(id).catch((error: DiscordAPIError) => {
            if (
                error.code !== Constants.APIErrors.INVALID_FORM_BODY &&
                error.code !== Constants.APIErrors.UNKNOWN_CHANNEL
            ) {
                client.console.error(error.message);
            }
        });
    }

    public async fetchMember(members: GuildMemberManager, id: string) {
        return (await members.fetch()).get(id);
    }

    public async fetchGuildChannel(channels: GuildChannelManager, id: string) {
        return (await channels.fetch()).get(id);
    }
}

type messageOrEmbed = "messages" | "embeds";

type MessageConstructorType<T> = T extends "messages"
    ? ["messages", string[]]
    : T extends "embeds"
    ? ["embeds", MessageEmbed[]]
    : never;
