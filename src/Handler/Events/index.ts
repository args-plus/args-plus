import { ClientEvents } from "discord.js";
import Client, { Item } from "../Client";

interface Run {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client: Client, ...args: any[]): any;
}

export class Event extends Item {
    public run: Run = () => {
        console.log(`Cahnge your run method for the event: ${this.name}`);
    };

    constructor(name: keyof ClientEvents) {
        super(name);
    }
}
