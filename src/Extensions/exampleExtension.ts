import { Extension } from "../Handler";

export const extension = new Extension();
extension.name = "Default extension";
extension.author = "Default extensions";
extension.version = "0.0.1";
extension.run = (client) => {
    console.log("These are example extensions");
};
