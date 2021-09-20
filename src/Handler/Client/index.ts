import { Client, Collection, MessageActionRow, User } from "discord.js";
import mongoose from "mongoose";
import path from "path";
import { Config, Cooldown } from "../Interaces";
import { Loader } from "./Managers/loader";
import { MessageSender } from "./Managers/sender";
import { Command } from "./Commands/command";
import { Check } from "./Commands/checks";
import { Utils } from "./Managers/utils";
import { Event } from "./Events/event";
import log4js from "log4js";
import { MongoHandler } from "./Managers/mongo";
import { ConfigurationsHandler } from "./Managers/configurations";
import { Configuration } from "../DefaultSchemas/configurations";
import { CommandManager } from "./Managers/command";
import { CheckManager } from "./Managers/checks";
import events from "events";

export class ExtendedClient extends Client {
    public commands: Collection<string, Command> = new Collection();
    public events: Collection<string, Event> = new Collection();
    public CommandsCooldowns: Collection<string, Cooldown> = new Collection();
    public aliases: Collection<string, Command> = new Collection();
    public clientChecks: Collection<string, Check> = new Collection();
    public userChecks: Collection<string, Check> = new Collection();
    public guildPrefixes: Collection<string, string> = new Collection();
    public categories: Collection<string, string> = new Collection();
    public commandCategories: Collection<string, Command[]> = new Collection();
    public cachedConfigurations: Collection<string, Configuration> =
        new Collection();
    public config: Config;
    public messageHandler = new MessageSender();
    public mongoHandler = new MongoHandler();
    public configurationHandler = new ConfigurationsHandler();
    public commandManager = new CommandManager();
    public checkManager = new CheckManager();
    public utils = new Utils();
    public loader = new Loader();
    public developers: User[] = [];
    public globalPrefix: string;
    public connection: typeof mongoose;
    public eventEmitter = new events.EventEmitter();

    constructor() {
        super({ intents: 32767, partials: ["CHANNEL"] });
        this.loader.client = this;

        const config = this.loader.loadSettings();

        if (config === false) {
            throw new Error(
                'config.json is missing properties "prefix", or .env is missing properties "token" or "mongoURI"'
            );
        }

        if (config.writeToLogFile) {
            log4js.configure({
                appenders: {
                    client: {
                        type: "multiFile",
                        base: "logs/",
                        property: "categoryName",
                        extension: ".log",
                    },
                    console: { type: "console" },
                    developer: {
                        type: "multiFile",
                        property: "categoryName",
                        extension: ".log",
                    },
                },
                categories: {
                    default: { appenders: ["client", "console"], level: "all" },
                    dev: { appenders: ["developer"], level: "debug" },
                },
            });
            const logger = log4js.getLogger("client");
            const developerLogger = log4js.getLogger("developer");

            console.debug = developerLogger.debug.bind(developerLogger);
            console.log = logger.info.bind(logger);
            console.info = developerLogger.info.bind(developerLogger);
            console.warn = developerLogger.warn.bind(developerLogger);
            console.error = developerLogger.error.bind(developerLogger);
            console.trace = developerLogger.trace.bind(developerLogger);
        }

        this.config = config;

        this.mongoHandler.client = this;

        this.configurationHandler.client = this;

        this.messageHandler.client = this;
        this.messageHandler.config = this.config;

        this.commandManager.client = this;

        this.globalPrefix = this.config.prefix;

        this.utils.client = this;

        this.checkManager.client = this;
    }

    public async init() {
        for (const permission of this.config.defaultClientPermissions) {
            if (!this.utils.validPermissions.includes(permission)) {
                return this.messageHandler.warn(
                    `Default client permission: ${permission} is an invalid permission flag!`
                );
            }
        }

        for (const permission of this.config.defaultUserPermissions) {
            if (!this.utils.validPermissions.includes(permission)) {
                return this.messageHandler.warn(
                    `Default user permission: ${permission} is an invalid permission flag!`
                );
            }
        }
        new Collection();
        this.loader.client = this;

        const defaultChecksDir = path.join(__dirname, "..", "DefaultChecks");
        const defaultChecksFiles = await this.utils.loadTSFiles(
            defaultChecksDir
        );

        for (const checkDir of defaultChecksFiles) {
            await this.loader.loadCheck(checkDir);
        }

        const checkFiles = await this.utils.loadTSFiles(
            path.join(__dirname, "..", "..", "Checks")
        );
        for (const checkFile of checkFiles) {
            await this.loader.loadCheck(checkFile);
        }

        this.emit("");

        if (this.config.defaultCommands === true) {
            const defaultCommandsPath = path.join(
                __dirname,
                "..",
                "DefaultCommands"
            );
            const defaultCommandFiles = await this.utils.loadTSFiles(
                defaultCommandsPath
            );

            for (const commandDir of defaultCommandFiles) {
                let commandDirArray = commandDir.split("/");
                const commandFile = commandDirArray[commandDirArray.length - 1];
                const settingInConfig = `default${commandFile.slice(
                    0,
                    -3
                )}Command`;
                if (this.config[settingInConfig] === true) {
                    await this.loader.loadCommand(commandDir);
                }
            }
        }

        const commandFiles = await this.utils.loadTSFiles(
            path.join(__dirname, "..", "..", "Commands")
        );
        for (const file of commandFiles) {
            await this.loader.loadCommand(file);
        }

        const defaultEventfiles = await this.utils.loadTSFiles(
            path.join(__dirname, "..", "DefaultEvents")
        );

        for (const eventDir of defaultEventfiles) {
            await this.loader.loadEvent(eventDir);
        }

        const eventFiles = await this.utils.loadTSFiles(
            path.join(__dirname, "..", "..", "Events")
        );
        for (const file of eventFiles) {
            await this.loader.loadEvent(file);
        }

        await this.login(this.config.token);

        if (this.config.botDevelopers !== "") {
            let botDevelopers = [];

            if (typeof this.config.botDevelopers === "string") {
                botDevelopers = [this.config.botDevelopers];
            } else {
                botDevelopers = this.config.botDevelopers;
            }

            for (const userId of this.config.botDevelopers) {
                const user = await this.users.fetch(userId).catch(() => {
                    this.messageHandler.warn(
                        `Unable to load developerUserId: "${userId}"`
                    );
                });
                if (!user) {
                    continue;
                } else if (this.developers.indexOf(user) !== -1) {
                    this.messageHandler.warn(
                        `Developer ID "${userId}" is registered more than once!`
                    );
                    continue;
                }
                this.developers.push(user);
            }
        }

        await this.mongoHandler.connect();
        await this.configurationHandler.init();

        await this.commandManager.init();

        const extensionFiles = await this.utils.loadTSFiles(
            path.join(__dirname, "..", "..", "Extensions")
        );
        for (const file of extensionFiles) {
            await this.loader.loadExtension(file);
        }

        const defaultExtensionFiles = await this.utils.loadTSFiles(
            path.join(__dirname, "..", "DefaultExtensions")
        );
        for (const file of defaultExtensionFiles) {
            await this.loader.loadExtension(file);
        }
        await this.loader.registerSlashCommands();

        this.eventEmitter.emit("fullyLoaded");
    }
}

export default ExtendedClient;
