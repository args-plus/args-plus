import { Collection } from "discord.js";
import { Client } from "..";
import { Item } from "../Client/instances/loader";
import { ClientUtils } from "../Client/utils/utils";
import { Permission } from "../Interfaces";
import { Argument } from "./argument";
import { ReturnCommand } from "./returnCommand";

export class Command extends Item {
    public args: Argument[] = [];

    public description = "This command has no description";
    public aliases: string[] = [];
    public hiddenAliases: string[] = [];
    public developerOnly = false;
    public guildOnly = false;
    public deferResponse = true;
    public certainChannelsOnly: string[] = [];
    public certainGuildsOnly: string[] = [];
    public certainRolesOnly: string[] = [];
    public overideLoadSlashCommand = false;
    public overideDefaultClientChecks = false;
    public overideDefaultUserChecks = false;
    public overideDefaultUserPermissions = false;
    public overideDefaultClientPermissions = false;
    public overideGuildBlacklist = false;
    public overideUserBlacklist = false;
    public overideAutoRemove = false;
    public overideConstraints = false;
    public clientPermissions: Permission[] = [];
    public userPermissions: Permission[] = [];
    public clientChecks: string[] = [];
    public userChecks: string[] = [];
    public hidden = false;
    public category: [string, string] | string | false = "";
    public categoryName: string | false = "";
    public categoryId: string | false = "";
    public toggleable = true;

    public usage: string[] = [];
    public examples: (string[] | [number, number, boolean])[] = [];

    public activeCooldowns: Collection<string, number[]> = new Collection();

    private cooldownNumber: [number, number] = [0, 0];

    private loadedSlashCommand = false;

    public setDescription(description = "This command has no description") {
        this.description = description;
        return this;
    }

    public setArgs(args: Argument[] = []) {
        this.args = args;
        return this;
    }

    public setAliases(aliases: string[] = []) {
        this.aliases = aliases;
        return this;
    }

    public setHiddenAliases(aliases: string[] = []) {
        this.hiddenAliases = aliases;
        return this;
    }

    public setAllAliases(aliases: string[] = [], hiddenAliases: string[] = []) {
        this.setAliases(aliases);
        this.setHiddenAliases(hiddenAliases);
        return this;
    }

    public setDeveloperOnly(developerOnly = true) {
        this.developerOnly = developerOnly;
        return this;
    }

    public setGuildOnly(guildOnly = true) {
        this.guildOnly = guildOnly;
        return this;
    }

    public setNoDefer(defer = true) {
        this.deferResponse = defer;
        return this;
    }

    public setCertainChannelsOnly(channels: string[] = []) {
        this.certainChannelsOnly = channels;
        return this;
    }

    public setCertainGuildsOnly(guilds: string[] = []) {
        this.certainChannelsOnly = guilds;
        return this;
    }

    public setCerainrolesOnly(roles: string[] = []) {
        this.certainRolesOnly = roles;
        return this;
    }

    public setOverideLoadSlashCommands(overide = true) {
        this.overideLoadSlashCommand = overide;
        return this;
    }

    public setOverideDefaultClientChecks(checks = true) {
        this.overideDefaultClientChecks = checks;
        return this;
    }

    public setOverideDefaultUserChecks(checks = true) {
        this.overideDefaultUserChecks = checks;
        return this;
    }

    public setOverideChecks(client = true, user = true) {
        this.setOverideDefaultClientChecks(client);
        this.setOverideDefaultUserChecks(user);
        return this;
    }

    public setOverideDefaultClientPermisions(client = true) {
        this.overideDefaultClientPermissions = client;
        return this;
    }

    public setOverideDefaultUserPermissions(user = true) {
        this.overideDefaultUserPermissions = user;
        return this;
    }

    public setOverideDefaultPermissions(client = true, user = true) {
        this.setOverideDefaultClientPermisions(client);
        this.setOverideDefaultUserPermissions(user);
        return this;
    }

    public setOverideGuildBlacklist(guild = true) {
        this.overideGuildBlacklist = guild;
        return this;
    }

    public setOverideUserBlacklist(user = true) {
        this.overideUserBlacklist = user;
        return this;
    }

    public setOverideBlacklist(guild = true, user = true) {
        this.setOverideGuildBlacklist(guild);
        this.setOverideUserBlacklist(user);
        return this;
    }

    public setOverideAutoRemove(auto = true) {
        this.overideAutoRemove = auto;
        return this;
    }

    public setOverideConstratins(constratints = true) {
        this.overideConstraints = constratints;
        return this;
    }

    public setClientPermissions(permissions: Permission[] = []) {
        this.clientPermissions = permissions;
        return this;
    }

