import { Collection } from "discord.js";
import Client from "..";
import path from "path";
import fs from "fs";
import Utils from "./utils";

export abstract class Item {
    public name: string;
    public dir: string | undefined;
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
        this.id = Utils.generateId(name);
    }
}

export type ItemCollection<
    Instance extends Item,
    Type extends "array" | "collection"
> = Type extends "array"
    ? Instance[]
    : Type extends "collection"
    ? Collection<string, Instance>
    : never;

export class ClientLoader {
    readonly client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    private isFile(name: string): boolean {
        if (
            (name.endsWith(".ts") && !name.endsWith(".d.ts")) ||
            (name.endsWith(".js") && !name.endsWith(".map.js"))
        ) {
            return true;
        } else {
            return false;
        }
    }

    private async loadFiles(parentDir: string) {
        const filePaths: string[] = [];
        const readCommands = async (dir: string) => {
            let files: string[];
            try {
                files = fs.readdirSync(dir);
            } catch (error) {
                if (error instanceof Error) {
                    console.error(error);
                }
                return false;
            }
            for (const file of files) {
                const stat = fs.lstatSync(path.join(dir, file));
                if (stat.isDirectory()) {
                    readCommands(path.join(dir, file));
                } else {
                    if (this.isFile(file)) {
                        const commandDir = path.join(dir, file);
                        filePaths.push(commandDir);
                    }
                }
            }
        };
        await readCommands(parentDir);
        return filePaths;
    }

    private loadItem<Instance extends Item, Type extends "collection" | "array">(
        collection: ItemCollection<Instance, Type>,
        item: Instance
    ) {
        if (collection instanceof Collection) {
            collection.set(item.name, item);
        } else {
            collection.push(item);
        }
    }
    public async loadItems<Instance extends Item, Type extends "collection" | "array">(
        collection: ItemCollection<Instance, Type>,
        item: typeof Item,
        dirs: string[]
    ) {
        for (const dir of dirs) {
            const files = await this.loadFiles(path.join(path.resolve("./"), "src", dir));
            for (const file of files) {
                const requireFolder = await import(file);

                for (const propertyKey in requireFolder) {
                    const property = requireFolder[propertyKey];

                    if (!(property instanceof item)) continue;
                    if (property.getRegistered()) continue;

                    property.setRegistered();
                    property.dir = file;

                    this.loadItem(collection, property);
                }
            }
        }
    }
}
