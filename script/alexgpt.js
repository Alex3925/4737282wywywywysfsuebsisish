const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const ytdl = require("ytdl-core");
const yts = require("yt-search");

async function lado(api, event, args) {
  try {
    const songName = args.join(" ");
    const searchResults = await yts(songName);

    if (!searchResults.videos.length) {
      api.sendMessage("No song found for the given query.", event.threadID);
      return;
    }

    const video = searchResults.videos[0];
    const videoUrl = video.url;
    const stream = ytdl(videoUrl, { filter: "audioonly" });
    const fileName = `music.mp3`; 
    const filePath = path.join(__dirname, "tmp", fileName);

    stream.pipe(fs.createWriteStream(filePath));

    stream.on('response', () => {
      console.info('[DOWNLOADER]', 'Starting download now!');
    });

    stream.on('info', (info) => {
      console.info('[DOWNLOADER]', `Downloading ${info.videoDetails.title} by ${info.videoDetails.author.name}`);
    });

    stream.on('end', () => {
      const audioStream = fs.createReadStream(filePath);
      api.sendMessage({ attachment: audioStream }, event.threadID);
      api.setMessageReaction("✅", event.messageID, () => {}, true);
    });
  } catch (error) {
    console.error("Error:", error);
    api.sendMessage("Sorry, an error occurred while processing your request.", event.threadID);
  }
}

async function kshitiz(api, event, args) {
  try {
    const query = args.join(" ");
    const searchResults = await yts(query);

    if (!searchResults.videos.length) {
      api.sendMessage("No videos found for the given query.", event.threadID);
      return;
    }

    const video = searchResults.videos[0];
    const videoUrl = video.url;
    const stream = ytdl(videoUrl, { filter: "audioandvideo" }); 
    const fileName = `music.mp4`;
    const filePath = path.join(__dirname, "tmp", fileName);

    stream.pipe(fs.createWriteStream(filePath));

    stream.on('response', () => {
      console.info('[DOWNLOADER]', 'Starting download now!');
    });

    stream.on('info', (info) => {
      console.info('[DOWNLOADER]', `Downloading ${info.videoDetails.title} by ${info.videoDetails.author.name}`);
    });

    stream.on('end', () => {
      const videoStream = fs.createReadStream(filePath);
      api.sendMessage({ attachment: videoStream }, event.threadID);
      api.setMessageReaction("✅", event.messageID, () => {}, true);
    });
  } catch (error) {
    console.error(error);
    api.sendMessage("Sorry, an error occurred while processing your request.", event.threadID);
  }
}

async function b(prompt, uid) {
  try {
    const response = await axios.get(`https://gpt-four.vercel.app/gpt?prompt=${encodeURIComponent(prompt)}&uid=${uid}`);
    return response.data.answer;
  } catch (error) {
    throw error;
  }
}

async function i(prompt) {
  try {
    const response = await axios.get(`https://dall-e-tau-steel.vercel.app/kshitiz?prompt=${encodeURIComponent(prompt)}`);
    return response.data.response;
  } catch (error) {
    throw error;
  }
}

async function describeImage(prompt, photoUrl) {
  try {
    const url = `https://sandipbaruwal.onrender.com/gemini2?prompt=${encodeURIComponent(prompt)}&url=${encodeURIComponent(photoUrl)}`;
    const response = await axios.get(url);
    return response.data.answer;
  } catch (error) {
    throw error;
  }
}

async function l({ api, event, args }) {
  try {
    const senderID = event.senderID;
    let prompt = "";
    let draw = false;
    let sendTikTok = false;
    let sing = false;

    if (args[0].toLowerCase() === "draw") {
      draw = true;
      prompt = args.slice(1).join(" ").trim();
    } else if (args[0].toLowerCase() === "send") {
      sendTikTok = true;
      prompt = args.slice(1).join(" ").trim();
    } else if (args[0].toLowerCase() === "sing") {
      sing = true;
      prompt = args.slice(1).join(" ").trim();
    } else if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
      const photoUrl = event.messageReply.attachments[0].url;
      prompt = args.join(" ").trim();
      const description = await describeImage(prompt, photoUrl);
      api.sendMessage(`Description: ${description}`, event.threadID);
      return;
    } else {
      prompt = args.join(" ").trim();
    }

    if (!prompt) {
      return api.sendMessage("Please provide a prompt.", event.threadID);
    }

    if (draw) {
      await drawImage(api, event, prompt);
    } else if (sendTikTok) {
      await kshitiz(api, event, [prompt]);
    } else if (sing) {
      await lado(api, event, [prompt]);
    } else {
      const response = await b(prompt, senderID);
      api.sendMessage(response, event.threadID, (r, s) => {
        global.GoatBot.onReply.set(s.messageID, {
          commandName: "gpt",
          uid: senderID 
        });
      });
    }
  } catch (error) {
    console.error("Error:", error.message);
    api.sendMessage("An error occurred while processing the request.", event.threadID);
  }
}

async function drawImage(api, event, prompt) {
  try {
    const imageUrl = await i(prompt);

    const fileName = `image_${Date.now()}.png`;
    const filePath = path.join(__dirname, "cache", fileName);

    const writer = fs.createWriteStream(filePath);

    const response = await axios({
      url: imageUrl,
      method: 'GET',
      responseType: 'stream'
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    }).then(() => {
      api.sendMessage({
        body: "Generated image:",
        attachment: fs.createReadStream(filePath)
      }, event.threadID);
    });
  } catch (error) {
    console.error("Error:", error.message);
    api.sendMessage("An error occurred while processing the request.", event.threadID);
  }
}

const gpt = {
  name: "alexgpt",
  aliases: ["chatgpt"],
  version: "5.0",
  author: "vex_kshitiz",
  cooldowns: 5,
  role: 0,
  longDescription: "Chat with alexgpt",
  category: "ai",
  guide: {
    en: "{p}gemini {prompt}"
  }
};

module.exports = {
  info: gpt,
  execute: l
};
