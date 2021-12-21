import { Client } from "..";
import mongoose, { mongo } from "mongoose";

export class ClientMongo {
    readonly client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    public async connect(mongoURI: string) {
        const { client } = this;
        const { console } = client;

        const connection = await mongoose.connect(mongoURI, {
            keepAlive: true
        });

        client.setConnected();
        console.log(
            `Connected to mongo databse: ${connection.connection.name}`
        );
    }
}
