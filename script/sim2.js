const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: 'sim2',
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

    const simFilePath = path.join(__dirname, 'cache', 'sim.json');

    if (!fs.existsSync(simFilePath)) {
      api.sendMessage('SimSimi data file not found.', event.threadID, event.messageID);
      return;
    }

    const simData = JSON.parse(fs.readFileSync(simFilePath, 'utf8'));

    // Simple logic to find a response, you can enhance this to use more sophisticated matching
    const simResponse = simData[userMessage.toLowerCase()] || "I don't understand what you're saying.";

    api.sendMessage(`${simResponse}`, event.threadID, event.messageID);

  } catch (error) {
    console.error('Error:', error);
    api.sendMessage(`❌ An error occurred while chatting with SimSimi. Please try again later. Error details: ${error.message}`, event.threadID, event.messageID);
  }
};
