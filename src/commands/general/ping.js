const { SlashCommandBuilder } = require("discord.js");

const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Pong!")
  .toJSON();

async function run({ client, interaction }) {
  await interaction.deferReply();

  const reply = await interaction.fetchReply();

  const ping = reply.createdTimestamp - interaction.createdTimestamp;

  interaction.editReply(
    `Pong! Client: ${ping}ms | Websocket: ${client.ws.ping}ms`
  );
}

const options = { devOnly: true };

module.exports = { data, run, options };
