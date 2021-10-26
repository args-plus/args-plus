import { ClientConfig } from "./Handler/Client/config";
const settings = new ClientConfig("one");
settings.loadGuildSlashCommands = true;
settings.slashCommandGuilds = ["742308480299565086"];
settings.botDevelopers = ["468128787884670986"];
settings.indentMessageContent = false;
settings.messagesOrEmbeds = "embeds";
settings.mainColor = "RANDOM";
// settings.blacklistedGuilds = [
// { id: "742308480299565086", reason: "Very bas" },
// { id: "asd" },
// { id: "dsa", reason: "VVVV" },
// ];
// settings.blacklistedUsers = [{ id: "468128787884670986" }];
export default settings;
