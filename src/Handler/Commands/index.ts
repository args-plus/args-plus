import { APIMessage } from "discord-api-types";
import {
    Channel,
    CommandInteraction,
    Guild,
    GuildMember,
    Message,
    MessageMentions,
    TextBasedChannels,
    User,
    Collection,
    Util,
    ColorResolvable,
    MessageEmbed
} from "discord.js";
import ExtendedClient from "../Client";
import { Item } from "../Client/ClientLoader";
import { GuildPrefixModel } from "../Defaults/Schemas";
import {
    Permission,
    CommandRun,
    PreCommandRun,
    Argument,
    ReturnArgument,
    TimeEnding,
    ReturnTime,
    PostCommandRun,
    Constraint
} from "../Interfaces";
import { Utils } from "../Utils";

export class ReturnCommand {
    message: Message | null;
    slashCommand: CommandInteraction | null;
    commandRan: Message | CommandInteraction;
    commandClass: Command;
    args: ReturnArgument[] = [];
    commandRepliedTo: boolean = false;
    client: ExtendedClient;

    constructor(
        commandClass: Command,
        commandRan: Message | CommandInteraction,
        client: ExtendedClient
    ) {
        this.commandClass = commandClass;

        this.commandRan = commandRan;

        if (commandRan instanceof Message) {
            this.message = commandRan;
            this.slashCommand = null;
        } else {
            this.message = null;
            this.slashCommand = commandRan;
        }

        this.client = client;
    }

    public getGuild(): Guild | null {
        if (this.commandRan.guild !== null) {
            return this.commandRan.guild;
        }
        return null;
    }

    public getAuthor(): User {
        if (this.commandRan instanceof Message) {
            return this.commandRan.author;
        } else {
            return this.commandRan.user;
        }
    }

    public getChannel(): TextBasedChannels | null {
        if (this.commandRan instanceof Message) {
            return this.commandRan.channel;
        } else {
            if (this.commandRan.channel) {
                return this.commandRan.channel;
            }
        }
        return null;
    }

    public getMember(): GuildMember | null {
        if (this.commandRan instanceof Message && this.commandRan.member) {
            return this.commandRan.member;
        } else {
            if (
                this.commandRan.member &&
                this.commandRan.member instanceof GuildMember
            ) {
                return this.commandRan.member;
            }
        }
        return null;
    }

    public getCreatedAt(): Date {
        return this.commandRan.createdAt;
    }

    public getTimestamp(): number {
        return this.commandRan.createdTimestamp;
    }

    public getContent(): string | null {
        if (this.commandRan instanceof Message) {
            return this.commandRan.content;
        }
        return null;
    }

    public getMentions(): MessageMentions | null {
        if (this.commandRan instanceof Message) {
            return this.commandRan.mentions;
        }
        return null;
    }

    private getTextMessage(body: string, header?: string) {
        const { commandRan, client } = this;

        if (client.config.indentMessageContent) {
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

        if (
            embed.length < 6000 &&
            embed.description &&
            embed.description.length < 4096
        ) {
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
                returnEmbeds.push(
                    embed.setDescription(embedDescription).setFooter("")
                );
            } else if (index === splitEmbeds.length - 1) {
                const newEmbed = new MessageEmbed()
                    .setColor(embed.color !== null ? embed.color : "#000000")
                    .setDescription(embedDescription);
                if (embedFooter) {
                    if (embedFooter.text && !embedFooter.iconURL) {
                        newEmbed.setFooter(embedFooter.text);
                    } else if (embedFooter.text && embedFooter.iconURL) {
                        newEmbed.setFooter(
                            embedFooter.text,
                            embedFooter.iconURL
                        );
                    } else if (embedFooter.iconURL) {
                        newEmbed.setFooter(embedFooter.iconURL);
                    }
                }

                returnEmbeds.push(newEmbed);
            } else {
                returnEmbeds.push(
                    new MessageEmbed()
                        .setColor(
                            embed.color !== null ? embed.color : "#000000"
                        )
                        .setDescription(embedDescription)
                );
            }

            index++;
        }

        return returnEmbeds;
    }

