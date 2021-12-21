import { Argument, Category, Command } from "../../Handler";

const toggleCommand = new Command("toggle");
toggleCommand.description = "Toggle a command on or off";

const command = new Argument("command", "single");
command.displayName = "Command";

const toggle = new Argument("state", "customValue");
toggle.customValues = ["on", "off"];
toggle.allowLowerCaseCustomValues = true;
toggle.displayName = "State";

const reason = new Argument("reason", "multiple");
reason.displayName = "Reason";

toggleCommand.args = [command, toggle, reason];

toggleCommand.toggleable = false;

toggleCommand.run = async (client, command) => {
    if (!command.args[0]) {
        const disabledItems = client.disabledCommands.cachedDisabledItems;

        if (disabledItems.size === 0) {
            return command.sendMessage("There are currently no items disabled");
        }

        let disabledItemsMessage = `**These are the current disabled items**\n`;

        for (const disabledItemKey of disabledItems) {
            const disabledItem = disabledItemKey[1];
            const type = client.disabledCommands.getType(disabledItem.name);
            if (!type) continue;

            let disabler = "``Auto disable``";

            if (disabledItem.disablerId) {
                const getDisabler = client.users.cache.get(disabledItem.disablerId);
                if (getDisabler) {
                    disabler = `\`\`${getDisabler.tag}\`\` (${getDisabler.id})`;
                }
            }

            let reason = "No reason provided";

            if (disabledItem.reason) {
                reason = disabledItem.reason;
            }

            disabledItemsMessage += `\n**${disabledItem.name}**\n**Type:** \`\`${type}\`\`\n**Disabled by:** ${disabler}\n**Reason:** \`\`${reason}\`\`\n`;
        }

        return command.sendMessage(disabledItemsMessage);
    }

    const author = command.getAuthor();

    const commandToFind = command.args[0].getStringValue().toLowerCase();

    const findCommand = client.commands.get(commandToFind);
    const findAlias = client.aliases.get(commandToFind);
    const findCategory = client.categories
        .filter((category) => {
            return category.name.toLowerCase() === commandToFind;
        })
        .first();

    if (!findCommand && !findAlias && !findCategory) {
        return command.sendError(
            `I could not find a command with the name: ${commandToFind}`,
            "I could not find that command"
        );
    }

    let itemToToggle: Command | Category;

    if (findCommand) {
        itemToToggle = findCommand;
    } else if (findAlias) {
        itemToToggle = findAlias;
    } else if (findCategory) {
        itemToToggle = findCategory;
    } else {
        return;
    }

    if (itemToToggle instanceof Command && !itemToToggle.toggleable) {
        return command.sendError(
            `It is untoggleable`,
            `I could not disable ${Command.name}`
        );
    }

    let onOrOff = true;

    const isDisabledCommand = client.disabledCommands.isDisabledItem(itemToToggle.name);

    const arg = command.args[1];
    if (arg) {
        if (arg.getStringValue() === "on" || arg.getStringValue() === "off") {
            onOrOff = arg.getStringValue() === "on" ? true : false;
        } else {
            return;
        }
    } else {
        onOrOff = isDisabledCommand;
    }

    let reason = "No reason provided";

    if (command.args[2]) {
        reason = command.args[2].getText();
    }

    if (!onOrOff) {
        await client.disabledCommands.disableItem(
            itemToToggle.name,
            false,
            author,
            reason
        );
    } else {
        await client.disabledCommands.enableItem(itemToToggle.name);
    }

    return command.sendMessage(
        `\`\`${commandToFind}\`\` has been turned ${onOrOff ? "on" : "off"}`,
        "I succesfully disabled that item"
    );
};

export default toggleCommand;
