import { Check } from "../../Client/Commands/checks";

export const check = new Check();
check.name = "is user developer";
check.type = "user";
check.run = (checkOptions) => {
    const { member, user, channel, guild } = checkOptions;

    if (!user) {
        return false;
    }

    if (!check.client.developers.includes(user)) {
        return false;
    }

    return true;
};
