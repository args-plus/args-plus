import defaultConfigJSON from "../../default.config.json";
import configJSON from "../../../config.json";
import { Config } from "../../Interaces";
import { Command, Command as CommandClass } from "../Commands/command";
import ExtendedClient from "..";
import dotEnv from "dotenv";
import path from "path";
import { Check } from "../Commands/checks";
import { Event } from "../Events/event";
import {
    ApplicationCommandData,
    ApplicationCommandOptionData,
    ChatInputApplicationCommandData,
} from "discord.js";
import fs from "fs";
import { Extension } from "../Extensions/extension";

export class Loader {
    public client: ExtendedClient;

    public loadSettings(): false | Config {
        dotEnv.config({ path: path.join(__dirname, "..", "..", "..", ".env") });

        if (
            !process.env.token ||
            !process.env.mongoURI ||
            !configJSON.hasOwnProperty("prefix")
        ) {
            return false;
        }

        let config: Config = {
            token: process.env.token,
            mongoURI: process.env.mongoURI,
            prefix: configJSON.prefix,
        };

        let configJSONRemovedProperties = configJSON;

        delete configJSONRemovedProperties.prefix;

        let allSame = true;

        for (const property in configJSONRemovedProperties) {
            if (
                configJSONRemovedProperties[property] !==
                    defaultConfigJSON[property] &&
                typeof configJSONRemovedProperties[property] !== "object"
            ) {
                allSame = false;
            }
        }

        if (
            allSame &&
            configJSONRemovedProperties.hasOwnProperty("configureBotWarning") &&
            configJSONRemovedProperties.configureBotWarning === true
        ) {
            console.warn(
                'Warning: The bot has only been configured to default settings in config.json.\nChange settings or change the "configureBotWarning" setting to false to disable this warning'
            );
        }

        for (const property in configJSON) {
            if (configJSON[property] !== defaultConfigJSON[property]) {
                config[property] = configJSON[property];
            } else {
                config[property] = defaultConfigJSON[property];
            }
        }

        return config;
    }
    public loadCommand(dir: string | Command) {
        let command: CommandClass;

        if (typeof dir === "string") {
            const { command: requireCommand } = require(dir);
            if (!(requireCommand instanceof Command)) {
                return this.client.messageHandler.warn(
                    `Command file: "${dir}" is not a valid command!`,
                    true,
                    "COMMAND"
                );
            }

            command = requireCommand;
        } else {
            command = dir;
        }

        if (!command.name || !command.run) {
            return this.client.messageHandler.warn(
                `Command file: "${dir}" doesnt have a name or a run function!`,
                true,
                "COMMAND"
            );
        }

        let usage: string[] = [];

        if (command.args) {
            let argTypeMultiple = false;
            let argNames = [];
            let argIds = [];
            let argRequired = true;
            let timeArg = false;
            for (const arg of command.args) {
                if (arg.required === true && argRequired === false) {
                    return this.client.messageHandler.warn(
                        `Command file: "${dir}". A required arg cannot be after a unrequired arg!`,
                        true,
                        "COMMAND"
                    );
                }
                if (argTypeMultiple) {
                    return this.client.messageHandler.warn(
                        `Command file: "${dir}". Arg type "multiple" cannot be before any other arguments`,
                        true,
                        "COMMAND"
                    );
                }
                if (argNames.includes(arg.name)) {
                    return this.client.messageHandler.warn(
                        `Command file: "${dir}". Multiple args have the same name`,
                        true
                    );
                }
                if (argIds.includes(arg.id)) {
                    return this.client.messageHandler.warn(
                        `Command file: "${dir}". Multiple args have the same ID`,
                        true,
                        "COMMAND"
                    );
                }
                if (arg.type === "time" && timeArg) {
                    return this.client.messageHandler.warn(
                        `Command file: "${dir}". Arg type "TIME" cannot be followed by another time argument`,
                        true,
                        "COMMAND"
                    );
                }

                if (!arg.id) {
                    arg.id = arg.name.toUpperCase().replace(/[ ]/g, "_");
                    this.client.messageHandler.debug(
                        `Command: "${command.name}" Arg: "${arg.name}", ID set to ${arg.id}`
                    );
                }

                if (arg.type === "multiple") {
                    argTypeMultiple = true;
                }

                if (arg.type === "time") {
                    timeArg = true;
                } else {
                    timeArg = false;
                }

                if (!arg.required) {
                    argRequired = false;
                }

                if (arg.required) {
                    usage.push(
                        `<${arg.displayName ? arg.displayName : arg.name}>`
                    );
                } else {
                    usage.push(
                        `(${arg.displayName ? arg.displayName : arg.name})`
                    );
                }
                argNames.push(arg.name);
            }
        }

        const isLower = (str: string) => {
            return /[a-z]/.test(str) && !/[A-Z]/.test(str);
        };

        if (!isLower(command.name)) {
            this.client.messageHandler.warn(
                `Command name: "${
                    command.name
                }" must be all lower case! Name changed to: "${command.name.toLowerCase()}"`
            );
            command.name = command.name.toLowerCase();
        }

        if (this.client.commands.get(command.name)) {
            return this.client.messageHandler.warn(
                `Command name: "${command.name}" from file "${dir}" has been used multiple times!`,
                true,
                "COMMAND"
            );
        }
        if (this.client.aliases.get(command.name)) {
            return this.client.messageHandler.warn(
                `Command name: "${command.name}" from file "${dir}" is already an alias!`,
                true,
                "COMMAND"
            );
        }

        if (command.aliases) {
            let commandAliases = [];
            let index = 0;
            for (const alias of command.aliases) {
                if (commandAliases.includes(alias)) {
                    return this.client.messageHandler.warn(
                        `Command aliases for command: "${command.name}" have multiple of the same alias`,
                        true,
                        "COMMAND"
                    );
                }
                if (this.client.aliases.get(alias)) {
                    return this.client.messageHandler.warn(
                        `Command alias: "${alias}" from file "${dir}" has been used multiple times!`,
                        true,
                        "COMMAND"
                    );
                }
                if (this.client.commands.get(alias)) {
                    return this.client.messageHandler.warn(
                        `Command alias: "${alias}" from file "${dir}" is already a command!`,
                        true,
                        "COMMAND"
                    );
                }
                if (!isLower(alias)) {
                    this.client.messageHandler.warn(
                        `Command alias: "${alias}" must be all lower case! Alias changed to: "${alias.toLowerCase()}"`
                    );
                    command.aliases[index] = alias.toLowerCase();
                    commandAliases.push(alias.toLowerCase());
                    continue;
                }

                commandAliases.push(alias);
            }
        }

        if (command.clientPermissions) {
            if (typeof command.clientPermissions === "string") {
                command.clientPermissions = [command.clientPermissions];
            }
            for (const permission of command.clientPermissions) {
                if (!this.client.utils.validPermissions.includes(permission)) {
                    return this.client.messageHandler.warn(
                        `this.client permission: "${permission}" from command "${command.name}" is not a valid permission flag!`,
                        true,
                        "COMMAND"
                    );
                }
            }
        }

        if (command.userPermissions) {
            if (typeof command.userPermissions === "string") {
                command.userPermissions = [command.userPermissions];
            }

            for (const permission of command.userPermissions) {
                if (!this.client.utils.validPermissions.includes(permission)) {
                    return this.client.messageHandler.warn(
                        `User permission: "${permission}" from command "${command.name}" is not a valid permission flag!`,
                        true,
                        "COMMAND"
                    );
                }
            }
        }

        if (command.userChecks) {
            for (const check of command.userChecks) {
                if (!this.client.clientChecks.has(check)) {
                    return this.client.messageHandler.warn(
                        `User check: "${check}" from command "${command.name}" is not a valid check ID`,
                        true,
                        "COMMAND"
                    );
                }
            }
        }

        if (command.clientChecks) {
            for (const check of command.clientChecks) {
                if (!this.client.clientChecks.has(check)) {
                    return this.client.messageHandler.warn(
                        `this.client check: "${check}" from command "${command.name}" is not a valid check ID`,
                        true,
                        "COMMAND"
                    );
                }
            }
        }

        let commandConstructor = new CommandClass();
        commandConstructor.client = this.client;
        commandConstructor.name = command.name;
        commandConstructor.run = command.run;
        commandConstructor.usage = usage;
        commandConstructor.args = command.args ? command.args : [];
        commandConstructor.description = command.description
            ? command.description
            : "";
        commandConstructor.aliases = command.aliases ? command.aliases : [];
        commandConstructor.cooldown = command.cooldown
            ? command.cooldown
            : "0s";
        commandConstructor.developerOnly = command.developerOnly
            ? command.developerOnly
            : false;
        commandConstructor.guildOnly = command.guildOnly
            ? command.guildOnly
            : false;
        commandConstructor.certainChannelsOnly = command.certainChannelsOnly
            ? command.certainChannelsOnly
            : "";
        commandConstructor.certainGuildsOnly = command.certainGuildsOnly
            ? command.certainGuildsOnly
            : "";
        commandConstructor.certainRolesOnly = command.certainRolesOnly
            ? command.certainRolesOnly
            : "";
        commandConstructor.overideLoadSlashCommand =
            command.overideLoadSlashCommand
                ? command.overideLoadSlashCommand
                : false;

        commandConstructor.overideGuildBlacklist = command.overideGuildBlacklist
            ? command.overideGuildBlacklist
            : false;
        commandConstructor.overideUserBlacklist = command.overideUserBlacklist
            ? command.overideUserBlacklist
            : false;
        commandConstructor.clientPermissions = command.clientPermissions
            ? command.clientPermissions
            : "";
        commandConstructor.userPermissions = command.userPermissions
            ? command.userPermissions
            : "";
        commandConstructor.clientChecks = command.clientChecks
            ? command.clientChecks
            : "";
        commandConstructor.userChecks = command.userChecks
            ? command.userChecks
            : "";

        if (typeof dir === "string") {
            const commandPathArray = dir.split("/");
            const commandCategory =
                commandPathArray[commandPathArray.length - 2].toLowerCase();
            if (!this.client.categories.has(commandCategory)) {
                const commandCategoryPath = commandPathArray
                    .splice(0, commandPathArray.length - 1)
                    .join("/");
                if (fs.existsSync(`${commandCategoryPath}/desc.txt`)) {
                    const readFile = fs.readFileSync(
                        `${commandCategoryPath}/desc.txt`,
                        "utf8"
                    );

                    if (readFile.length === 0) {
                        this.client.messageHandler.warn(
                            `Category: "${commandCategory}"'s description file has no description`,
                            true,
                            "CATEGORY"
                        );
                    } else if (readFile.length > 300) {
                        this.client.messageHandler.warn(
                            `Category: "${commandCategory}"'s description file is too long!`,
                            true,
                            "CATEGORY"
                        );
                    } else {
                        this.client.categories.set(commandCategory, readFile);
                        this.client.messageHandler.log(
                            `Load category description for category: "${commandCategory}" as: "${readFile}"`
                        );
                    }
                }
                commandConstructor.category = commandCategory;
            }

            if (this.client.commandCategories.has(commandCategory)) {
                const currentCommands =
                    this.client.commandCategories.get(commandCategory);
                currentCommands.push(commandConstructor);
                this.client.commandCategories.set(
                    commandCategory,
                    currentCommands
                );
            } else {
                this.client.commandCategories.set(commandCategory, [
                    commandConstructor,
                ]);
            }
        } else {
            if (typeof command.category === "string") {
                const categoryName = command.category.toLowerCase();

                let categoryDescription =
                    this.client.categories.get(categoryName);

                if (!categoryDescription) {
                    categoryDescription = "Category has no description";
                }

                this.client.categories.set(categoryName, categoryDescription);

                if (this.client.commandCategories.has(categoryName)) {
                    const currentCommands =
                        this.client.commandCategories.get(categoryName);

                    currentCommands.push(commandConstructor);
                    this.client.commandCategories.set(
                        categoryName,
                        currentCommands
                    );
                } else {
                    this.client.commandCategories.set(categoryName, [
                        commandConstructor,
                    ]);
                }
            } else {
                const categoryName = command.category[0].toLowerCase();
                const categoryDescription = command.category[1];

                if (categoryName && categoryDescription) {
                    this.client.categories.set(
                        categoryName,
                        categoryDescription
                    );
                }

                if (this.client.commandCategories.has(categoryName)) {
                    const currentCommands =
                        this.client.commandCategories.get(categoryName);

                    currentCommands.push(commandConstructor);
                    this.client.commandCategories.set(
                        categoryName,
                        currentCommands
                    );
                } else {
                    this.client.commandCategories.set(categoryName, [
                        commandConstructor,
                    ]);
                }
            }
        }

        this.client.messageHandler.log(`Loaded command: "${command.name}"`);

        this.client.commands.set(command.name, commandConstructor);

        if (command.aliases) {
            for (const alias of command.aliases) {
                this.client.aliases.set(alias, commandConstructor);
            }
        }

        return true;
    }

