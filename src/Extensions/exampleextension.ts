import { Extension } from "../Handler";

const extension = new Extension("myextension");
extension.run = (client) => {
    client.on("ready", () => {
        console.log("This is an example extensions");
    });
};

export default extension;
