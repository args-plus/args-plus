import {
    Guild,
    GuildMember,
    MessageMentions,
    TextBasedChannels,
    User,
} from "discord.js";

export class commandRan {
    public type: "SLASH" | "MESSAGE";
    public guild: Guild;
    public author: User;
    public channel: TextBasedChannels;
    public member: GuildMember;
    public content: string;
    public mentions: MessageMentions;
}
