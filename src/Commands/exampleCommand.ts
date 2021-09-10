import { GuildMember } from "discord.js";
import { Command } from "../Handler";

export const command = new Command();
command.name = "commandName";
command.description = "commandDescription";
command.run = async (args, commandRan, commandClass) => {
    const { client } = commandClass;

    const { message, slashCommand } = commandRan;

    const guild = message !== null ? message.guild : slashCommand.guild;
    const author = message !== null ? message.author : slashCommand.user;
    const channel = message !== null ? message.channel : slashCommand.channel;
    const member = message !== null ? message.member : slashCommand.member;
    const content = message !== null ? message.content : null;
    const mentions = message !== null ? message.mentions : null;

    if (!(member instanceof GuildMember)) {
        return false;
    }
};
