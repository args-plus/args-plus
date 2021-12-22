import { WebhookClient } from "discord.js";
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
    public clientChecks: string[] = [];
    public userChecks: string[] = [];

    public setDescription(description = "") {
        this.description = description;
        return this;
    }

    public setGuildOnly(guildOnly = true) {
        this.guildOnly = guildOnly;
        return this;
    }

    public setDeveloperOnly(devOnly = true) {
        this.developerOnly = devOnly;
        return this;
    }

    public setHidden(hidden = false) {
        this.hidden = hidden;
        return this;
    }

    public setOverideUserBlacklist(overide = true) {
        this.overideUserBlacklist = overide;
        return this;
    }

    public setOverideGuildBlacklist(overide = true) {
        this.overideGuildBlacklist = overide;
        return this;
    }

    public setOverideBlacklist(guild = true, user = true) {
        this.setOverideGuildBlacklist(guild);
        this.setOverideUserBlacklist(user);
        return this;
    }

    public setOverideLoadSlashCommand(overide = true) {
        this.overideLoadSlashCommand = overide;
        return this;
    }

    public setClientPermissions(client: Permission[] = []) {
        this.clientChecks = client;
        return this;
    }

    public setUserPermissions(user: Permission[]) {
        this.userPermissions = user;
        return this;
    }

    public setPermissions(client: Permission[], user: Permission[]) {
        this.setClientPermissions(client);
        this.setUserPermissions(user);
        return this;
    }

    public setClientChecks(client: string[] = []) {
        this.clientChecks = client;
        return this;
    }

    public setUserChecks(user: string[] = []) {
        this.userChecks = user;
        return this;
    }

    public setChecks(client: string[] = [], user: string[] = []) {
        this.setClientChecks(client);
        this.setUserChecks(user);
        return this;
    }
}
