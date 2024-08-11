const axios = require("axios");

module.exports.config = {
  name: "spamsms",
  version: "1.0.0",
  author: "Jun",
  cooldown: 10,
  role: 0,
  category: "utility",
  shortDescription: "Spam messages to a phone number",
  longDescription: "Spam messages by the given phone number, amount, and delay.",
  guide: "{p}smspam <phone number> <amount> <delay>"
};

module.exports.run = async function ({ api, event, args }) {
  const [number, amount, delay] = args;

  if (!number || !amount || !delay) {
    return api.sendMessage("Usage: {p}smspam <phone number> <amount> <delay in seconds>", event.threadID, event.messageID);
  }

  api.setMessageReaction("⏳", event.messageID, (err) => {}, true);
  api.sendTypingIndicator(event.threadID, true);
  api.sendMessage(`Starting SMS spam to ${number} with ${amount} messages, please wait...`, event.threadID, event.messageID);

  try {
    const response = await axios.get(`https://ggwp-yyxy.onrender.com/smsb?number=${encodeURIComponent(number)}&amount=${encodeURIComponent(amount)}&delay=${encodeURIComponent(delay)}`);
    const result = response.data;

    if (result.success) {
      api.sendMessage(`Successfully sent ${amount} messages to ${number}.`, event.threadID, event.messageID);
    } else {
      api.sendMessage(`Failed to send messages: ${result.message}`, event.threadID, event.messageID);
    }
  } catch (error) {
    console.error("Error:", error);
    api.sendMessage("An error occurred while trying to send the messages.", event.threadID, event.messageID);
  }
};
