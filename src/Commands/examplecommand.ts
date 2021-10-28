import { Command } from "../Handler";

const command = new Command("example");
command.run = (client, commandRan) => {
    commandRan.sendMessage("PONG");
};

export default command;
