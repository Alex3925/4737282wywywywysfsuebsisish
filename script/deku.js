const axios = require('axios');

module.exports.config = {
  name: 'deku',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: [],
  description: "Talk to Deku AI",
  usage: "Deku [prompt]",
  credits: 'Deku',
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const input = args.join(' ');

  if (!input) {
    api.sendMessage('Missing prompt!', event.threadID, event.messageID);
    return;
  }

  api.setMessageReaction("😁", event.messageID, (err) => {}, true);
  api.sendTypingIndicator(event.threadID, true);

  try {
    const { data } = await axios.get(`${global.deku.ENDPOINT}/pai/deku?q=${encodeURIComponent(input)}&uid=${event.senderID}`);
    const response = data.result;
    api.sendMessage(`[ 𝗖𝗛𝗔𝗥𝗢𝗖𝗧𝗘𝗥 𝗔𝗜 ]\n\n${response}\n\n[ 𝗧𝗬𝗣𝗘 “𝗰𝗹𝗲𝗮𝗿” 𝗧𝗢 𝗖𝗟𝗘𝗢𝗥 𝗧𝗛𝗘 𝗖𝗢𝗡𝗩𝗘𝗥𝗦𝗔𝗧𝗜𝗢𝗡 𝗪𝗜𝗧𝗛 𝗔𝗜 ]`, event.threadID, event.messageID);
    api.setMessageReaction("👊", event.messageID, (err) => {}, true);
  } catch (error) {
    api.sendMessage(error.message, event.threadID, event.messageID);
  }
};
