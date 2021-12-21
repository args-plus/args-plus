import { Collection, Util } from "discord.js";
import { Argument, Category, Command } from "../../Handler";

const helpCommand = new Command("help");
helpCommand.description = "Displays the commands you can use";
helpCommand.aliases = ["h"];
helpCommand.overideGuildBlacklist = true;
helpCommand.overideUserBlacklist = true;

const command = new Argument("command", "single");
command.description = "An optional command or category you need help with";
command.displayName = "Command or Category";

helpCommand.args = [command];
helpCommand.run = async (client, command) => {
    const { commandClass, args, prefixUsed } = command;
    const { certainChannelsOnly, certainGuildsOnly, certainRolesOnly } = commandClass;

    const { config, utils } = client;
    const { helpCommand } = config;

    const guild = command.getGuild();
    const author = command.getAuthor();
    const member = command.getMember();
    const channel = command.getChannel();

    const getPrefixes = async (command: Command) => {
        let prefixes = [];

        if (client.config.useChatCommands) {
            if (guild && client.cachedGuildPrefixes.has(guild.id)) {
                prefixes.push(await client.utils.getGuildPrefix(guild));
            } else {
                prefixes.push(client.utils.getGlobalPrefix());
            }
        }
        if (
            !command.overideLoadSlashCommand &&
            (client.config.loadGuildSlashCommands ||
                client.config.loadGlobalSlashCommands)
        ) {
            prefixes.push("/");
        }
        return prefixes;
    };

    const canRunCommand = async (command: Command) => {
        if (
            client.disabledCommands.isDisabledItem(command.name) ||
            (command.categoryName &&
                client.disabledCommands.isDisabledItem(command.categoryName))
        )
            return false;

        if (command.developerOnly && !client.config.botDevelopers.includes(author.id))
            return false;

        if (command.guildOnly && !guild) return false;

        const certain = (array: string[], value: string) => {
            return array.length !== 0 && !array.includes(value);
        };

        if (channel) {
            if (certain(certainChannelsOnly, channel.id)) {
                return false;
            }
        }

        if (guild && certain(certainGuildsOnly, guild.id)) {
            return false;
        }

        if (member && certainRolesOnly.length !== 0) {
            const rolesArray = [...member.roles.cache].map(([name]) => name);

            let hasValidRole = false;
            for (const role of rolesArray) {
                if (commandClass.certainRolesOnly.includes(role)) {
                    hasValidRole = true;
                }
            }

            if (!hasValidRole && !member.permissions.has("ADMINISTRATOR")) {
                return false;
            }
        }

        if (
            guild &&
            !command.overideGuildBlacklist &&
            (await client.blacklists.isBlacklisted(guild.id))[0]
        )
            return false;

        if (
            !command.overideUserBlacklist &&
            (await client.blacklists.isBlacklisted(author.id))[0]
        )
            return false;

        if (member && channel && guild && guild.me && channel.type !== "DM") {
            let hasPermissions = true;
            for (const permission of command.clientPermissions) {
                if (!channel.permissionsFor(guild.me).has(permission)) {
                    hasPermissions = false;
                }
            }
            for (const permission of command.userPermissions) {
                if (!channel.permissionsFor(member).has(permission)) {
                    hasPermissions = false;
                }
            }
            if (!hasPermissions) return false;
        }

        return true;
    };

    const addCommandToText = (command: Command, prefixes: string[]) => {
        if (command.hidden) return "";

        let argsMessage = "";

        for (const arg of command.args) {
            argsMessage += `${arg.displayName ? arg.displayName : arg.name} `;
        }

        return client.utils.returnMessage(helpCommand.command, [
            ["prefix", prefixes.join(" or ")],
            ["name", command.name],
            [
                "aliases",
                command.aliases.length !== 0 ? `(${command.aliases.join(", ")})` : ""
            ],
            ["alwaysaliases", command.aliases.join(", ")],
            ["usage", command.getUsage(command.name)],
            ["args", argsMessage],
            [
                "description",
                command.description.length !== 0 ? `- ${command.description}` : ""
            ],
            ["alwaysdescription", command.description]
        ])[0];
    };

    const sendHelpMessage = async () => {
        const loadedCommandDescriptions: Collection<string, string> = new Collection();
        let emptyCategoryDescription: string = "";

        for (const commandKey of client.commands) {
            const command = commandKey[1];

            if (command.guildOnly && !guild) continue;

            if (!(await canRunCommand(command))) continue;

            const prefixes = await getPrefixes(command);

            if (prefixes.length === 0) continue;

            if (!command.categoryName) {
                if (emptyCategoryDescription.length === 0) {
                    emptyCategoryDescription += utils.randomElement(
                        helpCommand.noCategory
                    );
                }
                emptyCategoryDescription += addCommandToText(command, prefixes);
                continue;
            }

            let getDescription = loadedCommandDescriptions.get(command.categoryName);

            if (!getDescription) {
                const findCategory = client.categories.get(command.categoryName);

                if (!findCategory) continue;
                let descriptionParagraph = client.utils.returnMessage(
                    helpCommand.category,
                    [
                        ["name", findCategory.name],
                        ["description", findCategory.description]
                    ]
                )[0];
                descriptionParagraph += addCommandToText(command, prefixes);
                loadedCommandDescriptions.set(command.categoryName, descriptionParagraph);
            } else {
                getDescription += addCommandToText(command, prefixes);
                loadedCommandDescriptions.set(command.categoryName, getDescription);
            }
        }

        let helpMessage = client.utils.returnMessage(helpCommand.beginingParagraph, [
            ["prefix used", command.prefixUsed]
        ])[0];

        for (const categoryKey of loadedCommandDescriptions) {
            helpMessage += categoryKey[1];
        }

        helpMessage += `\n${emptyCategoryDescription}`;

        helpMessage += client.utils.returnMessage(helpCommand.endParagraph, [
            ["prefix used", command.prefixUsed]
        ])[0];

        return command.sendMessage(helpMessage);
    };

    if (!args[0]) return sendHelpMessage();

    const getHelpForCommand = async (command: Command) => {
        let prefixes = await getPrefixes(command);

        if (prefixes.length === 0) return false;

        let cooldownMessage = "";

        const commandCooldown = command.getCooldownNumber();

        if (commandCooldown[0] !== 0 && commandCooldown[1] !== 0) {
            cooldownMessage = client.utils.returnMessage(
                client.config.responses.cooldown,
                [
                    ["period", client.utils.msToTime(commandCooldown[0])],
                    ["amount", commandCooldown[1].toString()]
                ]
            )[0];
        }

        let helpMessage = client.utils.returnMessage(helpCommand.detailedCommand, [
            ["name", command.name],
            [
                "description",
                command.description.length !== 0
                    ? command.description
                    : "This command has no description"
            ],
            ["aliases", command.aliases.join(", ")],
            ["hidden aliases", command.hiddenAliases.join(", ")],
            ["guild only", command.guildOnly ? "yes" : "no"],
            ["1example", command.getExample(command.name, prefixUsed, 1)],
            ["2example", command.getExample(command.name, prefixUsed, 2)],
            ["3example", command.getExample(command.name, prefixUsed, 3)],
            [
                "examples",
                command.getExample(
                    command.name,
                    prefixUsed,
                    client.config.amountOfExamples
                )
            ],
            ["cooldown", cooldownMessage]
        ]);

        return helpMessage[0];
    };

    const sendHelpForCommand = async (commandClass: Command) => {
        const getHelpMessage = await getHelpForCommand(commandClass);

        if (getHelpMessage) {
            return command.sendMessage(getHelpMessage);
        }
    };

    const prompt = args[0].getStringValue().toLowerCase();

    const findCommand = client.commands.get(prompt);

    if (findCommand && (await canRunCommand(findCommand))) {
        return await sendHelpForCommand(findCommand);
    }

    const findAlias = client.aliases.get(prompt);

    if (findAlias && (await canRunCommand(findAlias))) {
        return await sendHelpForCommand(findAlias);
    }

    const findCategory = client.categories.filter((category) => {
        return category.name.toLowerCase() === prompt;
    });

    const category = findCategory.first();
    if (!category) return await sendHelpMessage();

    const categoryCommands = client.commands.filter((command) => {
        return command.categoryName === category.name;
    });

    let categoryCommandsText = "";
    for (const commandKey of categoryCommands) {
        const command = commandKey[1];

        const prefixes = await getPrefixes(command);
        if (prefixes.length === 0) continue;

        categoryCommandsText += addCommandToText(command, prefixes);
    }

    command.sendMessage(
        client.utils.returnMessage(helpCommand.detailedCategory, [
            ["name", category.name],
            ["description", category.description],
            ["commands", categoryCommandsText]
        ])[0]
    );
};

export default helpCommand;
