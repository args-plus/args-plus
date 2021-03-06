import { Client } from "..";

export class ClientConsole {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    public warn(warning: string) {
        const { config } = this.client;

        if (config.logWarnings) {
            return console.warn("Warning: " + warning);
        } else {
            return false;
        }
    }

    public log(log: string) {
        const { config } = this.client;

        if (config.logMessages) {
            return console.log(log);
        } else {
            return false;
        }
    }

    public debug(debug: string, trace = false) {
        const { config } = this.client;

        if (config.logDebugs) {
            if (trace) {
                console.trace(debug);
            } else {
                console.debug(debug);
            }
        } else {
            return false;
        }
    }

    public error(error: string, stack = true) {
        const { config } = this.client;

        if (config.logErrors) {
            if (stack) {
                const errorMessage = new Error(error);
                errorMessage.stack;
                console.error(errorMessage);
            } else {
                console.error("Error: " + error);
            }
        } else {
            return false;
        }
    }
}
