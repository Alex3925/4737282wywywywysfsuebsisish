module.exports = {
  config: {
    name: "manga",
    version: "1.0",
    author: "Kim Saludes", //convert by Alex
    countDown: 5,
    role: 0,
    longDescription: {
      en: "Read Manga",
    },
    category: "box chat",
    guide: {
      en: "{pn}",
    },
  },

  onStart: async function ({ api, event }) {
    return api.sendMessage('Search Manga\n--------------------------\n(Reply to this message)', event.threadID, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: "manga",
        author: event.senderID,
        messageID: info.messageID,
        type: 'search',
        pagetype: false,
        page: 1,
        searchStatus: true
      });
    }, event.messageID);
  },

  onReply: async function ({ api, event, args, Reply }) {
    try {
      const { commandName, author, messageID, type } = Reply;
      if (event.senderID != author) return;
      if (type == 'search') {
        let _page = Reply.page;
        if (Reply.pagetype == true) {
          if (args[0].toLowerCase() === 'page' && args[1] > 0) {
            _page = args[1];
          } else if (args[0].toLowerCase() === 'select' && args[1] > 0) {
            const itemIndex = args[1] - 1;
            const selectedItem = Reply.currentPageData[itemIndex];
            if (selectedItem) {
              api.setMessageReaction("⏳", event.messageID, () => {}, true);
              const getInfo = await axios.get(`https://api.consumet.org/manga/mangadex/info/${selectedItem.ID}`);
              const mangaInfo = getInfo.data;
              const _info = `Title: ${mangaInfo.title}\n\nDescription: ${mangaInfo.description.en}\n\nGenres: ${mangaInfo.genres.join(', ')}\nThemes: ${mangaInfo.themes.join(', ')}\nStatus: ${mangaInfo.status}\nRelease Date: ${mangaInfo.releaseDate}\nChapters: ${mangaInfo.chapters.length}\n\n(Reply to this message the chapter you want to read. Ex: Read/Chapter 2/Done)`;
              const stream = await global.utils.getStreamFromURL(mangaInfo.image);
              return api.sendMessage({ body: _info, attachment: stream }, event.threadID, (err, info) => {
                api.setMessageReaction("", event.messageID, () => {}, true);
                global.GoatBot.onReply.set(info.messageID, {
                  commandName,
                  author: author,
                  messageID: info.messageID,
                  type: 'read',
                  mangaInfo,
                  option: false
                });
              }, event.messageID);
            } else {
              return api.sendMessage('Invalid item number⚠️', event.threadID, event.messageID);
            }
          } else if (args[0].toLowerCase() == 'done') {
            return api.unsendMessage(messageID) && api.setMessageReaction("✅", event.messageID, () => {}, true);
          } else {
            return api.sendMessage('Invalid input!⚠️\nEx: Page 2/Select 2/Done', event.threadID, event.messageID);
          }
        }
        let resultString = [];
        let data = resultString;
        if (Reply.searchStatus == true) {
          search = event.body;
          const stringWithoutSymbols = search.replace(/[\/\\:]/g, '');
          api.setMessageReaction("⏳", event.messageID, () => {}, true);
          const result = await axios.get(`https://api.consumet.org/manga/mangadex/${stringWithoutSymbols}`);
          const mangaSearch = result.data.results;
          if (!mangaSearch.length) return api.sendMessage('No results found!', event.threadID, () => { api.setMessageReaction("⚠️", event.messageID, () => {}, true); }, event.messageID);
          mangaSearch.forEach(item => {
            resultString.push({ ID: item.id, description: `Title: ${item.title}\nDescription: ${item.description}\nStatus: ${item.status}\nRelease Date: ${item.releaseDate}\nContent Rating: ${item.contentRating}\nLast Volume: ${item.lastVolume}\nLast Chapter: ${item.lastChapter}\n\n` });
          });
        } else {
          resultString = Reply.resultString;
          data = Reply.resultString;
        }

        const pageSize = 5;
        const totalPages = Math.ceil(data.length / pageSize);
        let _data = '';
        let currentPageData;

                if (_page < 1 || _page > totalPages) {
          return api.sendMessage(`Page ${_page} does not exist.\nTotal pages: ${totalPages}`, event.threadID, event.messageID);
        } else {
          currentPageData = await paginate(data, _page, pageSize);
          currentPageData.forEach((item, index) => {
            _data += `${index + 1}. ${item.description}\n`;
          });
        }
        await api.unsendMessage(messageID);
        return api.sendMessage(`Results:\n--------------------------\n${_data}Current page ${_page} of ${totalPages} page/s.\n(Reply to this message. Ex: Page 2/Select 2/Done)`, event.threadID, (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            author: author,
            messageID: info.messageID,
            resultString,
            type: 'earch',
            pagetype: true,
            page: _page,
            searchStatus: false,
            currentPageData
          });
          api.setMessageReaction("", event.messageID, () => {}, true);
        }, event.messageID);
      } else if (type == 'ead') {
        let position;
        if (Reply.option == false) {
          if (args[0].toLowerCase() == 'chapter' && args[1] > 0 && Reply.mangaInfo.chapters.length > args[1]-1) {
            position = args[1] - 1;
          } else if (args[0].toLowerCase() == 'done') {
            return api.unsendMessage(messageID) && api.setMessageReaction("✅", event.messageID, () => {}, true);
          } else if (args[0].toLowerCase() == 'ead' && Reply.mangaInfo.chapters.length > 0) {
            position = 0;
          } else {
            return api.sendMessage("Invalid chapter!⚠️\nEx: Chapter 2/Read/Done", event.threadID, event.messageID);
          }
        } else {
          if (args[0].toLowerCase() == 'next' && Reply.mangaInfo.chapters.length > Reply.position + 1) {
            position = Reply.position + 1;
          } else if (args[0].toLowerCase() == 'prev' && Reply.position > 0) {
            position = Reply.position - 1;
          } else if (args[0].toLowerCase() === 'chapter' && args[1] > 0 && Reply.mangaInfo.chapters.length > args[1]-1) {
            position = args[1] - 1;
          } else if (args[0].toLowerCase() == 'done') {
            return api.unsendMessage(messageID) && api.setMessageReaction("✅", event.messageID, () => {}, true);
          } else {
            return api.sendMessage('No chapter available. Ex: Chapter 2/Next/Prev/Done', event.threadID, event.messageID);
          }
        }
        const _chapterID = Reply.mangaInfo.chapters;
        const chapter = [..._chapterID].reverse();
        const chapterID = chapter[position];

        api.setMessageReaction("⏳", event.messageID, async () => {
          try {
            const res = await axios.get(`https://api.consumet.org/manga/mangadex/read/${chapterID.id}`);
            const imageURLs = res.data.map(item => item.img);
            const streams = await Promise.all(imageURLs.map(url => global.utils.getStreamFromURL(url)));
            let _mangaInfo = `Title: ${chapterID.title}\nChapter: ${chapterID.chapterNumber}`;
            const batchSize = 30;
            for (let i = 0; i < streams.length; i += batchSize) {
              const batch = streams.slice(i, i + batchSize);
              const message = {
                body: _mangaInfo,
                attachment: batch,
              };
              const info = await api.sendMessage(message, event.threadID);
              global.GoatBot.onReply.set(info.messageID, {
                commandName,
                author: author,
                messageID: info.messageID,
                type: 'ead',
                position,
                mangaInfo: Reply.mangaInfo,
                option: true
              });
              _mangaInfo = '';
            }

            await api.setMessageReaction("", event.messageID, () => {}, true);
          } catch (error) {
            return api.sendMessage("Something went wrong", event.threadID, event.messageID) && api.setMessageReaction("⚠️", event.messageID, () => {}, true);
          }
        }, true);
      }
    } catch (error) {
      return api.sendMessage(`Error: ${error}`, event.threadID, event.messageID) && api.setMessageReaction("⚠️", event.messageID, () => {}, true 
