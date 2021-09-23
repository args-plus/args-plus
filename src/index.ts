import { Client } from "./Handler";

// Feel free to customise intents
const client = new Client({ intents: 32767, partials: ["CHANNEL"] });

client.init();
