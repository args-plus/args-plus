import { User } from "discord.js";
import { Argument, Command } from "../../Handler";
import { BlacklistedusersModel } from "../../Handler/Defaults/Schemas/blacklist";

const user = new Argument("user", "userMention", true);
user.description = "The user to blacklist or retrieve information about";
user.displayName = "User";

const duration = new Argument("duration", "time");
duration.description = "The amount of time you want to blacklist them for";
duration.allowLowerCaseCustomValues = true;
duration.customValues = ["perm", "permanent", "off"];
duration.displayName = "Duration";

const reason = new Argument("reason", "multiple", false);
reason.description = "The reason to blacklist them";
reason.displayName = "Reason";

const blacklistCommand = new Command("blacklist");
blacklistCommand.args = [user, duration, reason];
blacklistCommand.description = "Blacklist a user or revcive information about them";
blacklistCommand.aliases = ["bl"];
blacklistCommand.run = async (client, command) => {
    const { args } = command;

    const user = args[0].getUserMention() as User;
    const duration = args[1];
    const reason = args[2];

    const getDate = (date: Date) => {
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    const getFullDate = (date: Date) => {
        return `\`\`${getDate(date)}\`\` ***(DD/MM/YY)***`;
    };

    if (!duration) {
        const findBlacklists = await BlacklistedusersModel.find({ userId: user.id });

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
        await client.userBlacklists.deleteBlacklist(user.id, command.getAuthor().id);

        return command.sendMessage(
            `${user.username} has been unblacklisted`,
            `${user.tag} is no longer blacklisted`
        );
    }

    if (
        (client.config.unBlacklistableUsers.includes("DEVELOPERS") &&
            client.config.botDevelopers.includes(user.id)) ||
        client.config.unBlacklistableUsers.includes(user.id)
    ) {
        return command.sendError(
            "They are unblacklistable",
            "I could not blacklist that user"
        );
    }

    if (duration.getStringValue() === "perm" || duration.getStringValue() === "permanent")
        permanent = true;

    const amountOfTime = duration.getNumberValue();
    if (!amountOfTime && !permanent) return;

    await client.userBlacklists.blacklistUser(
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

export default blacklistCommand;
