# Albion Guide

- This is NOT a Discord Bot Template. It is a FULL Bot!

- A Discord App to get information about The First Descendant game and basic in-game user data made by [© NEXON Korea Corp. & NEXON Games Co, LTD](https://www.nexon.com/main/en).

- This project has been built around the latest version of [discord.js](https://discord.js.org) (v14.15.3) and [@sern/handler](https://sern.dev) (v4.0.1). It is not meant for older versions.

- Want to use my favorite discord bot handler? Join our [Discord Server](https://sern.dev/discord) if you need help! I highly recommend reading the [docs](https://sern.dev/v4/reference/getting-started) to familiarize yourself with the handler before attempting this! We also always suggest that you have at least basic knowledge of JavaScript/TypeScript languages before trying to code a bot or before asking us for help.

- For help regarding this particular bot, open an issue and ping me.

- Want to contribute to this project? Fork the project, make your changes, and open a Pull Request!

- Want to use this Verified Bot? Invite it to your server or authorize it as an App on your user profile [here](https://discord.com/oauth2/authorize?client_id=1263202205851193447)!

## How to use

#### Feel free to use your favorite package manager!

1.) Rename Files:

    .env.example -> .env
    /assets/logs.txt.example -> /assets/logs.txt
    /assets/loggerLogs.txt.example -> /assets/loggerLogs.txt
    /assets/config.json.example -> /assets/config.json (fill this in!)

2.) Fill in required keys. Example:

    DISCORD_TOKEN=MTI2MzIMTE5MzQ0Nw.GuEeNGCIkBz2qrAH4acPh2uJfwyTfsm6GU
    NODE_ENV=development
    OWNER_IDS=["DiscordUserID1", "DiscordUserID2", "DiscordUserID3"]
    TFD_API_KEY=4ab8d7db7c2c7b5a69430cc737adae2b76b2d0045bd35cf2fabdeb93fb0d
    MONGO_URI=mongodb+srv://username:password@HOST.mongodb.net/collection

    (None of these are real credentials!)

3.) Install the sern cli.

    npm install -g @sern/cli

4.) Install dependencies.

    npm install

5.) Generate your Prisma Database

    npm run gen

6.) Build

    npm run build

8.) Run

    node dist/index.js

9.) Refresh Discord Client to see commands.

## Instructions to get a Discord Token:

1.) Go to [Discord Developer Portal](https://discord.com/developers/applications)

2.) Login with your Discord Account or create one if you don't have one.

3.) Use the `New Application` button at the top right of the page to create a new app.

4.) After creation, navigate to `Bot` on the left-hand side of the page.

5.) Click on `Reset Token` and copy it. Paste this in the `.env` file after `DISCORD_TOKEN=`.

- Do NOT add any extra characters or spaces here!

## Instructions for getting a mongo uri:

1.) Go to [MongoDB Homepage](https://www.mongodb.com/)

2.) Create an account or sign in.

3.) Click `New Project` and give it a name then Create.

4.) In Overview, click `Create` under Create a cluster.

- Select your preferred cluster plan (I always use free).
- Feel free to change the cluster name. - Cannot be changed later. This is your `HOST` name in the connection string.
- Deselect `Preload sample dataset`.
- Choose your desired provider and region (recommended to be close to USA/Los Angeles to have lowest ping to Discord).
- Click `Create Deployment` - This can take some time so just wait!

  - Enabling access from anywhere
    - Under `Add a connection IP address`, click the blue link [Network Access](https://cloud.mongodb.com/v2/6698309e680cfe0c4068bea6#/security/network/accessList).
    - On the new page, click `Edit` beside `Active`.
    - Click `ALLOW ACCESS FROM ANYWHERE`.
    - Click Confirm and close the tab.

- Create a username and password. Click Copy. Click Create Database User. You can add more users later if needed.
- Click `Choose a connection method`
  - Click Compass and download your preferred Compass program or just use the web.
    - Choosing to use web, go to `Database` on the left side and click `Browse Collections` beside your cluster name.
  - Copy the provided connection string
  - Paste into `.env` after `MONGO_URI=`
