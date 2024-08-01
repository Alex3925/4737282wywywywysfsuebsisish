const axios = require('axios');

module.exports.config = {
  name: 'sim',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: [],
  description: "Chat with SimSimi",
  usage: "Sim [message]",
  credits: 'Jerome | Duke Agustin', //converted By AI
  cooldown: 5,
};

module.exports.run = async function({ api, event, args }) {
  try {
    const userMessage = args.join(' ');

    if (!userMessage) {
      api.sendMessage('Please provide a message to chat with SimSimi.', event.threadID, event.messageID);
      return;
    }

    const apiUrl = `https://simsimi-api-pro.onrender.com/sim?query=${encodeURIComponent(userMessage)}`;
    
    const response = await axios.get(apiUrl);

    if (response.data && response.data.respond) {
      const simResponse = response.data.respond;
      api.sendMessage(`${simResponse}`, event.threadID, event.messageID);
    } else {
      console.error('API response did not contain expected data:', response.data);
      api.sendMessage('❌ An error occurred while chatting with SimSimi. Please try again later.', event.threadID, event.messageID);
    }
  } catch (error) {
    console.error('Error:', error);
    api.sendMessage(`❌ An error occurred while chatting with SimSimi. Please try again later. Error details: ${error.message}`, event.threadID, event.messageID);
  }
};
