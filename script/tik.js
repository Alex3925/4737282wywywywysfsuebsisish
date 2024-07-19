const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "tiktok",
    description: "Search for TikTok videos",
    usage: "tiktok <search>",
    cooldown: 5,
    accessableby: 0, // Accessible to everyone
    category: "Entertainment",
    prefix: false,
    author: "heru",
  },
  start: async function({ api, event, text, react, reply }) {
    try {
      const searchQuery = text.join(" ");
      if (!searchQuery) {
        return reply("Usage: tiktok <search text>");
      }

      react("⏱️");
      const ronapretty = await new Promise(resolve => {
        api.sendMessage('Searching, please wait...', event.threadID, (err, info) => {
          resolve(info);
        });
      });

      const response = await axios.get(`https://markdevs69-1efde24ed4ea.herokuapp.com/api/tiksearch?search=${encodeURIComponent(searchQuery)}`);
      const videos = response.data.data.videos;

      if (!videos || videos.length === 0) {
        return reply('No videos found for the given search query.');
      }

      const videoData = videos[0];
      const videoUrl = videoData.play;

      const message = `𝐓𝐢𝐤𝐭𝐨𝐤 𝐫𝐞𝐬𝐮𝐥𝐭:\n\n𝐏𝐨𝐬𝐭 𝐛𝐲: ${videoData.author.nickname}\n𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞: ${videoData.author.unique_id}\n\n𝐓𝐢𝐭𝐥𝐞: ${videoData.title}`;

      const filePath = path.join(__dirname, '/cache/tiktok_video.mp4');
      const writer = fs.createWriteStream(filePath);

      const videoResponse = await axios({
        method: 'get',
        url: videoUrl,
        responseType: 'stream'
      });

      videoResponse.data.pipe(writer);

      writer.on('finish', async () => {
        react("✅");
        await api.sendMessage(
          { body: message, attachment: fs.createReadStream(filePath) },
          event.threadID,
          () => fs.unlinkSync(filePath)
        );
      });

      writer.on('error', async () => {
        react("❌");
        reply('Sorry while downloading the video.');
      });

    } catch (error) {
      console.error('Error:', error);
      react("❌");
      reply('Sorry while processing the request.');
    }
  }
};
