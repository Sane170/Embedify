# Embedify

Embedify is a public Discord bot dedicated to creating and publishing custom embeds. It is intentionally focused on embed-building features rather than general-purpose server commands.

## Embed commands

- `/embed create` — open the interactive builder, preview your design, then send it with a button.
- `/embed preview` — privately preview an embed with a title, description, and color.
- `/embed send` — send a custom embed to a selected text channel.
- `/embed announcement` — publish an announcement using an embed layout.

## Planned embed-only features

- Edit, duplicate, and delete saved embeds
- Embed templates and reusable embed libraries
- Author, footer, thumbnail, image, URL, timestamp, and field controls
- Multi-embed messages
- Buttons and dropdown menus attached to embeds
- Reusable layouts and per-server embed settings

No moderation, polls, tickets, verification, games, or general server-information commands are part of Embedify's scope.

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
