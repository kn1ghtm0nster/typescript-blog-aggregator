import { XMLParser } from "fast-xml-parser";

import { RSSFeed } from "../types/rss";

export async function fetchFeed(url: string): Promise<RSSFeed> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": "gator",
    },
  });

  const text = await response.text();

  const parser = new XMLParser({ processEntities: false });
  const parsedObj = parser.parse(text);
  try {
    const channel = parsedObj?.rss?.channel;

    if (!channel) {
      throw new Error("Invalid RSS feed format: Missing channel");
    }
    const title = channel?.title;
    const link = channel?.link;
    const description = channel?.description;

    if (!title || !link || !description) {
      throw new Error("Invalid RSS feed format: Missing required fields");
    }

    const rawItems = Array.isArray(channel?.item)
      ? channel.item
      : channel.item
        ? [channel.item]
        : [];

    const parsedItems = [];

    for (const item of rawItems) {
      let itemTitle = item?.title;
      let itemLink = item?.link;
      let itemDescription = item?.description;
      let itemPubDate = item?.pubDate;

      if (!itemTitle || !itemLink || !itemDescription || !itemPubDate) {
        // skip items with missing required fields
        continue;
      }

      parsedItems.push({
        title: itemTitle,
        link: itemLink,
        description: itemDescription,
        pubDate: itemPubDate,
      });
    }

    return {
      channel: {
        title,
        link,
        description,
        item: parsedItems,
      },
    };
  } catch (error) {
    throw new Error(`Failed to fetch feed: ${error}`);
  }
}
