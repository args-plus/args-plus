import { ClientEvents } from "discord.js";
import ExtendedClient from "../Client";
import { Item } from "../Client/ClientLoader";

interface Run {
    (client: ExtendedClient, ...args: any[]): any;
}

export class Event extends Item {
    public run: Run = () => {};

    constructor(name: keyof ClientEvents) {
        super(name);
    }
}
