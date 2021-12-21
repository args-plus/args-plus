import { Client } from "./Handler";

const client = new Client(
    {
        intents: [
            "GUILDS",
            "GUILD_MESSAGES",
            "GUILD_MEMBERS",
            "DIRECT_MESSAGES"
        ],
        partials: ["CHANNEL"]
    },
    true
);

client.init(true);
