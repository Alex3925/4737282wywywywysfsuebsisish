const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "pairdp",
  version: "1.0",
  author: "Vex_kshitiz",
  cooldown: 5,
  role: 0,
  shortDescription: "Create couple matching profile pictures",
  longDescription: "Create couple matching pair display pictures by splitting a single image",
  category: "image",
  guide: "{p}pairdp (reply to a single image)",
};

module.exports.run = async function({ api, event, args }) {
  try {
    if (event.type !== "message_reply") {
      return api.sendMessage("❌ || Reply to a single image to create pair DP.", event.threadID, event.messageID);
    }

    const attachment = event.messageReply.attachments;
    if (!attachment || attachment.length !== 1 || attachment[0].type !== "photo") {
      return api.sendMessage("❌ || Please reply to a single image to create pair DP.", event.threadID, event.messageID);
    }

    const imageUrl = attachment[0].url;
    const image = await loadImage(imageUrl);

    const width = image.width;
    const height = image.height;
    const halfWidth = width / 2;

    const canvasLeft = createCanvas(halfWidth, height);
    const ctxLeft = canvasLeft.getContext('2d');
    ctxLeft.drawImage(image, 0, 0, halfWidth, height, 0, 0, halfWidth, height);

    const canvasRight = createCanvas(halfWidth, height);
    const ctxRight = canvasRight.getContext('2d');
    ctxRight.drawImage(image, halfWidth, 0, halfWidth, height, 0, 0, halfWidth, height);

    const cacheFolderPath = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheFolderPath)) {
      fs.mkdirSync(cacheFolderPath);
    }

    const leftImagePath = path.join(cacheFolderPath, `${Date.now()}_left.png`);
    const rightImagePath = path.join(cacheFolderPath, `${Date.now()}_right.png`);

    const outLeft = fs.createWriteStream(leftImagePath);
    const streamLeft = canvasLeft.createPNGStream();
    streamLeft.pipe(outLeft);

    const outRight = fs.createWriteStream(rightImagePath);
    const streamRight = canvasRight.createPNGStream();
    streamRight.pipe(outRight);

    outLeft.on('finish', () => {
      outRight.on('finish', () => {
        api.sendMessage({
          body: "Pair DP image!",
          attachment: [
            fs.createReadStream(leftImagePath),
            fs.createReadStream(rightImagePath)
          ]
        }, event.threadID, event.messageID);
      });
    });

  } catch (error) {
    console.error("Error:", error);
    api.sendMessage("❌ | An error occurred.", event.threadID, event.messageID);
  }
};
