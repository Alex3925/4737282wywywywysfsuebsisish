const config = {
  name: "ngl",
  version: "1.0.0",
  role: 0,
  credits: "Deku",
  description: "Spam NGL",
  usages: "[username => amount => message]",
  category: "...",
  cooldown: 0,
  hasPrefix: false
};

module.exports = {
  config,
  run: async ({ api, event, args }) => {
    const axios = require("axios");
    try {
      const content = args
        .join(" ")
        .split("=>")
        .map((item) => (item = item.trim()));
      let username = content[0];
      let amount = parseInt(content[1]);
      let message = content[2];
      let msg =
        "Wrong format or something is missing." +
        "\nHow to use: " +
        config.usages;
      if (!username || !amount || !message) return api.sendMessage(msg, event.threadID, event.messageID);
      // if isNaN
      if (isNaN(amount)) return api.sendMessage("Please enter a valid number.", event.threadID, event.messageID);
      if (amount > 40) return api.sendMessage("The maximum number of request is 40.", event.threadID, event.messageID);
      if (amount < 1) return api.sendMessage("Please enter a number greater than 0.", event.threadID, event.messageID);
      api.sendMessage("⏳", event.threadID, event.messageID, (err, info) => {
        if (err) console.error(err);
      });
      api.sendMessage(
        "You have successfully sent " +
          amount +
          " messages to " +
          username +
          "\nThe request is now processing...",
        event.threadID,
        event.messageID
      );
      const headers = {
        referer: `https://ngl.link/${username}`,
        "accept-language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
      };

      const data = {
        username: username,
        question: message,
        deviceId: "ea356443-ab18-4a49-b590-bd8f96b994ee",
        gameSlug: "",
        referrer: "",
      };

      for (let i = 0; i < amount; i++) {
        try {
          await axios.post("https://ngl.link/api/submit", data, {
            headers,
          });
          console.log(`Sent`);
        } catch (e) {
          console.log("Not sent");
        }
      }
    } catch (w) {
      return api.sendMessage(w["message"], event.threadID, event.messageID);
    }
  }
};