    public loadCheck(dir: string) {
        const { check } = require(dir);
        if (!(check instanceof Check)) {
            return this.client.messageHandler.warn(
                `Check file: "${dir}" is an invalid check!`,
                false,
                "CHECK"
            );
        }

        if (!check.name || !check.run || !check.type) {
            return this.client.messageHandler.warn(
                `Check file: "${dir}" doesnt have a name, or a run method, or a type`,
                false,
                "CHECK"
            );
        }

        if (check.id) {
            this.client.messageHandler.warn(
                `Check: "${check.name}" has been manually assigned an ID: "${
                    check.id
                }". Changing ID to "${check.name
                    .toUpperCase()
                    .replace(/[ ]/g, "_")}"`
            );
        }

        check.id = check.name.toUpperCase().replace(/[ ]/g, "_");

        if (check.type === "client") {
            if (this.client.clientChecks.has(check.id)) {
                return this.client.messageHandler.warn(
                    `Check: "${check.name}"'s ID: "${check.id}" has already been used!`,
                    false,
                    "CHECK"
                );
            }
        } else {
            if (this.client.userChecks.has(check.id)) {
                return this.client.messageHandler.warn(
                    `User check: "${check.name}"'s ID: "${check.id}" has already been used!`,
                    false,
                    "CHECK"
                );
            }
        }

        check.client = this.client;

        if (check.type === "client") {
            this.client.clientChecks.set(check.id, check);
            this.client.messageHandler.debug(
                `Loaded client check: "${check.name}", with ID: "${check.id}"`
            );
        } else {
            this.client.userChecks.set(check.id, check);
            this.client.messageHandler.debug(
                `Loaded user check: "${check.name}", with ID: "${check.id}"`
            );
        }

        for (const check of this.client.config.defaultClientChecks) {
            if (!this.client.clientChecks.get(check)) {
                this.client.messageHandler.warn(
                    `Default this.client check: ${check} is not a valid check ID!`
                );
            }
        }

        for (const check of this.client.config.defaultUserChecks) {
            if (!this.client.userChecks.get(check)) {
                this.client.messageHandler.warn(
                    `Default user check: ${check} is not a valid check ID!`
                );
            }
        }

        return true;
    }

