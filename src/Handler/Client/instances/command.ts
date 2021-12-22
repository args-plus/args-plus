import {
    Channel,
    CommandInteraction,
    GuildMember,
    Message,
    TextBasedChannels,
    User
} from "discord.js";
import { Argument, Category, Client } from "../..";
import { Command } from "../../Commands";
import { ReturnCommand } from "../../Commands/returnCommand";
import { Permission, ReturnTime, TimeEnding } from "../../Interfaces";
import path from "path";
import { checkOptions } from "../../Checks";
import { GuildPrefixModel } from "../../Defaults/Schemas";

export class CommandManager {
    readonly client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    private loadedCategoryDirs: string[] = [];
    private loadedCategoryNames: string[] = [];

    public loadCategories() {
        const { client } = this;
        const { categories } = client;

        for (const categoryKey of categories) {
            const category = categoryKey[1];

            const pathArray = category.dir.split(path.sep);
            pathArray.pop();

            if (category.getLoaded()) {
                continue;
            }

            if (this.loadedCategoryDirs.includes(pathArray.join(path.sep))) {
                client.console.debug(
                    `Skipped loading category file: ${
                        category.name
                    }, as "${pathArray.join(path.sep)}" already has a category file`
                );
                client.categories.delete(category.name);
                continue;
            }

            this.loadedCategoryDirs.push(pathArray.join(path.sep));

            if (this.loadedCategoryNames.includes(category.name)) {
                client.console.log(
                    `Category name: ${category.name} has been used multiple times`
                );
                client.categories.delete(category.name);
                continue;
            }

            this.loadedCategoryNames.push(category.name);

            if (category.description.length === 0) {
                category.description = "This category has no description";
            }

            category.setLoaded();
        }
    }

