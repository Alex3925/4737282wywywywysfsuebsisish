const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const util = require('util');

const cacheDir = path.join(__dirname, 'cache');
const animeJsonFile = path.join(__dirname, 'anime.json');

module.exports = {
  info: {
    name: "aniquiz",
    aliases: ["animequiz"],
    version: "1.0",
    author: "Kshitiz",
    role: 0,
    shortDescription: "Guess the anime character",
    longDescription: "Guess the name of the anime character based on provided traits and tags.",
    category: "game",
    guide: {
      en: "{p}aniquiz"
    }
  },

  async execute({ api, event, args }) {
    try {
      if (args.length === 1 && args[0] === "top") {
        return await this.showTopPlayers({ api, event });
      }

      const characterData = await this.fetchCharacterData();
      if (!characterData || !characterData.data) {
        console.error("error");
        api.sendMessage("error", event.threadID);
        return;
      }

      const { image, traits, tags, fullName, firstName } = characterData.data;

      const imageStream = await this.downloadImage(image);

      if (!imageStream) {
        console.error("Error");
        api.sendMessage("An error occurred.", event.threadID);
        return;
      }

      const body = `
𝐆𝐮𝐞𝐬𝐬 𝐭𝐡𝐞 𝐚𝐧𝐢𝐦𝐞 𝐜𝐡𝐚𝐫𝐚𝐜𝐭𝐞𝐫!!
𝐓𝐫𝐚𝐢𝐭𝐬: ${traits}
𝐓𝐚𝐠𝐬: ${tags}
`;

      const replyMessage = { body, attachment: imageStream };
      const sentMessage = await api.sendMessage(replyMessage, event.threadID);

      global.AutoBot.onReply.set(sentMessage.messageID, {
        commandName: this.info.name,
        messageID: sentMessage.messageID,
        correctAnswer: [fullName, firstName],
        senderID: event.senderID
      });

      setTimeout(async () => {
        await api.unsendMessage(sentMessage.messageID);
      }, 15000);
    } catch (error) {
      console.error("Error:", error);
      api.sendMessage("An error occurred.", event.threadID);
    }
  },

  async onReply({ api, event, reply }) {
    try {
      const userAnswer = event.body.trim().toLowerCase();
      const correctAnswers = reply.correctAnswer.map(name => name.toLowerCase());

      if (event.senderID !== reply.senderID) return;

      if (correctAnswers.includes(userAnswer)) {
        await this.addCoins(event.senderID, 1000);
        await api.sendMessage("🎉🎊 Congratulations! Your answer is correct.\nYou have received 1000 coins.", event.threadID);
      } else {
        await api.sendMessage(`🥺 Oops! Wrong answer.\nThe correct answer was:\n${reply.correctAnswer.join(" or ")}`, event.threadID);
      }

      const animeMessageID = reply.messageID;
      await api.unsendMessage(animeMessageID);

      await api.unsendMessage(event.messageID);
    } catch (error) {
      console.error("Error while handling user reply:", error);
    }
  },

  async showTopPlayers({ api, event }) {
    try {
      const topUsers = await this.getTopUsers(api);
      if (topUsers.length === 0) {
        return api.sendMessage("No users found.", event.threadID);
      } else {
        const topUsersString = topUsers.map((user, index) => `${index + 1}. ${user.username}: ${user.money} coins`).join("\n");
        return api.sendMessage(`Top 5 pro players:\n${topUsersString}`, event.threadID);
      }
    } catch (error) {
      console.error("Error while showing top players:", error);
      api.sendMessage("An error occurred.", event.threadID);
    }
  },

  async fetchCharacterData() {
    try {
      const response = await axios.get('https://animequiz-mu.vercel.app/kshitiz');
      return response;
    } catch (error) {
      console.error("Error fetching anime character data:", error);
      return null;
    }
  },

  async downloadImage(imageUrl) {
    try {
      const imageName = `anime_character.jpg`;
      const imagePath = path.join(cacheDir, imageName);

      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      if (!response.data || response.data.length === 0) {
console.error("Empty image data received from the API.");
        return null;
      }

      await fs.ensureDir(cacheDir);
      await fs.writeFile(imagePath, response.data, 'binary');

      return fs.createReadStream(imagePath);
    } catch (error) {
      console.error("Error downloading image:", error);
      return null;
    }
  },

  async addCoins(userID, amount) {
    let userData = await this.getUserData(userID);
    if (!userData) {
      userData = { money: 0 };
    }
    userData.money += amount;
    await this.saveUserData(userID, userData);
  },

  async getUserData(userID) {
    try {
      const data = await fs.readFile(animeJsonFile, 'utf8');
      const userData = JSON.parse(data);
      return userData[userID];
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.writeFile(animeJsonFile, '{}');
        return null;
      } else {
        console.error("Error reading user data:", error);
        return null;
      }
    }
  },

  async saveUserData(userID, data) {
    try {
      const userData = await this.getUserData(userID) || {};
      const updatedData = {...userData,...data };
      const allUserData = await this.getAllUserData();
      allUserData[userID] = updatedData;
      await fs.writeFile(animeJsonFile, JSON.stringify(allUserData, null, 2), 'utf8');
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  },

  async getAllUserData() {
    try {
      const data = await fs.readFile(animeJsonFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading user data:", error);
      return {};
    }
  },

  async getTopUsers(api) {
    try {
      const allUserData = await this.getAllUserData();
      const userIDs = Object.keys(allUserData);
      const topUsers = [];

      const getUserInfo = util.promisify(api.getUserInfo);

      await Promise.all(userIDs.map(async (userID) => {
        try {
          const userInfo = await getUserInfo(userID);
          const username = userInfo[userID].name;
          if (username) {
            const userData = allUserData[userID];
            topUsers.push({ username, money: userData.money });
          }
        } catch (error) {
          console.error("Failed to retrieve user information:", error);
        }
      }));

      topUsers.sort((a, b) => b.money - a.money);
      return topUsers.slice(0, 5);
    } catch (error) {
      console.error("Error getting top users:", error);
      return [];
    }
  }
};
