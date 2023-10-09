const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const ColorThief = require("colorthief");
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
    let url = `https://api.nasa.gov/planetary/apod?api_key=${process.env.APIKEY}`;

    if (subcommand === "date") {
      const date = interaction.options.get("date");
      const description = interaction.options.get("description") || true;

      if (date) {
        if (isDateInRange(date["value"]) && !isCurrentDate(date["value"]))
          url += `&date=${date["value"]}`;
      }

      url += "&thumbs=true";

      async function fetchData(url) {
        try {
          const data = await getData(url);
          const image = data["thumbnail_url"] || data["url"];
          const color = await ColorThief.getColor(image);

          let embed = new EmbedBuilder()
            .setTitle(`${data["title"]}`)
            .setImage(image)
            .setColor(color)
            .setFooter({ text: "Provided by Astronomy Picture of the Day" });

          if (description === true)
            embed.setDescription(`${data["explanation"]}`);

          if (data["media_type"] === "video") {
            embed.setURL(data["url"]);
          }

          await interaction.reply({ embeds: [embed.toJSON()] });
        } catch (error) {
          console.log(error);
        }
      }

      fetchData(url);
    }

    if (subcommand === "random") {
      const description = interaction.options.get("description") || true;

      url += `&count=1&thumbs=true`;

      async function fetchData(url) {
        try {
          const data = await getData(url);
          const image = data[0]["thumbnail_url"] || data[0]["url"];
          const color = await ColorThief.getColor(image);

          let embed = new EmbedBuilder()
            .setTitle(`${data[0]["title"]}`)
            .setImage(image)
            .setColor(color)
            .setFooter({ text: "Provided by Astronomy Picture of the Day" });

          if (description === true)
            embed.setDescription(`${data[0]["explanation"]}`);

          if (data[0]["media_type"] === "video") {
            embed.setURL(data[0]["url"]);
          }

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
        .addBooleanOption((option) =>
          option
            .setName("description")
            .setDescription("Should there be a description (default true).")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("random")
        .setDescription("Get the picture of a random date.")
        .addBooleanOption((option) =>
          option
            .setName("description")
            .setDescription("Should there be a description (default true).")
            .setRequired(false)
        )
    ),
};
