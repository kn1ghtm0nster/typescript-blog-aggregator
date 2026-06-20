import { CommandHandler } from "../types/handler";
import { setUser } from "../config";

export const handlerLogin: CommandHandler = (cmdName, ...args) => {
  if (args.length === 0) {
    throw new Error("Username is required for login command");
  }
  const username = args[0];
  setUser(username);
  console.log(`User has been set to ${username}.`);
};