    public loadCommand(command: Command) {
        const { client } = this;

        const failedToLoadCommand = (message: string) => {
            client.commands.delete(command.name);

            client.console.warn(`Failed to load command: "${command.name}", ${message}`);
            return false;
        };

        if (command.getLoaded()) {
            return true;
        }

        if (!command.run) {
            return failedToLoadCommand("it does not have a run function!");
        }

        let argTypeMultiple = false;
        let argIds: string[] = [];
        let argRequired = true;

        for (const arg of command.args) {
            if (arg.required && !argRequired) {
                return failedToLoadCommand(
                    "a required arg cannot be placed after an unrequired one"
                );
            }
            if (argTypeMultiple) {
                return failedToLoadCommand(
                    'arg type "multiple" cannot be before any other arguments'
                );
            }
            if (argIds.includes(arg.id)) {
                return failedToLoadCommand("multiple args have the same name");
            }

            if (arg.type === "multiple") {
                argTypeMultiple = true;
            }
            if (!arg.required) {
                argRequired = false;
            }

            let usage = "";

            let examples: string[] | [number, number, boolean] = [];

            if (arg.type !== "customValue" && arg.customValues.length === 0) {
                examples = client.config.argExamples[arg.type];
                // prettier-ignore
                usage = arg.displayName.length !== 0 ? arg.displayName : arg.name;
            } else {
                if (arg.customValues.length === 0) {
                    return failedToLoadCommand(
                        `if an arg type is of "custom value", then there must be custom values provided`
                    );
                }
                examples = arg.customValues;
                if (arg.allowLowerCaseCustomValues) {
                    let lowerCaseArray: string[] = [];
                    // prettier-ignore
                    for (let index = 0; index < arg.customValues.length; index++){
                        lowerCaseArray.push(arg.customValues[index].toLowerCase())
                    }
                    arg.customValues = lowerCaseArray;
                }
                const lastWord = arg.customValues[arg.customValues.length - 1];
                const lastWordLength = lastWord.length;
                let options: string;
                if (arg.customValues.length === 1) {
                    options = `"${lastWord}"`;
                } else {
                    options = `"${arg.customValues
                        .join('", "')
                        .slice(0, lastWordLength * -1 - 3)} or "${lastWord}"`;
                }
                if (arg.type !== "customValue") {
                    options = `${arg.type} or ${options}`;

                    for (const normalExample of client.config.argExamples[arg.type]) {
                        if (typeof normalExample === "string")
                            examples.push(normalExample);
                    }
                }
                usage = `${
                    arg.displayName
                        ? `${arg.displayName}: ${options}`
                        : `${arg.name}: ${options}`
                }`;
            }

            if (arg.required) {
                command.usage.push(
                    `${client.config.requiredArgKeys[0]}${usage}${client.config.requiredArgKeys[1]}`
                );
            } else {
                command.usage.push(
                    `${client.config.unrequiredArgKeys[0]}${usage}${client.config.unrequiredArgKeys[1]}`
                );
            }

            command.examples.push(examples);

            argIds.push(arg.id);
        }

        const isLower = (str: string) => {
            return /[a-z]/.test(str) && !/[A-Z]/.test(str);
        };

        const isValidCommandName = (name: string) => {
            return isLower(name) || name.includes(" ");
        };

        if (!isValidCommandName(command.name)) {
            // prettier-ignore
            return failedToLoadCommand("a command name must be all lowercase and have no spaces");
        }

        if (client.aliases.has(command.name)) {
            // prettier-ignore
            return failedToLoadCommand("the command name has already been used as an alias")
        }

        const isValidAlias = (alias: string) => {
            if (client.aliases.has(alias) || client.commands.has(alias)) {
                // prettier-ignore
                client.console.warn(`Failed to load alias: "${alias}", from command: "${command.name}" as it has been used before, either as an alias or command`);
                return false;
            }
            if (!isValidCommandName(alias)) {
                // prettier-ignore
                client.console.warn(`Failed to load alias: "${alias}", from command: "${command.name}", a command alias must have no spaces and be all lower case`);
                return false;
            }
            return true;
        };

        for (const alias of command.aliases) {
            if (!isValidAlias(alias)) continue;
            client.aliases.set(alias, command);
        }

        for (const alias of command.hiddenAliases) {
            if (!isValidAlias(alias)) continue;
            client.aliases.set(alias, command);
        }

        if (typeof command.category === "string") {
            if (command.category.length === 0) {
                for (let i = 0; i < this.loadedCategoryDirs.length; i++) {
                    const categoryDir = this.loadedCategoryDirs[i];
                    const categoryName = this.loadedCategoryNames[i];

                    const splitCommandDir = command.dir.split(path.sep);
                    splitCommandDir.pop();

                    if (categoryDir === splitCommandDir.join(path.sep)) {
                        command.category = categoryName;
                        command.categoryName = categoryName;
                        command.categoryId = client.utils.generateId(categoryName);
                        break;
                    } else {
                        if (i === this.loadedCategoryDirs.length - 1) {
                            client.console.debug(
                                `Command: ${command.name}'s folder has no category file`
                            );
                        }
                        command.categoryName = false;
                        command.categoryId = false;
                    }
                }
            } else {
                const newCategory = new Category(command.category);
                newCategory.setRegistered();
                client.categories.set(command.category, newCategory);
                this.loadCategories();

                command.categoryName = command.category;
                command.categoryId = newCategory.id;
            }
        } else if (typeof command.category !== "boolean") {
            const categoryName = command.category[0];
            const categoryDescription = command.category[1];

            const findCategory = client.categories.get(categoryName);

            command.categoryName = categoryName;
            command.categoryId = client.utils.generateId(categoryName);

            if (findCategory) {
                findCategory.description = categoryDescription;
                command.category = categoryName;
            } else {
                const newCategory = new Category(categoryName);
                newCategory.setRegistered();
                newCategory.description = categoryDescription;
                client.categories.set(categoryName, newCategory);
                this.loadCategories();
            }
        } else {
            command.categoryName = false;
            command.categoryId = false;
        }

        let commandClientPermissions: Permission[] = [];
        let commandUserPermissions: Permission[] = [];

        let commandClientChecks: string[] = [];
        let commandUserChecks: string[] = [];

        const pushArrayToArray = (array: any[], arrayToPush: any[]): typeof array[0] => {
            for (const element of arrayToPush) {
                array.push(element);
            }
        };

        if (!command.overideDefaultClientPermissions) {
            commandClientPermissions = client.config.defaultClientPermissions;
        }

        if (!command.overideDefaultUserPermissions) {
            commandUserPermissions = client.config.defaultUserPermissions;
        }

        if (!command.overideDefaultClientChecks) {
            commandClientChecks = client.config.defaultClientChecks;
        }

        if (!command.overideDefaultUserChecks) {
            commandClientChecks = client.config.defaultUserChecks;
        }

        if (!command.overideConstraints && command.categoryName) {
            const category = client.categories.get(command.categoryName);

            if (category) {
                // prettier-ignore
                pushArrayToArray(commandClientPermissions, category.clientPermissions)
                // prettier-ignore
                pushArrayToArray(commandUserPermissions, category.userPermissions)

                // prettier-ignore
                pushArrayToArray(commandUserChecks, category.userChecks)
                // prettier-ignore
                pushArrayToArray(commandClientChecks, category.clientChecks)

                if (category.guildOnly) command.guildOnly = category.guildOnly;
                if (category.developerOnly)
                    command.developerOnly = category.developerOnly;
                if (category.hidden) command.hidden = category.hidden;
                if (category.overideGuildBlacklist)
                    command.overideGuildBlacklist = category.overideGuildBlacklist;
                if (category.overideUserBlacklist)
                    command.overideUserBlacklist = category.overideUserBlacklist;
                if (category.overideLoadSlashCommand)
                    command.overideLoadSlashCommand = category.overideLoadSlashCommand;
            }
        } else {
            // prettier-ignore
            pushArrayToArray(commandUserPermissions, command.userPermissions)
            // prettier-ignore
            pushArrayToArray(commandUserPermissions, command.clientPermissions)
        }

        command.clientPermissions = commandClientPermissions;
        command.userPermissions = commandUserPermissions;
        command.clientChecks = commandClientChecks;
        command.userChecks = commandUserChecks;

        for (const check of commandClientChecks) {
            if (!client.checks.isClientCheck(check)) {
                return failedToLoadCommand(
                    `Client check: ${check} for command ${command.name} is nor a valid client check`
                );
            }
        }

        for (const check of commandUserChecks) {
            if (!client.checks.isUserCheck(check)) {
                return failedToLoadCommand(
                    `User check: ${check} for command ${command.name} is nor a valid client check`
                );
            }
        }

        command.setLoaded();

        return true;
    }

