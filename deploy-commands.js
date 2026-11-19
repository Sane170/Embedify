require("dotenv").config();

const { REST, Routes } = require("discord.js");
const { commands } = require("./commands");

if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
  console.error("DISCORD_TOKEN and CLIENT_ID are required.");
  process.exit(1);
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`Registering ${commands.length} Embedify slash command(s)...`);
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands.map((command) => command.toJSON()) }
    );
    console.log("Embedify slash commands registered globally.");
  } catch (error) {
    console.error("Command registration failed:", error);
    process.exit(1);
  }
})();
