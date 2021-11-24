import { PostCommandFunction } from "../../Handler";

const funtion = new PostCommandFunction("test");

funtion.run = (client, command) => {
    console.log(
        `Command: ${command.commandClass.name} has being ran\nReturn values: ${command.returnValues}`
    );
};

export default funtion;
