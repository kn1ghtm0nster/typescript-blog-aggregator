import { eq } from "drizzle-orm";

import { db } from "..";
import { feeds } from "../schema";
import { users } from "../schema";

export async function createFeed(name: string, url: string, userId: string) {
  const [result] = await db
    .insert(feeds)
    .values({ name, url, userId })
    .returning();
  return result;
}

export async function getFeeds() {
  const allFeeds = await db
    .select()
    .from(feeds)
    .innerJoin(users, eq(feeds.userId, users.id));
  return allFeeds;
}
