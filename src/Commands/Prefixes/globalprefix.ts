import { Command, Argument } from "../../Handler";

const newPrefix = new Argument("newprefix", "single");
newPrefix.displayName = "New prefix";
newPrefix.description = "The prefix you want to set it to";

const globalPrefixCommand = new Command("globalprefix")
    .setAliases(["gprefix", "setgprefix", "setglobalprefix"])
    .setDescription("Get or change the global prefix of the bot")
    .setArgs([newPrefix]);

globalPrefixCommand.run = async (client, command) => {
    const author = command.getAuthor();

    const currentPrefix = () => {
        const globalPrefix = client.utils.getGlobalPrefix();
        return command.sendMessage(
            `The global prefix is currently: \`\`${globalPrefix}\`\``
        );
    };

    if (!client.config.botDevelopers.includes(author.id) || !command.args[0]) {
        return currentPrefix();
    }

    client.configurations.update("global prefix", {
        globalPrefix: command.args[0].getStringValue()
    });

    return command.sendMessage(
        `The new global prefix is \`\`${command.args[0].getStringValue()}\`\``,
        "I succesfully changed the global prefix"
    );
};

export default globalPrefixCommand;
