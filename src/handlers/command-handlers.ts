import { CommandHandler, UserCommandHandler } from "../types/handler";
import { setUser } from "../config";
import {
  getUserByName,
  createUser,
  deleteUsers,
  getAllUsers,
} from "../lib/db/queries/users";
import {
  createFeed,
  getFeeds,
  getFeedByURL,
  markFeedFetched,
  getNextFeedToFetch,
} from "../lib/db/queries/feeds";
import {
  createFeedFollow,
  getFeedFollowsForUser,
  unfollowFeed,
} from "../lib/db/queries/feed-follows";
import { createPost, getPostsForUser } from "../lib/db/queries/posts";
import { fetchFeed } from "../funcs/xml-funcs";
import { readConfig } from "../config";
import { User, Feed } from "../lib/db/schema";
import { parseDuration } from "../lib/time";

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
    if (args.length !== 1) {
      throw new Error(
        "Request time is required (1m, 1h, etc.) for aggregate command"
      );
    }
    const requestTime = args[0];
    const requestIntervalMs = parseDuration(requestTime);

    if (requestIntervalMs === 0) {
      throw new Error("Invalid request time format");
    }

    console.log(`Collecting feeds every ${requestTime}`);
    await scrapeFeeds();

    const intervalId = setInterval(() => {
      scrapeFeeds();
    }, requestIntervalMs);

    await new Promise<void>((resolve) => {
      process.on("SIGINT", () => {
        console.log("\nShutting down feed aggregator...");
        clearInterval(intervalId);
        resolve();
      });
    });
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

export const handlerUnfollowFeed: UserCommandHandler = async (
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

    await unfollowFeed(user.id, feed.url);
    console.log(`User ${user.name} has unfollowed feed ${feed.name}`);
    process.exit(0);
  } catch (error) {
    console.error(`Error unfollowing feed: ${(error as Error).message}`);
    process.exit(1);
  }
};

export const handlerBrowseUserPosts: UserCommandHandler = async (
  cmdName,
  user,
  ...args
) => {
  try {
    let limit = 2; // default limit
    if (args.length > 0) {
      const parsedLimit = parseInt(args[0]);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        console.error("Invalid limit provided. Using default limit of 2.");
        return;
      }
      limit = parsedLimit;
    }
    const result = await getPostsForUser(user.id, limit);
    if (result.length === 0) {
      console.log("No posts found for the user.");
      return;
    }

    result.forEach((post) => {
      console.log(`Title: ${post.title}`);
      console.log(`URL: ${post.url}`);
      console.log(`Description: ${post.description || "N/A"}`);
      console.log(`Published At: ${post.published_at.toISOString() || "N/A"}`);
      console.log("--------------------------------------------------\n");
    });
  } catch (error) {
    console.error(`Error fetching user posts: ${(error as Error).message}`);
    process.exit(1);
  }
};

async function scrapeFeeds() {
  try {
    const nextFeed = await getNextFeedToFetch();
    if (!nextFeed) {
      console.log("No feeds to scrape.");
      return;
    }
    const result = await fetchFeed(nextFeed.url);
    await markFeedFetched(nextFeed.id);

    for (const item of result.channel.item) {
      if (!item.link) {
        console.warn(`Item "${item.title}" is missing a link. Skipping.`);
        continue;
      }

      const publishedAt = new Date(item.pubDate);
      if (isNaN(publishedAt.getTime())) {
        console.warn(`Invalid publication date for item: ${item.title}`);
        continue;
      }

      try {
        await createPost(
          item.title,
          item.link,
          item.description,
          publishedAt,
          nextFeed.id
        );
      } catch (error) {
        console.warn(
          "Post already exists or failed to create:",
          (error as Error).message
        );
        continue;
      }
    }
  } catch (error) {
    console.error(`Error scraping feeds: ${(error as Error).message}`);
  }
}
