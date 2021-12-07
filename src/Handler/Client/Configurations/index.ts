import { ExtendedClient } from "..";
import mongoose from "mongoose";
import { Configuration, ConfigurationsModel } from "../../Defaults/Schemas";
import { Utils } from "../../Utils";
import { Client } from "../..";

export class ConfigurationManager {
    public client: ExtendedClient;

    constructor(client: ExtendedClient) {
        this.client = client;
    }

    private async loadConfigurations(logUpdate?: boolean) {
        const { client } = this;

        const configurations = await ConfigurationsModel.find();
        for (const configuration of configurations) {
            client.cachedConfigurations.set(configuration.id, configuration);

            if (logUpdate) {
                client.console.log(
                    `Loaded configuration: "${configuration.name}", with ID: ${configuration.id}`
                );
            }
        }
    }

    public async init() {
        await this.loadConfigurations(true);
    }

    public async create(name: string, data: object, logUpdate?: boolean) {
        const { client } = this;

        const id = Utils.generateId(name);

        await ConfigurationsModel.findOneAndUpdate(
            {
                _id: id,
            },
            {
                options: data,
                name: name,
            },
            {
                upsert: true,
            }
        );

        await this.loadConfigurations();
        if (logUpdate === false) {
            return;
        }
        client.console.log(
            `Updated/Created configuration ${name}, with ID: ${id}`
        );
    }

    public update = this.create;

    public isConfiguration(name: string): boolean {
        const id = Utils.generateId(name);

        return this.client.cachedConfigurations.has(id);
    }

    public get(name: string): Configuration | false {
        const id = Utils.generateId(name);

        const configuration = this.client.cachedConfigurations.get(id);
        if (configuration) {
            return configuration;
        } else {
            return false;
        }
    }
}
