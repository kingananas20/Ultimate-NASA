const { Client, IntentsBitField, EmbedBuilder } = require("discord.js");
const { CommandHandler } = require("djs-commander");
const path = require("path");
require("dotenv").config();

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds],
});

new CommandHandler({
  client,
  commandsPath: path.join(__dirname, "commands"),
  eventsPath: path.join(__dirname, "events"),
  validationsPath: path.join(__dirname, "validations"),
  testServer: "1008702315798216725",
});

client.login(process.env.TOKEN);
