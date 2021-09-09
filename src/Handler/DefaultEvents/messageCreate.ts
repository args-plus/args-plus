import { Interaction, Message } from "discord.js";
import { Event } from "../Client/Events/event";

export const event = new Event();
event.name = "messageCreate";
event.run = async (client, message: Message) => {
    if (!client.config.useChatCommands) {
        return;
    }

    const args = await client.utils.getArgs(message, true);

    if (!args) {
        return;
    }

    const cmd = args.shift().toLowerCase();

    if (!cmd) return;

    const command = client.commands.get(cmd) || client.aliases.get(cmd);

    if (command) {
        command.runCommand({ message: message, slashCommand: null });
    }
};
