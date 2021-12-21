import { Utils } from "discord-api-types";
import { Collection } from "discord.js";
import { Client } from "..";
import { Item } from "../Client/instances/loader";
import { ClientUtils } from "../Client/utils/utils";
import { Permission } from "../Interfaces";
import { Argument } from "./argument";
import { ReturnCommand } from "./returnCommand";

export class Command extends Item {
    public args: Argument[] = [];

    public description = "";
    public aliases: string[] = []; // DONE
    public hiddenAliases: string[] = []; // DONE
    public developerOnly = false; // DONE
    public guildOnly = false; // DONE
    public deferResponse = true; // DONE
    public certainChannelsOnly: string[] = []; // DONE
    public certainGuildsOnly: string[] = []; // DONE
    public certainRolesOnly: string[] = []; // DONE
    public overideLoadSlashCommand = false; // DONE
    public overideDefaultClientChecks = false; // DONE
    public overideDefaultUserChecks = false; // DONE
    public overideDefaultUserPermissions = false; // DONE
    public overideDefaultClientPermissions = false; // DONE
    public overideGuildBlacklist = false; // DONE
    public overideUserBlacklist = false; // DONE
    public overideAutoRemove = false;
    public overideConstraints = false; // DONE
    public clientPermissions: Permission[] = []; // DONE
    public userPermissions: Permission[] = []; // DONE
    public clientChecks: string[] = []; // DONE
    public userChecks: string[] = []; // DONE
    public hidden = false;
    public category: [string, string] | string | false = ""; // DONE
    public categoryName: string | false = ""; // DONE
    public categoryId: string | false = "";
    public toggleable = true;

    public usage: string[] = []; // DONE
    public examples: (string[] | [number, number, boolean])[] = []; // DONE

    public activeCooldowns: Collection<string, number[]> = new Collection();

    private cooldownNumber: [number, number] = [0, 0];

    private loadedSlashCommand = false;

    public getLoadedSlashCommand() {
        return this.loadedSlashCommand;
    }

    public setLoadedSlashCommand() {
        this.loadedSlashCommand = true;
        return true;
    }

    public getCooldownNumber() {
        return this.cooldownNumber;
    }

    public run: (client: Client, returnCommand: ReturnCommand) => any = () => {};

    // prettier-ignore
    public setCooldown(cooldownKey:  [`${string}s`| `${string}m` | `${string}h`| `${string}d`| `${string}m ${string}s`| `${string}h ${string}m`| number, number] = [0, 0]){
        const cooldown = cooldownKey[0]
        
        let ms = 0

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

    public getExample(
        name: string,
        prefix: string,
        amountOfExamples: number = 3
    ): string {
        let examples: string[] = [];

        for (let i = 0; i < amountOfExamples; i++) {
            let currentExample = `${prefix ? prefix : ""}${name} `;
            for (const example of this.examples) {
                if (typeof example[0] === "number") {
                    let exampleKey = example as [number, number, boolean];
                    const minNumber = exampleKey[0];
                    const maxNumber = exampleKey[1];

                    // prettier-ignore
                    let randomNumber = Math.random() * (maxNumber - minNumber) + minNumber;

                    if (!exampleKey[2]) {
                        // prettier-ignore
                        currentExample += (Math.round((randomNumber + Number.EPSILON) * 100) / 100).toString();
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