    private getEmbedMessages(
        body: string,
        color: ColorResolvable,
        header?: string
    ) {
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

    private async sendMessageBase(
        body: string,
        color: ColorResolvable,
        header?: string
    ) {
        const { client, commandRan } = this;

        // FIXME: Catch for errors

        const { config } = client;
        const { messagesOrEmbeds } = config;

        if (commandRan instanceof Message) {
            if (
                messagesOrEmbeds === "messages" ||
                (messagesOrEmbeds === "embeds" &&
                    commandRan.channel.type !== "DM" &&
                    commandRan.guild &&
                    commandRan.guild.me &&
                    !commandRan.channel
                        .permissionsFor(commandRan.guild.me)
                        .has("EMBED_LINKS"))
            ) {
                const messages = this.getTextMessage(body, header);
                let lastMessage = await commandRan.channel.send(messages[0]);
                messages.shift();
                for (const message of messages) {
                    lastMessage = await commandRan.channel.send(message);
                }
                return lastMessage;
            } else {
                const embeds = this.getEmbedMessages(body, color, header);
                let lastMessage = await commandRan.channel.send({
                    embeds: [embeds[0]]
                });
                embeds.shift();
                for (const embed of embeds) {
                    lastMessage = await commandRan.channel.send({
                        embeds: [embed]
                    });
                }
                return lastMessage;
            }
        } else {
            if (
                messagesOrEmbeds === "messages" ||
                (messagesOrEmbeds === "embeds" &&
                    commandRan.channel &&
                    commandRan.channel.type !== "DM" &&
                    commandRan.guild &&
                    commandRan.guild.me &&
                    !commandRan.channel
                        .permissionsFor(commandRan.guild.me)
                        .has("EMBED_LINKS"))
            ) {
                const messages = this.getTextMessage(body, header);
                let lastMessage: null | Message | APIMessage | void = null;
                for (const message of messages) {
                    if (!this.commandRepliedTo) {
                        lastMessage = await commandRan.reply(message);
                        this.commandRepliedTo = true;
                    } else {
                        lastMessage = await commandRan.followUp(message);
                    }
                }
                if (lastMessage) {
                    return lastMessage;
                }
            } else {
                const embeds = this.getEmbedMessages(body, color, header);
                let lastMessage: null | Message | APIMessage | void = null;
                for (const embed of embeds) {
                    if (!this.commandRepliedTo) {
                        lastMessage = await commandRan.reply({
                            embeds: [embed]
                        });
                        this.commandRepliedTo = true;
                    } else {
                        lastMessage = await commandRan.followUp({
                            embeds: [embed]
                        });
                    }
                    if (lastMessage) {
                        return lastMessage;
                    }
                }
            }
        }
        return null;
    }

    public async sendMessage(body: string, header?: string) {
        return await this.sendMessageBase(
            body,
            this.client.config.mainColor,
            header
        );
    }

    public async sendError(body: string, header?: string) {
        return await this.sendMessageBase(
            body,
            this.client.config.errorColor,
            header
        );
    }
}

export class DisabledCommandManager {
    public client: ExtendedClient;

    constructor(client: ExtendedClient) {
        this.client = client;
    }

    public init() {
        const findConfiguration =
            this.client.configurations.get("disabled commands");

        if (findConfiguration) {
            let currentDisabledCommands: string[] =
                findConfiguration.options.disabledCommands;

            this.client.disabledCommands = currentDisabledCommands;
        }
    }

    public async addCommand(name: string, temp?: boolean) {
        this.client.disabledCommands.push(name);

        if (!temp) {
            const findConfiguration =
                this.client.configurations.get("disabled commands");

            if (findConfiguration) {
                let currentDisabledCommands: string[] =
                    findConfiguration.options.disabledCommands;

                this.client.disabledCommands = currentDisabledCommands;
                if (!currentDisabledCommands.includes(name)) {
                    currentDisabledCommands.push(name);
                }

                await this.client.configurations.update(
                    "disabled commands",
                    {
                        disabledCommands: currentDisabledCommands
                    },
                    false
                );
            }
        }
    }

    public async removeCommand(name: string, temp?: boolean) {
        this.client.disabledCommands.push(name);

        if (!temp) {
            const findConfiguration =
                this.client.configurations.get("disabled commands");

            if (findConfiguration) {
                let currentDisabledCommands: string[] =
                    findConfiguration.options.disabledCommands;

                this.client.disabledCommands = currentDisabledCommands;
                if (currentDisabledCommands.includes(name)) {
                    currentDisabledCommands.splice(
                        currentDisabledCommands.indexOf(name),
                        1
                    );
                }

                await this.client.configurations.update(
                    "disabled commands",
                    {
                        disabledCommands: currentDisabledCommands
                    },
                    false
                );
            }
        }
    }

    public isDisabledCommand(name: string) {
        return this.client.disabledCommands.includes(name);
    }
}

export class Command extends Item {
    // public client: null | ExtendedClient = null;

    public run: CommandRun | null = null;

    public args: Argument[] = [];
    public description: string = "";
    public aliases: string[] = [];
    public cooldownNumber: number = 0;
    public developerOnly: boolean = false;
    public guildOnly: boolean = false;
    public deferResponse: boolean = true;
    public certainChannelsOnly: string[] = [];
    public certainGuildsOnly: string[] = [];
    public certainRolesOnly: string[] = [];
    public overideLoadSlashCommand: boolean = false;
    public overideDefaultClientChecks: boolean = false;
    public overideDefaultUserChecks: boolean = false;
    public overideDefaultClientPermissions: boolean = false;
    public overideDefaultUserPermissions: boolean = false;
    public overideGuildBlacklist: boolean = false;
    public overideUserBlacklist: boolean = false;
    public overideAutoRemove: boolean = false;
    public overideConstraints: boolean = false;
    public clientPermissions: Permission[] = [];
    public userPermissions: Permission[] = [];
    public clientChecks: string[] = [];
    public userChecks: string[] = [];
    public usage: string[] = [];
    public category: [string, string] | null | string | false = null;
    public toggleable: boolean = true;

    public activeCooldowns: Collection<string, number> = new Collection();

