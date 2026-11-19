const { SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Create, preview, and publish Discord embeds")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Open the interactive embed builder")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("preview")
        .setDescription("Preview an embed privately")
        .addStringOption((option) =>
          option.setName("title").setDescription("Embed title").setMaxLength(256)
        )
        .addStringOption((option) =>
          option.setName("description").setDescription("Embed description").setMaxLength(4000)
        )
        .addStringOption((option) =>
          option.setName("color").setDescription("Hex color, for example #5865F2").setMaxLength(7)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("send")
        .setDescription("Build and send an embed to a channel")
        .addChannelOption((option) =>
          option.setName("channel").setDescription("Where to send the embed").setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("title").setDescription("Embed title").setMaxLength(256)
        )
        .addStringOption((option) =>
          option.setName("description").setDescription("Embed description").setMaxLength(4000)
        )
        .addStringOption((option) =>
          option.setName("color").setDescription("Hex color, for example #5865F2").setMaxLength(7)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("announcement")
        .setDescription("Publish an announcement as a formatted embed")
        .addChannelOption((option) =>
          option.setName("channel").setDescription("Announcement channel").setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("title").setDescription("Announcement title").setRequired(true).setMaxLength(256)
        )
        .addStringOption((option) =>
          option.setName("message").setDescription("Announcement text").setRequired(true).setMaxLength(4000)
        )
    ),
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("See Embedify's embed-building commands"),
  new SlashCommandBuilder()
    .setName("dashboard")
    .setDescription("Open the official Embedify dashboard")
];

module.exports = { commands };
