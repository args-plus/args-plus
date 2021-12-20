import { Schema, model, Types } from "mongoose";

export interface Blacklist {
    _id: Types.ObjectId;
    itemId: string;
    blacklistedOn: Date;
    expiery: Date;
    enabled: boolean;
    permanent: boolean;
    reason?: string;
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
    reason: { type: String, required: false },
    blacklistedBy: { type: String, required: false },
    unblacklistedBy: { type: String, required: false }
});

export const BlacklistModel = model<Blacklist>("blacklists", BlacklistSchema);