    public loadEvent(dir: string) {
        const { event } = require(dir);
        if (!(event instanceof Event)) {
            return this.client.messageHandler.warn(
                `Event file: "${dir}" is an invalid event!`,
                false,
                "EVENT"
            );
        }

        if (!event.name || !event.run) {
            return this.client.messageHandler.warn(
                `Event file: "${dir}" doesnt have a name or a run method!`,
                false,
                "EVENT"
            );
        }

        this.client.events.set(event.name, event);
        this.client.on(event.name, event.run.bind(null, this.client));
    }

    public loadExtension(dir: string) {
        const { extension } = require(dir);
        if (!(extension instanceof Extension)) {
            return this.client.messageHandler.warn(
                `Extension file: "${dir}" is an invalid extension!`,
                false,
                "EXTENSION"
            );
        }

        if (!extension.run) {
            return this.client.messageHandler.warn(
                `Extension file: "${dir}" doesnt have a run method!`,
                false,
                "EXTENSION"
            );
        }

        if (extension.name && extension.author && extension.version) {
            this.client.messageHandler.log(
                `Loaded extension: ${extension.name} v${extension.version}, by ${extension.author}`
            );
        }

        extension.run(this.client);
    }

    public async registerSlashCommands() {
        const { commands, config, aliases, messageHandler } = this.client;

        if (!config.loadGlobalSlashCommands && !config.loadGuildSlashCommands) {
            return false;
        }

        let loadedCommandsArray: ChatInputApplicationCommandData[] = [];

        const loadSlashCommandData = (name: string, slashCommand: Command) => {
            let slashCommandConstructor: ApplicationCommandData = {
                name: name,
                description: slashCommand.description,
            };

            let argsArray: ApplicationCommandOptionData[] = [];

            for (let arg of slashCommand.args) {
                if (!arg.description) {
                    return messageHandler.warn(
                        `Slash command ${slashCommand.name}: Arg: "${arg.name}" does not have a description!`,
                        true,
                        "Slash Command arg"
                    );
                }

                if (!arg.required) {
                    arg.required = false;
                }

                if (
                    arg.type === "single" ||
                    arg.type === "multiple" ||
                    arg.type === "time"
                ) {
                    argsArray.push({
                        name: arg.name,
                        description: arg.description,
                        type: "STRING",
                        required: arg.required,
                    });
                } else if (arg.type === "channelMention") {
                    argsArray.push({
                        name: arg.name,
                        description: arg.description,
                        type: "CHANNEL",
                        required: arg.required,
                    });
                } else if (arg.type === "interger" || arg.type === "number") {
                    argsArray.push({
                        name: arg.name,
                        description: arg.description,
                        type: "NUMBER",
                        required: arg.required,
                    });
                } else if (
                    arg.type === "memberMention" ||
                    arg.type === "userMention"
                ) {
                    argsArray.push({
                        name: arg.name,
                        description: arg.description,
                        type: "USER",
                        required: arg.required,
                    });
                }
            }

            slashCommandConstructor.options = argsArray;

            return slashCommandConstructor;
        };

        let index = 0;
        for (const commandKey of commands) {
            if (commandKey[1].overideLoadSlashCommand) {
                continue;
            }

            if (this.client.cachedConfigurations.get("DISABLED_COMMANDS")) {
                if (
                    this.client.cachedConfigurations
                        .get("DISABLED_COMMANDS")
                        .options.disabledCommands.includes(commandKey[1].name)
                ) {
                    continue;
                }
            }

            if (!commandKey[1].description) {
                messageHandler.warn(
                    `Slash command "${commandKey[0]}" does not have a description!`,
                    true,
                    "Slash Command"
                );

                continue;
            }

            const commandData = loadSlashCommandData(
                commandKey[0],
                commandKey[1]
            );

            if (commandData) {
                loadedCommandsArray.push(commandData);
                index++;
            }
        }

        index = loadedCommandsArray.length;
        for (const commandKey of aliases) {
            if (commandKey[1].overideLoadSlashCommand) {
                continue;
            }
            if (this.client.cachedConfigurations.get("DISABLED_COMMANDS")) {
                if (
                    this.client.cachedConfigurations
                        .get("DISABLED_COMMANDS")
                        .options.disabledCommands.includes(commandKey[1].name)
                ) {
                    continue;
                }
            }

            if (!commandKey[1].description) {
                continue;
            }
            const commandData = loadSlashCommandData(
                commandKey[0],
                commandKey[1]
            );
            if (commandData) {
                loadedCommandsArray.push(commandData);
                index++;
            }
        }

        if (config.loadGuildSlashCommands && !config.loadGlobalSlashCommands) {
            this.client.application.commands.set([]);

            for (const guildID of config.slashCommandGuilds) {
                const guild = this.client.guilds.cache.get(guildID);
                if (!guild) {
                    messageHandler.warn(
                        `Couldnt register slash command to guild ID: ${guildID}`,
                        true,
                        "Slash command"
                    );
                    continue;
                }

                guild.commands.set(loadedCommandsArray);
            }
        } else if (config.loadGlobalSlashCommands) {
            for (const guildID of config.slashCommandGuilds) {
                const findGuild = this.client.guilds.cache.get(guildID);
                if (!findGuild) {
                    continue;
                }
                findGuild.commands.set([]);
            }
            this.client.application.commands.set(loadedCommandsArray);
        }
    }
}
