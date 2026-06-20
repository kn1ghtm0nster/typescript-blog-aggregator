import { argv } from "process";

import { readConfig, setUser } from "./config";
import { CommandRegistry } from "./types/registry";
import { registerCommand, runCommand } from "./funcs/registry-funcs";
import { handlerLogin } from "./handlers/command-handlers";

function main(): void {
  const registry: CommandRegistry = {};
  registerCommand(registry, "login", handlerLogin);

  const [cmdName, ...args] = argv.slice(2);
  const argsArray = Array.isArray(args) ? args : [];
  if (!cmdName) {
    console.error("No command provided.");
    process.exit(1);
  }

  if (!argsArray.length) {
    console.error("No arguments provided for the command.");
    process.exit(1);
  }

  try {
    runCommand(registry, cmdName, ...argsArray);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

main();
