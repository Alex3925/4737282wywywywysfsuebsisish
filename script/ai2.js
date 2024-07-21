const axios = require('axios');

module.exports.config = {
  name: 'ai2',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['gpt', 'openai'],
  description: "An AI command powered by GPT-4",
  usage: "Ai [promot]",
  credits: 'Developer',
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {

  const input = args.join(' ');


  
  if (!input) {
    api.shareContact(`𝑯𝑬𝑳𝑳𝑶 𝑰𝑴 𝑨𝑰 

━━━━━━━━━━━━━━━

 𝑷𝑳𝑬𝑨𝑺𝑬 𝑷𝑹𝑶𝑽𝑰𝑫𝑬 𝑨 𝑸𝑼𝑬𝑺𝑻𝑰𝑶𝑵/𝑸𝑼𝑬𝑹𝒀`,api.getCurrentUserID(), event.threadID, event.messageID);
    return;
  }
  api.setMessageReaction("⏳", event.messageID, (err) => {
  }, true);
api.sendTypingIndicator(event.threadID, true);

  api.shareContact(`🔍𝙎𝙚𝙖𝙧𝙘𝙝𝙞𝙣𝙜 𝙋𝙡𝙚𝙖𝙨𝙚 𝙒𝙖𝙞𝙩....
━━━━━━━━━━━━━━━━━━\n\n "${input}"`,api.getCurrentUserID(),event.threadID, event.messageID);
  
  try {
    const { data } = await axios.get(`https://gpt4o.onrender.com/gpt4o?question=${encodeURIComponent(input)}`);
    let response = response.data;
    response += "\n\n";
    api.shareContact(response,api.getCurrentUserID(), event.threadID, event.messageID);
  } catch (error) {
    api.sendMessage('An error occurred while processing your request.', event.threadID, event.messageID);
  }
};
