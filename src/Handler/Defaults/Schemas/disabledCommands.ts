import { Schema, model } from "mongoose";

export interface DisabledCommand {
    _id: string;
    name: string;
    type: "command" | "category";
    autoDisable?: boolean;
    disablerId?: string;
    reason?: string;
}

const schema = new Schema<DisabledCommand>({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    autoDisable: { type: Boolean, required: false },
    disablerId: { type: String, required: false },
    reason: { type: String, required: false }
});

export const DisabledCommandsModel = model<DisabledCommand>("disabled-commands", schema);
