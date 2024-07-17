const axios = require('axios');

module.exports.config = {
  name: 'sumi',
  version: '1.0.0',
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: "Ask Sumi a question",
  usage: "sumi [prompt]",
  credits: 'LiANE @nealianacagara',
  cooldown: 0,
};

module.exports.run = async ({ api, event, args }) => {
  try {
    const input = args.join(' ') || 'hello';
    const { name } = await api.getUserInfo(event.senderID);

    if (input) {
      api.setMessageReaction("⏳", event.messageID, (err) => {}, true);
      api.sendTypingIndicator(event.threadID, true);

      const apiUrl = `https://liaspark.chatbotcommunity.ltd/@LianeAPI_Reworks/api/sumi?userName=${encodeURIComponent(name)}&key=j86bwkwo-8hako-12C&query=${encodeURIComponent(input)}`;
      const response = await axios.get(apiUrl);

      if (response.data && response.data.message) {
        const trimmedMessage = response.data.message.trim();
        api.unsendMessage(event.messageID);
        api.sendMessage(trimmedMessage, event.threadID, event.messageID);
        api.setMessageReaction("✅", event.messageID, (err) => {}, true);
        console.log(`Sent Sumi's response to the user`);
      } else {
        throw new Error(`Invalid or missing response from Sumi API`);
      }
    }
  } catch (error) {
    console.error(`Failed to get Sumi's response: ${error.message}`);
    api.sendMessage(`An error occurred. You can try typing your query again or resending it. There might be an issue with the server that's causing the problem, and it might resolve on retrying.`, event.threadID, event.messageID);
  }
};
