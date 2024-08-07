const axios = require("axios");
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "ytb",
  version: "1.0",
  author: "Jun",
  cooldown: 10,
  role: 0,
  category: "media",
  shortDescription: "Search and download YouTube videos",
  longDescription: "Search for YouTube music or video and download the first result or select a specific track.",
  guide: "{p}ytb music|video <title>"
};

module.exports.run = async function ({ api, event, args }) {
  const pr = `${global.config.PREFIX}${this.config.name}`;
  try {
    const type = args[0]?.toLowerCase();
    if (!type || !['music', 'video'].includes(type)) {
      return api.sendMessage(`Invalid usage. Please use: ${pr} music or video <title>\n\nExample: ${pr} music metamorphosis`, event.threadID, event.messageID);
    }
    const title = args.slice(1).join(" ");
    if (!title) return api.sendMessage("Please add a title", event.threadID, event.messageID);
    
    api.sendMessage(`Searching for ${title} on YouTube...`, event.threadID, event.messageID);
    const { data } = await axios.get(`https://apiv3-2l3o.onrender.com/yts?title=${title}`);
    const videos = data.videos.slice(0, 6);
    const attachments = await Promise.all(videos.map(video => global.utils.getStreamFromURL(video.thumb)));
    
    const messageBody = videos.map((vid, i) => `${i + 1}. ${vid.title}\nDuration: ${vid.duration}\n`).join("\n") + "\nPlease choose a video by replying 1 to 6";
    const { messageID } = await api.sendMessage({
      body: messageBody,
      attachment: attachments
    }, event.threadID, event.messageID);
    
    const handleReply = async (replyEvent) => {
      if (replyEvent.senderID !== event.senderID || replyEvent.threadID !== event.threadID) return;
      const choice = parseInt(replyEvent.body, 10);
      if (isNaN(choice) || choice < 1 || choice > videos.length) {
        return api.sendMessage("Please reply with a number between 1 and 6 only.", event.threadID, replyEvent.messageID);
      }
      
      const selectedVideo = videos[choice - 1];
      const { url, title, duration } = selectedVideo;
      api.sendMessage(`Downloading ${title}...`, event.threadID, replyEvent.messageID);

      try {
        const { data: { url: downloadLink } } = await axios.get(`https://apiv3-2l3o.onrender.com/ytb?link=${encodeURIComponent(url)}&type=${type}`);
        const filePath = path.join(__dirname, 'cache', `${Date.now()}.mp4`);
        await downloadTrack(downloadLink, filePath);
        
        api.sendMessage({
          body: `${title} (${duration})`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath));
      } catch (error) {
        console.error(error);
        api.sendMessage(`An error occurred while processing your request: ${error.message}`, event.threadID, replyEvent.messageID);
      }
      api.unsendMessage(messageID);
      api.offEvent(handleReply);
    };
    
    api.onEvent(handleReply);
  } catch (error) {
    console.error(error);
    api.sendMessage(error.response?.data?.error || error.message, event.threadID, event.messageID);
  }
};

async function downloadTrack(url, filePath) {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });
  await fs.ensureDir(path.dirname(filePath));
  const writeStream = fs.createWriteStream(filePath);
  response.data.pipe(writeStream);

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => resolve(filePath));
    writeStream.on('error', reject);
  });
}
