module.exports.config = {
  name: 'sdxl',
  version: '1.0.0',
  role: 0,
  aliases: [],
  credits: 'heru',
  description: 'Generate images',
  cooldown: 5,
  hasPrefix: false
};

module.exports.run = async function({ api, event, args }) {
  const axios = require('axios');
  const fs = require('fs');
  const path = require('path');

  const styleList = {
    "1": "anime",
    "2": "fantasy",
    "3": "pencil",
    "4": "digital",
    "5": "vintage",
    "6": "3d (render)",
    "7": "cyberpunk",
    "8": "manga",
    "9": "realistic",
    "10": "demonic",
    "11": "heavenly",
    "12": "comic",
    "13": "robotic"
  };

  if (args.length < 2) {
    api.sendMessage(`[ ❗ ] - Missing prompt or style for the SDXL command. Usage: sdxl <prompt> <style>\n\nAvailable styles:\n${Object.entries(styleList).map(([handsome, pretty]) => `${handsome}: ${pretty}`).join("\n")}`, event.threadID, event.messageID);
    return;
  }

  const prompt = args.slice(0, -1).join(" ");
  const style = args[args.length - 1];

  if (!Object.keys(styleList).includes(style)) {
    api.sendMessage(`[ ❗ ] - Invalid style. Please choose a valid style number from 1 to 13.\n\nAvailable styles:\n${Object.entries(styleList).map(([handsome, pretty]) => `${handsome}: ${pretty}`).join("\n")}`, event.threadID, event.messageID);
    return;
  }

  try {
    api.sendMessage("Generating image, please wait...", event.threadID, event.messageID);

    const res = await axios.get(`https://joshweb.click/sdxl`, {
      params: {
        q: prompt,
        style: style
      },
      responseType: 'arraybuffer'
    });

    const imagePath = path.join(__dirname, "sdxl_image.png");
    fs.writeFileSync(imagePath, res.data);

    api.sendMessage({
      body: `Here is the image you requested:\n\nPrompt: ${prompt}\nStyle: ${styleList[style]}`,
      attachment: fs.createReadStream(imagePath)
    }, event.threadID, event.messageID);

    fs.unlinkSync(imagePath);
    api.react("✅", event.threadID, event.messageID);
  } catch (error) {
    console.error('Error:', error);
    api.react("❌", event.threadID, event.messageID);
    api.sendMessage('An error occurred while processing your request.', event.threadID, event.messageID);
  }
};

module.exports.auto = async function({ api, event, args }) {
  // auto is not used in this command
};
