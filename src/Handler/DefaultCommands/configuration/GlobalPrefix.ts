import { Command } from "../../Client/Commands/command";

export const command = new Command();
command.name = "globalprefix";
command.aliases = ["gprefix", "setglobalprefix", "setgprefix"];
command.developerOnly = true;
command.description = "Change the global prefix of the bot";
command.overideLoadSlashCommand = true;
command.args = [
    {
        name: "newprefix",
        displayName: "New prefix",
        required: false,
        description: "The new prefix you want to set it to",
        type: "single",
    },
];
command.run = async (args, message, commandClass) => {
    const newPrefixArg = args[0];
    const client = commandClass.client;

    if (!newPrefixArg.stringValue) {
        return client.messageHandler.sendMessage(
            message,
            `The current global prefix is \`\`${client.globalPrefix}\`\``
        );
    } else {
        await client.configurationHandler.updateConfiguration("global prefix", {
            globalPrefix: newPrefixArg.stringValue,
        });
        client.globalPrefix = newPrefixArg.stringValue;
        return client.messageHandler.sendMessage(
            message,
            `The new global prefix is \`\`${newPrefixArg.stringValue}\`\``
        );
    }
};
