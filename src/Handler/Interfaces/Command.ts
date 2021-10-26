import {
    Channel,
    CommandInteraction,
    GuildMember,
    Message,
    User
} from "discord.js";
import ExtendedClient from "../Client";
import { Command, ReturnCommand } from "../Commands";

export type argType =
    | "single"
    | "multiple"
    | "interger"
    | "number"
    | "userMention"
    | "channelMention"
    | "memberMention"
    | "customValue"
    | "time";

export interface Argument {
    name: string;
    type: argType;
    displayName?: string;
    required?: boolean;
    description?: string;
    id?: string;
    customValues?: string[];
    allowLowerCaseCustomValue?: boolean;
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

export type ReturnTime = [
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

export type Run = (client: ExtendedClient, returnCommand: ReturnCommand) => any;
export type PreCommandRun = (client: ExtendedClient) => void | false;
export type PostCommandRun = (client: ExtendedClient) => void;
