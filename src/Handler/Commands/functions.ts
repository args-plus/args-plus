import { Client } from "discord.js";
import { Item } from "../Client/instances/loader";
import { ReturnCommand } from "./returnCommand";

export class PreCommandFunction extends Item {
    public run: (client: Client, command: ReturnCommand) => void | false = () => {
        console.log(`Change your run method for the pre run function: ${this.name}`);
    };
}

export class PostCommandFunction extends Item {
    public run: (client: Client, command: ReturnCommand) => void = () => {
        console.log(`Change your run method for the pre run function: ${this.name}`);
    };
}
