import { ColorResolvable } from "discord.js";
import { Blacklist, Permission, Response } from "../Interfaces";

export class ClientConfig {
    public prefix: string;

    public token: string = "";
    public mongoURI: string = "";

    constructor(prefix: string) {
        this.prefix = prefix;
    }

    public messagesOrEmbeds: "messages" | "embeds" = "embeds";
    public mainColor: ColorResolvable = "BLUE";
    public errorColor: ColorResolvable = "RED";
    public sendTimestamp: boolean = false;
    public embedIcon: string | false = false;
    public embedFooter: string | false = false;
    public sendMessageWithoutPermissions: boolean = true;
    public loadGuildSlashCommands: boolean = false;
    public slashCommandGuilds: string[] = [];
    public loadGlobalSlashCommands: boolean = false;
    public useChatCommands: boolean = true;
    public defaultClientChecks: string[] = [];
    public defaultUserChecks: string[] = [];
    public defaultClientPermissions: Permission[] = [];
    public defaultUserPermissions: Permission[] = [];
    public indentMessageContent: boolean = false;
    public botDevelopers: string[] = [];
    public helpCommandCategoryDescription: boolean = true;
    public helpCommandAliases: boolean = true;
    public helpCommandCommandDescription: boolean = true;
    public blacklistedGuilds: Blacklist[] = [];
    public blacklistedUsers: Blacklist[] = [];
    public logWarnings: boolean = true;
    public logMessages: boolean = true;
    public logDebugs: boolean = true;
    public logErrors: boolean = true;
    public autoRemoveCommands: boolean = true;
    public responses: Response = {
        developerOnly: [
            ["This command can only be ran by bot developers"],
            ["You do not have the permissions to run this command"]
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
        blacklistedGuildNoReason: [
            ["This server is currently blacklisted"],
            null
        ],
        blacklistedUser: [
            ["You are currently blacklisted for %REASON"],
            ["You do not have the permissions to run this command"]
        ],
        blacklistedUserNoReason: [
            ["You are currently blacklisted"],
            ["You do not have the permissions to run this command"]
        ],
        cooldown: [
            ["This command has a %AMOUNT cooldown!\nYou have %TIMELEFT left!"],
            null
        ],
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
            ["I am missing the %PERMISSION permission to run this command"],
            null
        ],
        missingUserPermissions: [
            ["You are missing the %PERMISSION permission to run this command"],
            ["You do not have the permissions to run this command"]
        ]
    };
}
