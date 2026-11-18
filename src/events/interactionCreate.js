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
const { commands } = require("../commands");

const BRAND_COLOR = 0x5865F2;

function makeEmbed({ title, description, color }) {
  const embed = new EmbedBuilder().setColor(color || BRAND_COLOR).setTimestamp();
  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);
  return embed;
}

function parseColor(value) {
  if (!value) return BRAND_COLOR;
  const normalized = value.replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
  return Number.parseInt(normalized, 16);
}

async function handleInteraction(interaction) {
  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;

    if (commandName === "ping") {
      const sent = await interaction.reply({ content: "Checking latency...", fetchReply: true, ephemeral: true });
      return interaction.editReply(`Pong! API: ${interaction.client.ws.ping}ms • Round-trip: ${sent.createdTimestamp - interaction.createdTimestamp}ms`);
    }

    if (commandName === "help") {
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle("Embedify Commands")
        .setDescription("Your toolkit for creating and managing Discord embeds.")
        .addFields(
          { name: "Embed tools", value: "`/embed create` • Interactive builder\n`/embed preview` • Private preview\n`/embed send` • Send an embed" },
          { name: "Server tools", value: "`/announcement` • Announcement embed\n`/poll` • Create a poll\n`/say` • Send a message\n`/welcome-embed` • Welcome panel" },
          { name: "Information", value: "`/serverinfo` • Server details\n`/userinfo` • Member details\n`/roleinfo` • Role details\n`/channelinfo` • Channel details\n`/avatar` • Avatar" },
          { name: "Bot", value: "`/ping` • Latency\n`/botinfo` • Bot details\n`/invite` • Invite link" }
        )
        .setFooter({ text: "More Embedify features are being added." });
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (commandName === "botinfo") {
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle("About Embedify")
        .setDescription("A public Discord bot for building, customizing, and managing embeds.")
        .addFields(
          { name: "Servers", value: String(interaction.client.guilds.cache.size), inline: true },
          { name: "Library", value: "discord.js v14", inline: true },
          { name: "Commands", value: String(commands.length), inline: true }
        )
        .setThumbnail(interaction.client.user.displayAvatarURL());
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (commandName === "invite") {
      const permissions = [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.UseExternalEmojis,
        PermissionFlagsBits.AddReactions
      ];
      const url = `https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=${permissions.reduce((a, b) => a | b, 0)}&scope=bot%20applications.commands`;
      return interaction.reply({ content: `Invite Embedify: ${url}`, ephemeral: true });
    }

    if (commandName === "embed") {
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
          .setLabel("Description")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
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
      const description = interaction.options.getString("description");
      const color = parseColor(interaction.options.getString("color"));
      if (color === null) return interaction.reply({ content: "Please provide a valid hex color, such as #5865F2.", ephemeral: true });
      const embed = makeEmbed({ title, description, color });

      if (subcommand === "preview") {
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (subcommand === "send") {
        const channel = interaction.options.getChannel("channel");
        if (!channel.isTextBased() || !channel.send) {
          return interaction.reply({ content: "Please choose a text channel.", ephemeral: true });
        }
        const permissions = channel.permissionsFor(interaction.guild.members.me);
        if (!permissions?.has(PermissionFlagsBits.SendMessages) || !permissions?.has(PermissionFlagsBits.EmbedLinks)) {
          return interaction.reply({ content: "I need **Send Messages** and **Embed Links** in that channel.", ephemeral: true });
        }
        await channel.send({ embeds: [embed] });
        return interaction.reply({ content: `Your embed was sent to ${channel}.`, ephemeral: true });
      }
    }

    if (commandName === "announcement") {
      const channel = interaction.options.getChannel("channel");
      if (!channel.isTextBased() || !channel.send) return interaction.reply({ content: "Choose a text channel.", ephemeral: true });
      const permissions = channel.permissionsFor(interaction.guild.members.me);
      if (!permissions?.has(PermissionFlagsBits.SendMessages) || !permissions?.has(PermissionFlagsBits.EmbedLinks)) {
        return interaction.reply({ content: "I need Send Messages and Embed Links in that channel.", ephemeral: true });
      }
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle(interaction.options.getString("title"))
        .setDescription(interaction.options.getString("message"))
        .setFooter({ text: `Announcement • ${interaction.guild.name}` })
        .setTimestamp();
      await channel.send({ embeds: [embed] });
      return interaction.reply({ content: `Announcement posted in ${channel}.`, ephemeral: true });
    }

    if (commandName === "poll") {
      const question = interaction.options.getString("question");
      const options = [
        interaction.options.getString("option-one"),
        interaction.options.getString("option-two"),
        interaction.options.getString("option-three")
      ].filter(Boolean);
      const marks = ["1️⃣", "2️⃣", "3️⃣"];
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle("📊 " + question)
        .setDescription(options.map((option, index) => `${marks[index]} ${option}`).join("\n"))
        .setFooter({ text: `Poll by ${interaction.user.username}` })
        .setTimestamp();
      const message = await interaction.reply({ embeds: [embed], fetchReply: true });
      for (let i = 0; i < options.length; i++) await message.react(marks[i]);
      return;
    }

    if (commandName === "avatar") {
      const user = interaction.options.getUser("user") || interaction.user;
      const embed = new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`${user.username}'s avatar`).setImage(user.displayAvatarURL({ size: 1024 }));
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (commandName === "userinfo") {
      const user = interaction.options.getUser("user") || interaction.user;
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle(`User information: ${user.username}`)
        .setThumbnail(user.displayAvatarURL())
        .addFields(
          { name: "User ID", value: user.id },
          { name: "Account created", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>` },
          { name: "Joined server", value: member?.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>` : "Not available" }
        );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (commandName === "roleinfo") {
      const role = interaction.options.getRole("role");
      const embed = new EmbedBuilder()
        .setColor(role.color || BRAND_COLOR)
        .setTitle(`Role information: ${role.name}`)
        .addFields(
          { name: "Role ID", value: role.id },
          { name: "Members", value: String(role.members.size), inline: true },
          { name: "Position", value: String(role.position), inline: true },
          { name: "Mentionable", value: role.mentionable ? "Yes" : "No", inline: true }
        );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (commandName === "channelinfo") {
      const channel = interaction.options.getChannel("channel") || interaction.channel;
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle(`Channel information: #${channel.name || "unknown"}`)
        .addFields(
          { name: "Channel ID", value: channel.id },
          { name: "Type", value: String(channel.type), inline: true },
          { name: "Created", value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:F>`, inline: true }
        );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (commandName === "serverinfo") {
      const guild = interaction.guild;
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle(guild.name)
        .setThumbnail(guild.iconURL())
        .addFields(
          { name: "Server ID", value: guild.id },
          { name: "Members", value: String(guild.memberCount), inline: true },
          { name: "Channels", value: String(guild.channels.cache.size), inline: true },
          { name: "Created", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true }
        );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (commandName === "say") {
      const channel = interaction.options.getChannel("channel");
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
        return interaction.reply({ content: "You need Manage Messages to use this command.", ephemeral: true });
      }
      if (!channel.isTextBased() || !channel.send) return interaction.reply({ content: "Choose a text channel.", ephemeral: true });
      const permissions = channel.permissionsFor(interaction.guild.members.me);
      if (!permissions?.has(PermissionFlagsBits.SendMessages)) return interaction.reply({ content: "I cannot send messages in that channel.", ephemeral: true });
      await channel.send({ content: interaction.options.getString("message"), allowedMentions: { parse: [] } });
      return interaction.reply({ content: `Message sent to ${channel}.`, ephemeral: true });
    }

    if (commandName === "welcome-embed") {
      const channel = interaction.options.getChannel("channel");
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
        return interaction.reply({ content: "You need Manage Server to use this command.", ephemeral: true });
      }
      if (!channel.isTextBased() || !channel.send) return interaction.reply({ content: "Choose a text channel.", ephemeral: true });
      const permissions = channel.permissionsFor(interaction.guild.members.me);
      if (!permissions?.has(PermissionFlagsBits.SendMessages) || !permissions?.has(PermissionFlagsBits.EmbedLinks)) {
        return interaction.reply({ content: "I need Send Messages and Embed Links in that channel.", ephemeral: true });
      }
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle(`Welcome to ${interaction.guild.name}!`)
        .setDescription("We're glad you're here. Take a look around and enjoy the community!")
        .setThumbnail(interaction.guild.iconURL())
        .setTimestamp();
      await channel.send({ embeds: [embed] });
      return interaction.reply({ content: `Welcome embed posted in ${channel}.`, ephemeral: true });
    }
  }

  if (interaction.isModalSubmit() && interaction.customId === "embedify:builder") {
    const title = interaction.fields.getTextInputValue("title").trim();
    const description = interaction.fields.getTextInputValue("description").trim();
    const rawColor = interaction.fields.getTextInputValue("color").trim();
    const color = parseColor(rawColor);
    if (color === null) return interaction.reply({ content: "That hex color isn't valid. Reopen the builder and use a value like #5865F2.", ephemeral: true });

    const embed = makeEmbed({ title, description, color });
    const preview = new EmbedBuilder(embed.data);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("embedify:send").setLabel("Send to this channel").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("embedify:cancel").setLabel("Cancel").setStyle(ButtonStyle.Secondary)
    );
    return interaction.reply({
      content: "Here's your preview. Send it to this channel or cancel.",
      embeds: [preview],
      components: [row],
      ephemeral: true
    });
  }

  if (interaction.isButton() && interaction.customId.startsWith("embedify:")) {
    if (interaction.customId === "embedify:cancel") {
      return interaction.update({ content: "Embed cancelled.", embeds: [], components: [] });
    }
    if (interaction.customId === "embedify:send") {
      if (!interaction.channel?.isTextBased() || !interaction.channel.send) {
        return interaction.update({ content: "This channel can't receive embeds.", embeds: [], components: [] });
      }
      const permissions = interaction.channel.permissionsFor(interaction.guild.members.me);
      if (!permissions?.has(PermissionFlagsBits.SendMessages) || !permissions?.has(PermissionFlagsBits.EmbedLinks)) {
        return interaction.update({ content: "I need Send Messages and Embed Links in this channel.", components: [] });
      }
      const original = interaction.message.embeds[0];
      if (!original) return interaction.update({ content: "The preview expired. Please create your embed again.", components: [] });
      await interaction.channel.send({ embeds: [EmbedBuilder.from(original)] });
      return interaction.update({ content: "Your embed has been sent!", components: [] });
    }
  }
}

module.exports = { handleInteraction };
