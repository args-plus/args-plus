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
    public allowLowerCaseCustomValues: boolean = true;
    public displayName = "";

    private text: string = "";
    private channelMention: Channel | null = null;
    private guildMemberMention: GuildMember | null = null;
    private userMention: User | null = null;
    private stringValue: string = "";
    private numbervalue: number = 0;
    private stringArrayValue: string[] = [];

    private written = false;

    public setWritten() {
        this.written = false;
    }

    private checkWritten() {
        if (this.written) {
            console.error(
                new Error(
                    `Argument: ${this.name} has been already written to and so cannot be modified`
                ).stack
            );
            return false;
        }
        return true;
    }

    private checkType(args: argType[]) {
        return args.includes(this.type);
    }

    private isType(method: string, args: argType[]) {
        const checkType = this.checkType(args);

        if (!checkType) {
            console.error(
                new Error(
                    `There is no method to ${method} on arg type of ${this.type}`
                ).stack
            );
        }

        return checkType;
    }

    constructor(name: string, type: argType, required: boolean = false) {
        this.name = name;
        this.id = ClientUtils.generateId(name);
        this.type = type;
        this.required = required;
    }

    public setTextValue(text: string) {
        if (!this.checkWritten()) return false;

        this.text = text;
        return true;
    }

    public getText() {
        return this.text;
    }

    public setStringValue(string: string) {
        if (!this.checkWritten()) return false;

        this.stringValue = string;
        return true;
    }

    public getStringValue() {
        return this.stringValue;
    }

    public setNumberValue(number: number) {
        if (!this.checkWritten()) return false;

        if (!this.isType("set a number value", ["interger", "number", "time"]))
            return false;

        this.numbervalue = number;
        return true;
    }

    public getNumberValue() {
        if (!this.isType("get a number value", ["interger", "number", "time"]))
            return false;

        return this.numbervalue;
    }

    public setStringArrayValue(stringArray: string[]) {
        if (!this.checkWritten()) return false;

        if (!this.isType("set a string array", ["multiple"])) return false;

        this.stringArrayValue = stringArray;
        return true;
    }

    public getStringArrayValue() {
        if (!this.isType("get a string array", ["multiple"])) return false;

        return this.stringArrayValue;
    }

    public setUserMention(user: User) {
        if (!this.checkWritten()) return false;

        if (!this.isType("set a user value", ["userMention"])) return false;

        this.userMention = user;
        return true;
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
        if (!this.checkWritten()) return false;

        if (!this.isType("set a member value", ["memberMention"])) return false;

        this.guildMemberMention = member;
        return true;
    }

    public getGuildMemberMention() {
        if (!this.isType("get a member value", ["memberMention"])) return false;

        if (!this.guildMemberMention) {
            console.error(
                new Error("The guild member mention has not been set").stack
            );
            return false;
        }

        return this.guildMemberMention;
    }

    public setChannelMention(channel: Channel) {
        if (!this.checkWritten()) return false;

        if (!this.isType("set a channel value", ["channelMention"]))
            return false;

        this.channelMention = channel;
        return true;
    }

    public getChannelMention() {
        if (!this.isType("get a channel value", ["channelMention"]))
            return false;

        if (!this.channelMention) {
            console.error(
                new Error("The guild member mention has not been set").stack
            );
            return false;
        }

        return this.channelMention;
    }
}
