const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
require("dotenv").config();
const { getDate, isValidDate, getData } = require("../../common.js");

module.exports = {
  run: ({ interaction }) => {
    const subcommand = interaction.options.getSubcommand();
    let url = `https://api.nasa.gov/neo/rest/v1/`;

    if (subcommand === "feed") {
      let date = interaction.options.get("date");

      url += `feed?api_key=${process.env.APIKEY}`;

      if (date && isValidDate(date["value"])) {
        date = date["value"];
        url += `&start_date=${date}&end_date=${date}`;
      } else {
        date = getDate();
        url += `&start_date=${date}&end_date=${date}`;
      }

      async function fetchData(url) {
        try {
          let data = await getData(url);

          if (data["element_count"] === 0)
            return await interaction.reply({
              content: "No data available.",
              ephemeral: true,
            });

          data = data.near_earth_objects[date];

          let embed = new EmbedBuilder()
            .setTitle(`Near Earth Objects ${date}`)
            .setDescription(`All the NEOs from ${date}`)
            .setColor("DarkVividPink")
            .setFooter({
              text: "Provided by Near Earth Objects Web Service",
            });

          let neos = [];
          let length = 0;
          if (data.length < 25) length = data.length;
          else length = 25;

          for (let i = 0; i < length; i++) {
            let asteroid = data[i];
            let name = asteroid["name"];
            let id = asteroid["id"];

            field = {
              name: `${name}`,
              value: `${id}`,
              inline: true,
            };

            neos.push(field);
          }

          embed.addFields(neos);

          await interaction.reply({ embeds: [embed] });
        } catch {
          await interaction.reply({
            content: "Something went wrong! Please try again.",
            ephemeral: true,
          });
        }
      }

      fetchData(url);
    }

    if (subcommand === "lookup") {
      const id = interaction.options.get("id")["value"];

      url += `neo/${id}?api_key=${process.env.APIKEY}`;

      async function fetchData(url) {
        try {
          const data = await getData(url);

          diameterMeters =
            (data["estimated_diameter"]["meters"]["estimated_diameter_min"] +
              data["estimated_diameter"]["meters"]["estimated_diameter_max"]) /
            2;
          diameterFeet =
            (data["estimated_diameter"]["feet"]["estimated_diameter_min"] +
              data["estimated_diameter"]["feet"]["estimated_diameter_max"]) /
            2;

          let embed = new EmbedBuilder()
            .setTitle(`${data["name"]} (${data["id"]})`)
            .setDescription(
              `Last seen: ${data["orbital_data"]["last_observation_date"]}`
            )
            .setColor("DarkVividPink")
            .setFooter({ text: "Provided by Near Earth Objects Web Service" })
            .addFields(
              {
                name: "Estimated Diameter",
                value: `${diameterMeters}m (${diameterFeet}f)`,
                inline: true,
              },
              {
                name: "Absolute Magnitude",
                value: `${data["absolute_magnitude_h"]}`,
                inline: true,
              },
              {
                name: "Hazardous",
                value: `${data["is_potentially_hazardous_asteroid"]}`,
                inline: true,
              },
              { name: "\u200B", value: "\u200B" },
              {
                name: "Orbital Data",
                value: `Uncertainty: ${data["orbital_data"]["orbit_uncertainty"]}`,
              },
              {
                name: "Type",
                value: `${data["orbital_data"]["orbit_class"]["orbit_class_type"]}`,
                inline: true,
              },
              {
                name: "Description",
                value: `${data["orbital_data"]["orbit_class"]["orbit_class_description"]}`,
                inline: true,
              },
              {
                name: "Range",
                value: `${data["orbital_data"]["orbit_class"]["orbit_class_range"]}`,
                inline: true,
              },
              {
                name: "Perihelion",
                value: `${data["orbital_data"]["perihelion_distance"]} AU`,
                inline: true,
              },
              {
                name: "Aphelion",
                value: `${data["orbital_data"]["aphelion_distance"]} AU`,
                inline: true,
              },
              {
                name: "Inclination",
                value: `${data["orbital_data"]["inclination"]}°`,
                inline: true,
              },
              {
                name: "Eccentricity",
                value: `${data["orbital_data"]["eccentricity"]}`,
                inline: true,
              },
              {
                name: "Semi-Major-Axis",
                value: `${data["orbital_data"]["semi_major_axis"]} AU`,
                inline: true,
              }
            );

          interaction.reply({ embeds: [embed] });
        } catch {
          await interaction.reply({
            content: "Something went wrong! Please try again.",
            ephemeral: true,
          });
        }
      }

      fetchData(url);
    }
  },

  data: new SlashCommandBuilder()
    .setName("neows")
    .setDescription("Near Earth Object Web Service.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("feed")
        .setDescription(
          "Shows the amount of NEOs in the specified range that passed by the earth."
        )
        .addStringOption((option) =>
          option
            .setName("date")
            .setDescription("The start date of the range (default = today).")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("lookup")
        .setDescription("Look up a NEO by the SPK-ID.")
        .addIntegerOption((option) =>
          option
            .setName("id")
            .setDescription("SPK-ID of the object.")
            .setRequired(true)
        )
    ),
};
