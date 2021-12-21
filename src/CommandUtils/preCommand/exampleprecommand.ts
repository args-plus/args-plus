import { PreCommandFunction } from "../../Handler";

const funtion = new PreCommandFunction("test");

funtion.run = (client, command) => {
    console.log(`Command: ${command.commandClass.name} is being ran`);
};

export default funtion;
