import Collection from "@discordjs/collection";
import { ExtendedClient } from "../index";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import settings from "../../../settings";
import { Command } from "../../Commands";
import { ClientConfig } from "../settings";
import { Check } from "../../Checks";
import {
    ApplicationCommandData,
    ApplicationCommandOptionData,
    ChatInputApplicationCommandData,
    Constants
} from "discord.js";
import { Constraint } from "../../Interfaces";

export abstract class Item {
    public name: string;
    public dir: string = "";

    constructor(name: string) {
        this.name = name;
    }
}

export class ItemLoader {
    public client: ExtendedClient;

    constructor(extendedClient: ExtendedClient) {
        this.client = extendedClient;
    }

    private loadItem(collection: Collection<any, any> | any[], item: Item) {
        if (collection instanceof Collection) {
            collection.set(item.name, item);
        } else {
            collection.push(item);
        }
    }

    public async loadItems(
        collection: Collection<any, any> | any[],
        item: typeof Item,
        dirs: string[]
    ) {
        for (const dir of dirs) {
            const files = await this.client.utils.loadFiles(
                path.join(__dirname, "../../..", dir)
            );
            for (const file of files) {
                type isItem = { default: typeof item };

                const requireFolder = require(file) as isItem;
                if (!(requireFolder.default instanceof item)) {
                    continue;
                }
                requireFolder.default.dir = file;
                this.loadItem(collection, requireFolder.default);
            }
        }
    }

    public replaceKeyValues<castItem extends Item>(
        collection: Collection<any, any>,
        newKeyValue: keyof castItem
    ) {
        const newItems: [string, castItem][] = [];
        for (const key of collection) {
            collection.delete(key[0]);
            const currentItem: castItem = key[1];
            newItems.push([`${currentItem[newKeyValue]}`, currentItem]);
        }
        for (const item of newItems) {
            collection.set(item[0], item[1]);
        }
    }

    public loadSettings(): ClientConfig | null {
        dotenv.config();

        if (!process.env.token || !process.env.mongoURI) {
            return null;
        }

        settings.token = process.env.token;
        settings.mongoURI = process.env.mongoURI;

        return settings;
    }

    public loadChecks() {
        const { client } = this;

        this.replaceKeyValues<Check>(client.clientChecks, "id");

        for (const check of client.clientChecks) {
            client.console.log(
                `Succesfully laoded client check: ${check[1].name}`
            );
        }

        for (const check of client.userChecks) {
            client.console.log(
                `Succesfully loaded user check: ${check[1].name}`
            );
        }
    }

    public loadEvents() {
        const { client } = this;

        for (const event of client.events) {
            client.on(event.name, event.run.bind(null, client));
        }
    }

