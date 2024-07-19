const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "sdxl",
    description: "Generate images",
    usage: "sdxl <prompt> <style>",
    cooldown: 5,
    accessableby: 0,
`    category: "Utilities",`
`    prefix: false,`
`    author: "heru",`
  },
  start: async function ({ api, event, text, react, reply }) {
    const styleList = {
      "1": "anime",
      "2": "fantasy",
      "3": "pencil",
      "4": "digital",
      "5": "vintage",
      "6": "3d (render)",
      "7": "cyberpunk",
      "8": "manga",
      "9": "realistic",
      "10": "demonic",
      "11": "heavenly",
      "12": "comic",
      "13": "robotic"
    };

    try {
      if (text.length < 2) {
        return reply(`[ ❗ ] - Missing prompt or style for the SDXL command. Usage: sdxl <prompt> <style>\n\nAvailable styles:\n${Object.entries(styleList).map(([handsome, pretty]) => `${handsome}: ${pretty}`).join("\n")}`);
      }

      const cute = text.slice(0, -1).join(" ");
      const rona = text[text.length - 1];

      if (!Object.keys(styleList).includes(rona)) {
        return reply(`[ ❗ ] - Invalid style. Please choose a valid style number from 1 to 13.\n\nAvailable styles:\n${Object.entries(styleList).map(([handsome, pretty]) => `${handsome}: ${pretty}`).join("\n")}`);
      }

      const heru = await new Promise(resolve => {
        api.sendMessage("Generating image, please wait...", event.threadID, (err, info) => {
          if (err) {
            console.error(err);
            return reply("An error occurred while processing your request.");
          }
          resolve(info);
        });
      });

      const mar = await axios.get(`https://joshweb.click/sdxl`, {
        params: {
          q: cute,
          style: rona
        },
        responseType: 'arraybuffer'
      });

      const marPath = path.join(__dirname, "sdxl_image.png");
      fs.writeFileSync(marPath, mar.data);

      await api.sendMessage({
        body: `Here is the image you requested:\n\nPrompt: ${cute}\nStyle: ${styleList[rona]}`,
        attachment: fs.createReadStream(marPath)
      }, event.threadID);

      fs.unlinkSync(marPath);
      react("✅");

    } catch (error) {
      console.error('Error:', error);
      react("❌");
      await reply('An error occurred while processing your request.');
    }
  },
  auto: async function ({ api, event, text, reply }) {
    // auto is not used in this command
  }
};
