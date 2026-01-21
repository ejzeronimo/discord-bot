[![Build & Publish Docker Image](https://github.com/ejzeronimo/discord-bot/actions/workflows/docker-image.yml/badge.svg)](https://github.com/ejzeronimo/discord-bot/actions/workflows/docker-image.yml)

# Discord Bot
This bot is a personal project that I add features to every once in a while. Right now all it can really do is translate messages to moon runes and track the status of Minecraft servers.

## Running the Bot
Create a `.env`  file like the `.env.example` then pass it to the docker command like so:

```bash
docker pull ghcr.io/riggyz/discord-bot:latest
docker run --env-file .env -d --name my-discord-bot ghcr.io/riggyz/discord-bot:latest
```