import { Guild } from "discord.js";
import fs from "fs";
import path from "path";
import { ExtendedClient } from "../Client";
import { GuildPrefixModel } from "../Defaults/Schemas";

export class Utils {
    public client: ExtendedClient;

    constructor(extendedClient: ExtendedClient) {
        this.client = extendedClient;

        this.loadFiles.bind(this);
    }

    private isFile(name: string): boolean {
        if (
            (name.endsWith(".ts") && !name.endsWith(".d.ts")) ||
            (name.endsWith(".js") && !name.endsWith(".map.js"))
        ) {
            return true;
        } else {
            return false;
        }
    }

    public async loadFiles(parentDir: string) {
        let filePaths: string[] = [];
        const readCommands = async (dir: string) => {
            let files: string[];
            try {
                files = fs.readdirSync(dir);
            } catch (error) {
                if (error instanceof Error) {
                    // @ts-ignore
                    if (error.code === "ENOENT") {
                        this.client.console.log(
                            `Skipping loading files from ${parentDir}, as there is no files there`
                        );
                    } else {
                        throw error;
                    }
                }
                return false;
            }
            for (const file of files) {
                const stat = fs.lstatSync(path.join(dir, file));
                if (stat.isDirectory()) {
                    readCommands(path.join(dir, file));
                } else {
                    if (this.isFile(file)) {
                        const commandDir = path.join(dir, file);
                        filePaths.push(commandDir);
                    }
                }
            }
        };
        await readCommands(parentDir);
        return filePaths;
    }

    public static generateId(string: String) {
        return string.toUpperCase().replace(/[ +]/g, "_");
    }

    // Copied like a pro:
    // https://stackoverflow.com/questions/19700283/how-to-convert-time-in-milliseconds-to-hours-min-sec-format-in-javascript
    // (Second answer)

    public msToTime(ms: number) {
        let seconds = (ms / 1000).toFixed(1);
        let minutes = (ms / (1000 * 60)).toFixed(1);
        let hours = (ms / (1000 * 60 * 60)).toFixed(1);
        let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
        if (parseFloat(seconds) < 60) return seconds + " seconds";
        else if (parseFloat(minutes) < 60) return minutes + " minutes";
        else if (parseFloat(hours) < 24) return hours + " hours";
        else return days + " days";
    }

    public async getGuildPrefix(guild: Guild | null): Promise<string> {
        if (!guild) {
            return this.getGlobalPrefix();
        }
        const getCachedPrefix = this.client.cachedGuildPrefixes.get(guild.id);
        if (getCachedPrefix) {
            return getCachedPrefix;
        }
        const findPrefix = await GuildPrefixModel.findById(guild.id);
        if (!findPrefix) {
            return this.getGlobalPrefix();
        }

        this.client.cachedGuildPrefixes.set(guild.id, findPrefix.guildPrefix);
        return findPrefix.guildPrefix;
    }

    public getGlobalPrefix(): string {
        if (this.client.connectedToMongo !== false) {
            const cachedPrefix =
                this.client.configurations.get("global prefix");
            if (!cachedPrefix) {
                return this.client.config.prefix;
            } else {
                return cachedPrefix.options.globalPrefix;
            }
        } else {
            return this.client.config.prefix;
        }
    }

    public splitStringByNewLine(string: string) {
        return string.split(/\r?\n/);
    }
}
