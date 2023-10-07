const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const ColorThief = require("colorthief");
const moment = require("moment");
require("dotenv").config();

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

/*async function fetchData(url) {
  try {
    const data = await getData(url);
    console.log(data.date);
  } catch (error) {
    // Handle errors here if needed
    console.error(error);
  }
}*/

module.exports = {
  run: ({ interaction }) => {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "date") {
      let url = `https://api.nasa.gov/planetary/apod?api_key=${process.env.APIKEY}`;
      try {
        const date = interaction.options.get("date").value;

        if (!isDateInRange(date))
          throw new Error("The provided date is invalid.");

        if (isCurrentDate(date)) url = url + `&date=${date}`;
      } catch (error) {
        interaction.reply({ content: error.message, ephemeral: true });
        return;
      }

      async function fetchData(url) {
        try {
          const data = await getData(url);
          const color = await ColorThief.getColor(data["url"]);

          const embed = new EmbedBuilder()
            .setTitle(`${data["title"]} (${data["date"]})`)
            .setDescription(`${data["explanation"]}`)
            .setImage(data["url"])
            .setColor(color);

          await interaction.reply({ embeds: [embed.toJSON()] });
        } catch (error) {
          console.log(error);
        }
      }

      fetchData(url);
    }
  },

  data: new SlashCommandBuilder()
    .setName("apod")
    .setDescription("Astronomy picture of the day")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("date")
        .setDescription("Get the APOD of the specified date.")
        .addStringOption((option) =>
          option
            .setName("date")
            .setDescription(
              "Get the picture of the specified date (YYYY-MM-DD) or if nothing specified the current date."
            )
            .setRequired(false)
        )
    ),
};
