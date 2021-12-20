import { Collection, User } from "discord.js";
import { Client } from "..";
import { BlacklistedUser, BlacklistedusersModel } from "../../Defaults/Schemas/blacklist";
import { Types } from "mongoose";

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
            const findBlackList = this.cachedBlacklists.get(blacklistedUser.userId);

            if (findBlackList) {
                if (
                    findBlackList.blacklistedOn.getTime() >
                    blacklistedUser.blacklistedOn.getTime()
                )
                    continue;
            }

            if (
                (blacklistedUser.expiery.getTime() > Date.now() ||
                    blacklistedUser.permanent) &&
                blacklistedUser.enabled
            ) {
                this.cachedBlacklists.set(blacklistedUser.userId, blacklistedUser);

                if (logUpdate) {
                    client.console.log(
                        `Loaded blacklisted user id: ${blacklistedUser.userId}`
                    );
                }
            } else {
                if (!blacklistedUser.enabled) {
                    await this.deleteBlacklist(blacklistedUser.userId);
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
        const blacklistedUserConstructor: BlacklistedUser = {
            _id: new Types.ObjectId(),
            userId: id,
            blacklistedOn: new Date(),
            enabled: true,
            permanent: duration === true ? duration : false,
            expiery: duration !== true ? duration : new Date(),
            reason: reason,
            blacklistedBy: blacklistedBy ? blacklistedBy.id : ""
        };

        this.cachedBlacklists.set(id, blacklistedUserConstructor);

        await BlacklistedusersModel.create(blacklistedUserConstructor);
    }

    public editBlacklist = this.blacklistUser;

    public async deleteBlacklist(
        id: string,
        unblacklistedBy: string | "CLIENT" = "CLIENT"
    ) {
        const findBlacklist = this.cachedBlacklists.get(id);

        if (!findBlacklist) return false;

        findBlacklist.enabled = false;

        findBlacklist.unblacklistedBy = unblacklistedBy;

        this.cachedBlacklists.delete(id);

        await BlacklistedusersModel.findOneAndUpdate(
            { _id: findBlacklist._id },
            findBlacklist,
            { upsert: true }
        );

        return true;
    }

    public async isBlacklisted(
        id: string
    ): Promise<[false] | [true, string | undefined]> {
        const findBlacklist = this.cachedBlacklists.get(id);

        if (!findBlacklist) {
            return [false];
        }

        if (findBlacklist.permanent) return [true, findBlacklist.reason];

        if (findBlacklist.expiery.getTime() > Date.now() && findBlacklist.enabled) {
            return [true, findBlacklist.reason];
        } else {
            await this.deleteBlacklist(id);
            return [false];
        }
    }
}
