import { BitFieldResolvable, ClientOptions, IntentsString } from "discord.js";

export default class ArgsPlusConfig {
    public discord: ClientOptions = { intents: [] };
    constructor(intents: BitFieldResolvable<IntentsString, number>) {
        this.discord.intents = intents;
    }

    public logInfo = true;
    public logDebug = true;
}
