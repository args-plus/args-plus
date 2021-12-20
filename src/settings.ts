import { ClientConfig } from "./Handler/Client/utils/config";

const settings = new ClientConfig("ts!");

// General configs
settings.useChatCommands = true;
settings.botDevelopers = [];
settings.autoRemoveCommands = true;
settings.amountOfExamples = 2;

// Message configs
settings.messagesOrEmbeds = "embeds";
settings.indentMessageContent = false;
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

const incorrectPermissions = ["You do not have the permissions to run this command"];

// Responses
settings.responses = {
    developerOnly: [
        ["This command can only be ran by bot developers"],
        incorrectPermissions
    ],
    disabledCommand: [["This command has been disabled by my developers"], null],
    guildOnly: [["This command can only be ran in a server"], null],
    incorrectArgs: [
        [
            "**Correct usage:** \n``%USAGE``\n*%REQUIRED_ARG_KEY\n%UNREQUIRED_ARG_KEY*\n\n**Examples:**\n``%EXAMPLES``"
        ],
        ["Incorrect usage for %COMMAND"]
    ],
    errorInCommand: [
        ["Please try again later"],
        ["There was an error while executing that command"]
    ],
    blacklistedGuild: [["This server is currently blacklisted for: %REASON"], null],
    blacklistedGuildNoReason: [["This server is currently blacklisted"], null],
    blacklistedUser: [
        ["You are currently blacklisted for: %REASON"],
        incorrectPermissions
    ],
    blacklistedUserNoReason: [["You are currently blacklisted"], incorrectPermissions],
    cooldown: [["This command can only be ran %AMOUNT times per %PERIOD"], null],
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

// Examples
settings.argExamples = {
    single: ["car", "dog", "discord", "clap", "horses"],
    multiple: [
        "seventy seven steep steps",
        "hello from the other side",
        "henry the hoover",
        "this is an example!"
    ],
    number: [10, 100, false],
    interger: [10, 100, true],
    channelMention: ["#rules", "#general", "780045299698892801", "#welcome"],
    memberMention: ["@abisammy", "%CLIENT", "755080996088447057", "@hello"],
    userMention: ["@abisammy", "%CLIENT", "755080996088447057", "@hello"],
    time: ["24d 23h", "10s", "9000h", "40d"]
};

export default settings;
