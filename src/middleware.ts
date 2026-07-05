import { readConfig } from "./config";
import { getUserByName } from "./lib/db/queries/users";
import type { CommandHandler, UserCommandHandler } from "./types/handler";

export function middlewareLoggedIn(
  handler: UserCommandHandler
): CommandHandler {
  return async (cmdName, ...args) => {
    const currentUserName = readConfig().currentUserName;
    if (!currentUserName) {
      throw new Error("No user is currently logged in. Please log in first.");
    }

    const [currentUser] = await getUserByName(currentUserName);
    if (!currentUser) {
      throw new Error("User not found. Please log in again.");
    }

    return handler(cmdName, currentUser, ...args);
  };
}
