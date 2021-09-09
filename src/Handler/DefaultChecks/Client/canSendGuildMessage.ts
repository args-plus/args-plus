import { Check } from "../../Client/Commands/checks";

export const check = new Check();
check.name = "Send guild message";
check.type = "client";
check.run = (checkOptions) => {
    const { channel, guild } = checkOptions;

    if (!channel || !guild) {
        return false;
    }

    if (!channel.isText()) {
        return false;
    }

    if (channel.type === "DM") {
        return false;
    }

    if (
        !channel.permissionsFor(guild.me).has("SEND_MESSAGES") ||
        !channel.permissionsFor(guild.me).has("VIEW_CHANNEL")
    ) {
        return false;
    }

    return true;
};
