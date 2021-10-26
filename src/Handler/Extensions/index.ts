import ExtendedClient from "../Client";
import { Item } from "../Client/ClientLoader";

export class Extension extends Item {
    public run: (client: ExtendedClient) => any = () => {};
}
