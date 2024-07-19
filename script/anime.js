const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  info: {
    name: 'anime',
    version: '1.0',
    author: 'Kshitiz',
    cooldowns: 20,
    role: 0,
    shortDescription: 'Anime recommendations by genre',
    longDescription: '',
    category: 'media',
    guide: {
      en: '{p}anime {genre}:- shonen | seinen | isekai',
    }
  },

  async execute({ api, event, args }) {
    const messageBody = event.body.toLowerCase().trim();
    if (messageBody === 'anime') {
      await api.sendMessage('Please specify genre.\n{p}anime {genre}:- shonen | seinen | isekai', event.threadID);
      return;
    }

    let genre;
    if (messageBody.includes('shonen')) {
      genre = 'shonen';
    } else if (messageBody.includes('seinen')) {
      genre = 'seinen';
    } else if (messageBody.includes('isekai')) {
      genre = 'isekai';
    } else {
      await api.sendMessage('Please specify genre.\n{p}anime {genre}:- shonen | seinen | isekai', event.threadID);
      return;
    }

    try {
      const loadingMessage = await api.sendMessage('𝗟𝗢𝗔𝗗𝗜𝗡𝗚 𝗥𝗔𝗡𝗗𝗢𝗠 𝗔𝗡𝗜𝗠𝗘 𝗥𝗘𝗖𝗢𝗠𝗠𝗘𝗡𝗗𝗔𝗧𝗜𝗢𝗡..', event.threadID);

      const apiUrl = `https://anime-reco.vercel.app/anime?genre=${genre}`;
      const response = await axios.get(apiUrl);

      if (response.data.anime && response.data.videoLink) {
        const animeName = response.data.anime;
        const videoUrl = response.data.videoLink;

        console.log(`${animeName}`);
        console.log(`${videoUrl}`);

        const cacheFilePath = __dirname + `/cache/anime_${Date.now()}.mp4`;
        await this.downloadVideo(videoUrl, cacheFilePath);

        if (fs.existsSync(cacheFilePath)) {
          await api.sendMessage({
            body: `𝗥𝗘𝗖𝗢𝗠𝗠𝗘𝗡𝗗𝗘𝗗 𝗔𝗡𝗜𝗠𝗘 : ${animeName}`,
            attachment: fs.createReadStream(cacheFilePath),
          }, event.threadID);

          fs.unlinkSync(cacheFilePath);
        } else {
          api.sendMessage("Error downloading the video.", event.threadID);
        }
      } else {
        api.sendMessage("API CHALENA MUJI(API ISSUE)", event.threadID);
      }

      await api.unsendMessage(loadingMessage.messageID);
    } catch (err) {
      console.error(err);
      api.sendMessage("An error occurred while processing the anime command.", event.threadID);
    }
  },

  async downloadVideo(url, cacheFilePath) {
    try {
      const response = await axios({
        method: "GET",
        url: url,
        responseType: "stream"
      });

      const writer = fs.createWriteStream(cacheFilePath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } catch (err) {
      console.error(err);
    }
  },
};
