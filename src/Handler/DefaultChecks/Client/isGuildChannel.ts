import { Check } from "../../Client/Commands/checks";

export const check = new Check();
check.name = "is guild channel";
check.type = "client";
check.run = (checkOptions) => {
    const { member, user, channel, guild } = checkOptions;

    if (!channel) {
        return false;
    }

    if (channel.type === "DM" || channel.type === "GROUP_DM") {
        return false;
    }

    return true;
};
