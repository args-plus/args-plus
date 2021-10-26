import { Event } from "../../Events";

const event = new Event("ready");
event.run = (client, asd) => {
    client.console.log(
        `Sucesfully logged in as "${client.user?.tag}", awaiting mongo connection to continue loading`
    );
};

export default event;
