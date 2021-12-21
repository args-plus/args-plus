export interface Blacklist {
    id: string;
    reason?: string;
}

export type ResponseElement = [string[], string[] | null];

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

export type ExampleElement = string[];

export interface ArgExample {
    single: ExampleElement;
    multiple: ExampleElement;
    interger: ExampleElement | [number, number, boolean];
    number: ExampleElement | [number, number, boolean];
    userMention: ExampleElement;
    channelMention: ExampleElement;
    memberMention: ExampleElement;
    time: ExampleElement;
}

export type HelpElement = string[];

export interface HelpCommand {
    beginingParagraph: HelpElement;
    endParagraph: HelpElement;
    command: HelpElement;
    category: HelpElement;
    noCategory: HelpElement;
    detailedCommand: HelpElement;
    detailedCategory: HelpElement;
}
