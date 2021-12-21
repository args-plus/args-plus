import { Event } from "../..";

const event = new Event("ready");

event.run = (client) => {
    if (client.user) client.console.log(`Logged into ${client.user.username}`);
    else console.log(`Logged into discord.js`);
};

export default event;
