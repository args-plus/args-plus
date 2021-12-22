import { Client } from "..";
import { checkOptions } from "../../Checks";

export class ClientChecks {
    readonly client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    public isClientCheck(checkId: string): boolean {
        const { client } = this;

        if (!client.clientChecks.has(checkId)) return false;

        return true;
    }

    public isUserCheck(checkId: string): boolean {
        const { client } = this;

        if (!client.userChecks.has(checkId)) return false;

        return true;
    }

    public isCheck(checkId: string): boolean {
        return this.isClientCheck(checkId) || this.isUserCheck(checkId);
    }

    public getCheck(checkId: string, type?: "client" | "user") {
        if (!this.isCheck(checkId)) {
            return null;
        } else if (this.isClientCheck(checkId) && !this.isUserCheck(checkId)) {
            return this.client.clientChecks.get(checkId);
        } else if (this.isUserCheck(checkId) && !this.isClientCheck(checkId)) {
            return this.client.userChecks.get(checkId);
        } else {
            if (type) {
                if (type === "client") {
                    return this.client.clientChecks.get(checkId);
                } else {
                    return this.client.userChecks.get(checkId);
                }
            } else {
                return this.client.clientChecks.get(checkId);
            }
        }
    }

    public runCheck(
        name: string,
        checkOptions: checkOptions,
        type?: "client" | "user",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...options: any[]
    ) {
        const findCheck = this.getCheck(name, type);

        if (!findCheck) {
            // prettier-ignore
            this.client.console.error(`Cannot find and run check: ${name}`);
            return false;
        }

        const incorrectArgs = (property: string) => {
            this.client.console.error(`Check: ${name} requires a ${property} option`);
            return false;
        };

        if (findCheck.requireChannel && !checkOptions.channel)
            return incorrectArgs("channel");

        if (findCheck.requireGuild && !checkOptions.guild) return incorrectArgs("guild");

        if (findCheck.requireMember && !checkOptions.member)
            return incorrectArgs("guild member");

        if (findCheck.requireUser && !checkOptions.user) return incorrectArgs("user");

        const check = findCheck.run(checkOptions, options);

        return check;
    }
}
