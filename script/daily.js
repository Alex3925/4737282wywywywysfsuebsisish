module.exports.config = {
  name: 'daily',
  version: '1.2',
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: 'Receive daily gift',
  usage: 'daily [info]',
  credits: 'NTKhang' //convert by Alex
};

const moment = require("moment-timezone");

module.exports.run = async function({ api, event, args, usersData }) {
  const { senderID, threadID, messageID } = event;
  const getLang = (lang) => {
    return lang === 'vi' ? {
      monday: "Thứ 2",
      tuesday: "Thứ 3",
      wednesday: "Thứ 4",
      thursday: "Thứ 5",
      friday: "Thứ 6",
      saturday: "Thứ 7",
      sunday: "Chủ nhật",
      alreadyReceived: "Bạn đã nhận quà rồi",
      received: "Bạn đã nhận được %1 coin và %2 exp"
    } : {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
      alreadyReceived: "You have already received the gift",
      received: "You have received %1 coin and %2 exp"
    };
  };

  const reward = {
    coin: 100,
    exp: 10
  };

  if (args[0] === 'info') {
    let msg = '';
    for (let i = 1; i < 8; i++) {
      const getCoin = Math.floor(reward.coin * (1 + 20 / 100) ** ((i == 0 ? 7 : i) - 1));
      const getExp = Math.floor(reward.exp * (1 + 20 / 100) ** ((i == 0 ? 7 : i) - 1));
      const day = i == 7 ? getLang('vi')['sunday'] :
        i == 6 ? getLang('vi')['saturday'] :
          i == 5 ? getLang('vi')['friday'] :
            i == 4 ? getLang('vi')['thursday'] :
              i == 3 ? getLang('vi')['wednesday'] :
                i == 2 ? getLang('vi')['tuesday'] :
                  getLang('vi')['monday'];
      msg += `${day}: ${getCoin} coin, ${getExp} exp\n`;
    }
    return api.sendMessage(msg, threadID, messageID);
  }

  const dateTime = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY");
  const date = new Date();
  const currentDay = date.getDay(); // 0: sunday, 1: monday, 2: tuesday, 3: wednesday, 4: thursday, 5: friday, 6: saturday

  const userData = await usersData.get(senderID);
  if (userData.data.lastTimeGetReward === dateTime)
    return api.sendMessage(getLang('vi')['alreadyReceived'], threadID, messageID);

  const getCoin = Math.floor(reward.coin * (1 + 20 / 100) ** ((currentDay == 0 ? 7 : currentDay) - 1));
  const getExp = Math.floor(reward.exp * (1 + 20 / 100) ** ((currentDay == 0 ? 7 : currentDay) - 1));
  userData.data.lastTimeGetReward = dateTime;
  await usersData.set(senderID, {
    money: userData.money + getCoin,
    exp: userData.exp + getExp,
    data: userData.data
  });
  api.sendMessage(getLang('vi')['received'].replace('%1', getCoin).replace('%2', getExp), threadID, messageID);
};
