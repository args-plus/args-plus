import { ColorResolvable } from "discord.js";
import { Blacklist, Permission } from "../Interfaces";

export class ClientConfig {
    public prefix: string;

    public token: string = "";
    public mongoURI: string = "";

    constructor(prefix: string) {
        this.prefix = prefix;
    }

    public messagesOrEmbeds: "messages" | "embeds" = "embeds";
    public mainColor: ColorResolvable = "#ffffff";
    public errorColor: ColorResolvable = "#ff0000";
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
    public blacklistedGuilds: Blacklist[] = [];
    public blacklistedUsers: Blacklist[] = [];
    public sendErrorMessages: boolean = true;
    public logWarnings: boolean = true;
    public logMessages: boolean = true;
    public logDebugs: boolean = true;
    public logErrors: boolean = true;
}
