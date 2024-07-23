const fs = require('fs-extra');

module.exports = {
  config: {
    name: 'restart',
    version: '2.0',
    role: 2, // Accessible by owner
    hasPrefix: false,
    aliases: [],
    description: 'Restart bot',
    usage: '{pn} Restart',
    cooldowns: 5,
    credits: 'Developer'
  },

  languages: {
    vi: {
      restarting: '|Khởi động lại bot...',
    },
    en: {
      restarting: '|Restarting bot...',
    },
  },

  onLoad: async ({ api, event }) => {
    const pathFile = `${__dirname}/tmp/restart.txt`;
    if (fs.existsSync(pathFile)) {
      const [tid, time] = fs.readFileSync(pathFile, 'utf-8').split(' ');
      api.sendMessage(` |Bot restarted\ime: ${(Date.now() - time) / 1000}s`, tid);
      fs.unlinkSync(pathFile);
    }
  },

  run: async ({ api, event, args, getLang }) => {
    const pathFile = `${__dirname}/tmp/restart.txt`;
    fs.writeFileSync(pathFile, `${event.threadID} ${Date.now()}`);
    api.sendMessage(getLang('restarting'), event.threadID, event.messageID);
    api.setMessageReaction("⏳", event.messageID, () => {
      process.exit(2);
    });
  },
};
