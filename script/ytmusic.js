const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "sing",
  version: "4.6",
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: "Search and download mp3 songs",
  usage: "{p}s <song name> - Search for a song\nExample:\n  {p}s Blinding Lights\nAfter receiving the search results, reply with the song ID to download the track.\nReply with '1 to 9' to download the first track in the list.",
  credits: "Developer", // Converted by Alex Gwapo
  cooldown: 0,
};

module.exports.run = async function({ api, event, args }) {
  const searchQuery = encodeURIComponent(args.join(" "));
  const apiUrl = `https://c-v1.onrender.com/yt/s?query=${searchQuery}`;

  if (!searchQuery) {
    return api.sendMessage("Please provide the song title.", event.threadID, event.messageID);
  }

  try {
    api.sendMessage(`Searching for your song request "${searchQuery}", please wait...`, event.threadID, event.messageID);
    const response = await axios.get(apiUrl);
    const tracks = response.data;

    if (tracks.length > 0) {
      const topTracks = tracks.slice(0, 9);
      let message = "🎶 𝗬𝗼𝘂𝗧𝘂𝗯𝗲\n\n━━━━━━━━━━━━━\n🎶 | Here are the top 9 tracks\n\n";

      topTracks.forEach((track, index) => {
        message += `🆔 𝗜𝗗: ${index + 1}\n`;
        message += `📝 𝗧𝗶𝘁𝗹𝗲: ${track.title}\n`;
        message += `📅 𝗥𝗲𝗹𝗲𝗮𝘀𝗲 𝗗𝗮𝘁𝗲: ${track.publishDate}\n`;
        message += "━━━━━━━━━━━━━\n"; // Separator between tracks
      });

      message += "\nReply with the number of the song ID you want to download.";
      api.sendMessage({ body: message }, event.threadID, (err, info) => {
        if (err) {
          console.error(err);
          api.sendMessage("🚧 | An error occurred while sending the message.", event.threadID);
          return;
        }
        global.GoatBot.onReply.set(info.messageID, { commandName: this.config.name, messageID: info.messageID, author: event.senderID, tracks: topTracks });
      });
    } else {
      api.sendMessage("❓ | Sorry, couldn't find the requested song.", event.threadID);
    }
  } catch (error) {
    console.error(error);
    api.sendMessage("🚧 | An error occurred while processing your request.", event.threadID, event.messageID);
  }
};

module.exports.onReply = async function({ api, event, Reply, args }) {
  const reply = parseInt(args[0]);
  const { author, tracks } = Reply;

  if (event.senderID !== author) return;

  try {
    if (isNaN(reply) || reply < 1 || reply > tracks.length) {
      throw new Error("Invalid selection. Please reply with a number corresponding to the track.");
    }

    const selectedTrack = tracks[reply - 1];
    const videoUrl = selectedTrack.videoUrl;
    const downloadApiUrl = `https://c-v1.onrender.com/yt/mp3?url=${encodeURIComponent(videoUrl)}`;

    api.sendMessage("⏳ | Downloading your song, please wait...", event.threadID, async (err, info) => {
      if (err) {
        console.error(err);
        api.sendMessage("🚧 | An error occurred while sending the message.", event.threadID);
        return;
      }

      try {
        const response = await axios({
          url: downloadApiUrl,
          method: 'GET',
          responseType: 'stream'
        });

        const filePath = path.join(__dirname, 'cache', `${Date.now()}.mp3`);
        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);

        writer.on('finish', () => {
          api.setMessageReaction("✅", info.messageID);

          api.sendMessage({
            body: `🎧| 𝗬𝗼𝘂𝗧𝘂𝗯𝗲\n\n━━━━━━━━━━━━━\nHere's your song ${selectedTrack.title}.\n\n📒 𝗧𝗶𝘁𝗹𝗲: ${selectedTrack.title}\n📅 𝗣𝘂𝗯𝗹𝗶𝘀𝗵 𝗗𝗮𝘁𝗲: ${selectedTrack.publishDate}\n👀 𝗩𝗶𝗲𝘄𝘀: ${selectedTrack.viewCount}\n👍 𝗟𝗶𝗸𝗲𝘀: ${selectedTrack.likeCount}\n\nEnjoy listening!...🥰`,
            attachment: fs.createReadStream(filePath),
          }, event.threadID, () => fs.unlinkSync(filePath));
        });

        writer.on('error', (err) => {
          console.error(err);
          api.sendMessage("🚧 | An error occurred while processing your request.", event.threadID);
        });
      } catch (error) {
        console.error(error);
        api.sendMessage(`🚧 | An error occurred while processing your request: ${error.message}`, event.threadID);
      }
    });

  } catch (error) {
    console.error(error);
    api.sendMessage(`🚧 | An error occurred while processing your request: ${error.message}`, event.threadID);
  }

  api.unsendMessage(Reply.messageID);
  global.GoatBot.onReply.delete(Reply.messageID);
};
