module.exports.config = {
  name: 'tempmail',
  version: '1.0',
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: 'retrieve emails and inbox messages',
  usage: 'tempmail gen\n tempmail inbox (email)',
  credits: 'ARN' //convert by Alex
};

const axios = require("axios");

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const command = args[0];

  if (command === "gen") {
    try {
      const response = await axios.get("https://for-devs.onrender.com/api/mail/gen?apikey=api1");
      const email = response.data.email;
      api.sendMessage(`𝗀𝖾𝗇𝖾𝗋𝖺𝗍𝖾𝖽 𝖾𝗆𝖺𝗂𝗅✉️: ${email}\n𝖼𝗁𝖾𝖼𝗄 𝗒𝗈𝗎𝗋 𝖾𝗆𝖺𝗂𝗅📬: -𝗍𝖾𝗆𝗉𝗆𝖺𝗂𝗅 𝗂𝗇𝖻𝗈𝗑 (𝖾𝗆𝖺𝗂𝗅)`, threadID, messageID);
    } catch (error) {
      console.error(error);
      api.sendMessage("Failed to generate email.", threadID, messageID);
    }
  } else if (command === "inbox") {
    const email = args[1];

    if (!email) {
      api.sendMessage("𝖯𝗋𝗈𝗏𝗂𝖽𝖾 𝖺𝗇 𝖾𝗆𝖺𝗂𝗅 𝖺𝖽𝖽𝗋𝖾𝗌𝗌 𝖿𝗈𝗋 𝗍𝗁𝖾 𝗂𝗇𝖻𝗈𝗑.", threadID, messageID);
      return;
    }

    try {
      const inboxResponse = await axios.get(`https://for-devs.onrender.com/api/mail/inbox?email=${email}&apikey=api1`);
      const inboxMessages = inboxResponse.data;

      const formattedMessages = inboxMessages.map((message) => {
        return `${message.date} - From: ${message.sender}\n${message.message}`;
      });

      api.sendMessage(`𝗂𝗇𝖻𝗈𝗑 𝗆𝖾𝗌𝗌𝖺𝗀𝖾 𝖿𝗈𝗋 ${email}:\n\n${formattedMessages.join("\n\n")}\n\nOld messages will be deleted after some time.`, threadID, messageID);

    } catch (error) {
      console.error(error);
      api.sendMessage("𝖥𝖺𝗂𝗅𝖾𝖽 𝗍𝗈 𝗋𝖾𝗍𝗋𝗂𝖾𝗏𝖾 𝗂𝗇𝖻𝗈𝗑 𝗆𝖾𝗌𝗌𝖺𝗀𝖾.", threadID, messageID);
    }
  } else {
    api.sendMessage("Invalid command. Use tempmail gen or tempmail inbox (email).", threadID, messageID);
  }
};
