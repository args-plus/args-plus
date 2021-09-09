import { MessageEmbed } from "discord.js";
import { Command } from "../../Client/Commands/command";
import Quotes from "inspirational-quotes";

export const command = new Command();
command.name = "inspire";
command.description = "Get some inspiration when your coding";
command.developerOnly = true;
command.overideLoadSlashCommand = true;
command.run = async (args, commandRan, commandClass) => {
    const quote = Quotes.getRandomQuote();
    commandClass.client.messageHandler.sendMessage(
        commandRan,
        `Here you go:\n*"${quote}"*`
    );
};
