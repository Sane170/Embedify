require("dotenv").config();

const { Client, GatewayIntentBits, Events } = require("discord.js");
const { handleInteraction } = require("./interactionCreate");

const required = ["DISCORD_TOKEN", "CLIENT_ID"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(", ")}`);
  console.error("Copy .env.example to .env and fill in the values in your host's secret settings.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Embedify is online as ${readyClient.user.tag}`);
  readyClient.user.setActivity("embeds | /embed");
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    await handleInteraction(interaction);
  } catch (error) {
    console.error("Interaction error:", error);
    const message = {
      content: "Something went wrong while processing that interaction. Please try again.",
      ephemeral: true
    };

    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(message).catch(() => {});
    } else {
      await interaction.reply(message).catch(() => {});
    }
  }
});

client.login(process.env.DISCORD_TOKEN).catch((error) => {
  console.error("Unable to log in to Discord. Check DISCORD_TOKEN.", error);
  process.exit(1);
});
