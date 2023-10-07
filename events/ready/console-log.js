require("dotenv").config();

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

async function fetchData(url) {
  try {
    const data = await getData(url);
    // Use the data here
    return data;
  } catch (error) {
    // Handle errors here if needed
    console.error(error);
  }
}

module.exports = (client) => {
  image = fetchData(
    `https://api.nasa.gov/planetary/apod?api_key=${process.env.APIKEY}`
  );

  async function changeAvatar() {
    const imageUrl = image.hdurl;

    // Set the bot's avatar to the current image
    try {
      await client.user.setAvatar(imageUrl);
      console.log(`Changed avatar to ${imageUrl}`);
    } catch (error) {
      console.error("Error changing avatar:", error);
    }
  }

  changeAvatar();
  console.log(`${client.user.tag} is online.`);
};
