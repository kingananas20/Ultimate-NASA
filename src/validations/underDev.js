module.exports = ({ interaction, commandObj }) => {
  if (!commandObj.underDev) return false;

  if (interaction.user.id === "863480661007138858") return false;

  interaction.reply({
    content: "This command is currently under development.",
    ephemeral: true,
  });

  return true;
};
