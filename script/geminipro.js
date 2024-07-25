const axios = require('axios');

module.exports.config = {
    name: "geminipro",
    role: 0,
    credits: "chill", //convert by Alex
    description: "Interact with Gemini",
    hasPrefix: false,
    version: "1.0.0",
    aliases: ["gemini"],
    usage: "gemini [reply to photo]",
    cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
    const prompt = args.join(" ");

    if (!prompt) {
        return api.sendMessage('This command only works with a photo.', event.threadID, event.messageID);
    }

    if (event.type !== "message_reply" || !event.messageReply.attachments[0] || event.messageReply.attachments[0].type !== "photo") {
        return api.sendMessage('Please reply to a photo with this command.', event.threadID, event.messageID);
    }

    const url = encodeURIComponent(event.messageReply.attachments[0].url);
    api.sendTypingIndicator(event.threadID, true);

    try {
        await api.sendMessage('👽 𝑮𝑬𝑴𝑰𝑵𝑰\n━━━━━━━━━━━━━━━━━━\nGemini recognizing picture, please wait...\n━━━━━━━━━━━━━━━━━━', event.threadID);

        const response = await axios.get(`https://joshweb.click/gemini?prompt=${encodeURIComponent(prompt)}&url=${url}`);
        const description = response.data.gemini;

        return api.sendMessage(`👽 𝑮𝑬𝑴𝑰𝑵𝑰\n━━━━━━━━━━━━━━━━━━\n${description}\n━━━━━━━━━━━━━━━━━━`, event.threadID, event.messageID);
    } catch (error) {
        console.error(error);
        return api.sendMessage('❌ | An error occurred while processing your request.', event.threadID, event.messageID);
    }
};
