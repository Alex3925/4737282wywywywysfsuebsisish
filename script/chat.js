module.exports.config = {
  name: 'chat',
  version: '1.0',
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: 'Command to turn on/off chat',
  usage: 'chat [on/off]',
  credits: 'Mt'
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, senderID, messageID } = event;
  const { role } = event.senderID;

  if (args[0] === 'on') {
    if (role < 1) {
      return api.sendMessage('You do not have permission to use this command!', threadID, messageID);
    }

    global.zenLeaf[threadID] = global.zenLeaf[threadID] || {};
    global.zenLeaf[threadID].chatEnabled = true;
    api.sendMessage('Chat off is now disabled. Members can now freely chat.', threadID, messageID);
  } else if (args[0] === 'off') {
    if (role < 1) {
      return api.sendMessage('You do not have permission to use this command!', threadID, messageID);
    }

    global.zenLeaf[threadID] = global.zenLeaf[threadID] || {};
    global.zenLeaf[threadID].chatEnabled = false;
    api.sendMessage('Chat off enabled. Members who chat will be kicked🫵😼.', threadID, messageID);
  }
};

module.exports.handleEvent = async function({ api, event }) {
  const { threadID, senderID, messageID } = event;
  const { role } = event.senderID;
  const chatEnabled = global.zenLeaf[threadID]?.chatEnabled?? true;

  if (!chatEnabled) {
    if (role < 1) {
      // Kick user if chat is disabled
      api.removeUserFromGroup(senderID, threadID, (err) => {
        if (err) {
          console.error(err);
        }
      });
      api.sendMessage('😼 CHAT DETECTED | The group is currently on chat off. You have been kicked from the group.', threadID, messageID);
    }
  }
};
