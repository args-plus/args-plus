import ExtendedClient from "..";

export class CommandManager {
    public client: ExtendedClient;
    private disabledCommandsDir = require("../../../../disabledCommands.json");

    public async init() {
        if (!this.client.cachedConfigurations.get("DISABLED_COMMANDS")) {
            for (const property in this.disabledCommandsDir) {
                const findCommand = this.client.commands.get(property);

                if (!findCommand) {
                    this.client.messageHandler.warn(
                        `Could not disable command: "${property}"`
                    );
                    continue;
                } else if (
                    typeof this.disabledCommandsDir[property] !== "boolean"
                ) {
                    this.client.messageHandler.warn(
                        `Disabled command: "${property}" must be a boolean!"`
                    );
                }

                let disabledCommands: string[] = [];

                disabledCommands.push(property);

                await this.client.configurationHandler.createConfiguration(
                    "disabled commands",
                    {
                        disabledCommands: disabledCommands,
                    }
                );
            }
        } else {
            const disabledCommands =
                this.client.cachedConfigurations.get("DISABLED_COMMANDS");

            const disabledCommandsArray: string[] =
                disabledCommands.options.disabledCommands;
            for (const property in this.disabledCommandsDir) {
                const findCommand = this.client.commands.get(property);

                if (!findCommand) {
                    this.client.messageHandler.warn(
                        `Could not disable command: "${property}"`
                    );
                    continue;
                } else if (
                    typeof this.disabledCommandsDir[property] !== "boolean"
                ) {
                    this.client.messageHandler.warn(
                        `Disabled command: "${property}" must be a boolean!"`
                    );
                }

                if (disabledCommandsArray.includes(property)) {
                    continue;
                }

                disabledCommandsArray.push(property);
            }

            let index = 0;
            for (const property of disabledCommandsArray) {
                if (!this.disabledCommandsDir[property]) {
                    disabledCommandsArray.splice(index, 1);
                } else {
                    index++;
                }
            }

            this.client.configurationHandler.updateConfiguration(
                "disabled commands",
                {
                    disabledCommands: disabledCommandsArray,
                },
                false
            );
        }
    }

    public async addDisabledCommand(commandName: string) {
        const findCommand = this.client.commands.get(commandName);

        if (!findCommand) {
            return this.client.messageHandler.warn(
                `Could not disable command: "${commandName}"`
            );
        }

        if (!this.client.cachedConfigurations.get("DISABLED_COMMANDS")) {
            const disabledCommandsArray: string[] = [];

            disabledCommandsArray.push(findCommand.name);

            await this.client.configurationHandler.createConfiguration(
                "disabled commands",
                {
                    disabledCommands: disabledCommandsArray,
                }
            );
        } else {
            const disabledCommandsArray: string[] =
                this.client.cachedConfigurations.get("DISABLED_COMMANDS")
                    .options.disabledCommands;

            if (disabledCommandsArray.includes(findCommand.name)) {
                return this.client.messageHandler.error(
                    `Cannot disable command "${findCommand.name}" as it is already disabled!`
                );
            }

            disabledCommandsArray.push(findCommand.name);

            await this.client.configurationHandler.updateConfiguration(
                "disabled commands",
                {
                    disabledCommands: disabledCommandsArray,
                }
            );
        }
    }

    public async removeDisabledCommand(commandName: string) {
        const findCommand = this.client.commands.get(commandName);

        if (!findCommand) {
            return this.client.messageHandler.warn(
                `Could not disable command: "${commandName}"`
            );
        }

        if (!this.client.cachedConfigurations.get("DISABLED_COMMANDS")) {
            return this.client.messageHandler.error(
                `No commands have been disabled yet!`
            );
        }

        const disabledCommandsArray: string[] =
            this.client.cachedConfigurations.get("DISABLED_COMMANDS").options
                .disabledCommands;

        if (!disabledCommandsArray.includes(commandName)) {
            return this.client.messageHandler.error(
                `An invalid command name was provided to remove`
            );
        }

        let index = 0;
        for (const disabledCommand of disabledCommandsArray) {
            if (disabledCommand === commandName) {
                disabledCommandsArray.splice(index, 1);
            } else {
                index++;
            }
        }

        this.client.configurationHandler.updateConfiguration(
            "disabled commands",
            {
                disabledCommands: disabledCommandsArray,
            },
            false
        );
    }
}
