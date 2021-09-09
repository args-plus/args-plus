import { Command } from "../../Client/Commands/command";
import { GuildPrefixModel } from "../../DefaultSchemas";

export const command = new Command();
command.name = "prefix";
command.aliases = ["setprefix"];
command.guildOnly = true;
command.userPermissions = "ADMINISTRATOR";
command.description = "Change the prefix of the bot in this server";
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

    const guild = message.message
        ? message.message.guild
        : message.slashCommand.guild;

    if (!newPrefixArg.stringValue) {
        let currentPrefix: string;

        if (client.guildPrefixes.has(guild.id)) {
            currentPrefix = client.guildPrefixes.get(guild.id);
        } else {
            const findGuildPrefix = await GuildPrefixModel.findById(guild.id);

            if (findGuildPrefix) {
                client.guildPrefixes.set(guild.id, findGuildPrefix.guildPrefix);
                currentPrefix = findGuildPrefix.guildPrefix;
            } else {
                currentPrefix = client.globalPrefix;
            }
        }

        return client.messageHandler.sendMessage(
            message,
            `The current prefix for the server is \`\`${currentPrefix}\`\`\nThe current global prefix is \`\`${client.globalPrefix}\`\``
        );
    } else {
        await GuildPrefixModel.findOneAndUpdate(
            { _id: guild.id },
            { guildPrefix: newPrefixArg.stringValue },
            { upsert: true }
        );
        client.guildPrefixes.set(guild.id, newPrefixArg.stringValue);

        return client.messageHandler.sendMessage(
            message,
            `The new prefix for this server is now \`\`${newPrefixArg.stringValue}\`\``
        );
    }
};
