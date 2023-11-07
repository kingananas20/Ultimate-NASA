const {
  SlashCommandBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ComponentType,
  DiscordAPIError,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

async function run({ interaction }) {
  const commands = [
    {
      label: "apod",
      value: "apod",
    },
  ];

  fs.readdirSync(path.join(__dirname, "..")).forEach((file) => {
    if (file.endsWith(".js")) {
      const { data } = require(`../general/${file}` || `../nasa/${file}`);
      const command = {
        name: `${data["name"]}`,
      };

      commands.push(command);
    }
  });

  console.log(commands);

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(interaction.id)
    .setPlaceholder("Choose command for further information...")
    .setMinValues(0)
    .setMaxValues(1)
    .addOptions(
      commands.map((command) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(command["label"])
          .setValue(command["value"])
      )
    );

  const actionRow = new ActionRowBuilder().addComponents(selectMenu);

  const reply = await interaction.reply({
    content: "Help",
    components: [actionRow],
  });

  const collector = reply.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    filter: (i) =>
      i.user.id === interaction.user.id && i.customId === interaction.id,
    time: 30_000,
  });

  collector.on("collect", (interaction) => {
    reply.edit({ content: `${interaction.values}` });
  });
}

const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Shows informations about the commands.")
  .toJSON();

module.exports = { data, run };