    public loadCommand(command: Command) {
        const failedToLoadCommand = (message: string) => {
            client.commands.delete(command.name);

            return client.console.warn(
                `Failed to load command: "${command.name}", ${message}`
            );
        };

        const { client } = this;
        if (!command.run) {
            return failedToLoadCommand("it does not have a run function!");
        }

        let argTypeMultiple = false;
        let argNames: string[] = [];
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
            if (argNames.includes(arg.name)) {
                return failedToLoadCommand("multiple args have the same name");
            }

            arg.id = arg.name.toUpperCase().replace(/[ ]/g, "_");

            if (arg.type === "multiple") {
                argTypeMultiple = true;
            }
            if (!arg.required) {
                argRequired = false;
            }

            let usage: string;

            if (arg.type !== "customValue") {
                usage = arg.displayName ? arg.displayName : arg.name;
            } else {
                if (!arg.customValues) {
                    return failedToLoadCommand(
                        'if an arg type is "customValue", there must be the customValues property'
                    );
                }
                if (arg.allowLowerCaseCustomValue) {
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
                usage = `${
                    arg.displayName
                        ? `${arg.displayName}: ${options}`
                        : `${arg.name}: ${options}`
                }`;
            }

            if (arg.required) {
                command.usage.push(`<${usage}>`);
            } else {
                command.usage.push(`(${usage})`);
            }

            argNames.push(arg.name);
        }

        for (const check of command.clientChecks) {
            if (!client.checks.isClientCheck(check)) {
                return failedToLoadCommand(
                    `check with ID: "${check}" is not a valid client check`
                );
            }
        }

        for (const check of command.userChecks) {
            if (!client.checks.isUserCheck(check)) {
                return failedToLoadCommand(
                    `check with ID: "${check}" is not a valid client check`
                );
            }
        }

        const isLower = (str: string) => {
            return /[a-z]/.test(str) && !/[A-Z]/.test(str);
        };

        const isValidCommandName = (name: string) => {
            return isLower(name) || name.includes(" ");
        };

        if (!isValidCommandName(command.name)) {
            return failedToLoadCommand(
                "a command name must be all lowercase and have no spaces"
            );
        }

        if (client.aliases.has(command.name)) {
            return failedToLoadCommand(
                "the command name has been used as an alias"
            );
        }

        for (const alias of command.aliases) {
            if (client.aliases.has(alias) || client.commands.has(alias)) {
                client.console.warn(
                    `Failed to load alias: "${alias}", from command: "${command.name}" as it has been used before, either as an alias or command`
                );
                continue;
            }
            if (!isValidCommandName(alias)) {
                client.console.warn(
                    `Failed to load alias: "${alias}", from command: "${command.name}", a command alias must have no spaces and be all lower case`
                );
                continue;
            }
            client.aliases.set(alias, command);
        }

        // prettier-ignore
        if(!command.overideDefaultClientPermissions){
            command.clientPermissions = [...client.config.defaultClientPermissions, ...command.clientPermissions]
        }

        // prettier-ignore
        if(!command.overideDefaultUserPermissions){
            command.userPermissions = [...client.config.defaultUserPermissions, ...command.userPermissions]
        }

        // prettier-ignore
        if(!command.overideDefaultClientChecks){
            command.clientChecks = [...client.config.defaultClientChecks, ...command.clientChecks]
        }

        // prettier-ignore
        if(!command.overideDefaultUserChecks){
            command.userChecks = [...client.config.defaultUserChecks, ...command.userChecks]
        }

        client.commands.set(command.name, command);

        client.console.log(`Loaded command: ${command.name}`);
    }

    public loadCommands() {
        const { client } = this;

        for (const command of client.commands) {
            this.loadCommand(command[1]);
        }
    }

    public loadCateogires() {
        const { client } = this;

        const commandsToReload: Command[] = [];

        for (const command of client.commands) {
            let { dir, category, name } = command[1];

            const addCategory = (category: string) => {
                const findCategory = client.commandCategories.get(category);

                if (findCategory) {
                    findCategory.push(command[1]);
                    return client.commandCategories.set(category, findCategory);
                } else {
                    return client.commandCategories.set(category, [command[1]]);
                }
            };

            if (category === null) {
                const commandPathArray = dir.split("/");
                // prettier-ignore
                const commandCategory = commandPathArray[commandPathArray.length - 2];

                if (commandCategory !== "Commands") {
                    command[1].category = commandCategory;
                    addCategory(commandCategory);
                    commandsToReload.push(command[1]);
                    if (!client.categories.has(commandCategory)) {
                        const commandCategoryPath = commandPathArray
                            .splice(0, commandPathArray.length - 1)
                            .join("/");

                        let constraints: Constraint[] = [];

                        if (
                            fs.existsSync(
                                `${commandCategoryPath}/constraints.txt`
                            )
                        ) {
                            const readFile = fs.readFileSync(
                                `${commandCategoryPath}/constraints.txt`,
                                "utf8"
                            );

                            // @ts-ignore
                            constraints = readFile.split(/ +/g);
                        }

                        if (fs.existsSync(`${commandCategoryPath}/desc.txt`)) {
                            const readFile = fs.readFileSync(
                                `${commandCategoryPath}/desc.txt`,
                                "utf8"
                            );

                            const failedToLoadCategory = (message: string) => {
                                return client.console.warn(
                                    `Failed to load category description for command category: ${commandCategory}, ${message}`
                                );
                            };

                            if (readFile.length === 0) {
                                failedToLoadCategory(
                                    "it's description file has no description"
                                );
                                continue;
                            } else if (readFile.length > 300) {
                                failedToLoadCategory(
                                    "it's description is over 300 characters"
                                );
                                continue;
                            } else {
                                client.categories.set(commandCategory, [
                                    readFile,
                                    constraints
                                ]);
                                client.console.log(
                                    `Loaded category description for: ${commandCategory}`
                                );
                            }
                        }
                    }
                }
            } else if (typeof category === "string") {
                const getCategory = client.categories.get(category);
                if (!getCategory) {
                    client.categories.set(category, [
                        "No description available for this category",
                        []
                    ]);
                }
                addCategory(category);
            } else if (typeof category !== "boolean") {
                const categoryName = category[0];
                const categoryDescription = category[1];
                client.categories.set(categoryName, [categoryDescription, []]);
                command[1].category = categoryName;
                addCategory(categoryName);
                commandsToReload.push(command[1]);
            }

            if (command[1].category === null || command[1].category === false) {
                client.emptyCategories.push(command[1]);
            }
        }

        for (const command of commandsToReload) {
            client.commands.set(command.name, command);

            for (const alias of command.aliases) {
                client.aliases.set(alias, command);
            }
        }
    }

