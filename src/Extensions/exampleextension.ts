import { Command, Extension } from "../Handler";

const extension = new Extension("myextension");
extension.run = (client) => {
    client.on("ready", () => {
        console.log("This is an example extensions");
    });

    const commandOne = new Command("extension");
    commandOne.run = (client, command) => {};
    commandOne.category = "Extensions";
    commandOne.description = "it's very nice";
    client.loadCommand(commandOne);

    const commandTwo = new Command("extension2");
    commandTwo.run = (client, command) => {};
    commandTwo.category = [
        "Extensions",
        "You can also register commands in extensions"
    ];
    client.loadCommand(commandTwo);
};

export default extension;
