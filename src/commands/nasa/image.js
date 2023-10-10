const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
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
  run: ({ interaction }) => {
    const subcommand = interaction.options.getSubcommand();
    let url = "https://images-api.nasa.gov/search";

    if (subcommand === "search") {
      const query = interaction.options.get("query")["value"];

      url += `?q=${query}&media_type=image`;

      async function fetchData(url) {
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

        let title = data["data"][0]["title"];
        if (title.length > 32) title = title.slice(0, 32);

        const embed = new EmbedBuilder()
          .setTitle(`${title}`)
          .setDescription(`${data["data"][0]["description"]}`)
          .setImage(image)
          .setColor(color)
          .setFooter({ text: "Provided by NASA Image and Video Library" });

        await interaction.reply({ embeds: [embed] });
      }

      fetchData(url);
    }
  },
  data: new SlashCommandBuilder()
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
        .setDescription(
          "Show a random picture based of an more advanced search."
        )
        .addStringOption((option) =>
          option
            .setName("query")
            .setDescription("Query to search for.")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("title")
            .setDescription("Terms to search for in the title.")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("description")
            .setDescription("Terms to search for in the description.")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("location")
            .setDescription("Terms to search for in the location.")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("keywords")
            .setDescription("Terms to search for in the description.")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("Show the picture of the specified Id.")
            .setRequired(false)
        )
    ),
  underDev: true,
};
