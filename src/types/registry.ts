import { CommandHandler } from "./handler";

export type CommandRegistry = Record<string, CommandHandler>;
