import { Client } from "..";
import { Item } from "../Client/instances/loader";

export class Extension extends Item {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public run: (client: Client) => any = () => {
        console.log(`Change your run method for ${this.name}`)
    };
}
