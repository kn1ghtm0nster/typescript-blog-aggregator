export type CommandHandler = (
  cmdName: string,
  ...args: string[]
) => Promise<void>;
