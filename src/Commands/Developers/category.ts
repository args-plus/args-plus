import { Category } from "../../Handler";

const category = new Category("Developers")
    .setDescription("Commands that can only be ran by developers")
    .setDeveloperOnly()
    .setOverideLoadSlashCommand();

export default category;
