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
// Use DEVELOPERS for bot developers
settings.unBlacklistableUsers = ["DEVELOPERS"];

// Logs and errors
settings.logErrors = true;
settings.logWarnings = true;
settings.logMessages = true;
settings.logDebugs = true;

// Arg keys
settings.requiredArgKeys = ["<", ">"];
settings.unrequiredArgKeys = ["(", ")"];

const incorrectPermissions = ["You do not have the permissions to run this command"];

// Responses
// All have %COMMAND available as a subsitution
settings.responses = {
    developerOnly: [
        ["This command can only be ran by bot developers"],
        incorrectPermissions
    ],
    disabledCommand: [["This command has been disabled by my developers"], null],
    guildOnly: [["This command can only be ran in a server"], null],
    // Available values: %USAGE, %REQUIRED_ARG_KEY, %UNREQUIRED_ARG_KEY, %EXAMPLES
    incorrectArgs: [
        [
            "**Correct usage:** \n``%USAGE``\n*%REQUIRED_ARG_KEY\n%UNREQUIRED_ARG_KEY*\n\n**Examples:**\n``%EXAMPLES``"
        ],
        ["Incorrect usage for %COMMAND"]
    ],
    // Avialable values: %ERROR
    errorInCommand: [
        ["Please try again later"],
        ["There was an error while executing that command"]
    ],
    // Avaialable values: %REASON
    blacklistedGuild: [["This server is currently blacklisted for: %REASON"], null],
    blacklistedGuildNoReason: [["This server is currently blacklisted"], null],
    // Avaialable values: %REASON
    blacklistedUser: [
        ["You are currently blacklisted for: %REASON"],
        incorrectPermissions
    ],
    blacklistedUserNoReason: [["You are currently blacklisted"], incorrectPermissions],
    // Avialable values: %PERIOD, %AMOUNT
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
    // Available values: %PERMISSION
    missingClientPermissions: [
        ["I am missing the %PERMISSION permission to run this command"],
        null
    ],
    // Available values: %PERMISSION
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
    // Generate a random float betweem 10 and 2000
    number: [10, 2000, false],
    // Generate a random interger between 10 and 2000
    interger: [10, 2000, true],
    channelMention: ["#rules", "#general", "780045299698892801", "#welcome"],
    // %CLIENT is replaced with @client username
    memberMention: ["@abisammy", "%CLIENT", "755080996088447057", "@hello"],
    userMention: ["@abisammy", "%CLIENT", "755080996088447057", "@hello"],
    time: ["24d 23h", "10s", "9000h", "40d"]
};

settings.helpCommand = {
    // Available values: %PREFIX_USED
    beginingParagraph: [
        "**Help**\nUse ``%PREFIX_USEDhelp`` to view all the available commands. \nUse ``%PREFIX_USEDhelp (command name)`` to view help for a specific command and ``%PREFIX_USEDhelp (category name)`` to view help for a scpeific category.\n\n__**Showing the commands you can use**__"
    ],
    // Available values: %PREFIX_USED
    endParagraph: [""],
    // Available values: %NAME, %DESCRIPTION
    category: ["\n\n**%NAME |** __%DESCRIPTION__"],
    // Available values: %PREFIX, %NAME, %ALIASES, %ALWAYS_ALIASES %USAGE, %ARGS, %DESCRIPTION, %ALWAYS_DESCRIPTION
    noCategory: ["\n**Comands with no category**"],
    command: ["\n``%PREFIX``**%NAME** %ALIASES - %ALWAYS_DESCRIPTION"],
    // Available values: %NAME, %DESCRIPTION, %COMMANDS
    detailedCategory: [
        "**%NAME |** __%DESCRIPTION__\n\n**__Available commands__**%COMMANDS"
    ],
    // Available values: %NAME, %PREFIX_USED, %USAGE, %REQUIRED_ARG_KEY, %UNREQUIRED_ARG_KEY, %ARGS, %CAPITALISED_NAME, %DESCRIPTION, %ALIASES, %CATEGORY, %HIDDEN_ALIASES, %ALL_ALIASES, %GUILD_ONLY, %1EXAMPLE, %2EXAMPLE, %3EXAMPLE, %EXAMPLES, %COOLDOWN
    detailedCommand: [
        "**%CAPITALISED_NAME |** __%DESCRIPTION__\n\n**Usage:**\n``%USAGE``\n*%REQUIRED_ARG_KEY, %UNREQUIRED_ARG_KEY*\n\n**Category: **``%CATEGORY``\n**Aliases: **``%ALL_ALIASES``\n**Cooldown: **``%COOLDOWN``\n**Server only: ** ``%GUILD_ONLY``\n\n**Examples**\n``%2EXAMPLE``"
    ]
};

export default settings;
