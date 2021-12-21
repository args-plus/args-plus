import { Collection, User } from "discord.js";
import { Client } from "..";
import { Blacklist, BlacklistModel } from "../../Defaults/Schemas";
import { Types } from "mongoose";

export class ClientBlacklists {
    readonly client: Client;

    public cachedBlacklists: Collection<string, Blacklist> = new Collection();

    constructor(client: Client) {
        this.client = client;
    }

    public isUnblacklistable(userId: string) {
        return (
            (this.client.config.unBlacklistableUsers.includes("DEVELOPERS") &&
                this.client.config.botDevelopers.includes(userId)) ||
            this.client.config.unBlacklistableUsers.includes(userId)
        );
    }

    private async loadBlacklists(logUpdate = false) {
        const { client } = this;

        if (!client.getConnected()) return false;

        const blacklists = await BlacklistModel.find();
        for (const blacklist of blacklists) {
            const findBlackList = this.cachedBlacklists.get(blacklist.itemId);

            if (findBlackList) {
                if (
                    findBlackList.blacklistedOn.getTime() >
                    blacklist.blacklistedOn.getTime()
                )
                    continue;
            }

            if (
                (blacklist.expiery.getTime() > Date.now() || blacklist.permanent) &&
                blacklist.enabled
            ) {
                this.cachedBlacklists.set(blacklist.itemId, blacklist);

                if (logUpdate) {
                    client.console.log(`Loaded blacklist id: ${blacklist.itemId}`);
                }
            } else {
                if (!blacklist.enabled) {
                    await this.deleteBlacklist(blacklist.itemId);
                }
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
                    `Cannot load blacklisted users without first connecting to mongo`
                );
                return false;
            }
        }
        return await this.loadBlacklists(false);
    }

    public async blacklistUser(
        id: string,
        duration: true | Date = true,
        reason: string = "No reason provided",
        blacklistedBy?: User
    ) {
        const blacklistConstructor: Blacklist = {
            _id: new Types.ObjectId(),
            itemId: id,
            blacklistedOn: new Date(),
            enabled: true,
            permanent: duration === true ? duration : false,
            expiery: duration !== true ? duration : new Date(),
            blacklistReason: reason,
            blacklistedBy: blacklistedBy ? blacklistedBy.id : ""
        };

        const findBlacklist = this.cachedBlacklists.get(id);

        if (findBlacklist) {
            findBlacklist.enabled = false;
            await BlacklistModel.findByIdAndUpdate(
                { _id: findBlacklist._id.toString() },
                { enabled: false },
                { upsert: true }
            );
        }

        this.cachedBlacklists.set(id, blacklistConstructor);

        await BlacklistModel.create(blacklistConstructor);
    }

    public editBlacklist = this.blacklistUser;

    public async deleteBlacklist(
        id: string,
        unblacklistedBy: string | "CLIENT" = "CLIENT",
        reason: string = "No reason provided"
    ) {
        const findBlacklist = this.cachedBlacklists.get(id);

        if (!findBlacklist) return false;

        findBlacklist.enabled = false;

        findBlacklist.unblacklistedBy = unblacklistedBy;

        findBlacklist.unblacklistReason = reason;

        this.cachedBlacklists.delete(id);

        await BlacklistModel.findOneAndUpdate({ _id: findBlacklist._id }, findBlacklist, {
            upsert: true
        });

        return true;
    }

    public async isBlacklisted(
        id: string
    ): Promise<[false] | [true, string | undefined]> {
        const findBlacklist = this.cachedBlacklists.get(id);

        if (!findBlacklist) {
            return [false];
        }

        if (findBlacklist.permanent) return [true, findBlacklist.blacklistReason];

        if (findBlacklist.expiery.getTime() > Date.now() && findBlacklist.enabled) {
            return [true, findBlacklist.blacklistReason];
        } else {
            await this.deleteBlacklist(id);
            return [false];
        }
    }
}
