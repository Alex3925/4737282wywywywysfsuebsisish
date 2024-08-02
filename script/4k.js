const { writeFileSync, existsSync, mkdirSync, createReadStream } = require("fs");
const { join } = require("path");
const axios = require("axios");
const tinyurl = require('tinyurl');

module.exports.config = {
  name: "4k",
  version: "2.0",
  author: "Vex_Kshitiz",
  cooldown: 20,
  role: 2,
  shortDescription: "Enhance image quality",
  longDescription: "Enhance the image quality using remini",
  category: "tool",
  guide: "{p}4k (reply to an image)",
};

module.exports.run = async function({ api, event, args }) {
  api.setMessageReaction("🕐", event.messageID, (err) => {}, true);
  const { type, messageReply } = event;
  const { attachments, threadID, messageID } = messageReply || {};

  if (type === "message_reply" && attachments) {
    const [attachment] = attachments;
    const { url, type: attachmentType } = attachment || {};

    if (!attachment || !["photo", "sticker"].includes(attachmentType)) {
      return api.sendMessage("❌ | Reply must be an image.", threadID, messageID);
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

      api.sendMessage({ attachment: createReadStream(imagePath) }, threadID, messageID);
    } catch (error) {
      console.error(error);
      api.sendMessage("❌ | Error occurred while enhancing image.", threadID, messageID);
    }
  } else {
    api.sendMessage("❌ | Please reply to an image.", threadID, messageID);
  }
};
