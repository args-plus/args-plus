import { Command } from "../Handler";

export const command = new Command();
command.name = "testing";
command.run = (args, message) => {
    console.log("ASASD");
};
