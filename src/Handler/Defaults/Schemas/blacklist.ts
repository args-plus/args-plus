import { Schema, model } from "mongoose";

export interface BlacklistedUser {
    userId: string;
    blacklistedOn: Date;
    expiery: Date;
    permanent?: boolean;
    reason?: string;
    blacklistedBy?: string;
}

const schema = new Schema<BlacklistedUser>({
    blacklistedOn: { type: Date, required: true },
    userId: { type: String, required: true },
    expiery: { type: Date, required: true },
    permanent: { type: Boolean, required: false },
    reason: { type: String, required: false },
    blacklistedBy: { type: String, required: false }
});

export const BlacklistedusersModel = model<BlacklistedUser>("blacklisted-users", schema);
