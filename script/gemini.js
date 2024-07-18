module.exports = {
  config: {
    name: "gemini",
    version: "1.0.0",
    role: 0,
    credits: "Deku", //https://facebook.com/joshg101
    description: "Talk to Gemini (conversational)",
    usages: "[ask / reply to an image with ask]",
    category: "AI",
    cooldown: 0,
    hasPrefix: false
  },

  run: async ({ api, event, args }) => {
    const axios = require("axios");
    let prompt = args.join(" "),
      uid = event.senderID,
      url;
    if (!prompt) return api.sendMessage(`Please enter a prompt.`, event.threadID, event.messageID);
    api.sendMessage("✨", event.threadID, event.messageID, (err, info) => {
      if (err) console.error(err);
    });
    try {
      const apiEndpoint = global.deku.ENDPOINT;
      if (event.type == "message_reply") {
        if (event.messageReply.attachments[0]?.type == "photo") {
          url = encodeURIComponent(event.messageReply.attachments[0].url);
          const res = (await axios.get(`${apiEndpoint}/gemini?prompt=${prompt}&url=${url}&uid=${uid}`)).data;
          return api.sendMessage(res.gemini, event.threadID, event.messageID);
        } else {
          return api.sendMessage('Please reply to an image.', event.threadID, event.messageID);
        }
      }
      const rest = (await axios.get(`${apiEndpoint}/new/gemini?prompt=${encodeURI(prompt)}`)).data;
      return api.sendMessage(rest.result.data, event.threadID, event.messageID);
    } catch (e) {
      console.log(e);
      return api.sendMessage(e.message, event.threadID, event.messageID);
    }
  }
};
