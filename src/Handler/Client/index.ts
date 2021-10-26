import { Client, ClientOptions, Collection } from "discord.js";
import { Utils } from "../Utils";
import {
    Command,
    PostCommandFunction,
    PreCommandFunction,
    CommandManager
} from "../Commands";
import { Event } from "../Events";
import { ItemLoader } from "./ClientLoader";
import { Console } from "./Console";
import { ClientConfig } from "./config";
import { Check, CheckManger } from "../Checks";
import { Configuration } from "../Defaults/Schemas";
import { MongoManager } from "./MongoHandler";
import { ConfigurationManager } from "./Configurations";
import { Extension } from "../Extensions";
import mongoose from "mongoose";

export { ClientConfig } from "./config";

export class ExtendedClient extends Client {
    public config: ClientConfig;

    public utils = new Utils(this);
    public items = new ItemLoader(this);
    public console: Console = new Console(this);
    public checks = new CheckManger(this);
    public commandManager = new CommandManager(this);
    public mongo = new MongoManager(this);
    public configurations = new ConfigurationManager(this);

    public connection: typeof mongoose = mongoose;
    public connectedToMongo: boolean = false;

    public clientChecks: Collection<string, Check> = new Collection();
    public userChecks: Collection<string, Check> = new Collection();

    public commands: Collection<string, Command> = new Collection();
    public aliases: Collection<string, Command> = new Collection();
    public categories: Collection<string, string> = new Collection();
    public commandCategories: Collection<string, Command[]> = new Collection();
    public emptyCategories: Command[] = [];
    public events: Event[] = [];
    public cachedConfigurations: Collection<string, Configuration> =
        new Collection();
    public cachedGuildPrefixes: Collection<string, string> = new Collection();
    public preCommandFunctions: Collection<string, PreCommandFunction> =
        new Collection();
    public postCommandFunctions: Collection<string, PostCommandFunction> =
        new Collection();

    public blacklistedGuildIds: string[] = [];
    public blacklistedUserIds: string[] = [];

    public extensions: Extension[] = [];

    constructor(options: ClientOptions) {
        super(options);

        const config = this.items.loadSettings();

        if (config == null) {
            throw new Error(
                'Missing environment variables: "token" or "mongoURI" or missing settings'
            );
        }

        this.config = config;

        for (const blacklistedGuild of config.blacklistedGuilds) {
            this.blacklistedGuildIds.push(blacklistedGuild.id);
        }
        for (const blacklistedUser of config.blacklistedUsers) {
            this.blacklistedUserIds.push(blacklistedUser.id);
        }
    }

    public async init() {
        const { items, console, utils } = this;

        console.client = this;
        console.config = this.config;
        items.client = this;
        utils.client = this;
        this.checks.client = this;
        this.commandManager.client = this;
        this.mongo.client = this;

        this.login(this.config.token);

        await items.loadItems(this.clientChecks, Check, [
            "/Handler/Defaults/ClientChecks"
        ]);

        await items.loadItems(this.userChecks, Check, [
            "/Handler/Defaults/UserChecks"
        ]);

        items.loadChecks();

        await items.loadItems(this.events, Event, [
            "/Handler/Defaults/Events",
            "/Events"
        ]);

        items.loadEvents();

        await items.loadItems(this.commands, Command, [
            "/Handler/Defaults/Commands"
        ]);

        items.loadCommands();

        items.loadCateogires();

        await items.loadItems(this.preCommandFunctions, PreCommandFunction, [
            "/CommandUtils/PreCommand"
        ]);

        await items.loadItems(this.postCommandFunctions, PostCommandFunction, [
            "/CommandUtils/PostCommand"
        ]);

        await this.mongo.connect();
        await this.configurations.init();

        await items.registerSlashCommands();

        await items.loadItems(this.extensions, Extension, [
            "/Handler/Defaults/Extensions"
        ]);

        await items.runExtensions();
    }
}

export default ExtendedClient;
