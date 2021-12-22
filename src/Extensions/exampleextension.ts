import { Command, Extension } from "../Handler";

const extension = new Extension("myextension");
extension.run = (client) => {
    client.on("ready", () => {
        console.log("This is an example extensions");
    });

    const commandOne = new Command("extension")
        .setDescription("it's very nice")
        .setCategory("Extensions");
    client.loadCommand(commandOne);

    const commandTwo = new Command("extension2").setCategory([
        "Extenions",
        "You can also register commands in extensions"
    ]);
    client.loadCommand(commandTwo);
};

export default extension;
