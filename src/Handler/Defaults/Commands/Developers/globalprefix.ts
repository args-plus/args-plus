import { Command } from "../../../Commands";

const command = new Command("globalprefix");
command.aliases = ["gprefix", "setgprefix", "setglobalprefix"];
command.description = "Get or change the prefix of the bot";
command.overideConstraints = true;
command.args = [
    {
        name: "newprefix",
        displayName: "New prefix",
        required: false,
        description: "The new prefix you want to set it to",
        type: "single"
    }
];
command.run = async (client, command) => {
    const author = command.getAuthor();

    const currentPrefix = () => {
        const globalPrefix = client.utils.getGlobalPrefix();
        return command.sendMessage(
            `The current global prefix is: \`\`${globalPrefix}\`\``
        );
    };

    if (
        !client.config.botDevelopers.includes(author.id) ||
        !command.args[0] ||
        !command.args[0].stringValue
    ) {
        return currentPrefix();
    }

    client.configurations.update(
        "global prefix",
        { globalPrefix: command.args[0].stringValue },
        true
    );
    return command.sendMessage(
        `The new global prefix is: \`\`${command.args[0].stringValue}\`\``,
        "I succesfully changed the global prefix"
    );
};

export default command;
