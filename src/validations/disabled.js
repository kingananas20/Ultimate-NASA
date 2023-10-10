module.exports = ({ interaction, commandObj }) => {
  if (!commandObj.disabled) return false;

  interaction.reply({
    content: "This command is currently disabled.",
    ephemeral: true,
  });

  return true;
};
