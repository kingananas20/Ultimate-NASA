module.exports = (interaction, commandObj) => {
  if (commandObj.devOnly) {
    if (interaction.member.id !== "863480661007138858") {
      interaction.reply("This command is for developers only.");
      return true;
    }
  }
};
