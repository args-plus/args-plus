import { ColorResolvable } from "discord.js";
import { Permission } from "./Permissions";

export interface Config {
    token: string;
    mongoURI: string;
    prefix: string;

    messagesOrEmbeds?: "messages" | "embeds";
    mainColor?: ColorResolvable;
    errorColor?: ColorResolvable;
    loadGuildSlashCommands?: boolean;
    slashCommandGuilds?: string[];
    loadGlobalSlashCommands?: boolean;
    useChatCommands?: boolean;
    defaultClientChecks?: string[];
    defaultUserChecks?: string[];
    defaultClientPermissions?: Permission[];
    defaultUserPermissions?: Permission[];
    indentMessageContent?: boolean;
    botDevelopers?: string | string[];
    customConfigurationsDir?: string;
    defaultCommands?: boolean;
    defaultPingCommand?: boolean;
    defaultHelpCommand?: boolean;
    defualtGuildPrefixCommand?: boolean;
    defaultGlobalPrefixCommand?: boolean;
    helpCommandCategoryDescription?: boolean;
    helpCommandAliases?: boolean;
    blacklistedGuilds?: {
        blacklistedGuildID: string;
        reason?: string;
    };
    blacklistedUsers?: {
        blacklistedUserID: string;
        reason?: string;
    };
    logErrorMessages?: boolean;
    sendErrorMessages?: true;
    logWarnings?: true;
    logMessages?: boolean;
    logDebugs?: boolean;
    writeToLogFile?: boolean;
    configureBotWarning?: boolean;
}
