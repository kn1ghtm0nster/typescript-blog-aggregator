import { eq, desc, sql } from "drizzle-orm";

import { db } from "..";
import { posts, feeds, feedFollows } from "../schema";

export async function createPost(
  title: string,
  url: string,
  description: string,
  publishedAt: Date,
  feedId: string
) {
  const [result] = await db
    .insert(posts)
    .values({
      title,
      url,
      description,
      published_at: publishedAt,
      feedId,
    })
    .returning();
  return result;
}

export async function getPostsForUser(userId: string, limit: number) {
  const result = await db
    .select({
      id: posts.id,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      title: posts.title,
      url: posts.url,
      description: posts.description,
      published_at: posts.published_at,
      feedId: posts.feedId,
    })
    .from(posts)
    .innerJoin(feeds, eq(posts.feedId, feeds.id))
    .innerJoin(feedFollows, eq(feeds.id, feedFollows.feedId))
    .where(eq(feedFollows.userId, userId))
    .orderBy(desc(posts.published_at))
    .limit(limit);
  return result;
}
