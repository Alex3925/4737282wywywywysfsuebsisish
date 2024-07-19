const { writeFileSync, existsSync, mkdirSync } = require("fs");
const { join } = require("path");
const axios = require("axios");
const tinyurl = require('tinyurl');

module.exports = {
  info: {
    name: "4k",
    aliases: [remini],[enhance]
    version: "2.0",
    author: "Vex_Kshitiz",
    cooldowns: 20,
    role: 2,
    shortDescription: "remini",
    longDescription: "enhance the image quality",
    category: "tool",
    guide: {
      en: "{p}remini (reply to image)",
    }
  },

  async execute({ api, event, args }) {
    api.setMessageReaction("🕐", event.messageID, (err) => {}, true);
    const { type, messageReply } = event;
    const { attachments, threadID, messageID } = messageReply || {};

    if (type === "message_reply" && attachments) {
      const [attachment] = attachments;
      const { url, type: attachmentType } = attachment || {};

      if (!attachment || !["photo", "sticker"].includes(attachmentType)) {
        return api.sendMessage("❌ | Reply must be an image.", event.threadID);
      }

      try {
        const shortUrl = await tinyurl.shorten(url);
        const { data } = await axios.get(`https://vex-kshitiz.vercel.app/upscale?url=${encodeURIComponent(shortUrl)}`, {
          responseType: "json"
        });

        const imageUrl = data.result_url;
        const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });

        const cacheDir = join(__dirname, "cache");
        if (!existsSync(cacheDir)) {
          mkdirSync(cacheDir, { recursive: true });
        }

        const imagePath = join(cacheDir, "remi_image.png");
        writeFileSync(imagePath, imageResponse.data);

        api.sendMessage({ attachment: fs.createReadStream(imagePath) }, event.threadID);
      } catch (error) {
        console.error(error);
        api.sendMessage("❌ | Error occurred while enhancing image.", event.threadID);
      }
    } else {
      api.sendMessage("❌ | Please reply to an image.", event.threadID);
    }
  }
};