    public async registerSlashCommands() {
        const { commands, config, aliases, console } = this.client;

        if (!config.loadGlobalSlashCommands && !config.loadGuildSlashCommands) {
            return false;
        }

        let loadedCommandsArray: ChatInputApplicationCommandData[] = [];

        const failedToLoadSlashCommand = (name: string, message: string) => {
            return console.warn(
                `Failed to load slash command: ${name}, ${message}`
            );
        };

        const loadSlashCommandData = (name: string, slashCommand: Command) => {
            let slashCommandConstructor: ApplicationCommandData = {
                name: name,
                description: slashCommand.description
            };

            let argsArray: ApplicationCommandOptionData[] = [];

            for (let arg of slashCommand.args) {
                if (!arg.description) {
                    return failedToLoadSlashCommand(
                        slashCommand.name,
                        "one of it's arguments does not have a description"
                    );
                }

                if (!arg.required) {
                    arg.required = false;
                }

                if (
                    arg.type === "single" ||
                    arg.type === "multiple" ||
                    arg.type === "time" ||
                    arg.type === "customValue"
                ) {
                    argsArray.push({
                        name: arg.name,
                        description: arg.description,
                        type: "STRING",
                        required: arg.required
                    });
                } else if (arg.type === "channelMention") {
                    argsArray.push({
                        name: arg.name,
                        description: arg.description,
                        type: "CHANNEL",
                        required: arg.required
                    });
                } else if (arg.type === "interger" || arg.type === "number") {
                    argsArray.push({
                        name: arg.name,
                        description: arg.description,
                        type: "NUMBER",
                        required: arg.required
                    });
                } else if (
                    arg.type === "memberMention" ||
                    arg.type === "userMention"
                ) {
                    argsArray.push({
                        name: arg.name,
                        description: arg.description,
                        type: "USER",
                        required: arg.required
                    });
                }
            }

            slashCommandConstructor.options = argsArray;

            return slashCommandConstructor;
        };

        for (const commandKey of commands) {
            const command = commandKey[1];

            if (command.overideLoadSlashCommand) {
                continue;
            }

            if (!command.description) {
                failedToLoadSlashCommand(
                    command.name,
                    "it does not have a description"
                );
                continue;
            }

            const commandData = loadSlashCommandData(commandKey[0], command);

            if (commandData) {
                loadedCommandsArray.push(commandData);
            }
        }

        let index = loadedCommandsArray.length;
        for (const commandKey of aliases) {
            const command = commandKey[1];

            if (command.overideLoadSlashCommand) {
                continue;
            }
            if (!command.description) {
                continue;
            }

            const commandData = loadSlashCommandData(commandKey[0], command);

            if (commandData) {
                loadedCommandsArray.push(commandData);
                index++;
            }
        }

        if (
            config.loadGuildSlashCommands &&
            !config.loadGlobalSlashCommands &&
            this.client.application
        ) {
            this.client.application.commands.set([]);

            for (const guildID of config.slashCommandGuilds) {
                const guild = this.client.guilds.cache.get(guildID);
                if (!guild) {
                    console.warn(
                        `Couldnt register slash command's to guild ID: ${guildID}`
                    );
                    continue;
                }

                guild.commands.set(loadedCommandsArray);
            }
        } else if (config.loadGlobalSlashCommands && this.client.application) {
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

    public async runExtensions() {
        for (const extension of this.client.extensions) {
            this.client.console.log(`Loaded extension: ${extension.name}`);

            await extension.run(this.client);
        }
    }
}
