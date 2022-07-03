import { Event } from "../Handler";
import path from "path";

const ReadyEvent = new Event("ready");

ReadyEvent.run = (client) => {
    client.console.info(
        `This is a ready event, edit this file in ${path.resolve(__filename)}`
    );
};

export default ReadyEvent;
