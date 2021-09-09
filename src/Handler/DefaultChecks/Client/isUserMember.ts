import { Check } from "../../Client/Commands/checks";

export const check = new Check();
check.name = "is user member";
check.type = "client";
check.run = (checkOptions) => {
    const { member, user, channel, guild } = checkOptions;

    if (!user || !guild) {
        return false;
    }

    const findMember = guild.members.cache.get(user.id);

    if (!findMember) {
        return false;
    }

    return true;
};
