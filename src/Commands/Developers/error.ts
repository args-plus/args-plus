import { Command } from "../../Handler/Commands";

const command = new Command("error").setDescription(
    "Shhows an example error message from the bot"
);
command.run = (client, command) => {
    command.sendError("This is a error", "And this is it's header");
};

export default command;
