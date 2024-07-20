const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "anipic",
    aliases: [],
    version: "1.0",
    description: {
      en: "Get a random anime picture"
    },
    author: "kshitiz",
    cooldowns: 5,
    role: 0,
    category: "MEDIA",
    usage: {
      en: ""
    },
    guide: {
      en: ""
    }
  },

  async run({ api, event }) {
    const cacheFilePath = path.join(__dirname, `/cache/anipic_image_${Date.now()}.png`);

    try {
      const response = await axios.get("https://pic.re/image", { responseType: "stream" });

      if (response.data) {
        const writer = fs.createWriteStream(cacheFilePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
          writer.on('finish', async () => {
            try {
              await api.sendMessage({
                body: "",
                attachment: fs.createReadStream(cacheFilePath)
              }, event.threadID);
              fs.unlinkSync(cacheFilePath);
            } catch (error) {
              console.error(error);
            }
          });
          writer.on('error', reject);
        });
      } else {
        return api.sendMessage("Failed to fetch random anime picture. Please try again.", event.threadID);
      }
    } catch (error) {
      console.error(error);
      return api.sendMessage("An error occurred while processing the anipic command.", event.threadID);
    }
  }
};
