import { Guild, GuildMember } from "discord.js";
import { Command } from "../../Client/Commands/command";

export const command = new Command();
command.name = "help";
command.description = "Displays the commands you can use";
command.aliases = ["h"];
command.run = async (args, commandRan, commandClass) => {
    const { message, slashCommand } = commandRan;
    const { client } = commandClass;

    let guild = client.utils.getGuild(commandRan);
    let author = client.utils.getAuthor(commandRan);
    let channel = client.utils.getChannel(commandRan);
    let member = client.utils.getMember(commandRan);

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
            if (commandClass.certainRolesOnly.length !== 0 && guild && member) {
                const rolesArray = [...member.roles.cache].map(
                    ([name]) => name
                );

                let hasValidRole = false;
                for (const role of rolesArray) {
                    if (commandClass.certainRolesOnly.includes(role)) {
                        hasValidRole = true;
                    }
                }

                if (!hasValidRole && !member.permissions.has("ADMINISTRATOR")) {
                    continue;
                }
            }

            if (
                guild &&
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
                if (
                    commandClass.userPermissions.length !== 0 &&
                    member instanceof GuildMember
                ) {
                    if (typeof commandClass.userPermissions !== "string") {
                        for (const permission of commandClass.userPermissions) {
                            if (!member.permissions.has(permission)) {
                                hasPermisions = false;
                            }
                        }
                    }
                }
                if (
                    !hasPermisions &&
                    member instanceof GuildMember &&
                    !member.permissions.has("ADMINISTRATOR")
                ) {
                    continue;
                }
            }
            if (
                currentCategoryText.length === 0 &&
                client.config.helpCommandCategoryDescription
            ) {
                const categoryDescription = client.categories.get(categoryName);
                if (categoryDescription) {
                    currentCategoryText = `**${categoryName}:** __${categoryDescription}__\n`;
                } else {
                    currentCategoryText += `**${categoryName}:** __Category has no description__\n`;
                }
            }

            let prefixes = [];

            if (guild && client.guildPrefixes.has(guild.id)) {
                prefixes.push(client.guildPrefixes.get(guild.id));
            } else {
                prefixes.push(client.globalPrefix);
            }

            if (
                guild &&
                ((!command.overideLoadSlashCommand &&
                    client.config.loadGuildSlashCommands) ||
                    client.config.loadGlobalSlashCommands)
            ) {
                prefixes.push("/");
            }

            currentCategoryText += `\`\`${prefixes.join(" or ")}\`\`**${
                command.name
            }** ${
                command.aliases.length !== 0 && client.config.helpCommandAliases
                    ? `(${command.aliases.join(", ")}) - ${command.description}`
                    : `- ${command.description}`
            }\n`;
        }
        currentCategoryText += `\n`;
        helpText += currentCategoryText;
    }

    client.messageHandler.sendMessage(
        commandRan,
        helpText.substring(0, helpText.length - 2),
        `Showing commands you can use for ${client.user.tag}\n\n`
    );
};
