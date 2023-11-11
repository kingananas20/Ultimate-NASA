const {
  SlashCommandBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

async function run({ interaction }) {
  const commands = [];
  const embeds = [];

  function collectCommands(directoryPath) {
    fs.readdirSync(directoryPath).forEach((file) => {
      const filePath = path.join(directoryPath, file);

      if (fs.statSync(filePath).isDirectory()) {
        collectCommands(filePath);
      } else if (file.endsWith(".js")) {
        try {
          const command = require(filePath).data;
          commands.push(command);
        } catch (error) {
          console.error(`Error importing ${filePath}: ${error}`);
        }
      }
    });
  }

  function makeEmbeds() {
    if (commands.length === 0) return;

    commands.forEach((command) => {
      let embed = new EmbedBuilder()
        .setName(`${command["name"]}`)
        .setDescription(`${command["description"]}`)
        .setColor(15, 117, 87);
    });
  }

  collectCommands(path.join(__dirname, ".."));
  console.log(commands[4]["options"][0]["options"]);

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(interaction.id)
    .setPlaceholder("Choose command for further information...")
    .setMinValues(0)
    .setMaxValues(1)
    .addOptions(
      commands.map((command) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(command["name"])
          .setValue(command["name"])
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