    public loadCommands() {
        for (const command of this.client.commands) {
            this.loadCommand(command[1]);
        }
    }

    private async runCommandChecks(
        returnCommand: ReturnCommand
    ): Promise<boolean | [string, string]> {
        const guild = returnCommand.getGuild();
        const author = returnCommand.getAuthor();
        const channel = returnCommand.getChannel();
        const member = returnCommand.getMember();

        const { commandClass: command } = returnCommand;

        const { client } = this;

        const { responses } = client.config;

        const returnMessage = (
            responses: [string[], string[] | null],
            values?: [string, string][]
        ) => {
            return this.returnMessage(command, responses, values);
        };

        const hasPermission = (
            permissionArray: Permission[],
            member: GuildMember,
            channel?: TextBasedChannels,
            ignoreMessagePermissions?: boolean
        ): true | [false, string] => {
            for (const permission of permissionArray) {
                if (
                    ignoreMessagePermissions &&
                    (permission === "VIEW_CHANNEL" || permission === "SEND_MESSAGES")
                ) {
                    continue;
                }
                if (
                    channel &&
                    channel.type !== "DM" &&
                    !member.permissionsIn(channel).has(permission)
                ) {
                    return [false, permission];
                } else if (!channel && !member.permissions.has(permission)) {
                    return [false, permission];
                }
            }
            return true;
        };

        const blacklist = await client.blacklists.isBlacklisted(author.id);

        if (!command.overideUserBlacklist && blacklist[0] === true) {
            if (!!blacklist[1] && blacklist[1] !== "No reason provided") {
                return returnMessage(responses.blacklistedUser, [
                    ["reason", blacklist[1]]
                ]);
            } else {
                return returnMessage(responses.blacklistedUserNoReason);
            }
        }

        if (
            client.disabledCommands.getDisabledItem(command.name) ||
            (command.categoryName &&
                client.disabledCommands.getDisabledItem(command.categoryName))
        )
            return returnMessage(responses.disabledCommand);

        if (command.guildOnly && !guild) return returnMessage(responses.guildOnly);

        // prettier-ignore
        if (command.developerOnly && !client.config.botDevelopers.includes(author.id))
            return returnMessage(responses.developerOnly);

        if (guild && channel) {
            if (guild.me) {
                const permission = hasPermission(
                    command.clientPermissions,
                    guild.me,
                    channel,
                    true
                );
                if (permission !== true) {
                    return returnMessage(responses.missingClientPermissions, [
                        ["permission", permission[1].toLowerCase().replace(/_/g, " ")]
                    ]);
                }
            }
            if (member) {
                //prettier-ignore
                const permission = hasPermission( command.userPermissions, member)

                if (permission !== true) {
                    return returnMessage(responses.missingUserPermissions, [
                        ["permission", permission[1].toLowerCase().replace(/_/g, " ")]
                    ]);
                }
            }
            const blacklist = await client.blacklists.isBlacklisted(guild.id);

            if (!command.overideGuildBlacklist && blacklist[0] === true) {
                if (!client.blacklists.isUnblacklistable(author.id)) {
                    if (!!blacklist[1] && blacklist[1] !== "No reason provided") {
                        return returnMessage(responses.blacklistedGuild, [
                            ["reason", blacklist[1]]
                        ]);
                    } else {
                        return returnMessage(responses.blacklistedGuildNoReason);
                    }
                } else {
                    await returnCommand.sendMessage("This server is blacklisted");
                }
            }

            if (
                command.certainGuildsOnly.length !== 0 &&
                !command.certainGuildsOnly.includes(guild.id)
            ) {
                return returnMessage(responses.incorrectGuild);
            }

            if (
                command.certainChannelsOnly.length !== 0 &&
                !command.certainChannelsOnly.includes(channel.id)
            )
                return returnMessage(responses.incorrectChannel);

            if (command.certainRolesOnly.length !== 0 && member) {
                const rolesArray = [...member.roles.cache].map(([name]) => name);

                let hasValidRole = false;
                for (const role of rolesArray) {
                    if (command.certainRolesOnly.includes(role)) {
                        hasValidRole = true;
                    }
                }

                if (!hasValidRole && !member.permissions.has("ADMINISTRATOR")) {
                    return returnMessage(responses.missingRoles);
                }
            }
        }

        const runCheck = async (checkID: string, type: "client" | "user") => {
            const checkOptions: checkOptions = {
                user: author
            };

            if (channel && channel.type !== "DM") {
                checkOptions.channel = channel;
            }

            if (guild) {
                checkOptions.guild = guild;
            }

            if (member) {
                checkOptions.member = member;
            }

            // prettier-ignore
            let doCheck = await client.checks.runCheck( checkID , checkOptions, type );

            return doCheck;
        };

        for (const check of command.clientChecks) {
            const doCheck = await runCheck(check, "client");
            if (!doCheck) {
                return false;
            }
        }

        for (const check of command.userChecks) {
            const doCheck = await runCheck(check, "user");
            if (!doCheck) {
                return false;
            }
        }

        const commandCooldown = command.getCooldownNumber();

        if (commandCooldown[0] !== 0 && commandCooldown[1] !== 0) {
            const activeCooldowns = command.activeCooldowns.get(author.id);

            if (activeCooldowns) {
                activeCooldowns.push(Date.now());

                let totalActiveCooldowns = 0;

                activeCooldowns.filter((value) => {
                    const timeDifference = Date.now() - value;

                    return commandCooldown[0] > timeDifference;
                });

                for (const cooldown of activeCooldowns) {
                    const timeDifference = Date.now() - cooldown;

                    if (commandCooldown[0] > timeDifference) {
                        totalActiveCooldowns++;
                    }
                }

                if (totalActiveCooldowns >= commandCooldown[1]) {
                    return returnMessage(responses.cooldown, [
                        ["period", this.client.utils.msToTime(commandCooldown[0])],
                        ["amount", commandCooldown[1].toString()]
                    ]);
                }
            } else {
                command.activeCooldowns.set(author.id, [Date.now()]);
            }
        }

        return true;
    }

