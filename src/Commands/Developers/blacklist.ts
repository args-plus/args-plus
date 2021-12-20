import { User } from "discord.js";
import { Argument, Command } from "../../Handler";
import { Blacklist, BlacklistModel } from "../../Handler/Defaults/Schemas/blacklist";

const getDate = (date: Date) => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

const getFullDate = (date: Date) => {
    return `\`\`${getDate(date)}\`\` ***(DD/MM/YY)***`;
};

const user = new Argument("user", "userMention", true);
user.description = "The user to blacklist or retrieve information about";
user.displayName = "User";

const duration = new Argument("duration", "time");
duration.description = "The amount of time to blacklist for";
duration.allowLowerCaseCustomValues = true;
duration.customValues = ["perm", "permanent", "off"];
duration.displayName = "Duration";

const reason = new Argument("reason", "multiple", false);
reason.description = "The reason to blacklist";
reason.displayName = "Reason";

const userBlacklistCommand = new Command("blacklist");
userBlacklistCommand.args = [user, duration, reason];
userBlacklistCommand.description = "Blacklist a user or retrieve information about them";
userBlacklistCommand.aliases = ["bl"];
userBlacklistCommand.run = async (client, command) => {
    const { args } = command;

    const user = args[0].getUserMention() as User;
    const duration = args[1];
    const reason = args[2];

    if (!duration) {
        const findBlacklists = await BlacklistModel.find({ itemId: user.id });

        if (findBlacklists.length === 0) {
            return command.sendMessage(
                ["They have no blacklists recorded", "All good"],
                ["It's clean", "Nothing to see here"]
            );
        }

        let blacklistsMessage = "";

        for (const blacklist of findBlacklists) {
            const {
                blacklistedOn,
                permanent,
                expiery,
                reason,
                blacklistedBy,
                enabled,
                unblacklistedBy
            } = blacklist;

            blacklistsMessage += `Blacklisted on: ${getFullDate(blacklistedOn)}\n`;
            blacklistsMessage += `Expires: ${
                permanent ? "``never``" : getFullDate(expiery)
            }\n`;
            blacklistsMessage += `Reason: \`\`${reason}\`\`\n`;

            if (!!blacklistedBy) {
                const findBlacklister = client.users.cache.get(blacklistedBy);

                if (findBlacklister)
                    blacklistsMessage += `Blacklisted by: \`\`${findBlacklister.tag} (${blacklistedBy})\`\`\n`;
                else blacklistsMessage += "*Blacklister not found*\n";
            }

            if (!enabled && !!unblacklistedBy) {
                if (unblacklistedBy === "CLIENT") {
                    blacklistsMessage += "*Unblacklisted by timeout*";
                }

                const findUnBlacklister = client.users.cache.get(unblacklistedBy);

                if (findUnBlacklister)
                    blacklistsMessage += `Blacklisted by: \`\`${findUnBlacklister.tag} (${unblacklistedBy})\`\`\n`;
                else blacklistsMessage += "*Unblacklister not found*\n";
            }

            blacklistsMessage += "\n";
        }

        return command.sendMessage(blacklistsMessage, [
            "Here you go",
            "You're in trouble now bud"
        ]);
    }

    let permanent = false;

    if (duration.getStringValue() === "off") {
        await client.blacklists.deleteBlacklist(user.id, command.getAuthor().id);

        return command.sendMessage(
            `${user.username} has been unblacklisted`,
            `${user.tag} is no longer blacklisted`
        );
    }

    if (client.blacklists.isUnblacklistable(user.id)) {
        return command.sendError(
            "They are unblacklistable",
            "I could not blacklist that user"
        );
    }

    if (duration.getStringValue() === "perm" || duration.getStringValue() === "permanent")
        permanent = true;

    const amountOfTime = duration.getNumberValue();
    if (!amountOfTime && !permanent) return;

    await client.blacklists.blacklistUser(
        user.id,
        permanent ? permanent : new Date(Date.now() + (amountOfTime as number)),
        reason?.getText(),
        command.getAuthor()
    );

    await command.sendMessage(
        `I succesfully blacklisted: ${user.username}\nReason: \`\`${
            reason ? reason.getText() : "No reason provided"
        }\`\`\nIt will expire:  ${
            permanent
                ? "``never``"
                : getFullDate(new Date(Date.now() + (amountOfTime as number)))
        }`,
        `${user.tag} has been blacklisted`
    );
};

