import { Channel, Guild, GuildMember, User } from "discord.js";
import { Item } from "../Client/instances/loader";

export type checkOptions = {
    member?: GuildMember;
    user?: User;
    channel?: Channel;
    guild?: Guild;
};

export class Check extends Item {
    public requireMember = false;
    public requireUser = false;
    public requireChannel = false;
    public requireGuild = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public run: (checkOptions: checkOptions, ...options: any[]) => boolean = () => true;
}
