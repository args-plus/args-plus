import { Event } from "../Handler";

export const event = new Event();
event.name = "ready";
event.run = (client) => {
    console.log("ASDASDAS");
};
