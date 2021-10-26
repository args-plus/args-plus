import mongoose from "mongoose";
import { ExtendedClient } from "..";

export class MongoManager {
    public client: ExtendedClient;

    constructor(client: ExtendedClient) {
        this.client = client;
    }

    public async connect() {
        const { client } = this;
        const { config, console } = client;

        const connection = await mongoose.connect(config.mongoURI, {
            keepAlive: true,
            useFindAndModify: false,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        client.connection = connection;
        client.connectedToMongo = true;
        console.log(
            `Connected to mongo database: ${connection.connection.name}`
        );
    }
}
