import { Schema, model } from "mongoose";

interface GuildPrefix {
    _id: string;
    guildPrefix: string;
}

const schema = new Schema<GuildPrefix>({
    _id: { type: String, required: true },
    guildPrefix: { type: String, required: true },
});

export const GuildPrefixModel = model<GuildPrefix>("guild-prefixes", schema);
