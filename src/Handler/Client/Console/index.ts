import { ClientConfig } from "../settings";
import ExtendedClient from "../index";

export class Console {
    public client: ExtendedClient;
    public config: ClientConfig;

    constructor(client: ExtendedClient) {
        this.client = client;
        this.config = client.config;
    }

    public warn(warning: string) {
        if (this.config.logWarnings) {
            return console.warn(`Warning: ${warning}`);
        } else {
            return false;
        }
    }

    public log(log: string) {
        if (this.config.logMessages) {
            return console.log(log);
        } else {
            return false;
        }
    }

    public debug(debug: string) {
        if (this.config.logDebugs) {
            return console.debug(debug);
        } else {
            return false;
        }
    }

    public error(error: string) {
        if (this.config.logErrors) {
            return console.error(error);
        } else {
            return false;
        }
    }
}
