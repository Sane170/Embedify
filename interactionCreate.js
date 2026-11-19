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

function parseBannerUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:") return null;
    const path = url.pathname.toLowerCase();
    const isImage = /\.(png|jpe?g|gif|webp|avif)$/.test(path) ||
      /(^|\.)cdn\.discordapp\.com$/.test(url.hostname) ||
      /(^|\.)media\.discordapp\.net$/.test(url.hostname);
    return isImage ? url.toString() : null;
  } catch {
    return null;
  }
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
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "help") {
      const helpEmbed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle("Embedify Help")
        .setDescription("Everything you need to create and publish custom Discord embeds.")
        .addFields(
          {
            name: "Embed Builder",
            value: [
              "`/embed create` — Open the interactive embed builder.",
              "`/embed preview` — Privately preview an embed.",
              "`/embed send` — Send a custom embed to a channel.",
              "`/embed announcement` — Publish a formatted announcement embed."
            ].join("\n")
          },
          {
            name: "Website",
            value: "Use `/dashboard` to open the Embedify website and dashboard."
          }
        )
        .setFooter({ text: "Embedify • Made for embeds" })
        .setTimestamp();

      return interaction.reply({ embeds: [helpEmbed], ephemeral: true });
    }

    if (interaction.commandName === "dashboard") {
      const dashboardUrl = process.env.DASHBOARD_URL;

      if (!dashboardUrl) {
        return interaction.reply({
          content: "The Embedify dashboard link hasn't been configured yet. The website is being prepared.",
          ephemeral: true
        });
      }

      let parsedUrl;
      try {
        parsedUrl = new URL(dashboardUrl);
      } catch {
        return interaction.reply({
          content: "The dashboard link is currently misconfigured. Please try again later.",
          ephemeral: true
        });
      }

      if (parsedUrl.protocol !== "https:") {
        return interaction.reply({
          content: "The dashboard link must use HTTPS. Please try again later.",
          ephemeral: true
        });
      }

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Open Embedify Dashboard")
          .setStyle(ButtonStyle.Link)
          .setURL(parsedUrl.toString())
      );

      return interaction.reply({
        content: "Open the official Embedify website and dashboard:",
        components: [row],
        ephemeral: true
      });
    }

    if (interaction.commandName === "embed") {
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

        const banner = new TextInputBuilder()
          .setCustomId("banner_image")
          .setLabel("Banner image URL (optional, HTTPS)")
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
          .setMaxLength(500);

        modal.addComponents(
          new ActionRowBuilder().addComponents(title),
          new ActionRowBuilder().addComponents(description),
          new ActionRowBuilder().addComponents(color),
          new ActionRowBuilder().addComponents(banner)
        );
        return interaction.showModal(modal);
      }

      const title = interaction.options.getString("title");
      const description = interaction.options.getString(
        subcommand === "announcement" ? "message" : "description"
      );
      const color = parseColor(interaction.options.getString("color"));
      const bannerImage = parseBannerUrl(interaction.options.getString("banner_image"));

      if (interaction.options.getString("banner_image") && !bannerImage) {
        return interaction.reply({ content: "Please use a direct HTTPS image URL ending in .png, .jpg, .jpeg, .gif, .webp, or .avif.", ephemeral: true });
      }

      if (color === null) {
        return interaction.reply({
          content: "Please use a valid six-digit hex color, such as #5865F2.",
          ephemeral: true
        });
      }

      const embed = makeEmbed({ title, description, color });

      if (subcommand === "preview") {
        return interaction.reply({ content: bannerImage || undefined, embeds: [embed], ephemeral: true });
      }

      const channel = interaction.options.getChannel("channel");
      if (!canSendEmbed(channel, interaction.guild)) {
        return interaction.reply({
          content: "I need **Send Messages** and **Embed Links** in that text channel.",
          ephemeral: true
        });
      }

      if (bannerImage) await channel.send({ content: bannerImage });
      await channel.send({ embeds: [embed] });
      return interaction.reply({
        content: subcommand === "announcement"
          ? `Your announcement embed was posted in ${channel}.`
          : `Your embed was sent to ${channel}.`,
        ephemeral: true
      });
    }
  }

  if (interaction.isModalSubmit() && interaction.customId === "embedify:builder") {
    const title = interaction.fields.getTextInputValue("title").trim();
    const description = interaction.fields.getTextInputValue("description").trim();
    const rawColor = interaction.fields.getTextInputValue("color").trim();
    const rawBanner = interaction.fields.getTextInputValue("banner_image").trim();
    const bannerImage = parseBannerUrl(rawBanner);
    const color = parseColor(rawColor);

    if (rawBanner && !bannerImage) {
      return interaction.reply({ content: "Please use a direct HTTPS image URL ending in .png, .jpg, .jpeg, .gif, .webp, or .avif.", ephemeral: true });
    }

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
      content: bannerImage || "Here's your embed preview.",
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

      const bannerImage = parseBannerUrl(interaction.message.content);
      if (bannerImage) await interaction.channel.send({ content: bannerImage });
      await interaction.channel.send({ embeds: [EmbedBuilder.from(original)] });
      return interaction.update({
        content: "Your embed has been sent!",
        components: []
      });
    }
  }

  if (interaction.isStringSelectMenu() && interaction.customId === "embedify:dashboard-select") {
    const selected = interaction.values?.[0];
    if (!selected) {
      return interaction.reply({ content: "No option was selected.", ephemeral: true });
    }
    return interaction.reply({
      content: `You selected: **${selected.slice(0, 100)}**`,
      ephemeral: true
    });
  }

}

module.exports = { handleInteraction };
