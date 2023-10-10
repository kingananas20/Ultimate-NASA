const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");
require("dotenv").config();
const ColorThief = require("colorthief");

function getData(url) {
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}

module.exports = {
  run: ({ interaction, client }) => {
    const subcommand = interaction.options.getSubcommand();

    let url = `https://api.nasa.gov/mars-photos/api/v1/`;

    if (subcommand === "curiosity") {
      const date = interaction.options.get("date")["value"];
      const camera = interaction.options.get("camera")["value"];
      const usesol = interaction.options.get("usesol") || false;

      if (!usesol) {
        url += `rovers/curiosity/photos?api_key=${process.env.APIKEY}&earth_date=${date}&camera=${camera}`;
      }

      if (usesol) {
        url += `rovers/curiosity/photos?api_key=${process.env.APIKEY}&sol=${date}&camera=${camera}`;
      }

      let embeds = [];

      async function fetchData(url) {
        let data = await getData(url);
        data = data["photos"];

        for (let i = 0; i < data.length; i++) {
          const image = data[i]["img_src"];
          const color = await ColorThief.getColor(image);

          const embed = new EmbedBuilder()
            .setTitle(`${data[i]["id"]}`)
            .addFields(
              {
                name: "Earth Date",
                value: `${data[i]["earth_date"]}`,
                inline: true,
              },
              {
                name: "Sol",
                value: `${data[i]["sol"]}`,
                inline: true,
              }
            )
            .setImage(image)
            .setColor(color)
            .setFooter({ text: "Provided by Mars Rover Photos" });

          embeds.push(embed);
        }

        const next = new ButtonBuilder()
          .setLabel("Next")
          .setCustomId("nextmrp")
          .setStyle(ButtonStyle.Success);
        const back = new ButtonBuilder()
          .setLabel("Back")
          .setCustomId("backmrp")
          .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(back, next);

        await interaction.reply({ embeds: [embeds], components: [row] });
      }

      fetchData(url);
    }

    if (subcommand === "info") {
      const rover = interaction.options.get("rover")["value"];
      url += `manifests/${rover}?api_key=${process.env.APIKEY}`;

      async function fetchData(url) {
        let data = await getData(url);
        data = await data["photo_manifest"];

        const embed = new EmbedBuilder()
          .setTitle(`${data["name"]}`)
          .setColor("DarkOrange")
          .addFields(
            {
              name: "Launch Date",
              value: `${data["launch_date"]}`,
              inline: true,
            },
            {
              name: "Landing Date",
              value: `${data["landing_date"]}`,
              inline: true,
            },
            { name: "\u200B", value: "\u200B", inline: true },
            {
              name: "Status",
              value: `${data["status"]}`,
              inline: true,
            },
            {
              name: "Total Photos",
              value: `${data["total_photos"]}`,
              inline: true,
            },
            { name: "\u200B", value: "\u200B", inline: true },
            { name: "Max SOL", value: `${data["max_sol"]}`, inline: true },
            { name: "Max Date", value: `${data["max_date"]}`, inline: true }
          )
          .setFooter({ text: "Provided by Mars Rover Photos" });

        interaction.reply({ embeds: [embed] });
      }

      fetchData(url);
    }
  },
  data: new SlashCommandBuilder()
    .setName("mrp")
    .setDescription("Get Mars Rover Pictures")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("curiosity")
        .setDescription("Get images from Curiosity")
        .addStringOption((option) =>
          option
            .setName("date")
            .setDescription("The date or sol to get images (default = date)")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("camera")
            .setDescription("Specify the camera")
            .setRequired(true)
            .addChoices(
              { name: "Front Hazard Avoidance Camera", value: "FHAZ" },
              { name: "Rear Hazard Avoidance Camera", value: "RHAZ" },
              { name: "Mast Camera", value: "MAST" },
              { name: "Chemistry and Camera Complex", value: "CHEMCAM" },
              { name: "Mars Hand Lens Imager", value: "MAHLI" },
              { name: "Mars Descent Imager", value: "MARDI" },
              { name: "Navigation Camera", value: "NAVCAM" }
            )
        )
        .addBooleanOption((option) =>
          option
            .setName("usesol")
            .setDescription("Use sol or date (default = false)")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("opportunity")
        .setDescription("Get images from Opportunity")
        .addStringOption((option) =>
          option
            .setName("date")
            .setDescription("The date or sol to get images (default = date)")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("camera")
            .setDescription("Specify the camera")
            .setRequired(true)
            .addChoices(
              { name: "Front Hazard Avoidance Camera", value: "FHAZ" },
              { name: "Rear Hazard Avoidance Camera", value: "RHAZ" },
              { name: "Panoramic Camera", value: "PANCAM" },
              {
                name: "Miniature Thermal Emission Spectrometer (Mini-TES)",
                value: "MINITES",
              },
              { name: "Navigation Camera", value: "NAVCAM" }
            )
        )
        .addBooleanOption((option) =>
          option
            .setName("usesol")
            .setDescription("Use sol or date (default = false)")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("spirit")
        .setDescription("Get images from Spirit")
        .addStringOption((option) =>
          option
            .setName("date")
            .setDescription("The date or sol to get images (default = date)")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("camera")
            .setDescription("Specify the camera")
            .setRequired(true)
            .addChoices(
              { name: "Front Hazard Avoidance Camera", value: "FHAZ" },
              { name: "Rear Hazard Avoidance Camera", value: "RHAZ" },
              { name: "Panoramic Camera", value: "PANCAM" },
              {
                name: "Miniature Thermal Emission Spectrometer (Mini-TES)",
                value: "MINITES",
              },
              { name: "Navigation Camera", value: "NAVCAM" }
            )
        )
        .addBooleanOption((option) =>
          option
            .setName("usesol")
            .setDescription("Use sol or date (default = false)")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("info")
        .setDescription("Get informations about a rover")
        .addStringOption((option) =>
          option
            .setName("rover")
            .setDescription("The rover you want information from")
            .setRequired(true)
            .addChoices(
              { name: "Curiosity", value: "curiosity" },
              { name: "Opportunity", value: "opportunity" },
              { name: "Spirit", value: "spirit" }
            )
        )
    ),

  underDev: true,
};
