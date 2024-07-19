const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  info: {
    name: "animequotes",
    aliases: ["aniquote"],
    author: "Kshitiz",
    version: "1.0",
    cooldowns: 5,
    role: 0,
    shortDescription: "Get random anime quotes vdot",
    longDescription: "Get random anime quotes vdo",
    category: "anime",
    guide: "{p}animequotes",
  },

  async execute({ api, event, args }) {
    api.setMessageReaction("🕐", event.messageID, (err) => {}, true);

    try {
      const response = await axios.get(`https://aniquotes-klos.onrender.com/kshitiz`, { responseType: "stream" });

      const tempVideoPath = path.join(__dirname, "cache", `${Date.now()}.mp4`);

      const writer = fs.createWriteStream(tempVideoPath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        const stream = fs.createReadStream(tempVideoPath);

        api.sendMessage({
          body: `Random Anime Quotes`,
          attachment: stream,
        }, event.threadID);

        api.setMessageReaction("✅", event.messageID, (err) => {}, true);
      });
    } catch (error) {
      console.error(error);
      api.sendMessage("Sorry, an error occurred while processing your request.", event.threadID);
    }
  }
};
