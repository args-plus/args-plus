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

export type ReturnTime = [
    boolean,
    string,
    "SECONDS" | "MINUTES" | "HOURS" | "DAYS" | "WEEKS" | "MONTHS" | "YEARS",
    number
];

export type TimeEnding = [
    string,
    "SECONDS" | "MINUTES" | "HOURS" | "DAYS" | "WEEKS" | "MONTHS" | "YEARS",
    number
];
