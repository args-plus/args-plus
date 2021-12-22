import { Argument, Command } from "../../Handler";
import { GuildPrefixModel } from "../../Handler/Defaults/Schemas";

const newPrefix = new Argument("newprefix", "single")
    .setDescription("The new prefix you want to set it to")
    .setDisplayName("New prefix");

const prefixCommand = new Command("prefix")
    .setAliases(["setprefix"])
    .setDescription("Get or change the prefix of the bot")
    .setArgs([newPrefix]);

prefixCommand.run = async (client, command) => {
    const guild = command.getGuild();
    const member = command.getMember();

    const globalPrefix = client.utils.getGlobalPrefix();

    const currentPrefix = async () => {
        const guildPrefix = await client.utils.getGuildPrefix(guild);

        if (guildPrefix === globalPrefix) {
            return command.sendMessage(`The current prefix is: \`\`${globalPrefix}\`\``);
        } else {
            return command.sendMessage(
                `The prefix here is: \`\`${guildPrefix}\`\`\nThe global prefix is: \`\`${globalPrefix}\`\``
            );
        }
    };

    if (
        !guild ||
        !member ||
        !member.permissions.has("ADMINISTRATOR") ||
        !command.args[0]
    ) {
        return await currentPrefix();
    }

    const newPrefix = command.args[0].getStringValue();

    if (newPrefix !== globalPrefix) {
        await GuildPrefixModel.findByIdAndUpdate(
            guild.id,
            { guildPrefix: newPrefix },
            { upsert: true }
        );
    } else {
        await GuildPrefixModel.findByIdAndDelete(guild.id);
    }
    client.cachedGuildPrefixes.set(guild.id, newPrefix);

    command.sendMessage(
        `The new prefix is: \`\`${newPrefix}\`\``,
        "I succesfully changed the prefix for this server"
    );
};

export default prefixCommand;