    constructor(name: string) {
        super(name);
    }

    // prettier-ignore
    public setCooldown(cooldown:  `${string}s`| `${string}m` | `${string}h`| `${string}d`| `${string}m ${string}s`| `${string}h ${string}m`| number = 0){
        let ms = 0;

        if (typeof cooldown === "string") {
            if (cooldown.endsWith("s")) {
                const cooldowns = cooldown.split(/ +/g);

                if (cooldowns.length === 1) {
                    const seconds = parseFloat(cooldowns[0]);
                    ms = seconds * 1000;
                } else {
                    const seconds = parseFloat(cooldowns[1]);
                    const minutes = parseFloat(cooldowns[0]);

                    ms = seconds * 1000 + minutes * 60 * 1000;
                }
            } else if (cooldown.endsWith("m")) {
                const cooldowns = cooldown.split(/ +/g);

                if (cooldowns.length === 1) {
                    const minutes = parseFloat(cooldowns[0]);
                    ms = minutes * 60 * 1000;
                } else {
                    const minutes = parseFloat(cooldowns[1]);
                    const hours = parseFloat(cooldowns[0]);
                    ms = minutes * 60 * 1000 + hours * 60 * 60 * 1000;
                }
            } else if (cooldown.endsWith("h")) {
                const hours = parseFloat(cooldown);
                ms = hours * 60 * 60 * 1000;
            } else if (cooldown.endsWith("d")) {
                const days = parseFloat(cooldown);
                ms = days * 24 * 60 * 60 * 1000;
            }
        } else {
            ms = cooldown * 1000;
        }

        this.cooldownNumber = ms;
    }

    public getUsage(): string {
        return `${this.usage.join(" ")}**\n\n*<> = Required\n() = Unrequired*`;
    }
    // public usage: string[];
    // public category: string | string[];
}

export class PreCommandFunction extends Item {
    public run: PreCommandRun = () => {};
}

export class PostCommandFunction extends Item {
    public run: PostCommandRun = () => {};
}

export class CommandManager {
    public client: ExtendedClient;

    constructor(client: ExtendedClient) {
        this.client = client;
    }

    public async getPrefix(message: Message): Promise<string | false | null> {
        const { client } = this;

        if (
            client.user &&
            message.content.startsWith(`<@!${client.user.id}>`)
        ) {
            return `<@!${client.user.id}>`;
        }
        if (message.guild && client.connectedToMongo) {
            const cachedGuildPrefix = client.cachedGuildPrefixes.get(
                message.guild.id
            );
            if (cachedGuildPrefix) {
                if (message.content.startsWith(cachedGuildPrefix)) {
                    return cachedGuildPrefix;
                }
            } else {
                const findGuildPrefix = await GuildPrefixModel.findById(
                    message.guild.id
                );
                if (findGuildPrefix) {
                    client.cachedGuildPrefixes.set(
                        message.guild.id,
                        findGuildPrefix.guildPrefix
                    );
                    if (
                        message.content.startsWith(findGuildPrefix.guildPrefix)
                    ) {
                        return findGuildPrefix.guildPrefix;
                    }
                }
            }
        }
        if (client.connectedToMongo) {
            const globalPrefixConfiguration =
                client.configurations.get("GLOBAL_PREFIX");

            if (globalPrefixConfiguration) {
                const globalPrefix: string =
                    globalPrefixConfiguration.options.globalPrefix;

                if (message.content.startsWith(globalPrefix)) {
                    return globalPrefix;
                }
            } else {
                const globalPrefix = client.config.prefix;

                if (message.content.startsWith(globalPrefix)) {
                    return globalPrefix;
                }
            }
        } else {
            const globalPrefix = client.config.prefix;

            if (message.content.startsWith(globalPrefix)) {
                return globalPrefix;
            }
        }

        if (!message.guild) {
            return null;
        }

        return false;
    }

    public async startsWithPrefix(message: Message): Promise<boolean> {
        const prefix = await this.getPrefix(message);

        return !!prefix || prefix === null;
    }

    public async getArgs(message: Message): Promise<string[]> {
        const prefix = await this.getPrefix(message);

        if (prefix) {
            return message.content.slice(prefix.length).trim().split(/ +/g);
        } else if (prefix === null) {
            return message.content.split(/ +/g);
        } else {
            return [];
        }
    }

    public async hasRanCommand(message: Message): Promise<boolean> {
        if (!(await this.startsWithPrefix(message))) {
            return false;
        }

        const args = await this.getArgs(message);
        if (
            !this.client.commands.has(args[0].toLowerCase()) &&
            !this.client.aliases.has(args[0].toLowerCase())
        )
            return false;

        return true;
    }

    public async getCommand(message: Message): Promise<false | Command> {
        if (!(await this.hasRanCommand(message))) {
            return false;
        }

        const args = await this.getArgs(message);

        if (this.client.commands.has(args[0].toLowerCase())) {
            const command = this.client.commands.get(args[0].toLowerCase());

            if (command) {
                return command;
            }
        } else {
            const command = this.client.aliases.get(args[0].toLowerCase());

            if (command) {
                return command;
            }
        }

        return false;
    }

