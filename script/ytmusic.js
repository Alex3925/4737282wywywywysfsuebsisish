const axios = require('axios');
const fs = require('fs-extra');

module.exports.config = {
    name: "sing",
    version: "4.6",
    author: "ArYAN", //convert by Alex
    shortDescription: { 
        en: 'Search and download mp3 songs' 
    },
    longDescription: { 
        en: "Search for video and download the first result or select a specific track." 
    },
    category: "music",
    guide: { 
        en: '{p}sing <song name> - Search for a song\n' +
            'Example:\n' +
            '  {p}sing Blinding Lights\n' +
            'After receiving the search results, reply with the song ID to download the track.\n' +
            'Reply with "1 to 9" to download the first track in the list.'
    }
};

module.exports.run = async function({ api, event, args }) {
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
            let messageBody = "🎶 𝗬𝗼𝘂𝗧𝘂𝗯𝗲\n\n━━━━━━━━━━━━━\n🎶 | Here are the top 9 tracks\n\n";
            const attachments = await Promise.all(topTracks.map(async (track) => {
                return await global.utils.getStreamFromURL(track.thumbnail);
            }));

            topTracks.forEach((track, index) => {
                messageBody += `🆔 𝗜𝗗: ${index + 1}\n`;
                messageBody += `📝 𝗧𝗶𝘁𝗹𝗲: ${track.title}\n`;
                messageBody += `📅 𝗥𝗲𝗹𝗲𝗮𝘀𝗲 𝗗𝗮𝘁𝗲: ${track.publishDate}\n`;
                messageBody += "━━━━━━━━━━━━━\n"; // Separator between tracks
            });

            messageBody += "\nReply with the number of the song ID you want to download.";
            const replyMessage = await api.sendMessage({
                body: messageBody,
                attachment: attachments
            }, event.threadID, event.messageID);

            // Set up a reply handler
            api.onReply(replyMessage.messageID, async (replyEvent) => {
                const reply = parseInt(replyEvent.body);
                if (replyEvent.senderID !== event.senderID) return;

                if (isNaN(reply) || reply < 1 || reply > tracks.length) {
                    return api.sendMessage("Invalid selection. Please reply with a number corresponding to the track.", event.threadID, replyEvent.messageID);
                }

                const selectedTrack = tracks[reply - 1];
                const videoUrl = selectedTrack.videoUrl;
                const downloadApiUrl = `https://c-v1.onrender.com/yt/mp3?url=${encodeURIComponent(videoUrl)}`;

                try {
                    const downloadMessage = await api.sendMessage("⏳ | Downloading your song, please wait...", event.threadID, replyEvent.messageID);
                    
                    const response = await axios({
                        url: downloadApiUrl,
                        method: 'GET',
                        responseType: 'stream'
                    });

                    const filePath = `${__dirname}/tmp/${Date.now()}.mp3`;
                    const writer = fs.createWriteStream(filePath);

                    response.data.pipe(writer);

                    writer.on('finish', () => {
                        api.sendMessage({
                            body: `🎧| 𝗬𝗼𝘂𝗧𝘂𝗯𝗲\n\n━━━━━━━━━━━━━\nHere's your song ${selectedTrack.title}.\n\n📒 𝗧𝗶𝘁𝗹𝗲: ${selectedTrack.title}\n📅 𝗣𝘂𝗯𝗹𝗶𝘀𝗵 𝗗𝗮𝘁𝗲: ${selectedTrack.publishDate}\n👀 𝗩𝗶𝗲𝘄𝘀: ${selectedTrack.viewCount}\n👍 𝗟𝗶𝗸𝗲𝘀: ${selectedTrack.likeCount}\n\nEnjoy listening!...🥰`,
                            attachment: fs.createReadStream(filePath),
                        }, event.threadID, () => {
                            fs.unlinkSync(filePath);
                        });
                    });

                    writer.on('error', (err) => {
                        console.error(err);
                        api.sendMessage("🚧 | An error occurred while processing your request.", event.threadID, downloadMessage.messageID);
                    });

                } catch (error) {
                    console.error(error);
                    api.sendMessage(`🚧 | An error occurred while processing your request: ${error.message}`, event.threadID, replyEvent.messageID);
                }
            });
        } else {
            api.sendMessage("❓ | Sorry, couldn't find the requested song.", event.threadID);
        }
    } catch (error) {
        console.error(error);
        api.sendMessage("🚧 | An error occurred while processing your request.", event.threadID, event.messageID);
    }
};