const guild = new Argument("guild", "single", true);
guild.description = "The server to blacklist";
guild.displayName = "Guild";

const guildBlacklistCommand = new Command("blacklistserver");
guildBlacklistCommand.aliases = ["blgl"];
guildBlacklistCommand.description = "Blacklist a server or retrieve information about it";
guildBlacklistCommand.args = [guild, duration, reason];
guildBlacklistCommand.run = async (client, command) => {
    const { args } = command;

    const guild = args[0].getStringValue();

    const findGuild = await client.guilds.cache.get(guild);

    if (!findGuild)
        return command.sendError(
            `I could not find a server with an id of ${guild}`,
            `I could not find that server`
        );

    const duration = args[1];
    const reason = args[2];

    if (!duration) {
        const findBlacklists = await BlacklistModel.find({ itemId: findGuild.id });

        if (findBlacklists.length === 0) {
            return command.sendMessage(
                ["There are no blacklists recorded", "All good"],
                ["It's clean", "Nothing to see here"]
            );
        }

        let blacklistsMessage = "";

        for (const blacklist of findBlacklists) {
            const {
                blacklistedOn,
                permanent,
                expiery,
                reason,
                blacklistedBy,
                enabled,
                unblacklistedBy
            } = blacklist;

            blacklistsMessage += `Blacklisted on: ${getFullDate(blacklistedOn)}\n`;
            blacklistsMessage += `Expires: ${
                permanent ? "``never``" : getFullDate(expiery)
            }\n`;
            blacklistsMessage += `Reason: \`\`${reason}\`\`\n`;

            if (!!blacklistedBy) {
                const findBlacklister = client.users.cache.get(blacklistedBy);

                if (findBlacklister)
                    blacklistsMessage += `Blacklisted by: \`\`${findBlacklister.tag} (${blacklistedBy})\`\`\n`;
                else blacklistsMessage += "*Blacklister not found*\n";
            }

            if (!enabled && !!unblacklistedBy) {
                if (unblacklistedBy === "CLIENT") {
                    blacklistsMessage += "*Unblacklisted by timeout*";
                }

                const findUnBlacklister = client.users.cache.get(unblacklistedBy);

                if (findUnBlacklister)
                    blacklistsMessage += `Blacklisted by: \`\`${findUnBlacklister.tag} (${unblacklistedBy})\`\`\n`;
                else blacklistsMessage += "*Unblacklister not found*\n";
            }

            blacklistsMessage += "\n";
        }

        return command.sendMessage(blacklistsMessage, [
            "Here you go",
            "You're in trouble now bud"
        ]);
    }

    let permanent = false;

    if (duration.getStringValue() === "off") {
        await client.blacklists.deleteBlacklist(findGuild.id, command.getAuthor().id);

        return command.sendMessage(
            `${findGuild.name} has been unblacklisted`,
            `${findGuild.name} is no longer blacklisted`
        );
    }

    if (duration.getStringValue() === "perm" || duration.getStringValue() === "permanent")
        permanent = true;

    const amountOfTime = duration.getNumberValue();
    if (!amountOfTime && !permanent) return;

    await client.blacklists.blacklistUser(
        findGuild.id,
        permanent ? permanent : new Date(Date.now() + (amountOfTime as number)),
        reason?.getText(),
        command.getAuthor()
    );

    await command.sendMessage(
        `I succesfully blacklisted: ${findGuild.name}\nReason: \`\`${
            reason ? reason.getText() : "No reason provided"
        }\`\`\nIt will expire:  ${
            permanent
                ? "``never``"
                : getFullDate(new Date(Date.now() + (amountOfTime as number)))
        }`,
        `${findGuild.name} has been blacklisted`
    );
};

export { userBlacklistCommand, guildBlacklistCommand };
