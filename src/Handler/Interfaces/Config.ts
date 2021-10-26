import { ColorResolvable } from "discord.js";
import { Permission } from "./Permissions";

export interface Blacklist {
    id: string;
    reason?: string;
}
