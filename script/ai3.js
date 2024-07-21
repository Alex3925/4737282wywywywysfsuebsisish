const axios = require('axios');

module.exports.config = {
  name: 'ai',
  version: '1.0.5',
  role: 0,
  hasPrefix: false,
  aliases: ['gpt', 'openai'],
  description: "An AI command powered by GPT-4",
  usage: "Ai [question]",
  credits: 'Developer',
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const Prefixes = ['ai', 'ask', 'gpt', 'openai', '@ai']; // put here your AI names

  const prefix = Prefixes.find(p => event.body.toLowerCase().startsWith(p));
  if (!prefix) return;

  const question = event.body.slice(prefix.length).trim();
  if (!question) {
    api.sendMessage(`❓ It looks like you didn't provide a question. Please include a question after the command so I can assist you.`, event.threadID, event.messageID);
    return;
  }

  const uid = event.senderID;

  api.setMessageReaction("⏰", event.messageID, (err) => {
  }, true);
  api.sendTypingIndicator(event.threadID, true);

  try {
    const response = await axios.get(`https://king-aryanapis.onrender.com/gts/smile`, {
      params: { uid, question }
    });

    if (response.status!== 200 ||!response.data) {
      throw new Error('Invalid or missing response from API');
    }

    const answer = response.data.response;
    const processTimeSec = ((Date.now() - event.timestamp) / 1000).toFixed(2);

    if (event.isReply) {
      // Handle follow-up conversation
      const originalMessage = await api.getMessage(event.threadID, event.replyTo);
      const originalQuestion = originalMessage.body;
      api.sendMessage(`📒 𝗤𝘂𝗲𝘀𝘁𝗶𝗼𝗻: ${originalQuestion}\n━━━━━━━━━━━━━\n\n✅ 𝗔𝗻𝘀𝘄𝗲𝗿: ${answer}\n\n━━━━━━━━━━━━━\n𝗣𝗿𝗼𝗰𝗲𝘀𝘀 𝗧𝗶𝗺𝗲: ${processTimeSec} seconds`, event.threadID, event.messageID);
    } else {
      api.sendMessage(`📒 𝗤𝘂𝗲𝘀𝘁𝗶𝗼𝗻: ${question}\n━━━━━━━━━━━━━\n\n✅ 𝗔𝗻𝘀𝘄𝗲𝗿: ${answer}\n\n━━━━━━━━━━━━━\n𝗣𝗿𝗼𝗰𝗲𝘀𝘀 𝗧𝗶𝗺𝗲: ${processTimeSec} seconds`, event.threadID, event.messageID);
    }

  } catch (error) {
    api.sendMessage(`⚠️ An error occurred while processing your request. Error: ${error.message}${error.response? `, Status Code: ${error.response.status}` : ''}. Please try again later.`, event.threadID, event.messageID);
  }
};
