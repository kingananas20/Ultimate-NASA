const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
} = require("discord.js");
require("dotenv").config();

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
    const botAvatarURL = client.user.displayAvatarURL({
      format: "png",
      dynamic: true,
    });

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
    .setDescription("Get Mars Rover Pictures.")
    .addSubcommandGroup((subcommandGroup) =>
      subcommandGroup
        .setName("curiosity")
        .setDescription("Get images from Curiosity")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("image")
            .setDescription("Get images from a specified date or sol")
            .addIntegerOption((option) =>
              option
                .setName("date")
                .setDescription(
                  "The date or sol to get images (default = date)"
                )
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
    )
    .addSubcommandGroup((subcommandGroup) =>
      subcommandGroup
        .setName("opportunity")
        .setDescription("Get images from Opportunity")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("image")
            .setDescription("Get images from a specified date or sol")
            .addIntegerOption((option) =>
              option
                .setName("date")
                .setDescription(
                  "The date or sol to get images (default = date)"
                )
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
    )
    .addSubcommandGroup((subcommandGroup) =>
      subcommandGroup
        .setName("spirit")
        .setDescription("Get images from Spirit")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("image")
            .setDescription("Get images from a specified date or sol")
            .addIntegerOption((option) =>
              option
                .setName("date")
                .setDescription(
                  "The date or sol to get images (default = date)"
                )
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
};
