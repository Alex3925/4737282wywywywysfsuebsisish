global.zenLeaf = {};

module.exports.config = {
  name: 'chat',
  version: '1.0',
  role: 0,
  hasPrefix: false,
  aliases: [Chat],
  description: "Command to turn on/off chat",
  usage: "Chat [on/off]",
  credits: 'Annaleiah',
  cooldown: 5,
};

module.exports.run = async function({ api, event, args }) {
  if (args[0] === "on") {
    if (event.senderID!== api.getCurrentUserID()) {
      api.sendMessage("You do not have permission to use this command!", event.threadID, event.messageID);
      return;
    }
    
    const threadID = event.threadID; 
    global.zenLeaf[threadID] = global.zenLeaf[threadID] || {};
    global.zenLeaf[threadID].chatEnabled = true;
    api.sendMessage("Chat off is now disabled. Members can now freely chat.", event.threadID, event.messageID);
  } else if (args[0] === "off") {
    if (event.senderID!== api.getCurrentUserID()) {
      api.sendMessage("You do not have permission to use this command!", event.threadID, event.messageID);
      return;
    }
    
    const threadID = event.threadID; 
    global.zenLeaf[threadID] = global.zenLeaf[threadID] || {};
    global.zenLeaf[threadID].chatEnabled = false;
    api.sendMessage("Chat off enabled. Members who chat will be kicked.", event.threadID, event.messageID);
  }
};

module.exports.handleEvent = async function({ api, event }) {
  const threadID = event.threadID; 
  const chatEnabled = global.zenLeaf[threadID]?.chatEnabled?? true;

  if (!chatEnabled) {
    if (event.senderID!== api.getCurrentUserID()) {
      // Kick user if chat is disabled
      api.removeUserFromGroup(event.senderID, threadID, (err) => {
        if (err) {
          console.error(err);
        }
      });
      api.sendMessage("CHAT DETECTED | The group is currently on chat off. You have been kicked from the group.", event.threadID, event.messageID);
    }
  }
};
