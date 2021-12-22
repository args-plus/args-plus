import { User } from "discord.js";
import { Argument, Command } from "../../Handler";
import { BlacklistModel } from "../../Handler/Defaults/Schemas/blacklist";
import { time } from "@discordjs/builders";

const user = new Argument("user", "userMention", true)
    .setDescription("The user to blacklist or retrieve information about")
    .setDisplayName("User");

const duration = new Argument("duration", "time")
    .setDescription("The amount of time to blacklist someone for")
    .setAllowLowerCaseValues()
    .setCustomValues(["perm", "permanent", "off"])
    .setDisplayName("Duration");

const reason = new Argument("reason", "multiple", false)
    .setDescription("The reason to blacklist")
    .setDisplayName("Reason");

const userBlacklistCommand = new Command("blacklist")
    .setArgs([user, duration, reason])
    .setDescription("Blacklist a user or retrieve information about them")
    .setAliases(["bl"]);

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
                blacklistReason,
                unblacklistReason,
                blacklistedBy,
                enabled,
                unblacklistedBy
            } = blacklist;

            blacklistsMessage += `Blacklisted on: ${time(blacklistedOn, "d")}\n`;
            blacklistsMessage += `Expires: ${
                permanent ? "``never``" : time(expiery, "D")
            }\n`;
            blacklistsMessage += `Enabled: \`\`${enabled ? "yes" : "no"}\`\`\n`;

            if (!!blacklistedBy) {
                const findBlacklister = client.users.cache.get(blacklistedBy);

                if (findBlacklister)
                    blacklistsMessage += `Blacklisted by: \`\`${findBlacklister.tag} (${blacklistedBy})\`\`\n`;
                else blacklistsMessage += "*Blacklister not found*\n";
            }

            blacklistsMessage += `Reason: \`\`${
                blacklistReason ? blacklistReason : "No reason provided"
            }\`\`\n`;
            if (!enabled && !!unblacklistedBy) {
                const findUnBlacklister = client.users.cache.get(unblacklistedBy);

                if (unblacklistedBy === "CLIENT") {
                    blacklistsMessage += "*Unblacklisted by timeout*\n";
                } else {
                    if (findUnBlacklister)
                        blacklistsMessage += `Unblacklisted by: \`\`${findUnBlacklister.tag} (${unblacklistedBy})\`\`\n`;
                    else blacklistsMessage += "*Unblacklister not found*\n";
                    blacklistsMessage += `Reason: \`\`${
                        unblacklistReason ? unblacklistReason : "No reason provided"
                    }\`\`\n`;
                }
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
        await client.blacklists.deleteBlacklist(
            user.id,
            command.getAuthor().id,
            reason ? reason.getText() : "No reason provided"
        );

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
                : time(new Date(Date.now() + (amountOfTime as number)), "d")
        }`,
        `${user.tag} has been blacklisted`
    );
};

const guild = new Argument("guild", "single", true)
    .setDescription("The server to blacklist")
    .setDisplayName("Guild");

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
                blacklistReason,
                unblacklistReason,
                blacklistedBy,
                enabled,
                unblacklistedBy
            } = blacklist;

            blacklistsMessage += `Blacklisted on: ${time(blacklistedOn, "d")}\n`;
            blacklistsMessage += `Expires: ${
                permanent ? "``never``" : time(expiery, "d")
            }\n`;
            blacklistsMessage += `Enabled: \`\`${enabled ? "yes" : "no"}\`\`\n`;

            if (!!blacklistedBy) {
                const findBlacklister = client.users.cache.get(blacklistedBy);

                if (findBlacklister)
                    blacklistsMessage += `Blacklisted by: \`\`${findBlacklister.tag} (${blacklistedBy})\`\`\n`;
                else blacklistsMessage += "*Blacklister not found*\n";
            }

            blacklistsMessage += `Reason: \`\`${
                blacklistReason ? blacklistReason : "No reason provided"
            }\`\`\n`;
            if (!enabled && !!unblacklistedBy) {
                const findUnBlacklister = client.users.cache.get(unblacklistedBy);

                if (unblacklistedBy === "CLIENT") {
                    blacklistsMessage += "*Unblacklisted by timeout*\n";
                } else {
                    if (findUnBlacklister)
                        blacklistsMessage += `Unblacklisted by: \`\`${findUnBlacklister.tag} (${unblacklistedBy})\`\`\n`;
                    else blacklistsMessage += "*Unblacklister not found*\n";
                    blacklistsMessage += `Reason: \`\`${
                        unblacklistReason ? unblacklistReason : "No reason provided"
                    }\`\`\n`;
                }
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
        await client.blacklists.deleteBlacklist(
            findGuild.id,
            command.getAuthor().id,
            reason ? reason.getText() : "No reason provided"
        );

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
                : time(new Date(Date.now() + (amountOfTime as number)), "d")
        }`,
        `${findGuild.name} has been blacklisted`
    );
};

export { userBlacklistCommand, guildBlacklistCommand };