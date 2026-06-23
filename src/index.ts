import { argv } from "process";

import { CommandRegistry } from "./types/registry";
import { registerCommand, runCommand } from "./funcs/registry-funcs";
import {
  handlerLogin,
  handlerRegister,
  handlerReset,
  handlerUsers,
} from "./handlers/command-handlers";

async function main(): Promise<void> {
  const registry: CommandRegistry = {};
  await registerCommand(registry, "login", handlerLogin);
  await registerCommand(registry, "register", handlerRegister);
  await registerCommand(registry, "reset", handlerReset);
  await registerCommand(registry, "users", handlerUsers);

  const [cmdName, ...args] = argv.slice(2);
  const argsArray = Array.isArray(args) ? args : [];
  if (!cmdName) {
    console.error("No command provided.");
    process.exit(1);
  }

  if (cmdName !== "reset" && cmdName !== "users" && !argsArray.length) {
    console.error("No arguments provided for the command.");
    process.exit(1);
  }

  try {
    await runCommand(registry, cmdName, ...argsArray);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }

  process.exit(0);
}

main();
