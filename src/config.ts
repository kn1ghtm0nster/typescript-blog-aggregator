import fs from "fs";
import os from "os";
import path from "path";

type Config = {
  dbUrl: string;
  currentUserName?: string;
};

export function setUser(user: string): void {
  const config = readConfig();
  config.currentUserName = user;
  writeConfig(config);
}

export function readConfig(): Config {
  const configFilePath = getConfigFilePath();
  const configData = fs.readFileSync(configFilePath, "utf-8");
  const rawConfig = JSON.parse(configData);
  return validateConfig(rawConfig);
}

function getConfigFilePath(): string {
  const homeDir = os.homedir();
  const configFilePath = path.join(homeDir, ".gatorconfig.json");
  return configFilePath;
}

function writeConfig(config: Config): void {
  const configFilePath = getConfigFilePath();
  const rawConfig = {
    db_url: config.dbUrl,
    current_user_name: config.currentUserName,
  };
  const configData = JSON.stringify(rawConfig, null, 2);
  fs.writeFileSync(configFilePath, configData, "utf-8");
}

function validateConfig(rawConfig: any): Config {
  if (typeof rawConfig["db_url"] !== "string" || !rawConfig["db_url"]) {
    throw new Error("Invalid configuration format");
  }
  return {
    dbUrl: rawConfig["db_url"],
    currentUserName: rawConfig["current_user_name"],
  };
}
