import { Extension } from "../Client/Extensions/extension";

export const extension = new Extension();
extension.run = (client) => {
    client.eventEmitter.on("fullyLoaded", () => {
        client.messageHandler.log(`All systems online 👍`);
    });
};