    public setUserPermissions(permissions: Permission[] = []) {
        this.userPermissions = permissions;
        return this;
    }

    public setPermissions(client: Permission[] = [], user: Permission[] = []) {
        this.setClientPermissions(client);
        this.setUserPermissions(user);
        return this;
    }

    public setClientChecks(client: string[] = []) {
        this.clientChecks = client;
        return this;
    }

    public setUserChecks(user: string[] = []) {
        this.userChecks = user;
        return this;
    }

    public setChecks(client: string[] = [], user: string[] = []) {
        this.setClientChecks(client);
        this.setUserChecks(user);
        return this;
    }

    public setHidden(hidden = true) {
        this.hidden = hidden;
        return this;
    }

    public setCategory(category: [string, string] | string | false = false) {
        this.category = category;
        return this;
    }

    public setUntoggleable(toggleable = false) {
        this.toggleable = toggleable;
        return this;
    }

    public getLoadedSlashCommand() {
        return this.loadedSlashCommand;
    }

    public setLoadedSlashCommand() {
        this.loadedSlashCommand = true;
    }

    public getCooldownNumber() {
        return this.cooldownNumber;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public run: (client: Client, returnCommand: ReturnCommand) => any = () => {
        console.log(`Change your run method for comamnd: ${this.name}`);
    };

    public setCooldown(
        cooldownKey: [
            (
                | `${string}s`
                | `${string}m`
                | `${string}h`
                | `${string}d`
                | `${string}m ${string}s`
                | `${string}h ${string}m`
                | number
            ),
            number
        ] = [0, 0]
    ) {
        const cooldown = cooldownKey[0];

        let ms = 0;

        if (typeof cooldown === "string") {
            if (cooldown.endsWith("s")) {
                const cooldowns = cooldown.split(/ +/g);

                if (cooldowns.length === 1) {
                    const seconds = parseFloat(cooldowns[0]);
                    ms = seconds * 1000;
                } else {
                    const seconds = parseFloat(cooldowns[1]);
                    const minutes = parseFloat(cooldowns[0]);

                    ms = seconds * 1000 + minutes * 60 * 1000;
                }
            } else if (cooldown.endsWith("m")) {
                const cooldowns = cooldown.split(/ +/g);

                if (cooldowns.length === 1) {
                    const minutes = parseFloat(cooldowns[0]);
                    ms = minutes * 60 * 1000;
                } else {
                    const minutes = parseFloat(cooldowns[1]);
                    const hours = parseFloat(cooldowns[0]);
                    ms = minutes * 60 * 1000 + hours * 60 * 60 * 1000;
                }
            } else if (cooldown.endsWith("h")) {
                const hours = parseFloat(cooldown);
                ms = hours * 60 * 60 * 1000;
            } else if (cooldown.endsWith("d")) {
                const days = parseFloat(cooldown);
                ms = days * 24 * 60 * 60 * 1000;
            }
        } else {
            ms = cooldown * 1000;
        }

        this.cooldownNumber = [ms, cooldownKey[1]];
    }

    public getUsage(name: string, prefix?: string): string {
        return `${prefix ? prefix : ""}${name}${
            this.usage.length !== 0 ? ` ${this.usage.join(" ")}` : ""
        }`;
    }

    public getExample(name: string, prefix: string, amountOfExamples = 3): string {
        const examples: string[] = [];

        let argWithUsage = false;
        for (let i = 0; i < amountOfExamples; i++) {
            let currentExample = `${prefix ? prefix : ""}${name} `;
            let canHaveUsageless = true;

            if (!argWithUsage && i === amountOfExamples - i) canHaveUsageless = false;
            for (let j = 0; j < this.examples.length; j++) {
                const example = this.examples[j];
                const arg = this.args[j];

                if (!arg.required && Math.random() > 0.5 && canHaveUsageless) continue;
                if (typeof example[0] === "number") {
                    argWithUsage = true;
                    const exampleKey = example as [number, number, boolean];
                    const minNumber = exampleKey[0];
                    const maxNumber = exampleKey[1];

                    const randomNumber =
                        Math.random() * (maxNumber - minNumber) + minNumber;

                    if (!exampleKey[2]) {
                        currentExample += (
                            Math.round((randomNumber + Number.EPSILON) * 100) / 100
                        ).toString();
                    } else {
                        currentExample += Math.floor(randomNumber).toString();
                    }
                } else {
                    currentExample += ClientUtils.randomElement(example as string[]);
                }

                currentExample += " ";
            }
            examples.push(currentExample.slice(0, -1));
        }

        return examples.join("\n");
    }
}
