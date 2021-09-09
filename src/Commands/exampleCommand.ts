import { Command } from "../Handler";

export const command = new Command();
command.name = "example command";
command.run = (args, message) => {
    console.log("This is an example command");
};
