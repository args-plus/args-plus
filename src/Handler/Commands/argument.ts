import { Channel, GuildMember, User } from "discord.js";
import { ClientUtils } from "../Client/utils/utils";
import { argType } from "../Interfaces";

export class Argument {
    readonly id: string;
    readonly name: string;
    readonly type: argType;
    readonly required: boolean;

    public description = "";
    public customValues: string[] = [];
    public allowLowerCaseCustomValues = false;
    public displayName = "";
    public useDefaultExamples = false;
    public customExamples: string[] = [];

    public setDescription(description = "") {
        this.description = description;
        return this;
    }

    public setCustomValues(customValues: string[] = []) {
        this.customValues = customValues;
        return this;
    }

    public setAllowLowerCaseValues(allow = true) {
        this.allowLowerCaseCustomValues = allow;
        return this;
    }

    public setDisplayName(name = "") {
        this.displayName = name;
        return this;
    }

    public setNoUseDefaultExamples(use = false) {
        this.useDefaultExamples = use;
        return this;
    }

    public setCustomExamples(examples: string[] = []) {
        this.customExamples = examples;
        return this;
    }

    private text = "";
    private channelMention: Channel | null = null;
    private guildMemberMention: GuildMember | null = null;
    private userMention: User | null = null;
    private stringValue = "";
    private numbervalue = 0;
    private stringArrayValue: string[] = [];

    private checkType(args: argType[]) {
        return args.includes(this.type);
    }

    private isType(method: string, args: argType[]) {
        const checkType = this.checkType(args);

        if (!checkType) {
            console.error(
                new Error(`There is no method to ${method} on arg type of ${this.type}`)
                    .stack
            );
        }

        return checkType;
    }

    constructor(name: string, type: argType, required = false) {
        this.name = name;
        this.id = ClientUtils.generateId(name);
        this.type = type;
        this.required = required;
    }

    public setTextValue(text: string) {
        this.text = text;
        return this;
    }

    public getText() {
        return this.text;
    }

    public setStringValue(string: string) {
        this.stringValue = string;
        return this;
    }

    public getStringValue() {
        return this.stringValue;
    }

    public setNumberValue(number: number) {
        if (!this.isType("set a number value", ["interger", "number", "time"]))
            return this;

        this.numbervalue = number;
        return this;
    }

    public getNumberValue() {
        if (!this.isType("get a number value", ["interger", "number", "time"]))
            return false;

        return this.numbervalue;
    }

    public setStringArrayValue(stringArray: string[]) {
        if (!this.isType("set a string array", ["multiple"])) return this;

        this.stringArrayValue = stringArray;
        return this;
    }

    public getStringArrayValue() {
        if (!this.isType("get a string array", ["multiple"])) return false;

        return this.stringArrayValue;
    }

    public setUserMention(user: User) {
        if (!this.isType("set a user value", ["userMention"])) return this;

        this.userMention = user;
        return this;
    }

    public getUserMention() {
        if (!this.isType("get a user value", ["userMention"])) return false;
        if (!this.userMention) {
            console.error(new Error("The user mention has not been set").stack);
            return false;
        }

        return this.userMention;
    }

    public setMemberMention(member: GuildMember) {
        if (!this.isType("set a member value", ["memberMention"])) return this;

        this.guildMemberMention = member;
        return this;
    }

    public getGuildMemberMention() {
        if (!this.isType("get a member value", ["memberMention"])) return false;

        if (!this.guildMemberMention) {
            console.error(new Error("The guild member mention has not been set").stack);
            return this;
        }

        return this.guildMemberMention;
    }

    public setChannelMention(channel: Channel) {
        if (!this.isType("set a channel value", ["channelMention"])) return this;

        this.channelMention = channel;
        return this;
    }

    public getChannelMention() {
        if (!this.isType("get a channel value", ["channelMention"])) return false;

        if (!this.channelMention) {
            console.error(new Error("The guild member mention has not been set").stack);
            return this;
        }

        return this.channelMention;
    }
}
