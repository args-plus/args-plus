import { Interaction, Message } from "discord.js";
import { Event } from "../Client/Events/event";

export const event = new Event();
event.name = "interactionCreate";
event.run = async (client, interaction: Interaction) => {
    if (interaction.isCommand()) {
        const { command: cmd } = interaction;
        if (!cmd) {
            client.messageHandler.log("Reloading slash commands");
            client.loader.registerSlashCommands();
        }
        const command =
            client.commands.get(cmd.name) || client.aliases.get(cmd.name);

        command.runCommand({ message: null, slashCommand: interaction });
    }
};
