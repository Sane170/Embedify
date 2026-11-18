# Embedify

Embedify is a public Discord bot for creating, customizing, and managing server embeds.

## Included in the first build

- Interactive embed builder with private preview and send/cancel buttons
- Create, preview, and send embed slash commands
- Announcement and welcome embeds
- Reaction-based polls
- Server, member, role, channel, and avatar information
- Help, bot information, ping, and invite commands
- Permission checks for administrative actions

## Requirements

- Node.js 20 or newer
- A Discord application and bot
- Bot token and application/client ID

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Add your bot token and application ID as environment variables. Never commit `.env`.
4. Invite the bot with the `bot` and `applications.commands` scopes and the permissions it needs.
5. Register slash commands with `npm run deploy`.
6. Start the bot with `npm start`.

For hosting, set `DISCORD_TOKEN` and `CLIENT_ID` as private environment variables in your hosting provider.

## Security

Never share your bot token or commit it to GitHub. If a token is exposed, reset it in the Discord Developer Portal immediately.

## Roadmap

Advanced embed editing, saved templates, dropdown components, persistent server settings, scheduling, and additional server tools are next.
