module.exports = {
  config: {
    name: "boxai",
    description: "Talk to Blackbox AI",
    prefix: false,
    accessableby: 0,
    category: "Utilities",
    author: "Deku",
  },
  start: async function({ api, event, text, react, reply, getLang }) {
    const axios = require("axios");
    try {
      let ask = text.join(" ");
      if (!ask) return reply("Missing prompt!");
      react("⏳");
      const heru = await api.sendMessage('Searching your question please wait...', event.threadID);

      const rest = (
        await axios.get("https://joshweb.click/api/blackboxai?q=" + encodeURIComponent(ask) + "&uid=" + event.senderID)
      ).data;

      react("✅");
      await api.editMessage('🤖 | 𝐁𝐥𝐚𝐜𝐤𝐛𝐨𝐱 𝐀𝐈 𝐑𝐞𝐬𝐩𝐨𝐧𝐬𝐞\n━━━━━━━━━━━━━━━━━━\n' + rest.result + '\n━━━━━━━━━━━━━━━━━━\nType "blackbox clear" if you want to clear conversation with blackbox', heru.messageID);
    } catch (e) {
      return reply(e.message);
    }
  }
};
