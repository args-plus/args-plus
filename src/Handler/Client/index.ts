import { Client as DJSClient, ClientOptions, Collection } from "discord.js";
import dotenv from "dotenv";
import { ClientConfig } from "./utils/config";
export { ClientConfig } from "./utils/config";
import { ClientConsole } from "./instances/console";
import settings from "../../settings";
import { ClientUtils } from "./utils/utils";
import { Command } from "../Commands";
import { ClientLoader } from "./instances/loader";
import { ClientMongo } from "./utils/mongo";
import { CommandManager } from "./instances/command";
import { Event } from "../Events";
import { Category } from "../Commands/category";
import { ClientConfigurations } from "./utils/configurations";
import { Configuration } from "../Defaults/Schemas";
import { Check } from "../Checks";
import { ClientChecks } from "./instances/checks";
import { SlashCommandManager } from "./instances/slashCommand";
import { PostCommandFunction, PreCommandFunction } from "../Commands/functions";
import { Extension } from "../Extensions";
import { DisabledCommandManager } from "./instances/disabledCommands";
import { ClientBlacklists } from "./instances/blacklistedUsers";

export class Client extends DJSClient {
    private readonly clientToken: string;
    private readonly mongoURI: string;

    readonly config: ClientConfig;

    private connectedToMongo = false;

    public getConnected() {
        return this.connectedToMongo;
    }

    public setConnected() {
        this.connectedToMongo = true;
    }

    public utils = new ClientUtils(this);
    public console = new ClientConsole(this);
    public loader = new ClientLoader(this);
    public mongo = new ClientMongo(this);
    public configurations = new ClientConfigurations(this);
    public checks = new ClientChecks(this);
    public commandManager = new CommandManager(this);
    public slashCommandManager = new SlashCommandManager(this);
    public disabledCommands = new DisabledCommandManager(this);
    public blacklists = new ClientBlacklists(this);

    public commands: Collection<string, Command> = new Collection();
    public aliases: Collection<string, Command> = new Collection();
    public categories: Collection<string, Category> = new Collection();
    public events: Event[] = [];

    public clientChecks: Collection<string, Check> = new Collection();
    public userChecks: Collection<string, Check> = new Collection();

    public preCommandFunctions: PreCommandFunction[] = [];
    public postCommandFunctions: PostCommandFunction[] = [];

    public extensions: Extension[] = [];

    // prettier-ignore
    public cachedConfigurations: Collection<string, Configuration> = new Collection();

    public cachedGuildPrefixes: Collection<string, string> = new Collection();

    readonly blacklistedGuildIds: string[] = [];
    readonly blacklistedUserIds: string[] = [];

    constructor(options: ClientOptions, token: string | boolean, mongoURI?: string) {
        super(options);

        if (typeof token === "boolean") {
            dotenv.config();

            if (process.env.token && process.env.mongoURI) {
                this.clientToken = process.env.token;
                this.mongoURI = process.env.mongoURI;
            } else {
                throw new Error(
                    'Could not find environment variables with "token" or "mongoURI"'
                );
            }
        } else {
            this.clientToken = token;

            if (!mongoURI) {
                throw new Error("A mongo URI was not provided");
            }

            this.mongoURI = mongoURI;
        }

        this.config = settings;

        for (const blacklistedGuild of this.config.blacklistedGuilds) {
            this.blacklistedGuildIds.push(blacklistedGuild.id);
        }
        for (const blacklistedUser of this.config.blacklistedUsers) {
            this.blacklistedUserIds.push(blacklistedUser.id);
        }
    }

    public async registerDefaultCommands() {
        await this.loader.loadItems(this.categories, Category, ["/Commands"]);
        this.commandManager.loadCategories();

        await this.loader.loadItems(this.commands, Command, ["/Commands"]);
        this.commandManager.loadCommands();

        await this.loadSlashCommands();
        await this.disabledCommands.init();

        return true;
    }

    public async registerCommands(dirs: string[] = ["/Commands"]) {
        await this.loader.loadItems(this.categories, Category, dirs);
        this.commandManager.loadCategories();

        await this.loader.loadItems(this.commands, Command, dirs);
        this.commandManager.loadCommands();

        await this.loadSlashCommands();
        await this.disabledCommands.init();

        return true;
    }

