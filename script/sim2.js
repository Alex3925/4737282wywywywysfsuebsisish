module.exports.config = {
  name: 'sim2',
  version: '1.0.0',
  role: 0,
  aliases: ['Sim2'],
  credits: 'jerome',
  description: 'Talk to sim',
  cooldown: 0,
  hasPrefix: false
};

module.exports.run = async function({ api, event, args }) {
  const axios = require('axios');
  const { threadID, messageID, senderID, body } = event;
  const content = encodeURIComponent(args.join(' '));

  if (!args[0]) {
    api.sendMessage('Please type a message...', threadID, messageID);
    return;
  }

  try {
    const res = await axios.get(`https://simsimi-api-pro.onrender.com/sim?query=${content}`);
    const respond = res.data.respond;

    if (res.data.error) {
      api.sendMessage(`Error: ${res.data.error}`, threadID, messageID);
    } else {
      api.sendMessage(respond, threadID, messageID);
    }
  } catch (error) {
    console.error(error);
    api.sendMessage('An error occurred while fetching the data.', threadID, messageID);
  }
};
