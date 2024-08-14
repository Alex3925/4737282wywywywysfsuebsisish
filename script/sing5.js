const fs = require('fs-extra');
const axios = require('axios');

module.exports.config = {
    name: "sing",
    version: "1.0.0",
    hasPermission: 0,
    credits: "Mirai Team & Yan Maglinte, Modified by [Alex]",
    description: "Play music via YouTube link or search keyword",
    usePrefix: true,
    commandCategory: "media",
    usages: "[searchMusic]",
    cooldowns: 0
};

async function downloadMusicFromYoutube(videoUrl, path) {
    try {
        const timestart = Date.now();
        const response = await axios.get(`https://hiroshi-rest-api.replit.app/search/youtube?q=${encodeURIComponent(videoUrl)}`);
        
        if (!Array.isArray(response.data) || response.data.length === 0) {
            throw new Error("No results found or API returned unexpected data.");
        }

        const data = response.data[0];  // Assuming the first result is the best match

        const result = {
            title: data.title,
            dur: data.lengthSeconds,
            viewCount: data.viewCount,
            likes: data.likes,
            author: data.channel.name,
            timestart: timestart,
            downloadUrl: data.downloadUrl
        };

        const writer = fs.createWriteStream(path);
        const downloadResponse = await axios({
            url: result.downloadUrl,
            method: 'GET',
            responseType: 'stream'
        });
        downloadResponse.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                resolve({ data: path, info: result });
            });
            writer.on('error', reject);
        });

    } catch (e) {
        console.log(e);
        throw e;
    }
}

async function handleReply({ api, event, handleReply }) {
    try {
        const path = `${__dirname}/cache/audio-${event.senderID}.mp3`;
        const videoUrl = `https://www.youtube.com/watch?v=${handleReply.link[event.body - 1]}`;
        const { data, info } = await downloadMusicFromYoutube(videoUrl, path);

        if (fs.statSync(data).size > 26214400) {
            return api.sendMessage('⚠️The file could not be sent because it is larger than 25MB.', event.threadID, () => fs.unlinkSync(path), event.messageID);
        }

        api.unsendMessage(handleReply.messageID);

        const message = {
            body: `❍━━━━━━━━━━━━❍\n🎵 Title: ${info.title}\n⏱️ Time: ${convertHMS(info.dur)}\n⏱️ Processing time: ${Math.floor((Date.now() - info.timestart) / 1000)} seconds\n❍━━━━━━━━━━━━❍`,
            attachment: fs.createReadStream(data),
        };

        return api.sendMessage(message, event.threadID, () => {
            fs.unlinkSync(path);
        }, event.messageID);
    } catch (error) {
        console.log(error);
        api.sendMessage('An error occurred while processing your request.', event.threadID, event.messageID);
    }
}

async function run({ api, event, args }) {
    if (!args?.length) {
        return api.sendMessage('❯ Search cannot be empty!', event.threadID, event.messageID);
    }

    const keywordSearch = args.join(" ");
    const path = `${__dirname}/cache/sing-${event.senderID}.mp3`;

    try {
        const response = await axios.get(`https://hiroshi-rest-api.replit.app/search/youtube?q=${encodeURIComponent(keywordSearch)}`);
        
        if (!Array.isArray(response.data) || response.data.length === 0) {
            throw new Error("No results found or API returned unexpected data.");
        }

        const data = response.data;
        const link = data.map(value => value.id);
        const thumbnails = [];

        for (let i = 0; i < data.length; i++) {
            const thumbnailUrl = data[i].thumbnailUrl;
            const thumbnailPath = `${__dirname}/cache/thumbnail-${event.senderID}-${i + 1}.jpg`;
            const response = await axios.get(thumbnailUrl, { responseType: 'arraybuffer' });
            fs.writeFileSync(thumbnailPath, Buffer.from(response.data, 'binary'));
            thumbnails.push(fs.createReadStream(thumbnailPath));
        }

        const body = `There are ${link.length} results matching your search keyword:\n\n${data.map((value, index) => `❍━━━━━━━━━━━━❍\n${index + 1} - ${value.title} (${convertHMS(value.lengthSeconds)})\n\n`).join('')}❯ Please reply and select one of the above searches`;

        return api.sendMessage({ attachment: thumbnails, body }, event.threadID, (error, info) => {
            // Clean up thumbnails after sending
            for (let i = 0; i < thumbnails.length; i++) {
                fs.unlinkSync(`${__dirname}/cache/thumbnail-${event.senderID}-${i + 1}.jpg`);
            }

            // Set up reply handler
            api.onReply(info.messageID, (replyEvent) => {
                handleReply({
                    api,
                    event: replyEvent,
                    handleReply: {
                        link,
                        messageID: info.messageID
                    }
                });
            });
        }, event.messageID);
    } catch (e) {
        console.log(e);
        return api.sendMessage(`⚠️An error occurred, please try again in a moment!!\n${e.message || e}`, event.threadID, event.messageID);
    }
}

module.exports = { config: module.exports.config, run };
