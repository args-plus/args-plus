import { ClientConfig } from ".";

enum ConsoleOptions {
    reset = 0,
    bright = 1,
    dim = 2,
    underscore = 4,
    blink = 5,
    reverse = 7,
    hidden = 8
}

enum FGColours {
    black = 30,
    red = 31,
    green = 32,
    yellow = 33,
    blue = 34,
    magenta = 35,
    cyan = 36,
    white = 37
}

enum BGColours {
    black = 40,
    red = 41,
    green = 42,
    yellow = 43,
    blue = 44,
    magenta = 45,
    cyan = 46,
    white = 47
}

type FGColour = keyof typeof FGColours;
type BGColour = keyof typeof BGColours;
type ConsoleOption = keyof typeof ConsoleOptions;

export default class ClientConsole {
    public readonly config: ClientConfig;
    constructor(config: ClientConfig) {
        this.config = config;
    }

    public getFGColor(color: FGColour) {
        return `\x1b[${FGColours[color]}m`;
    }

    public getBGColor(color: BGColour) {
        return `\x1b[${BGColours[color]}m`;
    }

    public getConsoleOption(color: ConsoleOption) {
        return `\x1b[${ConsoleOptions[color]}m`;
    }

    public logColour(FGColour: FGColour, BGColour?: BGColour, options?: ConsoleOption[]) {
        let consoleOptions = "";
        if (options)
            for (const option of options) {
                consoleOptions += this.getConsoleOption(option);
            }
        let bgColour = "";
        if (BGColour) bgColour = this.getBGColor(BGColour);
        return (
            this.getFGColor(FGColour) +
            bgColour +
            consoleOptions +
            "%s" +
            this.getConsoleOption("reset")
        );
    }

    private getLogMessage(string: string) {
        return JSON.stringify(string).replace(/"/g, "");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public info(message: any) {
        if (this.config.logInfo) {
            console.info(
                this.logColour("green"),
                `[Args Plus] Info: ${this.getLogMessage(message)}`
            );
        }
    }

    public log = this.info;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public debug(message: any) {
        if (this.config.logDebug) {
            console.debug(
                this.logColour("yellow"),
                `[Args Plus] Debug: ${this.getLogMessage(message)}`
            );
        }
    }
}