    private async runCommandChecks(
        returnCommand: ReturnCommand
    ): Promise<boolean | string | [string, string]> {
        const guild = returnCommand.getGuild();
        const author = returnCommand.getAuthor();
        const channel = returnCommand.getChannel();
        const member = returnCommand.getMember();
        const mentions = returnCommand.getMentions();

        const { commandClass: command } = returnCommand;

        const { category } = command;

        let constraints: Constraint[] = [];

        if (typeof category === "string" && !command.overideConstraints) {
            const findCategory = this.client.categories.get(category);

            if (findCategory) {
                constraints = findCategory[1];
            }
        }

        const incorrectPermissions = (
            message: string
        ): string | [string, string] => {
            return [
                message,
                "You do not have the correct permissions to run this command!"
            ];
        };

        const { client } = this;

        if (client.disabledCommandManager.isDisabledCommand(command.name)) {
            return [
                "It has been disabled by my developers",
                "I could not run that command"
            ];
        }

        if (
            guild &&
            (!command.overideGuildBlacklist ||
                !constraints.includes("overideGuildBlacklist")) &&
            client.blacklistedGuildIds.includes(guild.id)
        ) {
            const blacklistObject = client.config.blacklistedGuilds.filter(
                (blacklist) => {
                    return blacklist.id === guild.id;
                }
            )[0];

            if (blacklistObject.reason) {
                return incorrectPermissions(
                    `This server is currently blacklisted for: \`\`${blacklistObject.reason}\`\``
                );
            } else {
                return incorrectPermissions(
                    "This server is currently blacklisted"
                );
            }
        }

        if (
            (!command.overideUserBlacklist ||
                !constraints.includes("overideUserBlacklist")) &&
            client.blacklistedUserIds.includes(author.id)
        ) {
            const blacklistObject = client.config.blacklistedUsers.filter(
                (user) => {
                    return user.id === author.id;
                }
            )[0];

            if (blacklistObject.reason) {
                return incorrectPermissions(
                    `You are currently blacklisted for: \`\`${blacklistObject.reason}\`\``
                );
            } else {
                return incorrectPermissions("You are currently blacklisted");
            }
        }

        if (
            (command.developerOnly || constraints.includes("developerOnly")) &&
            !client.config.botDevelopers.includes(author.id)
        ) {
            return incorrectPermissions(
                "This command can only be ran by bot developers"
            );
        }

        if (
            (command.guildOnly || constraints.includes("guildOnly")) &&
            !guild
        ) {
            return "This command has to be ran on a server";
        }

        const arrayIsNotZero = (array: string[]): boolean => {
            if (array.length === 0) {
                return false;
            } else {
                return true;
            }
        };

        if (
            arrayIsNotZero(command.certainChannelsOnly) &&
            channel &&
            !command.certainChannelsOnly.includes(channel.id)
        ) {
            return incorrectPermissions(
                "This command cannot be ran in this channel"
            );
        }

        if (
            arrayIsNotZero(command.certainGuildsOnly) &&
            guild &&
            !command.certainGuildsOnly.includes(guild.id)
        ) {
            return incorrectPermissions(
                "This command cannot be ran in this server"
            );
        }

        if (command.certainRolesOnly.length !== 0 && guild && member) {
            const rolesArray = [...member.roles.cache].map(([name]) => name);

            let hasValidRole = false;
            for (const role of rolesArray) {
                if (command.certainRolesOnly.includes(role)) {
                    hasValidRole = true;
                }
            }

            if (!hasValidRole && !member.permissions.has("ADMINISTRATOR")) {
                return incorrectPermissions(
                    "You do not have the correct roles to run this command"
                );
            }
        }

        const hasPermission = (
            permissionArray: Permission[],
            member: GuildMember,
            channel?: TextBasedChannels,
            ignoreMessagePermissions?: boolean
        ): true | [false, string] => {
            for (const permission of permissionArray) {
                if (
                    ignoreMessagePermissions &&
                    (permission === "VIEW_CHANNEL" ||
                        permission === "SEND_MESSAGES")
                ) {
                    continue;
                }
                if (
                    channel &&
                    channel.type !== "DM" &&
                    !channel.permissionsFor(member).has(permission)
                ) {
                    return [false, permission];
                } else if (!member.permissions.has(permission)) {
                    return [false, permission];
                }
            }
            return true;
        };

        const validPermission = (
            permissionArray: Permission[],
            setting: keyof Command
        ): boolean => {
            return arrayIsNotZero(permissionArray) && !command[setting];
        };

        if (guild && channel) {
            if (arrayIsNotZero(command.clientPermissions) && guild.me) {
                // prettier-ignore
                const permission = hasPermission( command.clientPermissions, guild.me, channel, true);

                if (permission !== true) {
                    // prettier-ignore
                    return `I am missing the ${permission[1].toLowerCase().replace(/_/g, " ")} to run this command`
                }
            }
            if (arrayIsNotZero(command.userPermissions) && member) {
                //prettier-ignore
                const permission = hasPermission( client.config.defaultUserPermissions, member)

                if (permission !== true) {
                    // prettier-ignore
                    return incorrectPermissions(`You are missing the ${permission[1].toLowerCase().replace(/_/g, " ")} to run this command`)
                }
            }
            for (const permission of constraints) {
                if (
                    permission !== "overideGuildBlacklist" &&
                    permission !== "overideUserBlacklist" &&
                    permission !== "guildOnly" &&
                    permission !== "developerOnly" &&
                    guild.me &&
                    member
                ) {
                    // prettier-ignore
                    const userPermission = hasPermission( [permission], member)

                    if (userPermission !== true) {
                        // prettier-ignore
                        return incorrectPermissions(`You are missing the ${userPermission[1].toLowerCase().replace(/_/g, " ")} to run this command`
                        );
                    }
                }
            }
        }

        const runCheck = async (checkID: string, type: "client" | "user") => {
            let doCheck: boolean | void = false;

            if (channel && guild && member && channel.type !== "DM") {
                doCheck = await this.client.checks.runCheck(
                    checkID,
                    {
                        user: author,
                        member: member,
                        channel: channel,
                        guild: guild
                    },
                    type
                );
            }

            if (!doCheck) {
                return false;
            } else {
                return true;
            }
        };

        if (arrayIsNotZero(command.clientChecks)) {
            for (const check of command.clientChecks) {
                const doCheck = await runCheck(check, "client");
                if (doCheck === false) {
                    return false;
                }
            }
        }

        if (arrayIsNotZero(command.userChecks)) {
            for (const check of command.userChecks) {
                const doCheck = await runCheck(check, "user");
                if (doCheck === false) {
                    return false;
                }
            }
        }

        if (command.cooldownNumber !== 0) {
            const cooldown = command.activeCooldowns.get(author.id);

            if (cooldown) {
                const timeDifference = Date.now() - cooldown;

                if (command.cooldownNumber > timeDifference) {
                    return `This command has a \`\`${this.client.utils.msToTime(
                        command.cooldownNumber
                    )}\`\` cooldown!\nYou have \`\`${this.client.utils.msToTime(
                        command.cooldownNumber - timeDifference
                    )}\`\` left!`;
                } else {
                    command.activeCooldowns.delete(author.id);
                }
            }

            if (!command.activeCooldowns.get(author.id)) {
                command.activeCooldowns.set(author.id, Date.now());
            }
        }

        return true;
    }

