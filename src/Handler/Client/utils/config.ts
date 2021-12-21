import { ColorResolvable } from "discord.js";
import {
    ArgExample,
    Blacklist,
    HelpCommand,
    Permission,
    Response
} from "../../Interfaces";

export class ClientConfig {
    public prefix: string;

    constructor(prefix: string) {
        this.prefix = prefix;
    }

    // General configs
    public useChatCommands: boolean = true;
    public botDevelopers: string[] = [];
    public autoRemoveCommands: boolean = true;
    public amountOfExamples: number = 2;

    // Message configs
    public messagesOrEmbeds: "messages" | "embeds" = "embeds";
    public indentMessageContent: boolean = false;
    public mainColor: ColorResolvable = "BLUE";
    public errorColor: ColorResolvable = "RED";
    public sendTimestamp: boolean = false;
    public embedIcon: string | false = false;
    public embedFooter: string | false = false;
    public sendMessageWithoutPermissions: boolean = true;

    // Slash commands
    public loadGuildSlashCommands: boolean = false;
    public slashCommandGuilds: string[] = [];
    public loadGlobalSlashCommands: boolean = false;

    // Checks and permissions
    public defaultClientChecks: string[] = [];
    public defaultUserChecks: string[] = [];
    public defaultClientPermissions: Permission[] = ["EMBED_LINKS", "SEND_MESSAGES"];
    public defaultUserPermissions: Permission[] = [];

    // blacklisted guildsa nd users
    public unBlacklistableUsers: string[] = ["DEVELOPERS"];

    // Logs and errors
    public logWarnings: boolean = true;
    public logMessages: boolean = true;
    public logDebugs: boolean = true;
    public logErrors: boolean = true;

    private incorrectPermissions = [
        "You do not have the permissions to run this command"
    ];

    // Responses
    // All have %COMMAND available
    public responses: Response = {
        developerOnly: [
            ["This command can only be ran by bot developers"],
            this.incorrectPermissions
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
            this.incorrectPermissions
        ],
        blacklistedUserNoReason: [
            ["You are currently blacklisted"],
            this.incorrectPermissions
        ],
        // Avialable values: %PERIOD, %AMOUNT
        cooldown: [["This command can only be ran %AMOUNT times per %PERIOD"], null],
        incorrectChannel: [
            ["This command cannot be ran in this channel"],
            this.incorrectPermissions
        ],
        incorrectGuild: [["This command cannot be ran in this server"], null],
        missingRoles: [
            ["You do not have the correct roles to run this command"],
            this.incorrectPermissions
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
    public argExamples: ArgExample = {
        single: ["car", "dog", "discord", "clap", "horses"],
        multiple: [
            "seventy seven steep steps",
            "hello from the other side",
            "henry the hoover",
            "this is an example!"
        ],
        number: [10, 2000, true], // Generate a random float1
        interger: [10, 2000, false], // Generate a random interger
        channelMention: ["#rules", "#general", "780045299698892801", "#welcome"],
        memberMention: ["@abisammy", "%CLIENT", "755080996088447057", "@hello"], // %CLIENT is replaced with the client mention
        userMention: ["@abisammy", "%CLIENT", "755080996088447057", "@hello"],
        time: ["24d 23h", "10s", "9000h", "40d"]
    };

    public helpCommand: HelpCommand = {
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
            "**%CAPITALISED_NAME |** __%DESCRIPTION__\n\n**Usage:**\n``%USAGE``\n*%REQUIRED_ARG_KEY, %UNREQUIRED_ARG_KEY*\n\n**Category: **``%CATEGORY``\n**Aliases: **``%ALL_ALIASES``\n**Cooldown: **``%COOLDOWN``\n**Server only: ** ``%GUILD_ONLY``"
        ]
    };
}
