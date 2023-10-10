require("dotenv").config();

module.exports = (client) => {
  console.log(`${client.user.tag} is online.`);
};
