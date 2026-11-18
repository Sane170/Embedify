const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Browse Embedify commands and features"),

  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check Embedify's response time"),

  new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("View information about Embedify"),

  new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Get an invite link for Embedify"),

  new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Create and manage custom embeds")
    .addSubcommand((subcommand) =>
      subcommand.setName("create").setDescription("Open the interactive embed builder")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("send")
        .setDescription("Send a simple embed to a channel")
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
    ),

  new SlashCommandBuilder()
    .setName("announcement")
    .setDescription("Create a server announcement")
    .addChannelOption((option) =>
      option.setName("channel").setDescription("Announcement channel").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("title").setDescription("Announcement title").setRequired(true).setMaxLength(256)
    )
    .addStringOption((option) =>
      option.setName("message").setDescription("Announcement text").setRequired(true).setMaxLength(4000)
    ),

  new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Create a simple reaction-based poll")
    .addStringOption((option) =>
      option.setName("question").setDescription("What are you asking?").setRequired(true).setMaxLength(256)
    )
    .addStringOption((option) =>
      option.setName("option-one").setDescription("First option").setRequired(true).setMaxLength(80)
    )
    .addStringOption((option) =>
      option.setName("option-two").setDescription("Second option").setRequired(true).setMaxLength(80)
    )
    .addStringOption((option) =>
      option.setName("option-three").setDescription("Optional third option").setMaxLength(80)
    ),

  new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Show a user's avatar")
    .addUserOption((option) =>
      option.setName("user").setDescription("User whose avatar you want to see")
    ),

  new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Show information about a server member")
    .addUserOption((option) =>
      option.setName("user").setDescription("Member to look up")
    ),

  new SlashCommandBuilder()
    .setName("roleinfo")
    .setDescription("Show information about a server role")
    .addRoleOption((option) =>
      option.setName("role").setDescription("Role to look up").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("channelinfo")
    .setDescription("Show information about a channel")
    .addChannelOption((option) =>
      option.setName("channel").setDescription("Channel to look up")
    ),

  new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Show information about this server"),

  new SlashCommandBuilder()
    .setName("say")
    .setDescription("Send a message as Embedify")
    .addChannelOption((option) =>
      option.setName("channel").setDescription("Where to send the message").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("message").setDescription("Message content").setRequired(true).setMaxLength(2000)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  new SlashCommandBuilder()
    .setName("welcome-embed")
    .setDescription("Post a welcome embed")
    .addChannelOption((option) =>
      option.setName("channel").setDescription("Where to post the welcome embed").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
];

module.exports = { commands };
