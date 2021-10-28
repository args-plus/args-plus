import { Event } from "../Handler";

const event = new Event("ready");

event.run = () => {
    console.log("This is an example event");
};

export default event;
