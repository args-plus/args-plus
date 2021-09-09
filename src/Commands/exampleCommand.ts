import { MessageEmbed } from "discord.js";
import { Command } from "../Handler";

export const command = new Command();
command.name = "examplecommand";
command.run = (args, message, commandRan) => {
    console.log("This is an example command");
};
