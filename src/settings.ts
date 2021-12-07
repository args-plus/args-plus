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
settings.logErrors = true;
settings.logWarnings = true;
settings.logMessages = true;
settings.logDebugs = true;

const incorrectPermissions = [
    "You do not have the permissions to run this command"
];

// Responses
settings.responses = {
    developerOnly: [
        ["This command can only be ran by bot developers"],
        incorrectPermissions
    ],
    disabledCommand: [
        ["This command has been disabled by my developers"],
        null
    ],
    guildOnly: [["This command can only be ran in a server"], null],
    incorrectArgs: [
        ["Correct usage: %USAGE"],
        ["Incorrect usage for %COMMAND"]
    ],
    errorInCommand: [
        ["Please try again later"],
        ["There was an error while executing that command"]
    ],
    blacklistedGuild: [
        ["This server is currently blacklisted for: %REASON"],
        null
    ],
    blacklistedGuildNoReason: [["This server is currently blacklisted"], null],
    blacklistedUser: [
        ["You are currently blacklisted for %REASON"],
        incorrectPermissions
    ],
    blacklistedUserNoReason: [
        ["You are currently blacklisted"],
        incorrectPermissions
    ],
    cooldown: [
        ["This command has a %AMOUNT cooldown!\nYou have %TIMELEFT left!"],
        null
    ],
    incorrectChannel: [
        ["This command cannot be ran in this channel"],
        incorrectPermissions
    ],
    incorrectGuild: [["This command cannot be ran in this server"], null],
    missingRoles: [
        ["You do not have the correct roles to run this command"],
        incorrectPermissions
    ],
    missingClientPermissions: [
        ["I am missing the %PERMISSION permission to run this command"],
        null
    ],
    missingUserPermissions: [
        ["You are missing the %PERMISSION permission to run this command"],
        ["You do not have the permissions to run this command"]
    ]
};

export default settings;
