import {
    Channel,
    ChannelMention,
    Guild,
    GuildMember,
    MemberMention,
    Message,
    TextBasedChannels,
    User,
} from "discord.js";
import { Client } from "../..";
import {
    Argument,
    commandRan,
    CommandRun,
    Permission,
    ReturnArgument,
    ReturnTime,
    TimeEnding,
} from "../../Interaces";
import path from "path";

export class Command {
    public client: Client;
    public name: string;
    public args: Argument[];
    public description: string;
    public aliases: string[];
    public cooldown:
        | `${string}s`
        | `${string}m`
        | `${string}h`
        | `${string}d`
        | `${string}m ${string}s`
        | `${string}h ${string}m`
        | number;
    public developerOnly: boolean;
    public guildOnly: boolean;
    public certainChannelsOnly: string | string[];
    public certainGuildsOnly: string | string[];
    public certainRolesOnly: string | string[];
    public overideLoadSlashCommand: boolean;
    public overideDefaultClientChecks: boolean;
    public overideDefaultUserChecks: boolean;
    public overideDefaultClientPermissions: boolean;
    public overideDefaultUserPermissions: boolean;
    public overideGuildBlacklist: boolean;
    public overideUserBlacklist: boolean;
    public clientPermissions: Permission | Permission[] | "";
    public userPermissions: Permission | Permission[] | "";
    public clientChecks: string | string[];
    public userChecks: string | string[];
    public usage: string[];
    public category: string | string[];
    public run: CommandRun;

