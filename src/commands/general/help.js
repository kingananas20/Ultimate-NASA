const {
  SlashCommandBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");

async function run({ interaction }) {
  const commands = [
    {
      label: "Ping",
      value: "ping",
    },
    {
      label: "APOD",
      value: "apod",
    },
    {
      label: "Image",
      value: "image",
    },
    {
      label: "MRP",
      value: "mrp",
    },
    {
      label: "NeoWS",
      value: "neows",
    },
  ];

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
  .setDescription("Shows informations about the commands.");

module.exports = { data, run };
