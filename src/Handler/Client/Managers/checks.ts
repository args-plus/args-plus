import ExtendedClient from "..";
import { checkOptions } from "../../Interaces";
import { Check } from "../Commands/checks";

export class CheckManager {
    public client: ExtendedClient;

    public async runCheck(
        name: string,
        checkOptions: checkOptions,
        type: "client" | "user",
        ...options
    ) {
        // const clientCheck
        let findCheck: Check;

        if (type === "client") {
            findCheck = this.client.clientChecks.get(
                name.replace(/[ ]/g, "_").toUpperCase()
            );
        } else {
            findCheck = this.client.userChecks.get(
                name.replace(/[ ]/g, "_").toUpperCase()
            );
        }

        if (!findCheck) {
            return this.client.messageHandler.error(
                `Cannot find and run check: ${name}`
            );
        }

        const check = await findCheck.run(checkOptions, options);

        this.client.eventEmitter.emit("checkRan", findCheck);

        return check;
    }
}
