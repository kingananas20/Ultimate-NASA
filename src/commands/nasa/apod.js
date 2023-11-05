const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const ColorThief = require("colorthief");
require("dotenv").config();
const {
  getData,
  isValidDate,
  isCurrentDate,
  isDateInRange,
} = require("../../common.js");

async function run({ interaction }) {
  const subcommand = interaction.options.getSubcommand();
  let url = `https://api.nasa.gov/planetary/apod?api_key=${process.env.APIKEY}`;

  if (subcommand === "date") {
    const date = interaction.options.get("date");
    const description = interaction.options.get("description") || true;

    if (date) {
      if (isDateInRange(date["value"]) && !isCurrentDate(date["value"]))
        url += `&date=${date["value"]}`;
      else
        return interaction.reply({
          content: "Date must not be older than 1995-06-16!",
          ephemeral: true,
        });
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

        if (description) embed.setDescription(`${data["explanation"]}`);

        if (data["media_type"] === "video") {
          embed.setURL(data["url"]);
        }

        await interaction.reply({ embeds: [embed.toJSON()] });
      } catch (error) {
        await interaction.reply({
          content: "Something went wrong! Please try again.",
          ephemeral: true,
        });
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
        await interaction.reply({
          content: "Something went wrong! Please try again.",
          ephemeral: true,
        });
      }
    }

    fetchData(url);
  }
}

const data = new SlashCommandBuilder()
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
  );

module.exports = { data, run };
