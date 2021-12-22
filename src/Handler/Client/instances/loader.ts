import { Collection } from "discord.js";
import { Client } from "..";
import path from "path";
import { ClientUtils } from "../utils/utils";

export abstract class Item {
    public name: string;
    public dir = "";
    public readonly id: string;

    private registered = false;

    public getRegistered() {
        return this.registered;
    }

    public setRegistered() {
        this.registered = true;
        return true;
    }

    private loaded = false;

    public getLoaded() {
        return this.loaded;
    }
    public setLoaded() {
        this.loaded = true;
        return true;
    }

    constructor(name: string) {
        this.name = name;
        this.id = ClientUtils.generateId(name);
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type loadItemCollection = Collection<any, any> | any[];

export class ClientLoader {
    readonly client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    private loadItem(collection: loadItemCollection, item: Item) {
        if (collection instanceof Collection) {
            collection.set(item.name, item);
        } else {
            collection.push(item);
        }
    }

    public async loadItems(
        collection: loadItemCollection,
        item: typeof Item,
        dirs: string[]
    ) {
        for (const dir of dirs) {
            const files = await this.client.utils.loadFiles(
                path.join(__dirname, "..", "..", "..", dir),
                `Skipping loading files from %FOLDER, as there is no files there`
            );
            for (const file of files) {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const requireFolder = require(file);

                for (const propertyKey in requireFolder) {
                    const property = requireFolder[propertyKey];

                    if (!(property instanceof item)) continue;

                    if (property.getRegistered()) continue;

                    property.setRegistered();
                    property.dir = file;

                    this.loadItem(collection, property);
                }

                // if (!(requireFolder.default instanceof item)) {
                //     continue;
                // }
                // requireFolder.default.dir = file;

                // if (requireFolder.default.getRegistered()) {
                //     continue;
                // }

                // requireFolder.default.setRegistered();

                // this.loadItem(collection, requireFolder.default);
            }
        }
    }
}
