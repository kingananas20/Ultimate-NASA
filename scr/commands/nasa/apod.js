const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const ColorThief = require("colorthief");
require("dotenv").config();

let url = `https://api.nasa.gov/planetary/apod?api_key=${process.env.APIKEY}`;

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
      const date = interaction.options.get("date");

      if (date) {
        if (isDateInRange(date["value"]) && !isCurrentDate(date["value"]))
          url += `&date=${date["value"]}`;
      }

      url += "&thumbs=true";

      async function fetchData(url) {
        try {
          const data = await getData(url);

          const embed = new EmbedBuilder()
            .setTitle(`${data["title"]} (${data["date"]})`)
            .setDescription(`${data["explanation"]}`);

          if (data["media_type"] == "video")
            embed
              .setURL(data["url"])
              .setImage(data["thumbnail_url"])
              .setColor("DarkAqua");
          else
            embed
              .setImage(data["url"])
              .setColor(await ColorThief.getColor(data["url"]));

          await interaction.reply({ embeds: [embed.toJSON()] });
        } catch (error) {
          console.log(error);
        }
      }

      fetchData(url);
    }

    if (subcommand === "range") {
      let count = interaction.options.get("count") || 1;

      if (count !== null) {
        if (count.value <= 9) {
          url += `&count=${count.value}`;
        } else url += `&count=9`;
      } else url += `&count=1`;

      async function fetchData(url) {
        try {
          const data = await getData(url);
          let embed = new EmbedBuilder().setTitle(
            `${count.value} randomnly chosen APOD(s)`
          );

          data.forEach(function (value) {
            embed.addFields({
              name: value["title"],
              value: value["date"],
              inline: true,
            });
          });

          await interaction.reply({ embeds: [embed] });
        } catch (error) {
          console.log(error);
        }
      }

      fetchData(url);
    }
  },

  data: new SlashCommandBuilder()
    .setName("apod")
    .setDescription("Astronomy picture of the day.")
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
        .addBooleanOption((option) =>
          option
            .setName("description")
            .setDescription("Should there be a description (default true).")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("range")
        .setDescription(
          "Get the date and title of a specified amount of randomnly chosen APODs"
        )
        .addIntegerOption((option) =>
          option
            .setName("count")
            .setDescription(
              "Amount for randomnly chosen images (max. 9) or if nothing specified 1."
            )
            .setRequired(false)
        )
    ),
};
