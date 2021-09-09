import ExtendedClient from "..";
import { ConfigurationsModel } from "../../DefaultSchemas";

export class ConfigurationsHandler {
    public client: ExtendedClient;

    public async init() {
        await this.updateConfigurations(true);
    }

    public async createConfiguration(
        name: string,
        data: object,
        logUpdate?: boolean
    ) {
        const id = name.toUpperCase().replace(/[ ]/g, "_");

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

        await this.updateConfigurations();
        if (logUpdate === false) {
            return;
        }
        this.client.messageHandler.log(
            `Updated/Created configuration ${name}, with ID: ${id}`
        );
    }

    public updateConfiguration = this.createConfiguration;

    private async updateConfigurations(logUpdate?: boolean) {
        const configurations = await ConfigurationsModel.find();
        for (const configuration of configurations) {
            this.client.cachedConfigurations.set(
                configuration.id,
                configuration
            );

            if (logUpdate) {
                this.client.messageHandler.log(
                    `Loaded configuration: "${configuration.name}", with ID: ${configuration.id}`
                );
            }
        }
    }
}
