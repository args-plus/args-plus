import { Category } from "../../Handler";

const category = new Category("Developers");
category.description = "Commands that can only be ran by bot developers";
category.developerOnly = true;
category.overideLoadSlashCommand = true;

export default category;
