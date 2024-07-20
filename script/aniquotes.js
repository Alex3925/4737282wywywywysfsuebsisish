const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "animequotes",
    aliases: ["aniquote"],
    author: "Kshitiz",
    version: "1.0",
    cooldowns: 5,
    role: 0,
    shortDescription: "Get random anime quotes vdot",
    longDescription: "Get random anime quotes vdo",
    category: "anime",
    usage: {
      en: "{p}animequotes"
    },
    guide: {
      en: "{p}animequotes"
    }
  },

  async run({ api, event, args }) {
    try {
      api.setMessageReaction("🕐", event.messageID, (err) => {}, true);

      const response = await axios.get(`https://aniquotes-klos.onrender.com/kshitiz`, { responseType: "arraybuffer" });

      const tempVideoPath = path.join(__dirname, "cache", `${Date.now()}.mp4`);

      await fs.promises.writeFile(tempVideoPath, response.data);

      const stream = fs.createReadStream(tempVideoPath);

      api.sendMessage({
        body: `Random Anime Quotes`,
        attachment: stream,
      }, event.threadID);

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);
    } catch (error) {
      console.error(error);
      api.sendMessage("Sorry, an error occurred while processing your request.", event.threadID);
    }
  }
};
