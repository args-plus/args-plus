import { Message } from "discord.js";
import { Event } from "../../Events";

const event = new Event("messageCreate");
event.run = async (client, message: Message) => {
    if (!client.config.useChatCommands) {
        return false;
    }

    const command = await client.commandManager.getCommand(message);

    if (!command) {
        return false;
    } else {
        return client.commandManager.runCommand(command, message);
    }
};

export default event;
