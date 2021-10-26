import ExtendedClient from "../Client";
import { Item } from "../Client/ClientLoader";
import { CheckRun } from "../Interfaces";
import { checkOptions } from "../Interfaces/Check";
import { Utils } from "../Utils";

export class Check extends Item {
    public id: string = "";
    public run: CheckRun = () => true;

    constructor(name: string) {
        super(name);
        this.id = Utils.generateId(name);
    }
}

export class CheckManger {
    public client: ExtendedClient;

    constructor(client: ExtendedClient) {
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

    public async runCheck(
        name: string,
        checkOptions: checkOptions,
        type: "client" | "user",
        ...options: any[]
    ) {
        let findCheck: Check | undefined;

        if (type === "client") {
            findCheck = this.client.clientChecks.get(Utils.generateId(name));
        } else {
            findCheck = this.client.userChecks.get(Utils.generateId(name));
        }

        if (!findCheck) {
            // prettier-ignore
            return this.client.console.error(`Cannot find and run check: ${name}`);
        }

        const check = await findCheck.run(checkOptions, options);

        return check;
    }
}