    public async runCommand(commandRan: commandRan) {
        const { slashCommand, message } = commandRan;

        let guild: Guild =
            message !== null ? message.guild : slashCommand.guild;
        let author: User =
            message !== null ? message.author : slashCommand.user;
        let channel: TextBasedChannels =
            message !== null ? message.channel : slashCommand.channel;
        let member = message !== null ? message.member : slashCommand.member;
        let content = message !== null ? message.content : null;
        let mentions = message !== null ? message.mentions : null;

        if (!(member instanceof GuildMember)) {
            return false;
        }

        const {
            config,
            messageHandler: MessageHandler,
            developers,
            userChecks,
            clientChecks,
            CommandsCooldowns,
        } = this.client;

        if (this.client.cachedConfigurations.get("DISABLED_COMMANDS")) {
            if (
                this.client.cachedConfigurations
                    .get("DISABLED_COMMANDS")
                    .options.disabledCommands.includes(this.name)
            ) {
                return MessageHandler.sendError(
                    commandRan,
                    "That command is disabled!"
                );
            }
        }

        if (
            guild &&
            guild.id in config.blacklistedGuilds &&
            !this.overideGuildBlacklist
        ) {
            return MessageHandler.sendError(
                commandRan,
                `This server is blacklisted for reason: \`\`${
                    config.blacklistedGuilds[guild.id]
                }\`\``,
                `You cannot execute that command here!`
            );
        }

        if (
            author.id in config.blacklistedUsers &&
            !this.overideUserBlacklist
        ) {
            return MessageHandler.sendError(
                commandRan,
                `You are blacklisted for reason \`\`${
                    config.blacklistedUsers[author.id]
                }\`\``,
                `You cannot execute that command!`
            );
        }

        if (this.developerOnly && !developers.includes(author)) {
            return MessageHandler.sendError(
                commandRan,
                `This command can only be ran by a bot developer`,
                `You do not have permission to run this command!`
            );
        }

        if (this.guildOnly && !guild) {
            return MessageHandler.sendError(
                commandRan,
                `This command can only be ran in servers`,
                `This command cannot be ran here!`
            );
        }

        if (this.certainChannelsOnly !== "" && guild) {
            if (typeof this.certainChannelsOnly === "string") {
                this.certainChannelsOnly = [this.certainChannelsOnly];
            }

            if (!this.certainChannelsOnly.includes(channel.id)) {
                return MessageHandler.sendError(
                    commandRan,
                    `This command cannot be ran in this channel`,
                    `This command cannot be ran here!`
                );
            }
        }

        if (this.certainGuildsOnly !== "" && guild) {
            if (typeof this.certainGuildsOnly === "string") {
                this.certainGuildsOnly = [this.certainGuildsOnly];
            }

            if (!this.certainGuildsOnly.includes(guild.id)) {
                return MessageHandler.sendError(
                    commandRan,
                    `This command cannot be ran in this server`,
                    `This command cannot be ran here!`
                );
            }
        }

        if (this.certainRolesOnly !== "" && guild) {
            if (typeof this.certainRolesOnly === "string") {
                this.certainRolesOnly[this.certainRolesOnly];
            }

            const rolesArray = [...member.roles.cache].map(([name]) => name);

            let hasValidRole = false;
            for (const role of rolesArray) {
                if (this.certainRolesOnly.includes(role)) {
                    hasValidRole = true;
                }
            }

            if (!hasValidRole) {
                return MessageHandler.sendError(
                    commandRan,
                    `You are missing the required roles`,
                    `You do not have the correct permisions to run this command!`
                );
            }
        }

        if (
            config.defaultClientPermissions !== [] &&
            guild &&
            channel.type !== "DM" &&
            !this.overideDefaultClientPermissions
        ) {
            for (const permission of config.defaultClientPermissions) {
                if (!channel.permissionsFor(guild.me).has(permission)) {
                    if (
                        permission !== "VIEW_CHANNEL" &&
                        permission !== "SEND_MESSAGES"
                    ) {
                        return MessageHandler.sendError(
                            commandRan,
                            `I am missing the \`\`${permission
                                .toLowerCase()
                                .replace(
                                    /_/g,
                                    " "
                                )}\`\` permission to run this command!`,
                            `I do not have the correct permisssions to run this command!`
                        );
                    }
                }
            }
        }

        if (
            config.defaultUserPermissions !== [] &&
            guild &&
            channel.type !== "DM" &&
            !this.overideDefaultUserPermissions
        ) {
            for (const permission of config.defaultUserPermissions) {
                if (!member.permissions.has(permission)) {
                    return MessageHandler.sendError(
                        commandRan,
                        `You are missing the \`\`${permission
                            .toLowerCase()
                            .replace(
                                /_/g,
                                " "
                            )}\`\` permission to run this command!`,
                        `You do not have the correct permisssions to run this command!`
                    );
                }
            }
        }

        if (this.clientPermissions !== "" && guild && channel.type !== "DM") {
            if (typeof this.clientPermissions === "string") {
                this.clientPermissions = [this.clientPermissions];
            }

            for (const permission of this.clientPermissions) {
                if (!channel.permissionsFor(guild.me).has(permission)) {
                    if (
                        permission !== "VIEW_CHANNEL" &&
                        permission !== "SEND_MESSAGES"
                    ) {
                        return MessageHandler.sendError(
                            commandRan,
                            `I am missing the \`\`${permission
                                .toLowerCase()
                                .replace(
                                    /_/g,
                                    " "
                                )}\`\` permission to run this command!`,
                            `I do not have the correct permisssions to run this command!`
                        );
                    }
                }
            }
        }

        if (this.userPermissions !== "" && guild) {
            if (typeof this.userPermissions === "string") {
                this.userPermissions = [this.userPermissions];
            }

            for (const permission of this.userPermissions) {
                if (!member.permissions.has(permission)) {
                    return MessageHandler.sendError(
                        commandRan,
                        `You are missing the \`\`${permission
                            .toLowerCase()
                            .replace(
                                /_/g,
                                " "
                            )}\`\` permission to run this command!`,
                        `You do not have the correct permisssions to run this command!`
                    );
                }
            }
        }

        const runCheck = async (checkID: string) => {
            const findCheck = clientChecks.get(checkID);

            if (!findCheck) {
                MessageHandler.warn(`Couldn't find check with ID: ${checkID}`);
                return;
            }

            let doCheck = false;

            if (member instanceof GuildMember) {
                doCheck = findCheck.run({
                    member: member,
                    guild: guild,
                    user: author,
                    channel: channel,
                });
            }

            if (doCheck === false) {
                return false;
            }
        };

        if (
            config.defaultClientChecks !== [] &&
            !this.overideDefaultClientChecks
        ) {
            for (const check of config.defaultClientChecks) {
                const doCheck = await runCheck(check);

                if (doCheck === false) {
                    return;
                }
            }
        }

        if (config.defaultUserChecks !== [] && !this.overideDefaultUserChecks) {
            for (const check of config.defaultUserChecks) {
                const doCheck = await runCheck(check);
                if (doCheck === false) {
                    return;
                }
            }
        }

        if (this.clientChecks !== "") {
            if (typeof this.clientChecks === "string") {
                this.clientChecks = [this.clientChecks];
            }

            for (const check of this.clientChecks) {
                const doCheck = await runCheck(check);
                if (doCheck === false) {
                    return;
                }
            }
        }

        if (this.userChecks !== "") {
            if (typeof this.userChecks === "string") {
                this.userChecks = [this.userChecks];
            }

            for (const check of this.userChecks) {
                const doCheck = await runCheck(check);
                if (doCheck === false) {
                    return;
                }
            }
        }

        if (this.cooldown !== "") {
            const activeCooldown = CommandsCooldowns.get(author.id);
            if (activeCooldown) {
                const timeDifference = Date.now() - activeCooldown.lastRan;
                if (activeCooldown.cooldown > timeDifference) {
                    return MessageHandler.sendError(
                        commandRan,
                        `This command has a \`\`${this.client.utils.msToTime(
                            activeCooldown.cooldown
                        )}\`\` cooldown!\nYou have \`\`${this.client.utils.msToTime(
                            activeCooldown.cooldown
                        )}\`\` left!`,
                        "Slow down there bud!"
                    );
                } else {
                    CommandsCooldowns.delete(author.id);
                }
            }

            let ms: number;
            if (typeof this.cooldown === "string") {
                if (this.cooldown.endsWith("s")) {
                    const cooldowns = this.cooldown.split(/ +/g);

                    if (cooldowns.length === 1) {
                        const seconds = parseFloat(cooldowns[0]);
                        ms = seconds * 1000;
                    } else {
                        const seconds = parseFloat(cooldowns[1]);
                        const minutes = parseFloat(cooldowns[0]);

                        ms = seconds * 1000 + minutes * 60 * 1000;
                    }
                } else if (this.cooldown.endsWith("m")) {
                    const cooldowns = this.cooldown.split(/ +/g);

                    if (cooldowns.length === 1) {
                        const minutes = parseFloat(cooldowns[0]);
                        ms = minutes * 60 * 1000;
                    } else {
                        const minutes = parseFloat(cooldowns[1]);
                        const hours = parseFloat(cooldowns[0]);
                        ms = minutes * 60 * 1000 + hours * 60 * 60 * 1000;
                    }
                } else if (this.cooldown.endsWith("h")) {
                    const hours = parseFloat(this.cooldown);
                    ms = hours * 60 * 60 * 1000;
                } else if (this.cooldown.endsWith("d")) {
                    const days = parseFloat(this.cooldown);
                    ms = days * 24 * 60 * 60 * 1000;
                }
            } else {
                ms = this.cooldown * 1000;
            }

            if (!CommandsCooldowns.get(author.id)) {
                const now = Date.now();

                CommandsCooldowns.set(author.id, {
                    userID: author.id,
                    cooldown: ms,
                    lastRan: now,
                });
            }
        }

        let returnArgs: ReturnArgument[] = [];
        if (this.args !== []) {
            if (message !== null) {
                let args = await this.client.utils.getArgs(message);

                if (!args) {
                    return false;
                }

                const usageMessage = `**${args[0].toLowerCase()} ${this.usage.join(
                    " "
                )}**\n\n*<> = Required\n() = Unrequired*`;
                args.shift();

                for (let index = 0; index < this.args.length; index++) {
                    const requiredArg = this.args[index];
                    const providedArg = args[index];

                    const incorrectUsage = () => {
                        return MessageHandler.sendError(
                            commandRan,
                            `Correct usage: ${usageMessage}`,
                            `Incorrect usage for ${this.name}`
                        );
                    };

                    if (requiredArg.type === "multiple") {
                        const wantedArgs = args.splice(
                            index,
                            args.length - index
                        );
                        if (requiredArg.required && wantedArgs.length === 0) {
                            return incorrectUsage();
                        }
                        returnArgs.push({
                            name: requiredArg.name,
                            id: requiredArg.id,
                            type: requiredArg.type,
                            text: wantedArgs.join(" "),
                            stringArrayValue: wantedArgs,
                        });
                        continue;
                    }

                    if (requiredArg.required && !providedArg) {
                        return incorrectUsage();
                    }

                    const lookForMention = (
                        text: string,
                        mentionToLookFor: "channels" | "members" | "users"
                    ) => {
                        const messageMentions = mentions[mentionToLookFor];

                        let mentionValue = `${mentionToLookFor.slice(
                            0,
                            -1
                        )}Mention`;

                        if (messageMentions.size !== 0) {
                            return {
                                name: requiredArg.name,
                                id: requiredArg.id,
                                type: requiredArg.type,
                                text: providedArg,
                                value: messageMentions.first().id,
                                mentionValue: messageMentions.first(),
                            };
                        } else {
                            if (mentionToLookFor !== "users") {
                                const findMention =
                                    guild[mentionToLookFor].cache.get(text);

                                if (!findMention) {
                                    return false;
                                }

                                return {
                                    name: requiredArg.name,
                                    id: requiredArg.id,
                                    type: requiredArg.type,
                                    text: providedArg,
                                    value: findMention.id,
                                    mentionValue: findMention,
                                };
                            } else {
                                const findUser =
                                    this.client.users.cache.get(text);

                                if (!findUser) {
                                    return false;
                                }

                                return {
                                    name: requiredArg.name,
                                    id: requiredArg.id,
                                    type: requiredArg.type,
                                    text: providedArg,
                                    value: findUser.id,
                                    mentionValue: findUser,
                                };
                            }
                        }
                    };

                    if (requiredArg.type === "single") {
                        returnArgs.push({
                            name: requiredArg.name,
                            id: requiredArg.id,
                            type: requiredArg.type,
                            text: providedArg,
                            stringValue: providedArg,
                        });
                    } else if (requiredArg.type === "interger") {
                        const argNumber = parseInt(providedArg);
                        if (isNaN(argNumber) && requiredArg.required) {
                            return incorrectUsage();
                        }
                        returnArgs.push({
                            name: requiredArg.name,
                            id: requiredArg.id,
                            type: requiredArg.type,
                            text: providedArg,
                            numberValue: argNumber,
                        });
                    } else if (requiredArg.type === "number") {
                        const argNumber = parseFloat(providedArg);
                        if (isNaN(argNumber) && requiredArg.required) {
                            return incorrectUsage();
                        }
                        returnArgs.push({
                            name: requiredArg.name,
                            id: requiredArg.id,
                            type: requiredArg.type,
                            text: providedArg,
                            numberValue: argNumber,
                        });
                    } else if (requiredArg.type === "channelMention") {
                        const findChannel = lookForMention(
                            providedArg,
                            "channels"
                        );

                        if (findChannel === false) {
                            return incorrectUsage();
                        }

                        returnArgs.push(findChannel);
                    } else if (requiredArg.type === "memberMention") {
                        const findMember = lookForMention(
                            providedArg,
                            "members"
                        );

                        if (findMember === false) {
                            return incorrectUsage();
                        }

                        returnArgs.push(findMember);
                    } else if (requiredArg.type === "userMention") {
                        const findUser = lookForMention(providedArg, "users");

                        if (findUser === false) {
                            return incorrectUsage();
                        }

                        returnArgs.push(findUser);
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
                            ["y", "YEARS", 1000 * 60 * 60 * 24 * 265],
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
                        ): ReturnTime => {
                            const arg =
                                remainingArgs[indexNumber].toLowerCase();
                            let nextArg = remainingArgs[indexNumber + 1];

                            if (nextArg) {
                                nextArg = nextArg.toLowerCase();
                            }

                            const timeEndingArg = endsWithTimeEnding(arg);
                            let timeEndingNextArg: false | TimeEnding;

                            if (!!nextArg) {
                                timeEndingNextArg = endsWithTimeEnding(nextArg);
                            }

                            if (!timeEndingArg && !timeEndingNextArg) {
                                return false;
                            } else if (timeEndingArg) {
                                return [
                                    false,
                                    timeEndingArg[0],
                                    timeEndingArg[1],
                                    timeEndingArg[2],
                                ];
                            } else {
                                return [
                                    true,
                                    timeEndingNextArg[0],
                                    timeEndingNextArg[1],
                                    timeEndingNextArg[2],
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
                            name: requiredArg.name,
                            id: requiredArg.id,
                            type: requiredArg.type,
                            text: providedArg,
                            numberValue: totalTime,
                        });
                    }
                }
            } else if (slashCommand !== null) {
                const usageMessage = `**${slashCommand.commandName.toLowerCase()} ${this.usage.join(
                    " "
                )}**\n\n*<> = Required\n() = Unrequired*`;

                const incorrectUsage = () => {
                    return MessageHandler.sendError(
                        commandRan,
                        `Correct usage: ${usageMessage}`,
                        `Incorrect usage for ${this.name}`
                    );
                };

                for (const providedArg of slashCommand.options.data) {
                    let requiredArg: Argument;

                    for (const arg of this.args) {
                        if (arg.name === providedArg.name) {
                            requiredArg = arg;
                        }
                    }

                    if (requiredArg.type === "single") {
                        returnArgs.push({
                            name: requiredArg.name,
                            id: requiredArg.id,
                            type: requiredArg.type,
                            text: providedArg.value.toString().split(/ +/)[0],
                            stringValue: providedArg.value
                                .toString()
                                .split(/ +/)[0],
                        });
                    } else if (requiredArg.type === "multiple") {
                        returnArgs.push({
                            name: requiredArg.name,
                            id: requiredArg.id,
                            type: requiredArg.type,
                            text: providedArg.value.toString(),
                            stringArrayValue: providedArg.value
                                .toString()
                                .split(/ +/),
                        });
                    } else if (requiredArg.type === "channelMention") {
                        if (!(providedArg.channel instanceof Channel)) {
                            continue;
                        }
                        returnArgs.push({
                            name: requiredArg.name,
                            id: requiredArg.id,
                            type: requiredArg.type,
                            text: providedArg.value.toString(),
                            channelMention: providedArg.channel,
                        });
                    } else if (requiredArg.type === "number") {
                        if (typeof providedArg.value !== "number") {
                            continue;
                        }

                        returnArgs.push({
                            name: requiredArg.name,
                            id: requiredArg.id,
                            type: requiredArg.type,
                            text: providedArg.value.toString(),
                            numberValue: providedArg.value,
                        });
                    } else if (requiredArg.type === "interger") {
                        if (typeof providedArg.value !== "number") {
                            continue;
                        }

                        returnArgs.push({
                            name: requiredArg.name,
                            id: requiredArg.id,
                            type: requiredArg.type,
                            text: providedArg.value.toString(),
                            numberValue: Math.floor(providedArg.value),
                        });
                    } else if (requiredArg.type === "memberMention") {
                        if (!(providedArg.member instanceof GuildMember)) {
                            continue;
                        }

                        returnArgs.push({
                            name: requiredArg.name,
                            id: requiredArg.id,
                            type: requiredArg.type,
                            text: providedArg.value.toString(),
                            guildMemberMention: providedArg.member,
                        });
                    } else if (requiredArg.type === "userMention") {
                        returnArgs.push({
                            name: requiredArg.name,
                            id: requiredArg.id,
                            type: requiredArg.type,
                            text: providedArg.value.toString(),
                            userMention: providedArg.user,
                        });
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
                            ["y", "YEARS", 1000 * 60 * 60 * 24 * 265],
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
                        ): ReturnTime => {
                            const arg =
                                timeMentionArray[indexNumber].toLowerCase();
                            let nextArg = timeMentionArray[indexNumber + 1];

                            if (nextArg) {
                                nextArg = nextArg.toLowerCase();
                            }

                            const timeEndingArg = endsWithTimeEnding(arg);
                            let timeEndingNextArg: false | TimeEnding;

                            if (!!nextArg) {
                                timeEndingNextArg = endsWithTimeEnding(nextArg);
                            }

                            if (!timeEndingArg && !timeEndingNextArg) {
                                return false;
                            } else if (timeEndingArg) {
                                return [
                                    false,
                                    timeEndingArg[0],
                                    timeEndingArg[1],
                                    timeEndingArg[2],
                                ];
                            } else {
                                return [
                                    true,
                                    timeEndingNextArg[0],
                                    timeEndingNextArg[1],
                                    timeEndingNextArg[2],
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
                            name: requiredArg.name,
                            id: requiredArg.id,
                            type: requiredArg.type,
                            text: providedArg.value.toString(),
                            numberValue: totalTime,
                        });
                    }
                }
            }
        }

        try {
            await this.run(returnArgs, commandRan, this);
            this.client.eventEmitter.emit("commandRan", this, commandRan);
        } catch (error) {
            if (config.sendErrorMessages) {
                let userMentions = `such as, `;
                this.client.developers.forEach((user) => {
                    userMentions += `<@${user.id}>`;
                });
                MessageHandler.sendError(
                    commandRan,
                    `Please contact one of my developers ${
                        userMentions !== "such as, " ? userMentions : ""
                    }`,
                    "There was an error executing that command"
                );
            }
            if (config.logErrorMessages) {
                if (config.logDebugs) {
                    `There was an error while execution command: "${
                        this.name
                    }".\nFind the error in "${path.join(
                        __dirname,
                        "..",
                        "..",
                        "..",
                        "..",
                        "logs.log"
                    )}".`;
                }
                console.error(error);
            }
        }
    }
}
