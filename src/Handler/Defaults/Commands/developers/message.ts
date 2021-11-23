import { Command } from "../../../Commands";

const command = new Command("message");
command.developerOnly = true;
command.description = "Shows an example message from tghe bot";
command.run = (client, command) => {
    command.sendMessage("This is a message", "And this is it's header");
};

export default command;
