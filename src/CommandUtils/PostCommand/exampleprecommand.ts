import { PreCommandFunction } from "../../Handler";

const funtion = new PreCommandFunction("test");

funtion.run = (client) => {
    console.log("Command is being ran");
};

export default funtion;
