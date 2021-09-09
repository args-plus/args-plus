import mongoose from "mongoose";
import { Client } from "../..";

export class MongoHandler {
    public client: Client;

    public async connect() {
        const { config, messageHandler } = this.client;

        const connection = await mongoose.connect(config.mongoURI, {
            keepAlive: true,
            useFindAndModify: false,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        this.client.connection = connection;

        messageHandler.log(
            `Connected to mongo database: ${connection.connection.name}`
        );
    }
}
