import { Command } from "../../Handler";

const command = new Command("toggle");
command.description = "Toggle a command on or off";
command.overideLoadSlashCommand = true;
command.args = [
    {
        name: "command",
        displayName: "Command",
        type: "single",
        required: true
    },
    {
        name: "state",
        displayName: "State",
        type: "customValue",
        customValues: ["on", "off"],
        allowLowerCaseCustomValue: true
    }
];
command.toggleable = false;
command.run = async (client, command) => {
    if (!command.args[0] || !command.args[0].stringValue) {
        return;
    }

    const commandToFind = command.args[0].stringValue.toLowerCase();
    const findCommand = client.commands.get(commandToFind);

    if (!findCommand) {
        return command.sendError(
            "Please make sure you are using the command name and not the alias",
            `I couldnt find a command with the name of ${commandToFind}`
        );
    } else if (!findCommand.toggleable) {
        return command.sendError(
            "That command is untoggleable",
            "I could not toggle that command"
        );
    }

    let onOrOff: "on" | "off" = "off";

    let value: string | null = null;
    const arg = command.args[1];
    if (arg) {
        if (
            arg.stringValue &&
            (arg.stringValue === "on" || arg.stringValue === "off")
        ) {
            onOrOff = arg.stringValue;
            value = arg.stringValue;
        } else {
            return;
        }
    }

    const findConfiguration = client.configurations.get("disabled commands");

    if (!findConfiguration) {
        await client.configurations.update("disabled commands", {
            disabledCommands: [commandToFind]
        });
    } else {
        let currentDisabledCommands: string[] =
            findConfiguration.options.disabledCommands;

        if (!value) {
            if (currentDisabledCommands.includes(commandToFind)) {
                client.disabledCommandManager.removeCommand(commandToFind);
                onOrOff = "on";
            } else {
                client.disabledCommandManager.addCommand(commandToFind);
            }
        } else {
            if (onOrOff === "off") {
                client.disabledCommandManager.addCommand(commandToFind);
            } else {
                client.disabledCommandManager.removeCommand(commandToFind);
            }
        }
    }

    command.sendMessage(
        `${commandToFind} is now \`\`${onOrOff}\`\``,
        "Succesfully toggled command"
    );
};

export default command;