    private returnMessage(
        command: Command,
        responses: [string[], string[] | null],
        values: [string, string][] = []
    ): [string, string] {
        const getReturnMessage = this.client.utils.returnMessage(responses, values);
        return [
            getReturnMessage[0].replace(/%COMMAND/g, command.name),
            getReturnMessage[1]
                ? getReturnMessage[1].replace(/%COMMAND/g, command.name)
                : ""
        ];
    }

    public async getPrefix(message: Message): Promise<string | false | null> {
        const { client } = this;

        if (client.user && message.content.startsWith(`<@!${client.user.id}>`)) {
            return `<@!${client.user.id}>`;
        }
        if (message.guild && client.getConnected()) {
            const cachedGuildPrefix = client.cachedGuildPrefixes.get(message.guild.id);
            if (cachedGuildPrefix) {
                if (message.content.startsWith(cachedGuildPrefix)) {
                    return cachedGuildPrefix;
                } else {
                    return false;
                }
            } else {
                const findGuildPrefix = await GuildPrefixModel.findById(message.guild.id);
                if (findGuildPrefix) {
                    client.cachedGuildPrefixes.set(
                        message.guild.id,
                        findGuildPrefix.guildPrefix
                    );
                    if (message.content.startsWith(findGuildPrefix.guildPrefix)) {
                        return findGuildPrefix.guildPrefix;
                    }
                }
            }
        }
        if (client.getConnected()) {
            const globalPrefixConfiguration = client.configurations.get("GLOBAL_PREFIX");

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

    // prettier-ignore
    public async startsWithPrefix(message: Message, prefix?: string | false | null): Promise<boolean> {
        if(!prefix){
            const prefix = await this.getPrefix(message);
            return !!prefix || prefix === null;
        }

        return !!prefix || prefix === null;
    }

    // prettier-ignore
    public async getArgs(message: Message, prefix?: string | false | null): Promise<string[]> {
        let messagePrefix: string | false | null;

        if(!!prefix){
            messagePrefix = prefix
        } else {
            messagePrefix = await this.getPrefix(message);
        }

        if (messagePrefix) {
            return message.content.slice(messagePrefix.length).trim().split(/ +/g);
        } else if (prefix === null) {
            return message.content.split(/ +/g);
        } else {
            return [];
        }
    }

    // prettier-ignore
    public async hasRanCommand(message: Message, prefix?: string | false | null): Promise<boolean> {
        if (!(await this.startsWithPrefix(message, prefix))) {
            return false;
        }

        const args = await this.getArgs(message, prefix);
       
        if (
            !this.client.commands.has(args[0].toLowerCase()) &&
            !this.client.aliases.has(args[0].toLowerCase())
        )
            return false;

        return true;
    }

    public async getCommand(message: Message): Promise<false | Command> {
        const prefix = await this.getPrefix(message);

        if (!(await this.hasRanCommand(message, prefix))) {
            return false;
        }

        const args = await this.getArgs(message, prefix);

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

    private timeEndings: TimeEnding[] = [
        ["seconds", "SECONDS", 1000],
        ["minutes", "MINUTES", 1000 * 60],
        ["hours", "HOURS", 1000 * 60 * 60],
        ["days", "DAYS", 1000 * 60 * 60 * 24],
        ["weeks", "WEEKS", 1000 * 60 * 60 * 24 * 7],
        ["months", "MONTHS", 1000 * 60 * 60 * 24 * 30],
        ["years", "YEARS", 1000 * 60 * 60 * 24 * 365],
        ["s", "SECONDS", 1000],
        ["m", "MINUTES", 1000 * 60],
        ["h", "HOURS", 1000 * 60 * 60],
        ["d", "DAYS", 1000 * 60 * 60 * 24],
        ["w", "WEEKS", 1000 * 60 * 60 * 24 * 7],
        ["y", "YEARS", 1000 * 60 * 60 * 24 * 265]
    ];

    public async getArguments(
        returnCommand: ReturnCommand
    ): Promise<[true, Argument[]] | [false, string, string]> {
        let returnArgs: Argument[] = [];

        const { commandRan, commandClass: command } = returnCommand;

        if (commandRan instanceof Message) {
            const prefix = (await this.getPrefix(commandRan)) as string;
            const args = await this.getArgs(commandRan, prefix);

            returnCommand.prefixUsed = prefix;

            let commandRanName = args[0];

            const incorrectUsage = (): [false, string, string] => {
                return [false, prefix, commandRanName];
            };

            args.shift();

            for (let index = 0; index < command.args.length; index++) {
                const requiredArg = command.args[index];
                const providedArg = args[index];

                if (requiredArg.type === "multiple") {
                    // prettier-ignore
                    const wantedArgs = args.splice(index, args.length - index)

                    if (wantedArgs.length === 0) {
                        if (requiredArg.required) {
                            return incorrectUsage();
                        }
                    } else {
                        requiredArg.setStringArrayValue(wantedArgs);
                        requiredArg.setTextValue(wantedArgs.join(" "));
                        returnArgs.push(requiredArg);
                    }

                    continue;
                }

                if (requiredArg.required && !providedArg) {
                    return incorrectUsage();
                }

                if (!providedArg) {
                    continue;
                }

                const lookForMention = async (
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
                            requiredArg.setTextValue(mention.id);
                            // prettier-ignore
                            if (mentionToLookFor === "users" && mention instanceof User){
                                requiredArg.setUserMention(mention)
                            } else if (mentionToLookFor === "channels" && mention instanceof Channel){
                                requiredArg.setChannelMention(mention)
                            } else if (mentionToLookFor === "members" && mention instanceof GuildMember){
                                requiredArg.setMemberMention(mention)
                            }
                            return requiredArg;
                        }
                    } else if (mentionToLookFor !== "users" && guild) {
                        const findMention = await guild[mentionToLookFor].fetch(text);

                        if (!findMention) {
                            return false;
                        }

                        requiredArg.setStringValue(findMention.id);

                        if (
                            mentionToLookFor === "channels" &&
                            findMention instanceof Channel
                        ) {
                            requiredArg.setChannelMention(findMention);
                        } else if (
                            mentionToLookFor === "members" &&
                            findMention instanceof GuildMember
                        ) {
                            requiredArg.setMemberMention(findMention);
                        }
                        return requiredArg;
                    } else if (mentionToLookFor === "users") {
                        const findUser = this.client.users.cache.get(text);

                        if (!findUser) {
                            return false;
                        }

                        requiredArg.setStringValue(findUser.id);
                        requiredArg.setUserMention(findUser);

                        return requiredArg;
                    }
                    return false;
                };

                requiredArg.setStringValue(providedArg);

                if (requiredArg.type === "single") {
                    requiredArg.setStringValue(providedArg);
                    returnArgs.push(requiredArg);
                } else if (requiredArg.type === "interger") {
                    const argNumber = parseInt(providedArg);
                    if (isNaN(argNumber) && requiredArg.required) {
                        return incorrectUsage();
                    }
                    requiredArg.setStringValue(argNumber.toString());
                    requiredArg.setNumberValue(argNumber);
                    returnArgs.push(requiredArg);
                } else if (requiredArg.type === "number") {
                    const argNumber = parseFloat(providedArg);
                    if (isNaN(argNumber) && requiredArg.required) {
                        return incorrectUsage();
                    }
                    requiredArg.setStringValue(argNumber.toString());
                    requiredArg.setNumberValue(argNumber);
                    returnArgs.push(requiredArg);
                } else if (requiredArg.type === "channelMention") {
                    const findChannel = await lookForMention(providedArg, "channels");
                    if (!findChannel) return incorrectUsage();
                    returnArgs.push(findChannel);
                } else if (requiredArg.type === "memberMention") {
                    const findMember = await lookForMention(providedArg, "members");
                    if (!findMember) return incorrectUsage();
                    returnArgs.push(findMember);
                } else if (requiredArg.type === "userMention") {
                    const findUser = await lookForMention(providedArg, "users");
                    if (!findUser) return incorrectUsage();
                    returnArgs.push(findUser);
                } else if (requiredArg.type === "customValue") {
                    // prettier-ignore
                    let argToLookFor = requiredArg.allowLowerCaseCustomValues ? providedArg.toLowerCase() : providedArg;

                    if (!requiredArg.customValues.includes(argToLookFor)) {
                        return incorrectUsage();
                    }
                    requiredArg.setStringValue(argToLookFor);
                    returnArgs.push(requiredArg);
                } else if (requiredArg.type === "time") {
                    if (requiredArg.customValues) {
                        let argToLookFor = requiredArg.allowLowerCaseCustomValues
                            ? providedArg.toLowerCase()
                            : providedArg;

                        if (requiredArg.customValues.includes(argToLookFor)) {
                            requiredArg.setStringValue(providedArg);
                            returnArgs.push(requiredArg);
                            continue;
                        }
                    }

                    const remainingArgs = args.splice(index, args.length - index);
                    const endsWithTimeEnding = (string: string, nextArg = false) => {
                        if (!/\d/.test(string)) return false;

                        for (const ending of this.timeEndings) {
                            if (string === ending[0]) {
                                return ending;
                            } else if (string.endsWith(ending[0]) && !nextArg) {
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
                            timeEndingNextArg = endsWithTimeEnding(nextArg, true);
                        }

                        if (timeEndingArg === false && timeEndingNextArg === false) {
                            return false;
                        } else if (timeEndingArg) {
                            return [
                                false,
                                timeEndingArg[0],
                                timeEndingArg[1],
                                timeEndingArg[2]
                            ];
                        } else if (timeEndingNextArg) {
                            return [
                                true,
                                timeEndingNextArg[0],
                                timeEndingNextArg[1],
                                timeEndingNextArg[2]
                            ];
                        } else {
                            return false;
                        }
                    };

                    let timeMentions: [string, ReturnTime][] = [];
                    for (let i = 0; i < remainingArgs.length; i++) {
                        const remainingArg = remainingArgs[i].toLowerCase();
                        const endsWithEnding = endsWithOrNextArg(i);

                        if (!endsWithEnding) {
                            break;
                        }

                        if (endsWithEnding[0] === true) {
                            i++;
                            args.push(remainingArgs[i]);
                        }

                        timeMentions.push([remainingArg, endsWithEnding]);
                    }

                    for (const arg of remainingArgs) {
                        args.push(arg);
                    }

                    let timeArg = ``;

                    for (let i = 0; i < timeMentions.length; i++) {
                        timeArg += `${remainingArgs[i]} `;
                    }

                    for (let j = 0; j < timeMentions.length - 1; j++) {
                        let tmp = args.shift();
                        args[j] = tmp ? tmp : "";
                    }

                    args[index] = timeArg;

                    requiredArg.setTextValue(timeArg);
                    requiredArg.setStringValue(timeArg);

                    if (timeMentions.length === 0) {
                        return incorrectUsage();
                    }

                    let totalTime = 0;
                    for (const time of timeMentions) {
                        const duration: string = time[0].replace(/\D/g, "");

                        console.log(time);

                        const timeOptions = time[1];
                        if (duration.length === 0) {
                            return incorrectUsage();
                        }

                        const durationNumber = parseFloat(duration);
                        totalTime += durationNumber * timeOptions[3];
                    }

                    requiredArg.setNumberValue(totalTime);
                    returnArgs.push(requiredArg);
                }
            }
        } else {
            const incorrectUsage = (): [false, string, string] => {
                return [false, "/", commandRan.commandName];
            };

            returnCommand.prefixUsed = "/";

            for (const providedArg of commandRan.options.data) {
                let requiredArg: Argument = command.args.filter((arg) => {
                    return arg.name === providedArg.name;
                })[0];

                if (providedArg.value) {
                    if (requiredArg.type === "single") {
                        const value = providedArg.value.toString().split(/ +/)[0];

                        requiredArg.setTextValue(value);
                        requiredArg.setStringValue(value);

                        returnArgs.push(requiredArg);
                    } else if (requiredArg.type === "multiple") {
                        requiredArg.setTextValue(providedArg.value.toString());
                        requiredArg.setStringArrayValue(
                            providedArg.value.toString().split(/[ +]/g)
                        );
                        returnArgs.push(requiredArg);
                    } else if (
                        requiredArg.type === "channelMention" &&
                        providedArg.channel
                    ) {
                        if (!(providedArg.channel instanceof Channel)) continue;

                        requiredArg.setChannelMention(providedArg.channel);
                        requiredArg.setTextValue(providedArg.channel.id);
                        returnArgs.push(requiredArg);
                    } else if (requiredArg.type === "number") {
                        if (typeof providedArg.value !== "number") continue;

                        requiredArg.setNumberValue(providedArg.value);
                        requiredArg.setTextValue(providedArg.value.toString());
                        returnArgs.push(requiredArg);
                    } else if (requiredArg.type === "interger") {
                        if (typeof providedArg.value !== "number") continue;

                        requiredArg.setTextValue(providedArg.value.toString());
                        requiredArg.setNumberValue(Math.floor(providedArg.value));
                        returnArgs.push(requiredArg);
                    } else if (requiredArg.type === "memberMention") {
                        if (!(providedArg.member instanceof GuildMember)) continue;

                        requiredArg.setTextValue(providedArg.value.toString());
                        requiredArg.setMemberMention(providedArg.member);
                        returnArgs.push(requiredArg);
                    } else if (requiredArg.type === "userMention") {
                        if (!providedArg.user) continue;
                        requiredArg.setTextValue(providedArg.value.toString());
                        requiredArg.setUserMention(providedArg.user);
                        returnArgs.push(requiredArg);
                    } else if (requiredArg.type === "customValue") {
                        if (
                            !requiredArg.customValues ||
                            typeof providedArg.value !== "string"
                        ) {
                            continue;
                        }
                        if (requiredArg.allowLowerCaseCustomValues) {
                            // prettier-ignore
                            if(!requiredArg.customValues.includes(providedArg.value.toLowerCase())){
                                return incorrectUsage()
                            }
                            requiredArg.setTextValue(providedArg.value.toLowerCase());
                            requiredArg.setStringValue(providedArg.value.toLowerCase());
                            returnArgs.push(requiredArg);
                        } else {
                            // prettier-ignore
                            if(!requiredArg.customValues.includes(providedArg.value)){
                                return incorrectUsage()
                            }
                            requiredArg.setTextValue(providedArg.value);
                            requiredArg.setStringValue(providedArg.value);
                            returnArgs.push(requiredArg);
                        }
                    } else {
                        const timeMentionArray = providedArg.value.toString().split(/ +/);

                        const endsWithTimeEnding = (string: string) => {
                            for (const ending of this.timeEndings) {
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
                            const arg = timeMentionArray[indexNumber].toLowerCase();
                            let nextArg = timeMentionArray[indexNumber + 1];

                            if (nextArg) {
                                nextArg = nextArg.toLowerCase();
                            }

                            const timeEndingArg = endsWithTimeEnding(arg);
                            let timeEndingNextArg: false | TimeEnding = false;

                            if (!!nextArg) {
                                timeEndingNextArg = endsWithTimeEnding(nextArg);
                            }

                            if (timeEndingArg === false && timeEndingNextArg === false) {
                                return false;
                            } else if (timeEndingArg) {
                                return [
                                    false,
                                    timeEndingArg[0],
                                    timeEndingArg[1],
                                    timeEndingArg[2]
                                ];
                            } else if (timeEndingNextArg) {
                                return [
                                    true,
                                    timeEndingNextArg[0],
                                    timeEndingNextArg[1],
                                    timeEndingNextArg[2]
                                ];
                            } else {
                                return false;
                            }
                        };

                        let timeMentions: [string, ReturnTime][] = [];

                        for (let i = 0; i < timeMentionArray.length; i++) {
                            const remainingArg = timeMentionArray[i].toLowerCase();
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
                            return incorrectUsage();
                        }

                        let totalTime = 0;
                        for (const time of timeMentions) {
                            const duration: string = time[0].replace(/\D/g, "");
                            const timeOptions = time[1];
                            if (duration.length === 0) {
                                return incorrectUsage();
                            }
                            const durationNumber = parseFloat(duration);
                            totalTime += durationNumber * timeOptions[3];
                        }
                        requiredArg.setTextValue(providedArg.value.toString());
                        requiredArg.setNumberValue(totalTime);
                        returnArgs.push(requiredArg);
                    }
                }
            }
        }

        return [true, returnArgs];
    }

    public async runCommand(command: Command, commandRan: Message | CommandInteraction) {
        const { client } = this;

        let returnCommand = new ReturnCommand(commandRan, command, client);

        if (returnCommand.isInteraction(commandRan) && command.deferResponse) {
            await commandRan.deferReply();
            returnCommand.setRepliedTo();
        }

        let commandChecks = await this.runCommandChecks(returnCommand);

        if (typeof commandChecks !== "boolean") {
            return returnCommand.sendError(commandChecks[0], commandChecks[1]);
        } else if (commandChecks === false) {
            return;
        }

        let returnArgs = await this.getArguments(returnCommand);

        if (returnArgs[0] === false) {
            let clientUserName = "";

            if (client.user) {
                clientUserName = client.user.username;
            } else {
                clientUserName = "argsplus";
            }

            return returnCommand.sendError(
                ...this.returnMessage(command, client.config.responses.incorrectArgs, [
                    ["usage", command.getUsage(returnArgs[2], returnArgs[1])],
                    [
                        "required arg key",
                        `${client.config.requiredArgKeys.join("")} = Required`
                    ],
                    [
                        "unrequired arg key",
                        `${client.config.requiredArgKeys.join("")} = Unrequired`
                    ],
                    // prettier-ignore
                    ["examples", command.getExample(returnArgs[2], returnArgs[1], client.config.amountOfExamples)],
                    ["client", `@${clientUserName}`]
                ])
            );
        }

        for (const preRunFunction of this.client.preCommandFunctions) {
            const runFunction = await preRunFunction.run(this.client, returnCommand);

            if (runFunction === false) {
                return;
            }
        }

        returnCommand.args = returnArgs[1];

        try {
            await command.run(this.client, returnCommand);
        } catch (error: any) {
            this.client.console.error(error);

            const errorMessage = this.returnMessage(
                command,
                this.client.config.responses.errorInCommand,
                [["error", error]]
            );

            returnCommand.sendError(...errorMessage);

            if (this.client.config.autoRemoveCommands && !command.overideAutoRemove) {
                await this.client.disabledCommands.disableItem(
                    command.name,
                    true,
                    undefined,
                    error
                );
            }
        }

        for (const postRunFunction of this.client.postCommandFunctions) {
            await postRunFunction.run(this.client, returnCommand);
        }
    }
}
