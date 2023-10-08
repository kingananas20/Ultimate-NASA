const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
require("dotenv").config();

let url = `https://api.nasa.gov/neo/rest/v1/`;

function isValidDate(dateString) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(dateString);
}

function isDateInRange(dateString) {
  if (isValidDate(dateString)) {
    const inputDate = new Date(dateString);
    const minDate = new Date("1995-06-16");
    const currentDate = new Date();

    return minDate < inputDate && inputDate < currentDate;
  } else {
    return false;
  }
}

function isCurrentDate(dateString) {
  const currentDate = new Date();
  const formattedCurrentDate = currentDate.toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

  return dateString === formattedCurrentDate;
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

    if (subcommand === "feed") {
      const date = interaction.options.get("date");
      const end_date = interaction.options.get("end-date");

      url += `feed?api_key=${process.env.APIKEY}`;
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
    .setDescription("Near Earth Object Web Service")
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
        .addStringOption((option) =>
          option
            .setName("end-date")
            .setDescription("The end date of the range (default = date)")
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
