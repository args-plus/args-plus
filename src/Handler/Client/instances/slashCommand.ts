import {
    ApplicationCommandData,
    ApplicationCommandOptionData,
    ChatInputApplicationCommandData
} from "discord.js";
import { Client } from "..";
import { Command } from "../..";

export class SlashCommandManager {
    readonly client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    private loadedCommandsArray: ChatInputApplicationCommandData[] = [];

    public async loadSlashCommands() {
        const { client } = this;
        const { commands, config } = client;

        if (!config.loadGlobalSlashCommands && !config.loadGuildSlashCommands) {
            return false;
        }

        // for (const commandKey of commands) {
        const getCommandData = (
            name: string,
            command: Command
        ): false | ChatInputApplicationCommandData => {
            const failedtoLoadSlashCommand = (message: string): false => {
                client.console.warn(
                    `Failed to load slash command: ${command.name}, ${message}`
                );
                return false;
            };

            if (!command.getLoaded()) return false;

            if (command.getLoadedSlashCommand()) return false;

            if (command.description.length === 0) {
                return failedtoLoadSlashCommand("it has no description");
            }

            let slashCommandConstructor: ApplicationCommandData = {
                name: name,
                description: command.description
            };

            let argsArray: ApplicationCommandOptionData[] = [];

            for (const arg of command.args) {
                if (!arg.description) {
                    failedtoLoadSlashCommand(
                        "one of it's arguments does not have a description"
                    );
                    continue;
                }

                if (
                    arg.type === "single" ||
                    arg.type === "multiple" ||
                    arg.type === "time" ||
                    arg.type === "customValue"
                ) {
                    argsArray.push({
                        ...slashCommandConstructor,
                        type: "STRING",
                        required: arg.required
                    });
                } else if (arg.type === "channelMention") {
                    argsArray.push({
                        ...slashCommandConstructor,
                        type: "CHANNEL",
                        required: arg.required
                    });
                } else if (arg.type === "interger" || arg.type === "number") {
                    argsArray.push({
                        ...slashCommandConstructor,
                        type: "NUMBER",
                        required: arg.required
                    });
                } else if (arg.type === "memberMention" || arg.type === "userMention") {
                    argsArray.push({
                        ...slashCommandConstructor,
                        type: "USER",
                        required: arg.required
                    });
                }
            }

            slashCommandConstructor.options = argsArray;

            command.setLoadedSlashCommand();
            return slashCommandConstructor;
        };

        for (const commandKey of commands) {
            const command = commandKey[1];

            if (command.overideLoadSlashCommand) {
                continue;
            }

            const commandData = getCommandData(commandKey[0], command);

            if (commandData) {
                this.loadedCommandsArray.push(commandData);
            }

            for (const alias of command.aliases) {
                const aliasData = getCommandData(alias, command);

                if (aliasData) {
                    this.loadedCommandsArray.push(aliasData);
                }
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

                await guild.commands.set(this.loadedCommandsArray);
            }
        } else if (config.loadGlobalSlashCommands && this.client.application) {
            for (const guildID of config.slashCommandGuilds) {
                const findGuild = this.client.guilds.cache.get(guildID);
                if (!findGuild) {
                    continue;
                }
                findGuild.commands.set([]);
            }
            this.client.application.commands.set(this.loadedCommandsArray);
        }

        return true;
    }
}
