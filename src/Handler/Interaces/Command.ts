import {
    Channel,
    CommandInteraction,
    GuildMember,
    Interaction,
    Message,
    StickerResolvable,
    User,
} from "discord.js";
import { Command } from "../Client/Commands/command";

export type commandRan = {
    message: Message | null;
    slashCommand: CommandInteraction | null;
};

export interface Run {
    (args: ReturnArgument[], commandRan: commandRan, commandClass: Command);
}

type argType =
    | "single"
    | "multiple"
    | "interger"
    | "number"
    | "userMention"
    | "channelMention"
    | "memberMention"
    | "time";

export interface Argument {
    name: string;
    type: argType;
    displayName?: string;
    required?: boolean;
    description?: string;
    id?: string;
}

export interface ReturnArgument {
    name: string;
    type: argType;
    id: string;
    text: string | null;
    channelMention?: Channel | null;
    guildMemberMention?: GuildMember | null;
    userMention?: User | null;
    stringValue?: string | null;
    numberValue?: number | null;
    stringArrayValue?: string[] | null;
}

export type ReturnTime =
    | false
    | [
          boolean,
          string,
          "SECONDS" | "MINUTES" | "HOURS" | "DAYS" | "WEEKS" | "YEARS",
          number
      ];

export type TimeEnding = [
    string,
    "SECONDS" | "MINUTES" | "HOURS" | "DAYS" | "WEEKS" | "YEARS",
    number
];

export type Cooldown = {
    userID: string;
    cooldown: number;
    lastRan: number;
};
