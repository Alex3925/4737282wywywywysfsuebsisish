module.exports = {
  config: {
    name: "boxai",
    version: "1.0",
    description: "Talk to Blackbox AI",
    category: "Utilities",
    role: 0,
    author: "Deku",
    usage: 'boxai [prompt]',
  },

  async run({ api, event, args }) {
    const axios = require("axios");
    try {
      let ask = args.join(" ");
      if (!ask) return api.sendMessage("Missing prompt!", event.threadID, event.messageID);
      api.sendMessage("Searching your question please wait...", event.threadID, (err, info) => {
        if (err) return api.sendMessage(err.message, event.threadID, event.messageID);
        const heru = info.messageID;
        axios.get("https://joshweb.click/api/blackboxai?q=" + encodeURIComponent(ask) + "&uid=" + event.senderID)
          .then(response => {
            const rest = response.data;
            api.editMessage('🤖 | 𝐁𝐥𝐚𝐜𝐤𝐛𝐨𝐱 𝐀𝐈 𝐑𝐞𝐬𝐩𝐨𝐧𝐬𝐞\n━━━━━━━━━━━━━━━━━━\n' + rest.result + '\n━━━━━━━━━━━━━━━━━━\nType "blackbox clear" if you want to clear conversation with blackbox', heru);
          })
          .catch(error => {
            api.sendMessage(error.message, event.threadID, event.messageID);
          });
      });
    } catch (e) {
      return api.sendMessage(e.message, event.threadID, event.messageID);
    }
  }
};
