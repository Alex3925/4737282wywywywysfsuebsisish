module.exports = {
  config: {
    name: "shoticron",
    version: "1.0.0",
    role: 0,
    credits: "Alex",
    description: "Generate a random tiktok video per 1 hour.",
    usages: "",
    cooldown: 0,
  },

  autoExecute: true, // flag to turn on/off auto execute

  run: async ({ api, event, args }) => {
    api.setMessageReaction("⏳", event.messageID, (err) => {}, true);
    api.sendTypingIndicator(event.threadID, true);

    const { messageID, threadID } = event;
    const fs = require("fs");
    const axios = require("axios");
    const request = require("request");
    const prompt = args.join(" ");

    if (!prompt[0]) {
      api.sendMessage("Downloading...", threadID, messageID);
    }

    try {
      const response = await axios.post(`https://shoti-srv1.onrender.com/api/v1/get`, {
        apikey: `shoti-1ha4h3do8at9a7ponr`
      });

      let path = __dirname + `/cache/shoti.mp4`;
      const file = fs.createWriteStream(path);
      const rqs = request(encodeURI(response.data.data.url));
      rqs.pipe(file);
      file.on(`finish`, () => {
        setTimeout(function() {
          api.setMessageReaction("✅", event.messageID, (err) => {}, true);
          return api.sendMessage({
            body: `𝖴𝗌𝖾𝗋𝗇𝖺𝗆𝖾 : @${response.data.data.user.username}\n𝖭𝗂𝖼𝗄𝗇𝖺𝗆𝖾 : ${response.data.data.user.nickname}`,
            attachment: fs.createReadStream(path)
          }, threadID);
        }, 5000);
      });
      file.on(`error`, (err) => {
        api.sendMessage(`Error: ${err}`, threadID, messageID);
      });
    } catch (err) {
      api.sendMessage(`Error: ${err}`, threadID, messageID);
    };
  },

  start: async ({ api, event }) => {
    setInterval(async () => {
      if (this.autoExecute) {
        api.sendMessage("AUTO SHOTI SENT 🥵", event.threadID, event.messageID);
        this.run({ api, event, args: [] });
      }
    }, 3600000); // 1 hour interval
  },

  handleEvent: async ({ api, event }) => {
    if (event.body === 'shoticron on') {
      this.autoExecute = true;
      api.sendMessage('Auto execute turned on!', event.threadID, event.messageID);
    } else if (event.body === 'shoticron off') {
      this.autoExecute = false;
      api.sendMessage('Auto execute turned off!', event.threadID, event.messageID);
    }
  }
};
