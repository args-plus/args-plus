import { Client } from "../..";
import { CheckRun } from "../../Interaces";

export class Check {
    public client: Client;
    public name: string;
    public type: "client" | "user";
    public id: string;
    public run: CheckRun;
}
