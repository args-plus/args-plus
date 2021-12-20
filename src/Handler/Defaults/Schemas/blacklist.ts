import { Schema, model, Types } from "mongoose";

export interface Blacklist {
    _id: Types.ObjectId;
    itemId: string;
    blacklistedOn: Date;
    expiery: Date;
    enabled: boolean;
    permanent: boolean;
    blacklistReason?: string;
    unblacklistReason?: string;
    blacklistedBy?: string;
    unblacklistedBy?: string;
}

const BlacklistSchema = new Schema<Blacklist>({
    _id: { type: String, required: true },
    blacklistedOn: { type: Date, required: true },
    itemId: { type: String, required: true },
    expiery: { type: Date, required: true },
    enabled: { type: Boolean, required: true },
    permanent: { type: Boolean, required: true },
    blacklistReason: { type: String, required: false },
    unblacklistReason: { type: String, required: false },
    blacklistedBy: { type: String, required: false },
    unblacklistedBy: { type: String, required: false }
});

export const BlacklistModel = model<Blacklist>("blacklists", BlacklistSchema);
