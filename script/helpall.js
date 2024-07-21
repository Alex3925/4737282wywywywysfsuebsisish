module.exports = {
  config: {
    name: "helpall",
    version: "1.17",
    description: "View command usage",
    category: "info",
    usage: '{pn} / help [cmdName]',
    role: 0,
  },

  async run({ api, event, args }) {
    const { threadID } = event;
    const prefix = await getPrefix(threadID);

    if (args.length === 0) {
      const categories = {};
      let msg = "";

      msg += `╔══════════════╗\n      𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦\n╚══════════════╝`;

      for (const [name, value] of commands) {
        if (value.config.role > 1 && event.senderID.role < value.config.role) continue;

        const category = value.config.category || "Uncategorized";
        categories[category] = categories[category] || { commands: [] };
        categories[category].commands.push(name);
      }

      Object.keys(categories).forEach(category => {
        if (category !== "info") {
          msg += `\n╭────────────⭓\n│『 ${category.toUpperCase()} 』`;

          const names = categories[category].commands.sort();
          for (let i = 0; i < names.length; i += 1) {
            const cmds = names.slice(i, i + 1).map(item => `│★${item}`);
            msg += `\n${cmds.join(" ".repeat(Math.max(0, 5 - cmds.join("").length)))}`;
          }

          msg += `\n╰────────⭓`;
        }
      });

      const totalCommands = commands.size;
      msg += `\n𝙲𝚞𝚛𝚛𝚎𝚗𝚝𝚕𝚢, 𝚃𝚑𝚒𝚜 𝚋𝚘𝚝 𝚑𝚊𝚟𝚎  ${totalCommands} 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜 𝚝𝚑𝚊𝚝 𝚌𝚊𝚗 𝚋𝚎 𝚞𝚜𝚎𝚍. 𝚂𝚘𝚘𝚗 𝚖𝚘𝚛𝚎 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜 𝚠𝚒𝚕𝚕 𝚋𝚎 𝚊𝚍𝚍𝚎𝚍\n`;
      msg += `𝚃𝚢𝚙𝚎 ${prefix}𝚑𝚎𝚕𝚙 𝚌𝚘𝚖𝚖𝚊𝚗𝚍 𝙽𝚊𝚖𝚎 𝚝𝚘 𝚟𝚒𝚎𝚠 𝚝𝚑𝚎 𝚍𝚎𝚝𝚊𝚒𝚕𝚜 𝚘𝚏 𝚝𝚑𝚊𝚝 𝚌𝚘𝚖𝚖𝚊𝚗𝚍\n`;
      msg += `𝙵𝙾𝚁 𝙰𝙽𝚈 𝙾𝚃𝙷𝙴𝚁 𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝚃𝙸𝙾𝙽 𝙲𝙾𝙽𝚃𝙰𝙲𝚃 𝙾𝚆𝙽𝙴𝚁 𝙱𝚈 𝚃𝚈𝙿𝙸𝙽𝙶 ${prefix}𝙲𝙰𝙻𝙻𝙰𝙳`;

      const helpListImages = [
        "https://i.imgur.com/VYssPQ7.gif",
        "https://i.imgur.com/VYssPQ7.gif",
        "https://i.imgur.com/VYssPQ7.gif",
        "https://i.imgur.com/VYssPQ7.gif",
        "https://i.imgur.com/RrRNARq.gif",
        "https://i.imgur.com/jBd6fgF.gif",
        "https://i.imgur.com/uB4nTr7.gif"
      ];

      const helpListImage= helpListImages[Math.floor(Math.random() * helpListImages.length)];

      await api.sendMessage({
        body: msg,
        attachment: await global.utils.getStreamFromURL(helpListImage)
      }, event.threadID);
    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        return api.sendMessage(`Command "${commandName}" not found.`, event.threadID);
      }

      const configCommand = command.config;
      const roleText = roleTextToString(configCommand.role);
      const author = configCommand.author || "Unknown";

      const longDescription = configCommand.longDescription ? configCommand.longDescription.en || "No description" : "No description";

      const guideBody = configCommand.guide?.en || "No guide available.";
      const usage = guideBody.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name);

      const response = `╭── NAME ────⭓
  │ ${configCommand.name}
  ├── INFO
  │ Description: ${longDescription}
  │ Other names: ${configCommand.aliases ? configCommand.aliases.join(", ") : "Do not have"}
  │ Other names in your group: Do not have
  │ Version: ${configCommand.version || "1.0"}
  │ Role: ${roleText}
  │ Time per command: ${configCommand.countDown || 1}s
  │ Author: ${author}
  ├── Usage
  │ ${usage}
  ├── Notes
  │ The content inside <XXXXX> can be changed
  │ The content inside [a|b|c] is a or b or c
  ╰━━━━━━━❖`;

      await api.sendMessage(response, event.threadID);
    }
  },
};

function roleTextToString(roleText) {
  switch (roleText) {
    case 0:
      return "0 (All users)";
    case 1:
      return "1 (Group administrators)";
    case 2:
      return "2 (Admin bot)";
    default:
      return "Unknown role";
  }
}
