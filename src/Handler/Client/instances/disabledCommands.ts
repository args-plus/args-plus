import { Collection, User } from "discord.js";
import { Client } from "..";
import {
    DisabledCommand,
    DisabledCommandsModel
} from "../../Defaults/Schemas/disabledCommands";

export class DisabledCommandManager {
    readonly client: Client;

    public cachedDisabledItems: Collection<string, DisabledCommand> = new Collection();

    constructor(client: Client) {
        this.client = client;
    }

    private async loadDisabledItems(logUpdate = false) {
        const { client } = this;

        if (!client.getConnected()) return false;

        const disabledCommands = await DisabledCommandsModel.find();
        for (const disabledCommand of disabledCommands) {
            this.cachedDisabledItems.set(disabledCommand.id, disabledCommand);

            if (logUpdate) {
                // prettier-ignore
                client.console.log(`Loaded dsiabled command: "${disabledCommand.name}"`);
            }
        }
        return true;
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
                    `Cannot load disabled commands without first connecting to mongo`
                );
                return false;
            }
        }
        return await this.loadDisabledItems(true);
    }

    public getType(name: string) {
        const findCategory = this.client.categories.get(name);
        const findCommand = this.client.commands.get(name);

        if (findCommand && !findCategory) {
            return "command";
        } else if (!findCommand && findCategory) {
            return "category";
        } else if (findCommand && findCategory) {
            return "command";
        } else {
            return false;
        }
    }

    private generateId(name: string) {
        return this.client.utils.generateId(name);
    }

    public isDisabledItem(name: string) {
        return this.cachedDisabledItems.has(this.generateId(name));
    }

    public getDisabledItem(name: string) {
        return this.cachedDisabledItems.get(this.generateId(name));
    }

    public async disableItem(
        name: string,
        temporary = false,
        user?: User,
        reason?: string
    ) {
        const { client } = this;

        const findType = this.getType(name);

        if (!findType) return false;

        if (this.isDisabledItem(name)) {
            return true;
        } else {
            const disabledCategoryConstructor: DisabledCommand = {
                _id: this.generateId(name),
                name
            };

            if (reason) {
                disabledCategoryConstructor.reason = reason;
            }

            if (temporary) {
                disabledCategoryConstructor.autoDisable = true;
            } else if (user) {
                disabledCategoryConstructor.disablerId = user.id;
            } else {
                return client.console.error(
                    "To disable an item there must be a user or temporary argument provided"
                );
            }

            this.cachedDisabledItems.set(
                this.generateId(name),
                disabledCategoryConstructor
            );

            if (!temporary) {
                await DisabledCommandsModel.findByIdAndUpdate(
                    this.generateId(name),
                    disabledCategoryConstructor,
                    { upsert: true }
                );
            }

            return true;
        }
    }

    public async enableItem(name: string) {
        const type = this.getType(name);

        if (!type) return false;

        const id = this.generateId(name);

        const findCategory = this.cachedDisabledItems.get(id);

        if (!findCategory) {
            return true;
        }

        this.cachedDisabledItems.delete(id);

        await DisabledCommandsModel.findByIdAndDelete(id);

        return true;
    }

    public async toggleItem(
        name: string,
        temporary = false,
        user?: User,
        reason?: string
    ) {
        if (!this.getType(name)) return false;

        if (this.isDisabledItem(name)) {
            return await this.enableItem(name);
        } else {
            return await this.disableItem(name, temporary, user, reason);
        }
    }
}
