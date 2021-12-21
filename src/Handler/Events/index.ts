import { ClientEvents } from "discord.js";
import { Client } from "../Client";
import { Item } from "../Client/instances/loader";

interface Run {
    (client: Client, ...args: any[]): any;
}

export class Event extends Item {
    public run: Run = () => {};

    constructor(name: keyof ClientEvents) {
        super(name);
    }
}
