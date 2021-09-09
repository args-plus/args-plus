import { ClientEvents } from "discord.js";
import { EventRun } from "../../Interaces";

export class Event {
    public name: keyof ClientEvents;
    public run: EventRun;
}
