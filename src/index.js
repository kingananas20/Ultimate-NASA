const { Client, IntentsBitField } = require("discord.js");
const { CommandKit } = require("commandkit");
const path = require("path");
require("dotenv").config();

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds],
});

new CommandKit({
  client,
  commandsPath: path.join(__dirname, "commands"),
  eventsPath: path.join(__dirname, "events"),
  validationsPath: path.join(__dirname, "validations"),
  devGuildIds: ["1008702315798216725"],
  devUserIds: ["863480661007138858"],
  bulkRegister: true,
});

client.login(process.env.TOKEN);
