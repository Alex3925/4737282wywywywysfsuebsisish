const fs = require('fs-extra');

module.exports = {
  config: {
    name: 'restart',
    version: '2.0',
    role: 2, // Accessible by owner
    cooldown: 5,
    description: {
      vi: 'Khởi động lại bot',
      en: 'Restart bot',
    },
    usages: '{pn} Restart',
  },
  languages: {
    vi: {
      restarting: '|Khởi động lại bot...',
    },
    en: {
      restarting: '|Restarting bot...',
    },
  },

  onLoad: async ({ api }) => {
    const pathFile = `${__dirname}/tmp/restart.txt`;
    if (fs.existsSync(pathFile)) {
      const [tid, time] = fs.readFileSync(pathFile, 'utf-8').split(' ');
      api.sendMessage(` |Bot restarted\ime: ${(Date.now() - time) / 1000}s`, tid);
      fs.unlinkSync(pathFile);
    }
  },

  run: async ({ api, event, args, getLang, react }) => {
    const pathFile = `${__dirname}/tmp/restart.txt`;
    fs.writeFileSync(pathFile, `${event.threadID} ${Date.now()}`);
    api.sendMessage(getLang('restarting'), event.threadID, event.messageID);
    react('⏳');
    process.exit(2);
  },
};
