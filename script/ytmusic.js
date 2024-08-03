const axios = require('axios');

module.exports = {
  name: "sing",
  version: "4.6",
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: "Search and download mp3 songs",
  usage: "{p}s <song name> - Search for a video\nExample:\n  {p}s Blinding Lights\nAfter receiving the search results, reply with the song ID to download the track.\nReply with '1 to 9' to download the first track in the list.",
  credits: "ArYAN",
  cooldown: 0,

  async run({ api, event, args }) {
    const searchQuery = encodeURIComponent(args.join(" "));
    const apiUrl = `https://c-v1.onrender.com/yt/s?query=${searchQuery}`;

    if (!searchQuery) {
      return api.sendMessage("Please provide the song title.", event.threadID, event.messageID);
    }

    try {
      api.sendMessage(`Searching for your song request "${searchQuery}", Please wait...`, event.threadID, event.messageID);
      const response = await axios.get(apiUrl);
      const tracks = response.data;

      if (tracks.length > 0) {
        const topTracks = tracks.slice(0, 9);
        let message = "🎶 𝗬𝗼𝘂𝗧𝘂𝗯𝗲\n\n━━━━━━━━━━━━━\n🎶 | Here are the top 9 tracks\n\n";
        const attachments = await Promise.all(topTracks.map(async (track) => {
          return await global.utils.getStreamFromURL(track.thumbnail);
        }));

        topTracks.forEach((track, index) => {
          message += `🆔 𝗜𝗗: ${index + 1}\n`;
          message += `📝 𝗧𝗶𝘁𝗹𝗲: ${track.title}\n`;
          message += `📅 𝗥𝗲𝗹𝗲𝗮𝘀𝗲 𝗗𝗮𝘁𝗲: ${track.publishDate}\n`;
          message += "━━━━━━━━━━━━━\n"; // Separator between tracks
        });

        message += "\nReply with the number of the song ID you want to download.";
        api.sendMessage({
          body: message,
          attachment: attachments
        }, event.threadID, (err, info) => {
          if (err) {
            console.error(err);
            api.sendMessage("🚧 | An error occurred while sending message.", event.threadID);
            return;
          }
          global.GoatBot.onReply.set(info.messageID, { commandName: this.name, messageID: info.messageID, author: event.senderID, tracks: topTracks });
        });
      } else {
        api.sendMessage("❓ | Sorry, couldn't find the requested video.", event.threadID);
      }
    } catch (error) {
      console.error(error);
      api.sendMessage("🚧 | An error occurred while processing your request.", event.threadID, event.messageID);
    }
  },

  async onReply({ api, event, Reply, args }) {
    const reply = parseInt(args[0]);
    const { author, tracks } = Reply;

    if (event.senderID!== author) return;

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
          api.sendMessage("🚧 | An error occurred while sending message.", event.threadID);
          return;
        }

        try {
          const response = await axios({
            url: downloadApiUrl,
            method: 'GET',
            responseType: 'tream'
          });

                                 api.sendMessage({
            body: `🎧| 𝗬𝗼𝘂𝗧𝘂𝗯𝗲\n\n━━━━━━━━━━━━━\nHere's your song ${selectedTrack.title}.\n\n📒 𝗧𝗶𝘁𝗹𝗲: ${selectedTrack.title}\n📅 𝗣𝘂𝗯𝗹𝗶𝘀𝗵 𝗗𝗮𝘁𝗲: ${selectedTrack.publishDate}\n👀 𝗩𝗶𝗲𝘄𝘀: ${selectedTrack.viewCount}\n👍 𝗟𝗶𝗸𝗲𝘀: ${selectedTrack.likeCount}\n\nEnjoy listening!...🥰`,
            attachment: response.data
          }, event.threadID);
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
  }
};
