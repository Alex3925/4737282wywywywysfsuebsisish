const axios = require("axios");

module.exports.config = {
    name: "bibleverse",
    version: "1.0.0",
    role: 0,
    credits: "churchill",
    description: "Get a random Bible verse.",
    hasPrefix: true,
    aliases: ["bibleverses", "randombibleverse"],
    usage: "",
    cooldown: 5,
};

module.exports.run = async function({ api, event }) {
    api.setMessageReaction("⏳", event.messageID, (err) => {}, true);
    api.sendTypingIndicator(event.threadID, true);
    
    try {
        api.sendMessage("⏱️ | Fetching a Bible verse, please wait...", event.threadID, event.messageID);

        const response = await axios.get("https://ggwp-yyxy.onrender.com/bibles?verse=");
        const verse = response.data.verse;
        const reference = response.data.reference;

        const message = `📖 ${verse}\n- ${reference}`;

        api.sendMessage(message, event.threadID, event.messageID);
    } catch (error) {
        console.error('Error:', error);
        api.sendMessage("An error occurred while fetching the Bible verse.", event.threadID, event.messageID);
    }
};
