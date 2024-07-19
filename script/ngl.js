module.exports = {
  config: {
    name: "ngl",
    description: "Spam NGL",
    prefix: false,
    accessableby: 0,
    usage: "[username => amount => message]",
    category: "Utilities",
    author: "Deku",
  },
  start: async function({ api, event, text, react, reply }) {
    const axios = require("axios");
    try {
      const content = text
       .join(" ")
       .split("=>")
       .map((item) => (item = item.trim()));
      let username = content[0];
      let amount = parseInt(content[1]);
      let message = content[2];
      let msg =
        "Wrong format or something is missing." +
        "\nHow to use: " +
        this.config.usage;
      if (!username ||!amount ||!message) return reply(msg);
      // if isNaN
      if (isNaN(amount)) return reply("Please enter a valid number.");
      if (amount > 40) return reply("The maximum number of request is 40.");
      if (amount < 1) return reply("Please enter a number greater than 0.");
      react("⏳");
      reply(
        "You have successfully sent " +
          amount +
          " messages to " +
          username +
          "\nThe request is now processing...",
      );
      const headers = {
        referer: `https://ngl.link/${username}`,
        "accept-language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
      };

      const data = {
        username: username,
        question: message,
        deviceId: "ea356443-ab18-4a49-b590-bd8f96b994ee",
        gameSlug: "",
        referrer: "",
      };

      for (let i = 0; i < amount; i++) {
        try {
          await axios.post("https://ngl.link/api/submit", data, {
            headers,
          });
          console.log(`Sent`);
        } catch (e) {
          console.log("Not sent");
        }
      }
    } catch (w) {
      return reply(w["message"]);
    }
  },
};
