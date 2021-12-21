import { Schema, model } from "mongoose";

export interface Configuration {
    _id: string;
    options: any;
    name: string;
}

const schema = new Schema<Configuration>({
    _id: { type: String, required: true },
    options: { type: Object, required: true },
    name: { type: String, required: true }
});

export const ConfigurationsModel = model<Configuration>(
    "conigurations",
    schema
);
