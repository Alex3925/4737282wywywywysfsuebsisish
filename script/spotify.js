const axios = require("axios");
const fs = require('fs-extra');
const { getStreamFromURL, shortenURL, randomString } = global.utils;

module.exports = {
  info: {
    name: "spotify",
    version: "1.0",
    author: "Vex_Kshitiz",
    cooldowns: 10,
    role: 0,
    shortDescription: "play song from spotify",
    longDescription: "play song from spotify",
    category: "music",
    guide: "{pn} sing songname"
  },

  async execute({ api, event, args }) {
    api.setMessageReaction("🕢", event.messageID, (err) => {}, true);
    try {
      let songName = '';

      const getSongNameFromAttachment = async () => {
        const attachment = event.messageReply.attachments[0];
        if (attachment.type === "audio" || attachment.type === "video") {
          const shortenedURL = await shortenURL(attachment.url);
          const response = await axios.get(`https://audio-recon-ahcw.onrender.com/kshitiz?url=${encodeURIComponent(shortenedURL)}`);
          return response.data.title;
        } else {
          throw new Error("Invalid attachment type.");
        }
      };

      if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
        songName = await getSongNameFromAttachment();
      } else if (args.length === 0) {
        throw new Error("Please provide a song name.");
      } else {
        songName = args.join(" ");
      }

      const response = await axios.get(`https://spotify-play-iota.vercel.app/spotify?query=${encodeURIComponent(songName)}`);
      const trackURLs = response.data.trackURLs;
      if (!trackURLs || trackURLs.length === 0) {
        throw new Error("No track found for the provided song name.");
      }

      const trackURL = trackURLs[0];
      const downloadResponse = await axios.get(`https://sp-dl-bice.vercel.app/spotify?id=${encodeURIComponent(trackURL)}`);
      const downloadLink = downloadResponse.data.download_link;

      const filePath = await downloadTrack(downloadLink);

      const shortenedDownloadLink = await shortenURL(downloadLink);

      api.sendMessage({
        body: `🎧 Playing: ${songName}`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID);

      console.log("Audio sent successfully.");

    } catch (error) {
      console.error("Error occurred:", error);
      api.sendMessage(`An error occurred: ${error.message}`, event.threadID);
    } finally {
    
    }
  }
};

async function downloadTrack(url) {
  const stream = await getStreamFromURL(url);
  const filePath = `${__dirname}/tmp/${randomString()}.mp3`;
  const writer = fs.createWriteStream(filePath);
  stream.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(filePath));
    writer.on('error', reject);
  });
}
