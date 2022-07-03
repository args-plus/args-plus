type TClientSecrets = string | "ENV";

interface OptionalClientSecrets {
    allEnv: true;
}

interface RequiredClientSecrets {
    allEnv: false;
    DISCORD_CLIENT_TOKEN: TClientSecrets;
}

export type ClientSecrets = RequiredClientSecrets | OptionalClientSecrets;
