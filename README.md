# Gator

An RSS feed aggregator that brings popular posts on major blog platforms to your terminal so you can browse without having to open the browser.

## Install Guide

**NOTE:** Before you can proceed with installing the project dependencies, you will need two things installed:

- `nvm` (Node Version Manager)

- `PostgreSQL` (I recommend installing via homebrew via WSL2 or Mac / Linux)

1. Clone the repository to your local environment: `git clone https://github.com/kn1ghtm0nster/typescript-blog-aggregator.git`

1. Install the dependencies: `npm install`

## Usage

**NOTE:** Please make sure that you have a `.gatorconfig.json` file saved in your **home directory**. I have provided a skeleton below to use as a starting config:

- You can create this file by using command: `touch ~/.gatorconfig.json` or just creating the file manually. The important part is making sure that it's inside the **home** directory as that is where the project will look for this config file.

```json
{
  "db_url": "postgres://dummy_value:@localhost:PORT/gator?sslmode=disable",
  "current_user_name": "test_user"
}
```

**NOTE:** By default, the value of the `PORT` in postgres is `5432` however, it can be changed. I recommend keeping the default.

**WARNING** Make sure you replace the `db_url` value with **your** postgres db connection string but keep the `?sslmode=disable`

To use the program, you will need to follow the convention: `npm run start <command> [...args]`

For example, if I wanted to register a new profile, I would use the command `npm run start register Leto`

If I wanted to log someone else in, I would run command `npm run start login Paul`

There are also commands that do **not** accept any args such as `users` which will list all registered users as well as who is logged in currently and that can be run with command `npm run start users`

Now, to actually retrieve information from the web, you will need to add a new feed. I have provided two starting rss feeds that can be used.

- TechCrunch: `https://techcrunch.com/feed/`
- Hacker News: `https://news.ycombinator.com/rss`

First, register a new feed with `npm run start addfeed [FEED-URL]`.

After that is done, use `npm run start agg [num](s|m|h)`. The frequency will need to specify units suchas `s` for seconds, `m` for minutes, and `h` for hours.

**WARNING** This project is **not** meant to act as a DOS or DDOS tool. Please be considerate when retrieving data from RSS feeds as you can **and will** get IP banned if you are not careful. **This project assumes no liability for IP bans.**

You can stop retrieving data by using `CTRL + C`.

You are also able to `browse` posts and will need to specify a limit of posts to bring otherwise, only two posts will be displayed at a time: `npm run start browse [limit]`
