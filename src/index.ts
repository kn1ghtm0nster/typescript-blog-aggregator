import { argv } from "process";

import { middlewareLoggedIn } from "./middleware";
import { CommandRegistry } from "./types/registry";
import { registerCommand, runCommand } from "./funcs/registry-funcs";
import {
  handlerLogin,
  handlerRegister,
  handlerReset,
  handlerUsers,
  handlerAggregate,
  handlerAddFeed,
  handlerAllFeeds,
  handlerUserFeedFollows,
  handlerAllUserFeedFollows,
  handlerUnfollowFeed,
  handlerBrowseUserPosts,
} from "./handlers/command-handlers";

async function main(): Promise<void> {
  const registry: CommandRegistry = {};
  await registerCommand(registry, "login", handlerLogin);
  await registerCommand(registry, "register", handlerRegister);
  await registerCommand(registry, "reset", handlerReset);
  await registerCommand(registry, "users", handlerUsers);
  await registerCommand(registry, "agg", handlerAggregate);
  await registerCommand(
    registry,
    "addfeed",
    middlewareLoggedIn(handlerAddFeed)
  );
  await registerCommand(registry, "feeds", handlerAllFeeds);
  await registerCommand(
    registry,
    "follow",
    middlewareLoggedIn(handlerUserFeedFollows)
  );
  await registerCommand(
    registry,
    "following",
    middlewareLoggedIn(handlerAllUserFeedFollows)
  );
  await registerCommand(
    registry,
    "unfollow",
    middlewareLoggedIn(handlerUnfollowFeed)
  );
  await registerCommand(
    registry,
    "browse",
    middlewareLoggedIn(handlerBrowseUserPosts)
  );

  const [cmdName, ...args] = argv.slice(2);
  const argsArray = Array.isArray(args) ? args : [];
  if (!cmdName) {
    console.error("No command provided.");
    process.exit(1);
  }

  if (
    cmdName !== "reset" &&
    cmdName !== "users" &&
    cmdName !== "addfeed" &&
    cmdName !== "feeds" &&
    cmdName !== "follow" &&
    cmdName !== "following" &&
    cmdName !== "unfollow" &&
    cmdName !== "browse" &&
    cmdName !== "agg" &&
    !argsArray.length
  ) {
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
