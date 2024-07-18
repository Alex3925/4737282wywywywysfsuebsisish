module.exports.config = {
  name: "shoticron",
  version: "1.0.0",
  role: 0,
  credits: "Alex",
  description: "Generate a random tiktok video per 1 hour.",
  usages: "[]",
  cooldown: 0,
  hasPrefix: false,
};

let autoExecute = true; // flag to turn on/off auto execute

module.exports.run = async ({ api, event, args }) => {
  // ...
};

setInterval(async () => {
  if (autoExecute) {
    api.sendMessage("AUTO SHOTI SENT 🥵", event.threadID, event.messageID);
    module.exports.run({ api, event, args: [] });
  }
}, 3600000); // 1 hour interval

// command to turn on/off auto execute
module.exports.handleEvent = async ({ api, event }) => {
  if (event.body === 'shoticron on') {
    autoExecute = true;
    api.sendMessage('Auto execute turned on!', event.threadID, event.messageID);
  } else if (event.body === 'shoticron off') {
    autoExecute = false;
    api.sendMessage('Auto execute turned off!', event.threadID, event.messageID);
  }
};
