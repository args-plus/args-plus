import { Command } from "../../../Commands";

const command = new Command("error");
command.developerOnly = true;
command.description = "Shows an example error from tghe bot";
command.run = (client, command) => {
    command.sendError("This is a error", "And this is it's header");
};

export default command;
