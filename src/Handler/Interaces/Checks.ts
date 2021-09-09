import {
    Channel,
    Guild,
    GuildMember,
    PartialDMChannel,
    TextBasedChannels,
    User,
    VoiceChannel,
} from "discord.js";

export type checkOptions = {
    member?: GuildMember;
    user?: User;
    channel?: Channel | TextBasedChannels | PartialDMChannel;
    guild?: Guild;
};

export interface Run {
    (checkOptions: checkOptions, ...options): boolean;
}
