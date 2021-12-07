import { Channel, Guild, GuildMember, User } from "discord.js";

export type checkOptions = {
    member?: GuildMember;
    user?: User;
    channel?: Channel;
    guild?: Guild;
};

export interface Run {
    (checkOptions: checkOptions, ...options: any[]): boolean;
}
