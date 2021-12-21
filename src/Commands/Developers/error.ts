import { Command } from "../../Handler/Commands";

const command = new Command("error");
command.description = "Shows an example error from the bot";
command.run = (client, command) => {
    command.sendError("This is a error", "And this is it's header");
};

export default command;
