import { Client } from "..";
import { Item } from "../Client/instances/loader";

export class Extension extends Item {
    public run: (client: Client) => any = () => {};
}
