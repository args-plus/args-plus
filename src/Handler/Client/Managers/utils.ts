import path from "path";
import fs from "fs";
import ExtendedClient from "..";
import {
    ApplicationCommandData,
    ApplicationCommandOptionData,
    Message,
} from "discord.js";
import { Command } from "../Commands/command";
import { GuildPrefixModel } from "../../DefaultSchemas";

export class Utils {
    public client: ExtendedClient;

    public validPermissions = [
        "CREATE_INSTANT_INVITE",
        "BAN_MEMBERS",
        "ADMINISTRATOR",
        "MANAGE_CHANNELS",
        "MANAGE_GUILD",
        "ADD_REACTIONS",
        "VIEW_AUDIT_LOG",
        "PRIORITY_SPEAKER",
        "STREAM",
        "VIEW_CHANNEL",
        "SEND_MESSAGES",
        "SEND_TTS_MESSAGES",
        "MANAGE_MESSAGES",
        "EMBED_LINKS",
        "ATTACH_FILES",
        "READ_MESSAGE_HISTORY",
        "MENTION_EVERYONE",
        "USE_EXTERNAL_EMOJIS",
        "VIEW_GUILD_INSIGHTS",
        "CONNECT",
        "SPEAK",
        "MUTE_MEMBERS",
        "DEAFEN_MEMBERS",
        "MOVE_MEMBERS",
        "USE_VAD",
        "CHANGE_NICKNAME",
        "MANAGE_NICKNAMES",
        "MANAGE_ROLES",
        "MANAGE_WEBHOOKS",
        "MANAGE_EMOJIS_AND_STICKERS",
        "USE_APPLICATION_COMMANDS",
        "REQUEST_TO_SPEAK",
        "MANAGE_THREADS",
        "USE_PUBLIC_THREADS",
        "USE_PRIVATE_THREADS",
        "USE_EXTERNAL_STICKERS",
    ];

    public async loadTSFiles(parentDir: string) {
        let filePaths: string[] = [];
        const readCommands = async (dir) => {
            let files = fs.readdirSync(dir);
            for (const file of files) {
                const stat = fs.lstatSync(path.join(dir, file));
                if (stat.isDirectory()) {
                    readCommands(path.join(dir, file));
                } else {
                    const commandDir = path.join(dir, file);
                    await filePaths.push(commandDir);
                }
            }
        };
        await readCommands(parentDir);
        return filePaths;
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

    public async getArgs(message: Message, logError?: boolean) {
        let globalPrefix: string;

        if (
            !this.client.cachedConfigurations ||
            !this.client.cachedConfigurations.get("GLOBAL_PREFIX")
        ) {
            if (logError) {
                this.client.messageHandler.debug(
                    "Couldnt get global prefix from configurations, using default instead"
                );
            }
            globalPrefix = this.client.config.prefix;
        } else {
            const findGlobalPrefix =
                this.client.cachedConfigurations.get("GLOBAL_PREFIX");

            globalPrefix = findGlobalPrefix.options.globalPrefix;

            if (this.client.globalPrefix !== globalPrefix) {
                this.client.globalPrefix = globalPrefix;
            }
        }

        let prefixUsed: string;

        if (message.author.bot) return false;

        if (message.content.startsWith(`<@!${this.client.user.id}>`)) {
            prefixUsed = `<@!${this.client.user.id}>`;
        } else if (
            message.guild &&
            !this.client.guildPrefixes.has(message.guild.id)
        ) {
            const findGuildPrefix = await GuildPrefixModel.findById(
                message.guild.id
            ).catch((error) => {
                console.error(error);
            });

            if (findGuildPrefix) {
                this.client.guildPrefixes.set(
                    message.guild.id,
                    findGuildPrefix.guildPrefix
                );
                prefixUsed = findGuildPrefix.guildPrefix;
            } else {
                prefixUsed = globalPrefix;
            }
        } else if (
            message.guild &&
            this.client.guildPrefixes.has(message.guild.id)
        ) {
            const getPrefix = this.client.guildPrefixes.get(message.guild.id);
            prefixUsed = getPrefix;
        } else if (message.content.startsWith(globalPrefix)) {
            prefixUsed = globalPrefix;
        }

        const args = message.content
            .slice(prefixUsed.length)
            .trim()
            .split(/ +/g);

        return args;
    }

    public splitStringByNewLine(string: string) {
        return string.split(/\r?\n/)

    }
}
