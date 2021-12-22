import { Command } from "../../Handler/Commands";

const command = new Command("message").setDescription(
    "Shows an example message from the bot"
);
command.run = (client, command) => {
    command.sendMessage("This is a message", "And this is it's header");
};

export default command;
