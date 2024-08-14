module.exports.config = {
    name: "music",
    version: "2.0.4",
    role: 0,
    credits: "zach", // fixed by Alex
    description: "Play a song",
    aliases: ["sing"],
    cooldown: 0,
    hasPrefix: true,
    usage: "",
};

module.exports.run = async ({ api, event }) => {
    const axios = require("axios");
    const fs = require("fs-extra");
    const ytdl = require("ytdl-core");

    const input = event.body;
    const text = input.substring(12);
    const data = input.split(" ");

    if (data.length < 2) {
        return api.sendMessage("Please provide a song name.", event.threadID);
    }

    data.shift();
    const song = data.join(" ");

    try {
        api.sendMessage(`Finding "${song}". Please wait...`, event.threadID);

        // Use the new API to search for the song
        const searchResponse = await axios.get(`https://hiroshi-rest-api.replit.app/search/youtube?q=${encodeURIComponent(song)}`);
        const searchResults = searchResponse.data;

        if (!searchResults || searchResults.length === 0) {
            return api.sendMessage("Error: No results found.", event.threadID, event.messageID);
        }

        const video = searchResults[0]; // Take the first result
        const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;

        const stream = ytdl(videoUrl, { filter: "audioonly" });

        const fileName = `${event.senderID}.mp3`;
        const filePath = __dirname + `/cache/${fileName}`;

        stream.pipe(fs.createWriteStream(filePath));

        stream.on('response', () => {
            console.info('[DOWNLOADER]', 'Starting download now!');
        });

        stream.on('info', (info) => {
            console.info('[DOWNLOADER]', `Downloading ${info.videoDetails.title} by ${info.videoDetails.author.name}`);
        });

        stream.on('end', () => {
            console.info('[DOWNLOADER] Downloaded');

            if (fs.statSync(filePath).size > 26214400) {
                fs.unlinkSync(filePath);
                return api.sendMessage('[ERR] The file could not be sent because it is larger than 25MB.', event.threadID);
            }

            const message = {
                body: `Here's your music, enjoy!🥰\n\nTitle: ${video.title}\nArtist: ${video.author}`,
                attachment: fs.createReadStream(filePath)
            };

            api.sendMessage(message, event.threadID, () => {
                fs.unlinkSync(filePath);
            });
        });
    } catch (error) {
        console.error('[ERROR]', error);
        api.sendMessage('An error occurred while processing the command.', event.threadID);
    }
};
