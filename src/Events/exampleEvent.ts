import { Event } from "../Handler";

export const event = new Event();
// event.name is the event you want to fire, for example messageCreate
event.name = "ready";

// This is what runs on the event
event.run = (client) => {
    // Run code here
    console.log("This is an example event");
};
