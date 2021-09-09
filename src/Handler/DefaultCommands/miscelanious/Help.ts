import { GuildMember } from "discord.js";
import { Command } from "../../Client/Commands/command";

export const command = new Command();
command.name = "help";
command.description = "Displays the commands you can use";
command.aliases = ["h"];
command.run = async (args, commandRan, commandClass) => {
    const { message, slashCommand } = commandRan;

    let guild = message !== null ? message.guild : slashCommand.guild;
    let author = message !== null ? message.author : slashCommand.user;
    let channel = message !== null ? message.channel : slashCommand.channel;
    let member = message !== null ? message.member : slashCommand.member;
    let content = message !== null ? message.content : null;
    let mentions = message !== null ? message.mentions : null;

    if (!(member instanceof GuildMember)) {
        return false;
    }

    const { client } = commandClass;

    let helpText = "";
    let currentCategoryText = "";

    for (const key of client.commandCategories) {
        currentCategoryText = "";

        const categoryName = key[0];
        const commands = key[1];

        for (const command of commands) {
            if (
                command.developerOnly &&
                !(await client.checkManager.runCheck(
                    "is user developer",
                    { user: author },
                    "user"
                ))
            ) {
                continue;
            }

            if (command.guildOnly && !guild) {
                continue;
            }

            if (
                commandClass.certainChannelsOnly.length !== 0 &&
                !commandClass.certainChannelsOnly.includes(channel.id)
            ) {
                continue;
            }
            if (
                commandClass.certainGuildsOnly.length !== 0 &&
                guild &&
                !commandClass.certainGuildsOnly.includes(guild.id)
            ) {
                continue;
            }
            if (commandClass.certainRolesOnly.length !== 0 && guild) {
                const rolesArray = [...member.roles.cache].map(
                    ([name]) => name
                );

                let hasValidRole = false;
                for (const role of rolesArray) {
                    if (commandClass.certainRolesOnly.includes(role)) {
                        hasValidRole = true;
                    }
                }

                if (!hasValidRole) {
                    continue;
                }
            }

            if (
                client.config.blacklistedGuilds[guild.id] &&
                !command.overideGuildBlacklist
            ) {
                continue;
            }

            if (
                client.config.blacklistedUsers[author.id] &&
                !command.overideUserBlacklist
            ) {
                continue;
            }

            if (channel.type !== "DM") {
                let hasPermisions = true;
                if (commandClass.clientPermissions.length !== 0) {
                    if (typeof commandClass.clientPermissions !== "string") {
                        for (const permission of commandClass.clientPermissions) {
                            if (
                                !channel
                                    .permissionsFor(guild.me)
                                    .has(permission)
                            ) {
                                hasPermisions = false;
                            }
                        }
                    }
                }
                if (commandClass.userPermissions.length !== 0) {
                    if (typeof commandClass.userPermissions !== "string") {
                        for (const permission of commandClass.userPermissions) {
                            if (
                                !channel
                                    .permissionsFor(guild.me)
                                    .has(permission)
                            ) {
                                hasPermisions = false;
                            }
                        }
                    }
                }
                if (!hasPermisions) {
                    continue;
                }
            }
            if (currentCategoryText.length === 0) {
                const categoryDescription = client.categories.get(categoryName);
                if (categoryDescription) {
                    currentCategoryText = `__${categoryDescription}__\n`;
                } else {
                    currentCategoryText += `__Category has no description__\n`;
                }
            }

            let prefixes = [];

            if (client.guildPrefixes.has(guild.id)) {
                prefixes.push(client.guildPrefixes.get(guild.id));
            } else {
                prefixes.push(client.globalPrefix);
            }

            if (
                (!command.overideLoadSlashCommand &&
                    client.config.loadGuildSlashCommands) ||
                client.config.loadGlobalSlashCommands
            ) {
                prefixes.push("/");
            }

            console.debug(command.aliases);
            currentCategoryText += `\`\`${prefixes.join(" or ")}\`\`**${
                command.name
            }** ${
                command.aliases.length !== 0
                    ? `(${command.aliases.join(", ")}) - ${command.description}`
                    : `- ${command.description}`
            }\n`;
        }
        currentCategoryText += `\n`;
        helpText += currentCategoryText;
    }

    client.messageHandler.sendMessage(
        commandRan,
        helpText,
        `Showing commands you can use for ${client.user.tag}\n\n`
    );
};
