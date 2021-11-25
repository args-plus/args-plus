import { ColorResolvable } from "discord.js";
import { Permission } from "./Permissions";

export interface Blacklist {
    id: string;
    reason?: string;
}

type ResponseElement = [string[], string[] | null];

export interface Response {
    missingRoles: ResponseElement;
    missingClientPermissions: ResponseElement;
    missingUserPermissions: ResponseElement;
    guildOnly: ResponseElement;
    blacklistedUser: ResponseElement;
    blacklistedUserNoReason: ResponseElement;
    blacklistedGuild: ResponseElement;
    blacklistedGuildNoReason: ResponseElement;
    errorInCommand: ResponseElement;
    developerOnly: ResponseElement;
    disabledCommand: ResponseElement;
    incorrectChannel: ResponseElement;
    incorrectGuild: ResponseElement;
    cooldown: ResponseElement;
    incorrectArgs: ResponseElement;
}
