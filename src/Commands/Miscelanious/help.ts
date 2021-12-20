// import { Guild, GuildMember } from "discord.js";
// import { Command } from "../../Handler";
// import { Constraint } from "../../Handler/Interfaces";

// const command = new Command("helpme");
// command.description = "Displays the commands you can use";
// command.hiddenAliases = ["helpmepls", "h"];
// command.aliases = ["help"];
// command.overideGuildBlacklist = true;
// command.overideUserBlacklist = true;
// command.args = [
//     {
//         name: "command",
//         displayName: "Command or Category",
//         type: "single",
//         description: "An optional command or category you need help with"
//     }
// ];
// command.run = async (client, commandRan) => {
//     const guild: Guild | null = commandRan.getGuild();
//     const author = commandRan.getAuthor();
//     const channel = commandRan.getChannel();
//     const member: GuildMember | null = commandRan.getMember();
//     const { commandClass } = commandRan;
//     const { certainChannelsOnly, certainGuildsOnly, certainRolesOnly } =
//         commandClass;

//     let constraints: Constraint[] = [];

//     const setConstraints = (command: Command) => {
//         if (
//             typeof command.category === "string" &&
//             !command.overideConstraints
//         ) {
//             const findCategory = client.categories.get(command.category);

//             if (findCategory) {
//                 constraints = findCategory[1];
//             }
//         }
//     };

//     const getPrefixes = async (command: Command) => {
//         let prefixes = [];

//         if (client.config.useChatCommands) {
//             if (guild && client.cachedGuildPrefixes.has(guild.id)) {
//                 prefixes.push(await client.utils.getGuildPrefix(guild));
//             } else {
//                 prefixes.push(client.utils.getGlobalPrefix());
//             }
//         }
//         if (
//             !command.overideLoadSlashCommand &&
//             !constraints.includes("overideLoadSlashCommand") &&
//             (client.config.loadGuildSlashCommands ||
//                 client.config.loadGlobalSlashCommands)
//         ) {
//             prefixes.push("/");
//         }
//         return prefixes;
//     };
//     const canRunCommand = (command: Command): boolean => {
//         if (client.disabledCommandManager.isDisabledCommand(command.name)) {
//             return false;
//         }

//         if (
//             (command.developerOnly || constraints.includes("developerOnly")) &&
//             !client.config.botDevelopers.includes(author.id)
//         ) {
//             return false;
//         }

//         if (
//             (command.guildOnly || constraints.includes("guildOnly")) &&
//             !guild
//         ) {
//             return false;
//         }

//         const certain = (array: string[], value: string) => {
//             return array.length !== 0 && !array.includes(value);
//         };

//         if (channel) {
//             if (certain(certainChannelsOnly, channel.id)) {
//                 return false;
//             }
//         }

//         if (guild && certain(certainGuildsOnly, guild.id)) {
//             return false;
//         }

//         if (member && certainRolesOnly.length !== 0) {
//             const rolesArray = [...member.roles.cache].map(([name]) => name);

//             let hasValidRole = false;
//             for (const role of rolesArray) {
//                 if (commandClass.certainRolesOnly.includes(role)) {
//                     hasValidRole = true;
//                 }
//             }

//             if (!hasValidRole && !member.permissions.has("ADMINISTRATOR")) {
//                 return false;
//             }
//         }

//         if (
//             guild &&
//             client.blacklistedGuildIds.includes(guild.id) &&
//             (!command.overideGuildBlacklist ||
//                 !constraints.includes("overideGuildBlacklist"))
//         ) {
//             return false;
//         }

//         if (
//             client.blacklistedUserIds.includes(author.id) &&
//             (!command.overideUserBlacklist ||
//                 !constraints.includes("overideUserBlacklist"))
//         ) {
//             return false;
//         }

//         if (member && guild && guild.me && channel && channel.type !== "DM") {
//             let hasPermissions = true;
//             for (const permission of command.clientPermissions) {
//                 if (!channel.permissionsFor(guild.me).has(permission)) {
//                     hasPermissions = false;
//                 }
//             }
//             for (const permission of command.userPermissions) {
//                 if (!channel.permissionsFor(member).has(permission)) {
//                     hasPermissions = false;
//                 }
//             }
//             for (const permission of constraints) {
//                 if (
//                     permission !== "overideGuildBlacklist" &&
//                     permission !== "overideUserBlacklist" &&
//                     permission !== "guildOnly" &&
//                     permission !== "developerOnly" &&
//                     permission !== "overideLoadSlashCommand"
//                 ) {
//                     if (!channel.permissionsFor(member).has(permission)) {
//                         hasPermissions = false;
//                     }
//                 }
//             }
//             if (!hasPermissions) {
//                 return false;
//             }
//         }

//         return true;
//     };

//     const sendHelpMessage = async () => {
//         let helpText = "";
//         let currentCategoryText = "";

//         const addCommandToText = async (
//             command: Command,
//             prefixes: string[]
//         ) => {
//             let commandDescription =
//                 command.description.length !== 0 &&
//                 client.config.helpCommandCommandDescription
//                     ? command.description
//                     : false;

//             currentCategoryText += `\`\`${prefixes.join(" or ")}\`\`**${
//                 command.name
//             }** ${
//                 command.aliases.length !== 0 && client.config.helpCommandAliases
//                     ? `(${command.aliases.join(", ")}) ${
//                           commandDescription ? `- ${commandDescription}` : ""
//                       }`
//                     : `${commandDescription ? `- ${commandDescription}` : ""}`
//             }\n`;
//         };

