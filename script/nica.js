const axios = require('axios');

module.exports.config = {
  name: 'nica',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: [],
  description: "Ask Nica",
  usage: "nica [prompt]",
  credits: 'LiANE @nealianacagara',
  cooldown: 0,
};

module.exports.run = async function({ api, event, args }) {
  try {
    const input = args.join(' ');
    const { name } = await api.getUserInfo(event.senderID);

    if (!input) {
      input = 'hello';
    }

    api.setMessageReaction("⏳", event.messageID, (err) => {}, true);
    api.sendTypingIndicator(event.threadID, true);

    const apiUrl = `https://liaspark.chatbotcommunity.ltd/@LianeAPI_Reworks/api/nica?userName=${encodeURIComponent(name)}&key=j86bwkwo-8hako-12C&query=${encodeURIComponent(input)}`;
    const { data } = await axios.get(apiUrl);

    if (data && data.message) {
      const response = data.message.trim();
      api.unsendMessage(event.messageID);
      api.sendMessage(response, event.threadID, event.messageID);
    } else {
      throw new Error(`Invalid or missing response from Nica API`);
    }
  } catch (error) {
    console.error(`Failed to get Nica's response: ${error.message}`);
    api.sendMessage(`An error occurred. You can try typing your query again or resending it. There might be an issue with the server that's causing the problem, and it might resolve on retrying.`, event.threadID, event.messageID);
  }
};
