const {
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits
} = require("discord.js");

const BRAND_COLOR = 0x5865F2;

function parseColor(value) {
  if (!value) return BRAND_COLOR;
  const normalized = value.replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
  return Number.parseInt(normalized, 16);
}

function makeEmbed({ title, description, color }) {
  const embed = new EmbedBuilder().setColor(color).setTimestamp();
  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);
  return embed;
}

function canSendEmbed(channel, guild) {
  if (!channel?.isTextBased?.() || !channel.send || !guild) return false;
  const me = guild.members.me;
  const permissions = me && channel.permissionsFor(me);
  return Boolean(
    permissions?.has(PermissionFlagsBits.SendMessages) &&
    permissions?.has(PermissionFlagsBits.EmbedLinks)
  );
}

async function handleInteraction(interaction) {
  if (interaction.isChatInputCommand() && interaction.commandName === "embed") {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "create") {
      const modal = new ModalBuilder()
        .setCustomId("embedify:builder")
        .setTitle("Create an embed");

      const title = new TextInputBuilder()
        .setCustomId("title")
        .setLabel("Title (optional)")
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(256);

      const description = new TextInputBuilder()
        .setCustomId("description")
        .setLabel("Description (optional)")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)
        .setMaxLength(4000);

      const color = new TextInputBuilder()
        .setCustomId("color")
        .setLabel("Hex color (optional, e.g. #5865F2)")
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(7);

      modal.addComponents(
        new ActionRowBuilder().addComponents(title),
        new ActionRowBuilder().addComponents(description),
        new ActionRowBuilder().addComponents(color)
      );
      return interaction.showModal(modal);
    }

    const title = interaction.options.getString("title");
    const description = interaction.options.getString(
      subcommand === "announcement" ? "message" : "description"
    );
    const color = parseColor(interaction.options.getString("color"));

    if (color === null) {
      return interaction.reply({
        content: "Please use a valid six-digit hex color, such as #5865F2.",
        ephemeral: true
      });
    }

    const embed = makeEmbed({ title, description, color });

    if (subcommand === "preview") {
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const channel = interaction.options.getChannel("channel");
    if (!canSendEmbed(channel, interaction.guild)) {
      return interaction.reply({
        content: "I need **Send Messages** and **Embed Links** in that text channel.",
        ephemeral: true
      });
    }

    await channel.send({ embeds: [embed] });
    return interaction.reply({
      content: subcommand === "announcement"
        ? `Your announcement embed was posted in ${channel}.`
        : `Your embed was sent to ${channel}.`,
      ephemeral: true
    });
  }

  if (interaction.isModalSubmit() && interaction.customId === "embedify:builder") {
    const title = interaction.fields.getTextInputValue("title").trim();
    const description = interaction.fields.getTextInputValue("description").trim();
    const rawColor = interaction.fields.getTextInputValue("color").trim();
    const color = parseColor(rawColor);

    if (color === null) {
      return interaction.reply({
        content: "That hex color is invalid. Use a value like #5865F2.",
        ephemeral: true
      });
    }

    if (!title && !description) {
      return interaction.reply({
        content: "Add a title or description before creating the embed.",
        ephemeral: true
      });
    }

    const embed = makeEmbed({ title, description, color });
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("embedify:send")
        .setLabel("Send to this channel")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("embedify:cancel")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Secondary)
    );

    return interaction.reply({
      content: "Here's your embed preview.",
      embeds: [embed],
      components: [row],
      ephemeral: true
    });
  }

  if (interaction.isButton() && interaction.customId.startsWith("embedify:")) {
    if (interaction.customId === "embedify:cancel") {
      return interaction.update({
        content: "Embed cancelled.",
        embeds: [],
        components: []
      });
    }

    if (interaction.customId === "embedify:send") {
      if (!canSendEmbed(interaction.channel, interaction.guild)) {
        return interaction.update({
          content: "I need **Send Messages** and **Embed Links** in this channel.",
          components: []
        });
      }

      const original = interaction.message.embeds[0];
      if (!original) {
        return interaction.update({
          content: "This preview is no longer available. Please create it again.",
          components: []
        });
      }

      await interaction.channel.send({ embeds: [EmbedBuilder.from(original)] });
      return interaction.update({
        content: "Your embed has been sent!",
        components: []
      });
    }
  }
}

module.exports = { handleInteraction };
