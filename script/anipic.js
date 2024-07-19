const fs = require("fs");
const axios = require("axios");

module.exports = {
  info: {
    name: "anipic",
    aliases: [],
    author: "kshitiz",
    version: "1.0",
    cooldowns: 5,
    role: 0,
    shortDescription: {
      en: ""
    },
    longDescription: {
      en: "get a random anime picture"
    },
    category: "𝗠𝗘𝗗𝗜𝗔",
    guide: {
      en: ""
    }
  },
  async execute({ api, event }) {
    let path = __dirname + "/cache/anipic_image.png";

    try {
      let response = await axios.get("https://pic.re/image", { responseType: "stream" });

      if (response.data) {
        let imageResponse = response.data;
        imageResponse.pipe(fs.createWriteStream(path));

        imageResponse.on("end", () => {
          api.sendMessage({
            body: "",
            attachment: fs.createReadStream(path)
          }, event.threadID, () => fs.unlinkSync(path));
        });
      } else {
        return api.sendMessage("Failed to fetch random anime picture. Please try again.", event.threadID);
      }
    } catch (e) {
      return api.sendMessage(e.message, event.threadID);
    }
  }
};
