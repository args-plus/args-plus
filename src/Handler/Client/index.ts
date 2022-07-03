import { Client } from "discord.js";
import { ClientSecrets } from "../Interfaces";
import ArgsPlusUtils from "./utils";
import ClientConfig from "./config";
import { ClientLoader, Item, ItemCollection } from "./loader";
import { Event } from "../Events";
import ClientConsole from "./console";

class ArgsPlusClient extends Client {
    public readonly config: ClientConfig;
    private readonly secrets: ClientSecrets;

    public readonly utils: ArgsPlusUtils;
    public readonly loader: ClientLoader;
    public readonly console: ClientConsole;

    public events: ItemCollection<Event, "array"> = [];

    constructor(config: ClientConfig, secrets: ClientSecrets) {
        super(config.discord);
        this.config = config;
        this.secrets = secrets;
        this.console = new ClientConsole(config);
        this.utils = new ArgsPlusUtils();
        this.loader = new ClientLoader(this);
        this.console.debug("Created client");
    }

    private getToken(): string | undefined {
        const { secrets } = this;
        const returnEnv = (): string | undefined => {
            return process.env.DISCORD_CLIENT_TOKEN;
        };
        if (secrets.allEnv) {
            return returnEnv();
        } else {
            if (secrets.DISCORD_CLIENT_TOKEN === "ENV") {
                return returnEnv();
            } else {
                return secrets.DISCORD_CLIENT_TOKEN;
            }
        }
    }

    public async init() {
        this.console.debug("Attempting login...");
        const login = await this.login(this.getToken());
        if (this.user) {
            this.console.info(`Logged in as ${this.user.tag}`);
        }
        return login;
    }

    private enableEvents() {
        for (const event of this.events) {
            if (!event.getLoaded()) {
                this.on(event.name, event.run.bind(null, this));
                event.setLoaded();
                this.console.debug(`Loaded event ${event.name} from ${event.dir}`);
            }
        }
    }

    public async registerEvents(dirs: string[] = ["/Events"]) {
        this.console.debug("Registering events...");
        await this.loader.loadItems(this.events, Event, dirs);
        this.enableEvents();
        return true;
    }
}

export default ArgsPlusClient;
export { ClientConfig, Item };