    public async getArguments(
        returnCommand: ReturnCommand
    ): Promise<[true, ReturnArgument[]] | [false, string]> {
        let returnArgs: ReturnArgument[] = [];

        const { commandRan, commandClass: command } = returnCommand;

        if (commandRan instanceof Message) {
            const args = await this.getArgs(commandRan);

            const usageMessage = `\`\`${args[0].toLowerCase()} ${command.usage.join(
                " "
            )}\`\`\n*<> = Required\n() = Unrequired*`;

            const incorrectUsage = (): [false, string] => {
                return [false, usageMessage];
            };

            args.shift();

            for (let index = 0; index < command.args.length; index++) {
                const requiredArg = command.args[index];
                const providedArg = args[index];

                const newArg = (text: string): ReturnArgument => {
                    return {
                        name: requiredArg.name,
                        id: Utils.generateId(requiredArg.name),
                        type: requiredArg.type,
                        text
                    };
                };

                if (requiredArg.type === "multiple") {
                    // prettier-ignore
                    const wantedArgs = args.splice(index, args.length - index)

                    if (wantedArgs.length === 0) {
                        if (requiredArg.required) {
                            return incorrectUsage();
                        }
                    } else {
                        returnArgs.push({
                            // prettier-ignore
                            ...newArg(wantedArgs.join(" ")),
                            stringArrayValue: wantedArgs
                        });
                    }

                    continue;
                }

                if (requiredArg.required && !providedArg) {
                    return incorrectUsage();
                }

                if (!providedArg) {
                    continue;
                }

                const lookForMention = (
                    text: string,
                    mentionToLookFor: "channels" | "members" | "users"
                ) => {
                    const mentions = returnCommand.getMentions();
                    const guild = returnCommand.getGuild();

                    if (!mentions) {
                        return false;
                    }

                    const messageMentions = mentions[mentionToLookFor];

                    if (!messageMentions) {
                        return false;
                    }

                    if (messageMentions.size !== 0) {
                        const mention = messageMentions.first();

                        if (mention) {
                            const arg: ReturnArgument = {
                                ...newArg(text),
                                stringValue: mention.id
                            };

                            // prettier-ignore
                            if (mentionToLookFor === "users" && mention instanceof User){
                                arg.userMention = mention
                            } else if (mentionToLookFor === "channels" && mention instanceof Channel){
                                arg.channelMention = mention
                            } else if (mentionToLookFor === "members" && mention instanceof GuildMember){
                                arg.guildMemberMention = mention
                            }
                        }
                        return {
                            ...newArg(text)
                        };
                    } else if (mentionToLookFor !== "users" && guild) {
                        const findMention =
                            guild[mentionToLookFor].cache.get(text);

                        if (!findMention) {
                            return false;
                        }

                        const arg = newArg(text);
                        arg.stringValue = findMention.id;

                        if (
                            mentionToLookFor === "channels" &&
                            findMention instanceof Channel
                        ) {
                            arg.channelMention = findMention;
                        } else if (
                            mentionToLookFor === "members" &&
                            findMention instanceof GuildMember
                        ) {
                            arg.guildMemberMention = findMention;
                        }

                        return arg;
                    } else if (mentionToLookFor === "users") {
                        const findUser = this.client.users.cache.get(text);

                        if (!findUser) {
                            return false;
                        }

                        const arg = newArg(text);

                        arg.stringValue = findUser.id;
                        arg.userMention = findUser;

                        return arg;
                    }
                    return false;
                };

                if (requiredArg.type === "single") {
                    returnArgs.push({
                        ...newArg(providedArg),
                        stringValue: providedArg
                    });
                } else if (requiredArg.type === "interger") {
                    const argNumber = parseInt(providedArg);
                    if (isNaN(argNumber) && requiredArg.required) {
                        return incorrectUsage();
                    }
                    returnArgs.push({
                        ...newArg(providedArg),
                        numberValue: argNumber
                    });
                } else if (requiredArg.type === "number") {
                    const argNumber = parseFloat(providedArg);
                    if (isNaN(argNumber) && requiredArg.required) {
                        return incorrectUsage();
                    }
                    returnArgs.push({
                        ...newArg(providedArg),
                        numberValue: argNumber
                    });
                } else if (requiredArg.type === "channelMention") {
                    const findChannel = lookForMention(providedArg, "channels");
                    if (!findChannel) return incorrectUsage();
                    returnArgs.push(findChannel);
                } else if (requiredArg.type === "memberMention") {
                    const findMember = lookForMention(providedArg, "members");
                    if (findMember === false) return incorrectUsage();
                    returnArgs.push(findMember);
                } else if (requiredArg.type === "userMention") {
                    const findUser = lookForMention(providedArg, "users");
                    if (findUser === false) return incorrectUsage();
                    returnArgs.push(findUser);
                } else if (requiredArg.type === "customValue") {
                    if (!requiredArg.customValues) {
                        continue;
                    }
                    if (requiredArg.allowLowerCaseCustomValue) {
                        // prettier-ignore
                        if(!requiredArg.customValues.includes(providedArg.toLowerCase())){
                            return incorrectUsage()
                        }
                        // prettier-ignore
                        returnArgs.push({...newArg(providedArg), stringValue: providedArg.toLowerCase()})
                    } else {
                        // prettier-ignore
                        if(!requiredArg.customValues.includes(providedArg)){
                            return incorrectUsage()
                        }
                        // prettier-ignore
                        returnArgs.push({...newArg(providedArg), stringValue: providedArg})
                    }
                } else if (requiredArg.type === "time") {
                    const remainingArgs = args.splice(
                        index,
                        args.length - index
                    );

                    const timeEndings: TimeEnding[] = [
                        ["seconds", "SECONDS", 1000],
                        ["minutes", "MINUTES", 1000 * 60],
                        ["hours", "HOURS", 1000 * 60 * 60],
                        ["days", "DAYS", 1000 * 60 * 60 * 24],
                        ["weeks", "WEEKS", 1000 * 60 * 60 * 24 * 7],
                        ["years", "YEARS", 1000 * 60 * 60 * 24 * 365],
                        ["s", "SECONDS", 1000],
                        ["m", "MINUTES", 1000 * 60],
                        ["h", "HOURS", 1000 * 60 * 60],
                        ["d", "DAYS", 1000 * 60 * 60 * 24],
                        ["w", "WEEKS", 1000 * 60 * 60 * 24 * 7],
                        ["y", "YEARS", 1000 * 60 * 60 * 24 * 265]
                    ];

                    const endsWithTimeEnding = (string: string) => {
                        for (const ending of timeEndings) {
                            if (string === ending[0]) {
                                return ending;
                            } else if (string.endsWith(ending[0])) {
                                return ending;
                            }
                        }
                        return false;
                    };

                    const endsWithOrNextArg = (
                        indexNumber: number
                    ): ReturnTime | false => {
                        const arg = remainingArgs[indexNumber].toLowerCase();
                        let nextArg = remainingArgs[indexNumber + 1];

                        if (nextArg) {
                            nextArg = nextArg.toLowerCase();
                        }

                        const timeEndingArg = endsWithTimeEnding(arg);
                        let timeEndingNextArg: false | TimeEnding = false;

                        if (!!nextArg) {
                            timeEndingNextArg = endsWithTimeEnding(nextArg);
                        }

                        if (!timeEndingArg || !timeEndingNextArg) {
                            return false;
                        } else if (timeEndingArg) {
                            return [
                                false,
                                timeEndingArg[0],
                                timeEndingArg[1],
                                timeEndingArg[2]
                            ];
                        } else {
                            return [
                                true,
                                timeEndingNextArg[0],
                                timeEndingNextArg[1],
                                timeEndingNextArg[2]
                            ];
                        }
                    };

                    let timeMentions: [string, ReturnTime][] = [];

                    for (let i = 0; i < remainingArgs.length; i++) {
                        const remainingArg = remainingArgs[i].toLowerCase();
                        const endsWithEnding = endsWithOrNextArg(i);

                        args.push(remainingArgs[i]);

                        if (!endsWithEnding) {
                            continue;
                        }

                        if (endsWithEnding[0] === true) {
                            i++;
                            args.push(remainingArgs[i]);
                        }

                        timeMentions.push([remainingArg, endsWithEnding]);
                    }

                    if (timeMentions.length === 0) {
                        if (requiredArg.required) {
                            return incorrectUsage();
                        } else {
                            continue;
                        }
                    }

                    let totalTime = 0;
                    for (const time of timeMentions) {
                        const duration: string = time[0].replace(/\D/g, "");
                        const timeOptions = time[1];
                        if (duration.length === 0) {
                            if (requiredArg.required) {
                                return incorrectUsage();
                            } else {
                                continue;
                            }
                        }

                        const durationNumber = parseFloat(duration);
                        totalTime += durationNumber * timeOptions[3];
                    }
                    returnArgs.push({
                        ...newArg(providedArg),
                        numberValue: totalTime
                    });
                }
            }
        } else {
            const usageMessage = `\`\`${commandRan.commandName.toLowerCase()} ${command.usage.join(
                " "
            )}\`\`\n*<> = Required\n() = Unrequired*`;

            const incorrectUsage = (): [false, string] => {
                return [false, usageMessage];
            };

            for (const providedArg of commandRan.options.data) {
                let requiredArg: Argument = command.args.filter((arg) => {
                    return arg.name === providedArg.name;
                })[0];

                const newArg = (text: string): ReturnArgument => {
                    return {
                        name: requiredArg.name,
                        id: Utils.generateId(requiredArg.name),
                        type: requiredArg.type,
                        text
                    };
                };

                if (providedArg.value) {
                    if (requiredArg.type === "single") {
                        const value = providedArg.value
                            .toString()
                            .split(/ +/)[0];

                        returnArgs.push({
                            ...newArg(value),
                            stringValue: value
                        });
                    } else if (requiredArg.type === "multiple") {
                        returnArgs.push({
                            ...newArg(providedArg.value.toString()),
                            stringArrayValue: providedArg.value
                                .toString()
                                .split(/ +/)
                        });
                    } else if (
                        requiredArg.type === "channelMention" &&
                        providedArg.channel
                    ) {
                        if (!(providedArg.channel instanceof Channel)) {
                            continue;
                        }
                        returnArgs.push({
                            ...newArg(providedArg.value.toString()),
                            channelMention: providedArg.channel
                        });
                    } else if (requiredArg.type === "number") {
                        if (typeof providedArg.value !== "number") {
                            continue;
                        }

                        returnArgs.push({
                            ...newArg(providedArg.value.toString()),
                            numberValue: providedArg.value
                        });
                    } else if (requiredArg.type === "interger") {
                        if (typeof providedArg.value !== "number") {
                            continue;
                        }

                        returnArgs.push({
                            ...newArg(providedArg.value.toString()),
                            numberValue: Math.floor(providedArg.value)
                        });
                    } else if (requiredArg.type === "memberMention") {
                        if (!(providedArg.member instanceof GuildMember)) {
                            continue;
                        }

                        returnArgs.push({
                            ...newArg(providedArg.value.toString()),
                            guildMemberMention: providedArg.member
                        });
                    } else if (requiredArg.type === "userMention") {
                        returnArgs.push({
                            ...newArg(providedArg.value.toString()),
                            userMention: providedArg.user
                        });
                    } else if (requiredArg.type === "customValue") {
                        if (
                            !requiredArg.customValues ||
                            typeof providedArg.value !== "string"
                        ) {
                            continue;
                        }
                        if (requiredArg.allowLowerCaseCustomValue) {
                            // prettier-ignore
                            if(!requiredArg.customValues.includes(providedArg.value.toLowerCase())){
                                return incorrectUsage()
                            }
                            // prettier-ignore
                            returnArgs.push({...newArg(providedArg.value.toLowerCase()), stringValue: providedArg.value.toLowerCase()})
                        } else {
                            // prettier-ignore
                            if(!requiredArg.customValues.includes(providedArg.value)){
                                return incorrectUsage()
                            }
                            // prettier-ignore
                            returnArgs.push({...newArg(providedArg.value), stringValue: providedArg.value})
                        }
                    } else {
                        const timeMentionArray = providedArg.value
                            .toString()
                            .split(/ +/);
                        const timeEndings: TimeEnding[] = [
                            ["seconds", "SECONDS", 1000],
                            ["minutes", "MINUTES", 1000 * 60],
                            ["hours", "HOURS", 1000 * 60 * 60],
                            ["days", "DAYS", 1000 * 60 * 60 * 24],
                            ["weeks", "WEEKS", 1000 * 60 * 60 * 24 * 7],
                            ["years", "YEARS", 1000 * 60 * 60 * 24 * 365],
                            ["s", "SECONDS", 1000],
                            ["m", "MINUTES", 1000 * 60],
                            ["h", "HOURS", 1000 * 60 * 60],
                            ["d", "DAYS", 1000 * 60 * 60 * 24],
                            ["w", "WEEKS", 1000 * 60 * 60 * 24 * 7],
                            ["y", "YEARS", 1000 * 60 * 60 * 24 * 265]
                        ];

                        const endsWithTimeEnding = (string: string) => {
                            for (const ending of timeEndings) {
                                if (string === ending[0]) {
                                    return ending;
                                } else if (string.endsWith(ending[0])) {
                                    return ending;
                                }
                            }
                            return false;
                        };

                        const endsWithOrNextArg = (
                            indexNumber: number
                        ): ReturnTime | false => {
                            const arg =
                                timeMentionArray[indexNumber].toLowerCase();
                            let nextArg = timeMentionArray[indexNumber + 1];

                            if (nextArg) {
                                nextArg = nextArg.toLowerCase();
                            }

                            const timeEndingArg = endsWithTimeEnding(arg);
                            let timeEndingNextArg: false | TimeEnding = false;

                            if (!!nextArg) {
                                timeEndingNextArg = endsWithTimeEnding(nextArg);
                            }

                            if (!timeEndingArg || !timeEndingNextArg) {
                                return false;
                            } else if (timeEndingArg) {
                                return [
                                    false,
                                    timeEndingArg[0],
                                    timeEndingArg[1],
                                    timeEndingArg[2]
                                ];
                            } else {
                                return [
                                    true,
                                    timeEndingNextArg[0],
                                    timeEndingNextArg[1],
                                    timeEndingNextArg[2]
                                ];
                            }
                        };

                        let timeMentions: [string, ReturnTime][] = [];

                        for (let i = 0; i < timeMentionArray.length; i++) {
                            const remainingArg =
                                timeMentionArray[i].toLowerCase();
                            const endsWithEnding = endsWithOrNextArg(i);

                            if (!endsWithEnding) {
                                continue;
                            }

                            if (endsWithEnding[0] === true) {
                                i++;
                            }

                            timeMentions.push([remainingArg, endsWithEnding]);
                        }

                        if (timeMentions.length === 0) {
                            if (requiredArg.required) {
                                return incorrectUsage();
                            } else {
                                continue;
                            }
                        }

                        let totalTime = 0;
                        for (const time of timeMentions) {
                            const duration: string = time[0].replace(/\D/g, "");
                            const timeOptions = time[1];
                            if (duration.length === 0) {
                                if (requiredArg.required) {
                                    return incorrectUsage();
                                } else {
                                    continue;
                                }
                            }
                            const durationNumber = parseFloat(duration);
                            totalTime += durationNumber * timeOptions[3];
                        }
                        returnArgs.push({
                            ...newArg(providedArg.value.toString()),
                            numberValue: totalTime
                        });
                    }
                }
            }
        }

        return [true, returnArgs];
    }

