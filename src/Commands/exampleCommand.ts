import { Command } from "../Handler";

export const command = new Command();
command.name = "commandName";
command.description = "commandDescription";

// Add options here
command.run = async (args, commandRan, commandClass) => {
    const { client } = commandClass;

    const guild = client.utils.getGuild(commandRan);
    const author = client.utils.getAuthor(commandRan);
    const channel = client.utils.getChannel(commandRan);
    const member = client.utils.getMember(commandRan);
    const content = client.utils.getContent(commandRan);
    const mentions = client.utils.getMentions(commandRan);
    // Run code here
};