//         for (const key of client.commandCategories) {
//             currentCategoryText = "";

//             const categoryName = key[0];
//             const commands = key[1];

//             for (const command of commands) {
//                 setConstraints(command);

//                 // prettier-ignore
//                 if(command.guildOnly && !guild){
//                     continue;
//                 }

//                 if (!canRunCommand(command)) {
//                     continue;
//                 }

//                 let prefixes = await getPrefixes(command);
//                 if (prefixes.length === 0) {
//                     continue;
//                 }

//                 if (currentCategoryText.length === 0) {
//                     const categoryDescription =
//                         client.categories.get(categoryName);
//                     if (
//                         categoryDescription &&
//                         client.config.helpCommandCategoryDescription
//                     ) {
//                         currentCategoryText += `**${categoryName}:** __${categoryDescription[0]}__\n`;
//                     } else if (client.config.helpCommandCategoryDescription) {
//                         currentCategoryText += `**${categoryName}:** __Category has no description__\n`;
//                     } else {
//                         currentCategoryText += `**${categoryName}**\n`;
//                     }
//                 }

//                 await addCommandToText(command, prefixes);
//             }
//             if (currentCategoryText.length !== 0) currentCategoryText += `\n`;
//             helpText += currentCategoryText;
//         }

//         currentCategoryText = "";
//         for (const command of client.emptyCategories) {
//             // prettier-ignore
//             if(command.guildOnly && !guild){
//                 continue;
//             }

//             setConstraints(command);

//             if (!canRunCommand(command)) {
//                 continue;
//             }

//             let prefixes = await getPrefixes(command);
//             if (prefixes.length === 0) {
//                 continue;
//             }

//             if (currentCategoryText.length === 0) {
//                 currentCategoryText += `**Commands with no category**\n`;
//             }

//             await addCommandToText(command, prefixes);
//         }

//         if (currentCategoryText.length !== 0) {
//             currentCategoryText += `\n`;
//             helpText += currentCategoryText;
//         }

//         if (client.user) {
//             commandRan.sendMessage(
//                 helpText.substring(0, helpText.length - 2),
//                 `Showing commands you can use for ${client.user.username}\n`
//             );
//         } else {
//             commandRan.sendMessage(
//                 helpText.substring(0, helpText.length - 2),
//                 `Showing commands you can use\n`
//             );
//         }
//     };

//     const { args } = commandRan;

//     if (!args[0] || !args[0].stringValue) {
//         return sendHelpMessage();
//     }

//     const sendHelpForCommand = async (command: Command) => {
//         let prefixes = await getPrefixes(command);

//         commandRan.sendMessage(
//             `**Usage:**\n**\`\`${prefixes.join("`` or ``")}\`\`** \`\`${
//                 command.name
//             }${
//                 command.usage.length !== 0
//                     ? ` ${command.usage}\`\`\n*<> = required value*\n*() = unrequired value*`
//                     : "``"
//             }\n\n**Aliases:** ${
//                 command.aliases.length !== 0
//                     ? `\`\`"${command.aliases.join('" or "')}"\`\``
//                     : "``None``"
//             }${
//                 command.hiddenAliases.length !== 0
//                     ? ` \`\`or "${command.hiddenAliases.join('" or "')}" \`\``
//                     : ""
//             }\n**Description:** ${
//                 command.description.length !== 0
//                     ? `\`\`${command.description}\`\``
//                     : "This command has no description"
//             }\n**Category:** ${
//                 command.category && typeof command.category === "string"
//                     ? `\`\`${command.category}\`\``
//                     : "``None``"
//             }\n**Server only:** ${
//                 command.guildOnly ? "``Yes``" : "``No``"
//             }\n**Cooldown:** ${
//                 command.cooldownNumber !== 0
//                     ? `\`\`${client.utils.msToTime(command.cooldownNumber)}\`\``
//                     : "``None``"
//             }`,
//             `Showing help for ${command.name}\n`
//         );
//     };

//     const prompt = args[0].stringValue.toLowerCase();

//     const findCommand = client.commands.get(prompt);

//     if (findCommand && canRunCommand(findCommand)) {
//         return sendHelpForCommand(findCommand);
//     }

//     const findAlias = client.aliases.get(prompt);

//     if (findAlias && canRunCommand(findAlias)) {
//         return sendHelpForCommand(findAlias);
//     }

//     const findCategory = client.categories.get(prompt);

//     if (findCategory) {
//         const getCommands = client.commandCategories.get(prompt);

//         if (getCommands) {
//             let availableCommands = "";

//             for (const command of getCommands) {
//                 availableCommands += `- ${command.name}${
//                     command.aliases.length !== 0
//                         ? ` \`\`(${command.aliases.join(", ")})\`\``
//                         : ""
//                 }\n`;
//             }

//             return commandRan.sendMessage(
//                 `**Description: ** \`\`${findCategory}\`\`\n\n**Available commands**\n${availableCommands.substring(
//                     availableCommands.length,
//                     -2
//                 )}`,
//                 `Showing help for ${prompt}`
//             );
//         }
//     }

//     return sendHelpMessage();
// };

// export default command;
