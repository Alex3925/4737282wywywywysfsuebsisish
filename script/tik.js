module.exports = {
  config: {
    name: "tiktok",
    version: "1.0",
    description: "Search for TikTok videos",
    category: "Entertainment",
    role: 0,
    author: "heru",
    usage: 'tiktok [search]',
  },

  async run({ api, event, args }) {
    const axios = require("axios");
    const fs = require("fs");
    const path = require("path");

    try {
      let searchQuery = args.join(" ");
      if (!searchQuery) return api.sendMessage("Usage: tiktok <search text>", event.threadID, event.messageID);

      api.sendMessage("Searching, please wait...", event.threadID, (err, info) => {
        if (err) return api.sendMessage(err.message, event.threadID, event.messageID);
        const heru = info.messageID;

        axios.get(`https://markdevs69-1efde24ed4ea.herokuapp.com/api/tiksearch?search=${encodeURIComponent(searchQuery)}`)
          .then(response => {
            const videos = response.data.data.videos;

            if (!videos || videos.length === 0) {
              return api.sendMessage('No videos found for the given search query.', event.threadID, heru);
            }

            const videoData = videos[0];
            const videoUrl = videoData.play;

            const message = `𝐓𝐢𝐤𝐭𝐨𝐤 𝐫𝐞𝐬𝐮𝐥𝐭:\n\n𝐏𝐨𝐬𝐭 𝐛𝐲: ${videoData.author.nickname}\n𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞: ${videoData.author.unique_id}\n\n𝐓𝐢𝐭𝐥𝐞: ${videoData.title}`;

            const filePath = path.join(__dirname, '/cache/tiktok_video.mp4');
            const writer = fs.createWriteStream(filePath);

            axios({
              method: 'get',
              url: videoUrl,
              responseType: 'stream'
            })
              .then(videoResponse => {
                videoResponse.data.pipe(writer);

                writer.on('finish', async () => {
                  api.sendMessage(
                    { body: message, attachment: fs.createReadStream(filePath) },
                    event.threadID,
                    heru,
                    () => fs.unlinkSync(filePath)
                  );
                });

                writer.on('error', async () => {
                  api.sendMessage('Sorry while downloading the video.', event.threadID, heru);
                });
              })
              .catch(error => {
                api.sendMessage(error.message, event.threadID, heru);
              });
          })
          .catch(error => {
            api.sendMessage(error.message, event.threadID, heru);
          });
      });
    } catch (e) {
      return api.sendMessage(e.message, event.threadID, event.messageID);
    }
  }
};
