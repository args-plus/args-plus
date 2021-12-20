import { Item } from "../Client/instances/loader";
import { Permission } from "../Interfaces";

export class Category extends Item {
    public description: string = "";

    public guildOnly = false;
    public developerOnly = false;
    public hidden = false;
    public overideUserBlacklist = false;
    public overideGuildBlacklist = false;
    public overideLoadSlashCommand = false;
    public clientPermissions: Permission[] = [];
    public userPermissions: Permission[] = [];
    public clientChecks: Permission[] = [];
    public userChecks: Permission[] = [];
}
