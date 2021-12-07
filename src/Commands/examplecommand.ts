import { Command } from "../Handler";

const command = new Command("example");
command.run = (client, commandRan) => {
    commandRan.sendMessage("PONG");
    commandRan.returnValues = ["This is a return value"];
};

export default command;
