import { Client } from "discord.js";
import { Item } from "../Client/instances/loader";
import { ReturnCommand } from "./returnCommand";

export class PreCommandFunction extends Item {
    public run: (client: Client, command: ReturnCommand) => void | false = () => {};
}

export class PostCommandFuntcion extends Item {
    public run: (client: Client, command: ReturnCommand) => void = () => {};
}
