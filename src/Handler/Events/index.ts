import { ClientEvents } from "discord.js";
import { Client } from "../Client";
import { Item } from "../Client/instances/loader";

interface Run {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client: Client, ...args: any[]): any;
}

export class Event extends Item {
    public run: Run = () => {
        console.log(`Cange your run method for the event: ${this.name}`);
    };

    constructor(name: keyof ClientEvents) {
        super(name);
    }
}
