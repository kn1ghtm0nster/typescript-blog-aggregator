import { CommandRegistry } from "../types/registry";
import { CommandHandler } from "../types/handler";

async function registerCommand(
  registry: CommandRegistry,
  commandName: string,
  handler: CommandHandler
): Promise<void> {
  if (registry[commandName]) {
    throw new Error(`Command "${commandName}" is already registered.`);
  }
  registry[commandName] = handler;
}

async function runCommand(
  registry: CommandRegistry,
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (!registry[cmdName]) {
    throw new Error(`Command "${cmdName}" not found.`);
  }
  // run the command handler with the given key (command) and arguments (if any)
  await registry[cmdName](cmdName, ...args);
}

export { registerCommand, runCommand };
