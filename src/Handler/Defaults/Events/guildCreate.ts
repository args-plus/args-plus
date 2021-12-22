import { Guild, TextChannel } from "discord.js";
import { Event } from "../..";

const event = new Event("guildCreate");

event.run = async (client, guild: Guild) => {
    console.log("NEW GUILD");
    if (!client.config.sendNewGuildMessage) return false;
    if (!guild.me) return;

    const channel = (await guild.channels.fetch()).find(
        (channel) =>
            guild.me !== null &&
            channel instanceof TextChannel &&
            channel.permissionsFor(guild.me).has("SEND_MESSAGES")
    );

    if (!channel || !(channel instanceof TextChannel)) return false;

    const prefix = await client.utils.getGuildPrefix(guild);
    const messageText = client.utils.returnMessage(client.config.newGuildMessage, [
        ["client", guild.me.user.username],
        ["guild", guild.name],
        ["prefix", prefix]
    ]);

    if (
        client.config.messagesOrEmbeds === "messages" ||
        (client.config.messagesOrEmbeds === "embeds" &&
            client.config.sendMessageWithoutPermissions &&
            !channel.permissionsFor(guild.me).has("EMBED_LINKS"))
    ) {
        const messages = client.utils.constructMessages("messages", messageText[0])[1];
        for (const message of messages) {
            await channel.send(message);
        }
    } else if (client.config.messagesOrEmbeds === "embeds") {
        const embeds = client.utils.constructMessages(
            "embeds",
            messageText[0],
            "",
            client.config.mainColor
        )[1];

        for (const embed of embeds) {
            await channel.send({ embeds: [embed] });
        }
    } else {
        return;
    }
};

export default event;
