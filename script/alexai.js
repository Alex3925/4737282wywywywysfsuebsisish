module.exports = {
  config: {
    name: "alexai",
    version: "1.0",
    description: "Talk to Alex AI",
    category: "AI",
    role: 0,
    author: "coffee",
    usage: 'ai [prompt]',
  },

  async run({ api, event, args }) {
    const axios = require("axios");
    try {
      let ask = args.join(" ");
      if (!ask) return api.sendMessage("Please provide a question to get an answer.", event.threadID, event.messageID);
      api.sendMessage("Searching your question please wait...", event.threadID, (err, info) => {
        if (err) return api.sendMessage(err.message, event.threadID, event.messageID);
        const heru = info.messageID;
        const services = [
          { url: 'https://markdevs-last-api.onrender.com/gpt4', params: { prompt: ask, uid: '100085861488156' } },
          { url: 'http://markdevs-last-api.onrender.com/api/v2/gpt4', params: { query: ask } },
          { url: 'https://markdevs-last-api.onrender.com/api/v3/gpt4', params: { ask: ask } }
        ];

        let sent = false;
        for (const service of services) {
          axios.get(service.url, { params: service.params })
            .then(response => {
              const rest = response.data;
              if (rest && (rest.gpt4 || rest.reply || rest.response || rest.answer || rest.message)) {
                const response = rest.gpt4 || rest.reply || rest.response || rest.answer || rest.message;
                if (!sent) {
                  api.sendMessage(
                    `⚔⚔ | Alex 𝙰𝚒\n━━━━━━━━━━━━━━━━\n${response}\n━━━━━━━━━━━━━━━━`,
                    event.threadID,
                    heru
                  );
                  sent = true;
                }
              }
            })
            .catch(error => {
              if (!sent) {
                api.sendMessage(error.message, event.threadID, event.messageID);
              }
            });
        }
      });
    } catch (e) {
      return api.sendMessage(e.message, event.threadID, event.messageID);
    }
  }
};
