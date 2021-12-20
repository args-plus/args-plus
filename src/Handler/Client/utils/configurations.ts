import { Client } from "..";
import { Configuration, ConfigurationsModel } from "../../Defaults/Schemas";

export class ClientConfigurations {
    readonly client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    private async loadConfigurations(logUpdate = false) {
        const { client } = this;

        if (!client.getConnected()) return false;

        const configurations = await ConfigurationsModel.find();
        for (const configuration of configurations) {
            client.cachedConfigurations.set(configuration.id, configuration);

            if (logUpdate) {
                // prettier-ignore
                client.console.log(`Loaded configuration: "${configuration.name}", with ID: ${configuration.id}`);
            }
        }
    }

    public async init(autoConnectToMongo = true, mongoURI?: string) {
        const { client } = this;

        if (!client.getConnected()) {
            if (autoConnectToMongo) {
                if (mongoURI) {
                    await client.mongo.connect(mongoURI);
                } else {
                    client.console.error(
                        `Cannot auto connect to mongo without a mongo URI`
                    );
                    return false;
                }
            } else {
                client.console.error(
                    `Cannot load configurations without first connecting to mongo`
                );
                return false;
            }
        }

        return await this.loadConfigurations(true);
    }

    public async create(name: string, data: object, logUpdate = false) {
        const { client } = this;

        const id = this.client.utils.generateId(name);

        await ConfigurationsModel.findOneAndUpdate(
            { _id: id },
            { options: data, name },
            { upsert: true }
        );

        // await this.loadConfigurations();
        client.cachedConfigurations.set(id, { _id: id, name, options: data });

        if (logUpdate) {
            client.console.log(`Updated/Created configuration ${name}, with ID: ${id}`);
        }
        return true;
    }

    public update = this.create;

    public isConfiguration(name: string) {
        const { client } = this;

        const id = client.utils.generateId(name);

        return this.client.cachedConfigurations.has(id);
    }

    public get(name: string): Configuration | false {
        const { client } = this;

        const id = client.utils.generateId(name);

        const configuration = this.client.cachedConfigurations.get(id);
        if (configuration) {
            return configuration;
        } else {
            return false;
        }
    }
}
