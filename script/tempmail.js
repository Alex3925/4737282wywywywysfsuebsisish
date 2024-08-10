const axios = require("axios");

module.exports.config = {

  name: "tempmail",

  aliases: ["tm"],

  version: "1.0.0",

  author: "Akimitsu",

  role: 0,

  countDown: 5,

  description: "Generate temporary email and check inbox",

  commandCategory: "email",

  usages: "<subcommand> [email]",

  cooldowns: 0,

  hasPrefix: true,

  guide: {

    en: "{p}tempmail <subcommand>\n\nFor Example:\n{p}tempmail gen\n{p}tempmail inbox <tempmail>",

    vi: "{p}tempmail <lệnh con>\n\nVí dụ:\n{p}tempmail gen\n{p}tempmail inbox <email tạm thời>"

  }

};

module.exports.run = async function ({ api, event, args }) {

  try {

    if (args[0].toLowerCase() === "gen") {

      const response = await axios.get("https://king-aryanapis.onrender.com/api/tempmail/get");

      const responseData = response.data.tempmail;

      const message = `📮 | 𝗧𝗲𝗺𝗽𝗺𝗮𝗶𝗹\n━━━━━━━━━━━━━\n\n𝖧𝖾𝗋𝖾 𝗂𝗌 𝗒𝗈𝗎𝗋 𝗀𝖾𝗇𝖾𝗋𝖺𝗍𝖾𝖽 𝗍𝖾𝗆𝗉𝗆𝖺𝗂𝗅\n\n📍 | 𝗘𝗺𝗮𝗶𝗹\n➤ ${responseData}`;

      await api.sendMessage(message, event.threadID, event.messageID);

    } else if (args[0].toLowerCase() === "inbox" && args.length === 2) {

      const email = args[1];

      try {

        const response = await axios.get(`https://king-aryanapis.onrender.com/api/tempmail/inbox?email=${email}`);

        const data = response.data;

        if (data.length === 0) {

          const message = "📭 | 𝗜𝗻𝗯𝗼𝘅 𝗠𝗲𝘀𝘀𝗮𝗴𝗲\n━━━━━━━━━━━━━━━\n\n𝖸𝗈𝗎𝗋 𝗍𝖾𝗆𝗉𝗆𝖺𝗂𝗅 𝗂𝗇𝗉𝗈𝗑 𝗂𝗌 𝖼𝗎𝗋𝗋𝖾𝗇𝗍𝗅𝗒 𝖾𝗆𝗽𝗍𝗒.";

          await api.sendMessage(message, event.threadID, event.messageID);

        } else {

          const inboxMessages = data.map(({ from, subject, body, date }) => 

            `📬 | 𝗧𝗲𝗺𝗽𝗺𝗮𝗶𝗹 𝗜𝗻𝗯𝗼𝘅\n━━━━━━━━━━━━━━━\n\n🔎 𝗙𝗿𝗼𝗺\n${from}\n📭 𝗦𝘂𝗯𝗷𝗲𝗰𝘁\n➤ ${subject || 'Not Found'}\n\n📝 𝗠𝗲𝘀𝘀𝗮𝗴𝗲\n➤ ${body}\n🗓 𝗗𝗮𝘁𝗲\n➤ ${date}`).join('\n\n');

          await api.sendMessage(inboxMessages, event.threadID, event.messageID);

        }

      } catch (error) {

        console.error("🔴 Error", error);

        await api.sendMessage("❌ | Can't retrieve emails. Please try again later.", event.threadID, event.messageID);

      }

    } else {

      const message = "❌ | Use 'Tempmail gen' to generate email and 'Tempmail inbox {email}' to check inbox emails.";

      await api.sendMessage(message, event.threadID, event.messageID);

    }

  } catch (error) {

    console.error("❌ | Error", error);

    await api.sendMessage("❌ | An error occurred. Please try again later.", event.threadID, event.messageID);

  }

};
