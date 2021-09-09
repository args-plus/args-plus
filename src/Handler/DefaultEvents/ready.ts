import { Event } from "../Client/Events/event";

export const event = new Event();
event.name = "ready";
event.run = async (client) => {
    client.messageHandler.log(
        `Logged into: "${client.user.tag}".\nPlease wait for a mongo DB connection for the bot to finish loading`
    );
};
