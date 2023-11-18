const fs = require("fs");

module.exports = async ({ interaction, commandObj }) => {
  if (!commandObj.beta) return false;

  const betaTesters = await JSON.parse(
    fs.readFileSync("src/json/beta-testers.json")
  );

  console.log(betaTesters);

  console.log(interaction.user.id);
  console.log(betaTesters.find((id) => id["userID"] === interaction.user.id));
  if (betaTesters.find((id) => id["userID"] === interaction.user.id))
    return false;

  interaction.reply({
    content:
      "This command is currently in beta testing. To use it please apply for beta testing with the command /apply",
    ephemeral: true,
  });

  return true;
};
