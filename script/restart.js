const fs = require('fs-extra');

module.exports = {
  config: {
    name: 'restart',
    version: '2.0',
    author: 'Hassan-',
    cooldown: 5,
    accessableby: 2, // Accessible by owner
    category: 'Owner',
    prefix: false,
    description: {
      vi: 'Khởi động lại bot',
      en: 'Restart bot',
    },
    usage: '{pn} Restart',
  },
  languages: {
    vi: {
      restarting: '|Khởi động lại bot...',
    },
    en: {
      restarting: '|Restarting bot...',
    },
  },

  onLoad: function ({ api }) {
    const pathFile = `${__dirname}/tmp/restart.txt`;
    if (fs.existsSync(pathFile)) {
      const [tid, time] = fs.readFileSync(pathFile, 'utf-8').split(' ');
      api.sendMessage(` |Bot restarted\ime: ${(Date.now() - time) / 1000}s`, tid);
      fs.unlinkSync(pathFile);
    }
  },

  start: async function ({ api, event, text, react, reply, getLang }) {
    const pathFile = `${__dirname}/tmp/restart.txt`;
    fs.writeFileSync(pathFile, `${event.threadID} ${Date.now()}`);
    await reply(getLang('restarting'));
    process.exit(2);
  },
};
