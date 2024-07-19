module.exports.config = {
  name: 'chat',
  version: '1.0',
  role: 0,
  author: 'Alex (orig.. Analeah)',
  description: 'Command to turn on/off chat',
  usage: 'chat <on/off>',
  cooldowns: 5,
  category: 'box chat'
};

module.exports.run = async function({ api, event, args }) {
  if (args[0] === 'on') {
    if (event.senderID !== event.adminIDs[0]) {
      api.sendMessage('You do not have permission to use this command!', event.threadID, event.messageID);
      return;
    }
    
    global.data.threadData[event.threadID].chatEnabled = true;
    api.sendMessage('Chat off is now disabled. Members can now freely chat.', event.threadID, event.messageID);
  } else if (args[0] === 'off') {
    if (event.senderID !== event.adminIDs[0]) {
      api.sendMessage('You do not have permission to use this command!', event.threadID, event.messageID);
      return;
    }
    
    global.data.threadData[event.threadID].chatEnabled = false;
    api.sendMessage('Chat off enabled. Members who chat will be kicked.', event.threadID, event.messageID);
  }
};

module.exports.handleEvent = async function({ api, event }) {
  if (global.data.threadData[event.threadID]?.chatEnabled === false) {
    if (event.senderID !== event.adminIDs[0]) {
      // Kick user if chat is disabled
      api.kickUser(event.senderID, event.threadID, (err) => {
        if (err) {
          console.error(err);
        }
      });
      api.sendMessage('CHAT DETECTED | The group is currently on chat off. You have been kicked from the group.', event.threadID, event.messageID);
    }
  }
};
