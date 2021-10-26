import { config } from "dotenv";
import { Command } from "../../../Commands";
import { GuildPrefixModel } from "../../Schemas";

const command = new Command("prefix");
command.aliases = ["setprefix"];
// command.guildOnly = true;
command.description = "Get or change the prefix of the bot";
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
    const guild = command.getGuild();
    const member = command.getMember();

    const currentPrefix = async () => {
        const guildPrefix = await client.utils.getGuildPrefix(guild);
        const globalPrefix = client.utils.getGlobalPrefix();

        if (guildPrefix === globalPrefix) {
            return command.sendMessage(
                `The current prefix is: \`\`${globalPrefix}\`\``
            );
        } else {
            return command.sendMessage(
                `The prefix here is: \`\`${guildPrefix}\`\`\nThe global prefix is: \`\`${globalPrefix}\`\``
            );
        }
    };

    if (!guild || !member || !member.permissions.has("ADMINISTRATOR")) {
        return currentPrefix();
    }

    if (!command.args[0]) {
        return currentPrefix();
    }

    const newPrefix = command.args[0].stringValue;
    if (!newPrefix) {
        return currentPrefix();
    }

    // prettier-ignore
    await GuildPrefixModel.findOneAndUpdate({_id: guild.id}, {guildPrefix: newPrefix}, {upsert: true})
    client.cachedGuildPrefixes.set(guild.id, newPrefix);

    command.sendMessage(
        `The new prefix is: \`\`${newPrefix}\`\``,
        "I succesfully changed the prefix for this server"
    );
};

export default command;
