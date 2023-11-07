const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

const commands = [];
const embeds = [];
const parentFolder = path.join(__dirname, "commands");

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

collectCommands(parentFolder);
console.log(commands[4]["options"]);

function commandEmbeds() {
  commands.forEach((command) => {
    let embed = new EmbedBuilder()
      .setTitle(`${command["name"]}`)
      .setDescription(`${command["description"]}`)
      .setColor(174346);

    if (command["options"].length === 0) return embeds.push(embed);

    const fields = [];

    command["options"].forEach((option) => {
      const field = {
        name: `${option["name"]}`,
        value: `${option["description"]}`,
        inline: true,
      };

      fields.push(field);
    });

    embed.addFields(fields).toJSON();
  });
}

commandEmbeds();
console.log(embeds);
