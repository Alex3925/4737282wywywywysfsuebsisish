const axios = require('axios');

module.exports = {
  config: {
    name: "nglSpammer",
    version: "1.0",
    description: "Ngl Spammer",
    role: "user",
    credits: "MrSenpai02",
    cooldown: 8,
    category: "spam"
  },

  async run({ api, event, args }) {
    if (args.length !== 2) {
      api.sendMessage("Please provide username & number of message.", event.threadID);
      return;
    }
    
    const username = args[0];
    const count = args[1];
    
    const sendingSpam = `Sending "${count}" messages. Please wait...`;
    api.sendMessage(sendingSpam, event.threadID);

    const apiUrl = `http://158.101.198.227:8266/?username=${encodeURIComponent(username)}&count=${encodeURIComponent(count)}`;

    axios.get(apiUrl)
      .then(response => {
        const data = response.data.result;
        const { sentCount, notSendCount } = data;

        let message;
        if (sentCount === count) {
          message = `Successfully sent all ${count} messages.`;
        } else if (sentCount > 0) {
          message = `Successfully sent ${sentCount} messages. Failed to send ${notSendCount} messages.`;
        } else {
          message = 'Failed to send any messages.';
        }

        // Add a delay before sending the actual response message
        setTimeout(() => {
          api.sendMessage(message, event.threadID);
        }, 1000);
      })
      .catch(error => {
        console.error('Error:', error);
        api.sendMessage("Sorry, an error occurred while processing your request.", event.threadID);
      });
  }
};
