import { CommandHandler, UserCommandHandler } from "../types/handler";
import { setUser } from "../config";
import {
  getUserByName,
  createUser,
  deleteUsers,
  getAllUsers,
} from "../lib/db/queries/users";
import { createFeed, getFeeds, getFeedByURL } from "../lib/db/queries/feeds";
import {
  createFeedFollow,
  getFeedFollowsForUser,
} from "../lib/db/queries/feed-follows";
import { fetchFeed } from "../funcs/xml-funcs";
import { readConfig } from "../config";
import { User, Feed } from "../lib/db/schema";

export const handlerLogin: CommandHandler = async (cmdName, ...args) => {
  if (args.length === 0) {
    throw new Error("Username is required for login command");
  }
  const username = args[0];

  const existingUser = await getUserByName(username);
  if (existingUser.length === 0) {
    throw new Error(`Username "${username}" does not exist.`);
  }

  setUser(username);
  console.log(`User has been set to ${username}.`);
};

export const handlerRegister: CommandHandler = async (cmdName, ...args) => {
  if (args.length === 0) {
    throw new Error("Username is required for register command");
  }
  const username = args[0];

  // check if username already exists
  const existingUser = await getUserByName(username);
  if (existingUser.length > 0) {
    throw new Error(`Username "${username}" is already taken.`);
  }

  // create new user
  const newUser = await createUser(username);
  console.log(newUser);

  setUser(newUser.name);
  console.log(`User "${newUser.name}" has been registered successfully.`);
};

export const handlerUsers: CommandHandler = async (cmdName, ...args) => {
  try {
    const allUsers = await getAllUsers();
    const config = readConfig();

    allUsers.forEach((user) => {
      if (user.name === config.currentUserName) {
        console.log(`* ${user.name} (current)`);
      } else {
        console.log(`* ${user.name}`);
      }
    });
  } catch (error) {
    console.error(`Error fetching users: ${(error as Error).message}`);
  }
};

export const handlerReset: CommandHandler = async (cmdName, ...args) => {
  try {
    await deleteUsers();
    console.log("Users table has been reset successfully.");
    process.exit(0);
  } catch (error) {
    console.error(`Error resetting users table: ${(error as Error).message}`);
    process.exit(1);
  }
};

export const handlerAggregate: CommandHandler = async (cmdName, ...args) => {
  try {
    const feed = await fetchFeed("https://www.wagslane.dev/index.xml");
    const JSONFeed = JSON.stringify(feed, null, 2);
    console.log(JSONFeed);
    process.exit(0);
  } catch (error) {
    console.error(`Error fetching feed: ${(error as Error).message}`);
    process.exit(1);
  }
};

function printFeed(feed: Feed, user: User) {
  console.log(`Feed Name: ${feed.name}`);
  console.log(`Feed URL: ${feed.url}`);
  console.log(`Associated User: ${user.name}`);
}

export const handlerAddFeed: UserCommandHandler = async (
  cmdName,
  user,
  ...args
) => {
  if (args.length < 2) {
    throw new Error("Feed name and URL are required for add-feed command");
  }

  const [feedName, feedUrl] = args;

  try {
    const userId = user.id;
    const newFeed = await createFeed(feedName, feedUrl, userId);
    printFeed(newFeed, user);
    const newFollow = await createFeedFollow(userId, newFeed.id);
    console.log(
      `User ${newFollow.userName} is now following feed ${newFollow.feedName}`
    );
    process.exit(0);
  } catch (error) {
    console.error(`Error adding feed: ${(error as Error).message}`);
    process.exit(1);
  }
};

export const handlerAllFeeds: CommandHandler = async (cmdName, ...args) => {
  try {
    const feeds = await getFeeds();

    feeds.forEach((feed) => {
      console.log(`Feed Name: ${feed.feeds.name}`);
      console.log(`Feed URL: ${feed.feeds.url}`);
      console.log(`Created By: ${feed.users.name}`);
    });
    process.exit(0);
  } catch (error) {
    console.error(`Error fetching feeds: ${(error as Error).message}`);
    process.exit(1);
  }
};

export const handlerUserFeedFollows: UserCommandHandler = async (
  cmdName,
  user,
  ...args
) => {
  try {
    if (args.length === 0) {
      throw new Error("URL is required for this command");
    }
    const url = args[0];

    const feed = await getFeedByURL(url);
    if (!feed) {
      throw new Error("Feed not found");
    }

    const newFeedFollow = await createFeedFollow(user.id, feed.id);

    console.log(
      `User: ${newFeedFollow.userName} is now following feed: ${newFeedFollow.feedName}`
    );
    process.exit(0);
  } catch (error) {
    console.error(`Error creating feed follow: ${(error as Error).message}`);
    process.exit(1);
  }
};

export const handlerAllUserFeedFollows: UserCommandHandler = async (
  cmdName,
  user,
  ...args
) => {
  try {
    const userFeeds = await getFeedFollowsForUser(user.id);

    userFeeds.forEach((feed) => {
      console.log(feed.feedName);
    });
    process.exit(0);
  } catch (error) {
    console.error(
      `Error fetching user feed follows: ${(error as Error).message}`
    );
    process.exit(1);
  }
};
