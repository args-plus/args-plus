import { Constants, DiscordAPIError, Guild, User } from "discord.js";
import { Argument, Command } from "../../Handler";
import { BlacklistModel } from "../../Handler/Defaults/Schemas/blacklist";
import { time } from "@discordjs/builders";

const item = new Argument("user", "single", true)
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
    .setArgs([item, duration, reason])
    .setDescription("Blacklist a user or retrieve information about them")
    .setAliases(["bl"]);

userBlacklistCommand.run = async (client, command) => {
    const { args } = command;

    const findUser = await client.utils.fetchUser(args[0].getStringValue());
    const findGuild = await client.utils.fetchGuild(args[0].getStringValue());

    if (!findUser && !findGuild) {
        return command.sendError(
            `I could not find a server or user with the id of: ${args[0].getStringValue()}`,
            "Please provide a valid ID"
        );
    }

    const itemToFind: Guild | User = (findUser ? findUser : findGuild) as Guild | User;

    const duration = args[1];
    const reason = args[2];

    if (!duration) {
        const findBlacklists = await BlacklistModel.find({ itemId: itemToFind.id });

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

            blacklistsMessage += `Blacklisted on: ${time(blacklistedOn, "d")}(${time(
                blacklistedOn,
                "R"
            )})\n`;
            blacklistsMessage += `Expires: ${
                permanent ? "``never``" : `${time(expiery, "d")}(${time(expiery, "R")})`
            }\n`;
            blacklistsMessage += `Enabled: \`\`${enabled ? "yes" : "no"}\`\`\n`;

            if (blacklistedBy) {
                const findBlacklister = await client.utils.fetchUser(blacklistedBy);

                if (findBlacklister)
                    blacklistsMessage += `Blacklisted by: \`\`${findBlacklister.tag} (${blacklistedBy})\`\`\n`;
                else blacklistsMessage += "*Blacklister not found*\n";
            }

            blacklistsMessage += `Reason: \`\`${
                blacklistReason ? blacklistReason : "No reason provided"
            }\`\`\n`;
            if (!enabled && !!unblacklistedBy) {
                const findUnBlacklister = await client.utils.fetchUser(unblacklistedBy);

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

    const name = itemToFind instanceof User ? itemToFind.username : itemToFind.name;

    if (duration.getStringValue() === "off") {
        await client.blacklists.deleteBlacklist(
            itemToFind.id,
            command.getAuthor().id,
            reason ? reason.getText() : "No reason provided"
        );

        return command.sendMessage(
            `${name} has been unblacklisted`,
            `${name} is no longer blacklisted`
        );
    }

    if (
        itemToFind instanceof User &&
        client.blacklists.isUnblacklistable(itemToFind.id)
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

    await client.blacklists.blacklistUser(
        itemToFind.id,
        permanent ? permanent : new Date(Date.now() + (amountOfTime as number)),
        reason?.getText(),
        command.getAuthor()
    );

    await command.sendMessage(
        `I succesfully blacklisted: ${name}\nReason: \`\`${
            reason ? reason.getText() : "No reason provided"
        }\`\`\nIt will expire:  ${
            permanent
                ? "``never``"
                : `${time(new Date(Date.now() + (amountOfTime as number)), "d")}(${time(
                      new Date(Date.now() + (amountOfTime as number)),
                      "R"
                  )})`
        }`,
        `${name} has been blacklisted`
    );
};

export { userBlacklistCommand };
