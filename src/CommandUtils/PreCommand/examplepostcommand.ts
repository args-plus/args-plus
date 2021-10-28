import { PostCommandFunction } from "../../Handler";

const funtion = new PostCommandFunction("test");

funtion.run = (client) => {
    console.log("Command is being ran");
};

export default funtion;
