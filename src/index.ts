import ArgsPlusClient from "./Handler";
import ClientConfig from "./ClientConfig";
import ClientSecrets from "./ClientSecrets";
import { config as loadEnv } from "dotenv";

loadEnv();

const client = new ArgsPlusClient(ClientConfig, ClientSecrets);

client.init();
client.registerEvents();
