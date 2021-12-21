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
    public defaultClientPermissions: Permission[] = [];
    public defaultUserPermissions: Permission[] = [];

    // Help command settings
    public helpCommandCategoryDescription: boolean = true;
    public helpCommandAliases: boolean = true;
    public helpCommandCommandDescription: boolean = true;

    // blacklisted guildsa nd users
    public unBlacklistableUsers: string[] = [];

    // Logs and errors
    public logWarnings: boolean = true;
    public logMessages: boolean = true;
    public logDebugs: boolean = true;
    public logErrors: boolean = true;

    // Responses
    // All have %COMMAND available
    public responses: Response = {
        developerOnly: [
            ["This command can only be ran by bot developers"],
            ["You do not have the permissions to run this command"]
        ],
        disabledCommand: [["This command has been disabled by my developers"], null],
        guildOnly: [["This command can only be ran in a server"], null],
        incorrectArgs: [["Correct usage: %USAGE"], ["Incorrect usage for %COMMAND"]], // Available values: %USAGE, %REQUIRED_ARG_KEY, %UNREQUIRED_ARG_KEY, %EXAMPLES
        errorInCommand: [
            // Available values: %ERROR
            ["Please try again later"],
            ["There was an error while executing that command"]
        ],
        blacklistedGuild: [["This server is currently blacklisted for: %REASON"], null], // Available values: %REASON
        blacklistedGuildNoReason: [["This server is currently blacklisted"], null],
        blacklistedUser: [
            ["You are currently blacklisted for %REASON"], // Available values: %REASON
            ["You do not have the permissions to run this command"]
        ],
        blacklistedUserNoReason: [
            ["You are currently blacklisted"],
            ["You do not have the permissions to run this command"]
        ],
        cooldown: [["This command can only be ran %AMOUNT per %PERIOD"], null], // Avialable values: %PERIOD, %AMOUNT
        incorrectChannel: [
            ["This command cannot be ran in this channel"],
            ["You do not have the permissions to run this command"]
        ],
        incorrectGuild: [["This command cannot be ran in this server"], null],
        missingRoles: [
            ["You do not have the correct roles to run this command"],
            ["You do not have the permissions to run this command"]
        ],
        missingClientPermissions: [
            ["I am missing the %PERMISSION permission to run this command"], // Available values: %PERMISSION
            null
        ],
        missingUserPermissions: [
            ["You are missing the %PERMISSION permission to run this command"], // Available values: %PERMISSION
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
        beginingParagraph: [
            "**Help**\nShowing commands you can use. To run a command use %PREFIXUSED help command for a specific command"
        ], // Available values: %PREFIX_USED
        endParagraph: ["\n\nI mean it is pretty customisable"], // Available values: %PREFIX_USED
        category: ["\n\n**%NAME**: *%DESCRIPTION*"], // Available values: %NAME, %DESCRIPTION
        command: ["\n``%PREFIX``**%NAME** %ALIASES %DESCRIPTION"], // Available values: %PREFIX, %NAME, %ALIASES, %ALWAYS_ALIASES %USAGE, %ARGS, %DESCRIPTION, %ALWAYS_DESCRIPTION
        detailedCommand: [
            "**%NAME**\n%DESCRIPTION%ALIASES%HIDDEN_ALIASES%GUILD_ONLY%COOLDOWN"
        ], // Available values: %NAME, %DESCRIPTION, %ALIASES, %HIDDEN_ALIASES, %GUILD_ONLY, %1EXAMPLE, %2EXAMPLE, %3EXAMPLE, %EXAMPLES, %COOLDOWN
        noCategory: ["\n**Commands without a category**"],
        detailedCategory: ["%NAME%DESCRIPTION%COMMANDS"] // Available values: %NAME, %DESCRIPTION, %COMMANDS
    };
}
