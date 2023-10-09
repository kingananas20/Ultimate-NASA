const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
require("dotenv").config();

function isValidDate(dateString) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(dateString);
}

function getDate() {
  const currentDate = new Date();

  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

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
  run: ({ interaction }) => {
    const subcommand = interaction.options.getSubcommand();
    let url = `https://api.nasa.gov/neo/rest/v1/`;

    if (subcommand === "feed") {
      let date = interaction.options.get("date");

      url += `feed?api_key=${process.env.APIKEY}`;

      if (date && isValidDate(date["value"])) {
        url += `&start_date=${date["value"]}&end_date=${date["value"]}`;
        date = date["value"];
      } else {
        url += `&start_date=${getDate()}&end_date=${getDate()}`;
        date = getDate();
      }
      console.log(url);

      async function fetchData(url) {
        let data = await getData(url);

        if (data && data.near_earth_objects && data.near_earth_objects[date]) {
          data = data.near_earth_objects[date];

          let embed = new EmbedBuilder()
            .setTitle(`Near Earth Objects ${date}`)
            .setDescription(`All the NEOs from ${date}`)
            .setColor("DarkVividPink");
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

          interaction.reply({ embeds: [embed] });
          neos = [];
        } else {
          interaction.reply("Data not available for the specified date.");
        }
      }

      fetchData(url);
    }

    if (subcommand === "lookup") {
      const id = interaction.options.get("id")["value"];

      url += `neo/${id}?api_key=${process.env.APIKEY}`;

      async function fetchData(url) {
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
