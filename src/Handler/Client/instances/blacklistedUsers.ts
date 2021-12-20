import { Collection, User } from "discord.js";
import { Client } from "..";
import { BlacklistedUser, BlacklistedusersModel } from "../../Defaults/Schemas/blacklist";

export class ClientBlacklists {
    readonly client: Client;

    public cachedBlacklists: Collection<string, BlacklistedUser> = new Collection();

    constructor(client: Client) {
        this.client = client;
    }

    private async loadBlacklists(logUpdate = false) {
        const { client } = this;

        if (!client.getConnected()) return false;

        const blacklistedUsers = await BlacklistedusersModel.find();
        for (const blacklistedUser of blacklistedUsers) {
            if (blacklistedUser.expiery.getTime() > Date.now()) {
                this.cachedBlacklists.set(blacklistedUser.id, blacklistedUser);

                if (logUpdate) {
                    client.console.log(
                        `Loaded blacklisted user id: ${blacklistedUser.id}`
                    );
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
        return await this.loadBlacklists(true);
    }

    public async blacklistUser(
        id: string,
        duration: true | Date = true,
        reason: string = "No reason provided",
        blacklistedBy?: User
    ) {
        const blacklistedUserConstructor: BlacklistedUser = {
            userId: id,
            blacklistedOn: new Date(),
            permanent: duration === true ? duration : false,
            expiery: duration !== true ? duration : new Date(),
            reason: reason,
            blacklistedBy: blacklistedBy ? blacklistedBy.id : ""
        };

        this.cachedBlacklists.set(id, blacklistedUserConstructor);

        await BlacklistedusersModel.findOneAndUpdate(
            { userId: id },
            blacklistedUserConstructor,
            { upsert: true }
        );
    }

    public editBlacklist = this.blacklistUser;

    public async unblacklistuser(id: string) {
        const deleteBlacklist = await this.cachedBlacklists.delete(id);

        if (!deleteBlacklist) return false;

        await BlacklistedusersModel.findOneAndDelete({ userId: id });

        return true;
    }

    public isBlacklisted(id: string) {
        const findBlacklist = this.cachedBlacklists.get(id);

        if (!findBlacklist) {
            return false;
        }

        if (findBlacklist.permanent) return true;

        return findBlacklist.expiery.getTime() > Date.now();
    }
}
