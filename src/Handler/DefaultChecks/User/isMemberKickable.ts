import { Check } from "../../Client/Commands/checks";

export const check = new Check();
check.name = "is member kickable";
check.type = "user";
check.run = (checkOptions) => {
    const { member, user, channel, guild } = checkOptions;

    if (!member) {
        return false;
    }

    if (!member.kickable) {
        return false;
    }

    return true;
};
