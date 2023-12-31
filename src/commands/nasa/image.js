const {
  SlashCommandBuilder,
  EmbedBuilder,
  channelLink,
} = require("discord.js");
const ColorThief = require("colorthief");
const { getData } = require("../../common.js");

async function run({ interaction }) {
  const subcommand = interaction.options.getSubcommand();
  let url = "https://images-api.nasa.gov/search";

  if (subcommand === "search") {
    const query = interaction.options.get("query")["value"];

    url += `?q=${query}&media_type=image`;

    try {
      let data = await getData(url);
      data = data["collection"];

      if (data["items"].length === 0)
        return interaction.reply({
          content: `The search ${query} doesn't have any pictures.`,
          ephemeral: true,
        });

      const images_amount = data["items"].length;
      const chosen_image = Math.floor(Math.random() * images_amount);
      data = data["items"][chosen_image];

      const image = data["links"][0]["href"];
      color = (await ColorThief.getColor(image)) || "Red";
      data = data["data"][0];

      let title = data["title"];
      if (title.length > 32) title = title.slice(0, 32);

      const embed = new EmbedBuilder()
        .setTitle(`${title}`)
        .setDescription(`${data["description"]}`)
        .addFields(
          {
            name: "Center",
            value: `${data["center"]}`,
            inline: true,
          },
          {
            name: "Location",
            value: `${data["location"]}`,
            inline: true,
          },
          { name: "Id", value: `${data["nasa_id"]}`, inline: true }
        )
        .setImage(image)
        .setColor(color)
        .setFooter({ text: "Provided by NASA Image and Video Library" });

      await interaction.reply({ embeds: [embed] });
    } catch {
      await interaction.reply({
        content: "Something went wrong! Please try again.",
        ephemeral: true,
      });
    }
  }

  if (subcommand === "advanced-search") {
    url += `?media_type=image`;
    url +=
      interaction.options.get("query") !== undefined &&
      interaction.options.get("query") !== null
        ? `&q=${interaction.options.get("query")["value"]}`
        : "";
    url +=
      interaction.options.get("title") !== undefined &&
      interaction.options.get("title") !== null
        ? `&title=${interaction.options.get("title")["value"]}`
        : "";
    url +=
      interaction.options.get("description") !== undefined &&
      interaction.options.get("description") !== null
        ? `&description=${interaction.options.get("description")["value"]}`
        : "";
    url +=
      interaction.options.get("location") !== undefined &&
      interaction.options.get("location") !== null
        ? `&location=${interaction.options.get("location")["value"]}`
        : "";
    url +=
      interaction.options.get("keywords") !== undefined &&
      interaction.options.get("keywords") !== null
        ? `&keywords=${interaction.options.get("keywords")["value"]}`
        : "";
    url +=
      interaction.options.get("id") !== undefined &&
      interaction.options.get("id") !== null
        ? `&nasa_id${interaction.options.get("id")["value"]}`
        : "";
    url +=
      interaction.options.get("center") !== undefined &&
      interaction.options.get("center") !== null
        ? `&center=${interaction.options.get("center")["value"]}`
        : "";

    try {
      let data = await getData(url);
      data = data["collection"];

      if (data["items"].length === 0)
        return interaction.reply({
          content: "No pictures match your search.",
          ephemeral: true,
        });

      const images_amount = data["items"].length;
      const chosen_image = Math.floor(Math.random() * images_amount);
      data = data["items"][chosen_image];

      const image = data["links"][0]["href"];
      const color = await ColorThief.getColor(image);
      data = data["data"][0];

      let title = data["title"];
      if (title.length > 32) title = title.slice(0, 32);

      const embed = new EmbedBuilder()
        .setTitle(`${title}`)
        .setDescription(`${data["description"]}`)
        .addFields(
          {
            name: "Center",
            value: `${data["center"]}`,
            inline: true,
          },
          {
            name: "Location",
            value: `${data["location"]}`,
            inline: true,
          },
          { name: "Id", value: `${data["nasa_id"]}`, inline: true }
        )
        .setImage(image)
        .setColor(color)
        .setFooter({ text: "Provided by NASA Image and Video library" });

      await interaction.reply({ embeds: [embed] });
    } catch {
      await interaction.reply({
        content: "Something went wrong! Please try again.",
        ephemeral: true,
      });
    }
  }
}

const data = new SlashCommandBuilder()
  .setName("image")
  .setDescription("Search for an image")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("search")
      .setDescription("Show a random picture based of your search.")
      .addStringOption((option) =>
        option
          .setName("query")
          .setDescription("The query you wanna search.")
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("advanced-search")
      .setDescription("Show a random picture based of an more advanced search.")
      .addStringOption((option) =>
        option
          .setName("query")
          .setDescription("Query to search for.")
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("title")
          .setDescription("Term to search for in the title.")
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("description")
          .setDescription("Term to search for in the description.")
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("location")
          .setDescription("Term to search for in the location.")
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("keywords")
          .setDescription(
            "Terms to search for in the description (separate multiple with commas)."
          )
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("id")
          .setDescription("Show the picture of the specified Id.")
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("center")
          .setDescription("Term to search for in the centers.")
          .setRequired(false)
          .addChoices(
            { name: "Headquarters", value: "hq" },
            { name: "Goddard Space Flight Center", value: "gsfc" },
            { name: "John H. Glenn Research Center", value: "grc" },
            { name: "Langley Research Center", value: "larc" },
            { name: "John F. Kennedy Space Center", value: "ksc" },
            { name: "George C. Marshall Space Flight Center", value: "MSFC" },
            { name: "Stennis Space Center", value: "ssc" },
            { name: "Lyndon B. Johnson Space Center", value: "jsc" },
            {
              name: "Neil A. Armstrong Flight Research Center",
              value: "afrc",
            },
            { name: "Jet Propulsion Laboratory", value: "jpl" },
            { name: "Ames Research Center", value: "arc" }
          )
      )
  )
  .toJSON();

module.exports = { data, run };