    public async loadCommand(command: Command) {
        command.setRegistered();
        this.commands.set(command.name, command);

        this.commandManager.loadCommands();

        await this.loadSlashCommands();
        await this.disabledCommands.init();

        return true;
    }

    public async loadSlashCommands() {
        return await this.slashCommandManager.loadSlashCommands();
    }

    public loadCategory(category: Category) {
        category.setRegistered();
        this.categories.set(category.name, category);

        this.commandManager.loadCategories();

        return true;
    }

    private enableEvents() {
        for (const event of this.events) {
            if (!event.getLoaded()) {
                this.on(event.name, event.run.bind(null, this));
                event.setLoaded();
            }
        }
    }

    public async registerDefaultEvents() {
        await this.loader.loadItems(this.events, Event, ["/Handler/Defaults/Events"]);
        this.enableEvents();
        return true;
    }

    public async registerEvents(dirs: string[] = ["/Events"]) {
        await this.loader.loadItems(this.events, Event, dirs);
        this.enableEvents();
        return true;
    }

    public loadEvent(event: Event) {
        this.events.push(event);
        this.enableEvents();
        return true;
    }

    public async connectToMongo() {
        return await this.mongo.connect(this.mongoURI);
    }

    public async loadConfigurations(autoConnectToMongo = true) {
        return await this.configurations.init(autoConnectToMongo, this.mongoURI);
    }

    public async loadClientChecks(dirs: string[] = ["/Checks/client"]) {
        await this.loader.loadItems(this.clientChecks, Check, dirs);
    }

    public async loadUserChecks(dirs: string[] = ["/Checks/user"]) {
        await this.loader.loadItems(this.userChecks, Check, dirs);
    }

    public async loadChecks(
        clientDirs: string[] = ["/Checks/client"],
        userDirs: string[] = ["/Checks/user"]
    ) {
        await this.loadClientChecks(clientDirs);
        await this.loadUserChecks(userDirs);
    }

    public async loadPreCommandFunctions(dirs: string[] = ["/CommandUtils/preCommand"]) {
        await this.loader.loadItems(this.preCommandFunctions, PreCommandFunction, dirs);
    }

    public async loadPostCommandFunctions(
        dirs: string[] = ["/CommandUtils/postCommand"]
    ) {
        await this.loader.loadItems(this.postCommandFunctions, PostCommandFunction, dirs);
    }

    public async loadCommandFunctions(
        preDirs: string[] = ["/CommandUtils/preCommand"],
        postDirs: string[] = ["/CommandUtils/postCommand"]
    ) {
        await this.loadPreCommandFunctions(preDirs);
        await this.loadPostCommandFunctions(postDirs);
    }

    public async loadExtensions(dirs: string[] = ["/Extensions"], runExtensions = true) {
        await this.loader.loadItems(this.extensions, Extension, dirs);

        if (runExtensions) {
            await this.runExtensions();
        }
    }

    public async runExtensions() {
        for (const extension of this.extensions) {
            this.console.log(`Loaded extension: ${extension.name}`);

            await extension.run(this);
        }
    }

    public async loadBlacklists(autoConnectToMongo?: boolean, mongoURI?: string) {
        await this.blacklists.init(autoConnectToMongo, mongoURI);
    }

    public async init(
        loadAll = true,
        loadChecks = true,
        loadCommandFunctions = true,
        loadCommands = true,
        connectToMongo = true,
        loadConfigurations = true,
        loadBlacklists = true,
        loadEvents = true,
        loadExtensions = true
    ) {
        const { clientToken: token } = this;

        await this.login(token);

        if (loadChecks || loadAll) {
            await this.loadChecks();
        }

        if (loadCommandFunctions || loadAll) {
            await this.loadCommandFunctions();
        }

        if (loadEvents || loadAll) {
            await this.registerDefaultEvents();
            await this.registerEvents();
        }

        if (connectToMongo || loadAll) {
            await this.connectToMongo();
        }

        if (loadBlacklists || loadAll) {
            await this.loadBlacklists();
        }

        if (loadCommands || loadAll) {
            await this.registerDefaultCommands();
        }

        if (loadConfigurations || loadAll) {
            await this.loadConfigurations();
        }

        if (loadExtensions || loadAll) {
            await this.loadExtensions();
        }
    }
}
