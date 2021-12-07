import { Interaction } from "discord.js";
import { Event } from "../..";

export const event = new Event("interactionCreate");
event.run = async (client, interaction: Interaction) => {
    if (interaction.isCommand()) {
        const { command: cmd } = interaction;
        if (!cmd) {
            await client.items.registerSlashCommands();
            return;
        }
        const command =
            client.commands.get(cmd.name) || client.aliases.get(cmd.name);

        if (!command) {
            return;
        }

        client.commandManager.runCommand(command, interaction);
    }
};

export default event;
