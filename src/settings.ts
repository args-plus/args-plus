import { ClientConfig } from "./Handler/Client/settings";
const settings = new ClientConfig("ts!");

// General configs
settings.useChatCommands = true;
settings.indentMessageContent = false;
settings.botDevelopers = [];
settings.autoRemoveCommands = true;

// Message configs
settings.messagesOrEmbeds = "embeds";
settings.mainColor = "BLUE";
settings.errorColor = "RED";
settings.sendTimestamp = false;
settings.embedIcon = false;
settings.embedFooter = false;
settings.sendMessageWithoutPermissions = true;

// Slash commands
settings.loadGuildSlashCommands = false;
settings.slashCommandGuilds = [];
settings.loadGlobalSlashCommands = false;

// Checks and permissions
settings.defaultClientChecks = [];
settings.defaultUserChecks = [];
settings.defaultClientPermissions = ["EMBED_LINKS", "SEND_MESSAGES"];
settings.defaultUserPermissions = [];

// Blacklisted guilds and users
settings.blacklistedGuilds = [
    /*
    Example:

    {
        id: "12345678",
        reason: "Too cool"
    },
    {
        id: "87654321",
        reason: "Way too cool"
    }
    */
];
settings.blacklistedUsers = [
    /*
    Use the same format as blacklisting a guild
    */
];

// Help command settings
settings.helpCommandAliases = true;
settings.helpCommandCommandDescription = true;
settings.helpCommandCategoryDescription = true;

// Logs and errors
settings.sendErrorMessages = true;
settings.logErrors = true;
settings.logWarnings = true;
settings.logMessages = true;
settings.logDebugs = true;

export default settings;
