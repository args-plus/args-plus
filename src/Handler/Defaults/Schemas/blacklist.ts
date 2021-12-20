import { Schema, model, Types } from "mongoose";

export interface BlacklistedUser {
    _id: Types.ObjectId;
    userId: string;
    blacklistedOn: Date;
    expiery: Date;
    enabled: boolean;
    permanent?: boolean;
    reason?: string;
    blacklistedBy?: string;
    unblacklistedBy?: string;
}

const schema = new Schema<BlacklistedUser>({
    _id: { type: String, required: true },
    blacklistedOn: { type: Date, required: true },
    userId: { type: String, required: true },
    expiery: { type: Date, required: true },
    enabled: { type: Boolean, required: true },
    permanent: { type: Boolean, required: false },
    reason: { type: String, required: false },
    blacklistedBy: { type: String, required: false },
    unblacklistedBy: { type: String, required: false }
});

export const BlacklistedusersModel = model<BlacklistedUser>("blacklisted-users", schema);