    public async runCommand(
        command: Command,
        commandRan: Message | CommandInteraction
    ) {
        let returnCommand = new ReturnCommand(command, commandRan, this.client);

        if (
            commandRan instanceof CommandInteraction &&
            returnCommand.commandClass.deferResponse
        ) {
            await commandRan.deferReply();
            returnCommand.commandRepliedTo = true;
        }

        const commandChecks = await this.runCommandChecks(returnCommand);

        if (typeof commandChecks === "string") {
            return returnCommand.sendError(commandChecks);
        } else if (typeof commandChecks !== "boolean") {
            return returnCommand.sendError(commandChecks[0], commandChecks[1]);
        } else if (commandChecks === false) {
            return;
        }

        const args = await this.getArguments(returnCommand);

        let prefixUsed: string = "/";

        if (returnCommand.commandRan instanceof Message) {
            const prefix = await this.getPrefix(returnCommand.commandRan);
            prefixUsed = prefix ? prefix : "";
        }

        if (args[0] === false) {
            return returnCommand.sendError(
                `Correct usage: \`\`${prefixUsed}\`\` ${args[1]}`,
                `Incorrect usage for ${returnCommand.commandClass.name}`
            );
        }

        for (const preRunFunction of this.client.preCommandFunctions) {
            const runFunction = await preRunFunction.run(
                this.client,
                returnCommand
            );

            if (runFunction === false) {
                return;
            }
        }

        returnCommand.args = args[1];

        try {
            if (command.run) command.run(this.client, returnCommand);
        } catch (error: any) {
            this.client.console.error(error);
            if (this.client.config.sendErrorMessages) {
                returnCommand.sendError(
                    `There was an error while running that command: \n\`\`\`${error}\`\`\``,
                    `I couldn't run that command`
                );
            } else {
                returnCommand.sendError(
                    "There was an error while running that command",
                    "I couldn't run that command"
                );
            }
            if (
                this.client.config.autoRemoveCommands &&
                !command.overideAutoRemove
            ) {
                await this.client.disabledCommandManager.addCommand(
                    command.name,
                    true
                );
            }
        }

        for (const postRunFunction of this.client.postCommandFunctions) {
            await postRunFunction.run(this.client, returnCommand);
        }
    }
}
