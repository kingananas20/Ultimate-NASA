const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { getData, isValidDate, getDate } = require("../../common.js");
require("dotenv").config();

async function run({ interaction }) {
  const api = interaction.options.get("api")["value"];
  let date = interaction.options.get("date");

  if (!date) date = getDate();
  else date = date["value"];

  if (!isValidDate(date))
    return interaction.reply({
      content: "The given date is not in the required format.",
      ephemeral: true,
    });

  let url = `https://api.nasa.gov/DONKI/${api}?api_key=${process.env.APIKEY}&startDate=${date}&endDate=${date}`;
  console.log(url);

  try {
    let data = await getData(url);
    let embed = new EmbedBuilder();

    if (data.length === 0)
      return interaction.reply({
        content: "No data available",
        ephemeral: true,
      });

    data = data[Math.floor(Math.random() * data.length)];
    console.log(data);

    if (api === "CME") {
      embed
        .setTitle(`Coronal Mass Ejection from ${date}`)
        .setDescription(`${data["note"]}`)
        .addFields(
          { name: "Activity ID", value: `${data["activityID"]}`, inline: true },
          { name: "Catalog", value: `${data["catalog"]}`, inline: true },
          {
            name: "Location",
            value: `${data["sourceLocation"]}`,
            inline: true,
          }
        );
    }
    if (api === "GST") {
      embed
        .setTitle(`Geomagnetic Storm from ${date}`)
        .setDescription(`ID: ${data["gstID"]}`);
    }
    if (api === "IPS") {
    }
    if (api === "FLR") {
    }
    if (api === "SEP") {
    }
    if (api === "MPC") {
    }
    if (api === "RBE") {
    }
    if (api === "HSS") {
    }
    if (api === "WSAEnlilSimulations") {
    }

    interaction.reply({ embeds: [embed.toJSON()] });
  } catch (error) {
    interaction.reply({
      content: "Something went wrong! Please try again.",
      ephemeral: true,
    });
  }
}

const data = new SlashCommandBuilder()
  .setName("donki")
  .setDescription(
    "Space Weather Database of Notifications, Knowledge, Information"
  )
  .addStringOption((option) =>
    option
      .setName("api")
      .setDescription("What data do you want")
      .setRequired(true)
      .addChoices(
        { name: "Coronal Mass Ejection", value: "CME" },
        { name: "Geomagnetic Storm", value: "GST" },
        { name: "Inteplanetary Shock", value: "IPS" },
        { name: "Solar Flare", value: "FLR" },
        { name: "Solar Energetic Particle", value: "SEP" },
        { name: "Magnetopause Crossing", value: "MPC" },
        { name: "Radiation Belt Enhancement", value: "RBE" },
        { name: "High Speed Stream", value: "HSS" },
        { name: "WSA + EnlilSimulation", value: "WSAEnlilSimulations" }
      )
  )
  .addStringOption((option) =>
    option
      .setName("date")
      .setDescription(
        "Date (YYYY-MM-DD) to get the data (default = 7 days prior to current date)"
      )
      .setRequired(false)
  )
  .toJSON();

module.exports = { data, run, underDev: true, beta: true };
